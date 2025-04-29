const request = require('supertest');
const app = require('../../index');
const { connect, disconnect, clearDatabase } = require('./setup/testDb');
const User = require('../../models/User');
const AdminUser = require('../../models/AdminUser');
const Company = require('../../models/Company');
const jwt = require('jsonwebtoken');

describe('Users Integration Tests', () => {
  let company;
  let adminUser;
  let authToken;

  beforeAll(async () => {
    await connect();
  });

  beforeEach(async () => {
    await clearDatabase();
    
    company = await Company.create({
      name: 'Test Company',
      address: 'Test Address',
      status: 'active'
    });

    adminUser = await AdminUser.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@test.com',
      password: 'hashedPassword',
      role: 'Admin',
      company: company._id
    });

    authToken = jwt.sign(
      { userId: adminUser._id, role: 'Admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    await disconnect();
  });

  describe('POST /api/users/register', () => {
    it('should create a new user', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        userId: 'JOHN001'
      };

      const response = await request(app)
        .post('/api/users/register')
        .set('Authorization', `Bearer ${authToken}`)
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('email', 'john@example.com');
      expect(response.body).toHaveProperty('userId', 'JOHN001');
    });
  });

  describe('GET /api/users', () => {
    it('should get all users for company', async () => {
      await User.create({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'hashedPassword',
        userId: 'TEST001',
        company: company._id,
        admin: adminUser._id
      });

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].userId).toBe('TEST001');
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update user details', async () => {
      const user = await User.create({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'hashedPassword',
        userId: 'TEST001',
        company: company._id,
        admin: adminUser._id
      });

      const response = await request(app)
        .put(`/api/users/${user._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Updated',
          lastName: 'Name'
        });

      expect(response.status).toBe(200);
      expect(response.body.firstName).toBe('Updated');
      expect(response.body.lastName).toBe('Name');
    });
  });
});
