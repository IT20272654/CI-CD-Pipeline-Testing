const mongoose = require('mongoose');
const { Schema } = mongoose;

const companySchema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  locations: [{ type: String }],
  admins: [{ type: Schema.Types.ObjectId, ref: 'AdminUser' }],
  status: { type: String, default: 'active' },
  package: { type: String },
  expiredDate: { type: Date },
}, { timestamps: true });

// Virtual populate to retrieve all related payments based on companyId
companySchema.virtual('payments', {
  ref: 'Payment',
  localField: '_id',
  foreignField: 'companyId'
});

// Ensure virtuals are included when converting to JSON or objects
companySchema.set('toObject', { virtuals: true });
companySchema.set('toJSON', { virtuals: true });

const Company = mongoose.model('Company', companySchema);

module.exports = Company;
