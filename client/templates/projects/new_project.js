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
    data = Blaze.getData();
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

Template.newProject.onCreated(function() {
  this.editOwnerActive = new ReactiveVar(false);
});

Template.newProject.helpers({
  log (data) {
    console.log(data);
  },
  getDraftsCollection() {
    return ProjectDrafts;
  },
  suggestedUsers(firstOption) {
    console.log(firstOption);
    var users = Meteor.users.find({});
    let userList = [" "];
    users.forEach(function (user){
      userList.push({
        value: user._id,
        label: user.profile.firstname + " " + user.profile.lastname,
      });
    });
    // remove users who are already members:
    console.log(this.owner);
    if (this.owner) {
      userList = userList.filter(item => item.value !== this.owner.userId);
      console.log(userList);
    }
    if (this.team) {
      this.team.forEach(function(member) {
        if (member && member.userId !== firstOption) {
          userList = userList.filter(item => item.value !== member.userId);
        }
      });
    }
    console.log(userList);
    return userList;
  },
  teamUpdateUserId(index) {
    return "team." + index + ".userId";
  },
  editOwnerActive() {
    return Template.instance().editOwnerActive.get();
  }
});

Template.newProject.events({
  "click #btn-create" (event) {
    var title = this.title;
    var newId = Projects.insert(this);
    console.log(this);
    //ProjectDrafts.remove(this._id);
    Router.go("projectDetails", {_id: newId, title: title});
  },
  "click .btn-edit-owner" (event) {
    Template.instance().editOwnerActive.set(true);
  },
  "click .btn-abort-owner-editing" (event) {
    Template.instance().editOwnerActive.set(false);
  }
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

Template.addMember.onCreated(function() {
  this.editActive = new ReactiveVar(false);
});

Template.addMember.onRendered(function() {
  var tmplInst = this;
  this.autorun(function() {
    data = Blaze.getData();
    console.log(data);
    if(data.suggestedUsers) {
      Tracker.afterFlush( () => {
        console.log("now flushed");
        console.log(data);
        //$.fn.editable.defaults.mode = 'inline';
        //$.fn.editable.defaults.onblur = "ignore";
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
            // console.log(data);
            // return data && data.suggestedUsers;
            var users = Meteor.users.find({});
            let userList = [];
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
            $(this).editable("value", null);
          },
        });
      });
    }
  });
});

Template.addMember.helpers({
  editActive () {
    return Template.instance().editActive.get();
  }
})

Template.addMember.events({
  "click #btn-add-member" (event) {
    Template.instance().editActive.set(true);
    console.log(Template.instance().editActive.get());
  },
  "click .btn-abort-adding" (event) {
    Template.instance().editActive.set(false);
  }
});

Template.member.onCreated(function() {
  this.editActive = new ReactiveVar(false);
});

Template.member.helpers({
  editActive () {
    return Template.instance().editActive.get();
  },
  teamUserIdField () {
    console.log(this.slot);
    return "team." + this.slot + ".userId";
  },
  teamUserRoleField () {
    return "team." + this.slot + ".role";
  },
});

Template.member.events({
  "click .btn-delete-member" (event) {
    ProjectDrafts.update(this.draftId, {$pull: {team: {userId: this.userId}}});
  },
  "click .btn-edit-member" (event) {
    Template.instance().editActive.set(true);
  },
  "click .btn-abort-editing" (event) {
    Template.instance().editActive.set(false);
  }
});

Template.contactItem.onCreated(function() {
  this.editActive = new ReactiveVar(false);
});

Template.contactItem.helpers({
  editActive() {
    return Template.instance().editActive.get();
  },
  contactMediumField () {
    return "contacts." + this.slot + ".medium";
  },
  contactApproachField() {
    return "contacts." + this.slot + ".approach";
  },
  mediumOptions() {
    return [
      {value: "E-Mail" ,label: "E-Mail"},
      {value: "Skype" ,label: "Skype"},
      {value: "Telefon" ,label: "Telefon"},
      {value: "Whatsapp" ,label: "Whatsapp"},
      {value: "SMS" ,label: "SMS"},
      {value: "Facebook" ,label: "Facebook"},
      {value: "Google+" ,label: "Google+"},
      {value: "Treffpunkt" ,label: "Treffpunkt"},
      {value: "Sonstiges" ,label: "Sonstiges"},
    ];
  },
});

Template.contactItem.events({
  "click .btn-delete-contact" (event) {
    let currentContacts = this.currentDoc.contacts;
    currentContacts.splice(this.slot, 1);
    ProjectDrafts.update(this.currentDoc._id, {$set: {contacts: currentContacts}});
  },
  "click .btn-edit-contact" (event) {
    Template.instance().editActive.set(true);
  },
  "click .btn-abort-editing" (event) {
    Template.instance().editActive.set(false);
  },
});

Template.addContact.onCreated(function() {
  this.editActive = new ReactiveVar(false);
});

Template.addContact.helpers({
  editActive () {
    return Template.instance().editActive.get();
  },
  mediumOptions() {
    return [
      {},
      {value: "E-Mail" ,label: "E-Mail"},
      {value: "Skype" ,label: "Skype"},
      {value: "Telefon" ,label: "Telefon"},
      {value: "Whatsapp" ,label: "Whatsapp"},
      {value: "SMS" ,label: "SMS"},
      {value: "Facebook" ,label: "Facebook"},
      {value: "Google+" ,label: "Google+"},
      {value: "Treffpunkt" ,label: "Treffpunkt"},
    ];
  },
});

Template.addContact.events({
  "click #btn-add-contact" (event) {
    Template.instance().editActive.set(true);
  },
  "click .btn-abort-adding" (event) {
    Template.instance().editActive.set(false);
  },
});

Template.editTitle.onCreated(function() {
  this.editActive = new ReactiveVar(false);
});

Template.editTitle.helpers({
  editActive () {
    return Template.instance().editActive.get();
  },
});

Template.editTitle.events({
  "click .btn-edit-title" (event) {
    Template.instance().editActive.set(true);
  },
  "click .btn-abort-editing" (event) {
    Template.instance().editActive.set(false);
  },
});

Template.editDescription.onCreated(function() {
  this.editActive = new ReactiveVar(false);
});

Template.editDescription.helpers({
  editActive () {
    return Template.instance().editActive.get();
  },
});

Template.editDescription.events({
  "click .btn-edit-description" (event) {
    Template.instance().editActive.set(true);
  },
  "click .btn-abort-editing" (event) {
    Template.instance().editActive.set(false);
  },
});

Template.editTags.onCreated(function() {
  this.editActive = new ReactiveVar(false);
});

Template.editTags.helpers({
  editActive () {
    return Template.instance().editActive.get();
  },
});

Template.editTags.events({
  "click .btn-edit-tags" (event) {
    Template.instance().editActive.set(true);
  },
  "click .btn-abort-editing" (event) {
    Template.instance().editActive.set(false);
  },
});

Template.addJob.onCreated(function() {
  this.editActive = new ReactiveVar(false);
});

Template.addJob.helpers({
  editActive () {
    return Template.instance().editActive.get();
  },
});

Template.addJob.events({
  "click #btn-add-job" (event) {
    Template.instance().editActive.set(true);
  },
  "click .btn-abort-adding" (event) {
    Template.instance().editActive.set(false);
  },
});

Template.jobItem.onCreated(function() {
  this.editActive = new ReactiveVar(false);
});

Template.jobItem.helpers({
  editActive() {
    return Template.instance().editActive.get();
  },
  jobTitleField () {
    return "jobs." + this.slot + ".title";
  },
});

Template.jobItem.events({
  "click .btn-delete-job" (event) {
    let currentJobs = this.currentDoc.jobs;
    currentJobs.splice(this.slot, 1);
    ProjectDrafts.update(this.currentDoc._id, {$set: {jobs: currentJobs}});
  },
  "click .btn-edit-job" (event) {
    Template.instance().editActive.set(true);
  },
  "click .btn-abort-editing" (event) {
    Template.instance().editActive.set(false);
  },
});

Template.editOccasions.onCreated(function() {
  this.editActive = new ReactiveVar(false);
});

Template.editOccasions.helpers({
  editActive () {
    return Template.instance().editActive.get();
  },
});

Template.editOccasions.events({
  "click .btn-edit-supervisors" (event) {
    Template.instance().editActive.set(true);
  },
  "click .btn-abort-editing" (event) {
    Template.instance().editActive.set(false);
  },
});

Template.editSupervisors.onCreated(function() {
  this.editActive = new ReactiveVar(false);
});

Template.editSupervisors.helpers({
  editActive () {
    return Template.instance().editActive.get();
  },
});

Template.editSupervisors.events({
  "click .btn-edit-supervisors" (event) {
    Template.instance().editActive.set(true);
  },
  "click .btn-abort-editing" (event) {
    Template.instance().editActive.set(false);
  },
});

Template.editDeadline.onCreated(function() {
  this.editActive = new ReactiveVar(false);
});

Template.editDeadline.helpers({
  editActive () {
    return Template.instance().editActive.get();
  },
});

Template.editDeadline.events({
  "click .btn-edit-deadline" (event) {
    Template.instance().editActive.set(true);
  },
  "click .btn-abort-editing" (event) {
    Template.instance().editActive.set(false);
  },
});
