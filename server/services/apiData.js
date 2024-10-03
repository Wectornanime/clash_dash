const axios = require('axios');
const Battle = require('../models/Battle');

// Função para salvar dados da API no MongoDB
async function saveBattlehData() {
  try {
    // Fazendo uma requisição à API
    const response = await axios.get(`${process.env.CLASH_API_URL}/players/%232RVQG28R2/battlelog`, {
      headers: {
        Authorization: `Bearer ${process.env.CLASH_API_TOKEN}`
      }
    });

    // Supondo que response.data contenha os dados das partidas
    const battles = response.data;

    // Iterando sobre as partidas e salvando no MongoDB
    for (let battle of battles) {
      const newBattle = new Battle({
        player1: {
          name: battle.team[0].name,
          playerTag: battle.team[0].tag,
          startingTrophies: battle.team[0].startingTrophies,
          cards: battle.team[0].cards.map(item => {
            return {
              name: item.name,
              id: item.id,
              iconUrl: item.iconUrls.medium || ''
            }
          })
        },
        player2: {
          name: battle.opponent[0].name,
          playerTag: battle.opponent[0].tag,
          startingTrophies: battle.opponent[0].startingTrophies,
          cards: battle.opponent[0].cards.map(item => {
            return {
              name: item.name,
              id: item.id,
              iconUrl: item.iconUrls.medium || ''
            }
          })
        },
        p1_crowns: battle.team[0].crowns,
        p2_crowns: battle.opponent[0].crowns,
        date: battle.battleTime
      });

      await newBattle.save();
      // console.log(`Partida entre ${match.player1} e ${match.player2} salva com sucesso!`);
    }
  } catch (error) {
    console.error('Erro ao salvar dados da API:', error);
  }
};

module.exports = { saveBattlehData }
