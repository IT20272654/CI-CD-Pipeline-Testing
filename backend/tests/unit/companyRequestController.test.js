const {
  createCompanyRequest,
  toggleCompanyRequestStatus
} = require('../../controllers/companyRequestController');
const CompanyRequest = require('../../models/CompanyRequest');
const Company = require('../../models/Company');
const AdminUser = require('../../models/AdminUser');
const Payment = require('../../models/payment');

// Mock modules
jest.mock('../../models/CompanyRequest');
jest.mock('../../models/Company');
jest.mock('../../models/AdminUser');
jest.mock('../../models/payment');

// Mock nodemailer and fs
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue(true)
  })
}));
jest.mock('fs', () => ({
  readFileSync: jest.fn().mockReturnValue(Buffer.from('mock pdf content'))
}));

// Mock bcrypt for password hashing
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword123')
}));

describe('Company Request Controller', () => {
  let req, res;
  let consoleErrorSpy;
  let consoleLogSpy;

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
        packageType: 'Premium'
      },
      params: { id: 'requestId' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    // Spy on console methods
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
    jest.clearAllMocks();
  });

  describe('createCompanyRequest', () => {
    it('should create company request successfully', async () => {
      const mockSavedRequest = {
        _id: 'requestId',
        name: 'Test Company',
        address: 'Test Address',
        admins: [{
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@test.com'
        }],
        packageType: 'Premium',
        toObject: () => ({
          _id: 'requestId',
          name: 'Test Company',
          address: 'Test Address',
          admins: [{
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@test.com'
          }],
          packageType: 'Premium'
        })
      };

      CompanyRequest.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(mockSavedRequest)
      }));

      await createCompanyRequest(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Company created successfully',
        companyRequest: expect.any(Object)
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
        status: 'Pending',
        save: jest.fn().mockResolvedValue({ status: 'Approved' })
      };

      req.body.status = 'Approve';
      req.body.selectedAdmins = ['adminId'];

      CompanyRequest.findById.mockResolvedValue(mockRequest);

      const mockCompany = {
        _id: 'companyId',
        admins: [],
        save: jest.fn().mockResolvedValue({})
      };
      Company.mockImplementation(() => mockCompany);

      const mockAdminUser = {
        _id: 'adminId',
        email: 'admin@test.com',
        firstName: 'Admin',
        save: jest.fn().mockResolvedValue({})
      };
      AdminUser.mockImplementation(() => mockAdminUser);

      Payment.updateMany.mockResolvedValue({ nModified: 1 });

      await toggleCompanyRequestStatus(req, res);
      // Wait for any immediate callbacks to complete
      await new Promise(resolve => setImmediate(resolve));

      expect(mockRequest.save).toHaveBeenCalled();
      expect(mockCompany.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        company: expect.any(Object),
        admins: expect.any(Array)
      }));
    });

    it('should handle errors properly', async () => {
      req.params = { id: 'requestId' };
      req.body = { status: 'Approve' };

      // Mock findById to r eturn null to simulate not found error
      CompanyRequest.findById = jest.fn().mockResolvedValue(null);

      const result = await toggleCompanyRequestStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Company request not found' 
      });
    });

    it('should handle invalid status value', async () => {
      req.params = { id: 'requestId' };
      req.body = { status: 'Invalid' };

      await toggleCompanyRequestStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Invalid status value' 
      });
    });
  });
});
