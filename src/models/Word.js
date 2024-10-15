const mongoose = require('mongoose');

const wordSchema = new mongoose.Schema({
    word:{
        type: String,
        require: true,
        unique: true
    },
    length:{
        type: Number,
        require: true
    }
});

const Word = mongoose.model('Word', wordSchema);

module.exports = Word;