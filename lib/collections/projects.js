import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Match } from 'meteor/check';


export const Projects = new Mongo.Collection('projects');



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
    type: Array,
    label: "Media",
    optional: true,
  },
  "media.$": {
     type: Object,
    blackbox: true,
     label:"test1",
  },
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
  "team.$.role": {
    type: String,
    label: "Aufgaben",
    optional: true,
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
  },
  "teamCommunication.$.isPrivate": {
    type: Boolean,
    label: "Link nur für Mitglieder",
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
    label: "Projektleiter"
  },
  "owner.userId": {
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
