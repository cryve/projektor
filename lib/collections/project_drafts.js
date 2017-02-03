import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Match } from 'meteor/check';


export const ProjectDrafts = new Mongo.Collection('projectDrafts');

if(Meteor.isServer) {
  Meteor.publish("projectDrafts", function projectDraftsPublication() {
    return ProjectDrafts.find();
  });
}

ProjectDrafts.attachSchema(new SimpleSchema({
  isNewProject: {
    type: String,
    label: "New-Project",
    autoValue: function() {
      if (this.isInsert) {
        return "new";
      }
    },
  },
  title: {
    type: String,
    label: "Projekt-Titel",
    max: 40,
    autoValue: function() {
      if (this.isInsert) {
        return "Unbenanntes Projekt"
      }
    },
  },
  subtitle: {
    type: String,
    label: "UntertitelTest",
    optional: true,
    max: 200
  },
  coverImg: {
    type: String,
    label: "Image-Cover",
    optional: true,
    max: 200
  },
   media: {
    type: Array,
    label: "Bilder hochladen",
    optional: true,
  },
  "media.$": {
    type: Object,
    label:"test2",
    blackbox: true,
    optional: true,
  },
  "media.$.type": {
    type: String,
    label: "type",
  },
  "media.$.id": {
    type: String,
    label: "id",
  },
  description: {
    type: String,
    label: "Beschreibung",
    max: 500,
    optional: true,
  },
  deadline: {
    type: Date,
    label: "Deadline",
    optional: true
  },
  tags: {
    type: [String],
    label: "Tags",
    optional: true,
  },
  team: {
    type: Array,
    label: "Mitglied",
    optional: true,
  },
  "team.$": {
    type: Object,
  },
  "team.$.userId": {
    type: String,
    label: "Name",
  },
  "team.$.userName": {
    type: String,
    optional: true,

  },
  "team.$.role": {
    type: String,
    label: "Aufgaben",
    optional: true,
  },
  teamCommunication: {
    type: Array,
    label: "Team-Kommunikation",
    optional: true,
  },
  "teamCommunication.$": {
    type: Object,
  },
  "teamCommunication.$.medium": {
    type: String,
    label: "Kommunikationsmittel",
  },
  "teamCommunication.$.url": {
    type: String,
    label: "Link",
    regEx: SimpleSchema.RegEx.Url,
  },
  "teamCommunication.$.isPrivate": {
    type: Boolean,
    label: "Link nur für Mitglieder",
  },
  jobs: {
    type: Array,
    label: "Offene Jobs",
    optional: true
  },
  "jobs.$": {
    type: Object,
  },
  "jobs.$.joblabel": {
    type: String,
    label: "Gesuchte Fähigkeit",
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
  occasions: {
    type: Array,
    label: "Projektanlass",
    optional: true,
  },
  "occasions.$": {
    type: String,
    label: "Vorlesung/Seminar/Schein/Motivation",
  },
  supervisors: {
    type: Array,
    label: "Betreuer",
    optional: true,
  },
  "supervisors.$": {
    type: String,
    label: "Name",
  },
  owner: {
    type: Object,
  },
  "owner.userId": {
    type: String,
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
  "owner.wholeName": {
    type: String,
    autoValue: function() {
      if (this.isInsert) {
        var user = Meteor.users.findOne({_id: this.userId});
        return user && user.profile.firstname + " " + user.profile.lastname;
      } else if (this.isUpsert) {
        var user = Meteor.users.findOne({_id: this.userId});
        user = user && user.profile.firstname + " " + user.profile.lastname;
        return {$setOnInsert: user};
      } else {
        this.unset(); // Prevent user manipulation
      }
    },
  },
  ownerRole: {
    type: String,
    label: "Aufgaben",
    optional: true,
  },
}));
