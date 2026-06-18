# k8s manifests & Helm chart — Explications (Étape 1 & 2)

Ce document rassemble les explications des fichiers fournis pour l'étape 1 (manifests Kubernetes classiques) et l'étape 2 (chart Helm). Il est destiné à t'aider lors du rendu et de la démonstration.

## Structure fournie

- k8s/classic/ : manifests Kubernetes "classiques" (un objet par fichier)
- k8s/helm/ci-cd-web/ : chart Helm dérivé des manifests (templates + values)

---

## Étape 1 — Manifests Kubernetes (k8s/classic)

Fichiers et utilité :


Points d'attention et justification des choix :

 Points d'attention (à inclure dans votre README / justification pour le rendu) :

- Probes : utilisez `readinessProbe` et `livenessProbe` pour chaque Deployment pertinent. Elles garantissent qu'un pod ne reçoit pas de trafic tant qu'il n'est pas prêt et permettent au kubelet de redémarrer un container en erreur.
- Resources : définissez `requests` et `limits` cohérents pour vos pods. `requests` aide le scheduler à placer le pod, `limits` protège le noeud/les autres workloads.
- Secrets : ne codez jamais en dur une donnée sensible dans un Deployment. Injectez via Secret (créé localement avec `kubectl create secret` ou via un secret manager) et référencez-le dans le Deployment.
- Résolution DNS entre services : utilisez les noms des Services Kubernetes pour la communication inter-composants (ex: `http://mon-service` ou `http://mon-service.namespace.svc.cluster.local` si nécessaire).

---

## Étape 2 — Chart Helm (k8s/helm/ci-cd-web)

Arborescence :

- `Chart.yaml` : métadonnées du chart (nom/version/appVersion)
- `values.yaml` : paramètres exposés (image, replicas, resources, config, secret, ingress, namespace, probes)
- `templates/_helpers.tpl` : helpers Helm (ex: fonction fullname)
- `templates/deployment.yaml` : template du Deployment (utilise .Values pour tout paramétrer)
- `templates/service.yaml` : template du Service
- `templates/configmap.yaml` : template du ConfigMap (itère sur `.Values.config`)
- `templates/secret.yaml` : template du Secret (itère sur `.Values.secret`)
- `templates/ingress.yaml` : template conditionnelle d'Ingress (s'exécute si `ingress.enabled: true`)
- `README.md` : notes d'usage rapides du chart

Raisons et bonnes pratiques appliquées :

- Tout ce qui peut varier (image, tag, replicas, ressources, activation Ingress, config/secret) est exposé dans `values.yaml`.
- Les templates évitent les valeurs codées en dur : `{{ .Values.image.repository }}` etc. Permet `helm upgrade --set` ou `-f custom-values.yaml`.
- Ingress conditionnel : certains environnements n'en ont pas besoin. On peut l'activer/désactiver sans toucher au template.
- Helpers : centraliser le nommage des ressources pour garder une cohérence (utile quand on installe plusieurs releases).

Exemples d'overrides courants :

- Changer l'image tag :

```bash
helm upgrade --install mon-app k8s/helm/ci-cd-web -n cicd-workshop --create-namespace --set image.tag=1.2.3
```

- Désactiver l'Ingress :

```bash
helm upgrade --install mon-app k8s/helm/ci-cd-web -n cicd-workshop --set ingress.enabled=false
```

---

## Remarques finales

- Environnement local : pour tester l'Ingress tu peux ajouter `127.0.0.1 ci-cd.local` dans `/etc/hosts` (si Traefik est exposé sur 80/443), ou utiliser `kubectl port-forward`.
- Sécurité : n'envoie pas de secrets en clair dans Git. Pour un rendu d'atelier, tu peux utiliser un secret exemple, mais indique dans le README que les vraies valeurs doivent être injectées via `kubectl create secret` ou un outil sécurisé.
- Suivant l'exigence, je peux : ajouter un `NOTES.txt` dans le chart, ajouter un test Helm (`templates/tests`), ou générer un petit `Makefile` pour builder/pusher l'image et déployer (Makefile + targets `image-build`, `k8s-apply`, `helm-install`).

Si tu veux que je génère ces extras (NOTES.txt / Helm test / Makefile), dis-moi lesquels et je les ajoute.
