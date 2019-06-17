var uniformLocations = [];

function compileShader(shaderId) {
    var shader;
    var shaderElement = document.getElementById(shaderId);
    var shaderText = shaderElement.text.trim();

    // Print full shader to console
    // console.log("Shader " + shaderText);

    if (shaderElement.type == "vertShader") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else if (shaderElement.type == "fragShader") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    }
    gl.shaderSource(shader, shaderText);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }
    return shader;
}

// Links both vertex shader and fragment shader for basic
// Shader vertex/fragment shader pipeline
function setupShader(vertShaderId, fragShaderId) {
    var vertShader = compileShader(vertShaderId);
    var fragShader = compileShader(fragShaderId);
    var shaderProgram = gl.createProgram();

    gl.attachShader(shaderProgram, vertShader);
    gl.attachShader(shaderProgram, fragShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not link shaders");
    }

    return shaderProgram
}

// Following functions simplify adding uniform values to shaders
function setShaderMat4fv(shaderProgram, uniformName, v0) {
    uniformLocations[uniformName] = gl.getUniformLocation(shaderProgram, uniformName);

    gl.uniformMatrix4fv(v0Location, false, v0);
}
