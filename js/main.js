document.addEventListener("DOMContentLoaded", start);

var gl;
var keys = [];

function start() {
    // Canvas setup
    var canvas = document.getElementById("renderCanvas");
    gl = canvas.getContext("webgl2");

    // Handle Mouse Input
    canvas.requestPointerLock = canvas.requestPointerLock ||
                                canvas.mozRequestPointerLock;

    document.exitPointerLock = canvas.exitPointerLock ||
                            canvas.mozExitPointerLock;

    canvas.onclick = function () {
        canvas.requestPointerLock();
    }

    document.addEventListener('pointerlockchange', lockChangeAlert, false);
    document.addEventListener('mozpointerlockchange', lockChangeAlert, false);

    function lockChangeAlert() {
        if (document.pointerLockElement === canvas ||
            document.mozPointerLockElement === canvas) {
            console.log('The pointer lock status is now locked');
            document.addEventListener("mousemove", processMouse, false);
        } else {
            console.log('The pointer lock status is now unlocked');
            document.removeEventListener("mousemove", processMouse, false);
        }
    }

    function processMouse(e) {
        camera.pitch += -0.005 * e.movementY;
        camera.yaw += 0.005 * e.movementX;
    }

    var cubeVertices = [
        -1.0, -1.0, -1.0,   0.0, 0.0, -1.0,  0.0, 0.0,
		-1.0,  1.0, -1.0,   0.0, 0.0, -1.0,  0.0, 1.0,
		 1.0,  1.0, -1.0,   0.0, 0.0, -1.0,  1.0, 1.0,
		 1.0, -1.0, -1.0,   0.0, 0.0, -1.0,  1.0, 0.0,

        -1.0, -1.0,  1.0,   0.0, 0.0, 1.0,   0.0, 0.0,
		-1.0,  1.0,  1.0,   0.0, 0.0, 1.0,   0.0, 1.0,
		 1.0,  1.0,  1.0,   0.0, 0.0, 1.0,   1.0, 1.0,
		 1.0, -1.0,  1.0,   0.0, 0.0, 1.0,   1.0, 0.0,

		 1.0, -1.0, -1.0,   1.0, 0.0, 0.0,   1.0, 0.0, // 8
		 1.0, -1.0,  1.0,   1.0, 0.0, 0.0,   1.0, 1.0,
		 1.0,  1.0,  1.0,   1.0, 0.0, 0.0,   0.0, 1.0,
		 1.0,  1.0, -1.0,   1.0, 0.0, 0.0,   0.0, 0.0, // 11

        -1.0, -1.0, -1.0,  -1.0, 0.0, 0.0,   1.0, 0.0, // 12
		-1.0, -1.0,  1.0,  -1.0, 0.0, 0.0,   1.0, 1.0,
		-1.0,  1.0,  1.0,  -1.0, 0.0, 0.0,   0.0, 1.0,
		-1.0,  1.0, -1.0,  -1.0, 0.0, 0.0,   0.0, 0.0, // 15

        -1.0, 1.0, -1.0,    0.0, 1.0, 0.0,   1.0, 0.0, // 16
		-1.0, 1.0,  1.0,    0.0, 1.0, 0.0,   1.0, 1.0,
		 1.0, 1.0,  1.0,    0.0, 1.0, 0.0,   0.0, 1.0,
		 1.0, 1.0, -1.0,    0.0, 1.0, 0.0,   0.0, 0.0, // 19

        -1.0, -1.0, -1.0,   0.0,-1.0, 0.0,   1.0, 0.0, // 20
		-1.0, -1.0,  1.0,   0.0,-1.0, 0.0,   1.0, 1.0,
		 1.0, -1.0,  1.0,   0.0,-1.0, 0.0,   0.0, 1.0,
		 1.0, -1.0, -1.0,   0.0,-1.0, 0.0,   0.0, 0.0 // 23

    ];

    var cubeIndices = [
        0, 2, 1, 0, 3, 2, // Front
		4, 5, 6, 4, 6, 7, // Back
		8, 9, 10, 8, 10, 11, // Right
		12, 14, 13, 12, 15, 14, // Left
		16, 18, 17, 16, 19, 18, // Top
		20, 21, 22, 20, 22, 23, // Bottom
    ];
    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeVertices), gl.STATIC_DRAW);

    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);

    var texture = gl.createTexture();
    texture.image = new Image();
    texture.image.src = "images/Rocks02_col.jpg";

    texture.image.onload = function () {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, texture.image);
    
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
 //       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_ANISOTROPY, 2);
        gl.generateMipmap(gl.TEXTURE_2D);
    }

    // Shader Setup
    var shaderProgram = setupShader("mainVertShader", "mainFragShader");
    
    gl.useProgram(shaderProgram);
    // Vertex Array Object
    var vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    // Vertex attribute setup (position, color, and texture)
    var positionAttributeLocation = gl.getAttribLocation(shaderProgram, "position");
    gl.enableVertexAttribArray(positionAttributeLocation);
    var normalAttributeLocation = gl.getAttribLocation(shaderProgram, "normal");
    gl.enableVertexAttribArray(normalAttributeLocation);
    var textureAttributeLocation = gl.getAttribLocation(shaderProgram, "texCoord");
    gl.enableVertexAttribArray(textureAttributeLocation);

    // Define rules for each vertex
    const FLOAT_SIZE = 4;
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 8 * FLOAT_SIZE, 0);
    gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 8 * FLOAT_SIZE, 3 * FLOAT_SIZE);
    gl.vertexAttribPointer(textureAttributeLocation, 2, gl.FLOAT, false, 8 * FLOAT_SIZE, 6 * FLOAT_SIZE);

    // Load the texture into the shader

    var projectionMatrix = mat4.create();
    var viewMatrix = mat4.create();
    var modelMatrix = mat4.create();

    mat4.perspective(projectionMatrix, 45 * Math.PI / 180.0, canvas.width / canvas.height, 0.1, 50.0);
    mat4.lookAt(viewMatrix, camera.position, camera.look, camera.up);
    mat4.translate(viewMatrix, viewMatrix, [0.5, 0.0, 0.0]);

    var projectionMatrixLocation = gl.getUniformLocation(shaderProgram, "uProjection");
    var viewMatrixLocation = gl.getUniformLocation(shaderProgram, "uView");
    var modelMatrixLocation = gl.getUniformLocation(shaderProgram, "uModel");

    var samplerLocation = gl.getUniformLocation(shaderProgram, "uTexture");
    var lightLocation = gl.getUniformLocation(shaderProgram, "uLight");

    gl.useProgram(shaderProgram);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(samplerLocation, 0);

    gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);
    gl.uniform3fv(lightLocation, [5.0, 10.0, 3.0]);
    
    var time = 0;

    gl.enable(gl.DEPTH_TEST);

    requestAnimationFrame(runRenderLoop);

    function runRenderLoop() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.clearColor(0.5, 0.5, 1.0, 1.0);
        
        // Matrix Transformations
        mat4.identity(modelMatrix);

        mat4.translate(modelMatrix, modelMatrix, [5.0, 0.0, 0.0]);
        //mat4.rotate(modelMatrix, modelMatrix, time, [0.0, 1.0, 0.7]);
        processMovement(viewMatrix);
        time += 0.01;

        // Pass matrices values to shader
        gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);
        gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix);
        gl.uniformMatrix4fv(modelMatrixLocation, false, modelMatrix);

        
        // Start drawing proccess
        gl.useProgram(shaderProgram);
        gl.bindVertexArray(vao);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);

        requestAnimationFrame(runRenderLoop);
    }
}