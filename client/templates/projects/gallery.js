import { Projects } from '/lib/collections/projects.js';
import {Drafts} from "/lib/collections/drafts.js";
import {Images} from "/lib/collections/images.js";
import {Template} from "meteor/templating" ;

import "./gallery.html";
Template.setVideoLink.onCreated(function() {
  this.editActive = new ReactiveVar(false);
});

Template.video.helpers({
  getUrlId(){
    var slot = Session.get('slot');
    return this.media[slot].id;
  }
});

Template.setVideoLink.helpers({
  editActive () {
    return Template.instance().editActive.get();
  },
  videoLinkField () {
    return "media." + this.slot + ".id";
  },
});

Template.setVideoLink.events({
  "click #video-link-button" (event) {
    Template.instance().editActive.set(true);
    console.log(this); //this
  },
  "click .btn-abort-adding" (event) {
    Template.instance().editActive.set(false);
  },

  "click .btn-set-type" (event, template) {
    var currentArray = template.data.media;
    var currentSlot = template.data.slot;
    var collection = template.data.collection;
    currentArray[currentSlot].type = "URL";
    collection.update( { _id: template.data.projectId }, { $set: { 'media': currentArray }} );
  },
});


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
   var currentArray = template.data.media;
   var currentSlot = template.data.slot;
   var collection = template.data.collection;
   collection.update( { _id: template.data.projectId }, { $set: { 'coverImg': currentArray[currentSlot].id }} );
   Template.instance().setCover.set(true);

  },

});



Template.deleteImageButton.events({

   "click #delete-image-button" (event, template){
   var currentArray = template.data.media;
   var currentSlot = template.data.slot;
   var currentCover = template.data.coverImg;
   var collection = template.data.collection;
   console.log(currentArray[currentSlot].id);
   console.log(currentCover);
   if (currentArray[currentSlot].id != null){
    Images.remove({_id: currentArray[currentSlot].id});
   };

   if(currentCover === currentArray[currentSlot].id ){
     currentArray[currentSlot].id = null;
     var newCoverImage = null;

     for (var i = 0; i < 5; i++) {

        if (currentArray[i].id != null){
            newCoverImage = currentArray[i].id;
            break;
        }
     }
     console.log(newCoverImage);
     collection.update( { _id: template.data.projectId }, { $set: { 'coverImg': newCoverImage }} );
   }
   currentArray[currentSlot].id = null;
   currentArray[currentSlot].type = null;
   collection.update( { _id: template.data.projectId }, { $set: { 'media': currentArray }} );
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
  getVideoImage(id){
    var currentArray = this.currentDoc.media;
    var url = id;
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);
    var newUrlId = (match&&match[7].length==11)? match[7] : false;
    var newUrl = "http://img.youtube.com/vi/"+newUrlId+"/0.jpg"
    return newUrl;
  },
  urlId(){
    var slot = Session.get('slot');
    var currentArray = this.currentDoc.media;
    var url = this.currentDoc.media[slot].id;
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);
    var newUrlId = (match&&match[7].length==11)? match[7] : false;
    var newUrl = "https://www.youtube.com/embed/"+newUrlId
    console.log(newUrl);
    currentArray[slot].id = newUrl;
    this.currentCollection.update({_id: this.currentDoc.id}, {$set: {'media': currentArray}});
  },
  getMediaType(){
    var slot = Session.get('slot');
    return this.currentDoc.media[slot].type;
  },
  getProjectCollection(){
      return Projects;
  },
  getDraftsCollection() {
    return Drafts;
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

  getFirstMediaType(){
     Session.set('result', "null");
     for (var i = 0; i < this.currentDoc.media.length; i++) {

        if (this.currentDoc.media[i].type == "image"){
          console.log(this.currentDoc.media[i].id);
          Session.set('slot', i)
          Session.set('result', this.currentDoc.media[i].id )
          return ("image");
        }
        else if (this.currentDoc.media[i].type == "URL"){
          Session.set('slot', i);
          return ("URL");
        }

     }
  },

});



Template.wholeGallery.events({

  "click #edit-gallery-button" (event){
    if(!this.currentDoc.media) {
      Session.set('slot', 0);
      var mediaEmpty = [{type: null, id: null}, {type: null, id: null},{type: null, id: null}, {type: null, id: null}, {type: null, id: null}];
      this.currentCollection.update(this.currentDoc._id, {$set: {media: mediaEmpty}});
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
