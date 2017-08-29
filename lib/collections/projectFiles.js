import {Drafts} from "/lib/collections/drafts.js";
import {Projects} from "/lib/collections/projects.js";
import SimpleSchema from 'simpl-schema';
import { publishComposite } from 'meteor/reywood:publish-composite';
import lodash from 'lodash';

export const ProjectFiles = new FilesCollection({
  collectionName: 'ProjectFiles',
  allowClientCode: false, // Disallow remove files from Client
  debug: false,
  onBeforeUpload (file) {
    // Allow upload files under 100MB, and only in png/jpg/jpeg formats
    if (file.size <= 1024 * 1024 * 10 && /pdf/i.test(file.extension)) {
      if (Meteor.isServer) {
        if (this.userId) {
          return true;
        }
      } else {
        return true;
      }
    } else {
      $('#uploadSuccess').hide();
      $('#uploadAlert').show();
      // return 'Please upload image, with size equal or less than 10MB';
    }
  },
  onAfterUpload(fileRef) {
    const currentCollection = Mongo.Collection.get(fileRef.meta.collection);
    const projectId = fileRef.meta.projectId;
    currentCollection.update(projectId, { $push: { pdfs: fileRef._id } });
  },
});

const userInProject = (group, userId) => {
  let foundUser = false;
  lodash.forEach(group, function(value) {
    if (lodash.includes(value, userId)) {
      foundUser = true;
      return false;
    }
  });
  return foundUser;
};

if (Meteor.isServer) {
  Meteor.publishComposite('files.projectFiles.single', function filesProjectFilesSingle(projectId) {
    new SimpleSchema({
      projectId: { type: String, regEx: SimpleSchema.RegEx.Id },
    }).validate({ projectId });
    return {
      find() {
        return Projects.find(projectId)
      },
      children: [{
        find(project) {
          // if (!this.userId) {
          //   return this.ready();
          // }
          //
          // if (!userInProject(project.supervisors, this.userId)) {
          //   return this.ready();
          // }
          //
          // if (!userInProject(project.team, this.userId)) {
          //   return this.ready();
          // }
          return ProjectFiles.find(project.pdfs[project.pdfs.length-1]).cursor;
        },
      }],
    };
  });

  Meteor.publishComposite('files.draftFiles.single', function filesDraftFilesSingle(projectId) {
    new SimpleSchema({
      projectId: { type: String, regEx: SimpleSchema.RegEx.Id },
    }).validate({ projectId });
    return {
      find() {
        return Drafts.find(projectId)
      },
      children: [{
        find(project) {
          // if (!this.userId) {
          //   return this.ready();
          // }
          //
          // if (!userInProject(project.supervisors, this.userId) && !userInProject(project.team, this.userId)) {
          //   return this.ready();
          // }
          return ProjectFiles.find(project.pdfs[project.pdfs.length-1]).cursor;
        },
      }],
    };
  });
}
