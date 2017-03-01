import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Images } from '/lib/collections/images.js';
import { Projects } from "/lib/collections/projects.js" ;
import { Drafts } from "/lib/collections/drafts.js";

import { imageRemove, galleryUpdate, coverImageUpdate, userAvatar} from "/lib/methods.js";

import './image_upload_crop.html';


Template.uploadedFilesCrop.onCreated(function uploadedFilesCropOnCreated() {
  Meteor.subscribe("files.images.all");
})

Template.uploadedFilesCrop.helpers({
  uploadedFilesCrop: function () {
    return Images.find();
  }
});

Template.uploadFormCrop.onCreated(function () {
  this.currentUploadCrop = new ReactiveVar(false);
});

Template.uploadFormCrop.helpers({
  currentUploadCrop: function () {
    return Template.instance().currentUploadCrop.get();
  }
});

Template.uploadFormCrop.events({
  'change #fileInput': function (e, template) {
    if (e.currentTarget.files && e.currentTarget.files[0]) {
      // We upload only one file, in case
      // there was multiple files selected
      var file = e.currentTarget.files[0];
      if (file) {
        var uploadInstance = Images.insert({
          file: file,
          streams: 'dynamic',
          chunkSize: 'dynamic',
          meta: {
            type: template.data.type,
          } 
        }, false);

        uploadInstance.on('start', function() {
          template.currentUploadCrop.set(this);
        });

        uploadInstance.on('end', function(error, fileObj) {
          if (error) {
            alert('Error during upload: ' + error.reason);
          } else {
            if (template.data.type == "gallery"){
              var currentArray = template.data.media;
              var currentSlot = template.data.slot;
              var currentCover = template.data.coverImg;
              var collection = template.data.collection;
              alert('File "' + fileObj.name + '" successfully uploaded to ' + currentSlot);
              if(currentCover == currentArray[currentSlot].id){
                if (currentCover){
                  imageRemove.call({
                    imageId: currentArray[currentSlot].id, 
                  }, (err, res) => {
                    if (err) {
                      alert(err);
                    } else {
                    }
                  });
                }
                galleryUpdate.call({
                  projectId: template.data.projectId,
                  collection: collection._name,
                  index: parseInt(currentSlot),
                  type: "image",
                  id: fileObj._id,
                }, (err, res) => {
                  if (err) {
                    alert(err);
                  } else {
                    alert("Complete!!");
                  }
                });

                /*Images.remove({_id: currentArray[currentSlot].id});
                currentArray[currentSlot].id = fileObj._id;
                currentArray[currentSlot].type = "image";
                collection.update( { _id: template.data.projectId }, { $set: { 'media': currentArray }} );
                collection.update( { _id: template.data.projectId }, { $set: { 'coverImg': fileObj._id }} );*/
              }
              else{
                if (currentArray[currentSlot].id){
                  imageRemove.call({
                    imageId: currentArray[currentSlot].id, 
                  }, (err, res) => {
                    if (err) {
                      alert(err);
                    } else {
                       alert("Complete!!");
                    }
                  });
                 }
                 galleryUpdate.call({
                    projectId: template.data.projectId,
                    collection: collection._name,
                    index: parseInt(currentSlot),
                    type: "image",
                    id: fileObj._id,
                  }, (err, res) => {
                    if (err) {
                      alert(err);
                    } else {
                       alert("Complete!!");
                    }
                  });
                /*Images.remove({_id: currentArray[currentSlot].id});
                currentArray[currentSlot].id = fileObj._id;
                currentArray[currentSlot].type = "image";
                console.log("Storing image with URL " + fileObj._id + " in slot: " + currentSlot);
                collection.update( { _id: template.data.projectId }, { $set: { 'media': currentArray }} );*/
              }
              Session.set('result', fileObj._id);
            } else {
              alert('File "' + fileObj.name + '" successfully uploaded');
              console.log("Storing image with URL " + fileObj._id);
              userAvatar.call({
                userId: Meteor.userId(),
                imageId: fileObj._id,
              }, (err, res) => {
                if (err) {
                  alert(err);
                } else {
                   alert("Complete!!");
                }
              });             
            }
          }

          template.currentUploadCrop.set(false);
        });

        uploadInstance.start();
      }
    }
  }
});

Template.fileCrop.onCreated(function fileCropOnCreated() {
  Meteor.subscribe("files.images.all");
});

Template.fileCrop.helpers({
  imageFile: function () {
   return Images.findOne();
  },

});

Template.fileCrop.helpers({
   videoFile: function () {
      return Videos.findOne();
    }
});
