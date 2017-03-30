import { FilesCollection } from 'meteor/ostrio:files';
import {Drafts} from "/lib/collections/drafts.js";
import {Projects} from "/lib/collections/projects.js";
import { check } from 'meteor/check';

export const XlsFiles = new Meteor.Files({
  debug: false,
  collectionName: 'XlsFiles',
});

if(Meteor.isServer) {
  XlsFiles.denyClient();
  Meteor.publish('files.xlsFiles.all', function xlsFilesPublication() {
    return XlsFiles.collection.find({}, {
      // Publish necessary fields only
      fields: {
        name: 1,
        _downloadRoute: 1,
        _collectionName: 1,
        versions: 1,
        userId: 1,
      }
    });
  });
}

XlsFiles.collection.attachSchema(XlsFiles.schema);
