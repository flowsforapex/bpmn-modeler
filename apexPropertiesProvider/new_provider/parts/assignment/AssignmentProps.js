import {
  CollapsibleEntry, HeaderButton,
  isSelectEntryEdited, isTextAreaEntryEdited, SelectEntry, TextAreaEntry
} from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';

import ExtensionHelper from '../../helper/ExtensionHelper';

import { getContainer, openEditor } from '../../plugins/monacoEditor';

const potentialUsersHelper = new ExtensionHelper('apex:PotentialUsers');
const potentialGroupsHelper = new ExtensionHelper('apex:PotentialGroups');
const excludedUsersHelper = new ExtensionHelper('apex:ExcludedUsers');

export default function (element) {
  return [
    {
      id: 'potentialUsers',
      element,
      component: PotentialUsers,
    },
    {
      id: 'potentialGroups',
      element,
      component: PotentialGroups,
    },
    {
      id: 'excludedUsers',
      element,
      component: ExcludedUsers,
    }
  ];
}

/** *** Potential Users *** **/

function PotentialUsers(props) {
  const { element, id } = props;

  const translate = useService('translate');

  return new CollapsibleEntry({
    id: id,
    element: element,
    label: translate('Potential Users'),
    entries: [
      {
        id: 'potentialUsersExpressionType',
        element,
        component: PotentialUsersExpressionType,
        isEdited: isSelectEntryEdited,
      },
      {
        id: 'potentialUsersExpression',
        element,
        component: PotentialUsersExpression,
        isEdited: isTextAreaEntryEdited,
      },
      {
        id: 'potentialUsersExpressionEditorContainer',
        element,
        component: PotentialUsersExpressionEditorContainer,
      },
      {
        id: 'potentialUsersExpressionEditor',
        element,
        component: PotentialUsersExpressionEditor,
      },
    ]
  });
}

function PotentialUsersExpressionType(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () =>
    potentialUsersHelper.getExtensionProperty(element, 'expressionType');

  const setValue = value =>
    potentialUsersHelper.setExtensionProperty(element, modeling, bpmnFactory, {
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

function PotentialUsersExpression(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () =>
  potentialUsersHelper.getExtensionProperty(element, 'expression');

  const setValue = value =>
  potentialUsersHelper.setExtensionProperty(element, modeling, bpmnFactory, {
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

function PotentialUsersExpressionEditorContainer(props) {
  const translate = useService('translate');

  return getContainer('potentialUsersExpression', translate);
}

function PotentialUsersExpressionEditor(props) {
  const { element, id } = props;
  const modeling = useService('modeling');
  const translate = useService('translate');
  const bpmnFactory = useService('bpmnFactory');

  const expressionType = potentialUsersHelper.getExtensionProperty(element, 'expressionType');

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
          return potentialUsersHelper.getExtensionProperty(element, 'expression');
        };
        var saveExpression = function (text) {
          potentialUsersHelper.setExtensionProperty(element, modeling, bpmnFactory, {
            expression: text,
          });
        };
        openEditor(
          'potentialUsersExpression',
          getExpression,
          saveExpression,
          language,
          expressionType
        );
      },
    });
  }
}

/** *** Potential Groups *** **/

function PotentialGroups(props) {
  const { element, id } = props;

  const translate = useService('translate');

  return new CollapsibleEntry({
    id: id,
    element: element,
    label: translate('Potential Groups'),
    entries: [
      {
        id: 'potentialGroupsExpressionType',
        element,
        component: PotentialGroupsExpressionType,
        isEdited: isSelectEntryEdited,
      },
      {
        id: 'potentialGroupsExpression',
        element,
        component: PotentialGroupsExpression,
        isEdited: isTextAreaEntryEdited,
      },
      {
        id: 'potentialGroupsExpressionEditorContainer',
        element,
        component: PotentialGroupsExpressionEditorContainer,
      },
      {
        id: 'potentialGroupsExpressionEditor',
        element,
        component: PotentialGroupsExpressionEditor,
      },
    ]
  });
}

function PotentialGroupsExpressionType(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () =>
    potentialGroupsHelper.getExtensionProperty(element, 'expressionType');

  const setValue = value =>
    potentialGroupsHelper.setExtensionProperty(element, modeling, bpmnFactory, {
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

function PotentialGroupsExpression(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () =>
  potentialGroupsHelper.getExtensionProperty(element, 'expression');

  const setValue = value =>
  potentialGroupsHelper.setExtensionProperty(element, modeling, bpmnFactory, {
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

function PotentialGroupsExpressionEditorContainer(props) {
  const translate = useService('translate');

  return getContainer('potentialGroupsExpression', translate);
}

function PotentialGroupsExpressionEditor(props) {
  const { element, id } = props;
  const modeling = useService('modeling');
  const translate = useService('translate');
  const bpmnFactory = useService('bpmnFactory');

  const expressionType = potentialGroupsHelper.getExtensionProperty(element, 'expressionType');

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
          return potentialGroupsHelper.getExtensionProperty(element, 'expression');
        };
        var saveExpression = function (text) {
          potentialGroupsHelper.setExtensionProperty(element, modeling, bpmnFactory, {
            expression: text,
          });
        };
        openEditor(
          'potentialGroupsExpression',
          getExpression,
          saveExpression,
          language,
          expressionType
        );
      },
    });
  }
}

/** *** Excluded Users *** **/

function ExcludedUsers(props) {
  const { element, id } = props;

  const translate = useService('translate');

  return new CollapsibleEntry({
    id: id,
    element: element,
    label: translate('Excluded Users'),
    entries: [
      {
        id: 'excludedUsersExpressionType',
        element,
        component: ExcludedUsersExpressionType,
        isEdited: isSelectEntryEdited,
      },
      {
        id: 'excludedUsersExpression',
        element,
        component: ExcludedUsersExpression,
        isEdited: isTextAreaEntryEdited,
      },
      {
        id: 'excludedUsersExpressionEditorContainer',
        element,
        component: ExcludedUsersExpressionEditorContainer,
      },
      {
        id: 'excludedUsersExpressionEditor',
        element,
        component: ExcludedUsersExpressionEditor,
      },
    ]
  });
}

function ExcludedUsersExpressionType(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () =>
    excludedUsersHelper.getExtensionProperty(element, 'expressionType');

  const setValue = value =>
    excludedUsersHelper.setExtensionProperty(element, modeling, bpmnFactory, {
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

function ExcludedUsersExpression(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () =>
    excludedUsersHelper.getExtensionProperty(element, 'expression');

  const setValue = value =>
    excludedUsersHelper.setExtensionProperty(element, modeling, bpmnFactory, {
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

function ExcludedUsersExpressionEditorContainer(props) {
  const translate = useService('translate');

  return getContainer('excludedUsersExpression', translate);
}

function ExcludedUsersExpressionEditor(props) {
  const { element, id } = props;
  const modeling = useService('modeling');
  const translate = useService('translate');
  const bpmnFactory = useService('bpmnFactory');

  const expressionType = excludedUsersHelper.getExtensionProperty(element, 'expressionType');

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
          return excludedUsersHelper.getExtensionProperty(element, 'expression');
        };
        var saveExpression = function (text) {
          excludedUsersHelper.setExtensionProperty(element, modeling, bpmnFactory, {
            expression: text,
          });
        };
        openEditor(
          'excludedUsersExpression',
          getExpression,
          saveExpression,
          language,
          expressionType
        );
      },
    });
  }
}