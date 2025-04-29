const { createCompany, createAdminUser, getDoorsByAdmin, getUsersByAdmin, getDoorsHistoryByAdmin } = require('../../controllers/superAdminController');
const Company = require('../../models/Company');
const AdminUser = require('../../models/AdminUser');
const Door = require('../../models/Door');
const User = require('../../models/User');
const History = require('../../models/History');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

// Mock dependencies
jest.mock('../../models/Company');
jest.mock('../../models/AdminUser');
jest.mock('../../models/Door');
jest.mock('../../models/User');
jest.mock('../../models/History');
jest.mock('bcrypt');
jest.mock('nodemailer');

describe('SuperAdminController Tests', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
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
        package: '7days',
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

      await createAdminUser(mockReq, mockRes);

      expect(AdminUser).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockSavedAdminUser);
      expect(mockCompany.save).toHaveBeenCalled();
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
