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
  
  // Set initial pan positions based on container and wrapper dimensions
  if (panZoomWrapper && panZoomContainer) {
    const wrapperRect = panZoomWrapper.getBoundingClientRect();
    const containerRect = panZoomContainer.getBoundingClientRect();
    // Center horizontally if container is smaller than wrapper; otherwise start at a buffer
    if (containerRect.width < wrapperRect.width) {
      translateX = (wrapperRect.width - containerRect.width) / 2;
    } else {
      translateX = buffer;
    }
    // For vertical, assume centering as well
    if (containerRect.height < wrapperRect.height) {
      translateY = (wrapperRect.height - containerRect.height) / 2;
    } else {
      translateY = buffer;
    }
    panZoomContainer.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  }
  
  function startPan(e) {
    // Only start pan if not clicking a chapter link
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
  
  // Adjust clamping so that if the container is smaller than the wrapper, it stays centered
  function clampPan() {
    if (!panZoomWrapper || !panZoomContainer) return;
    const wrapperRect = panZoomWrapper.getBoundingClientRect();
    const containerRect = panZoomContainer.getBoundingClientRect();
    
    // Horizontal adjustment
    if (containerRect.width <= wrapperRect.width) {
      translateX = (wrapperRect.width - containerRect.width) / 2;
    } else {
      const minTranslateX = wrapperRect.width - containerRect.width - buffer;
      const maxTranslateX = buffer;
      if (translateX < minTranslateX) translateX = minTranslateX;
      if (translateX > maxTranslateX) translateX = maxTranslateX;
    }
    // Vertical adjustment
    if (containerRect.height <= wrapperRect.height) {
      translateY = (wrapperRect.height - containerRect.height) / 2;
    } else {
      const minTranslateY = wrapperRect.height - containerRect.height - buffer;
      const maxTranslateY = buffer;
      if (translateY < minTranslateY) translateY = minTranslateY;
      if (translateY > maxTranslateY) translateY = maxTranslateY;
    }
  }
  
  // Prevent chapter links from firing if a drag occurred
  document.querySelectorAll('.chapter-box').forEach(function(link) {
    link.addEventListener('click', function(e) {
      if (wasDragged) {
        e.preventDefault();
        wasDragged = false;
      }
    });
  });
});
