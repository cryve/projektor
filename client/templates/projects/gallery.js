import { Images } from '/lib/images.collection.js';

import "./gallery.html";

Template.gallery.onCreated(function() {
  this.showingUpload = new ReactiveVar(false);
  this.uploadToSlot = new ReactiveVar();
  
});

Template.gallery.helpers({
  getImgURL(imgId) { 
    var image = Images.findOne(imgId);    
    return image.link();
  },
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
                        
});