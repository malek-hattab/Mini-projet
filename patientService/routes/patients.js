const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const { Kafka } = require('kafkajs');

//  Init Kafka producer
const kafka = new Kafka({
  clientId: 'patient-service',
  brokers: ['localhost:9092']
});
const producer = kafka.producer();

//  Connect Kafka producer dès que le fichier est chargé
(async () => {
  await producer.connect();
  console.log(' Kafka producer (patients) connecté');
})();

// GET all patients
router.get('/', async (req, res) => {
  try {
    const patients = await Patient.find();
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// BONUS : POST new patient + publier dans Kafka 
router.post('/', async (req, res) => {
  const newPatient = new Patient(req.body);
  try {
    const savedPatient = await newPatient.save();

    // Publier dans Kafka après sauvegarde
    await producer.send({
      topic: 'patients',
      messages: [
        { value: JSON.stringify(savedPatient) }
      ]
    });

    console.log(' Patient sauvegardé + publié dans Kafka ');
    res.status(201).json(savedPatient);
  } catch (err) {
    console.error('Erreur lors de la sauvegarde du patient', err.message);
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
