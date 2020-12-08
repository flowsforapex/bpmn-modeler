export function printXml() {
  const myProm = myModeler._moddle.toXML(myModeler.getDefinitions(), { format: true }, function (err, updatedXML) {
    console.log(updatedXML)
  });
  myProm.then((x) => console.log(x.xml));
}
