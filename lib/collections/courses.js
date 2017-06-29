import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import lodash from 'lodash';

export const Courses = new Mongo.Collection('courses');


if (Meteor.isServer) {
  Meteor.publish('courses', function coursePublication() {
    if (!this.userId) {
      return this.ready();
    }

    return Courses.find({}, {
      fields: {
        _id: 1,
        courseName: 1,
        courseSemester: 1,
        studyCourse: 1,
        owner: 1,
        member: 1,
      },
    });
  });
  const isCurrentUserInCourse = (course) => {
    const courseOwnersAndMembers = lodash.concat(course.owner, course.member);
    if (!lodash.includes(courseOwnersAndMembers, this.userId)) {
      return false;
    }
    return true;
  };
  Meteor.publish('singleCourse', function singleCoursePublication(courseId) {
    if (!this.userId) {
      return this.ready();
    }

    const course = Courses.find(courseId, {
      fields: {
        _id: 1,
        courseName: 1,
        courseSemester: 1,
        studyCourse: 1,
        owner: 1,
        member: 1,
        courseKey: 1,
      },
    });

    if (!isCurrentUserInCourse(course)) {
      return this.ready();
    }

    return course;
  });

  Meteor.publish('courseCard', function courseCardPublication(courseId) {
    if (!this.userId) {
      return this.ready();
    }

    const course = Courses.find(courseId, {
      fields: {
        _id: 1,
        courseName: 1,
        courseSemester: 1,
        studyCourse: 1,
        owner: 1,
        member: 1,
      }
    });

    if (!isCurrentUserInCourse(course)) {
      return this.ready();
    }

    return course;
  });
}

Courses.attachSchema(new SimpleSchema({
  courseSemester: {
    type: String,
  },
  courseName: {
    type: String,
    max: 15,
  },
  owner: {
    type: Array,
    autoValue() {
      if (this.isInsert) {
        return [this.userId];
      }
    },
  },
  'owner.$': {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  member: {
    type: Array,
    optional: true,
  },
  'member.$': {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  studyCourse: {
    type: String,
    max: 200,
  },
  courseKey: {
    type: String,
  },
  selfEnter: {
    type: Boolean,
    autoValue() {
      if (this.isInsert) {
        return false;
      }
    },
  },
  deadline: {
    type: Date,
    optional: true,
  },
}));

Courses.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});
