const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// Charger le .proto
const PROTO_PATH = path.join(__dirname, 'protos', 'sensor.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const sensorProto = grpc.loadPackageDefinition(packageDefinition).sensor;

// Créer le client gRPC
const client = new sensorProto.SensorService('localhost:50051', grpc.credentials.createInsecure());

// Fonction pour générer des données aléatoires
function generateRandomData() {
  return {
    patientId: `P${Math.floor(Math.random() * 1000)}`,     
    bpm: Math.floor(Math.random() * (180 - 50) + 50),       
    tension: Math.floor(Math.random() * (200 - 90) + 90),  
  };
}

// Envoyer des données toutes les 5 secondes
setInterval(() => {
  const data = generateRandomData();
  client.SendVitalData(data, (err, response) => {
    if (err) {
      console.error(' Erreur d’envoi :', err);
    } else {
      console.log(`Envoi : ${JSON.stringify(data)} → Réponse : ${response.status}`);
    }
  });
}, 5000);
