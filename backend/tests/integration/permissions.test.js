const request = require('supertest');
const app = require('../../index');
const { connect, disconnect, clearDatabase } = require('./setup/testDb');
const PermissionRequest = require('../../models/PermissionRequest');
const Door = require('../../models/Door');
const User = require('../../models/User');
const AdminUser = require('../../models/AdminUser');
const Company = require('../../models/Company');
const jwt = require('jsonwebtoken');

describe('Permission Requests Integration Tests', () => {
  let company;
  let adminUser;
  let user;
  let door;
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
      company: company._id,
      admin: adminUser._id
    });

    door = await Door.create({
      location: 'Building A',
      doorCode: 'DOOR001',
      roomName: 'Meeting Room',
      qrData: 'test-qr',
      company: company._id,
      admin: adminUser._id
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

  describe('POST /api/permission-requests/make', () => {
    it('should create a new permission request', async () => {
      const requestData = {
        user: user._id,
        door: door._id,
        date: new Date(),
        inTime: '09:00',
        outTime: '17:00',
        message: 'Need access for meeting'
      };

      const response = await request(app)
        .post('/api/permission-requests/make')
        .send(requestData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('status', 'Approved');
      expect(response.body).toHaveProperty('door', 'DOOR001');
    });
  });

  describe('GET /api/permission-requests/pending-requests', () => {
    it('should get all pending requests for company', async () => {
      await PermissionRequest.create({
        user: user._id,
        company: company._id,
        door: door._id,
        name: `${user.firstName} ${user.lastName}`,
        location: door.location,
        roomName: door.roomName,
        inTime: '09:00',
        outTime: '17:00',
        date: new Date(),
        status: 'Pending'
      });

      const response = await request(app)
        .get('/api/permission-requests/pending-requests')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].status).toBe('Pending');
    });
  });
});
