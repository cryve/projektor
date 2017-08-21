Package.describe({
  name: 'projektor:users',
  summary: 'Projektor users',
  version: '0.0.1',
});

Package.onUse(function(api) {
  api.versionsFrom(['METEOR@1.4.4.2']);

  const packages = [
    'projektor:lib@0.0.1',
    'projektor:files@0.0.1',
  ];

  api.use(packages);

  api.mainModule('lib/main.js', ['client', 'server']);

  api.addFiles([
    'lib/client/hooks.js',
    'lib/client/templates/avatar.html',
    'lib/client/templates/avatar.js',
  ], 'client');
});

Package.onTest(function(api) {
  api.use('projektor:users');

  api.use(['ecmascript', 'random', 'practicalmeteor:mocha']);

  api.mainModule('lib/methods.tests.js');
});
