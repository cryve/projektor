import { Courses } from '/lib/collections/courses.js';
import { Projects } from '/lib/collections/projects.js';
import lodash from 'lodash';
Template.courseCard.onCreated (function courseOnCreated() {
  this.autorun(() => {
    this.subscribe("courseProjects", Template.currentData().courseId);
    this.subscribe("courseCard", Template.currentData().courseId);
  });
  this.subscribe("usersAll");
  this.editActive = new ReactiveVar(false);
  this.editCourse = new ReactiveVar(false);
});

Template.courseCard.helpers({
  countStudents(courseId){
    var students = [];
    var course = Courses.findOne(courseId)
    const courseProjects = Projects.find({courseId:courseId, supervisors:{$elemMatch:{userId:{$in: course.owner}}}})
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
    const course = Courses.findOne(courseId)
    const count = Projects.find({courseId:courseId, supervisors:{$elemMatch:{userId:{$in: course.owner}}}}).count();
    return count;
  },
  courseCard(){
    return Courses.findOne(this.courseId);
  }
})
