#  Système d’Alerte Médical – Projet SOA (Microservices)

Ce projet propose une architecture distribuée pour la **gestion des alertes médicales en temps réel**, basée sur des **microservices** communiquant via REST, gRPC, Kafka, MongoDB, GraphQL, et protégée par Keycloak.

---

##  Architecture Générale

```
[ simulateSensorData (gRPC client) ]
        ⬇
[sensorService] --gRPC--> [alertService] --Kafka--> [alertDBService]
                                                 └--> [notificationService]
        ⬇                                            ⬇
    [patientService] <--REST--> [gateway] <--GraphQL--> HTML (dashboard.html)
                                            ↑
                                         Keycloak
```

---

##  Microservices

### 1. `sensorService`
- **Rôle :** Simule un capteur qui envoie les constantes vitales (bpm, tension).
- **Protocole :** gRPC
- **Fichier :** `simulateSensorData.js`
- **Test :** `node simulateSensorData.js`

---

### 2. `alertService`
- **Rôle :** Reçoit les données gRPC, détecte les alertes critiques.
- **Protocole :** gRPC (entrée) → Kafka (sortie)
- **Fichier :** `alertService/alertMicroservice.js`

---

### 3. `alertDBService`
- **Rôle :** Stocke les alertes critiques dans MongoDB.
- **Entrée :** Kafka (topic `alerts`)
- **Fichier principal :** `alertDBService/app.js`

---

### 4. `notificationService`
- **Rôle :** Consomme les alertes Kafka et affiche une notification (console).
- **Fichier :** `notificationService/notificationService.js`

---

### 5. `patientService`
- **Rôle :** CRUD des patients (create, read, update, delete).
- **Protocole :** REST + Kafka
- **Fichier :** `patientService/app.js`
- **Test :** `POST http://localhost:3001/patients` via Postman

---

### 6. `gateway`
- **Rôle :** Point d’entrée sécurisé via Keycloak (REST + GraphQL).
- **Fichier :** `gateway/index.js`
- **Test GraphQL :** `POST http://localhost:4000/graphql`

---

##  Authentification (Keycloak)

- **Realm :** `medical-system`
- **Client :** `gateway-client`
- **Type :** confidentiel (JWT)
- **Utilisateur test :** `malek / malek123`
- **Protège :** `/alerts` (REST) et `/graphql`

---

##  Pages HTML

| Fichier         | Description                       | Technologies |
|----------------|-----------------------------------|--------------|
| `dashboard.html` | Vue globale + KPIs | GraphQL      |
| `alertes.html`   | Liste des alertes | GraphQL      |
| `patients.html`  | Liste des patients | REST         |

---

##  Tests recommandés pour la soutenance

| Fonction         | Test à effectuer                           | Outil        |
|------------------|--------------------------------------------|--------------|
| Ajouter un patient  | `POST /patients`                          | Postman      |
| Simulation capteur  | `node simulateSensorData.js`              | Console log  |
| Vérifier alerte     | Voir Kafka + `notificationService` logs  | Console      |
| Dashboard GraphQL   | Ouvrir `dashboard.html`                   | Navigateur   |
| Sécurité JWT        | Test accès REST & GraphQL avec token      | Postman      |

---

##  Lancement du projet (ordre conseillé)

1. **Zookeeper**
   ```bash
   zookeeper-server-start.bat ..\..\config\zookeeper.properties
   ```

2. **Kafka**
   ```bash
   kafka-server-start.bat ..\..\config\server.properties
   ```

3. **MongoDB** (local)

4. **Démarrer les services** dans cet ordre :
   ```bash
   node sensorService/simulateSensorData.js (optionnel)
   node alertService/alertMicroservice.js
   node alertDBService/app.js
   node patientService/app.js
   node notificationService/notificationService.js
   node gateway/index.js
   ```

---

##  Auteur
Malek Hattab – Projet SOA 2025 – Polytechnique Sousse
