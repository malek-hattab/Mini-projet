const { Kafka } = require('kafkajs');

// Configuration du client Kafka
const kafka = new Kafka({
  clientId: 'notification-service',
  brokers: ['localhost:9092']
});

const consumer = kafka.consumer({ groupId: 'alert-group' });

const run = async () => {
  await consumer.connect();
  console.log(' notificationService connecté à Kafka');

  await consumer.subscribe({ topic: 'alerts', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const alert = JSON.parse(message.value.toString());
      console.log(` Alerte reçue :`);
      console.log(` Patient : ${alert.patientId}`);
      console.log(` BPM : ${alert.bpm} |  Tension : ${alert.tension}`);
      console.log(` Date : ${alert.timestamp}`);
      console.log(`Message : ${alert.message}`);
      console.log('-------------------------------------');
    },
  });
};

run().catch(console.error);
