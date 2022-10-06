const requireModule = require.context('.', false, /\.json$/);
const languages = {};

requireModule.keys().forEach((filename) => {
  const language = filename.replace(/(\.\/|\.json)/g, '');
  languages[language] = requireModule(filename);
});

export default languages;
