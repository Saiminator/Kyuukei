// main.js  — COTD uses SHA-256 + rejection sampling (date-seeded, deterministic, natural-looking)

/* ----------------- Tabs: Popularity / Alphabetical / Sorted ----------------- */
document.addEventListener('DOMContentLoaded', function() {
  var tabs = document.querySelectorAll('.sort-tab[data-target]');
  var containers = {};
  var categoryList = document.getElementById('sorted-category-list');
  var categoryContainers = document.querySelectorAll('#sorted-container [id^="category-"][id$="-container"]');

  tabs.forEach(function(tab) {
    var targetId = tab.getAttribute('data-target');
    containers[targetId] = document.getElementById(targetId);

    tab.addEventListener('click', function() {
      tabs.forEach(function(t) {
        t.classList.remove('active');
      });
      this.classList.add('active');

      Object.values(containers).forEach(function(container) {
        if (container) container.style.display = 'none';
      });
      categoryContainers.forEach(function(container) {
        container.style.display = 'none';
      });

      var target = containers[targetId];
      if (target) {
        if (targetId === 'sorted-container') {
          target.style.display = 'block';
          if (categoryList) categoryList.style.display = 'grid';
        } else {
          target.style.display = 'grid';
          if (categoryList) categoryList.style.display = 'none';
        }
      }
    });
  });
});

/* -------------------------------- Mobile Nav -------------------------------- */
document.addEventListener('DOMContentLoaded', function() {
  const navToggle = document.getElementById('nav-toggle');
  const navMobileMenu = document.getElementById('nav-mobile-menu');
  if (navToggle && navMobileMenu) {
    navToggle.addEventListener('click', function() {
      navMobileMenu.style.display = (navMobileMenu.style.display === 'block') ? 'none' : 'block';
    });
  }
});

/* ------------------------------- Load Category ------------------------------ */
function loadCategory(slug) {
  var categoryList = document.getElementById('sorted-category-list');
  if(categoryList) categoryList.style.display = 'none';
  var container = document.getElementById('category-' + slug + '-container');
  if (container) {
    container.style.display = 'grid';
  }
}

/* ----------------------- Character of the Day (COTD) ------------------------ */
/* Uses SHA-256(hash) of (SALT + YYYYMMDD in EST), then rejection sampling
   to map to 0..N-1 without modulo bias. This is deterministic per day but
   produces natural-looking randomness (doubles/triples can occur).           */
document.addEventListener('DOMContentLoaded', function() {
  fetch('/characters.json')
    .then(response => {
      if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
      return response.json();
    })
    .then(async (characters) => {
      if (!Array.isArray(characters) || characters.length === 0) {
        console.warn('No characters loaded or invalid JSON.');
        return;
      }

      // Sort alphabetically by title (your site behavior)
      characters.sort((a, b) => a.title.localeCompare(b.title));

      // Build an EST date for "today"
      const now = new Date();
      const estParts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).formatToParts(now);

      const year = parseInt(estParts.find(p => p.type === 'year').value, 10);
      const month = parseInt(estParts.find(p => p.type === 'month').value, 10);
      const day = parseInt(estParts.find(p => p.type === 'day').value, 10);
      const estDate = new Date(year, month - 1, day); // local EST "midnight" date

      // ---- RNG helpers (SHA-256 + rejection sampling) ----
      const SEED_SALT = 'cotd-v3-2025-08-28'; // <— NEW SALT (different from anything tested)
      const encoder = new TextEncoder();

      async function sha256Bytes(message) {
        const data = encoder.encode(message);
        const buf = await crypto.subtle.digest('SHA-256', data);
        return new Uint8Array(buf);
      }

      // Convert first 16 bytes to a BigInt
      function first128ToBigInt(bytes) {
        let x = 0n;
        for (let i = 0; i < 16; i++) {
          x = (x << 8n) | BigInt(bytes[i]);
        }
        return x;
      }

      // Unbiased mapping to [0, n)
      async function uniformIndexFromSeed(seedStr, n) {
        // Rejection sampling within a 2^128 range
        const M = 1n << 128n;
        let suffix = '';
        for (let attempt = 0; attempt < 8; attempt++) {
          const bytes = await sha256Bytes(`${SEED_SALT}:${seedStr}${suffix}`);
          const x = first128ToBigInt(bytes);
          const bound = M - (M % BigInt(n)); // largest multiple of n ≤ M
          if (x < bound) {
            return Number(x % BigInt(n));
          }
          // If we fell in the rejection tail, perturb and try again
          suffix = `:retry:${attempt + 1}`;
        }
        // Extremely unlikely fallback (still deterministic):
        return 0;
      }

      function yyyymmdd(dateObj) {
        const y = dateObj.getFullYear();
        const m = String(dateObj.getMonth() + 1).padStart(2, '0');
        const d = String(dateObj.getDate()).padStart(2, '0');
        return `${y}${m}${d}`;
      }

      // Build today & yesterday seeds in EST
      const todaySeed = yyyymmdd(estDate);
      const estYesterday = new Date(estDate);
      estYesterday.setDate(estDate.getDate() - 1);
      const yesterdaySeed = yyyymmdd(estYesterday);

      // Pick indices (ALLOW doubles naturally — comment back in the guard if you want to avoid)
      const todayIndex = await uniformIndexFromSeed(todaySeed, characters.length);
      const yesterdayIndex = await uniformIndexFromSeed(yesterdaySeed, characters.length);

      // Optional anti-repeat guard (OFF by default to keep true randomness)
      // let finalTodayIndex = todayIndex;
      // if (finalTodayIndex === yesterdayIndex && characters.length > 1) {
      //   // derive a different seed path for the same day, still deterministic
      //   finalTodayIndex = await uniformIndexFromSeed(`${todaySeed}:alt`, characters.length);
      // }

      const todayCharacter = characters[todayIndex];
      const yesterdayCharacter = characters[yesterdayIndex];

      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const currentDate = formatter.format(estDate);
      const lastUpdatedDate = todayCharacter.last_modified_at
        ? formatter.format(new Date(todayCharacter.last_modified_at))
        : null;

      const container = document.getElementById('cod-container');
      if (container && todayCharacter) {
        container.innerHTML = `
          <h2>Character of the Day</h2>
          <p>
            ${currentDate} <span style="font-size: 0.9em;">(EST)</span> —
            <span id="live-est-clock" style="font-family: monospace; font-size: 0.9em;">--:--:--</span>
          </p>
          <a href="${todayCharacter.url}">
            <div class="cod-image" style="background-image: url('${todayCharacter.image}');"></div>
            <h3>${todayCharacter.title}</h3>
            ${lastUpdatedDate ? `<p>Last updated: ${lastUpdatedDate}</p>` : ''}
          </a>
          ${yesterdayCharacter ? `<div style="margin-top: 1em;"><strong>Day Old News:</strong> ${yesterdayCharacter.title}</div>` : ''}
        `;
      }

      // Live EST Clock (24-hour format)
      function updateESTClock() {
        const clockEl = document.getElementById('live-est-clock');
        if (!clockEl) return;
        const now = new Date();
        const clockFmt = new Intl.DateTimeFormat('en-US', {
          timeZone: 'America/New_York',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });
        clockEl.textContent = clockFmt.format(now);
      }
      setInterval(updateESTClock, 1000);
      updateESTClock();
    })
    .catch(error => {
      console.error('Error fetching characters:', error);
    });
});

/* ------------------------------ Custom Cursor ------------------------------ */
function setCursorState(state) {
  const cursor = document.getElementById('customCursor');
  if (!cursor) return;
  cursor.classList.remove('cursor-default', 'cursor-select', 'cursor-text', 'cursor-move');
  cursor.classList.add(`cursor-${state}`);
}

document.addEventListener('DOMContentLoaded', function() {
  const cursor = document.getElementById('customCursor');
  let initialized = false;
  let x = 0;
  let y = 0;

  document.addEventListener('pointermove', function(e) {
    x = e.clientX;
    y = e.clientY;

    if (!initialized && cursor) {
      cursor.style.display = 'block';
      initialized = true;
    }
  });

  function update() {
    if (cursor) {
      cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }
    requestAnimationFrame(update);
  }

  requestAnimationFrame(update);

  setCursorState('default');

  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => setCursorState('select'));
    el.addEventListener('mouseleave', () => setCursorState('default'));
  });

  document.querySelectorAll('input, textarea, [contenteditable]').forEach(el => {
    el.addEventListener('mouseenter', () => setCursorState('text'));
    el.addEventListener('mouseleave', () => setCursorState('default'));
  });

  document.addEventListener('lb-panning-start', () => setCursorState('move'));
  document.addEventListener('lb-panning-end', () => setCursorState('default'));
  document.addEventListener('panningstart', () => setCursorState('move'));
  document.addEventListener('panningend', () => setCursorState('default'));
});
