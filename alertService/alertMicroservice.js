const express = require('express');
const { Kafka } = require('kafkajs');

const app = express();
app.use(express.json());

// Kafka config
const kafka = new Kafka({
  clientId: 'alert-service',
  brokers: ['localhost:9092']
});

const producer = kafka.producer();

// Connexion à Kafka
const start = async () => {
  await producer.connect();
  console.log(' alertService connecté à Kafka');
};

start();

// Endpoint pour recevoir les données vitales (ex: depuis sensorService)
app.post('/analyze', async (req, res) => {
  const { patientId, bpm, tension } = req.body;

  console.log(` Analyse de patient ${patientId} - BPM: ${bpm}, Tension: ${tension}`);

  // Seuils critiques
  if (bpm > 150 || tension > 180) {
    const alert = {
      patientId,
      bpm,
      tension,
      timestamp: new Date().toISOString(),
      message: 'Valeurs critiques détectées',
    };

    // Envoyer l’alerte dans Kafka
    await producer.send({
      topic: 'alerts',
      messages: [{ value: JSON.stringify(alert) }]
    });

    console.log(' Alerte envoyée via Kafka:', alert);
  }

  res.status(200).json({ message: 'Analyse terminée' });
});

// Lancer le serveur
const PORT = 3002;
app.listen(PORT, () => {
  console.log(` alertService écoute sur http://localhost:${PORT}`);
});
