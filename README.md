# 🪑 BenchSpotter

![Interface principale](/images/admin.png)

**BenchSpotter** est un projet collaboratif permettant de cartographier et partager les bancs offrant les plus belles vues. Cette application web moderne permet aux utilisateurs de découvrir, ajouter et évaluer des bancs publics avec leurs photos et commentaires.

## Interface d'administration

![Interface admin](/images/screen.png)

## Fonctionnalités

### Pour les utilisateurs
- **Carte interactive** avec géolocalisation automatique
- **Recherche géographique** pour explorer différentes zones
- **Ajout de bancs** avec photos, descriptions et notes
- **Système de commentaires** pour partager ses impressions
- **Interface responsive** optimisée mobile et desktop

### Pour les administrateurs
- **Tableau de bord** de gestion des bancs
- **Modération des commentaires**
- **Statistiques d'usage**
- **Suppression et gestion du contenu**

## Technologies utilisées

### Frontend
- **HTML5/CSS3** avec design moderne et glassmorphism
- **JavaScript Vanilla** pour les interactions
- **Leaflet.js** pour la cartographie interactive
- **OpenStreetMap** comme source de tuiles
- **Font Awesome** pour les icônes
- **Google Fonts** (Inter) pour la typographie

### Backend
- **Python** avec FastAPI
- **SQLite** pour la base de données
- **Uvicorn** comme serveur ASGI
- **Jinja2** pour les templates admin

### Infrastructure
- **Docker** et Docker Compose pour la containerisation
- **Nginx** comme reverse proxy
- **Architecture microservices** (frontend/backend séparés)

## Installation et déploiement

### Prérequis
- Docker et Docker Compose installés
- Port 80 disponible sur la machine

### Installation rapide

1. Cloner le repository :
```bash
git clone https://github.com/votre-username/benchspotter.git
cd benchspotter
```

2. Lancer l'application :
```bash
docker-compose up -d
```

3. Accéder à l'application :
- **Interface utilisateur** : http://localhost
- **Interface admin** : http://localhost/admin

### Installation pour le développement

Pour le développement avec rechargement automatique :

```bash
docker-compose -f docker-compose.dev.yml up -d
```

## Architecture du projet

```
BenchSpotter/
├── backend/                 # API Python FastAPI
│   ├── main.py             # Point d'entrée de l'API
│   ├── models.py           # Modèles de données SQLAlchemy
│   ├── crud.py             # Opérations base de données
│   ├── schemas.py          # Schémas Pydantic
│   ├── database.py         # Configuration DB
│   ├── templates/          # Templates admin Jinja2
│   └── static/            # Fichiers uploadés
├── frontend/               # Interface utilisateur
│   ├── index.html         # Page principale
│   ├── style.css          # Styles modernes
│   ├── script.js          # Logique frontend
│   └── img/              # Ressources images
├── nginx/                 # Configuration reverse proxy
└── docker-compose.yml     # Orchestration des services
```

## API Endpoints

### Endpoints publics
- `GET /api/benches` - Liste tous les bancs
- `POST /api/benches` - Ajouter un nouveau banc
- `GET /api/benches/{id}/comments` - Commentaires d'un banc
- `POST /api/benches/{id}/comments` - Ajouter un commentaire

### Endpoints administrateur (authentification requise)
- `GET /admin` - Interface d'administration
- `GET /admin/benches` - Gestion des bancs
- `DELETE /api/benches/{id}` - Supprimer un banc
- `DELETE /api/benches/{id}/comments/{comment_id}` - Supprimer un commentaire

## Configuration

### Variables d'environnement

Créer un fichier `.env` pour la configuration :

```env
# Base de données
DATABASE_URL=sqlite:///./benches.db

# Administration
ADMIN_USERNAME=admin
ADMIN_PASSWORD=votre_mot_de_passe_securise

# Upload
MAX_FILE_SIZE=5242880  # 5MB
ALLOWED_EXTENSIONS=jpg,jpeg,png
```

### Configuration nginx

La configuration nginx gère le routage :
- `/` → Frontend statique
- `/api/` → Backend API
- `/admin`, `/login`, `/logout` → Interface admin
- `/static/` → Fichiers uploadés

## Sécurité

- Validation stricte des uploads (types MIME, taille)
- Authentification administrateur par session
- Sanitisation des entrées utilisateur
- Rate limiting sur les uploads
- Headers de sécurité configurés

## Contribution

### Développeurs principaux
- **Lucas Lantrua**
- **Colin Ledru**

### Contribuer au projet

1. Fork du repository
2. Création d'une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit des modifications (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouverture d'une Pull Request

## Support et contact

- **Issues** : Signaler des bugs via [GitHub Issues](https://github.com/votre-username/benchspotter/issues)
- **Contact** : contact@benchspotter.live
- **Documentation** : Wiki du projet sur GitHub

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## Roadmap

### Version 1.1 (à venir)
- Authentification utilisateur optionnelle
- Favoris et listes personnelles
- Export des données en GPX/KML
- Amélioration du système de notation

### Version 1.2 (planifiée)
- Application mobile native
- Notifications push
- Système de badges utilisateur
- API publique documentée

---

*Découvrez et partagez les plus beaux bancs de votre région avec BenchSpotter.*
