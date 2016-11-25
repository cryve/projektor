import { Projects } from '/lib/collections/projects.js';
import {ProjectDrafts} from "/lib/collections/project_drafts.js";
import {Images} from "/lib/images.collection.js";
import {Template} from "meteor/templating" ;

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
   var collection = template.data.collection;
   collection.update( { _id: template.data.projectId }, { $set: { 'coverImg': currentArray[currentSlot] }} );
   Template.instance().setCover.set(true);
    
  },

});



Template.deleteImageButton.events({
  
   "click #delete-image-button" (event, template){
   var currentArray = template.data.pictures;
   var currentSlot = template.data.slot;
   var currentCover = template.data.coverImg;
   var collection = template.data.collection;
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
     collection.update( { _id: template.data.projectId }, { $set: { 'coverImg': newCoverImage }} ); 
   } 
   currentArray[currentSlot] = null;   
   collection.update( { _id: template.data.projectId }, { $set: { 'pictures': currentArray }} );  
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

Template.wholeGallery.onCreated(function() {
  this.editMode = new ReactiveVar(false);
  this.refreshPreview = new ReactiveVar(false);
  this.finishedMode = new ReactiveVar(false);
});

Template.wholeGallery.helpers({
  log (data) {
    console.log(data);
  },
  getProjectCollection(){
      return Projects;
  },
  getDraftsCollection() {
    return ProjectDrafts;
  },
  getEditMode(){
    return Template.instance().editMode.get();
  },
  getRefreshPreview(){
    return Template.instance().refreshPreview.get();
  },

  getFinishedMode(){
    return Template.instance().finishedMode.get();
  },

  result: function() {

    return Session.get('result');
  },

  slot: function() {

    return Session.get('slot');
  },

    getFirstImageId(){
       Session.set('result', "null");
       for (var i = 0; i < this.currentDoc.pictures.length; i++) {

          if (this.currentDoc.pictures[i] != null){
              console.log(this.currentDoc.pictures[i]);
              Session.set('slot', i)
              return Session.set('result', this.currentDoc.pictures[i] )
          }

       }

    },

});



Template.wholeGallery.events({
  
  "click #edit-gallery-button" (event){
    if(!this.currentDoc.pictures) {
      Session.set('slot', 0);
      var picturesEmpty = ["", "", "", "", ""];
      this.currentCollection.update(this.currentDoc._id, {$set: {pictures: picturesEmpty}});
      this.currentCollection.update(this.currentDoc._id, {$set: {coverImg: null}});
    }

    const target = event.target;
    Template.instance().editMode.set(true);
    Template.instance().finishedMode.set(false);


  },

  'click #finished-button' (event){
    const target = event.target;
    Template.instance().finishedMode.set(true);
    Template.instance().editMode.set(false);

  },
  'click .edit_button': function(event){
      const target = event.target;
      var result = event.currentTarget.dataset.value;
      var slot = event.currentTarget.dataset.slot;
      console.log(result + " " + slot);
      Template.instance().refreshPreview.set(true);
      Session.set('result', result);
      Session.set('slot', slot);


  }
});
