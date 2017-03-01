import { FilesCollection } from 'meteor/ostrio:files';
import {Drafts} from "/lib/collections/drafts.js";
import {Projects} from "/lib/collections/projects.js";
import { check } from 'meteor/check';


/*this.Images = new FilesCollection({
  debug: true,
  collectionName: "Images",
  allowClientCode: false, // Disallow remove files from Client
  onBeforeUpload: function (file) {
    // Allow upload files under 10MB, and only in png/jpg/jpeg formats
    if (file.size <= 10485760 && /png|jpg|jpeg|/i.test(file.extension)) {
      return true;
    } else {
      return "Please upload image, with size equal or less than 10MB";
    }
  }
});*/

this.Images = new FilesCollection({
  debug: false,
  collectionName: "Images",
  allowClientCode: true, // Disallow remove files from Client
  onBeforeUpload: function (file) {
    // Allow upload files under 10MB, and only in png/jpg/jpeg formats
    if (file.size <= 1024*1024*10 && /png|jpg|jpeg/i.test(file.extension)) {
      return true;
    } else {
      return "Please upload image, with size equal or less than 10MB";
    }
  },
  onAfterUpload: function( fileRef ) {
    var bound, fs;

    bound = Meteor.bindEnvironment(function(callback) {
      return callback();
    });

    fs = Npm.require('fs-extra');

    createThumbnails = function(collection, fileRef) {
      console.log(fileRef);
      console.log(fileRef.meta);
      console.log(fileRef.meta.type);
      var finish, isLast;
      check(fileRef, Object);
      isLast = false;
      finish = function(error) {
        return bound(function() {
          if (error) {
            console.error("[_app.createThumbnails] [finish]", error);
          } else {
            if (isLast) {
              //cb && cb(fileRef);
            }
          }
          return true;
        });
      };
      fs.exists(fileRef.path, function(exists) {
        return bound(function() {
          var image, sizes;
          if (!exists) {
            throw Meteor.log.error("File " + fileRef.path + " not found in [createThumbnails] Method");
          }
          image = gm(fileRef.path);
          if(fileRef.meta.type == "gallery"){
            sizes = {
              preview: {
                width: 750,
                height: 500
              },
              thumbnail115: {
                width:115,
                height:65
              },
              cover400: {
                width:400,
                height:300
              },
            }
          } else {
            sizes = {
              avatar50: {
                width:50,
                square: true
              },
              avatar20: {
                width:20,
                square: true
              },
              avatar30: {
                width: 30,
                square: true
              },
            };
          }
          return image.size(function(error, features) {
            return bound(function() {
              var i;
              if (error) {
                throw new Meteor.Error("[_app.createThumbnails] [_.each sizes]", error);
              }
              i = 0;
              collection.collection.update(fileRef._id, {
                $set: {
                  'meta.width': features.width,
                  'meta.height': features.height
                }
              });
              return _.each(sizes, function(size, name) {
                var copyPaste, heightNew, heightRatio, img, path, updateAndSave, widthNew, widthRatio, x, y;
                path = (collection.storagePath(fileRef)) + "/" + name + "-" + fileRef._id + "." + fileRef.extension;
                copyPaste = function() {
                  fs.copy(fileRef.path, path, function(error) {
                    return bound(function() {
                      var upd;
                      if (error) {
                        console.error("[_app.createThumbnails] [_.each sizes] [fs.copy]", error);
                      } else {
                        upd = {
                          $set: {}
                        };
                        upd['$set']['versions.' + name] = {
                          path: path,
                          size: fileRef.size,
                          type: fileRef.type,
                          extension: fileRef.extension,
                          meta: {
                            width: features.width,
                            height: features.height
                          }
                        };
                        collection.collection.update(fileRef._id, upd, function(error) {
                          ++i;
                          if (i === Object.keys(sizes).length) {
                            isLast = true;
                          }
                          return finish(error);
                        });
                      }
                    });
                  });
                };
                if (!!~['jpg', 'jpeg', 'png'].indexOf(fileRef.extension.toLowerCase())) {
                  img = gm(fileRef.path).define('filter:support=2').define('jpeg:fancy-upsampling=false').define('jpeg:fancy-upsampling=off').define('png:compression-filter=5').define('png:compression-level=9').define('png:compression-strategy=1').define('png:exclude-chunk=all').noProfile().strip().dither(false).filter('Triangle');
                  updateAndSave = function(error) {
                    return bound(function() {
                      if (error) {
                        console.error("[_app.createThumbnails] [_.each sizes] [img.resize]", error);
                      } else {
                        fs.stat(path, function(err, stat) {
                          return bound(function() {
                            gm(path).size(function(error, imgInfo) {
                              return bound(function() {
                                var upd;
                                if (error) {
                                  console.error("[_app.createThumbnails] [_.each sizes] [img.resize] [fs.stat] [gm(path).size]", error);
                                } else {
                                  upd = {
                                    $set: {}
                                  };
                                  upd['$set']['versions.' + name] = {
                                    path: path,
                                    size: stat.size,
                                    type: fileRef.type,
                                    extension: fileRef.extension,
                                    meta: {
                                      width: imgInfo.width,
                                      height: imgInfo.height
                                    }
                                  };
                                  collection.collection.update(fileRef._id, upd, function(error) {
                                    ++i;
                                    if (i === Object.keys(sizes).length) {
                                      isLast = true;
                                    }
                                    return finish(error);
                                  });
                                }
                              });
                            });
                          });
                        });
                      }
                    });
                  };

                  /*if (!size.square) {
                    if (features.width > size.width) {
                      img.resize(size.width).interlace('Line').write(path, updateAndSave);
                    } else {
                      copyPaste();
                    }
                  }*/
                  if (!size.square) {
                    var widthRatio = features.width / features.height;
                    var heightRatio = features.height/ features.width;
                    var sizeRatioWidth = size.width / size.height;
                    var sizeRatioHeight = size.height / size.width;

                    /*if (features.width > features.height && features.width > size.width ){
                      img.resize(size.width).interlace('Line').write(path, updateAndSave);

                    }*/

                    if(widthRatio >= sizeRatioWidth && features.width > size.width){
                      img.resize(size.width).interlace('Line').write(path, updateAndSave);
                    }
                    else if(widthRatio < sizeRatioWidth && widthRatio > 1){
                      img.resize(null, size.height).interlace('Line').write(path, updateAndSave);
                    }
                    else if( heightRatio >= sizeRatioHeight && features.height > size.height){
                      img.resize(null, size.height).interlace('Line').write(path, updateAndSave);

                    }
                    else if ( heightRatio < sizeRatioHeight){                      img.resize(size.width).interlace('Line').write(path, updateAndSave);
                    }


                    /*else if(features.width > features.height && features.height > size.height ){
                      img.resize(null, size.height).interlace('Line').write(path, updateAndSave);
                    }*/
                    /*else if (features.height > features.width && features.height > size.height){
                      img.resize(null, size.height).interlace('Line').write(path, updateAndSave);
                    }*/




                    else if (widthRatio == 1  && (features.width > size.width || features.height > size.height)) {
                      if (size.width > size.height){
                        img.resize(null, size.height).interlace('Line').write(path, updateAndSave);
                      }
                      else if (size.height > size.width){
                        img.resize(size.width).interlace('Line').write(path, updateAndSave);
                      }

                    }
                    else {

                      copyPaste();
                    }

                  } else {
                    x = 0;
                    y = 0;
                    widthRatio = features.width / size.width;
                    heightRatio = features.height / size.width;
                    widthNew = size.width;
                    heightNew = size.width;
                    if (heightRatio < widthRatio) {
                      widthNew = (size.width * features.width) / features.height;
                      x = (widthNew - size.width) / 2;
                    }
                    if (heightRatio > widthRatio) {
                      heightNew = (size.width * features.height) / features.width;
                      y = (heightNew - size.width) / 2;
                    }
                    img.resize(widthNew, heightNew).crop(size.width, size.width, x, y).interlace('Line').write(path, updateAndSave);
                  }
                } else {

                  copyPaste();
                }
              });
            });
          });
        });
      });
      return true;
    };
    createThumbnails (Images, fileRef);

    /*var updateAndSave = Meteor.bindEnvironment(function(){
      const upd = {
        $set: {
          "versions.small" : {
            path: cropPath,
            type: fileRef.type,
            extension: fileRef.extension,
          }
        }
      };
      return ImagesGallery.update( fileRef._id, upd );
    });


    const cropPath = ImagesGallery.storagePath+"/"+fileRef._id+"_small_."+fileRef.extension;
    //fileRef.path + "_small_.jpg"
    cropImage = gm(fileRef.path);
    cropImage.resize(120,120).write(cropPath, updateAndSave);*/
  }
});

if (Meteor.isServer) {
  Images.allowClient(); // Deny insert/update/remove from client
  Meteor.publish('files.images.all', function imagesPublication() {
    return Images.collection.find({}, {
      // Publish necessary fields only
      fields: {
        extension: 1,
        _downloadRoute: 1,
        _collectionName: 1,
        versions: 1,
        userId: 1,
      }
    });
  });
}

/*
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
*/

export { Videos, Images};
