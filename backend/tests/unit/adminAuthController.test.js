const {
  loginAdminUser,
  getCurrentAdminUser,
  getAllAdminUsers,
  updateAdminUserById,
  deleteAdminUserById,
  changePassword
} = require('../../controllers/adminAuthController');
const AdminUser = require('../../models/AdminUser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Mock dependencies
jest.mock('../../models/AdminUser');
jest.mock('jsonwebtoken');
jest.mock('bcrypt');

describe('Admin Auth Controller', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      body: {},
      user: { userId: 'mockUserId' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('loginAdminUser', () => {
    it('should successfully login admin user with valid credentials', async () => {
      const mockUser = {
        _id: 'userId',
        email: 'admin@test.com',
        password: 'hashedPassword',
        role: 'Admin',
        company: {
          name: 'Test Company',
          status: 'active',
          expiredDate: new Date(Date.now() + 86400000)
        }
      };

      req.body = {
        email: 'admin@test.com',
        password: 'password123'
      };

      AdminUser.findOne = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUser)
      });
      bcrypt.compare = jest.fn().mockResolvedValue(true);
      jwt.sign = jest.fn().mockReturnValue('mockToken');

      await loginAdminUser(req, res);

      expect(res.json).toHaveBeenCalledWith({
        token: 'mockToken',
        role: 'Admin',
        company: 'Test Company'
      });
    });

    it('should return 400 for invalid credentials', async () => {
      req.body = {
        email: 'wrong@test.com',
        password: 'wrongpassword'
      };

      AdminUser.findOne = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      await loginAdminUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });

    it('should reject login for inactive company', async () => {
      const mockUser = {
        company: {
          status: 'inactive'
        }
      };

      AdminUser.findOne = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUser)
      });

      await loginAdminUser(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Company is inactive. Cannot log in.'
      });
    });
  });

  describe('getCurrentAdminUser', () => {
    it('should return the current admin user details', async () => {
      const mockUser = {
        _id: 'userId',
        email: 'admin@test.com',
        role: 'Admin'
      };

      AdminUser.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue(mockUser)
        })
      });

      await getCurrentAdminUser(req, res);

      expect(AdminUser.findById).toHaveBeenCalledWith('mockUserId');
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('getAllAdminUsers', () => {
    it('should return list of all admin users', async () => {
      const mockUsers = [
        { _id: 'user1', email: 'admin1@test.com' },
        { _id: 'user2', email: 'admin2@test.com' }
      ];

      AdminUser.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue(mockUsers)
        })
      });

      await getAllAdminUsers(req, res);

      expect(AdminUser.find).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockUsers);
    });
  });

  describe('updateAdminUserById', () => {
    it('should successfully update admin user', async () => {
      const mockUser = {
        _id: 'userId',
        firstName: 'Old',
        lastName: 'Name',
        email: 'old@test.com',
        save: jest.fn().mockResolvedValue({
          _id: 'userId',
          firstName: 'New',
          lastName: 'Name',
          email: 'new@test.com'
        })
      };

      req.params = { id: 'userId' };
      req.body = {
        firstName: 'New',
        lastName: 'Name',
        email: 'new@test.com'
      };

      AdminUser.findById = jest.fn().mockResolvedValue(mockUser);

      await updateAdminUserById(req, res);

      expect(mockUser.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'New',
          lastName: 'Name',
          email: 'new@test.com'
        })
      );
    });
  });

  describe('changePassword', () => {
    it('should successfully change password with correct credentials', async () => {
      const mockUser = {
        password: 'oldHashedPassword',
        save: jest.fn().mockResolvedValue(true)
      };

      req.body = {
        currentPassword: 'correctPassword',
        newPassword: 'newPassword123'
      };

      AdminUser.findById = jest.fn().mockResolvedValue(mockUser);
      bcrypt.compare = jest.fn().mockResolvedValue(true);
      bcrypt.hash = jest.fn().mockResolvedValue('newHashedPassword');

      await changePassword(req, res);

      expect(mockUser.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: 'Password changed successfully'
      });
    });

    it('should reject password change with incorrect current password', async () => {
      const mockUser = {
        password: 'oldHashedPassword'
      };

      req.body = {
        currentPassword: 'wrongPassword',
        newPassword: 'newPassword123'
      };

      AdminUser.findById = jest.fn().mockResolvedValue(mockUser);
      bcrypt.compare = jest.fn().mockResolvedValue(false);

      await changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Current password is incorrect'
      });
    });
  });
});
