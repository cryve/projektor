import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Match } from 'meteor/check';


export const Projects = new Mongo.Collection('projects');

Projects.attachSchema(new SimpleSchema({
  title: {
    type: String,
    label: "Projekt-Titel",
    max: 40
  },
  subtitle: {
    type: String,
    label: "Untertitel",
    optional: true,
    max: 200
  },
  description: {
    type: String,
    label: "Beschreibung",
    max: 500
  },
  deadline: {
    type: Date,
    label: "Deadline",
    optional: true
  },
  tags: {
    type: [String],
    label: "Tags",
    optional: true,
    autoform: {
      type: "tags",
      afFieldInput: {
        maxTags: 10, // max 10 tags allowed
        maxChars: 20, // max 10 chars per tag allowed
        trimValue: true, // removes whitespace around a tag
      }
    }
  },
  jobs: {
    type: Array,
    label: "Offene Jobs",
    optional: true
  },
  "jobs.$": {
    type: Object
  },
  "jobs.$.jobname": {
    type: String,
    label: "Jobbeschreibung",
  },
  "jobs.$.jobholder": {
    type: String,
    label: "Mitglied",
    autoform: {
      type: "typeahead",
      options: {
        "member1": "Peter Soltau",
        "member2": "Gudrun Sued",
        "member3": "Guelcan Schroter",
        "member4": "Samson Gerlach"
      }
    }
  },
  scopes: {
    type: Array,
    label: "Projektrahmen",
    optional: true
  },  
  "scopes.$": {
    type: Object
  },
  "scopes.$.name": {
    type: String,
    label: "Vorlesung/Seminar/Schein",
  },
  "scopes.$.supervisor": {
    type: String,
    label: "Betreuer",
    autoform: {
      type: "typeahead",
      options: {
        "member1": "Peter Soltau",
        "member2": "Gudrun Sued",
        "member3": "Guelcan Schroter",
        "member4": "Samson Gerlach",
      },
    },
  },
}));

Meteor.methods({
  
    'projects.insert'(title, subtitle, description, skills, contacts, deadline, tags, coverImgPath, owner) {

        check(title, String);
        check(subtitle, String);
        check(description, String);
        check(skills, [String]);
        check(contacts, String);
        check(coverImgPath, String);
        check(deadline, Date);
        check(tags, Match.Maybe([String])); // optional input, but if present must be string array
        check(owner, String);
        
        Projects.insert({
            //id: new Id,
            //owner: this.userId,
            createdAt: new Date(),
            title,
            coverImgPath,
            subtitle,
            description,
            skills,
            contacts,
            deadline,
            likes: 0,
            tags: tags,
            owner,
        });
      
    },
    "projects.update"(projectId, projectProperties) {
      check(projectId, String);
      check(projectProperties.subtitle, String);
      check(projectProperties.title, String);
      check(projectProperties.description, String);
      check(projectProperties.skills, [String]);
      check(projectProperties.contacts, String);
      check(projectProperties.deadline, Date);
      check(projectProperties.tags, Match.Maybe([String]));
      
      Projects.update(projectId, { 
        $set: {
          title: projectProperties.title,
          subtitle: projectProperties.subtitle,
          description: projectProperties.description,
          skills: projectProperties.skills,
          contacts: projectProperties.contacts,
          deadline: projectProperties.deadline,
          tags: projectProperties.tags,
          lastEdit: new Date()
        }
      });
    },  
    "projects.incrementLikes"(projectId){
      check(projectId, String);
  
      const project = Projects.findOne(projectId);
      Projects.update(project, {$inc: { likes: 1}}); 
  

    }

        
    
  
});
