function Participant(ownerName, name, participantObject) {
    selfParticipant = this;
    var isScreenShare = false;
    if (parseInt(name) > 700) {
        isScreenShare = true;
    }
    this.ownerName = ownerName;
    this.name = name;
    var container = document.createElement('div');
    
    var video = document.createElement('video');
    
    video.class = "video-element-owner"; 
    video.participantCounter = window.participantCounter;
    video.class = "video-element-owner"; 
    ++window.participantCounter;

    container.id = name;
    var span = document.createElement('span');
    var rtcPeer;
    
    container.appendChild(video);
    if (isScreenShare)  {
        var shareButton = document.createElement('img');
        shareButton.src = "/images/full-screen.png";
        $(shareButton).addClass("full-screen"); 
                //= "full-screen";
        container.appendChild(shareButton);
    }
    container.appendChild(video);
    
    if (elSelector.collaboration_type != 'audio') {
        container.appendChild(span);
    }
    if (!isScreenShare) {
        container.onclick = switchPeerToMainVideo;

    }
    var profileImagePath = "/images/play-big.png";
    if (participantObject != undefined) {
        span.appendChild(document.createTextNode(participantObject.full_name));
        if (participantObject.profile_path != "") {
            profileImagePath = "/user_images/thumb_" + participantObject.profile_path;
        }

    } else {
        span.appendChild(document.createTextNode(full_name));
    }
    
    if (!isPresentMainParticipant() && myProfileImagePath != '') {
        profileImagePath = "/user_images/thumb_" + myProfileImagePath;
    }
    if (elSelector.collaboration_type == 'audio') {
        video.height = 0;
        // /user_images/
        
        $(container).append($("<img style='width:100%;' src='"+profileImagePath+"'>"));
        container.appendChild(span);
    }
    if (isPresentMainParticipant()) {
        video.className = "video-element-owner"; 
        //class="video-element-owner"
        container.className = PARTICIPANT_CLASS;
        document.getElementById(elSelector.participants).appendChild(container);
    } else {
        container.className = PARTICIPANT_MAIN_CLASS;
        video.className = "video-element-owner"; 

        video.id = elSelector.owner_video;
        $(elSelector.main_video_div).append(container);
    }
    video.id = 'video-' + name;
    video.autoplay = true;
    video.controls = false;
    video.poster = "/images/play-big-rev.png";


    this.getElement = function () {
        return container;
    }

    this.getVideoElement = function () {
        return video;
    }

    function switchContainerClass() {
        if (container.className === PARTICIPANT_CLASS) {
            var elements = Array.prototype.slice.call(document.getElementsByClassName(PARTICIPANT_MAIN_CLASS));
            elements.forEach(function (item) {
                item.className = PARTICIPANT_CLASS;
            });

            container.className = PARTICIPANT_MAIN_CLASS;
        } else {
            container.className = PARTICIPANT_CLASS;
        }
    }

    function isPresentMainParticipant() {
        return ((document.getElementsByClassName(PARTICIPANT_MAIN_CLASS)).length != 0);
    }

    this.offerToReceiveVideo = function (offerSdp, wp) {
        offerSdpList[this.name] = offerSdp;
        console.log('Invoking SDP offer callback function');
        var msg = {id: "receiveVideoFrom",
            ownerName: this.ownerName,
            sender: name,
            type: 'video',
            sdpOffer: offerSdp,
            loginUserId:window.loginUserId
        };
        sendMessage(msg);
    };

    this.joinRoom = function (offerSdp, wp) {
        ownerRtcPeer  = this.rtcPeer;
        offerSdpList[name] = offerSdp;
        if (typeof instantCollaboration != 'undefined') {
            showCallInitiating();
        }
        
        var msg = {id: "joinRoom",
            type: 'video',
            ownerName: this.ownerName,
            sender: name,
            sdpOffer: offerSdp,
            enableRecording:window.enableRecording,
            collaboration_id:window.collaboration_id,
            record_audio_only:window.audio_only,
            recording_type:window.recording_type
        };
        sendMessage(msg);
    };

    Object.defineProperty(this, 'rtcPeer', {writable: true});

    this.dispose = function () {
        this.rtcPeer.dispose();
        if (container.parentNode) {
            container.parentNode.removeChild(container);

        }
        
    };
    
    this.joinRoomScreenShare = function (offerSdp, wp) {
        offerSdpList[screenParticipant] = offerSdp;
        var msg = {
            id: "joinRoom",
            type: 'video',
            ownerName: this.ownerName,
            sender: screenParticipant,
            sdpOffer: offerSdp,
            enableRecording:window.enableRecording,
            collaboration_id:window.collaboration_id,
            record_audio_only:window.audio_only,
            recording_type:window.recording_type,
            screenShare:true
        };
        sendMessage(msg);
    };
}
