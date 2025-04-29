const Company = require('../models/Company');
const Payment = require('../models/payment'); // Assuming you have a Payment model
const mongoose = require('mongoose');

const createPayment = async (req, res) => {
    try {
      const {
        paymentID,
        companyId,
        amount,
        currency,
        paymentMethod,
        billingFirstName,
        billingLastName,
        billingPhone,
        billingEmail,
        billingAddress,
        billingCity,
        billingCountry,
      } = req.body;
  
      // Validate required fields
      if (
        !paymentID ||
        !companyId ||
        !amount ||
        !currency ||
        !paymentMethod ||
        !billingFirstName ||
        !billingLastName ||
        !billingPhone ||
        !billingEmail ||
        !billingAddress ||
        !billingCity ||
        !billingCountry
      ) {
        return res.status(400).json({ error: "All fields are required." });
      }
  
      // Save payment details to the database
      const paymentRecord = new Payment({
        orderId: paymentID,
        companyId: companyId,
        amount,
        currency,
        paymentMethod,
        billingFirstName,
        billingLastName,
        billingPhone,
        billingEmail,
        billingAddress,
        billingCity,
        billingCountry,
        createdAt: new Date(),
      });
  
      await paymentRecord.save(); // Save to the database
  
      // Respond with success
      res.status(201).json({
        message: "Payment processed successfully.",
        paymentID,
      });
    } catch (error) {
      console.error("Error processing payment:", error);
      res.status(500).json({ error: "Internal server error." });
    }
};

const checkPaymentIdExists = async (req, res) => {
  console.log("checkPaymentIdExists called"); // Log the function call for debugging
  try {
    let uniquePaymentId;
    let attempts = 0;
    const MAX_ATTEMPTS = 5;

    do {
      // Generate timestamp-based ID with random suffix
      const timestampPart = Date.now().toString(); // 13-digit timestamp
      const randomPart = Math.floor(100 + Math.random() * 900).toString(); // 3-digit random number
      uniquePaymentId = timestampPart + randomPart; // 16-digit total

      attempts++;
      
      // Safety check to prevent infinite loops
      if(attempts > MAX_ATTEMPTS) {
        throw new Error('Max attempts reached generating payment ID');
      }

    } while (await Payment.exists({ orderId: uniquePaymentId }));

    res.status(200).json({
      uniquePaymentId,
      message: 'Unique payment ID generated successfully'
    });

  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const getCompanyWithPayments = async (req, res) => {
  try {
    const { id } = req.params; // Ensure correct 
    console.log("payment control",id); // Log the ID for debugging
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid company ID' });
    }

    const companyWithPayments = await Company.findById(id).populate('payments');

    if (!companyWithPayments) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.status(200).json(companyWithPayments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const paymentSuccess = async (req, res) => {
  const orderId = req.params.orderId; // Use req.params to get the orderId
  if (!orderId) {
    return res.status(400).json({ message: 'Order ID is missing' });
  }

  try {
    // Find the payment record by orderId
    const payment = await Payment.findOne({ orderId: orderId });
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Update the payment status to 'completed'
    payment.status = 'completed';
    await payment.save();

    // Retrieve the companyId from the payment record
    const companyId = payment.companyId;

    // Update the payment attribute in the CompanyRequest model
    const companyRequest = await Company.findOneAndUpdate(
      { _id: companyId }, // Find the company request by companyId
      { payment: true },  // Set the payment attribute to true
      { new: true }       // Return the updated document
    );

    if (!companyRequest) {
      return res.status(404).json({ message: 'Company request not found' });
    }

    // Respond with success
    res.status(200).json({
      message: 'Payment successful and company request updated',
      orderId: orderId,
      companyId: companyId,
    });
  } catch (error) {
    console.error('Error in paymentSuccess:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

  
module.exports = { getCompanyWithPayments, createPayment, checkPaymentIdExists, paymentSuccess };  