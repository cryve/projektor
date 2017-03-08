import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { projectSchema } from "./schemas.js";
import { Index } from 'meteor/easy:search'
import { ElasticSearchEngine } from 'meteor/easysearch:elasticsearch'

//var mongoose     = require('mongoose');
//var mongoosastic = require('mongoosastic');
//var Schema       = mongoose.Schema;

export const Projects = new Mongo.Collection('projects');

if(Meteor.isServer) {
  Meteor.publish("projects", function projectsPublication() {
    return Projects.find();
  });
}


export const ProjectsIndex = new Index({
  collection: Projects,
  fields: ["title", "subtitle", "description", "jobs.joblabel", "tags", "occasions", "owner.wholeName", "team.userName"],
  engine: new ElasticSearchEngine({
    query: (searchObject) => {
      if (searchObject.title){
        var finalQuery = { "bool": { "must": [] } }
        var words = searchObject.title,
        wordArray = words.split(' ');
        console.log(wordArray);
        _.each(wordArray, function(word){
          const queryInput = {
            "bool": {
              "should":[
                { "match": { "title": word}},
                { "match": { "subtitle": word}},
                { "match": { "description": word}},
                { "match": { "jobs.joblabel": word}},
                { "match": { "tags": word}},
                { "match": { "occasions": word}},
                { "match": { "owner.wholeName": word}},
                { "match": { "team.userName": word}}
              ], "minimum_number_should_match": 1
            }
          }
          finalQuery.bool.must.push(queryInput);
        });
        return finalQuery;
      }
    }, 
     body:(body) => {
       body._source = ["_id"];
       delete body.fields;
       delete body.sort;
       console.log("SearchBody", body);
       return body;
     },
    /*getElasticSearchDoc:(doc, fields) =>{
      console.log("getDoc", doc);
      console.log("getFields", fields);
      return doc;
      
    }*/
  }),
});

Projects.attachSchema(new SimpleSchema({
  createdAt: {
    type: Date,
    autoValue: function() {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return {$setOnInsert: new Date()};
      } else {
        this.unset(); // Prevent user manipulation
      }
    },
  },
  updatedAt: {
    type: Date,
    autoValue: function() {
      if (this.isUpdate) {
        return new Date();
      }
    },
    denyInsert: true, // Prevent setting on insert
    optional: true,
  },
}).extend(projectSchema));

//Projects.plugin(mongoosastic);

Projects.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

