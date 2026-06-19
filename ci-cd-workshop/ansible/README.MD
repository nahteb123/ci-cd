# Résumé du TP

## 1. Vérification de la connexion SSH

Connexion à la VM Debian :

```bash
ssh test@192.168.56.101
```

Vérification de l'adresse IP :

```bash
hostname -I
```

Résultat :

```text
192.168.56.101
```

---

## 2. Vérification de Docker

```bash
docker --version
```

```bash
sudo systemctl status docker
```

Résultat :

```text
Docker actif et fonctionnel
```

---

## 3. Installation et vérification d'Ansible

### Windows (WSL)

```bash
sudo apt update
sudo apt install ansible -y
```

### Vérification

```bash
ansible --version
```

```bash
ansible-playbook --version
```

---

## 4. Création de la structure Ansible

```text
ansible/
├── inventory
├── playbook.yml
└── roles/
    └── deploy_app/
        ├── defaults/
        │   └── main.yml
        ├── tasks/
        │   └── main.yml
        └── vars/
            └── main.yml
```

---

## 5. Configuration de l'inventory

```ini
[debian]
192.168.56.101 ansible_user=test ansible_become=true
```

---

## 6. Création du playbook

```yaml
---
- name: Deploy application
  hosts: debian
  become: true

  roles:
    - deploy_app
```

---

## 7. Création du rôle

### defaults/main.yml

```yaml
app_image: ci-cd-web:latest

app_container_name: ci-cd-web

app_host_port: 5173
app_container_port: 5173

app_env:
  APP_ENV: development
```

### tasks/main.yml

```yaml
---
- name: Test role deploy_app
  debug:
    msg: "Role deploy_app chargé avec succès"
```

---

## 8. Validation Ansible

### Vérification de l'inventory

```bash
ansible-inventory -i inventory --list
```

### Test de communication

```bash
ansible -i inventory debian -m ping -k -K
```

Résultat :

```text
SUCCESS
ping: pong
```

### Exécution du playbook

```bash
ansible-playbook -i inventory playbook.yml -k -K
```

Résultat :

```text
Role deploy_app chargé avec succès
```

---

## 9. Copie du projet sur la VM

Depuis WSL :

```bash
scp -r ci-cd-workshop test@192.168.56.101:/home/test/
```

---

## 10. Résolution du problème réseau

Diagnostic :

```bash
ping 8.8.8.8
```

```bash
ip route
```

```bash
cat /etc/resolv.conf
```

Configuration DNS :

```text
nameserver 8.8.8.8
nameserver 1.1.1.1
```

Après correction :

```bash
ping 8.8.8.8
```

Résultat :

```text
Connexion Internet fonctionnelle
```

---

## 11. Construction de l'image Docker

Connexion à la VM :

```bash
ssh test@192.168.56.101
```

Positionnement dans le projet :

```bash
cd /home/test/ci-cd-workshop
```

Construction :

```bash
sudo docker build -t ci-cd-web:latest .
```

Résultat :

```text
naming to docker.io/library/ci-cd-web:latest
```

Vérification :

```bash
sudo docker images
```

Résultat :

```text
ci-cd-web latest
```

---

## 12. Lancement du conteneur

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

Résultat :

```text
ci-cd-web
Up
0.0.0.0:5173->5173/tcp
```

---

## 13. Vérification de l'application

Logs :

```bash
sudo docker logs ci-cd-web
```

Résultat :

```text
VITE ready
```

Accès navigateur :

```text
http://192.168.56.101:5173
```

Résultat :

```text
Application CI-CD accessible
```

---

# Résultat final

Les éléments suivants ont été validés :

- VM Debian accessible en SSH
- Docker fonctionnel
- Ansible fonctionnel
- Inventory valide
- Playbook valide
- Rôle deploy_app exécuté
- Projet transféré sur la VM
- Image Docker construite
- Conteneur démarré
- Port 5173 exposé
- Application accessible via navigateur

## Conclusion

Le déploiement de l'application conteneurisée a été réalisé avec succès sur la VM Debian 13.

L'application est accessible sur le port 5173 et les tests Ansible ainsi que Docker ont été validés.