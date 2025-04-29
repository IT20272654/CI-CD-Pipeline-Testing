const {
  getCollectionCounts,
  getFilteredHistoriesCount,
  getUnreadMessageCount
} = require('../../controllers/collectionController');
const Door = require('../../models/Door');
const User = require('../../models/User');
const History = require('../../models/History');
const Message = require('../../models/Messages');

jest.mock('../../models/Door');
jest.mock('../../models/User');
jest.mock('../../models/History');
jest.mock('../../models/Messages');

describe('Collection Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      companyId: 'companyId',
      query: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('getCollectionCounts', () => {
    it('should return counts for all collections', async () => {
      Door.countDocuments = jest.fn().mockResolvedValue(5);
      User.countDocuments = jest.fn().mockResolvedValue(10);
      History.countDocuments = jest.fn().mockResolvedValue(20);
      Message.countDocuments = jest.fn().mockResolvedValue(8);

      await getCollectionCounts(req, res);

      expect(res.json).toHaveBeenCalledWith([
        { name: 'doors', count: 5 },
        { name: 'users', count: 10 },
        { name: 'histories', count: 20 },
        { name: 'contactus', count: 8 }
      ]);
    });
  });

  describe('getFilteredHistoriesCount', () => {
    it('should return filtered history count', async () => {
      req.query.entryTime = '2024-03-14';
      History.countDocuments = jest.fn().mockResolvedValue(5);

      await getFilteredHistoriesCount(req, res);

      expect(History.countDocuments).toHaveBeenCalledWith({
        company: 'companyId',
        entryTime: expect.any(Object)
      });
      expect(res.json).toHaveBeenCalledWith({ count: 5 });
    });
  });

  describe('getUnreadMessageCount', () => {
    it('should return unread message count', async () => {
      Message.countDocuments = jest.fn().mockResolvedValue(3);

      await getUnreadMessageCount(req, res);

      expect(Message.countDocuments).toHaveBeenCalledWith({
        company: 'companyId',
        status: 'unread'
      });
      expect(res.json).toHaveBeenCalledWith({ count: 3 });
    });
  });
});
