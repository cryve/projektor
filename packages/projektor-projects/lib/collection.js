import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { projectSchema } from './schemas.js';


export const Projects = new Mongo.Collection('projects');

if (Meteor.isServer) {
  Meteor.publish('projectsAll', function projectsAllPublication() {
    if (!this.userId) {
      return this.ready();
    }
    return Projects.find({});
  });
  Meteor.publish('projects.all.list', function projectsAllListPublication() {
    return Projects.find({}, {
      fields: {
        _id: 1,
        createdAt: 1,
      },
    });
  });
  Meteor.publish('projects.cards.single', function projectsCardsSinglePublication(projectId) {
    new SimpleSchema({
      projectId: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
      },
    }).validate({ projectId });
    return Projects.find({ _id: projectId }, {
      fields: {
        _id: 1,
        state: 1,
        createdAt: 1,
        title: 1,
        subtitle: 1,
        coverImg: 1,
        deadline: 1,
        beginning: 1,
        tags: 1,
        'team.userId': 1,
        jobs: 1,
      },
    });
  });
  Meteor.publish('projects.details.single', function projectsDetailsSinglePublication(projectId) {
    new SimpleSchema({
      projectId: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
      },
    }).validate({ projectId });
    if (!this.userId) {
      return this.ready();
    }
    return Projects.find(projectId);
  });
  Meteor.publish('userProjects', function userProjectsPublication(userId) {
    new SimpleSchema({
      userId: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
      },
    }).validate({ userId });
    return Projects.find({ team: { $elemMatch: { userId } } });
  });
}


Projects.attachSchema(new SimpleSchema({
  createdAt: {
    type: Date,
    autoValue() {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return { $setOnInsert: new Date() };
      }
      this.unset(); // Prevent user manipulation
    },
  },
  updatedAt: {
    type: Date,
    autoValue() {
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
