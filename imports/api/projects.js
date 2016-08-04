import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Match } from 'meteor/check'

export const Projects = new Mongo.Collection('projects');

Meteor.methods({
    'projects.insert'(title, description, tags) {
        check(title, String);
        check(description, String);
        check(tags, Match.Maybe([String])); // optional input, but if present must be string array
        
        Projects.insert({
            //id: new Id,
            //owner: this.userId,
            createdAt: new Date(),
            title,
            description,
            tags: tags,
            //deadline: deadline,
            //member: [],
            //
            
            
        });
    },
  
        
    
  
});