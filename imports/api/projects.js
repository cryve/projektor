import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Projects = new Mongo.Collection('projects');

Meteor.methods({
    'projects.insert'(title, description) {
        check(title, String);
        check(description, String);
        
        Projects.insert({
            title,
            description,
            createdAt: new Date(),
            //owner: this.userId,
        });
    },
  
        
    
  
});