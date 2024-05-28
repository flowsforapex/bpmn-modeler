import { isSelectEntryEdited, isTextAreaEntryEdited } from '@bpmn-io/properties-panel';

import ExtensionHelper from '../../helper/ExtensionHelper';

import { DefaultSelectEntryAsync, DefaultTextAreaEntryWithEditor, DefaultToggleSwitchEntry } from '../../helper/templates';

import { useEffect, useState } from '@bpmn-io/properties-panel/preact/hooks';

import { getBusinessObject } from '../../helper/util';
import { getFormTemplates } from '../../plugins/metaDataCollector';

const extensionHelper = new ExtensionHelper('apex:ApexSimpleForm');

export default function (args) {

  const {element, injector} = args;

  const businessObject = getBusinessObject(element);

  const translate = injector.get('translate');

  const entries = [];

  if (businessObject.type === 'apexSimpleForm') {

    const [values, setValues] = useState({});

    useEffect(() => {
      if (!values.formTemplates) {
        getFormTemplates().then(formTemplates => setValues((existing) => { return {...existing, formTemplates: formTemplates}; }));
      }
    }, [element.id, businessObject.type]);

    const {formTemplates} = values;

    const manualInput = businessObject.manualInput === 'true';

    entries.push(
      {
        id: 'inputSelection',
        element,
        label: translate('Use APEX meta data'),
        property: 'manualInput',
        defaultValue: 'false',
        invert: true,
        component: DefaultToggleSwitchEntry,
        // isEdited: isToggleSwitchEntryEdited,
        cleanup: (value) => {
          return {
            ...(value === true && {formTemplate: null}),
            ...(value === false && {formTemplateId: null})
          };
        },
        cleanupHelper: extensionHelper
      }
    );

    if (manualInput) {
      entries.push(
        {
          id: 'formTemplate',
          element,
          label: translate('Form Template'),
          helper: extensionHelper,
          property: 'formTemplate',
          language: 'json',
          component: DefaultTextAreaEntryWithEditor,
          isEdited: isTextAreaEntryEdited,
        },
      );
    } else {
      entries.push(
        {
          id: 'formTemplateId',
          element,
          label: translate('Form Template'),
          helper: extensionHelper,
          property: 'formTemplateId',
          state: formTemplates,
          component: DefaultSelectEntryAsync,
          isEdited: isSelectEntryEdited,
        }
      );
    }
  }
  return entries;
}