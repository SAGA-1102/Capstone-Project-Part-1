# ArgoCD app-of-apps for shopNow

This directory contains ArgoCD Application manifests:

- umbrella-application.yaml — an "app-of-apps" Application that points to argocd/apps and therefore manages the child Application resources.
- apps/<service>-app.yaml — ArgoCD Applications for frontend, backend, admin and mongo charts.

Usage:
1. Ensure ArgoCD is installed in the cluster (namespace: argocd).
2. Create a project in ArgoCD if you want custom restrictions (optional).
3. Apply umbrella Application to ArgoCD:
   kubectl apply -f kubernetes/argocd/umbrella-application.yaml -n argocd
4. Check all ArgoCD applications:
   kubectl get applications -n argocd


ArgoCD will read kubernetes/argocd/apps and create the child Application resources.

## Deployment Order
The applications use sync waves to ensure proper deployment order:
- Wave 1: MongoDB (database layer)
- Wave 2: Backend (API layer) 
- Wave 3: Frontend & Admin (presentation layer)

## Sync Policies
- MongoDB: Manual sync (prune: false, selfHeal: false) for database safety
- Backend/Frontend/Admin: Automated sync with self-healing enabled

Adjust repoURL and target namespaces in the manifests if needed.
