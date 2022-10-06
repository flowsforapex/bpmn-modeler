var allSources = require.context('../apexPropertiesProvider', true, /.*\.js$/);

allSources.keys().forEach(allSources);
