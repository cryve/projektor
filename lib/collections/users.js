import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Match } from 'meteor/check';



export const Profiles = new Mongo.Collection('profiles');


Profiles.attachSchema(new SimpleSchema({
  firstName: {
    type: String,
    label: "Vorname",
    max: 40
  },
  secondName: {
    type: String,
    label: "Nachname",
    optional: true,
    max: 200
  },
  profilePicture: {
    type: [String],
    label: "Bilder hochladen",
    optional: true,
  },
  "profilePicture.$": {
     autoform: {
      afFieldInput: {
        type: "fileUpload",
        collection: "Images",
      },
    },
  },
  age: {
    type: String,
    label: "Alter",
    max: 500
  },
  
  skills: {
    type: [String],
    label: "Fähigkeiten",
    optional: true,
    autoform: {
      type: "tags",
      afFieldInput: {
        maxTags: 10, // max 10 tags allowed
        maxChars: 20, // max 10 chars per tag allowed
        trimValue: true, // removes whitespace around a tag
      }
    }
  },
  
  createdAt: {
    type: Date,
    autoValue: function() {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return {$setOnInsert: new Date()};
      } else {
        this.unset(); // Prevent user manipulation
      }
    },
    autoform: {
      omit: true,
    },
  },
  updatedAt: {
    type: Date,
    autoValue: function() {
      if (this.isUpdate) {
        return new Date();
      }
    },
    denyInsert: true, // Prevent setting on insert
    optional: true,
    autoform: {
      omit: true,
    },
  }
}));
