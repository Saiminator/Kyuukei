document.addEventListener('DOMContentLoaded', function() {
  // Mobile Navigation Toggle for Mobile Nav Menu
  const navToggle = document.getElementById('nav-toggle');
  const navMobileMenu = document.getElementById('nav-mobile-menu');
  
  if (navToggle && navMobileMenu) {
    navToggle.addEventListener('click', function() {
      if (navMobileMenu.style.display === 'block') {
        navMobileMenu.style.display = 'none';
      } else {
        navMobileMenu.style.display = 'block';
      }
    });
  }
});
