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
  var apexScript;

  var extensionElements;

  for (const item of userTasks) {
    const apexPageTags = [];
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
        apexPageTags.push(c);
      }
    });
    if (apexPageTags.length > 0) {
      // create new apexPage tag
      apexPage = document.createElementNS(
        'http://www.apex.mt-ag.com',
        'apex:ApexPage'
      );

      apexPage.appendChildren(apexPageTags);

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

  for (const item of scriptTasks) {
    const apexScriptTags = [];
    item.childNodes.forEach((c) => {
      if (
        ['apex:engine', 'apex:plsqlCode', 'apex:autoBinds'].includes(c.tagName)
      ) {
        apexScriptTags.push(c);
      }
    });
    if (apexScriptTags.length > 0) {
      // create new apexPage tag
      apexScript = document.createElementNS(
        'http://www.apex.mt-ag.com',
        'apex:ApexScript'
      );

      apexScript.appendChildren(apexScriptTags);

      // get existing / create new extensionElements tag
      extensionElements =
        item.getElementsByTagName('bpmn:extensionElements')[0] ||
        document.createElementNS(
          'http://www.omg.org/spec/BPMN/20100524/MODEL',
          'bpmn:extensionElements'
        );
      // append child
      extensionElements.appendChild(apexScript);
      item.prepend(extensionElements);
    }
  }

  for (const item of serviceTasks) {
    const apexScriptTags = [];
    item.childNodes.forEach((c) => {
      if (
        ['apex:engine', 'apex:plsqlCode', 'apex:autoBinds'].includes(c.tagName)
      ) {
        apexScriptTags.push(c);
      }
    });
    if (apexScriptTags.length > 0) {
      // create new apexPage tag
      apexScript = document.createElementNS(
        'http://www.apex.mt-ag.com',
        'apex:ApexScript'
      );

      apexScript.appendChildren(apexScriptTags);

      // get existing / create new extensionElements tag
      extensionElements =
        item.getElementsByTagName('bpmn:extensionElements')[0] ||
        document.createElementNS(
          'http://www.omg.org/spec/BPMN/20100524/MODEL',
          'bpmn:extensionElements'
        );
      // append child
      extensionElements.appendChild(apexScript);
      item.prepend(extensionElements);
    }
  }

  return new XMLSerializer().serializeToString(xmlDoc);
};
