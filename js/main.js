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
  
  // Timeline Pan/Zoom Functionality
  let wasDragged = false;
  const dragThreshold = 5;
  let panStartX, panStartY;
  let isPanning = false;
  let translateX = 0, translateY = 0;
  let scale = 1;
  const buffer = 100;
  
  const panZoomContainer = document.getElementById('panZoomContainer');
  const panZoomWrapper = document.getElementById('panZoomWrapper');
  
  if (panZoomContainer) {
    translateX = 0;
    translateY = 0;
    panZoomContainer.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  }
  
  function startPan(e) {
    if (e.target.closest('.chapter-box')) return;
    isPanning = true;
    panStartX = e.clientX;
    panStartY = e.clientY;
    wasDragged = false;
  }
  
  if (panZoomWrapper) {
    panZoomWrapper.addEventListener('mousedown', startPan);
  }
  if (panZoomContainer) {
    panZoomContainer.addEventListener('mousedown', startPan);
  }
  
  document.addEventListener('mouseup', () => { isPanning = false; });
  
  document.addEventListener('mousemove', (e) => {
    if (!isPanning) return;
    const dx = e.clientX - panStartX;
    const dy = e.clientY - panStartY;
    if (Math.abs(dx) > dragThreshold || Math.abs(dy) > dragThreshold) {
      wasDragged = true;
    }
    translateX += dx;
    translateY += dy;
    clampPan();
    if (panZoomContainer) {
      panZoomContainer.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    }
    panStartX = e.clientX;
    panStartY = e.clientY;
  });
  
  if (panZoomContainer) {
    panZoomContainer.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomIntensity = 0.001;
      const delta = -e.deltaY;
      const zoom = 1 + delta * zoomIntensity;
      scale *= zoom;
      if (scale < 0.5) scale = 0.5;
      if (scale > 3) scale = 3;
      clampPan();
      panZoomContainer.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    });
  }
  
  function clampPan() {
    if (!panZoomWrapper || !panZoomContainer) return;
    const wrapperRect = panZoomWrapper.getBoundingClientRect();
    const containerRect = panZoomContainer.getBoundingClientRect();
    if (containerRect.width <= wrapperRect.width) {
      translateX = 0;
    } else {
      const minTranslateX = wrapperRect.width - containerRect.width - buffer;
      const maxTranslateX = buffer;
      if (translateX < minTranslateX) translateX = minTranslateX;
      if (translateX > maxTranslateX) translateX = maxTranslateX;
    }
    if (containerRect.height <= wrapperRect.height) {
      translateY = 0;
    } else {
      const minTranslateY = wrapperRect.height - containerRect.height - buffer;
      const maxTranslateY = buffer;
      if (translateY < minTranslateY) translateY = minTranslateY;
      if (translateY > maxTranslateY) translateY = maxTranslateY;
    }
  }
  
  document.querySelectorAll('.chapter-box').forEach(function(link) {
    link.addEventListener('click', function(e) {
      if (wasDragged) {
        e.preventDefault();
        wasDragged = false;
      }
    });
  });
});
