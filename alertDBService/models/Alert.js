const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  patientId: String,
  bpm: Number,
  tension: Number,
  timestamp: String,
  message: String
});

module.exports = mongoose.model('Alert', alertSchema);
