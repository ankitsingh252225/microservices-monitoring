# 📘 Microservices Monitoring & Autoscaling with Kubernetes

This project demonstrates a microservices-based system (Service-A, Service-B, Service-C with Redis) deployed on Kubernetes (Minikube/Kind).
It includes:

- Redis datastore

- Horizontal Pod Autoscaling (HPA) for Service-B

- Monitoring with Prometheus + Grafana

- Stress test to verify autoscaling & monitoring

### 🚀 Prerequisites

Make sure the following tools are installed:

- Docker
- kubectl
- Minikube
- Helm
### ⚙️ Setup Instructions
1️⃣ Start Kubernetes Cluster

For Minikube/ check:
```
minikube start --driver=docker --memory=3000 --cpus=2
minikube status

```
### 2️⃣ Build Docker Images inside Minikube/Kind

👉 This ensures Kubernetes can access your local images.
```
# For Minikube
eval $(minikube docker-env)

# Build service images
docker build -t service-a:latest ./Service-A
docker build -t service-b:latest ./Service-B
docker build -t service-c:latest ./Service-C

```
### 3️⃣ Deploy Redis + Services

Apply Kubernetes manifests:
```
kubectl apply -f k8s/redis/deployment.yaml
kubectl apply -f k8s/service-a/deployemt.yaml
kubectl apply -f k8s/service-b/deployment.yaml
kubectl apply -f k8s/service-c/deployment.yaml
kubectl apply -f k8s/service-a/ingress.yaml

```
verify
```
kubectl get pods
kubectl get svc

```
### 4️⃣ Enable Metrics Server (required for HPA)
```
minikube addons enable metrics-server

```
Check if metrics are available:
```
kubectl top pods
```
### 5️⃣ Configure HPA for Service-B
```
kubectl autoscale deployment service-b 
  --cpu-percent=70 
  --min=2 
  --max=10
```
check HPA
```
kubectl get hpa -w

```
### 6️⃣ Deploy Monitoring (Prometheus + Grafana)

Install via Helm:
```
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install monitoring prometheus-community/kube-prometheus-stack -n monitoring --create-namespace

```
for Grafana
```
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update
helm install grafana grafana/grafana -n monitoring

````
### 🔁 Port-Forward Services

```
# Prometheus UI
kubectl port-forward -n monitoring pod/prometheus-monitoring-kube-prometheus-prometheus-0 9090:9090

# Grafana UI
 kubectl port-forward -n monitoring pod/monitoring-grafana-8454f8bf5d-g45tn 3000:3000

```
→ Access in browser:

- Prometheus: http://localhost:9090

- Grafana: http://localhost:3000

### 🔗 Connect Prometheus to Grafana
In Grafana UI:

- Go to Settings → Data Sources → Add Data Source

- Choose Prometheus

- Set URL:
```
http://monitoring-kube-prometheus-prometheus.monitoring.svc.cluster.local:9090

```
### 🔗 Accessing Services
Since we are using ClusterIP by default, services are not exposed outside the cluster.
We can use port-forward to access them locally.
```
service A,B,C

kubectl port-forward svc/service-a 3001:80
kubectl port-forward svc/service-b 3002:4000
kubectl port-forward svc/service-c 3003:4200

```
### 📊 Grafana Dashboards

Dashboards to observe during stress test:

- CPU/Memory Usage of Service-B pods
- job completed
- Job Processing Time Histogram
- Error rates

![Screenshot](Screenshot%20(41).png)
![Screenshot](Screenshot%20(42).png)

