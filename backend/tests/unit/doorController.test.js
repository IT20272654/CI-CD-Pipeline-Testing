const { createDoor, getDoorById, getAllDoors, updateDoor, deleteDoor, setdoorstatus } = require('../../controllers/doorController');
const Door = require('../../models/Door');
const AdminUser = require('../../models/AdminUser');
const PermissionRequest = require('../../models/PermissionRequest');
const User = require('../../models/User');

jest.mock('../../models/Door');
jest.mock('../../models/AdminUser');
jest.mock('../../models/PermissionRequest');
jest.mock('../../models/User');

describe('Door Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        location: 'Test Location',
        doorCode: 'DOOR123',
        roomName: 'Test Room',
        qrData: 'test-qr-data',
        qrImage: 'base64-image-data',
        status: 'Active'
      },
      user: { userId: 'adminId' },
      companyId: 'companyId'
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('createDoor', () => {
    it('should create a door successfully', async () => {
      Door.findOne = jest.fn().mockResolvedValue(null);
      AdminUser.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          company: { _id: 'companyId' }
        })
      });
      Door.prototype.save = jest.fn().mockResolvedValue({
        _id: 'doorId',
        ...req.body
      });

      await createDoor(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'QR Code saved successfully!'
      });
    });
  });

  describe('getAllDoors', () => {
    it('should fetch all doors for a company', async () => {
      const mockDoors = [
        { _id: 'door1', doorCode: 'DOOR1' },
        { _id: 'door2', doorCode: 'DOOR2' }
      ];

      Door.find = jest.fn().mockResolvedValue(mockDoors);

      await getAllDoors(req, res);

      expect(Door.find).toHaveBeenCalledWith({ company: req.companyId });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        companyPackage: undefined,
        doors: mockDoors
      });
    });
  });

  describe('setdoorstatus', () => {
    it('should update door status successfully', async () => {
      const mockDoor = {
        _id: 'doorId',
        status: 'Inactive'
      };

      req.params = { id: 'doorId' };
      req.body = { status: 'Inactive' };

      Door.findByIdAndUpdate = jest.fn().mockResolvedValue(mockDoor);

      await setdoorstatus(req, res);

      expect(Door.findByIdAndUpdate).toHaveBeenCalledWith(
        'doorId',
        { status: 'Inactive' },
        { new: true }
      );
      expect(res.json).toHaveBeenCalledWith(mockDoor);
    });
  });
});
