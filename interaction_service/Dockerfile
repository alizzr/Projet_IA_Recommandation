# Utilise une image Python légère
FROM python:3.9-slim

# Définit le dossier de travail dans le conteneur
WORKDIR /app

# Copie les dépendances et les installe
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copie tout le code (app.py)
COPY . .

# Lance l'application sur le port 5004
CMD ["python", "app.py"]