import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Images } from 'meteor/projektor:files';
import Users from 'meteor/projektor:users';
import toastr from 'toastr';

import { updateGalleryItem } from '/lib/methods.js';

import './image_upload_crop.html';

Template.uploadedFilesCrop.onCreated(function uploadedFilesCropOnCreated() {
  this.autorun(() => {
    this.subscribe('files.images.all');
  });
});

Template.uploadedFilesCrop.helpers({
  uploadedFilesCrop () {
    return Images.find();
  },
});

Template.uploadFormCrop.onCreated(function () {
  this.currentUploadCrop = new ReactiveVar(false);
  toastr.options = {
    closeButton: false,
    debug: false,
    newestOnTop: false,
    progressBar: false,
    positionClass: 'toast-top-left',
    preventDuplicates: false,
    onclick: null,
    showDuration: '300',
    hideDuration: '1000',
    timeOut: '5000',
    extendedTimeOut: '1000',
    showEasing: 'swing',
    hideEasing: 'linear',
    showMethod: 'fadeIn',
    hideMethod: 'fadeOut',
  };
});

Template.uploadFormCrop.helpers({
  currentUploadCrop () {
    return Template.instance().currentUploadCrop.get();
  },
});

Template.uploadFormCrop.events({
  'change #fileInput' (e, template) {
    if (e.currentTarget.files && e.currentTarget.files[0]) {
      // We upload only one file, in case
      // there was multiple files selected
      const file = e.currentTarget.files[0];
      if (file) {
        const uploadInstance = Images.insert({
          file,
          streams: 'dynamic',
          chunkSize: 'dynamic',
          meta: {
            type: template.data.type,
            projectId: template.data.projectId,
          },
        }, false);

        uploadInstance.on('start', function() {
          template.currentUploadCrop.set(this);
        });

        uploadInstance.on('end', function(error, fileObj) {
          if (error) {
            alert(`Error during upload: ${error.reason}`);
          } else if (template.data.type == 'gallery') {
            const currentArray = template.data.media;
            const currentSlot = template.data.slot;
            const currentCover = template.data.coverImg;
            const collection = template.data.collection;
            toastr.success(`${fileObj.name} wurde erfolgreich in Slot ${currentSlot} hochgeladen!`);
            if (currentCover == currentArray[currentSlot].id) {
              if (currentCover) {
                Images.imageRemove.call({
                  imageId: currentArray[currentSlot].id,
                }, (err, res) => {
                  if (err) {
                    alert(err);
                  } else {
                  }
                });
              }
              updateGalleryItem.call({
                projectId: template.data.projectId,
                collectionName: collection._name,
                itemIndex: parseInt(currentSlot),
                newItemType: 'image',
                imageId: fileObj._id,
              }, (err, res) => {
                if (err) {
                  alert(err);
                }
                toastr.success('Gallerie wurde erfolgreich aktualisiert!');
              });

                /* Images.remove({_id: currentArray[currentSlot].id});
                currentArray[currentSlot].id = fileObj._id;
                currentArray[currentSlot].type = "image";
                collection.update( { _id: template.data.projectId }, { $set: { 'media': currentArray }} );
                collection.update( { _id: template.data.projectId }, { $set: { 'coverImg': fileObj._id }} );*/
            } else {
              if (currentArray[currentSlot].id) {
                Images.imageRemove.call({
                  imageId: currentArray[currentSlot].id,
                }, (err, res) => {
                  if (err) {
                    alert(err);
                  } else {
                    toastr.success('Bild wurde erfolgreich gelöscht!');
                  }
                });
              }
              updateGalleryItem.call({
                projectId: template.data.projectId,
                collectionName: collection._name,
                itemIndex: parseInt(currentSlot),
                newItemType: 'image',
                imageId: fileObj._id,
              }, (err, res) => {
                if (err) {
                  alert(err);
                } else {
                  toastr.success('Gallerie wurde erfolgreich aktualisiert!');
                }
              });
                /* Images.remove({_id: currentArray[currentSlot].id});
                currentArray[currentSlot].id = fileObj._id;
                currentArray[currentSlot].type = "image";
                console.log("Storing image with URL " + fileObj._id + " in slot: " + currentSlot);
                collection.update( { _id: template.data.projectId }, { $set: { 'media': currentArray }} );*/
            }
            Session.set('result', fileObj._id);
          } else {
            alert(`File "${fileObj.name}" successfully uploaded`);
            console.log(`Storing image with URL ${fileObj._id}`);
            Users.userAvatar.call({
              userId: Meteor.userId(),
              imageId: fileObj._id,
            }, (err, res) => {
              if (err) {
                alert(err);
              } else {
                toastr.success('Avatarbild wurde erfolgreich gesetzt!');
              }
            });
          }

          template.currentUploadCrop.set(false);
        });

        uploadInstance.start();
      }
    }
  },
});

Template.fileCrop.onCreated(function fileCropOnCreated() {
  this.autorun(() => {
    this.subscribe('files.images.all');
  });
});

Template.fileCrop.helpers({
  imageFile () {
    return Images.findOne();
  },
  videoFile () {
    return Videos.findOne();
  },
});
