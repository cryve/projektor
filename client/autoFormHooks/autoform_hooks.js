AutoForm.addHooks(["editTitle", "addMember", "addContact"], {
  onSuccess: function(formType, result) {
    this.template.parent().editActive.set(false);
  }
});
