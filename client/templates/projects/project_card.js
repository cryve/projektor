import { Template } from 'meteor/templating';
import {ImagesGallery} from "/lib/images.collection.js";
import { Projects } from '../../../lib/collections/projects.js';

import './project_card.html';

Template.projectCard.onRendered(function() {
  $('[data-toggle="tooltip"]').tooltip();
});
  
Template.projectCard.helpers({
   projects() {
       return Projects.find({}, { sort: { createdAt: -1 } });
   },


});

