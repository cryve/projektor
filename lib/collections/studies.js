import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

import { studiesSchema } from "./schemas.js";

export const Studies = new Mongo.Collection('studies');
