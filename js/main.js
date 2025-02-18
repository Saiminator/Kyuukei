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
