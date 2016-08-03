import { Projects } from '../imports/api/projects.js';

Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
 

  
});

Router.route('/', {name: 'landingPage'});
Router.route('/new-project', {
  name: 'newProject',

});

Router.route('/projects/:_id/:title', {
  name: 'projectDetails',
  data: function() { return
  Projects.findOne(this.params._id); },
  title: function () { return this.title;}
  
});
