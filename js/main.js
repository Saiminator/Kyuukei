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
          // Reset: show the category list and hide any category-specific container
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
  // Hide the category list
  var categoryList = document.getElementById('sorted-category-list');
  if(categoryList) categoryList.style.display = 'none';
  // Show the container for the chosen category
  var container = document.getElementById('category-' + slug + '-container');
  if (container) {
    container.style.display = 'grid';
  }
}



document.addEventListener('DOMContentLoaded', function() {
  // Array of characters (update with your actual data)
  const characters = [
    {
      title: "Kyuu",
      image: "https://example.com/kyuu.jpg",  // Replace with Kyuu's image URL
      bio: "Kyuu's brief bio goes here.",
      url: "/characters/kyuu/"
    },
    {
      title: "Dreymi",
      image: "https://example.com/dreymi.jpg",  // Replace with Dreymi's image URL
      bio: "Dreymi's brief bio goes here.",
      url: "/characters/dreymi/"
    },
    {
      title: "Spreading Shimi",
      image: "https://example.com/shimi.jpg",  // Replace with Shimi's image URL
      bio: "Spreading Shimi's brief bio goes here.",
      url: "/characters/shimi/"
    },
    {
      title: "Dreymi's Diary",
      image: "https://example.com/dreymidiary.jpg",  // Replace with appropriate URL
      bio: "Dreymi's Diary bio goes here.",
      url: "/characters/dreymis-diary/"
    }
    // Add more characters as needed.
  ];

  // Get the current day of the year (1-366)
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now - startOfYear;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  // Use modulo so the index fits within the available characters array
  const index = dayOfYear % characters.length;
  const cod = characters[index];

  // Build the HTML for the Character of the Day
  const container = document.getElementById('cod-container');
  if (container && cod) {
    container.innerHTML = `
      <a href="${cod.url}">
        <div class="cod-image" style="background-image: url('${cod.image}');"></div>
        <h3>${cod.title}</h3>
        <p>${cod.bio}</p>
      </a>
    `;
  }
});
