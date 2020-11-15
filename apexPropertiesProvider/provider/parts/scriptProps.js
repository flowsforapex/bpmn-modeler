import entryFactory from "bpmn-js-properties-panel/lib/factory/EntryFactory";

import { is } from "bpmn-js/lib/util/ModelUtil";


export default function(group, element) {

  // PL/SQL Code Property will only be available
  // for elements of type ScriptTask
  if ( is(element, "bpmn:ScriptTask") ) {
    group.entries.push(
      entryFactory.textBox({
        id : "plsqlCode",
        description : "Enter the PL/SQL code to be executed.",
        label : "PL/SQL Code",
        modelProperty : "plsqlCode"
      })
    );

    group.entries.push(
      entryFactory.selectBox(
        {
          id: "autoBinds",
          description: "Enable automatic parameter binding of APEX Page Items.<br />Set to Yes if you only reference APEX Page Items.",
          label: "Bind Page Item Values",
          modelProperty: "autoBinds",
          selectOptions: [ 
            { name: "No", value: "false" },
            { name: "Yes", value: "true" }
          ]     
        }
      )
    );
  }
}
