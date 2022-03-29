import { AfterViewInit, Component, OnInit } from '@angular/core';
import * as $ from 'jquery';
import { BBox, Point } from './types';

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
  public selectedBBox!: BBox;

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

    /**
     * Handling function when mouse moves
     * @param mouse Mouse event details
     */
    function mouseMoved(mouse: MouseEvent) {
      that.handleMouseMove(mouse, canvas1);
    }

    document.getElementById('inputFile')?.click();
  }



  handleBoxes(newBox: BBox){

  }

  handleMouseMove(mouse: MouseEvent, cvs: HTMLCanvasElement){
    var x = (mouse.offsetX);
    var y = (mouse.offsetY);
    var ctx = cvs.getContext('2d') as CanvasRenderingContext2D;
    if(this.mode == 'drawing'){
      var width = x-this.startPoint.x;
      var height = y-this.startPoint.y;
      ctx.clearRect(0,0,  cvs.width,  cvs.height);
      ctx.drawImage(this.background,0,0); 
      this.draw3DBoxes();
      ctx.beginPath(); 
      ctx.rect(this.startPoint.x, this.startPoint.y, width, height);
      ctx.strokeStyle = 'yellow';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    else if(this.mode == 'move'){

    }

  }
  
  /**
   * Handles the mouse click of a canvas
   * @param mouse Mouse Event details
   * @param cvs Canvas that was clicked
   */
  handleMouseClick(mouse: MouseEvent, cvs: HTMLCanvasElement) {
    var rect = cvs.getBoundingClientRect();
    console.log(mouse);
    var x = (mouse.offsetX);
    var y = (mouse.offsetY);
    var ctx = cvs.getContext('2d') as CanvasRenderingContext2D;
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
    }
    else if(this.mode == 'drawing'){
      this.mode = 'move';
      cvs.style.cursor = "default";
      if(this.startPoint.x > x){
        if(this.startPoint.y < y){
          var p1 = new Point(this.startPoint.x, y);
          var p2 = new Point(x, this.startPoint.y);
          this.draw3DBox(cvs, ctx, p2, p1);
          return;
        }
        this.draw3DBox(cvs, ctx, new Point(x,y), this.startPoint);
        return;
      }
      if(this.startPoint.y > y){
        var p1 = new Point(this.startPoint.x, y);
        var p2 = new Point(x, this.startPoint.y);
        this.draw3DBox(cvs, ctx, p1, p2);
        return;
      }
      this.draw3DBox(cvs, ctx, this.startPoint, new Point(x,y));
    }
  }

  /**
   * Decrease the coordinate of the edge
   * @param index Index of the edge
   */
  decrease(index: number): void {
    this.selectedBBox.moveEdge(index, -0.5);
    this.draw3DBoxes();
  }

  increase(index: number){
    this.selectedBBox.moveEdge(index, 0.5);
    this.draw3DBoxes();
  }

  
  draw3DBoxes() {
    for(var i = 0; i < this.allBoxes.length; i++){
      var bbox: BBox = this.allBoxes[i];
      
    }
  }

  /**
   * Draw the 3D bounding box
   * 1. Calculate other sets of (x', y')
   * 2. Connect the points and draw the Cuboid
   * 3. Add all the 8 courner points into Box
   * @param cvs Canvas
   * @param ctx Canvas Context
   * @param p1 one corner point of 2D-BBox
   * @param p2 another corner point of 2D-BBox
   */
  draw3DBox(cvs: HTMLCanvasElement, ctx: CanvasRenderingContext2D, p1: Point, p2: Point){
    var cx: number = (p1.x + p2.x)/2,
    cy: number = (p1.y + p2.y)/2;
    ctx.clearRect(0,0,  cvs.width,  cvs.height);
    ctx.drawImage(this.background,0,0); 
    var C1: Point = new Point(p1.x, p1.y+Math.abs(p1.y - p2.y)/4);
    var C2: Point = new Point(p1.x, p2.y);
    var C3: Point = new Point(p1.x+Math.abs(p1.x - p2.x)*3/4, p2.y);
    var C4: Point = new Point(p1.x+Math.abs(p1.x - p2.x)*3/4, p1.y+Math.abs(p1.y - p2.y)/4);
    var C5: Point = new Point(p1.x+Math.abs(p1.x - p2.x)/4, p1.y);
    var C6: Point = new Point(p1.x+Math.abs(p1.x - p2.x)/4, p1.y+Math.abs(p1.y - p2.y)*3/4);
    var C7: Point = new Point(p2.x, p1.y+Math.abs(p1.y - p2.y)*3/4);
    var C8: Point = new Point(p2.x, p1.y)

    ctx.beginPath();
    ctx.fillStyle = "#FF000080";
    ctx.moveTo(C1.x, C1.y);
    ctx.lineTo(C2.x, C2.y);
    ctx.lineTo(C3.x, C3.y);
    ctx.lineTo(C4.x, C4.y);
    ctx.lineTo(C1.x, C1.y);
    ctx.fill();
    ctx.lineTo(C5.x, C5.y);
    ctx.lineTo(C6.x, C6.y);
    ctx.lineTo(C7.x, C7.y);
    ctx.lineTo(C8.x, C8.y);
    ctx.lineTo(C5.x, C5.y);
    
    ctx.moveTo(C2.x, C2.y);
    ctx.lineTo(C6.x, C6.y);
    
    ctx.moveTo(C3.x, C3.y);
    ctx.lineTo(C7.x, C7.y);

    ctx.moveTo(C4.x, C4.y);
    ctx.lineTo(C8.x, C8.y);
    // ctx.closePath();
    ctx.strokeStyle = 'yellow';
    ctx.lineWidth = 2;
    // ctx.fillRect(C1.x, C1.y, C3.x-C1.x, C3.y-C1.y);
    ctx.stroke();
    this.selectedBBox = new BBox([C1, C2, C3, C4, C5, C6, C7, C8]);
    this.allBoxes.push(this.selectedBBox);
    // bbox.boxes.push();
    // this.startPoint
    // bbox.cx = cx;
    // bbox.cy = cy;
  }

}