import { Component, OnInit, ViewChild, ElementRef, OnDestroy, Input } from '@angular/core';
import SignaturePad from 'signature_pad';
import trimCanvas from 'trim-canvas';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-signature-pad',
  templateUrl: './signature-pad.component.html',
  styleUrls: ['./signature-pad.component.scss'],
})
export class SignaturePadComponent implements OnInit, OnDestroy {

  canvas: HTMLCanvasElement
  signaturePad: SignaturePad;
  imageA;
  imageB;
  @Input() translations: {
    title: string,
    save: string,
    erase: string
  };
  @ViewChild('pad', { static: true }) pad: ElementRef<HTMLCanvasElement>;
  constructor(
    private modalController: ModalController,
  ) { }

  ngOnInit() {
    window.addEventListener('resize', this.resizeCanvas);
  }
  ngOnDestroy() {
    window.removeEventListener('resize', this.resizeCanvas);
  }
  ngAfterViewInit() {
    if (this.pad) {
      this.canvas = this.pad.nativeElement;

      this.signaturePad = new SignaturePad(this.canvas, {
        backgroundColor: 'rgb(255, 255, 255)',
        penColor: 'blue'
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

  erase() {
    this.signaturePad.clear();
  }

  private cloneAndTrimCanvas(): any {
    const newCanvas = document.createElement('canvas');
    const newContext = newCanvas.getContext('2d');

    newCanvas.width = this.canvas.width;
    newCanvas.height = this.canvas.height;

    newContext.drawImage(this.canvas, 0, 0);
    trimCanvas(newCanvas);
    return newCanvas;
  }

  save() {
    if (this.signaturePad.isEmpty()) {
      return alert("Please provide a signature first.");
    }

    this.modalController.dismiss({
      signature: this.signaturePad.toDataURL('image/jpeg')
    });
  }
}
