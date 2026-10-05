# rh_spring_react_node

Application de gestion des Ressources Humaines (DGRAD) — backend **Spring Boot**, frontend **React / Vite**, pont scanner **Node / NAPS2**.

## Structure du projet

- `backend/` : API REST Spring Boot (Java 21, SQL Server, JWT).
- `rh-app/` : Frontend React + TypeScript + Vite + Tailwind.
- `scanner-server/` : pont local Node/Express pour scanner via NAPS2.

## Démarrage

### 1. Backend (Spring Boot)

```bash
cd backend
# Copier la configuration exemple puis renseigner la BD / le secret JWT
cp src/main/resources/application.properties.example src/main/resources/application.properties
./mvnw spring-boot:run
```

### 2. Frontend (React / Vite)

```bash
cd rh-app
cp .env.example .env
npm install
npm run dev
```

### 3. Pont scanner (NAPS2)

```bash
cd scanner-server
cp .env.example .env   # renseigner NAPS2_PATH
npm install
npm start
```

## Configuration

Les fichiers sensibles ne sont **pas** versionnés :

- `backend/src/main/resources/application.properties` (identifiants BD + secret JWT)
- `rh-app/.env` et `scanner-server/.env`

Utilisez les fichiers `.example` fournis comme modèles.
