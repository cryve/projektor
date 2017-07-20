import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { deleteImage, initialize, setCoverImage, setItemImageId, setItemType, removeCoverImage } from './methods.js';

import './image_upload_crop.js';
import './gallery.html';

Template.setVideoLink.onCreated(function() {
  this.editActive = new ReactiveVar(false);
});

Template.setVideoLink.helpers({
  editActive () {
    return Template.instance().editActive.get();
  },
  videoLinkField () {
    return `media.${this.slot}.id`;
  },
});

Template.setVideoLink.events({
  'click #video-link-button' (event) {
    Template.instance().editActive.set(true);
  },
  'click .btn-abort-adding' (event) {
    Template.instance().editActive.set(false);
  },
});

Template.video.helpers({
  getUrlId() {
    const slot = Session.get('slot');
    return this.media[slot].id;
  },
});

Template.titleImage.onCreated(function() {
  this.setEmptyPreview = new ReactiveVar(false);
});

Template.titleImage.helpers({
  getSetEmptyPreview() {
    return Template.instance().setEmptyPreview.get();
  },
});

Template.deleteImageButton.onCreated(function() {
  this.setEmptyPreview = new ReactiveVar(false);
});

Template.deleteImageButton.helpers({
  getSetEmptyPreview() {
    return Template.instance().setEmptyPreview.get();
  },
});

Template.deleteImageButton.events({
  'click #delete-image-button' (event, template) {
    const currentArray = template.data.media;
    const currentSlot = template.data.slot;
    const currentCover = template.data.coverImg;
    const collection = template.data.collection;
    const projectId = template.data.projectId;
    if (currentArray && currentArray[currentSlot].id
       && (currentArray[currentSlot].type === 'image')) {
    // Images.remove({_id: currentArray[currentSlot].id});
      deleteImage.call({
        imageId: currentArray[currentSlot].id,
        projectId,
      }, (err, res) => {
        if (err) {
          alert(err);
        }
      });
    }
    if (currentCover === currentArray[currentSlot].id) {
      currentArray[currentSlot].id = null;
      let newCoverImage = null;

      for (let i = 0; i < 5; i++) {
        if (currentArray[i].id != null) {
          newCoverImage = currentArray[i].id;
          break;
        }
      }
      if (newCoverImage) {
        setCoverImage.call({
          projectId: template.data.projectId,
          galleryItemIndex: parseInt(currentSlot),
          imageId: newCoverImage,
        }, (err, res) => {
          if (err) {
            alert(err);
          }
        });
      } else {
        removeCoverImage.call({
          projectId: template.data.projectId,
        }, (err, res) => {
          if (err) {
            alert(err);
          }
        });
      }
    }
    setItemType.call({
      itemType: 'null',
      projectId: template.data.projectId,
      itemIndex: parseInt(currentSlot),
    }, (err, res) => {
      if (err) {
        alert(err);
      }
    });
    setItemImageId.call({
      imageId: 'null',
      projectId: template.data.projectId,
      itemIndex: parseInt(currentSlot),
    }, (err, res) => {
      if (err) {
        alert(err);
      }
    });
    Template.instance().setEmptyPreview.set(true);
    Session.set('result', undefined);
  },
});

Template.setTitleImageButton.onCreated(function() {
  this.setCover = new ReactiveVar(false);
});

Template.setTitleImageButton.helpers({
  getSetCover() {
    return Template.instance().setCover.get();
  },
});

Template.setTitleImageButton.events({
  'click #title-image-button' (event, template) {
    const currentSlot = template.data.slot;
    const collection = template.data.collection;
    setCoverImage.call({
      projectId: template.data.projectId,
      galleryItemIndex: parseInt(currentSlot),
      imageId: 'empty',
    }, (err, res) => {
      if (err) {
        alert(err);
      }
    });
    Template.instance().setCover.set(true);
  },
});

Template.galleryPreview.helpers({
  getValue() {
    return Template.instance().valuePreview.get();
  },
  result() {
    return Session.get('result');
  },
});

/* Template.previewPlaceholder.events({

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
  const self = this;
  this.autorun(() => {
    console.log(self);
    console.log(Template.currentData());
    this.subscribe('files.images.gallery', Template.currentData().currentDoc.media);
  });
});

Template.wholeGallery.helpers({
  getVideoImage(id) {
    const url = id;
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    const match = url.match(regExp);
    const newUrlId = (match && match[7].length == 11) ? match[7] : false;
    const newUrl = `http://img.youtube.com/vi/${newUrlId}/0.jpg`;
    return newUrl;
  },
  getMediaType() {
    const slot = Session.get('slot');
    return this.currentDoc.media[slot].type;
  },
  getEditMode() {
    return Template.instance().editMode.get();
  },
  getRefreshPreview() {
    return Template.instance().refreshPreview.get();
  },
  getFinishedMode() {
    return Template.instance().finishedMode.get();
  },
  result() {
    return Session.get('result');
  },
  slot() {
    return Session.get('slot');
  },
  getFirstMediaType() {
    Session.set('result', 'null');
    if (this.currentDoc && this.currentDoc.media) {
      for (let i = 0; i < this.currentDoc.media.length; i++) {
        if (this.currentDoc.media[i].type == 'image') {
          // console.log(this.currentDoc.media[i].id);
          Session.set('slot', i);
          Session.set('result', this.currentDoc.media[i].id);
          return ('image');
        } else if (this.currentDoc.media[i].type == 'URL') {
          Session.set('slot', i);
          return ('URL');
        }
      }
    }
  },
});

Template.wholeGallery.events({
  'click #edit-gallery-button' (event) {
    if (!this.currentDoc.media) {
      Session.set('slot', 0);
      initialize.call({
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
  'click #finished-button' (event) {
    const target = event.target;
    Template.instance().finishedMode.set(true);
    Template.instance().editMode.set(false);
  },
  'click .edit_button'(event) {
    const target = event.target;
    const result = event.currentTarget.dataset.value;
    const slot = event.currentTarget.dataset.slot;
    console.log(`${result} ${slot}`);
    Template.instance().refreshPreview.set(true);
    Session.set('result', result);
    Session.set('slot', slot);
  },
});
