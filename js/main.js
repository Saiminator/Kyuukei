document.addEventListener('DOMContentLoaded', function() {
  let wasDragged = false;
  const dragThreshold = 5;
  let panStartX, panStartY;
  let isPanning = false;
  let translateX = 0, translateY = 0;
  let scale = 1;
  const buffer = 100;
  
  const panZoomContainer = document.getElementById('panZoomContainer');
  const panZoomWrapper = document.getElementById('panZoomWrapper');
  
  // Set initial pan position.
  if (panZoomWrapper && panZoomContainer) {
    const wrapperRect = panZoomWrapper.getBoundingClientRect();
    const containerRect = panZoomContainer.getBoundingClientRect();
    // Center horizontally if container is narrower than wrapper
    if (containerRect.width < wrapperRect.width) {
      translateX = (wrapperRect.width - containerRect.width) / 2;
    } else {
      translateX = 0;
    }
    // Center vertically if container is shorter than wrapper
    if (containerRect.height < wrapperRect.height) {
      translateY = (wrapperRect.height - containerRect.height) / 2;
    } else {
      translateY = 0;
    }
    panZoomContainer.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  }
  
  function startPan(e) {
    // Allow normal clicks on chapter links
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
    // Horizontal: center if container is narrower; else limit drag
    if (containerRect.width <= wrapperRect.width) {
      translateX = (wrapperRect.width - containerRect.width) / 2;
    } else {
      const minTranslateX = wrapperRect.width - containerRect.width - buffer;
      const maxTranslateX = buffer;
      if (translateX < minTranslateX) translateX = minTranslateX;
      if (translateX > maxTranslateX) translateX = maxTranslateX;
    }
    // Vertical: center if container is shorter; else limit drag
    if (containerRect.height <= wrapperRect.height) {
      translateY = (wrapperRect.height - containerRect.height) / 2;
    } else {
      const minTranslateY = wrapperRect.height - containerRect.height - buffer;
      const maxTranslateY = buffer;
      if (translateY < minTranslateY) translateY = minTranslateY;
      if (translateY > maxTranslateY) translateY = maxTranslateY;
    }
  }
  
  // Prevent chapter link clicks if dragging occurred
  document.querySelectorAll('.chapter-box').forEach(function(link) {
    link.addEventListener('click', function(e) {
      if (wasDragged) {
        e.preventDefault();
        wasDragged = false;
      }
    });
  });
});
