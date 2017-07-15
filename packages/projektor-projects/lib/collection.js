import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { projectSchema } from './schemas.js';


export const Projects = new Mongo.Collection('projects');

Projects.memberFields = {
  _id: 1,
  state: 1,
  createdAt: 1,
  isNewProject: 1,
  permissions: 1,
  title: 1,
  subtitle: 1,
  description: 1,
  coverImg: 1,
  media: 1,
  deadline: 1,
  beginning: 1,
  pdfs: 1,
  notes: 1,
  tags: 1,
  team: 1,
  supervisors: 1,
  jobs: 1,
  contacts: 1,
  teamCommunication: 1,
  occasions: 1,
};

Projects.supervisorFields = Projects.memberFields;
Projects.supervisorFields.notes = 1;

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
    // TODO: publish supervisorFields only for project supervisors
    return Projects.find(projectId, {
      fields: Projects.supervisorFields,
    });
  });
  Meteor.publish('userProjects', function userProjectsPublication(userId) {
    new SimpleSchema({
      userId: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
      },
    }).validate({ userId });
    return Projects.find({ team: { $elemMatch: { userId } } }, {
      fields: Projects.memberFields,
    });
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
