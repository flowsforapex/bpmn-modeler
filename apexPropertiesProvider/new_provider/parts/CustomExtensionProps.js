import {
  isTextAreaEntryEdited
} from '@bpmn-io/properties-panel';

import ExtensionHelper from '../helper/ExtensionHelper';

import { DefaultTextAreaEntryWithEditor } from '../helper/templates';

const extensionHelper = new ExtensionHelper('apex:CustomExtension');

export default function (args) {

  const {element, injector} = args;

  const translate = injector.get('translate');
  
  return [
    {
      id: 'customExtension',
      element,
      label: translate('Custom Extension'),
      description: translate('Enter custom extensions as JSON'),
      helper: extensionHelper,
      property: 'customExtension',
      language: 'json',
      component: DefaultTextAreaEntryWithEditor,
      isEdited: isTextAreaEntryEdited,
    },
  ];
}