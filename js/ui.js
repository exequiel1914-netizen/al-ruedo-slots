// ui.js - audio manager and simple UI helpers

export class AudioManager{
  constructor(){
    this.ctx = null;
    this.muted = localStorage.getItem('alruedo-muted') === '1';
  }

  _ensureCtx(){
    if(this.ctx) return;
    try{
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }catch(e){
      this.ctx = null;
    }
  }

  toggleMute(){
    this.muted = !this.muted;
    localStorage.setItem('alruedo-muted', this.muted ? '1' : '0');
  }

  play(type='spin'){
    if(this.muted) return;
    this._ensureCtx();
    if(!this.ctx) return;

    const t = this.ctx.currentTime;
    if(type==='spin'){
      // short noise: oscillator with falling freq
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(600, t);
      o.frequency.exponentialRampToValueAtTime(180, t+0.6);
      g.gain.setValueAtTime(0.06, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t+0.6);
      o.connect(g); g.connect(this.ctx.destination);
      o.start(t); o.stop(t+0.7);
    }else if(type==='stop'){
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(880, t);
      g.gain.setValueAtTime(0.08, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t+0.18);
      o.connect(g); g.connect(this.ctx.destination);
      o.start(t); o.stop(t+0.2);
    }else if(type==='win'){
      // simple chime
      const now = this.ctx.currentTime;
      const o1 = this.ctx.createOscillator();
      const o2 = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o1.type='sine'; o2.type='sine';
      o1.frequency.setValueAtTime(880, now);
      o2.frequency.setValueAtTime(1320, now);
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(0.08, now+0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now+0.8);
      o1.connect(g); o2.connect(g); g.connect(this.ctx.destination);
      o1.start(now); o2.start(now); o1.stop(now+0.85); o2.stop(now+0.85);
    }else if(type==='error'){
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type='square'; o.frequency.setValueAtTime(220, t);
      g.gain.setValueAtTime(0.06,t); g.gain.exponentialRampToValueAtTime(0.0001,t+0.12);
      o.connect(g); g.connect(this.ctx.destination); o.start(t); o.stop(t+0.14);
    }else if(type==='bonus'){
      // short arpeggio
      const now = this.ctx.currentTime;
      const g = this.ctx.createGain(); g.connect(this.ctx.destination);
      g.gain.setValueAtTime(0.0001, now); g.gain.linearRampToValueAtTime(0.08, now+0.02);
      const freqs = [660,880,1100];
      freqs.forEach((f,i)=>{
        const o = this.ctx.createOscillator(); o.type='sine'; o.frequency.setValueAtTime(f, now + i*0.06);
        o.connect(g); o.start(now + i*0.06); o.stop(now + i*0.06 + 0.18);
      });
      g.gain.exponentialRampToValueAtTime(0.0001, now+0.5);
    }
  }
}

export class UI{
  constructor({creditsEl,betEl,messageEl}){
    this.creditsEl = creditsEl;
    this.betEl = betEl;
    this.messageEl = messageEl;
    this.isSpinning = false;
  }

  showMessage(text,timeout=1000){
    if(!this.messageEl) return;
    this.messageEl.textContent = text;
    this.messageEl.hidden = false;
    clearTimeout(this._msgTimer);
    this._msgTimer = setTimeout(()=>{this.messageEl.hidden=true}, timeout);
  }

  setSpinning(v){
    this.isSpinning = v;
    const spinBtn = document.getElementById('spin');
    if(v){
      spinBtn.setAttribute('disabled','disabled');
      spinBtn.classList.add('spinning');
    }else{
      spinBtn.removeAttribute('disabled');
      spinBtn.classList.remove('spinning');
    }
  }
}
