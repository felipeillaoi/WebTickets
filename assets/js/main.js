/* ==========================================================================
   0. CONFIGURAÇÃO DO FIREBASE (BACK-END)
   ========================================================================== */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB2sPFZTSoayC_9pr_VUVQ3C3WtU_tQCkc",
  authDomain: "webpasseios.firebaseapp.com",
  projectId: "webpasseios",
  storageBucket: "webpasseios.firebasestorage.app",
  messagingSenderId: "112124754333",
  appId: "1:112124754333:web:be6f12e0f17b551b1c1774"
};

// Inicializa o Firebase e os serviços
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


/* ==========================================================================
   1. GERENCIAMENTO DE TEMA (DARK / LIGHT MODE)
   ========================================================================== */
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
}
window.toggleTheme = toggleTheme; 


/* ==========================================================================
   2. GERENCIAMENTO DE ESTADO DE LOGIN (FIREBASE AUTH)
   ========================================================================== */
function setupAuthListener() {
    const btnLogin = document.getElementById("nav-btn-login");
    const userProfile = document.getElementById("nav-user-profile");
    const userEmailDisplay = document.getElementById("nav-user-email");
    const btnLogout = document.getElementById("nav-btn-logout");

    // O "Radar" do Firebase: Escuta mudanças no estado de autenticação
    onAuthStateChanged(auth, (user) => {
        // Trava: só executa se a página tiver o cabeçalho
        if (!btnLogin || !userProfile || !userEmailDisplay) return;

        if (user) {
            // USUÁRIO LOGADO: Esconde botão de login, mostra perfil e puxa o e-mail real do banco
            btnLogin.style.display = "none";
            userProfile.style.display = "flex";
            userEmailDisplay.textContent = user.email; 
        } else {
            // USUÁRIO DESLOGADO: Mostra botão de login, esconde perfil
            btnLogin.style.display = "inline-block";
            userProfile.style.display = "none";
        }
    });

    // Lógica do botão "Sair" (Logout)
    if (btnLogout) {
        btnLogout.addEventListener("click", () => {
            signOut(auth).then(() => {
                // Recarrega a página para limpar os dados da tela
                window.location.reload(); 
            }).catch((error) => {
                console.error("Erro ao sair:", error);
            });
        });
    }
}


/* ==========================================================================
   3. INICIALIZAÇÃO GERAL
   ========================================================================== */
// Aguarda o HTML carregar para ativar o ouvinte de login
document.addEventListener("DOMContentLoaded", () => {
    setupAuthListener();
});


/* ==========================================================================
   4. AUTENTICAÇÃO: REGISTRO DE NOVO USUÁRIO
   ========================================================================== */
const formRegistro = document.getElementById('form-registro');

if (formRegistro) {
    formRegistro.addEventListener('submit', (e) => {
        e.preventDefault(); 
        
        const nome = document.getElementById('nome-registro').value;
        const email = document.getElementById('email-registro').value;
        const senha = document.getElementById('senha-registro').value;

        createUserWithEmailAndPassword(auth, email, senha)
            .then((userCredential) => {
                alert(`Conta criada com sucesso para ${nome}! Redirecionando para o login...`);
                window.location.href = "login.html"; 
            })
            .catch((error) => {
                const errorCode = error.code;
                if (errorCode === 'auth/weak-password') {
                    alert("A senha deve ter pelo menos 6 caracteres.");
                } else if (errorCode === 'auth/email-already-in-use') {
                    alert("Este e-mail já está cadastrado.");
                } else {
                    alert("Erro ao criar conta: " + error.message);
                }
            });
    });
}


/* ==========================================================================
   5. AUTENTICAÇÃO: LOGIN DE USUÁRIO E REDIRECIONAMENTO (ADMIN VS CLIENTE)
   ========================================================================== */
const formLogin = document.getElementById('form-login');

// E-mail que tem permissão para acessar o Dashboard
const adminEmail = "lagsalve87@gmail.com"; 

if (formLogin) {
    formLogin.addEventListener('submit', (e) => {
        e.preventDefault(); 
        
        const email = document.getElementById('email').value;
        const senha = document.getElementById('password').value;

        signInWithEmailAndPassword(auth, email, senha)
            .then((userCredential) => {
                const user = userCredential.user;
                
                // VERIFICAÇÃO DE PERFIL (ADMIN VS CLIENTE)
                if (user.email === adminEmail) {
                    window.location.href = "dashboard.html"; 
                } else {
                    window.location.href = "../index.html"; 
                }
            })
            .catch((error) => {
                const errorCode = error.code;
                if (errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password' || errorCode === 'auth/invalid-credential') {
                    alert("E-mail ou senha incorretos.");
                } else {
                    alert("Erro ao fazer login: " + error.message);
                }
            });
    });
}

/* ==========================================================================
   6. LÓGICA DO DASHBOARD: LOGOUT ESPECÍFICO
   ========================================================================== */
const btnLogoutDashboard = document.getElementById("btn-logout-dashboard");
if (btnLogoutDashboard) {
    btnLogoutDashboard.addEventListener("click", () => {
        signOut(auth).then(() => {
            window.location.href = "../index.html"; 
        });
    });
}

/* ==========================================================================
   7. BANCO DE DADOS (FIRESTORE): SALVAR E LISTAR PACOTES
   ========================================================================== */
const travelForm = document.getElementById('travel-form');
const adminGrid = document.getElementById('admin-grid');

// Função para buscar os pacotes no banco e mostrar na tela do Admin
async function carregarPacotesAdmin() {
    if (!adminGrid) return; // Só roda se estiver na página do dashboard

    adminGrid.innerHTML = '<p>Carregando pacotes...</p>'; // Mensagem temporária

    try {
        const querySnapshot = await getDocs(collection(db, "pacotes"));
        adminGrid.innerHTML = ''; // Limpa a mensagem

        if (querySnapshot.empty) {
            adminGrid.innerHTML = '<p>Nenhum pacote cadastrado ainda.</p>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const pacote = doc.data();
            const idPacote = doc.id; // ID único gerado pelo Firebase

            // Constrói o card em HTML dinamicamente (Sem o botão editar)
            const cardHTML = `
                <div class="travel-card admin-card">
                    <img src="${pacote.imagem}" alt="${pacote.destino}" class="card-img">
                    <div class="card-content">
                        <h3 style="margin-bottom: 5px;">${pacote.destino}</h3>
                        <p class="card-desc" style="font-size: 13px; margin-bottom: 10px;">${pacote.descricao}</p>
                        <p class="card-price">R$ ${parseFloat(pacote.preco).toFixed(2)}</p>
                        
                        <div class="card-actions">
                            <button class="btn-action btn-delete" onclick="deletarPacote('${idPacote}')" style="color: #dc3545; border-color: #dc3545;">
                                🗑️ Excluir
                            </button>
                        </div>
                    </div>
                </div>
            `;
            adminGrid.innerHTML += cardHTML; // Adiciona na tela
        });
    } catch (e) {
        console.error("Erro ao carregar pacotes: ", e);
        adminGrid.innerHTML = '<p>Erro ao carregar os dados.</p>';
    }
}

// Quando o botão de SALVAR é clicado no formulário
if (travelForm) {
    travelForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Pega os valores
        const destino = document.getElementById('destino').value;
        const preco = document.getElementById('preco').value;
        const imagem = document.getElementById('imagem-url').value;
        const descricao = document.getElementById('descricao').value;

        // Desabilita o botão para não clicar duas vezes
        const btnSubmit = travelForm.querySelector('button[type="submit"]');
        btnSubmit.innerText = "Salvando...";
        btnSubmit.disabled = true;

        try {
            // Manda pro Firestore na coleção "pacotes"
            await addDoc(collection(db, "pacotes"), {
                destino: destino,
                preco: Number(preco),
                imagem: imagem,
                descricao: descricao,
                dataCriacao: new Date() // Pra organizar depois, se quiser
            });

            alert("Pacote cadastrado com sucesso!");
            travelForm.reset(); // Limpa o formulário
            carregarPacotesAdmin(); // Recarrega a lista na tela na mesma hora

        } catch (e) {
            console.error("Erro ao salvar: ", e);
            alert("Erro ao salvar o pacote.");
        } finally {
            btnSubmit.innerText = "Salvar Pacote";
            btnSubmit.disabled = false;
        }
    });
}

// Função para deletar um pacote do banco
window.deletarPacote = async function(id) {
    if (confirm("Tem certeza que deseja excluir este pacote? Essa ação não pode ser desfeita.")) {
        try {
            // Usa importação do deleteDoc (já coloquei lá no topo pra você)
            const { doc, deleteDoc } = await import("https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js");
            await deleteDoc(doc(db, "pacotes", id));
            
            alert("Pacote excluído!");
            carregarPacotesAdmin(); // Recarrega a lista
        } catch (e) {
            console.error("Erro ao deletar: ", e);
            alert("Erro ao excluir o pacote.");
        }
    }
}

// Roda a função de carregar pacotes quando a tela abre
document.addEventListener("DOMContentLoaded", () => {
    carregarPacotesAdmin();
});