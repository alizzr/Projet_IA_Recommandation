FROM python:3.9-slim

WORKDIR /app

# Installation des dépendances
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# On copie le code
COPY . .

# IMPORTANT : On génère le fichier CSV au démarrage du conteneur, puis on lance l'API
CMD ["python", "app.py"]