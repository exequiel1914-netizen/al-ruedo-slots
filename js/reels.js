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
    // new: metadata and class for style/animation hooks
    img.dataset.symbol = symbol;
    img.classList.add('symbol');
    this.visible[row][col] = symbol;
  }

  // Spin reel index with duration in ms. We simulate by rapidly changing symbols then stop on target
  spinReel(index,duration=1000){
    return new Promise((resolve)=>{
      const reel = this.reelEls[index];
      const interval = 80; // change every 80ms
      const start = performance.now();
      const slots = Array.from(reel.children);
      let timer = null;
      function step(t){
        if(t - start >= duration){
          // stop: choose final symbols for each slot
          for(let r=0;r<slots.length;r++){
            const final = this.randomSymbol();
            const img = slots[r].querySelector('img');
            img.src = `assets/symbols/${final}.svg`;
            img.alt = final;
            // update visible
            this.visible[r][index] = final;
          }
          resolve(true);
          return;
        }
        // change symbols randomly
        for(let r=0;r<slots.length;r++){
          const img = slots[r].querySelector('img');
          const s = this.randomSymbol();
          img.src = `assets/symbols/${s}.svg`;
          img.alt = s;
        }
        timer = window.requestAnimationFrame(step.bind(this));
      }
      timer = window.requestAnimationFrame(step.bind(this));
    });
  }

  getGrid(){
    // return rows x cols grid
    return this.visible.map(row=>row.slice());
  }
}
