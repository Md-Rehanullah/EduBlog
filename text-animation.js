/**
 * Text Decryption Animation
 * Vanilla JavaScript implementation of scrambling text animation
 */

class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#________';
    this.update = this.update.bind(this);
  }
  
  setText(newText) {
    const oldText = this.el.innerText;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise(resolve => this.resolve = resolve);
    this.queue = [];
    
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || '';
      const to = newText[i] || '';
      const start = Math.floor(Math.random() * 40);
      const end = start + Math.floor(Math.random() * 40);
      this.queue.push({ from, to, start, end });
    }
    
    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }
  
  update() {
    let output = '';
    let complete = 0;
    
    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];
      
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.randomChar();
          this.queue[i].char = char;
        }
        output += `<span class="dud">${char}</span>`;
      } else {
        output += from;
      }
    }
    
    this.el.innerHTML = output;
    
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }
  
  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }
}

// Initialize the animation after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  const phrases = [
    'Welcome to EduBlog',
    'Your Gateway to Educational Excellence',
    'Discover inspiring educational content'
  ];
  
  const heroTitle = document.querySelector('.hero-title');
  const heroSubtitle = document.querySelector('.hero-subtitle');
  const heroDescription = document.querySelector('.hero-description');
  
  // Store original text from elements
  const originalTexts = {
    title: heroTitle.textContent,
    subtitle: heroSubtitle.textContent,
    description: heroDescription.textContent
  };
  
  // Create scramblers for each element
  const titleScrambler = new TextScramble(heroTitle);
  const subtitleScrambler = new TextScramble(heroSubtitle);
  const descriptionScrambler = new TextScramble(heroDescription);
  
  // Run animations in sequence
  let counter = 0;
  
  const animate = () => {
    // First animation - Title
    titleScrambler.setText(originalTexts.title).then(() => {
      // After title is done, animate subtitle
      setTimeout(() => {
        subtitleScrambler.setText(originalTexts.subtitle).then(() => {
          // After subtitle is done, animate description
          setTimeout(() => {
            descriptionScrambler.setText(originalTexts.description);
          }, 400);
        });
      }, 400);
    });
  };
  
  // Start animation when page loads
  animate();
});
