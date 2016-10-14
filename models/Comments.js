var mongoose = require('mongoose');

var commentSchema = new mongoose.Schema ({
  author: String,
  body: String,
  upvotes: {type: Number, default: 0},
  post: {type: mongoose.Schema.Types.ObjectID, ref: 'Post'}
});

mongoose.model('Comment', commentSchema);
