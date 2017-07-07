import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Match } from 'meteor/check';
import SimpleSchema from 'simpl-schema';
import lodash from 'lodash';

import { projectSchema } from './schemas.js';

export const Drafts = new Mongo.Collection('drafts');

if (Meteor.isServer) {
  Meteor.publish('singleUserDraft', function userDraftsPublication(userId) {
    if (userId === this.userId) {
      const user = Meteor.users.findOne(userId);
      if (user) {
        const userDraftId = user && lodash.find(user.profile.drafts, function(draft) {
          return !draft.courseId;
        });
        if (userDraftId) {
          return Drafts.find(userDraftId.draftId);
        }
      }
    }

    return this.ready();
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
          if(userDraftId) {
            return Drafts.find(userDraftId.draftId);
          } else {
            return this.ready();
          }
        },
      }],
    };
  });

  Meteor.publish('singleDraft', function singleDraftPublication(draftId) {
    new SimpleSchema({
      draftId: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
      },
    }).validate({ draftId });

    const isDraftFromUser = (draftId, userId) => {
      const user = Meteor.users.findOne(userId);
      if (user) {
        const userDrafts = user.profile.drafts;
        if (draftId) {
          return lodash.find(user.profile.drafts, function(userDraft) {
            return userDraft.draftId === draftId;
          });
        }
      }
      return false;
    };

    if (!this.userId || !isDraftFromUser(draftId, this.userId)) {
      return this.ready();
    }
    console.log("test4");
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
  },
}).extend(projectSchema));
