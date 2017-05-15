// Landing page
FlowRouter.route("/", {
  name: "landingPage",
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

//login page
FlowRouter.route('/login', {
  name: 'loginPage',
  action: function(){
    BlazeLayout.render("layout", {content: "loginPage"})
  }
});

//new project
FlowRouter.route("/projects/new/:draftId", {
  name: 'newProject',
  action: function() {
    BlazeLayout.render("layout", {content: "editableProject"})
  }
});
