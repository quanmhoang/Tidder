var express = require('express');
var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');
var User = mongoose.model('User');
var passport = require('passport');
var jwt = require('express-jwt');
var router = express.Router();

var auth = jwt({secret: 'CONFIDENTIAL', userProperty: 'payload'});


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

/*POST create a post */
router.post('/posts', auth, function(req, res, next){
  var post = new Post(req.body);
  post.author = req.payload.username;
  post.save(function(err, post){
    if(err){return next(err);}
    res.json(post);
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

/*POST add comment to a post*/
router.post('/posts/:post/comments', auth, function(req, res, next){
  var comment = Comment(req.body);
  comment.post = req.post;
  comment.author = req.payload.username;

  comment.save(function(err, comment){
    if(err) {return next(err);}

    req.post.comments.push(comment);
    req.post.save(function(err,post){
      if(err) {return next(err);}
      res.json(comment);
      return next();
    });
  });
});

/*Upvote a post*/
router.put('/posts/:post/upvote', auth, function(req, res, next){
  req.post.upvote(function(err, post){
    if(err) {return next(err);}
    res.json(post);
  });
});

/*Downvote a post*/
router.put('/posts/:post/downvote', auth, function(req, res, next){
  req.post.downvote(function(err, post){
    if(err) {return next(err);}
    res.json(post);
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
router.put('/posts/:post/comments/:comment/upvote', auth, function(req,res,next){
  req.comment.upvote(function(err, comment){
    if(err) {return next(err);}
    res.json(comment);
  });
});

/*Downvote comment*/
router.put('/posts/:post/comments/:comment/downvote', auth, function(req,res,next){
  req.comment.downvote(function(err, comment){
    if(err) {return next(err);}
    res.json(comment);
  });
});


//Authentication and registation

//Register
router.post('/register', function(req, res, next) {
  if(!req.body.username || !req.body.password) {
    return res.status(400).json({message: 'Fields can not be empty'});
  }
  var user = new User();
  user.userName = req.body.username;
  user.email = req.body.email;
  user.setPassword(req.body.password);
  user.save(function(err, user){
    if(err) { return next(err);}
    return res.json({token: user.generateJWT()});
  });
});

//Login
router.post('/login', function(req, res, next){
    if(!req.body.username || !req.body.password) {
      return res.status(400).json({message: 'Fields can not be empty'});
    }
    passport.authenticate('local', function(err, user, info){
      if(err) { return next(err);}
      if(user) {
        return res.json({token: user.generateJWT()});
      }
      else {
        return res.status(401).json(info);
      }
    })(req, res, next);
});
module.exports = router;
