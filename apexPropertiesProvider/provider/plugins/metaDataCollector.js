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

export function getApplications(workspace) {
  // ajax process
  return apex.server.process(
    'GET_APPLICATIONS',
    { x01: workspace },
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

export function getApplicationsMail(workspace) {
  // ajax process
  return apex.server.process(
    'GET_APPLICATIONS_MAIL',
    { x01: workspace },
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

export function getPages(workspace, application) {
  // ajax process
  return apex.server.process(
    'GET_PAGES',
    { x01: workspace, x02: application },
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

export function getItems(workspace, application, page) {
  // ajax process
  return apex.server.process(
    'GET_ITEMS',
    {
      x01: workspace,
      x02: application,
      x03: page,
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

export function getTemplates(workspace, application) {
  // ajax process
  return apex.server.process(
    'GET_TEMPLATES',
    { x01: workspace, x02: application },
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
