import { Projects } from '/lib/collections/projects.js';
import {Images} from "/lib/images.collection.js";

import "./gallery.html";

Template.deleteImageButton.onCreated (function(){
  this.setEmptyPreview = new ReactiveVar(false);
});

Template.setTitleImageButton.onCreated(function() {
  this.setCover = new ReactiveVar(false);
});

Template.setTitleImageButton.helpers({

  getSetCover(){
    return Template.instance().setCover.get();
  },
});

Template.deleteImageButton.helpers ({
  getSetEmptyPreview(){
    return Template.instance().setEmptyPreview.get();
  },
});

Template.galleryPreview.helpers({
  getValue(){
    return Template.instance().valuePreview.get();
  },
  
   result: function() {
    return Session.get('result');
  },
  

});


Template.setTitleImageButton.events({

  "click #title-image-button" (event, template){
   const target = event.target;
   var currentArray = template.data.pictures;
   var currentSlot = template.data.slot;
   Projects.update( { _id: template.data.projectId }, { $set: { 'coverImg': currentArray[currentSlot] }} );
   Template.instance().setCover.set(true);
    
  },

});


Template.deleteImageButton.events({
  
   "click #delete-image-button" (event, template){
   var currentArray = template.data.pictures;
   var currentSlot = template.data.slot;
   var currentCover = template.data.coverImg;
   console.log(currentArray[currentSlot]);
   console.log(currentCover);
   if (currentArray[currentSlot] != null){
    Images.remove({_id: currentArray[currentSlot]}); 
   };
     
   if(currentCover === currentArray[currentSlot] ){
     currentArray[currentSlot] = null; 
     var newCoverImage = null;
     
     for (var i = 0; i < 5; i++) {
      
        if (currentArray[i] != null){
            newCoverImage = currentArray[i];
            break;
        }
     }
     console.log(newCoverImage);
     Projects.update( { _id: template.data.projectId }, { $set: { 'coverImg': newCoverImage }} ); 
   } 
   currentArray[currentSlot] = null;   
   Projects.update( { _id: template.data.projectId }, { $set: { 'pictures': currentArray }} );  
   Template.instance().setEmptyPreview.set(true);
   Session.set('result', undefined)
  
  },
  
});

/*Template.previewPlaceholder.events({
  
   "click #set-preview" (event){
     const target = event.target;
     console.log("hfjdhjdjdjd")
     Template.instance().setEmptyPreview.set(true);
   }
});*/

