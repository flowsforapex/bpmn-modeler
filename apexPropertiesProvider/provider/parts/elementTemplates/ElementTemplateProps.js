import { isSelectEntryEdited, isTextFieldEntryEdited, isToggleSwitchEntryEdited } from '@bpmn-io/properties-panel';

import ExtensionHelper from '../../helper/ExtensionHelper';

import { DefaultSelectEntry, DefaultTextFieldEntry, DefaultToggleSwitchEntry } from '../../helper/templates';
import { getBusinessObject } from '../../helper/util';

export default function (args) {

  const {element, injector, elementTemplates} = args;

  const businessObject = getBusinessObject(element);
  
  const translate = injector.get('translate');

  const entries = [];

  if (businessObject.type === 'template' && elementTemplates) {

    const applicableTemplates =
      elementTemplates
      .filter(t => t.appliesTo.includes(businessObject.$type));

    if (applicableTemplates) {

      const options = applicableTemplates.map((t) => { return { label: t.name, value: t.id }; });

      // template selector
      entries.push(
        {
          id: 'template',
          element,
          label: translate('Template'),
          property: 'template',
          options: options,
          component: DefaultSelectEntry,
          isEdited: isSelectEntryEdited
        }
      );

      const {template} = businessObject;

      // if template selected
      if (template) {

        const templateData = applicableTemplates.find(t => t.id === template);

        const {id, properties} = templateData;

        const type = `apex:${id}`;

        const extensionHelper = new ExtensionHelper(type);

        properties.forEach((prop, index) => {
          const id = `temp-prop-${index}`;

          if (prop.type === 'String') {
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
          } else if (prop.type === 'Boolean') {
            entries.push(
              {
                id: id,
                element,
                label: prop.label,
                helper: extensionHelper,
                property: prop.binding.name.split(':')[1],
                // defaultValue: 'false',
                component: DefaultToggleSwitchEntry,
                // isEdited: isToggleSwitchEntryEdited,
              }
            );
          }
        });

      }
    }
  }

  return entries;
}
