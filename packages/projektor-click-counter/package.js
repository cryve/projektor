Package.describe({
  name: 'projektor:click-counter',
  version: '0.0.1',
  summary: 'Button with click counter on project page',
});

Package.onUse(function(api) {
  api.versionsFrom('1.5.1');
  api.use('projektor:core@0.0.1');
  api.use('projektor:projects@0.0.1');
  api.mainModule('lib/client/click_counter.js', 'client');
  api.mainModule('lib/common.js');
});

Package.onTest(function(api) {
  api.use('projektor:click-counter');

  api.use([
    'ecmascript',
    'random',
    'practicalmeteor:mocha',
    'mdg:validation-error',
    'hwillson:stub-collections',
  ]);
  api.mainModule('lib/methods.tests.js');
});
