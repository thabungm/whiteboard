mainApp.config(function($stateProvider) {
  $stateProvider
    .state('home',{
      url: '/',
      
      views: {
        '': {
          //templateUrl: 'partials/conference.html',
          templateUrl: 'partials/draw.html',
          //templateUrl: 'partials/chat.html',
          controller: 'webrtcController'
          }
      },
      data: {
        displayName: 'Admin Items',
      }
    })
  }).run(function($state) {
  $state.go('home');
});