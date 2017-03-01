import { Template } from 'meteor/templating';
import { Projects } from '../../../lib/collections/projects.js';
import { avatarRemove } from "/lib/methods.js";
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

Template.userProfile.events({
  "click #delete-avatar-button" (event, template){
  //Images.remove({_id: currentArray[currentSlot].id});
    avatarRemove.call({
      userId: Meteor.userId(),
    }, (err, res) => {
      if (err) {
        alert(err);
      }
    });
  }
});
