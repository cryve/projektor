import { Template } from 'meteor/templating';
import { Projects } from '../../../lib/collections/projects.js';
import {Images} from "../../../lib/images.collection.js";

import './project_details.html';

Template.projectDetails.helpers({
  
   projects() {
       return Projects.find({}, { sort: { createdAt: -1 } });
   },
    
    
   getImgURL(imgId) { 
    console.log(imgId);
    var image = Images.findOne(imgId);    
    return image.link();
  },
 
});