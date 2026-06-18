# Helm chart: ci-cd-web

Ce chart Helm déploie l'application `ci-cd-workshop` en s'appuyant sur les templates présents dans `templates/`.

Principaux points:
- Paramètres exposés dans `values.yaml`: image, tag, replicaCount, resources, config, secret, ingress, namespace
- Templates: deployment, service, configmap, secret, ingress
- Helpers: `_helpers.tpl` pour générer un fullname réutilisable

Points d'attention obligatoires pour le rendu:

- Probes : le template `deployment.yaml` inclut des probes configurables via `values.yaml` (`pod.readinessProbe` et `pod.livenessProbe`). Activez/ajustez-les selon l'environnement.
- Resources : `values.yaml` contient `resources.requests` et `resources.limits`. Ajustez-les pour votre cluster (k3d local vs cloud).
- Secrets : par défaut `values.yaml` contient des valeurs d'exemple. Pour éviter de committer des secrets réels, utilisez un fichier `-f` local chiffré ou créez le Secret directement dans le cluster (`kubectl create secret generic ...`) et ne poussez pas les vraies valeurs dans Git.
- Résolution DNS : les services communiquent via le DNS interne Kubernetes, utilisez les noms des services (`{{ include "ci-cd-web.fullname" . }}`) pour les appels inter-composants.

Commandes utiles (à lancer localement):

- `helm lint k8s/helm/ci-cd-web`
- `helm template k8s/helm/ci-cd-web`
- `helm install mon-app k8s/helm/ci-cd-web -n cicd-workshop --create-namespace`
