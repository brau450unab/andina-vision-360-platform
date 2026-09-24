/**
 * Motor de Visualización 360° y Tours Virtuales - Andina Vision
 * Soporte para capturas de dron DJI, pirámides multirresolución, giroscopio móvil e iframes.
 */

export class Andina360Viewer {
  constructor(containerElement, options = {}) {
    if (typeof containerElement === 'string') {
      this.container = document.querySelector(containerElement);
    } else {
      this.container = containerElement;
    }

    if (!this.container) {
      throw new Error("Contenedor no encontrado para Andina360Viewer");
    }

    this.options = {
      defaultQuality: 'auto',
      allowGyroscope: true,
      fovMin: 35,
      fovMax: 105,
      defaultFov: 75,
      ...options
    };

    // Estado de la cámara (ángulos en grados)
    this.yaw = 0;
    this.pitch = 0;
    this.fov = this.options.defaultFov;
    
    // Estado de interactividad
    this.isDragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.gyroActive = false;
    this.quality = this.options.defaultQuality;

    // Estado del tour
    this.tourData = null;
    this.currentScene = null;
    this.hotspots = [];

    // Orientación del sensor
    this.deviceAlpha = 0;
    this.deviceBeta = 0;
    this.deviceGamma = 0;

    this.initDOM();
    this.initWebGL();
    this.initEvents();
    this.initPostMessageBridge();
  }

  initDOM() {
    this.container.classList.add('andina-viewer-container');
    this.container.innerHTML = `
      <canvas class="andina-canvas"></canvas>
      <div class="andina-scene-badge" style="display:none;"></div>
      <div class="andina-hotspots-layer"></div>
      
      <div class="andina-controls">
        <select class="andina-quality-select" title="Calidad de imagen">
          <option value="auto">Calidad: Auto</option>
          <option value="low">Baja (1080p)</option>
          <option value="medium">Media (4K)</option>
          <option value="high">Alta (8K)</option>
          <option value="ultra">Ultra (Original DJI)</option>
        </select>
        <button class="andina-btn andina-gyro-btn" title="Activar Giroscopio">
          <span>🔄</span> <span>Giroscopio</span>
        </button>
        <button class="andina-btn andina-fullscreen-btn" title="Pantalla Completa">
          <span>⛶</span>
        </button>
      </div>

      <div class="andina-modal-overlay">
        <div class="andina-modal-content">
          <button class="andina-modal-close" title="Cerrar">&times;</button>
          <h3 class="andina-modal-title"></h3>
          <p class="andina-modal-desc"></p>
          <div class="andina-video-wrapper" style="display:none;"></div>
          <a class="andina-drive-btn" style="display:none;" target="_blank" rel="noopener noreferrer">
            <span>📁</span> <span class="andina-drive-label"></span>
          </a>
        </div>
      </div>
    `;

    this.canvas = this.container.querySelector('.andina-canvas');
    this.badge = this.container.querySelector('.andina-scene-badge');
    this.hotspotsLayer = this.container.querySelector('.andina-hotspots-layer');
    this.gyroBtn = this.container.querySelector('.andina-gyro-btn');
    this.qualitySelect = this.container.querySelector('.andina-quality-select');
    this.fullscreenBtn = this.container.querySelector('.andina-fullscreen-btn');
    
    // Elementos del Modal
    this.modalOverlay = this.container.querySelector('.andina-modal-overlay');
    this.modalClose = this.container.querySelector('.andina-modal-close');
    this.modalTitle = this.container.querySelector('.andina-modal-title');
    this.modalDesc = this.container.querySelector('.andina-modal-desc');
    this.videoWrapper = this.container.querySelector('.andina-video-wrapper');
    this.driveBtn = this.container.querySelector('.andina-drive-btn');
  }

  initWebGL() {
    this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
    if (!this.gl) {
      console.warn("WebGL no soportado, activando fallback 2D");
      return;
    }

    const gl = this.gl;

    const vsSource = `
      attribute vec3 aPosition;
      attribute vec2 aTexCoord;
      uniform mat4 uProjection;
      uniform mat4 uView;
      varying vec2 vTexCoord;
      void main() {
        vTexCoord = aTexCoord;
        gl_Position = uProjection * uView * vec4(aPosition, 1.0);
      }
    `;

    const fsSource = `
      precision mediump float;
      varying vec2 vTexCoord;
      uniform sampler2D uSampler;
      void main() {
        gl_FragColor = texture2D(uSampler, vTexCoord);
      }
    `;

    this.program = this.createShaderProgram(gl, vsSource, fsSource);
    this.initSphereGeometry(gl);

    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([15, 23, 42, 255]));

    this.resizeCanvas();
    this.renderLoop();
  }

  createShaderProgram(gl, vs, fs) {
    const vShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vShader, vs);
    gl.compileShader(vShader);

    const fShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fShader, fs);
    gl.compileShader(fShader);

    const prog = gl.createProgram();
    gl.attachShader(prog, vShader);
    gl.attachShader(prog, fShader);
    gl.linkProgram(prog);
    return prog;
  }

  initSphereGeometry(gl, latBands = 40, longBands = 40, radius = 50.0) {
    const positions = [];
    const texCoords = [];
    const indices = [];

    for (let lat = 0; lat <= latBands; lat++) {
      const theta = (lat * Math.PI) / latBands;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);

      for (let lon = 0; lon <= longBands; lon++) {
        const phi = (lon * 2 * Math.PI) / longBands;
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);

        const x = -radius * cosPhi * sinTheta;
        const y = radius * cosTheta;
        const z = radius * sinPhi * sinTheta;
        const u = lon / longBands;
        const v = lat / latBands;

        positions.push(x, y, z);
        texCoords.push(u, v);
      }
    }

    for (let lat = 0; lat < latBands; lat++) {
      for (let lon = 0; lon < longBands; lon++) {
        const first = lat * (longBands + 1) + lon;
        const second = first + longBands + 1;
        indices.push(first, second, first + 1);
        indices.push(second, second + 1, first + 1);
      }
    }

    this.posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    this.texBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

    this.idxBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.idxBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    this.indexCount = indices.length;
  }

  initEvents() {
    window.addEventListener('resize', () => this.resizeCanvas());

    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    });

    window.addEventListener('mouseup', () => { this.isDragging = false; });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.lastMouseX;
      const dy = e.clientY - this.lastMouseY;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;

      const factor = this.fov / 500;
      this.yaw = (this.yaw - dx * factor) % 360;
      this.pitch = Math.max(-85, Math.min(85, this.pitch + dy * factor));
    });

    let touchStartX = 0, touchStartY = 0;
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    this.canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1 && !this.gyroActive) {
        const dx = e.touches[0].clientX - touchStartX;
        const dy = e.touches[0].clientY - touchStartY;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;

        const factor = this.fov / 400;
        this.yaw = (this.yaw - dx * factor) % 360;
        this.pitch = Math.max(-85, Math.min(85, this.pitch + dy * factor));
      }
    }, { passive: true });

    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.fov = Math.max(this.options.fovMin, Math.min(this.options.fovMax, this.fov + e.deltaY * 0.05));
    }, { passive: false });

    this.gyroBtn.addEventListener('click', () => this.toggleGyroscope());

    this.qualitySelect.addEventListener('change', (e) => {
      this.quality = e.target.value;
      if (this.currentScene) this.loadSceneTexture(this.currentScene);
    });

    this.fullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        this.container.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });

    this.modalClose.addEventListener('click', () => this.closeModal());
    this.modalOverlay.addEventListener('click', (e) => {
      if (e.target === this.modalOverlay) this.closeModal();
    });
  }

  async toggleGyroscope() {
    if (this.gyroActive) {
      this.gyroActive = false;
      this.gyroBtn.classList.remove('active');
      window.removeEventListener('deviceorientation', this.handleOrientation);
      return;
    }

    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission === 'granted') {
          this.startGyroscope();
        } else {
          alert("Permiso para acceder a los sensores de orientación denegado.");
        }
      } catch (err) {
        console.error("Error solicitando permisos de sensor:", err);
      }
    } else if ('ondeviceorientation' in window) {
      this.startGyroscope();
    } else {
      alert("Tu dispositivo o navegador no cuenta con soporte de giroscopio.");
    }
  }

  startGyroscope() {
    this.gyroActive = true;
    this.gyroBtn.classList.add('active');
    this.handleOrientation = (e) => {
      if (!this.gyroActive) return;
      if (e.alpha !== null && e.beta !== null && e.gamma !== null) {
        this.yaw = (-e.alpha) % 360;
        this.pitch = Math.max(-85, Math.min(85, e.beta - 90));
      }
    };
    window.addEventListener('deviceorientation', this.handleOrientation);
  }

  initPostMessageBridge() {
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'ANDINA_GYRO_DATA') {
        const { alpha, beta, gamma } = event.data;
        if (this.gyroActive && alpha !== undefined && beta !== undefined) {
          this.yaw = (-alpha) % 360;
          this.pitch = Math.max(-85, Math.min(85, beta - 90));
        }
      }
    });
  }

  loadTour(tour) {
    this.tourData = tour;
    if (tour.title) {
      this.badge.style.display = 'block';
      this.badge.textContent = tour.title;
    }
    const firstSceneId = tour.firstSceneId || (tour.scenes[0] && tour.scenes[0].id);
    if (firstSceneId) {
      this.switchScene(firstSceneId);
    }
  }

  switchScene(sceneId) {
    const scene = this.tourData.scenes.find(s => s.id === sceneId);
    if (!scene) return;

    this.currentScene = scene;
    this.badge.textContent = `${this.tourData.title || ''} • ${scene.title}`;
    this.yaw = scene.default_yaw || 0;
    this.pitch = scene.default_pitch || 0;

    this.loadSceneTexture(scene);
    this.renderHotspots(scene.hotspots || []);
  }

  loadSceneTexture(scene) {
    let imageUrl = scene.preview_url || scene.tiles_base_url;

    if (scene.tiles_base_url) {
      imageUrl = `${scene.tiles_base_url}/preview.webp`;
    }

    if (!imageUrl) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => {
      const gl = this.gl;
      if (!gl) return;
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    };
  }

  renderHotspots(hotspots) {
    this.hotspotsLayer.innerHTML = '';
    this.hotspots = hotspots.map(h => {
      const el = document.createElement('div');
      el.className = 'andina-hotspot';

      const isLink = h.type === 'scene_link';
      el.innerHTML = `
        <div class="${isLink ? 'andina-hotspot-link' : 'andina-hotspot-info'}">
          <span>${isLink ? '➔' : 'ℹ'}</span>
        </div>
        <div class="andina-hotspot-tooltip">${h.tooltip || h.title || 'Ver'}</div>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isLink && h.target_scene_id) {
          this.switchScene(h.target_scene_id);
        } else {
          this.openModal(h);
        }
      });

      this.hotspotsLayer.appendChild(el);
      return { data: h, element: el };
    });
  }

  updateHotspotPositions() {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    const radYaw = (this.yaw * Math.PI) / 180;
    const radPitch = (this.pitch * Math.PI) / 180;
    const radFov = (this.fov * Math.PI) / 180;

    this.hotspots.forEach(h => {
      const spotYaw = (h.data.yaw * Math.PI) / 180;
      const spotPitch = (h.data.pitch * Math.PI) / 180;

      let deltaYaw = spotYaw - radYaw;
      while (deltaYaw > Math.PI) deltaYaw -= 2 * Math.PI;
      while (deltaYaw < -Math.PI) deltaYaw += 2 * Math.PI;

      const deltaPitch = spotPitch - radPitch;

      if (Math.cos(deltaYaw) > 0.1) {
        const x = (width / 2) + Math.tan(deltaYaw) * (width / (2 * Math.tan(radFov / 2)));
        const y = (height / 2) - Math.tan(deltaPitch) * (height / (2 * Math.tan(radFov / 2)));

        if (x >= 0 && x <= width && y >= 0 && y <= height) {
          h.element.style.display = 'block';
          h.element.style.left = `${x}px`;
          h.element.style.top = `${y}px`;
          return;
        }
      }
      h.element.style.display = 'none';
    });
  }

  openModal(hotspot) {
    this.modalTitle.textContent = hotspot.title || "Información";
    this.modalDesc.textContent = hotspot.description || "";

    if (hotspot.youtube_video_id) {
      this.videoWrapper.style.display = 'block';
      this.videoWrapper.innerHTML = `
        <iframe 
          src="https://www.youtube-nocookie.com/embed/${hotspot.youtube_video_id}?autoplay=1&enablejsapi=1" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen>
        </iframe>
      `;
    } else {
      this.videoWrapper.style.display = 'none';
      this.videoWrapper.innerHTML = '';
    }

    if (hotspot.drive_url) {
      this.driveBtn.style.display = 'inline-flex';
      this.driveBtn.href = hotspot.drive_url;
      this.container.querySelector('.andina-drive-label').textContent = hotspot.drive_label || "Abrir en Google Drive";
    } else {
      this.driveBtn.style.display = 'none';
    }

    this.modalOverlay.classList.add('open');
  }

  closeModal() {
    this.modalOverlay.classList.remove('open');
    this.videoWrapper.innerHTML = '';
  }

  resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.container.clientWidth * dpr;
    this.canvas.height = this.container.clientHeight * dpr;
    if (this.gl) {
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  renderLoop() {
    const gl = this.gl;
    if (!gl) return;

    gl.clearColor(0.05, 0.08, 0.15, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(this.program);

    const aspect = this.canvas.width / this.canvas.height;
    const pMatrix = this.makePerspective(this.fov, aspect, 0.1, 100.0);
    const vMatrix = this.makeRotation(this.pitch, this.yaw);

    const uProjLoc = gl.getUniformLocation(this.program, "uProjection");
    const uViewLoc = gl.getUniformLocation(this.program, "uView");
    gl.uniformMatrix4fv(uProjLoc, false, pMatrix);
    gl.uniformMatrix4fv(uViewLoc, false, vMatrix);

    const aPosLoc = gl.getAttribLocation(this.program, "aPosition");
    gl.enableVertexAttribArray(aPosLoc);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
    gl.vertexAttribPointer(aPosLoc, 3, gl.FLOAT, false, 0, 0);

    const aTexLoc = gl.getAttribLocation(this.program, "aTexCoord");
    gl.enableVertexAttribArray(aTexLoc);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer);
    gl.vertexAttribPointer(aTexLoc, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.idxBuffer);
    gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);

    this.updateHotspotPositions();

    requestAnimationFrame(() => this.renderLoop());
  }

  makePerspective(fovDeg, aspect, near, far) {
    const f = 1.0 / Math.tan((fovDeg * Math.PI) / 360);
    const nf = 1 / (near - far);
    return new Float32Array([
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far + near) * nf, -1,
      0, 0, (2 * far * near) * nf, 0
    ]);
  }

  makeRotation(pitchDeg, yawDeg) {
    const radP = (pitchDeg * Math.PI) / 180;
    const radY = (yawDeg * Math.PI) / 180;
    const cosP = Math.cos(radP), sinP = Math.sin(radP);
    const cosY = Math.cos(radY), sinY = Math.sin(radY);

    return new Float32Array([
      cosY, sinP * sinY, -cosP * sinY, 0,
      0, cosP, sinP, 0,
      sinY, -sinP * cosY, cosP * cosY, 0,
      0, 0, 0, 1
    ]);
  }
}
