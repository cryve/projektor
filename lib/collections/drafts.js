import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Match } from 'meteor/check';
import SimpleSchema from 'simpl-schema';

import { projectSchema } from "./schemas.js";


export const Drafts = new Mongo.Collection('drafts');

Drafts.attachSchema(new SimpleSchema({
  isNewProject: {
    type: Boolean,
    autoValue: function() {
      if (this.isInsert) {
        return true;
      }
    },
  },
  "owner.userId": {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    autoValue: function() {
      if (this.isInsert) {
        return this.userId;
      } else if (this.isUpsert) {
        return {$setOnInsert: this.userId};
      } else {
        this.unset(); // Prevent user manipulation
      }
    },
  },
  title: {
    type: String,
    autoValue: function() {
      if (this.isInsert) {
        return "Unbenanntes Projekt"
      }
    },
  },
}).extend(projectSchema));
