// Landing page
FlowRouter.route('/', {
  name: 'landingPage',
  action() {
    BlazeLayout.render('layout', { content: 'landingPage' });
  },
});

// new project
FlowRouter.route('/projects/new/:draftId', {
  name: 'newProject',
  action() {
    BlazeLayout.render('layout', { content: 'editableProject' });
  },
});

// project details
FlowRouter.route('/projects/:projectId/:projectTitle', {
  name: 'projectDetails',
  action() {
    BlazeLayout.render('layout', { content: 'editableProject' });
  },
});

FlowRouter.route('/login', {
  name: 'loginPage',
  action() {
    BlazeLayout.render('layout', { content: 'loginPage' });
  },
});

FlowRouter.route('/users/:userId/:uniqueName', {
  name: 'userProfile',
  action() {
    $(window).scrollTop(0);
    BlazeLayout.render('layout', { content: 'userProfile' });
  },
});

FlowRouter.route('/users', {
  name: 'users',
  action() {
    BlazeLayout.render('layout', { content: 'userList' });
  },
});

FlowRouter.route('/courses', {
  name: 'courses',
  action() {
    BlazeLayout.render('layout', { content: 'course' });
  },
});

FlowRouter.route('/courses/:courseId/:courseName', {
  name: 'course',
  action() {
    BlazeLayout.render('layout', { content: 'currentCourse' });
  },
});

FlowRouter.route('/courses/:courseId/:courseName/members', {
  name: 'courseMembers',
  action() {
    BlazeLayout.render('layout', { content: 'courseList' });
  },
});
