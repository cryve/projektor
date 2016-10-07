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
    
    return image && image.link();
  },
 
});
  


