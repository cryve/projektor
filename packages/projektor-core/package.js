Package.describe({
  name: 'projektor:core',
  summary: 'Projektor core libraries',
  version: '0.0.1',
});

Package.onUse(function(api) {
  api.versionsFrom(['METEOR@1.4.4.2']);

  const packages = [
    'projektor:lib@0.0.1', // no dependencies
    'projektor:files@0.0.1', // lib
    'projektor:studies@0.0.1', // lib
    'projektor:users@0.0.1', // lib, files
    'projektor:projects@0.0.1', // lib, files, users
  ];

  api.use(packages);

  api.imply(packages);

  api.addFiles([
    'lib/client/ui_modules.html',
    'lib/client/ui_modules.js',
  ], 'client');

  api.mainModule('lib/layout.js', 'client');
});
