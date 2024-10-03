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

module.exports = { getCardWinLossPercentage, getHighWinRateDecks, calcularDerrotasPorCombo }
