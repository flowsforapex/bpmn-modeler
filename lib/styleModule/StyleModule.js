export default function StyleModule() {}

StyleModule.prototype.addToSVGStyle = function (svg, style) {
  var parser = new DOMParser();
  var xmlDoc = parser.parseFromString(svg, 'text/xml');

  var defs = xmlDoc.getElementsByTagName('defs')[0];
  if (!defs) {
    var root = xmlDoc.getElementsByTagName('svg')[0];
    defs = document.createElement('defs');
    root.appendChild(defs);
  }
  var styleNode = document.createElement('style');
  styleNode.setAttribute('type', 'text/css');
  var content = document.createTextNode(style);
  styleNode.appendChild(content);
  defs.appendChild(styleNode);

  var xmlText = new XMLSerializer().serializeToString(xmlDoc);

  return xmlText;
};
