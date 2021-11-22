export default function xmlModule() {}

if (typeof Node.prototype.appendChildren === 'undefined') {
  Node.prototype.appendChildren = function (children) {
    const documentFragment = document.createDocumentFragment();
    children.forEach(c => documentFragment.appendChild(c));
    this.appendChild(documentFragment);
  };
}

xmlModule.prototype.refactorDiagram = function (xml) {
  var parser = new DOMParser();
  var xmlDoc = parser.parseFromString(xml, 'text/xml');

  var userTasks = xmlDoc.getElementsByTagName('bpmn:userTask');
  var scriptTasks = xmlDoc.getElementsByTagName('bpmn:scriptTask');
  var serviceTasks = xmlDoc.getElementsByTagName('bpmn:serviceTask');

  var apexPage;
  var executePlsql;

  var extensionElements;

  // refactor user tasks
  for (const item of userTasks) {
    const userTaskTags = [];
    item.childNodes.forEach((c) => {
      if (
        [
          'apex:apex-application',
          'apex:apex-page',
          'apex:apex-request',
          'apex:apex-cache',
          'apex:apex-item',
          'apex:apex-value',
        ].includes(c.tagName)
      ) {
        userTaskTags.push(c);
      }
    });
    if (userTaskTags.length > 0) {
      // add type attribute
      item.setAttributeNS('http://www.apex.mt-ag.com', 'apex:type', 'apexPage');

      // create new apexPage tag
      apexPage = document.createElementNS(
        'http://www.apex.mt-ag.com',
        'apex:ApexPage'
      );

      // eslint-disable-next-line no-loop-func
      userTaskTags.forEach((e) => {
        var newNode;
        switch (e.tagName) {
          case 'apex:apex-application':
            newNode = document.createElementNS(
              'http://www.apex.mt-ag.com',
              'apex:application'
            );
            newNode.innerHTML = e.innerHTML;
            break;
          case 'apex:apex-page':
            newNode = document.createElementNS(
              'http://www.apex.mt-ag.com',
              'apex:page'
            );
            newNode.innerHTML = e.innerHTML;
            break;
          case 'apex:apex-request':
            newNode = document.createElementNS(
              'http://www.apex.mt-ag.com',
              'apex:request'
            );
            newNode.innerHTML = e.innerHTML;
            break;
          case 'apex:apex-cache':
            newNode = document.createElementNS(
              'http://www.apex.mt-ag.com',
              'apex:cache'
            );
            newNode.innerHTML = e.innerHTML;
            break;
          case 'apex:apex-item':
            var itemNode;
            newNode = document.createElementNS(
              'http://www.apex.mt-ag.com',
              'apex:PageItems'
            );
            var itemValues = userTaskTags.find(
              e => e.tagName === 'apex:apex-value'
            );
            for (let i = 0; i < e.textContent.split(',').length; i++) {
              itemNode = document.createElementNS(
                'http://www.apex.mt-ag.com',
                'apex:PageItem'
              );
              var itemNameNode = document.createElementNS(
                'http://www.apex.mt-ag.com',
                'apex:itemName'
              );
              itemNameNode.innerHTML = e.textContent.split(',')[i];
              var itemValueNode = document.createElementNS(
                'http://www.apex.mt-ag.com',
                'apex:itemValue'
              );
              itemValueNode.innerHTML = itemValues.textContent.split(',')[i];
              itemNode.appendChild(itemNameNode);
              itemNode.appendChild(itemValueNode);
              newNode.appendChild(itemNode);
            }
            break;
          default:
        }
        item.removeChild(e);
        if (newNode) apexPage.appendChild(newNode);
      });

      // get existing / create new extensionElements tag
      extensionElements =
        item.getElementsByTagName('bpmn:extensionElements')[0] ||
        document.createElementNS(
          'http://www.omg.org/spec/BPMN/20100524/MODEL',
          'bpmn:extensionElements'
        );
      // append child
      extensionElements.appendChild(apexPage);
      item.prepend(extensionElements);
    }
  }

  // refactor script tasks
  for (const item of scriptTasks) {
    const scriptTaskTags = [];
    item.childNodes.forEach((c) => {
      if (
        ['apex:engine', 'apex:plsqlCode', 'apex:autoBinds'].includes(c.tagName)
      ) {
        scriptTaskTags.push(c);
      }
    });
    if (scriptTaskTags.length > 0) {
      // add type attribute
      item.setAttributeNS(
        'http://www.apex.mt-ag.com',
        'apex:type',
        'executePlsql'
      );

      // create new executePlsql tag
      executePlsql = document.createElementNS(
        'http://www.apex.mt-ag.com',
        'apex:ExecutePlsql'
      );

      executePlsql.appendChildren(scriptTaskTags);

      // get existing / create new extensionElements tag
      extensionElements =
        item.getElementsByTagName('bpmn:extensionElements')[0] ||
        document.createElementNS(
          'http://www.omg.org/spec/BPMN/20100524/MODEL',
          'bpmn:extensionElements'
        );
      // append child
      extensionElements.appendChild(executePlsql);
      item.prepend(extensionElements);
    }
  }

  // refactor service tasks
  for (const item of serviceTasks) {
    const serviceTaskTags = [];
    item.childNodes.forEach((c) => {
      if (
        ['apex:engine', 'apex:plsqlCode', 'apex:autoBinds'].includes(c.tagName)
      ) {
        serviceTaskTags.push(c);
      }
    });
    if (serviceTaskTags.length > 0) {
      // add type attribute
      item.setAttributeNS(
        'http://www.apex.mt-ag.com',
        'apex:type',
        'executePlsql'
      );

      // create new apexPage tag
      executePlsql = document.createElementNS(
        'http://www.apex.mt-ag.com',
        'apex:ExecutePlsql'
      );

      executePlsql.appendChildren(serviceTaskTags);

      // get existing / create new extensionElements tag
      extensionElements =
        item.getElementsByTagName('bpmn:extensionElements')[0] ||
        document.createElementNS(
          'http://www.omg.org/spec/BPMN/20100524/MODEL',
          'bpmn:extensionElements'
        );
      // append child
      extensionElements.appendChild(executePlsql);
      item.prepend(extensionElements);
    }
  }

  return new XMLSerializer().serializeToString(xmlDoc);
};
