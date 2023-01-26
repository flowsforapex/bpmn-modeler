export default function xmlModule() {}

xmlModule.prototype.addCustomNamespace = function (xml) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xml, 'text/xml');

  // change apex namespace
  var [definitions] = xmlDoc.getElementsByTagName('bpmn:definitions');

  if (definitions) definitions.setAttribute('xmlns:apex', 'https://flowsforapex.org');

  return new XMLSerializer().serializeToString(xmlDoc);
};

xmlModule.prototype.addToSVGStyle = function (svg, style) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(svg, 'text/xml');

  var [defs] = xmlDoc.getElementsByTagName('defs');
  var root;
  var styleNode;
  var content;

  if (!defs) {
    [root] = xmlDoc.getElementsByTagName('svg');
    defs = document.createElement('defs');
    root.appendChild(defs);
  }

  styleNode = document.createElement('style');
  styleNode.setAttribute('type', 'text/css');
  content = document.createTextNode(style);
  styleNode.appendChild(content);
  defs.appendChild(styleNode);

  return new XMLSerializer().serializeToString(xmlDoc);
};
