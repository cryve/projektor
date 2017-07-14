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

Projects.insertNewDraft = new ValidatedMethod({
  name: 'projects.insertNewDraft',
  validate: null,
  run() {
    if (!this.userId) {
      throw new Meteor.Error('projects.insertNewDraft.notLoggedIn',
        'Cannot insert new project draft because you are not logged in');
    }
    const draftsFromUser = Meteor.user().profile.drafts;
    if (draftsFromUser && draftsFromUser.length > 0) {
      throw new Meteor.Error('projects.insertNewDraft.alreadyExists');
    }

    const projectDraft = {
      title: 'Unbenanntes Projekt',
      state: {
        public: false,
        draft: true,
      },
      permissions: {
        editInfos: [this.userId],
        manageMembers: [this.userId],
        deleteProject: [this.userId],
      },
      team: [{
        userId: this.userId,
        role: 'Projektleitung',
        permissions: {
          editInfos: true,
          manageMembers: true,
          deleteProject: true,
        },
      }],
    };
    const projectId = Projects.insert(projectDraft);
    return projectId;
  },
});

Projects.makePublic = new ValidatedMethod({
  name: 'projects.makePublic',
  validate: new SimpleSchema({
    projectId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
    },
  }).validator(),
  run({ projectId }) {
    const project = Projects.findOne(projectId);
    if (!lodash.includes(project.permissions.editInfos, this.userId)
    || !lodash.includes(project.permissions.manageMembers, this.userId)
    || !lodash.includes(project.permissions.deleteProject, this.userId)) {
      throw new Meteor.Error('projects.makePublic.unauthorized',
        'Cannot publish draft that is not yours');
    }
    return Projects.update(projectId, { $set: { 'state.draft': false, 'state.public': true }});
  },
});

Projects.delete = new ValidatedMethod({
  name: 'projects.delete',
  validate: new SimpleSchema({
    projectId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
    },
  }).validator(),
  run({ projectId }) {
    if (!this.userId) {
      throw new Meteor.Error('projects.delete.notLoggedIn',
        'Cannot delete project draft because you are not logged in');
    }
    const project = Projects.findOne(projectId);
    if (!lodash.includes(project.permissions.deleteProject, this.userId)) {
      throw new Meteor.Error('projects.delete.unauthorized',
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

Projects.updateEditableInfoInProject = new ValidatedMethod({
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


Projects.addJobToProject = new ValidatedMethod({
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

Projects.addContactToProject = new ValidatedMethod({
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

Projects.addTeamCommToProject = new ValidatedMethod({
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


Projects.updateEditableSupervisorNotesInProject = new ValidatedMethod({
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

Projects.projektsetGalleryItemVideoUrl = new ValidatedMethod({
  name: 'projects.setGalleryItemVideoUrl',
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
      throw new Meteor.Error('projects.setGalleryItemVideoUrl.unauthorized',
      'You are not allowed to edit gallery of this project');
    }
    return Projects.update({
      _id,
    }, modifier);
  },
});
