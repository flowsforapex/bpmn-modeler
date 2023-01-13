import {
  CollapsibleEntry, isSelectEntryEdited, isTextAreaEntryEdited
} from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';

import ExtensionHelper from '../../helper/ExtensionHelper';

import { DefaultSelectEntry, DefaultTextAreaEntry, DefaultTextAreaEntryWithEditor } from '../../helper/templates';

const potentialUsersHelper = new ExtensionHelper('apex:PotentialUsers');
const potentialGroupsHelper = new ExtensionHelper('apex:PotentialGroups');
const excludedUsersHelper = new ExtensionHelper('apex:ExcludedUsers');

export default function (args) {

  const {element} = args;

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

  const expressionType = potentialUsersHelper.getExtensionProperty(element, 'expressionType');

  const entries = [];

  entries.push(
    {
      id: 'potentialUsersExpressionType',
      element,
      label: translate('Expression Type'),
      helper: potentialUsersHelper,
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
          id: 'potentialUsersExpression',
          element,
          label: translate('Expression'),
          helper: potentialUsersHelper,
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
          id: 'potentialUsersExpression',
          element,
          label: translate('Expression'),
          helper: potentialUsersHelper,
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
    label: translate('Potential Users'),
    entries: entries
  });
}

/** *** Potential Groups *** **/

function PotentialGroups(props) {
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

  const expressionType = potentialGroupsHelper.getExtensionProperty(element, 'expressionType');

  const entries = [];

  entries.push(
    {
      id: 'potentialGroupsExpressionType',
      element,
      label: translate('Expression Type'),
      helper: potentialGroupsHelper,
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
          id: 'potentialGroupsExpression',
          element,
          label: translate('Expression'),
          helper: potentialGroupsHelper,
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
          id: 'potentialGroupsExpression',
          element,
          label: translate('Expression'),
          helper: potentialGroupsHelper,
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
    label: translate('Potential Groups'),
    entries: entries
  });
}

/** *** Excluded Users *** **/

function ExcludedUsers(props) {
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

  const expressionType = excludedUsersHelper.getExtensionProperty(element, 'expressionType');

  const entries = [];

  entries.push(
    {
      id: 'excludedUsersExpressionType',
      element,
      label: translate('Expression Type'),
      helper: excludedUsersHelper,
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
          id: 'excludedUsersExpression',
          element,
          label: translate('Expression'),
          helper: excludedUsersHelper,
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
          id: 'excludedUsersExpression',
          element,
          label: translate('Expression'),
          helper: excludedUsersHelper,
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
    label: translate('Excluded Users'),
    entries: entries
  });
}