const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const axios = require('axios');
const session = require('express-session');
const Keycloak = require('keycloak-connect');

const app = express();

// Session store
const memoryStore = new session.MemoryStore();

app.use(session({
  secret: 'my-secret-key', // Remplace en production
  resave: false,
  saveUninitialized: true,
  store: memoryStore
}));

//  Keycloak configuration (confidential client)
const keycloak = new Keycloak({ store: memoryStore }, {
  "realm": "medical-system",
  "auth-server-url": "http://localhost:8180/",

  "ssl-required": "external",
  "resource": "gateway-client",
  "credentials": {
    "secret": "UuFc7OSSHRRBAJRkzwRY7wzyuF2h6cJi"  // mon code secret
  },
  "confidential-port": 0
});


app.use(keycloak.middleware({
  logout: '/logout',
  admin: '/'
}));

// GraphQL schema
const typeDefs = gql`
  type Alert {
    patientId: String
    bpm: Int
    tension: Int
    timestamp: String
    message: String
  }

  type Query {
    alerts: [Alert]
  }
`;

// GraphQL resolvers
const resolvers = {
  Query: {
    alerts: async () => {
      try {
        const res = await axios.get('http://localhost:4001/alerts');
        return res.data;
      } catch (err) {
        console.error('Erreur lors du fetch des alertes', err.message);
        return [];
      }
    }
  }
};

// Start the server
async function startServer() {
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  server.applyMiddleware({ app });

  //  Route REST protégée
  app.get('/alerts', keycloak.protect(), async (req, res) => {
    try {
      const response = await axios.get('http://localhost:4001/alerts');
      res.json(response.data);
    } catch (err) {
      console.error('Erreur lors du fetch des alertes', err.message);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  app.listen(4000, () => {
    console.log(`Gateway démarrée :
    - GraphQL : http://localhost:4000${server.graphqlPath}
    - REST (protégé) : http://localhost:4000/alerts`);
  });
}

startServer();
