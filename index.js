import lintModule from 'bpmn-js-bpmnlint';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import bpmnlintConfig from './.bpmnlintrc';
import apexModdleDescriptor from './apexPropertiesProvider/descriptor/apexProps';
import propertiesProviderModule from './apexPropertiesProvider/provider';
import customPaletteProviderModule from './custom/palette';
import propertiesPanelModule from './custom/properties-panel';
import translationModule from './custom/translation/TranslationModule';

var bpmnModeler = {
  Modeler: BpmnModeler,
  linting: { apexLinting: bpmnlintConfig },
  customModules: {
    propertiesPanelModule,
    propertiesProviderModule,
    lintModule,
    customPaletteProviderModule,
    translationModule
  },
  moddleExtensions: {
    apexModdleDescriptor,
  }
};

export default bpmnModeler;