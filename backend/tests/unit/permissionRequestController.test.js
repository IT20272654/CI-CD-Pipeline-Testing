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
      const mockSavedRequest = {
        _id: 'requestId',
        userId: 'testUserId',
        doorId: 'testDoorId',
        reason: 'Test reason',
        status: 'Pending'
      };

      // Mock User and Door existence checks
      User.findById = jest.fn().mockResolvedValueOnce({ _id: 'testUserId' });
      Door.findById = jest.fn().mockResolvedValueOnce({ _id: 'testDoorId' });

      // Setup PermissionRequest mock with save method
      const mockRequest = {
        ...mockSavedRequest,
        save: jest.fn().mockResolvedValueOnce(mockSavedRequest)
      };
      PermissionRequest.mockImplementation(() => mockRequest);

      await makePermissionRequest(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Error making permission request"
      });
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
        email: 'test@example.com',
        doorAccess: [],
        pendingRequests: ['requestId'],
        save: jest.fn().mockResolvedValue({ success: true })
      };

      const mockRequest = {
        _id: 'requestId',
        user: mockUser._id,
        door: mockDoor,
        inTime: '09:00',
        outTime: '17:00',
        date: new Date(),
        status: 'Pending',
        save: jest.fn().mockResolvedValue({
          _id: 'requestId',
          status: 'Approved',
          door: mockDoor,
          user: mockUser._id
        })
      };

      PermissionRequest.findById = jest.fn().mockImplementation(() => ({
        populate: jest.fn().mockResolvedValue(mockRequest)
      }));

      User.findById = jest.fn().mockImplementation(() => ({
        populate: jest.fn().mockResolvedValue(mockUser)
      }));

      Door.findByIdAndUpdate = jest.fn().mockResolvedValue(mockDoor);

      await approvePermissionRequest(req, res);

      expect(mockRequest.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });
  });
});
