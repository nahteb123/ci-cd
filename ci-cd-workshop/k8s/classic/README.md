# Kubernetes manifests (classic)

Contenu: manifests YAML pour déployer l'application `ci-cd-workshop` sans Helm.

Fichiers:

- `namespace.yaml` : namespace `cicd-workshop` isolé pour l'atelier
- `deployment.yaml` : Deployment de l'application (2 réplicas, probes, ressources)
- `service.yaml` : Service ClusterIP exposant le port 5173 en interne via le port 80
- `configmap.yaml` : Configuration non-sensible (APP_ENV, message)
- `secret.yaml` : Exemple de Secret pour données sensibles (API_KEY)
- `ingress.yaml` : Ingress Traefik pour exposer l'application sur `ci-cd.local`

Remarques et choix techniques:

- L'image utilisée dans `deployment.yaml` est `nahteb123/ci-cd-workshop:latest`. Remplacez-la par l'image que vous avez construite localement ou sur un registre accessible.
- L'application Vite écoute sur le port `5173` (voir `Dockerfile`), nous exposons donc ce port via le Service targetPort `5173`.
- Probes: readiness et liveness configurées avec `httpGet` sur `/`.
- Resources: requests/limits modestes adaptées à un cluster local (k3d).
- Secret: `stringData` contient un exemple `API_KEY`; en production, utilisez `kubectl create secret` ou un outil de vault.
- Ingress: host `ci-cd.local`. Pour tester localement avec k3d + Traefik, mappez `ci-cd.local` vers l'IP du cluster (ou utilisez `localhost` avec port-forward si vous préférez).

Points d'attention (justifications requises pour le rendu):

- Probes : le Deployment utilise `readinessProbe` et `livenessProbe` pour s'assurer que Kubernetes n'envoie du trafic qu'aux pods prêts et redémarre les pods qui seraient en erreur. Cela évite des erreurs utilisateurs si une instance est demarrée mais pas prête (ex: compilation/transpile initial de Vite en dev).
- Resources : `requests` et `limits` sont définis pour éviter la surconsommation d'un pod et pour permettre l'ordonnancement sur des noeuds avec ressources limitées (important pour un cluster k3d local). Elles doivent être raisonnables et testées.
- Secrets : Le fichier `secret.yaml` n'inclut pas de valeurs sensibles. Les données sensibles ne doivent jamais être codées en dur dans un Deployment ; utilisez `kubectl create secret` ou un gestionnaire de secrets. Le Deployment référence le Secret via `envFrom`.
- Résolution DNS interne : Kubernetes fournit la résolution DNS entre services via les noms de services (ex: `http://ci-cd-web` si on veut appeler le service depuis un autre pod). Assurez-vous d'utiliser les noms de services et non des IPs fixes pour la communication inter-composants.


Déploiement (exemples)

Option A — exécuter depuis la racine du dépôt (chemin relatif vers ce dossier) :

```bash
# depuis la racine du dépôt (adaptez si votre structure est différente)
kubectl apply -f ci-cd/ci-cd-workshop/k8s/classic/namespace.yaml
kubectl apply -f ci-cd/ci-cd-workshop/k8s/classic/ -n cicd-workshop
kubectl get all -n cicd-workshop
kubectl describe pod -n cicd-workshop $(kubectl get pod -n cicd-workshop -o name | head -n1)
kubectl logs -n cicd-workshop $(kubectl get pod -n cicd-workshop -o name | head -n1)
```

Option B — exécuter depuis le dossier `k8s/classic` (ce README se trouve déjà dans ce dossier) :

```bash
# positionnez-vous dans ci-cd/ci-cd-workshop/k8s/classic
kubectl apply -f namespace.yaml
kubectl apply -f . -n cicd-workshop
kubectl get all -n cicd-workshop
kubectl describe pod -n cicd-workshop $(kubectl get pod -n cicd-workshop -o name | head -n1)
kubectl logs -n cicd-workshop $(kubectl get pod -n cicd-workshop -o name | head -n1)
```

Tester l'accès:

- Via Ingress: ajouter `127.0.0.1 ci-cd.local` dans `/etc/hosts` et ouvrir `http://ci-cd.local` (si Traefik expose sur 80/443)
- Sinon, utiliser un port-forward local:

```bash
kubectl port-forward -n cicd-workshop svc/ci-cd-web 5173:80
# puis ouvrir http://localhost:5173
```
