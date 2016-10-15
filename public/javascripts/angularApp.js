
var app = angular.module('tidder', ['ui.router']);

app.factory('postsFactory', ['$http',function($http){
  //Code goes here
  var product = {
    posts: []
  };
  //Get all posts in the database
  product.getAll = function() {
    return $http.get('/posts').success(function(data) {
      angular.copy(data, product.posts);
    });
  };

  //Create a new post
  product.createPost = function(post) {
    return $http.post('/posts', post).success(function(data){
      product.posts.push(data);
    });
  };

  //Upvotes
  product.upvote = function(post) {
    return $http.put('/posts/'+post._id+'/upvote').success(function(data){
      post.upvotes += 1;
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
          controller: 'postsController'
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
    }
    $scope.incrementUpvotes = function(post) {
      postsFactory.upvote(post);
    }
  }
]);

app.controller("postsController", [
  '$scope',
  '$stateParams',
  'postsFactory',
  function($scope, $stateParams, postsFactory){
    $scope.post = postsFactory.posts[$stateParams.id];
    $scope.addComment = function(){
      if($scope.commentBody === '') {return;}
      $scope.post.comments.push({
        author: 'user',
        body  : $scope.commentBody,
        upvotes: 0
      });
      $scope.commentBody = '';
    }
  }
]);
