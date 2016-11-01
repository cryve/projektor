/*
AutoForm.addHooks(["newProject"], {
  before: {
    insert: function(doc) {
      doc.title = Session.get("newTitle");
      return doc;
    }
  },
  onSuccess: function(formType, result) {
    Router.go("projectDetails", {_id: this.docId, title: this.insertDoc.title});
  }
});
AutoForm.addHooks(["projectEdit"], {
  onSuccess: function(formType, result) {
    Router.go("projectDetails", {_id: this.docId, title: this.currentDoc.title});
  }
});
*/
