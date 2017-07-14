Package.describe({
  name: 'projektor:users',
  summary: 'Projektor users',
  version: '0.0.1',
});

Package.onUse(function(api) {
  api.versionsFrom(['METEOR@1.4.4.2']);

  const packages = [
    'projektor:core@0.0.1',
  ];

  api.use(packages);

  api.mainModule('lib/main.js', ['client', 'server']);
});

Package.onTest(function(api) {
  api.use('projektor:users');

  api.use(['ecmascript', 'random', 'practicalmeteor:mocha']);

  api.mainModule('lib/methods.tests.js');
});
