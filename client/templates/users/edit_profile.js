import {Template} from "meteor/templating" ;

import { contactSchema, linkSchema } from "/lib/collections/schemas.js";
import { deleteEditableArrayItem } from "/lib/methods.js";


import "./edit_profile.html" ;

Template.editAboutMe.onCreated(function() {
  this.editActive = new ReactiveVar(false);
});

Template.editAboutMe.helpers({
  editActive () {
    return Template.instance().editActive.get();
  },
});

Template.editAboutMe.events({
  "click .btn-edit-description" (event) {
    Template.instance().editActive.set(true);
  },
  "click .btn-abort-editing" (event) {
    Template.instance().editActive.set(false);
  },
});

Template.editSkills.onCreated(function() {
  this.editActive = new ReactiveVar(false);
});

Template.editSkills.helpers({
  editActive () {
    return Template.instance().editActive.get();
  },
});

Template.editSkills.events({
  "click .btn-edit-tags" (event) {
    Template.instance().editActive.set(true);
  },
  "click .btn-abort-editing" (event) {
    Template.instance().editActive.set(false);
  },
});

Template.contactItemUser.onCreated(function() {
  this.editActive = new ReactiveVar(false);
});

Template.contactItemUser.helpers({
  editActive() {
    return Template.instance().editActive.get();
  },
  contactMediumField () {
    return "profile.contacts." + this.slot + ".medium";
  },
  contactApproachField() {
    return "profile.contacts." + this.slot + ".approach";
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

Template.contactItemUser.events({
  "click .btn-delete-contact" (event) {
    deleteEditableArrayItem.call({
      collectionName: this.currentCollection._name,
      docId: this.currentDoc._id,
      arrayField: "profile.contacts",
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

Template.addContactUser.onCreated(function() {
  this.editActive = new ReactiveVar(false);
});

Template.addContactUser.helpers({
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

Template.addContactUser.events({
  "click #btn-add-contact" (event) {
    Template.instance().editActive.set(true);
  },
  "click .btn-abort-adding" (event) {
    Template.instance().editActive.set(false);
  },
});

Template.linkItem.onCreated(function() {
  this.editActive = new ReactiveVar(false);
});

Template.linkItem.helpers({
  editActive() {
    return Template.instance().editActive.get();
  },
  linkMediumField () {
    return "profile.links." + this.slot + ".medium";
  },
  linkApproachField() {
    return "profile.links." + this.slot + ".approach";
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

Template.linkItem.events({
  "click .btn-delete-link" (event) {
    deleteEditableArrayItem.call({
      collectionName: this.currentCollection._name,
      docId: this.currentDoc._id,
      arrayField: "profile.links",
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

Template.addLink.onCreated(function() {
  this.editActive = new ReactiveVar(false);
});

Template.addLink.helpers({
  editActive () {
    return Template.instance().editActive.get();
  },
  linkSchema () {
    return linkSchema;
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

Template.addLink.events({
  "click #btn-add-link" (event) {
    Template.instance().editActive.set(true);
  },
  "click .btn-abort-adding" (event) {
    Template.instance().editActive.set(false);
  },
});
