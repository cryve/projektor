import {Template} from "meteor/templating" ;
import {Projects} from "/lib/collections/projects.js" ;
import {ProjectDrafts} from "/lib/collections/project_drafts.js";
import {Images} from "/lib/images.collection.js";

import "./new_project.html";


Template.newProject.onCreated(function() {
  this.editOwnerActive = new ReactiveVar(false);
  this.editMode = new ReactiveVar(false);
  this.refreshPreview = new ReactiveVar(false);
  this.finishedMode = new ReactiveVar(false);
});

Template.newProject.helpers({

  getEditMode(){
    return Template.instance().editMode.get();
  },
  getRefreshPreview(){
    return Template.instance().refreshPreview.get();
  },

  getFinishedMode(){
    return Template.instance().finishedMode.get();
  },

  result: function() {

    return Session.get('result');
  },

  slot: function() {

    return Session.get('slot');
  },

    getFirstImageId(){
       for (var i = 0; i < this.pictures.length; i++) {

          if (this.pictures[i] != null){
              console.log(this.pictures[i]);
              Session.set('slot', i)
              return Session.set('result', this.pictures[i] )
          }
       }

    },
  log (data) {
    console.log(data);
  },
  getDraftsCollection() {
    return ProjectDrafts;
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

Template.newProject.events({
"click #edit-gallery-button" (event){
    if(!this.pictures) {
      Session.set('slot', 0);
      var picturesEmpty = ["", "", "", "", ""];
      ProjectDrafts.update(this._id, {$set: {pictures: picturesEmpty}});
      ProjectDrafts.update(this._id, {$set: {coverImg: null}});
    }

    const target = event.target;
    Template.instance().editMode.set(true);
    Template.instance().finishedMode.set(false);


  },

  'click #finished-button' (event){
    const target = event.target;
    Template.instance().finishedMode.set(true);
    Template.instance().editMode.set(false);

  },
  'click .edit_button': function(event){
      const target = event.target;
      var result = event.currentTarget.dataset.value;
      var slot = event.currentTarget.dataset.slot;
      console.log(result + " " + slot);
      Template.instance().refreshPreview.set(true);
      Session.set('result', result);
      Session.set('slot', slot);


  } ,

  "click #btn-create" (event) {
    var title = this.title;
    var newId = Projects.insert(this);
    console.log(this);
    ProjectDrafts.remove(this._id);
    Router.go("projectDetails", {_id: newId, title: title});
  },
  "click #btn-abort" (event) {
    ProjectDrafts.remove(this._id);
    Router.go("landingPage");
  },
  "click .btn-edit-owner" (event) {
    Template.instance().editOwnerActive.set(true);
  },
  "click .btn-abort-owner-editing" (event) {
    Template.instance().editOwnerActive.set(false);
  },
});
