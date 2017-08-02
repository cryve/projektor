import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Projects } from 'meteor/projektor:projects';
import { deleteImage, initialize, setCoverImage, setItemImageId, setItemType, removeCoverImage } from './methods.js';

import './image_upload_crop.js';
import './gallery.html';

Template.youtubeUrlEditable.onCreated(function() {
  this.isEditing = new ReactiveVar(false);
});

Template.youtubeUrlEditable.helpers({
  isEditing() {
    return Template.instance().isEditing.get();
  },
  youtubeUrlField() {
    return `media.${this.slot}.id`;
  },
});

Template.youtubeUrlEditable.events({
  'click #btn-set-video'() {
    Template.instance().isEditing.set(true);
  },
  'click .btn-abort-adding'() {
    Template.instance().isEditing.set(false);
  },
});

Template.largeViewEmbeddedVideo.helpers({
  youtubeUrl() {
    const slot = Session.get('selectedSlot');
    return this.media[slot].id;
  },
});

Template.deleteImageButton.events({
  'click #delete-image-button' (event, templateInstance) {
    const currentArray = templateInstance.data.media;
    const currentSlot = templateInstance.data.slot;
    const currentCover = templateInstance.data.coverImg;
    const projectId = templateInstance.data.projectId;
    if (currentArray && currentArray[currentSlot].id
       && (currentArray[currentSlot].type === 'image')) {
      deleteImage.call({
        imageId: currentArray[currentSlot].id,
        projectId,
      }, (err) => {
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
          projectId: templateInstance.data.projectId,
          galleryItemIndex: parseInt(currentSlot),
          imageId: newCoverImage,
        }, (err) => {
          if (err) {
            alert(err);
          }
        });
      } else {
        removeCoverImage.call({
          projectId: templateInstance.data.projectId,
        }, (err) => {
          if (err) {
            alert(err);
          }
        });
      }
    }
    setItemType.call({
      itemType: 'null',
      projectId: templateInstance.data.projectId,
      itemIndex: parseInt(currentSlot),
    }, (err) => {
      if (err) {
        alert(err);
      }
    });
    setItemImageId.call({
      imageId: 'null',
      projectId: templateInstance.data.projectId,
      itemIndex: parseInt(currentSlot),
    }, (err) => {
      if (err) {
        alert(err);
      }
    });
    Template.instance().setEmptyPreview.set(true);
    Session.set('selectedMediumId', undefined);
  },
});

Template.coverImageButton.events({
  'click #title-image-button' (event, templateInstance) {
    const currentSlot = templateInstance.data.slot;
    setCoverImage.call({
      projectId: templateInstance.data.projectId,
      galleryItemIndex: parseInt(currentSlot),
      imageId: 'empty',
    }, (err) => {
      if (err) {
        alert(err);
      }
    });
  },
});

Template.largeViewImage.helpers({
  selectedMediumId() {
    return Session.get('selectedMediumId');
  },
});

Template.gallery.onCreated(function() {
  // const projectId = FlowRouter.getParam('projectId');
  // const project = Projects.findOne(projectId);
  // this.currentDoc = project;
  // this.currentCollection = Projects;
  this.isEditing = new ReactiveVar(false);
  this.editMediumButtonWasClickedAtLeastOnce = new ReactiveVar(false);
  this.autorun(() => {
    this.subscribe('files.images.gallery', Template.currentData().media);
  });
});

Template.gallery.helpers({
  currentDoc() {
    return this;
  },
  currentCollection() {
    return Projects;
  },
  videoPreviewImage(youtubeUrl) {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    const match = youtubeUrl.match(regExp);
    const newUrlId = (match && match[7].length == 11) ? match[7] : false;
    const newUrl = `http://img.youtube.com/vi/${newUrlId}/0.jpg`;
    return newUrl;
  },
  mediumType() {
    const slot = Session.get('selectedSlot');
    return this.media[slot].type;
  },
  isEditing() {
    return Template.instance().isEditing.get();
  },
  editMediumButtonWasClickedAtLeastOnce() {
    return Template.instance().editMediumButtonWasClickedAtLeastOnce.get();
  },
  selectedMediumId() {
    return Session.get('selectedMediumId');
  },
  selectedSlot() {
    return Session.get('selectedSlot');
  },
  selectFirstEmptySlotAndGetMediumType() {
    Session.set('selectedMediumId', 'null');
    if (this.media) {
      for (let i = 0; i < this.media.length; i++) {
        if (this.media[i].type == 'image') {
          // console.log(this.media[i].id);
          Session.set('selectedSlot', i);
          Session.set('selectedMediumId', this.media[i].id);
          return ('image');
        } else if (this.media[i].type == 'URL') {
          Session.set('selectedSlot', i);
          return ('URL');
        }
      }
    }
  },
});

Template.gallery.events({
  'click #edit-gallery-button' () {
    if (!this.media) {
      Session.set('selectedSlot', 0);
      initialize.call({
        projectId: this._id,
      }, (err) => {
        if (err) {
          alert(err);
        }
      });
    }
    Template.instance().isEditing.set(true);
  },
  'click #btn-finish-editing' () {
    Template.instance().isEditing.set(false);
  },
  'click .btn-edit-medium'(event) {
    const selectedMediumId = event.currentTarget.dataset.value;
    const slot = event.currentTarget.dataset.slot;
    Template.instance().editMediumButtonWasClickedAtLeastOnce.set(true);
    Session.set('selectedMediumId', selectedMediumId);
    Session.set('selectedSlot', slot);
  },
});
