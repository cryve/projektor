import { FilesCollection } from 'meteor/ostrio:files';


this.Images = new Meteor.Files({
  debug: true,
  collectionName: 'Images',
  storagePath:'C:/projektorTemp/data/img',
  allowClientCode: false, // Disallow remove files from Client
  onBeforeUpload: function (file) {
    // Allow upload files under 10MB, and only in png/jpg/jpeg formats
    if (file.size <= 10485760 && /png|jpg|jpeg|/i.test(file.extension)) {
      return true;
    } else {
      return 'Please upload image, with size equal or less than 10MB';
    }
  }
});

this.Videos = new Meteor.Files({
  debug: true,
  collectionName: 'Videos',
  storagePath:'C:/projektorTemp/data/vid',
  allowClientCode: false, // Disallow remove files from Client
  onBeforeUpload: function (file) {
    // Allow upload files under 10MB, and only in png/jpg/jpeg formats
    if (file.size <= 10485760 && /mp4/i.test(file.extension)) {
      return true;
    } else {
      return 'Please upload image, with size equal or less than 10MB';
    }
  }
});

if (Meteor.isServer) {
  Images.denyClient();
  Videos.denyClient();
  

  Meteor.publish('files.images.all', () => Images.find().cursor);
  Meteor.publish('files.videos.all', () => Videos.find().cursor);

} else {

  Meteor.subscribe('files.images.all');
  Meteor.subscribe('files.videos.all');
}

export { Videos, Images }





