import { Meteor } from 'meteor/meteor';
import { assert } from 'chai';
import lodash from 'lodash';
import SimpleSchema from 'simpl-schema';

describe('Projektor.routes', function() {
    it('should have function to add new route', function() {
      assert.isFunction(Projektor.routes.add, 'has add function');
    });

    it('should require path', function() {
      assert.throws(() => {
        Projektor.routes.add();
      }, Meteor.Error, 'Projektor.routes.add.missingPath',
        'throws error when no path is given');
    });

    it('should create new route', function() {
      Projektor.routes.add('/testpath', 'testRoute');
      // assert.equal(FlowRouter._routes, '/testpath');
      // assert.deepInclude(FlowRouter._routes, {path: 'testpath'});
      // const routeObj = {
      //   path: '/testpath',
      //   name: 'testRoute',
      //   action
      // }
      let foundPath = false;
      lodash.forEach(FlowRouter._routes, function(route) {
        if(route.path === '/testpath'
            && route.name === 'testRoute') {
          foundPath = true;
          return false;
        }
      });
      assert.isTrue(foundPath, 'route was created');
    });

    it('should render template at new route');

    it('should not overwrite exisiting route', function() {
      Projektor.routes.add('/testpath1', 'testRoute1');
      assert.throws(() => {
        Projektor.routes.add('/testpath1', 'testRoute2')
      }, Meteor.Error, 'Projektor.routes.add.alreadyExists', 'throws error when route path is already in use');
      assert.throws(() => {
        Projektor.routes.add('/testpath2', 'testRoute1')
      }, Meteor.Error, 'Projektor.routes.add.alreadyExists', 'throws error when route name is already in use');
    });

});
