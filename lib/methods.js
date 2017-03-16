import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import { Images } from '/lib/collections/images.js';
import { XlsFiles } from '/lib/collections/xlsFiles.js';
import { Projects } from "/lib/collections/projects.js" ;
import { Drafts } from "/lib/collections/drafts.js";
import { Meteor } from 'meteor/meteor'
import { memberSchema } from "/lib/collections/schemas.js";
import { jobSchema } from "/lib/collections/schemas.js";
import { contactSchema } from "/lib/collections/schemas.js";
import { linkSchema } from "/lib/collections/schemas.js";
import { teamCommSchema } from "/lib/collections/schemas.js";

Meteor.methods({
  excel: function () {
    // .. do stuff ..
    if (!Meteor.userId()) {
      throw new Meteor.Error("pants-not-found", "Can't find my pants");
    }
    var mongoXlsx = require('mongo-xlsx');
 
    var data = [ { name : "Peter", lastName : "Parker", isSpider : true } , 
                 { name : "Remy",  lastName : "LeBeau", powers : ["kinetic cards"] }];

    /* Generate automatic model for processing (A static model should be used) */
    var model = mongoXlsx.buildDynamicModel(data);

    /* Generate Excel */
    console.log("model:" + model);
    if(Meteor.isServer){
      
      
      mongoXlsx.mongoData2Xlsx(data, model, function(err, data) {
        console.log(data)
        console.log('File saved at:', data.fullPath); 
      });
      XlsFiles.addFile("C:/Users/Adrian/Desktop/Projektor/projektor/.meteor/local/build/programs/server/"+data.fullPath, {
        fileName: data.fullPath,
        type: 'files/xls',
        meta: {}
      });
  
      
      Meteor.publish('files.xlsFiles.all', function () {
        return XlsFiles.find().cursor;
      });
      
    }
    console.log(XlsFiles);
    console.log("MongoXlsx:" + mongoXlsx); 
    console.log("Data:" + data);
  }
  
  
});
/*export const excel = new ValidatedMethod({
  name: "excel",
  validate: new SimpleSchema({
    test:String,
  }).validator(),
  run({test}){
    if (!Meteor.userId()){
      throw new Meteor.Error("excel.unauthorized",
      "Cannot delete Image from this Project");
    }
    var mongoXlsx = require('mongo-xlsx');

    var data = [ { name : "Peter", lastName : "Parker", isSpider : true } , 
                 { name : "Remy",  lastName : "LeBeau", powers : ["kinetic cards"] }];


    var model = mongoXlsx.buildDynamicModel(data);
    console.log(model);

    mongoXlsx.mongoData2Xlsx(data, model, function(err, data) {
      console.log('File saved at:', data.fullPath); 
    });
  }
});*/

export const insertEmptyDraft = new ValidatedMethod({
  name: "drafts.insertEmptyDraft",
  validate: new SimpleSchema({}).validator(),
  run() {
    if (!this.userId) {
      throw new Meteor.Error('drafts.insertNew.unauthorized',
        'Cannot insert new draft because you are not logged in');
    }
    return Drafts.insert({});
  }
});

export const publishDraft = new ValidatedMethod({
  name: "projects.publishDraft",
  validate: new SimpleSchema({
    "draftId": String,
  }).validator(),
  run({ draftId }) {
    const draft = Drafts.findOne(draftId);
    if (!(draft.owner.userId == this.userId)) {
      throw new Meteor.Error('projects.publishDraft.unauthorized',
        'Cannot publish draft that is not yours');
    }
    return Projects.insert(draft);
  }
});

export const deleteDraft = new ValidatedMethod({
  name: "drafts.deleteDraft",
  validate: new SimpleSchema({
    "draftId": String,
  }).validator(),
  run({ draftId }) {
    console.log(Meteor.isServer);
    const draft = Drafts.findOne(draftId);
    if(!(draft.owner.userId == this.userId)) {
      throw new Meteor.Error("drafts.deleteDraft.unauthorized",
      "Cannot delete draft that is not yours");
    }
    Drafts.remove(draftId);
  }
});
/*export const insertImage = new ValidatedMethod({
  name: "insertImage",
  validate: new SimpleSchema({
    fileName: String,
    type: String,
    metaType: String

  }).validator(),
  run({ fileName, type, metaType }) {
    console.log(Meteor.isServer);
    if (!Meteor.userId()) {
      throw new Meteor.Error('insertImage.unauthorized',
        'Cannot insert datas to Images');
    }
    console.log(Meteor.isServer);
    console.log(Images)
    Images.write(new Buffer(fileName), {
      fileName: fileName,
      type: type,
      meta:{
        type:metaType,
      }
    }, function (error, fileRef) {
      if (error) {
        throw error;
      }
    });
    Images.insert({
      file: file,
      streams: 'dynamic',
      chunkSize: 'dynamic',
      meta:{
        type: type
      }
    },false);
  }
});*/

export const addMemberToDraft = new ValidatedMethod({
  name: "drafts.addMember",
  validate: memberSchema.validator(),
  run({ docId, member }) {
    const draft = Drafts.findOne(docId);
    if (draft.owner.userId != this.userId) {
      throw new Meteor.Error("drafts.addMember.unauthorized",
      "You cannot edit draft that is not yours");
    }
    Drafts.update(docId, { $push: { team: member } });
  }
});

export const addMemberToProject = new ValidatedMethod({
  name: "projects.addMember",
  validate: memberSchema.validator(),
  run({ docId, member }) {
    const project = Projects.findOne(docId);
    if (draft.owner.userId != this.userId) {
      throw new Meteor.Error("drafts.addMemberToProject.unauthorized",
      "You cannot edit project that is not yours");
    }
    Projects.update(docId, { $push: { team: member } });
  }
});

export const addJobToDraft = new ValidatedMethod({
  name: "drafts.addJob",
  validate: jobSchema.validator(),
  run({ docId, job }) {
    const draft = Drafts.findOne(docId);
    if(!(draft.owner.userId == this.userId)) {
      throw new Meteor.Error("drafts.addJob.unauthorized",
      "You cannot edit project that is not yours");
    }
    Drafts.update(docId, { $push: { jobs: job } });
  }
});

export const addJobToProject = new ValidatedMethod({
  name: "projects.addJob",
  validate: jobSchema.validator(),
  run({ docId, job }) {
    const project = Projects.findOne(docId);
    if(!(project.owner.userId == this.userId)) {
      throw new Meteor.Error("projects.addJob.unauthorized",
      "You cannot edit project that is not yours");
    }
    Projects.update(docId, { $push: { jobs: job } });
  }
});

export const addContactToDraft = new ValidatedMethod({
  name: "drafts.addContact",
  validate: contactSchema.validator(),
  run({ docId, contact }) {
    const draft = Drafts.findOne(docId);
    if(!(draft.owner.userId == this.userId)) {
      throw new Meteor.Error("drafts.addContact.unauthorized",
      "You cannot edit project that is not yours");
    }
    Drafts.update(docId, { $push: { contacts: contact } });
  }
});

export const addContactToProject = new ValidatedMethod({
  name: "projects.addContact",
  validate: contactSchema.validator(),
  run({ docId, contact }) {
    const project = Projects.findOne(docId);
    if(!(project.owner.userId == this.userId)) {
      throw new Meteor.Error("projects.addContact.unauthorized",
      "You cannot edit project that is not yours");
    }
    Projects.update(docId, { $push: { contacts: contact } });
  }
});

export const addTeamCommToDraft = new ValidatedMethod({
  name: "drafts.addTeamComm",
  validate: teamCommSchema.validator(),
  run({ docId, teamComm }) {
    const draft = Drafts.findOne(docId);
    if(!(draft.owner.userId == this.userId)) {
      throw new Meteor.Error("drafts.addTeamComm.unauthorized",
      "You cannot edit draft that is not yours");
    }
    Drafts.update(docId, { $push: { teamCommunication: teamComm } });
  }
});

export const addTeamCommToProject = new ValidatedMethod({
  name: "projects.addTeamComm",
  validate: teamCommSchema.validator(),
  run({ docId, teamComm }) {
    const project = Projects.findOne(docId);
    if(!(project.owner.userId == this.userId)) {
      throw new Meteor.Error("projets.addTeamComm.unauthorized",
      "You cannot edit project that is not yours");
    }
    Projets.update(docId, { $push: { teamCommunication: teamComm } });
  }
});

export const addContactToProfile = new ValidatedMethod({
  name: "users.addContact",
  validate: contactSchema.validator(),
  run({ docId, contact }) {
    console.log(docId, contact);
    const user = Meteor.users.findOne(docId);
    if(!(user._id == this.userId)) {
      throw new Meteor.Error("users.addContact.unauthorized",
      "You cannot edit profile that is not yours");
    }
    Meteor.users.update(docId, { $push: { "profile.contacts": contact } });
  }
});

export const addLinkToProfile = new ValidatedMethod({
  name: "users.addLink",
  validate: linkSchema.validator(),
  run({ docId, link }) {
    console.log(docId, link);
    const user = Meteor.users.findOne(docId);
    if(!(user._id == this.userId)) {
      throw new Meteor.Error("users.addLink.unauthorized",
      "You cannot edit profile that is not yours");
    }
    Meteor.users.update(docId, { $push: { "profile.links": link } });
  }
});

export const imageRemove = new ValidatedMethod({
  name: "imageRemove",
  validate: new SimpleSchema({
    imageId: String,
  }).validator(),
  run({ imageId }) {
    const image = Images.findOne(imageId);
    if (image.userId != Meteor.userId()){
      throw new Meteor.Error("imageRemove.unauthorized",
      "Cannot delete Image from this Project");
    }
    Images.remove({_id: imageId});
  }
});

export const avatarRemove = new ValidatedMethod({
  name: "avatarRemove",
  validate: new SimpleSchema({
    userId: String,
  }).validator(),
  run({ userId }) {
    const user = Meteor.users.findOne(userId);
    if (user._id != Meteor.userId()){
      throw new Meteor.Error("avatarRemove.unauthorized",
      "Cannot delete Image from this Project");
    }
    Images.remove({_id: user.profile.avatar});
    Meteor.users.update( { _id: userId }, { $set: { 'profile.avatar': false }} );
  }
});

export const galleryUpdate = new ValidatedMethod({
  name: "galleryUpdate",
  validate: new SimpleSchema({
    projectId: String,
    collection: String,
    index: Number,
    type:String,
    id: String,
  }).validator(),
  run({projectId, collection, index, type, id}){
    if(collection == "projects"){
      const project = Projects.findOne(projectId);
      const currentArray = project.media;
      const arrayContent = currentArray[index].id
      currentArray[index].type = type;
      currentArray[index].id = id;

      if(project.owner.userId != Meteor.userId()) {
        throw new Meteor.Error("galleryUpdate.unauthorized",
        "Cannot delete Link from this Profile");
      }
      Projects.update(projectId,{$set: { "media": currentArray}} );
      if(project.coverImg == arrayContent){
        Projects.update(projectId,{$set: {"coverImg": id}});
      }
    } else {
      const draft = Drafts.findOne(projectId);
      const currentArray = draft.media;
      const arrayContent = currentArray[index].id
      currentArray[index].type = type;
      currentArray[index].id = id;
      if(draft.owner.userId != Meteor.userId()) {
        throw new Meteor.Error("galleryUpdate.unauthorized",
        "Cannot delete Link from this Profile");
      }
      Drafts.update(projectId,{$set: { "media": currentArray}} );
      if(draft.coverImg == arrayContent){
        Drafts.update(projectId,{$set: {"coverImg": id}});
      }
    }
  }
});

export const userAvatar = new ValidatedMethod({
  name: "userAvatar",
  validate: new SimpleSchema({
    userId: String,
    imageId: String,
  }).validator(),
  run({userId, imageId}){
    if(userId != Meteor.userId()) {
      throw new Meteor.Error("userAvatar.unauthorized",
      "Its not your profile");
    }
    Meteor.users.update( { _id: userId }, { $set: { 'profile.avatar': imageId }} );
    }
});

export const deleteContact = new ValidatedMethod({
  name: "user.deleteContact",
  validate: new SimpleSchema({
    userId: String,
    index: SimpleSchema.Integer,
  }).validator(),
  run({userId, index}){
    const user = Meteor.users.findOne(userId);
    if(!(user._id == Meteor.userId())) {
      throw new Meteor.Error("user.deleteContact.unauthorized",
      "Cannot delete contact from this Profile");
    }
    const currentContacts = user.profile.contacts;
    currentContacts.splice(index, 1);
    Meteor.users.update(userId,{$set:{"profile.contacts":currentContacts}});
  }
});

export const deleteLink = new ValidatedMethod({
  name: "user.deleteLink",
  validate: new SimpleSchema({
    userId: String,
    index: SimpleSchema.Integer
  }).validator(),
  run({userId, index}){
    const user = Meteor.users.findOne(userId);
    if(!(user._id == Meteor.userId())) {
      throw new Meteor.Error("user.deleteLink.unauthorized",
      "Cannot delete Link from this Profile");
    }
    const currentLinks = user.profile.links;
    currentLinks.splice(index, 1);
    Meteor.users.update(userId,{$set:{"profile.links":currentLinks}});
  }
});

export const deleteImg = new ValidatedMethod({
  name: "image.deleteImg",
  validate: new SimpleSchema({
    imageId:String,
  }).validator(),
  run({imageId}){
    const image = Images.findOne(imageId);
    if (image.userId != Meteor.userId()){
      throw new Meteor.Error("image.deleteImg.unauthorized",
      "Cannot delete Image from this Project");
    }
    Images.remove({_id: imageId});
  }
});

export const setMediaType = new ValidatedMethod({
  name: "projects.setMediaType",
  validate: new SimpleSchema({
    collection: String,
    projectId: String,
    type:String,
    index: SimpleSchema.Integer,
  }).validator(),
  run({projectId, index,type, collection}){
    if (type == "null"){
      type = null
    }
    if(collection == "projects"){
      const project = Projects.findOne(projectId);
      const currentArray = project.media;
      currentArray[index].type = type;
      if(project.owner.userId != Meteor.userId()) {
        throw new Meteor.Error("projects.setMediaType.unauthorized",
        "Cannot delete Link from this Profile");
      }
      Projects.update(projectId,{$set: { "media": currentArray}} );
    } else {
      const draft = Drafts.findOne(projectId);
      const currentArray = draft.media;
      currentArray[index].type = type;
      if(draft.owner.userId != Meteor.userId()) {
        throw new Meteor.Error("projects.setMediaType.unauthorized",
        "Cannot delete Link from this Profile");
      }
      Drafts.update(projectId,{$set: { "media": currentArray}} );
    }
  }
});

export const setMediaId = new ValidatedMethod({
  name: "projects.setMediaId",
  validate: new SimpleSchema({
    collection: String,
    projectId: String,
    index: SimpleSchema.Integer,
    id: String,
  }).validator(),
  run({projectId, index,id, collection}){
    if (id == "null"){
      id = null
    }
    if(collection == "projects"){
      const project = Projects.findOne(projectId);
      const currentArray = project.media;
      currentArray[index].id = id;
      if(project.owner.userId != Meteor.userId()) {
        throw new Meteor.Error("projects.setMediaId.unauthorized",
        "Cannot delete Link from this Profile");
      }
      Projects.update(projectId,{$set: { "media": currentArray}} );
    } else {
      const draft = Drafts.findOne(projectId);
      const currentArray = draft.media;
      currentArray[index].id = id;
      if(draft.owner.userId != Meteor.userId()) {
        throw new Meteor.Error("projects.setMediaId.unauthorized",
        "Cannot delete Link from this Profile");
      }
      Drafts.update(projectId,{$set: {"media": currentArray}} );
    }
  }
});

export const setMedia = new ValidatedMethod({
  name: "projects.setMedia",
  validate: new SimpleSchema({
    collection: String,
    projectId: String,
  }).validator(),
  run({projectId, collection}){
    var mediaEmpty = [{type: null, id: null}, {type: null, id: null},{type: null, id: null}, {type: null, id: null}, {type: null, id: null}];
    if(collection == "projects"){
      const project = Projects.findOne(projectId);
      if(!(project.owner.userId == Meteor.userId())) {
        throw new Meteor.Error("projects.setMedia.unauthorized",
        "Cannot delete Link from this Profile");
      }

      Projects.update(projectId,{$set: { 'media': mediaEmpty }} );
      Projects.update(projectId,{$set: { 'coverImg': null }} );
    } else {
      const draft = Drafts.findOne(projectId);
      if(!(draft.owner.userId == Meteor.userId())) {
        throw new Meteor.Error("projects.setMedia.unauthorized",
        "Cannot delete Link from this Profile");
      }

      Drafts.update(projectId,{$set: { 'media': mediaEmpty}} );
      Drafts.update(projectId,{$set: { 'coverImg': null }} );
    }
  }
});



export const setCoverImg = new ValidatedMethod({
  name: "projects.setCoverImg",
  validate: new SimpleSchema({
    projectId: String,
    collection: String,
    index: SimpleSchema.Integer,
    coverImageId: String
  }).validator(),
  run({projectId, collection, coverImageId, index}){
    var newCoverId;
    if(collection == "projects"){
      const project = Projects.findOne(projectId);
      if(coverImageId == "empty"){
        newCoverId = project.media[index].id;
      } else{
        newCoverId = coverImageId;
      }
      if(project.owner.userId != Meteor.userId()) {
        throw new Meteor.Error("projects.setCoverImg.unauthorized",
        "Cannot delete Link from this Profile");
      }
      Projects.update(projectId,{ $set: { 'coverImg': newCoverId }} );
    } else {
      const draft = Drafts.findOne(projectId);
      if(coverImageId == "empty"){
        newCoverId = draft.media[index].id;
      } else{
        newCoverId = coverImageId;
      }
      if(draft.owner.userId != Meteor.userId()) {
        throw new Meteor.Error("projects.setCoverImg.unauthorized",
        "Cannot delete Link from this Profile");
      }
      Drafts.update(projectId,{ $set: { 'coverImg': newCoverId }} );
    }
  }
});

export const removeCoverImg = new ValidatedMethod({
  name: "removeCoverImg",
  validate: new SimpleSchema({
    projectId: String,
    collection: String,
  }).validator(),
  run({projectId, collection}){
    if(collection == "projects"){
      const project = Projects.findOne(projectId);
      if(project.owner.userId != Meteor.userId()) {
        throw new Meteor.Error("removeCoverImg.unauthorized",
        "Cannot delete Link from this Profile");
      }
      Projects.update(projectId,{ $set: { 'coverImg': null }} );
    } else {
      const draft = Drafts.findOne(projectId);
      if(draft.owner.userId != Meteor.userId()) {
        throw new Meteor.Error("removeCoverImg.unauthorized",
        "Cannot delete Link from this Profile");
      }
      Drafts.update(projectId,{ $set: { 'coverImg': null }} );
    }
  }
});


export const updateEditableInDraft = new ValidatedMethod({
  name: 'drafts.updateEditable',
  validate: new SimpleSchema({
    _id: String,
    modifier: {
      type: Object,
      blackbox: true
    }
  }).validator(),
  run({modifier, _id}) {
    const draft = Drafts.findOne(_id);
    if(!(draft.owner.userId == this.userId)) {
      throw new Meteor.Error("drafts.updateEditable.unauthorized",
      "You cannot edit draft that is not yours");
    }
    return Drafts.update({
      _id: _id
    }, modifier);
  }
});

export const updateEditableInUsers = new ValidatedMethod({
  name: "users.updateEditable",
  validate: new SimpleSchema({
    _id: String,
    modifier: {
      type: Object,
      blackbox: true,
    }
  }).validator(),
  run({modifier, _id}) {
    if(_id != this.userId) {
      throw new Meteor.Error("users.updateEditable.unauthorized",
      "You cannot edit a profile that is not yours");
    }
    return Meteor.users.update({
      _id: _id,
    }, modifier);
  }
});

export const projektUpdateVideoLink = new ValidatedMethod({
  name: 'projects.updateVideoLink',
  validate: new SimpleSchema({
    _id: String,
    modifier: {
      type: Object,
      blackbox: true
    }
  }).validator(),
  run({modifier, _id}) {
    const draft = Projects.findOne(_id);
    if(!(draft.owner.userId == this.userId)) {
      throw new Meteor.Error("projects.updateVideoLink.unauthorized",
      "You cannot edit draft that is not yours");
    }
    return Projects.update({
      _id: _id
    }, modifier);
  }
});

export const draftUpdateVideoLink = new ValidatedMethod({
  name: 'drafts.updateVideoLink',
  validate: new SimpleSchema({
    _id: String,
    modifier: {
      type: Object,
      blackbox: true
    }
  }).validator(),
  run({modifier, _id}) {
    const draft = Drafts.findOne(_id);
    if(!(draft.owner.userId == this.userId)) {
      throw new Meteor.Error("drafts.updateVideoLink.unauthorized",
      "You cannot edit draft that is not yours");
    }
    return Drafts.update({
      _id: _id
    }, modifier);
  }
});

export const updateEditableInProject = new ValidatedMethod({
  name: 'projects.updateEditable',
  validate: new SimpleSchema({
    _id: String,
    modifier: {
      type: Object,
      blackbox: true
    }
  }).validator(),
  run({modifier, _id}) {
    const project = Projects.findOne(_id);
    if(!(project.owner.userId == this.userId)) {
      throw new Meteor.Error("projects.updateEditable.unauthorized",
      "You cannot edit project that is not yours");
    }
    return Projects.update({
      _id: _id
    }, modifier);
  }
});
