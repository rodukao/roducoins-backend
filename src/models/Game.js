const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    word: {type: String, required: true},
    attemptsLeft: {type: Number, required: true},
    bet: {type: Number, required: true},
    guessedLetters: {type: [String], default: []},
    correctLetters: {type: [String], required: true},
    status: {type: String, enum: ['active', 'won', 'lost'], default: 'active'},
    createdAt: {type: Date, default: Date.now},
});

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;