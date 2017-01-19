import { Projects } from '/lib/collections/projects.js';
import { ProjectDrafts } from '/lib/collections/project_drafts.js';
Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading'
});

Router.onBeforeAction(function() {
  $(window).scrollTop(0);
  this.next();
});

Router.map(function() {

  this.route('landingPage', {path: '/'});

  this.route('/projects/new/:_id', {
    template: 'editableProject',
    name: 'newProject',
    data: function() {
      console.log(this.params._id);
      return ProjectDrafts.findOne(this.params._id);
    }
  });

  this.route('loginPage', {path: '/login'});

  this.route('/projects/:_id/:title', {
    template:'editableProject',
    name: 'projectDetails',
    data: function() {
      return Projects.findOne(this.params._id);
    }
  });

  this.route('projectEdit', {
    path: '/projects/:_id/:title/edit',
    data: function() {
      return Projects.findOne(this.params._id);
    }
  });
  this.route('userProfile',{
    path:'profiles/:_id',
    data: function () {
      return Meteor.users.findOne(this.params._id);
    }
  });
  this.route('course',{
    path:'myCourses/:_id',
    data: function () {
      return Meteor.users.findOne(this.params._id);
    }
  });
});
