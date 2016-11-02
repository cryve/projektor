import { Template } from 'meteor/templating';
import {ImagesGallery} from "/lib/images.collection.js";
import { Projects } from '../../../lib/collections/projects.js';

import './project_card.html';

/*Template.projectCard.onRendered(function() {
  $('[data-toggle="tooltip"]').tooltip();
});*/
  
Template.projectCard.helpers({
   projects() {
       return Projects.find({}, { sort: { createdAt: -1 } });
   },


});

/*Template.projectCardCoverless.onRendered(function() {
  $('[data-toggle="tooltip"]').tooltip();
});*/
  
Template.projectCardCoverless.helpers({
   projects() {
       return Projects.find({}, { sort: { createdAt: -1 } });
   },

});

  

Template.projectCard.events({
  "mouseenter .post-module": function(event, template){
        $(event.currentTarget).find('.description').stop().animate({
          height: "toggle",
          opacity: "toggle"
        }, 300);
      },
  "mouseleave .post-module": function(event, template){
        $(event.currentTarget).find('.description').stop().animate({
          height: "toggle",
          opacity: "toggle"
        }, 300);
      },
});
