const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors({
    origin: ['http://localhost:3000', 'https://roducoins.com.br/'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('Servidor Roducoins está rodando!');
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

//conexão com banco
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('Conectado no MongoDB'))
.catch((err) => console.log(err));

//autenticação
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const userRoutes = require('./routes/user');
app.use('/api/user', userRoutes);

const adRoutes = require('./routes/ad');
app.use('/api/ads', adRoutes);

const gameRoutes = require('./routes/game');
app.use('/api/game', gameRoutes); // Usar as rotas do jogo