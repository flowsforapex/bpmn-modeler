import entryFactory from "bpmn-js-properties-panel/lib/factory/EntryFactory";

import { is } from "bpmn-js/lib/util/ModelUtil";


export default function(group, element) {

  // PL/SQL Code Property will only be available
  // for elements of type ScriptTask
  if ( is(element, "bpmn:ScriptTask") || is( element, "bpmn:ServiceTask" ) ) {
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
    group.entries.push(
      entryFactory.selectBox(
        {
          id: "serviceTaskType",
          description: "choose the Type of the Service Task",
          modelProperty: "serviceTaskType",
          selectOptions: [ 
            { name: "Run PL/SQL Code", value: "PL/SQL" },
            { name: "Send Mail using APEX Template", value: "Template" }
          ] ,    
          
          get: function (element, node) {
            var bo = getBusinessObject(element);
            return {externalTopic: bo.get('camunda:topic')};
          },
          
          set: function (element, values, node) {
            var bo = getBusinessObject(element);
            return cmdHelper.updateBusinessObject(element, bo, {
                'camunda:topic': values.externalTopic
            });
          }
        }
      ),      
    );
    console.log("1");
    console.log(group.entries[2]);
    console.log("2");
    console.log(entryFactory.selectBox.get);

    
  }
}
