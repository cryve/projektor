Package.describe({
  name: 'projektor:hello-world',
  version: '0.0.1',
  summary: 'New page with "Hello World!"',
});

Package.onUse(function(api) {
  api.versionsFrom('1.5.1');
  api.use('projektor:core@0.0.1');
  api.mainModule('hello_world.js');
});
