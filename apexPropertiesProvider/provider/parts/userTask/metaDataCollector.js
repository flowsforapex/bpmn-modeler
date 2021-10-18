export function getApplications() {
  // return [
  //   { name: 1, value: 1 },
  //   { name: 2, value: 2 },
  //   { name: 3, value: 3 },
  // ];
  // ajax process
  return apex.server.process(
    'GET_APPLICATIONS',
    {},
    {
      dataType: 'text',
      success: function (data) {
        console.log('applications');
        return data;
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log('error');
      },
    }
  );
}

export function getPages(applicationId) {
  // return [
  //   { name: 1, value: 1 },
  //   { name: 2, value: 2 },
  //   { name: 3, value: 3 },
  // ];
  // ajax process
  return apex.server.process(
    'GET_PAGES',
    { x01: applicationId },
    {
      dataType: 'text',
      success: function (data) {
        console.log('pages');
        return data;
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log('error');
      },
    }
  );
}

export function getItems(applicationId, pageId) {
  // return [
  //   { name: 1, value: 1 },
  //   { name: 2, value: 2 },
  //   { name: 3, value: 3 },
  //   { name: 4, value: 4 },
  //   { name: 5, value: 5 },
  //   { name: 6, value: 6 },
  // ];
  // ajax process
  return apex.server.process(
    'GET_ITEMS',
    {
      x01: applicationId,
      x02: pageId,
    },
    {
      dataType: 'text',
      success: function (data) {
        console.log('items');
        return data;
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log('error');
      },
    }
  );
}
