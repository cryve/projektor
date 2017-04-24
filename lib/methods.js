import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import lodash from 'lodash';
import toastr from 'toastr';
import { Images } from '/lib/collections/images.js';
import { XlsFiles } from '/lib/collections/xlsFiles.js';
import { Projects } from "/lib/collections/projects.js" ;
import { Courses } from "/lib/collections/courses.js" ;
import { Drafts } from "/lib/collections/drafts.js";
import { Studies } from "/lib/collections/studies.js";
import { Meteor } from 'meteor/meteor';
import { memberSchema } from "/lib/collections/schemas.js";
import { jobSchema } from "/lib/collections/schemas.js";
import { contactSchema } from "/lib/collections/schemas.js";
import { linkSchema } from "/lib/collections/schemas.js";
import { teamCommSchema } from "/lib/collections/schemas.js";
import { courseSchema } from "/lib/collections/schemas.js";
import { supervisorSchema } from "/lib/collections/schemas.js";
import { addCourseSchema } from "/lib/collections/schemas.js";
import { courseOwnerSchema} from "/lib/collections/schemas.js";

Meteor.methods({
  'excel'({ courseId}) {
    new SimpleSchema({
      courseId: String ,
    }).validate({courseId});

    if (!Meteor.userId()) {
      throw new Meteor.Error("No rights to download!!!");
    }else{
      var mongoXlsx = require('mongo-xlsx');
      var data = [{Projektname:" ", "Matr.Nr": " ", Vorname:" ", Nachname:" ", Studiengang: " "}];
      const userId = Meteor.userId();
      const courseProjects = Projects.find({courseId:courseId}, {supervisors:{$elemMatch:{userId: userId}}})
      courseProjects.forEach(function(project) {
        lodash.forEach(project.team, function(teamMember) {
          var user = Meteor.users.findOne(teamMember.userId)
          if(user.profile.role == "Student"){
            const studyCourse = Studies.findOne({
              "studyCourseId": user.profile.studyCourseId,
              "departmentId": user.profile.departmentId,
              "facultyId": user.profile.facultyId
            });
            console.log(studyCourse);
            var studiengang = "";
            if(studyCourse && studyCourse.studyCourseName){
              studiengang = studyCourse.studyCourseName
            }
            var projectObject = {
              Projektname: project.title,
              "Matr.Nr": user.profile.matricNo,
              Vorname:user.profile.firstname,
              Nachname:user.profile.lastname,
              Studiengang: studiengang,
              Notizen:project.notes,
            };
            data.push(projectObject);
          }
        });
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
    if(Meteor.user().profile.role == "Mitarbeiter") {
      return Drafts.insert({supervisors: [{ userId: this.userId, role: Meteor.user().profile.title }]});
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
    const course = Courses.findOne(courseId);
    if (!lodash.includes(course.owner, this.userId)) {
      throw new Meteor.Error('drafts.insertEmptyCourseDraft.unauthorized',
        'You are not allowed to add course projects to this course');
    }
    var ownerArray = [];
    lodash.forEach(course.owner, function(ownerId){
      var user = Meteor.users.findOne(ownerId)
      ownerArray.push({userId: user._id, role: user.profile.title})
    });
    const draftId = Drafts.insert({courseId:courseId, supervisors: ownerArray, deadline: course.deadline });
    updateEditPermissions.call({
      "collectionName": "drafts",
      "docId": draftId,
    },(err, res) => {
      if (err) {
        console.log(err);
      }
    });
    return draftId;
  }
});

export const createMassProjects = new ValidatedMethod({
  name: "createMassProjects",
  validate: new SimpleSchema({
    "courseId" : String,
    text: String
  }).validator(),
  run({courseId, text}) {
    const course = Courses.findOne(courseId);
    if (!lodash.includes(course.owner, this.userId)) {
      throw new Meteor.Error('createMassProjects.unauthorized',
        'You are not allowed to add course projects to this course');
    }
    let ownerArray = [];
    let permissions = {
      editInfos: [],
      manageMembers: [],
      manageCourses: [],
      deleteProject: [],
    };
    lodash.forEach(course.owner, function(ownerId){
      var user = Meteor.users.findOne(ownerId)
      ownerArray.push({userId: ownerId, role: user.profile.title});
      lodash.forEach(permissions, function(permittedUserIds, permissionKey) {
        permissions[permissionKey].push(ownerId);
      });
    });
    const textArray = text.split("\n");
    lodash.forEach(textArray, function(text){
      const projectId = Projects.insert({title:text, courseId:courseId, supervisors:ownerArray, deadline: course.deadline, permissions: permissions });
    })
  }
});

export const publishDraft = new ValidatedMethod({
  name: "projects.publishDraft",
  validate: new SimpleSchema({
    "draftId": {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
    },
  }).validator(),
  run({ draftId }) {
    const draft = Drafts.findOne(draftId);
    if (!lodash.includes(draft.permissions.editInfos, this.userId)
    || !lodash.includes(draft.permissions.manageMembers, this.userId)
    || !lodash.includes(draft.permissions.manageCourses, this.userId)
    || !lodash.includes(draft.permissions.deleteProject, this.userId)) {
      throw new Meteor.Error('projects.publishDraft.unauthorized',
        'Cannot publish draft that is not yours');
    }
    return Projects.insert(draft);
  }
});

export const deleteAllProjects = new ValidatedMethod({
  name: "deleteAllProjects",
  validate: new SimpleSchema({
    courseId: String,
  }).validator(),
  run({ courseId }) {
    const course = Courses.findOne(courseId)
    const courseProjects = Projects.find({courseId:courseId}, {supervisors:{$elemMatch:{userId: Meteor.userId()}}})
    if(!Meteor.userId() == course.owner) {
      throw new Meteor.Error("deleteAllProjects.unauthorized",
      "Cannot delete draft that is not yours");
    }
    if (courseProjects){
      courseProjects.forEach(function(project) {
        Projects.remove(project._id);
      })
    }
  }
});

export const deleteDraft = new ValidatedMethod({
  name: "drafts.deleteDraft",
  validate: new SimpleSchema({
    "draftId": String,
  }).validator(),
  run({ draftId }) {
    const draft = Drafts.findOne(draftId);
    if(!lodash.includes(draft.permissions.deleteProject, this.userId)) {
      throw new Meteor.Error("drafts.deleteDraft.unauthorized",
      "Cannot delete draft that is not yours");
    }
    Meteor.users.update(this.userId, { $pull: { "profile.drafts": { draftId: draftId } }});
    Drafts.remove(draftId);
  }
});

export const deleteProject = new ValidatedMethod({
  name: "projects.deleteProjects",
  validate: new SimpleSchema({
    "projectId": String,
  }).validator(),
  run({ projectId }) {
    const project = Projects.findOne(projectId);
    if(!lodash.includes(project.permissions.deleteProject, this.userId)) {
      throw new Meteor.Error("projects.deleteProject.unauthorized",
      "Cannot delete project that is not yours");
    }
    Projects.remove(projectId);
  }
});
export const deleteEditableCourse = new ValidatedMethod({
  name: "deleteEditableCourse",
  validate: new SimpleSchema({
    collectionName: {
      type: String,
      allowedValues: ["drafts", "projects"],
    },
    docId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
    },
  }).validator(),
  run({ collectionName, docId }) {
    currentCollection = Mongo.Collection.get(collectionName);
    const doc = currentCollection.findOne(docId);
    if(!lodash.includes(doc.permissions.manageCourses, this.userId)) {
      throw new Meteor.Error(collectionName+"deleteEditableCourse.unauthorized",
      "You are not allowed to edit courses in this document");
    }
    currentCollection.update(docId, { $unset: { "courseId": "" } });
  }
});

export const deleteCourse = new ValidatedMethod({
  name: "deleteCourse",
  validate: new SimpleSchema({
    courseId: String,
  }).validator(),
  run({ courseId }) {
    const course = Courses.findOne(courseId);
    if(!lodash.includes(course.owner, this.userId)) {
      throw new Meteor.Error("deleteCourse.unauthorized",
      "Cannot delete Course that is not yours");
    }
    Courses.remove(courseId);
  }
});

export const leaveCourse = new ValidatedMethod({
  name: "leaveCourse",
  validate: new SimpleSchema({
    courseId: String,
  }).validator(),
  run({ courseId }) {
    const course = Courses.findOne(courseId);
    if(!lodash.includes(course.owner, this.userId)) {
      throw new Meteor.Error("leave.unauthorized",
      "Cannot leave Course");
    }

    const courseProjects = Projects.find({courseId:courseId, supervisors:{$elemMatch:{userId: Meteor.userId()}}})
    const user = Meteor.user();
    console.log(user);
    Courses.update(courseId,{ $pull: {owner: user._id }});
    if (courseProjects){
      courseProjects.forEach(function(project) {
        console.log(project)
        Projects.update(project._id, { $pull: { supervisors:{userId:Meteor.userId()}}});
      })
    }
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
    if (!lodash.includes(draft.permissions.manageMembers, this.userId)
      || !lodash.includes(draft.permissions.editInfos, this.userId)) {
      throw new Meteor.Error("drafts.addMember.unauthorized",
      "You are not allowed to add a member to this draft");
    }
    Drafts.update(docId, { $push: { team: member } });
    lodash.forEach(member.permissions, function(hasPermission, permissionName) {
      if(hasPermission) {
        let addObj = {};
        addObj["permissions." + permissionName] = member.userId;
        Drafts.update(docId, { $addToSet: addObj });
      }
    });
  }
});

export const addMemberToProject = new ValidatedMethod({
  name: "projects.addMember",
  validate: memberSchema.validator(),
  run({ docId, member }) {
    const project = Projects.findOne(docId);
    if (!lodash.includes(project.permissions.manageMembers, this.userId)
      || !lodash.includes(project.permissions.editInfos, this.userId)) {
      throw new Meteor.Error("projects.addMember.unauthorized",
      "You are not allowed to add a member to this project");
    }
    Projects.update(docId, { $push: { team: member } });
    lodash.forEach(member.permissions, function(hasPermission, permissionName) {
      if(hasPermission) {
        let addObj = {};
        addObj["permissions." + permissionName] = member.userId;
        Projects.update(docId, { $addToSet: addObj });
      }
    });
  }
});

export const addSupervisorToCourse = new ValidatedMethod({
  name: "addSupervisorToCourse",
  validate: courseOwnerSchema.validator(),
  run({ docId, userId}) {
    const course = Courses.findOne(docId);
    if (!lodash.includes(course.owner, this.userId)) {
      throw new Meteor.Error("addSupervisorToCourse.unauthorized",
      "You cannot edit course that is not yours");
    }
    const courseProjects = Projects.find({courseId:docId, supervisors:{$elemMatch:{userId: Meteor.userId()}}})
    const user = Meteor.users.findOne(userId);
    Courses.update(docId, { $push: { owner: userId } });
    if (courseProjects){
      courseProjects.forEach(function(project) {
        Projects.update(project._id, { $addToSet: { supervisors: {userId:userId, role: user.profile.title }}});
        lodash.forEach(project.permissions, function(value, permissionName) {
          let addObj = {};
          addObj["permissions." + permissionName] = userId;
          Projects.update(project._id, { $addToSet: addObj });
        });
      })
    }
    Command: toastr["success"](user.profile.fullname +" wurde Erfolgreich dem Kurs Hinzugefügt");
  }
});

export const addSupervisorToDraft = new ValidatedMethod({
  name: "drafts.addSupervisor",
  validate: supervisorSchema.validator(),
  run({ docId, supervisor }) {
    const draft = Drafts.findOne(docId);
    if (!lodash.includes(draft.permissions.manageMembers, this.userId)
      || !lodash.includes(draft.permissions.editInfos, this.userId)) {
      throw new Meteor.Error("drafts.addMember.unauthorized",
      "You are not allowed to add a supervisor to this draft");
    }
    if(draft.courseId && !lodash.includes(draft.permissions.manageCourses, this.userId)) {
      throw new Meteor.Error("drafts.addMember.unauthorized",
      "You are not allowed to add a supervisor to this course draft");
    }
    const user = Meteor.users.findOne(supervisor.userId);
    supervisor.role = user.profile.title;
    Drafts.update(docId, { $push: { supervisors: supervisor } });
    lodash.forEach(draft.permissions, function(value, permissionName) {
      let addObj = {};
      addObj["permissions." + permissionName] = supervisor.userId;
      Drafts.update(docId, { $addToSet: addObj });
    });
  }
});

export const addSupervisorToProject = new ValidatedMethod({
  name: "projects.addSupervisor",
  validate: supervisorSchema.validator(),
  run({ docId, supervisor }) {
    const project = Projects.findOne(docId);
    if (!lodash.includes(project.permissions.manageMembers, this.userId)
      || !lodash.includes(project.permissions.editInfos, this.userId)) {
      throw new Meteor.Error("projects.addMember.unauthorized",
      "You are not allowed to add a supervisor to this project");
    }
    if(project.courseId && !lodash.includes(project.permissions.manageCourses, this.userId)) {
      throw new Meteor.Error("projects.addMember.unauthorized",
      "You are not allowed to add a supervisor to this course project");
    }
    const user = Meteor.users.findOne(supervisor.userId);
    supervisor.role = user.profile.title;
    Projects.update(docId, { $push: { supervisors: supervisor } });
    lodash.forEach(project.permissions, function(value, permissionName) {
      let addObj = {};
      addObj["permissions." + permissionName] = supervisor.userId;
      Projects.update(docId, { $addToSet: addObj });
    });
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
    if(lodash.includes(["teamCommunication", "jobs", "contacts"], arrayField)) {
      if(!lodash.includes(doc.permissions.editInfos, this.userId)) {
        throw new Meteor.Error(collectionName+".editable.deleteArrayItem.unauthorized",
        "You are not allowed to delete items from "+arrayField+" in this document.");
      }
    } else if(lodash.includes(["profile.contacts", "profile.links"], arrayField)) {
      if(doc._id != this.userId) {
        throw new Meteor.Error(collectionName+".editable.deleteArrayItem.unauthorized",
        "You are not allowed to edit profile that is not yours.");
      }
    } else if(lodash.includes(["team", "supervisors"], arrayField)) {
      const adminMembers = () => {
        return lodash.filter(doc.team, function(member) {
          return member.permissions.editInfos && member.permissions.manageMembers
            && member.permissions.manageCourses && member.permissions.deleteProject;
        });
      };
      const isUserAdminMember = (team, userId) => {
        const member = lodash.find(team, function(member) {
          return member.userId == userId;
        });
        if(member && member.permissions.editInfos && member.permissions.manageMembers
          && member.permissions.manageCourses && member.permissions.deleteProject) {
          return true;
        }
        return false;
      }
      const isUserInGroup = (group, userId) => {
        let foundUser = false;
        lodash.forEach(group, function(value) {
          if(lodash.includes(value, userId)) {
            foundUser = true;
            return false; // breaks the loop
          }
        });
        return foundUser;
      };

      if(arrayField == "team") {
        if(this.userId == item.userId) {
          if(doc.isNewProject && !isUserInGroup(doc.supervisors, this.userId)) {
            throw new Meteor.Error("drafts.editable.deleteArrayItem."+arrayField+".leaveDraftImpossible",
            "You cannot leave your own draft");
          }
          if(isUserAdminMember(doc.team, this.userId) && adminMembers().length === 1
          && (!doc.supervisors || doc.supervisors.length === 0)) {
            throw new Meteor.Error(collectionName+".editable.deleteArrayItem.lastAdmin",
            "You cannot leave "+arrayField+" because you are the only member with all permissions.");
          }
        } else if(!lodash.includes(doc.permissions.manageMembers, this.userId)) {
            throw new Meteor.Error(collectionName+".editable.deleteArrayItem.unauthorized",
            "You are not allowed to delete member from "+arrayField+" in this document.");
        }
      }
      if(arrayField == "supervisors") {
        if(this.userId == item.userId) {
          if(doc.isNewProject && !isUserInGroup(doc.team, this.userId)) {
            throw new Meteor.Error("editable.deleteArrayItem."+arrayField+".leaveDraftImpossible",
            "You cannot leave your own draft");
          }
          if(doc.supervisors.length === 1 && adminMembers().length === 0) {
            throw new Meteor.Error(collectionName+".editable.deleteArrayItem.lastAdmin",
            "You cannot leave "+arrayField+" because you are the only member with all permissions.");
          }
        } else if(!lodash.includes(doc.permissions.manageMembers, this.userId)) {
            throw new Meteor.Error(collectionName+".editable.deleteArrayItem.unauthorized",
            "You are not allowed to delete member from "+arrayField+" in this document.");
        } else if(doc.courseId && !lodash.includes(doc.permissions.manageCourses, this.userId)) {
          throw new Meteor.Error(collectionName+".editable.deleteArrayItem.unauthorized",
          "You are not allowed to delete supervisors from this course project.");
        }
      }
    } else {
      throw new Meteor.Error(collectionName+".editable.deleteArrayItem.missingPermissionCheck",
      "Please provide permissions checks to let only the right users delete items from "+arrayField);
    }

    let pullObj = {};
    pullObj[arrayField] = item;
    currentCollection.update( docId, { $pull: pullObj });

    if(lodash.includes(["team", "supervisors"], arrayField)) {
      updateEditPermissions.call({
        "collectionName": collectionName,
        "docId": docId,
      },(err, res) => {
        if (err) {
          console.log(err);
        }
      });
    }
  }
});

export const addCourseToProject = new ValidatedMethod({
  name: "projects.addCourse",
  validate: addCourseSchema.validator(),
  run({docId, courseId}) {
    const project = Projects.findOne(docId);
    const course = Courses.findOne(courseId);
    if (!lodash.includes(project.permissions.manageCourses, this.userId)) {
      throw new Meteor.Error("projects.addCourse.unauthorized",
      "You are not allowed to add courses to this project.");
    }
    lodash.forEach(course.owner, function(ownerId){
      var user = Meteor.users.findOne(ownerId)
      Projects.update(docId, { $addToSet: {supervisors: {userId: user._id, role: user.profile.title }}});
      Projects.update(docId, { $addToSet: {"permissions.editInfos": user._id}});
      Projects.update(docId, { $addToSet: {"permissions.manageMembers": user._id}});
      Projects.update(docId, { $addToSet: {"permissions.manageCourses": user._id}});
      Projects.update(docId, { $addToSet: {"permissions.deleteProject": user._id}});
    });
    Projects.update(docId, { $set: { courseId: courseId } });
    if(course.deadline) {
      Projects.update(docId, { $set: { deadline: course.deadline } });
    }
  }
});

export const addCourseToDraft = new ValidatedMethod({
  name: "drafts.addCourse",
  validate: addCourseSchema.validator(),
  run({docId, courseId}) {
    const draft = Drafts.findOne(docId);
    const course = Courses.findOne(courseId);
    if (!lodash.includes(draft.permissions.manageCourses, this.userId)) {
      throw new Meteor.Error("drafts.addCourse.unauthorized",
      "You are not allowed to add courses to this draft.");
    }
    lodash.forEach(course.owner, function(ownerId){
      var user = Meteor.users.findOne(ownerId)
      Drafts.update(docId, { $addToSet: { supervisors: { userId: user._id, role: user.profile.title }}});
      Drafts.update(docId, { $addToSet: {"permissions.editInfos": user._id}});
      Drafts.update(docId, { $addToSet: {"permissions.manageMembers": user._id}});
      Drafts.update(docId, { $addToSet: {"permissions.manageCourses": user._id}});
      Drafts.update(docId, { $addToSet: {"permissions.deleteProject": user._id}});
    });
    Drafts.update(docId, { $set: { courseId: courseId } });
    if(course.deadline) {
      Drafts.update(docId, { $set: { deadline: course.deadline } });
    }
  }
});

export const addJobToDraft = new ValidatedMethod({
  name: "drafts.addJob",
  validate: jobSchema.validator(),
  run({ docId, job }) {
    const draft = Drafts.findOne(docId);
    if(!lodash.includes(draft.permissions.editInfos, this.userId)) {
      throw new Meteor.Error("drafts.addJob.unauthorized",
      "You are not allowed to add jobs to this draft");
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
    if(!lodash.includes(project.permissions.editInfos, this.userId)) {
      throw new Meteor.Error("projects.addJob.unauthorized",
      "You are not allowed to add jobs to this project");
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
    if(!lodash.includes(draft.permissions.editInfos, this.userId)) {
      throw new Meteor.Error("drafts.addContact.unauthorized",
      "You are not allowed to add contacts to this draft");
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
    if(!lodash.includes(project.permissions.editInfos, this.userId)) {
      throw new Meteor.Error("projects.addContact.unauthorized",
      "You are not allowed to add contacts to this project");
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
    if(!lodash.includes(draft.permissions.editInfos, this.userId)) {
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
    if(!lodash.includes(project.permissions.editInfos, this.userId)) {
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
    courseId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
      optional: true,
    },
  }).validator(),
  run({userId, draftId, courseId}) {
    if(userId != this.userId) {
      throw new Meteor.Error("users.addDraftId.unauthorized",
      "You cannot add draft to profile that is not yours");
    }
    Meteor.users.update(userId, { $addToSet: {"profile.drafts":{courseId: courseId, draftId: draftId }}});
  }
});

export const imageRemove = new ValidatedMethod({
  name: "imageRemove",
  validate: new SimpleSchema({
    imageId: String,
  }).validator(),
  run({ imageId }) {
    const image = Images.findOne(imageId);
    // if (image.userId != Meteor.userId()){
    //   throw new Meteor.Error("imageRemove.unauthorized",
    //   "Cannot delete Image from this Project");
    // }
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

      if(!_.contains(project.permissions.editInfos, this.userId)) {
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
      if(!_.contains(draft.permissions.editInfos, this.userId)) {
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
      if(!_.contains(project.permissions.editInfos, this.userId)) {
        throw new Meteor.Error("projects.setMediaType.unauthorized",
        "Cannot delete Link from this Profile");
      }
      Projects.update(projectId,{$set: { "media": currentArray}} );
    } else {
      const draft = Drafts.findOne(projectId);
      const currentArray = draft.media;
      currentArray[index].type = type;
      if(!_.contains(draft.permissions.editInfos, this.userId)) {
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
      if(!_.contains(project.permissions.editInfos, this.userId)) {
        throw new Meteor.Error("projects.setMediaId.unauthorized",
        "Cannot delete Link from this Profile");
      }
      Projects.update(projectId,{$set: { "media": currentArray}} );
    } else {
      const draft = Drafts.findOne(projectId);
      const currentArray = draft.media;
      currentArray[index].id = id;
      if(!_.contains(draft.permissions.editInfos, this.userId)) {
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
      if(!_.contains(project.permissions.editInfos, this.userId)) {
        throw new Meteor.Error("projects.setMedia.unauthorized",
        "Cannot delete Link from this Profile");
      }

      Projects.update(projectId,{$set: { 'media': mediaEmpty }} );
      Projects.update(projectId,{$set: { 'coverImg': null }} );
    } else {
      const draft = Drafts.findOne(projectId);
      if(!_.contains(draft.permissions.editInfos, this.userId)) {
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
      if(!_.contains(project.permissions.editInfos, this.userId)) {
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
      if(!_.contains(draft.permissions.editInfos, this.userId)) {
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
      if(!_.contains(project.permissions.editInfos, this.userId)) {
        throw new Meteor.Error("removeCoverImg.unauthorized",
        "Cannot delete Link from this Profile");
      }
      Projects.update(projectId,{ $set: { 'coverImg': null }} );
    } else {
      const draft = Drafts.findOne(projectId);
      if(!_.contains(draft.permissions.editInfos, this.userId)) {
        throw new Meteor.Error("removeCoverImg.unauthorized",
        "Cannot delete Link from this Profile");
      }
      Drafts.update(projectId,{ $set: { 'coverImg': null }} );
    }
  }
});

export const updateMemberInDraft = new ValidatedMethod({
  name: 'drafts.updateMember',
  validate: new SimpleSchema({
    _id: String,
    modifier: {
      type: Object,
      blackbox: true,
    }
  }).validator(),
  run({modifier, _id}) {
    const draft = Drafts.findOne(_id);
    if (!lodash.includes(draft.permissions.manageMembers, this.userId)
      || !lodash.includes(draft.permissions.editInfos, this.userId)) {
      throw new Meteor.Error("drafts.addMember.unauthorized",
      "You are not allowed to edit members in this draft");
    }
    if(modifier["$set"]) {
      const regExpMemberUserIdKey = /^team\.\d\.userId$/;
      const userIdKey = lodash.find(lodash.keys(modifier["$set"]), function(value) {
        return regExpMemberUserIdKey.test(value);
      });
      const memberIndex = lodash.keys(modifier["$set"])[0].match(/\d/)[0];

      if(draft.team[memberIndex].userId === this.userId) {
        if(modifier["$set"][userIdKey] && (modifier["$set"][userIdKey] != this.userId)) {
          throw new Meteor.Error("drafts.updateEditable.changeOwnMemberImpossible",
          "You cannot change your own member item's user or permissions");
        }
        const permissionKeys = ["editInfos", "manageMembers", "manageCourses", "deleteProject"];
        const changingPermissions = lodash.filter(permissionKeys, function(permissionKey) {
          if(modifier["$set"]["team."+memberIndex+"permissions."+permissionKey]) {
            return modifier["$set"]["team."+memberIndex+"permissions."+permissionKey] !== draft.team[memberIndex].permissions[permissionKey];
          };
          return false;
        });
        console.log("changingPermissions", changingPermissions);
        if(changingPermissions.length > 0) {
          throw new Meteor.Error("drafts.updateEditable.changeOwnMemberImpossible",
          "You cannot change your own member item's user or permission");
        }
      }
    }
    Drafts.update({_id: _id}, modifier);
    updateEditPermissions.call({
      "collectionName": "drafts",
      "docId": _id,
    },(err, res) => {
      if (err) {
        console.log(err);
      }
    });
  }
});

export const updateMemberInProject = new ValidatedMethod({
  name: 'projects.updateMember',
  validate: new SimpleSchema({
    _id: String,
    modifier: {
      type: Object,
      blackbox: true,
    }
  }).validator(),
  run({modifier, _id}) {
    const project = Projects.findOne(_id);
    if (!lodash.includes(project.permissions.manageMembers, this.userId)
      || !lodash.includes(project.permissions.editInfos, this.userId)) {
      throw new Meteor.Error("projects.addMember.unauthorized",
      "You are not allowed to edit members in this project");
    }
    if(modifier["$set"]) {
      const regExpMemberUserIdKey = /^team\.\d\.userId$/;
      const userIdKey = lodash.find(lodash.keys(modifier["$set"]), function(value) {
        return regExpMemberUserIdKey.test(value);
      });
      const memberIndex = lodash.keys(modifier["$set"])[0].match(/\d/)[0];

      if(project.team[memberIndex].userId === this.userId) {
        if(modifier["$set"][userIdKey] && (modifier["$set"][userIdKey] != this.userId)) {
          throw new Meteor.Error("projects.updateEditable.changeOwnMemberImpossible",
          "You cannot change your own member item's user or permissions");
        }
        const permissionKeys = ["editInfos", "manageMembers", "manageCourses", "deleteProject"];
        const changingPermissions = lodash.filter(permissionKeys, function(permissionKey) {
          if(modifier["$set"]["team."+memberIndex+"permissions."+permissionKey]) {
            return modifier["$set"]["team."+memberIndex+"permissions."+permissionKey] !== project.team[memberIndex].permissions[permissionKey];
          };
          return false;
        });
        if(changingPermissions.length > 0) {
          throw new Meteor.Error("projects.updateEditable.changeOwnMemberImpossible",
          "You cannot change your own member item's user or permission");
        }
      }
    }
    Projects.update({_id: _id}, modifier);
    updateEditPermissions.call({
      "collectionName": "projects",
      "docId": _id,
    },(err, res) => {
      if (err) {
        console.log(err);
      }
    });
  }
});

export const updateEditableInfoInDraft = new ValidatedMethod({
  name: 'drafts.updateEditableInfo',
  validate: new SimpleSchema({
    _id: String,
    modifier: {
      type: Object,
      blackbox: true
    }
  }).validator(),
  run({modifier, _id}) {
    const draft = Drafts.findOne(_id);
    if(!lodash.includes(draft.permissions.editInfos, this.userId)) {
      throw new Meteor.Error("drafts.updateEditableInfo.unauthorized",
      "You are not allowed to edit this info field of the draft");
    }
    if(draft.courseId && modifier["$set"].deadline) {
      if(!lodash.includes(draft.permissions.manageCourses, this.userId)) {
        throw new Meteor.Error("drafts.updateEditableInfo.unauthorized",
        "You are not allowed to edit course infos in this draft");
      }
    }
    Drafts.update({_id: _id}, modifier);
  }
});

export const updateEditableInfoInProject = new ValidatedMethod({
  name: 'projects.updateEditableInfo',
  validate: new SimpleSchema({
    _id: String,
    modifier: {
      type: Object,
      blackbox: true
    }
  }).validator(),
  run({modifier, _id}) {
    const project = Projects.findOne(_id);
    if(!lodash.includes(project.permissions.editInfos, this.userId)) {
      throw new Meteor.Error("projects.updateEditableInfo.unauthorized",
      "You are not allowed to edit this info field of the project");
    }
    if(project.courseId && modifier["$set"].deadline) {
      if(!lodash.includes(project.permissions.manageCourses, this.userId)) {
        throw new Meteor.Error("projects.updateEditableInfo.unauthorized",
        "You are not allowed to edit course infos in this project");
      }
    }
    Projects.update({_id: _id}, modifier);
  }
});

export const enterProject = new ValidatedMethod({
  name: "enterProject",
  validate: new SimpleSchema({
    projectId: String,
    input: String,
  }).validator(),
  run({projectId, input}){
    toastr.options = {
    "closeButton": false,
    "debug": false,
    "newestOnTop": false,
    "progressBar": false,
    "positionClass": "toast-top-left",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
    }
    const project = Projects.findOne(projectId);
    const course = Courses.findOne(project.courseId);
    if(!Meteor.user()) {
      Command: toastr["error"]("Logge dich bitte ein!");
    } else if (course.courseKey != input){
      Command: toastr["error"]("Falscher Einschreibeschlüssel!!");
    }
    const member = {
      userId: Meteor.userId(),
      role: "Selbsteingeschriebenes Mitglied",
      permissions: {
        editInfos: true,
        manageMembers: false,
        manageCourses: false,
        deleteProject: false,
      },
    };
    Projects.update(projectId, { $push: { team: member } });
    lodash.forEach(member.permissions, function(hasPermission, permissionName) {
      if(hasPermission) {
        let addObj = {};
        addObj["permissions." + permissionName] = member.userId;
        Projects.update(projectId, { $addToSet: addObj });
      }
    });
  }
});

export const setSelfEnter = new ValidatedMethod({
  name: "setSelfEnter",
  validate: new SimpleSchema({
    buttonEvent: Boolean,
    courseId: String
  }).validator(),
  run({buttonEvent, courseId}){
    console.log(buttonEvent, courseId);
    if(!Meteor.user()) {
      throw new Meteor.Error("setSelfEnter.unauthorized",
      "Cannot Update in current course");
    }
    if(buttonEvent){
      Courses.update(courseId,{ $set: { 'selfEnter': false }} );
    } else {
      Courses.update(courseId,{ $set: { 'selfEnter': true }} );
    }
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
    if(!lodash.includes(course.owner, this.userId)) {
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
    if(!lodash.includes(project.permissions.editInfos, this.userId)) {
      throw new Meteor.Error("projects.updateVideoLink.unauthorized",
      "You are not allowed to edit gallery of this project");
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
    if(!lodash.includes(draft.permissions.editInfos, this.userId)) {
      throw new Meteor.Error("drafts.updateVideoLink.unauthorized",
      "You are not allowed to edit gallery of this draft");
    }
    return Drafts.update({
      _id: _id
    }, modifier);
  }
});

export const insertCourseInCourses = new ValidatedMethod({
  name: 'courses.insert',
  validate: courseSchema.validator(),

  run(fields) {
    console.log(fields);
    if(!Meteor.userId()) {
      throw new Meteor.Error("courses.insert.unauthorized",
      "You cannot edit Courses that is not yours");
    }
    return Courses.insert(fields);
  }
});

export const setCourseDeadline = new ValidatedMethod({
  name: 'setCourseDeadline',
  validate: new SimpleSchema({
    _id:String,
    modifier: {
      type: Object,
      blackbox: true
    }
  }).validator(),
  run({modifier, _id}) {
    if(!Meteor.userId()) {
      throw new Meteor.Error("courses.insert.unauthorized",
      "You cannot edit Courses that is not yours");
    }
    const courseProjects = Projects.find({courseId:_id}, {supervisors:{$elemMatch:{userId: Meteor.userId()}}})
    if (courseProjects){
      courseProjects.forEach(function(project) {
        Projects.update({
          _id: project._id
        }, modifier);
      })
    }
    return Courses.update({
      _id: _id
    }, modifier);
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
    const permissionKeys = lodash.keys(doc.permissions);
    let permissions = {};
    lodash.forEach(doc.team, function(member) {
      lodash.forEach(permissionKeys, function(permissionKey) {
        permissions[permissionKey] = permissions[permissionKey] || [];
        if(member.permissions[permissionKey]) {
          permissions[permissionKey].push(member.userId);
        }
      });
    });
    lodash.forEach(doc.supervisors, function(supervisor) {
      lodash.forEach(permissionKeys, function(permissionKey) {
        permissions[permissionKey] = permissions[permissionKey] || [];
        permissions[permissionKey].push(supervisor.userId);
      });
    });
    console.log("updated permissions:", permissions);
    Mongo.Collection.get(collectionName).update(docId, { $set: { permissions: permissions } });
  }
});
