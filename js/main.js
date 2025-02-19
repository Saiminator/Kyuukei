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

<!-- Mobile Navigation (stays at top for small screens) -->
<nav id="nav-mobile">
  <button id="nav-toggle" aria-label="Toggle Navigation">Menu</button>
  <ul id="nav-mobile-menu" style="display: none;">
    <li><a href="/about.html">About</a></li>
    <li><a href="/timeline.html">Story</a></li>
    <li><a href="/characters.html">Characters</a></li>
    <li><a href="/questions.html">Questions</a></li>
    <li><a href="/news.html">News</a></li>
  </ul>
</nav>
