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

/* --- Character of the Day Section with Yesterday ("Old News") and Clean Date Formatting --- */
document.addEventListener('DOMContentLoaded', function() {
  fetch('/characters.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok: ' + response.status);
      }
      return response.json();
    })
    .then(characters => {
      if (!Array.isArray(characters) || characters.length === 0) {
        console.warn('No characters found in JSON.');
        return;
      }

      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);

      function getSeedIndex(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const seedString = `${year}${month}${day}`;

        function hashString(str) {
          let hash = 5381;
          for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) + hash) + str.charCodeAt(i);
          }
          return Math.abs(hash);
        }

        const baseHash = hashString(seedString);
        const dayOfWeek = date.getDay();
        const mixedSeed = baseHash ^ (dayOfWeek * 10007);
        return ((mixedSeed % characters.length) + characters.length) % characters.length;
      }

      const todayIndex = getSeedIndex(now);
      const yesterdayIndex = getSeedIndex(yesterday);

      const todayCharacter = characters[todayIndex];
      const yesterdayCharacter = characters[yesterdayIndex];

      const container = document.getElementById('cod-container');
      if (container && todayCharacter) {
        const updatedDate = new Date(todayCharacter.last_modified_at).toLocaleDateString(undefined, {
          year: 'numeric', month: 'long', day: 'numeric'
        });
        const weekday = now.toLocaleDateString(undefined, { weekday: 'long' });

        container.innerHTML = `
          <h2>Character of the Day — ${weekday}</h2>
          <a href="${todayCharacter.url}">
            <div class="cod-image" style="background-image: url('${todayCharacter.image}');"></div>
            <h3>${todayCharacter.title}</h3>
            ${todayCharacter.last_modified_at ? `<p>Last updated: ${updatedDate}</p>` : ''}
          </a>
        `;
      }

      const oldNewsContainer = document.getElementById('cod-oldnews');
      if (oldNewsContainer && yesterdayCharacter) {
        const oldDate = new Date(yesterdayCharacter.last_modified_at).toLocaleDateString(undefined, {
          year: 'numeric', month: 'long', day: 'numeric'
        });

        oldNewsContainer.innerHTML = `
          <h3>Old News — Yesterday's Character</h3>
          <a href="${yesterdayCharacter.url}">
            <div class="cod-image" style="background-image: url('${yesterdayCharacter.image}');"></div>
            <h4>${yesterdayCharacter.title}</h4>
            ${yesterdayCharacter.last_modified_at ? `<p>Last updated: ${oldDate}</p>` : ''}
          </a>
        `;
      }
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
