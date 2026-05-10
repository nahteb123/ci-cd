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
Description
branche-mehdy

Branche utilisée pour le développement du formulaire de contact.

branche-ethan

Branche utilisée pour le développement du header et du footer.

dev

Branche de développement utilisée pour regrouper les fonctionnalités avant validation.

main

Branche stable utilisée pour les releases finales.

Workflow utilisé
1. Création d’une branche

Exemple :

git checkout -b branche-mehdy
2. Développement de la fonctionnalité
3. Ajout des fichiers
git add .
4. Commit conventionnel
git commit -m "feat: create contact form"
5. Push de la branche
git push -u origin branche-mehdy
6. Création d’une Pull Request vers dev
7. Review et merge dans dev
8. Merge final de dev vers main
Commits conventionnels

Exemples utilisés :

feat: create contact form

feat: create application header

feat: create application footer
Versionning

Le projet utilise le Semantic Versioning.

Première version :

v1.0.0
Installation du projet
Cloner le dépôt
git clone <url-du-repo>
Aller dans le dossier
cd ci-cd-workshop
Installer les dépendances
npm install
Lancer le projet
npm run dev
Pre-commit

Installation :

pip install pre-commit

Activation :

pre-commit install
Release finale
git checkout main
git merge dev
git push origin main

Création du tag :

git tag v1.0.0
git push origin v1.0.0
