import {AfterViewInit, Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';
import {MeetService} from './meet.service';

declare var JitsiMeetJS: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'app';
  private jitsi: any;

  @ViewChild('video') video: ElementRef;
  @ViewChild('audio') audio: ElementRef;

  constructor(
    private jitsiService: MeetService,
    private renderer: Renderer2
  ) {

  }

  ngOnInit() {
    console.log('AAAAAA', this.jitsiService.connection);
  }

  ngAfterViewInit() {

  }

  check() {
    this.jitsiService.createRoom(this.audio.nativeElement, this.video.nativeElement);
  }


}
