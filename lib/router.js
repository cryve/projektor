import { Projects } from '../lib/collections/projects.js';

Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading'
});

Router.map(function() {

  this.route('landingPage', {path: '/'});
  
  this.route('newProject', {path: 'projects/new'});
  
  this.route('projectDetails', {
    path: '/projects/:_id/:title',
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
      var profile = Meteor.users.findOne({_id: this.params._id});
      console.log(profile);
      return profile;
    } 
 });
});