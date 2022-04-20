import { AfterViewInit, Component } from '@angular/core';
import { FormControl } from '@angular/forms';
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
  public selectedEdge = '1';
  public edgePixelControl: FormControl = new FormControl();
  public objects = [
    { name: "Car", value: 0 },
    { name: "Truck", value: 1 },
    { name: "Bus", value: 2 },
    { name: "Van", value: 3 },
    { name: "Tram", value: 4 }
  ];
  public orientations = [
    { name: "Face 1", value: 0 },
    { name: "Face 2", value: 1 },
    { name: "Face 3", value: 2 },
    { name: "Face 4", value: 3 },
    { name: "Face 5", value: 4 },
    { name: "Face 6", value: 5 },
    { name: "Face 7", value: 6 },
    { name: "Face 8", value: 7 },
  ];
  public selectedBox: number = 0;
  private selectedBBox!: BBox;
  private fileName: string = "";

  constructor() {
  }

  ngAfterViewInit(): void {
    this.canvas = document.getElementById("canvas1") as HTMLCanvasElement;
    this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
  }

  selectBox(index: number): void {
    this.selectedBox = index;
    this.draw3DBoxes();
  }

  deleteBox(index: number): void {
    this.allBoxes.splice(index, 1);
    if (this.selectedBox == index) {
      this.selectedBox = 0;
    }
    this.draw3DBoxes();
  }

  /**
   * Set the Image on canvas
   * @param $event File Data
   */
  onFileChanged($event: any) {
    if ($event.target.files && $event.target.files[0]) {
      var reader = new FileReader();
      var that = this;
      this.fileName = $event.target.files[0].name;
      reader.onload = function (e: any) {
        that.background.src = e.target.result;
        that.background.onload = function () {
          that.canvas.width = that.background.width;
          that.canvas.height = that.background.height;
          that.context.drawImage(that.background, 0, 0);
          that.allBoxes = [];
        }
      };
      reader.readAsDataURL($event.target.files[0]);
    }
  }

  /**
   * Called when the user clicks on the new umage button.
   */
  newImage() {
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

  newBox() {
    if (this.mode != 'move') {
      return;
    }
    // Set mode to draw
    this.mode = 'draw';
  }


  handleMouseMove(mouse: MouseEvent, cvs: HTMLCanvasElement) {
    var x = (mouse.offsetX);
    var y = (mouse.offsetY);
    var ctx = cvs.getContext('2d') as CanvasRenderingContext2D;
    if (this.mode == 'drawingLine') {
      // var width = x-this.startPoint.x;
      // var height = y-this.startPoint.y;
      ctx.clearRect(0, 0, cvs.width, cvs.height);
      ctx.drawImage(this.background, 0, 0);
      this.draw3DBoxes();
      ctx.beginPath();
      ctx.moveTo(this.startPoint.x, this.startPoint.y);
      ctx.lineTo(x, y);
      ctx.strokeStyle = 'yellow';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.closePath();
    }
    else if (this.mode == 'drawingRect') {
      ctx.clearRect(0, 0, cvs.width, cvs.height);
      ctx.drawImage(this.background, 0, 0);
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
      for (var i = 1; i < 4; i++) {
        ctx.lineTo(this.selectedBBox.vertices[i].x, this.selectedBBox.vertices[i].y)
        if (i == 3) { ctx.strokeStyle = '#ffff00A0'; } else { ctx.strokeStyle = '#ffff00'; }
        ctx.stroke();
      }
      ctx.lineTo(this.selectedBBox.vertices[0].x, this.selectedBBox.vertices[0].y);
      ctx.strokeStyle = '#ffff00A0';
      ctx.stroke();
      ctx.fill();

    }
    else if (this.mode == 'drawing3D') {
      var offsetY = this.selectedBBox.vertices[2].y - y;
      for (var i = 4; i < 8; i++) {
        this.selectedBBox.vertices[i].y = this.selectedBBox.vertices[i - 4].y - offsetY;
      }
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
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
    if (this.mode == 'draw') {
      this.mode = 'drawingLine';
      this.startPoint.x = x;
      this.startPoint.y = y;
      cvs.style.cursor = "crosshair";
    }
    else if (this.mode == 'drawingLine') {
      this.mode = 'drawingRect';
      this.selectedBBox = new BBox();
      var lineEnd: Point = new Point(x, y);
      this.selectedBBox.addVertexAtIndex(new Point(this.startPoint.x, this.startPoint.y), 0);
      this.selectedBBox.addVertexAtIndex(lineEnd, 1);
      this.selectedBBox.addVertexAtIndex(lineEnd, 3);
      this.selectedBBox.addVertexAtIndex(new Point(this.startPoint.x, this.startPoint.y), 4);
    }
    else if (this.mode == 'drawingRect') {
      this.mode = 'drawing3D';
      this.selectedBBox.findClosest();
      for (var i = 4; i < 8; i++) {
        var pt = new Point(this.selectedBBox.vertices[i - 4].x, this.selectedBBox.vertices[i - 4].y);
        this.selectedBBox.addVertexAtIndex(pt, i);
      }
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.context.drawImage(this.background, 0, 0);
      this.draw3DBoxes();
      this.draw3DBox(this.selectedBBox);
    }
    else if (this.mode == 'drawing3D') {
      this.mode = 'move';
      cvs.style.cursor = "default";
      this.allBoxes.push(this.selectedBBox);
      this.selectedBox = this.allBoxes.length - 1;
      this.draw3DBoxes();
    }
  }

  /**
   * Handle number only input for moving pixel
   * @param event any
   * @returns 
   */
  numberOnly(event: any) {
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
   * @param direction of the move
   */
  decrease(direction: string): void {
    var index = parseInt(this.selectedEdge);
    var inp = document.getElementById("inp") as HTMLInputElement;
    var val = inp.value;
    if (val == "" || val == undefined) {
      val = "0.5"
    }
    this.allBoxes[this.selectedBox].moveEdge(index, -parseFloat(val), direction);
    this.draw3DBoxes();
  }

  /**
   * Increase the coordinate of the edge
   * @param direction of the move
   */
  increase(direction: string) {
    var index = parseInt(this.selectedEdge);
    var inp = document.getElementById("inp") as HTMLInputElement;
    var val = inp.value;
    if (val == "" || val == undefined) {
      val = "0.5"
    }
    this.allBoxes[this.selectedBox].moveEdge(index, parseFloat(val), direction);
    this.draw3DBoxes();
  }


  draw3DBoxes() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.drawImage(this.background, 0, 0);
    for (var i = 0; i < this.allBoxes.length; i++) {
      var bbox: BBox = this.allBoxes[i];
      i == this.selectedBox ? this.context.strokeStyle = 'yellow' : this.context.strokeStyle = 'black';
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
  draw3DBox(bbox: BBox) {
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

    this.context.lineWidth = 2;
    this.context.stroke();
    this.context.closePath();
  }


  /** Function exported that exports the content of allboxes into a CSV and downloads the file */
  exportCSV() {
    var csvContent = "data:text/csv;charset=utf-8,";
    var data = [];
    var header = [];
    header.push("class");
    header.push("orientation");
    header.push("x0");
    header.push("y0");
    header.push("x1");
    header.push("y1");
    header.push("x2");
    header.push("y2");
    header.push("x3");
    header.push("y3");
    header.push("x4");
    header.push("y4");
    header.push("x5");
    header.push("y5");
    header.push("x6");
    header.push("y6");
    header.push("x7");
    header.push("y7");
    data.push(header);
    for (var i = 0; i < this.allBoxes.length; i++) {
      var bbox = this.allBoxes[i];
      var row = [];
      row.push(bbox.objClass);
      row.push(bbox.orientation);
      row.push(bbox.vertices[0].x);
      row.push(bbox.vertices[0].y);
      row.push(bbox.vertices[1].x);
      row.push(bbox.vertices[1].y);
      row.push(bbox.vertices[2].x);
      row.push(bbox.vertices[2].y);
      row.push(bbox.vertices[3].x);
      row.push(bbox.vertices[3].y);
      row.push(bbox.vertices[4].x);
      row.push(bbox.vertices[4].y);
      row.push(bbox.vertices[5].x);
      row.push(bbox.vertices[5].y);
      row.push(bbox.vertices[6].x);
      row.push(bbox.vertices[6].y);
      row.push(bbox.vertices[7].x);
      row.push(bbox.vertices[7].y);
      data.push(row);
    }
    data.forEach(function (infoArray, index) {
      var dataString = infoArray.join(",");
      csvContent += index < data.length ? dataString + "\n" : dataString;
    });
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", this.fileName + ".csv");
    document.body.appendChild(link); // Required for FF
    link.click();
    document.body.removeChild(link);
  }

  importCSV1() {
    document.getElementById('csvFile')?.click();
  }

  /** Function importCSV that reads a CSV file from file system into a variable arr */
  importCSV($event: any) {
    if ($event.target.files && $event.target.files[0]) {
      var reader = new FileReader();
      var that = this;
      reader.onload = function (e: any) {
        var csv = reader.result!.toString();
        var allTextLines = csv.split(/\r\n|\n/);
        var lines = [];
        for (var i = 0; i < allTextLines.length; i++) {
          var data = allTextLines[i].split(',');
          var tarr = [];
          for (var j = 0; j < data.length; j++) {
            tarr.push(data[j]);
          }
          lines.push(tarr);
        }
        that.allBoxes = [];
        for (var i = 1; i < lines.length; i++) {
          var bbox = new BBox();
          bbox.objClass = parseInt(lines[i][0]);
          bbox.orientation = parseInt(lines[i][1]);
          bbox.vertices[0] = new Point(parseFloat(lines[i][2]), parseFloat(lines[i][3]));
          bbox.vertices[1] = new Point(parseFloat(lines[i][4]), parseFloat(lines[i][5]));
          bbox.vertices[2] = new Point(parseFloat(lines[i][6]), parseFloat(lines[i][7]));
          bbox.vertices[3] = new Point(parseFloat(lines[i][8]), parseFloat(lines[i][9]));
          bbox.vertices[4] = new Point(parseFloat(lines[i][10]), parseFloat(lines[i][11]));
          bbox.vertices[5] = new Point(parseFloat(lines[i][12]), parseFloat(lines[i][13]));
          bbox.vertices[6] = new Point(parseFloat(lines[i][14]), parseFloat(lines[i][15]));
          bbox.vertices[7] = new Point(parseFloat(lines[i][16]), parseFloat(lines[i][17]));
          that.allBoxes.push(bbox);
        }
        that.draw3DBoxes();
      }
      reader.readAsText($event.target.files[0]);
    }
  }

}