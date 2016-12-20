import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Match } from 'meteor/check';

var Schema = {};

Schema.UserProfile = new SimpleSchema({
  firstname: {
    type: String,
    label: 'First Name',
    optional: true,

  },
  lastname: {
    type: String,
    label: 'Last Name',
    optional: true,

  },
  study: {
    type: String,
    label: 'study',
    optional: true,

  },
  aboutMe: {
    type: String,
    label: 'aboutMe',
    optional: true,

  },
  avatar: {
    type: String,
    label: 'Phone Number',
    optional: true,

  },
  skills: {
    type: Array,
    label: "skills",
    optional: true
  },
  "skills.$": {
    type: String,
    label: "Meine Skills",
  },
  contacts: {
    type: Array,
    label: "Mitmachen",
    optional: true,
  },
  "contacts.$": {
    type: Object
  },
  "contacts.$.medium": {
    type: String,
    label: "Kommunikationsmittel"
  },
  "contacts.$.approach": {
    type: String,
    label: "Infos zur Kontaktaufnahme"
  },
  links: {
    type: Array,
    label: "Link",
    optional: true,
  },
  "links.$": {
    type: Object
  },
  "links.$.medium": {
    type: String,
    label: "Kommunikationsmittel"
  },
  "links.$.approach": {
    type: String,
    label: "Infos zur Page"
  },
});


Schema.User = new SimpleSchema({
  username: {
        type: String,
        // For accounts-password, either emails or username is required, but not both. It is OK to make this
        // optional here because the accounts-password package does its own validation.
        // Third-party login packages may not require either. Adjust this schema as necessary for your usage.
        optional: true
    },
  createdAt: {
    type: Date
  },
  profile: {
    type: Schema.UserProfile,
    optional: true
  },
  services: {
    type: Object,
    optional: true,
    blackbox: true
  }
});
Meteor.users.attachSchema(Schema.User);

/* export const Profiles = new Mongo.Collection('profiles');


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
})); */
