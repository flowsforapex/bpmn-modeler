import { isSelectEntryEdited, isTextAreaEntryEdited } from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';

import { getBusinessObject } from '../../helper/util';

import ExtensionHelper from '../../helper/ExtensionHelper';

import { DefaultSelectEntryAsync, DefaultTextAreaEntryWithEditor, DefaultToggleSwitchEntry } from '../../helper/templates';

import { useEffect, useState } from '@bpmn-io/properties-panel/preact/hooks';
import { html } from 'htm/preact';

import { getFormTemplates } from '../../plugins/metaDataCollector';

const extensionHelper = new ExtensionHelper('apex:ApexSimpleForm');

export default function (args) {

  const {element, injector} = args;

  const businessObject = getBusinessObject(element);

  const translate = injector.get('translate');

  const entries = [];

  if (businessObject.type === 'apexSimpleForm') {

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
          component: FormTemplateProp,
          isEdited: isSelectEntryEdited,
        }
      );
    }
  }
  return entries;
}

function FormTemplateProp(props) {

  const {element, id} = props;

  const translate = useService('translate');

  const [formTemplates, setFormTemplates] = useState([]);

  useEffect(() => {
    function fetchFormTemplates() {
      getFormTemplates().then(ft => setFormTemplates(ft));
    }

    fetchFormTemplates();
  }, [setFormTemplates]);

  return html`<${DefaultSelectEntryAsync}
    id=${id}
    element=${element}
    label=${translate('Form Template')}
    helper=${extensionHelper}
    property=${'formTemplateId'}
    state=${formTemplates}
  />`;
}