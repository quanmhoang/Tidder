var mongoose = require('mongoose');

var postSchema = new mongoose.Schema({
  title: String,
  link: String,
  upvotes: {type: Number, default: 0},
  comments: [{type: mongoose.Schema.Types.ObjectID, ref: 'Comment'}]
});

mongoose.model('Post', postSchema);
