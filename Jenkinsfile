pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Node') {
            steps {
                bat '''
                echo Installing Node.js...
                choco install nodejs-lts -y
                node -v
                npm -v
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                bat '''
                npm install
                '''
            }
        }

        stage('Run Tests') {
            steps {
                bat '''
                npm test
                '''
            }
        }

        stage('Archive Coverage') {
            steps {
                junit 'coverage/**/test-results.xml'  // si tu as des fichiers JUnit
                archiveArtifacts artifacts: 'coverage/**', fingerprint: true
            }
        }
    }

    post {
        always {
            echo 'Pipeline terminé.'
        }
    }
}
