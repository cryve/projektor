import { Template } from 'meteor/templating';

import { Projects } from '../../../imports/api/projects.js';

import { ReactiveVar } from 'meteor/reactive-var';

import './project_details.html';

Template.projectDetails.onCreated(function helloOnCreated() {
  // counter starts at 0
  this.likes = new ReactiveVar(0);
});

Template.projectDetails.helpers({
  likes() {
    return Template.instance().likes.get();
  },
});

Template.projectDetails.events({
  'click button'(event, instance) {
    // increment the counter when button is clicked
    instance.likes.set(instance.likes.get() + 1);
  },
});