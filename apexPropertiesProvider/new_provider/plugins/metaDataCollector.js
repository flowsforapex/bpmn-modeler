export function getApplications() {
  if (typeof apex !== 'undefined') {
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
  return Promise.resolve([
    { label: '', value: null },
    { label: 'App1', value: '1' },
    { label: 'App2', value: '2' },
  ]);
}

export function getPages(applicationId) {
  if (typeof apex !== 'undefined') {
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
  if (applicationId === '1') {
    return Promise.resolve([
      { label: '', value: null },
      { label: 'A1P1', value: '1' },
      { label: 'P1P2', value: '2' },
    ]);
  } else if (applicationId === '2') {
    return Promise.resolve([
      { label: '', value: null },
      { label: 'A2P1', value: '1' },
      { label: 'A2P2', value: '2' },
      { label: 'A2P3', value: '3' },
    ]);
  }
  return Promise.resolve();
}

export function getItems(applicationId, pageId) {
  if (typeof apex !== 'undefined') {
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
  if (applicationId === '1' && pageId === '1') {
    return Promise.resolve([
      { label: '', value: null },
      { label: 'A1P1I1', value: '1' },
      { label: 'A1P1I2', value: '2' },
    ]);
  }
  return Promise.resolve([]);
}

export function getApplicationsMail() {
  if (typeof apex !== 'undefined') {
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
  return Promise.resolve();
}

export function getTemplates(applicationId) {
  if (typeof apex !== 'undefined') {
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
  return Promise.resolve();
}

export function getDiagrams() {
  if (typeof apex !== 'undefined') {
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
  return Promise.resolve([
    { label: '', value: null },
    { label: 'Diagram1', value: '1' },
    { label: 'Diagram2', value: '2' },
  ]);
}

export function getUsernames() {
  if (typeof apex !== 'undefined') {
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
  return Promise.resolve();
}

export function getTasks(applicationId) {
  if (typeof apex !== 'undefined') {
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
  return Promise.resolve();
}
