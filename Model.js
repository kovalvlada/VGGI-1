class SurfaceModel {
     constructor(gl, uSteps = 40, vSteps = 100) {
         this.gl = gl;
         this.uSteps = uSteps;
         this.vSteps = vSteps;
 
         this.iVertexBuffer = gl.createBuffer();
         this.count = 0;
 
         this.initBuffers();
     }
 
     // Параметрична поверхня Cornucopia
     evaluateSurface(u, v) {
         const alpha = 0.1;
         const beta = 0.5;
         const expV = Math.exp(alpha * v);
 
         const x = expV * (Math.cos(v) + Math.cos(u) * Math.cos(v) - Math.sin(u) * Math.sin(v) * beta);
         const y = expV * (Math.sin(v) + Math.cos(u) * Math.sin(v) + Math.sin(u) * Math.cos(v) * beta);
         const z = expV * Math.sin(u);
 
         const scale = 0.25;
         return [x * scale, y * scale, z * scale];
     }
 
     initBuffers() {
         const uMin = 0, uMax = 2 * Math.PI;
         const vMin = -3.0, vMax = 2.0;
 
         // 1. Створення 2D-сітки
         const grid = [];
         for (let i = 0; i <= this.uSteps; i++) {
             const u = uMin + (i / this.uSteps) * (uMax - uMin);
             grid[i] = [];
             for (let j = 0; j <= this.vSteps; j++) {
                 const v = vMin + (j / this.vSteps) * (vMax - vMin);
                 grid[i][j] = this.evaluateSurface(u, v);
             }
         }
 
         const vertices = [];
 
         // 2. Множина U-поліліній (поперечні кола)
         for (let j = 0; j <= this.vSteps; j++) {
             for (let i = 0; i < this.uSteps; i++) {
                 vertices.push(...grid[i][j], ...grid[i + 1][j]);
             }
         }
 
         // 3. Множина V-поліліній (подовжній спіралі)
         for (let i = 0; i <= this.uSteps; i++) {
             for (let j = 0; j < this.vSteps; j++) {
                 vertices.push(...grid[i][j], ...grid[i][j + 1]);
             }
         }
 
         this.count = vertices.length / 3;
 
         // 4. Завантаження у буфер
         const gl = this.gl;
         gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
         gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
     }
 
     BufferData(vertices) {
         const gl = this.gl;
         gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
         gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
     }
 
     // Універсальний метод малювання
     Draw(shProg) {
         const gl = this.gl;
         gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
 
         // Якщо shProg передано і в ньому є атрибут
         let attribLoc = 0;
         if (shProg && shProg.iAttribVertex !== undefined) {
             attribLoc = shProg.iAttribVertex;
         } else if (shProg && typeof shProg === 'number') {
             attribLoc = shProg;
         }
 
         gl.vertexAttribPointer(attribLoc, 3, gl.FLOAT, false, 0, 0);
         gl.enableVertexAttribArray(attribLoc);
 
         gl.drawArrays(gl.LINES, 0, this.count);
     }
 }