import SimpleSchema from 'simpl-schema';

export const coursesCollectionSchema = new SimpleSchema({
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
        console.log(this);
        return [this.userId];
      }
    },
  },
  'owner.$': {
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
});


export const courseSchema = new SimpleSchema({
  courseSemester: {
    type: String,
  },
  courseName: {
    type: String,
  },
  studyCourse: {
    type: String,
  },
  courseKey: {
    type: String,
  },
  deadline: {
    type: Date,
    optional: true,
  },
}, { tracker: Tracker });
