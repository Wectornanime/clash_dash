const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const { saveBattlehData } = require('./services/apiData');
require('dotenv').config();

const app = express();

// Middleware para parsing de JSON
app.use(express.json());

// Rotas da API
app.get('/api/battleApi', async (req, res) => {
  await saveBattlehData();
  res.json({ message: 'Battle API data saved successfully' });
});

// Conexão com o MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conectado ao MongoDB'))
  .catch((err) => console.error(err));

// Servir os arquivos estáticos do React em produção
// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static(path.join(__dirname, '../client/build')));
  
//   app.get('*', (req, res) => {
//     res.sendFile(path.resolve(__dirname, '../client', 'build', 'index.html'));
//   });
// }

// Iniciar o servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
