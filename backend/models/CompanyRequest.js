const mongoose = require('mongoose');
const { Schema } = mongoose;

const companyRequestSchema = new Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    admins: [
      {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true, unique: true } // Ensure emails are unique
      }
    ],
    status: {type: String, default: 'Pending' },
    packageType: { type: String, required: true },
    payment: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const CompanyRequest = mongoose.model('CompanyRequest', companyRequestSchema);

module.exports = CompanyRequest;
