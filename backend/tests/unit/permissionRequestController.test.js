const { makePermissionRequest, getPermissionRequestsByUserId, approvePermissionRequest } = require('../../controllers/permissionRequestController');
const PermissionRequest = require('../../models/PermissionRequest');
const User = require('../../models/User');
const Door = require('../../models/Door');

jest.mock('../../models/PermissionRequest');
jest.mock('../../models/User');
jest.mock('../../models/Door');
jest.mock('../../controllers/EmailController', () => ({
  sendPermissionEmail: jest.fn()
}));

describe('Permission Request Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        userId: 'testUserId',
        doorId: 'testDoorId',
        reason: 'Test reason'
      },
      params: { id: 'requestId' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('makePermissionRequest', () => {
    it('should create permission request successfully', async () => {
      const mockUser = {
        _id: 'testUserId',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        company: { _id: 'companyId' },
        pendingRequests: [],
        doorAccess: [],
        save: jest.fn().mockResolvedValue(true)
      };

      const mockDoor = {
        _id: 'testDoorId',
        doorCode: 'DOOR123',
        roomName: 'Test Room',
        location: 'Test Location',
        company: { _id: 'companyId' }
      };

      req.body = {
        user: 'testUserId',
        door: 'testDoorId',
        date: '2025-05-07',
        inTime: '09:00',
        outTime: '17:00',
        message: 'Test request'
      };

      // Mock User.findById chain
      User.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUser)
      });

      // Mock Door.findById chain
      Door.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockDoor)
      });

      // Mock PermissionRequest save
      const mockSavedRequest = {
        _id: 'requestId',
        date: new Date('2025-05-07'),
        inTime: '09:00',
        outTime: '17:00',
        message: 'Test request',
        status: 'Approved'
      };

      const mockRequest = {
        ...mockSavedRequest,
        save: jest.fn().mockResolvedValue(mockSavedRequest)
      };
      PermissionRequest.mockImplementation(() => mockRequest);

      await makePermissionRequest(req, res);

      expect(User.findById).toHaveBeenCalledWith('testUserId');
      expect(Door.findById).toHaveBeenCalledWith('testDoorId');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        door: 'DOOR123',
        roomName: 'Test Room',
        location: 'Test Location'
      }));
    });
  });

  describe('approvePermissionRequest', () => {
    it('should approve permission request successfully', async () => {
      const mockDoor = {
        _id: 'testDoorId',
        doorCode: 'DOOR123',
        roomName: 'Test Room',
        location: 'Test Location'
      };

      const mockUser = {
        _id: 'testUserId',
        email: 'john@example.com',
        doorAccess: [],
        pendingRequests: ['requestId'],
        save: jest.fn().mockResolvedValue({ success: true })
      };

      const mockRequest = {
        _id: 'requestId',
        user: mockUser,
        door: mockDoor,
        inTime: '09:00',
        outTime: '17:00',
        date: new Date('2025-05-07'),
        message: 'Test request',
        status: 'Pending',
        save: jest.fn().mockResolvedValue({
          _id: 'requestId',
          status: 'Approved',
          door: mockDoor,
          user: mockUser,
          date: new Date('2025-05-07'),
          inTime: '09:00',
          outTime: '17:00',
          message: 'Test request'
        })
      };

      PermissionRequest.findById = jest.fn().mockImplementation(() => ({
        populate: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(mockRequest)
      }));

      User.findById = jest.fn().mockImplementation(() => ({
        populate: jest.fn().mockResolvedValue(mockUser)
      }));

      Door.findByIdAndUpdate = jest.fn().mockResolvedValue(mockDoor);

      const { sendPermissionEmail } = require('../../controllers/EmailController');

      await approvePermissionRequest(req, res);
      
      // Wait for any async operations to complete
      await new Promise(resolve => setImmediate(resolve));

      expect(mockRequest.save).toHaveBeenCalled();
      expect(mockUser.save).toHaveBeenCalled();
      expect(Door.findByIdAndUpdate).toHaveBeenCalled();
      expect(sendPermissionEmail).toHaveBeenCalledWith(
        'john@example.com',
        expect.objectContaining({
          doorCode: 'DOOR123',
          roomName: 'Test Room',
          location: 'Test Location',
          date: expect.any(Date),
          inTime: '09:00',
          outTime: '17:00',
          message: 'Test request'
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });
  });
});
