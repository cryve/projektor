import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import lodash from 'lodash';
import { Projects } from './collection.js';
import { Drafts } from './collections/drafts.js';
import {
  memberSchema,
  jobSchema,
  supervisorSchema,
  contactSchema,
  teamCommSchema,
} from './schemas.js';

Projects.publishDraft = new ValidatedMethod({
  name: 'projects.publishDraft',
  validate: new SimpleSchema({
    draftId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
    },
  }).validator(),
  run({ draftId }) {
    const draft = Drafts.findOne(draftId);
    if (!lodash.includes(draft.permissions.editInfos, this.userId)
    || !lodash.includes(draft.permissions.manageMembers, this.userId)
    || !lodash.includes(draft.permissions.manageCourses, this.userId)
    || !lodash.includes(draft.permissions.deleteProject, this.userId)) {
      throw new Meteor.Error('projects.publishDraft.unauthorized',
        'Cannot publish draft that is not yours');
    }
    return Projects.insert(draft);
  },
});

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

Drafts.addMemberToDraft = new ValidatedMethod({
  name: 'drafts.addMember',
  validate: memberSchema.validator(),
  run({ docId, member }) {
    const draft = Drafts.findOne(docId);
    if (!lodash.includes(draft.permissions.manageMembers, this.userId)
      || !lodash.includes(draft.permissions.editInfos, this.userId)) {
      throw new Meteor.Error('drafts.addMember.unauthorized',
      'You are not allowed to add a member to this draft');
    }
    Drafts.update(docId, { $push: { team: member } });
    lodash.forEach(member.permissions, function(hasPermission, permissionName) {
      if (hasPermission) {
        const addObj = {};
        addObj[`permissions.${permissionName}`] = member.userId;
        Drafts.update(docId, { $addToSet: addObj });
      }
    });
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

Drafts.updateEditableInfoInDraft = new ValidatedMethod({
  name: 'drafts.updateEditableInfo',
  validate: new SimpleSchema({
    _id: String,
    modifier: {
      type: Object,
      blackbox: true,
    },
  }).validator(),
  run({ modifier, _id }) {
    const draft = Drafts.findOne(_id);
    if (!lodash.includes(draft.permissions.editInfos, this.userId)) {
      throw new Meteor.Error('drafts.updateEditableInfo.unauthorized',
      'You are not allowed to edit this info field of the draft');
    }
    if (draft.courseId && modifier.$set.deadline) {
      if (!lodash.includes(draft.permissions.manageCourses, this.userId)) {
        throw new Meteor.Error('drafts.updateEditableInfo.unauthorized',
        'You are not allowed to edit course infos in this draft');
      }
    }
    Drafts.update({ _id }, modifier);
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

Drafts.addJobToDraft = new ValidatedMethod({
  name: 'drafts.addJob',
  validate: jobSchema.validator(),
  run({ docId, job }) {
    const draft = Drafts.findOne(docId);
    if (!lodash.includes(draft.permissions.editInfos, this.userId)) {
      throw new Meteor.Error('drafts.addJob.unauthorized',
      'You are not allowed to add jobs to this draft');
    }
    if (_.findWhere(draft.jobs, job)) {
      throw new Meteor.Error('drafts.addJob.alreadyExists',
      'You cannot add the same job twice');
    }
    Drafts.update(docId, { $push: { jobs: job } });
  },
});

Drafts.addContactToDraft = new ValidatedMethod({
  name: 'drafts.addContact',
  validate: contactSchema.validator(),
  run({ docId, contact }) {
    const draft = Drafts.findOne(docId);
    if (!lodash.includes(draft.permissions.editInfos, this.userId)) {
      throw new Meteor.Error('drafts.addContact.unauthorized',
      'You are not allowed to add contacts to this draft');
    }
    if (_.findWhere(draft.contacts, contact)) {
      throw new Meteor.Error('drafts.addContact.alreadyExists',
      'You cannot add the same contact twice');
    }
    Drafts.update(docId, { $push: { contacts: contact } });
  },
});

Drafts.addTeamCommToDraft = new ValidatedMethod({
  name: 'drafts.addTeamComm',
  validate: teamCommSchema.validator(),
  run({ docId, teamComm }) {
    const draft = Drafts.findOne(docId);
    if (!lodash.includes(draft.permissions.editInfos, this.userId)) {
      throw new Meteor.Error('drafts.addTeamComm.unauthorized',
      'You cannot edit draft that is not yours');
    }
    if (_.findWhere(draft.teamCommunication, teamComm)) {
      throw new Meteor.Error('drafts.addTeamComm.alreadyExists',
      'You cannot add the same team communication option twice');
    }
    Drafts.update(docId, { $push: { teamCommunication: teamComm } });
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

Drafts.updateEditableSupervisorNotesInDraft = new ValidatedMethod({
  name: 'drafts.updateEditableSupervisorNotes',
  validate: new SimpleSchema({
    _id: String,
    modifier: {
      type: Object,
      blackbox: true,
    },
  }).validator(),
  run({ modifier, _id }) {
    const draft = Drafts.findOne(_id);
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
    if (!isUserInGroup(draft.supervisors, this.userId)) {
      throw new Meteor.Error('drafts.updateEditableInfo.unauthorized',
      'You are not allowed to edit this supervisor notes in this draft');
    }
    Drafts.update({ _id }, modifier);
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

Drafts.insertEmptyDraft = new ValidatedMethod({
  name: 'drafts.insertEmptyDraft',
  validate: new SimpleSchema({}).validator(),
  run() {
    if (!this.userId) {
      throw new Meteor.Error('drafts.insertNew.unauthorized',
        'Cannot insert new draft because you are not logged in');
    }
    if (Meteor.user().profile.role == 'Mitarbeiter') {
      return Drafts.insert({ supervisors: [{ userId: this.userId, role: Meteor.user().profile.title }] });
    }
    return Drafts.insert({});
  },
});
