const request = require('supertest');
const app = require('../../index');
const { connect, disconnect, clearDatabase } = require('./setup/testDb');
const Door = require('../../models/Door');
const AdminUser = require('../../models/AdminUser');
const Company = require('../../models/Company');
const jwt = require('jsonwebtoken');

describe('Doors Integration Tests', () => {
  let company;
  let adminUser;
  let authToken;
  
  beforeAll(async () => {
    await connect();
  });

  beforeEach(async () => {
    await clearDatabase();
    
    // Setup test data
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

    // Generate auth token
    authToken = jwt.sign(
      { userId: adminUser._id, role: 'Admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    await disconnect();
  });

  describe('POST /api/doors/create', () => {
    it('should create a new door', async () => {
      const doorData = {
        location: 'Building A',
        doorCode: 'DOOR001',
        roomName: 'Meeting Room 1',
        qrData: 'BuildingA-DOOR001-MeetingRoom1',
        status: 'Active'
      };

      const response = await request(app)
        .post('/api/doors/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send(doorData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('QR Code saved successfully!');
    });
  });

  describe('GET /api/doors', () => {
    it('should get all doors for company', async () => {
      // Create test door
      await Door.create({
        location: 'Building A',
        doorCode: 'DOOR001',
        roomName: 'Meeting Room 1',
        qrData: 'test-qr',
        company: company._id,
        admin: adminUser._id
      });

      const response = await request(app)
        .get('/api/doors')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].doorCode).toBe('DOOR001');
    });
  });
});
