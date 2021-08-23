import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import { is } from 'bpmn-js/lib/util/ModelUtil';
import { isOptionSelected } from '../../../lib/formsHelper';

export default function (element, translate) {
  const serviceTaskEngine = '[name="engine"]';
  const engineNo = 0;
  const serviceTaskProps = [];

  if (is(element, 'bpmn:ServiceTask')) {
    // if 'yes' then add 'autoBinds' 
    serviceTaskProps.push(
      entryFactory.selectBox(translate, {
        id: 'engine',
        description: translate('Use APEX_EXEC'),
        modelProperty: 'engine',
        label: translate('Engine'),
        selectOptions: [
          { name: translate('No'), value: 'false' },
          { name: translate('Yes'), value: 'true' }
        ]
      })
    );

    // Run PL/SQL Code
    serviceTaskProps.push(
      entryFactory.textBox(translate, {
        id: 'plsqlCode',
        description: translate('Enter the PL/SQL code to be executed.'),
        label: translate('PL/SQL Code'),
        modelProperty: 'plsqlCode'
      })
    );

    // only shown, when APEX_EXEC is used
    serviceTaskProps.push(
      entryFactory.selectBox(translate, {
        id: 'autoBinds',
        description: translate('Enable automatic parameter binding of APEX Page Items.<br />Set to Yes if you only reference APEX Page Items.'),
        label: translate('Bind Page Item Values'),
        modelProperty: 'autoBinds',
        selectOptions: [
          { name: translate('No'), value: 'false' },
          { name: translate('Yes'), value: 'true' }
        ],
        hidden: function () {
          return isOptionSelected(serviceTaskEngine, engineNo);
        }
      }
      )
    );
  }

  return serviceTaskProps;
}
