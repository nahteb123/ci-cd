# Validation & déploiement — commandes utiles (classiques)

Ce document regroupe les commandes et étapes pour préparer, déployer et valider l'application sur un cluster Kubernetes local (k3d) en utilisant les manifests "classiques" (Étape 1). Il contient aussi les commandes Helm (Étape 2) pour la suite.

Prérequis d'installation:
- Docker (pour builder l'image)
- k3d (ou un cluster Kubernetes accessible via `kubectl`)
- kubectl
- Helm 

## 1) Manifestes Kubernetes classiques

### 1.a) Présentation des manifestes

Cette première partie regroupe les manifestes Kubernetes « classiques » utilisés pour déployer l'application en local. L'objectif est d'avoir un jeu de fichiers YAML simple, explicite et reproduisible : Namespace, Secret, ConfigMap, Deployment, Service et Ingress. Ces fichiers sont intentionnellement non-templatisés (fichiers statiques) afin d'être lisibles et faciles à expliquer pendant l'atelier.

#### Structure des manifestes
Les manifests se trouvent sous `k8s/classic/` et couvrent :

- namespace.yaml — isole les ressources du workshop
- secret.yaml — secrets locaux (non committés)
- configmap.yaml — configuration non sensible
- deployment.yaml — définition du pod/containers, probes, ressources
- service.yaml — exposer l'application dans le cluster (ClusterIP)
- ingress.yaml — routage HTTP (optionnel, selon contrôleur)

#### Paramètres et conventions
Les fichiers utilisent des labels et annotations cohérents (ex. `app: ci-cd-web`) pour faciliter les sélections `kubectl -l`. Les ports et l'image sont fixés dans les manifests pour éviter des substitutions manuelles pendant l'introduction. Pour l'itération locale, nous recommandons d'utiliser le workflow retag + import dans k3d (voir section préparation) afin d'éviter des pushes vers un registre distant.

#### Validation des manifests
Avant d'appliquer les manifests, on peut effectuer une vérification syntaxique rapide :

```bash
kubectl apply --dry-run=client -f ./k8s/classic/
```

Pour générer une vue consolidée des ressources que vous allez créer :

```bash
kubectl kustomize ./k8s/classic/ || true
```

Ces commandes aident à détecter les erreurs YAML et les champs manquants sans toucher au cluster.

#### Ressources déployées
Les manifests déploient les mêmes objets que le chart Helm (ConfigMap, Secret, Service, Deployment, Ingress). L'intérêt principal des manifests « classiques » est la transparence : chaque champ est visible et immédiatement compréhensible.

#### Intérêt pédagogique
Utiliser des manifests statiques facilite l'enseignement des concepts Kubernetes (namespaces, probes, services, ingress) avant d'introduire la notion de templating et de packaging avec Helm.

---

### 1.b) Configuration manifestes Kubernetes

Pour simplifier le workshop nous utilisons la méthode suivante : retagger votre build local puis importer l'image dans le cluster k3d.

```bash
# depuis ~/ci-cd/ci-cd/ci-cd-workshop
# build local (si pas déjà fait)
docker build -t ci-cd-workshop:dev -f Dockerfile .

# retag pour correspondre au Deployment attendu (si nécessaire)
docker tag ci-cd-workshop:dev nahteb123/ci-cd-workshop:latest

#  importer l'image dans le cluster k3d 
k3d image import -c workshop nahteb123/ci-cd-workshop:latest

# 4) forcer le restart pour que les pods utilisent l'image importée
kubectl rollout restart deployment/ci-cd-web -n cicd-workshop
kubectl get pods -n cicd-workshop -w
```


Namespace (isoler les ressources du workshop — créer le namespace avant d'ajouter des objets dans ce namespace)

```bash
kubectl get namespace cicd-workshop || kubectl apply -f ./k8s/classic/namespace.yaml
```

Secret (valeurs sensibles — stocker localement pour l'exécution et ne pas committer)

```bash
kubectl create secret generic cicd-web-secret \
  --from-literal=API_KEY="ma_cle_secrete_de_test" \
  -n cicd-workshop
```

ConfigMap (configuration non sensible ; recréez-le si vous modifiez les valeurs)

```bash
kubectl create configmap cicd-web-config \
  --from-literal=APP_ENV=development \
  --from-literal=WELCOME_MESSAGE="Bienvenue" \
  -n cicd-workshop
```

---

### 1.b) Verification des manifestes Kubernete

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

# Conclusion — manifestes classiques

Les manifestes Kubernetes fournis dans `k8s/classic/` ont été conçus pour être pédagogiques, transparents et directement applicables en local. Ils permettent une validation simple via `kubectl apply`, des vérifications rapides avec `kubectl get`/`kubectl describe` et une itération efficace en combinant le workflow build → retag → `k3d image import`. Ce jeu de fichiers est idéal pour comprendre les objets Kubernetes de base (Namespace, Deployment, Service, ConfigMap, Secret, Ingress) avant d'introduire le templating et le packaging que propose Helm.

Si vous souhaitez passer à une approche paramétrable et réutilisable, la section suivante présente le chart Helm et les commandes de validation associées.

---

## 2) Chart Helm

### 2.a) Étape 2 – Helm

L'objectif de cette étape était de transformer les manifestes Kubernetes de l'étape 1 en un chart Helm réutilisable et configurable.

#### Structure du chart
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

#### Paramètres configurables
Le fichier values.yaml permet de modifier :

- le namespace
- le nombre de réplicas
- l'image Docker et son tag
- les ports du service
- l'Ingress (host, path)
- les ressources CPU/Mémoire
- les variables de configuration

#### Templating
Les valeurs fixes ont été remplacées par des variables Helm :

```
{{ .Values.namespace }}
{{ .Values.replicaCount }}
{{ .Values.image.repository }}
{{ .Values.image.tag }}
{{ .Values.ingress.host }}
```

Cette approche permet de modifier le déploiement sans changer les fichiers YAML.

#### Validation du chart
Le chart a été validé avec :

```bash
helm lint .
helm template .
```

Résultat :

```
1 chart linted, 0 failed
```

génération correcte des manifestes Kubernetes

#### Ressources générées
Le chart déploie :

- ConfigMap
- Secret
- Service
- Deployment
- Ingress

#### Intérêt de Helm
Helm permet de centraliser la configuration dans values.yaml, de réutiliser facilement le déploiement et de simplifier les mises à jour via helm upgrade.

### 2.b) Configuration Helm:

```bash
helm version
```

Résultat :

```
v4.2.2
```

Vérification du chart :

```bash
helm lint .
```

Résultat :

```
1 chart(s) linted, 0 chart(s) failed
```

Génération des manifestes Kubernetes :

```bash
helm template .
```

Cette commande a permis de générer correctement les ressources Kubernetes du chart.

Tests de paramétrage
Modification du nombre de réplicas :

```bash
helm template . --set replicaCount=3
```

Résultat observé :

```
replicas: 3
```

Désactivation de l'Ingress :

```bash
helm template . --set ingress.enabled=false
```

Résultat observé :

```
l'objet Ingress n'est plus généré.
```

# Conclusion — Helm

Le chart Helm a été validé avec les commandes helm lint et helm template. Les tests effectués montrent que le paramétrage via values.yaml fonctionne correctement et que certaines valeurs peuvent être modifiées dynamiquement grâce à l'option --set.



