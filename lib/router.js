import { Projects } from '/lib/collections/projects.js';
import { Drafts } from '/lib/collections/drafts.js';
import { Courses } from '/lib/collections/courses.js';
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
      return Drafts.findOne({_id:this.params._id});
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

  this.route('/profiles/:_id', {
    template:'userProfile',
    name: 'userProfile',
    data: function() {
      return Meteor.users.findOne(this.params._id);
    }
  });

  this.route('/myCourses/:_id', {
    template:'course',
    name: 'courseLink',
    data: function() {
      return Meteor.users.findOne(this.params._id);
    }
  });

  this.route('/myCourses/:_id/:name', {
    template:'currentCourse',
    name: 'currentCourseLink',
    data: function() {
      return Courses.findOne(this.params._id);
    }
  });

  this.route('userList', {
    path: '/users',
  });
});
