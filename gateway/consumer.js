const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'my-consumer',
  brokers: ['localhost:9092'] 
});

const run = async () => {
  const consumer = kafka.consumer({ groupId: 'test-group' });

  await consumer.connect();
  console.log(' Consumer connecté à Kafka');

  //  S'abonner au topic 'patients'
  await consumer.subscribe({ topic: 'patients', fromBeginning: true });

  //  S'abonner au topic 'alerts'
  await consumer.subscribe({ topic: 'alerts', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log(`\n Nouveau message reçu sur le topic [${topic}] :`);
      console.log(message.value.toString());
    },
  });
};

run().catch(error => {
  console.error('Erreur consumer Kafka:', error);
});
