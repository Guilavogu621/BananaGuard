# 🍌 BananaGuard — Détection Intelligente des Maladies du Bananier

<div align="center">

![BananaGuard Logo](frontend/public/favicon.svg)

**Application web & mobile de détection des maladies du bananier par Intelligence Artificielle**

[![Frontend](https://img.shields.io/badge/Frontend-React.js-61DAFB?style=flat&logo=react)](https://banana-guard.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat&logo=fastapi)](https://bananaguard.onrender.com/docs)
[![IA](https://img.shields.io/badge/IA-TensorFlow%20%2F%20MobileNetV2-FF6F00?style=flat&logo=tensorflow)](https://www.tensorflow.org)
[![Database](https://img.shields.io/badge/Database-PostgreSQL-336791?style=flat&logo=postgresql)](https://www.postgresql.org)
[![Deploy Frontend](https://img.shields.io/badge/Deploy-Vercel-000000?style=flat&logo=vercel)](https://vercel.com)
[![Deploy Backend](https://img.shields.io/badge/Deploy-Render-46E3B7?style=flat&logo=render)](https://render.com)

🌐 **[Voir l'application en ligne](https://banana-guard.vercel.app)** | 📖 **[Documentation API](https://bananaguard.onrender.com/docs)**

</div>

---

## 📋 Table des matières

- [À propos](#-à-propos)
- [Fonctionnalités](#-fonctionnalités)
- [Maladies détectées](#-maladies-détectées)
- [Technologies](#-technologies)
- [Architecture](#-architecture)
- [Installation locale](#-installation-locale)
- [Variables d'environnement](#-variables-denvironnement)
- [Équipe](#-équipe)
- [Déploiement](#-déploiement)

---

## 🎯 À propos

**BananaGuard** est un projet tutoré développé par des étudiants en Licence 3 Informatique. L'application permet aux agriculteurs guinéens de diagnostiquer les maladies de leurs bananiers en prenant simplement une photo de feuille avec leur smartphone.

Le modèle d'intelligence artificielle est basé sur **MobileNetV2** (Transfer Learning depuis ImageNet) et a été entraîné sur **1 600 images** collectées localement à **Kindia (Guinée)** et sur Kaggle.

---

## ✨ Fonctionnalités

| Fonctionnalité | Agriculteur | Technicien |
|----------------|:-----------:|:----------:|
| 📸 Analyser une photo de feuille | ✅ | ✅ |
| 📊 Voir son historique d'analyses | ✅ | ✅ |
| 📚 Base de connaissances maladies | ✅ | ✅ |
| 📥 Exporter l'historique en CSV | ✅ | ✅ |
| 👥 Voir tous les utilisateurs | ❌ | ✅ |
| 🔍 Voir toutes les analyses | ❌ | ✅ |
| ➕ Créer un technicien | ❌ | ✅ |
| 📈 Statistiques globales | ❌ | ✅ |

---

## 🦠 Maladies détectées

| # | Maladie | Agent pathogène | Impact |
|---|---------|----------------|--------|
| 1 | **Sigatoka noire** | *Mycosphaerella fijiensis* | Perte jusqu'à 50% du rendement |
| 2 | **Fusarium / Panama Disease** | *Fusarium oxysporum* | Mort de la plante, aucun traitement |
| 3 | **Pestalotiopsis** | *Pestalotiopsis musarum* | Taches foliaires, affaiblissement |
| 4 | **Plante saine** | — | Aucune maladie détectée |

> ⚠️ Si la confiance du modèle est inférieure à **70%**, le système retourne "Incertain" et invite à reprendre une photo plus nette.

---

## 🛠 Technologies

### Frontend
```
React.js + Vite    → Interface utilisateur
React Router       → Navigation
Axios              → Appels HTTP
Framer Motion      → Animations
Lucide React       → Icônes
Vite PWA Plugin    → Progressive Web App
```

### Backend
```
Python + FastAPI   → API REST
SQLAlchemy         → ORM
PostgreSQL         → Base de données
JWT (python-jose)  → Authentification
Bcrypt + Passlib   → Sécurité des mots de passe
Uvicorn            → Serveur ASGI
```

### Intelligence Artificielle
```
TensorFlow / Keras → Framework IA
MobileNetV2        → Architecture CNN (Transfer Learning)
NumPy              → Calcul matriciel
Pillow             → Traitement d'images
```

### DevOps
```
GitHub             → Gestion de versions
Vercel             → Hébergement frontend
Render             → Hébergement backend + base de données
```

---

## 🏗 Architecture

```
BananaGuard/
├── frontend/                  # Application React.js
│   ├── src/
│   │   ├── api/               # Configuration Axios
│   │   ├── components/        # Composants réutilisables (Navbar)
│   │   └── pages/             # Pages de l'application
│   │       ├── LandingPage    # Page d'accueil
│   │       ├── LoginPage      # Connexion
│   │       ├── SignupPage     # Inscription
│   │       ├── Dashboard      # Tableau de bord
│   │       ├── UploadPage     # Analyse d'image
│   │       ├── ResultPage     # Résultat du diagnostic
│   │       ├── Historique     # Historique des analyses
│   │       ├── BaseMaladies   # Base de connaissances
│   │       ├── AdminPage      # Espace technicien
│   │       └── ProfilePage    # Profil utilisateur
│   └── public/                # Assets publics (icônes PWA)
│
├── backend/                   # API FastAPI
│   └── app/
│       ├── models/            # Modèles SQLAlchemy (User, Analyse)
│       ├── routes/            # Routes API (auth, analyse, historique, admin, maladies)
│       ├── utils/             # Utilitaires (sécurité, JWT)
│       ├── config.py          # Configuration (chemins modèle, DB)
│       ├── database.py        # Connexion base de données
│       ├── main.py            # Point d'entrée FastAPI
│       └── schemas.py         # Schémas Pydantic
│
└── ai_model/                  # Modèle IA
    ├── model/
    │   ├── bananaguard_best.h5              # Modèle entraîné
    │   ├── classes.json                     # Noms des classes
    │   └── resultats_complets_modifie.json  # Base de connaissances maladies
    └── dataset/               # Dataset d'entraînement
```

---

## 🚀 Installation locale

### Prérequis
- Node.js >= 18
- Python >= 3.11
- PostgreSQL (ou utiliser SQLite pour le dev local)

### 1. Cloner le projet

```bash
git clone https://github.com/Guilavogu621/BananaGuard.git
cd BananaGuard
```

### 2. Backend

```bash
cd backend

# Créer un environnement virtuel
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# ou venv\Scripts\activate  # Windows

# Installer les dépendances
pip install -r requirements.txt

# Copier et configurer les variables d'environnement
cp .env.example .env
# Modifier .env avec vos valeurs

# Lancer le serveur
uvicorn app.main:app --reload --port 8000
```

API disponible sur : http://localhost:8000  
Documentation : http://localhost:8000/docs

### 3. Frontend

```bash
cd frontend

# Installer les dépendances
npm install

# Copier et configurer les variables d'environnement
cp .env.example .env
# Modifier .env avec l'URL de votre backend

# Lancer le serveur de développement
npm run dev
```

Application disponible sur : http://localhost:5173

---

## 🔐 Variables d'environnement

### Backend (`backend/.env`)

```env
SECRET_KEY=votre_cle_secrete_jwt
DATABASE_URL=postgresql://user:password@host:5432/bananaguard_db
MODEL_PATH=/chemin/vers/ai_model/model/bananaguard_best.h5
CLASSES_PATH=/chemin/vers/ai_model/model/resultats_complets_modifie.json
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=https://bananaguard.onrender.com/api
VITE_BASE_URL=https://bananaguard.onrender.com
```

---

## 🌐 Déploiement

| Service | URL | Statut |
|---------|-----|--------|
| Frontend (Vercel) | https://banana-guard.vercel.app | 🟢 En ligne |
| Backend (Render) | https://bananaguard.onrender.com | 🟢 En ligne |
| Documentation API | https://bananaguard.onrender.com/docs | 🟢 En ligne |
| Base de données | PostgreSQL sur Render | 🟢 En ligne |

### Compte de démonstration

```
Rôle       : Technicien (Admin)
Email      : admin@bananaguard.com
Mot de passe : Admin1234!
```

> ⚠️ Le plan gratuit de Render s'endort après 15 min d'inactivité. La première requête peut prendre 30-60 secondes.

---

## 👥 Équipe

| Membre | Rôle | Responsabilités |
|--------|------|----------------|
| **Koumbassa Mariama** | Chef de groupe | Coordination, planification, collecte Kindia |
| **Mohamed Sams Deen Camara** | Rapporteur | Documentation, procès-verbaux, rapport |
| **Mamadou Touré** | Dev IA / ML | Entraînement modèle, dataset, MobileNetV2 |
| **Mariama Lafou** | Dev IA / ML | Collecte images, augmentation données, tests IA |
| **Abdourahmane Diallo** | Dev Frontend | Interface React.js, design responsive, PWA |
| **Guilavogui Kole** | Dev Backend & Deploy | API FastAPI, PostgreSQL, JWT, déploiement |

---

## 📄 Licence

Projet académique — Licence 3 Informatique LMD  
© 2025 Équipe BananaGuard — Tous droits réservés

---

<div align="center">
  Fait avec ❤️ en Guinée 🇬🇳
</div>
