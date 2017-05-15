// Landing page
FlowRouter.route("/", {
  action: function() {
    BlazeLayout.render("layout", {content: "landingPage"});
  }
});

// project details
FlowRouter.route("/projects/:projectId/:projectTitle", {
  name: "projectDetails",
  action: function() {
    BlazeLayout.render("layout", {content: "editableProject"})
  }
})
