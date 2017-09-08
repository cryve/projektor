/*
* Partially inspired by Telescope code base: https://github.com/VulcanJS/Vulcan/blob/legacy/packages/telescope-lib/package.js
*/

Package.describe({
  name: 'projektor:lib',
  summary: 'Projektor third party libraries and global namespace.',
  version: '0.0.1',
});

Package.onUse(function(api) {
  api.versionsFrom(['METEOR@1.4.4.2']);

  const packages = [
    // Meteor packages
    'meteor-base', // Packages that every Meteor app needs
    'standard-minifier-css',  // Standard css minifier used with Meteor apps by default.
    'standard-minifier-js', // Standard javascript minifiers used with Meteor apps by default.
    'tracker', //  Dependency tracker to allow reactive callbacks
    'ecmascript', // Compiler plugin that supports ES2015+ in all .js files
    'es5-shim',  // Shims and polyfills to improve ECMAScript 5 support
    'mobile-experience',  // Packages for a great mobile user experience
    'mongo', // Adaptor for using MongoDB and Minimongo over DDP
    'blaze-html-templates', // Compile HTML templates into reactive UI with Meteor Blaze
    'session',  // Session variable
    'jquery',  // Manipulate the DOM using CSS selectors
    'dynamic-import', // Runtime support for Meteor 1.5 dynamic import(...) syntax

    // Third-party packages
    'accounts-password@1.3.6', // Password support for accounts
    'accounts-ui@1.1.9', // Simple templates to add login widgets to an app
    'adrianliaw:youtube-iframe-api@1.3.122',  // Youtube Iframe API
    'ajduke:bootstrap-tagsinput@0.7.1',  // jQuery plugin providing a Twitter Bootstrap user interface for managing tags, repackaged for Meteor
    'aldeed:autoform@6.0.0', // Easily create forms with automatic insert and update, and automatic reactive validation.
    'aldeed:autoform-bs-datepicker@2.0.0',  // Custom bootstrap-datepicker input type for AutoForm
    'aldeed:autoform-select2@2.0.3', // Custom select2 input type for AutoForm
    'aldeed:collection2-core@2.0.0', // Core package for aldeed:collection2
    'aldeed:schema-deny@2.0.0',  // Deny inserting or updating certain properties through schema options
    'arillo:flow-router-helpers@0.5.2',  // Template helpers for flow-router
    'babrahams:accounts-ldap@0.7.4',  // Meteor account login via LDAP
    'babrahams:editable-text@0.9.2', // Editable text drop-in template helper
    'cfs:graphicsmagick@0.0.18',  // Adds `gm` to scope with the ability to perform GraphicsMagick or ImageMagick manipulation
    'dburles:factory@1.1.0',  // Factories for Meteor
    'dburles:mongo-collection-instances@0.3.5',  // Access your Mongo instances
    'easy:search@2.1.10', // Easy-to-use search with Blaze Components (+ Elastic Search Support)
    'easysearch:elasticsearch@2.1.9', // Elasticsearch Engine for EasySearch
    'force-ssl@1.0.14',  // Require this application to use HTTPS
    'fortawesome:fontawesome@4.7.0',  // Font Awesome (official): 500+ scalable vector icons, customizable via CSS, Retina friendly
    'kadira:blaze-layout@2.3.0',  // Layout Manager for Blaze (works well with FlowRouter)
    'kadira:flow-router@2.12.1',  // Carefully Designed Client Side Router for Meteor
    'kurounin:pagination@1.0.21',  // Meteor pagination done right. Usable in ReactJS or Blaze templates.
    'kurounin:pagination-blaze@1.0.2',  // Blaze paginator template for kurounin:pagination package.
    'manuel:reactivearray@1.0.5',  // Reactive Array for Meteor
    'matteodem:server-session@0.4.2',  // Serverside Session through a Meteor.Collection (get, set, equals etc.)
    'mdg:validated-method@1.1.0',  // A simple wrapper for Meteor.methods
    'mdg:validation-error@0.5.1',  // A standard validation error to be used by form/method/validation packages
    'momentjs:moment@2.17.1', // Moment.js (official): parse, validate, manipulate, and display dates - official Meteor packaging
    'natestrauser:select2@4.0.3',  // Select2 is a jQuery based replacement for select boxes.
    'ostrio:files@1.7.13', // Upload files via DDP, HTTP and WebRTC/DC. To server FS, AWS, GridFS, DropBox or Google Drive.
    'panter:moment-reactive@1.0.0',  // momentjs, but reactive. 'nuff said
    'peppelg:bootstrap-3-modal@1.0.4',  // Simple usage of bootstrap 3 modals.
    'percolate:find-from-publication@0.1.0', // Enable finding all documents that have been published by a given publication
    'raix:handlebar-helpers@0.2.5',  // Handlebar helpers
    'rajit:bootstrap3-datepicker@1.6.4', //  Meteor packaging of eternicode/bootstrap-datepicker for Bootstrap 3
    'reactive-var@1.0.11',  // Reactive variable
    'reywood:publish-composite@1.5.2',  // Publish a set of related documents from multiple collections with a reactive join
    'rzymek:moment-locale-de@2.14.1',  // Moment.js de locale. Companion package for rzymek:moment
    'shell-server@0.2.3',  // Server-side component of the `meteor shell` command.
    'tmeasday:check-npm-versions@0.3.1',
    'twbs:bootstrap@3.3.6',  // The most popular front-end framework for developing responsive, mobile first projects on the web.
    'vazco:universe-selectize@0.1.22',  // Universe select input standalone - with the appearance as selectize. It is for use without autoform.
    'verron:jquery-dotdotdot@1.7.4',  // A jQuery plugin for advanced cross-browser ellipsis on multiple line content
    'yogiben:autoform-tags@0.2.0', // Tags input for aldeed:autoform
    'zimme:select2-bootstrap3-css@0.1.1', // CSS to make Select2 fit in with Bootstrap 3
  ];

  api.use(packages);

  api.imply(packages);

  api.addFiles([
    'lib/core.js',
    'lib/collections.js',
    'lib/ui_modules.js',
  ], ['client', 'server']);

  api.export('Projektor');
});

Package.onTest(function(api) {
  api.use('projektor:lib');
  api.use(['ecmascript', 'random', 'practicalmeteor:mocha', 'mdg:validation-error']);

  api.mainModule('lib/lib.tests.js');
});
