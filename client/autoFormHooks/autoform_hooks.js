import lodash from 'lodash';

import { Projects } from '/lib/collections/projects.js';
import { Drafts } from '/lib/collections/drafts.js';
import { Courses } from '/lib/collections/courses.js';
import { updateEditPermissions } from "/lib/methods.js";

AutoForm.addHooks([
  "editTitle",
  "addCourse",
  "course",
  // "addMember",
  "addContact",
  "supervisor",
  "contactItem",
  "editDescription",
  "editTags",
  "jobItem",
  "editOccasions",
  "editDeadline",
  "editBeginning",
  "setVideoLink"
], {
  onSuccess: function(formType, result) {
    this.template.parent().editActive.set(false);
    this.template.parent().deadline.set(false);
  }
});

AutoForm.addHooks([
  "updateCourse"
], {
  onSuccess: function(formType, result) {
    this.template.parent().editCourse.set(false);
    this.template.parent().editActive.set(false);
  }
});

AutoForm.addHooks([
  "addCourseOwner",
  "addCourse",
  "addMember",
  "addSupervisor",
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
      return doc;
    }
  }
});

AutoForm.addHooks([
  "contactItem",
  "jobItem",
  "editTeamCommItem",
  "contactItemUser",
  "linkItem",
], {
  before: {
    "method-update": function(doc) {
      delete doc["$unset"];
      return doc;
    }
  }
});

AutoForm.addHooks([
  "member",
], {
  before: {
    "method-update": function(doc) {
      // Workaround for autoform behavior of unsetting all preceding items with $unset
      // Allow $unset only for role of current member
      const regExpMemberRoleKey = /^team\.\d\.role$/;
      if(doc["$unset"]) {
        doc["$unset"] = lodash.pickBy(doc["$unset"], function(value, key) {
          return regExpMemberRoleKey.test(key);
        });
      }
      return doc;
    }
  },
  onSuccess: function(formType, result) {
    this.template.parent().editActive.set(false);
    updateEditPermissions.call({
      collectionName: this.collection._name,
      docId: this.docId,
    },(err, res) => {
        if (err) {
          alert(err);
        }
    });
  }
});
