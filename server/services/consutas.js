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


module.exports = { getCardWinLossPercentage }
