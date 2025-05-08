const { createCompany, createAdminUser, getDoorsByAdmin, getUsersByAdmin, getDoorsHistoryByAdmin } = require('../../controllers/superAdminController');
const Company = require('../../models/Company');
const AdminUser = require('../../models/AdminUser');
const Door = require('../../models/Door');
const User = require('../../models/User');
const History = require('../../models/History');
const bcrypt = require('bcrypt');

// Mock dependencies
jest.mock('../../models/Company');
jest.mock('../../models/AdminUser');
jest.mock('../../models/Door');
jest.mock('../../models/User');
jest.mock('../../models/History');
jest.mock('bcrypt');

// Mock nodemailer with proper transporter setup
const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-message-id' });
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: mockSendMail
  })
}));

// Mock fs
jest.mock('fs', () => ({
  readFileSync: jest.fn().mockReturnValue(Buffer.from('mock pdf content'))
}));

describe('SuperAdminController Tests', () => {
  beforeAll(() => {
    // Mock environment variables
    process.env.EMAIL_HOST = 'smtp.test.com';
    process.env.EMAIL_PORT = '587';
    process.env.EMAIL_USER = 'test@example.com';
    process.env.EMAIL_PASSWORD = 'testpass';
  });

  afterAll(() => {
    // Clean up environment variables
    delete process.env.EMAIL_HOST;
    delete process.env.EMAIL_PORT;
    delete process.env.EMAIL_USER;
    delete process.env.EMAIL_PASSWORD;
  });

  let mockReq;
  let mockRes;
  let consoleErrorSpy;
  let consoleLogSpy;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
    jest.clearAllMocks();
  });

  describe('createCompany', () => {
    beforeEach(() => {
      mockReq = {
        body: {
          name: 'Test Company',
          address: 'Test Address',
          package: 'Premium'  // Changed from '7days' to 'Premium'
        }
      };
      jest.clearAllMocks();
    });

    test('should create a company successfully', async () => {
      const today = new Date();
      const expiredDate = new Date(today);
      expiredDate.setDate(today.getDate() + 366); // Match controller's Premium package date calculation

      const mockSavedCompany = {
        _id: 'company123',
        name: 'Test Company',
        address: 'Test Address',
        package: 'Premium',
        expiredDate: expiredDate,
        save: jest.fn().mockResolvedValue(true)
      };

      const mockCompanyConstructor = jest.fn().mockImplementation((data) => ({
        ...mockSavedCompany,
        ...data
      }));

      Company.mockImplementation(mockCompanyConstructor);

      await createCompany(mockReq, mockRes);

      expect(mockCompanyConstructor).toHaveBeenCalledWith(
        expect.objectContaining({
          name: mockReq.body.name,
          address: mockReq.body.address,
          package: mockReq.body.package,
        })
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: mockSavedCompany._id,
          name: mockSavedCompany.name,
          address: mockSavedCompany.address,
          package: mockSavedCompany.package
        })
      );
    });

    test('should handle save errors', async () => {
      const mockError = new Error('Database error');
      const mockCompanyConstructor = jest.fn().mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(mockError)
      }));

      Company.mockImplementation(mockCompanyConstructor);

      await createCompany(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Server error' });
    });

    test('should return 400 if required fields are missing', async () => {
      mockReq.body.name = undefined;

      await createCompany(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Missing required fields' });
    });
  });

  describe('createAdminUser', () => {
    beforeEach(() => {
      mockReq = {
        body: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'password123',
          companyId: 'company123'
        }
      };
      
      jest.clearAllMocks();
      bcrypt.hash.mockResolvedValue('hashedPassword');
    });

    test('should create an admin user successfully', async () => {
      const mockCompany = {
        _id: 'company123',
        admins: [],
        package: 'Premium',
        save: jest.fn().mockResolvedValue(true)
      };

      const mockSavedAdminUser = {
        _id: 'admin123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: 'Admin',
        company: 'company123',
        save: jest.fn().mockResolvedValue(true)
      };

      Company.findById.mockResolvedValue(mockCompany);
      AdminUser.mockImplementation(() => mockSavedAdminUser);
      AdminUser.countDocuments = jest.fn().mockResolvedValue(0);

      // Act
      await createAdminUser(mockReq, mockRes);
      
      // Wait for any async operations
      await new Promise(resolve => setTimeout(resolve, 100));

      // Assert
      expect(AdminUser).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockSavedAdminUser);
      expect(mockCompany.save).toHaveBeenCalled();
    }, 10000); // Increase timeout to 10s

    test('should handle server errors', async () => {
      const error = new Error('Database error');
      Company.findById.mockRejectedValue(error);

      await createAdminUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Server error' });
    });
  });

  describe('getDoorsByAdmin', () => {
    test('should get doors for an admin', async () => {
      const mockDoors = [{ id: 'door1' }, { id: 'door2' }];
      Door.find.mockResolvedValue(mockDoors);
      mockReq = { params: { adminId: 'admin123' } };

      await getDoorsByAdmin(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockDoors);
    });
  });

  describe('getUsersByAdmin', () => {
    test('should get users for an admin', async () => {
      const mockUsers = [{ id: 'user1' }, { id: 'user2' }];
      User.find.mockResolvedValue(mockUsers);
      mockReq = { params: { adminId: 'admin123' } };

      await getUsersByAdmin(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockUsers);
    });
  });

  describe('getDoorsHistoryByAdmin', () => {
    test('should get door access history', async () => {
      const mockHistory = [{ id: 'history1' }, { id: 'history2' }];
      History.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(mockHistory)
      });
      mockReq = { params: { adminId: 'admin123' } };

      await getDoorsHistoryByAdmin(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockHistory);
    });
  });
});
