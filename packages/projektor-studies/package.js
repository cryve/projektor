Package.describe({
  name: 'projektor:studies',
  summary: 'Resolve ids for study courses, faculties and departments to names',
  version: '0.0.1',
});

Package.onUse(function(api) {
  api.versionsFrom(['METEOR@1.4.4.2']);

  const packages = [
    'projektor:lib@0.0.1',
  ];

  api.use(packages);

  api.addAssets([
    'assets/studycourse_lookup.xlsx',
  ], 'server');

  api.mainModule('lib/client.js', 'client');
  api.mainModule('lib/server.js', 'server');
});
