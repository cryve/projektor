import { Template } from 'meteor/templating';

import { Projects } from '../../../imports/api/projects.js';

import './project_card.html';

Template.projectCard.onCreated(function helloOnCreated() {
  // counter starts at 0
  this.likes = new ReactiveVar(0);
});

Template.projectCard.helpers({
  likes() {
    return Template.instance().likes.get();
  },
});

Template.projectCard.events({
  'click button'(event, instance) {
    // increment the counter when button is clicked
    instance.likes.set(instance.likes.get() + 1);
  },
});