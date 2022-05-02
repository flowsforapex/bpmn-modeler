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
  return Promise.resolve();
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
  return Promise.resolve();
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
  return Promise.resolve();
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
