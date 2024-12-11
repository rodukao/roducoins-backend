const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

const frontendURL = process.env.FRONT_END_URL; // Ajuste conforme sua URL do frontend

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

// POST /auth/forgot-password
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
  
    try {
      // Buscar o usuário pelo e-mail
      const user = await User.findOne({ email });
      // Mesmo que o usuário não exista, respondemos a mesma mensagem para não revelar se o e-mail está cadastrado
      if (!user) {
        return res.json({ message: 'Se este e-mail estiver cadastrado, você receberá instruções em breve.' });
      }
  
      // Gerar token aleatório
      const token = crypto.randomBytes(32).toString('hex');
      // Define a expiração do token (1 hora a partir de agora)
      const expires = Date.now() + 3600000; // 1 hora
  
      user.resetPasswordToken = token;
      user.resetPasswordExpires = expires;
      await user.save();
  
      // Criar o link de redefinição de senha
      const resetLink = `${frontendURL}/reset-password?token=${token}`;
  
      const subject = 'Recuperação de Senha - Roducoins';
      const text = `Você solicitou a recuperação de senha. 
  Por favor, clique no link abaixo para redefinir sua senha:
  ${resetLink}
  
  Se você não solicitou isso, ignore este e-mail.`;
  
      // Enviar e-mail com o link
      await sendEmail({
        to: email,
        subject,
        text
      });
  
      return res.json({ message: 'Se este e-mail estiver cadastrado, você receberá instruções em breve.' });
    } catch (error) {
      console.error('Erro ao processar forgot-password:', error);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  });

  router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
  
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token e nova senha são obrigatórios.' });
    }
  
    try {
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() } // Verifica se o token não expirou
      });
  
      if (!user) {
        return res.status(400).json({ error: 'Token inválido ou expirado.' });
      }
  
      // Atualizar a senha do usuário
      user.password = newPassword;
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();
  
      res.json({ message: 'Senha redefinida com sucesso. Você pode fazer login agora.' });
    } catch (error) {
      console.error('Erro ao redefinir a senha:', error);
      res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  });

module.exports = router;