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
    type: [Object],
    label: "Bilder hochladen",
    optional: true,
    blackbox: true,
    minCount: 0,
    maxCount: 5,
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
    type: String,
    optional: true,

  },
  "team.$.role": {
    type: String,
    label: "Aufgaben",
    optional: true,
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
    regEx: SimpleSchema.RegEx.Url,
  },
  "teamCommunication.$.isPrivate": {
    type: Boolean,
    label: "Link nur für Mitglieder",
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

ProjectDrafts.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

// Meteor.methods({
//   "projectDrafts.insert"(projectDraft) {
//     ProjectDrafts.insert(projectDraft);
//   },
//   "projectDrafts.remove"(projectDraftId) {
//     ProjectDrafts.remove(projectDraftId);
//   },
//   "projectDrafts.setMedia"(projectId, newMedia) {
//     ProjectDrafts.update(projectId, {$set: {media: newMedia}});
//   },
//   "projectDrafts.setCoverImg"(projectId, newCoverImg) {
//     ProjectDrafts.update(projectId, {$set: {coverImg: newCoverImg}});
//   },
//   "projectDrafts.updateTeam" (projectId, newTeam) {
//     ProjectDrafts.update(projectId, {$set: {team: newTeam}});
//   },
//   "projectDrafts.updateJobs" (projectId, newJobs) {
//     ProjectDrafts.update(projectId, {$set: {jobs: newJobs}});
//   },
// });
