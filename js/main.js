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

/* --- Character of the Day Section using Seeded Random with Enhanced Mixing and Debug Logging --- */
document.addEventListener('DOMContentLoaded', function() {
  console.log("Fetching /characters.json ...");
  fetch('/characters.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok: ' + response.status);
      }
      return response.json();
    })
    .then(characters => {
      console.log('Fetched characters:', characters);
      if (!Array.isArray(characters) || characters.length === 0) {
        console.warn('No characters found in JSON.');
        return;
      }
      
      // Build a seed string from today's date (YYYYMMDD)
      const now = new Date();
      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      const seedString = `${year}${month}${day}`;
      console.log("Seed string:", seedString);
      
      // djb2 hash algorithm
      function hashString(str) {
        let hash = 5381;
        for (let i = 0; i < str.length; i++) {
          hash = ((hash << 5) + hash) + str.charCodeAt(i);
        }
        return Math.abs(hash);
      }
      
      const baseHash = hashString(seedString);
      console.log("Base hash:", baseHash);
      
      // Mix in the day of the week: get dayOfWeek (0-6)
      const dayOfWeek = now.getDay();
      console.log("Day of week:", dayOfWeek);
      
      // Enhance mixing: multiply dayOfWeek by a prime and XOR with the base hash
      const mixedSeed = baseHash ^ (dayOfWeek * 10007);
      console.log("Mixed seed:", mixedSeed);
      
      // Calculate the index using the mixed seed
      const index = mixedSeed % characters.length;
      console.log("Selected index:", index);
      
      const cod = characters[index];
      console.log("Character of the Day:", cod);
      
      // Inject the character info into the element with id "cod-container"
      const container = document.getElementById('cod-container');
      if (container && cod) {
        container.innerHTML = `
          <a href="${cod.url}">
            <div class="cod-image" style="background-image: url('${cod.image}');"></div>
            <h3>${cod.title}</h3>
            ${cod.last_modified_at ? `<p>Last updated: ${new Date(cod.last_modified_at).toLocaleString()}</p>` : ''}
          </a>
        `;
      } else {
        console.warn('cod-container not found or no character selected.');
      }
    })
    .catch(error => {
      console.error('Error fetching characters:', error);
    });
});
