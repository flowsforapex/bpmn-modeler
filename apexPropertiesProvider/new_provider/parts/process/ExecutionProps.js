import {
  CollapsibleEntry, HeaderButton,
  isSelectEntryEdited, isTextAreaEntryEdited, isToggleSwitchEntryEdited, SelectEntry, TextAreaEntry, ToggleSwitchEntry
} from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';

import ExtensionHelper from '../../helper/ExtensionHelper';

import { getContainer, openEditor } from '../../plugins/monacoEditor';

const potentialStartingUsersHelper = new ExtensionHelper('apex:PotentialStartingUsers');
const potentialStartingGroupsHelper = new ExtensionHelper('apex:PotentialStartingGroups');
const excludedStartingUsersHelper = new ExtensionHelper('apex:ExcludedStartingUsers');

export default function (element) {
  const entries = [
    {
      id: 'isCallable',
      element,
      component: IsCallable,
      isEdited: isToggleSwitchEntryEdited,
    },
    {
      id: 'isStartable',
      element,
      component: IsStartable,
      isEdited: isToggleSwitchEntryEdited,
    }
  ];

  if (element.businessObject.isStartable === 'true') {
    entries.push(...[{
      id: 'potentialStartingUsers',
      element,
      component: PotentialStartingUsers,
    },
    {
      id: 'potentialStartingGroups',
      element,
      component: PotentialStartingGroups,
    },
    {
      id: 'excludedStartingUsers',
      element,
      component: ExcludedStartingUsers,
    }]);
  }

  return entries;
}

function IsCallable(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => 
    // TODO default value not working in APEX atm
    
    // var value = element.businessObject.isCallable;

    // if (typeof value === 'undefined') {
    //   modeling.updateProperties(element, {
    //     isCallable: 'false',
    //   });
    // }

     (element.businessObject.isCallable === 'true')
  ;

  const setValue = (value) => {
    modeling.updateProperties(element, {
      isCallable: value ? 'true' : 'false',
    });
  };

  return new ToggleSwitchEntry({
    id: id,
    element: element,
    label: translate('Is Callable'),
    description: translate('Select if this diagram should be called in a Call Activity'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce,
  });
}

function IsStartable(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => 
    // TODO default value not working in APEX atm
    
    // var value = element.businessObject.isStartable;

    // if (typeof value === 'undefined') {
    //   modeling.updateProperties(element, {
    //     isStartable: 'false',
    //   });
    // }

     (element.businessObject.isStartable === 'true')
  ;

  const setValue = (value) => {
    modeling.updateProperties(element, {
      isStartable: value ? 'true' : 'false',
    });
  };

  return new ToggleSwitchEntry({
    id: id,
    element: element,
    label: translate('Is Startable'),
    description: translate('Select if this diagram is startable'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce,
  });
}

/** *** PotentialStarting Users *** **/

function PotentialStartingUsers(props) {
  const { element, id } = props;

  const translate = useService('translate');

  return new CollapsibleEntry({
    id: id,
    element: element,
    label: translate('Potential Starting Users'),
    entries: [
      {
        id: 'potentialStartingUsersExpressionType',
        element,
        component: PotentialStartingUsersExpressionType,
        isEdited: isSelectEntryEdited,
      },
      {
        id: 'potentialStartingUsersExpression',
        element,
        component: PotentialStartingUsersExpression,
        isEdited: isTextAreaEntryEdited,
      },
      {
        id: 'potentialStartingUsersExpressionEditorContainer',
        element,
        component: PotentialStartingUsersExpressionEditorContainer,
      },
      {
        id: 'potentialStartingUsersExpressionEditor',
        element,
        component: PotentialStartingUsersExpressionEditor,
      },
    ]
  });
}

function PotentialStartingUsersExpressionType(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () =>
    potentialStartingUsersHelper.getExtensionProperty(element, 'expressionType');

  const setValue = value =>
    potentialStartingUsersHelper.setExtensionProperty(element, modeling, bpmnFactory, {
      expressionType: value,
    });

  return new SelectEntry({
    id: id,
    element: element,
    label: translate('Expression Type'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce,
    getOptions: function () {
      return [
        { label: translate('Static'), value: 'static' },
        { label: translate('Process Variable'), value: 'processVariable' },
        { label: translate('SQL query (single value)'), value: 'sqlQuerySingle' },
        { label: translate('SQL query (colon delimited list)'), value: 'sqlQueryList' },
        { label: translate('Expression'), value: 'plsqlExpression' },
        { label: translate('Function Body'), value: 'plsqlFunctionBody' },
      ];
    },
  });
}

function PotentialStartingUsersExpression(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () =>
  potentialStartingUsersHelper.getExtensionProperty(element, 'expression');

  const setValue = value =>
  potentialStartingUsersHelper.setExtensionProperty(element, modeling, bpmnFactory, {
    expression: value,
    });

  const entry = new TextAreaEntry({
    id: id,
    element: element,
    label: translate('Expression'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce,
  });

  return entry;
}

function PotentialStartingUsersExpressionEditorContainer(props) {
  const translate = useService('translate');

  return getContainer('potentialStartingUsersExpression', translate);
}

function PotentialStartingUsersExpressionEditor(props) {
  const { element, id } = props;
  const modeling = useService('modeling');
  const translate = useService('translate');
  const bpmnFactory = useService('bpmnFactory');

  const expressionType = potentialStartingUsersHelper.getExtensionProperty(element, 'expressionType');

  const language =
    expressionType === 'sqlQuerySingle' || expressionType === 'sqlQueryList' ? 'sql' : 'plsql';

  if (
    [
      'sqlQuerySingle',
      'sqlQueryList',
      'plsqlExpression',
      'plsqlFunctionBody',
    ].includes(expressionType)
  ) {
    return new HeaderButton({
      id: id,
      children: translate('Open editor'),
      onClick: function () {
        var getExpression = function () {
          return potentialStartingUsersHelper.getExtensionProperty(element, 'expression');
        };
        var saveExpression = function (text) {
          potentialStartingUsersHelper.setExtensionProperty(element, modeling, bpmnFactory, {
            expression: text,
          });
        };
        openEditor(
          'potentialStartingUsersExpression',
          getExpression,
          saveExpression,
          language,
          expressionType
        );
      },
    });
  }
}

/** *** PotentialStarting Groups *** **/

function PotentialStartingGroups(props) {
  const { element, id } = props;

  const translate = useService('translate');

  return new CollapsibleEntry({
    id: id,
    element: element,
    label: translate('Potential Starting Groups'),
    entries: [
      {
        id: 'potentialStartingGroupsExpressionType',
        element,
        component: PotentialStartingGroupsExpressionType,
        isEdited: isSelectEntryEdited,
      },
      {
        id: 'potentialStartingGroupsExpression',
        element,
        component: PotentialStartingGroupsExpression,
        isEdited: isTextAreaEntryEdited,
      },
      {
        id: 'potentialStartingGroupsExpressionEditorContainer',
        element,
        component: PotentialStartingGroupsExpressionEditorContainer,
      },
      {
        id: 'potentialStartingGroupsExpressionEditor',
        element,
        component: PotentialStartingGroupsExpressionEditor,
      },
    ]
  });
}

function PotentialStartingGroupsExpressionType(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () =>
    potentialStartingGroupsHelper.getExtensionProperty(element, 'expressionType');

  const setValue = value =>
    potentialStartingGroupsHelper.setExtensionProperty(element, modeling, bpmnFactory, {
      expressionType: value,
    });

  return new SelectEntry({
    id: id,
    element: element,
    label: translate('Expression Type'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce,
    getOptions: function () {
      return [
        { label: translate('Static'), value: 'static' },
        { label: translate('Process Variable'), value: 'processVariable' },
        { label: translate('SQL query (single value)'), value: 'sqlQuerySingle' },
        { label: translate('SQL query (colon delimited list)'), value: 'sqlQueryList' },
        { label: translate('Expression'), value: 'plsqlExpression' },
        { label: translate('Function Body'), value: 'plsqlFunctionBody' },
      ];
    },
  });
}

function PotentialStartingGroupsExpression(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () =>
  potentialStartingGroupsHelper.getExtensionProperty(element, 'expression');

  const setValue = value =>
  potentialStartingGroupsHelper.setExtensionProperty(element, modeling, bpmnFactory, {
    expression: value,
    });

  const entry = new TextAreaEntry({
    id: id,
    element: element,
    label: translate('Expression'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce,
  });

  return entry;
}

function PotentialStartingGroupsExpressionEditorContainer(props) {
  const translate = useService('translate');

  return getContainer('potentialStartingGroupsExpression', translate);
}

function PotentialStartingGroupsExpressionEditor(props) {
  const { element, id } = props;
  const modeling = useService('modeling');
  const translate = useService('translate');
  const bpmnFactory = useService('bpmnFactory');

  const expressionType = potentialStartingGroupsHelper.getExtensionProperty(element, 'expressionType');

  const language =
    expressionType === 'sqlQuerySingle' || expressionType === 'sqlQueryList' ? 'sql' : 'plsql';

  if (
    [
      'sqlQuerySingle',
      'sqlQueryList',
      'plsqlExpression',
      'plsqlFunctionBody',
    ].includes(expressionType)
  ) {
    return new HeaderButton({
      id: id,
      children: translate('Open editor'),
      onClick: function () {
        var getExpression = function () {
          return potentialStartingGroupsHelper.getExtensionProperty(element, 'expression');
        };
        var saveExpression = function (text) {
          potentialStartingGroupsHelper.setExtensionProperty(element, modeling, bpmnFactory, {
            expression: text,
          });
        };
        openEditor(
          'potentialStartingGroupsExpression',
          getExpression,
          saveExpression,
          language,
          expressionType
        );
      },
    });
  }
}

/** *** ExcludedStarting Users *** **/

function ExcludedStartingUsers(props) {
  const { element, id } = props;

  const translate = useService('translate');

  return new CollapsibleEntry({
    id: id,
    element: element,
    label: translate('Excluded Starting Users'),
    entries: [
      {
        id: 'excludedStartingUsersExpressionType',
        element,
        component: ExcludedStartingUsersExpressionType,
        isEdited: isSelectEntryEdited,
      },
      {
        id: 'excludedStartingUsersExpression',
        element,
        component: ExcludedStartingUsersExpression,
        isEdited: isTextAreaEntryEdited,
      },
      {
        id: 'excludedStartingUsersExpressionEditorContainer',
        element,
        component: ExcludedStartingUsersExpressionEditorContainer,
      },
      {
        id: 'excludedStartingUsersExpressionEditor',
        element,
        component: ExcludedStartingUsersExpressionEditor,
      },
    ]
  });
}

function ExcludedStartingUsersExpressionType(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () =>
    excludedStartingUsersHelper.getExtensionProperty(element, 'expressionType');

  const setValue = value =>
    excludedStartingUsersHelper.setExtensionProperty(element, modeling, bpmnFactory, {
      expressionType: value,
    });

  return new SelectEntry({
    id: id,
    element: element,
    label: translate('Expression Type'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce,
    getOptions: function () {
      return [
        { label: translate('Static'), value: 'static' },
        { label: translate('Process Variable'), value: 'processVariable' },
        { label: translate('SQL query (single value)'), value: 'sqlQuerySingle' },
        { label: translate('SQL query (colon delimited list)'), value: 'sqlQueryList' },
        { label: translate('Expression'), value: 'plsqlExpression' },
        { label: translate('Function Body'), value: 'plsqlFunctionBody' },
      ];
    },
  });
}

function ExcludedStartingUsersExpression(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () =>
    excludedStartingUsersHelper.getExtensionProperty(element, 'expression');

  const setValue = value =>
    excludedStartingUsersHelper.setExtensionProperty(element, modeling, bpmnFactory, {
      expression: value,
    });

  const entry = new TextAreaEntry({
    id: id,
    element: element,
    label: translate('Expression'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce,
  });

  return entry;
}

function ExcludedStartingUsersExpressionEditorContainer(props) {
  const translate = useService('translate');

  return getContainer('excludedStartingUsersExpression', translate);
}

function ExcludedStartingUsersExpressionEditor(props) {
  const { element, id } = props;
  const modeling = useService('modeling');
  const translate = useService('translate');
  const bpmnFactory = useService('bpmnFactory');

  const expressionType = excludedStartingUsersHelper.getExtensionProperty(element, 'expressionType');

  const language =
    expressionType === 'sqlQuerySingle' || expressionType === 'sqlQueryList' ? 'sql' : 'plsql';

  if (
    [
      'sqlQuerySingle',
      'sqlQueryList',
      'plsqlExpression',
      'plsqlFunctionBody',
    ].includes(expressionType)
  ) {
    return new HeaderButton({
      id: id,
      children: translate('Open editor'),
      onClick: function () {
        var getExpression = function () {
          return excludedStartingUsersHelper.getExtensionProperty(element, 'expression');
        };
        var saveExpression = function (text) {
          excludedStartingUsersHelper.setExtensionProperty(element, modeling, bpmnFactory, {
            expression: text,
          });
        };
        openEditor(
          'excludedStartingUsersExpression',
          getExpression,
          saveExpression,
          language,
          expressionType
        );
      },
    });
  }
}