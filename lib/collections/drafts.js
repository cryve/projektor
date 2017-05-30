import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Match } from 'meteor/check';
import SimpleSchema from 'simpl-schema';
import lodash from 'lodash';

import { projectSchema } from './schemas.js';

export const Drafts = new Mongo.Collection('drafts');

if (Meteor.isServer) {
  Meteor.publish('drafts', function draftsPublication() {
    return Drafts.find();
  });
  Meteor.publish('singleUserDraft', function userDraftsPublication(userId) {
    const user = Meteor.users.findOne(userId);
    const userDraftId = user && lodash.find(user.profile.drafts, function(draft) {
      return !draft.courseId;
    });
    console.log('userDraftID', userDraftId);
    return userDraftId && Drafts.find(userDraftId.draftId);
  });
  Meteor.publishComposite('singleUserCourseDraft', function userCourseDraftsPublication(courseId) {
    new SimpleSchema({
      courseId: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
      },
    }).validate({ courseId });

    return {
      find() {
        return Meteor.users.find(this.userId);
      },
      children: [{
        find(user) {
          const userDraftId = user && lodash.find(user.profile.drafts, function(draft) {
            return draft.courseId == courseId;
          });
          return userDraftId && Drafts.find(userDraftId.draftId);
        },
      }],
    };
  });
  Meteor.publish('singleDraft', function singleDraftPublication(draftId) {
    if (!this.userId) {
      return this.ready();
    }
    new SimpleSchema({
      draftId: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
      },
    }).validate({ draftId });
    // TODO: Check if draft belongs to current user
    return Drafts.find(draftId);
  });
}

Drafts.attachSchema(new SimpleSchema({
  isNewProject: {
    type: Boolean,
    autoValue() {
      if (this.isInsert) {
        return true;
      }
    },
  },
  // "owner.userId": {
  //   type: String,
  //   regEx: SimpleSchema.RegEx.Id,
  //   autoValue: function() {
  //     if (this.isInsert) {
  //       return this.userId;
  //     } else if (this.isUpsert) {
  //       return {$setOnInsert: this.userId};
  //     } else {
  //       this.unset(); // Prevent user manipulation
  //     }
  //   },
  // },
  'permissions.editInfos': {
    type: Array,
    autoValue () {
      if (this.isInsert) {
        return [this.userId];
      }
    },
  },
  'permissions.manageMembers': {
    type: Array,
    autoValue () {
      if (this.isInsert) {
        return [this.userId];
      }
    },
  },
  'permissions.manageCourses': {
    type: Array,
    autoValue () {
      if (this.isInsert) {
        return [this.userId];
      }
    },
  },
  'permissions.deleteProject': {
    type: Array,
    autoValue () {
      if (this.isInsert) {
        return [this.userId];
      }
    },
  },
  title: {
    type: String,
    autoValue() {
      if (this.isInsert) {
        return 'Unbenanntes Projekt';
      }
    },
  },
  team: {
    type: Array,
    autoValue() {
      if (this.isInsert && (Meteor.user().profile.role == 'Student')) {
        return [{
          userId: this.userId,
          role: 'Projektleitung',
          permissions: {
            editInfos: true,
            manageMembers: true,
            manageCourses: true,
            deleteProject: true,
          },
        }];
      }
    },
  },
}).extend(projectSchema));
