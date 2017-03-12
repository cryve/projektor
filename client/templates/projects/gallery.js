import { Projects } from '/lib/collections/projects.js';
import {Drafts} from "/lib/collections/drafts.js";
import {Images} from "/lib/collections/images.js";
import {Template} from "meteor/templating" ;
import {deleteImg, setMedia, setCoverImg, setMediaId, setMediaType, removeCoverImg} from "/lib/methods.js";

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

$(document).on("drop",".well.preview-placeholder",function(event){
    event.preventDefault();
    console.log(event);
    var file = event.originalEvent.dataTransfer.files;
    // der zugriff ist hier leider nicht korrekt, eigentlich sollte hier die resource des events hinterlegt sein.

    var formData = new FormData();
    formData.append('files',file[0]);

    // hier muesste jetzt ein xmlhttprequest zu der korrekten URL gemacht werden und die formData muessen uebergeben
    // werden.
    console.log(formData);
});
//
$(document).on("dragover",".well.preview-placeholder",function(event){
    console.log(event);
});

Template.setVideoLink.events({
  "click #video-link-button" (event) {
    Template.instance().editActive.set(true);
    console.log(this); //this
  },
  "click .btn-abort-adding" (event) {
    Template.instance().editActive.set(false);
  },

  // "click .btn-set-type" (event, template) {
  //   var currentSlot = template.data.slot;
  //   var collection = template.data.collection;
  //   // collection.update( { _id: template.data.projectId }, { $set: { 'media': currentArray }} );
  //   if(collection._name == "projects") {
  //     setMediaType.call({
  //       collection: true,
  //       type: "URL",
  //       projectId: template.data.projectId,
  //       index: parseInt(currentSlot)
  //     }, (err, res) => {
  //       if (err) {
  //         alert(err);  
  //       }
  //     });
  //   } else if (collection._name == "drafts") {
  //     setMediaType.call({
  //       collection: false,
  //       type: "URL",
  //       projectId: template.data.projectId,
  //       index: parseInt(currentSlot)
  //     }, (err, res) => {
  //       if (err) {
  //         alert(err);
  //       }
  //     });
  //   }
  // },
});


Template.deleteImageButton.onCreated (function(){
  this.setEmptyPreview = new ReactiveVar(false);
  Meteor.subscribe("files.images.all");
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
  //  collection.update( { _id: template.data.projectId }, { $set: { 'coverImg': currentArray[currentSlot].id }} );
    setCoverImg.call({
      collection: collection._name,
      projectId: template.data.projectId,
      index: parseInt(currentSlot),
      coverImageId: "empty"
    }, (err, res) => {
      if (err) {
        alert(err);
      }
    });
   Template.instance().setCover.set(true);

  },

});



Template.deleteImageButton.events({

   "click #delete-image-button" (event, template){
   var currentArray = template.data.media;
   var currentSlot = template.data.slot;
   var currentCover = template.data.coverImg;
   var collection = template.data.collection;
   if (currentArray && currentArray[currentSlot].id
       &&(currentArray[currentSlot].type == "image")){
    //Images.remove({_id: currentArray[currentSlot].id});
     deleteImg.call({
      imageId: currentArray[currentSlot].id
     }, (err, res) => {
      if (err) {
        alert(err);
      }
     });
   };
   if(currentCover == currentArray[currentSlot].id ){
     currentArray[currentSlot].id = null;
     var newCoverImage = null;

     for (var i = 0; i < 5; i++) {

        if (currentArray[i].id != null){
            newCoverImage = currentArray[i].id;
            break;
        }
     }
    //  collection.update( { _id: template.data.projectId }, { $set: { 'coverImg': newCoverImage }} );
    if (newCoverImage){
      setCoverImg.call({
        collection: collection._name,
        projectId: template.data.projectId,
        index: parseInt(currentSlot),
        coverImageId: newCoverImage
      }, (err, res) => {
        if (err) {
          alert(err);
        }
      });
    } else {
      removeCoverImg.call({
        collection: collection._name,
        projectId: template.data.projectId,
      }, (err, res) => {
        if (err) {
          alert(err);
        }
      });  
    }
   //currentArray[currentSlot].id = null;
   //currentArray[currentSlot].type = null;
  //  collection.update( { _id: template.data.projectId }, { $set: { 'media': currentArray }} );
    }
    setMediaType.call({
      collection: collection._name,
      type: "null",
      projectId: template.data.projectId,
      index: parseInt(currentSlot)
    }, (err, res) => {
      if (err) {
        alert(err);
      }
    });
    setMediaId.call({
      collection: collection._name,
      id: "null",
      projectId: template.data.projectId,
      index: parseInt(currentSlot)
    }, (err, res) => {
      if (err) {
        alert(err);
      }
    });
   Template.instance().setEmptyPreview.set(true);
   Session.set('result', undefined);
   }
  
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
  console.log()
  Meteor.subscribe("projects");
  Meteor.subscribe("drafts");
});

Template.wholeGallery.helpers({
  log (data) {
    console.log(data);
  },
  getVideoImage(id) {
    var currentArray = this.currentDoc.media;
    var url = id;
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);
    var newUrlId = (match&&match[7].length==11)? match[7] : false;
    var newUrl = "http://img.youtube.com/vi/"+newUrlId+"/0.jpg"
    return newUrl;
  },
  // urlId() {
  //   var slot = Session.get('slot');
  //   //var currentArray = this.currentDoc.media;
  //   var url = this.currentDoc.media[slot].id;
  //   var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
  //   var match = url.match(regExp);
  //   var newUrlId = (match&&match[7].length==11)? match[7] : false;
  //   var newUrl = "https://www.youtube.com/embed/"+newUrlId;
  //  
  //   // this.currentCollection.update({_id: this.currentDoc.id}, {$set: {'media': currentArray}});
  //   if(this.currentCollection._name == "projects") {
  //   setMediaId.call({
  //     id: newUrl,
  //     collection: true,
  //     projectId: this.currentDoc._id,
  //     index: parseInt(slot)
  //   }, (err, res) => {
  //     if (err) {
  //       alert(err);
  //     }
  //   });
  // } else if (this.currentCollection._name == "drafts") {
  //   setMediaId.call({
  //     id: newUrl,
  //     collection: false,
  //     projectId: this.currentDoc._id,
  //     index: parseInt(slot)
  //   }, (err, res) => {
  //     if (err) {
  //       alert(err);
  //     }
  //   });
  // }
  // },
  getMediaType() {
    var slot = Session.get('slot');
    return this.currentDoc.media[slot].type;
  },
  getProjectCollection() {
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
  result() {
    return Session.get('result');
  },
  slot() {
    return Session.get('slot');
  },
  getFirstMediaType() {
    Session.set('result', "null");
    if (this.currentDoc && this.currentDoc.media) {
      for (var i = 0; i < this.currentDoc.media.length; i++) {
        if (this.currentDoc.media[i].type == "image"){
          // console.log(this.currentDoc.media[i].id);
          Session.set('slot', i)
          Session.set('result', this.currentDoc.media[i].id )
          return ("image");
        } else if (this.currentDoc.media[i].type == "URL"){
          Session.set('slot', i);
          return ("URL");
        }
      }
    }
  },
});



Template.wholeGallery.events({

  "click #edit-gallery-button" (event){
    if(!this.currentDoc.media) {
      Session.set('slot', 0);
      // this.currentCollection.update(this.currentDoc._id, {$set: {media: mediaEmpty}});
      // this.currentCollection.update(this.currentDoc._id, {$set: {coverImg: null}});
        setMedia.call({
          collection: this.currentCollection._name,
          projectId: this.currentDoc._id,
        }, (err, res) => {
          if (err) {
            alert(err);
          }
        });
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
