import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Projects = new Mongo.Collection('projects');

if (Meteor.isServer) {
    // This code only runs on the server
    Meteor.publish('projects', function projectsPublication() {
        return Projects.find({
            $or: [
                { private: { $ne: true } },
                { owner: this.userId },
            ],
        });
    });
}
  

Meteor.methods({
    'projects.insert'(title) {
        check(title, String);
        
        // Make shure the user is logged in before inserting a project
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
        
        const project = Projects.findOne(projectId);
        if (project.owner !== this.userId) {
            //Make sure only the owner can delete it
            throw new Meteor.Error('not-authorized');
        }
        
        Projects.remove(projectId);
    },
    'projects.setPrivate'(projectId, setToPrivate) {
        check(projectId, String);
        check(setToPrivate, Boolean);
        
        const project = Projects.findOne(projectId);
        
        // Make sure only the owner can make a project private
        if (project.owner !== this.userId) {
            throw new Meteor.Error('not-authorized');
        }
        
        Projects.update(projectId, { $set: { private: setToPrivate } });
    },
});