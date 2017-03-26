import { Projects } from '/lib/collections/projects.js';
import { Drafts } from '/lib/collections/drafts.js';
import { Courses } from '/lib/collections/courses.js';

AutoForm.addHooks([
  "editTitle",
  "addCourse",
  // "addMember",
  "addContact",
  "member",
  "contactItem",
  "editDescription",
  "editTags",
  "jobItem",
  "editOccasions",
  "editSupervisors",
  "editDeadline",
  "editBeginning",
  "editOwnerRole",
  "setVideoLink"
], {
  onSuccess: function(formType, result) {
    this.template.parent().editActive.set(false);
  }
});

AutoForm.addHooks([
  "course"
], {
  onSuccess: function(formType, result) {
    this.template.parent().editCourse.set(false);
    this.template.parent().editActive.set(false);
  }
});

AutoForm.addHooks([
  "addCourse",
  "addMember",
  "addJob",
  "addContact",
  "addTeamCommItem",
  "addContactUser",
  "addLink",
], {
  before: {
    "method": function(doc) {
      doc.docId = this.docId;
      return doc;
    }
  }
});

AutoForm.addHooks(["setVideoLink"], {
  before: {
    "method-update": function(doc) {
      const key = _.keys(doc["$set"])[0];
      const index = key[6];
      const regExpLinkToId = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
      const match = doc["$set"]["media."+index+".id"].match(regExpLinkToId);
      const newUrlId = (match&&match[7].length==11)? match[7] : false;
      const newUrl = "https://www.youtube.com/embed/"+newUrlId;
      doc["$set"]["media."+index+".id"] = newUrl;
      doc["$set"]["media."+index+".type"] = "URL";
      delete doc["$unset"];
      console.log(doc);
      return doc;
    }
  }
});

AutoForm.addHooks([
  "contactItem",
  "jobItem",
  "editTeamCommItem"
], {
  before: {
    "method-update": function(doc) {
      delete doc["$unset"];
      console.log(doc);
      return doc;
    }
  }
});
