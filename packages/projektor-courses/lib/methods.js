import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import lodash from 'lodash';
import { Courses } from './collections/courses.js';
import { courseSchema } from './schemas.js';

Courses.updateEditableInCourse = new ValidatedMethod({
  name: 'courses.updateEditable',
  validate: new SimpleSchema({
    _id: String,
    modifier: {
      type: Object,
      blackbox: true,
    },
  }).validator(),
  run({ modifier, _id }) {
    const course = Courses.findOne(_id);
    if (!lodash.includes(course.owner, this.userId)) {
      throw new Meteor.Error('courses.updateEditable.unauthorized',
      'You cannot edit Course that is not yours');
    }
    return Courses.update({
      _id,
    }, modifier);
  },
});

Courses.insertCourseInCourses = new ValidatedMethod({
  name: 'courses.insert',
  validate: courseSchema.validator(),
  run(fields) {
    if (!this.userId || (Meteor.user().profile.role != 'Mitarbeiter')) {
      throw new Meteor.Error('courses.insert.unauthorized',
      'You cannot edit Courses that is not yours');
    }
    return Courses.insert(fields);
  },
});

Courses.deleteCourse = new ValidatedMethod({
  name: 'deleteCourse',
  validate: new SimpleSchema({
    courseId: String,
  }).validator(),
  run({ courseId }) {
    const course = Courses.findOne(courseId);
    if (!lodash.includes(course.owner, this.userId)) {
      throw new Meteor.Error('deleteCourse.unauthorized',
      'Cannot delete Course that is not yours');
    }
    Courses.remove(courseId);
  },
});
