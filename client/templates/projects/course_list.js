import { Projects } from '../../../lib/collections/projects.js';
import { Images } from '/lib/collections/images.js';
import { Studies } from '/lib/collections/studies.js';
import { Courses } from '/lib/collections/courses.js';
import { excel } from '/lib/methods.js';
import { XlsFiles } from '/lib/collections/xlsFiles.js';
import lodash from 'lodash';
import { saveGrading } from '/lib/methods.js';

Template.courseList.onCreated(function userListOnCreated() {
  //Regulärer Ausdruck für die validierung der Noten eingaben
  this.gradingsRegex = /^$|^[1-4]([,.](0|3|7))?$|^5([,.]0)?$|^0[,.]7$/
  //Reaktive variable welche sich durchs nachladen von Nutzern erhöht, jede Mitgliederseite zeigt am Anfang nur 50 member an
  this.endOfUsers = new ReactiveVar(2);
  // reaktives Array
  this.userItems = new ReactiveArray(['loadCourseUser']);
  TemplateVar.set('createLink', false);
  // Daten eines einzelnen Kurs Documents holen
  this.autorun(() => {
    this.subscribe('singleCourse', FlowRouter.getParam('courseId'));
  });
});

Template.courseList.helpers({
  //canShow ist eine Funktion zum checken ob ein User eingeloggt ist und ob dieser Berechtigungen hat diese einsehen zu dürfen
  canShow() {
    if (!Meteor.user()) {
      return false;
    }
    // holt sich die Id des Kurses durch den FlowRouter, welche in der router.js definiert ist
    const courseId = FlowRouter.getParam('courseId');
    const course = Courses.findOne(courseId);

    if(!course) {
      return false;
    }
    //konkatenation von zwei Arrays
    const courseOwnersAndMembers = lodash.concat(course.owner, course.member);
    if (!lodash.includes(courseOwnersAndMembers, Meteor.userId())) {
      return false;
    }

    return true;
  },
  // checkUser kontrolliert ob der eingeloggte Nutzer ein Betreuer des Kurses ist
  checkUser() {
    const course = Courses.findOne(FlowRouter.getParam('courseId'));
    if(lodash.includes(course.owner, Meteor.userId())){
      return true;
    }
  },
  // Alle Mitglieder des Kurses werden geladen, und durch das reaktive array werden die automatisch neugeladen, sofern Änderungen stattfanden.
  userItems() {
    if (Template.instance().userItems.array()) {
      return Template.instance().userItems.array();
    }
  },
  createLink () {
    return TemplateVar.get('createLink');
  },
  courseId () {
    const course = Courses.findOne(FlowRouter.getParam('courseId'));
    return course._id;
  },
  courseName() {
    const course = Courses.findOne(FlowRouter.getParam('courseId'));
    return course.courseName;
  },
  courseSemester() {
    const course = Courses.findOne(FlowRouter.getParam('courseId'));
    return course.courseSemester;
  },
});

Template.courseList.events({
  //Speichern der Noten
  'click #btn-assess-save' (event, template) {
    //verhindert neu laden der Seite
    event.preventDefault();
    //Suchen des passenden Kurs Documents
    const course = Courses.findOne(FlowRouter.getParam('courseId'));
    if (course && course.member){
      lodash.forEach(course.member, function(memberId){
        var user = Meteor.users.findOne({_id: memberId})
        //jedes Noten Inputfield der Studenten bekommen eine id, die ihrer user document id entspricht
        if(document.getElementById(user._id.toString())){
        var userGrading=document.getElementById(user._id.toString()).parentElement;
          if(user && user.profile.role == "Student"){
            //validierung durch den Regulären Ausdruck, welcher in der onCreate function definiert wurde
            if (!Template.instance().gradingsRegex.test(document.getElementById(user._id.toString()).value)){
              userGrading.setAttribute("class", "input-group has-error");
            }
            else if(!document.getElementById(user._id.toString()).value.replace(/^\s+/g, '').length) {
              userGrading.setAttribute("class", "input-group has-warning");
            } else {
              //finden aller Kursprojekte in dem der Student als Mitglied eingetragen ist
              const courseProjects = Projects.find({courseId: FlowRouter.getParam('courseId'), team: { $elemMatch: { userId: user._id } } });
              courseProjects.forEach(function(project) {
                if(project.team){
                  lodash.forEach(project.team, function(member){
                    if (member.userId == user._id){
                      //Aufrufen der Servermethode saveGrading, und alle wichtigen Daten übergeben
                      saveGrading.call({
                        value: document.getElementById(user._id.toString()).value,
                        userId: user._id,
                        projectId: project._id,
                      }, (err, res) => {
                        if (err) {
                          alert(err);
                        }
                        userGrading.setAttribute("class", "input-group has-success");
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
  //Laden der Mitgliederliste
  'click #excel-button' (event){
    event.preventDefault();
    XlsFiles.remove({userId:FlowRouter.getParam('courseId')});
    Meteor.call(
    'excel',{
      courseId: FlowRouter.getParam('courseId'),
      excel: "memberlist",
      },
    );
    TemplateVar.set('createLink', true);
  },
  //Laden der Heliosliste
  'click #helios-button' (event){
    event.preventDefault();
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

//Bereitstellen der Excelfile als Download, nachdem erstellen der Datei durch die excel methode in methods.js
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

//Alle Nutzer des Kurses laden
Template.loadCourseUser.onCreated(function loadCourseUserOnCreated() {
  this.subscribe('user.profile.course', FlowRouter.getParam('courseId'));
});

Template.loadCourseUser.helpers({
  documents () {
    return Meteor.users.find({}, { sort: { "profile.role": 1 } });
  },
});

//Subscriben aller Daten die der Client benötigt
Template.userCourseListItem.onCreated(function userCourseListItemOnCreated() {
  this.autorun(() => {;
    if (Template.currentData().userId){
      this.subscribe('userProjects', Template.currentData().userId);
      this.subscribe('files.images.avatar', Template.currentData().userId);
      this.subscribe('singleStudyInfo', Template.currentData().userId);
    }
  });
});

//Alles Funktionen zum darstellen aller Daten eines einzelnen Nutzer auf der Mitgliederseite des Kurses
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
