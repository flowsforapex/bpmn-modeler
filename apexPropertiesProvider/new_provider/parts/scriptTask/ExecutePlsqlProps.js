import {
  HeaderButton,
  isSelectEntryEdited,
  isTextAreaEntryEdited,
  SelectEntry,
  TextAreaEntry
} from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';

import ExtensionHelper from '../../helper/ExtensionHelper';

import { getContainer, openEditor } from '../../plugins/monacoEditor';

const extensionHelper = new ExtensionHelper('apex:ExecutePlsql');

export default function (element) {
  return [
    {
      id: 'plsqlCode',
      element,
      component: PlsqlCode,
      isEdited: isTextAreaEntryEdited,
    },
    {
      id: 'plsqlCodeEditorContainer',
      element,
      component: PlsqlCodeEditorContainer,
    },
    {
      id: 'plsqlCodeEditor',
      element,
      component: PlsqlCodeEditor,
    },
    {
      id: 'engine',
      element,
      component: Engine,
      isEdited: isSelectEntryEdited,
    },
    {
      id: 'autoBinds',
      element,
      component: AutoBinds,
      isEdited: isSelectEntryEdited,
    },
  ];
}

function PlsqlCode(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () =>
    extensionHelper.getExtensionProperty(element, 'plsqlCode');

  const setValue = value =>
    extensionHelper.setExtensionProperty(element, modeling, bpmnFactory, {
      plsqlCode: value,
    });

  const entry = new TextAreaEntry({
    id: id,
    element: element,
    label: translate('PL/SQL Code'),
    description: translate('Enter the PL/SQL code to be executed.'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce,
  });

  return entry;
}

function PlsqlCodeEditorContainer(props) {
  const translate = useService('translate');

  return getContainer('plsqlCode', translate);
}

function PlsqlCodeEditor(props) {
  const { element, id } = props;
  const modeling = useService('modeling');
  const translate = useService('translate');
  const bpmnFactory = useService('bpmnFactory');

  return new HeaderButton({
    id: id,
    children: translate('Open editor'),
    onClick: function () {
      var getPlsqlCode = function () {
        return extensionHelper.getExtensionProperty(element, 'plsqlCode');
      };
      var savePlsqlCode = function (text) {
        extensionHelper.setExtensionProperty(element, modeling, bpmnFactory, {
          plsqlCode: text,
        });
      };
      openEditor(
        'plsqlCode',
        getPlsqlCode,
        savePlsqlCode,
        'plsql',
        'plsqlProcess'
      );
    },
  });
}

function Engine(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () =>
    extensionHelper.getExtensionProperty(element, 'engine');

  const setValue = value =>
    extensionHelper.setExtensionProperty(element, modeling, bpmnFactory, {
      engine: value,
    });

  return new SelectEntry({
    id: id,
    element: element,
    label: translate('Use APEX_EXEC'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce,
    getOptions: function () {
      return [
        { label: translate('No'), value: 'false' },
        { label: translate('Yes (deprecated)'), value: 'true' },
      ];
    },
  });
}

function AutoBinds(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () =>
    extensionHelper.getExtensionProperty(element, 'autoBinds');

  const setValue = value =>
    extensionHelper.setExtensionProperty(element, modeling, bpmnFactory, {
      autoBinds: value,
    });

  return new SelectEntry({
    id: id,
    element: element,
    label: translate('Bind Page Item Values'),
    description: translate(
      'Enable automatic parameter binding of APEX Page Items.<br />Set to Yes if you only reference APEX Page Items.'
    ),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce,
    getOptions: function () {
      return [
        { label: translate('No'), value: 'false' },
        { label: translate('Yes (deprecated)'), value: 'true' },
      ];
    },
  });
}
