const {
  createCompanyRequest,
  getCompanyRequests,
  toggleCompanyRequestStatus
} = require('../../controllers/companyRequestController');
const CompanyRequest = require('../../models/CompanyRequest');
const Company = require('../../models/Company');
const AdminUser = require('../../models/AdminUser');
const bcrypt = require('bcrypt');

jest.mock('../../models/CompanyRequest');
jest.mock('../../models/Company');
jest.mock('../../models/AdminUser');
jest.mock('../../models/payment');
jest.mock('bcrypt');
jest.mock('../../controllers/EmailController', () => ({
  sendRegistrationEmail: jest.fn()
}));

describe('Company Request Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        name: 'Test Company',
        address: 'Test Address',
        admins: [{
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@test.com'
        }],
        packageType: '30daysLimited'
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('createCompanyRequest', () => {
    it('should create company request successfully', async () => {
      const mockData = {
        _id: 'requestId',
        name: 'Test Company',
        address: 'Test Address',
        admins: [{
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@test.com'
        }],
        packageType: '30daysLimited'
      };

      const mockCompanyRequest = {
        ...mockData,
        toObject: () => mockData,
        save: jest.fn().mockResolvedValue({
          ...mockData,
          toObject: () => mockData
        })
      };

      CompanyRequest.mockImplementation(() => mockCompanyRequest);

      await createCompanyRequest(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Company created successfully',
        companyRequest: mockData
      });
    });
  });

  describe('toggleCompanyRequestStatus', () => {
    it('should approve company request and create company with admins', async () => {
      const mockRequest = {
        _id: 'requestId',
        name: 'Test Company',
        address: 'Test Address',
        admins: [{
          _id: 'adminId',
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@test.com'
        }],
        packageType: 'Premium',
        status: 'Pending'
      };

      req.params = { id: 'requestId' };
      req.body = { 
        status: 'Approve',
        selectedAdmins: ['adminId']
      };

      bcrypt.hash = jest.fn().mockResolvedValue('hashedPassword');

      CompanyRequest.findById = jest.fn().mockResolvedValue({
        ...mockRequest,
        save: jest.fn().mockResolvedValue({ ...mockRequest, status: 'Approved' })
      });

      const mockCompany = {
        _id: 'companyId',
        name: 'Test Company',
        admins: [],
        save: jest.fn().mockResolvedValue({
          _id: 'companyId',
          name: 'Test Company',
          admins: ['adminId']
        })
      };
      Company.mockImplementation(() => mockCompany);

      const mockAdminUser = {
        _id: 'adminId',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@test.com',
        save: jest.fn().mockResolvedValue({ _id: 'adminId' })
      };
      AdminUser.mockImplementation(() => mockAdminUser);

      await toggleCompanyRequestStatus(req, res);

      expect(CompanyRequest.findById).toHaveBeenCalledWith('requestId');
      expect(mockCompany.save).toHaveBeenCalled();
      expect(mockAdminUser.save).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        company: expect.any(Object),
        admins: expect.any(Array)
      }));
    });

    it('should handle errors properly', async () => {
      req.params = { id: 'requestId' };
      req.body = { status: 'Approve' };
      
      CompanyRequest.findById = jest.fn().mockRejectedValue(new Error('Database error'));

      await toggleCompanyRequestStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Error processing company request'
      });
    });
  });
});
