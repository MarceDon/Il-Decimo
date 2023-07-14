const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const sessionSchema = new Schema({
  expires: {
    type: Date
  },  
  session: {
    cookie: {
        originalMaxAge: {type: Number},
        expires: {type: Date},
        secure: {type: Boolean},
        httpOnly: {type: Boolean},
        domain: {type: String},
        path: {type: String},
        sameSite: {type: String}
    },
    csrfSecret: {type: String},
    isLoggedIn: {type: Boolean},
    user: {
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
    },
    ipAddress: {type: String}
  },
});

module.exports = mongoose.model("Session", sessionSchema);