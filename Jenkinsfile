pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Test Microservices (Parallel)') {
            parallel {
                
                // ------------------------------------------------
                // 1. SERVICES NODE.JS (Product + Frontend)
                // ------------------------------------------------
                
                stage('Product Service (Node)') {
                    steps {
                        dir('product_service') {
                            echo '--- Installation & Test : Product Service ---'
                            bat 'npm install'
                            bat 'npm test'
                        }
                    }
                }

                stage('Frontend React (Node)') {
                    steps {
                        dir('react-frontend') {
                            echo '--- Installation & Test : Frontend ---'
                            bat 'npm install'
                            // "CI=true" empêche React de bloquer le terminal en attente
                            bat 'set CI=true && npm test' 
                        }
                    }
                }

                // ------------------------------------------------
                // 2. SERVICES PYTHON (User + Recommendation)
                // ------------------------------------------------

                stage('User Service (Python)') {
                    steps {
                        dir('user_service') {
                            echo '--- Installation & Test : User Service ---'
                            // On installe les dépendances listées dans requirements.txt
                            bat 'pip install -r requirements.txt'
                            // On lance les tests (ajustez si vous utilisez unittest au lieu de pytest)
                            bat 'python -m pytest'
                        }
                    }
                }

                stage('Recommendation Service (Python)') {
                    steps {
                        dir('recommendation_service') {
                            echo '--- Installation & Test : Recommendation IA ---'
                            bat 'pip install -r requirements.txt'
                            bat 'python -m pytest'
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline terminé. Vérifiez les résultats ci-dessus.'
        }
        failure {
            echo 'Attention : Un des services a échoué aux tests.'
        }
    }
}