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

function isUpcomingBirthday(dob) {
  if (!dob) return false;

  const today = new Date();
  const birthDate = new Date(dob);

  const currentYear = today.getFullYear();

  let nextBirthday = new Date(
    currentYear,
    birthDate.getMonth(),
    birthDate.getDate()
  );

  // If birthday already passed this year
  if (nextBirthday < today) {
    nextBirthday.setFullYear(currentYear + 1);
  }

  const diffDays = Math.ceil(
    (nextBirthday - today) / (1000 * 60 * 60 * 24)
  );

  return diffDays >= 0 && diffDays <= 15;
}

/* ================= DAYS LEFT FOR BIRTHDAY ================= */
function daysUntilBirthday(dob) {
  if (!dob) return Infinity;

  const today = new Date();
  const birthDate = new Date(dob);
  const year = today.getFullYear();

  let nextBirthday = new Date(
    year,
    birthDate.getMonth(),
    birthDate.getDate()
  );

  if (nextBirthday < today) {
    nextBirthday.setFullYear(year + 1);
  }

  return Math.ceil(
    (nextBirthday - today) / (1000 * 60 * 60 * 24)
  );
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

    const upcoming = isUpcomingBirthday(player.dateOfBirth);

    const card = document.createElement('div');
    card.className = 'player-card';

    card.innerHTML = `
    ${upcoming ? `<div class="upcoming-badge">🎉 Upcoming Birthday</div>` : ''}

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
  
  playersData.sort((a, b) => {
    const aDays = daysUntilBirthday(a.dateOfBirth);
    const bDays = daysUntilBirthday(b.dateOfBirth);

    const aUpcoming = aDays <= 15;
    const bUpcoming = bDays <= 15;

    // 1️⃣ Upcoming birthdays first
    if (aUpcoming && !bUpcoming) return -1;
    if (!aUpcoming && bUpcoming) return 1;

    // 2️⃣ Both upcoming → nearest birthday first
    if (aUpcoming && bUpcoming) return aDays - bDays;

    // 3️⃣ Both not upcoming → keep normal order
    return 0;
  });

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


