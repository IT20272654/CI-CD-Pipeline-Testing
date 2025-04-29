const { getRecentAccessDoors } = require('../../controllers/historyController');
const History = require('../../models/History');

jest.mock('../../models/History');

describe('History Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      companyId: 'mockCompanyId'
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('getRecentAccessDoors', () => {
    it('should fetch recent access records', async () => {
      const mockHistory = [
        { 
          _id: '1',
          entryTime: new Date(),
          user: { firstName: 'John', lastName: 'Doe' }
        }
      ];

      History.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(mockHistory)
      });

      await getRecentAccessDoors(req, res);

      expect(History.find).toHaveBeenCalledWith({ company: 'mockCompanyId' });
      expect(res.json).toHaveBeenCalledWith(mockHistory);
    });

    it('should handle errors properly', async () => {
      History.find = jest.fn().mockImplementation(() => {
        throw new Error('Database error');
      });

      await getRecentAccessDoors(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Error fetching recent access doors' 
      });
    });
  });
});
