import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

import { ProjectDrafts } from '/lib/collections/project_drafts.js';


export const Projects = new Mongo.Collection('projects');

if(Meteor.isServer) {
  Meteor.publish("projects", function projectsPublication() {
    return Projects.find();
  });
}

Projects.attachSchema(new SimpleSchema({
  title: {
    type: String,
    label: "Projekt-Title",
    max: 40,
  },
  coverImg: {
    type: String,
    label: "Image-Cover",
    optional: true,
    max: 200
  },
  subtitle: {
    type: String,
    label: "UntertitelTest",
    optional: true,
    max: 200
  },
  media: {
    type: [Object],
    label: "Bilder hochladen",
    optional: true,
    blackbox: true,
    minCount: 0,
    maxCount: 5
 },
  // "media.$": {
  //    type: Object,
  //   blackbox: true,
  //    label:"test1",
  // },
  "media.$.type": {
    type: String,
    label: "Type",
  },
  "media.$.id": {
    type: String,
    label: "ID",
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
  beginning: {
    type: Date,
    label: "Deadline",
    optional: true
  },
  tags: {
    type: [String],
    label: "Tags",
    optional: true,
    minCount: 0,
    maxCount: 10,
  },
  team: {
    type: [Object],
    label: "Mitglied",
    optional: true,
    minCount: 0,
    maxCount: 20,
  },
  "team.$.userId": {
    type: String,
    label: "Name",
  },
  "team.$.userName": {
    optional: true,
    type: String,
  },
  "team.$.role": {
    type: String,
    label: "Aufgaben",
    optional: true,
  },
  jobs: {
    type: [Object],
    label: "Offene Jobs",
    optional: true,
    minCount: 0,
    maxCount: 10,
  },
  "jobs.$.joblabel": {
    type: String,
    label: "Gesuchte Fähigkeit",
  },
  contacts: {
    type: [Object],
    label: "Mitmachen",
    optional: true,
    minCount: 0,
    maxCount: 10,
  },
  "contacts.$.medium": {
    type: String,
    label: "Kommunikationsmittel"
  },
  "contacts.$.approach": {
    type: String,
    label: "Infos zur Kontaktaufnahme"
  },
  teamCommunication: {
    type: [Object],
    label: "Team-Kommunikation",
    optional: true,
    minCount: 0,
    maxCount: 10,
  },
  "teamCommunication.$.medium": {
    type: String,
    label: "Kommunikationsmittel",
  },
  "teamCommunication.$.url": {
    type: String,
    label: "Link",
  },
  "teamCommunication.$.isPrivate": {
    type: Boolean,
    label: "Link nur für Mitglieder",
  },
  occasions: {
    type: [String],
    label: "Projektanlass",
    optional: true,
    minCount: 0,
    maxCount: 10,
  },
  supervisors: {
    type: [String],
    label: "Betreuer",
    optional: true,
    minCount: 0,
    maxCount: 10,
  },
  owner: {
    type: Object,
    label: "Projektleiter"
  },
  "owner.userId": {
    type: String,
  },
  "owner.wholeName": {
    type: String,
  },
  ownerRole: {
    type: String,
    label: "Aufgaben des Projektleiters",
    optional: true,
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
  }
}));

Projects.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});


