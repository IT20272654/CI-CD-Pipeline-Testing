const request = require('supertest');
const app = require('../../index');
const { connect, disconnect, clearDatabase } = require('./setup/testDb');
const Company = require('../../models/Company');
const AdminUser = require('../../models/AdminUser');
const jwt = require('jsonwebtoken');

describe('Company Integration Tests', () => {
  let superAdmin;
  let authToken;

  beforeAll(async () => {
    await connect();
  });

  beforeEach(async () => {
    await clearDatabase();

    // Create super admin
    superAdmin = await AdminUser.create({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'super@admin.com',
      password: 'hashedPassword',
      role: 'SuperAdmin'
    });

    // Generate auth token
    authToken = jwt.sign(
      { userId: superAdmin._id, role: 'SuperAdmin' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    await disconnect();
  });

  describe('POST /api/admin/create-company', () => {
    it('should create a new company', async () => {
      const companyData = {
        name: 'New Company',
        address: 'Company Address',
        package: '30daysLimited'
      };

      const response = await request(app)
        .post('/api/admin/create-company')
        .set('Authorization', `Bearer ${authToken}`)
        .send(companyData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('name', 'New Company');
      expect(response.body).toHaveProperty('status', 'active');
    });
  });

  describe('PATCH /api/admin/companies/toggle-status/:companyId', () => {
    it('should toggle company status', async () => {
      const company = await Company.create({
        name: 'Test Company',
        address: 'Test Address',
        status: 'active',
        package: '30daysLimited'
      });

      const response = await request(app)
        .patch(`/api/admin/companies/toggle-status/${company._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.company.status).toBe('inactive');
    });
  });
});
