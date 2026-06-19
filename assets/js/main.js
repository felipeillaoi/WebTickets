/* ==========================================================================
   0. CONFIGURAÇÃO DO FIREBASE (BACK-END)
   ========================================================================== */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB2sPFZTSoayC_9pr_VUVQ3C3WtU_tQCkc",
  authDomain: "webpasseios.firebaseapp.com",
  projectId: "webpasseios",
  storageBucket: "webpasseios.firebasestorage.app",
  messagingSenderId: "112124754333",
  appId: "1:112124754333:web:be6f12e0f17b551b1c1774"
};

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
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
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

    onAuthStateChanged(auth, (user) => {
        if (!btnLogin || !userProfile || !userEmailDisplay) return;

        if (user) {
            btnLogin.style.display = "none";
            userProfile.style.display = "flex";
            userEmailDisplay.textContent = user.email; 
        } else {
            btnLogin.style.display = "inline-block";
            userProfile.style.display = "none";
        }
    });

    if (btnLogout) {
        btnLogout.addEventListener("click", () => {
            signOut(auth).then(() => window.location.reload());
        });
    }
}

/* ==========================================================================
   3. INICIALIZAÇÃO GERAL
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
    setupAuthListener();
    carregarPacotesAdmin();    // Para o Dashboard
    carregarPacotesVitrine();  // Para o Index (Pública)
});

/* ==========================================================================
   4. AUTENTICAÇÃO: REGISTRO E LOGIN
   ========================================================================== */
const formRegistro = document.getElementById('form-registro');
if (formRegistro) {
    formRegistro.addEventListener('submit', (e) => {
        e.preventDefault(); 
        const email = document.getElementById('email-registro').value;
        const senha = document.getElementById('senha-registro').value;

        createUserWithEmailAndPassword(auth, email, senha)
            .then(() => {
                alert("Conta criada! Redirecionando...");
                window.location.href = "login.html"; 
            })
            .catch((error) => alert("Erro: " + error.message));
    });
}

const formLogin = document.getElementById('form-login');
const adminEmail = "lagsalve87@gmail.com"; 

if (formLogin) {
    formLogin.addEventListener('submit', (e) => {
        e.preventDefault(); 
        const email = document.getElementById('email').value;
        const senha = document.getElementById('password').value;

        signInWithEmailAndPassword(auth, email, senha)
            .then((userCredential) => {
                window.location.href = (userCredential.user.email === adminEmail) ? "dashboard.html" : "../index.html"; 
            })
            .catch(() => alert("E-mail ou senha incorretos."));
    });
}

/* ==========================================================================
   6. LOGOUT DASHBOARD
   ========================================================================== */
const btnLogoutDashboard = document.getElementById("btn-logout-dashboard");
if (btnLogoutDashboard) {
    btnLogoutDashboard.addEventListener("click", () => {
        signOut(auth).then(() => window.location.href = "../index.html");
    });
}

/* ==========================================================================
   7. BANCO DE DADOS: FUNÇÕES ADMIN
   ========================================================================== */
const travelForm = document.getElementById('travel-form');
const adminGrid = document.getElementById('admin-grid');

async function carregarPacotesAdmin() {
    if (!adminGrid) return;
    const querySnapshot = await getDocs(collection(db, "pacotes"));
    adminGrid.innerHTML = '';
    querySnapshot.forEach((doc) => {
        const pacote = doc.data();
        adminGrid.innerHTML += `
            <div class="travel-card admin-card">
                <img src="${pacote.imagem}" alt="${pacote.destino}" class="card-img">
                <div class="card-content">
                    <h3>${pacote.destino}</h3>
                    <p>${pacote.descricao}</p>
                    <p>R$ ${parseFloat(pacote.preco).toFixed(2)}</p>
                    <button class="btn-action" onclick="deletarPacote('${doc.id}')">🗑️ Excluir</button>
                </div>
            </div>`;
    });
}

if (travelForm) {
    travelForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await addDoc(collection(db, "pacotes"), {
            destino: document.getElementById('destino').value,
            preco: Number(document.getElementById('preco').value),
            imagem: document.getElementById('imagem-url').value,
            descricao: document.getElementById('descricao').value
        });
        alert("Cadastrado!");
        travelForm.reset();
        carregarPacotesAdmin();
    });
}

window.deletarPacote = async function(id) {
    await deleteDoc(doc(db, "pacotes", id));
    carregarPacotesAdmin();
}

/* ==========================================================================
   8. VITRINE PÚBLICA: CARREGAR PACOTES NO INDEX.HTML
   ========================================================================== */
async function carregarPacotesVitrine() {
    const publicGrid = document.getElementById("public-grid");
    if (!publicGrid) return;

    try {
        const querySnapshot = await getDocs(collection(db, "pacotes"));
        publicGrid.innerHTML = ''; 

        querySnapshot.forEach((doc) => {
            const p = doc.data();
            publicGrid.innerHTML += `
                <div class="travel-card">
                    <img src="${p.imagem}" alt="${p.destino}" class="card-img">
                    <div class="card-content">
                        <h3>${p.destino}</h3>
                        <p class="card-desc">${p.descricao}</p>
                        <p class="card-price">R$ ${parseFloat(p.preco).toFixed(2)}</p>
                        <button class="form-btn form-btn--submit" style="margin-top: 10px;">Tenho Interesse</button>
                    </div>
                </div>
            `;
        });
    } catch (e) {
        console.error("Erro ao carregar vitrine:", e);
    }
}
