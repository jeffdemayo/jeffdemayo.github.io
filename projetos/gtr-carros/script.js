const container = document.getElementById('carros-container');
const inputModelo = document.getElementById('filtroModelo');
const inputMin = document.getElementById('precoMin');
const inputMax = document.getElementById('precoMax');

let todosOsCarros = [];

function exibirCarros(lista) {
    container.innerHTML = "";
    lista.forEach(carro => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
      <img src="${carro.imagem}" alt="${carro.modelo}">
          <div class="info">
            <h3>${carro.modelo}</h3>
            <p><strong>Preço:</strong> ${carro.preco}</p>
            <p>${carro.descricao}</p>
            <a href="#" class="detalhes-btn">Ver detalhes</a>
          </div>
        `;
        card.querySelector('.detalhes-btn').addEventListener('click', e => {
            e.preventDefault();
            localStorage.setItem("carroSelecionado", JSON.stringify(carro));
            window.location.href = "detalhes.html";
        });

        container.appendChild(card);
    });
}

function aplicarFiltros() {
    const termo = inputModelo.value.toLowerCase();
    const min = parseFloat(inputMin.value) || 0;
    const max = parseFloat(inputMax.value) || Infinity;

    const filtrados = todosOsCarros.filter(carro => {
        const precoNumerico = parseFloat(carro.preco.replace("R$ ", "").replace(".", "").replace(",", "."));
        return (
            carro.modelo.toLowerCase().includes(termo) &&
            precoNumerico >= min &&
            precoNumerico <= max
        );
    });

    exibirCarros(filtrados);
}

[inputModelo, inputMin, inputMax].forEach(input => {
    input.addEventListener('input', aplicarFiltros);
});

fetch('dados.json')
    .then(res => res.json())
    .then(data => {
        todosOsCarros = data;
        exibirCarros(todosOsCarros);
    })
    .catch(err => {
        console.error("Erro ao carregar os carros:", err);
        container.innerHTML = "<p>Erro ao carregar carros.</p>";
    });

