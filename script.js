/**
 * Portfólio Jefferson - Modo Escuro & Navegação
 */

// Elementos do Menu
const btnMenu = document.getElementById('menu-toggle');
const menu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-menu a');

// Abrir/Fechar Menu Mobile
btnMenu.addEventListener('click', () => {
    btnMenu.classList.toggle('active');
    menu.classList.toggle('active');
});

// Fechar menu ao clicar em qualquer link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        btnMenu.classList.remove('active');
        menu.classList.remove('active');
    });
});

// Ano Footer
document.getElementById("ano-atual").textContent = new Date().getFullYear();

// Interação Botão Mensagem
const botao = document.getElementById("btnMensagem");
const feedback = document.getElementById("mensagem");

botao.addEventListener("click", () => {
    feedback.textContent = "Mensagem enviada! Vamos tomar um café e programar? 🍷";
    botao.style.display = "none";
});