import { Template } from 'meteor/templating';

import { Projects } from '../../../imports/api/projects.js';

import './like_button.html';

Template.likeButton.events({
  'click button'(event, instance) {
    var projectId = this._id;
    Meteor.call('projects.incrementLikes', projectId);
  },
});