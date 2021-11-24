export function getApplications() {
  // ajax process
  return apex.server.process(
    'GET_APPLICATIONS',
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

export function getApplicationsMail() {
  // ajax process
  return apex.server.process(
    'GET_APPLICATIONS_MAIL',
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

export function getPages(applicationId) {
  // ajax process
  return apex.server.process(
    'GET_PAGES',
    { x01: parseInt(applicationId, 10) || null },
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

export function getItems(applicationId, pageId) {
  // ajax process
  return apex.server.process(
    'GET_ITEMS',
    {
      x01: parseInt(applicationId, 10) || null,
      x02: parseInt(pageId, 10) || null,
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

export function getTemplates(applicationId) {
  // ajax process
  return apex.server.process(
    'GET_TEMPLATES',
    { x01: parseInt(applicationId, 10) || null },
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
