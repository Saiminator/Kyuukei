document.addEventListener('DOMContentLoaded', function(){
  var popularityTab = document.getElementById('popularity-tab');
  var alphabeticalTab = document.getElementById('alphabetical-tab');
  var sortedTab = document.getElementById('sorted-tab');

  var popularityContainer = document.getElementById('popularity-container');
  var alphabeticalContainer = document.getElementById('alphabetical-container');
  var sortedContainer = document.getElementById('sorted-container');

  function clearActive() {
    var tabs = document.querySelectorAll('.sort-tab');
    tabs.forEach(function(tab){
      tab.classList.remove('active');
    });
  }

  if(popularityTab) {
    popularityTab.addEventListener('click', function(){
      clearActive();
      popularityTab.classList.add('active');
      if(popularityContainer) popularityContainer.style.display = 'grid';
      if(alphabeticalContainer) alphabeticalContainer.style.display = 'none';
      if(sortedContainer) sortedContainer.style.display = 'none';
    });
  }

  if(alphabeticalTab) {
    alphabeticalTab.addEventListener('click', function(){
      clearActive();
      alphabeticalTab.classList.add('active');
      if(popularityContainer) popularityContainer.style.display = 'none';
      if(alphabeticalContainer) alphabeticalContainer.style.display = 'grid';
      if(sortedContainer) sortedContainer.style.display = 'none';
    });
  }

  if(sortedTab) {
    sortedTab.addEventListener('click', function(){
      clearActive();
      sortedTab.classList.add('active');
      if(popularityContainer) popularityContainer.style.display = 'none';
      if(alphabeticalContainer) alphabeticalContainer.style.display = 'none';
      if(sortedContainer) {
        sortedContainer.style.display = 'grid';
        var categoryList = document.getElementById('sorted-category-list');
        if(categoryList) categoryList.style.display = 'grid';
        var categoryContainers = document.querySelectorAll('.category-characters');
        categoryContainers.forEach(function(container) {
          container.style.display = 'none';
        });
      }
    });
  }
});

document.addEventListener('DOMContentLoaded', function() {
  const navToggle = document.getElementById('nav-toggle');
  const navMobileMenu = document.getElementById('nav-mobile-menu');
  if (navToggle && navMobileMenu) {
    navToggle.addEventListener('click', function() {
      navMobileMenu.style.display = (navMobileMenu.style.display === 'block') ? 'none' : 'block';
    });
  }
});

function loadCategory(slug) {
  var categoryList = document.getElementById('sorted-category-list');
  if(categoryList) categoryList.style.display = 'none';
  var container = document.getElementById('category-' + slug + '-container');
  if (container) {
    container.style.display = 'grid';
  }
}

/* --- Character of the Day Section --- */
document.addEventListener('DOMContentLoaded', function() {
  fetch('/characters.json')
    .then(response => {
      if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
      return response.json();
    })
    .then(characters => {
      if (!Array.isArray(characters) || characters.length === 0) {
        console.warn('No characters loaded or invalid JSON.');
        return;
      }

      characters.sort((a, b) => a.title.localeCompare(b.title));

      // Get today's EST date
      const estDate = new Date(
        new Intl.DateTimeFormat('en-US', {
          timeZone: 'America/New_York',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).format(new Date())
      );

      const year = estDate.getFullYear();
      const month = (estDate.getMonth() + 1).toString().padStart(2, '0');
      const day = estDate.getDate().toString().padStart(2, '0');
      const seedString = `${year}${month}${day}`;

      function hashString(str) {
        let hash = 5381;
        for (let i = 0; i < str.length; i++) {
          hash = ((hash << 5) + hash) + str.charCodeAt(i);
        }
        return Math.abs(hash);
      }

      const todayIndex = hashString(seedString) % characters.length;
      const yesterdayIndex = (todayIndex - 1 + characters.length) % characters.length;

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
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: 'America/New_York',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });

        clockEl.textContent = formatter.format(now);
      }

      setInterval(updateESTClock, 1000);
      updateESTClock();
    })
    .catch(error => {
      console.error('Error fetching characters:', error);
    });
});

document.addEventListener('DOMContentLoaded', function() {
  const cursor = document.getElementById('customCursor');
  let initialized = false;

  document.addEventListener('mousemove', function(e) {
    if (!initialized) {
      cursor.style.display = 'block';
      initialized = true;
    }
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });
});
