const { getRecentAccessDoors } = require('../../controllers/historyController');
const History = require('../../models/History');

jest.mock('../../models/History');

describe('History Controller', () => {
  let req, res;
  let consoleErrorSpy;

  beforeEach(() => {
    req = {
      companyId: 'mockCompanyId'
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
      const dbError = new Error('Database error');
      History.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockRejectedValue(dbError)  // Changed from throw to mockRejectedValue
      });

      await getRecentAccessDoors(req, res);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching recent access doors:', dbError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Error fetching recent access doors' 
      });
    });
  });
});
