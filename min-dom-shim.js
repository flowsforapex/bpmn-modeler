/* 
 * This module is a drop-in replacement for min-dom that still works
 * when the properties panel is rendered inside a Shadow DOM.
 * We avoid modifying node_modules directly by aliasing 'min-dom' to this file via webpack config.
 */

import * as minDom from './node_modules/min-dom/dist/index.js';

const originalQuery = minDom.query;
const originalQueryAll = minDom.queryAll;

function query(selector, el) {
  const result = originalQuery(selector, el);

  // if result or explicit parent provided -> return
  if (result || el) return result;

  // if result is empty and no parent provided -> search again in shadow dom
  const root = document.querySelector('f4a-modeler').shadowRoot;
  return originalQuery(selector, root);
}

function queryAll(selector, el) {
  const result = originalQueryAll(selector, el);

  // if result or explicit parent provided -> return
  if ((result && result.length) || el) return result;

  const nodes = [];

  // if result is empty and no parent provided -> search again in shadow dom
  const root = document.querySelector('f4a-modeler').shadowRoot;
  nodes.push(...originalQueryAll(selector, root));
  return nodes;
}

export * from './node_modules/min-dom/dist/index.js';
export { query, queryAll };

