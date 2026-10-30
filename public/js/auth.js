document.addEventListener('DOMContentLoaded', () => {
    let isLoginMode = true;

    const form = document.getElementById('auth-form');
    const formTitle = document.getElementById('form-title');
    const formSubtitle = document.getElementById('form-subtitle');
    const submitBtn = document.getElementById('submit-btn');
    const toggleBtn = document.getElementById('toggle-btn');
    const toggleText = document.getElementById('toggle-text');
    const messageDiv = document.getElementById('auth-message');

    // Reindirizza se già loggato
    if (localStorage.getItem('jwt_token')) {
        window.location.href = 'map.html';
        return;
    }

    toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        isLoginMode = !isLoginMode;
        messageDiv.style.display = 'none';

        if (isLoginMode) {
            formTitle.textContent = 'Accedi alla Mappa';
            formSubtitle.textContent = 'Inserisci le tue credenziali per caricare i tuoi dati salvati';
            submitBtn.textContent = 'Accedi';
            toggleText.textContent = 'Non hai un account?';
            toggleBtn.textContent = 'Registrati';
        } else {
            formTitle.textContent = 'Crea un Account';
            formSubtitle.textContent = 'Registrati per iniziare a salvare la tua mappa personalizzata';
            submitBtn.textContent = 'Registrati';
            toggleText.textContent = 'Hai già un account?';
            toggleBtn.textContent = 'Accedi';
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!username || !password) {
            showMessage('Inserisci sia username che password.', 'error');
            return;
        }

        const endpoint = isLoginMode ? '/api/login' : '/api/register';

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok) {
                showMessage(data.error || 'Errore durante la richiesta.', 'error');
                return;
            }

            if (isLoginMode) {
                localStorage.setItem('jwt_token', data.token);
                localStorage.setItem('username', data.username);
                showMessage('Login effettuato con successo! Reindirizzamento...', 'success');
                setTimeout(() => {
                    window.location.href = 'map.html';
                }, 1000);
            } else {
                showMessage('Registrazione completata! Ora puoi effettuare il login.', 'success');
                toggleBtn.click();
            }
        } catch (err) {
            showMessage('Errore di connessione con il server.', 'error');
        }
    });

    function showMessage(msg, type) {
        messageDiv.textContent = msg;
        messageDiv.className = `auth-message ${type}`;
    }
});
