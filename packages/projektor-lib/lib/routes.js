Projektor.routes = {};

Projektor.routes.add = (path, name, template) => {
  if (!path) {
    throw new Meteor.Error('Projektor.routes.add.missingPath', 'You have to specify a path to create a route');
  }

  // if (!name)
  // console.log(FlowRouter._routes);
  lodash.forEach(FlowRouter._routes, function(route) {
    if(route.path === path || route.name === name) {
      throw new Meteor.Error('Projektor.routes.add.alreadyExists', 'This route');
    }
  });

  FlowRouter.route(path, {
    name: name,
    action() {
      BlazeLayout.render('layout', { content: template, header: 'navigationBar', footer: 'footer' });
    }
  });
};
