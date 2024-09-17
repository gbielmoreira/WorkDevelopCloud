document.getElementById('formProduto').addEventListener('submit', async (e) => {
  e.preventDefault();

  const produtoData = getFormData();
  const form = document.getElementById('formProduto');
  const id = form.dataset.id; // ID do produto a ser atualizado

  try {
    if (id) {
      // Atualiza o produto se o ID estiver presente
      const response = await atualizarProduto(id, produtoData);
      if (response.ok) {
        alert('Produto atualizado com sucesso!');
      } else {
        alert('Erro ao atualizar produto.');
      }

      // Após a atualização, remove o ID do dataset e limpa o formulário
      delete form.dataset.id;
      form.reset(); // Limpa os campos do formulário

    } else {
      // Adiciona o produto se o ID não estiver presente
      const response = await enviarProduto(produtoData);
      if (response.ok) {
        alert('Produto adicionado com sucesso!');
      } else {
        alert('Erro ao adicionar produto.');
      }
    }

    listarProdutos(); // Atualiza a lista de produtos
  } catch (error) {
    console.error('Erro ao processar produto:', error);
  }
});



function getFormData() {
  const produto = document.getElementById('produto').value;
  const quantidade = document.getElementById('quantidade').value;
  const descricao = document.getElementById('descricao').value;

  return { produto, quantidade, descricao };
}

async function enviarProduto(produtoData) {
  return await fetch('http://localhost:3000/produtos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(produtoData),
  });
}

async function atualizarProduto(id, produtoData) {
  return await fetch(`http://localhost:3000/produtos/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(produtoData),
  });
}

async function listarProdutos() {
  const lista = document.getElementById('listaProdutos');
  lista.innerHTML = ''; // Limpa a lista antes de adicionar novos produtos

  try {
    const response = await fetch('http://localhost:3000/api/produtos');

    // Verifique se o conteúdo retornado é JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const produtos = await response.json();
      
      if (!Array.isArray(produtos)) {
        throw new TypeError('Resposta do servidor não é um array');
      }

      produtos.forEach(produto => {
        const li = document.createElement('li');
        li.innerHTML = `
          ${produto.produto} - ${produto.quantidade}
          <button class="btn-atualizar" onclick="prepararAtualizacao('${produto.id}')">Atualizar</button>
          <button class="btn-deletar" onclick="deletarProduto('${produto.id}')">Deletar</button>
        `;
        lista.appendChild(li);
      });
    } else {
      throw new Error('Resposta não é JSON');
    }
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
  }
}


async function prepararAtualizacao(id) {
  // Busca o produto pelo ID usando a lista de produtos armazenada globalmente
  const produto = produtos.find(produto => produto.id === id);

  if (!produto) {
    alert('Produto não encontrado!');
    return;
  }

  // Preenche o formulário com os dados do produto
  document.getElementById('produto').value = produto.produto;
  document.getElementById('quantidade').value = produto.quantidade;
  document.getElementById('descricao').value = produto.descricao;

  // Define o ID do produto no formulário para facilitar a atualização
  document.getElementById('formProduto').dataset.id = id;
}

async function deletarProduto(id) {
  try {
    const response = await fetch(`http://localhost:3000/produtos/${id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      alert('Produto deletado com sucesso!');
      listarProdutos(); // Atualiza a lista após a exclusão
    } else {
      alert('Erro ao deletar produto.');
    }
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
  }
}

// Carrega os produtos assim que a página é carregada
window.onload = listarProdutos;