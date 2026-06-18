# Validation & déploiement — commandes utiles (classiques)

Ce document regroupe les commandes et étapes pour préparer, déployer et valider l'application sur un cluster Kubernetes local (k3d) en utilisant les manifests "classiques" (Étape 1). Il contient aussi les commandes Helm (Étape 2) pour la suite.

Prérequis d'installation:
- Docker (pour builder l'image)
- k3d (ou un cluster Kubernetes accessible via `kubectl`)
- kubectl
- Helm 

Résumé rapide de l'application:
- Type : Single Page App (React) servie par Vite.
- Port exposé dans le container : 5173

Architecture et flux (schéma simplifié)

Local dev
  └─ docker build -> image locale (ci-cd-workshop:dev)
     └─ retag -> nahteb123/ci-cd-workshop:latest
       └─ import -> k3d nodes
                  └─ Namespace cicd-workshop
                      ├─ Deployment ci-cd-web (pod -> port 5173)
                      ├─ Service ci-cd-web (ClusterIP, port 80 -> pod:5173)
                      └─ Ingress ci-cd-web-ingress (host: ci-cd.local)

---

Choix techniques (raisonnement)
- Objets Kubernetes utilisés : Namespace, Deployment, Service (ClusterIP), ConfigMap, Secret, Ingress.
- Probes : readiness & liveness configurées pour éviter le routage vers des pods non prêts.
-- Resources : requests/limits définis pour stabilité et pour des exécutions locales.
- Secrets : non committés — créer localement avec `kubectl create secret`.
- Image handling : pour tests locaux on préfère importer l'image dans k3d (pas besoin de push public).
- Helm chart : fourni dans `k8s/helm/ci-cd-web` avec valeurs configurables (image, replicas, resources, ingress).

---


A) Préparation — retag + import (workflow unique recommandé pour tests locaux)

Pour simplifier le workshop nous utilisons la méthode suivante : retagger votre build local puis importer l'image dans le cluster k3d.

```bash
# depuis ~/ci-cd/ci-cd/ci-cd-workshop
# 1) build local (si pas déjà fait)
docker build -t ci-cd-workshop:dev -f Dockerfile .

# 2) retag pour correspondre au Deployment attendu (si nécessaire)
docker tag ci-cd-workshop:dev nahteb123/ci-cd-workshop:latest

# 3) importer l'image dans le cluster k3d (remplace 'workshop' par ton nom de cluster)
k3d image import -c workshop nahteb123/ci-cd-workshop:latest

# 4) forcer le restart pour que les pods utilisent l'image importée
kubectl rollout restart deployment/ci-cd-web -n cicd-workshop
kubectl get pods -n cicd-workshop -w
```


Créer le namespace (isoler les ressources du workshop — obligatoire avant de créer des objets dans ce namespace)

```bash
kubectl get namespace cicd-workshop || kubectl apply -f ./k8s/classic/namespace.yaml
```

Créer le Secret localement (stockez ici les valeurs sensibles uniquement pour l'exécution locale — ne committez jamais ces données)

```bash
kubectl create secret generic cicd-web-secret \
  --from-literal=API_KEY="ma_cle_secrete_de_test" \
  -n cicd-workshop
```

Créer / mettre à jour le ConfigMap (utilisé pour la configuration non sensible ; recréez-le à chaque itération si vous changez les valeurs)

```bash
kubectl create configmap cicd-web-config \
  --from-literal=APP_ENV=development \
  --from-literal=WELCOME_MESSAGE="Bienvenue" \
  -n cicd-workshop
```

---

B) Validation Étape 1 — manifests Kubernetes classiques

Cette section détaille les commandes minimales pour appliquer et vérifier les manifests Kubernetes fournis dans `k8s/classic/`. Nous partons de l'hypothèse que vous travaillez depuis le répertoire `~/ci-cd/ci-cd/ci-cd-workshop` afin que les chemins relatifs fonctionnent directement. Appliquez d'abord le namespace (si nécessaire), puis les manifests de l'application dans ce namespace :

```bash
# depuis ~/ci-cd/ci-cd/ci-cd-workshop
kubectl apply -f ./k8s/classic/namespace.yaml
kubectl apply -f ./k8s/classic/ -n cicd-workshop
```

Une fois les manifests appliqués, vérifiez que les ressources ont bien été créées et que l'Ingress (si présent) est configuré correctement. Ces commandes montrent l'état des pods, ReplicaSets, services et endpoints, et permettent de repérer rapidement les erreurs visibles au niveau des objets Kubernetes :

```bash
kubectl get all -n cicd-workshop
kubectl get ingress -n cicd-workshop
```

Si un pod ne démarre pas comme attendu, collectez les informations de diagnostic de base : `kubectl describe` fournit les events et la raison d'échec au niveau de l'objet, tandis que `kubectl logs` montre la sortie de l'application et aide à identifier les erreurs d'exécution. Le bloc ci-dessous récupère le premier pod correspondant à l'étiquette `app=ci-cd-web` puis affiche ces informations :

```bash
POD=$(kubectl get pod -n cicd-workshop -l app=ci-cd-web -o name | head -n1)
kubectl describe $POD -n cicd-workshop
kubectl logs $POD -n cicd-workshop
kubectl logs --previous $POD -n cicd-workshop || true
```

Pour accéder à l'application depuis votre poste, deux options simples :

- Via port-forward (méthode rapide et locale) : ce tunnel mappe le port du Service exposé dans le cluster vers votre machine, pratique pour valider rapidement sans config réseau additionnelle.

```bash
kubectl port-forward -n cicd-workshop svc/ci-cd-web 5173:80
# puis ouvrir http://localhost:5173
```

- Via Ingress (si vous avez configuré un contrôleur d'Ingress et ajouté une entrée DNS/hosts) : modifiez `/etc/hosts` pour résoudre l'hôte choisi vers `127.0.0.1`, puis ouvrez l'URL configurée (ex. `http://ci-cd.local`). L'accès par Ingress reflète le comportement attendu en environnement plus proche d'une plateforme partagée.

---


C) Validation Étape 2 — chart Helm 

Note : pour l'exécution finale nous utilisons le chart Helm — l'étape 2 est considérée requise et permet de paramétrer proprement l'image, le scaling et l'ingress.

```bash
# depuis ~/ci-cd/ci-cd/ci-cd-workshop
helm lint ./k8s/helm/ci-cd-web
helm template ./k8s/helm/ci-cd-web

# installer / upgrade
helm upgrade --install mon-app ./k8s/helm/ci-cd-web -n cicd-workshop --create-namespace \
  --set image.repository=ci-cd-workshop --set image.tag=dev --set image.pullPolicy=IfNotPresent

# vérifier
kubectl get all -n cicd-workshop
```

---

D) Débogage & nettoyage

Lister events récents (utile pour erreurs scheduling ou probes):

```bash
kubectl get events -n cicd-workshop --sort-by=.metadata.creationTimestamp
```

Supprimer le namespace (nettoyage complet) :

```bash
kubectl delete namespace cicd-workshop
```

Désinstaller la release Helm :

```bash
helm uninstall mon-app -n cicd-workshop
```

---

Notes rapides
- Si `k3d image import` retourne `No nodes found`: vérifier `k3d cluster list` et recréer le cluster si besoin.
- Si `ErrImagePull` : vérifier le tag et importer l'image locale dans le cluster (via `k3d image import`).
- Si pods crashent (OOM, erreur d'app) : `kubectl logs` / `kubectl describe pod` pour la cause.

---

Fichier principal pour la validation : `k8s/classic/` (manifests) et `k8s/helm/ci-cd-web/` pour le chart.
