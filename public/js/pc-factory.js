mainApp.factory('pcFactory',['$q','$rootScope','socketFactory',function ($q,$rootScope,socket) {
    var stream;
    return {
      pc:null,
      setPc:function(pc) {this.pc = pc;},
      getPc: function () {
        var self = this;
        if (this.pc) {
          return this.pc;
        }
      var iceConfig = {'iceServers': [{ 'url': 'stun:stun.l.google.com:19302' }]};
      var pc = new RTCPeerConnection(null);
      pc.onicecandidate = function (evnt) {
        socket.emit('video', {ice: evnt.candidate, type: 'ice' });
      };
      pc.oniceconnectionstatechange = function (evnt) {
        if (evnt.state == "disconnected")
        this.pc.close();
      };
      pc.onaddstream = function(evnt) {
        $rootScope.remotestream = evnt.stream;
        $rootScope.$broadcast('remotestream');
      };
      this.setPc(pc);
      return pc;
      },
      end:function() {
        this.pc.close();
      },

      makeOffer:function() {
        var pc = this.getPc();
        pc.createOffer(function (sdp) {
          pc.setLocalDescription(sdp);
          //console.log('Creating an offer for', id);
          socket.emit('video', {sdp: sdp, type: 'sdp-offer' });
        }, function (e) {
          console.log(e);
        },
        { mandatory: { offerToReceiveVideo: true, offerToReceiveAudio: true }});
      },

      handleSignal:function(data) {
        var pc = this.getPc();
        switch (data.type) {
        case 'sdp-offer':
          console.log(data.sdp);
          pc.setRemoteDescription(new RTCSessionDescription(data.sdp), function () {
            console.log('Setting remote description by offer');
            pc.createAnswer(function (sdp) {
              pc.setLocalDescription(sdp);
              socket.emit('video', { sdp: sdp, type: 'sdp-answer' });
            }, function (e) {
              console.log(e);
            });
          }, function (e) {
            console.log(e);
          });
          break;
        case 'sdp-answer':
          pc.setRemoteDescription(new RTCSessionDescription(data.sdp), function () {
            console.log('Setting remote description by answer');
          }, function (e) {
            console.error(e);
          });
          break;
        case 'ice':
          if (data.ice) {
            console.log('Adding ice candidates');
            pc.addIceCandidate(new RTCIceCandidate(data.ice));
          }
          break;
      }
      }


    };
  }]);