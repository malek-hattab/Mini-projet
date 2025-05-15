const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: Number,
  allergies: String,
  history: String
});

module.exports = mongoose.model('Patient', patientSchema);
