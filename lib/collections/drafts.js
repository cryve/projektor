import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Match } from 'meteor/check';
import SimpleSchema from 'simpl-schema';

import { projectSchema } from "./schemas.js";


export const Drafts = new Mongo.Collection('drafts');

if(Meteor.isServer) {
  Meteor.publish("drafts", function draftsPublication() {
    return Drafts.find();
  });
}

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
  editableBy: {
    type: Array,
    autoValue: function () {
      if(this.isInsert) {
        console.log("editableBy:", this.userId);
        return [this.userId];
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
