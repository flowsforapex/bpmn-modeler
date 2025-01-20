import AddExporter from '@bpmn-io/add-exporter';
import lintModule from 'bpmn-js-bpmnlint';
import colorPickerModule from 'bpmn-js-color-picker';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import bpmnlintConfig from './.bpmnlintrc';
import apexModdleDescriptor from './apexPropertiesProvider/descriptor/apexProps';
import propertiesProviderModule from './apexPropertiesProvider/new_provider';
import customPaletteProviderModule from './custom/palette';
import bpmnDiOrdering from './modules/bpmnDiOrdering';
import drilldownCentering from './modules/drilldownCentering';
import translationModule from './modules/translationModule';
import xmlModule from './modules/xmlModule';

import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule
} from 'bpmn-js-properties-panel';

import css from './assets/css/style.css';
import bpmnCSS from 'bpmn-js/dist/assets/bpmn-js.css';
import diagramCSS from 'bpmn-js/dist/assets/diagram-js.css';
import lintCSS from 'bpmn-js-bpmnlint/dist/assets/css/bpmn-js-bpmnlint.css';
import propertiesPanelCSS from '@bpmn-io/properties-panel/dist/assets/properties-panel.css';
import colorPickerCSS from 'bpmn-js-color-picker/colors/color-picker.css';

import embeddedFontCSS from './assets/css/bpmn-embedded-font.css';
import embeddedRulesCSS from './assets/css/bpmn-embedded-rules.css';

import monacoCSS from 'monaco-editor/min/vs/editor/editor.main.css';

class Modeler extends HTMLElement {
  constructor() {
    super();

    this.regionId = this.getAttribute('regionId');
    this.ajaxIdentifier = this.getAttribute('ajaxIdentifier');
    this.showCustomExtensions = this.getAttribute('showCustomExtensions');
    this.themePluginClass = this.getAttribute('themePluginClass');

    // create shadow dom
    this.attachShadow({ mode: 'open' });
  }

  async initCSS() {

    // copy bpmn @font-face declaration into global dom
    const styleGlobal = document.createElement('style');
    styleGlobal.innerHTML = embeddedFontCSS.toString();
    document.head.appendChild(styleGlobal);

    // copy apex font file from global page to shadow dom
    const apexFontFile = Array.from(document.styleSheets).find(s => s.href && s.href.includes('font-apex.min.css'));

    if (apexFontFile) {
      const styleShadow = document.createElement('style');
      styleShadow.innerHTML = `@import "${apexFontFile.href}"`;
      this.shadowRoot.appendChild(styleShadow);
    }

    // import general css files into shadow dom
    const sheets = await Promise.all(
      [
        css,
        bpmnCSS,
        diagramCSS,
        lintCSS,
        propertiesPanelCSS,
        colorPickerCSS,
        embeddedRulesCSS,
        monacoCSS,
      ]
      .map((file) => {
        const sheet = new CSSStyleSheet();
        return sheet.replace(file.toString());
      })
    );

    this.shadowRoot.adoptedStyleSheets = sheets;
  }

  initHTML() {

    const container = document.createElement('div');
    // general class for styling
    container.classList.add('flows4apex-modeler');
    // class determining plugin theme
    container.classList.add(this.themePluginClass);
    
    // create and append canvas container
    this.canvas = document.createElement('div');
    this.canvas.id = `${this.regionId}_canvas`;
    this.canvas.classList.add('canvas');

    container.appendChild(this.canvas);
    
    // create and append properties panel container
    this.properties = document.createElement('div');
    this.properties.id = `${this.regionId}_properties`;
    this.properties.classList.add('properties-panel-parent');

    container.appendChild(this.properties);
    
    // create and append dialog container
    this.dialogContainer = document.createElement('div');
    this.dialogContainer.id = `${this.regionId}_dialog`;
    this.dialogContainer.classList.add('dialog-container');

    container.appendChild(this.dialogContainer);

    // append container
    this.shadowRoot.appendChild(container);
  }

  initModeler() {
    this.modeler = new BpmnModeler({
      container: this.shadowRoot.querySelector(`#${this.canvas.id}`),
      keyboard: { bindTo: document },
      propertiesPanel: {
        parent: this.shadowRoot.querySelector(`#${this.properties.id}`)
      },
      linting: {
        bpmnlint: bpmnlintConfig
      },
      additionalModules: [
        BpmnPropertiesPanelModule,
        BpmnPropertiesProviderModule,
        propertiesProviderModule,
        AddExporter,
        lintModule,
        customPaletteProviderModule,
        translationModule,
        xmlModule,
        drilldownCentering,
        bpmnDiOrdering,
        colorPickerModule,
      ],
      moddleExtensions: {
        apex: apexModdleDescriptor
      },
      bpmnRenderer: {
        defaultFillColor: 'var(--default-fill-color)',
        defaultStrokeColor: 'var(--default-stroke-color)',
        defaultLabelColor: 'var(--default-stroke-color)',
      },
      exporter: {
        name: 'Flows for APEX',
        version: '25.1.0',
      },
      showCustomExtensions: this.showCustomExtensions
    });
  }

  connectedCallback() {

    this.initCSS();
    
    this.initHTML();

    this.initModeler();
  }

  async loadDiagram(diagramContent) {

    var result;
    
    this.diagramContent = diagramContent;
    
    try {
      result = await this.modeler.importXML(this.diagramContent);

      if (!this.modeler._definitions.get('xmlns:apex')) {
        // custom namespace must be added manually for working default values 
        const refactored = this.modeler.get('xmlModule').addCustomNamespace(this.diagramContent);
        result = await this.modeler.importXML(refactored);
      }

      const { warnings } = result;

      if (warnings.length > 0) {
        apex.debug.warn('Warnings during XML Import', warnings); // TODO emit event
      }

      this.modeler.get('xmlModule').refactorElements();

      this.zoom('fit-viewport');
      this.changed = false;
      
      this.modeler.get('eventBus').on('commandStack.changed', () => { this.changed = true; });

    } catch (err) {
      apex.debug.error('Loading Diagram failed.', err, this.diagram); // TODO emit event
    }
  }

  zoom(zoomOption) {
    this.modeler.get('canvas').zoom(zoomOption);
  }

  isChanged() {
    return this.changed;
  }

  async getDiagram() {
    try {
      const result = await this.modeler.saveXML({ format: true });
      const { xml } = result;
      return xml;
    } catch (err) {
      apex.debug.error('Get Diagram failed.', err); // TODO emit event
      throw err;
    }
  }

  async getSVG() {
    try {
      const result = await this.modeler.saveSVG({ format: true });
      const { svg } = result;
      const styledSVG = this.modeler.get('xmlModule').addToSVGStyle(svg, '.djs-group { --default-fill-color: white; --default-stroke-color: black; }');
      return styledSVG;
    } catch (err) {
      apex.debug.error('Get SVG failed.', err); // TODO emit event
      throw err;
    }
  }
}

window.customElements.define('f4a-modeler', Modeler);