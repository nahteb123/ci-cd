````markdown
# CI/CD Workshop

## Description

Projet React réalisé dans le cadre d’un TP Git et CI/CD.

Le projet a pour objectif de mettre en pratique :

- les commits conventionnels
- le travail collaboratif
- les Pull Requests
- les branches Git
- le versionning sémantique
- pre-commit
- les bonnes pratiques Git

---

# Technologies utilisées

- React
- Vite
- JavaScript
- Git
- GitHub

---

# Fonctionnalités réalisées

## Mehdy

- création du formulaire de contact
- responsive design mobile et tablette

## Ethan

- création du header
- création du footer

---

# Structure des branches

Le projet utilise les branches suivantes :

```text
branche-mehdy
branche-ethan
dev
main
```

## Description

### branche-mehdy

Branche utilisée pour le développement du formulaire et du responsive design.

### branche-ethan

Branche utilisée pour le développement du header et du footer.

### dev

Branche de développement utilisée pour regrouper les fonctionnalités avant validation.

### main

Branche stable utilisée pour les releases finales.

---

# Workflow utilisé

## 1. Création d’une branche

```bash
git checkout -b branche-mehdy
```

## 2. Développement de la fonctionnalité

## 3. Ajout des fichiers

```bash
git add .
```

## 4. Commit conventionnel

```bash
git commit -m "feat: create contact form"
```

## 5. Push de la branche

```bash
git push -u origin branche-mehdy
```

## 6. Création d’une Pull Request vers `dev`

## 7. Review et merge dans `dev`

## 8. Merge final de `dev` vers `main`

---

# Commits conventionnels

Exemples utilisés :

```bash
feat: create contact form

style: improve responsive design

feat: create application header

feat: create application footer
```

---

# Versionning

Le projet utilise le Semantic Versioning.

Première version :

```text
v1.0.0
```

---

# Installation du projet

## Cloner le dépôt

```bash
git clone <url-du-repo>
```

## Aller dans le dossier

```bash
cd ci-cd-workshop
```

## Installer les dépendances

```bash
npm install
```

## Lancer le projet

```bash
npm run dev
```

---

# Pre-commit

Installation :

```bash
pip install pre-commit
```

Activation :

```bash
pre-commit install
```

---

# Release finale

```bash
git checkout main
git merge dev
git push origin main
```

Création du tag :

```bash
git tag v1.0.0
git push origin v1.0.0
```

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
