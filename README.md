
# 🛒 ShopNow E-Commerce - Capstone Project

This project delivers a fully automated CI/CD workflow where Terraform builds the entire AWS setup—including VPC, subnets, NAT, and an EKS cluster—while Jenkins handles the application lifecycle end to end. Each service is containerized with Docker, Jenkins builds and tags the images, pushes them to ECR, and then triggers Helm deployments to EKS. The cluster pulls the latest images, updates the services automatically, and exposes the application through an AWS Load Balancer DNS. The result is a clean, efficient DevOps pipeline with zero manual deployment steps and smooth, repeatable releases.

---


ShopNow is a **Capstone project** built around a full-stack MERN e-commerce application:
- **Customer App** (React frontend)  
- **Admin Dashboard** (React admin panel)  
- **Backend API** (Express + MongoDB)  

---

## 📁 Project Structure

```
shopNow/
├── backend/               # Node.js API server
├── frontend/              # React customer app
├── admin/                 # React admin dashboard
├── kubernetes
│   ├── k8s-manifests/     # Raw Kubernetes YAML files
│   ├── helm/              # Helm charts for package management
│   │   └── charts/        # Individual charts
│   ├── argocd/            # GitOps deployment configs
│   └── pre-req/           # Cluster prerequisites
├── jenkins/               # Pipeline definitions (CI & CD)       
├── docs/                  # learning resources and guides
└── scripts/               # Automation and utility scripts
└── Terraform/              
│   └── main.tf            #terraform script for vpc,subnets,eks
```

---

## Getting Started

## 🛠 Prerequisites & Setup

#### 1. Setup Tools**: [docs/TOOLS-SETUP-GUIDE.md](docs/TOOLS-SETUP-GUIDE.md)

#### 2. AWS ECR Registry Setup 
```bash
# Setup AWS credentials first
aws configure
# Enter your AWS Access Key ID, Secret Access Key, region (ca-central-1), and output format (json)

# Or use environment variables
export AWS_ACCESS_KEY_ID=your-access-key
export AWS_SECRET_ACCESS_KEY=your-secret-key
export AWS_DEFAULT_REGION=ca-central-1

# If above credentials are already set, run below command to verify
aws sts get-caller-identity

# Create ECR repositories either via the aws cli as mentioned below or via console (Has to be done once to create the ECR repo, skip this step when you are rebuilding the docker images):

like:

aws ecr create-repository --repository-name <your-username>-shopnow/frontend --region <region>
aws ecr create-repository --repository-name <your-username>-shopnow/backend --region <region>
aws ecr create-repository --repository-name <your-username>-shopnow/admin --region <region>

# Get login token (run this command everytime as the docker credentials are persisted only on the terminal)
aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <account-id>.dkr.ecr.<region>.amazonaws.com
```

#### 3. Terraform Infrastructure Creation

Terraform provisions the complete AWS foundation required for running Kubernetes on EKS:

✔ Networking Setup (Across 2 AZs)

- Creates a VPC (10.123.0.0/16) with DNS support enabled.
- Builds two public subnets and two private subnets, each mapped to separate availability zones.
- Adds an Internet Gateway for public networking and Elastic IPs + NAT Gateways to allow secure outbound access from private subnets.
- Configures public & private route tables with correct routing to IGW and NAT, and associates them with respective subnets.

✔ IAM Roles & Security

- Creates IAM roles for:
- EKS cluster → ClusterPolicy, ServicePolicy
- Worker nodes → WorkerNodePolicy, ECR ReadOnly, CNI Policy
- Ensures proper permissions for both control plane and node operations.

✔ EKS Cluster Setup

- Deploys an EKS cluster (ash-mern) running Kubernetes v1.31, using the private subnets.
- Enables public endpoint access for kubectl.
- Generates outputs including cluster endpoint, CA, and a kubeconfig template.

✔ Managed Node Group

- Creates a node group with t3.medium EC2 instances.
- Autoscaling enabled: min 1, desired 2, max 3.
- Nodes run inside the private subnets for improved security.

✔ Outcome

A fully provisioned, highly available AWS environment ready for Kubernetes workloads, complete with networking, IAM, EKS control plane, and managed worker nodes.


#### 3. Kubernetes Cluster Access (Make sure to have a running Kubernetes cluster, here is an example to connect with EKS)
```bash
# For EKS cluster
aws eks update-kubeconfig --region <region> --name <your-cluster-name>

# Verify access
kubectl cluster-info
kubectl get nodes
```

Note: All the below mentioned kubectl commands assume that you are working with "shopnow-demo1" namespace, update the namespace as per yours where ever you find "shopnow-demo1".

#### 4. Docker Registry Secret

```bash
# Create registry secret for private ECR image pulls
kubectl create ns shopnow-demo1
kubectl create secret docker-registry ecr-secret --docker-server=<account-id>.dkr.ecr.ca-central-1.amazonaws.com --docker-username=AWS --docker-password=$(aws ecr get-login-password --region ca-central-1) --namespace=shopnow-demo1
```

#### 5. Install Pre-requisites in the Kubernetes Environment (Has to be done once per Kubernetes Cluster)
```bash
# Install metrics server (required for resource monitoring and HPA)
kubectl apply -f kubernetes/pre-req/metrics-server.yaml

# Install ingress-nginx controller (for external access)
# For EKS, other cloud provider will have different file
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.12.0-beta.0/deploy/static/provider/aws/deploy.yaml

# For local development (minikube/kind/Docker Desktop)
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/kind/deploy.yaml

# Verify installations
kubectl get pods -n kube-system
kubectl get pods -n ingress-nginx
kubectl top nodes  # Should work after metrics server is running
kubectl top pods  # Should work after metrics server is running

# To enable Persistent Storage

# First install the EBS CSI driver as an EKS Addon

-> In the EKS Console, open your cluster → go to Add-ons → click Get more add-ons → select Amazon EBS CSI driver → click Next.
-> On the configuration page, Under Pod identity association, choose Create a new IAM role, and the console will auto-attach the AmazonEBSCSIDriverPolicy.
-> Confirm and click Create. The add-on installs, the IAM role is associated with the SA via Pod Identity, and the driver starts running.
-> Verify under Add-ons tab that the EBS CSI driver is active and under Pod identity associations tab you see the SA <-> IAM role mapping.

# Install storage class for persistent volumes
kubectl apply -f kubernetes/pre-req/storageclass-gp3.yaml

# Verify storage class installation
kubectl get storageclass


```


## ⚡ Build and Deploy the micro-services

### 1. Build the docker images and push it to the ECR registry created above

```bash
scripts/build-and-push.sh <account-id>.dkr.ecr.<region>.amazonaws.com/<registry-name> <tag-name-number> <your-username> 

# Example for user 'aviral' with tag 'latest' and ECR registry '975050024946.dkr.ecr.ca-central-1.amazonaws.com/shopnow':
./scripts/build-and-push.sh 975050024946.dkr.ecr.ca-central-1.amazonaws.com/shopnow latest aviral


```

### 2. Choose Your Deployment Method

**Option A: Raw Kubernetes Manifests**
```bash
kubectl apply -f kubernetes/k8s-manifests/namespace/
kubectl apply -f kubernetes/k8s-manifests/database/
kubectl apply -f kubernetes/k8s-manifests/backend/
kubectl apply -f kubernetes/k8s-manifests/frontend/
kubectl apply -f kubernetes/k8s-manifests/admin/
kubectl apply -f kubernetes/k8s-manifests/ingress/
kubectl apply -f kubernetes/k8s-manifests/daemonsets-example/
```

**Option B: Helm Charts**

```bash
helm upgrade --install mongo kubernetes/helm/charts/mongo -n shopnow-demo1 --create-namespace
helm upgrade --install backend kubernetes/helm/charts/backend -n shopnow-demo1
helm upgrade --install frontend kubernetes/helm/charts/frontend -n shopnow-demo1
helm upgrade --install admin kubernetes/helm/charts/admin -n shopnow-demo1
```

**Option C: ArgoCD GitOps**
```bash
# Install ArgoCD first
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Create target namespace
kubectl create namespace shopnow-demo1

# Deploy applications
kubectl apply -f kubernetes/argocd/umbrella-application.yaml

# Check all ArgoCD application status:
kubectl get applications -n argocd

```

### 3. Create users in MongoDB after the mongodb pods are healthy

```bash

# check the status of the mongo-0 pods 
kubectl get pods -n shopnow-demo1

# if mongo-0 pod is healthy, then run following command to create a user for the backend to connect
# user credentials should be same as mentioned in the backend secrets-db.yaml file
# First exex into the pods
kubectl -n shopnow-demo1 exec -it mongo-0 -- mongosh

# Run below commands
use admin;
db.createUser({
  user: 'shopuser',
  pwd: 'ShopNowPass123',
  roles: [
    { role: 'readWrite', db: 'shopnow' },
    { role: 'dbAdmin', db: 'shopnow' }
  ]
});

exit

# Restart backend deployment
kubectl rollout restart deploy backend -n shopnow-demo1
```

### 4. Check the resources deployed

```bash
# Check Pods
kubectl get pods -n shopnow-demo1

# Check Deployment
kubectl get deploy -n shopnow-demo1

# Check Services
kubectl get svc -n shopnow-demo1

# Check daemonsets
kubectl get daemonsets -n shopnow-demo1

# Check statefulsets
kubectl get statefulsets -n shopnow-demo1

# Check HPA
kubectl get hpa -n shopnow-demo1

# Check all of the above at once
kubectl get all -n shopnow-demo1

# Check configmaps
kubectl get cm -n shopnow-demo1

# Check secrets
kubectl get secrets -n shopnow-demo1

# Check ingress
kubectl get ing -n shopnow-demo1

# Sequence to debug in case of any issue with the pods
kubectl get pods -n shopnow-demo1
kubectl describe pod backend-746cc99cd-cqrgf -n shopnow-demo1 # Assuming that pod backend-746cc99cd-cqrgf has an error
kubectl logs backend-746cc99cd-cqrgf -n shopnow-demo1 --previous # If no details are found in the above command or if details like liveness probe failed are coming

```


---

## Screenshots
![AWS Configure](Screenshots/awsconfigure.png)
![Cluster Info](Screenshots/clusterinfo.png)
![Namespace and Secret](Screenshots/nsanddockersecret.png)
![Pods Info](Screenshots/podsinfo.png)
![Service and Ingress Info](Screenshots/serviceinfo.png)

---

## Additional Notes

**Check the Application Architecture details**: [docs/APPLICATION-ARCHITECTURE.md](docs/APPLICATION-ARCHITECTURE.md)
**Check the Troubleshooting Guide**: [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)
---

## 👨‍💻 Author
 forked from aryanm12/shopNow

## Capstone Members
- Aviral Paliwal
- Aishwarya Patil
- Sanidhya Gadgil

---
