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

var bpmnModeler = {
  Modeler: BpmnModeler,
  linting: { apexLinting: bpmnlintConfig },
  customModules: {
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
    colorPickerModule
  },
  moddleExtensions: {
    apexModdleDescriptor,
  },
};

export default bpmnModeler;
