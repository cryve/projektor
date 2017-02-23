Package.describe({
  name: 'yogiben:autoform-tags',
  summary: 'Tags input for aldeed:autoform',
  version: '0.2.0',
  git: 'https://github.com/yogiben/meteor-autoform-tags'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0.1');

  api.use([
    'templating',
    'coffeescript',
    'reactive-var',
    'aldeed:autoform@6.0.0',
    'ajduke:bootstrap-tagsinput@0.7.0'
  ], 'client');

  api.addFiles([
    'lib/client/autoform-tags.html',
    'lib/client/autoform-tags.css',
    'lib/client/autoform-tags.coffee'
  ], 'client');
});
