document.addEventListener('DOMContentLoaded', function() {
  // Global flag to track if dragging occurred (to prevent accidental clicks)
  let wasDragged = false;
  const dragThreshold = 5;
  let panStartX, panStartY;
  
  // Pan & Zoom for the timeline area, if present
  const panZoomContainer = document.getElementById('panZoomContainer');
  const panZoomWrapper = document.getElementById('panZoomWrapper');
  if(panZoomContainer && panZoomWrapper) {
    let isPanning = false;
    let translateX = 0, translateY = 0;
    let scale = 1;
    const buffer = 100; // Buffer of 100px

    panZoomContainer.addEventListener('mousedown', (e) => {
      isPanning = true;
      panStartX = e.clientX;
      panStartY = e.clientY;
      wasDragged = false;
    });
    
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
      panZoomContainer.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
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
      const wrapperRect = panZoomWrapper.getBoundingClientRect();
      const containerRect = panZoomContainer.getBoundingClientRect();
      const minTranslateX = wrapperRect.width - containerRect.width - buffer;
      const maxTranslateX = buffer;
      if (translateX < minTranslateX) translateX = minTranslateX;
      if (translateX > maxTranslateX) translateX = maxTranslateX;
      const minTranslateY = wrapperRect.height - containerRect.height - buffer;
      const maxTranslateY = buffer;
      if (translateY < minTranslateY) translateY = minTranslateY;
      if (translateY > maxTranslateY) translateY = maxTranslateY;
    }
  }
  
  // Vertical Drag for the Characters Section, if present
  const characterScrollContainer = document.getElementById('characterScrollContainer');
  const characterScrollWrapper = document.getElementById('characterScrollWrapper');
  if(characterScrollContainer && characterScrollWrapper) {
    let isPanningChar = false;
    let charStartY;
    let charTranslateY = 0;
    
    characterScrollContainer.addEventListener('mousedown', (e) => {
      isPanningChar = true;
      charStartY = e.clientY;
      wasDragged = false;
    });
    
    document.addEventListener('mouseup', () => { isPanningChar = false; });
    
    document.addEventListener('mousemove', (e) => {
      if (!isPanningChar) return;
      const dy = e.clientY - charStartY;
      if (Math.abs(dy) > dragThreshold) {
        wasDragged = true;
      }
      charTranslateY += dy;
      clampCharPan();
      characterScrollContainer.style.transform = `translateY(${charTranslateY}px)`;
      charStartY = e.clientY;
    });
    
    function clampCharPan() {
      const wrapperRect = characterScrollWrapper.getBoundingClientRect();
      const containerRect = characterScrollContainer.getBoundingClientRect();
      const minTranslateY = wrapperRect.height - containerRect.height;
      const maxTranslateY = 0;
      if (charTranslateY < minTranslateY) charTranslateY = minTranslateY;
      if (charTranslateY > maxTranslateY) charTranslateY = maxTranslateY;
    }
  }
});
