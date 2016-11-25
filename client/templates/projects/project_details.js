import { Template } from 'meteor/templating';
import { Projects } from '/lib/collections/projects.js';
import {Images} from "/lib/images.collection.js";

import './project_details.html';


Template.projectDetails.helpers({
  log (data) {
    console.log(data);
  },
  getProjectCollection(){
      return Projects;
  },
  
  result: function() {

    return Session.get('result');
  },

  slot: function() {

    return Session.get('slot');
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



