const express = require('express');
const mongoose = require('mongoose');
// const matchRoutes = require('./routes/matchRoutes');  // Importar rotas
const app = express();

// Middleware
app.use(express.json()); // Parse JSON requests

// Rotas
// app.use('/api/matches', matchRoutes); // Usar as rotas de partidas

// Conexão com MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => app.listen(5000, () => console.log('Servidor rodando na porta 5000')))
  .catch((err) => console.log(err));

module.exports = app;
