import { Template } from 'meteor/templating';
import { Projects } from '/lib/collections/projects.js';
import {Images} from "/lib/images.collection.js";

import './project_details.html';

Template.projectDetails.onCreated(function() {
  this.editMode = new ReactiveVar(false);
  this.refreshPreview = new ReactiveVar(false);
  this.finishedMode = new ReactiveVar(false);
});

Template.projectDetails.helpers({
  log (data) {
    console.log(data);
  },
  getProjectCollection(){
      return Projects;
  },
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
       Session.set('result', "null");
       for (var i = 0; i < this.pictures.length; i++) {

          if (this.pictures[i] != null){
              console.log(this.pictures[i]);
              Session.set('slot', i)
              return Session.set('result', this.pictures[i] )
          }

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



Template.projectDetails.events({

  "click #edit-gallery-button" (event){
    if(!this.pictures) {
      Session.set('slot', 0);
      var picturesEmpty = ["", "", "", "", ""];
      Projects.update(this._id, {$set: {pictures: picturesEmpty}});
      Projects.update(this._id, {$set: {coverImg: null}});
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


  }
});
