import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Match } from 'meteor/check';
import SimpleSchema from 'simpl-schema';

var Schema = {};

Schema.UserProfile = new SimpleSchema({
  firstname: String,
  lastname: String,
  fullname: String,
  matricNo: SimpleSchema.Integer,
  role: String,
  title: String,
  gender: String,
  studyCourse: Object,
  "studyCourse.id": SimpleSchema.Integer,
  "studyCourse.departmentId": SimpleSchema.Integer,
  "studyCourse.facultyId": SimpleSchema.Integer,
  aboutMe: {
    type: String,
    optional: true,
  },
  avatar: {
    type: String,
    optional: true,
  },
  skills: {
    type: Array,
    optional: true
  },
  "skills.$": String,
  contacts: {
    type: Array,
    optional: true,
  },
  "contacts.$": Object,
  "contacts.$.medium": String,
  "contacts.$.approach": String,
  links: {
    type: Array,
    optional: true,
  },
  "links.$": Object,
  "links.$.medium": String,
  "links.$.approach": String,
  currentDraftId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
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

if (Meteor.isServer) {
  Meteor.publish("usersAll", function usersAllPublication() {
    return Meteor.users.find();
  });
}

Meteor.users.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});
