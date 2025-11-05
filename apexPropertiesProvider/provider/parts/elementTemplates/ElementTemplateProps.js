import { isSelectEntryEdited, isTextFieldEntryEdited } from '@bpmn-io/properties-panel';

import ExtensionHelper from '../../helper/ExtensionHelper';

import { DefaultSelectEntry, DefaultTextFieldEntry } from '../../helper/templates';
import { getBusinessObject } from '../../helper/util';

export default function (args) {

  const {element, injector} = args;

  const businessObject = getBusinessObject(element);
  
  const translate = injector.get('translate');

  const entries = [];

  const templates =
    window.MY_TEMPLATES
    .filter(t => t.appliesTo.includes(businessObject.$type))
    .map((t) => { return { label: t.name, value: t.id }; });

  // template selector
  entries.push(
    {
      id: 'template',
      element,
      label: translate('Template'),
      property: 'template',
      options: templates,
      component: DefaultSelectEntry
    }
  );

  const {template} = businessObject;

  // if template selected
  if (template) {

    const templateData = window.MY_TEMPLATES.find(t => t.id === template);

    const {id, properties} = templateData;

    const type = `apex:${id}`;

    const extensionHelper = new ExtensionHelper(type);

    properties.forEach((prop, index) => {
      const id = `temp-prop-${index}`;
      
      entries.push(
        {
          id: id,
          element,
          label: prop.label,
          helper: extensionHelper,
          property: prop.binding.name.split(':')[1],
          component: DefaultTextFieldEntry,
          isEdited: isTextFieldEntryEdited,
        }
      );
    });

  }

  return entries;
}
