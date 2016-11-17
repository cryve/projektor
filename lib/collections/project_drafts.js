import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Match } from 'meteor/check';


export const ProjectDrafts = new Mongo.Collection('projectDrafts');

ProjectDrafts.attachSchema(new SimpleSchema({
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
  pictures: {
    type: [String],
    label: "Bilder hochladen",
    optional: true,
  },
  "pictures.$": {
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
  "jobs.$.title": {
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
  "owner.role": {
    type: String,
    label: "Aufgaben",
    autoValue: function() {
      if (this.isInsert) {
        return ""
      }
    }
  },
}));
