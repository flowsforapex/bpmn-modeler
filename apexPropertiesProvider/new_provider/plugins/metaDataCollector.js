export function getApplications() {
  if (typeof apex !== 'undefined') {
    apex.debug.info('getApplications');
    // ajaxIdentifier
    var { ajaxIdentifier } = apex.jQuery('#modeler').modeler('option');
    // ajax process
    return apex.server
      .plugin(
        ajaxIdentifier,
        {
          x01: 'GET_APPLICATIONS',
        },
        {}
      )
      .then(pData => pData);
  } 
  console.log('getApplications');
  return Promise.resolve([
    { label: '', value: null },
    { label: '1 - A1', value: '1' },
    { label: '2 - A2', value: '2' },
  ]); 
}

export function getPages(applicationId) {
  if (typeof apex !== 'undefined') {
    apex.debug.info('getPages');
    // ajaxIdentifier
    var { ajaxIdentifier } = apex.jQuery('#modeler').modeler('option');
    // ajax process
    return apex.server
      .plugin(
        ajaxIdentifier,
        {
          x01: 'GET_PAGES',
          x02: applicationId,
        },
        {}
      )
      .then(pData => pData);
  }
  console.log('getPages');
  if (applicationId === '1') {
    return Promise.resolve([
      { label: '', value: null },
      { label: '1 - A1P1', value: '1' },
      { label: '2 - A1P2', value: '2' },
    ]);
  } else if (applicationId === '2') {
    return Promise.resolve([
      { label: '', value: null },
      { label: '1 - A2P1', value: '1' },
      { label: '2 - A2P2', value: '2' },
      { label: '3 - A2P3', value: '3' },
    ]);
  }
  return Promise.resolve([]);
}

export function getItems(applicationId, pageId) {
  if (typeof apex !== 'undefined') {
    apex.debug.info('getItems');
    // ajaxIdentifier
    var { ajaxIdentifier } = apex.jQuery('#modeler').modeler('option');
    // ajax process
    return apex.server
      .plugin(
        ajaxIdentifier,
        {
          x01: 'GET_ITEMS',
          x02: applicationId,
          x03: pageId,
        },
        {}
      )
      .then(pData => pData);
  }
  console.log('getItems');
  if (applicationId === '1' && pageId === '1') {
    return Promise.resolve([
      { label: '', value: null },
      { label: 'A1P1I1', value: 'A1P1I1' },
      { label: 'A1P1I2', value: 'A1P1I2' },
    ]);
  }
  return Promise.resolve([]);
}

export function getApplicationsMail() {
  if (typeof apex !== 'undefined') {
    aüex.debug.info('getApplicationsMail');
    // ajaxIdentifier
    var { ajaxIdentifier } = apex.jQuery('#modeler').modeler('option');
    // ajax process
    return apex.server
      .plugin(
        ajaxIdentifier,
        {
          x01: 'GET_APPLICATIONS_MAIL',
        },
        {}
      )
      .then(pData => pData);
  }
  console.log('getApplicationsMail');
  return Promise.resolve([
    { label: '', value: null },
    { label: '1 - A1', value: '1' },
    { label: '2 - A2', value: '2' },
  ]); 
}

export function getTemplates(applicationId) {
  if (typeof apex !== 'undefined') {
    apex.debug.info('getTemplates');
    // ajaxIdentifier
    var { ajaxIdentifier } = apex.jQuery('#modeler').modeler('option');
    // ajax process
    return apex.server
      .plugin(
        ajaxIdentifier,
        {
          x01: 'GET_TEMPLATES',
          x02: applicationId,
        },
        {}
      )
      .then(pData => pData);
  }
  console.log('getTemplates');
  if (applicationId === '1') {
    return Promise.resolve([
      { label: '', value: null },
      { label: 'A1T1', value: 'A1T1' },
      { label: 'A1T2', value: 'A1T2' },
    ]);
  } else if (applicationId === '2') {
    return Promise.resolve([
      { label: '', value: null },
      { label: 'A2T1', value: 'A2T1' },
      { label: 'A2T2', value: 'A2T2' },
      { label: 'A2T3', value: 'A2T3' },
    ]);
  }
  return Promise.resolve([]);
}

export function getDiagrams() {
  if (typeof apex !== 'undefined') {
    apex.debug.info.log('getDiagrams');
    // ajaxIdentifier
    var { ajaxIdentifier } = apex.jQuery('#modeler').modeler('option');
    // ajax process
    return apex.server
      .plugin(
        ajaxIdentifier,
        {
          x01: 'GET_DIAGRAMS',
        },
        {}
      )
      .then(pData => pData);
  }
  console.log('getDiagrams');
  return Promise.resolve([
    { label: '', value: null },
    { label: 'Diagram1', value: 'Diagram1' },
    { label: 'Diagram2', value: 'Diagram2' },
  ]);
}

export function getUsernames() {
  if (typeof apex !== 'undefined') {
    apex.debug.info('getUsernames');
    // ajaxIdentifier
    var { ajaxIdentifier } = apex.jQuery('#modeler').modeler('option');
    // ajax process
    return apex.server
      .plugin(
        ajaxIdentifier,
        {
          x01: 'GET_USERNAMES',
        },
        {}
      )
      .then(pData => pData);
  }
  console.log('getUsernames');
  return Promise.resolve([
    { label: '', value: null },
    { label: 'user1', value: 'user1' },
    { label: 'user2', value: 'user2' },
    { label: 'user3', value: 'user3' }
  ]);
}

export function getTasks(applicationId) {
  if (typeof apex !== 'undefined') {
    apex.debug.info('getTasks');
    // ajaxIdentifier
    var { ajaxIdentifier } = apex.jQuery('#modeler').modeler('option');
    // ajax process
    return apex.server
      .plugin(
        ajaxIdentifier,
        {
          x01: 'GET_TASKS',
          x02: applicationId,
        },
        {}
      )
      .then(pData => pData);
  }
  console.log('getTasks');
  if (applicationId === '1') {
    return Promise.resolve([
      { label: '', value: null },
      { label: 'A1T1', value: 'A1T1' },
      { label: 'A1T2', value: 'A1T2' },
    ]);
  } else if (applicationId === '2') {
    return Promise.resolve([
      { label: '', value: null },
      { label: 'A2T1', value: 'A2T1' },
      { label: 'A2T2', value: 'A2T2' },
      { label: 'A2T3', value: 'A2T3' },
    ]);
  }
  return Promise.resolve([]);
}

export function getDefinedVariables(calledDiagram, calledDiagramVersionSelection, calledDiagramVersion) {
  if (typeof apex !== 'undefined') {
    apex.debug.info('getDefinedVariables');
    // ajaxIdentifier
    var { ajaxIdentifier } = apex.jQuery('#modeler').modeler('option');
    // ajax process
    return apex.server
      .plugin(
        ajaxIdentifier,
        {
          x01: 'GET_VARIABLE_MAPPING',
          x02: calledDiagram,
          x03: calledDiagramVersionSelection,
          x04: calledDiagramVersion,
        },
        {}
      )
      .then(pData => pData);
  }
  console.log('getDefinedVariables');
  return Promise.resolve(
    {
      InVariables: [
        {
          varName: 'In1',
          varDataType: 'VARCHAR2',
          varDescription: 'Desc1'
        },
        {
          varName: 'In2',
          varDataType: 'NUMBER',
          varDescription: 'Desc2'
        },
      ],
      OutVariables: [
        {
          varName: 'Out1',
          varDataType: 'DATE',
          varDescription: 'Desc3'
        },
        {
          varName: 'Out2',
          varDataType: 'TIMESTAMP',
          varDescription: 'Desc4'
        },
      ]
    }
  );
}

export function getJSONParameters(applicationId, taskStaticId) {
  if (typeof apex !== 'undefined') {
    apex.debug.info('getJSONParameters');
    // ajaxIdentifier
    var { ajaxIdentifier } = apex.jQuery('#modeler').modeler('option');
    // ajax process
    return apex.server
      .plugin(
        ajaxIdentifier,
        {
          x01: 'GET_JSON_PARAMETERS',
          x02: applicationId,
          x03: taskStaticId,
        },
        {}
      )
      .then(pData => pData);
  }
  console.log('getJSONParameters');
  if (applicationId === '1' && taskStaticId === '1') {
    return Promise.resolve(
      [
        {
          STATIC_ID: 'par1',
          DATA_TYPE: 'String',
          VALUE: '1'
        },
        {
          STATIC_ID: 'par2',
          DATA_TYPE: 'String',
          VALUE: '2'
        }
      ]
    );
  }
  return Promise.resolve([]);
}