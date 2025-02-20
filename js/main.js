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

  popularityTab.addEventListener('click', function(){
    clearActive();
    popularityTab.classList.add('active');
    popularityContainer.style.display = 'grid';
    alphabeticalContainer.style.display = 'none';
    sortedContainer.style.display = 'none';
  });

  alphabeticalTab.addEventListener('click', function(){
    clearActive();
    alphabeticalTab.classList.add('active');
    popularityContainer.style.display = 'none';
    alphabeticalContainer.style.display = 'grid';
    sortedContainer.style.display = 'none';
  });

  sortedTab.addEventListener('click', function(){
    clearActive();
    sortedTab.classList.add('active');
    popularityContainer.style.display = 'none';
    alphabeticalContainer.style.display = 'none';
    sortedContainer.style.display = 'grid';
  });
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


document.addEventListener('DOMContentLoaded', function() {
  var siteTitle = document.getElementById('site-title');
  var headerLine1 = siteTitle.querySelector('.header-line1');
  var headerLine2 = siteTitle.querySelector('.header-line2');
  var holdTimer;
  var holdThreshold = 800; // milliseconds
  var wasHeld = false;
  
  // Start timer on mousedown
  siteTitle.addEventListener('mousedown', function(e) {
    wasHeld = false;
    holdTimer = setTimeout(function() {
      // After 800ms, toggle header text and mark as held
      wasHeld = true;
      if (headerLine1.style.display === 'none') {
        headerLine1.style.display = 'inline';
        headerLine2.style.display = 'none';
      } else {
        headerLine1.style.display = 'none';
        headerLine2.style.display = 'inline';
      }
    }, holdThreshold);
  });
  
  // On mouseup, clear the timer. If the timer fired, prevent navigation.
  siteTitle.addEventListener('mouseup', function(e) {
    clearTimeout(holdTimer);
    if (wasHeld) {
      e.preventDefault(); // Prevent navigation if it was a long press
    }
  });
  
  // If mouse leaves the element, cancel the hold timer
  siteTitle.addEventListener('mouseleave', function() {
    clearTimeout(holdTimer);
  });
});
