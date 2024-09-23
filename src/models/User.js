const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    username: {type: String, require: true, unique: true},
    email: {type: String, require: true, unique: true},
    password: {type: String, require: true},
    roducoins: {type: Number, default: 0},
    createdAt: {type: Date, default: Date.now}
});

//Middleware para hash da senha antes de salvar
UserSchema.pre('save', async function (next) {
    if(!this.isModified('password')) return next();

    try{
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

//Método para comparar senhas
UserSchema.methods.comparePassword = function (password) {
    return bcrypt.compare(password, this.password);
}

module.exports = mongoose.model('User', UserSchema);