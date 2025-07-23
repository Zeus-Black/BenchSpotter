# 🪑 BenchSpotter

> *Découvrez les plus beaux bancs pour vos rendez-vous romantiques*

Une application web collaborative permettant de découvrir et partager les spots de bancs les plus romantiques et pittoresques de votre ville. Parfait pour planifier des rendez-vous mémorables ou simplement trouver un endroit paisible pour se détendre.

## ✨ Fonctionnalités

### 🗺️ **Carte Interactive**
- Visualisation des spots sur une carte en temps réel
- Navigation fluide et intuitive
- Zoom et exploration libre

### 🪑 **Gestion des Spots**
- Ajout de nouveaux bancs sans inscription
- Descriptions détaillées des emplacements
- Géolocalisation précise

### ⭐ **Système d'Avis**
- Notes et commentaires communautaires
- Découverte des spots les mieux notés
- Partage d'expériences

### 🛡️ **Interface Admin**
- Modération des contenus
- Gestion des signalements
- Statistiques d'utilisation

## 🚀 Démarrage Rapide

### Prérequis
- [Docker](https://www.docker.com/) et Docker Compose
- [Git](https://git-scm.com/)
- Port 3000 et 3001 disponibles

### Installation

```bash
# 1. Cloner le repository
git clone https://github.com/votre-username/benchspotter.git
cd benchspotter

# 2. Copier la configuration
cp .env.example .env

# 3. Lancer l'application
docker-compose up --build
```

### Accès à l'application

Une fois les services démarrés :

- **🌐 Application** : [http://localhost:3000](http://localhost:3000)
- **🔧 API Backend** : [http://localhost:3001](http://localhost:3001)
- **📊 Admin Panel** : [http://localhost:3000/admin](http://localhost:3000/admin)

## 🏗️ Architecture

```
benchspotter/
├── 📱 apps/
│   ├── frontend/          # React + Vite + Tailwind CSS
│   │   ├── src/
│   │   │   ├── components/    # Composants React
│   │   │   ├── pages/         # Pages de l'application
│   │   │   └── styles/        # Styles et thèmes
│   │   └── public/
│   └── backend/           # Node.js + Express API
│       ├── src/
│       │   ├── routes/        # Routes API
│       │   ├── middleware/    # Middleware Express
│       │   └── services/      # Logique métier
│       └── database/          # Schémas et migrations
├── 🐳 infrastructure/
│   ├── nginx/             # Reverse proxy
│   ├── postgres/          # Configuration base de données
│   └── monitoring/        # Logs et métriques
├── 📜 scripts/            # Scripts de déploiement
└── 🔧 docker-compose.yml # Orchestration des services
```

## 🛠️ Stack Technique

### Frontend
- **React 18** - Interface utilisateur moderne
- **Vite** - Build tool ultra-rapide
- **Tailwind CSS** - Framework CSS utilitaire
- **Leaflet** - Cartes interactives
- **React Leaflet** - Intégration React/Leaflet

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web minimaliste
- **PostgreSQL** - Base de données relationnelle
- **PostGIS** - Extension géospatiale
- **Prisma** - ORM moderne

### DevOps
- **Docker** - Containerisation
- **Docker Compose** - Orchestration locale
- **Nginx** - Reverse proxy et load balancer
- **GitHub Actions** - CI/CD

## 🎨 Design System

### Palette de Couleurs
- **🌸 Rose Poudré** `#F8BBD9` - Tendresse et douceur
- **🍑 Pêche Corail** `#FFB5A7` - Chaleur et surprise
- **🌿 Vert Sauge** `#A8C090` - Nature et sérénité
- **☁️ Bleu Ciel** `#AED6F1` - Découverte et rêve
- **🤍 Blanc Cassé** `#FFF8F0` - Pureté et élégance
- **✨ Doré Subtil** `#F4E4BC` - Magie des moments

### Philosophie
Interface épurée inspirée par la découverte urbaine et les moments romantiques. Design chaleureux avec des animations subtiles pour une expérience utilisateur douce et engageante.

## 🚢 Déploiement

### Développement
```bash
# Lancement avec hot-reload
docker-compose up

# Rebuild après changement de dépendances
docker-compose up --build

# Logs d'un service spécifique
docker-compose logs -f backend

# Shell dans un container
docker-compose exec backend sh
```

### Production
```bash
# Déploiement automatisé
./scripts/deploy.sh production

# Sauvegarde de la base de données
./scripts/backup.sh

# Monitoring des services
docker-compose -f docker-compose.prod.yml ps
```

## 📚 API Documentation

### Endpoints Principaux

#### Spots
```http
GET    /api/spots              # Liste tous les bancs
POST   /api/spots              # Ajouter un nouveau banc
GET    /api/spots/:id          # Détails d'un banc
DELETE /api/spots/:id          # Supprimer un banc (admin)
```

#### Avis
```http
GET    /api/spots/:id/reviews  # Avis d'un banc
POST   /api/spots/:id/reviews  # Ajouter un avis
DELETE /api/reviews/:id        # Supprimer un avis (admin)
```

#### Administration
```http
GET    /api/admin/dashboard     # Statistiques globales
GET    /api/admin/reports       # Signalements en attente
POST   /api/admin/moderate      # Actions de modération
```

### Exemple d'Utilisation

```javascript
// Ajouter un nouveau spot
const response = await fetch('/api/spots', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: "Banc romantique du Parc des Buttes-Chaumont",
    description: "Vue magnifique sur Paris, parfait au coucher du soleil",
    latitude: 48.8799,
    longitude: 2.3831
  })
});
```

## 🔒 Sécurité

- **Rate Limiting** - Protection contre les attaques par déni de service
- **Input Validation** - Validation stricte des données entrantes
- **CORS Configuration** - Contrôle d'accès cross-origin
- **IP Hashing** - Anonymisation des adresses IP utilisateurs
- **Content Security Policy** - Protection XSS

## 🧪 Tests

```bash
# Tests unitaires
npm test

# Tests d'intégration
npm run test:integration

# Tests end-to-end
npm run test:e2e

# Coverage
npm run test:coverage
```

## 📈 Monitoring

- **Healthchecks** - Surveillance de l'état des services
- **Logs Centralisés** - Agrégation des logs applicatifs
- **Métriques** - Suivi des performances et de l'usage
- **Alertes** - Notifications en cas de problème

## 🤝 Contribution

### Comment Contribuer

1. **Fork** le projet
2. **Clone** votre fork localement
3. **Créer** une branche feature (`git checkout -b feature/amazing-feature`)
4. **Commit** vos changements (`git commit -m 'Add amazing feature'`)
5. **Push** sur la branche (`git push origin feature/amazing-feature`)
6. **Ouvrir** une Pull Request

### Guidelines

- Respecter les conventions de nommage
- Ajouter des tests pour les nouvelles fonctionnalités
- Documenter les changements importants
- Suivre les principes du design system

## 🙏 Remerciements

- [OpenStreetMap](https://openstreetmap.org) pour les données cartographiques
- [Leaflet](https://leafletjs.com) pour la bibliothèque de cartes
- La communauté open source pour les outils formidables

---

<div align="center">

**[🌐 Demo Live](https://benchspotter.com)** • **[📖 Documentation](https://docs.benchspotter.com)** • **[🐛 Signaler un Bug](https://github.com/votre-username/benchspotter/issues)**

*Fait avec ❤️ pour les amoureux des beaux endroits*

</div>
