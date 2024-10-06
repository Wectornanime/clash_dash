const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const { saveBattlehData } = require('./services/apiData');
const { getCardWinLossPercentage, getHighWinRateDecks, calcularDerrotasPorCombo, listarCartasMaisFrequentesEmVitorias, cartasComMaioresTaxasDeVitoria, rankingCartasMaisDerrotas, calcularVitoriasCartaZTrof, listarCombosVitoriosos } = require('./services/consutas');
const { verificaDados } = require('./middlewares/verificaDados');
require('dotenv').config();

const app = express();

// Middleware para parsing de JSON
app.use(express.json());

app.use(async (req, res, next) => {
  const haveData = await verificaDados();
  if (!haveData) {
    res.json({ message: 'Sem dados para retornar' });
  }
  next();
});

// Rotas da API
app.get('/api/battleApi', async (req, res) => {
  const { playerTag } = req.body;
  const { sucess } = await saveBattlehData(playerTag);
  if (sucess) {
    res.json({ message: 'Dados salvos com sucesso' });
  }
  res.json({ message: 'Falha ao salvar os dados' });
});

app.get('/api/porcentagem', async (req, res) => {
  const { cardName, startTime, endTime } = req.body;
  await getCardWinLossPercentage(cardName, startTime, endTime)
    .then(result => res.json(result))
    .catch(err => console.error(err));
});

app.get('/api/decksCompletos', async (req, res) => {
  const { startDate, endDate, winRateThreshold } = req.body;
  await getHighWinRateDecks(startDate, endDate, winRateThreshold)
    .then(result => res.json(result))
    .catch(err => console.error(err));
});

app.get('/api/calcularDerrotasPorCombo', async (req, res) => {
  const { cartasCombo, startTime, endTime } = req.body;
  await calcularDerrotasPorCombo(cartasCombo, startTime, endTime)
    .then(result => res.json(result))
    .catch(err => console.error(err));
});

app.get('/api/calcularVitoriasCartaZTrof', async (req, res) => {
  const { carta, percTrof, startTime, endTime } = req.body;
  await calcularVitoriasCartaZTrof(carta, percTrof, startTime, endTime)
    .then(result => res.json(result))
    .catch(err => console.error(err));
});

app.get('/api/listarCombosVitoriosos', async (req, res) => {
  const { tamanhoCombo, percentualVitorias, startTime, endTime } = req.body;
  await listarCombosVitoriosos(tamanhoCombo, percentualVitorias, startTime, endTime)
    .then(result => res.json(result))
    .catch(err => console.error(err));
});

// ex
app.get('/api/listarCartasMaisFrequentesEmVitorias', async (req, res) => {
  await listarCartasMaisFrequentesEmVitorias()
    .then(result => res.json(result))
    .catch(err => console.error(err));
});

app.get('/api/cartasComMaioresTaxasDeVitoria', async (req, res) => {
  const { startTime, endTime } = req.body;
  await cartasComMaioresTaxasDeVitoria(startTime, endTime)
    .then(result => res.json(result))
    .catch(err => console.error(err));
});

app.get('/api/rankingCartasMaisDerrotas', async (req, res) => {
  const { startTime, endTime } = req.body;
  await rankingCartasMaisDerrotas(startTime, endTime)
    .then(result => res.json(result))
    .catch(err => console.error(err));
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
