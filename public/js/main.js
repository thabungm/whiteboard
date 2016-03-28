var mainApp = angular.module('mainApp', ['ui.router','ui.bootstrap']);
mainApp.controller('webrtcController', ['$scope','socketFactory','drawFactory', function($scope,socket,drawFactory) {
	$scope.peerList = [];
	$scope.socket = socket;
	$scope.drawFactory = drawFactory;
  $scope.msgArray = [];
	$scope.socket.on('chat:text',function(data) {
    $scope.msgArray.push(data);
  });

  $scope.msg = "";
  $scope.sendMsg = function() {
    $scope.socket.emit('chat:text',{msg:$scope.msg,type:'receive'});
    $scope.msgArray.push({type:'sent',msg:$scope.msg});
    $scope.msg = "";
  }


 

  
$scope.socket.on('video', function (data) {
  $scope.gotMessageFromServer(data);
});

	$scope.socket.on('remote_draw', function (data) {
    $scope.drawFactory.setGeoShape(data.geo_type);
    if (data.geo_shape == "freeline") {
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
      /*
      $scope.drawFactory.rectangle({},$scope.drawFactory);
      return;
      */
      $scope.drawFactory.path_cords = data.path_cords;
      $scope.drawFactory[ data.geo_shape ]({},$scope.drawFactory);
      


    }
		

  });



// webrtc vdo starts here *********************************

//  pageReady();

// webrtc vdo ends here *********************************

	//}



  
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
      scope.setGeoShape = function(toolname) {
        scope.drawFactory.setGeoShape(toolname);

      };
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

          
$scope.localVideo;
$scope.remoteVideo;
$scope.peerConnection;
$scope.peerConnectionConfig = {'iceServers': [{'url': 'stun:stun.services.mozilla.com'}, {'url': 'stun:stun.l.google.com:19302'}]};

navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
window.RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate;
window.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription;

  $scope.pageReady = function(isCaller) {
    $scope.localVideo = document.getElementById('localVideo');
    $scope.remoteVideo = document.getElementById('remoteVideo');

    //$scope.serverConnection = new WebSocket('ws://127.0.0.1:3434');
    //serverConnection.onmessage = gotMessageFromServer;

    var constraints = {
        video: true,
        audio: true,
    };
    function getUserMediaSuccess(stream) {
        $scope.$apply(function() {
          $scope.localStream = stream;
          $scope.localVideo.src = window.URL.createObjectURL(stream);
          //start(true);
          $scope.peerConnection = new RTCPeerConnection($scope.peerConnectionConfig);
          $scope.peerConnection.onicecandidate = gotIceCandidate;
          $scope.peerConnection.onaddstream = gotRemoteStream;
          $scope.peerConnection.addStream(stream);
          if(isCaller) {
              $scope.peerConnection.createOffer(gotDescription, errorHandler);
          }
        
          });

    }

    if(navigator.getUserMedia) {
        navigator.getUserMedia(constraints, getUserMediaSuccess, errorHandler);
      } else {
        alert('Your browser does not support getUserMedia API');
      }
    }

    


    function gotMessageFromServer(message) {
        if(!$scope.peerConnection) start(false);

        var signal = JSON.parse(message.data);
        if(signal.sdp) {
            $scope.peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp), function() {
                $scope.peerConnection.createAnswer(gotDescription, errorHandler);
            }, errorHandler);
        } else if(signal.ice) {
            $scope.peerConnection.addIceCandidate(new RTCIceCandidate(signal.ice));
        }
    }

    function gotIceCandidate(event) {
        if(event.candidate != null) {
          $scope.socket.emit('video',{'ice': event.candidate});
           
        }
    }

    function gotDescription(description) {
      $scope.$apply(function() {
            //wrapped this within $apply
            console.log('got description');
            $scope.peerConnection.setLocalDescription(description, function () {
              //serverConnection.send(JSON.stringify({'sdp': description}));
              $scope.socket.emit('video',{'sdp': description});

            }, function() {console.log('set description error')});
          });

        
    }

    function gotRemoteStream(event) {
        console.log('got remote stream');
        remoteVideo.src = window.URL.createObjectURL(event.stream);
    }

    function errorHandler(error) {
        console.log(error);
    }






      
      
    }
  };
});
