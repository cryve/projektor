Package.describe({
  name: 'projektor:projects',
  summary: 'Projektor projects and project drafts',
  version: '0.0.1',
});

Package.onUse(function(api) {
  api.versionsFrom(['METEOR@1.4.4.2']);

  const packages = [
    'projektor:lib@0.0.1',
    'projektor:files@0.0.1',
    'projektor:users@0.0.1',
  ];

  api.use(packages);

  api.addFiles([
    'lib/client/hooks.js',
    'lib/templates/project_card.css',
    'lib/templates/project_card.html',
    'lib/templates/project_card.js',
    'lib/templates/project_edit.css',
    'lib/templates/project_edit.html',
    'lib/templates/project_edit.js',
    'lib/templates/editableProject.css',
    'lib/templates/editableProject.html',
    'lib/templates/editableProject.js',
  ], 'client');

  api.mainModule('lib/main.js', ['client', 'server']);
});

Package.onTest(function(api) {
  api.use('projektor:projects');

  api.use(['projektor:users', 'ecmascript', 'random', 'practicalmeteor:mocha', 'mdg:validation-error']);

  api.mainModule('lib/methods.tests.js');
});
