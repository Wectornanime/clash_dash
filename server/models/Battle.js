const mongoose = require('mongoose');

const CardSchema = new mongoose.Schema({
  name: String,
  id: Number,
  iconUrl: String
});

const PlayerSchema = new mongoose.Schema({
  name: String,
  playerTag: String,
  startingTrophies: Number,
  cards: [CardSchema]
});

const BattleSchema = new mongoose.Schema({
  player1: PlayerSchema,
  player2: PlayerSchema,
  p1_crowns: Number,
  p2_crowns: Number,
  battleTime: Date
});

module.exports = mongoose.model('Battle', BattleSchema);
