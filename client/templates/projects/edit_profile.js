import {Template} from "meteor/templating" ;


import "./edit_profile.html" ;

Template.editAboutMe.onCreated(function() {
  this.editActive = new ReactiveVar(false);
});

Template.editAboutMe.helpers({
  editActive () {
    return Template.instance().editActive.get();
  },
});

Template.editAboutMe.events({
  "click .btn-edit-description" (event) {
    Template.instance().editActive.set(true);
  },
  "click .btn-abort-editing" (event) {
    Template.instance().editActive.set(false);
  },
});