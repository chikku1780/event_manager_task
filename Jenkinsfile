pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'ghcr.io'
        IMAGE_NAME = 'event-manager'
        DOCKER_IMAGE = "${DOCKER_REGISTRY}/${env.IMAGE_NAME}"
        VERSION = "${env.BUILD_NUMBER}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                script {
                    sh 'npm run install:all'
                }
            }
        }
        
        stage('Code Quality') {
            parallel {
                stage('Lint Backend') {
                    steps {
                        dir('backend') {
                            sh 'npm run lint'
                        }
                    }
                }
                stage('Lint Frontend') {
                    steps {
                        dir('frontend') {
                            sh 'npm run lint'
                        }
                    }
                }
            }
        }
        
        stage('Test') {
            parallel {
                stage('Backend Tests') {
                    steps {
                        script {
                            try {
                                sh 'npm run test:backend'
                            } catch (Exception e) {
                                echo "Backend tests failed: ${e.getMessage()}"
                                currentBuild.result = 'UNSTABLE'
                            }
                        }
                    }
                }
                stage('Frontend Tests') {
                    steps {
                        script {
                            try {
                                sh 'npm run test:frontend'
                            } catch (Exception e) {
                                echo "Frontend tests failed: ${e.getMessage()}"
                                currentBuild.result = 'UNSTABLE'
                            }
                        }
                    }
                }
            }
        }
        
        stage('Build') {
            steps {
                script {
                    sh 'npm run build'
                }
            }
        }
        
        stage('Docker Build') {
            steps {
                script {
                    docker.build("${DOCKER_IMAGE}:${VERSION}")
                    docker.build("${DOCKER_IMAGE}:latest")
                }
            }
        }
        
        stage('Security Scan') {
            steps {
                script {
                    // Run Trivy security scan
                    sh """
                        docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
                        aquasec/trivy image --severity HIGH,CRITICAL \
                        ${DOCKER_IMAGE}:${VERSION}
                    """
                }
            }
        }
        
        stage('Docker Test') {
            steps {
                script {
                    // Test the Docker image
                    sh """
                        docker run -d --name test-container \
                        -p 3000:3000 -p 4000:4000 \
                        ${DOCKER_IMAGE}:${VERSION}
                        
                        sleep 30
                        
                        # Test frontend
                        curl -f http://localhost:3000 || exit 1
                        
                        # Test backend
                        curl -f http://localhost:4000/graphql || exit 1
                        
                        docker stop test-container
                        docker rm test-container
                    """
                }
            }
        }
        
        stage('Push to Registry') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'docker-registry-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh """
                            docker login ${DOCKER_REGISTRY} -u ${DOCKER_USER} -p ${DOCKER_PASS}
                            docker push ${DOCKER_IMAGE}:${VERSION}
                            docker push ${DOCKER_IMAGE}:latest
                        """
                    }
                }
            }
        }
        
        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                script {
                    // Deploy to staging environment
                    sh """
                        echo "Deploying to staging environment..."
                        # Add your staging deployment commands here
                        # Example: SSH to staging server
                        # ssh user@staging-server "docker pull ${DOCKER_IMAGE}:latest && docker-compose up -d"
                    """
                }
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                script {
                    // Deploy to production environment
                    sh """
                        echo "Deploying to production environment..."
                        # Add your production deployment commands here
                        # Example: SSH to production server
                        # ssh user@production-server "docker pull ${DOCKER_IMAGE}:latest && docker-compose up -d"
                    """
                }
            }
        }
    }
    
    post {
        always {
            // Cleanup
            sh 'docker system prune -f || true'
            cleanWs()
        }
        
        success {
            script {
                if (env.BRANCH_NAME == 'main') {
                    // Send success notification
                    echo "Deployment to production completed successfully!"
                    // Add notification logic (Slack, email, etc.)
                }
            }
        }
        
        failure {
            script {
                // Send failure notification
                echo "Pipeline failed!"
                // Add failure notification logic
            }
        }
        
        unstable {
            script {
                // Send unstable notification
                echo "Pipeline completed with unstable status!"
                // Add unstable notification logic
            }
        }
    }
} 