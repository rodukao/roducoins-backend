const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

//Rota de registro
router.post('/register', async (req, res) => {
    const {username, email, password} = req.body;

    try{
        const existingUser = await User.findOne({email});
        if(existingUser) {
            return res.status(400).json({error: 'E-mail já está em uso.'})
        }

        const user = new User({username, email, password});
        await user.save();

        // Gerar token JWT
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {
            expiresIn: '1d',
        });

        res.status(201).json({token});
    } catch(err){
        res.status(500).json({error: 'Erro no servidor.'});
    }
});

//Rota de login
router.post('/login', async (req, res) => {
    const {email, password} = req.body;

    try{
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({error: 'Credenciais inválidas.'});
        }

        const isMatch = await user.comparePassword(password);
        if(!isMatch){
            return res.status(400).json({error: 'Credenciais inválidas.'});
        }

        //Gerar token JWT
        const token = jwt.sign({ id:user._id }, process.env.JWT_SECRET, {
            expiresIn: '1d',
        });

        res.status(200).json({token});
    } catch(err){
        res.status(500).json({error: 'Erro no servidor.'});
    }
});

module.exports = router;