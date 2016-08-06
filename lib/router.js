import { Projects } from '../imports/api/projects.js';

Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading'
});

Router.map(function() {
  this.route('landingPage', {path: '/'});
  
  this.route('newProject');
  
  this.route('projectDetails', {
    path: '/projects/:_id/:title',
    data: function() {
      return Projects.findOne(this.params._id);
    }
  });
});
