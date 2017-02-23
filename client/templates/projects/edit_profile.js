import {Template} from "meteor/templating" ;

import { deleteContact, deleteLink } from "/lib/methods.js";


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
    deleteContact.call({
      index: this.slot,
      userId:Meteor.userId(),
    },(err, res) => {
        if (err) {
          alert(err);
        } else {
          alert("Deine Kontaktdaten wurden aktualisiert!");
        }
    });
    /*let currentContacts = this.currentDoc.profile.contacts;
    currentContacts.splice(this.slot, 1);
    this.currentCollection.update(this.currentDoc._id, {$set: {"profile.contacts": currentContacts}});*/
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
  "click .btn-delete-contact" (event) {
    deleteLink.call({
      index: this.slot,
      userId:Meteor.userId(),
    },(err, res) => {
        if (err) {
          alert(err);
        } else {
          alert("Deine Links wurden aktualisiert!");
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

Template.addLinks.onCreated(function() {
  this.editActive = new ReactiveVar(false);
});

Template.addLinks.helpers({
  editActive () {
    return Template.instance().editActive.get();
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

Template.addLinks.events({
  "click #btn-add-contact" (event) {
    Template.instance().editActive.set(true);
  },
  "click .btn-abort-adding" (event) {
    Template.instance().editActive.set(false);
  },
});