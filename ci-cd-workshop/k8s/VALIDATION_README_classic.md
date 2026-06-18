# Validation & déploiement — commandes utiles (classiques)

Ce document regroupe les commandes et étapes pour préparer, déployer et valider l'application sur un cluster Kubernetes local (k3d) en utilisant les manifests "classiques" (Étape 1). Il contient aussi les commandes Helm (Étape 2) pour la suite.

## 2) Chart Helm

### Étape 2 – Helm

L'objectif de cette étape était de transformer les manifestes Kubernetes de l'étape 1 en un chart Helm réutilisable et configurable.

### Structure

```
k8s/helm/ci-cd-web/
├── Chart.yaml
├── values.yaml
└── templates/
  ├── _helpers.tpl
  ├── configmap.yaml
  ├── deployment.yaml
  ├── ingress.yaml
  ├── secret.yaml
  └── service.yaml
```

### Paramètres configurables

Le fichier `values.yaml` permet de modifier :

- le namespace
- le nombre de réplicas
- l'image Docker et son tag
- les ports du service
- l'Ingress (host, path)
- les ressources CPU/Mémoire
- les variables de configuration

### Templating

Les valeurs fixes ont été remplacées par des variables Helm, par exemple :

```
{{ .Values.namespace }}
{{ .Values.replicaCount }}
{{ .Values.image.repository }}
{{ .Values.image.tag }}
{{ .Values.ingress.host }}
```

Cette approche permet de modifier le déploiement sans changer les fichiers YAML.

### Validation

Le chart a été validé avec :

```bash
helm lint .
helm template .
```

Résultat :

- `1 chart linted, 0 failed`
- génération correcte des manifestes Kubernetes

### Ressources générées

Le chart déploie :

- ConfigMap
- Secret
- Service
- Deployment
- Ingress

### Intérêt de Helm

Helm permet de centraliser la configuration dans `values.yaml`, de réutiliser facilement le déploiement et de simplifier les mises à jour via `helm upgrade`.

---

### Validation réalisée (exemples)

Vérification de l'installation de Helm :

```bash
helm version
```

Résultat attendu :

```
v4.2.2
```

Vérification du chart :

```bash
helm lint .
```

Résultat attendu :

```
1 chart(s) linted, 0 chart(s) failed
```

Génération des manifestes Kubernetes :

```bash
helm template .
```

Cette commande génère les ressources Kubernetes localement et permet d'inspecter le résultat sans déployer.

#### Tests de paramétrage

Modifier le nombre de réplicas :

```bash
helm template . --set replicaCount=3
```

Résultat observé (extrait) :

```
replicas: 3
```

Désactiver l'Ingress :

```bash
helm template . --set ingress.enabled=false
```

Résultat observé :

```
l'objet Ingress n'est plus généré
```

### Conclusion

Le chart Helm a été validé avec `helm lint` et `helm template`. Les tests montrent que le paramétrage via `values.yaml` et l'option `--set` fonctionne correctement, ce qui rend le chart flexible pour différentes cibles (local, staging, production).

ConfigMap (configuration non sensible ; recréez-le si vous modifiez les valeurs)

```bash
kubectl create configmap cicd-web-config \
  --from-literal=APP_ENV=development \
  --from-literal=WELCOME_MESSAGE="Bienvenue" \
  -n cicd-workshop
```

---

### 1.b) Validation Étape 1 — manifests Kubernetes classiques

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

## 2) Chart Helm



