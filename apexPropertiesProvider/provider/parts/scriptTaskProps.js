import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import { is } from 'bpmn-js/lib/util/ModelUtil';
import { isOptionSelected } from '../../../lib/formsHelper';

export default function (element, translate) {
  const scriptTaskEngine = '[name="engine"]';
  const engineNo = 0;
  const scriptTaskProps = [];
  
  if (is(element, 'bpmn:ScriptTask')) {
    // if 'yes' then add 'autoBinds' 
    scriptTaskProps.push(
      entryFactory.selectBox(translate, {
        id: 'engine',
        description: 'Use APEX_EXEC',
        modelProperty: 'engine',
        label: 'Engine',
        selectOptions: [
          { name: 'No', value: 'false' },
          { name: 'Yes', value: 'true' }
        ]
      })
    );

    // Run PL/SQL Code
    scriptTaskProps.push(
      entryFactory.textBox(translate, {
        id: 'plsqlCode',
        description: 'Enter the PL/SQL code to be executed.',
        label: 'PL/SQL Code',
        modelProperty: 'plsqlCode'
      })
    );

    // only shown, when APEX_EXEC is used
    scriptTaskProps.push(
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
          return isOptionSelected(scriptTaskEngine, engineNo);
        }
      }
      )
    );
  }

  return scriptTaskProps;
}
