import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import io  from 'socket.io-client';
import {WebRtcPeer} from 'kurento-utils';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  public message$: BehaviorSubject<string> = new BehaviorSubject('');
  videos: HTMLVideoElement[] = [];
  myVideos: HTMLVideoElement[] = [];


  constructor() {}

  socket = io('http://192.168.1.12:3000');

  participants = {};





  // handlers functions

  sendMessage(message: any) : void {
    console.log('sending ' + JSON.stringify(message) +' message to server');
    this.socket.emit('message', message);
  }
   onExistingParticipants(roomName, userName, userid, existingUsers) {// les utilisateurs existants vont communiquer avec un nouveau utilisateur
    var video = document.createElement('video');
    var div = document.createElement('div');
    div.className = "videoContainer";
    var name = document.createElement('div');
    video.id = userid;
    video.autoplay = true;
    this.myVideos[0]=video
    name.appendChild(document.createTextNode(userName));
    div.appendChild(video);
    div.appendChild(name);
    // divMeetingRoom.appendChild(div);

    var user = {
        id: userid,
        username: userName,
        video: video,
        rtcPeer: null
    }

    this.participants[user.id] = user;

    var constraints = {
        audio: true,
        video : {
			mandatory : {
				maxWidth : 320,
				maxFrameRate : 15,
				minFrameRate : 15
			}
		}
    };
    let options = {
        localVideo: video,
        mediaConstraints: constraints,
        onicecandidate: onIceCandidate
    }

    user.rtcPeer = WebRtcPeer.WebRtcPeerSendonly(options,
        function (err) {
            if (err) {
                return console.error(err);
            }
            this.generateOffer(onOffer)
        }
    );

    existingUsers.forEach( (element)=>  {
        this.receiveVideo(roomName, userName, element.id, element.name);
    });


     var onOffer = (err, offer, wp)=> {
        console.log('sending offer');
        var message = {
            event: 'receiveVideoFrom',
            userid: user.id,
            roomName: roomName,
            sdpOffer: offer
        }
        this.sendMessage(message);
    }

     var onIceCandidate = (candidate, wp) =>   {
        console.log('sending ice candidates');
        var message = {
            event: 'candidate',
            userid: user.id,
            roomName: roomName,
            candidate: candidate
        }
        this.sendMessage(message);
    }
}




  receiveVideo(roomName, userName, userid, username) {
    var video = document.createElement('video');
    var div = document.createElement('div');
    div.className = "videoContainer";
    var name = document.createElement('div');
    video.id = userid;
    video.autoplay = true;
    // this.getVideo(video);
    this.videos.push(video);
    name.appendChild(document.createTextNode(username));
    div.appendChild(video);
    div.appendChild(name);
    // divMeetingRoom.appendChild(div);

    var user = {
        id: userid,
        username: username,
        videoo: video,
        rtcPeer: null //rtcPeer pour etablir une connexion WebRTC
    }
    console.log('rani snaat user');

    this.participants[user.id] = user;
    //initialiser  l'instance rtcPeer
    var options = {
        remoteVideo: video,
        onicecandidate: onIceCandidate //appeler lorsqu'un ICEcandidate sera trouvé
    }
    /////
    user.rtcPeer = WebRtcPeer.WebRtcPeerRecvonly(options,
        function (err) {
            if (err) {
                return console.error(err);
            }
            this.generateOffer(onOffer);
        }
    );

    var onOffer = (err, offer, wp) =>{
        console.log('sending offer');
        var message = {
            event: 'receiveVideoFrom',
            userid: user.id,
            roomName: roomName,
            sdpOffer: offer
        }
        this.sendMessage(message);
    }

    function onIceCandidate(candidate, wp) {
        console.log('sending ice candidates');
        var message = {
            event: 'candidate',
            userid: user.id,
            roomName: this.roomName,
            candidate: candidate
        }
        this.sendMessage(message);
    }
  }





   onReceiveVideoAnswer(roomName, userName, senderid, sdpAnswer) {
    this.participants[senderid].rtcPeer.processAnswer(sdpAnswer);
    console.log("aandi answer");
}

 addIceCandidate(roomName, userName, userid, candidate) {
    this.participants[userid].rtcPeer.addIceCandidate(candidate);
    console.log("nab3eth fi ice");

}




  public handle = (roomName, userName) => {
    this.socket.on('message', (message) =>{
        console.log("message received " + JSON.stringify(message));
        switch (message.event) {
          case 'newParticipantArrived':
              this.receiveVideo(roomName, userName, message.userid, message.username);
              console.log("newParticipantArrived");
              break;
          case 'existingParticipants':
            console.log("existingParticipants");

             this.onExistingParticipants(roomName, userName, message.userid, message.existingUsers);
              break;
          case 'receiveVideoAnswer':
              this.onReceiveVideoAnswer(roomName, userName, message.senderid, message.sdpAnswer);
              console.log("receiveVideoAnswer");
              break;
          case 'candidate':
              this.addIceCandidate(roomName, userName, message.userid, message.candidate);
              console.log("candidate")
              break;
    }});

    return this.message$.asObservable();
  };

  public getInfo = () => {
    this.socket.on('info', (message) =>{
      this.message$.next(message);
    });

    return this.message$.asObservable();
  };

  // getVideo = (htmlVideoElement) =>{
  //   this.videos$.next(htmlVideoElement);
  //   return this.videos$.asObservable();
  // }

}
