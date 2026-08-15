// reels.js - manejo simple de rodillos con cambio rápido de símbolos

export default class Reels{
  constructor({containerId='reels',symbols=[],cols=5,rows=3}){
    this.container = document.getElementById(containerId);
    this.symbols = symbols;
    this.cols = cols;
    this.rows = rows;
    this.reelEls = [];
    this.visible = Array.from({length:rows},()=>Array(cols).fill(null));
  }

  render(){
    this.container.innerHTML = '';
    for(let c=0;c<this.cols;c++){
      const reel = document.createElement('div');
      reel.className = 'reel';
      // create slots
      for(let r=0;r<this.rows;r++){
        const slot = document.createElement('div');
        slot.className = 'slot';
        const img = document.createElement('img');
        img.draggable = false;
        slot.appendChild(img);
        reel.appendChild(slot);
      }
      this.container.appendChild(reel);
      this.reelEls.push(reel);
    }
    // fill initial random
    for(let c=0;c<this.cols;c++){
      for(let r=0;r<this.rows;r++){
        const sym = this.randomSymbol();
        this.setSlot(r,c,sym);
      }
    }
  }

  randomSymbol(){
    const i = Math.floor(Math.random()*this.symbols.length);
    return this.symbols[i];
  }

  setSlot(row,col,symbol){
    const reel = this.reelEls[col];
    const slot = reel.children[row];
    const img = slot.querySelector('img');
    img.src = `assets/symbols/${symbol}.svg`;
    img.alt = symbol;
    this.visible[row][col] = symbol;
  }

  // Spin reel index with duration in ms. We simulate by rapidly changing symbols then stop on target
  // Minimal visual improvements added: progressive deceleration (fewer changes toward end)
  // and a small "impact" class applied to the middle slot when the reel stops.
  spinReel(index,duration=1000){
    return new Promise((resolve)=>{
      const reel = this.reelEls[index];
      const start = performance.now();
      const slots = Array.from(reel.children);
      let raf = null;

      // ensure no leftover classes
      reel.classList.remove('stopped');
      slots.forEach(s => s.classList.remove('impact'));

      const middleIndex = Math.floor(slots.length/2);

      const step = (t)=>{
        const elapsed = t - start;
        const progress = Math.min(1, elapsed / duration);

        if(elapsed >= duration){
          // stop: choose final symbols for each slot
          for(let r=0;r<slots.length;r++){
            const final = this.randomSymbol();
            const img = slots[r].querySelector('img');
            img.src = `assets/symbols/${final}.svg`;
            img.alt = final;
            // update visible
            this.visible[r][index] = final;
          }

          // visual cue: mark reel stopped and pulse the central visible slot
          reel.classList.add('stopped');
          const midSlot = slots[middleIndex];
          if(midSlot){
            midSlot.classList.add('impact');
            // remove impact after the pulse
            setTimeout(()=>{
              midSlot.classList.remove('impact');
              // keep 'stopped' a little longer for focus (then remove)
              setTimeout(()=>reel.classList.remove('stopped'), 260);
            }, 220);
          } else {
            // ensure we still resolve
            setTimeout(()=>reel.classList.remove('stopped'), 260);
          }

          resolve(true);
          return;
        }

        // Progressive deceleration: higher change rate at start, lower near end.
        // We implement by changing a slot only if a random check passes based on progress.
        // This only affects visuals (which symbols flip during the spin) and NOT the final result.
        const changeProbability = 1 - Math.pow(progress, 2.2); // near 0 at end

        for(let r=0;r<slots.length;r++){
          if(Math.random() < changeProbability){
            const img = slots[r].querySelector('img');
            const s = this.randomSymbol();
            img.src = `assets/symbols/${s}.svg`;
            img.alt = s;
          }
        }

        raf = window.requestAnimationFrame(step);
      };

      raf = window.requestAnimationFrame(step);
    });
  }

  getGrid(){
    // return rows x cols grid
    return this.visible.map(row=>row.slice());
  }
}
