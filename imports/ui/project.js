import { Template } from 'meteor/templating';

import { Projects } from '../api/projects.js';

import './project.html';

Template.project.events({
    'click .delete'() {
        Meteor.call('projects.remove', this._id);
    },
});