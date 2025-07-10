# CI/CD Pipeline Documentation

This document describes the complete CI/CD (Continuous Integration/Continuous Deployment) setup for the Event Manager application, including GitHub Actions, Jenkins, and deployment strategies.

## Overview

The Event Manager project implements a comprehensive CI/CD pipeline with the following components:

- **GitHub Actions**: Automated testing, building, and deployment
- **Jenkins**: Alternative CI/CD pipeline with advanced features
- **Docker**: Containerization for consistent deployments
- **Kubernetes**: Orchestration for production deployments
- **Monitoring**: Prometheus, Grafana, and ELK stack integration

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GitHub Repo   │    │   Jenkins       │    │   Docker Hub    │
│                 │    │   Server        │    │   / GHCR        │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CI/CD Pipeline                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Test      │  │   Build     │  │   Security  │            │
│  │   Stage     │  │   Stage     │  │   Scan      │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Staging       │    │   Production    │    │   Monitoring    │
│   Environment   │    │   Environment   │    │   & Logging     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## GitHub Actions Pipeline

### Workflow File: `.github/workflows/ci-cd.yml`

The GitHub Actions pipeline includes the following stages:

#### 1. Test Stage
- **Dependencies Installation**: Installs all npm dependencies
- **Backend Tests**: Runs backend unit and integration tests
- **Frontend Tests**: Runs frontend unit tests
- **Linting**: Performs code quality checks

#### 2. Build Stage
- **Docker Build**: Creates Docker image with multi-stage build
- **Image Testing**: Tests the built Docker image
- **Security Scan**: Runs Trivy vulnerability scanner

#### 3. Deploy Stage
- **Staging Deployment**: Deploys to staging on `develop` branch
- **Production Deployment**: Deploys to production on `main` branch
- **Notifications**: Sends deployment status notifications

### Usage

```bash
# The pipeline automatically triggers on:
# - Push to main/develop branches
# - Pull requests to main/develop branches
```

### Environment Variables

Set these secrets in your GitHub repository:

```bash
# Docker Registry Credentials
DOCKER_USERNAME=your-username
DOCKER_PASSWORD=your-password

# Deployment Credentials
STAGING_SSH_KEY=your-staging-ssh-key
PRODUCTION_SSH_KEY=your-production-ssh-key
```

## Jenkins Pipeline

### Pipeline File: `Jenkinsfile`

The Jenkins pipeline provides an alternative CI/CD solution with:

#### Features
- **Parallel Execution**: Runs tests and builds in parallel
- **Error Handling**: Comprehensive error handling and rollback
- **Security Scanning**: Integrated Trivy vulnerability scanning
- **Multi-environment Support**: Staging and production deployments

#### Setup Instructions

1. **Install Jenkins Plugins**:
   ```
   - Docker Pipeline
   - Credentials Binding
   - SSH Agent
   - Pipeline
   ```

2. **Configure Credentials**:
   ```
   - docker-registry-credentials (Username/Password)
   - staging-ssh-key (SSH Private Key)
   - production-ssh-key (SSH Private Key)
   ```

3. **Create Jenkins Pipeline**:
   - Create a new Pipeline job
   - Set SCM to Git
   - Point to your repository
   - Set branch to `main` or `develop`

#### Usage

```bash
# Manual trigger
# The pipeline runs automatically on code changes

# View logs
# Jenkins provides detailed logs for each stage
```

## Docker Configuration

### Multi-stage Dockerfile

The Dockerfile uses a multi-stage build approach:

1. **Dependencies Stage**: Installs all npm dependencies
2. **Builder Stage**: Compiles TypeScript and builds Next.js
3. **Runner Stage**: Creates minimal production image

### Docker Compose Configurations

#### Development
```bash
docker-compose up --build
```

#### Staging
```bash
docker-compose -f deploy/docker-compose.staging.yml up -d
```

#### Production
```bash
docker-compose -f deploy/docker-compose.production.yml up -d
```

## Deployment Strategies

### 1. Blue-Green Deployment

```bash
# Deploy new version alongside current version
./deploy/deploy.sh production v2.0.0

# Switch traffic to new version
# Rollback if issues occur
./deploy/deploy.sh rollback
```

### 2. Rolling Deployment (Kubernetes)

```bash
# Apply Kubernetes configuration
kubectl apply -f k8s/event-manager-deployment.yml

# Update image
kubectl set image deployment/event-manager event-manager=ghcr.io/chikku1780/event_manager_task:v2.0.0
```

### 3. Canary Deployment

```bash
# Deploy to small percentage of users first
# Monitor metrics and gradually increase traffic
# Full rollout if successful
```

## Monitoring and Observability

### Prometheus Configuration

File: `monitoring/prometheus.yml`

Monitors:
- Application metrics
- Container metrics
- System metrics
- Custom business metrics

### Grafana Dashboards

Access: `http://localhost:3001` (staging) or `http://localhost:3002` (production)

Dashboards include:
- Application performance
- Error rates
- User activity
- System resources

### ELK Stack (Production)

- **Elasticsearch**: Log storage and indexing
- **Logstash**: Log processing
- **Kibana**: Log visualization

Access: `http://localhost:5601`

## Security

### Security Scanning

1. **Trivy**: Container vulnerability scanning
2. **CodeQL**: Static code analysis
3. **Dependency Scanning**: npm audit integration

### Secrets Management

```bash
# Kubernetes Secrets
kubectl create secret generic event-manager-secrets \
  --from-literal=jwt-secret=your-secret

# Docker Secrets
echo "your-secret" | docker secret create jwt-secret -
```

## Backup and Recovery

### Automated Backups

```bash
# Daily backups of:
# - Application data
# - Configuration files
# - Database (if applicable)
# - Monitoring data
```

### Recovery Procedures

1. **Application Rollback**:
   ```bash
   ./deploy/deploy.sh rollback
   ```

2. **Data Recovery**:
   ```bash
   # Restore from backup
   tar -xzf backup/backup-YYYYMMDD-HHMMSS.tar.gz
   ```

## Performance Optimization

### Docker Optimization

- Multi-stage builds
- Layer caching
- Minimal base images
- Security scanning

### Kubernetes Optimization

- Resource limits and requests
- Horizontal Pod Autoscaling
- Pod disruption budgets
- Network policies

## Troubleshooting

### Common Issues

1. **Build Failures**:
   ```bash
   # Check logs
   docker-compose logs event-manager
   
   # Rebuild without cache
   docker-compose build --no-cache
   ```

2. **Deployment Failures**:
   ```bash
   # Check health
   ./deploy/deploy.sh health
   
   # Rollback
   ./deploy/deploy.sh rollback
   ```

3. **Performance Issues**:
   ```bash
   # Check resource usage
   kubectl top pods -n event-manager
   
   # Scale up
   kubectl scale deployment event-manager --replicas=5
   ```

### Log Analysis

```bash
# Application logs
docker-compose logs -f event-manager

# Kubernetes logs
kubectl logs -f deployment/event-manager -n event-manager

# System logs
journalctl -u docker.service -f
```

## Best Practices

### Code Quality

1. **Pre-commit Hooks**: Run tests and linting before commits
2. **Code Review**: Require PR reviews for main branch
3. **Automated Testing**: Maintain high test coverage

### Security

1. **Regular Updates**: Keep dependencies updated
2. **Vulnerability Scanning**: Run security scans regularly
3. **Secrets Management**: Never commit secrets to repository

### Monitoring

1. **Alerting**: Set up alerts for critical metrics
2. **Logging**: Centralized logging with proper retention
3. **Metrics**: Track business and technical metrics

### Deployment

1. **Automated Rollbacks**: Quick rollback on failures
2. **Health Checks**: Comprehensive health monitoring
3. **Gradual Rollouts**: Deploy to small groups first

## Future Enhancements

### Planned Features

1. **Service Mesh**: Istio integration for advanced traffic management
2. **GitOps**: ArgoCD for declarative deployments
3. **Chaos Engineering**: Chaos Monkey for resilience testing
4. **Cost Optimization**: Resource usage optimization
5. **Multi-region**: Geographic distribution for better performance

### Monitoring Enhancements

1. **Distributed Tracing**: Jaeger integration
2. **Custom Metrics**: Business-specific metrics
3. **AI/ML Monitoring**: Anomaly detection
4. **User Experience Monitoring**: Real user monitoring

## Support and Maintenance

### Regular Maintenance

1. **Weekly**: Security updates and dependency updates
2. **Monthly**: Performance reviews and optimization
3. **Quarterly**: Architecture reviews and planning

### Support Channels

- **GitHub Issues**: Bug reports and feature requests
- **Documentation**: Comprehensive documentation updates
- **Monitoring**: Proactive issue detection and resolution

---

For questions or issues, please refer to the troubleshooting section or create a GitHub issue. 