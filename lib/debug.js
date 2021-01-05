export function printXml() {
  const myProm = myModeler._moddle.toXML(myModeler.getDefinitions(), { format: true }, function (err, updatedXML) {
    window.console.log(updatedXML);
  });
  myProm.then(res => window.console.log(res.xml));
}
