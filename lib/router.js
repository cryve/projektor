Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
 

  
});

Router.route('/', {name: 'createbutton'});
Router.route('/new-project', {
  name: 'newProject',
  data: function() { return
  Posts.findOne(this.params._id); }
});

