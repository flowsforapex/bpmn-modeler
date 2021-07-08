import BpmnModeler from 'bpmn-js/lib/Modeler';

import propertiesPanelModule from 'bpmn-js-properties-panel';
import propertiesProviderModule from './apexPropertiesProvider/provider';
import apexModdleDescriptor from './apexPropertiesProvider/descriptor/apexProps';

import lintModule from 'bpmn-js-bpmnlint';
import bpmnlintConfig from './.bpmnlintrc';

import customPaletteProviderModule from './custom/Palette';

var bpmnModeler = {
  Modeler: BpmnModeler,
  linting: { apexLinting: bpmnlintConfig },
  customModules: {
    propertiesPanelModule,
    propertiesProviderModule,
    lintModule,
    customPaletteProviderModule
  },
  moddleExtensions: {
    apexModdleDescriptor
  }
};

export default bpmnModeler;
