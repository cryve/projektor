import {Template} from "meteor/templating" ;
import {Projects} from "/lib/collections/projects.js" ;
import {ProjectDrafts} from "/lib/collections/project_drafts.js";
import {Images} from "/lib/images.collection.js";

import "./new_project.html";


Template.editableProject.onCreated(function() {
  this.editOwnerActive = new ReactiveVar(false);
});

Template.editableProject.helpers({

  
  result: function() {

    return Session.get('result');
  },

  slot: function() {

    return Session.get('slot');
  },
  
  collectionFinder: function() {

      return Session.get('collectionFinder');
  },

  log (data) {
    console.log(data);
  },
  getCollection() {
    if(Session.get('collectionFinder')){
      return ProjectDrafts;
    }
    else{
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
});

Template.editableProject.events({
  "click #btn-create" (event) {
    var title = this.title;
    var newId = Projects.insert(this);
    console.log(this);
    ProjectDrafts.remove(this._id);
    Router.go("projectDetails", {_id: newId, title: title});
    Session.set('result', "null")
  },
  "click #btn-abort" (event) {
    ProjectDrafts.remove(this._id);
    Router.go("landingPage");
    Session.set('result', "null")
  },
  "click .btn-edit-owner" (event) {
    Template.instance().editOwnerActive.set(true);
  },
  "click .btn-abort-owner-editing" (event) {
    Template.instance().editOwnerActive.set(false);
  },
});
