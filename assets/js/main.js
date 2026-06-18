/* ==========================================================================
   1. GERENCIAMENTO DE TEMA (DARK / LIGHT MODE)
   ========================================================================== */

// 1.1. Verifica a preferência salva no navegador assim que o script é lido
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
}

// 1.2. Função disparada pelo clique no botão de Lua/Sol
function toggleTheme() {
    // Alterna a classe visual no body
    document.body.classList.toggle('dark-mode');
    
    // Salva a nova escolha na memória do navegador (localStorage)
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
}


/* ==========================================================================
   2. GERENCIAMENTO DE ESTADO DE LOGIN (FRONT-END)
   ========================================================================== */

// 2.1. Variáveis de simulação (Serão substituídas pela resposta do Firebase depois)
const isUserLoggedIn = false; 
const userEmailText = "marcos@engenharia.com"; 

// 2.2. Função que atualiza a interface do cabeçalho
function checkLoginState() {
    const btnLogin = document.getElementById("nav-btn-login");
    const userProfile = document.getElementById("nav-user-profile");
    const userEmailDisplay = document.getElementById("nav-user-email");

    // TRAVA DE SEGURANÇA: Se a página atual não tiver esses botões (ex: tela de registro), sai da função para não dar erro
    if (!btnLogin || !userProfile || !userEmailDisplay) return;

    if (isUserLoggedIn) {
        // Usuário LOGADO: Esconde botão de login, mostra o perfil com e-mail
        btnLogin.style.display = "none";
        userProfile.style.display = "flex";
        userEmailDisplay.textContent = userEmailText;
    } else {
        // Usuário DESLOGADO: Mostra botão de login, esconde o perfil
        btnLogin.style.display = "inline-block";
        userProfile.style.display = "none";
    }
}


/* ==========================================================================
   3. INICIALIZAÇÃO GERAL
   ========================================================================== */

// Aguarda todo o HTML da página ser carregado antes de rodar as funções
document.addEventListener("DOMContentLoaded", () => {
    checkLoginState();
});