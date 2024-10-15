const mongoose = require('mongoose');
const Word = require('./src/models/Word'); // Importar o modelo Word

// Conectar ao MongoDB
mongoose.connect('mongodb://localhost:27017/roducoinsdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const cleanWords = async () => {
  try {
    // Remover palavras que contenham "." ou "-"
    const result = await Word.deleteMany({
      word: { $regex: /[.-]/ }
    });

    console.log(`${result.deletedCount} palavras removidas do banco de dados.`);

    mongoose.connection.close(); // Fechar a conexão após a operação
  } catch (error) {
    console.error('Erro ao limpar palavras:', error);
    mongoose.connection.close(); // Fechar a conexão em caso de erro também
  }
};

cleanWords();
