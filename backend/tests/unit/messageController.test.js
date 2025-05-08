const { getMessagesByCompanyId, toggleReadState, updateUserStatusOnReply } = require('../../controllers/messageController');
const ContactUs = require('../../models/Messages');
const AdminUser = require('../../models/AdminUser');

jest.mock('../../models/Messages');
jest.mock('../../models/AdminUser');

describe('Message Controller', () => {
  let req, res;
  let consoleErrorSpy;

  beforeEach(() => {
    req = {
      user: { userId: 'mockAdminId' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    // Spy on console.error before each test
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.error after each test
    consoleErrorSpy.mockRestore();
  });

  describe('getMessagesByCompanyId', () => {
    it('should fetch messages for a company', async () => {
      const mockMessages = [
        { id: '1', message: 'Test message 1' },
        { id: '2', message: 'Test message 2' }
      ];

      const mockAdminUser = {
        company: { _id: 'companyId' }
      };

      // Setup AdminUser mock
      AdminUser.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockAdminUser)
      });

      // Setup ContactUs mock with proper chaining
      const mockFind = jest.fn().mockReturnThis();
      const mockPopulate = jest.fn().mockReturnThis();
      const mockSort = jest.fn().mockResolvedValue(mockMessages);

      ContactUs.find = mockFind;
      ContactUs.find().populate = mockPopulate;
      ContactUs.find().populate().sort = mockSort;

      await getMessagesByCompanyId(req, res);

      expect(AdminUser.findById).toHaveBeenCalledWith('mockAdminId');
      expect(ContactUs.find).toHaveBeenCalledWith({ company: 'companyId' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockMessages);
    });

    it('should handle errors when admin user is not found', async () => {
      AdminUser.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      await getMessagesByCompanyId(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        success: false, 
        message: "Admin user or company not found." 
      });
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database error');
      const mockAdminUser = {
        company: { _id: 'companyId' }
      };
      
      AdminUser.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockAdminUser)
      });

      ContactUs.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockRejectedValue(dbError)
        })
      });

      await getMessagesByCompanyId(req, res);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching messages:', dbError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ 
        error: "Failed to fetch messages" 
      });
    });
  });

  describe('toggleReadState', () => {
    it('should toggle message read status', async () => {
      const mockMessage = {
        _id: 'messageId',
        status: 'read'
      };

      req.params = { id: 'messageId' };
      req.body = { status: 'read' };

      ContactUs.findByIdAndUpdate = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockMessage)
      });

      await toggleReadState(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockMessage);
    });
  });
});
