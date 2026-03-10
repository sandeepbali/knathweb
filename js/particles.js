/* ============================================
   Particle Constellation Background
   Inspired by the democratic fabric - points of light
   connecting to form the invisible structure of governance
   ============================================ */

class ParticleConstellation {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId)
    if (!this.canvas) return
    this.ctx = this.canvas.getContext('2d')
    this.particles = []
    this.mouse = { x: null, y: null, radius: 150 }
    this.animationId = null
    this.isVisible = true

    // RNG-driven configuration
    this.config = {
      particleCount: Math.floor(window.innerWidth / 12),
      maxDistance: 120,
      particleMinSize: 0.5,
      particleMaxSize: 2,
      speed: 0.3,
      goldColor: 'rgba(201, 168, 76,',
      ivoryColor: 'rgba(240, 237, 229,',
      tealColor: 'rgba(42, 157, 143,',
      lineOpacity: 0.12,
      mouseLineOpacity: 0.25,
    }

    this.init()
  }

  init() {
    this.resize()
    this.createParticles()
    this.bindEvents()
    this.animate()
  }

  resize() {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  }

  createParticles() {
    this.particles = []
    const count = Math.min(this.config.particleCount, 150)

    for (let i = 0; i < count; i++) {
      const colorRoll = Math.random()
      let color
      if (colorRoll < 0.6) color = this.config.goldColor
      else if (colorRoll < 0.85) color = this.config.ivoryColor
      else color = this.config.tealColor

      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * this.config.speed,
        vy: (Math.random() - 0.5) * this.config.speed,
        size: this.config.particleMinSize + Math.random() * (this.config.particleMaxSize - this.config.particleMinSize),
        color: color,
        baseOpacity: 0.2 + Math.random() * 0.5,
        pulseSpeed: 0.005 + Math.random() * 0.01,
        pulseOffset: Math.random() * Math.PI * 2,
      })
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize()
      this.config.particleCount = Math.floor(window.innerWidth / 12)
      this.createParticles()
    })

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX
      this.mouse.y = e.clientY
    })

    window.addEventListener('mouseout', () => {
      this.mouse.x = null
      this.mouse.y = null
    })

    // Visibility API for performance
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.isVisible = false
        cancelAnimationFrame(this.animationId)
      } else {
        this.isVisible = true
        this.animate()
      }
    })
  }

  animate() {
    if (!this.isVisible) return
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    const time = Date.now() * 0.001

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i]

      // Update position
      p.x += p.vx
      p.y += p.vy

      // Wrap around edges
      if (p.x < 0) p.x = this.canvas.width
      if (p.x > this.canvas.width) p.x = 0
      if (p.y < 0) p.y = this.canvas.height
      if (p.y > this.canvas.height) p.y = 0

      // Pulse opacity
      const pulse = Math.sin(time * p.pulseSpeed * 60 + p.pulseOffset) * 0.3 + 0.7
      const opacity = p.baseOpacity * pulse

      // Mouse interaction - gentle repulsion
      if (this.mouse.x !== null) {
        const dx = p.x - this.mouse.x
        const dy = p.y - this.mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < this.mouse.radius) {
          const force = (this.mouse.radius - dist) / this.mouse.radius * 0.02
          p.vx += dx * force
          p.vy += dy * force
        }
      }

      // Speed damping
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
      if (speed > this.config.speed * 2) {
        p.vx *= 0.98
        p.vy *= 0.98
      }

      // Draw particle
      this.ctx.beginPath()
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      this.ctx.fillStyle = p.color + opacity + ')'
      this.ctx.fill()

      // Draw connections
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j]
        const dx = p.x - p2.x
        const dy = p.y - p2.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < this.config.maxDistance) {
          const lineOpacity = (1 - dist / this.config.maxDistance) * this.config.lineOpacity
          this.ctx.beginPath()
          this.ctx.moveTo(p.x, p.y)
          this.ctx.lineTo(p2.x, p2.y)
          this.ctx.strokeStyle = this.config.goldColor + lineOpacity + ')'
          this.ctx.lineWidth = 0.5
          this.ctx.stroke()
        }
      }

      // Mouse connections
      if (this.mouse.x !== null) {
        const dx = p.x - this.mouse.x
        const dy = p.y - this.mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < this.mouse.radius) {
          const lineOpacity = (1 - dist / this.mouse.radius) * this.config.mouseLineOpacity
          this.ctx.beginPath()
          this.ctx.moveTo(p.x, p.y)
          this.ctx.lineTo(this.mouse.x, this.mouse.y)
          this.ctx.strokeStyle = this.config.goldColor + lineOpacity + ')'
          this.ctx.lineWidth = 0.8
          this.ctx.stroke()
        }
      }
    }

    this.animationId = requestAnimationFrame(() => this.animate())
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new ParticleConstellation('particle-canvas')
})
