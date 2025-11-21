# ⎈ Helm Charts for ShopNow

This directory contains Helm charts for deploying the ShopNow e-commerce application. Helm is a package manager for Kubernetes that simplifies deployment and management.

## 🎯 Learning Objectives
- Understand Helm charts and templating
- Learn package management for Kubernetes
- Practice values-based configuration
- Implement chart dependencies and relationships

## 📁 Chart Structure

```
helm/
├── charts/
│   ├── backend/           # API server chart
│   ├── frontend/          # Customer app chart
│   ├── admin/             # Admin dashboard chart
│   └── mongo/             # MongoDB database chart
└── README.md              # This file
```

## 🚀 Quick Deployment

### Prerequisites
```bash
# Install Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Verify installation
helm version
```

### Deploy Individual Charts
```bash
# Deploy in dependency order
helm upgrade --install mongo kubernetes/helm/charts/mongo -n shopnow-demo --create-namespace
helm upgrade --install backend kubernetes/helm/charts/backend -n shopnow-demo
helm upgrade --install frontend kubernetes/helm/charts/frontend -n shopnow-demo
helm upgrade --install admin kubernetes/helm/charts/admin -n shopnow-demo
```

### Deploy with Custom Values
```bash
# Override default values
helm upgrade --install --install backend charts/backend -n shopnow-demo \
  --set replicaCount=3 \
  --set image.tag=v1.2.0 \
  --set resources.requests.cpu=200m
```

### Environment-Specific Deployments
```bash
# Development
helm upgrade --install --install backend charts/backend -f values-dev.yaml

# Staging
helm upgrade --install --install backend charts/backend -f values-staging.yaml

# Production
helm upgrade --install --install backend charts/backend -f values-prod.yaml
```

## 🔄 Chart Management

### Upgrade Deployments
```bash
# Upgrade with new image
helm upgrade --install backend charts/backend \
  --set image.tag=v1.3.0 \
  --namespace shopnow-demo

# Upgrade with new values file
helm upgrade --install backend charts/backend \
  -f new-values.yaml \
  --namespace shopnow-demo
```

### Rollback Deployments
```bash
# View release history
helm history backend -n shopnow-demo

# Rollback to previous version
helm rollback backend 1 -n shopnow-demo
```

### Uninstall Charts
```bash
# Remove individual chart
helm uninstall backend -n shopnow-demo

# Remove all charts
helm uninstall mongo backend frontend admin -n shopnow-demo
```