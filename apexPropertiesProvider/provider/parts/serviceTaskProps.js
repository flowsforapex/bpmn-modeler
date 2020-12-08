import entryFactory from "bpmn-js-properties-panel/lib/factory/EntryFactory";
import cmdHelper from "bpmn-js-properties-panel/lib/helper/CmdHelper";
import { is, getBusinessObject } from "bpmn-js/lib/util/ModelUtil";
import { isOptionSelected } from "../../../lib/formsHelper";

export default function (group, element) {
  // PL/SQL Code Property will only be available for elements of type ScriptTask
  if (is(element, "bpmn:ServiceTask")) {
    group.entries.push(
      entryFactory.selectBox(
        {
          id: "serviceTaskType",
          description: "choose the Type of the Service Task",
          modelProperty: "serviceTaskType",
          selectOptions: [
            { name: "Run PL/SQL Code", value: "PL/SQL" },
            { name: "Send Mail using APEX Template", value: "Template" }
          ],
          set: function (element, values, node) {
            var bo = getBusinessObject(element);
            return cmdHelper.updateBusinessObject(element, bo, {
              'serviceTaskType': values.serviceTaskType
            });
          }
        }
      ),
    );
    
    // Run PL/SQL Code
    group.entries.push(
      entryFactory.textBox({
        id: "plsqlCode",
        description: "Enter the PL/SQL code to be executed.",
        label: "PL/SQL Code",
        modelProperty: "plsqlCode",
        set: function (element, values, node) {
          var bo = getBusinessObject(element);
          return cmdHelper.updateBusinessObject(element, bo, {
            'plsqlCode': values.plsqlCode
          });
        },
        show: function () {
          return isOptionSelected('[name="serviceTaskType"]', 0);
        }
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
          ],
          hidden: function () {
            return isOptionSelected('[name="serviceTaskType"]', 1);
          }  
        }
      )
    );

    // Send Mail Using Template
    group.entries.push(
      entryFactory.textBox({
        id: "applicationId",
        description: "Enter the Application ID.",
        label: "Application ID",
        modelProperty: "applicationId",
        set: function (element, values, node) {
          var bo = getBusinessObject(element);
          return cmdHelper.updateBusinessObject(element, bo, {
            'applicationId': values.applicationId
          });
        },
        show: function () {
          return isOptionSelected('[name="serviceTaskType"]', 1);
        }
      })
    );

    group.entries.push(
      entryFactory.textBox({
        id: "pageId",
        description: "Enter the Page ID.",
        label: "Page ID",
        modelProperty: "pageId",
        set: function (element, values, node) {
          var bo = getBusinessObject(element);
          return cmdHelper.updateBusinessObject(element, bo, {
            'pageId': values.pageId
          });
        },
        show: function () {
          return isOptionSelected('[name="serviceTaskType"]', 1);
        }
      })
    );

    group.entries.push(
      entryFactory.textBox({
        id: "username",
        description: "Enter the Username.",
        label: "Username",
        modelProperty: "username",
        set: function (element, values, node) {
          var bo = getBusinessObject(element);
          return cmdHelper.updateBusinessObject(element, bo, {
            'username': values.username
          });
        },
        show: function () {
          return isOptionSelected('[name="serviceTaskType"]', 1);
        }
      })
    );

    group.entries.push(
      entryFactory.textBox({
        id: "templateIdentifier",
        description: "Enter the Template Identifier.",
        label: "Template Identifier",
        modelProperty: "templateIdentifier",
        set: function (element, values, node) {
          var bo = getBusinessObject(element);
          return cmdHelper.updateBusinessObject(element, bo, {
            'templateIdentifier': values.templateIdentifier
          });
        },
        show: function () {
          return isOptionSelected('[name="serviceTaskType"]', 1);
        }
      })
    );

    group.entries.push(
      entryFactory.textBox({
        id: "emailFrom",
        description: "Enter the email sender.",
        label: "Email From",
        modelProperty: "emailFrom",
        set: function (element, values, node) {
          var bo = getBusinessObject(element);
          return cmdHelper.updateBusinessObject(element, bo, {
            'emailFrom': values.emailFrom
          });
        },
        show: function () {
          return isOptionSelected('[name="serviceTaskType"]', 1);
        }
      })
    );

    group.entries.push(
      entryFactory.textBox({
        id: "emailTo",
        description: "Enter the email recipient.",
        label: "Email To",
        modelProperty: "emailTo",
        set: function (element, values, node) {
          var bo = getBusinessObject(element);
          return cmdHelper.updateBusinessObject(element, bo, {
            'emailTo': values.emailTo
          });
        },
        show: function () {
          return isOptionSelected('[name="serviceTaskType"]', 1);
        }
      })
    );
  }
}
