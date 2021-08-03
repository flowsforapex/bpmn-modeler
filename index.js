import BpmnModeler from 'bpmn-js/lib/Modeler';

import propertiesPanelModule from './custom/properties-panel';
import propertiesProviderModule from './apexPropertiesProvider/provider';
import apexModdleDescriptor from './apexPropertiesProvider/descriptor/apexProps';

import lintModule from 'bpmn-js-bpmnlint';
import bpmnlintConfig from './.bpmnlintrc';

import customPaletteProviderModule from './custom/palette';
import customTimerProvider from './custom/timer/CustomTimerProvider';

var bpmnModeler = {
  Modeler: BpmnModeler,
  linting: { apexLinting: bpmnlintConfig },
  customModules: {
    propertiesPanelModule,
    propertiesProviderModule,
    lintModule,
    customPaletteProviderModule,
    customTimerProvider
  },
  moddleExtensions: {
    apexModdleDescriptor
  }
};

export default bpmnModeler;
