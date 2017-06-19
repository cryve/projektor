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

  api.mainModule('lib/deps.js', ['client', 'server']);

  // Npm.depends({
  //   'simpl-schema': '0.2.3'
  // });
});
