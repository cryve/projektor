import {Template} from "meteor/templating" ;
import {Projects} from "/lib/collections/projects.js" ;
import {ProjectDrafts} from "/lib/collections/project_drafts.js";
import {Images} from "/lib/images.collection.js";

import "./new_project.html";

Template.newProject.onRendered(function() {
  $.fn.editable.defaults.mode = 'inline';
  $.fn.editable.defaults.onblur = "ignore";
  var tmplInst = this;
  $('#title').editable({
    type: "text",
    title: "title",
    placeholder: "Titel deines Projekts",
    emptytext: "Titel deines Projekts",
    validate: function(value) {
      if($.trim(value) == '') {
        return "Bitte gib deinem Projekt einen Titel!";
      }
    },
    success: function(response, newValue) {
      var draftId = $(this).data("pk");
      ProjectDrafts.update(draftId, {$set: {title: newValue}});
    }
  });
  $('#subtitle').editable({
    type: "text",
    title: "subtitle",
    placeholder: "Untertitel deines Projekts",
    emptytext: "Untertitel deines Projekts",
    onblur: "ignore",
    success: function(response, newValue) {
      var draftId = $(this).data("pk");
      ProjectDrafts.update(draftId, {$set: {subtitle: newValue}});
    },
  });
  $('#edit-owner-role').editable({
    type: 'text',
    display: false,
    title: "owner role",
    placeholder: "weitere Aufgaben",
    emptytext: "weitere Aufgaben",
    success: function(response, newValue) {
      var draftId = $(this).data("pk");
      ProjectDrafts.update(draftId, {$set: {"owner.role": newValue}});
    }
  });
  $('#edit-description').editable({
    type: 'textarea',
    title: "description",
    placeholder: "Projekt-Beschreibung",
    emptytext: "Projekt-Beschreibung",
    rows: 10,
    success: function(response, newValue) {
      var draftId = $(this).data("pk");
      ProjectDrafts.update(draftId, {$set: {"description": newValue}});
    }
  });
  $("#edit-tags").editable({
    select2: {
       tags: ["Science Fiction", "Abenteuer", "Web-App"],
       tokenSeparators: [","],
       width: 500,
    },
    success: function(response, newValue) {
      var draftId = $(this).data("pk");
      ProjectDrafts.update(draftId, {$set: {"tags": newValue}});
    }
  });
  var tmplInst = this;
  this.autorun(function() {
    Blaze.getData();
    var users = Meteor.users.find({});
    $('.add-member').editable({
      type: 'select2',
      title: "add member",
      placeholder: "Mitglied hinzufügen",
      emptytext: "Mitglied hinzufügen",
      validate: function(value) {
        if($.trim(value) == '') {
          return "Bitte wähle ein Mitglied aus!";
        }
      },
      source: function() {
        var userList = [];
        users.forEach(function (user){
          userList.push({
            id: user._id,
            text: user.profile.firstname + " " + user.profile.lastname,
          });
        });
        return userList;
      },
      success: function(response, newValue) {
        var draftId = $(this).data("pk");
        ProjectDrafts.update(draftId, {$push: { team: {userId: newValue} } });
        $(this).editable("destroy");
      },
    });
    $(".add-job").editable({
      type: "text",
      title: "add job",
      placeholder: "Gesuchte Fähigkeit",
      emptytext: "Gesuchte Fähigkeit hinzufügen",
      success: function(response, newValue) {
        var draftId = $(this).data("pk");
        ProjectDrafts.update(draftId, {$push: { jobs: newValue }});
        $(this).editable("destroy");
      }
    });
  });
});

Template.newProject.helpers({
  log (data) {
    console.log(data);
  },
});

Template.newProject.events({
  "click #btn-create" (event) {
    var title = this.title;
    var newId = Projects.insert(this);
    console.log(this);
    //ProjectDrafts.remove(this._id);
    Router.go("projectDetails", {_id: newId, title: title});
  },
});

Template.member.onRendered(function() {
  var tmplInst = this;
  this.autorun(function() {
    var data = Blaze.getData();
    tmplInst.$(".select-member").editable({
      type: 'select2',
      title: "select member",
      placeholder: "Mitglied auswählen",
      emptytext: "Mitglied auswählen",
      validate: function(value) {
        if($.trim(value) == '') {
          return "Bitte wähle ein Mitglied aus!";
        }
      },
      source: function() {
        var userList = [];
        var users = Meteor.users.find({});
        users.forEach(function (user){
          userList.push({
            id: user._id,
            text: user.profile.firstname + " " + user.profile.lastname,
          });
        });
        return userList;
      },
      display: false,
      success: function (response, newValue) {
        var draftId = $(this).data("pk");
        var index = data.currentIndex;
        var updateObj = {};
        updateObj["team." + index + ".userId"] = newValue;
        ProjectDrafts.update(draftId, {$set: updateObj});
      },
    });
    tmplInst.$('.edit-member-role').editable({
      type: 'text',
      title: "user role",
      placeholder: "Aufgaben im Projekt",
      emptytext: "Aufgaben im Projekt",
      display: function() {},
      success: function (response, newValue) {
        var draftId = $(this).data("pk");
        var index = data.currentIndex;
        var updateObj = {};
        updateObj["team." + index + ".role"] = newValue;
        ProjectDrafts.update(draftId, {$set: updateObj});
      },
    });
  });
});

Template.member.helpers({
  log (data) {
    console.log(data);
  }
});

Template.member.events({
  "click .btn-delete-member" (event) {
    ProjectDrafts.update(this.draftId, {$pull: {team: {userId: this.userId}}});
  }
});

Template.jobItem.onRendered(function() {
  tmplInst = this;
  this.autorun(function() {
    data = Blaze.getData();
    $(".edit-job").editable({
      type: "text",
      title: "edit job",
      placeholder: "Gesuchte Fähigkeit",
      emptytext: "Gesuchte Fähigkeit",
      success: function(response, newValue) {
        var draftId = $(this).data("pk");
        var index = $(this).data("index");
        var updateObj = {};
        updateObj["jobs." + index] = newValue;
        console.log(updateObj);
        ProjectDrafts.update(draftId, {$set: updateObj});
      }
    });
  });
});
