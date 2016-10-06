import { Template } from 'meteor/templating';

import { Projects } from '../../../lib/collections/projects.js';
import {Images} from "/lib/images.collection.js";
import './user-profile.html';

import './project_card.js';


Template.editProfile.helpers({
  
   projects() {
       return Projects.find({}, { sort: { createdAt: -1 } });
   },
    
    
   getImgURL(imgId) { 
    console.log(imgId);
    var image = Images.findOne(imgId);    
    return image.link();
  },
 
});
  

var Schemas = {};

Schemas.UserProfile = new SimpleSchema({
	avatar: {
      type: String,
      label: "Bilder hochladen",
      optional: true,
      autoform: {
        afFieldInput: {
          type: "fileUpload",
          collection: "Images",
          previewTemplate: 'stopPreview',
          

        },
      },
    },
	
});

Schemas.User = new SimpleSchema({
	profile: {
		type: Schemas.UserProfile,
		optional: true
	},

});
Meteor.users.attachSchema(Schemas.User);


Meteor.users.allow({
	  insert: function () { return true; },
	  update: function () { return true; },
	  remove: function () { return true; }
});
