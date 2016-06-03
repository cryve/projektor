import { Template } from 'meteor/templating';

import { Projects } from '../api/projects.js';

import './project.html';

Template.project.helpers({
   isOwner() {
       return this.owner === Meteor.userId();
   },
});

Template.project.events({
    'click .delete'() {
        Meteor.call('projects.remove', this._id);
    },
    'click .toggle-private'() {
        Meteor.call('projects.setPrivate', this._id, !this.private);
    },
});