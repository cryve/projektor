
AutoForm.addHooks([
  'editTitle',
  'addContact',
  'supervisor',
  'contactItem',
  'editDescription',
  'editTags',
  'jobItem',
  'editOccasions',
  'editDeadline',
  'editBeginning',
  'editYoutubeUrl',
  'editAboutMe',
], {
  onSuccess(formType, result) {
    this.template.parent().isEditing.set(false);
  },
});

AutoForm.addHooks([
  'addMember',
  'addSupervisor',
  'addJob',
  'addContact',
  'addTeamCommItem',
], {
  before: {
    method(doc) {
      doc.docId = this.docId;
      return doc;
    },
  },
});

AutoForm.addHooks(['editYoutubeUrl'], {
  before: {
    'method-update'(doc) {
      const key = _.keys(doc.$set)[0];
      const index = key[6];
      const regExpLinkToId = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
      const match = doc.$set[`media.${index}.id`].match(regExpLinkToId);
      const newUrlId = (match && match[7].length == 11) ? match[7] : false;
      const newUrl = `https://www.youtube.com/embed/${newUrlId}`;
      doc.$set[`media.${index}.id`] = newUrl;
      doc.$set[`media.${index}.type`] = 'URL';
      delete doc.$unset;
      return doc;
    },
  },
});

AutoForm.addHooks([
  'contactItem',
  'jobItem',
  'editTeamCommItem',
], {
  before: {
    'method-update'(doc) {
      delete doc.$unset;
      return doc;
    },
  },
});

AutoForm.addHooks([
  'member',
], {
  before: {
    'method-update'(doc) {
      // Workaround for autoform behavior of unsetting all preceding items with $unset
      // Allow $unset only for role of current member
      const regExpMemberRoleKey = /^team\.\d\.role$/;
      if (doc.$unset) {
        doc.$unset = lodash.pickBy(doc.$unset, function(value, key) {
          return regExpMemberRoleKey.test(key);
        });
      }
      return doc;
    },
  },
  onSuccess(formType, result) {
    this.template.parent().isEditing.set(false);
  },
});
