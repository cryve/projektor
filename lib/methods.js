import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';

import { Images } from 'meteor/projektor:files';
import { Projects } from 'meteor/projektor:projects';
import Users from 'meteor/projektor:users';

import SimpleSchema from 'simpl-schema';
import lodash from 'lodash';

import { supervisorSchema } from '/lib/collections/schemas.js';


export const addSupervisorToDraft = new ValidatedMethod({
  name: 'drafts.addSupervisor',
  validate: supervisorSchema.validator(),
  run({ docId, supervisor }) {
    const draft = Drafts.findOne(docId);

    if (!lodash.includes(draft.permissions.manageMembers, this.userId)
      || !lodash.includes(draft.permissions.editInfos, this.userId)) {
      throw new Meteor.Error('drafts.addSupervisor.unauthorized',
      'You are not allowed to add a supervisor to this draft');
    }

    const supervisorUser = Users.findOne(supervisor.userId);
    supervisor.role = supervisorUser.profile.title;

    Drafts.update(draft._id, { $push: { supervisors: supervisor } });
    lodash.forEach(draft.permissions, function(permittedUsersIds, permissionName) {
      const permissionsModifier = {};
      permissionsModifier[`permissions.${permissionName}`] = supervisor.userId;
      Drafts.update(draft._id, { $addToSet: permissionsModifier });
    });
  },
});

export const deleteEditableArrayItem = new ValidatedMethod({
  name: 'editable.deleteArrayItem',
  validate: new SimpleSchema({
    collectionName: {
      type: String,
      allowedValues: ['drafts', 'projects', 'users'],
    },
    docId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
    },
    arrayField: {
      type: String,
    },
    item: {
      type: Object,
      blackbox: true,
    },
  }).validator(),
  run({ collectionName, docId, arrayField, item }) {
    const currentCollection = Mongo.Collection.get(collectionName);
    const doc = currentCollection.findOne(docId);

    if (lodash.includes(['teamCommunication', 'jobs', 'contacts'], arrayField)) {
      if (!lodash.includes(doc.permissions.editInfos, this.userId)) {
        throw new Meteor.Error(`${collectionName}.editable.deleteArrayItem.unauthorized`,
        `You are not allowed to delete items from ${arrayField} in this document.`);
      }
    } else if (lodash.includes(['profile.contacts', 'profile.links'], arrayField)) {
      if (doc._id != this.userId) {
        throw new Meteor.Error(`${collectionName}.editable.deleteArrayItem.unauthorized`,
        'You are not allowed to edit profile that is not yours.');
      }
    } else if (lodash.includes(['team', 'supervisors'], arrayField)) {
      const adminMembers = () => lodash.filter(doc.team, function(member) {
        return member.permissions.editInfos && member.permissions.manageMembers
            && member.permissions.deleteProject;
      });
      const isUserAdminMember = (team, userId) => {
        const member = lodash.find(team, function(member) {
          return member.userId == userId;
        });
        if (member && member.permissions.editInfos && member.permissions.manageMembers
          && member.permissions.deleteProject) {
          return true;
        }
        return false;
      };
      const isUserInGroup = (group, userId) => {
        let isInGroup = false;
        lodash.forEach(group, function(value) {
          if (lodash.includes(value, userId)) {
            isInGroup = true;
            return false; // break forEach loop
          }
        });
        return isInGroup;
      };

      if (arrayField === 'team') {
        if (this.userId === item.userId) {
          if (doc.isNewProject && !isUserInGroup(doc.supervisors, this.userId)) {
            throw new Meteor.Error(`drafts.editable.deleteArrayItem.${arrayField}.leaveDraftImpossible`,
            'You cannot leave your own draft');
          }
          if (isUserAdminMember(doc.team, this.userId) && adminMembers().length === 1
          && (!doc.supervisors || doc.supervisors.length === 0)) {
            throw new Meteor.Error(`${collectionName}.editable.deleteArrayItem.lastAdmin`,
            `You cannot leave ${arrayField} because you are the only member with all permissions.`);
          }
        } else if (!lodash.includes(doc.permissions.manageMembers, this.userId)) {
          throw new Meteor.Error(`${collectionName}.editable.deleteArrayItem.unauthorized`,
            `You are not allowed to delete member from ${arrayField} in this document.`);
        }
      }
      if (arrayField === 'supervisors') {
        if (this.userId === item.userId) {
          if (doc.isNewProject && !isUserInGroup(doc.team, this.userId)) {
            throw new Meteor.Error(`editable.deleteArrayItem.${arrayField}.leaveDraftImpossible`,
            'You cannot leave your own draft');
          }
          if (doc.supervisors.length === 1 && adminMembers().length === 0) {
            throw new Meteor.Error(`${collectionName}.editable.deleteArrayItem.lastAdmin`,
            `You cannot leave ${arrayField} because you are the only member with all permissions.`);
          }
        } else if (!lodash.includes(doc.permissions.manageMembers, this.userId)) {
          throw new Meteor.Error(`${collectionName}.editable.deleteArrayItem.unauthorized`,
            `You are not allowed to delete member from ${arrayField} in this document.`);
        }
      }
    } else {
      throw new Meteor.Error(`${collectionName}.editable.deleteArrayItem.missingPermissionCheck`,
      `Please provide permissions checks to let only the right users delete items from ${arrayField}`);
    }

    const arrayModifier = {};
    arrayModifier[arrayField] = item;
    currentCollection.update(docId, { $pull: arrayModifier });

    if (lodash.includes(['team', 'supervisors'], arrayField)) {
      updateProjectPermissions.call({
        collectionName,
        docId,
      }, (err, res) => {
        if (err) {
          console.log(err);
        }
      });
    }
  },
});

export const deleteAvatarFromUser = new ValidatedMethod({
  name: 'users.deleteAvatarFromUser',
  validate: new SimpleSchema({
    userId: String,
  }).validator(),
  run({ userId }) {
    if (userId !== this.userId) {
      throw new Meteor.Error('users.deleteAvatarFromUser.unauthorized',
      'You cannot delete avatar from profile that is not yours');
    }

    const user = Users.findOne(userId);
    Images.remove({ _id: user.profile.avatar });
    Users.update({ _id: user._id }, { $unset: { 'profile.avatar': '' } });
  },
});

export const updateMemberInDraft = new ValidatedMethod({
  name: 'drafts.updateMember',
  validate: new SimpleSchema({
    _id: String,
    modifier: {
      type: Object,
      blackbox: true,
    },
  }).validator(),
  run({ modifier, _id }) {
    const draft = Drafts.findOne(_id);

    if (!lodash.includes(draft.permissions.manageMembers, this.userId)
      || !lodash.includes(draft.permissions.editInfos, this.userId)) {
      throw new Meteor.Error('drafts.addMember.unauthorized',
      'You are not allowed to edit members in this draft');
    }

    if (modifier.$set) {
      const regExMemberIdModifier = /^team\.\d\.userId$/;
      const memberIdModifier = lodash.find(lodash.keys(modifier.$set), function(modifierKey) {
        return regExMemberIdModifier.test(modifierKey);
      });
      const memberIndex = lodash.keys(modifier.$set)[0].match(/\d/)[0];

      if (draft.team[memberIndex].userId === this.userId) {
        if (modifier.$set[memberIdModifier] && (modifier.$set[memberIdModifier] != this.userId)) {
          throw new Meteor.Error('drafts.updateEditable.changeOwnMemberImpossible',
          "You cannot change your own member item's user or permissions");
        }
        const permissionNames = ['editInfos', 'manageMembers', 'deleteProject'];
        const modifiedPermissions = lodash.filter(permissionNames, function(permissionName) {
          if (modifier.$set[`team.${memberIndex}permissions.${permissionName}`]) {
            return modifier.$set[`team.${memberIndex}permissions.${permissionName}`] !== draft.team[memberIndex].permissions[permissionName];
          }
          return false;
        });
        if (modifiedPermissions.length > 0) {
          throw new Meteor.Error('drafts.updateEditable.changeOwnMemberImpossible',
          "You cannot change your own member item's user or permission");
        }
      }
    }
    Drafts.update({ _id }, modifier);
    updateProjectPermissions.call({
      collectionName: 'drafts',
      docId: _id,
    }, (err, res) => {
      if (err) {
        console.log(err);
      }
    });
  },
});

export const updateMemberInProject = new ValidatedMethod({
  name: 'projects.updateMember',
  validate: new SimpleSchema({
    _id: String,
    modifier: {
      type: Object,
      blackbox: true,
    },
  }).validator(),
  run({ modifier, _id }) {
    const project = Projects.findOne(_id);
    if (!lodash.includes(project.permissions.manageMembers, this.userId)
      || !lodash.includes(project.permissions.editInfos, this.userId)) {
      throw new Meteor.Error('projects.addMember.unauthorized',
      'You are not allowed to edit members in this project');
    }
    if (modifier.$set) {
      const regExMemberIdModifier = /^team\.\d\.userId$/;
      const memberIdModifier = lodash.find(lodash.keys(modifier.$set), function(modifierKey) {
        return regExMemberIdModifier.test(modifierKey);
      });
      const memberIndex = lodash.keys(modifier.$set)[0].match(/\d/)[0];

      if (project.team[memberIndex].userId === this.userId) {
        if (modifier.$set[memberIdModifier] && (modifier.$set[memberIdModifier] != this.userId)) {
          throw new Meteor.Error('projects.updateEditable.changeOwnMemberImpossible',
          "You cannot change your own member item's user or permissions");
        }
        const permissionNames = ['editInfos', 'manageMembers', 'deleteProject'];
        const modifiedPermissions = lodash.filter(permissionNames, function(permissionName) {
          if (modifier.$set[`team.${memberIndex}permissions.${permissionName}`]) {
            return modifier.$set[`team.${memberIndex}permissions.${permissionName}`] !== project.team[memberIndex].permissions[permissionName];
          }
          return false;
        });
        if (modifiedPermissions.length > 0) {
          throw new Meteor.Error('projects.updateEditable.changeOwnMemberImpossible',
          "You cannot change your own member item's user or permission");
        }
      }
    }
    Projects.update({ _id }, modifier);
    updateProjectPermissions.call({
      collectionName: 'projects',
      docId: _id,
    }, (err, res) => {
      if (err) {
        console.log(err);
      }
    });
  },
});

export const updateProjectPermissions = new ValidatedMethod({
  name: 'project.updateProjectPermissions',
  validate: new SimpleSchema({
    collectionName: {
      type: String,
      allowedValues: ['drafts', 'projects'],
    },
    docId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
    },
  }).validator(),
  run({ collectionName, docId }) {
    const project = Mongo.Collection.get(collectionName).findOne(docId);
    const permissionNames = lodash.keys(project.permissions);
    const updatedPermissions = {};
    lodash.forEach(project.team, function(member) {
      lodash.forEach(permissionNames, function(permissionName) {
        updatedPermissions[permissionName] = updatedPermissions[permissionName] || [];
        if (member.permissions[permissionName]) {
          updatedPermissions[permissionName].push(member.userId);
        }
      });
    });
    lodash.forEach(project.supervisors, function(supervisor) {
      lodash.forEach(permissionNames, function(permissionName) {
        updatedPermissions[permissionName] = updatedPermissions[permissionName] || [];
        updatedPermissions[permissionName].push(supervisor.userId);
      });
    });
    lodash.forEach(permissionNames, function(permissionName) {
      lodash.uniq(updatedPermissions[permissionName]);
    });
    Mongo.Collection.get(collectionName).update(docId, { $set: { permissions: updatedPermissions } });
  },
});
