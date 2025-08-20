let tarefas = []
let filtroAtual = 'todas'

document.addEventListener('DOMContentLoaded', () => {
    carregarTarefas()
})

function carregarTarefas() {
    const tarefasSalvas = JSON.parse(localStorage.getItem('tarefas'))
    if (tarefasSalvas) {
        tarefas = tarefasSalvas
        renderizarTarefas()
    }
}

function salvarTarefas() {
    localStorage.setItem('tarefas', JSON.stringify(tarefas))
}

function adicionarTarefa() {
    const input = document.getElementById('tarefa')
    const prioridade = document.getElementById('prioridade').value
    const texto = input.value.trim()
    const dataPlanejada = document.getElementById('data-planejada').value

    if (texto === '') {
        alert('Digite uma tarefa!')
        return
    }

    const novaTarefa = {
        id: Date.now(),
        texto,
        prioridade,
        dataPlanejada,
        dataConclusao: null,
        concluida: false
    }

    tarefas.push(novaTarefa)
    input.value = ''
    document.getElementById('data-planejada').value = ''
    renderizarTarefas()
    salvarTarefas()
}

function renderizarTarefas() {
    const lista = document.getElementById('lista-tarefas')
    lista.innerHTML = ''

    let tarefasFiltradas = tarefas
    if (filtroAtual === 'pendentes') {
        tarefasFiltradas = tarefas.filter(t => !t.concluida)
    } else if (filtroAtual === 'concluidas') {
        tarefasFiltradas = tarefas.filter(t => t.concluida)
    }

    tarefasFiltradas.forEach(tarefa => {
        const li = document.createElement('li')
        li.classList.add(`prioridade-${tarefa.prioridade}`)
        if (tarefa.concluida) li.classList.add('concluida')

        const dataExecucao = tarefa.dataPlanejada
            ? `<br><small>🕒 Prevista: ${formatarDataHora(tarefa.dataPlanejada)}</small>`
            : ''

        const dataConcluida = tarefa.dataConclusao
            ? `<br><small>✔️ Concluída: ${formatarDataHora(tarefa.dataConclusao)}</small>`
            : ''

        li.innerHTML = `
            <div>
                <strong>${tarefa.texto}</strong>
                ${dataExecucao}
                ${dataConcluida}
            </div>
            <div>
                <button onclick="alternarConclusao(${tarefa.id})">✅</button>
                <button onclick="excluirTarefa(${tarefa.id})">🗑️</button>
            </div>
        `
        lista.appendChild(li)
    })
}

function formatarDataHora(isoString) {
    const data = new Date(isoString)
    return data.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

function alternarConclusao(id) {
    tarefas = tarefas.map(t => {
        if (t.id === id) {
            const novaConclusao = !t.concluida
            return {
                ...t,
                concluida: novaConclusao,
                dataConclusao: novaConclusao ? new Date().toISOString() : null
            }
        }
        return t
    })
    renderizarTarefas()
    salvarTarefas()
}

function excluirTarefa(id) {
    tarefas = tarefas.filter(t => t.id !== id)
    renderizarTarefas()
    salvarTarefas()
}

function filtrar(tipo) {
    filtroAtual = tipo
    renderizarTarefas()
}

function mostrarMenuLimpeza() {
    document.getElementById('limpeza-opcoes').style.display = 'flex'
}

function fecharLimpeza() {
    document.getElementById('limpeza-opcoes').style.display = 'none'
}

function limparTarefas(tipo) {
    if (tipo === 'todas') {
        if (confirm('Deseja mesmo apagar TODAS as tarefas?')) {
            tarefas = []
            salvarTarefas()
        }
    } else if (tipo === 'concluidas') {
        if (tarefas.some(t => t.concluida)) {
            tarefas = tarefas.filter(t => !t.concluida)
            salvarTarefas()
            alert('Tarefas concluídas apagadas.')
        } else {
            alert('Nenhuma tarefa concluída.')
        }
    }
    fecharLimpeza()
    renderizarTarefas()
}
