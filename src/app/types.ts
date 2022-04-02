

export class BBox {
    public cx: number = 0;
    public cy: number = 0;
    public vertices: Array<Point> = [];
    public orientation: number = 0;
    public facing: number = 0;
    public objClass: string = "";
    public VERTEXMAP: { [key: number] : {vertices: number[], offset: 'x' | 'y'}; } = {
        1: {vertices:[1, 2], offset: 'x'},
        2: {vertices:[2, 3], offset: 'y'},
        3: {vertices:[3, 4], offset: 'x'},
        4: {vertices:[4, 1], offset: 'y'},
        5: {vertices:[1, 5], offset: 'y'},
        6: {vertices:[2, 6], offset: 'y'},
        7: {vertices:[3, 7], offset: 'y'},
        8: {vertices:[4, 8], offset: 'y'},
        9: {vertices:[5, 6], offset: 'x'},
        10:{vertices:[6, 7], offset: 'y'},
        11:{vertices:[7, 8], offset: 'x'},
        12:{vertices:[8, 5], offset: 'y'},
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

    moveEdge(edgeIdx: number, moveOffset: number): void {
        var vertexInfo = this.VERTEXMAP[edgeIdx];
        if(vertexInfo.offset == 'x'){
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

    rotate(axis: number, angle: number): void {
        // for(var i = 0; i < this.vertices.length; i++){
        //     this.vertices[i].x 
        // }
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