import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import extensionElementsEntry from 'bpmn-js-properties-panel/lib/provider/camunda/parts/implementation/ExtensionElements';
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';
import PropertiesHelper from '../../helper/propertiesHelper';
import SubPropertiesHelper from '../../helper/subPropertiesHelper';
import { getApplications, getTasks } from '../../plugins/metaDataCollector';

var cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');

var domQuery = require('min-dom').query;
var UpdateBusinessObjectHandler = require('bpmn-js-properties-panel/lib/cmd/UpdateBusinessObjectHandler');
var MultiCommandHandler = require('bpmn-js-properties-panel/lib/cmd/MultiCommandHandler');

var helper = new PropertiesHelper('apex:ApexApproval');

var subHelper = new SubPropertiesHelper(
  'apex:ApexApproval',
  'apex:Parameter',
  'parameter',
  'parameters',
  'apex:Parameters'
);

// element identifier for current element
var elementIdentifier;

// select list options container
var applications = [];
var tasks = [];

// extension element
var parametersElement;

// select box container
var applicationSelectBox;
var taskSelectBox;

// loading flags
var applicationsLoading;
var tasksLoading;

function enableAndResetValue(element, field, property) {
  // get dom node
  var fieldNode = domQuery(`select[name="${field.id}"]`);
  if (fieldNode) {
    // enable select box
    fieldNode.removeAttribute('disabled');
    // refresh select box options
    field.setControlValue(element, null, fieldNode, null, property);
    // return new selected value
    return fieldNode.value;
  }
  return null;
}

function refreshApplications(element) {
  var property;
  var newApplicationId;
  // loading flag
  applicationsLoading = true;
  // ajax process
  getApplications().then((values) => {
    // loading flag
    applicationsLoading = false;
    if (values) {
      applications = values;
      // get property value
      property =
        helper.getExtensionProperty(element, 'applicationId').applicationId ||
        null;
      // add entry if not contained
      if (
        property != null &&
        !applications.map(e => e.value).includes(property)
      ) {
        applications.unshift({ name: `${property}*`, value: property });
      }
      // refresh select box
      newApplicationId = enableAndResetValue(
        element,
        applicationSelectBox,
        property
      );
      // refresh child item
      refreshTasks(element, newApplicationId);
    }
  });
}

function refreshTasks(element, applicationId) {
  var property;
  var newTaskStaticId;
  // loading flag
  tasksLoading = true;
  // ajax process
  getTasks(applicationId).then((values) => {
    // loading flag
    tasksLoading = false;
    if (values) {
      tasks = values;
      // get property value
      property =
        helper.getExtensionProperty(element, 'taskStaticId').taskStaticId ||
        null;
      // add entry if not contained
      if (property != null && !tasks.map(e => e.value).includes(property)) {
        tasks.unshift({ name: `${property}*`, value: property });
      }
      // refresh select box
      newTaskStaticId = enableAndResetValue(element, taskSelectBox, property);
    }
  });
}

export function taskDefinition(element, bpmnFactory, translate) {
  const userTaskProps = [];

  var { type } = getBusinessObject(element);

  if (is(element, 'bpmn:UserTask') && type === 'apexApproval') {
    // manualInput switch
    userTaskProps.push(
      entryFactory.selectBox(translate, {
        id: 'inputSelection',
        label: translate('Input'),
        selectOptions: [
          { name: translate('Use APEX meta data'), value: 'false' },
          { name: translate('Manual input'), value: 'true' },
        ],
        modelProperty: 'manualInput',

        get: function (element) {
          var bo = getBusinessObject(element);
          var value = bo.get('manualInput');

          if (typeof value === 'undefined') {
            new UpdateBusinessObjectHandler(
              elementRegistry,
              bpmnFactory
            ).execute(
              cmdHelper.updateBusinessObject(element, bo, {
                manualInput: 'false',
              }).context
            );
          }

          return {
            manualInput: bo.get('manualInput'),
          };
        },

        set: function (element, values, node) {
          var bo = getBusinessObject(element);
          return cmdHelper.updateBusinessObject(element, bo, values);
        },
      })
    );

    // application select list
    applicationSelectBox = entryFactory.selectBox(translate, {
      id: 'applicationId',
      label: translate('Application'),
      modelProperty: 'applicationId',

      selectOptions: function () {
        return applications;
      },

      disabled: function () {
        return applicationsLoading;
      },

      hidden: function (element) {
        return getBusinessObject(element).manualInput === 'true';
      },

      get: function (element) {
        var property;
        // refresh applications (if necessary)
        if (elementIdentifier !== element) {
          elementIdentifier = element;
          refreshApplications(element);
        }
        property = helper.getExtensionProperty(element, 'applicationId');
        // add entry if not contained
        if (
          property.applicationId != null &&
          !applications.map(e => e.value).includes(property.applicationId)
        ) {
          // filter out old custom entries
          applications = applications.filter(a => !a.name.endsWith('*'));
          // add entry
          applications.unshift({
            name: `${property.applicationId}*`,
            value: property.applicationId,
          });
        }
        return property;
      },

      set: function (element, values, node) {
        // refresh task definitions
        refreshTasks(element, values.applicationId);
        // set value
        return helper.setExtensionProperty(element, bpmnFactory, values);
      },
    });

    userTaskProps.push(applicationSelectBox);

    // application text field
    userTaskProps.push(
      entryFactory.textField(translate, {
        id: 'applicationIdText',
        label: translate('Application ID'),
        modelProperty: 'applicationId',

        hidden: function (element) {
          return getBusinessObject(element).manualInput === 'false';
        },

        get: function (element) {
          var property = helper.getExtensionProperty(element, 'applicationId');
          return property;
        },

        set: function (element, values, node) {
          return helper.setExtensionProperty(element, bpmnFactory, values);
        },
      })
    );

    // task definition select list
    taskSelectBox = entryFactory.selectBox(translate, {
      id: 'taskStaticId',
      label: translate('Task Definition'),
      modelProperty: 'taskStaticId',

      selectOptions: function () {
        return tasks;
      },

      disabled: function () {
        return applicationsLoading || tasksLoading;
      },

      hidden: function (element) {
        return getBusinessObject(element).manualInput === 'true';
      },

      get: function (element) {
        var property = helper.getExtensionProperty(element, 'taskStaticId');
        // add entry if not contained
        if (
          property.taskStaticId != null &&
          !tasks.map(e => e.value).includes(property.taskStaticId)
        ) {
          // filter out old custom entries
          tasks = tasks.filter(p => !p.name.endsWith('*'));
          // add entry
          tasks.unshift({
            name: `${property.taskStaticId}*`,
            value: property.taskStaticId,
          });
        }
        return property;
      },

      set: function (element, values, node) {
        return helper.setExtensionProperty(element, bpmnFactory, values);
      },
    });

    userTaskProps.push(taskSelectBox);

    // task definition text field
    userTaskProps.push(
      entryFactory.textField(translate, {
        id: 'taskStaticIdText',
        label: translate('Task Definition Static ID'),
        modelProperty: 'taskStaticId',

        hidden: function (element) {
          return getBusinessObject(element).manualInput === 'false';
        },

        get: function (element) {
          var property = helper.getExtensionProperty(element, 'taskStaticId');
          return property;
        },

        set: function (element, values, node) {
          return helper.setExtensionProperty(element, bpmnFactory, values);
        },
      })
    );
  }

  return userTaskProps;
}

export function taskConfiguration(
  element,
  bpmnFactory,
  elementRegistry,
  commandStack,
  translate
) {
  const userTaskProps = [];

  var enterQuickPick = function (values) {
    var commands = helper.setExtensionProperty(element, bpmnFactory, values);
    new MultiCommandHandler(commandStack).preExecute(commands);
  };

  var loadParameters = function () {
    var bo = getBusinessObject(element);
    var extensions = bo.extensionElements;
    if (!extensions) {
      new UpdateBusinessObjectHandler(elementRegistry, bpmnFactory).execute(
        SubPropertiesHelper.createExtensionElement(element, bpmnFactory).context
      );
    }
    extensions = bo.extensionElements;

    if (typeof apex !== 'undefined') {
      // ajaxIdentifier
      var { ajaxIdentifier } = apex.jQuery('#modeler').modeler('option');
      // ajax process
      apex.server
        .plugin(
          ajaxIdentifier,
          {
            x01: 'GET_JSON_PARAMETERS',
            x02: helper.getExtensionProperty(element, 'applicationId')
              .applicationId,
            x03: helper.getExtensionProperty(element, 'taskStaticId')
              .taskStaticId,
          },
          {}
        )
        .then((pData) => {
          const handler = new MultiCommandHandler(commandStack);
          pData.forEach((i) => {
            handler.preExecute(
              subHelper.newElement(element, extensions, bpmnFactory, {
                parStaticId: i.STATIC_ID,
                parDataType: i.DATA_TYPE,
                parValue: i.VALUE,
              })
            );
          });
        });
    }
  };

  var { type } = getBusinessObject(element);

  if (is(element, 'bpmn:UserTask') && type === 'apexApproval') {
    // subject
    userTaskProps.push(
      entryFactory.textField(translate, {
        id: 'subject',
        description: translate(
          'Overwrite default value set in task definition'
        ),
        label: translate('Subject'),
        modelProperty: 'subject',
        set: function (element, values) {
          return helper.setExtensionProperty(element, bpmnFactory, values);
        },
        get: function (element) {
          return helper.getExtensionProperty(element, 'subject');
        },
      })
    );

    // businessRef
    userTaskProps.push(
      entryFactory.textField(translate, {
        id: 'businessRef',
        label: translate('Business Reference'),
        modelProperty: 'businessRef',
        set: function (element, values) {
          return helper.setExtensionProperty(element, bpmnFactory, values);
        },
        get: function (element) {
          return helper.getExtensionProperty(element, 'businessRef');
        },
      })
    );

    // quick pick business_ref
    userTaskProps.push(
      entryFactory.link(translate, {
        id: 'quickpick-business-ref',
        buttonLabel: translate('business_ref'),
        handleClick: function (element, node, event) {
          enterQuickPick({
            businessRef: '&F4A$BUSINESS_REF.',
          });
        },
      })
    );

    parametersElement = extensionElementsEntry(element, bpmnFactory, {
      id: 'parameters',
      label: translate('Parameters'),

      // function (element, extensionsElements, values)
      createExtensionElement: function (element, extensionElements, values) {
        return subHelper.newElement(element, extensionElements, bpmnFactory, {
          parStaticId: '',
          parDataType: 'String',
          parValue: '',
        });
      },

      // function (element, extensionsElements, value, idx)
      removeExtensionElement: function (
        element,
        extensionElements,
        value,
        idx
      ) {
        return subHelper.removeElement(element, extensionElements, idx);
      },

      getExtensionElements: function (element) {
        return subHelper.getEntries(element);
      },

      // function (element, node, option, property, value, idx)
      setOptionLabelValue: function (
        element,
        node,
        option,
        property,
        value,
        idx
      ) {
        subHelper.setOptionLabelValue(
          element,
          option,
          'parStaticId',
          'parValue',
          'parValue',
          idx
        );
      },

      onSelectionChange: function (element, node) {},
    });

    userTaskProps.push(parametersElement);

    // items quick pick
    userTaskProps.push(
      entryFactory.link(translate, {
        id: 'quickpick-parameters',
        buttonLabel: translate('Load Parameters'),
        handleClick: function (element, node, event) {
          loadParameters();
        },
      })
    );

    // parameter static ID
    userTaskProps.push(
      entryFactory.textField(translate, {
        id: 'parStaticId',
        label: translate('Static ID'),
        modelProperty: 'parStaticId',

        get: function (element, node) {
          return subHelper.getExtensionSubProperty(
            parametersElement,
            element,
            node,
            'parStaticId'
          );
        },

        set: function (element, values, node) {
          return subHelper.setExtensionSubProperty(
            parametersElement,
            element,
            node,
            values
          );
        },

        hidden: function (element, node) {
          return subHelper.isNotSelected(parametersElement, element, node);
        },
      })
    );

    // parameter data type
    userTaskProps.push(
      entryFactory.selectBox(translate, {
        id: 'parDataType',
        label: translate('Data Type'),
        modelProperty: 'parDataType',

        selectOptions: [{ name: translate('String'), value: 'String' }],

        get: function (element, node) {
          return subHelper.getExtensionSubProperty(
            parametersElement,
            element,
            node,
            'parDataType'
          );
        },

        set: function (element, values, node) {
          return subHelper.setExtensionSubProperty(
            parametersElement,
            element,
            node,
            values
          );
        },

        hidden: function (element, node) {
          return subHelper.isNotSelected(parametersElement, element, node);
        },
      })
    );

    // parameter value
    userTaskProps.push(
      entryFactory.textField(translate, {
        id: 'parValue',
        label: translate('Value'),
        modelProperty: 'parValue',

        get: function (element, node) {
          return subHelper.getExtensionSubProperty(
            parametersElement,
            element,
            node,
            'parValue'
          );
        },

        set: function (element, values, node) {
          return subHelper.setExtensionSubProperty(
            parametersElement,
            element,
            node,
            values
          );
        },

        hidden: function (element, node) {
          return subHelper.isNotSelected(parametersElement, element, node);
        },
      })
    );

    // result variable
    userTaskProps.push(
      entryFactory.textField(translate, {
        id: 'resultVariable',
        label: translate('Result Variable'),
        description: translate(
          'Name of the variable to return the approval result into'
        ),
        modelProperty: 'resultVariable',
        set: function (element, values) {
          return helper.setExtensionProperty(element, bpmnFactory, values);
        },
        get: function (element) {
          return helper.getExtensionProperty(element, 'resultVariable');
        },
      })
    );

    // initiator
    userTaskProps.push(
      entryFactory.textField(translate, {
        id: 'initiator',
        label: translate('Initiator'),
        description: translate('Initiator of this approval task'),
        modelProperty: 'initiator',
        set: function (element, values) {
          return helper.setExtensionProperty(element, bpmnFactory, values);
        },
        get: function (element) {
          return helper.getExtensionProperty(element, 'initiator');
        },
      })
    );

    // priority
    userTaskProps.push(
      entryFactory.selectBox(translate, {
        id: 'priority',
        label: translate('Priority'),
        description: translate(
          'Overwrite default value set in task definition'
        ),
        modelProperty: 'priority',
        selectOptions: [
          { name: '', value: '' },
          { name: translate('1-Urgent'), value: '1' },
          { name: translate('2-High'), value: '2' },
          { name: translate('3-Medium'), value: '3' },
          { name: translate('4-Low'), value: '4' },
          { name: translate('5-Lowest'), value: '5' },
        ],
        set: function (element, values) {
          return helper.setExtensionProperty(element, bpmnFactory, values);
        },
        get: function (element) {
          return helper.getExtensionProperty(element, 'priority');
        },
      })
    );
  }

  return userTaskProps;
}
