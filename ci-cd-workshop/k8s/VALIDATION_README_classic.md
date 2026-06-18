# Validation & déploiement — commandes utiles

Ce fichier rassemble les commandes et étapes pour préparer, déployer et valider l'application sur un cluster Kubernetes local (k3d) : manifests Kubernetes "classiques" (Étape 1) et chart Helm (Étape 2).

Prérequis
- k3d ou un autre cluster Kubernetes local (kubectl configuré)
- Docker installé pour builder l'image
- Helm installé pour l'étape 2 (chart)

Démarrer Docker (si nécessaire)

Sur Linux (systemd) :

```bash
# démarrer le daemon Docker
sudo systemctl start docker
# vérifier le statut
sudo systemctl status docker --no-pager
```

Si votre système n'utilise pas systemd :

```bash
sudo service docker start
```

Si vous utilisez Docker Desktop (Windows/Mac ou Linux avec Docker Desktop), lancez l'application Docker Desktop avant de continuer.

--------------------------------------------------------------------------------
A) Préparation — construire l'image et créer les secrets/configmap
--------------------------------------------------------------------------------

Option 1 — builder et pousser sur un registre (ex: Docker Hub)

```bash
# Si vous êtes dans ~/ci-cd/ci-cd/ci-cd-workshop (répertoire courant) :
docker build -t YOUR_DOCKERHUB_USER/ci-cd-workshop:dev -f Dockerfile .
docker push YOUR_DOCKERHUB_USER/ci-cd-workshop:dev
# Ou, depuis la racine du dépôt :
# docker build -t YOUR_DOCKERHUB_USER/ci-cd-workshop:dev -f ci-cd/ci-cd-workshop/Dockerfile ci-cd/ci-cd-workshop
# puis mettez l'image dans k8s/classic/deployment.yaml ou dans le chart values

Option 1b — retag + import (si tu veux éviter de pousser sur Docker Hub)

```bash
# Si tu as une image locale (ex: ci-cd-workshop:dev) et que le Deployment attend nahteb123/ci-cd-workshop:latest
docker images | grep -E 'ci-cd-workshop|nahteb123/ci-cd-workshop' || true
docker tag ci-cd-workshop:dev nahteb123/ci-cd-workshop:latest
# importer dans k3d (remplace 'workshop' par le nom de ton cluster si besoin)
k3d image import -c workshop nahteb123/ci-cd-workshop:latest
# redémarrer pour que les pods récupèrent l'image importée
kubectl rollout restart deployment/ci-cd-web -n cicd-workshop
kubectl get pods -n cicd-workshop -w
```
```

Option 2 — workflow local avec k3d (recommandé pour tests locaux)

```bash
# Si vous êtes dans ~/ci-cd/ci-cd/ci-cd-workshop (répertoire courant) :
docker build -t ci-cd-workshop:dev -f Dockerfile .
# importer dans le cluster k3d (remplacez 'workshop' par le nom retourné par `k3d cluster list`)
k3d image import -c workshop ci-cd-workshop:dev
# utiliser l'image 'ci-cd-workshop:dev' dans le Deployment/values.yaml

# Ou, depuis la racine du dépôt :
# docker build -t ci-cd-workshop:dev -f ci-cd/ci-cd-workshop/Dockerfile ci-cd/ci-cd-workshop
# k3d image import -c workshop ci-cd-workshop:dev

### Option (retag + import) — utiliser une image locale et l'importer dans k3d (rapide)

Si tu as déjà buildé une image locale (par ex. `ci-cd-workshop:dev`) et que ton `Deployment` attend `nahteb123/ci-cd-workshop:latest`, tu peux simplement retagger et importer l'image dans k3d sans pousser sur Docker Hub :

```bash
# vérifier les images locales
docker images | grep -E 'ci-cd-workshop|nahteb123/ci-cd-workshop' || true

# retagger si nécessaire (si ton build local s'appelle ci-cd-workshop:dev)
docker tag ci-cd-workshop:dev nahteb123/ci-cd-workshop:latest

# vérifier le nom du cluster k3d (remplacez 'workshop' si besoin)
k3d cluster list

# importer l'image dans le cluster (remplace 'workshop' par le nom exact)
k3d image import -c workshop nahteb123/ci-cd-workshop:latest

# forcer le redémarrage des pods pour qu'ils utilisent l'image importée
kubectl rollout restart deployment/ci-cd-web -n cicd-workshop
kubectl get pods -n cicd-workshop -w
```

Note : si ton cluster a un autre nom que `workshop`, remplace `-c workshop` par le nom correct retourné par `k3d cluster list`. Cette méthode évite le push vers un registre et est idéale pour tests locaux.
```

### Dépannage k3d — `No nodes found` lors de `k3d image import`

Si `k3d image import` retourne `No nodes found for given cluster`, cela signifie que le cluster référencé n'a pas de nœuds prêts. Suivez ces étapes depuis votre répertoire courant pour diagnostiquer et corriger :

```bash
# 1) Voir la liste des clusters k3d et leur état
k3d cluster list

# 2) Vérifier les nodes vus par kubectl
kubectl get nodes

# Si aucun cluster n'existe ou si le cluster listé n'a pas de nodes, supprimez le cluster corrompu (s'il existe)
# Remplacez <CLUSTER_NAME> par le nom retourné par `k3d cluster list` (ex: k3d-default)
k3d cluster delete <CLUSTER_NAME>  # si besoin

# 3) Créer un nouveau cluster (ex: 'workshop') et exposer 80/443 pour Traefik
k3d cluster create workshop --wait -p "80:80@loadbalancer" -p "443:443@loadbalancer"

# 4) Vérifier que le cluster est opérationnel
k3d cluster list
kubectl get nodes

# 5) Réessayer l'import de l'image (utilisez le nom du cluster affiché par k3d cluster list)
k3d image import -c workshop ci-cd-workshop:dev
```

Notes :
- Si vous préférez ne pas recréer un cluster, utilisez l'option de push vers Docker Hub et laissez le cluster pull l'image (voir la section Option 1).
- L'option `--wait` fait que la commande attend que le cluster soit prêt avant de revenir.


Créer le namespace (optionnel, apply le fera aussi). IMPORTANT : créez ou appliquez le namespace AVANT de créer le Secret sinon vous aurez l'erreur "namespaces \"cicd-workshop\" not found".

```bash
# vérifie si le namespace existe, sinon applique le manifest existant
kubectl get namespace cicd-workshop || kubectl apply -f ./k8s/classic/namespace.yaml

# ou, création explicite rapide
# kubectl create namespace cicd-workshop
```

Créer le Secret localement (NE PAS versionner les vraies valeurs) :

```bash
# maintenant que le namespace existe
kubectl create secret generic cicd-web-secret \
  --from-literal=API_KEY="ma_cle_secrete_de_test" \
  -n cicd-workshop
```

Si vous obtenez encore `namespaces "cicd-workshop" not found`, exécutez :

```bash
kubectl get namespace
kubectl apply -f ./k8s/classic/namespace.yaml
```

Créer/mettre à jour le ConfigMap (optionnel) :

```bash
kubectl create configmap cicd-web-config \
  --from-literal=APP_ENV=development \
  --from-literal=WELCOME_MESSAGE="Bienvenue" \
  -n cicd-workshop
```

--------------------------------------------------------------------------------
B) Validation Étape 1 — manifests Kubernetes classiques
--------------------------------------------------------------------------------

Appliquer les manifests (Option A si tu es à la racine du dépôt, Option B si tu es dans `~/ci-cd/ci-cd/ci-cd-workshop`)

Option A - depuis la racine du dépôt :

```bash
# depuis la racine du dépôt (copiable depuis /home/nahteb/ci-cd)
kubectl apply -f ci-cd/ci-cd-workshop/k8s/classic/namespace.yaml
kubectl apply -f ci-cd/ci-cd-workshop/k8s/classic/ -n cicd-workshop
```

Option B - depuis ton répertoire courant `~/ci-cd/ci-cd/ci-cd-workshop` :

```bash
# si tu es dans ~/ci-cd/ci-cd/ci-cd-workshop (RECOMMANDÉ pour copier-coller)
kubectl apply -f ./k8s/classic/namespace.yaml
kubectl apply -f ./k8s/classic/ -n cicd-workshop
```

Note importante : évite d'utiliser des chemins qui commencent par `/` (chemin absolu) quand tu es déjà dans le répertoire du projet — par exemple `kubectl apply -f /k8s/classic/` recherchera `/k8s` à la racine du système de fichiers et provoquera une erreur "no such file or directory". Utilise `./k8s/classic/` ou le chemin relatif depuis la racine du dépôt.

Afficher les ressources et l'Ingress :

```bash
kubectl get all -n cicd-workshop
kubectl get ingress -n cicd-workshop
```

Débogage pod (récupérer le nom, décrire, logs) :

```bash
POD=$(kubectl get pod -n cicd-workshop -l app=ci-cd-web -o name | head -n1)
kubectl describe $POD -n cicd-workshop
kubectl logs $POD -n cicd-workshop
```

Tester l'accès à l'application :

- Via Ingress (si Traefik et host configuré) :
  - Ajouter `127.0.0.1 ci-cd.local` dans `/etc/hosts`
  - Ouvrir `http://ci-cd.local` dans le navigateur

- Ou via port-forward (si pas d'Ingress):

```bash
kubectl port-forward -n cicd-workshop svc/ci-cd-web 5173:80
# puis ouvrir http://localhost:5173
```

Tester la communication intra-cluster (depuis un pod) :

```bash
kubectl run -it --rm --restart=Never curlpod --image=curlimages/curl -n cicd-workshop -- sh
# dans le pod
curl http://ci-cd-web:80/
```
