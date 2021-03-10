import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import cmdHelper from 'bpmn-js-properties-panel/lib/helper/CmdHelper';
import { is, getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { isOptionSelected } from '../../../lib/formsHelper';

export default function (element, translate) {
  const serviceTaskEngine = '[name="engine"]';
  const engineNo = 0;
  const serviceTaskType = '[name="serviceTaskType"]';
  const typePlsql = 0;
  const typeEmail = 1;
  const serviceTaskProps = [];

  if (is(element, 'bpmn:ServiceTask')) {
    serviceTaskProps.push(
      entryFactory.selectBox(translate, {
        id: 'serviceTaskType',
        description: 'choose the Type of the Service Task',
        modelProperty: 'serviceTaskType',
        selectOptions: [
          { name: 'Run PL/SQL Code', value: 'PL/SQL' },
          { name: 'Send Mail using APEX Template', value: 'Template' }
        ],
        set: function (element, values, node) {
          var bo = getBusinessObject(element);
          return cmdHelper.updateBusinessObject(element, bo, {
            'serviceTaskType': values.serviceTaskType
          });
        }
      })
    );

    // engine: if 'yes' then add 'autoBinds' 
    serviceTaskProps.push(
      entryFactory.selectBox(translate, {
        id: 'engine',
        description: 'Use APEX_EXEC',
        modelProperty: 'engine',
        label: 'Engine',
        selectOptions: [
          { name: 'No', value: 'false' },
          { name: 'Yes', value: 'true' }
        ],
        hidden: function () {
          return isOptionSelected(serviceTaskType, typeEmail);
        }
      })
    );

    // Run PL/SQL Code
    serviceTaskProps.push(
      entryFactory.textBox(translate, {
        id: 'plsqlCode',
        description: 'Enter the PL/SQL code to be executed.',
        label: 'PL/SQL Code',
        modelProperty: 'plsqlCode',
        set: function (element, values, node) {
          var bo = getBusinessObject(element);
          return cmdHelper.updateBusinessObject(element, bo, {
            plsqlCode: values.plsqlCode
          });
        },
        show: function () {
          return isOptionSelected(serviceTaskType, typePlsql);
        }
      })
    );

    serviceTaskProps.push(
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
          return isOptionSelected(serviceTaskType, typeEmail)
            || isOptionSelected(serviceTaskEngine, engineNo);
        }
      })
    );

    // Send Mail Using Template
    serviceTaskProps.push(
      entryFactory.textBox(translate, {
        id: 'applicationId',
        description: 'Enter the Application ID.',
        label: 'Application ID',
        modelProperty: 'applicationId',
        set: function (element, values, node) {
          var bo = getBusinessObject(element);
          return cmdHelper.updateBusinessObject(element, bo, {
            applicationId: values.applicationId
          });
        },
        show: function () {
          return isOptionSelected(serviceTaskType, typeEmail);
        }
      })
    );

    serviceTaskProps.push(
      entryFactory.textBox(translate, {
        id: 'pageId',
        description: 'Enter the Page ID.',
        label: 'Page ID',
        modelProperty: 'pageId',
        set: function (element, values, node) {
          var bo = getBusinessObject(element);
          return cmdHelper.updateBusinessObject(element, bo, {
            pageId: values.pageId
          });
        },
        show: function () {
          return isOptionSelected(serviceTaskType, typeEmail);
        }
      })
    );

    serviceTaskProps.push(
      entryFactory.textBox(translate, {
        id: 'username',
        description: 'Enter the Username.',
        label: 'Username',
        modelProperty: 'username',
        set: function (element, values, node) {
          var bo = getBusinessObject(element);
          return cmdHelper.updateBusinessObject(element, bo, {
            username: values.username
          });
        },
        show: function () {
          return isOptionSelected(serviceTaskType, typeEmail);
        }
      })
    );

    serviceTaskProps.push(
      entryFactory.textBox(translate, {
        id: 'templateIdentifier',
        description: 'Enter the Template Identifier.',
        label: 'Template Identifier',
        modelProperty: 'templateIdentifier',
        set: function (element, values, node) {
          var bo = getBusinessObject(element);
          return cmdHelper.updateBusinessObject(element, bo, {
            templateIdentifier: values.templateIdentifier
          });
        },
        show: function () {
          return isOptionSelected(serviceTaskType, typeEmail);
        }
      })
    );

    serviceTaskProps.push(
      entryFactory.textBox(translate, {
        id: 'emailFrom',
        description: 'Enter the email sender.',
        label: 'Email From',
        modelProperty: 'emailFrom',
        set: function (element, values, node) {
          var bo = getBusinessObject(element);
          return cmdHelper.updateBusinessObject(element, bo, {
            emailFrom: values.emailFrom
          });
        },
        show: function () {
          return isOptionSelected(serviceTaskType, typeEmail);
        }
      })
    );

    serviceTaskProps.push(
      entryFactory.textBox(translate, {
        id: 'emailTo',
        description: 'Enter the email recipient.',
        label: 'Email To',
        modelProperty: 'emailTo',
        set: function (element, values, node) {
          var bo = getBusinessObject(element);
          return cmdHelper.updateBusinessObject(element, bo, {
            emailTo: values.emailTo
          });
        },
        show: function () {
          return isOptionSelected(serviceTaskType, typeEmail);
        }
      })
    );
  }

  return serviceTaskProps;
}
