import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Videos, Images } from '/lib/images.collection.js';
import { Projects } from "/lib/collections/projects.js" ;

import './image_upload.html';



Template.uploadedFiles.helpers({
  uploadedFiles: function () {
    return Images.find();
  }
});

Template.uploadForm.onCreated(function () {
  this.currentUpload = new ReactiveVar(false);
  Meteor.subscribe("usersAll");
});

Template.uploadForm.helpers({
  currentUpload: function () {
    return Template.instance().currentUpload.get();
  }
});

Template.uploadForm.events({
  'change #fileInput': function (e, template) {
    if (e.currentTarget.files && e.currentTarget.files[0]) {
      // We upload only one file, in case
      // there was multiple files selected
      var uploadInstance = Images.insert({
        file: e.currentTarget.files[0],
        streams: 'dynamic',
        chunkSize: 'dynamic'
      }, false);

      uploadInstance.on('start', function() {
        template.currentUpload.set(this);
      });

      uploadInstance.on('end', function(error, fileObj) {
        if (error) {
          alert('Error during upload: ' + error.reason);
        } else {
          alert('File "' + fileObj.name + '" successfully uploaded');
          console.log("Storing image with URL " + fileObj._id + " in slot: " + this.uploadSlot);


          Meteor.users.update( { _id: Meteor.userId() }, { $set: { 'profile.avatar': fileObj._id }} );



        }

        template.currentUpload.set(false);
      });

      uploadInstance.start();
    }
  }
});

Template.file.helpers({
  imageFile: function () {
   return Images.findOne();
  },

});

Template.file.helpers({
   videoFile: function () {
      return Videos.findOne();
    }
});
