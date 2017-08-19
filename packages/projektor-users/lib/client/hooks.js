AutoForm.addHooks([
  'editAboutMe',
], {
  onSuccess(formType, result) {
    this.template.parent().isEditing.set(false);
  },
});

AutoForm.addHooks([
  'addContactUser',
  'addLink',
], {
  before: {
    method(doc) {
      doc.docId = this.docId;
      return doc;
    },
  },
});

AutoForm.addHooks([
  'contactItemUser',
  'linkItem',
], {
  before: {
    'method-update'(doc) {
      delete doc.$unset;
      return doc;
    },
  },
});

AutoForm.addHooks(['editAboutMe'], {
  before: {
    'method-update'(doc) {
      // Workaround for autoform behavior of unsetting entire profile object
      // Allow $unset only for aboutMe field
      if (doc.$unset) {
        doc.$unset = { 'profile.aboutMe': '' };
      }
      return doc;
    },
  },
});
