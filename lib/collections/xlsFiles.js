import { FilesCollection } from 'meteor/ostrio:files';
import {Drafts} from "/lib/collections/drafts.js";
import {Projects} from "/lib/collections/projects.js";
import { check } from 'meteor/check';


this.XlsFiles = new FilesCollection({collectionName: 'XlsFiles'});
