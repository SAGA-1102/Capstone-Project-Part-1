
# shopNow

This repository contains the microservices, Kubernetes manifests, Helm charts, and Jenkins pipelines used to demonstrate an end-to-end deployment workflow (build → image → deploy) using Docker, Kubernetes and Jenkins CI/CD.

This project was created to showcase skills in end-to-end deployment of microservices using Kubernetes and Jenkins.

**Repository layout**
- **`admin/`**: admin frontend application and config
- **`backend/`**: backend API service
- **`frontend/`**: customer-facing frontend
- **`kubernetes/`**: Helm charts, K8s manifests and ArgoCD umbrella app
- **`jenkins/`**: Jenkinsfiles for CI/CD pipelines (per service)
- **`scripts/`**: helper scripts (e.g., `build-and-push.sh`)

**Quick links**
- **Charts & manifests**: `kubernetes/helm/` and `kubernetes/k8s-manifests/`
- **Pipelines**: `jenkins/` contains `Jenkinsfile.*` for CI and CD
- **Docker**: `Dockerfile` in each service folder

**Screenshots**

Add screenshots in `Screenshots/` and reference them below. Replace placeholders with real images.

- ![Architecture diagram](Screenshots/architecture.png)
- ![Deployment view](Screenshots/deployment.png)
- ![Jenkins pipeline run](Screenshots/jenkins-run.png)

**What this repo demonstrates**
- **End-to-end CI/CD**: pipeline definitions in `jenkins/` that build, test, and deploy artifacts.
- **Containerization**: application services packaged with `Dockerfile`.
- **Kubernetes deployment**: manifests and Helm charts to deploy apps, services, ingress, HPA, and DB.
- **GitOps (optional)**: ArgoCD app manifests under `kubernetes/argocd/` to manage deployments.

**Prerequisites**
- **Local tools**: `docker`, `kubectl`, `helm`, and `jenkins` (for running pipelines locally or on a server).
- **Kubernetes cluster**: a cluster accessible to you (minikube, kind, EKS/GKE/AKS, etc.).
- **Container registry**: Docker Hub or private registry to push images.

**How to run (high level)**

1. Build images locally and push to a registry

```powershell
# Example (replace <registry> and <tag>)
cd backend
docker build -t <registry>/shopnow-backend:latest .
docker push <registry>/shopnow-backend:latest

cd ../frontend
docker build -t <registry>/shopnow-frontend:latest .
docker push <registry>/shopnow-frontend:latest

cd ../admin
docker build -t <registry>/shopnow-admin:latest .
docker push <registry>/shopnow-admin:latest
```

2. Deploy to Kubernetes using Helm (recommended)

```powershell
# From repo root
helm install shopnow-mongo kubernetes/helm/charts/mongo --namespace shopnow --create-namespace
helm install shopnow-backend kubernetes/helm/charts/backend --namespace shopnow
helm install shopnow-frontend kubernetes/helm/charts/frontend --namespace shopnow
helm install shopnow-admin kubernetes/helm/charts/admin --namespace shopnow
```

3. Or apply the manifest YAMLs directly

```powershell
kubectl apply -f kubernetes/k8s-manifests/database/ -n shopnow
kubectl apply -f kubernetes/k8s-manifests/backend/ -n shopnow
kubectl apply -f kubernetes/k8s-manifests/frontend/ -n shopnow
kubectl apply -f kubernetes/k8s-manifests/admin/ -n shopnow
kubectl apply -f kubernetes/k8s-manifests/ingress/ -n shopnow
```

**Jenkins CI/CD**

- CI pipeline files are in `jenkins/`:
	- `Jenkinsfile.ci.*` run unit tests/builds
	- `Jenkinsfile.cd.*` perform deployments after successful CI
- Pipelines are written to build Docker images, push to a registry, and deploy via Helm or `kubectl`.

**Architecture (short)**
- **Frontend**: static SPA served by Nginx (in `frontend/`)
- **Admin**: separate admin frontend (in `admin/`)
- **Backend**: Node/Express REST API (in `backend/`)
- **Database**: MongoDB (Helm chart / statefulset in `kubernetes/`)

**Troubleshooting**
- **Image pull errors**: verify images are pushed and imagePullSecrets are configured.
- **Ingress/Service not reachable**: check `kubectl get all -n shopnow` and `kubectl describe ingress`.
- **Helm failures**: inspect `helm status <release>` and pod logs via `kubectl logs`.

**Capstone Members**
- Aviral Paliwal
- Aishwarya Patil
- Sanidhya Gadgil
- Munit

**License**
- See `LICENSE` in the repository root.

---


