import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import cmdHelper from 'bpmn-js-properties-panel/lib/helper/CmdHelper';
import { is, getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { isOptionSelected } from '../../../lib/formsHelper';

export default function (group, element, translate) {
  const scriptTaskElementSelector = '[name="engine"]';
  
  if (is(element, 'bpmn:ScriptTask')) {
    group.entries.push(
      entryFactory.selectBox(translate, {
        id: 'engine',
        description: 'Use APEX_EXEC',
        modelProperty: 'engine',
        selectOptions: [
          { name: 'No', value: 'false' },
          { name: 'Yes', value: 'true' }
        ]
      })
    );

    // Run PL/SQL Code
    group.entries.push(
      entryFactory.textBox(translate, {
        id: 'plsqlCode',
        description: 'Enter the PL/SQL code to be executed.',
        label: 'PL/SQL Code',
        modelProperty: 'plsqlCode'
      })
    );

    // only shown, when APEX_EXEC is used
    group.entries.push(
      entryFactory.selectBox(translate, {
        id: 'autoBinds',
        description: 'Enable automatic parameter binding of APEX Page Items.<br />Set to Yes if you only reference APEX Page Items.',
        label: 'Bind Page Item Values',
        modelProperty: 'autoBinds',
        selectOptions: [
          { name: 'No', value: 'false' },
          { name: 'Yes', value: 'true' }
        ],
        hidden: function () {
          return isOptionSelected(scriptTaskElementSelector, 0);
        }
      }
      )
    );
  }
}
