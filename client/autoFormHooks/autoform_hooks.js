import { Projects } from '/lib/collections/projects.js';
import { Drafts } from '/lib/collections/drafts.js';

AutoForm.addHooks([
  "editTitle",
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

AutoForm.addHooks(["addMember"], {
  before: {
    "method": function(doc) {
      doc.projectId = this.docId;
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
