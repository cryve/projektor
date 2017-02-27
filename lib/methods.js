import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import { Images } from '/lib/collections/images.js';
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

export const imageRemove = new ValidatedMethod({
  name: "image.delete",
  validate: new SimpleSchema({
    imageId: String,
  }).validator(),
  run({ imageId }) {
    const image = Images.findOne(imageId);
    if (!(image.userId == Meteor.userId())){
      throw new Meteor.Error("image.deleteImg.unauthorized",
      "Cannot delete Image from this Project");
    }
    Images.remove({_id: imageId});
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
      console.log(draft.owner.userId);
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
