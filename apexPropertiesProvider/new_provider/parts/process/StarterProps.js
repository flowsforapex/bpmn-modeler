import {
  CollapsibleEntry, isSelectEntryEdited, isTextAreaEntryEdited
} from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';

import ExtensionHelper from '../../helper/ExtensionHelper';

import { DefaultSelectEntry, DefaultTextAreaEntry, DefaultTextAreaEntryWithEditor } from '../../helper/templates';

const potentialStartingUsersHelper = new ExtensionHelper('apex:PotentialStartingUsers');
const potentialStartingGroupsHelper = new ExtensionHelper('apex:PotentialStartingGroups');
const excludedStartingUsersHelper = new ExtensionHelper('apex:ExcludedStartingUsers');

export default function (args) {

  const {element} = args;
  
  if (element.businessObject.isStartable === 'true') {
    return [
      {
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
      }
    ];
  }

  return [];
}

function PotentialStartingUsers(props) {
  const { element, id } = props;

  const translate = useService('translate');

  const expressionTypeOptions = [
    { label: '', value: null },
    { label: translate('Static'), value: 'static' },
    { label: translate('Process Variable'), value: 'processVariable' },
    { label: translate('SQL query (single value)'), value: 'sqlQuerySingle' },
    { label: translate('SQL query (colon delimited list)'), value: 'sqlQueryList' },
    { label: translate('Expression'), value: 'plsqlExpression' },
    { label: translate('Function Body'), value: 'plsqlFunctionBody' },
  ];
  
  const editorTypes = [
    'sqlQuerySingle',
    'sqlQueryList',
    'plsqlExpression',
    'plsqlFunctionBody',
  ];

  const expressionType = potentialStartingUsersHelper.getExtensionProperty(element, 'expressionType');

  const entries = [];

  entries.push(
    {
      id: 'potentialStartingUsersExpressionType',
      element,
      label: translate('Expression Type'),
      helper: potentialStartingUsersHelper,
      property: 'expressionType',
      options: expressionTypeOptions,
      component: DefaultSelectEntry,
      isEdited: isSelectEntryEdited,
    }
  );

  if (expressionType != null) {

    if (editorTypes.includes(expressionType)) {

      const language =
      expressionType === 'sqlQuerySingle' || expressionType === 'sqlQueryList' ? 'sql' : 'plsql';

      entries.push(
        {
          id: 'potentialStartingUsersExpression',
          element,
          label: translate('Expression'),
          helper: potentialStartingUsersHelper,
          property: 'expression',
          language: language,
          type: expressionType,
          component: DefaultTextAreaEntryWithEditor,
          isEdited: isTextAreaEntryEdited,
        },
      );
    
    } else {

      entries.push(
        {
          id: 'potentialStartingUsersExpression',
          element,
          label: translate('Expression'),
          helper: potentialStartingUsersHelper,
          property: 'expression',
          component: DefaultTextAreaEntry,
          isEdited: isTextAreaEntryEdited,
        },
      );
    
    }
  }

  return new CollapsibleEntry({
    id: id,
    element: element,
    label: translate('Potential Starting Users'),
    entries: entries
  });
}

function PotentialStartingGroups(props) {
  const { element, id } = props;

  const translate = useService('translate');

  const expressionTypeOptions = [
    { label: '', value: null },
    { label: translate('Static'), value: 'static' },
    { label: translate('Process Variable'), value: 'processVariable' },
    { label: translate('SQL query (single value)'), value: 'sqlQuerySingle' },
    { label: translate('SQL query (colon delimited list)'), value: 'sqlQueryList' },
    { label: translate('Expression'), value: 'plsqlExpression' },
    { label: translate('Function Body'), value: 'plsqlFunctionBody' },
  ];
  
  const editorTypes = [
    'sqlQuerySingle',
    'sqlQueryList',
    'plsqlExpression',
    'plsqlFunctionBody',
  ];

  const expressionType = potentialStartingGroupsHelper.getExtensionProperty(element, 'expressionType');

  const entries = [];

  entries.push(
    {
      id: 'potentialStartingGroupsExpressionType',
      element,
      label: translate('Expression Type'),
      helper: potentialStartingGroupsHelper,
      property: 'expressionType',
      options: expressionTypeOptions,
      component: DefaultSelectEntry,
      isEdited: isSelectEntryEdited,
    }
  );

  if (expressionType != null) {

    if (editorTypes.includes(expressionType)) {

      const language =
      expressionType === 'sqlQuerySingle' || expressionType === 'sqlQueryList' ? 'sql' : 'plsql';

      entries.push(
        {
          id: 'potentialStartingUsersExpression',
          element,
          label: translate('Expression'),
          helper: potentialStartingGroupsHelper,
          property: 'expression',
          language: language,
          type: expressionType,
          component: DefaultTextAreaEntryWithEditor,
          isEdited: isTextAreaEntryEdited,
        },
      );
      
    } else {

      entries.push(
        {
          id: 'potentialStartingGroupsExpression',
          element,
          label: translate('Expression'),
          helper: potentialStartingGroupsHelper,
          property: 'expression',
          component: DefaultTextAreaEntry,
          isEdited: isTextAreaEntryEdited,
        },
      );

    }
  }

  return new CollapsibleEntry({
    id: id,
    element: element,
    label: translate('Potential Starting Groups'),
    entries: entries
  });
}

function ExcludedStartingUsers(props) {
  const { element, id } = props;

  const translate = useService('translate');

  const expressionTypeOptions = [
    { label: '', value: null },
    { label: translate('Static'), value: 'static' },
    { label: translate('Process Variable'), value: 'processVariable' },
    { label: translate('SQL query (single value)'), value: 'sqlQuerySingle' },
    { label: translate('SQL query (colon delimited list)'), value: 'sqlQueryList' },
    { label: translate('Expression'), value: 'plsqlExpression' },
    { label: translate('Function Body'), value: 'plsqlFunctionBody' },
  ];
  
  const editorTypes = [
    'sqlQuerySingle',
    'sqlQueryList',
    'plsqlExpression',
    'plsqlFunctionBody',
  ];

  const expressionType = excludedStartingUsersHelper.getExtensionProperty(element, 'expressionType');

  const entries = [];

  entries.push(
    {
      id: 'excludedStartingUsersExpressionType',
      element,
      label: translate('Expression Type'),
      helper: excludedStartingUsersHelper,
      property: 'expressionType',
      options: expressionTypeOptions,
      component: DefaultSelectEntry,
      isEdited: isSelectEntryEdited,
    }
  );

  if (expressionType != null) {

    if (editorTypes.includes(expressionType)) {

      const language =
      expressionType === 'sqlQuerySingle' || expressionType === 'sqlQueryList' ? 'sql' : 'plsql';

      entries.push(
        {
          id: 'excludedStartingUsersExpression',
          element,
          label: translate('Expression'),
          helper: excludedStartingUsersHelper,
          property: 'expression',
          language: language,
          type: expressionType,
          component: DefaultTextAreaEntryWithEditor,
          isEdited: isTextAreaEntryEdited,
        },
      );
      
    } else {

      entries.push(
        {
          id: 'excludedStartingUsersExpression',
          element,
          label: translate('Expression'),
          helper: excludedStartingUsersHelper,
          property: 'expression',
          component: DefaultTextAreaEntry,
          isEdited: isTextAreaEntryEdited,
        },
      );

    }
  }

  return new CollapsibleEntry({
    id: id,
    element: element,
    label: translate('Excluded Starting Users'),
    entries: entries
  });
}