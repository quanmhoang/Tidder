
var app = angular.module('tidder', ['ui.router']);

app.factory('postsFactory', ['$http','auth',function($http, auth){
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
    return $http.post('/posts', post, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(res){
      product.posts.push(res);
    });
  };

  //Upvotes Post
  product.upvotePost = function(post) {
    return $http.put('/posts/'+post._id+'/upvote', null, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(res){
      post.upvotes += 1;
    });
  };

  //Downvotes Post
  product.downvotePost = function(post) {
    return $http.put('/posts/'+post._id+'/downvote', null, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(res){
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
    return $http.post('/posts/'+id+'/comments', comment, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    });
  };

  //Upvote comments
  product.upvoteComment = function(post, comment){
    return $http.put('/posts/'+post._id+'/comments/'+comment._id+'/upvote', null, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(res){
      comment.upvotes += 1;
    });
  };

  //Downvote comments
  product.downvoteComment = function(post, comment){
    return $http.put('/posts/'+post._id+'/comments/'+comment._id+'/downvote', null, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(res){
      comment.upvotes -= 1;
    });
  };

  return product;
}])


.factory('auth', ['$http', '$window', function($http, $window){
  var auth = {};

  //Save JWT token to localStorage
  auth.saveToken = function(token){
    $window.localStorage['tidder-token'] = token;
  };

  //Get JWT token from localStorage
  auth.getToken = function(){
    return $window.localStorage['tidder-token'];
  };

  //Login status check, return boolean value
  auth.isLoggedIn = function(){
    var token = auth.getToken();
    if(token) {
      var payload = JSON.parse($window.atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    }
    else {
      return false;
    }
  };

  auth.currentUser = function(){
    if(auth.isLoggedIn()){
      var token = auth.getToken();

      var payload = JSON.parse($window.atob(token.split('.')[1]));
      // console.log(payload);
      return payload.username;
    }
  };

  //Registration
  auth.register = function(user){
    return $http.post('/register', user).success(function(res){

      auth.saveToken(res.token);

    });
  };

  //Login
  auth.login = function(user){
    console.log('haha11');
    return $http.post('/login', user).success(function(res){

      auth.saveToken(res.token);
    });
  };

  //Logout
  auth.logout = function(){
    $window.localStorage.removeItem('tidder-token');
  };

  return auth;

}]);

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
        })
        .state('register', {
          url: '/register',
          templateUrl: '/register.html',
          controller: 'authController',
          onEnter: ['$state', 'auth', function($state, auth){
            if(auth.isLoggedIn()){
              $state.go('home');
            }
          }]
        })
        .state('login', {
          url: '/login',
          templateUrl: '/login.html',
          controller: 'authController',
          onEnter: ['$state', 'auth', function($state, auth){
            if(auth.isLoggedIn()){
              $state.go('home');
            }
          }]
        });
    $urlRouterProvider.otherwise('home');
  }
]);



app.controller("mainController", [
  '$scope',
  'postsFactory',
  'auth',
  function($scope, postsFactory, auth){
    $scope.posts = postsFactory.posts;
    $scope.isLoggedIn = auth.isLoggedIn;
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

//Comments Controller
app.controller("postsController", [
  '$scope',
  'postsFactory',
  'postToDisplay',
  'auth',
  function($scope, postsFactory, postToDisplay, auth){

    $scope.post = postToDisplay.data;
    $scope.isLoggedIn = auth.isLoggedIn;
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


//Authentication controller

app.controller("authController",[
  '$scope',
  'auth',
  '$state',
  function($scope, auth, $state){
    $scope.register = function(){
      $scope.user = {};
      $scope.user = {username: $scope.username, password: $scope.password, email: $scope.email };
      auth.register($scope.user).error(function(error){
        $scope.error = error;
      }).then(function(){
        $state.go('home');
      });
    };

    $scope.login = function() {
      $scope.user = {username: $scope.username, password: $scope.password};
      auth.login($scope.user).error(function(error){
        $scope.error = error;
      }).then(function(){
        $state.go('home');
      });
    };

  }
]);

//Navigation bar controller
app.controller("navController",[
  '$scope',
  'auth',
  function($scope, auth){
    $scope.isLoggedIn = auth.isLoggedIn;

    $scope.currentUser = auth.currentUser;
    $scope.logout = auth.logout;
  }
]);
