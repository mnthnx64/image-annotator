import { AfterViewInit, Component, OnInit } from '@angular/core';
import * as $ from 'jquery';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'image-annotator';
  public canvas!: HTMLCanvasElement;
  public context!: CanvasRenderingContext2D;
  public background: HTMLImageElement = new Image();
  public allBoxes: Array<BBox> = [];
  public bbox2d!: HTMLElement;
  public mode: 'draw' | 'drawing' | 'move' | 'rotate' | 'modify' = 'draw';
  public startPoint: Point = new Point(0, 0);

  constructor() { 
    
  }

  ngAfterViewInit(): void {
    this.canvas = document.getElementById("canvas1") as HTMLCanvasElement;
    this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
  }

  /**
   * Set the Image on canvas
   * @param $event File Data
   */
  onFileChanged($event: any) {
    if ($event.target.files && $event.target.files[0]) {
      var reader = new FileReader();
      var that = this;
      reader.onload = function (e: any) {
        that.background.src = e.target.result;
        that.background.onload = function() {
          that.canvas.width = that.background.width;
          that.canvas.height = that.background.height;
          that.context.drawImage(that.background,0,0); 
        }
        // .drawImage(e.target.result,0,0);   
        // document.getElementById('imgf')?.setAttribute("src", e.target.result);
      };
      reader.readAsDataURL($event.target.files[0]);
    }
  }

  /**
   * Called when the user clicks on the new umage button.
   */
  newImage(){
    var canvas1 = document.getElementById("canvas1") as HTMLCanvasElement;
    canvas1.addEventListener("mousedown", mouseClicked, false);
    canvas1.addEventListener("mousemove", mouseMoved, false);
    var that = this;

    /**
     * Handling function when mouse is clicked
     * @param mouse Mouse event details
     */
    function mouseClicked(mouse: MouseEvent) {
      that.handleMouseClick(mouse, canvas1);
    }

    function mouseMoved(mouse: MouseEvent) {
      that.handleMouseMove(mouse, canvas1);
    }

    document.getElementById('inputFile')?.click();
  }



  handleBoxes(newBox: BBox){

  }

  handleMouseMove(mouse: MouseEvent, cvs: HTMLCanvasElement){
    var x = (mouse.clientX - cvs.offsetLeft);
    var y = (mouse.clientY - cvs.offsetTop);
    var ctx = cvs.getContext('2d') as CanvasRenderingContext2D;
    if(this.mode == 'drawing'){
      var width = x-this.startPoint.x;
      var height = y-this.startPoint.y;
      
      this.redraw(ctx, cvs);
      ctx.beginPath();
      ctx.rect(this.startPoint.x, this.startPoint.y, width, height);
      ctx.strokeStyle = 'yellow';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  redraw(ctx: CanvasRenderingContext2D, cvs: HTMLCanvasElement){
    ctx.clearRect(0,0,  cvs.width,  cvs.height);
    ctx.drawImage(this.background,0,0); 
  }
  
  /**
   * Handles the mouse click of a canvas
   * @param mouse Mouse Event details
   * @param cvs Canvas that was clicked
   */
  handleMouseClick(mouse: MouseEvent, cvs: HTMLCanvasElement) {
    var rect = cvs.getBoundingClientRect();
    console.log(mouse);
    var x = (mouse.clientX - cvs.offsetLeft);
    var y = (mouse.clientY - cvs.offsetTop);
    if(this.mode == 'draw'){
      this.mode = 'drawing';
      
      this.startPoint.x = x;
      this.startPoint.y = y;

      // Visualize a 2D box
      this.bbox2d = document.createElement('div');
      this.bbox2d.className = 'rectangle';
      this.bbox2d.style.left = x + 'px';
      this.bbox2d.style.top = y + 'px';
      // cvs.appendChild(this.bbox2d);
      cvs.style.cursor = "crosshair";
      var ctx = cvs.getContext('2d');
    }
    else if(this.mode == 'drawing'){
      this.mode = 'draw';
      cvs.style.cursor = "default";
      var bbox: BBox = new BBox();
      bbox.boxes.push(new Point(x,y));
      bbox.startX = x;
      bbox.startY = y;
    }
    else{

    }
  }
}


export class BBox{
  public startX: number = 0;
  public startY: number = 0;
  public boxes: Array<Point> = [];
  public orientation: number = 0;
  public facing: number = 0;
  public objClass: string = "";
}

export class Point{
  public x: number = 0;
  public y: number = 0;

  constructor(x1: number, y1: number){
    this.x = x1;
    this.y = y1;
  }
}