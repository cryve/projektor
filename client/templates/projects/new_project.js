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
  $("#edit-occasions").editable({
    select2: {
       tags: ["Projekt C, Media Systems", "Hobby", "Mediengestaltung 3, Media Systems", "IT-Systeme, Medientechnik"],
       tokenSeparators: [","],
       width: 200,
    },
    success: function(response, newValue) {
      var draftId = $(this).data("pk");
      ProjectDrafts.update(draftId, {$set: {"occasions": newValue}});
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
