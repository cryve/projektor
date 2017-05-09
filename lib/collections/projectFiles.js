import {Drafts} from "/lib/collections/drafts.js";
import {Projects} from "/lib/collections/projects.js";

export const ProjectFiles = new FilesCollection({
  collectionName: 'ProjectFiles',
  allowClientCode: false, // Disallow remove files from Client
  debug:false,
  onBeforeUpload: function (file) {
    // Allow upload files under 100MB, and only in png/jpg/jpeg formats
    if (file.size <= 1024*1024*10 && /pdf/i.test(file.extension)) {
      if(Meteor.isServer){
        if(this.userId){
          return true;
        }
      } else {
         return true;

      }

    } else {
      $("#uploadSuccess").hide();
      $("#uploadAlert").show();
      // return 'Please upload image, with size equal or less than 10MB';
    }
  },
  onAfterUpload: function( fileRef ) {
    var currentCollection = Mongo.Collection.get(fileRef.meta.collection);
    var projectId = fileRef.meta.projectId;
    currentCollection.update(projectId, { $push: { pdfs: fileRef._id } });

  }
});

if (Meteor.isServer) {
  Meteor.publish('files.projectFiles.all', function () {
    return ProjectFiles.find().cursor;
  });
}
