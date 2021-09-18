import {Drawing, Vector, Point} from "./common"
import {init_tests, draw_tests} from "./projection_test"

// A class for our application state and functionality
class MyDrawing extends Drawing {
    ctm: number[][] // syntax?
    //curr: number[][]
    vertices: Point[] // Array?
    
    constructor (div: HTMLElement) {
        super(div)
        this.ctm = [...Array(4)].map(e => Array(4)) 
        //this.curr = [...Array(4)].map(e => Array(4)) 
        this.vertices = new Array(0)
        init_tests(this)

    }

    drawScene() {
        draw_tests(this)
    }

    // Matrix and Drawing Library implemented as part of this object

    // Begin by using the matrix transformation routines from part A of this project.
    // Make your current transformation matrix a property of this object.
    // You should modify the new routines listed below to complete the assignment.
    // Feel free to define any additional classes, class variables and helper methods
    // that you need.


    beginShape() {
        this.vertices = new Array(0);
    }

    endShape() {
        for (let i = 0; i < this.vertices.length-1; i += 2) {
            super.line(this.vertices[i], this.vertices[i+1]);
        }
        this.vertices = new Array(0);
        //this.initMatrix;
    }

    vertex(x: number, y: number, z: number) {
        let p = [
            [x],[y],[z],[1]
        ]
        let transformedP = this.multiply(this.ctm, p)
        let point = {
            x: transformedP[0][0], 
            y: transformedP[1][0],
            z: transformedP[2][0]
        };
        console.log(this.vertices.length)
        this.vertices.push(point)
    }

    perspective(fov: number, near: number, far: number) {
        this.rotateY(-fov);
        const pToO = [ //view transformation
            [near, 0, 0, 0],
            [0, near, 0, 0],
            [0, 0, near+far, -near*far],
            [0, 0, 1, 0],
        ]
        this.ctm = this.multiply(pToO,this.ctm)
        this.ortho(0,near-far,0,near-far,near,far) // center is assumed to be the origin
    }

    ortho( left: number, right: number, top: number, bottom: number, 
        near: number, far: number) {
            const width = this.canv.width
            const height = this.canv.height
            this.translate(-(left+right)/2 + width/2, -(top+bottom)/2 + height/2, -(near+far)/2); // to center of the screen
            //this.scale(2/(right-left), 2/(top-bottom), 2/(near- far)); //to canonical tube
            
            //viewport 
            //this. scale((this.canv.width-1)/2, (this.canv.height-1)/2, 0);
            //this.scale(this.canv.height/2, this.canv.width/2, 0);
	}

    initMatrix() // was init()
    {
        this.ctm = [
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1],
        ];
    }
    
    // mutiply the current matrix by the translation
    translate(x: number, y: number, z: number)
    {
        const a = [
            [1, 0, 0, x],
            [0, 1, 0, y],
            [0, 0, 1, z],
            [0, 0, 0, 1]
        ];
        this.ctm = this.multiply(this.ctm, a);
    }
    
    // mutiply the current matrix by the scale
    scale(x: number, y: number, z: number)
    {
        const a = [
            [x, 0, 0, 0],
            [0, y, 0, 0],
            [0, 0, z, 0],
            [0, 0, 0, 1]
        ];
        this.ctm = this.multiply(this.ctm, a);
    }
    
    // mutiply the current matrix by the rotation
    rotateX(angle: number)
    {
        const theta = angle * Math.PI/180;
        const a = [
            [1, 0, 0, 0],
            [0, Math.cos(theta), -Math.sin(theta), 0],
            [0, Math.sin(theta), Math.cos(theta), 0],
            [0, 0, 0, 1]
        ];
        this.ctm = this.multiply(this.ctm, a);
    }
    
    // mutiply the current matrix by the rotation
    rotateY(angle: number)
    {
        const theta = angle * Math.PI/180;
        const a = [
            [Math.cos(theta), 0, Math.sin(theta), 0],
            [0, 1, 0, 0],
            [-Math.sin(theta), 0, Math.cos(theta), 0],
            [0, 0, 0, 1]
        ];
        this.ctm = this.multiply(this.ctm, a);
    }
    
    // mutiply the current matrix by the rotation
    rotateZ(angle: number)
    {
        const theta = angle * Math.PI/180;
        const a = [
            [Math.cos(theta), -Math.sin(theta), 0, 0],
            [Math.sin(theta), Math.cos(theta), 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ];
        this.ctm = this.multiply(this.ctm, a);
    }

    printMatrix() // was print
    {
        console.log(this.ctm);
        console.log("");
    }

    multiply(a: number[][], b:number[][]): number[][] {
        const ar = a.length, ac = a[0].length, bc = b[0].length;
        var m = new Array(ar);  
        for (var r = 0; r < ar; ++r) {
          m[r] = new Array(bc); 
          for (var c = 0; c < bc; ++c) {
            m[r][c] = 0;             
            for (var i = 0; i < ac; ++i) {
              m[r][c] += a[r][i] * b[i][c];
            }
          }
        }
        return m;
    }
}

// a global variable for our state
var myDrawing: MyDrawing

// main function, to keep things together and keep the variables created self contained
function exec() {
    // find our container
    var div = document.getElementById("drawing");
    console.log("exec() called")
    
    if (!div) {
        console.warn("Your HTML page needs a DIV with id='drawing'")
        return;
    }

    // create a Drawing object
    myDrawing = new MyDrawing(div);
    myDrawing.render()
}

exec()