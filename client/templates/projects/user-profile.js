import { Template } from 'meteor/templating';
import {Images} from "/lib/collections/images.js";
import { Projects } from '../../../lib/collections/projects.js';
import { Studies } from "/lib/collections/studies.js";
import { avatarRemove } from "/lib/methods.js";
import './user-profile.html';
import './project_card.js';

Template.userProfile.onCreated(function userProfileOnCreated() {
  this.autorun(() => {
    //this.subscribe("projectsAll");
  });
  this.autorun(() => {
    //this.subscribe("usersAll");
  });
  this.autorun(() => {
    //this.subscribe("studies");
  });
  this.autorun(() => {
    //this.subscribe("files.images.all");
  });
  Session.set("previousRoute", FlowRouter.getRouteName());
});

Template.userProfile.helpers({
  facultyName(facultyId) {
    console.log(facultyId);
    const studyCourse = Studies.findOne({ "facultyId": facultyId });
    console.log(studyCourse);
    return studyCourse && studyCourse.facultyName;
  },
  departmentName(departmentId) {
    const studyCourse = Studies.findOne({ "departmentId": departmentId });
    return studyCourse && studyCourse.departmentName;
  },
  studyCourseName(studyCourseId, departmentId, facultyId) {
    const studyCourse = Studies.findOne({ $and: [
      { "studyCourseId": studyCourseId },
      { "departmentId": departmentId },
      { "facultyId": facultyId }
    ]});
    return studyCourse && studyCourse.studyCourseName;
  },
  getAvatarURL (userId, version){
    var user = Meteor.users.findOne({_id: userId});
    var image = user && (user.profile.avatar && Images.findOne(user.profile.avatar));
    return (image && image.versions[version]) ? image.link(version) : "/img/"+version+".jpg";
  },
  projects() {
    return Projects.find({}, { sort: { createdAt: -1 } });
  },
  getUserCollection() {
    return Meteor.users;
  },
});

Template.userProfile.events({
  "click #delete-avatar-button" (event, template){
  //Images.remove({_id: currentArray[currentSlot].id});
    avatarRemove.call({
      userId: Meteor.userId(),
    }, (err, res) => {
      if (err) {
        alert(err);
      }
    });
  }
});
