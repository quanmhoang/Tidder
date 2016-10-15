
var app = angular.module('tidder', ['ui.router']);

app.factory('postsFactory', ['$http',function($http){
  //Code goes here
  var product = {
    posts: []
  };
  //Get all posts in the database
  product.getAll = function() {
    return $http.get('/posts').success(function(res) {
      angular.copy(res, product.posts);
    });
  };

  //Create a new post
  product.createPost = function(post) {
    return $http.post('/posts', post).success(function(res){
      product.posts.push(res);
    });
  };

  //Upvotes Post
  product.upvotePost = function(post) {
    return $http.put('/posts/'+post._id+'/upvote').success(function(res){
      post.upvotes += 1;
    });
  };

  //Downvotes Post
  product.downvotePost = function(post) {
    return $http.put('/posts/'+post._id+'/downvote').success(function(res){
      post.upvotes -= 1;
    });
  };

  //Show individual post
  product.getPost = function(id){
    return $http.get('/posts/'+id).success(function(res){
      return res;
    });
  };

  //Adding comments
  product.addComment = function(id, comment){
    return $http.post('/posts/'+id+'/comments', comment);
  };

  //Upvote comments
  product.upvoteComment = function(post, comment){
    return $http.put('/posts/'+post._id+'/comments/'+comment._id+'/upvote').success(function(res){
      comment.upvotes += 1;
    });
  };

  //Downvote comments
  product.downvoteComment = function(post, comment){
    return $http.put('/posts/'+post._id+'/comments/'+comment._id+'/downvote').success(function(res){
      comment.upvotes -= 1;
    });
  };

  return product;
}])

app.config([
  '$stateProvider',
  '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('home', {
          url: '/home',
          templateUrl: '/home.html',
          controller: 'mainController',
          resolve: {
            postPromise: ['postsFactory',function(postsFactory) {
              return postsFactory.getAll();
            }]
          }
        })
        .state('posts', {
          url: '/posts/{id}',
          templateUrl: '/posts.html',
          controller: 'postsController',
          resolve: {
            postToDisplay: ['$stateParams', 'postsFactory', function($stateParams, postsFactory){
              return postsFactory.getPost($stateParams.id);
            }]
          }
        });
    $urlRouterProvider.otherwise('home');
  }
]);

app.controller("mainController", [
  '$scope',
  'postsFactory',
  function($scope,postsFactory){

    $scope.posts = postsFactory.posts;
    $scope.addPost = function(){
      if (!$scope.title || $scope.title === '') {return;}
      postsFactory.createPost({
        title: $scope.title,
        link: $scope.link
      });
      $scope.title = '';
      $scope.link = '';
    };
    $scope.upvotePost = function(post) {
      postsFactory.upvotePost(post);
    };
    $scope.downvotePost = function(post) {
      postsFactory.downvotePost(post);
    };
  }
]);

app.controller("postsController", [
  '$scope',
  'postsFactory',
  'postToDisplay',
  function($scope, postsFactory, postToDisplay){
    $scope.post = postToDisplay.data;
    $scope.addComment = function(){
      if($scope.commentBody === '') {return;}
      postsFactory.addComment($scope.post._id, {
        author: 'user',
        body  : $scope.commentBody
      }).success(function(resComment){
        $scope.post.comments.push(resComment);
      });
      $scope.commentBody = '';
    };
    $scope.upvoteComment = function(post, comment){
      postsFactory.upvoteComment(post, comment);
    };
    $scope.downvoteComment = function(post, comment){
      postsFactory.downvoteComment(post, comment);
    };
  }
]);
