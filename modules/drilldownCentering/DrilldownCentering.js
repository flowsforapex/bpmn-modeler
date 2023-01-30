/**
 * Move collapsed subprocesses into view when drilling down.
 *
 * Overwrite default behaviour where zoom and scroll are saved in a session.
 * Zoom always reset to fit-viewport & centered when drilling down / moving up
 *
 * @param {eventBus} eventBus
 * @param {canvas} canvas
 */
export default function DrilldownCentering(eventBus, canvas) {

  const _this = this;

  eventBus.on('root.added', function (event) {

    // block first zoom when creating collaboration
    if (event.element.type === 'bpmn:Collaboration') _this.cancel = true;

  });

  eventBus.on('root.set', function () {

    if (!_this.cancel) {
      canvas.zoom('fit-viewport', 'auto');
    } else {
      _this.cancel = false;
    }

  });
}

DrilldownCentering.prototype.cancel = false;

DrilldownCentering.$inject = ['eventBus', 'canvas'];