// Landing page
FlowRouter.route("/", {
  name: "landingPage",
  action: function() {
    BlazeLayout.render("layout", {content: "landingPage"});
  }
});

//new project
FlowRouter.route("/projects/new/:draftId", {
  name: 'newProject',
  action: function() {
    BlazeLayout.render("layout", {content: "editableProject"})
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

FlowRouter.route("/users/:userId/:uniqueName", {
  name: "userProfile",
  action: function() {
    BlazeLayout.render("layout", {content: "userProfile"});
  },
});

FlowRouter.route("/users", {
  name: "users",
  action: function() {
    BlazeLayout.render("layout", {content: "userList"});
  },
});

FlowRouter.route('/courses', {
  name: "courses",
  action: function() {
    BlazeLayout.render("layout", {content: "course"});
  },
});

FlowRouter.route('/courses/:courseId/:courseName', {
  name: 'course',
  action: function() {
    BlazeLayout.render("layout", {content: "currentCourse"});
  },
});
