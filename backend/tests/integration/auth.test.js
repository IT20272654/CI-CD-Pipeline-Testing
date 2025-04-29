const request = require('supertest');
const app = require('../../index');
const { connect, disconnect, clearDatabase } = require('./setup/testDb');
const AdminUser = require('../../models/AdminUser');
const Company = require('../../models/Company');
const bcrypt = require('bcrypt');

describe('Auth Integration Tests', () => {
  let company;
  let adminUser;
  let authToken;
  
  beforeAll(async () => {
    await connect();
  });

  beforeEach(async () => {
    await clearDatabase();
    
    // Create test company
    company = await Company.create({
      name: 'Test Company',
      address: 'Test Address',
      status: 'active'
    });

    // Create test admin user
    const hashedPassword = await bcrypt.hash('password123', 10);
    adminUser = await AdminUser.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@test.com',
      password: hashedPassword,
      role: 'Admin',
      company: company._id
    });

    // Login to get auth token
    const response = await request(app)
      .post('/api/admin/login')
      .send({
        email: 'admin@test.com',
        password: 'password123'
      });

    authToken = response.body.token;
  });

  afterAll(async () => {
    await disconnect();
  });

  describe('POST /api/admin/login', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/admin/login')
        .send({
          email: 'admin@test.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.role).toBe('Admin');
      expect(response.body.company).toBe('Test Company');
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/admin/login')
        .send({
          email: 'admin@test.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });
  });

  describe('GET /api/admin/me', () => {
    it('should get current admin user profile', async () => {
      const response = await request(app)
        .get('/api/admin/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('email', 'admin@test.com');
      expect(response.body).toHaveProperty('role', 'Admin');
    });
  });

  describe('PUT /api/admin/change-password', () => {
    it('should change password successfully', async () => {
      const response = await request(app)
        .put('/api/admin/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'password123',
          newPassword: 'newpassword123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Password changed successfully');
    });
  });
});
