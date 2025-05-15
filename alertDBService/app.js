const express = require('express');
const mongoose = require('mongoose');
const { Kafka } = require('kafkajs');
const Alert = require('./models/Alert');

const app = express();
const PORT = 4001;
app.use(express.json());

// Connexion MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/medicaldb')
  .then(() => console.log(' MongoDB connecté'))
  .catch((err) => console.error(' Erreur MongoDB', err));


// Init Kafka producer
const kafka = new Kafka({
  clientId: 'alert-db-service',
  brokers: ['localhost:9092']
});
const producer = kafka.producer();

// Connexion Producer
const connectKafka = async () => {
  await producer.connect();
  console.log(' Kafka producer connecté');
};
connectKafka();

// REST : GET /alerts
app.get('/alerts', async (req, res) => {
  const alerts = await Alert.find().sort({ timestamp: -1 });
  res.json(alerts);
});

// BONUS : POST /alerts ➔ ajouter + publier dans Kafka
app.post('/alerts', async (req, res) => {
  try {
    const { patientId, bpm, tension, message } = req.body;

    const alert = new Alert({
      patientId,
      bpm,
      tension,
      message,
      timestamp: new Date()
    });

    const savedAlert = await alert.save();

    // BONUS ➔ Publier dans Kafka 
    await producer.send({
      topic: 'alerts',
      messages: [
        { value: JSON.stringify(savedAlert) }
      ]
    });

    console.log(' Alerte sauvegardée + publiée dans Kafka ');
    res.status(201).json(savedAlert);

  } catch (err) {
    console.error(' Erreur ajout alerte:', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.listen(PORT, () => {
  console.log(` alertDBService écoute sur http://localhost:${PORT}`);
});
