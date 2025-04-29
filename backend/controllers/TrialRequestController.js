const TrialRequest = require('../models/TrialRequest');

// 1. Get all trial requests with optional pagination
const getAllTrialRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query; // Pagination parameters

    // Calculate the number of items to skip based on the page and limit
    const skip = (page - 1) * limit;

    // Fetch data from the database
    const trialRequests = await TrialRequest.find()
      .skip(skip) // Skip previous records
      .limit(Number(limit)) // Limit the number of results
      .sort({ createdAt: -1 }); // Optionally, sort by createdAt or any other field

    // Get the total count of records for pagination
    const totalRequests = await TrialRequest.countDocuments();

    // Return the response with paginated data
    res.status(200).json({
      success: true,
      data: trialRequests,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalRequests / limit),
        totalRequests,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllTrialRequests };