import { FindFromPublication } from 'meteor/percolate:find-from-publication';
import { Courses } from '/lib/collections/courses.js';
import Users from 'meteor/projektor:users';
import Projects from 'meteor/projektor:projects';
import lodash from 'lodash';

FindFromPublication.publish('courseProjects', function courseProjectsPublication(courseId) {
  const course = Courses.findOne(courseId);
  const ownersAsSupervisors = [];
  course && lodash.forEach(course.owner, function(ownerId) {
    const owner = Users.findOne(ownerId);
    ownersAsSupervisors.push({ userId: owner._id, role: owner.profile.title });
  });
  return Projects.find({
    courseId,
    supervisors: { $in: ownersAsSupervisors },
  }, { sort: { createdAt: -1 } }, { fields: Projects.memberFields });
});
