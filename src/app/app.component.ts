import { AfterViewInit, Component } from '@angular/core';
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
  public mode: 'draw' | 'drawingLine' | 'drawingRect' | 'drawing3D' | 'move' | 'rotate' | 'modify' = 'draw';
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

  newBox(){
    if(this.mode !='move'){
      return;
    }
    // Set mode to draw
    this.mode = 'draw';
  }


  handleMouseMove(mouse: MouseEvent, cvs: HTMLCanvasElement){
    var x = (mouse.offsetX);
    var y = (mouse.offsetY);
    var ctx = cvs.getContext('2d') as CanvasRenderingContext2D;
    if(this.mode == 'drawingLine'){
      // var width = x-this.startPoint.x;
      // var height = y-this.startPoint.y;
      ctx.clearRect(0,0,  cvs.width,  cvs.height);
      ctx.drawImage(this.background,0,0); 
      this.draw3DBoxes();
      ctx.beginPath(); 
      ctx.moveTo(this.startPoint.x, this.startPoint.y);
      ctx.lineTo(x, y);
      ctx.strokeStyle = 'yellow';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.closePath();
    }
    else if(this.mode == 'drawingRect'){
      ctx.clearRect(0,0,  cvs.width,  cvs.height);
      ctx.drawImage(this.background,0,0); 
      this.draw3DBoxes();
      var lineEnd = this.selectedBBox.vertices[1];
      var offsetX = lineEnd.x - x;
      var offsetY = lineEnd.y - y;
      var hiddenPoint = new Point(this.selectedBBox.vertices[0].x - offsetX, this.selectedBBox.vertices[0].y - offsetY);
      this.selectedBBox.addVertexAtIndex(hiddenPoint, 3);
      this.selectedBBox.addVertexAtIndex(new Point(x, y), 2);
      ctx.beginPath(); 
      ctx.fillStyle = "#ffff0080";
      ctx.lineWidth = 2;
      ctx.moveTo(this.selectedBBox.vertices[0].x, this.selectedBBox.vertices[0].y)
      for (var i = 1; i < 4; i++){
        ctx.lineTo(this.selectedBBox.vertices[i].x, this.selectedBBox.vertices[i].y)
        if(i == 3){ ctx.strokeStyle = '#ffff00A0';  } else { ctx.strokeStyle = '#ffff00'; }
        ctx.stroke();
      }
      ctx.lineTo(this.selectedBBox.vertices[0].x, this.selectedBBox.vertices[0].y);
      ctx.strokeStyle = '#ffff00A0';
      ctx.stroke();
      ctx.fill();
      
    }
    else if(this.mode == 'drawing3D'){
      var offsetY = this.selectedBBox.vertices[2].y - y;
      for(var i = 4; i <8; i++){
        this.selectedBBox.vertices[i].y = this.selectedBBox.vertices[i-4].y - offsetY;
      }
      this.context.clearRect(0,0,  this.canvas.width,  this.canvas.height);
      this.context.drawImage(this.background, 0, 0);
      this.draw3DBoxes();
      this.draw3DBox(this.selectedBBox);
    }

  }
  
  /**
   * Handles the mouse click of a canvas
   * @param mouse Mouse Event details
   * @param cvs Canvas that was clicked
   */
  handleMouseClick(mouse: MouseEvent, cvs: HTMLCanvasElement) {
    var rect = cvs.getBoundingClientRect();
    var x = (mouse.offsetX);
    var y = (mouse.offsetY);
    var ctx = cvs.getContext('2d') as CanvasRenderingContext2D;
    if(this.mode == 'draw'){
      this.mode = 'drawingLine';
      this.startPoint.x = x;
      this.startPoint.y = y;

      cvs.style.cursor = "crosshair";
    }
    else if(this.mode == 'drawingLine'){
      this.mode = 'drawingRect';
      this.selectedBBox = new BBox();
      var lineEnd:Point = new Point(x, y);
      this.selectedBBox.addVertexAtIndex(new Point(this.startPoint.x, this.startPoint.y), 0);
      this.selectedBBox.addVertexAtIndex(lineEnd, 1);
      this.selectedBBox.addVertexAtIndex(lineEnd, 3);
      this.selectedBBox.addVertexAtIndex(new Point(this.startPoint.x, this.startPoint.y), 4);
    }
    else if(this.mode == 'drawingRect'){
      this.mode = 'drawing3D';
      for(var i = 4; i <8; i++){
        var pt = new Point(this.selectedBBox.vertices[i-4].x, this.selectedBBox.vertices[i-4].y);
        this.selectedBBox.addVertexAtIndex(pt, i);
      }
      this.context.clearRect(0,0,  this.canvas.width,  this.canvas.height);
      this.context.drawImage(this.background, 0, 0);
      this.draw3DBoxes();
      this.draw3DBox(this.selectedBBox);
    }
    else if(this.mode == 'drawing3D'){
      this.mode = 'move';
      cvs.style.cursor = "default";
      this.allBoxes.push(this.selectedBBox);
      this.draw3DBoxes();
    }
  }

  /**
   * Handle number only input for moving pixel
   * @param event any
   * @returns 
   */
  numberOnly(event: any): boolean {
    var charCode = (event.which) ? event.which : event.keyCode;
    if (charCode != 46 && charCode > 31
      && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  /**
   * Decrease the coordinate of the edge
   * @param index Index of the edge
   */
  decrease(index: number): void {
    var inp = document.getElementById("inp") as HTMLInputElement;
    var val = inp.value;
    if(val == "" || val == undefined){
      val = "0.5"
    }
    this.selectedBBox.moveEdge(index, -parseFloat(val));
    this.draw3DBoxes();
  }

  /**
   * Increase the coordinate of the edge
   * @param index Index of the edge
   */
  increase(index: number){
    var inp = document.getElementById("inp") as HTMLInputElement; 
    var val = inp.value;
    if(val == "" || val == undefined){
      val = "0.5"
    }
    this.selectedBBox.moveEdge(index, parseFloat(val));
    this.draw3DBoxes();
  }

  rotate(axis: number, direction: number){
    var inp = document.getElementById("inp") as HTMLInputElement; 
    var val = inp.value;
    if(val == "" || val == undefined){
      val = "0.5"
    }
    this.selectedBBox.rotate(axis, parseFloat(val)*direction);
  }

  
  draw3DBoxes() {
    this.context.clearRect(0,0,  this.canvas.width,  this.canvas.height);
    this.context.drawImage(this.background, 0, 0);
    for(var i = 0; i < this.allBoxes.length; i++){
      var bbox: BBox = this.allBoxes[i];
      this.draw3DBox(bbox);
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
  draw3DBox(bbox: BBox){
    this.context.beginPath();
    this.context.fillStyle = "#FF000080";
    this.context.moveTo(bbox.vertices[0].x, bbox.vertices[0].y);
    this.context.lineTo(bbox.vertices[1].x, bbox.vertices[1].y);
    this.context.lineTo(bbox.vertices[2].x, bbox.vertices[2].y);
    this.context.lineTo(bbox.vertices[3].x, bbox.vertices[3].y);
    this.context.lineTo(bbox.vertices[0].x, bbox.vertices[0].y);
    // this.context.fill();
    this.context.lineTo(bbox.vertices[4].x, bbox.vertices[4].y);
    this.context.lineTo(bbox.vertices[5].x, bbox.vertices[5].y);
    this.context.lineTo(bbox.vertices[6].x, bbox.vertices[6].y);
    this.context.lineTo(bbox.vertices[7].x, bbox.vertices[7].y);
    this.context.lineTo(bbox.vertices[4].x, bbox.vertices[4].y);
    
    this.context.moveTo(bbox.vertices[1].x, bbox.vertices[1].y);
    this.context.lineTo(bbox.vertices[5].x, bbox.vertices[5].y);
    
    this.context.moveTo(bbox.vertices[2].x, bbox.vertices[2].y);
    this.context.lineTo(bbox.vertices[6].x, bbox.vertices[6].y);

    this.context.moveTo(bbox.vertices[3].x, bbox.vertices[3].y);
    this.context.lineTo(bbox.vertices[7].x, bbox.vertices[7].y);
    this.context.strokeStyle = 'yellow';
    this.context.lineWidth = 2;
    this.context.stroke();
    this.context.closePath();
  }

}