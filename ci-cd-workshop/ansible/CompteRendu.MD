# CI/CD Workshop - Déploiement d'une application conteneurisée avec Ansible

## Contexte

L'objectif de ce TP était de déployer une application conteneurisée sur une VM Debian 13 en utilisant Ansible et Docker.

---

## Structure du projet

```text
ansible/
├── inventory
├── playbook.yml
└── roles/
    └── deploy_app/
        ├── defaults/main.yml
        ├── tasks/main.yml
        └── vars/main.yml
```

---

## Inventory

```ini
[debian]
192.168.56.101 ansible_user=test ansible_become=true
```

---

## Playbook

```yaml
---
- name: Deploy application
  hosts: debian
  become: true

  roles:
    - deploy_app
```

---

## Test du playbook

Commande :

```bash
ansible-playbook -i inventory playbook.yml -k -K
```

Résultat :

```text
PLAY RECAP
192.168.56.101 : ok=2 changed=0 unreachable=0 failed=0
```

---

## Déploiement Docker

Construction de l'image :

```bash
sudo docker build -t ci-cd-web:latest .
```

Lancement du conteneur :

```bash
sudo docker run -d \
--name ci-cd-web \
-p 5173:5173 \
-e APP_ENV=development \
ci-cd-web:latest
```

Vérification :

```bash
sudo docker ps
```

---

## Moteur de conteneurs choisi

Docker a été choisi pour :

- sa simplicité
- sa documentation
- son utilisation répandue en entreprise

---

## Utilisation de shell / command

Aucun module `shell` ou `command` n'a été utilisé dans le rôle Ansible.

---

## Résultat final

Les éléments suivants ont été validés :

- Connexion SSH à la VM
- Communication Ansible
- Exécution du playbook
- Construction de l'image Docker
- Démarrage du conteneur
- Application accessible sur le port 5173

URL de test :

```text
http://192.168.56.101:5173
```

## Conclusion

L'application a été déployée avec succès sur la VM Debian 13 et est accessible via le navigateur.