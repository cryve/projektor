// Landing page
FlowRouter.route('/', {
  name: 'landingPage',
  action() {
    BlazeLayout.render('layout', { content: 'landingPage', header: 'navigationBar', footer: 'footer' });
  },
});

// new project
FlowRouter.route('/projects/new/:projectId', {
  name: 'newProject',
  action() {
    BlazeLayout.render('layout', { content: 'editableProject', header: 'navigationBar', footer: 'footer' });
  },
});

// project details
FlowRouter.route('/projects/:projectId/:projectTitle', {
  name: 'projectDetails',
  action() {
    BlazeLayout.render('layout', { content: 'editableProject', header: 'navigationBar', footer: 'footer' });
  },
});

// login page
FlowRouter.route('/login', {
  name: 'loginPage',
  action() {
    BlazeLayout.render('layout', { content: 'loginPage', header: 'navigationBar', footer: 'footer' });
  },
});

FlowRouter.route('/users/:userId/:uniqueName', {
  name: 'userProfile',
  action() {
    BlazeLayout.render('layout', { content: 'userProfile', header: 'navigationBar', footer: 'footer' });
  },
});

FlowRouter.route('/users', {
  name: 'users',
  action() {
    BlazeLayout.render('layout', { content: 'userList', header: 'navigationBar', footer: 'footer' });
  },
});

FlowRouter.route('/courses', {
  name: 'courses',
  action() {
    BlazeLayout.render('layout', { content: 'course', header: 'navigationBar', footer: 'footer' });
  },
});

FlowRouter.route('/courses/:courseId/:courseName', {
  name: 'course',
  action() {
    BlazeLayout.render('layout', { content: 'currentCourse', header: 'navigationBar', footer: 'footer' });
  },
});
