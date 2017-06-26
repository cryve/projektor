import { Meteor } from 'meteor/meteor';
import { Courses } from 'meteor/projektor:courses';
import { Projects } from 'meteor/projektor:projects';
import Users from 'meteor/projektor:users';
import { Template } from 'meteor/templating';
import lodash from 'lodash';
import toastr from 'toastr';
import './course.html';

Template.course.onCreated(function courseOnCreated() {
  toastr.options = {
    closeButton: false,
    debug: false,
    newestOnTop: false,
    progressBar: false,
    positionClass: 'toast-top-left',
    preventDuplicates: false,
    onclick: null,
    showDuration: '300',
    hideDuration: '1000',
    timeOut: '5000',
    extendedTimeOut: '1000',
    showEasing: 'swing',
    hideEasing: 'linear',
    showMethod: 'fadeIn',
    hideMethod: 'fadeOut',
  };
  this.subscribe('courses');
  this.subscribe('projectsAll');
  this.subscribe('usersCourseAll');
  this.editActive = new ReactiveVar(false);
  this.editCourse = new ReactiveVar(false);
});

Template.course.helpers({
  getCollection() {
    return Courses;
  },
  courses() {
    return Courses.find({});
  },
  countCourseProjects(courseId) {
    const course = Courses.findOne(courseId);
    const count = Projects.find({ courseId, supervisors: { $elemMatch: { userId: { $in: course.owner } } } }).count();
    return count;
  },
  checkCourseOwner(courseId) {
    if (Courses.findOne({ _id: courseId, owner: Meteor.userId() })) {
      return true;
    }
  },
  countStudents(courseId) {
    const students = [];
    const course = Courses.findOne(courseId);
    const courseProjects = Projects.find({ courseId, supervisors: { $elemMatch: { userId: { $in: course.owner } } } });
    courseProjects.forEach(function(project) {
      if (project.team) {
        lodash.forEach(project.team, function(value) {
          const user = Users.findOne(value.userId);
          if ((!lodash.includes(students, user._id)) && (user.profile.role == 'Student')) {
            students.push(user._id);
          }
        });
      }
    });
    return students.length;
  },
  editActive () {
    return Template.instance().editActive.get();
  },
  editCourse () {
    return Template.instance().editCourse.get();
  },
  currentDoc() {
    const result = Template.instance().editCourse.get();
    // document.getElementById('idUpdate');
    if (result) {
      const test = Courses.findOne(result);
      return test;
    }
    Template.instance().editCourse.set(false);
  },
});

Template.course.events({
  'click .btn-create-course' (event) {
    Template.instance().editCourse.set(false);
    Template.instance().editActive.set(true);
  },
  'click .btn-abort-editing' (event) {
    Template.instance().editActive.set(false);
  },
  'click .btn-abort-course-editing' (event) {
    Template.instance().editCourse.set(false);
  },
  'click .btn-delete-course' (event) {
    event.preventDefault();
    const result = event.currentTarget;
    const courseId = result.dataset.id;
    const course = Courses.findOne(courseId);
    Modal.show('deleteCourseModal', {
      docId: courseId,
      docTitle: course.courseName,
    });
  },
  'click .btn-edit-course' (event) {
    event.preventDefault();
    const result = event.currentTarget;
    const courseId = result.dataset.id;
    Template.instance().editActive.set(false);
    Template.instance().editCourse.set(courseId);
  },
});

Template.deleteCourseModal.events({
  'click #btn-delete'(event) {
    Courses.deleteCourse.call({
      courseId: this.docId,
    }, (err, res) => {
      if (err) {
        alert(err);
      } else {
        toastr.success('Kurs wurde erfolgreich gelöscht!');
        Modal.hide();
      }
    });
  },
});
