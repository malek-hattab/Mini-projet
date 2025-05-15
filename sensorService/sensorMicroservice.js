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

// Implémentation de la méthode gRPC
const sensorService = {
  SendVitalData: (call, callback) => {
    const data = call.request;
    console.log(` Données reçues : PatientID=${data.patientId}, BPM=${data.bpm}, Tension=${data.tension}`);
    callback(null, { status: 'Data received' });
  },
};

// Démarrer le serveur
const server = new grpc.Server();
server.addService(sensorProto.SensorService.service, sensorService);

const PORT = 50051;
server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), () => {
  console.log(` SensorService gRPC en écoute sur port ${PORT}`);
  
});
