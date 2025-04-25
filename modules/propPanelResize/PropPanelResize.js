// eslint-disable-next-line import/no-unresolved
import { query as domQuery } from 'min-dom';

/**
 * Make properties panel resizable
 */
export default function PropPanelResize() {

  const canvas = domQuery('.canvas', domQuery('f4a-modeler').shadowRoot);
  const parentNode = domQuery('.properties-panel-parent', domQuery('f4a-modeler').shadowRoot);
  
  let mouseX;
  const BORDER_WIDTH = 5;

  document.addEventListener('mousedown', function (event) {
    const parentNodeX = parentNode.getBoundingClientRect().x;
    if (event.clientX > parentNodeX && event.clientX <= (parentNodeX + BORDER_WIDTH)) {
      mouseX = event.x;
      document.addEventListener('mousemove', resize, false);
    }
  });

  document.addEventListener('mouseup', function () {
    document.removeEventListener('mousemove', resize, false);
  });

  function resize(event) {
    const dx = mouseX - event.x;
    const panelWidth = parentNode.scrollWidth + dx;
    const maxWidth = (parseInt(getComputedStyle(canvas, '').width, 10) / 100) * parseInt(getComputedStyle(parentNode).maxWidth, 10);
    
    mouseX = event.x;
    
    if (
      panelWidth >= parseInt(getComputedStyle(parentNode).minWidth, 10) &&
      panelWidth < maxWidth
    ) {
      parentNode.style.width = `${panelWidth}px`;
      parentNode.firstChild.style.width = `${panelWidth}px`;
    }
  }
}

PropPanelResize.$inject = [];