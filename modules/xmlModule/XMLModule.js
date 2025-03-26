import { is } from 'bpmn-js/lib/features/modeling/util/ModelingUtil';
import ExtensionHelper from '../../apexPropertiesProvider/provider/helper/ExtensionHelper';
import { getBusinessObject } from '../../apexPropertiesProvider/provider/helper/util';

export class XMLModule {
  
  constructor(bpmnFactory, modeling, elementRegistry) {
    this._bpmnFactory = bpmnFactory;
    this._modeling = modeling;
    this._elementRegistry = elementRegistry;
  }

  static addCustomNamespace(xml) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, 'text/xml');

    // change apex namespace
    var [definitions] = xmlDoc.getElementsByTagName('bpmn:definitions');

    if (definitions) definitions.setAttribute('xmlns:apex', 'https://flowsforapex.org');

    return new XMLSerializer().serializeToString(xmlDoc);
  }

  static addStyleToSVG(svg) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(svg, 'text/xml');

    let [defs] = xmlDoc.getElementsByTagName('defs');

    if (!defs) {
      const [root] = xmlDoc.getElementsByTagName('svg');
      defs = document.createElement('defs');
      root.appendChild(defs);
    }

    const styleNode = document.createElement('style');
    styleNode.setAttribute('type', 'text/css');

    const content = document.createTextNode('.djs-group { --default-fill-color: white; --default-stroke-color: black; }');
    styleNode.appendChild(content);

    defs.appendChild(styleNode);

    const xmlText = new XMLSerializer().serializeToString(xmlDoc);

    return xmlText;
  }

  refactorElements() {
    this._elementRegistry.getAll().forEach((element) => {
      // if apexApproval
      if (is(element, 'bpmn:UserTask') && getBusinessObject(element).type === 'apexApproval') {
        // helper
        const priorityHelper = new ExtensionHelper('apex:Priority');
        const approvalHelper = new ExtensionHelper('apex:ApexApproval');

        // get old priority value
        const priority = approvalHelper.getExtensionProperty(element, 'priority');

        if (priority) {
          // clear old value
          approvalHelper.setExtensionProperty(element, this._modeling, this._bpmnFactory, { 'priority': null });
          // copy old priority value if no new value specified
          if (!priorityHelper.getExtensionProperty(element, 'expression')) {
            priorityHelper.setExtensionProperty(element, this._modeling, this._bpmnFactory, { 'expressionType': 'plsqlRawExpression', 'expression': priority });
          }
        }
      }
    });
  }
}

XMLModule.$inject = [
  'bpmnFactory',
  'modeling',
  'elementRegistry'
];
