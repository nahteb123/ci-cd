# ci-cd

# CI/CD Workshop

## Description

Projet React réalisé pour mettre en pratique :

- Git
- GitHub
- les commits conventionnels
- le versionning sémantique
- les pull requests
- le travail collaboratif
- pre-commit

---

# Technologies

- React
- Vite
- JavaScript
- Git
- GitHub

---

# Fonctionnalités

- Formulaire de contact
- Header
- Footer

---

# Installation

## Cloner le projet

```bash
git clone <url-du-repo>
Aller dans le dossier
cd ci-cd-workshop
Installer les dépendances
npm install
Lancer le projet
npm run dev
Workflow Git

Le projet utilise les branches suivantes :

feature/*
→ dev
→ main
Exemple

Créer une branche feature :

git checkout -b feature/contact-form

Commit :

git commit -m "feat: create contact form"

Push :

git push -u origin feature/contact-form

Puis création d’une Pull Request vers dev.

Commits conventionnels

Exemples :

feat: create form
fix: resolve navbar bug
docs: update README
Versionning

Le projet utilise le Semantic Versioning.

Exemple :

v1.0.0
Pre-commit

Installation :

pip install pre-commit

Activation :

pre-commit install
Première release
git checkout main
git merge dev
git push origin main

Création du tag :

git tag v1.0.0
git push origin v1.0.0
