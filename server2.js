import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

// Importa o modelo de usuário
import User from './models/User.js';

// Simula o __dirname no ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inicializando o app Express
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir arquivos estáticos da pasta 'produto-public'
app.use(express.static(path.join(__dirname, 'produto-public')));

// Conexão com MongoDB (para o CRUD de usuários)
mongoose.connect("mongodb+srv://user01:wPFKWnRqWaOYbWWE@cluster0.eziai.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
    .then(() => console.log("Conectado ao banco de dados com sucesso"))
    .catch(() => console.log("Erro ao conectar no Banco de dados"));

// ------- Redirecionamento para /usuarios ------- //
app.get('/', (req, res) => {
  res.redirect('/usuarios');
});

// ------- Rotas de Produtos ------- //
const produtos = [];

app.get('/produtos', (req, res) => {
    res.sendFile(path.join(__dirname, 'produto-public', 'produto.html'));
  });
  app.get('/api/produtos', (req, res) => {
    res.json(produtos); // Retorna o array de produtos como JSON
  });  

// Criando uma rota POST para adicionar produtos
app.post('/produtos', async (req, res) => {
  const { produto, quantidade, descricao } = req.body;
  const id = Date.now().toString();  // Adiciona um ID único baseado na data
  const novoProduto = { id, produto, quantidade, descricao };
  produtos.push(novoProduto);
  console.log("Adicionando produto", novoProduto);
  try {
    res.status(201).json(novoProduto);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Criando uma rota DELETE para excluir produtos
app.delete('/produtos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const index = produtos.findIndex(produto => produto.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }
    produtos.splice(index, 1);  // Remove o produto da lista
    res.status(204).send();  // No conteúdo ao deletar
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ------- Rotas de Usuários ------- //

// Servir a página de cadastro de usuários
app.get('/usuarios', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
  app.use(express.static(path.join(__dirname, 'public')));
});

// Buscar Usuarios
app.get('/listar', async (req, res) => {
  const users = await User.find();
  return res.json(users);
});

// Cadastrar Usuarios
app.post('/cadastrar', async (req, res) => {
  const { nome, email, endereco } = req.body;

  if (!nome || !email || !endereco) {
    return res.status(400).json({ message: 'Campos obrigatórios ausentes' });
  }

  await User.create({ nome, email, endereco });
  return res.status(201).json({ message: 'Usuário criado com sucesso!' });
});

// Atualizar Usuarios
app.patch('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { nome, email, endereco } = req.body;

    if (!nome || !email || !endereco) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const result = await User.updateOne(
      { _id: id },  
      { $set: { nome, email, endereco } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Deletar Usuarios
app.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const result = await User.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Iniciando o servidor
const port = 3000;
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
