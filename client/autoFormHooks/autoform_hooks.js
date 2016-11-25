AutoForm.addHooks(["editTitle", "addMember"], {
  onSuccess: function(formType, result) {
    this.template.parent().editActive.set(false);
  }
});
