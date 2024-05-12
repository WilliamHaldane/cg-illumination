#version 300 es
precision mediump float;

// Input
in vec3 model_position;
in vec3 model_normal;
in vec2 model_uv;

// Uniforms
// material
uniform vec3 mat_color;
uniform vec3 mat_specular;
uniform float mat_shininess;
uniform sampler2D mat_texture;
// camera
uniform vec3 camera_position;
// lights
uniform vec3 ambient; // Ia
uniform int num_lights;
uniform vec3 light_positions[8];
uniform vec3 light_colors[8]; // Ip

// Output
out vec4 FragColor;

void calculateDiffuseLight(vec3 norm, vec3 lightDir, vec3 lightColor, inout vec3 diffuse) {
    float diffuseFactor = max(dot(norm, lightDir), 0.0);
    diffuse += lightColor * diffuseFactor;
}

void calculateSpecularLight(vec3 camDir, vec3 norm, vec3 lightDir, vec3 lightColor, float shininess, inout vec3 specular) {
    vec3 reflection = reflect(-lightDir, norm);
    float specAngle = max(dot(reflection, camDir), 0.0);
    float specFactor = pow(specAngle, shininess);
    specular += lightColor * specFactor;
}

void main() {
    vec3 cam = normalize(camera_position - model_position);
    vec3 norm = normalize(model_normal);
    vec3 diffuse = vec3(0.0);
    vec3 specular = vec3(0.0);
    
    for (int i = 0; i < num_lights; i++) {
        vec3 lightDir = normalize(light_positions[i] - model_position);

        calculateDiffuseLight(norm, lightDir, light_colors[i], diffuse);

        vec3 specColor = mat_specular * light_colors[i]; // Precompute for efficiency
        calculateSpecularLight(cam, norm, lightDir, specColor, mat_shininess, specular);
    }

    diffuse = clamp(diffuse, 0.0, 1.0);
    specular = clamp(specular, 0.0, 1.0);

    vec3 finalColor = mat_color * (ambient + diffuse + specular);
    vec3 texColor = texture(mat_texture, model_uv).rgb;
    
    FragColor = vec4(finalColor * texColor, 1.0);
}
