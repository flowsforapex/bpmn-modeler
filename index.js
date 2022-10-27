import AddExporter from '@bpmn-io/add-exporter';
import lintModule from 'bpmn-js-bpmnlint';
// import ConnectorsExtensionModule from 'bpmn-js-connectors-extension';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import bpmnlintConfig from './.bpmnlintrc';
import apexModdleDescriptor from './apexPropertiesProvider/descriptor/apexProps';
import propertiesProviderModule from './apexPropertiesProvider/new_provider';
import customPaletteProviderModule from './custom/palette';
// import propertiesPanelModule from './custom/properties-panel';
import styleModule from './lib/styleModule';
import translationModule from './lib/translationModule';
import xmlModule from './lib/xmlModule';

import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule
} from 'bpmn-js-properties-panel';

var bpmnModeler = {
  Modeler: BpmnModeler,
  linting: { apexLinting: bpmnlintConfig },
  customModules: {
    BpmnPropertiesPanelModule,
    BpmnPropertiesProviderModule,
    // propertiesPanelModule,
    propertiesProviderModule,
    lintModule,
    customPaletteProviderModule,
    translationModule,
    styleModule,
    xmlModule,
    AddExporter,
    // ConnectorsExtensionModule,
  },
  moddleExtensions: {
    apexModdleDescriptor,
  },
};

export default bpmnModeler;
