Package.describe({
  name: 'projektor:core',
  summary: 'Projektor core libraries',
  version: '0.0.1',
});

Package.onUse(function(api) {
  api.versionsFrom(['METEOR@1.4.4.2']);

  const packages = [
    'projektor:lib@0.0.1',
  ];

  api.use(packages);

  api.imply(packages);

  api.mainModule('lib/layout.js', 'client');
});
