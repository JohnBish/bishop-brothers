import { Component, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-curve',
  templateUrl: './curve.component.html',
  styleUrls: ['./curve.component.scss']
})
export class CurveComponent {
  @ViewChild('canvas') canvas: ElementRef;
  private canvasEl;
  private ctx;
  private proxyCanvas;
  private proxyCtx;

  private ARC_TO_HEIGHT_MAX = .2;
  private ANGLE_COMPENS = .01; // Additional curve to prevent white border

  public arcToHeight = this.ARC_TO_HEIGHT_MAX;
  private arcHeight;
  private rectHeight;
  private arcCenter = [0, 0];
  private radius;
  private arcAngleI;
  private arcAngleF;

  public width;
  public height;
  private scrollY;

  private BG_IMAGE_PATH = '../../assets/bg/violin.jpg';
  private bgImage;
  private blurRadius = 10;

  constructor(private platform: Platform) {
    platform.ready().then(source => {
      this.init();
    });
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillRect(0, 0, this.width, this.rectHeight);
    this.ctx.beginPath();
    this.ctx.arc(this.arcCenter[0], this.arcCenter[1], this.radius,
      this.arcAngleI, this.arcAngleF);
    this.ctx.fill();
  }

  init() {
    this.canvasEl = this.canvas.nativeElement;
    this.ctx = this.canvasEl.getContext('2d');
    this.resize();
    this.resizeCanvas();
    this.initBgImage();
    this.recalculateArc();
    this.draw();
  }

  initBgImage() {
    this.bgImage = new Image();
    this.bgImage.src = this.BG_IMAGE_PATH;
    this.proxyCanvas = document.createElement('canvas');
    this.proxyCtx = this.proxyCanvas.getContext('2d');
    this.bgImage.onload = () => {
      this.resizeBgImage();
      this.draw();
    }
  }

  recalculateArc() {
    this.arcHeight = this.height * this.arcToHeight;
    this.rectHeight = this.height - this.arcHeight;

    const centerX = this.width / 2;
    const centerY = this.height - this.arcHeight -
      (centerX * centerX - this.arcHeight * this.arcHeight) /
      (2 * this.arcHeight);

    this.radius = this.height - centerY;
    this.arcCenter = [centerX, centerY];
    this.arcAngleI = Math.PI / 2 -
      Math.acos((this.radius - this.arcHeight) / this.radius) -
      this.ANGLE_COMPENS;
    this.arcAngleF = Math.PI - this.arcAngleI;
  }

  resize() {
    this.width = this.platform.width();
    this.height = this.platform.height() / 1.05 + .5;
  }

  resizeCanvas() {
    if (this.canvasEl) {
      this.canvasEl.width = this.width;
      this.canvasEl.height = this.height;
    }
  }

  resizeBgImage() {
    const newHeight = (this.width / this.bgImage.width) * this.bgImage.height;
    const y = this.height - newHeight + 1;
    this.proxyCanvas.width = this.width;
    this.proxyCanvas.height = this.height;
    this.proxyCtx.filter = 'blur(' + this.blurRadius + 'px)';
    this.proxyCtx.fillRect(0, 0, this.width, this.height);
    this.proxyCtx.drawImage(this.bgImage, 0, y, this.width, newHeight);

    this.ctx.fillStyle = this.ctx.createPattern(this.proxyCanvas, 'no-repeat');
  }

  @HostListener('window:resize', ['$event'])
  onResize(e: Event) {
    this.resize();
    this.resizeCanvas();
    this.resizeBgImage();
    this.recalculateArc();
    this.draw();
  }

  onScroll(y: number) {
    if (y > this.height) return;
    
    this.scrollY = y;

    const reductionFactor = 1 - y / this.height;
    this.arcToHeight = this.ARC_TO_HEIGHT_MAX * reductionFactor;
    this.recalculateArc();

    this.draw();
  }
}
