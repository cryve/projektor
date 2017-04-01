import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import { Images } from '/lib/collections/images.js';
import { XlsFiles } from '/lib/collections/xlsFiles.js';
import { Projects } from "/lib/collections/projects.js" ;
import { Courses } from "/lib/collections/courses.js" ;
import { Drafts } from "/lib/collections/drafts.js";
import { Meteor } from 'meteor/meteor'
import { memberSchema } from "/lib/collections/schemas.js";
import { jobSchema } from "/lib/collections/schemas.js";
import { contactSchema } from "/lib/collections/schemas.js";
import { linkSchema } from "/lib/collections/schemas.js";
import { teamCommSchema } from "/lib/collections/schemas.js";
import { courseSchema } from "/lib/collections/schemas.js";
import { supervisorSchema } from "/lib/collections/schemas.js";
import { addCourseSchema } from "/lib/collections/schemas.js";

Meteor.methods({
  'excel'({ courseId}) {
    new SimpleSchema({
      courseId: String ,
    }).validate({courseId});

    if (!Meteor.userId()) {
      throw new Meteor.Error("pants-not-found", "Can't find my pants");
    }else{
      var test;
      var mongoXlsx = require('mongo-xlsx');
      var data = [];
      const userId = Meteor.userId();
      const courseProjects = Projects.find({courseId:courseId}, {supervisors:{$elemMatch:{userId: userId}}})
      courseProjects.forEach(function(project) {
        var projectObject = {name: project.courseId, id: project._id}
        data.push(projectObject);
      });
      /* Generate automatic model for processing (A static model should be used) */
      var model = mongoXlsx.buildDynamicModel(data);

      /* Generate Excel */
      if(Meteor.isServer){
        mongoXlsx.mongoData2Xlsx(data, model, function(err, data) {
          console.log('File saved at:', data.fullPath);
            XlsFiles.addFile(data.fullPath, {
              name:data.fullPath,
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              userId: courseId,
              meta: {}
            }, (error, fileRef)=>{
              console.log("fileRef:" + fileRef);
              test = XlsFiles.findOne({userId:courseId});
              console.log (test);
            });
        });
      };
    }
  }
});

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
export const insertEmptyCourseDraft = new ValidatedMethod({
  name: "drafts.insertEmptyCourseDraft",
  validate: new SimpleSchema({
    "courseId" : String,
  }).validator(),
  run({courseId}) {
    if (!this.userId) {
      throw new Meteor.Error('drafts.insertEmptyCourseDraft.unauthorized',
        'Cannot insert new draft because you are not logged in');
    }
    const course = Courses.findOne(courseId);
    const user = Meteor.users.findOne(course.owner);
    const supervisorId = user._id;
    console.log(supervisorId);
    const supervisorRole = user.profile.role
    return Drafts.insert({courseId:courseId, supervisors:[{userId: supervisorId, role: supervisorRole }] });
  }
});

export const publishDraft = new ValidatedMethod({
  name: "projects.publishDraft",
  validate: new SimpleSchema({
    "draftId": String,
  }).validator(),
  run({ draftId }) {
    const draft = Drafts.findOne(draftId);
    if (!_.contains(draft.editableBy, this.userId)) {
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
    if(!_.contains(draft.editableBy, this.userId)) {
      throw new Meteor.Error("drafts.deleteDraft.unauthorized",
      "Cannot delete draft that is not yours");
    }
    Drafts.remove(draftId);
    Meteor.users.update(this.userId, { $unset: { "profile.currentDraftId": "" } });
  }
});

export const deleteProject = new ValidatedMethod({
  name: "projects.deleteProjects",
  validate: new SimpleSchema({
    "projectId": String,
  }).validator(),
  run({ projectId }) {
    const project = Projects.findOne(projectId);
    if(!_.contains(project.editableBy, this.userId)) {
      throw new Meteor.Error("projects.deleteProject.unauthorized",
      "Cannot delete project that is not yours");
    }
    Projects.remove(projectId);
  }
});

export const deleteCourse = new ValidatedMethod({
  name: "deleteCourse",
  validate: new SimpleSchema({
    courseId: String,
  }).validator(),
  run({ courseId }) {
    const course = Courses.findOne(courseId);
    if(!(course.owner == this.userId)) {
      throw new Meteor.Error("deleteCourse.unauthorized",
      "Cannot delete Course that is not yours");
    }
    Courses.remove(courseId);
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
    if (!_.contains(draft.editableBy, this.userId)) {
      throw new Meteor.Error("drafts.addMember.unauthorized",
      "You cannot edit draft that is not yours");
    }
    Drafts.update(docId, { $push: { team: member } });
    if(member.isEditor) {
      Drafts.update(docId, { $addToSet: { editableBy: member.userId }})
    }
  }
});

export const addMemberToProject = new ValidatedMethod({
  name: "projects.addMember",
  validate: memberSchema.validator(),
  run({ docId, member }) {
    const project = Projects.findOne(docId);
    if (!_.contains(project.editableBy, this.userId)) {
      throw new Meteor.Error("projects.addMemberToProject.unauthorized",
      "You cannot edit project that is not yours");
    }
    Projects.update(docId, { $push: { team: member } });
    if(member.isEditor) {
      Projects.update(docId, { $addToSet: { editableBy: member.userId }})
    }
  }
});

export const addSupervisorToDraft = new ValidatedMethod({
  name: "drafts.addSupervisor",
  validate: supervisorSchema.validator(),
  run({ docId, supervisor }) {
    const draft = Drafts.findOne(docId);
    if (!_.contains(draft.editableBy, this.userId)) {
      throw new Meteor.Error("drafts.addSupervisorToDraft.unauthorized",
      "You cannot edit draft that is not yours");
    }
    const user = Meteor.users.findOne(supervisor.userId);
    supervisor.role = user.profile.role + " für " + user.profile.study;
    Drafts.update(docId, { $push: { supervisors: supervisor } });
    Drafts.update(docId, { $addToSet: { editableBy: supervisor.userId } });
  }
});

export const addSupervisorToProject = new ValidatedMethod({
  name: "projects.addSupervisor",
  validate: supervisorSchema.validator(),
  run({ docId, supervisor }) {
    const project = Projects.findOne(docId);
    if (!_.contains(project.editableBy, this.userId)) {
      throw new Meteor.Error("drafts.addSupervisorToProject.unauthorized",
      "You cannot edit project that is not yours");
    }
    const user = Meteor.users.findOne(supervisor.userId);
    supervisor.role = user.profile.role + " für " + user.profile.study;
    Projects.update(docId, { $push: { supervisors: supervisor } });
    Projects.update(docId, { $addToSet: { editableBy: supervisor.userId } });
  }
});

export const deleteEditableArrayItem = new ValidatedMethod({
  name: "editable.deleteArrayItem",
  validate: new SimpleSchema({
    collectionName: {
      type: String,
      allowedValues: ["drafts", "projects", "users"],
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
    }
  }).validator(),
  run({collectionName, docId, arrayField, item}) {
    currentCollection = Mongo.Collection.get(collectionName);
    const doc = currentCollection.findOne(docId);
    if(!((doc.editableBy && _.contains(doc.editableBy, this.userId))
      || (doc._id == this.userId)
      || item.userId == this.userId )) {
      throw new Meteor.Error(collectionName+".editable.deleteArrayItem.unauthorized",
      "You cannot delete array item in doc that is not yours");
    }
    if(doc.editableBy && _.contains(doc.editableBy, item.userId)
      && (doc.editableBy.length <= 1)) {
        throw new Meteor.Error(collectionName+".editable.deleteArrayItem.lastEditor",
        "You cannot leave project because you are the only member who can edit it");
    }
    let pullObj = {};
    pullObj[arrayField] = item;
    currentCollection.update( docId, { $pull: pullObj });
  }
});
export const addCourseToProject = new ValidatedMethod({
  name: "projects.addCourse",
  validate: addCourseSchema.validator(),
  run({docId, courseId}) {
    const project = Projects.findOne(docId);
    const course = Courses.findOne(courseId);
    if (project.owner.userId != this.userId) {
      throw new Meteor.Error("projects.addCourse.unauthorized",
      "You cannot edit project that is not yours");
    }
    const user = Meteor.users.findOne(course.owner);
    const supervisorsId = user._id;
    const supervisorRole = user.profile.role
    Projects.update(docId, { $set: { courseId: courseId } });
    Projects.update(docId, { $push: {supervisors:{userId: supervisorsId ,role: supervisorRole }}});
  }
});

export const addCourseToDraft = new ValidatedMethod({
  name: "drafts.addCourse",
  validate: addCourseSchema.validator(),
  run({docId, courseId}) {
    const draft = Drafts.findOne(docId);
    const course = Courses.findOne(courseId);
    if (draft.owner.userId != this.userId) {
      throw new Meteor.Error("drafts.addCourse.unauthorized",
      "You cannot edit project that is not yours");
    }
    const user = Meteor.users.findOne(course.owner);
    const supervisorsId = user._id;
    const supervisorRole = user.profile.role
    Drafts.update(docId, { $set: { courseId: courseId } });
    Drafts.update(docId, { $push: {supervisors:{userId: supervisorsId ,role: supervisorRole }}});
  }
});

export const addJobToDraft = new ValidatedMethod({
  name: "drafts.addJob",
  validate: jobSchema.validator(),
  run({ docId, job }) {
    const draft = Drafts.findOne(docId);
    if(!_.contains(draft.editableBy, this.userId)) {
      throw new Meteor.Error("drafts.addJob.unauthorized",
      "You cannot edit project that is not yours");
    }
    if(_.findWhere(draft.jobs, job)) {
      throw new Meteor.Error("drafts.addJob.alreadyExists",
      "You cannot add the same job twice");
    }
    Drafts.update(docId, { $push: { jobs: job } });
  }
});

export const addJobToProject = new ValidatedMethod({
  name: "projects.addJob",
  validate: jobSchema.validator(),
  run({ docId, job }) {
    const project = Projects.findOne(docId);
    if (!_.contains(project.editableBy, this.userId)) {
      throw new Meteor.Error("projects.addJob.unauthorized",
      "You cannot edit project that is not yours");
    }
    if(_.findWhere(project.jobs, job)) {
      throw new Meteor.Error("projects.addJob.alreadyExists",
      "You cannot add the same job twice");
    }
    Projects.update(docId, { $push: { jobs: job } });
  }
});

export const addContactToDraft = new ValidatedMethod({
  name: "drafts.addContact",
  validate: contactSchema.validator(),
  run({ docId, contact }) {
    const draft = Drafts.findOne(docId);
    if(!_.contains(draft.editableBy, this.userId)) {
      throw new Meteor.Error("drafts.addContact.unauthorized",
      "You cannot edit project that is not yours");
    }
    if(_.findWhere(draft.contacts, contact)) {
      throw new Meteor.Error("drafts.addContact.alreadyExists",
      "You cannot add the same contact twice");
    }
    Drafts.update(docId, { $push: { contacts: contact } });
  }
});

export const addContactToProject = new ValidatedMethod({
  name: "projects.addContact",
  validate: contactSchema.validator(),
  run({ docId, contact }) {
    const project = Projects.findOne(docId);
    if(!_.contains(project.editableBy, this.userId)) {
      throw new Meteor.Error("projects.addContact.unauthorized",
      "You cannot edit project that is not yours");
    }
    if(_.findWhere(project.contacts, contact)) {
      throw new Meteor.Error("projects.addContact.alreadyExists",
      "You cannot add the same contact twice");
    }
    Projects.update(docId, { $push: { contacts: contact } });
  }
});

export const addTeamCommToDraft = new ValidatedMethod({
  name: "drafts.addTeamComm",
  validate: teamCommSchema.validator(),
  run({ docId, teamComm }) {
    const draft = Drafts.findOne(docId);
    if(!_.contains(draft.editableBy, this.userId)) {
      throw new Meteor.Error("drafts.addTeamComm.unauthorized",
      "You cannot edit draft that is not yours");
    }
    if(_.findWhere(draft.teamCommunication, teamComm)) {
      throw new Meteor.Error("drafts.addTeamComm.alreadyExists",
      "You cannot add the same team communication option twice");
    }
    Drafts.update(docId, { $push: { teamCommunication: teamComm } });
  }
});

export const addTeamCommToProject = new ValidatedMethod({
  name: "projects.addTeamComm",
  validate: teamCommSchema.validator(),
  run({ docId, teamComm }) {
    const project = Projects.findOne(docId);
    if(!!_.contains(project.editableBy, this.userId)) {
      throw new Meteor.Error("projets.addTeamComm.unauthorized",
      "You cannot edit project that is not yours");
    }
    if(_.findWhere(project.teamCommunication, teamComm)) {
      throw new Meteor.Error("projects.addTeamComm.alreadyExists",
      "You cannot add the same team communication option twice");
    }
    Projects.update(docId, { $push: { teamCommunication: teamComm } });
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
    if(_.findWhere(user.profile.contacts, contact)) {
      throw new Meteor.Error("users.addContact.alreadyExists",
      "You cannot add the same contact twice");
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
    if(_.findWhere(user.profile.links, link)) {
      throw new Meteor.Error("users.addLink.alreadyExists",
      "You cannot add the same link twice");
    }
    Meteor.users.update(docId, { $push: { "profile.links": link } });
  }
});

export const setDraftIdInProfile = new ValidatedMethod({
  name: "users.addDraftId",
  validate: new SimpleSchema({
    userId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
    },
    draftId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
    },
  }).validator(),
  run({userId, draftId}) {
    if(userId != this.userId) {
      throw new Meteor.Error("users.addDraftId.unauthorized",
      "You cannot add draft to profile that is not yours");
    }
    Meteor.users.update(userId, { $set: {"profile.currentDraftId": draftId } });
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

      if(!_.contains(project.editableBy, this.userId)) {
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
      if(!_.contains(draft.editableBy, this.userId)) {
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
      if(!_.contains(project.editableBy, this.userId)) {
        throw new Meteor.Error("projects.setMediaType.unauthorized",
        "Cannot delete Link from this Profile");
      }
      Projects.update(projectId,{$set: { "media": currentArray}} );
    } else {
      const draft = Drafts.findOne(projectId);
      const currentArray = draft.media;
      currentArray[index].type = type;
      if(!_.contains(draft.editableBy, this.userId)) {
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
      if(!_.contains(project.editableBy, this.userId)) {
        throw new Meteor.Error("projects.setMediaId.unauthorized",
        "Cannot delete Link from this Profile");
      }
      Projects.update(projectId,{$set: { "media": currentArray}} );
    } else {
      const draft = Drafts.findOne(projectId);
      const currentArray = draft.media;
      currentArray[index].id = id;
      if(!_.contains(draft.editableBy, this.userId)) {
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
      if(!_.contains(project.editableBy, this.userId)) {
        throw new Meteor.Error("projects.setMedia.unauthorized",
        "Cannot delete Link from this Profile");
      }

      Projects.update(projectId,{$set: { 'media': mediaEmpty }} );
      Projects.update(projectId,{$set: { 'coverImg': null }} );
    } else {
      const draft = Drafts.findOne(projectId);
      if(!_.contains(draft.editableBy, this.userId)) {
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
      if(!_.contains(project.editableBy, this.userId)) {
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
      if(!_.contains(draft.editableBy, this.userId)) {
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
      if(!_.contains(project.editableBy, this.userId)) {
        throw new Meteor.Error("removeCoverImg.unauthorized",
        "Cannot delete Link from this Profile");
      }
      Projects.update(projectId,{ $set: { 'coverImg': null }} );
    } else {
      const draft = Drafts.findOne(projectId);
      if(!_.contains(draft.editableBy, this.userId)) {
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
    if(!_.contains(draft.editableBy, this.userId)) {
      throw new Meteor.Error("drafts.updateEditable.unauthorized",
      "You cannot edit draft that is not yours");
    }
    return Drafts.update({
      _id: _id
    }, modifier);
  }
});

export const updateEditableInCourse = new ValidatedMethod({
  name: 'courses.updateEditable',
  validate: new SimpleSchema({
    _id: String,
    modifier: {
      type: Object,
      blackbox: true
    }
  }).validator(),
  run({modifier, _id}) {
    const course = Courses.findOne(_id);
    if(!(course.owner== this.userId)) {
      throw new Meteor.Error("courses.updateEditable.unauthorized",
      "You cannot edit Course that is not yours");
    }
    return Courses.update({
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
    const project = Projects.findOne(_id);
    if(!_.contains(project.editableBy, this.userId)) {
      throw new Meteor.Error("projects.updateVideoLink.unauthorized",
      "You cannot edit project that is not yours");
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
    if(!_.contains(draft.editableBy, this.userId)) {
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
    _id: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
    },
    modifier: {
      type: Object,
      blackbox: true
    }
  }).validator(),
  run({modifier, _id}) {
    const project = Projects.findOne(_id);
    if(!_.contains(project.editableBy, this.userId)) {
      throw new Meteor.Error("projects.updateEditable.unauthorized",
      "You cannot edit project that is not yours");
    }
    return Projects.update({
      _id: _id
    }, modifier);
  }
});

export const insertCourseInCourses = new ValidatedMethod({
  name: 'courses.insert',
  validate: courseSchema.validator(),
  run(fields) {
    if(!Meteor.userId()) {
      throw new Meteor.Error("courses.insert.unauthorized",
      "You cannot edit Courses that is not yours");
    }
    return Courses.insert(fields);
  }
});

export const updateEditPermissions = new ValidatedMethod({
  name: "project.updateEditPermissions",
  validate: new SimpleSchema({
    collectionName: {
      type: String,
      allowedValues: ["drafts", "projects"],
    },
    docId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
    }
  }).validator(),
  run({collectionName, docId}) {
    const doc = Mongo.Collection.get(collectionName).findOne(docId);
    let editableBy = [doc.owner.userId];
    _.each(doc.team, function(member) {
      if(member.isEditor) {
        editableBy.push(member.userId);
      }
    });
    _.each(doc.supervisors, function(supervisor) {
      editableBy.push(supervisor.userId);
    });
    editableBy = _.uniq(editableBy);
    Mongo.Collection.get(collectionName).update(docId, { $set: { editableBy: editableBy } });
  }
});
