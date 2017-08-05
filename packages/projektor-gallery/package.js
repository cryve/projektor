Package.describe({
  name: 'projektor:gallery',
  summary: 'Image and video gallery to showcase work-in-progress',
  version: '0.0.1',
});


const packages = [
  'projektor:core@0.0.1',
  'projektor:users@0.0.1',
  'projektor:projects@0.0.1',
  'projektor:files@0.0.1',
  'aldeed:autoform@5.0.0',
];

Package.onUse(function(api) {
  api.versionsFrom(['METEOR@1.4.4.2']);

  api.use(packages);

  api.addFiles('lib/methods.js', ['client', 'server']);
  api.addFiles([
    'lib/gallery.css',
    'lib/gallery.html',
    'lib/gallery.js',
    'lib/image_upload_crop.css',
    'lib/image_upload_crop.html',
    'lib/image_upload_crop.js',
    'lib/ui_modules.js',
  ], 'client');
});

Package.onTest(function(api) {
  api.use(packages);

  api.use(['projektor:gallery', 'ecmascript', 'random', 'practicalmeteor:mocha', 'mdg:validation-error']);

  api.mainModule('tests/ui_modules.tests.js');

});
