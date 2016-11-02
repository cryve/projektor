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

    }
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
