import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';

import { Projects } from "/lib/collections/projects.js" ;
import { Drafts } from "/lib/collections/drafts.js";

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
    const draft = Drafts.findOne(draftId);
    if(!(draft.owner.userId == this.userId)) {
      throw new Meteor.Error("drafts.deleteDraft.unauthorized",
      "Cannot delete draft that is not yours");
    }
    Drafts.remove(draftId);
  }
});

// export const addMemberNames = new ValidatedMethod({
//   name: "project.addMemberNames",
//   validate: new SimpleSchema({
//     "projectId": String,
//     "isDraft": Boolean,
//   }).validator(),
//   run({ projectId, isDraft }) {
//     let project;
//     if(isDraft) {
//       project = Drafts.findOne(projectId);
//     } else {
//       project = Projects.findOne(projectId);
//     }
//     if(!(project.owner.userId == this.userId)) {
//       throw new Meteor.Error("project.addMemberNames.unauthorized",
//       "Cannot update draft/project that is not yours");
//     }
//   }
// });

export const addMember = new ValidatedMethod({
  name: "project.addMember",
  validate: new SimpleSchema({
    _id: String,
    modifier: {
      type: Object,
      blackbox: true
    },
  }).validator(),
  // validate: null,
  run({ _id, modifier }) {
    console.log(_id, modifier);
    Drafts.update(_id, modifier);
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
    if (!(image.userId == Meteor.userId())){
      throw new Meteor.Error("image.deleteImg.unauthorized",
      "Cannot delete Image from this Project");
    }
    Images.remove({_id: imageId});
  }
});

export const setMediaType = new ValidatedMethod({
  name: "projects.setMediaType",
  validate: new SimpleSchema({
    collection: Boolean,
    projectId: String,
    type:String,
    index: SimpleSchema.Integer,
  }).validator(),
  run({projectId, index,type, collection}){
    if (type == "null"){
      type = null
    }
    if(collection){
      const project = Projects.findOne(projectId);
      const currentArray = project.media;
      currentArray[index].type = type;
      if(!(project.owner.userId == Meteor.userId())) {
        throw new Meteor.Error("projects.setMediaType.unauthorized",
        "Cannot delete Link from this Profile");
      }
      Projects.update(projectId,{$set: { "media": currentArray}} );
    } else {
      const draft = Drafts.findOne(projectId);
      console.log(draft);
      const currentArray = draft.media;
      currentArray[index].type = type;
      if(!(draft.owner.userId == Meteor.userId())) {
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
    collection: Boolean,
    projectId: String,
    index: SimpleSchema.Integer,
    id: String,
  }).validator(),
  run({projectId, index,id, collection}){
    if (id == "null"){
      id = null
    }
    if(collection){
      const project = Projects.findOne(projectId);
      const currentArray = project.media;
      currentArray[index].id = id;
      if(!(project.owner.userId == Meteor.userId())) {
        throw new Meteor.Error("projects.setMediaId.unauthorized",
        "Cannot delete Link from this Profile");
      }
      Projects.update(projectId,{$set: { "media": currentArray}} );
    } else {
      const draft = Drafts.findOne(projectId);
      const currentArray = draft.media;
      currentArray[index].id = id;
      if(!(draft.owner.userId == Meteor.userId())) {
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
    collection: Boolean,
    projectId: String,
  }).validator(),
  run({projectId, collection}){
    var mediaEmpty = [{type: null, id: null}, {type: null, id: null},{type: null, id: null}, {type: null, id: null}, {type: null, id: null}];
    if(collection){
      const project = Projects.findOne(projectId);
      if(!(project.owner.userId == Meteor.userId())) {
        throw new Meteor.Error("projects.setMedia.unauthorized",
        "Cannot delete Link from this Profile");
      }

      Projects.update(projectId,{$set: { 'media': mediaEmpty }} );
    } else {
      const draft = Drafts.findOne(projectId);
      if(!(draft.owner.userId == Meteor.userId())) {
        throw new Meteor.Error("projects.setMedia.unauthorized",
        "Cannot delete Link from this Profile");
      }

      Drafts.update(projectId,{$set: { 'media': mediaEmpty}} );
    }
  }
});

export const setCoverImg2 = new ValidatedMethod({
  name: "projects.setCoverImg2",
  validate: new SimpleSchema({
    projectId: String,
    collection: Boolean,
    id: String,
  }).validator(),
  run({projectId,collection, id}){
    if (id == "null"){
      id = null
    }
    if(collection){
      const project = Projects.findOne(projectId);
      if(!(project.owner.userId == Meteor.userId())) {
        throw new Meteor.Error("projects.setCoverImg2.unauthorized",
        "Cannot delete Link from this Profile");
      }
      Projects.update(projectId,{ $set: { 'coverImg': id }} );
    } else {
      const draft = Drafts.findOne(projectId);
      if(!(draft.owner.userId == Meteor.userId())) {
        throw new Meteor.Error("projects.setCoverImg2.unauthorized",
        "Cannot delete Link from this Profile");
      }
      Drafts.update(projectId,{ $set: { 'coverImg': id }} );
    }
  }
});

export const setCoverImg = new ValidatedMethod({
  name: "projects.setCoverImg",
  validate: new SimpleSchema({
    projectId: String,
    array: Array,
    "array.$": Object,
    collection: Boolean,
    index: SimpleSchema.Integer,
  }).validator(),
  run({projectId, array, collection, index}){
    if(collection){
      const project = Projects.findOne(projectId);
      if(!(project.owner.userId == Meteor.userId())) {
        throw new Meteor.Error("projects.setCoverImg.unauthorized",
        "Cannot delete Link from this Profile");
      }
      Projects.update(projectId,{ $set: { 'coverImg': array[index].id }} );
    } else {
      const draft = Drafts.findOne(projectId);
      if(!(draft.owner.userId == Meteor.userId())) {
        throw new Meteor.Error("projects.setCoverImg.unauthorized",
        "Cannot delete Link from this Profile");
      }
      Drafts.update(projectId,{ $set: { 'coverImg': array[index].id }} );
    }
  }
});

export const setNewCoverImg = new ValidatedMethod({
  name: "projects.setNewCoverImg",
  validate: new SimpleSchema({
    projectId: String,
    array: Array,
    "array.$": Object,
    coverImageId: String,
  }).validator(),
  run({projectId, collection, coverImageId}){
    if(collection){
      const project = Projects.findOne(projectId);
      if(!(project.owner.userId == Meteor.userId())) {
        throw new Meteor.Error("projects.setNewCoverImg.unauthorized",
        "Cannot delete Link from this Profile");
      }
      Projects.update(projectId,{ $set: { 'coverImg': coverImageId }} );
    } else {
      const draft = Drafts.findOne(projectId);
      if(!(draft.owner.userId == Meteor.userId())) {
        throw new Meteor.Error("projects.setNewCoverImg.unauthorized",
        "Cannot delete Link from this Profile");
      }
      Drafts.update(projectId,{ $set: { 'coverImg': coverImageId }} );
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



// export const updateTitle = new ValidatedMethod({
//   name: 'project.updateTitle',
//   validate: new SimpleSchema({
//     _id: String,
//     modifier: {
//       type: Object,
//       // blackbox: true
//     }
//   }).validator(),
//   run({modifier, _id}) {
//     return Drafts.update({
//       _id: _id
//     }, modifier);
//   }
// });
