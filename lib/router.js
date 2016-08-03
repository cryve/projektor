Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
 

  
});

Router.route('/', {name: 'landingPage'});
Router.route('/new-project', {
  name: 'newProject',

});

Router.route('/projects/_id', {
  name: 'projectDetails',

});
