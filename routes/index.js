var express = require('express');
var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


/*GET all post */
router.get('/posts', function(req, res, next){
  Post.find(function(err, posts) {
    if(err) { return next(err)}
    res.json(posts);
    });
  });

/*Get a post by id*/
router.param('post', function(req, res, next, id){
  var query = Post.findById(id);
  query.exec(function (err, post){
    if(err) {return next(err);}
    if(!post) {return next(new Error('No such post exists'));}

    req.post = post;
    return next();
  });
});
router.get('/posts/:post', function(req, res, next){
  req.post.populate('comments', function(err, post) {
    if (err) {return next(err);}
    res.json(req.post);
  })

});


/*Upvote a post*/
router.put('/posts/:post/upvote', function(req, res, next){
  req.post.upvote(function(err, post){
    if(err) {return next(err);}
    res.json(post);
  });
});

/*POST add posts to database */
router.post('/posts', function(req, res, next){
  var post = new Post(req.body);

  post.save(function(err, post){
    if(err){return next(err);}
    res.json(post);
  });
});
module.exports = router;

/*POST add comment to a post*/
router.post('/posts/:post/comments', function(req, res, next){
  var comment = Comment(req.body);
  comment.post = req.post;

  comment.save(function(err, comment){
    if(err) {return next(err);}

    req.post.comments.push(comment);
    req.post.save(function(err,post){
      if(err) {return next(err);}
      res.json(post);
    });
  });
});

/*GET comment by comment ID*/
router.param('comment', function(req, res, next, id){
  var query= Comment.findById(id);

  query.exec(function(err, comment){
    if(err) { return next(err); }
    if(!comment) { return next(new Error('No comment found'));}
    req.comment = comment;
    return next();
  });

});
router.get('/posts/:post/comments/:comment', function(req, res, next){
  res.json(req.comment);
});


/*Upvote comment*/
router.put('/posts/:post/comments/:comment/upvote', function(req,res,nest){
  req.comment.upvote(function(err, comment){
    if(err) {return next(err);}
    res.json(comment);
  });

});
