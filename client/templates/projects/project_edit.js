import { Template } from 'meteor/templating';
import lodash from 'lodash';
import { Images } from '/lib/collections/images.js';
import { Courses } from '/lib/collections/courses.js';
import { ProjectFiles } from '/lib/collections/projectFiles.js';
import { deleteEditableArrayItem, deleteEditableCourse } from '/lib/methods.js';
import { memberSchema } from '/lib/collections/schemas.js';
import { jobSchema } from '/lib/collections/schemas.js';
import { contactSchema } from '/lib/collections/schemas.js';
import { teamCommSchema } from '/lib/collections/schemas.js';
import { supervisorSchema } from '/lib/collections/schemas.js';
import { addCourseSchema } from '/lib/collections/schemas.js';

import './project_edit.html';

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

const isUserAdminMember = (team, userId) => {
  member = lodash.find(team, function(member) {
    return member.userId == userId;
  });
  if (member && member.permissions.editInfos && member.permissions.manageMembers
    && member.permissions.manageCourses && member.permissions.deleteProject) {
    return true;
  }
  return false;
};

Template.addCourse.onCreated(function() {
  this.editActive = new ReactiveVar(false);
});

Template.addCourse.helpers({
  editActive () {
    return Template.instance().editActive.get();
  },
  addCourseSchema () {
    return addCourseSchema;
  },
  courseName(courseId) {
    const course = Courses.findOne(courseId);
    if (course) {
      return `${course.courseName} ${course.courseSemester} ${course.studyCourse}`;
    }
  },
});

Template.addCourse.events({
  'click .btn-abort-course' (event) {
    Template.instance().editActive.set(false);
  },
  'click .btn-edit-course' (event) {
    event.preventDefault();
    Template.instance().editActive.set(true);
  },
  'click .btn-delete-course' (event) {
    event.preventDefault();
    deleteEditableCourse.call({
      collectionName: this.currentCollection._name,
      docId: this.currentDoc._id,
    }, (err, res) => {
      if (err) {
        alert(err);
      }
    });
  },
});

Template.addMember.onCreated(function() {
  this.editActive = new ReactiveVar(false);
  this.subscribe('users.list.all');
});

Template.addMember.helpers({
  editActive () {
    return Template.instance().editActive.get();
  },
  memberSchema () {
    return memberSchema;
  },
});

Template.addMember.events({
  'click #btn-add-member' (event) {
    Template.instance().editActive.set(true);
  },
  'click .btn-abort-adding' (event) {
    Template.instance().editActive.set(false);
  },
});

Template.addSupervisor.onCreated(function() {
  this.editActive = new ReactiveVar(false);
  this.subscribe('users.list.all');
});

Template.addSupervisor.helpers({
  editActive () {
    return Template.instance().editActive.get();
  },
  supervisorSchema () {
    return supervisorSchema;
  },
});

Template.addSupervisor.events({
  'click #btn-add-supervisor' (event) {
    Template.instance().editActive.set(true);
  },
  'click .btn-abort-adding' (event) {
    Template.instance().editActive.set(false);
  },
});

Template.notesBoxSupervisors.onCreated(function() {
  this.editActive = new ReactiveVar(false);
});

Template.notesBoxSupervisors.helpers({
  supervisorNotes(currentDoc) {
    if (currentDoc && currentDoc.supervisors) {
      let check = false;
      lodash.forEach(currentDoc.supervisors, function(supervisor) {
        if (supervisor.userId == Meteor.userId()) {
          check = true;
          return false;
        }
      });
      return check;
    }
  },
  editActive() {
    return Template.instance().editActive.get();
  },
});

Template.notesBoxSupervisors.events({
  'click .btn-edit-description' (event) {
    event.preventDefault();
    console.log(Template.instance().editActive.get());
    Template.instance().editActive.set(true);
    console.log(Template.instance().editActive.get());
  },
  'click .btn-abort-editing' (event) {
    Template.instance().editActive.set(false);
  },
});

Template.member.onCreated(function() {
  this.editActive = new ReactiveVar(false);
  this.autorun(() => {
    if(Template.currentData().userId){
      this.subscribe('users.profile.single', Template.currentData().userId);
      this.subscribe('files.images.avatar', Template.currentData().userId);
    }
  });
  this.subscribe('users.list.all');
});

Template.member.helpers({
  user() {
    return Meteor.users.findOne(this.userId);
  },
  getAvatarURL (userId, version) {
    const user = Meteor.users.findOne({ _id: userId });
    const image = user && (user.profile.avatar && Images.findOne(user.profile.avatar));
    return (image && image.versions[version]) ? image.link(version) : `/img/${version}.jpg`;
  },
  editActive () {
    return Template.instance().editActive.get();
  },
  teamUserIdField () {
    return `team.${this.slot}.userId`;
  },
  teamUserRoleField () {
    return `team.${this.slot}.role`;
  },
  teamUserCanEditInfosField () {
    return `team.${this.slot}.permissions.editInfos`;
  },
  teamUserCanManageMembersField () {
    return `team.${this.slot}.permissions.manageMembers`;
  },
  teamUserCanManageCoursesField () {
    return `team.${this.slot}.permissions.manageCourses`;
  },
  teamUserCanDeleteProjectField () {
    return `team.${this.slot}.permissions.deleteProject`;
  },
  showLeaveButton() {
    if (this.userId == Meteor.userId()) {
      if (this.currentDoc.isNewProject) {
        if (isUserInGroup(this.currentDoc.supervisors, Meteor.userId())) {
          return true;
        }
        return false;
      }
      return true;
    }
    return false;
  },
});

Template.member.events({
  'click .btn-delete-member' (event) {
    event.preventDefault();
    deleteEditableArrayItem.call({
      collectionName: this.currentCollection._name,
      docId: this.currentDoc._id,
      arrayField: 'team',
      item: { userId: this.userId, role: this.role },
    }, (err, res) => {
      if (err) {
        alert(err);
      }
    });
  },
  'click .btn-edit-member' (event) {
    event.preventDefault();
    Template.instance().editActive.set(true);
  },
  'click .btn-abort-editing' (event) {
    Template.instance().editActive.set(false);
  },
  'click .show-leave-modal'(event) {
    event.preventDefault();
    Modal.show('leaveGroupModal', {
      collectionName: this.currentCollection._name,
      docId: this.currentDoc._id,
      docTitle: this.currentDoc.title,
      group: 'team',
      userId: this.userId,
      userRole: this.role,
    });
  },
});

Template.leaveGroupModal.helpers({
  groupName() {
    if (this.group == 'team') {
      return 'Team';
    } else if (this.group == 'supervisors') {
      return 'Betreuer';
    }
    return 'Unbekannt';
  },
  isLastEditor() {
    const project = Mongo.Collection.get(this.collectionName).findOne(this.docId);
    const adminMembers = lodash.filter(project.team, function(member) {
      return member.permissions.editInfos && member.permissions.manageMembers
        && member.permissions.manageCourses && member.permissions.deleteProject;
    });
    if (this.group == 'team') {
      if (isUserAdminMember(project.team, this.userId) && adminMembers.length === 1
      && (!project.supervisors || project.supervisors.length === 0)) {
        return true;
      }
    }
    if (this.group == 'supervisors') {
      if (project.supervisors.length === 1 && adminMembers.length === 0) {
        return true;
      }
    }
    return false;
  },
});

Template.leaveGroupModal.events({
  'click #leave'(event) {
    event.preventDefault();
    deleteEditableArrayItem.call({
      collectionName: this.collectionName,
      docId: this.docId,
      arrayField: this.group,
      item: { userId: this.userId, role: this.userRole },
    }, (err, res) => {
      if (err) {
        alert(err);
      }
    });
    Modal.hide();
  },
});

Template.supervisor.helpers({
  user() {
    return Meteor.users.findOne(this.userId);
  },
  getAvatarURL (userId, version) {
    const user = Meteor.users.findOne({ _id: userId });
    const image = user && (user.profile.avatar && Images.findOne(user.profile.avatar));
    return (image && image.versions[version]) ? image.link(version) : `/img/${version}.jpg`;
  },
  supervisorIdField () {
    return `supervisors.${this.slot}.userId`;
  },
  supervisorRoleField () {
    return `team.${this.slot}.role`;
  },
  showLeaveButton() {
    if (this.userId == Meteor.userId()) {
      if (this.currentDoc.isNewProject) {
        if (isUserAdminMember(this.currentDoc.team, Meteor.userId())) {
          return true;
        }
        return false;
      }
      return true;
    }
    return false;
  },
});

Template.supervisor.onCreated(function supervisorOnCreated() {
  this.autorun(() => {
    if (Template.currentData().userId){
      this.subscribe('users.profile.single', Template.currentData().userId);
      this.subscribe('files.images.avatar', Template.currentData().userId);
    }
  });
});

Template.supervisor.events({
  'click .btn-delete-supervisor'(event) {
    event.preventDefault();
    deleteEditableArrayItem.call({
      collectionName: this.currentCollection._name,
      docId: this.currentDoc._id,
      arrayField: 'supervisors',
      item: { userId: this.userId, role: this.role },
    }, (err, res) => {
      if (err) {
        alert(err);
      }
    });
  },
  'click .show-leave-modal'(event) {
    event.preventDefault();
    Modal.show('leaveGroupModal', {
      collectionName: this.currentCollection._name,
      docId: this.currentDoc._id,
      docTitle: this.currentDoc.title,
      group: 'supervisors',
      userId: this.userId,
      userRole: this.role,
    });
  },
});

Template.contactItem.onCreated(function() {
  this.editActive = new ReactiveVar(false);
});

Template.contactItem.helpers({
  editActive() {
    return Template.instance().editActive.get();
  },
  contactMediumField () {
    return `contacts.${this.slot}.medium`;
  },
  contactApproachField() {
    return `contacts.${this.slot}.approach`;
  },
  mediumOptions() {
    return [
      { value: 'E-Mail', label: 'E-Mail' },
      { value: 'Skype', label: 'Skype' },
      { value: 'Telefon', label: 'Telefon' },
      { value: 'Whatsapp', label: 'Whatsapp' },
      { value: 'SMS', label: 'SMS' },
      { value: 'Facebook', label: 'Facebook' },
      { value: 'Google+', label: 'Google+' },
      { value: 'Treffpunkt', label: 'Treffpunkt' },
      { value: 'Sonstiges', label: 'Sonstiges' },
    ];
  },
});

Template.contactItem.events({
  'click .btn-delete-contact' (event) {
    event.preventDefault();
    deleteEditableArrayItem.call({
      collectionName: this.currentCollection._name,
      docId: this.currentDoc._id,
      arrayField: 'contacts',
      item: { medium: this.medium, approach: this.approach },
    }, (err, res) => {
      if (err) {
        alert(err);
      }
    });
  },
  'click .btn-edit-contact' (event) {
    event.preventDefault();
    Template.instance().editActive.set(true);
  },
  'click .btn-abort-editing' (event) {
    Template.instance().editActive.set(false);
  },
});

Template.addContact.onCreated(function() {
  this.editActive = new ReactiveVar(false);
});

Template.addContact.helpers({
  editActive () {
    return Template.instance().editActive.get();
  },
  contactSchema () {
    return contactSchema;
  },
  mediumOptions() {
    return [
      {},
      { value: 'E-Mail', label: 'E-Mail' },
      { value: 'Skype', label: 'Skype' },
      { value: 'Telefon', label: 'Telefon' },
      { value: 'Whatsapp', label: 'Whatsapp' },
      { value: 'SMS', label: 'SMS' },
      { value: 'Facebook', label: 'Facebook' },
      { value: 'Google+', label: 'Google+' },
      { value: 'Treffpunkt', label: 'Treffpunkt' },
    ];
  },
});

Template.addContact.events({
  'click #btn-add-contact' (event) {
    Template.instance().editActive.set(true);
  },
  'click .btn-abort-adding' (event) {
    Template.instance().editActive.set(false);
  },
});

Template.editTitle.onCreated(function() {
  this.editActive = new ReactiveVar(false);
});

Template.editTitle.helpers({
  editActive () {
    return Template.instance().editActive.get();
  },
});

Template.editTitle.events({
  'click .btn-edit-title' (event) {
    event.preventDefault();
    Template.instance().editActive.set(true);
  },
  'click .btn-abort-editing' (event) {
    Template.instance().editActive.set(false);
  },
});

Template.editDescription.onCreated(function() {
  this.editActive = new ReactiveVar(false);
});

Template.editDescription.helpers({
  editActive () {
    return Template.instance().editActive.get();
  },
});

Template.editDescription.events({
  'click .btn-edit-description' (event) {
    event.preventDefault();
    Template.instance().editActive.set(true);
  },
  'click .btn-abort-editing' (event) {
    Template.instance().editActive.set(false);
  },
});

Template.editTags.onCreated(function() {
  this.editActive = new ReactiveVar(false);
});

Template.editTags.helpers({
  editActive () {
    return Template.instance().editActive.get();
  },
});

Template.editTags.events({
  'click .btn-edit-tags' (event) {
    event.preventDefault();
    Template.instance().editActive.set(true);
  },
  'click .btn-abort-editing' (event) {
    Template.instance().editActive.set(false);
  },
});

Template.addJob.onCreated(function() {
  this.editActive = new ReactiveVar(false);
});

Template.addJob.helpers({
  editActive () {
    return Template.instance().editActive.get();
  },
  jobSchema () {
    return jobSchema;
  },
});

Template.addJob.events({
  'click #btn-add-job' (event) {
    Template.instance().editActive.set(true);
  },
  'click .btn-abort-adding' (event) {
    Template.instance().editActive.set(false);
  },
});

Template.jobItem.onCreated(function() {
  this.editActive = new ReactiveVar(false);
});

Template.jobItem.helpers({
  editActive() {
    return Template.instance().editActive.get();
  },
  jobLabelField () {
    return `jobs.${this.slot}.joblabel`;
  },
});

Template.jobItem.events({
  'click .btn-delete-job' (event) {
    event.preventDefault();
    deleteEditableArrayItem.call({
      collectionName: this.currentCollection._name,
      docId: this.currentDoc._id,
      arrayField: 'jobs',
      item: { joblabel: this.jobLabel },
    }, (err, res) => {
      if (err) {
        alert(err);
      }
    });
  },
  'click .btn-edit-job' (event) {
    event.preventDefault();
    Template.instance().editActive.set(true);
  },
  'click .btn-abort-editing' (event) {
    event.preventDefault();
    Template.instance().editActive.set(false);
  },
});

Template.editOccasions.onCreated(function() {
  this.editActive = new ReactiveVar(false);
});

Template.editOccasions.helpers({
  editActive () {
    return Template.instance().editActive.get();
  },
});

Template.editOccasions.events({
  'click .btn-edit-occasions' (event) {
    event.preventDefault();
    Template.instance().editActive.set(true);
  },
  'click .btn-abort-editing' (event) {
    Template.instance().editActive.set(false);
  },
});

Template.editDeadline.onCreated(function() {
  this.editActive = new ReactiveVar(false);
});

Template.editDeadline.helpers({
  editActive () {
    return Template.instance().editActive.get();
  },
  requiredPermissions() {
    if (this.currentDoc && this.currentDoc.courseId) {
      return 'editInfos,manageCourses';
    }
    return 'editInfos';
  },
});

Template.editDeadline.events({
  'click .btn-edit-deadline' (event) {
    event.preventDefault();
    Template.instance().editActive.set(true);
  },
  'click .btn-abort-editing' (event) {
    Template.instance().editActive.set(false);
  },
});

Template.editBeginning.onCreated(function() {
  this.editActive = new ReactiveVar(false);
});

Template.editBeginning.helpers({
  editActive () {
    return Template.instance().editActive.get();
  },
});

Template.editBeginning.events({
  'click .btn-edit-beginning' (event) {
    event.preventDefault();
    Template.instance().editActive.set(true);
  },
  'click .btn-abort-editing' (event) {
    Template.instance().editActive.set(false);
  },
});

Template.editTeamCommunication.onCreated(function() {
  this.editActive = new ReactiveVar(false);
});

Template.editTeamCommunication.helpers({
  editActive () {
    return Template.instance().editActive.get();
  },
  isTeamMember(userId, team) {
    let isMember = false;
    team.forEach(function(member) {
      if (member.userId == userId) {
        isMember = true;
      }
    });
    return isMember;
  },
});

Template.editTeamCommunication.events({
  'click .btn-edit-teamcomm' (event) {
    event.preventDefault();
    Template.instance().editActive.set(true);
  },
  'click .btn-abort-editing' (event) {
    Template.instance().editActive.set(false);
  },
});

Template.editTeamCommItem.helpers({
  teamCommMediumField() {
    return `teamCommunication.${this.slot}.medium`;
  },
  teamCommUrlField() {
    return `teamCommunication.${this.slot}.url`;
  },
  teamCommIsPrivateField() {
    return `teamCommunication.${this.slot}.isPrivate`;
  },
  mediumOptions() {
    return [
      {},
      { value: 'Rundmails', label: 'Rundmails' },
      { value: 'Skype', label: 'Skype' },
      { value: 'Telefon', label: 'Telefon' },
      { value: 'Whatsapp', label: 'Whatsapp' },
      { value: 'SMS', label: 'SMS' },
      { value: 'Facebook', label: 'Facebook' },
      { value: 'Google+', label: 'Google+' },
      { value: 'Meeting', label: 'Meeting' },
      { value: 'Github', label: 'Github' },
      { value: 'BitBucket', label: 'BitBucket' },
      { value: 'Slack', label: 'Slack' },
      { value: 'GitLab', label: 'GitLab' },
      { value: 'Dropbox', label: 'Dropbox' },
      { value: 'GoogleDrive', label: 'GoogleDrive' },
      { value: 'Trello', label: 'Trello' },
      { value: 'Hangouts', label: 'Hangouts' },
    ];
  },
  createUserOption(term, data) {

  },
});

Template.editTeamCommItem.events({
  'click .btn-delete-teamcomm' (event) {
    deleteEditableArrayItem.call({
      collectionName: this.currentCollection._name,
      docId: this.currentDoc._id,
      arrayField: 'teamCommunication',
      item: { medium: this.medium, url: this.url, isPrivate: this.isPrivate },
    }, (err, res) => {
      if (err) {
        alert(err);
      }
    });
  },
});

Template.addTeamCommItem.onCreated(function() {
  this.editActive = new ReactiveVar(false);
});

Template.addTeamCommItem.helpers({
  editActive () {
    return Template.instance().editActive.get();
  },
  teamCommSchema () {
    return teamCommSchema;
  },
  mediumOptions() {
    return [
      {},
      { value: 'Rundmails', label: 'Rundmails' },
      { value: 'Skype', label: 'Skype' },
      { value: 'Telefon', label: 'Telefon' },
      { value: 'Whatsapp', label: 'Whatsapp' },
      { value: 'SMS', label: 'SMS' },
      { value: 'Facebook', label: 'Facebook' },
      { value: 'Google+', label: 'Google+' },
      { value: 'Meeting', label: 'Meeting' },
      { value: 'Github', label: 'Github' },
      { value: 'BitBucket', label: 'BitBucket' },
      { value: 'Slack', label: 'Slack' },
      { value: 'GitLab', label: 'GitLab' },
      { value: 'Dropbox', label: 'Dropbox' },
      { value: 'GoogleDrive', label: 'GoogleDrive' },
      { value: 'Trello', label: 'Trello' },
      { value: 'Hangouts', label: 'Hangouts' },
    ];
  },
});

Template.addTeamCommItem.events({
  'click .btn-add-teamcomm' (event) {
    Template.instance().editActive.set(true);
  },
  'click .btn-abort-adding' (event) {
    Template.instance().editActive.set(false);
  },
});

Template.projectFileUpload.onCreated(function () {
  this.currentUpload = new ReactiveVar(false);
  console.log(this.data.currentDoc);
  if (this && this.data.currentDoc && this.data.currentDoc.isNewProject && this.data.currentDoc.pdfs && this.data.currentDoc._id){
    console.log("test1");
    this.autorun(() => {
      this.subscribe('files.draftFiles.single', this.data.currentDoc._id);
    });
  } else if(this && this.data.currentDoc && this.data.currentDoc._id && this.data.currentDoc.pdfs && !this.data.currentDoc.isNewProject) {
    console.log("test2");
    this.autorun(() => {
      this.subscribe('files.projectFiles.single', this.data.currentDoc._id);
    });
  }
});

Template.projectFileUpload.helpers({
  currentUpload () {
    return Template.instance().currentUpload.get();
  },
  file () {
    const pdfId = this.currentDoc && this.currentDoc.pdfs && this.currentDoc.pdfs[this.currentDoc.pdfs.length - 1];
    const file = ProjectFiles.findOne(pdfId);
    return ProjectFiles.findOne(pdfId);
  },
});

Template.projectFileUpload.events({
  'change #fileInput' (e, template) {
    if (e.currentTarget.files && e.currentTarget.files[0]) {
      // We upload only one file, in case
      // multiple files were selected
      const collection = template.data.currentCollection._name;
      const projectId = template.data.currentDoc._id;
      const upload = ProjectFiles.insert({
        file: e.currentTarget.files[0],
        streams: 'dynamic',
        chunkSize: 'dynamic',
        meta: {
          collection,
          projectId,
          createdAt: new Date(),
        },
      }, false);

      upload.on('start', function () {
        template.currentUpload.set(this);
      });

      upload.on('end', function (error, fileObj) {
        if (error) {
          // alert('Error during upload: ' + error);
        } else {
          $('#uploadAlert').hide();
          $('#uploadSuccess').show();
          // alert('File "' + fileObj.name + '" successfully uploaded');
        }
        template.currentUpload.set(false);
      });

      upload.start();
    }
  },
});
