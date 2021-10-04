import Prism from 'prismjs';

Prism.manual = true;

export function highlightInit() {
  var input = document.querySelector('#camunda-plsqlCode');
  var highlighting = document.querySelector('#highlighting-content');
  if (input && highlighting) {
    highlighting.innerHTML = input.innerHTML.replace(
      new RegExp('<br>', 'g'),
      '\n'
    );
    Prism.highlightElement(highlighting);
  }
}

export function highlightSyntax(object) {
  var highlighting = document.querySelector('#highlighting-content');
  highlighting.innerHTML = object.innerHTML
    .replace(new RegExp('<div><br></div>', 'g'), '\n')
    .replace(new RegExp('<div>', 'g'), '\n')
    .replace(new RegExp('<br>', 'g'), '\n');
  Prism.highlightElement(highlighting);
  syncScroll(object);
}

export function syncScroll(object) {
  const highlighting = document.querySelector('#highlighting');
  highlighting.scrollTop = object.scrollTop;
  highlighting.scrollLeft = object.scrollLeft;
}
