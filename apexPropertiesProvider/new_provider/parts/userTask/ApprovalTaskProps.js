import {
  isSelectEntryEdited,
  isTextFieldEntryEdited, ListGroup
} from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';

import ExtensionHelper from '../../helper/ExtensionHelper';
import ListExtensionHelper from '../../helper/ListExtensionHelper';

import ParametersList from '../parameters/ParametersList';

import { Quickpick } from '../../helper/Quickpick';

import { DefaultSelectEntryAsync, DefaultTextFieldEntry, DefaultToggleSwitchEntry } from '../../helper/templates';

import { useEffect, useState } from '@bpmn-io/properties-panel/preact/hooks';

import { getBusinessObject } from '../../helper/util';
import {
  getApplications, getJSONParameters, getTasks
} from '../../plugins/metaDataCollector';

const extensionHelper = new ExtensionHelper('apex:ApexApproval');

const listExtensionHelper = new ListExtensionHelper(
  'apex:ApexApproval',
  'apex:Parameters',
  'parameters',
  'apex:Parameter',
  'parameter'
);

export default function (args) {

  const {element, injector} = args;

  const businessObject = getBusinessObject(element);

  const translate = injector.get('translate');
  const bpmnFactory = injector.get('bpmnFactory');
  const modeling = injector.get('modeling');

  const entries = [];

  if (businessObject.type === 'apexApproval') {

    const [values, setValues] = useState({});

    useEffect(() => {
      if (!values.applications) {
        getApplications().then(applications => setValues((existing) => { return {...existing, applications: applications}; }));
      }
    }, [element.id]);

    const applicationId = extensionHelper.getExtensionProperty(element, 'applicationId');

    useEffect(() => {
      if (applicationId) {
        getTasks(applicationId).then(tasks => setValues((existing) => { return {...existing, tasks: tasks}; }));
      }
    }, [applicationId]);

    const {applications, tasks} = values;

    const manualInput = businessObject.manualInput === 'true';

    entries.push(
      {
        id: 'inputSelection',
        element,
        label: translate('Use APEX meta data'),
        property: 'manualInput',
        defaultValue: 'false',
        invert: true,
        component: DefaultToggleSwitchEntry,
        // isEdited: isToggleSwitchEntryEdited,
      }
    );

    if (manualInput) {
      entries.push(
        {
          id: 'applicationIdText',
          element,
          label: translate('Application ID'),
          helper: extensionHelper,
          property: 'applicationId',
          component: DefaultTextFieldEntry,
          isEdited: isTextFieldEntryEdited,
        },
        {
          id: 'taskStaticIdText',
          element,
          label: translate('Task Static ID'),
          helper: extensionHelper,
          property: 'taskStaticId',
          component: DefaultTextFieldEntry,
          isEdited: isTextFieldEntryEdited,
        }
      );
    } else {
      entries.push(
        {
          id: 'applicationId',
          element,
          label: translate('Application'),
          helper: extensionHelper,
          property: 'applicationId',
          state: applications,
          component: DefaultSelectEntryAsync,
          isEdited: isSelectEntryEdited,
        },
        {
          id: 'taskStaticId',
          element,
          label: translate('Task Definition'),
          helper: extensionHelper,
          property: 'taskStaticId',
          state: tasks,
          component: DefaultSelectEntryAsync,
          isEdited: isSelectEntryEdited,
        },
      );
    }

    const businessRefDescription = Quickpick(
      {
        text: translate('business_ref'),
        handler: () => {
          extensionHelper.setExtensionProperty(element, modeling, bpmnFactory, {
            businessRef: '&F4A$BUSINESS_REF.',
          });
        }
      }
    );
    
    entries.push(
      {
        id: 'subject',
        element,
        label: translate('Subject'),
        description: translate('Overwrite default value set in task definition'),
        helper: extensionHelper,
        property: 'subject',
        component: DefaultTextFieldEntry,
        isEdited: isTextFieldEntryEdited,
      },
      {
        id: 'businessRef',
        element,
        label: translate('Business Reference'),
        description: businessRefDescription,
        helper: extensionHelper,
        property: 'businessRef',
        component: DefaultTextFieldEntry,
        isEdited: isTextFieldEntryEdited,
      },
      {
        element,
        component: ParametersQuickpick
      },
      {
        id: 'parameters',
        element,
        label: 'Parameters',
        component: ListGroup,
        ...ParametersList(
          {
            element,
            injector,
            helper: listExtensionHelper,
          }
        ),
      },
      {
        id: 'resultVariable',
        element,
        label: translate('Result Variable'),
        description: translate('Name of the variable to return the approval result into'),
        helper: extensionHelper,
        property: 'resultVariable',
        component: DefaultTextFieldEntry,
        isEdited: isTextFieldEntryEdited,
      },
      {
        id: 'initiator',
        element,
        label: translate('Initiator'),
        description: translate('Initiator of this approval task'),
        helper: extensionHelper,
        property: 'initiator',
        component: DefaultTextFieldEntry,
        isEdited: isTextFieldEntryEdited,
      },
    );
  }
  return entries;
}

function ParametersQuickpick(props) {
  const { element } = props;

  const translate = useService('translate');
  const bpmnFactory = useService('bpmnFactory');
  const modeling = useService('modeling');

  const applicationId = extensionHelper.getExtensionProperty(element, 'applicationId');
  const taskStaticId = extensionHelper.getExtensionProperty(element, 'taskStaticId');
  
  return Quickpick(
    {
      text: translate('Load Parameters'),
      handler: () => {
        getJSONParameters(applicationId, taskStaticId).then((data) => {
          data.forEach((i) => {
            listExtensionHelper.addSubElement({
              element,
              modeling,
              bpmnFactory,
              newProps: {
                parStaticId: i.STATIC_ID,
                parDataType: i.DATA_TYPE,
                parValue: i.VALUE,
              }
            });
          });
        });
      }
    }
  );
}