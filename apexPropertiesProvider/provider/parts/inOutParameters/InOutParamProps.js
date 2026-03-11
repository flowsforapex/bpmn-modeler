
import {
  isSelectEntryEdited,
  isTextAreaEntryEdited,
  isTextFieldEntryEdited
} from '@bpmn-io/properties-panel';

import { useService } from 'bpmn-js-properties-panel';

import { DefaultSelectEntry, DefaultTextAreaEntry, DefaultTextFieldEntry, DefaultToggleSwitchEntry } from '../../helper/templates';

import { html } from 'htm/preact';

export default function InOutParamProps(args) {
  
  const { idPrefix, param, element } = args;
  
  const entries = [];

  // Basic parameter fields
  entries.push(
    {
      id: `${idPrefix}-name`,
      element,
      listElement: param,
      component: NameProp,
      isEdited: isTextFieldEntryEdited,
    },
    {
      id: `${idPrefix}-type`,
      element,
      listElement: param,
      component: TypeProp,
      isEdited: isSelectEntryEdited,
    },
    {
      id: `${idPrefix}-required`,
      element,
      listElement: param,
      component: RequiredProp,
      // isEdited: isToggleSwitchEntryEdited,
    },
    {
      id: `${idPrefix}-description`,
      element,
      listElement: param,
      component: DescriptionProp,
      isEdited: isTextAreaEntryEdited,
    },
    {
      id: `${idPrefix}-expressionType`,
      element,
      listElement: param,
      component: ExpressionTypeProp,
      isEdited: isSelectEntryEdited,
    },
    {
      id: `${idPrefix}-expression`,
      element,
      listElement: param,
      component: ExpressionProp,
      isEdited: isTextFieldEntryEdited,
    }
  );

  return entries;
}

function NameProp(props) {

  const {id, element, listElement} = props;

  const translate = useService('translate');

  return html`<${DefaultTextFieldEntry}
    id=${id}
    element=${element}
    listElement=${listElement}
    label=${translate('Name')}
    property=name
  />`;
}

function TypeProp(props) {

  const {id, element, listElement} = props;

  const translate = useService('translate');

  const dataTypeOptions = [
    { label: translate('string'), value: 'string' },
    { label: translate('number'), value: 'number' },
    { label: translate('boolean'), value: 'boolean' },
    { label: translate('array'), value: 'array' },
    { label: translate('object'), value: 'object' },
  ];

  return html`<${DefaultSelectEntry}
    id=${id}
    element=${element}
    listElement=${listElement}
    label=${translate('Type')}
    property=type
    options=${dataTypeOptions}
  />`;
}

function RequiredProp(props) {

  const {id, element, listElement} = props;

  const translate = useService('translate');

  return html`<${DefaultToggleSwitchEntry}
    id=${id}
    element=${element}
    listElement=${listElement}
    label=${translate('Required')}
    property=required
    defaultValue=false
  />`;
}

function DescriptionProp(props) {

  const {id, element, listElement} = props;

  const translate = useService('translate');

  return html`<${DefaultTextAreaEntry}
    id=${id}
    element=${element}
    listElement=${listElement}
    label=${translate('Description')}
    property=description
  />`;
}

function ExpressionTypeProp(props) {

  const {id, element, listElement} = props;

  const translate = useService('translate');

  const options = [
    { label: translate('Static'), value: 'static' },
    { label: translate('User Input'), value: 'userInput' },
    { label: translate('Process Variable'), value: 'processVariable' },
  ];

  const cleanup = (value) => {
    return {
      ...(value === 'userInput' && {'source.expression': null}),
    };
  }

  return html`<${DefaultSelectEntry}
    id=${id}
    element=${element}
    listElement=${listElement}
    label=${translate('Source')}
    property='source.expressionType'
    options=${options}
    cleanup=${cleanup}
  />`;
}

function ExpressionProp(props) {

  const {id, element, listElement} = props;

  const translate = useService('translate');

  const expressionType = listElement.source.expressionType;

  if (expressionType === 'processVariable' || expressionType === 'static') {
    return html`<${DefaultTextFieldEntry}
      id=${id}
      element=${element}
      listElement=${listElement}
      label=${translate('Expression')}
      property='source.expression'
    />`;
  }
}