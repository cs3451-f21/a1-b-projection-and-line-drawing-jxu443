import {Drawing, Vector, Point} from "./common"
import {init_tests, draw_tests} from "./projection_test"

// A class for our application state and functionality
class MyDrawing extends Drawing {
    mproj: number[][] //Mproj
    ctm: number[][] //Mview
    M : number[][] //M = Mview * Mproj
    vertices: Point[] 
    
    constructor (div: HTMLElement) {
        super(div)

        this.ctm = identityMatrix()
        this.mproj = identityMatrix()
        this.M = identityMatrix()
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
    viewport() {
        let x = identityMatrix()
        x[0][0] = this.canv.width/2
        x[1][1] = this.canv.height/2
        x[0][3] = (this.canv.width-1)/2
        x[1][3] = (this.canv.height-1)/2
        return x;
    }

    beginShape() {
        this.vertices = new Array(0)

        //viewport 
        let viewportM = this.viewport() //pass

        this.M = identityMatrix()
        this.M = this.multiply(viewportM, this.multiply(this.mproj, this.ctm))
    }

    endShape() {
        //console.log("endShape, length of vertices", this.vertices.length)
        for (let i = 0; i < this.vertices.length-1; i += 2) {
            super.line(this.vertices[i], this.vertices[i+1]);
        }
        this.vertices = new Array(0);

        //reset every matrix to identity matrix
        // this.ctm = identityMatrix()
        // this.mproj = identityMatrix()
    }

    vertex(x: number, y: number, z: number) {
        let p = [
            [x],[y],[z],[1]
        ]
        let transformedP = this.multiply(this.M, p)
        let lastPoint = transformedP[3][0];
        let point = {
            x: transformedP[0][0]/lastPoint, 
            y: transformedP[1][0]/lastPoint,
            z: transformedP[2][0]/lastPoint
        };
        this.vertices.push(point)
    }

    perspective(fov: number, near: number, far: number) {
        const pToO = [ // perspective to ortho
            [near, 0, 0, 0],
            [0, near, 0, 0],
            [0, 0, near+far, -near*far],
            [0, 0, 1, 0],
        ]
        //this.mproj = pToO
        
        fov = fov * Math.PI/180;
        const aspectRatio = this.canv.width / this.canv.height
        let top = Math.tan(fov/2) * Math.abs(near)
        let bottom = -top
        let right = top * aspectRatio
        let left = -right
        this.ortho(left, right, top, bottom, near, far) // center is assumed to be the origin
        this.mproj = this.multiply(this.mproj, pToO)
    }

    ortho( left: number, right: number, top: number, bottom: number, 
        near: number, far: number) {
            let oldctm = this.ctm; //save
            
            this.initMatrix() //use ctm as calculator
           
            this.scale(2/(right-left), 2/(top-bottom), 2/(near- far));  
            this.translate(-(left+right)/2, -(top+bottom)/2, -(near+far)/2);   

            this.mproj = this.ctm // Mortho = Mscale * Mtranslate
            
            this.ctm = oldctm; //restore 
	}

    // All functions bellow directly applied to this.ctm----------------------------------------------
    
    initMatrix() // was init()
    {
        this.ctm = identityMatrix()
    }
    
    // mutiply the current matrix by the translation
    translate(x: number, y: number, z: number)
    {
        let a = [
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
        let a = [
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
        let a = [
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
        let a = [
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
        let a = [
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
        let ar = a.length, ac = a[0].length, bc = b[0].length;
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

//helper function
function identityMatrix(): number[][] {
    return [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
    ];
}

// main function, to keep things together and keep the variables created self contained
function exec() {
    // find our container
    var div = document.getElementById("drawing");
    
    if (!div) {
        console.warn("Your HTML page needs a DIV with id='drawing'")
        return;
    }

    // create a Drawing object
    myDrawing = new MyDrawing(div);
    myDrawing.render()
}

exec()