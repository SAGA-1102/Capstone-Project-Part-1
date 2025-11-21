# 🔧 Kubernetes Prerequisites

This directory contains essential cluster components needed before deploying the ShopNow application.

## Required Components

### 1. Metrics Server
```bash
kubectl apply -f metrics-server.yaml
```
Enables resource metrics collection for HPA (Horizontal Pod Autoscaler).

### 2. Ingress Controller (NGINX)
```bash
# For cloud providers
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml

# For local development (minikube/kind)
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/kind/deploy.yaml
```

### 3. Storage Class (GP3)
```bash
kubectl apply -f storageclass-gp3.yaml
```
Provides high-performance GP3 storage class for persistent volumes.

## Verification Commands
```bash
# Check metrics server
kubectl top nodes
kubectl top pods -A

# Check ingress controller
kubectl get pods -n ingress-nginx

# Check storage class
kubectl get storageclass
```