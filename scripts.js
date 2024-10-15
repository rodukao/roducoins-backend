const fs = require('fs');
const mongoose = require('mongoose');
const Word = require('./src/models/Word'); // Importar o modelo que criamos

// Conectar ao MongoDB (utilize a mesma string de conexão que usa no seu projeto)
mongoose.connect('mongodb://localhost:27017/roducoinsdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Função para processar o arquivo de palavras
const importWords = () => {
  fs.readFile('palavras.txt', 'utf8', async (err, data) => {
    if (err) {
      console.error('Erro ao ler o arquivo:', err);
      process.exit(1);
    }

    const words = data.split('\n').map(word => word.trim()).filter(word => word.length > 2);

    try {
      for (const word of words) {
        await Word.create({ word, length: word.length });
        console.log(`Palavra ${word} inserida com sucesso!`);
      }
      console.log('Importação concluída!');
    } catch (error) {
      console.error('Erro ao inserir palavras no banco de dados:', error);
    } finally {
      mongoose.connection.close(); // Fechar conexão após a importação
    }
  });
};

importWords();
