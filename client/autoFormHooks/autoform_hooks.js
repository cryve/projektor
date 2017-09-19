import lodash from 'lodash';

import { Projects } from '/lib/collections/projects.js';
import { Drafts } from '/lib/collections/drafts.js';
import { Courses } from '/lib/collections/courses.js';
import { updateEditPermissions } from '/lib/methods.js';

//-------------Enthält Teil des Course Features--------
//Autoformhooks Funktionen können global von jedem anderen clientseitigen Autoform aufgerufen werden (https://github.com/aldeed/meteor-autoform)
AutoForm.addHooks([
  'editTitle',
  'addCourse',        //<-------------------------
  'course',           //<-------------------------
  'notesBox',
  'addContact',
  'supervisor',
  'contactItem',
  'editDescription',
  'editTags',
  'jobItem',
  'editOccasions',
  'editDeadline',
  'editBeginning',
  'setVideoLink',
  'editAboutMe',
], {
  onSuccess(formType, result) {
    /*this.template.parent() enthält ein JSON mit dem momentanen Datacontext des zurzeit offenen HTML-Templates
    Die reactive Variable "editActive" wird auf false gesetzt,
    wenn die Autoform eine der aufgelisteten Namen einen erfolgreichen submit erhält */
    this.template.parent().editActive.set(false);
  },
});

AutoForm.addHooks([   //<------------------------- wie Funktion in Zeile 9
  'addCourseToCourse',
], {
  onSuccess(formType, result) {
    this.template.parent().addCourse.set(false);
  },
});

AutoForm.addHooks([   //<------------------------- wie Funktion in Zeile 9
  'editDeadlineCourse',
], {
  onSuccess(formType, result) {
    this.template.parent().deadline.set(false);
  },
});

AutoForm.addHooks([
  'updateCourse',     //<------------------------- wie Funktion in Zeile 9
], {
  onSuccess(formType, result) {
    this.template.parent().editActive.set(false);
  },
});

AutoForm.addHooks([
  'addCourseOwner',   //<-------------------------
  'addCourse',        //<-------------------------
  'addMember',
  'addSupervisor',
  'addJob',
  'addContact',
  'addTeamCommItem',
  'addContactUser',
  'addLink',          //<-------------------------
  'saveGrading',      //<-------------------------
], {
  before: {
    method(doc) {
      doc.docId = this.docId;
      return doc;
    },
  },
});
