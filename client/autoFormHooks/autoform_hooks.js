AutoForm.addHooks([
  "editTitle",
  "addMember",
  "addContact",
  "member",
  "contactItem",
  "editDescription",
  "editTags",
  "jobItem",
  "editOccasions",
  "editSupervisors",
  "editDeadline",
  "editOwnerRole"
  ], {
  onSuccess: function(formType, result) {
    this.template.parent().editActive.set(false);
  }
});
