const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.API_PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Stockage temporaire en mémoire (en attendant la vraie DB)
let spots = [];
let nextId = 1;

// Route de test
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'BenchSpotter API is running!',
    timestamp: new Date().toISOString()
  });
});

// Routes API
app.get('/api/spots', (req, res) => {
  res.json({ 
    message: 'Liste des spots', 
    spots: spots 
  });
});

app.post('/api/spots', (req, res) => {
  const { title, description, latitude, longitude } = req.body;
  
  // Validation simple
  if (!title || !latitude || !longitude) {
    return res.status(400).json({ error: 'Titre, latitude et longitude requis' });
  }

  const newSpot = {
    id: nextId++,
    title,
    description: description || '',
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
    created_at: new Date().toISOString()
  };

  spots.push(newSpot);
  
  console.log(`🪑 Nouveau spot ajouté: ${title} (${latitude}, ${longitude})`);
  
  res.status(201).json(newSpot);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 BenchSpotter API running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});
