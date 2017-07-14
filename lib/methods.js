import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { moment } from 'meteor/momentjs:moment';

import { Images, ProjectFiles } from 'meteor/projektor:files';
import { Courses, XlsFiles } from 'meteor/projektor:courses';
import { Projects } from 'meteor/projektor:projects';
import { Studies } from 'meteor/projektor:studies';
import Users from 'meteor/projektor:users';

import SimpleSchema from 'simpl-schema';
import lodash from 'lodash';
import toastr from 'toastr';
import mongoXlsx from 'mongo-xlsx';

import {
  supervisorSchema,
  addCourseSchema,
  courseOwnerSchema,
} from '/lib/collections/schemas.js';

export const createAndInsertCourseSpreadsheet = new ValidatedMethod({
  name: 'xlsFiles.createAndInsertCourseSpreadsheet',
  validate: new SimpleSchema({
    courseId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
    },
  }).validator(),
  run({ courseId }) {
    const course = Courses.findOne(courseId);

    if (!lodash.includes(course.owner, this.userId)) {
      throw new Meteor.Error('No rights to download!!!');
    }

    // create a row with infos for each course member
    const courseSpreadsheetRows = [];

    const courseProjects = Projects.find({
      courseId,
      supervisors: { $elemMatch: { userId: { $in: course.owner } } },
    });
    lodash.forEach(courseProjects, function(courseProject) {
      // find courseMembers by looking for each course project teams members
      lodash.forEach(courseProject.team, function(teamMember) {
        const courseMember = Users.findOne(teamMember.userId);
        if (courseMember.profile.role === 'Student') {
          let studyCourseName = '';
          const studyCourse = Studies.findOne({
            studyCourseId: courseMember.profile.studyCourseId,
            departmentId: courseMember.profile.departmentId,
            facultyId: courseMember.profile.facultyId,
          });
          if (studyCourse && studyCourse.studyCourseName) {
            studyCourseName = studyCourse.studyCourseName;
          }

          let timelySubmittedPdfLink = '';
          let timelySubmittedPdfDate = '';
          let latestSubmittedPdfLink = '';
          let latestSubmittedPdfDate = '';
          moment.locale('de');
          lodash.forEach(courseProject.pdfs, function(submittedPdfId) {
            const submittedPdfFile = ProjectFiles.findOne(submittedPdfId);
            if (courseProject.deadline >= submittedPdfFile.meta.createdAt) {
              timelySubmittedPdfLink = submittedPdfFile.link();
              timelySubmittedPdfDate = moment(submittedPdfFile.meta.createdAt).format('dddd, Do MMMM YYYY, HH:mm:ss');
            } else {
              const latestSubmittedPdfId = courseProject.pdfs[courseProject.pdfs.length - 1];
              const latestSubmittedPdfFile = ProjectFiles.findOne(latestSubmittedPdfId);
              latestSubmittedPdfLink = latestSubmittedPdfFile.link();
              latestSubmittedPdfDate = moment(latestSubmittedPdfFile.meta.createdAt).format('dddd, Do MMMM YYYY, HH:mm:ss');
              return false; // break forEach loop
            }
          });

          const courseSpreadsheetRow = {
            Projektname: courseProject.title,
            'Matr.Nr': courseMember.profile.matricNo,
            Vorname: courseMember.profile.firstname,
            Nachname: courseMember.profile.lastname,
            Studiengang: studyCourseName,
            Notizen: courseProject.notes,
            'Rechtzeitiger Upload': timelySubmittedPdfLink,
            '<- Datum': timelySubmittedPdfDate,
            'Letzter Upload': latestSubmittedPdfLink,
            '<-- Datum': latestSubmittedPdfDate,
          };
          courseSpreadsheetRows.push(courseSpreadsheetRow);
        }
      });
    });

    const courseSpreadsheetModel = mongoXlsx.buildDynamicModel(courseSpreadsheetRows);

    /* Generate Spreadsheet */
    if (Meteor.isServer) {
      mongoXlsx.mongoData2Xlsx(courseSpreadsheetRows, courseSpreadsheetModel, function(err, courseSpreadsheetFile) {
        XlsFiles.addFile(courseSpreadsheetFile.fullPath, {
          name: courseSpreadsheetFile.fullPath,
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          userId: courseId,
          meta: {},
        });
      });
    }
  },
});

export const insertNewCourseProjectDraft = new ValidatedMethod({
  name: 'drafts.insertNewCourseProjectDraft',
  validate: new SimpleSchema({
    courseId: String,
  }).validator(),
  run({ courseId }) {
    const course = Courses.findOne(courseId);

    if (!lodash.includes(course.owner, this.userId)) {
      throw new Meteor.Error('drafts.insertNewCourseProjectDraft.unauthorized',
        'You are not allowed to add course projects to this course');
    }

    const courseProjectSupervisors = [];
    lodash.forEach(course.owner, function(ownerId) {
      const user = Users.findOne(ownerId);
      courseProjectSupervisors.push({ userId: user._id, role: user.profile.title });
    });

    const draftId = Projects.insert({
      isDraft: true,
      courseId,
      supervisors: courseProjectSupervisors,
      deadline: course.deadline,
    });

    updateProjectPermissions.call({
      projectId: draftId,
    }, (err, res) => {
      if (err) {
        console.log(err);
      }
    });

    return draftId;
  },
});

export const insertMultipleNewCourseProjects = new ValidatedMethod({
  name: 'projects.insertMultipleNewCourseProjects',
  validate: new SimpleSchema({
    courseId: String,
    courseProjectTitles: Array,
  }).validator(),
  run({ courseId, courseProjectTitles }) {
    const course = Courses.findOne(courseId);
    if (!lodash.includes(course.owner, this.userId)) {
      throw new Meteor.Error('insertMultipleNewCourseProjects.unauthorized',
        'You are not allowed to add course projects to this course');
    }
    const courseProjectSupervisors = [];
    const courseProjectPermissions = {
      editInfos: [],
      manageMembers: [],
      manageCourses: [],
      deleteProject: [],
    };
    lodash.forEach(course.owner, function(ownerId) {
      const courseOwner = Users.findOne(ownerId);
      courseProjectSupervisors.push({ userId: ownerId, role: courseOwner.profile.title });
      lodash.forEach(courseProjectPermissions, function(permittedUserIds, permissionKey) {
        courseProjectPermissions[permissionKey].push(ownerId);
      });
    });
    lodash.forEach(courseProjectTitles, function(title) {
      if (title) {
        Projects.insert({
          title,
          courseId,
          supervisors: courseProjectSupervisors,
          deadline: course.deadline,
          permissions: courseProjectPermissions,
        });
      }
    });
  },
});

export const deleteAllProjectsInCourse = new ValidatedMethod({
  name: 'projects.deleteAllProjectsInCourse',
  validate: new SimpleSchema({
    courseId: String,
  }).validator(),
  run({ courseId }) {
    const course = Courses.findOne(courseId);

    if (!lodash.includes(course.owner, this.userId)) {
      throw new Meteor.Error('deleteAllProjectsInCourse.unauthorized',
      'Cannot delete draft that is not yours');
    }

    const courseProjectSupervisors = [];
    lodash.forEach(course.owner, function(ownerId) {
      const supervisor = Users.findOne(ownerId);
      courseProjectSupervisors.push({ userId: supervisor._id, role: supervisor.profile.title });
    });
    Projects.remove({ courseId, supervisors: { $in: courseProjectSupervisors } });
  },
});

export const removeCourseFromProject = new ValidatedMethod({
  name: 'project.removeCourse',
  validate: new SimpleSchema({
    collectionName: {
      type: String,
      allowedValues: ['drafts', 'projects'],
    },
    projectId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
    },
  }).validator(),
  run({ collectionName, projectId }) {
    const currentCollection = Mongo.Collection.get(collectionName);
    const project = currentCollection.findOne(projectId);

    if (!lodash.includes(project.permissions.manageCourses, this.userId)) {
      throw new Meteor.Error('project.removeCourse.unauthorized',
      'You are not allowed to remove course in this project');
    }

    currentCollection.update(projectId, { $unset: { courseId: '' } });
  },
});

export const leaveCourse = new ValidatedMethod({
  name: 'courses.leaveCourse',
  validate: new SimpleSchema({
    courseId: String,
  }).validator(),
  run({ courseId }) {
    const course = Courses.findOne(courseId);

    if (!lodash.includes(course.owner, this.userId)) {
      throw new Meteor.Error('leave.unauthorized',
      'You cannot leave a course that is not yours');
    }

    Courses.update(courseId, { $pull: { owner: this.userId } });

    const courseProjects = Projects.find({
      courseId,
      supervisors: { $elemMatch: { userId: this.userId } },
    });
    lodash.forEach(courseProjects, function(project) {
      Projects.update(project._id, { $pull: { supervisors: { userId: this.userId } } });
    });
  },
});

export const addCourseOwner = new ValidatedMethod({
  name: 'courses.addCourseOwner',
  validate: courseOwnerSchema.validator(),
  run({ docId, userId }) {
    const course = Courses.findOne(docId);

    if (!lodash.includes(course.owner, this.userId)) {
      throw new Meteor.Error('courses.addCourseOwner.unauthorized',
      'You cannot add owner to a course that is not yours');
    }

    Courses.update(docId, { $push: { owner: userId } });

    const newCourseOwner = Users.findOne(userId);
    const courseProjects = Projects.find({
      courseId: course._id,
      supervisors: { $elemMatch: { userId: this.userId } },
    });
    lodash.forEach(courseProjects, function(project) {
      Projects.update(project._id, { $addToSet: { supervisors: { userId, role: newCourseOwner.profile.title } } });
      lodash.forEach(project.permissions, function(permittedUsersIds, permissionName) {
        const permissionsModifier = {};
        permissionsModifier[`permissions.${permissionName}`] = userId;
        Projects.update(project._id, { $addToSet: permissionsModifier });
      });
    });
    toastr.success(`${newCourseOwner.profile.fullname} wurde erfolgreich als Kursbetreuer hinzugefügt`);
  },
});

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
    if (draft.courseId && !lodash.includes(draft.permissions.manageCourses, this.userId)) {
      throw new Meteor.Error('drafts.addSupervisor.unauthorized',
      'You are not allowed to add a supervisor to this course draft');
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
            && member.permissions.manageCourses && member.permissions.deleteProject;
      });
      const isUserAdminMember = (team, userId) => {
        const member = lodash.find(team, function(member) {
          return member.userId == userId;
        });
        if (member && member.permissions.editInfos && member.permissions.manageMembers
          && member.permissions.manageCourses && member.permissions.deleteProject) {
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
        } else if (doc.courseId && !lodash.includes(doc.permissions.manageCourses, this.userId)) {
          throw new Meteor.Error(`${collectionName}.editable.deleteArrayItem.unauthorized`,
          'You are not allowed to delete supervisors from this course project.');
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

export const addCourseToProject = new ValidatedMethod({
  name: 'projects.addCourse',
  validate: addCourseSchema.validator(),
  run({ docId, courseId }) {
    const project = Projects.findOne(docId);
    const course = Courses.findOne(courseId);

    if (!lodash.includes(project.permissions.manageCourses, this.userId)) {
      throw new Meteor.Error('projects.addCourse.unauthorized',
      'You are not allowed to add courses to this project.');
    }

    lodash.forEach(course.owner, function(ownerId) {
      const newSupervisor = Users.findOne(ownerId);
      Projects.update(docId, { $addToSet: { supervisors: { userId: newSupervisor._id, role: newSupervisor.profile.title } } });
      Projects.update(docId, { $addToSet: { 'permissions.editInfos': newSupervisor._id } });
      Projects.update(docId, { $addToSet: { 'permissions.manageMembers': newSupervisor._id } });
      Projects.update(docId, { $addToSet: { 'permissions.manageCourses': newSupervisor._id } });
      Projects.update(docId, { $addToSet: { 'permissions.deleteProject': newSupervisor._id } });
    });

    Projects.update(docId, { $set: { courseId } });

    if (course.deadline) {
      Projects.update(docId, { $set: { deadline: course.deadline } });
    }
  },
});

export const addCourseToDraft = new ValidatedMethod({
  name: 'drafts.addCourse',
  validate: addCourseSchema.validator(),
  run({ docId, courseId }) {
    const draft = Drafts.findOne(docId);
    const course = Courses.findOne(courseId);

    if (!lodash.includes(draft.permissions.manageCourses, this.userId)) {
      throw new Meteor.Error('drafts.addCourse.unauthorized',
      'You are not allowed to add courses to this draft.');
    }

    lodash.forEach(course.owner, function(ownerId) {
      const newSupervisor = Users.findOne(ownerId);
      Drafts.update(docId, { $addToSet: { supervisors: { userId: newSupervisor._id, role: newSupervisor.profile.title } } });
      Drafts.update(docId, { $addToSet: { 'permissions.editInfos': newSupervisor._id } });
      Drafts.update(docId, { $addToSet: { 'permissions.manageMembers': newSupervisor._id } });
      Drafts.update(docId, { $addToSet: { 'permissions.manageCourses': newSupervisor._id } });
      Drafts.update(docId, { $addToSet: { 'permissions.deleteProject': newSupervisor._id } });
    });

    Drafts.update(docId, { $set: { courseId } });
    if (course.deadline) {
      Drafts.update(docId, { $set: { deadline: course.deadline } });
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

export const updateGalleryItem = new ValidatedMethod({
  name: 'project.updateGalleryItem',
  validate: new SimpleSchema({
    projectId: String,
    collectionName: String,
    itemIndex: Number,
    newItemType: String,
    imageId: String,
  }).validator(),
  run({ projectId, collectionName, itemIndex, newItemType, imageId }) {
    const currentCollection = Mongo.Collection.get(collectionName);
    const project = currentCollection.findOne(projectId);

    if (!lodash.includes(project.permissions.editInfos, this.userId)) {
      throw new Meteor.Error('updateGalleryItem.unauthorized',
      'You are not permitted to edit this gallery.');
    }

    const mediaNew = project.media;
    mediaNew[itemIndex].type = newItemType;
    mediaNew[itemIndex].id = imageId;
    currentCollection.update(projectId, { $set: { media: mediaNew } });

    const oldImageIdAtIndex = project.media[itemIndex].id;
    if (project.coverImg == oldImageIdAtIndex) {
      currentCollection.update(projectId, { $set: { coverImg: imageId } });
    }
  },
});

export const deleteImageFromProject = new ValidatedMethod({
  name: 'images.deleteImageFromProject',
  validate: new SimpleSchema({
    imageId: String,
    projectId: String,
  }).validator(),
  run({ imageId, projectId }) {
    const project = Projects.findOne(projectId);

    if ((!lodash.includes(project.permissions.editInfos, this.userId))) {
      throw new Meteor.Error('image.deleteImageFromProject.unauthorized',
      'You are not allowed to delete images from this project');
    }

    Images.remove({ _id: imageId });
  },
});

export const setGalleryItemType = new ValidatedMethod({
  name: 'project.setGalleryItemType',
  validate: new SimpleSchema({
    collectionName: String,
    projectId: String,
    itemType: String,
    itemIndex: SimpleSchema.Integer,
  }).validator(),
  run({ projectId, itemIndex, itemType, collectionName }) {
    const currentCollection = Mongo.Collection.get(collectionName);
    const project = currentCollection.findOne(projectId);

    if (!_.contains(project.permissions.editInfos, this.userId)) {
      throw new Meteor.Error('projects.setGalleryItemType.unauthorized',
      'Cannot delete Link from this Profile');
    }

    if (itemType == 'null') {
      itemType = null;
    }
    const newMedia = project.media;
    newMedia[itemIndex].type = itemType;

    currentCollection.update(projectId, { $set: { media: newMedia } });
  },
});

export const setGalleryItemImageId = new ValidatedMethod({
  name: 'project.setGalleryItemImageId',
  validate: new SimpleSchema({
    collectionName: String,
    projectId: String,
    itemIndex: SimpleSchema.Integer,
    imageId: String,
  }).validator(),
  run({ projectId, itemIndex, imageId, collectionName }) {
    const currentCollection = Mongo.Collection.get(collectionName);
    const project = currentCollection.findOne(projectId);

    if (!_.contains(project.permissions.editInfos, this.userId)) {
      throw new Meteor.Error('projects.setGalleryItemImageId.unauthorized',
      'Cannot delete Link from this Profile');
    }

    if (imageId == 'null') {
      imageId = null;
    }
    const newMedia = project.media;
    newMedia[itemIndex].id = imageId;

    Projects.update(projectId, { $set: { media: newMedia } });
  },
});

export const initGallery = new ValidatedMethod({
  name: 'project.initGallery',
  validate: new SimpleSchema({
    collectionName: String,
    projectId: String,
  }).validator(),
  run({ projectId, collectionName }) {
    const currentCollection = Mongo.Collection.get(collectionName);

    const project = currentCollection.findOne(projectId);
    if (!_.contains(project.permissions.editInfos, this.userId)) {
      throw new Meteor.Error('projects.initGallery.unauthorized',
      'Cannot delete Link from this Profile');
    }

    const mediaEmpty = [
      { type: null, id: null },
      { type: null, id: null },
      { type: null, id: null },
      { type: null, id: null },
      { type: null, id: null },
    ];

    currentCollection.update(projectId, { $set: { media: mediaEmpty } });
    currentCollection.update(projectId, { $set: { coverImg: null } });
  },
});

export const setCoverImg = new ValidatedMethod({
  name: 'project.setCoverImg',
  validate: new SimpleSchema({
    projectId: String,
    collectionName: String,
    galleryItemIndex: SimpleSchema.Integer,
    imageId: String,
  }).validator(),
  run({ projectId, collectionName, imageId, galleryItemIndex }) {
    let newCoverImageId;
    if (collectionName == 'projects') {
      const project = Projects.findOne(projectId);
      if (imageId == 'empty') {
        newCoverImageId = project.media[galleryItemIndex].id;
      } else {
        newCoverImageId = imageId;
      }
      if (!_.contains(project.permissions.editInfos, this.userId)) {
        throw new Meteor.Error('projects.setCoverImg.unauthorized',
        'Cannot delete Link from this Profile');
      }
      Projects.update(projectId, { $set: { coverImg: newCoverImageId } });
    } else {
      const draft = Drafts.findOne(projectId);
      if (imageId == 'empty') {
        newCoverImageId = draft.media[galleryItemIndex].id;
      } else {
        newCoverImageId = imageId;
      }
      if (!_.contains(draft.permissions.editInfos, this.userId)) {
        throw new Meteor.Error('projects.setCoverImg.unauthorized',
        'Cannot delete Link from this Profile');
      }
      Drafts.update(projectId, { $set: { coverImg: newCoverImageId } });
    }
  },
});

export const removeCoverImg = new ValidatedMethod({
  name: 'project.removeCoverImg',
  validate: new SimpleSchema({
    projectId: String,
    collectionName: String,
  }).validator(),
  run({ projectId, collectionName }) {
    if (collectionName == 'projects') {
      const project = Projects.findOne(projectId);

      if (!_.contains(project.permissions.editInfos, this.userId)) {
        throw new Meteor.Error('project.removeCoverImg.unauthorized',
        'Cannot delete Link from this Profile');
      }

      Projects.update(projectId, { $set: { coverImg: null } });
    } else {
      const draft = Drafts.findOne(projectId);
      if (!_.contains(draft.permissions.editInfos, this.userId)) {
        throw new Meteor.Error('project.removeCoverImg.unauthorized',
        'Cannot delete Link from this Profile');
      }
      Drafts.update(projectId, { $set: { coverImg: null } });
    }
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
        const permissionNames = ['editInfos', 'manageMembers', 'manageCourses', 'deleteProject'];
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
        const permissionNames = ['editInfos', 'manageMembers', 'manageCourses', 'deleteProject'];
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

export const joinCourseProject = new ValidatedMethod({
  name: 'projects.joinCourseProject',
  validate: new SimpleSchema({
    projectId: String,
    courseKeyInput: String,
  }).validator(),
  run({ projectId, courseKeyInput }) {
    toastr.options = {
      closeButton: false,
      debug: false,
      newestOnTop: false,
      progressBar: false,
      positionClass: 'toast-top-left',
      preventDuplicates: false,
      onclick: null,
      showDuration: '300',
      hideDuration: '1000',
      timeOut: '5000',
      extendedTimeOut: '1000',
      showEasing: 'swing',
      hideEasing: 'linear',
      showMethod: 'fadeIn',
      hideMethod: 'fadeOut',
    };
    const project = Projects.findOne(projectId);
    const course = Courses.findOne(project.courseId);
    if (!this.userId || (course.courseKey != courseKeyInput)) {
      throw new Meteor.Error('projects.joinCourseProject.unauthorized',
      'Wrong key!');
    }
    const newMember = {
      userId: this.usersId,
      role: 'Selbsteingeschriebenes Mitglied',
      permissions: {
        editInfos: true,
        manageMembers: false,
        manageCourses: false,
        deleteProject: false,
      },
    };
    Projects.update(projectId, { $push: { team: newMember } });
    lodash.forEach(newMember.permissions, function(hasPermission, permissionName) {
      if (hasPermission) {
        const permissionsModifier = {};
        permissionsModifier[`permissions.${permissionName}`] = newMember.userId;
        Projects.update(projectId, { $addToSet: permissionsModifier });
      }
    });
  },
});

export const setSelfEnter = new ValidatedMethod({
  name: 'courses.setSelfEnter',
  validate: new SimpleSchema({
    selfEnterAllowed: Boolean,
    courseId: String,
  }).validator(),
  run({ selfEnterAllowed, courseId }) {
    const course = Courses.findOne(courseId);
    if (!lodash.includes(course.owner, this.userId)) {
      throw new Meteor.Error('setSelfEnter.unauthorized',
      'Cannot Update in current course');
    }
    if (selfEnterAllowed) {
      Courses.update(courseId, { $set: { selfEnter: false } });
    } else {
      Courses.update(courseId, { $set: { selfEnter: true } });
    }
  },
});

export const setGalleryItemVideoUrl = new ValidatedMethod({
  name: 'drafts.setGalleryItemVideoUrl',
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
      throw new Meteor.Error('drafts.setGalleryItemVideoUrl.unauthorized',
      'You are not allowed to edit gallery of this draft');
    }
    return Drafts.update({
      _id,
    }, modifier);
  },
});

export const setCourseProjectsDeadline = new ValidatedMethod({
  name: 'courses.setCourseProjectsDeadline',
  validate: new SimpleSchema({
    _id: String,
    modifier: {
      type: Object,
      blackbox: true,
    },
  }).validator(),
  run({ modifier, _id }) {
    const course = Courses.findOne(_id);
    if (!lodash.includes(course.owner, this.userId)) {
      throw new Meteor.Error('courses.insert.unauthorized',
      'You cannot edit Courses that is not yours');
    }
    const courseProjects = Projects.find({ courseId: _id }, { supervisors: { $elemMatch: { userId: this.userId } } });
    courseProjects.forEach(function(courseProject) {
      Projects.update({
        _id: courseProject._id,
      }, modifier);
    });
    return Courses.update({
      _id,
    }, modifier);
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
