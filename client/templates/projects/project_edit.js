import { Template } from "meteor/templating";

import { Courses } from "/lib/collections/courses.js" ;
import { deleteEditableArrayItem, updateEditPermissions } from "/lib/methods.js";
import { memberSchema } from "/lib/collections/schemas.js";
import { jobSchema } from "/lib/collections/schemas.js";
import { contactSchema } from "/lib/collections/schemas.js";
import { teamCommSchema } from "/lib/collections/schemas.js";
import { supervisorSchema } from "/lib/collections/schemas.js";
import { addCourseSchema } from "/lib/collections/schemas.js";

import "./project_edit.html";

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
  courseName(courseId){
    var course = Courses.findOne(courseId)
    if(course){
      return course.courseName + " " + course.courseSemester + " " + course.studyCourse;
    }
  }
});

Template.addCourse.events({
  "click .btn-abort-course" (event) {
    Template.instance().editActive.set(false);
  },
  "click .btn-edit-course" (event) {
    Template.instance().editActive.set(true);
  },
  "click .btn-delete-course" (event) {
    Template.instance().editActive.set(true);
  },
});

Template.addMember.onCreated(function() {
  this.editActive = new ReactiveVar(false);
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
  "click #btn-add-member" (event) {
    Template.instance().editActive.set(true);
  },
  "click .btn-abort-adding" (event) {
    Template.instance().editActive.set(false);
  },
});

Template.addSupervisor.onCreated(function() {
  this.editActive = new ReactiveVar(false);
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
  "click #btn-add-supervisor" (event) {
    Template.instance().editActive.set(true);
  },
  "click .btn-abort-adding" (event) {
    Template.instance().editActive.set(false);
  },
});

Template.member.onCreated(function() {
  this.editActive = new ReactiveVar(false);
});

Template.member.helpers({
  editActive () {
    return Template.instance().editActive.get();
  },
  teamUserIdField () {
    return "team." + this.slot + ".userId";
  },
  teamUserRoleField () {
    return "team." + this.slot + ".role";
  },
  teamUserIsEditorField () {
    return "team." + this.slot + ".isEditor";
  },
});

Template.member.events({
  "click .btn-delete-member" (event) {
    deleteEditableArrayItem.call({
      collectionName: this.currentCollection._name,
      docId: this.currentDoc._id,
      arrayField: "team",
      item: { userId: this.userId, role: this.role },
    },(err, res) => {
        if (err) {
          alert(err);
        }
    });
    updateEditPermissions.call({
      collectionName: this.currentCollection._name,
      docId: this.currentDoc._id,
    },(err, res) => {
        if (err) {
          alert(err);
        }
    });
  },
  "click .btn-edit-member" (event) {
    Template.instance().editActive.set(true);
  },
  "click .btn-abort-editing" (event) {
    Template.instance().editActive.set(false);
  },
  "click .show-leave-modal"(event) {
    Modal.show("leaveTeamModal", {
      collectionName: this.currentCollection._name,
      docId: this.currentDoc._id,
      docTitle: this.currentDoc.title,
      userId: this.userId,
      userRole: this.role
    });
  },
});

Template.leaveTeamModal.events({
  "click #leave"(event) {
    event.preventDefault();
    deleteEditableArrayItem.call({
      collectionName: this.collectionName,
      docId: this.docId,
      arrayField: "team",
      item: { userId: this.userId, role: this.userRole },
    },(err, res) => {
        if (err) {
          alert(err);
        }
    });
    updateEditPermissions.call({
      collectionName: this.collectionName,
      docId: this.docId,
    },(err, res) => {
        if (err) {
          alert(err);
        }
    });
    Modal.hide();
  },
});

Template.supervisor.helpers({
  supervisorIdField () {
    return "supervisors." + this.slot + ".userId";
  },
  supervisorRoleField () {
    return "team." + this.slot + ".role";
  },
});

Template.supervisor.events({
  "click .btn-delete-supervisor"(event) {
    deleteEditableArrayItem.call({
      collectionName: this.currentCollection._name,
      docId: this.currentDoc._id,
      arrayField: "supervisors",
      item: { userId: this.userId, role: this.role },
    },(err, res) => {
        if (err) {
          alert(err);
        }
    });
    updateEditPermissions.call({
      collectionName: this.currentCollection._name,
      docId: this.currentDoc._id,
    },(err, res) => {
        if (err) {
          alert(err);
        }
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
    return "contacts." + this.slot + ".medium";
  },
  contactApproachField() {
    return "contacts." + this.slot + ".approach";
  },
  mediumOptions() {
    return [
      {value: "E-Mail" ,label: "E-Mail"},
      {value: "Skype" ,label: "Skype"},
      {value: "Telefon" ,label: "Telefon"},
      {value: "Whatsapp" ,label: "Whatsapp"},
      {value: "SMS" ,label: "SMS"},
      {value: "Facebook" ,label: "Facebook"},
      {value: "Google+" ,label: "Google+"},
      {value: "Treffpunkt" ,label: "Treffpunkt"},
      {value: "Sonstiges" ,label: "Sonstiges"},
    ];
  },
});

Template.contactItem.events({
  "click .btn-delete-contact" (event) {
    deleteEditableArrayItem.call({
      collectionName: this.currentCollection._name,
      docId: this.currentDoc._id,
      arrayField: "contacts",
      item: { medium: this.medium, approach: this.approach },
    },(err, res) => {
        if (err) {
          alert(err);
        }
    });
  },
  "click .btn-edit-contact" (event) {
    Template.instance().editActive.set(true);
  },
  "click .btn-abort-editing" (event) {
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
      {value: "E-Mail" ,label: "E-Mail"},
      {value: "Skype" ,label: "Skype"},
      {value: "Telefon" ,label: "Telefon"},
      {value: "Whatsapp" ,label: "Whatsapp"},
      {value: "SMS" ,label: "SMS"},
      {value: "Facebook" ,label: "Facebook"},
      {value: "Google+" ,label: "Google+"},
      {value: "Treffpunkt" ,label: "Treffpunkt"},
    ];
  },
});

Template.addContact.events({
  "click #btn-add-contact" (event) {
    Template.instance().editActive.set(true);
  },
  "click .btn-abort-adding" (event) {
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
  "click .btn-edit-title" (event) {
    Template.instance().editActive.set(true);
  },
  "click .btn-abort-editing" (event) {
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
  "click .btn-edit-description" (event) {
    Template.instance().editActive.set(true);
  },
  "click .btn-abort-editing" (event) {
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
  "click .btn-edit-tags" (event) {
    Template.instance().editActive.set(true);
  },
  "click .btn-abort-editing" (event) {
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
  }
});

Template.addJob.events({
  "click #btn-add-job" (event) {
    Template.instance().editActive.set(true);
  },
  "click .btn-abort-adding" (event) {
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
    return "jobs." + this.slot + ".joblabel";
  },
});

Template.jobItem.events({
  "click .btn-delete-job" (event) {
    deleteEditableArrayItem.call({
      collectionName: this.currentCollection._name,
      docId: this.currentDoc._id,
      arrayField: "jobs",
      item: { joblabel: this.jobLabel },
    },(err, res) => {
        if (err) {
          alert(err);
        }
    });
  },
  "click .btn-edit-job" (event) {
    Template.instance().editActive.set(true);
  },
  "click .btn-abort-editing" (event) {
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
  "click .btn-edit-occasions" (event) {
    Template.instance().editActive.set(true);
  },
  "click .btn-abort-editing" (event) {
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
});

Template.editDeadline.events({
  "click .btn-edit-deadline" (event) {
    Template.instance().editActive.set(true);
  },
  "click .btn-abort-editing" (event) {
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
  "click .btn-edit-beginning" (event) {
    Template.instance().editActive.set(true);
  },
  "click .btn-abort-editing" (event) {
    Template.instance().editActive.set(false);
  },
});
Template.editOwnerRole.onCreated(function() {
  this.editActive = new ReactiveVar(false);
});

Template.editOwnerRole.helpers({
  editActive () {
    return Template.instance().editActive.get();
  },
});

Template.editOwnerRole.events({
  "click .btn-edit-owner" (event) {
    Template.instance().editActive.set(true);
  },
  "click .btn-abort-editing" (event) {
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
    if (this.currentDoc.owner.userId == userId) {
      isMember = true;
    } else if (team) {
      team.forEach(function(member) {
        if (member.userId == userId) {
          isMember = true;
        }
      });
    }
    return isMember;
  },
});

Template.editTeamCommunication.events({
  "click .btn-edit-teamcomm" (event) {
    Template.instance().editActive.set(true);
  },
  "click .btn-abort-editing" (event) {
    Template.instance().editActive.set(false);
  },
});

Template.editTeamCommItem.helpers({
  teamCommMediumField() {
    return "teamCommunication." + this.slot + ".medium";
  },
  teamCommUrlField() {
    return "teamCommunication." + this.slot + ".url";
  },
  teamCommIsPrivateField() {
    return "teamCommunication." + this.slot + ".isPrivate";
  },
  mediumOptions() {
    return [
      {},
      {value: "Rundmails" ,label: "Rundmails"},
      {value: "Skype" ,label: "Skype"},
      {value: "Telefon" ,label: "Telefon"},
      {value: "Whatsapp" ,label: "Whatsapp"},
      {value: "SMS" ,label: "SMS"},
      {value: "Facebook" ,label: "Facebook"},
      {value: "Google+" ,label: "Google+"},
      {value: "Meeting" ,label: "Meeting"},
      {value: "Github" ,label: "Github"},
      {value: "BitBucket" ,label: "BitBucket"},
      {value: "Slack" ,label: "Slack"},
      {value: "GitLab" ,label: "GitLab"},
      {value: "Dropbox" ,label: "Dropbox"},
      {value: "GoogleDrive" ,label: "GoogleDrive"},
      {value: "Trello" ,label: "Trello"},
      {value: "Hangouts" ,label: "Hangouts"},
    ];
  },
  createUserOption(term, data) {

  },
});

Template.editTeamCommItem.events({
  "click .btn-delete-teamcomm" (event) {
    deleteEditableArrayItem.call({
      collectionName: this.currentCollection._name,
      docId: this.currentDoc._id,
      arrayField: "teamCommunication",
      item: { medium: this.medium, url: this.url, isPrivate: this.isPrivate },
    },(err, res) => {
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
      {value: "Rundmails" ,label: "Rundmails"},
      {value: "Skype" ,label: "Skype"},
      {value: "Telefon" ,label: "Telefon"},
      {value: "Whatsapp" ,label: "Whatsapp"},
      {value: "SMS" ,label: "SMS"},
      {value: "Facebook" ,label: "Facebook"},
      {value: "Google+" ,label: "Google+"},
      {value: "Meeting" ,label: "Meeting"},
      {value: "Github" ,label: "Github"},
      {value: "BitBucket" ,label: "BitBucket"},
      {value: "Slack" ,label: "Slack"},
      {value: "GitLab" ,label: "GitLab"},
      {value: "Dropbox" ,label: "Dropbox"},
      {value: "GoogleDrive" ,label: "GoogleDrive"},
      {value: "Trello" ,label: "Trello"},
      {value: "Hangouts" ,label: "Hangouts"},
    ];
  },
});

Template.addTeamCommItem.events({
  "click .btn-add-teamcomm" (event) {
    Template.instance().editActive.set(true);
  },
  "click .btn-abort-adding" (event) {
    Template.instance().editActive.set(false);
  },
});
