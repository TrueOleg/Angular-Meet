declare var $: any;
import {Injectable} from '@angular/core';

@Injectable()

export class MeetService {
  audio: Element;
  video: Element;
  jitsi: any;
  connection: any;
  localTracks = [];
  remoteTracks = {};
  isJoined = false;
  room = null;

  private options = {
    hosts: {
      domain: 'jitsi-meet.example.com',
      muc: 'conference.jitsi-meet.example.com' // FIXME: use XEP-0030
    },
    bosh: '//jitsi-meet.example.com/http-bind', // FIXME: use xep-0156 for that

    // The name of client node advertised in XEP-0115 'c' stanza
    clientNode: 'http://jitsi.org/jitsimeet'
  };

  private confOptions = {
    openBridgeChannel: true
  };

  private initOptions = {
    disableAudioLevels: true,

    // The ID of the jidesha extension for Chrome.
    desktopSharingChromeExtId: 'mbocklcggfhnbahlnepmldehdhpjfcjp',

    // Whether desktop sharing should be disabled on Chrome.
    desktopSharingChromeDisabled: false,

    // The media sources to use when using screen sharing with the Chrome
    // extension.
    desktopSharingChromeSources: ['screen', 'window'],

    // Required version of Chrome extension
    desktopSharingChromeMinExtVersion: '0.1',

    // Whether desktop sharing should be disabled on Firefox.
    desktopSharingFirefoxDisabled: true
  };

  constructor() {
    this.jitsi = (window as any).JitsiMeetJS;
    this.jitsi.setLogLevel(this.jitsi.logLevels.ERROR);
    this.jitsi.init(this.initOptions);
    this.connection = new this.jitsi.JitsiConnection(null, null, this.options);
    this.connection.addEventListener(this.jitsi.events.connection.CONNECTION_ESTABLISHED, this.onConnectionSuccess);
    this.connection.addEventListener(this.jitsi.events.connection.CONNECTION_FAILED, this.onConnectionFailed);
    this.connection.addEventListener(this.jitsi.events.connection.CONNECTION_DISCONNECTED, this.disconnect);
    this.connection.connect();
  }

  private onConferenceJoined() {
    // console.log('conference joined!');
    this.isJoined = true;
    for (let i = 0; i < this.localTracks.length; i++) {
      this.room.addTrack(this.localTracks[i]);
    }
  }

  private onUserLeft(id) {
    // console.log('user left');
    if (!this.remoteTracks[id]) {
      return;
    }
    const tracks = this.remoteTracks[id];

    for (let i = 0; i < tracks.length; i++) {
      tracks[i].detach($(`#${id}${tracks[i].getType()}`));
    }
  }

  private onLocalTracks(tracks) {
    console.log('==============', tracks);
    this.localTracks = tracks;
    for (let i = 0; i < this.localTracks.length; i++) {
      this.localTracks[i].addEventListener(
        this.jitsi.events.track.TRACK_AUDIO_LEVEL_CHANGED,
        audioLevel => console.log(`Audio Level local: ${audioLevel}`));
      this.localTracks[i].addEventListener(
        this.jitsi.events.track.TRACK_MUTE_CHANGED,
        () => console.log('local track muted'));
      this.localTracks[i].addEventListener(
        this.jitsi.events.track.LOCAL_TRACK_STOPPED,
        () => console.log('local track stoped'));
      this.localTracks[i].addEventListener(
        this.jitsi.events.track.TRACK_AUDIO_OUTPUT_CHANGED,
        deviceId =>
          console.log(
            `track audio output device was changed to ${deviceId}`));
      if (this.localTracks[i].getType() === 'video') {
        // $('body').append(`<video autoplay='1' id='localVideo${i}' />`);
        this.localTracks[i].attach(this.video);
      } else {
        // $('body').append(
        // `<audio autoplay='1' muted='true' id='localAudio${i}' />`);
        this.localTracks[i].attach(this.audio);
      }
      if (this.isJoined) {
        this.room.addTrack(this.localTracks[i]);
      }
    }
  }

  private onRemoteTrack(track) {
    if (track.isLocal()) {
      return;
    }
    const participant = track.getParticipantId();

    if (!this.remoteTracks[participant]) {
      this.remoteTracks[participant] = [];
    }
    const idx = this.remoteTracks[participant].push(track);

    track.addEventListener(
      this.jitsi.events.track.TRACK_AUDIO_LEVEL_CHANGED,
      audioLevel => console.log(`Audio Level remote: ${audioLevel}`));
    track.addEventListener(
      this.jitsi.events.track.TRACK_MUTE_CHANGED,
      () => console.log('remote track muted'));
    track.addEventListener(
      this.jitsi.events.track.LOCAL_TRACK_STOPPED,
      () => console.log('remote track stoped'));
    track.addEventListener(this.jitsi.events.track.TRACK_AUDIO_OUTPUT_CHANGED,
      deviceId =>
        console.log(
          `track audio output device was changed to ${deviceId}`));
    const id = participant + track.getType() + idx;

    // if (track.getType() === 'video') {
    //   $('body').append(
    //     `<video autoplay='1' id='${participant}video${idx}' />`);
    // } else {
    //   $('body').append(
    //     `<audio autoplay='1' id='${participant}audio${idx}' />`);
    // }
    track.attach($(`#${id}`)[0]);
  }

  private onConnectionSuccess(data: any): void {
    this.room = this.connection.initJitsiConference('conference', this.confOptions);
    this.room.on(this.jitsi.events.conference.TRACK_ADDED, this.onRemoteTrack);
    this.room.on(this.jitsi.events.conference.TRACK_REMOVED, track => {
      // console.log(`track removed!!!${track}`);
    });
    this.room.on(
      this.jitsi.events.conference.CONFERENCE_JOINED,
      this.onConferenceJoined);
    this.room.on(this.jitsi.events.conference.USER_JOINED, id => {
      // console.log('user join');
      this.remoteTracks[id] = [];
    });
    this.room.on(this.jitsi.events.conference.USER_LEFT, this.onUserLeft);
    this.room.on(this.jitsi.events.conference.TRACK_MUTE_CHANGED, track => {
      console.log(`${track.getType()} - ${track.isMuted()}`);
    });
    this.room.on(
      this.jitsi.events.conference.DISPLAY_NAME_CHANGED,
      (userID, displayName) => console.log(`${userID} - ${displayName}`));
    this.room.on(
      this.jitsi.events.conference.TRACK_AUDIO_LEVEL_CHANGED,
      (userID, audioLevel) => console.log(`${userID} - ${audioLevel}`));
    this.room.on(
      this.jitsi.events.conference.PHONE_NUMBER_CHANGED,
      () => console.log(`${this.room.getPhoneNumber()} - ${this.room.getPhonePin()}`));
    this.room.join();
  }

  private onConnectionFailed(data: any): void {

  }

  private disconnect(): void {
    console.log('disconnecting?');
  }

  public createRoom(audio: Element, video: Element): void {
    this.audio = audio;
    this.video = video;

    this.jitsi.createLocalTracks({devices: ['audio', 'video']})
      .then(this.onLocalTracks.bind(this))
      .catch(error => {
        throw error;
      });

    if (this.jitsi.mediaDevices.isDeviceChangeAvailable('output')) {
      // this.jitsi.mediaDevices.enumerateDevices(devices => {
      //   const audioOutputDevices
      //     = devices.filter(d => d.kind === 'audiooutput');
      //
      //   if (audioOutputDevices.length > 1) {
      //     $('#audioOutputSelect').html(
      //       audioOutputDevices
      //         .map(
      //           d =>
      //             `<option value="${d.deviceId}">${d.label}</option>`)
      //         .join('\n'));
      //
      //     $('#audioOutputSelectWrapper').show();
      //   }
      // });
    }
  }


}
