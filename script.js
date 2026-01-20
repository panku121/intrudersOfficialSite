// const API_URL =
//   'https://royalintruders-default-rtdb.firebaseio.com/players.json';

// const container = document.getElementById('playersContainer');
// const loader = document.getElementById('loader');

// fetch(API_URL)
//   .then(res => res.json())
//   .then(data => {
//     loader.style.display = 'none';

//     if (!data) {
//       container.innerHTML = '<p>No players found</p>';
//       return;
//     }

//     Object.keys(data).forEach(key => {
//       const player = data[key];

//       const firstLetter = player.playerName
//         ? player.playerName.charAt(0).toUpperCase()
//         : '?';

//       const card = document.createElement('div');
//       card.className = 'player-card';

//       card.innerHTML = `
//         <div class="avatar">${firstLetter}</div>
//         <div class="player-name">${player.playerName}</div>
//         <div class="player-info">🎂 DOB: ${player.dateOfBirth}</div>
//         <div class="player-info">👕 Size: ${player.tShirtSize}</div>
//         <div class="player-info">🔢 Number: ${player.tShirtNumber}</div>
//         <div class="badge">Royal Intruders</div>
//       `;

//       container.appendChild(card);
//     });
//   })
//   .catch(err => {
//     loader.innerText = 'Failed to load players 😢';
//     console.error(err);
//   });


const API_URL =
  'https://royalintruders-default-rtdb.firebaseio.com/players.json';

const container = document.getElementById('playersContainer');
const loader = document.getElementById('loader');
const searchInput = document.getElementById('searchInput');

let playersData = [];

/* ===== DATE FORMAT ===== */
function formatDOB(dateStr) {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long'
  });
}

/* ===== ROLE → COLOR CLASS ===== */
function getRoleClass(role = '') {
  role = role.toLowerCase();

  if (role.includes('bat')) return 'batsman';
  if (role.includes('bowl')) return 'bowler';
  if (role.includes('all')) return 'allrounder';
  if (role.includes('keeper')) return 'wicketkeeper';

  return 'default-role';
}

function formatRoleText(role = '') {
  if (!role) return 'Player';

  // Special case for Opener Strike Batsman
  if (
    role.includes('Opener') &&
    role.includes('Strike rate') &&
    role.includes('125')
  ) {
    return '🏏 Opener Strike Batsman | SR >125';
  }

  // Default return
  return `🏏 ${role}`;
}


/* ===== RENDER PLAYERS ===== */
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

/* ===== FETCH DATA ===== */
fetch(API_URL)
  .then(res => res.json())
  .then(data => {
    loader.style.display = 'none';

    if (!data) return;

    playersData = Object.values(data);
    renderPlayers(playersData);
  })
  .catch(err => {
    loader.innerText = 'Failed to load players 😢';
    console.error(err);
  });

/* ===== SEARCH FILTER ===== */
searchInput.addEventListener('input', e => {
  const value = e.target.value.toLowerCase();

  const filtered = playersData.filter(player =>
    (player.playerName || '').toLowerCase().includes(value) ||
    (player.playerRole || '').toLowerCase().includes(value)
  );

  renderPlayers(filtered);
});

/* ===== NAVBAR TOGGLE ===== */
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

navToggle.addEventListener('click', () => {
  navMenu.classList.toggle('show');
});

