/* ================= FIREBASE CDN IMPORT ================= */
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js';
import { getDatabase, ref, onValue } from 'https://www.gstatic.com/firebasejs/12.8.0/firebase-database.js';

/* ================= FIREBASE CONFIG ================= */
/* ⚠️ Replace with your real config if needed */
const firebaseConfig = {
  databaseURL: "https://royalintruders-default-rtdb.firebaseio.com"
};

const gtavLink = 'https://www.gtavco.com'

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

/* ================= DOM ELEMENTS ================= */
const container = document.getElementById('playersContainer');
const loader = document.getElementById('loader');
const searchInput = document.getElementById('searchInput');

let playersData = [];

/* ================= DATE FORMAT ================= */
function formatDOB(dateStr) {
  if (!dateStr) return 'N/A';

  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long'
  });
}

/* ================= ROLE → COLOR CLASS ================= */
function getRoleClass(role = '') {
  role = role.toLowerCase();

  if (role.includes('bat')) return 'batsman';
  if (role.includes('bowl')) return 'bowler';
  if (role.includes('all')) return 'allrounder';
  if (role.includes('keeper')) return 'wicketkeeper';

  return 'default-role';
}

/* ================= ROLE TEXT FORMAT ================= */
function formatRoleText(role = '') {
  if (!role) return 'Player';

  if (
    role.includes('Opener') &&
    role.includes('Strike rate') &&
    role.includes('125')
  ) {
    return '🏏 Opener Strike Batsman | SR >125';
  }

  return `🏏 ${role}`;
}



/* ================= RENDER PLAYERS ================= */
function renderPlayers(players) {
  container.innerHTML = '';

  if (!players.length) {
    container.innerHTML = '<p style="text-align:center">No players found</p>';
    return;
  }

  players.forEach(player => {
    const firstLetter = player.playerName
      ? player.playerName.charAt(0).toUpperCase()
      : '?';

    const roleClass = getRoleClass(player.playerRole);

    const card = document.createElement('div');
    card.className = 'player-card';

    card.innerHTML = `
      <div class="avatar">${firstLetter}</div>

      <div class="player-name">${player.playerName || 'Unknown'}</div>

      <div class="player-info">
        🎂 DOB: ${formatDOB(player.dateOfBirth)}
      </div>

      <div class="player-info">
        👕 T-Shirt No: ${player.tShirtNumber || 'N/A'}
      </div>

      <span class="style-badge ${roleClass}">
        ${formatRoleText(player.playerRole)}
      </span>
    `;

    container.appendChild(card);
  });
}

/* ================= REAL-TIME DATA LOAD ================= */
const playersRef = ref(database, 'players');

onValue(playersRef, snapshot => {
  loader.style.display = 'none';

  if (!snapshot.exists()) {
    renderPlayers([]);
    return;
  }

  playersData = Object.values(snapshot.val());
  renderPlayers(playersData);

  document.getElementById('teamCount').innerText = playersData.length;
});

/* ================= SEARCH FILTER ================= */
searchInput.addEventListener('input', e => {
  const value = e.target.value.toLowerCase();

  const filtered = playersData.filter(player =>
    (player.playerName || '').toLowerCase().includes(value) ||
    (player.playerRole || '').toLowerCase().includes(value)
  );

  renderPlayers(filtered);
});

/* ================= NAVBAR TOGGLE ================= */
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

navToggle.addEventListener('click', () => {
  navMenu.classList.toggle('show');
});


