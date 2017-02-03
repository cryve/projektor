import { Template } from 'meteor/templating';
import { Projects } from '../../../lib/collections/projects.js';

import './user-profile.html';
import './project_card.js';

Template.userProfile.onCreated(function userProfileOnCreated() {
  Meteor.subscribe("projects");
  Meteor.subscribe("usersAll");
});

Template.userProfile.helpers({
   projects() {
       return Projects.find({}, { sort: { createdAt: -1 } });
   },

   getUserCollection() {
    return Meteor.users;
   },



});
