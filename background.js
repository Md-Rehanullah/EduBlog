/**
 * Animated Background for EduBlog
 * A canvas-based flowing threads background
 */

class FlowingThreads {
  constructor() {
    this.canvas = document.getElementById('bg-canvas');
    if (!this.canvas) return;
    
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.particleCount = 60;
    this.mousePosition = { x: 0, y: 0 };
    this.lastMousePosition = { x: 0, y: 0 };
    this.mouseVelocity = { x: 0, y: 0 };
    this.isMouseMoving = false;
    this.mouseTimeout = null;
    
    this.init();
  }
  
  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    
    // Setup mouse tracking
    document.addEventListener('mousemove', (e) => {
      this.isMouseMoving = true;
      clearTimeout(this.mouseTimeout);
      
      const rect = this.canvas.getBoundingClientRect();
      const lastX = this.mousePosition.x;
      const lastY = this.mousePosition.y;
      
      this.mousePosition.x = e.clientX - rect.left;
      this.mousePosition.y = e.clientY - rect.top;
      
      this.mouseVelocity.x = this.mousePosition.x - lastX;
      this.mouseVelocity.y = this.mousePosition.y - lastY;
      
      this.mouseTimeout = setTimeout(() => {
        this.isMouseMoving = false;
      }, 100);
    });
    
    // Create particles
    this.createParticles();
    
    // Start animation
    this.animate();
  }
  
  resize() {
    const rect = this.canvas.parentNode.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    
    // Recreate particles if needed
    if (this.particles.length > 0) {
      this.particles = [];
      this.createParticles();
    }
  }
  
  createParticles() {
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 2 + 1,
        speedX: Math.random() * 0.5 - 0.25,
        speedY: Math.random() * 0.5 - 0.25,
        color: `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.2})`,
        connections: []
      });
    }
  }
  
  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Update and draw particles
    this.updateParticles();
    this.drawParticles();
    this.drawConnections();
    
    requestAnimationFrame(() => this.animate());
  }
  
  updateParticles() {
    const mouseInfluence = this.isMouseMoving ? 1 : 0;
    
    this.particles.forEach(particle => {
      // Natural movement
      particle.x += particle.speedX;
      particle.y += particle.speedY;
      
      // Mouse influence
      if (mouseInfluence > 0) {
        const dx = this.mousePosition.x - particle.x;
        const dy = this.mousePosition.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
          const angle = Math.atan2(dy, dx);
          const force = (100 - distance) / 500;
          particle.x += Math.cos(angle) * force * this.mouseVelocity.x * 0.2;
          particle.y += Math.sin(angle) * force * this.mouseVelocity.y * 0.2;
        }
      }
      
      // Edge handling - wrap around
      if (particle.x < 0) particle.x = this.canvas.width;
      if (particle.x > this.canvas.width) particle.x = 0;
      if (particle.y < 0) particle.y = this.canvas.height;
      if (particle.y > this.canvas.height) particle.y = 0;
      
      // Clear connections for recalculation
      particle.connections = [];
    });
    
    // Calculate connections
    for (let i = 0; i < this.particles.length; i++) {
      const particleA = this.particles[i];
      
      for (let j = i + 1; j < this.particles.length; j++) {
        const particleB = this.particles[j];
        const dx = particleA.x - particleB.x;
        const dy = particleA.y - particleB.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
          particleA.connections.push({
            particle: particleB,
            distance: distance
          });
          
          particleB.connections.push({
            particle: particleA,
            distance: distance
          });
        }
      }
    }
  }
  
  drawParticles() {
    this.particles.forEach(particle => {
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fillStyle = particle.color;
      this.ctx.fill();
    });
  }
  
  drawConnections() {
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctx.lineWidth = 0.5;
    
    this.particles.forEach(particle => {
      particle.connections.forEach(connection => {
        const opacity = 1 - connection.distance / 100;
        this.ctx.beginPath();
        this.ctx.moveTo(particle.x, particle.y);
        this.ctx.lineTo(connection.particle.x, connection.particle.y);
        this.ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.2})`;
        this.ctx.stroke();
      });
    });
  }
}

// Initialize the background when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Only run on the index page
  if (window.location.pathname === '/' || 
      window.location.pathname === '/index.html' || 
      window.location.pathname.endsWith('index.html')) {
    new FlowingThreads();
  }
});
