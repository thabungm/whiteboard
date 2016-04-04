window.curvePathArray = ['freeline','eraser'];
window.isCurvePath = function(geo) {
  if (window.curvePathArray.indexOf(geo) >= 0) {
    return true;
  } else {
    return false;
  }
}
var mainApp = angular.module('mainApp', ['ui.router','ui.bootstrap']);
mainApp.controller('webrtcController', ['$rootScope','$scope','socketFactory','drawFactory','pcFactory','videostreamFactory','$sce', function($rootScope,$scope,socket,drawFactory,pcFactory,streamFactory,$sce) {
	$scope.peerList = [];
	$scope.socket = socket;
	$scope.drawFactory = drawFactory;
  $scope.msgArray = [];
	$scope.socket.on('chat:text',function(data) {
    $scope.msgArray.push(data);
  });
  $scope.callStatus = "idle";
  $scope.msg = "";
  $scope.sendMsg = function() {
    $scope.socket.emit('chat:text',{msg:$scope.msg,type:'receive'});
    $scope.msgArray.push({type:'sent',msg:$scope.msg});
    $scope.msg = "";
  }
$scope.streamFactory = streamFactory;
$scope.localVideo;
$scope.pcFactory = pcFactory;
$scope.getLocalVideo = function() {
   return $sce.trustAsResourceUrl($scope.stream);
};
var stream;
$scope.start = function(isOwner,data) {
  
    streamFactory.get().then(function(stream) {
     $scope.stream = URL.createObjectURL(stream);
     pcFactory.getPc().addStream(stream);
     if (isOwner) {
       pcFactory.makeOffer();  
     } 
     
     $scope.callStatus = 'progress';
     if (!isOwner) {
       pcFactory.handleSignal(data);  
     }
    });
};
$scope.end = function(isOwner,data) {
  pcFactory.end();
};

$scope.socket.on('video', function (data) {
  if (data.type == 'sdp-offer') {
    $scope.start(false,data);
  } else {
    pcFactory.handleSignal(data);  
  }
});



$scope.setGeoShape = function(toolname) {
  if ($scope.drawFactory.getGeoShape() == 'eraser')  {
    $scope.drawFactory.setDefaultColorWidth($scope.drawFactory);
  }
  $scope.drawFactory.setGeoShape(toolname);

};
     

$rootScope.$on('remotestream', function (evnt) {
  $scope.remotestream =$sce.trustAsResourceUrl(URL.createObjectURL($rootScope.remotestream));
});




	$scope.socket.on('remote_draw', function (data) {
    $scope.drawFactory.setGeoShape(data.geo_type);
    if (window.isCurvePath(data.geo_shape)) {
      $scope.drawFactory.setDrag(true);
      angular.forEach(data.path_cords,function(val) {
        $scope.drawFactory.path_cords.push(val);
        $scope.drawFactory[ data.geo_shape ]({},$scope.drawFactory);  
      });
      

      $scope.drawFactory.setDrag(false);
      $scope.drawFactory.getCtx().beginPath();
      $scope.drawFactory.path_cords=[];
    } else {
      $scope.drawFactory.path_cords = data.path_cords;
      $scope.drawFactory.path_cords = data.path_cords;
      $scope.drawFactory[ data.geo_shape ]({},$scope.drawFactory);
    }
		

  });





  
}]);



mainApp.directive("draw", function(){
  return {
    restrict: "A",
    link: function(scope, element){
      scope.drawFactory.setCtx(element[0].getContext('2d'));

      scope.drawFactory.coffsetX = element[0].offsetLeft;
      scope.drawFactory.coffsetY = element[0].offsetTop;
      // variable that decides if something should be drawn on mousemove
      var drawing = false;

      // the last coordinates before the current move
      var lastX;
      var lastY;

      

      element.bind('mousedown', function(event){
      	console.log("MouseDown");
      	scope.drawFactory.draw(event);
       });

      element.bind('mousemove', function(event){
      	scope.drawFactory.onDrag(event);
      });
      element.bind('mouseup', function(event){
        scope.drawFactory.onStop(event);
        scope.socket.emit('remote_draw',{geo_shape:scope.drawFactory.getGeoShape(),path_cords:scope.drawFactory.path_cords});
        //debugger;
        scope.drawFactory.path_cords = [];
      });

      // canvas reset
      function reset(){
       element[0].width = element[0].width; 
      }



      
    }
  };
});



mainApp.directive("painttools", function(){
  return {
    restrict: "E",
    templateUrl:"partials/paint-tools.html",
    link: function(scope, element){
      
      scope.availableTools = scope.drawFactory.available_tools;
    }
  };
});

mainApp.directive("chat", function(){
  return {
    restrict: "E",
    templateUrl:"partials/chat.html",
    link: function(scope, element){
      
    }
  };
});


mainApp.directive("videochat", function(){
  return {
    restrict: "E",
    templateUrl:"partials/video.html",
    link: function($scope, element){
        

    }
  };
});
