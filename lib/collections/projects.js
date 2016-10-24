import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Match } from 'meteor/check';


export const Projects = new Mongo.Collection('projects');

Projects.attachSchema(new SimpleSchema({
  title: {
    type: String,
    label: "Projekt-Titel",
    max: 40
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
  pictures: {
    type: [String],
    label: "Bilder hochladen",
    optional: true,
  },
  "pictures.$": {
     autoform: {
      afFieldInput: {
        type: "fileUpload",
        collection: "ImagesGallery",
      },
    },
  },
  description: {
    type: String,
    label: "Beschreibung",
    max: 500
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
    autoform: {
      type: "tags",
      afFieldInput: {
        maxTags: 10, // max 10 tags allowed
        maxChars: 20, // max 10 chars per tag allowed
        trimValue: true, // removes whitespace around a tag
      }
    }
  },
  team: {
    type: Array,
    label: "Team",
    optional: true,
  },
  "team.$": {
    type: Object,
  },
  "team.$.userId": {
    type: String,
    label: "Mitglied",
  },
  "team.$.role": {
    type: String,
    label: "Aufgaben",
  },
  jobs: {
    type: Array,
    label: "Offene Jobs",
    optional: true
  },
  "jobs.$": {
    type: String,
    label: "Jobbeschreibung",
  },
  contact: {
    type: String,
    label: "Mitmachen"
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
    autoform: {
      type: "typeahead",
      options: {
        "member1": "Peter Soltau",
        "member2": "Gudrun Sued",
        "member3": "Guelcan Schroter",
        "member4": "Samson Gerlach",
      },
    },
  },
  owner: {
    type: Object,
    autoform: {
      omit: true,
    },
  },
  "owner.userId": {
    type: String,
    /*
    autoValue: function() {
      if (this.isInsert) {
        return this.userId;
      } else if (this.isUpsert) {
        return {$setOnInsert: this.userId};
      } else {
        this.unset(); // Prevent user manipulation
      }
    },
    */
  },
  "owner.role": {
    type: String,
    label: "Aufgaben",
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


Meteor.methods({
    "projects.incrementLikes"(projectId) {
      check(projectId, String);

      const project = Projects.findOne(projectId);
      Projects.update(project, {$inc: { likes: 1}});
    }
});
