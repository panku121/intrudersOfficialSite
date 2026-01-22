/* ================= FIREBASE CDN IMPORT ================= */
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js';
import { getDatabase, ref, onValue } from 'https://www.gstatic.com/firebasejs/12.8.0/firebase-database.js';

/* ================= FIREBASE CONFIG ================= */
const firebaseConfig = {
  databaseURL: "https://royalintruders-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

/* ================= DOM ELEMENTS ================= */
const container = document.getElementById('playersContainer');
const loader = document.getElementById('loader');
const searchInput = document.getElementById('searchInput');
const teamCountEl = document.getElementById('teamCount');
const nextMatchesContainer = document.getElementById('nextMatchesContainer');

let playersData = [];

/* ================= DATE FORMAT ================= */
function formatDOB(dateStr) {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
}

/* ================= UPCOMING BIRTHDAY ================= */
function isUpcomingBirthday(dob) {
  if (!dob) return false;

  const today = new Date();
  const birthDate = new Date(dob);
  let nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());

  if (nextBirthday < today) nextBirthday.setFullYear(today.getFullYear() + 1);

  const diffDays = Math.ceil((nextBirthday - today) / 86400000);
  return diffDays >= 0 && diffDays <= 15;
}

function daysUntilBirthday(dob) {
  if (!dob) return Infinity;

  const today = new Date();
  const birthDate = new Date(dob);
  let nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());

  if (nextBirthday < today) nextBirthday.setFullYear(today.getFullYear() + 1);

  return Math.ceil((nextBirthday - today) / 86400000);
}

/* ================= ROLE CLASS ================= */
function getRoleClass(role = '') {
  role = role.toLowerCase();
  if (role.includes('bat')) return 'batsman';
  if (role.includes('bowl')) return 'bowler';
  if (role.includes('all')) return 'allrounder';
  if (role.includes('keeper')) return 'wicketkeeper';
  return 'default-role';
}

function formatRoleText(role = '') {
  if (!role) return '🏏 Player';

  const lower = role.toLowerCase();

  // ✅ Special clean format
  if (lower.includes('opener') && lower.includes('strike rate')) {
    return '🏏 Opener batsman SR > 125';
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
    const upcoming = isUpcomingBirthday(player.dateOfBirth);
    const roleClass = getRoleClass(player.playerRole);
    const firstLetter = player.playerName?.charAt(0).toUpperCase() || '?';

    const card = document.createElement('div');
    card.className = 'player-card';

    card.innerHTML = `
      ${upcoming ? `<div class="upcoming-badge">🎉 Upcoming Birthday</div>` : ''}

      <div class="avatar">${firstLetter}</div>
      <div class="player-name">${player.playerName || 'Unknown'}</div>

      <div class="player-info">🎂 ${formatDOB(player.dateOfBirth)}</div>
      <div class="player-info">👕 T-Shirt: ${player.tShirtNumber || 'N/A'}</div>

      <span class="style-badge ${roleClass}">
        ${formatRoleText(player.playerRole)}
      </span>
    `;

    container.appendChild(card);
  });
}

/* ================= PLAYERS LOAD ================= */
onValue(ref(database, 'players'), snapshot => {
  loader.style.display = 'none';
  if (!snapshot.exists()) return renderPlayers([]);

  playersData = Object.values(snapshot.val());

  playersData.sort((a, b) => {
    const aDays = daysUntilBirthday(a.dateOfBirth);
    const bDays = daysUntilBirthday(b.dateOfBirth);
    const aUp = aDays <= 15;
    const bUp = bDays <= 15;

    if (aUp && !bUp) return -1;
    if (!aUp && bUp) return 1;
    if (aUp && bUp) return aDays - bDays;
    return 0;
  });

  renderPlayers(playersData);
  if (teamCountEl) teamCountEl.innerText = playersData.length;
});

/* ================= SEARCH ================= */
if (searchInput) {
  searchInput.addEventListener('input', e => {
    const value = e.target.value.toLowerCase();
    renderPlayers(
      playersData.filter(p =>
        (p.playerName || '').toLowerCase().includes(value) ||
        (p.playerRole || '').toLowerCase().includes(value)
      )
    );
  });
}

/* ===================================================== */
/* ================= NEXT MATCH FEATURE ================= */
/* ===================================================== */

function parseMatchDate(dateStr) {
  const [dd, mm, yyyy] = dateStr.split('/');
  return new Date(`${yyyy}-${mm}-${dd}`);
}

function renderNextMatches(matches) {
  if (!nextMatchesContainer) return;

  nextMatchesContainer.innerHTML = '';

  if (!matches.length) {
    nextMatchesContainer.innerHTML = '<p style="text-align:center">No upcoming matches</p>';
    return;
  }

  matches.forEach(match => {
    const card = document.createElement('div');
    card.className = 'ri-next-card';

    card.innerHTML = `
      <div class="ri-match-date">📅 ${match.date}</div>
      <div class="ri-match-day">${match.day} • ⏰ ${match.time}</div>

      <div class="ri-match-info">🏟️ <b>${match.ground}</b></div>

      <span class="ri-match-type">${match.type}</span>
    `;

    nextMatchesContainer.appendChild(card);
  });
}

/* ================= NEXT MATCH LOAD ================= */
onValue(ref(database, 'nextMatch'), snapshot => {
  if (!snapshot.exists()) return;

  const matches = Object.values(snapshot.val());

  // 🔥 Nearest match first
  matches.sort((a, b) => parseMatchDate(a.date) - parseMatchDate(b.date));

  renderNextMatches(matches);
});

/* ================= NAV TOGGLE ================= */
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
if (navToggle) {
  navToggle.addEventListener('click', () => navMenu.classList.toggle('show'));
}
