function toggleTheme() {
  // O 'toggle' adiciona a classe se ela não existir, e remove se ela já existir.
  document.body.classList.toggle('dark-mode');
}

const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
}

// 2. FUNÇÃO DO BOTÃO DE ALTERNAR TEMA
function toggleTheme() {
    // Adiciona ou remove a classe
    document.body.classList.toggle('dark-mode');
    
    // Salva a escolha na memória do navegador
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
}