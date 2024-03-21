const mongoose = require("mongoose");

const walletSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  balance: {
    type: Number,
    default: 0,
  },
  walletDatas: [{
    amount: {
      type: Number,
    },
    date: {
      type: Date,
    },
    paymentMethod: {
      type: String,
    },
    isReceived:{
      type:Boolean
    }
  }]
});

const Wallet = mongoose.model("wallet", walletSchema); 
module.exports = Wallet;