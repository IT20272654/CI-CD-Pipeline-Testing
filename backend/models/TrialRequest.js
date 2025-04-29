const mongoose = require('mongoose');
const { Schema } = mongoose;

const trialRequestSchema = new Schema(
  {
    companyName: { type: String, required: true },
    address: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true }
  },
  { timestamps: true }
);

const TrialRequest = mongoose.model('TrialRequest', trialRequestSchema);

module.exports = TrialRequest;
