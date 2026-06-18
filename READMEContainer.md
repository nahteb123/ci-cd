# Atelier - Conteneurisation Docker

## Présentation

Ce projet est une application React développée avec Vite.

L'objectif de cet atelier est de conteneuriser l'application afin de pouvoir l'exécuter dans un environnement reproductible à l'aide de Docker et Docker Compose.

---

## Technologies utilisées

* React
* Vite
* Docker
* Docker Compose
* Node.js 22 Alpine

---

## Choix techniques

### Image Docker

L'image utilisée est :

```dockerfile
FROM node:22-alpine
```

Cette image a été choisie car elle est légère et adaptée à l'exécution d'une application React/Vite.

### Docker Compose

Docker Compose permet de construire et lancer l'application avec une seule commande.

### Dockerignore

Le fichier `.dockerignore` permet d'exclure les fichiers inutiles du build :

* node_modules
* .git
* dist

Cela réduit la taille du contexte envoyé à Docker et améliore les performances du build.

---

## Dockerfile

Le Dockerfile a pour rôle de :

* définir l'image Node.js utilisée ;
* définir le répertoire de travail ;
* copier les dépendances du projet ;
* installer les packages npm ;
* copier le code source ;
* exposer le port 5173 ;
* lancer l'application avec Vite.

Dockerfile utilisé :

```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]
```

---

## Docker Compose

Le projet utilise Docker Compose afin de simplifier le lancement du conteneur.

Fichier compose.yaml :

```yaml
services:
  app:
    build: .
    container_name: ci-cd-app

    ports:
      - "5173:5173"

    volumes:
      - .:/app
      - /app/node_modules
```

---

## Configuration

Le projet utilise les fichiers suivants :

* `.env`
* `.env.example`

Le fichier `.env` contient les variables propres à l'environnement local et ne doit pas être versionné.

Le fichier `.env.example` permet de documenter les variables nécessaires au fonctionnement du projet.

Aucune donnée sensible ne doit être stockée dans le dépôt Git.

---

## Persistance des données

Cette application est un frontend React exécuté avec Vite.

Aucune base de données n'est utilisée.

Aucune donnée métier n'est stockée de manière persistante.

Aucune stratégie de persistance n'est donc nécessaire pour ce projet.

Les volumes présents dans Docker Compose sont utilisés uniquement pour le développement afin de synchroniser le code source entre la machine hôte et le conteneur.

---

## Réseau et exposition

Port publié :

* 5173

Service accessible depuis l'extérieur :

* Application React/Vite

Services internes :

* Aucun

Communication entre services :

* Aucune, car un seul service est utilisé.

L'application est accessible à l'adresse suivante :

```text
http://localhost:5173
```

---

## Construction et lancement

Construire et lancer le projet :

```bash
docker compose up --build
```

Arrêter le projet :

```bash
docker compose down
```

Accéder ensuite à :

```text
http://localhost:5173
```

---

## Structure du projet

```text
ci-cd-workshop
├── src
├── public
├── Dockerfile
├── compose.yaml
├── .dockerignore
├── .env.example
├── package.json
├── package-lock.json
└── README.md
```
