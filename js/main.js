document.addEventListener('DOMContentLoaded', function() {
  // Global flag to track if dragging occurred (to prevent accidental clicks)
  let wasDragged = false;
  const dragThreshold = 5;
  let panStartX, panStartY;
  
  // Global variables for timeline navigation
  let isPanning = false;
  let translateX = 0, translateY = 0;
  let scale = 1;
  const buffer = 100; // Buffer of 100px
  
  const panZoomContainer = document.getElementById('panZoomContainer');
  const panZoomWrapper = document.getElementById('panZoomWrapper');
  
  // Start dragging when mousedown on either the container or its wrapper
  if (panZoomWrapper && panZoomContainer) {
    // Attach to wrapper for the dead zone
    panZoomWrapper.addEventListener('mousedown', (e) => {
      // If the clicked target is not a chapter link (which should be clickable)
      if (!e.target.closest('.chapter-box')) {
        isPanning = true;
        panStartX = e.clientX;
        panStartY = e.clientY;
        wasDragged = false;
      }
    });
    // Also attach to the container itself (in case the user clicks directly on it)
    panZoomContainer.addEventListener('mousedown', (e) => {
      // Do not start drag if clicking on a chapter link
      if (!e.target.closest('.chapter-box')) {
        isPanning = true;
        panStartX = e.clientX;
        panStartY = e.clientY;
        wasDragged = false;
      }
    });
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
  
  function clampPan() {
    if (!panZoomWrapper || !panZoomContainer) return;
    const wrapperRect = panZoomWrapper.getBoundingClientRect();
    const containerRect = panZoomContainer.getBoundingClientRect();
    // Horizontal clamp: allow extra 100px on both sides.
    const minTranslateX = wrapperRect.width - containerRect.width - buffer;
    const maxTranslateX = buffer;
    if (translateX < minTranslateX) translateX = minTranslateX;
    if (translateX > maxTranslateX) translateX = maxTranslateX;
    // Vertical clamp: allow extra 100px on top and bottom.
    const minTranslateY = wrapperRect.height - containerRect.height - buffer;
    const maxTranslateY = buffer;
    if (translateY < minTranslateY) translateY = minTranslateY;
    if (translateY > maxTranslateY) translateY = maxTranslateY;
  }
  
  // Prevent chapter links from triggering if dragging occurred.
  // Attach the click listener to the container (or use event delegation)
  document.querySelectorAll('.chapter-box').forEach(function(link) {
    link.addEventListener('click', function(e) {
      if (wasDragged) {
        e.preventDefault();
        wasDragged = false; // reset flag so future clicks work normally
      }
    });
  });
});
