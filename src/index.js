import AddExporter from '@bpmn-io/add-exporter';
import lintModule from 'bpmn-js-bpmnlint';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import bpmnlintConfig from '../.bpmnlintrc';
import apexModdleDescriptor from '../apexPropertiesProvider/descriptor/apexProps';
import propertiesProviderModule from '../apexPropertiesProvider/provider';
import customPaletteProviderModule from '../custom/palette';
import propertiesPanelModule from '../custom/properties-panel';
import styleModule from '../lib/styleModule';
import translationModule from '../lib/translation/TranslationModule';
import xmlModule from '../lib/xmlModule';

var bpmnModeler = {
  Modeler: BpmnModeler,
  linting: { apexLinting: bpmnlintConfig },
  customModules: {
    propertiesPanelModule,
    propertiesProviderModule,
    lintModule,
    customPaletteProviderModule,
    translationModule,
    styleModule,
    xmlModule,
    AddExporter,
  },
  moddleExtensions: {
    apexModdleDescriptor,
  },
};

export default bpmnModeler;
