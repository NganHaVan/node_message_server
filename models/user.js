const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    status: {
      type: String,
      default: "user"
    },
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Posts"
      }
    ]
  },
  {
    timestamps: true
  }
);
module.exports = mongoose.model("Users", userSchema);
