Package.describe({
  name: 'projektor:files',
  summary: 'Projektor files collection and methods',
  version: '0.0.1',
});

Package.onUse(function(api) {
  api.versionsFrom(['METEOR@1.4.4.2']);

  const packages = [
    'projektor:lib@0.0.1',
  ];

  api.use(packages);

  api.mainModule('lib/files.js', ['client', 'server']);
});
