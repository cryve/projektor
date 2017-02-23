import { Template } from 'meteor/templating';

import { Projects } from '../../../lib/collections/projects.js';
import {Images} from "/lib/collections/images.js";
import './user-profile.html';

import './project_card.js';


Template.userProfile.helpers({
  
   projects() {
       return Projects.find({}, { sort: { createdAt: -1 } });
   },
    
   getUserCollection() {
    return Meteor.users;
   }, 
  

   
});
  


