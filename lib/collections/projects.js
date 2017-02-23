import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { projectSchema } from "./schemas.js";

export const Projects = new Mongo.Collection('projects');

if(Meteor.isServer) {
  Meteor.publish("projects", function projectsPublication() {
    return Projects.find();
  });
}

Projects.attachSchema(new SimpleSchema({
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
  },
}).extend(projectSchema));

Projects.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});
