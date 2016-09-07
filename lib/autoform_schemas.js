Schemas = {};

Schemas.Projects = new SimpleSchema({
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
  pictures: {
    type: [String],
    label: "Bilder hochladen",
    optional: true,
  },
  "pictures.$": {
     autoform: {
      afFieldInput: {
        type: "fileUpload",
        collection: "Images",
      },
    },
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
  /*
  createdAt: {
    type: Date,
    autoform: {
      omit: true,
    },
  },
  */
});