const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  companyRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CompanyRequest',
  },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true
  },
  billingFirstName: {
    type: String,
    required: true
  },
  billingLastName: {
    type: String,
    required: true
  },
  billingPhone: {
    type: String,
    required: true
  },
  billingEmail: {
    type: String,
    required: true
  },
  billingAddress: {
    type: String,
    required: true
  },
  billingCity: {
    type: String,
    required: true
  },
  billingCountry: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;