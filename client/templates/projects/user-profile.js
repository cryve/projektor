import { Template } from 'meteor/templating';

import { Projects } from '../../../lib/collections/projects.js';
import {Images} from "/lib/images.collection.js";
import './user-profile.html';

import './project_card.js';


Template.userProfile.helpers({
   log (data) {
    console.log(data);
   },
  
   projects() {
       return Projects.find({}, { sort: { createdAt: -1 } });
   },
    
   getUserCollection() {
    return Meteor.user();
   }, 
  
    user: function() {
        return Meteor.user();
    }
   
});
  


