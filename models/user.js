const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  nome: {type: String},
  cognome: {type: String},
  usrName: {type: String},
  email: {type: String},
  password: {type: String},
  role: {
    type: String,
    default: "user",
    enum: ["user", "admin"],
  },
  verified: {
    type: Boolean,
    default: false,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  expireAt: { 
    type: Date, 
    default: null,
  },
  lastSession: {type: Date},
  attribute: {
    numTel: {type: String},
    address: {
      city: {type: String},
      state: {type: String},
    },
    age: {type: Number},
    playRole: {
      type: String,
      enum: ["Portiere", "Difensore", "Centrocampista", "Attaccante"],
    },
    bio: {type: String},
    squad: {type: String},
    foot: {
      type: String,
      enum: ["Sinistro", "Destro"],
    },
  },
  matchList: {
    type: Array,
    matchId: {
      type: Schema.Types.ObjectId,
      ref: "Match",
    },
  },
});

userSchema.index( { "expireAt": 1 }, { "expireAfterSeconds": 0 } );

module.exports = mongoose.model("User", userSchema);