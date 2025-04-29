const request = require('supertest');
const app = require('../../index');
const { connect, disconnect, clearDatabase } = require('./setup/testDb');
const Message = require('../../models/Messages');
const AdminUser = require('../../models/AdminUser');
const Company = require('../../models/Company');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');

describe('Messages Integration Tests', () => {
  let company;
  let adminUser;
  let user;
  let authToken;

  beforeAll(async () => {
    await connect();
  });

  beforeEach(async () => {
    await clearDatabase();

    company = await Company.create({
      name: 'Test Company',
      address: 'Test Address'
    });

    adminUser = await AdminUser.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@test.com',
      password: 'hashedPassword',
      role: 'Admin',
      company: company._id
    });

    user = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'user@test.com',
      password: 'hashedPassword',
      userId: 'USER001',
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

  describe('GET /api/contactus/messages', () => {
    it('should get all messages for company', async () => {
      await Message.create({
        message: 'Test message',
        user: {
          objId: user._id,
          userId: user.userId
        },
        company: company._id
      });

      const response = await request(app)
        .get('/api/contactus/messages')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0].message).toBe('Test message');
    });
  });

  describe('PATCH /api/contactus/messages/:id/toggle-read', () => {
    it('should toggle message read status', async () => {
      const message = await Message.create({
        message: 'Test message',
        user: {
          objId: user._id,
          userId: user.userId
        },
        company: company._id,
        status: 'unread'
      });

      const response = await request(app)
        .patch(`/api/contactus/messages/${message._id}/toggle-read`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'read' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('read');
    });
  });
});
