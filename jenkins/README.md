# 🔄 Jenkins CI/CD Pipelines

This directory contains Jenkins pipeline definitions for automating the build, test, and deployment of the ShopNow application components.

## 🎯 Learning Objectives
- Understand CI/CD pipeline concepts
- Learn Jenkins pipeline syntax (Groovy)
- Implement automated builds and deployments
- Practice GitOps workflow integration
- Master container image lifecycle management

## 📁 Pipeline Structure

```
jenkins/
├── Jenkinsfile.ci.backend     # Backend CI pipeline
├── Jenkinsfile.cd.backend     # Backend CD pipeline
├── Jenkinsfile.ci.frontend    # Frontend CI pipeline
├── Jenkinsfile.cd.frontend    # Frontend CD pipeline
├── Jenkinsfile.ci.admin       # Admin CI pipeline
├── Jenkinsfile.cd.admin       # Admin CD pipeline
└── README.md                  # This file
```

## 🔄 Pipeline Types

### CI Pipelines (Continuous Integration)
**Purpose**: Build, test, and publish container images
**Trigger**: Git push to main branch
**Outputs**: Container images pushed to registry

### CD Pipelines (Continuous Deployment)
**Purpose**: Deploy applications to Kubernetes
**Trigger**: Manual or automated after CI success
**Outputs**: Running applications in Kubernetes

## 🚀 Pipeline Workflow

### CI Pipeline Flow
```
1. Checkout Code
2. Set Image Tag (git commit hash)
3. Build Docker Image
4. Run Tests (optional)
5. Push to Container Registry
6. Archive Build Artifacts
```

### CD Pipeline Flow
```
1. Checkout Code
2. Get Image Tag (from CI pipeline)
3. Deploy with Helm
4. Verify Deployment
5. Run Health Checks
```