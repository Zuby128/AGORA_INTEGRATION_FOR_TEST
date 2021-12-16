import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../services/api.service';
import { MessagingService } from '../services/messaging.service';
import { IUser, StreamService } from '../services/stream.service';

@Component({
  selector: 'app-sdk',
  templateUrl: './sdk.component.html',
  styleUrls: ['./sdk.component.css']
})
export class SdkComponent implements OnInit {


  userName = '';
  hideBtns = true;

  sendedMessage = ''

  selectedPeer: any;

  constructor(public stream: StreamService, public api: ApiService,
    public message: MessagingService, private route: ActivatedRoute) {
    this.stream.updateUserInfo.subscribe(async (id) => {
      if (id) {
        const user = await this.message.rtmclient.getUserAttributes(id.toString()); // senderId means uid getUserInfo

        for (let index = 0; index < this.stream.remoteUsers.length; index++) {
          const element = this.stream.remoteUsers[index];
          if (element.uid == id) {
            element.name = user.name;
          }
        }
      }
    });

  }

  ngOnInit() {

  }

  channelName = '';
  sendChannelName(){
    this.stream.setChannelName(this.channelName)
  }

  spinner: boolean = false
  async startCall() {
    if (this.userName) {

      this.sendChannelName()

      this.spinner = true

      const uid = this.generateUid();

      const rtcDetails = await this.generateTokenAndUid(uid);
      // rtm
      await this.rtmUserLogin(uid);

      // rtc
      this.stream.createRTCClient();
      this.stream.agoraServerEvents(this.stream.rtc);
      await this.stream.localUser(rtcDetails.token, uid);

      this.spinner = false

      this.hideBtns = false;
    }
    else {
      alert('Enter name to start call');
    }
  }

// rtc token
  async generateTokenAndUid(uid: any) {
    console.log("11111111111111")
    // https://test-agora.herokuapp.com/access_token?channel=test&uid=1234
    let url = 'https://test-agora.herokuapp.com/access_token?';
    const opts = { params: new HttpParams({ fromString: "channel="+this.channelName+"&uid=" + uid }) };
    const data: any = await this.api.getRequest(url, opts.params).toPromise();
    console.log("1111111111111222221")
    return { 'uid': uid, token: data['token'] }

  }

  async generateRtmTokenAndUid(uid: any) {
    // https://sharp-pouncing-grass.glitch.me/rtmToken?account=1234 this part generate tokens from this page
    let url = 'https://sharp-pouncing-grass.glitch.me/rtmToken?';
    const opts = { params: new HttpParams({ fromString: "account=" + uid }) };
    const data: any = await this.api.getRequest(url, opts.params).toPromise();
    return { 'uid': uid, token: data['key'] }

  }

  generateUid() {
    const length = 5;
    const randomNo = (Math.floor(Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1)));
    return randomNo;
  }


  async rtmUserLogin(uid: any) {



    this.message.rtmclient = this.message.createRTMClient();

    this.message.channel = this.message.createRtmChannel(this.message.rtmclient);
    const rtmDetails = await this.generateRtmTokenAndUid(uid);

    await this.message.signalLogin(this.message.rtmclient, rtmDetails.token, uid.toString());
    await this.message.joinchannel(this.message.channel);
    await this.message.setLocalAttributes(this.message.rtmclient, this.userName)
    this.message.RTMevents(this.message.rtmclient);
    this.message.receiveChannelMessage(this.message.channel, this.message.rtmclient);

  }

  peertopeer() {
    this.message.sendOneToOneMessage(this.message.rtmclient, this.selectedPeer.uid.toString(), this.sendedMessage)
  }

  channelMsg() {
    this.message.sendMessageChannel(this.message.channel, this.sendedMessage);
  }



  async rtmclientChannelLogout() {
    await this.stream.leaveCall();
    this.message.leaveChannel(this.message.rtmclient, this.message.channel);
    this.userName = '';
  }


}
