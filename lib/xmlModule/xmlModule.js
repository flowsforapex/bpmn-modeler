export default function xmlModule() {}

if (typeof Node.prototype.appendChildrenWithNS === 'undefined') {
  Node.prototype.appendChildrenWithNS = function (children, ns) {
    const documentFragment = document.createDocumentFragment();
    children.forEach((c) => {
      var element = document.createElementNS(ns, c.tagName);
      element.innerHTML = c.innerHTML;
      documentFragment.appendChild(element);
    });
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

  var itemNames = [];
  var itemValues = [];

  var itemContainerNode;
  var validItems;

  var itemNode;
  var itemNameNode;
  var itemValueNode;

  var executePlsql;

  var extensionElements;

  // change apex namespace
  var definitions = xmlDoc.getElementsByTagName('bpmn:definitions');
  for (const item of definitions) {
    item.setAttribute('xmlns:apex', 'https://flowsforapex.org');
  }

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
      item.setAttributeNS('https://flowsforapex.org', 'apex:type', 'apexPage');

      // create new apexPage tag
      apexPage = document.createElementNS(
        'https://flowsforapex.org',
        'apex:ApexPage'
      );

      // eslint-disable-next-line no-loop-func
      userTaskTags.forEach((e) => {
        var newNode;
        switch (e.tagName) {
          case 'apex:apex-application':
            newNode = document.createElementNS(
              'https://flowsforapex.org',
              'apex:applicationId'
            );
            newNode.innerHTML = e.innerHTML;
            break;
          case 'apex:apex-page':
            newNode = document.createElementNS(
              'https://flowsforapex.org',
              'apex:pageId'
            );
            newNode.innerHTML = e.innerHTML;
            break;
          case 'apex:apex-request':
            newNode = document.createElementNS(
              'https://flowsforapex.org',
              'apex:request'
            );
            newNode.innerHTML = e.innerHTML;
            break;
          case 'apex:apex-cache':
            newNode = document.createElementNS(
              'https://flowsforapex.org',
              'apex:cache'
            );
            newNode.innerHTML = e.innerHTML;
            break;
          case 'apex:apex-item':
            itemNames = e.textContent.split(',');
            break;
          case 'apex:apex-value':
            itemValues = e.textContent.split(',');
            break;
          default:
        }
        item.removeChild(e);
        if (newNode) apexPage.appendChild(newNode);
      });

      // add page items
      if (itemNames.length > 0 || itemValues.length > 0) {
        itemContainerNode = document.createElementNS(
          'https://flowsforapex.org',
          'apex:PageItems'
        );

        validItems = Math.min(itemNames.length, itemValues.length);

        for (let i = 0; i < validItems; i++) {
          itemNode = document.createElementNS(
            'https://flowsforapex.org',
            'apex:PageItem'
          );
          itemNameNode = document.createElementNS(
            'https://flowsforapex.org',
            'apex:itemName'
          );
          itemNameNode.innerHTML = itemNames[i];
          itemValueNode = document.createElementNS(
            'https://flowsforapex.org',
            'apex:itemValue'
          );
          itemValueNode.innerHTML = itemValues[i];
          itemNode.appendChild(itemNameNode);
          itemNode.appendChild(itemValueNode);
          itemContainerNode.appendChild(itemNode);
        }
        // item names without values
        for (let i = validItems; i < itemNames.length; i++) {
          itemNode = document.createElementNS(
            'https://flowsforapex.org',
            'apex:PageItem'
          );
          itemNameNode = document.createElementNS(
            'https://flowsforapex.org',
            'apex:itemName'
          );
          itemNameNode.innerHTML = itemNames[i];
          itemValueNode = document.createElementNS(
            'https://flowsforapex.org',
            'apex:itemValue'
          );
          itemValueNode.innerHTML = '';
          itemNode.appendChild(itemNameNode);
          itemNode.appendChild(itemValueNode);
          itemContainerNode.appendChild(itemNode);
        }
        // item values without names
        for (let i = validItems; i < itemValues.length; i++) {
          itemNode = document.createElementNS(
            'https://flowsforapex.org',
            'apex:PageItem'
          );
          itemNameNode = document.createElementNS(
            'https://flowsforapex.org',
            'apex:itemName'
          );
          itemNameNode.innerHTML = '';
          itemValueNode = document.createElementNS(
            'https://flowsforapex.org',
            'apex:itemValue'
          );
          itemValueNode.innerHTML = itemValues[i];
          itemNode.appendChild(itemNameNode);
          itemNode.appendChild(itemValueNode);
          itemContainerNode.appendChild(itemNode);
        }

        apexPage.appendChild(itemContainerNode);
      }

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
        'https://flowsforapex.org',
        'apex:type',
        'executePlsql'
      );

      // create new executePlsql tag
      executePlsql = document.createElementNS(
        'https://flowsforapex.org',
        'apex:ExecutePlsql'
      );

      executePlsql.appendChildrenWithNS(
        scriptTaskTags,
        'https://flowsforapex.org'
      );

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
        'https://flowsforapex.org',
        'apex:type',
        'executePlsql'
      );

      // create new apexPage tag
      executePlsql = document.createElementNS(
        'https://flowsforapex.org',
        'apex:ExecutePlsql'
      );

      executePlsql.appendChildrenWithNS(
        serviceTaskTags,
        'https://flowsforapex.org'
      );

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
