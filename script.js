// ========================================
// CONFIGURAÇÃO DA API
// ========================================

const API_URL = "http://localhost:5000/api/eventos"

// ========================================
// FUNÇÕES DE CRUD (Create, Read, Update, Delete)
// ========================================

// FUNÇÃO: Buscar todos os eventos (READ)
async function buscarEventos() {
  try {
    const response = await fetch(API_URL)
    const eventos = await response.json()
    return eventos
  } catch (erro) {
    console.error("Erro ao buscar eventos:", erro)
    alert("Erro ao conectar com o servidor. Verifique se o backend está rodando.")
    return []
  }
}

// FUNÇÃO: Criar novo evento (CREATE)
async function criarEvento(evento) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(evento),
    })

    const novoEvento = await response.json()
    return novoEvento
  } catch (erro) {
    console.error("Erro ao criar evento:", erro)
    alert("Erro ao criar evento. Verifique sua conexão.")
    return null
  }
}

// FUNÇÃO: Atualizar evento existente (UPDATE)
async function atualizarEvento(id, dadosAtualizados) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dadosAtualizados),
    })

    const eventoAtualizado = await response.json()
    return eventoAtualizado
  } catch (erro) {
    console.error("Erro ao atualizar evento:", erro)
    alert("Erro ao atualizar evento.")
    return null
  }
}

// FUNÇÃO: Deletar evento (DELETE)
async function deletarEvento(id) {
  try {
    await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    })
  } catch (erro) {
    console.error("Erro ao deletar evento:", erro)
    alert("Erro ao deletar evento.")
  }
}

// ========================================
// FUNÇÕES DE INTERFACE (UI)
// ========================================

// FUNÇÃO: Mostrar eventos na tela
async function exibirEventos() {
  // Busca todos os eventos do backend
  const eventos = await buscarEventos()

  // Pega o elemento HTML onde vamos mostrar os eventos
  const container = document.getElementById("listaEventos")

  // Se não houver eventos, mostra mensagem
  if (eventos.length === 0) {
    container.innerHTML = '<p class="text-center">Nenhum evento cadastrado ainda.</p>'
    return
  }

  // Cria o HTML para cada evento
  container.innerHTML = eventos
    .map(
      (evento) => `
    <div class="col-md-4 mb-3">
      <div class="card card-evento">
        <div class="card-body">
          <!-- Título do evento -->
          <h5 class="card-title">${evento.nome}</h5>
          
          <!-- Informações do evento -->
          <p class="card-text">
            <strong>Data:</strong> ${formatarData(evento.data)}<br>
            <strong>Local:</strong> ${evento.local}<br>
            <strong>Descrição:</strong> ${evento.descricao}
          </p>
          
          <!-- Botões de ação -->
          <button 
            class="btn btn-warning btn-sm btn-acao" 
            onclick="editarEvento(${evento.id})"
            aria-label="Editar evento ${evento.nome}">
            Editar
          </button>
          
          <button 
            class="btn btn-danger btn-sm btn-acao" 
            onclick="confirmarDelecao(${evento.id})"
            aria-label="Deletar evento ${evento.nome}">
            Deletar
          </button>
        </div>
      </div>
    </div>
  `,
    )
    .join("")
}

// FUNÇÃO: Formatar data para padrão brasileiro
function formatarData(data) {
  // Converte "2024-11-20" para "20/11/2024"
  const [ano, mes, dia] = data.split("-")
  return `${dia}/${mes}/${ano}`
}

// FUNÇÃO: Confirmar antes de deletar
async function confirmarDelecao(id) {
  // Pergunta ao usuário se tem certeza
  const confirmou = confirm("Tem certeza que deseja deletar este evento?")

  if (confirmou) {
    // Deleta o evento
    await deletarEvento(id)

    // Atualiza a lista na tela
    await exibirEventos()

    // Mostra mensagem de sucesso
    alert("Evento deletado com sucesso!")
  }
}

// FUNÇÃO: Editar evento
async function editarEvento(id) {
  // Busca todos os eventos
  const eventos = await buscarEventos()
  const evento = eventos.find((e) => e.id === id)

  if (evento) {
    // Preenche o formulário com os dados do evento
    document.getElementById("nome").value = evento.nome
    document.getElementById("data").value = evento.data
    document.getElementById("local").value = evento.local
    document.getElementById("descricao").value = evento.descricao

    // Guarda o ID do evento sendo editado
    document.getElementById("formEvento").dataset.editandoId = id

    // Rola a página para o formulário
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
}

// ========================================
// EVENTOS DO FORMULÁRIO
// ========================================

// Quando o formulário for enviado
document.getElementById("formEvento").addEventListener("submit", async function (e) {
  // Impede o comportamento padrão (recarregar a página)
  e.preventDefault()

  // Pega os valores dos campos do formulário
  const dadosEvento = {
    nome: document.getElementById("nome").value,
    data: document.getElementById("data").value,
    local: document.getElementById("local").value,
    descricao: document.getElementById("descricao").value,
  }

  // Verifica se está editando ou criando novo
  const editandoId = this.dataset.editandoId

  if (editandoId) {
    // ATUALIZAR evento existente
    await atualizarEvento(Number(editandoId), dadosEvento)
    alert("Evento atualizado com sucesso!")

    // Remove o ID de edição
    delete this.dataset.editandoId
  } else {
    // CRIAR novo evento
    await criarEvento(dadosEvento)
    alert("Evento cadastrado com sucesso!")
  }

  // Limpa o formulário
  this.reset()

  // Atualiza a lista de eventos na tela
  await exibirEventos()
})

// ========================================
// INICIALIZAÇÃO
// ========================================

// Quando a página carregar, mostra os eventos
window.addEventListener("load", () => {
  exibirEventos()
})

