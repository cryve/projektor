import {Template} from "meteor/templating" ;
import {Projects} from "/lib/collections/projects.js" ;
import {XlsFiles} from "/lib/collections/xlsFiles.js" ;
import {Drafts} from "/lib/collections/drafts.js";
import {Courses} from "/lib/collections/courses.js" ;
import {Images} from "/lib/collections/images.js";

import { publishDraft } from "/lib/methods.js";
import { deleteDraft } from "/lib/methods.js";

import "./editableProject.html";


Template.editableProject.onCreated(function() {
  this.editOwnerActive = new ReactiveVar(false);
  Meteor.subscribe("projects");
  Meteor.subscribe("drafts");
  Meteor.subscribe("files.images.all");
  Meteor.subscribe("files.xlsFiles.all");
  Meteor.subscribe("usersAll");
  Meteor.subscribe("courses");
});

Template.editableProject.helpers({


  result: function() {

    return Session.get('result');
  },

  slot: function() {

    return Session.get('slot');
  },


  log (data) {
    console.log(data);
  },
  getCollection() {
    if(this.isNewProject) {
      return Drafts;
    } else {
      return Projects;
    }
  },
  suggestedUsers(settings) {
    const users = Meteor.users.find(settings.hash.role ? { "profile.role" : settings.hash.role } : {});
    let userList = [" "];
    users.forEach(function (user){
      userList.push({
        value: user._id,
        label: user.profile.firstname + " " + user.profile.lastname,
      });
    });
    // remove users who are already in current group, but keep current user selection (firstOption)
    if (settings.hash.exclude) {
      settings.hash.exclude.forEach(function(user) {
        if (user.userId !== settings.hash.firstOption) {
          userList = userList.filter(item => item.value !== user.userId);
        }
      });
    }
    return userList;
  },
  suggestedCourses() {
    var courses = Courses.find({});
    let courseList = [" "];
    courses.forEach(function (course){
      courseList.push({
        value: course._id,
        label: course.courseName + " " + course.courseSemester + " " + course.studyCourse,
      });
    });
    return courseList;
  },
});

Template.editableProject.events({
  "click #btn-publish-draft" (event) {
    const newId = publishDraft.call({
        draftId: this._id,
      }, (err, res) => {
        if (err) {
          alert(err);
        } else {
          alert("Dein Projekt wurde veröffentlicht!");
        }
    });
    deleteDraft.call({
        draftId: this._id,
      }, (err, res) => {
        if (err) {
          alert(err);
        }
    });
    if(this.supervisors && (Meteor.userId() == this.supervisors[0].userId) && (Meteor.userId() == this.owner.userId) ){
      var course = Courses.findOne(this.courseId);
      Router.go("currentCourseLink", {_id: this.courseId, name: course.courseName});
    } else {
      Router.go("projectDetails", {_id: newId, title: this.title});
    }

    Session.set('result', "null");
  },
  "click #btn-delete-draft" (event) {
    // Drafts.remove(this._id);
    deleteDraft.call({
        draftId: this._id,
      }, (err, res) => {
        if (err) {
          alert(err);
        } else {
          alert("Dein Entwurf wurde gelöscht!");
        }
    });
    Router.go("landingPage");
    Session.set('result', "null");
  },
  "click .btn-edit-owner" (event) {
    Template.instance().editOwnerActive.set(true);
  },
  "click .btn-abort-owner-editing" (event) {
    Template.instance().editOwnerActive.set(false);
  },
});
