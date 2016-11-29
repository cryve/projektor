import { Projects } from '/lib/collections/projects.js';
import { ProjectDrafts } from '/lib/collections/project_drafts.js';
Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading'
});

Router.map(function() {

  this.route('landingPage', {path: '/'});

  this.route('newProject', {
    path: '/projects/new/:_id',
    data: function() {
      console.log(this.params._id);
      return ProjectDrafts.findOne(this.params._id);
    }
  });

  this.route('loginPage', {path: '/login'});

  this.route('projectDetails', {
    path: '/projects/:_id/:title',
    data: function() {
      return Projects.findOne({_id: this.params._id});
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
      var profile = Meteor.users.findOne({_id: this.params._id});
      console.log(profile);
      return profile;
    }
 });
});
