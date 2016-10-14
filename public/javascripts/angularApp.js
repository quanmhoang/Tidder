
var app = angular.module('tidder', ['ui.router']);

app.factory('postsFactory', [function(){
  //Code goes here
  var o = {
    posts: [{title: "hello",
            link: '',
            upvotes: 0,
            comments: [
              {author: 'Joe', body: 'Cool post!', upvotes: 0},
              {author: 'Bob', body: 'Great idea but everything is wrong!', upvotes: 0}
            ]}]
  };
  return o;
}])

app.config([
  '$stateProvider',
  '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('home', {
          url: '/home',
          templateUrl: '/home.html',
          controller: 'mainController'
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
      $scope.posts.push({
        title: $scope.title,
        link: $scope.link,
        upvotes: 0,
        comments: []
      });
      $scope.title = '';
      $scope.link = '';
    }
    $scope.incrementUpvotes = function(post) {
      post.upvotes += 1;
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
