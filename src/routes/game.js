const express = require('express');
const router = express.Router();
const Word = require('../models/Word'); // Importar o modelo Word
const Game = require('../models/Game');
const User = require('../models/User');
const authMiddleware = require('../middlewares/auth');

// Rota para iniciar o jogo
router.post('/start',authMiddleware, async (req, res) => {
  const { length, attempts, bet } = req.body;

  console.log(length, attempts, bet);

  try {
    // Buscar uma palavra aleatória do tamanho solicitado
    const words = await Word.aggregate([
      { $match: { length: length } },
      { $sample: { size: 1 } } // Pega uma palavra aleatória
    ]);

    if (words.length > 0) {
      const word = words[0].word;

      // Verificar se o usuário tem Roducoins suficientes
      console.log('req.userId:', req.userId);
      const user = await User.findById(req.userId);
      console.log(user)
      if (user.roducoins < bet) {
        return res.status(400).json({ error: 'Saldo insuficiente.' });
      }

      // Deduzir a aposta do saldo do usuário
      user.roducoins -= bet;
      await user.save();

      // Criar e salvar o jogo no banco de dados
      const game = new Game({
        userId: req.userId,
        word: word,
        attemptsLeft: attempts,
        totalAttempts: attempts,
        bet: bet,
        guessedLetters: [],
        correctLetters: Array(word.length).fill(null),
      });

      await game.save();

      // Retornar os detalhes do jogo (sem revelar a palavra)
      res.json({
        gameId: game._id,
        gameData: {
          attemptsLeft: game.attemptsLeft,
          totalAttempts: game.totalAttempts,
          correctLetters: game.correctLetters,
          guessedLetters: game.guessedLetters,
          bet: game.bet,
        },
        message: 'Jogo iniciado!',
      });
    } else {
      res.status(404).json({ error: "Nenhuma palavra encontrada com esse tamanho." });
    }
  } catch (error) {
    res.status(500).json({ error: "Erro ao iniciar o jogo." });
  }
});

router.post('/guess', authMiddleware, async (req, res) => {
  const { gameId, guessedLetter } = req.body;

  if (!guessedLetter || guessedLetter.length !== 1) {
    return res.status(400).json({ error: 'Envie uma única letra válida.' });
  }

  try {
    // Recuperar o jogo do banco de dados
    const game = await Game.findById(gameId);

    if (!game) {
      return res.status(404).json({ error: 'Jogo não encontrado.' });
    }

    // Verificar se o jogo pertence ao usuário
    if (game.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Acesso negado.' });
    }

    if (game.status !== 'active') {
      return res.status(400).json({ error: 'O jogo já foi finalizado.' });
    }

    // Verificar se a letra já foi adivinhada
    if (game.guessedLetters.includes(guessedLetter)) {
      return res.status(400).json({ error: 'Letra já adivinhada.' });
    }

    // Adicionar a letra às letras adivinhadas
    game.guessedLetters.push(guessedLetter);

    let correctGuess = false;

    // Atualizar as letras corretas
    for (let i = 0; i < game.word.length; i++) {
      if (game.word[i] === guessedLetter) {
        game.correctLetters[i] = guessedLetter;
        correctGuess = true;
      }
    }

    if (!correctGuess) {
      game.attemptsLeft -= 1;
    }

    // Verificar se o jogo terminou
    const wordGuessed = game.correctLetters.every((letter) => letter !== null);
    const gameOver = wordGuessed || game.attemptsLeft === 0;

    let reward = 0;

    if (gameOver) {
      if (wordGuessed) {
        // Jogador venceu
        const multiplier = calculateMultiplier(game.word.length, game.attemptsLeft);
        reward = game.bet * multiplier;

        // Atualizar o saldo do usuário
        const user = await User.findById(req.userId);
        user.roducoins += reward;
        await user.save();

        game.status = 'won';
      } else {
        // Jogador perdeu
        game.status = 'lost';
      }

      await game.save();

      res.json({
        message:
          game.status === 'won'
            ? `Parabéns! Você venceu e ganhou ${reward} Roducoins.`
            : 'Você perdeu! Tente novamente.',
        gameData: {
          attemptsLeft: game.attemptsLeft,
          totalAttempts: game.totalAttempts,
          correctLetters: game.correctLetters,
          guessedLetters: game.guessedLetters,
          wordGuessed,
          gameOver: true,
          reward,
          bet: game.bet,
        },
      });
    } else {
      // Jogo continua
      await game.save();

      res.json({
        message: 'Adivinhe outra letra!',
        gameData: {
          attemptsLeft: game.attemptsLeft,
          totalAttempts: game.totalAttempts,
          correctLetters: game.correctLetters,
          guessedLetters: game.guessedLetters,
          gameOver: false,
          wordGuessed: false,
        },
      });
    }
  } catch (error) {
    console.error('Erro ao processar a adivinhação:', error);
    res.status(500).json({ error: 'Erro ao processar a adivinhação.' });
  }
});

router.post('/giveup', authMiddleware, async (req, res) => {
  const {gameId} = req.body;

  try{
    const game = await Game.findById(gameId);

    if(!game){
      return res.status(404).json({error: 'Jogo não encontrado.'});
    }

    if(game.userId.toString() !== req.userId){
      return res.status(403).json({error: 'Acesso negado.'});
    }

    if(game.status !== 'active'){
      return res.status(400).json({error: 'O jogo já foi finalizado.'});
    }

    game.status = 'lost';
    game.attemptsLeft = 0;
    game.gameOver = true;
    await game.save();

    res.json({
      message: 'Você desistiu do jogo.',
      gameData: {
        attemptsLeft: game.attemptsLeft,
        totalAttempts: game.totalAttempts,
        correctLetters: game.correctLetters,
        guessedLetters: game.guessedLetters,
        gameOver: true,
        wordGuessed: false,
        reward: 0,
        bet: game.bet,
      },
    });

  } catch(error){
    console.error('Erro ao desistir do jogo:', error);
    res.status(500).json({error: 'Erro ao desistir do jogo.'});
  }
});

// Função para calcular o multiplicador
function calculateMultiplier(wordLength, attemptsLeft) {
  // Exemplo simples: você pode ajustar conforme necessário
  return 1 + wordLength * 0.1 + attemptsLeft * 0.05;
}

  
  
  module.exports = router;
