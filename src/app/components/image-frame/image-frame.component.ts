import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-image-frame',
  templateUrl: './image-frame.component.html',
  styleUrls: ['./image-frame.component.scss']
})
export class ImageFrameComponent implements OnInit {
  @Input() title: string;

  constructor() { }

  ngOnInit() {
  }

}
