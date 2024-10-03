const mongoose = require('mongoose');
const Battle = require('../models/Battle');

async function getCardWinLossPercentage(cardName, startTime, endTime) {
  try {
    const result = await Battle.aggregate([
      {
        $match: {
          battleTime: { $gte: new Date(startTime), $lte: new Date(endTime) }
        }
      },
      {
        $project: {
          player1HasCard: {
            $gt: [
              {
                $size: {
                  $filter: {
                    input: "$player1.cards",
                    as: "card",
                    cond: { $eq: ["$$card.name", cardName] }
                  }
                }
              },
              0
            ]
          },
          player2HasCard: {
            $gt: [
              {
                $size: {
                  $filter: {
                    input: "$player2.cards",
                    as: "card",
                    cond: { $eq: ["$$card.name", cardName] }
                  }
                }
              },
              0
            ]
          },
          p1_crowns: 1,
          p2_crowns: 1
        }
      },
      {
        $match: {
          $or: [
            { player1HasCard: true },
            { player2HasCard: true }
          ]
        }
      },
      {
        $group: {
          _id: null,
          wins: {
            $sum: {
              $cond: [{ $gt: ["$p1_crowns", "$p2_crowns"] }, 1, 0]
            }
          },
          losses: {
            $sum: {
              $cond: [{ $lt: ["$p1_crowns", "$p2_crowns"] }, 1, 0]
            }
          },
          total: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          wins: 1,
          losses: 1,
          total: 1,
          winPercentage: {
            $multiply: [{ $divide: ["$wins", "$total"] }, 100]
          },
          lossPercentage: {
            $multiply: [{ $divide: ["$losses", "$total"] }, 100]
          }
        }
      }
    ]);

    if (result.length === 0) {
      return {
        wins: 0,
        losses: 0,
        total: 0,
        winPercentage: 0,
        lossPercentage: 0
      };
    }

    return result[0];
  } catch (error) {
    console.error('Erro ao calcular porcentagens:', error);
    throw error;
  }
}

async function getHighWinRateDecks(startDate, endDate, winRateThreshold) {
  try {
    const results = await Battle.aggregate([
      {
        $match: {
          battleTime: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $project: {
          player1Cards: '$player1.cards.name',
          player2Cards: '$player2.cards.name',
          p1_crowns: '$p1_crowns',
          p2_crowns: '$p2_crowns'
        }
      },
      {
        $group: {
          _id: {
            player1Deck: '$player1Cards',
            player2Deck: '$player2Cards'
          },
          wins: {
            $sum: {
              $cond: [
                { $gt: ['$p1_crowns', '$p2_crowns'] }, 1, 0
              ]
            }
          },
          totalBattles: { $sum: 1 }
        }
      },
      {
        $project: {
          winRate: {
            $multiply: [
              { $divide: ['$wins', '$totalBattles'] },
              100
            ]
          },
          deck: '$_id'
        }
      },
      {
        $match: {
          winRate: { $gt: winRateThreshold }
        }
      }
    ]);

    console.log(results.map(result => ({
      player1Deck: result.deck.player1Deck,
      player2Deck: result.deck.player2Deck,
      winRate: result.winRate
    })));
  } catch (error) {
    console.error(error);
  }
}

async function calcularDerrotasPorCombo(cartasCombo, startTime, endTime) {
  try {
    // Converter os timestamps para Date
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    // Usar a agregação para calcular as derrotas
    const resultado = await Battle.aggregate([
      {
        $match: {
          battleTime: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $project: {
          player1Combo: {
            $size: {
              $filter: {
                input: "$player1.cards",
                as: "card",
                cond: { $in: ["$$card.name", cartasCombo] }
              }
            }
          },
          player2Combo: {
            $size: {
              $filter: {
                input: "$player2.cards",
                as: "card",
                cond: { $in: ["$$card.name", cartasCombo] }
              }
            }
          },
          p1_crowns: 1,
          p2_crowns: 1
        }
      },
      {
        $group: {
          _id: null,
          derrotas: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $and: [{ $lt: ["$p1_crowns", "$p2_crowns"] }, { $eq: ["$player1Combo", cartasCombo.length] }] },
                    { $and: [{ $lt: ["$p2_crowns", "$p1_crowns"] }, { $eq: ["$player2Combo", cartasCombo.length] }] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    // Se não houver resultados, retornar derrotas 0
    if (resultado.length === 0) {
      return {
        derrotas: 0,
        message: 'Nenhuma derrota encontrada com o combo de cartas no intervalo.'
      };
    }

    return resultado[0].derrotas;
  } catch (error) {
    console.error('Erro ao calcular derrotas:', error);
    throw new Error('Erro ao calcular derrotas.');
  }
}

async function listarCartasMaisFrequentesEmVitorias() {
  try {
    const resultado = await Battle.aggregate([
      {
        $project: {
          vencedor1: { $gt: ["$p1_crowns", "$p2_crowns"] },
          vencedor2: { $gt: ["$p2_crowns", "$p1_crowns"] },
          player1_cards: "$player1.cards",
          player2_cards: "$player2.cards"
        }
      },
      {
        $project: {
          cartasVencedoras: {
            $cond: [
              { $eq: ["$vencedor1", true] },
              "$player1_cards",
              {
                $cond: [{ $eq: ["$vencedor2", true] }, "$player2_cards", []]
              }
            ]
          }
        }
      },
      { $unwind: "$cartasVencedoras" },
      {
        $group: {
          _id: "$cartasVencedoras.name",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 } // Limitando para as 10 cartas mais frequentes
    ]);

    return resultado;
  } catch (error) {
    console.error('Erro ao listar as cartas mais frequentes em vitórias:', error);
    throw new Error('Erro ao listar as cartas mais frequentes em vitórias.');
  }
}

async function cartasComMaioresTaxasDeVitoria(startTime, endTime) {
  try {
    const resultado = await Battle.aggregate([
      {
        $match: {
          battleTime: {
            $gte: new Date(startTime),
            $lte: new Date(endTime)
          }
        }
      },
      {
        $project: {
          vencedor1: { $gt: ["$p1_crowns", "$p2_crowns"] },
          vencedor2: { $gt: ["$p2_crowns", "$p1_crowns"] },
          player1_cards: "$player1.cards",
          player2_cards: "$player2.cards"
        }
      },
      {
        $facet: {
          vitorias: [
            {
              $project: {
                cartasVencedoras: {
                  $cond: [
                    { $eq: ["$vencedor1", true] },
                    "$player1_cards",
                    {
                      $cond: [{ $eq: ["$vencedor2", true] }, "$player2_cards", []]
                    }
                  ]
                }
              }
            },
            { $unwind: "$cartasVencedoras" },
            {
              $group: {
                _id: "$cartasVencedoras.name",
                vitorias: { $sum: 1 }
              }
            }
          ],
          aparicoes: [
            { $unwind: "$player1.cards" },
            {
              $group: {
                _id: "$player1.cards.name",
                aparicoes: { $sum: 1 }
              }
            },
            { $unwind: "$player2.cards" },
            {
              $group: {
                _id: "$player2.cards.name",
                aparicoes: { $sum: 1 }
              }
            },
            {
              $group: {
                _id: "$_id",
                aparicoes: { $sum: "$aparicoes" }
              }
            }
          ]
        }
      },
      {
        $project: {
          taxasDeVitoria: {
            $map: {
              input: "$vitorias",
              as: "vitoria",
              in: {
                carta: "$$vitoria._id",
                taxaVitoria: {
                  $divide: [
                    "$$vitoria.vitorias",
                    {
                      $cond: {
                        if: {
                          $eq: [
                            { $type: { $arrayElemAt: ["$aparicoes.aparicoes", { $indexOfArray: ["$aparicoes._id", "$$vitoria._id"] }] } },
                            "double"
                          ]
                        },
                        then: { $arrayElemAt: ["$aparicoes.aparicoes", { $indexOfArray: ["$aparicoes._id", "$$vitoria._id"] }] },
                        else: 1
                      }
                    }
                  ]
                }
              }
            }
          }
        }
      },
      { $sort: { "taxasDeVitoria.taxaVitoria": -1 } },
      { $limit: 10 } // Limitando para as 10 cartas com maiores taxas de vitória
    ]);

    return resultado;
  } catch (error) {
    console.error('Erro ao calcular as cartas com maiores taxas de vitória:', error);
    throw new Error('Erro ao calcular as cartas com maiores taxas de vitória.');
  }
}

async function rankingCartasMaisDerrotas(startTime, endTime) {
  try {
    const resultado = await Battle.aggregate([
      {
        $match: {
          battleTime: {
            $gte: new Date(startTime),
            $lte: new Date(endTime)
          }
        }
      },
      {
        $project: {
          vencedor1: { $gt: ["$p1_crowns", "$p2_crowns"] },
          vencedor2: { $gt: ["$p2_crowns", "$p1_crowns"] },
          player1_cards: "$player1.cards",
          player2_cards: "$player2.cards"
        }
      },
      {
        $facet: {
          derrotas: [
            {
              $project: {
                cartasDerrotadas: {
                  $cond: [
                    { $eq: ["$vencedor1", true] },
                    "$player2_cards",
                    {
                      $cond: [{ $eq: ["$vencedor2", true] }, "$player1_cards", []]
                    }
                  ]
                }
              }
            },
            { $unwind: "$cartasDerrotadas" },
            {
              $group: {
                _id: "$cartasDerrotadas.name",
                derrotas: { $sum: 1 }
              }
            },
            { $sort: { derrotas: -1 } }
          ]
        }
      },
      { $limit: 10 } // Limitando para as 10 cartas com mais derrotas
    ]);

    return resultado;
  } catch (error) {
    console.error('Erro ao calcular o ranking das cartas com mais derrotas:', error);
    throw new Error('Erro ao calcular o ranking das cartas com mais derrotas.');
  }
}


module.exports = { getCardWinLossPercentage, getHighWinRateDecks, calcularDerrotasPorCombo, listarCartasMaisFrequentesEmVitorias, cartasComMaioresTaxasDeVitoria, rankingCartasMaisDerrotas }
