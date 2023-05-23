import {Component} from '@angular/core';
import {ChatService} from '../chat.service';
import {WebRtcPeer} from 'kurento-utils';

@Component({
  selector: 'app-webrtc',
  templateUrl: './webrtc.component.html',
  styleUrls: ['./webrtc.component.css']
})
export class WebrtcComponent {

  mediaStream: MediaStream;

  // private videoElement: HTMLVideoElement;

  roomName = ""
  userName = ""
  userId = ""
  videos: HTMLVideoElement[] = [];
  myVideos: HTMLVideoElement[] = [];


  newMessage: any;
  messageList: string[] = [];


  constructor(private chatService: ChatService) {

  }

  ngOnInit() {
    // this.chatService.videos$.subscribe(
    //   (value) => {
    //     this.videos.push(value)
    //   }
    // )
    this.videos = this.chatService.videos;
    this.myVideos = this.chatService.myVideos;


    this.chatService.getInfo().subscribe((message: string) => {
      console.log(message);
    })


    // this.chatService.getNewMessage().subscribe((message: string) => {
    //   console.log(message);
    //   // this.messageList.push(message);


    // // this.chatService.handle(this.roomName,this.userName);


    // })
  }

  onStart() {
    // this.videoElement = document.querySelector('video');

    // Access the media stream (webcam)
    navigator.mediaDevices.getUserMedia({video: true})
      .then((stream: MediaStream) => {
        this.mediaStream = stream;
        // this.videoElement.srcObject = stream;
      })
      .catch((error) => {
        console.error('Error accessing media devices:', error);
      });

  }

  onStop() {
    // this.videoElement.pause();
    // (this.videoElement.srcObject as MediaStream).getVideoTracks()[0].stop();
    // this.videoElement.srcObject = null;
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
  }

  ngOnDestroy() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
    }
  }

  doSomthing() {
    if (this.roomName === '' || this.userName === '') {
      alert('Room and Name are required!');
    } else {
      var message = {
        event: 'joinRoom',
        userName: this.userName,
        roomName: this.roomName
      }
      this.chatService.sendMessage(message);
      this.chatService.handle(this.roomName, this.userName).subscribe((message: any) => {
        console.log("user Id ", message.userid)
        // this.messageList.push(message);
      })

      // divRoomSelection.style = "display: none";
      // divMeetingRoom.style = "display: block";
    }
  }

  onLoadedMetadata(event: Event) {
    (event.target as HTMLVideoElement).play();
  }


}
