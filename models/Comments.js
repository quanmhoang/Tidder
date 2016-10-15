var mongoose = require('mongoose');

var commentSchema = new mongoose.Schema ({
  author: String,
  body: String,
  upvotes: { type: Number, default: 0},
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post'}
});
commentSchema.methods.upvote = function(cb){
  this.upvotes += 1;
  this.save(cb);
};

commentSchema.methods.downvote = function(cb){
  this.upvotes -= 1;
  this.save(cb);
};
mongoose.model('Comment', commentSchema);
