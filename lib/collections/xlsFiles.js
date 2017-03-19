import { FilesCollection } from 'meteor/ostrio:files';
import {Drafts} from "/lib/collections/drafts.js";
import {Projects} from "/lib/collections/projects.js";
import { check } from 'meteor/check';


export const XlsFiles = new Meteor.Files({
  debug: true,
  collectionName: 'XlsFiles',
});

