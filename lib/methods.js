import { ValidatedMethod } from 'meteor/mdg:validated-method';

import { Projects } from "/lib/collections/projects.js" ;
import { ProjectDrafts } from "/lib/collections/project_drafts.js";

export const insertEmptyDraft = new ValidatedMethod({
  name: "projectDrafts.insertEmptyDraft",
  validate: new SimpleSchema({}).validator(),
  run() {
    if (!this.userId) {
      throw new Meteor.Error('projectDrafts.insertNew.unauthorized',
        'Cannot insert new draft because you are not logged in');
    }
    return ProjectDrafts.insert({});
  }
});

export const publishDraft = new ValidatedMethod({
  name: "projects.publishDraft",
  validate: new SimpleSchema({
    "draftId": { type: String },
  }).validator(),
  run({ draftId }) {
    const draft = ProjectDrafts.findOne(draftId);
    if (!(draft.owner.userId == this.userId)) {
      throw new Meteor.Error('projects.publishDraft.unauthorized',
        'Cannot publish draft that is not yours');
    }
    return Projects.insert(draft);
  }
});

export const deleteDraft = new ValidatedMethod({
  name: "projectDrafts.deleteDraft",
  validate: new SimpleSchema({
    "draftId": { type: String },
  }).validator(),
  run({ draftId }) {
    const draft = ProjectDrafts.findOne(draftId);
    if(!(draft.owner.userId == this.userId)) {
      throw new Meteor.Error("projectDrafts.deleteDraft.unauthorized",
      "Cannot delete draft that is not yours");
    }
    ProjectDrafts.remove(draftId);
  }
});

// export const addMemberNames = new ValidatedMethod({
//   name: "project.addMemberNames",
//   validate: new SimpleSchema({
//     "projectId": { type: String },
//     "isDraft": { type: Boolean },
//   }).validator(),
//   run({ projectId, isDraft }) {
//     let project;
//     if(isDraft) {
//       project = ProjectDrafts.findOne(projectId);
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
    _id: { type: String },
    modifier: {
      type: Object,
      blackbox: true
    },
  }).validator(),
  // validate: null,
  run({ _id, modifier }) {
    console.log(_id, modifier);
    ProjectDrafts.update(_id, modifier);
  }
});

export const deleteContact = new ValidatedMethod({
  name: "user.deleteContact",
  validate: new SimpleSchema({
    userId: {type: String},
    index: {type: Number}
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
    userId: {type: String},
    index: {type: Number}
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
    imageId:{type: String},
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
    collection: {type: Boolean},
    projectId: {type: String},
    type:{type: String},
    index: {type: Number},
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
      const draft = ProjectDrafts.findOne(projectId);
      console.log(draft);
      const currentArray = draft.media;
      currentArray[index].type = type;
      if(!(draft.owner.userId == Meteor.userId())) {
        throw new Meteor.Error("projects.setMediaType.unauthorized",
        "Cannot delete Link from this Profile");
      }
      ProjectDrafts.update(projectId,{$set: { "media": currentArray}} );
    }
  }
});

export const setMediaId = new ValidatedMethod({
  name: "projects.setMediaId",
  validate: new SimpleSchema({
    collection: {type: Boolean},
    projectId: {type: String},
    index: {type: Number},
    id:{type: String}
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
      const draft = ProjectDrafts.findOne(projectId);
      const currentArray = draft.media;
      currentArray[index].id = id;
      if(!(draft.owner.userId == Meteor.userId())) {
        throw new Meteor.Error("projects.setMediaId.unauthorized",
        "Cannot delete Link from this Profile");
      }
      ProjectDrafts.update(projectId,{$set: {"media": currentArray}} );
    }
  }
});

export const setMedia = new ValidatedMethod({
  name: "projects.setMedia",
  validate: new SimpleSchema({
    collection: {type: Boolean},
    projectId: {type: String},
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
      const draft = ProjectDrafts.findOne(projectId);
      if(!(draft.owner.userId == Meteor.userId())) {
        throw new Meteor.Error("projects.setMedia.unauthorized",
        "Cannot delete Link from this Profile");
      }
       
      ProjectDrafts.update(projectId,{$set: { 'media': mediaEmpty}} );
    }
  }
});

export const setCoverImg2 = new ValidatedMethod({
  name: "projects.setCoverImg2",
  validate: new SimpleSchema({
    projectId: {type: String},
    collection: {type: Boolean},
    id: {type: String}
  }).validator(),
  run({projectId,collection, id}){
    if(collection){
      const project = Projects.findOne(projectId);
      if(!(project.owner.userId == Meteor.userId())) {
        throw new Meteor.Error("projects.setCoverImg2.unauthorized",
        "Cannot delete Link from this Profile");
      }
      Projects.update(projectId,{ $set: { 'coverImg': id }} );
    } else {
      const draft = ProjectDrafts.findOne(projectId);
      if(!(draft.owner.userId == Meteor.userId())) {
        throw new Meteor.Error("projects.setCoverImg2.unauthorized",
        "Cannot delete Link from this Profile");
      }
      ProjectDrafts.update(projectId,{ $set: { 'coverImg': id }} );
    }
  }
});

export const setCoverImg = new ValidatedMethod({
  name: "projects.setCoverImg",
  validate: new SimpleSchema({
    projectId: {type: String},
    array: {type: [Object]},
    collection: {type: Boolean},
    index: {type: Number}
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
      const draft = ProjectDrafts.findOne(projectId);
      if(!(draft.owner.userId == Meteor.userId())) {
        throw new Meteor.Error("projects.setCoverImg.unauthorized",
        "Cannot delete Link from this Profile");
      }
      ProjectDrafts.update(projectId,{ $set: { 'coverImg': array[index].id }} );
    }
  }
});

export const setNewCoverImg = new ValidatedMethod({
  name: "projects.setNewCoverImg",
  validate: new SimpleSchema({
    projectId: {type: String},
    array: {type: [Object]},
    coverImageId:{type: String}
  }).validator(),
  run({projectId, collection, coverImageId}){
    if(collection){
      const project = Projects.findOne(projectId);
      if(!(project.owner.userId == Meteor.userId())) {
        throw new Meteor.Error("user.deleteLink.unauthorized",
        "Cannot delete Link from this Profile");
      }
      Projects.update(projectId,{ $set: { 'coverImg': coverImageId }} );
    } else {
      const draft = ProjectDrafts.findOne(projectId);
      if(!(draft.owner.userId == Meteor.userId())) {
        throw new Meteor.Error("user.deleteLink.unauthorized",
        "Cannot delete Link from this Profile");
      }
      ProjectDrafts.update(projectId,{ $set: { 'coverImg': coverImageId }} );
    }
  }
});

export const updateEditableInDraft = new ValidatedMethod({
  name: 'projectDrafts.updateEditable',
  validate: new SimpleSchema({
    _id: { type: String },
    modifier: {
      type: Object,
      blackbox: true
    }
  }).validator(),
  run({modifier, _id}) {
    const draft = ProjectDrafts.findOne(_id);
    if(!(draft.owner.userId == this.userId)) {
      throw new Meteor.Error("projectDrafts.updateEditable.unauthorized",
      "You cannot edit draft that is not yours");
    }
    return ProjectDrafts.update({
      _id: _id
    }, modifier);
  }
});

export const projektUpdateVideoLink = new ValidatedMethod({
  name: 'projects.updateVideoLink',
  validate: new SimpleSchema({
    _id: { type: String },
    modifier: {
      type: Object,
      blackbox: true
    }
  }).validator(),
  run({modifier, _id}) {
    const draft = Projects.findOne(_id);
    if(!(draft.owner.userId == this.userId)) {
      throw new Meteor.Error("project.updateVideoLink.unauthorized",
      "You cannot edit draft that is not yours");
    }
    return Project.update({
      _id: _id
    }, modifier);
  }
});

export const draftUpdateVideoLink = new ValidatedMethod({
  name: 'projectDrafts.updateVideoLink',
  validate: new SimpleSchema({
    _id: { type: String },
    modifier: {
      type: Object,
      blackbox: true
    }
  }).validator(),
  run({modifier, _id}) {
    const draft = ProjectDrafts.findOne(_id);
    if(!(draft.owner.userId == this.userId)) {
      throw new Meteor.Error("projectsDrafts.updateVideoLink.unauthorized",
      "You cannot edit draft that is not yours");
    }
    return ProjectDrafts.update({
      _id: _id
    }, modifier);
  }
});

export const updateEditableInProject = new ValidatedMethod({
  name: 'projects.updateEditable',
  validate: new SimpleSchema({
    _id: { type: String },
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
//     _id: { type: String },
//     modifier: {
//       type: Object,
//       // blackbox: true
//     }
//   }).validator(),
//   run({modifier, _id}) {
//     return ProjectDrafts.update({
//       _id: _id
//     }, modifier);
//   }
// });
