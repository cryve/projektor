/* eslint-env mocha */

import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert } from 'meteor/practicalmeteor: chai';

import { Projects } from './projects.js';

if (Meteor.isServer) {
    describe('Projects', () => {
        describe('methods', () => {
            const userId = Random.id();
            let projectId;
            
            beforeEach(() => {
                Projects.remove({});
                projectId = Projects.insert({
                   title: 'test project',
                    createdAt: new Date(),
                    owner: userId,
                    username: 'testuser'
                });
            });
            
            it('can delete owned project', () => { 
                // Find the internal implementation of the project so we can test it in isolation
                const deleteProject = Meteor.server.method_handlers['projects.remove'];
                
                // Set up a fake method invocation that looks like what the method expects
                const invocation = { userId };
                
                // Run the method with 'this' set to the fake invocation
                deleteProject.apply(invocation, [projectId]);
                
                // Verify that the method does what we expected
                assert.equal(Projects.find().count(), 0);
            });
        });
    });
}