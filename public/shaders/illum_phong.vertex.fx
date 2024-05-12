#version 300 es
precision highp float;

// Attributes
in vec3 position;
in vec3 normal;
in vec2 uv;

// Uniforms
uniform mat4 world;
uniform mat4 view;
uniform mat4 projection;
uniform vec2 texture_scale;

// Output to fragment shader
out vec3 model_position;
out vec3 model_normal;
out vec2 model_uv;

void main() {
    // Transform vertex position and normal to world space
    vec4 worldPos = world * vec4(position, 1.0);
    vec3 worldNormal = normalize(mat3(transpose(inverse(world))) * normal);

    // Pass transformed attributes to fragment shader
    model_position = vec3(worldPos);
    model_normal = worldNormal;
    model_uv = uv * texture_scale;

    // Transform and project vertex from 3D world-space to 2D screen-space
    gl_Position = projection * view * worldPos;
}
