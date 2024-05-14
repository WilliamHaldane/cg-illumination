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
uniform float mat_shininess;
uniform vec3 camera_position;
uniform int num_lights;
uniform vec3 light_positions[8];
uniform vec3 light_colors[8];

// Output
out vec2 model_uv;
out vec3 diffuse_illum;
out vec3 specular_illum;

void main() {
    vec4 world_pos = world * vec4(position, 1.0);

    vec3 normalizedNormal = normalize(normal);
    vec3 specular_view = normalize(camera_position - world_pos.xyz);
    
    diffuse_illum = vec3(0.0);
    specular_illum = vec3(0.0);

    for (int i = 0; i < num_lights; i++) {
        vec3 light_vector = normalize(light_positions[i] - world_pos.xyz);

        float diffuseFactor = max(dot(normalizedNormal, light_vector), 0.0);
        diffuse_illum += diffuseFactor * light_colors[i];

        vec3 reflection = reflect(-light_vector, normalizedNormal);
        float specAngle = max(dot(reflection, specular_view), 0.0);
        float specFactor = pow(specAngle, mat_shininess);
        specular_illum += specFactor * light_colors[i];
    }

    // Clamp specular illumination per light iteration
    specular_illum = min(specular_illum, vec3(1.0));

    // Pass vertex texcoord onto the fragment shader
    model_uv = uv * texture_scale;

    // Transform and project vertex from 3D world-space to 2D screen-space
    gl_Position = projection * view * world_pos;
}