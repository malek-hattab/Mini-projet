const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const patientRoutes = require('./routes/patients');
app.use('/patients', patientRoutes);

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log(' Connected to MongoDB');
  app.listen(3001, () => {
    console.log('PatientService running on http://localhost:3001');
  });
})
.catch((err) => {
  console.error(' MongoDB connection error:', err);
});
