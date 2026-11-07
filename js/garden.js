/* Custom A-Frame components for the garden interactions and marker status. */
(function () {
  'use strict';
  if (!window.AFRAME) return;
  function feedback(text) {
    var el = document.getElementById('feedback');
    if (el) el.textContent = text;
  }
  function animate(el, label, config) {
    if (!el) return;
    var name = 'animation__' + label;
    el.removeAttribute(name);
    el.setAttribute(name, config);
  }
  window.GardenBloom = { feedback: feedback };

  AFRAME.registerComponent('bloom-toggle', {
    init: function () {
      var self = this;
      this.open = false;
      this.activate = function () {
        self.open = !self.open;
        self.el.querySelectorAll('.petal-hinge').forEach(function (petal) {
          var y = Number(petal.getAttribute('data-angle')) || 0;
          animate(petal, 'bloom', {
            property: 'rotation',
            to: '0 ' + y + ' ' + (self.open ? '-68' : '-9'),
            dur: 1050, easing: 'easeInOutSine'
          });
        });
        var center = self.el.querySelector('a-sphere[color="#ffe1a0"]');
        if (center) animate(center, 'shine', {property:'scale',to: self.open ? '1.25 1.25 1.25' : '1 1 1',dur: 920,easing:'easeOutSine'});
        feedback(self.open ? '🌸 A flower is blooming! Tap again to close it.' : '🌷 Flower returned to a bud.');
      };
      this.el.addEventListener('click', this.activate);
    },
    remove: function () { if (this.activate) this.el.removeEventListener('click', this.activate); }
  });

  AFRAME.registerComponent('water-garden', {
    init: function () {
      var self = this;
      this.activate = function () {
        var rain = document.getElementById('rain-system');
        var plant = document.getElementById('seedling');
        if (rain) {
          // A short cascade of real A-Frame spheres; only when the user taps.
          rain.textContent = '';
          for (var i=0; i<14; i++) {
            var drop = document.createElement('a-sphere');
            var x = ((i%5)-2)*.067;
            var z = (Math.floor(i/5)-1)*.072;
            var from = x.toFixed(3) + ' .81 ' + z.toFixed(3);
            var to = x.toFixed(3) + ' .12 ' + z.toFixed(3);
            drop.setAttribute('radius', '.022');
            drop.setAttribute('color', '#8ee8ff');
            drop.setAttribute('material', 'opacity: 0.85; transparent: true');
            drop.setAttribute('position', from);
            rain.appendChild(drop);
            (function(d){
              d.addEventListener('animationcomplete__fall', function () { d.setAttribute('visible', false); }, {once: true});
            })(drop);
            animate(drop, 'fall', {property:'position',from:from,to:to,dur:700,delay:i*90,easing:'easeInQuad'});
          }
        }
        if (plant) animate(plant, 'grow', {property:'scale',to:'1.35 1.5 1.35',dur:1350,easing:'easeOutElastic'});
        feedback('💧 Rain is falling, and the seedling is growing!');
      };
      self.el.addEventListener('click', self.activate);
    },
    remove: function () { if (this.activate) this.el.removeEventListener('click', this.activate); }
  });

  AFRAME.registerComponent('color-changer', {
    init: function () {
      var self = this;
      var colors = [
        ['#ffe788','#ffc74e'], ['#ffb7dc','#fa6cbd'],
        ['#b5ffed','#40eaba'], ['#bedaff','#638df9'], ['#ffe788','#ffc74e']
      ];
      var index=0;
      this.activate = function () {
        index=(index+1)%colors.length;
        self.el.setAttribute('material','color',colors[index][0]);
        self.el.setAttribute('material','emissive',colors[index][1]);
        animate(self.el,'spark', {property:'scale',from:'1 1 1',to:'1.5 1.5 1.5',dir:'alternate',dur:260,loop:2,easing:'easeOutQuad'});
        feedback('✨ Firefly glow changed colour!');
      };
      this.el.addEventListener('click',this.activate);
    },
    remove: function () { if (this.activate) this.el.removeEventListener('click',this.activate); }
  });

  AFRAME.registerComponent('marker-banner', {
    init: function () {
      var self=this;
      this.found=function(){
        var el=document.getElementById('marker-status');
        if (el) { el.textContent='✓ HIRO FOUND · Garden is alive!'; el.className='marker-status found'; }
        document.body.classList.add('marker-found');
        feedback('Tap a flower, the cloud or a firefly — or use the buttons below.');
      };
      this.lost=function(){
        var el=document.getElementById('marker-status');
        if (el) { el.textContent='✦ MARKER LOST · Point the camera at Hiro'; el.className='marker-status lost'; }
        document.body.classList.remove('marker-found');
        feedback('Hold the full Hiro marker in the camera view.');
      };
      self.el.addEventListener('markerFound',this.found);
      self.el.addEventListener('markerLost',this.lost);
    },
    remove:function(){this.el.removeEventListener('markerFound',this.found);this.el.removeEventListener('markerLost',this.lost);}
  });
})();
