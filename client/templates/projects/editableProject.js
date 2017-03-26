import {Template} from "meteor/templating" ;
import {Projects} from "/lib/collections/projects.js" ;
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
  suggestedUsers(firstOption) {
    var users = Meteor.users.find({});
    let userList = [" "];
    users.forEach(function (user){
      userList.push({
        value: user._id,
        label: user.profile.firstname + " " + user.profile.lastname,
      });
    });
    // remove users who are already members:
    if (this.owner) {
      userList = userList.filter(item => item.value !== this.owner.userId);
    }
    if (this.team) {
      this.team.forEach(function(member) {
        if (member && member.userId !== firstOption) {
          userList = userList.filter(item => item.value !== member.userId);
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
    Router.go("projectDetails", {_id: newId, title: this.title});
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


// Make sure it's in client
