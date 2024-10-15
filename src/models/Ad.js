const mongoose = require('mongoose');

const AdSchema = new mongoose.Schema({
    title: {type: String, required: true},
    description: String,
    videourl: {type: String, required: true},
    reward: {type: Number, default: 10},
});

module.exports = mongoose.model('Ad', AdSchema);