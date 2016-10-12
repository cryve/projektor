import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Videos, ImagesGallery } from '/lib/images.collection.js';
import { Projects } from "/lib/collections/projects.js" ;

import './image_upload_crop.html';
import './project_details.html';



Template.uploadedFilesCrop.helpers({
  uploadedFilesCrop: function () {
    return ImagesGallery.find();
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
        var uploadInstance = ImagesGallery.insert({
          file: file,
          streams: 'dynamic',
          chunkSize: 'dynamic'
        }, false);

        uploadInstance.on('start', function() {
          template.currentUploadCrop.set(this);
        });

        uploadInstance.on('end', function(error, fileObj) {
          if (error) {
            alert('Error during upload: ' + error.reason);
          } else {
            alert('File "' + fileObj.name + '" successfully uploaded to' + this.slot);
            console.log("Storing image with URL " + fileObj._id + " in slot: ");
            
            
            Projects.update( { _id: this._id }, { $set: { 'pictures.[0]': fileObj._id }} );
            
            
            
          }
          
          template.currentUploadCrop.set(false);
        });

        uploadInstance.start();
      }
    }
  }
});

Template.fileCrop.helpers({
  imageFile: function () {
   return ImagesGallery.findOne();
  },
  
});

Template.fileCrop.helpers({
   videoFile: function () {
      return Videos.findOne();
    }
});

