import { Projects } from '/lib/collections/projects.js';
import {ImagesGallery} from "/lib/images.collection.js";

import "./gallery.html";


Template.setTitleImageButton.onCreated(function() {
  this.setCover = new ReactiveVar(false);
});

Template.setTitleImageButton.helpers({

  getSetCover(){
    return Template.instance().setCover.get();
  },
});


Template.galleryPreview.helpers({
  getValue(){
    return Template.instance().valuePreview.get();
  },
  
   result: function() {

    
    return Session.get('result');
  }
});

/**Template.galleryPreviewEdit.helpers({
  getValue(){
    return Template.instance().valuePreview.get();
  },
  
   result: function() {

    
    return Session.get('result');
  }
});**/

Template.setTitleImageButton.events({

  "click #title-image-button" (event, template){
   var currentArray = template.data.pictures;
   var currentSlot = template.data.slot;
    console.log(currentSlot);
   const test = currentArray[currentSlot];
    console.log(test);
   Projects.update( { _id: template.data.projectId }, { $set: { 'coverImg': currentArray[currentSlot] }} );
     const target = event.target;
    Template.instance().setCover.set(true);
          
  },
  
  
});

Template.deleteImageButton.events({
 "click #delete-image-button" (event, template){
 var currentArray = template.data.pictures;
 var currentSlot = template.data.slot;
 currentArray[currentSlot] = null;
 Projects.update( { _id: template.data.projectId }, { $set: { 'pictures': currentArray }} );
  }
});

/*Template.galleryThumbsnail.onCreated(function){
  this.gallerySlot = new ReactiveVar()
};

Template.galleryThumbsnail.events({
  
});

Template.gallery.onCreated(function() {
  this.showingUpload = new ReactiveVar(false);
  this.uploadToSlot = new ReactiveVar();
  
});

Template.gallery.helpers({
  getShowingUpload() {
    return Template.instance().showingUpload.get();
  },
  getUploadToSlot() {
    return Template.instance().uploadToSlot.get();
  }
});

Template.gallery.events({
  
  "click .gallery-nav-thumb" (event) {
    const target = event.target;
    const imgPath = target.src;
    $(".big-img").attr("src", imgPath);
    Template.instance().showingUpload.set(false);    
  },
  "click #gallery-nav-thumb-empty" (event) {
    const target = event.target;    
    let currentSlot = target.dataset.slot;
    Template.instance().uploadToSlot.set(currentSlot);
    Template.instance().showingUpload.set(true);
    console.log("showingUpload: " + Template.instance().showingUpload.get());
  }
                        
}); */