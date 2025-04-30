/**
 * Move collapsed subprocesses into view when drilling down.
 *
 * Overwrite default behaviour where zoom and scroll are saved in a session.
 * Zoom always reset to fit-viewport & centered when drilling down / moving up
 *
 * @param {eventBus} eventBus
 * @param {canvas} canvas
 */
export class DrilldownCentering {
  
  constructor(eventBus, canvas) {
    
    this.cancel = false;
    
    eventBus.on('root.added', (event) => {
      // block first zoom when creating collaboration
      if (event.element.type === 'bpmn:Collaboration') this.cancel = true;
    });

    eventBus.on('root.set', () => {
      if (!this.cancel) {
        canvas.zoom('fit-viewport', 'auto');
      } else {
        this.cancel = false;
      }
    });
  }
}

DrilldownCentering.$inject = ['eventBus', 'canvas'];