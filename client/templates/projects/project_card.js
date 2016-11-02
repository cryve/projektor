import { Template } from 'meteor/templating';
import {ImagesGallery} from "/lib/images.collection.js";
import { Projects } from '../../../lib/collections/projects.js';

import './project_card.html';

Template.projectCard.onRendered(function() {
  this.autorun(function(){
    data = Blaze.getData();
    $('img[rel="tooltip"]').tooltip();
  });
});

Template.projectCardCoverless.onRendered(function() {
  this.autorun(function(){
    data = Blaze.getData();
    $('img[rel="tooltip"]').tooltip();
  });
});


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
  "mouseenter .list-div": function(event, template){
        $(event.currentTarget).find('.description').stop().animate({
          height: "toggle",
          opacity: "toggle"
        }, 300);
      },
  "mouseleave .list-div": function(event, template){
        $(event.currentTarget).find('.description').stop().animate({
          height: "toggle",
          opacity: "toggle"
        }, 300);
      },
});
