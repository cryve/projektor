import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Projects = new Mongo.Collection('projects');

if (Meteor.isServer) {
    // This code only runs on the server
    Meteor.publish('projects', function projectsPublication() {
        return Projects.find();
    });
}


Meteor.methods({
    'projects.insert'(title) {
        check(title, String);
        
        // Make shure the user is logged in before inserting a task
        if (! this.userId) {
            throw new Meteor.Error('not-authorized');
        }
        
        Projects.insert({
            title,
            createdAt: new Date(),
            owner: this.userId,
            username: Meteor.users.findOne(this.userId).username,
        });
    },
    'projects.remove'(projectId) {
        check(projectId, String);
        
        Projects.remove(projectId);
    },
});