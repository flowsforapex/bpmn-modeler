import { is } from 'bpmn-js/lib/features/modeling/util/ModelingUtil';
import ExtensionHelper from '../../apexPropertiesProvider/new_provider/helper/ExtensionHelper';
import { getBusinessObject } from '../../apexPropertiesProvider/new_provider/helper/util';

export default function XMLModule(
  bpmnFactory,
  modeling,
  elementRegistry
) {

  this.addCustomNamespace = function (xml) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, 'text/xml');
  
    // change apex namespace
    var [definitions] = xmlDoc.getElementsByTagName('bpmn:definitions');
  
    if (definitions) definitions.setAttribute('xmlns:apex', 'https://flowsforapex.org');
  
    return new XMLSerializer().serializeToString(xmlDoc);
  };

  this.addToSVGStyle = function (svg, style) {
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

  this.refactorElements = function () {
    elementRegistry.getAll().forEach((element) => {
      // if apexApproval
      if (is(element, 'bpmn:UserTask') && getBusinessObject(element).type === 'apexApproval') {
        // helper
        const priorityHelper = new ExtensionHelper('apex:Priority');
        const approvalHelper = new ExtensionHelper('apex:ApexApproval');

        // get old priority value
        const priority = approvalHelper.getExtensionProperty(element, 'priority');

        if (priority) {
          // clear old value
          approvalHelper.setExtensionProperty(element, modeling, bpmnFactory, {'priority': null});
          // copy old priority value if no new value specified
          if (!priorityHelper.getExtensionProperty(element, 'expression')) {
            priorityHelper.setExtensionProperty(element, modeling, bpmnFactory, {'expressionType': 'plsqlRawExpression', 'expression': priority});
          }
        }
      }
    });
  };
}

XMLModule.$inject = [
  'bpmnFactory',
  'modeling',
  'elementRegistry'
];
