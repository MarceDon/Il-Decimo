const mongoose = require('mongoose')

const Schema = mongoose.Schema

const matchSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  placeName: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  time: {
    type: Date,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  totalPlayers: {
    type: Number,
    required: true,
  },
  currentPlayers: {
    type: Number,
    required: true,
  },
  listPlayers: {
    //type: Schema.Types.ObjectId,
    players: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      },
    ],
    required: false,
  },
  hostUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
})

matchSchema.methods.addPlayer = function(user) {
  const updatedMatchPlayers = [...this.listPlayers.players];

  updatedMatchPlayers.push({
    userId: user,
  });
  
  const updatedMatch = {
    players: updatedMatchPlayers
  };
  
  this.listPlayers = updatedMatch;
  this.currentPlayers = this.currentPlayers+1;

  return this.save();
};

module.exports = mongoose.model('Match', matchSchema)
