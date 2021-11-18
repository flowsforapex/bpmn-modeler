export function getWorkspaces() {
  // ajax process
  return apex.server.process(
    'GET_WORKSPACES',
    {},
    {
      dataType: 'text',
      success: function (data) {
        return data;
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log(errorThrown);
      },
    }
  );
}

export function getApplications(workspaceId) {
  // ajax process
  return apex.server.process(
    'GET_APPLICATIONS',
    { x01: workspaceId },
    {
      dataType: 'text',
      success: function (data) {
        return data;
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log(errorThrown);
      },
    }
  );
}

export function getApplicationsMail(workspaceId) {
  // ajax process
  return apex.server.process(
    'GET_APPLICATIONS_MAIL',
    { x01: workspaceId },
    {
      dataType: 'text',
      success: function (data) {
        return data;
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log(errorThrown);
      },
    }
  );
}

export function getPages(workspaceId, applicationId) {
  // ajax process
  return apex.server.process(
    'GET_PAGES',
    { x01: workspaceId, x02: applicationId },
    {
      dataType: 'text',
      success: function (data) {
        return data;
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log(errorThrown);
      },
    }
  );
}

export function getItems(workspaceId, applicationId, pageId) {
  // ajax process
  return apex.server.process(
    'GET_ITEMS',
    {
      x01: workspaceId,
      x02: applicationId,
      x03: pageId,
    },
    {
      dataType: 'text',
      success: function (data) {
        return data;
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log(errorThrown);
      },
    }
  );
}

export function getTemplates(workspaceId, applicationId) {
  // ajax process
  return apex.server.process(
    'GET_TEMPLATES',
    { x01: workspaceId, x02: applicationId },
    {
      dataType: 'text',
      success: function (data) {
        return data;
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log(errorThrown);
      },
    }
  );
}
