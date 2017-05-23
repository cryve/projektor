import { Courses } from '/lib/collections/courses.js';
import { Projects } from '/lib/collections/projects.js';
import lodash from 'lodash';
Template.courseCard.onCreated (function courseOnCreated() {

  this.subscribe("courseCard", Template.currentData().courseId);
  this.subscribe("courseProjects", Template.currentData().courseId);
  this.subscribe("usersAll");
  this.editActive = new ReactiveVar(false);
  this.editCourse = new ReactiveVar(false);
});

Template.courseCard.helpers({
  countStudents(courseId){
    var students = [];
    var course = Courses.findOne(courseId)
    const courseProjects = Projects.findFromPublication("courseProjects");
    courseProjects.forEach(function(project) {
      if(project.team){
        lodash.forEach(project.team, function(value) {
          var user = Meteor.users.findOne(value.userId)
          if(user && (!lodash.includes(students, user._id)) && (user.profile.role == "Student") ){
            students.push(user._id)
          }
        });
      }
    });
    return students.length;
  },
  countCourseProjects(courseId){
    var course = Courses.findOne(courseId)
    var count = Projects.findFromPublication("courseProjects").count();
    return count;
  },
  courseCard(){
    return Courses.findOne(this.courseId);
  }
})
