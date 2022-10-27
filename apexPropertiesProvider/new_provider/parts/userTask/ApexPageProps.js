import {
  isTextFieldEntryEdited, ListGroup, TextFieldEntry
} from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';

import ExtensionHelper from '../../helper/ExtensionHelper';


import parametersProps from '../lists/PageItemsList';

const extensionHelper = new ExtensionHelper('apex:ApexPage');

export default function (element, injector) {
  return [
    {
      id: 'applicationId',
      element,
      component: ApplicationId,
      isEdited: isTextFieldEntryEdited,
    },
    {
      id: 'pageId',
      element,
      component: PageId,
      isEdited: isTextFieldEntryEdited,
    },
    {
      id: 'pageItems',
      element,
      label: 'Page Items',
      component: ListGroup,
      ...parametersProps({ element, injector }),
    },
  ];
}

function ApplicationId(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () => extensionHelper.getExtensionProperty(element, 'applicationId');

  const setValue = value => extensionHelper.setExtensionProperty(
      element,
      modeling,
      bpmnFactory,
      { applicationId: value }
    );

  return new TextFieldEntry({
      id: id,
      element: element,
      label: translate('Application ID'),
      getValue: getValue,
      setValue: setValue,
      debounce: debounce
  });
}

function PageId(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () => extensionHelper.getExtensionProperty(element, 'pageId');

  const setValue = value => extensionHelper.setExtensionProperty(
      element,
      modeling,
      bpmnFactory,
      { pageId: value }
    );

  return new TextFieldEntry({
      id: id,
      element: element,
      label: translate('Page ID'),
      getValue: getValue,
      setValue: setValue,
      debounce: debounce
  });
}
