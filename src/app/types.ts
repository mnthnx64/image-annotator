import * as _ from 'lodash';

export class BBox {
    public cx: number = 0;
    public cy: number = 0;
    public vertices: Array<Point> = [];
    public orientation: number = 0;
    public objClass: number = 0;
    public VERTEXMAP: { [key: number] : {vertices: number[], offset: 'x' | 'y'}; } = {
        1: {vertices:[1, 2], offset: 'y'},
        2: {vertices:[2, 3], offset: 'x'},
        3: {vertices:[3, 4], offset: 'y'},
        4: {vertices:[4, 1], offset: 'x'},
        5: {vertices:[1, 5], offset: 'x'},
        6: {vertices:[2, 6], offset: 'x'},
        7: {vertices:[3, 7], offset: 'x'},
        8: {vertices:[4, 8], offset: 'x'},
        9: {vertices:[5, 6], offset: 'y'},
        10:{vertices:[6, 7], offset: 'x'},
        11:{vertices:[7, 8], offset: 'y'},
        12:{vertices:[8, 5], offset: 'x'},
    };

    constructor(vertices?: Array<Point>){
        if (vertices == undefined){
            this.vertices = new Array<Point>(8);
        }
        else{
            this.vertices = vertices;
        }
    }

    /**
     * 
     * @param vertex Vertex point
     * @returns void if succesful
     */
    addVertex(vertex: Point): void{
        if(this.vertices.length < 8){
            this.vertices.push(vertex);
            return;
        }
        throw Error;
    }

    addVertexAtIndex(vertex: Point, index: number): void {
        this.vertices[index] = vertex;
    }

    moveEdge(edgeIdx: number, moveOffset: number, direction: string): void {
        var vertexInfo = this.VERTEXMAP[edgeIdx];
        if(direction == 'x'){
            var vertices = vertexInfo.vertices;
            for(var i = 0; i < vertices.length; i++){
                this.vertices[vertices[i] - 1].x += moveOffset;
            }
        }
        else{
            var vertices = vertexInfo.vertices;
            for(var i = 0; i < vertices.length; i++){
                this.vertices[vertices[i] - 1].y += moveOffset;
            }
        }
    }

    /** Find the points that are closer to the x axis */
    findClosest() {
        var closest = {pt: _.cloneDeep(this.vertices[0]), idx: 0};
        var secondClosest ={pt: _.cloneDeep(this.vertices[1]), idx: 1};
        for(var i = 0; i < 4; i++){
            if(this.vertices[i].y < closest.pt.y && i != closest.idx){
                secondClosest = _.cloneDeep(closest);
                closest = {pt: this.vertices[i], idx: i};
            }
            else if(this.vertices[i].y < secondClosest.pt.y && i != secondClosest.idx && i != closest.idx){
                secondClosest = {pt: this.vertices[i], idx: i};
            }
        }
        var reformed: Array<Point> = new Array<Point>(8);
        if(secondClosest.pt.x < closest.pt.x){
            reformed[1] = new Point(closest.pt.x, closest.pt.y);
            reformed[0] = new Point(secondClosest.pt.x, secondClosest.pt.y);
        }
        else{
            reformed[0] = new Point(closest.pt.x, closest.pt.y);
            reformed[1] = new Point(secondClosest.pt.x, secondClosest.pt.y);
        }

        
        var idxs = [0, 1, 2, 3];
        idxs.splice(closest.idx, 1);
        idxs.splice(secondClosest.idx, 1);
        var thirdPt = new Point(this.vertices[idxs[0]].x, this.vertices[idxs[0]].y);
        var fourthPt = new Point(this.vertices[idxs[1]].x, this.vertices[idxs[1]].y);
        

        if(thirdPt.x < fourthPt.x){
            reformed[3] = new Point(thirdPt.x, thirdPt.y);
            reformed[2] = new Point(fourthPt.x, fourthPt.y);
        }
        else{
            reformed[2] = thirdPt;
            reformed[3] = fourthPt;
        }
        this.vertices = reformed;
    }
}

export class Point {
    public x: number = 0;
    public y: number = 0;

    constructor(x1: number, y1: number) {
        this.x = x1;
        this.y = y1;
    }

    /**
     * Get the coordinates of the point
     * @returns Coordinates X and Y in an array
     */
    public getPoints(): number[] {
        return [this.x, this.y];
    }

    /**
     * Get the X coordinate of the point
     * @returns X coordinate of the point
     */
    public getX(): number {
        return this.x;
    }

    /**
     * Get the Y coordinate of the point
     * @returns Y coordinate of the point
     */
    public getY(): number {
        return this.y;
    }

    /**
     * Updates the X and Y coordinates of the point
     * @param x1 X coordinate of the point
     * @param y1 Y coordinate of the point
     */
    public updatePoints(x1: number, y1: number): void {
        this.x = x1;
        this.y = y1;
    }

    /**
     * Update the X coordinate of the point
     * @param x X coordinate of the point
     */
    public updateX(x: number): void {
        this.x = x;
    }

    /**
     * Update the Y coordinate of the point
     * @param y Y coordinate of the point
     */
    public updateY(y: number): void {
        this.y = y;
    }
}