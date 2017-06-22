import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import lodash from 'lodash';
import { Projects } from './collection.js';
import {
  memberSchema,
  jobSchema,
  supervisorSchema,
  contactSchema,
  teamCommSchema,
} from './schemas.js';

Projects.deleteProject = new ValidatedMethod({
  name: 'projects.deleteProjects',
  validate: new SimpleSchema({
    projectId: String,
  }).validator(),
  run({ projectId }) {
    const project = Projects.findOne(projectId);
    if (!lodash.includes(project.permissions.deleteProject, this.userId)) {
      throw new Meteor.Error('projects.deleteProject.unauthorized',
      'Cannot delete project that is not yours');
    }
    Projects.remove(projectId);
  },
});

Projects.addMemberToProject = new ValidatedMethod({
  name: 'projects.addMember',
  validate: memberSchema.validator(),
  run({ docId, member }) {
    const project = Projects.findOne(docId);
    if (!lodash.includes(project.permissions.manageMembers, this.userId)
      || !lodash.includes(project.permissions.editInfos, this.userId)) {
      throw new Meteor.Error('projects.addMember.unauthorized',
      'You are not allowed to add a member to this project');
    }
    Projects.update(docId, { $push: { team: member } });
    lodash.forEach(member.permissions, function(hasPermission, permissionName) {
      if (hasPermission) {
        const permissionsUpdate = {};
        permissionsUpdate[`permissions.${permissionName}`] = member.userId;
        Projects.update(docId, { $addToSet: permissionsUpdate });
      }
    });
  },
});

Projektor.updateEditableInfoInProject = new ValidatedMethod({
  name: 'projects.updateEditableInfo',
  validate: new SimpleSchema({
    _id: String,
    modifier: {
      type: Object,
      blackbox: true,
    },
  }).validator(),
  run({ modifier, _id }) {
    const project = Projects.findOne(_id);
    if (!lodash.includes(project.permissions.editInfos, this.userId)) {
      throw new Meteor.Error('projects.updateEditableInfo.unauthorized',
      'You are not allowed to edit this info field of the project');
    }
    if (project.courseId && modifier.$set.deadline) {
      if (!lodash.includes(project.permissions.manageCourses, this.userId)) {
        throw new Meteor.Error('projects.updateEditableInfo.unauthorized',
        'You are not allowed to edit course infos in this project');
      }
    }
    Projects.update({ _id }, modifier);
  },
});

Projects.addSupervisorToProject = new ValidatedMethod({
  name: 'projects.addSupervisor',
  validate: supervisorSchema.validator(),
  run({ docId, supervisor }) {
    const project = Projects.findOne(docId);
    if (!lodash.includes(project.permissions.manageMembers, this.userId)
      || !lodash.includes(project.permissions.editInfos, this.userId)) {
      throw new Meteor.Error('projects.addMember.unauthorized',
      'You are not allowed to add a supervisor to this project');
    }
    if (project.courseId && !lodash.includes(project.permissions.manageCourses, this.userId)) {
      throw new Meteor.Error('projects.addMember.unauthorized',
      'You are not allowed to add a supervisor to this course project');
    }
    const user = Users.findOne(supervisor.userId);
    supervisor.role = user.profile.title;
    Projects.update(docId, { $push: { supervisors: supervisor } });
    lodash.forEach(project.permissions, function(value, permissionName) {
      const permissionsUpdate = {};
      permissionsUpdate[`permissions.${permissionName}`] = supervisor.userId;
      Projects.update(docId, { $addToSet: permissionsUpdate });
    });
  },
});

Projektor.addJobToProject = new ValidatedMethod({
  name: 'projects.addJob',
  validate: jobSchema.validator(),
  run({ docId, job }) {
    const project = Projects.findOne(docId);
    if (!lodash.includes(project.permissions.editInfos, this.userId)) {
      throw new Meteor.Error('projects.addJob.unauthorized',
      'You are not allowed to add jobs to this project');
    }
    if (_.findWhere(project.jobs, job)) {
      throw new Meteor.Error('projects.addJob.alreadyExists',
      'You cannot add the same job twice');
    }
    Projects.update(docId, { $push: { jobs: job } });
  },
});

Projektor.addContactToProject = new ValidatedMethod({
  name: 'projects.addContact',
  validate: contactSchema.validator(),
  run({ docId, contact }) {
    const project = Projects.findOne(docId);
    if (!lodash.includes(project.permissions.editInfos, this.userId)) {
      throw new Meteor.Error('projects.addContact.unauthorized',
      'You are not allowed to add contacts to this project');
    }
    if (_.findWhere(project.contacts, contact)) {
      throw new Meteor.Error('projects.addContact.alreadyExists',
      'You cannot add the same contact twice');
    }
    Projects.update(docId, { $push: { contacts: contact } });
  },
});

Projektor.addTeamCommToProject = new ValidatedMethod({
  name: 'projects.addTeamComm',
  validate: teamCommSchema.validator(),
  run({ docId, teamComm }) {
    const project = Projects.findOne(docId);
    if (!lodash.includes(project.permissions.editInfos, this.userId)) {
      throw new Meteor.Error('projets.addTeamComm.unauthorized',
      'You cannot edit project that is not yours');
    }
    if (_.findWhere(project.teamCommunication, teamComm)) {
      throw new Meteor.Error('projects.addTeamComm.alreadyExists',
      'You cannot add the same team communication option twice');
    }
    Projects.update(docId, { $push: { teamCommunication: teamComm } });
  },
});

Projektor.updateEditableSupervisorNotesInProject = new ValidatedMethod({
  name: 'projects.updateEditableSupervisorNotes',
  validate: new SimpleSchema({
    _id: String,
    modifier: {
      type: Object,
      blackbox: true,
    },
  }).validator(),
  run({ modifier, _id }) {
    const project = Projects.findOne(_id);
    const isUserInGroup = (group, userId) => {
      let foundUser = false;
      lodash.forEach(group, function(value) {
        if (lodash.includes(value, userId)) {
          foundUser = true;
          return false; // breaks the loop
        }
      });
      return foundUser;
    };
    if (!isUserInGroup(project.supervisors, this.userId)) {
      throw new Meteor.Error('projects.updateEditableInfo.unauthorized',
      'You are not allowed to edit this supervisor notes in this project');
    }
    Projects.update({ _id }, modifier);
  },
});

Projektor.projektUpdateVideoLink = new ValidatedMethod({
  name: 'projects.updateVideoLink',
  validate: new SimpleSchema({
    _id: String,
    modifier: {
      type: Object,
      blackbox: true,
    },
  }).validator(),
  run({ modifier, _id }) {
    const project = Projects.findOne(_id);
    if (!lodash.includes(project.permissions.editInfos, this.userId)) {
      throw new Meteor.Error('projects.updateVideoLink.unauthorized',
      'You are not allowed to edit gallery of this project');
    }
    return Projects.update({
      _id,
    }, modifier);
  },
});
