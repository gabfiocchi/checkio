import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import SignaturePad from 'signature_pad';

@Component({
  selector: 'app-signature-pad',
  templateUrl: './signature-pad.component.html',
  styleUrls: ['./signature-pad.component.scss'],
})
export class SignaturePadComponent implements OnInit {

  canvas: HTMLCanvasElement
  signaturePad
  @ViewChild('pad', { static: true }) pad: ElementRef<HTMLCanvasElement>;
  constructor() { }

  ngOnInit() {


  }
  ngAfterViewInit() {
    if (this.pad) {
      this.canvas = this.pad.nativeElement;

      this.signaturePad = new SignaturePad(this.canvas, {
        backgroundColor: 'rgb(255, 255, 255)',
      });

      setTimeout(() => {
        this.resizeCanvas();
      }, 300);
    }
  }
  private resizeCanvas() {
    let ratio = Math.max(window.devicePixelRatio || 1, 1);
    this.canvas.width = this.canvas.offsetWidth * ratio;
    this.canvas.height = this.canvas.offsetHeight * ratio;
    this.canvas.getContext('2d').scale(ratio, ratio);
    this.signaturePad.clear(); // otherwise isEmpty() might return incorrect value
  }

  erasePad() {
    this.signaturePad.clear();
    // var ctx = this.canvas.getContext('2d');
    // ctx.globalCompositeOperation = 'destination-out';
  }
}
