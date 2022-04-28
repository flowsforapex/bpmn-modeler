export function getApplications() {
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

export function getPages(applicationId) {
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

export function getItems(applicationId, pageId) {
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

export function getApplicationsMail() {
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

export function getTemplates(applicationId) {
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

export function getDiagrams() {
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

export function getUsernames() {
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

export function getTasks(applicationId) {
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
