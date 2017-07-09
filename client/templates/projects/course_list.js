import { Projects } from '../../../lib/collections/projects.js';
import { Images } from '/lib/collections/images.js';
import { Studies } from '/lib/collections/studies.js';
import { Courses } from '/lib/collections/courses.js';
import { excel } from '/lib/methods.js';
import { XlsFiles } from '/lib/collections/xlsFiles.js';
import lodash from 'lodash';
import { saveGrading } from '/lib/methods.js';

Template.courseList.onCreated(function userListOnCreated() {
  this.gradingsRegex = /^$|^[1-4]([,.](0|3|7))?$|^5([,.]0)?$|^0[,.]7$/
  this.endOfUsers = new ReactiveVar(2);
  this.userItems = new ReactiveArray(['loadCourseUser']);
  TemplateVar.set('createLink', false);
  this.autorun(() => {
    this.subscribe('singleCourse', FlowRouter.getParam('courseId'));
  });
});

Template.courseList.helpers({
  canShow() {
    if (!Meteor.user()) {
      return false;
    }

    const courseId = FlowRouter.getParam('courseId');
    const course = Courses.findOne(courseId);

    if(!course) {
      return false;
    }
    const courseOwnersAndMembers = lodash.concat(course.owner, course.member);
    if (!lodash.includes(courseOwnersAndMembers, Meteor.userId())) {
      return false;
    }

    return true;
  },
  checkUser() {
    const course = Courses.findOne(FlowRouter.getParam('courseId'));
    if(lodash.includes(course.owner, Meteor.userId())){
      return true;
    }
  },
  userItems() {
    if (Template.instance().userItems.array()) {
      return Template.instance().userItems.array();
    }
  },
  createLink () {
    return TemplateVar.get('createLink');
    //return Template.instance().createLink.get();
  },
});

Template.courseList.events({
  'click #btn-assess-save' (event, template) {
    event.preventDefault();
    const course = Courses.findOne(FlowRouter.getParam('courseId'));
    if (course && course.member){
      lodash.forEach(course.member, function(memberId){
        var user = Meteor.users.findOne({_id: memberId})
        if(document.getElementById(user._id.toString())){
        // var html=document.getElementById(user._id.toString());
        var html2=document.getElementById(user._id.toString()).parentElement;
          if(user && user.profile.role == "Student"){
            if (!Template.instance().gradingsRegex.test(document.getElementById(user._id.toString()).value)){
              html2.setAttribute("class", "input-group has-error");
              // html.setAttribute("value", "Ungültige Eingabe");
            }
            else if(!document.getElementById(user._id.toString()).value.replace(/^\s+/g, '').length) {
              html2.setAttribute("class", "input-group has-warning");
            } else {
              const courseProjects = Projects.find({courseId: FlowRouter.getParam('courseId'), team: { $elemMatch: { userId: user._id } } });
              courseProjects.forEach(function(project) {
                if(project.team){
                  lodash.forEach(project.team, function(member){
                    if (member.userId == user._id){
                      saveGrading.call({
                        value: document.getElementById(user._id.toString()).value,
                        userId: user._id,
                        projectId: project._id,
                      }, (err, res) => {
                        if (err) {
                          alert(err);
                        }
                        html2.setAttribute("class", "input-group has-success");
                      });
                      return false;
                    }
                  });
                }
              });
            }
          }
        }
      });
    }
  },
  'click #excel-button' (event){
    event.preventDefault();
    console.log("test1")
    XlsFiles.remove({userId:FlowRouter.getParam('courseId')});
    Meteor.call(
    'excel',{
      courseId: FlowRouter.getParam('courseId'),
      excel: "memberlist",
      },
    );
    TemplateVar.set('createLink', true);
  },
  'click #helios-button' (event){
    event.preventDefault();
    console.log("test2")
    XlsFiles.remove({userId:FlowRouter.getParam('courseId')});
    Meteor.call(
    'excel',{
      courseId: FlowRouter.getParam('courseId'),
      excel: "helios",
      },
    );
    TemplateVar.set('createLink', true);
  },
});

Template.file.onCreated (function fileLinkOnCreated() {
  this.subscribe('files.xlsFiles.all');
});
Template.file.helpers({
  fileLink:function(){
    var file = XlsFiles.findOne({userId:FlowRouter.getParam('courseId')}, { sort: { createdAt: -1 } });
    if(file && file._id){
      if(file._id != Session.get('fileId')){
        window.location = file.link();
        TemplateVar.setTo('.createLink', 'createLink' ,  false);
        Session.set('fileId', file._id);
      }
    }
  },
});

Template.loadCourseUser.onCreated(function loadCourseUserOnCreated() {
  this.subscribe('user.profile.course', FlowRouter.getParam('courseId'));
});

Template.loadCourseUser.helpers({
  documents () {
    // $('.load-more--loading').removeClass('load-more--loading');
    return Meteor.users.find({}, { sort: { "profile.role": 1 } });
  },
});

Template.userCourseListItem.onCreated(function userCourseListItemOnCreated() {
  this.autorun(() => {
    //this.subscribe('users.profile.single', Template.currentData().userId);
    if (Template.currentData().userId){
      this.subscribe('userProjects', Template.currentData().userId);
      this.subscribe('files.images.avatar', Template.currentData().userId);
      this.subscribe('singleStudyInfo', Template.currentData().userId);
    }
  });
});

Template.userCourseListItem.helpers({
  checkUser() {
    const course = Courses.findOne(FlowRouter.getParam('courseId'));
    if(lodash.includes(course.owner, Meteor.userId())){
      return true;
    }
  },
  studyCourseName(studyCourseId, departmentId, facultyId) {
    const studyCourse = Studies.findOne({ $and: [
      { studyCourseId },
      { departmentId },
      { facultyId },
    ] });
    return studyCourse && studyCourse.studyCourseName;
  },
  user() {
    return Meteor.users.findOne(this.userId);
  },
  avatarURL() {
    const user = Meteor.users.findOne(this._id);
    const image = user && user.profile.avatar && Images.findOne(user.profile.avatar);
    return (image && image.versions.avatar50) ? image.link('avatar50') : '/img/avatar50.jpg';
  },
  userCourseProjects() {
    return Projects.find({courseId: FlowRouter.getParam('courseId'), team: { $elemMatch: { userId: this._id } } }, { sort: { createdAt: -1 } });
  },
  inputId(userId){
    return userId.toString();
  },
  gradingValue(userId) {
    const project = Projects.findOne({courseId: FlowRouter.getParam('courseId'), team: { $elemMatch: { userId: userId } } });
    var grading = false;
    if (project && project.team){
      lodash.forEach(project.team, function(member){
        if (member.userId == userId && member.grading){
          grading = member.grading;
          return false;
        }
      })
    }
    return grading
  },
});
