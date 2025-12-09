document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.getElementById('app-container');
    let selectedUser = null;

    // --- UTILITY ---

    // Mostra un messaggio (successo o errore)
    const showMessage = (text, type = 'success') => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = text;
        appContainer.prepend(messageDiv);
        setTimeout(() => messageDiv.remove(), 5000);
    };

    // Chiama l'API principale per la sincronizzazione/download
    const callSyncApi = async (data) => {
        try {
            const response = await fetch('/api/playlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, username: selectedUser })
            });
            const result = await response.json();
            if (response.ok) {
                showMessage(result.message, 'success');
            } else {
                showMessage(`Errore API: ${result.message}`, 'error');
            }
        } catch (error) {
            showMessage(`Errore di rete: ${error.message}`, 'error');
        }
        // Torna al menu principale dopo l'azione
        renderMainMenu();
    };

    // --- FASI DEL FLOW ---

    // Fase 1: Selezione Utente
    const renderUserSelection = async () => {
        appContainer.innerHTML = '<h2>👤 Seleziona Utente</h2>';
        const cardContainer = document.createElement('div');
        cardContainer.className = 'card-container';

        try {
            const response = await fetch('/api/users');
            const users = await response.json();

            if (users.length === 0) {
                appContainer.innerHTML += '<p>Nessun utente trovato. Controlla la tua API.</p>';
                return;
            }

            users.forEach(user => {
                const userCard = document.createElement('div');
                userCard.className = 'card';
                // Simulazione immagine con emoji, l'immagine vera richiederebbe un campo 'image_url' nell'API users
                userCard.innerHTML = `
                    <p style="font-size: 40px;">👨‍💻</p>
                    <h3>${user.name}</h3>
                `;
                userCard.onclick = () => {
                    selectedUser = user.name;
                    renderMainMenu();
                };
                cardContainer.appendChild(userCard);
            });
            appContainer.appendChild(cardContainer);

        } catch (error) {
            appContainer.innerHTML += `<p class="error">Impossibile caricare gli utenti: ${error.message}</p>`;
        }
    };

    // Fase 2: Menu Principale (Libreria / Playlist)
    const renderMainMenu = () => {
        appContainer.innerHTML = `<h2>✅ Utente Selezionato: ${selectedUser}</h2><h3>Cosa vuoi fare?</h3>`;
        const cardContainer = document.createElement('div');
        cardContainer.className = 'card-container';

        const libraryCard = createCard('📚 Libreria', () => renderLibraryMenu());
        const playlistCard = createCard('🎵 Playlist', () => renderPlaylistMenu());

        cardContainer.appendChild(libraryCard);
        cardContainer.appendChild(playlistCard);
        appContainer.appendChild(cardContainer);

        appContainer.appendChild(createBackButton(renderUserSelection, 'Cambia Utente'));
    };

    // Fase 3.1: Menu Libreria (Scarica...)
    const renderLibraryMenu = () => {
        appContainer.innerHTML = '<h2>⬇️ Scarica Contenuto</h2><h3>Seleziona il tipo di contenuto da scaricare:</h3>';
        const cardContainer = document.createElement('div');
        cardContainer.className = 'card-container';

        const downloadOptions = [
            { label: 'Canzone', mode: 'track', emoji: '🎧' },
            { label: 'Artista', mode: 'artist', emoji: '🎤' },
            { label: 'Album', mode: 'album', emoji: '💿' },
            { label: 'Playlist', mode: 'playlist', emoji: '📜' }
        ];

        downloadOptions.forEach(option => {
            const card = createCard(`${option.emoji} ${option.label}`, () => renderDownloadForm(option.label, option.mode));
            cardContainer.appendChild(card);
        });

        appContainer.appendChild(cardContainer);
        appContainer.appendChild(createBackButton(renderMainMenu));
    };

    // Fase 3.2: Menu Playlist (Crea Nuova / Sincronizza)
    const renderPlaylistMenu = () => {
        appContainer.innerHTML = '<h2>🔄 Gestione Playlist</h2><h3>Seleziona l\'azione:</h3>';
        const cardContainer = document.createElement('div');
        cardContainer.className = 'card-container';

        const createCardEl = createCard('➕ Crea Nuova Sync Playlist', () => renderCreateSyncPlaylistForm());
        const syncCardEl = createCard('🔁 Sincronizza Playlist Esistente', () => renderSyncExistingPlaylistForm());

        cardContainer.appendChild(createCardEl);
        cardContainer.appendChild(syncCardEl);
        appContainer.appendChild(cardContainer);
        appContainer.appendChild(createBackButton(renderMainMenu));
    };


    // --- FASE 4: FORM ---

    // Form per Scaricare Canzone, Artista, Album, Playlist
    const renderDownloadForm = (typeLabel, mode) => {
        appContainer.innerHTML = `<h2>⬇️ Scarica ${typeLabel}</h2>`;
        const form = document.createElement('form');
        form.innerHTML = `
            <label for="url">Link Spotify ${typeLabel}:</label>
            <input type="text" id="url" name="url" placeholder="Incolla qui l'URL" required>
            <button type="submit">Avvia Download</button>
        `;

        form.onsubmit = (e) => {
            e.preventDefault();
            const url = document.getElementById('url').value;
            // Tutte usano la stessa API con modalità implicita
            callSyncApi({ mode: 'download', url: url, playlist_name: '', noN_delete: false });
        };

        appContainer.appendChild(form);
        appContainer.appendChild(createBackButton(renderLibraryMenu));
    };

    // Form per 'Crea Nuova Sync Playlist'
    const renderCreateSyncPlaylistForm = () => {
        appContainer.innerHTML = '<h2>🆕 Crea Nuova Sync Playlist</h2>';
        const form = document.createElement('form');
        form.innerHTML = `
            <label for="url">Link Playlist Spotify da Sincronizzare:</label>
            <input type="text" id="url" name="url" placeholder="Incolla qui l'URL della playlist" required>
            <label for="playlist_name">Nome della Playlist (locale):</label>
            <input type="text" id="playlist_name" name="playlist_name" placeholder="Inserisci il nome della cartella" required>
            <button type="submit">Crea e Sincronizza</button>
        `;

        form.onsubmit = (e) => {
            e.preventDefault();
            const url = document.getElementById('url').value;
            const playlist_name = document.getElementById('playlist_name').value;
            callSyncApi({ mode: 'create_synced', url: url, playlist_name: playlist_name, noN_delete: false });
        };

        appContainer.appendChild(form);
        appContainer.appendChild(createBackButton(renderPlaylistMenu));
    };

    // Form per 'Sincronizza Playlist Esistente'
    const renderSyncExistingPlaylistForm = async () => {
        appContainer.innerHTML = '<h2>🔁 Sincronizza Playlist Esistente</h2>';
        const form = document.createElement('form');
        let playlists = [];

        try {
            const response = await fetch(`/api/playlists/${selectedUser}`);
            playlists = await response.json();
        } catch (error) {
            showMessage('Errore nel recupero delle playlist esistenti.', 'error');
            appContainer.appendChild(createBackButton(renderPlaylistMenu));
            return;
        }

        if (playlists.length === 0) {
            form.innerHTML = `<p>Nessuna playlist locale trovata per l'utente <strong>${selectedUser}</strong>.</p>`;
            appContainer.appendChild(form);
            appContainer.appendChild(createBackButton(renderPlaylistMenu));
            return;
        }

        let selectOptions = playlists.map(p => `<option value="${p}">${p}</option>`).join('');

        form.innerHTML = `
            <label for="playlist_select">Seleziona la Playlist Locale:</label>
            <select id="playlist_select" name="playlist_name" required>
                ${selectOptions}
            </select>
            <label for="url">Link Playlist Spotify (sorgente per la sincronizzazione):</label>
            <input type="text" id="url" name="url" placeholder="Incolla qui l'URL della playlist" required>

            <label>
                <input type="checkbox" id="noN_delete_checkbox" name="noN_delete"> 
                Mantieni tracce eliminate (Non eliminare canzoni tolte dalla playlist sorgente)
            </label>
            <button type="submit">Sincronizza</button>
        `;

        form.onsubmit = (e) => {
            e.preventDefault();
            const playlist_name = document.getElementById('playlist_select').value;
            const url = document.getElementById('url').value;
            // noN_delete è TRUE se la checkbox NON è selezionata (quindi elimina le canzoni)
            // L'API chiede noN_delete: True = NON eliminare
            const noN_delete = document.getElementById('noN_delete_checkbox').checked;

            callSyncApi({ mode: 'sync', playlist_name: playlist_name, noN_delete: false, url: "" });
        };

        appContainer.appendChild(form);
        appContainer.appendChild(createBackButton(renderPlaylistMenu));
    };


    // --- FUNZIONI HELPER PER ELEMENTI ---

    const createCard = (title, onClick) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `<h3>${title}</h3>`;
        card.onclick = onClick;
        return card;
    };

    const createBackButton = (onClick, label = '⬅️ Indietro') => {
        const backButton = document.createElement('button');
        backButton.textContent = label;
        backButton.style.marginTop = '20px';
        backButton.style.backgroundColor = '#6c757d';
        backButton.style.color = 'white';
        backButton.style.border = 'none';
        backButton.style.padding = '10px 20px';
        backButton.style.borderRadius = '4px';
        backButton.style.cursor = 'pointer';
        backButton.onclick = onClick;
        return backButton;
    };


    // Avvia l'applicazione
    renderUserSelection();
});