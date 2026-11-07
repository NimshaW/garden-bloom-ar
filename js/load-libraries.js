/* Load local A-Frame and AR.js builds once, with online fallbacks. */
(function () {
  'use strict';
  if (window.__GardenBloomLoaderStarted) return;
  window.__GardenBloomLoaderStarted = true;

  function aframeReady() {
    return Boolean(window.AFRAME && typeof window.AFRAME.registerComponent === 'function');
  }
  function arjsReady() {
    var a = window.AFRAME;
    // The marker-tracking build registers the arjs-anchor component.
    return Boolean(a && a.components && a.components['arjs-anchor']);
  }
  var sources = [
    {name:'A-Frame',ready:aframeReady,urls:[
      'vendor/aframe.min.js',
      'https://aframe.io/releases/1.6.0/aframe.min.js',
      'https://unpkg.com/aframe@1.6.0/dist/aframe-master.min.js'
    ]},
    {name:'AR.js',ready:arjsReady,urls:[
      'vendor/aframe-ar.js',
      'https://raw.githack.com/AR-js-org/AR.js/3.4.7/aframe/build/aframe-ar.js',
      'https://cdn.jsdelivr.net/gh/AR-js-org/AR.js@3.4.7/aframe/build/aframe-ar.js'
    ]}
  ];
  var log = [];
  function status(message,failed) {
    var button = document.getElementById('start-ar');
    var note = document.querySelector('#intro .fineprint');
    if (note) note.textContent = message;
    if (button) {
      button.disabled = !window.GardenBloomLibrariesReady;
      button.textContent = failed ? '⚠ AR libraries unavailable' :
        window.GardenBloomLibrariesReady ? '📷 Start Garden AR + Camera' : '⏳ Loading AR libraries...';
    }
  }
  function inject(url) {
    return new Promise(function(resolve,reject){
      var script = document.createElement('script');
      var finished = false;
      var timeout = window.setTimeout(function(){complete(false, 'timeout');},15000);
      function complete(ok,reason) {
        if (finished) return;
        finished = true;
        window.clearTimeout(timeout);
        script.onload = script.onerror = null;
        if (!ok) script.remove();
        (ok ? resolve : reject)(reason || url);
      }
      script.async = false;
      script.src = url;
      script.onload = function(){complete(true);};
      script.onerror = function(){complete(false,'network error');};
      document.head.appendChild(script);
    });
  }
  function loadDependency(source) {
    var i = 0;
    function attempt(){
      if (source.ready()) return Promise.resolve();
      if (i >= source.urls.length) {
        return Promise.reject(new Error(source.name + ' did not load from any source'));
      }
      var url = source.urls[i++];
      status('Loading '+source.name+' ('+i+'/'+source.urls.length+')...',false);
      return inject(url).then(function(){
        if (source.ready()) {log.push(source.name+' OK: '+url); return;}
        // Do not re-inject a script that may have partially initialized.
        log.push(source.name+': script returned but its components are missing: '+url);
        throw new Error(source.name+' executed without the expected registration. Do NOT load it twice. Check F12 Console.');
      },function(reason){
        log.push(source.name+': '+reason+' -> '+url);
        // A script may have registered components before a load error.
        if (source.ready()) return;
        return attempt();
      });
    }
    return attempt();
  }
  function checkMarkerAssets() {
    // Include the Hiro pattern and camera calibration for marker recognition.
    var assets=['markers/pattern-hiro.patt','vendor/camera_para.dat'];
    return Promise.all(assets.map(function(path){
      return fetch(path,{cache:'no-store'}).then(function(r){
        if (!r.ok) throw new Error(path+' missing (HTTP '+r.status+')');
        return r.arrayBuffer();
      }).then(function(bytes){
        if (bytes.byteLength<100) throw new Error(path+' appears empty');
      });
    }));
  }
  window.addEventListener('DOMContentLoaded',function(){
    window.GardenBloomLibrariesReady = false;
    status('Loading A-Frame and AR.js...',false);
    loadDependency(sources[0])
      .then(function(){return loadDependency(sources[1]);})
      .then(function(){return inject('js/garden.js');})
      .then(function(){return checkMarkerAssets();})
      .then(function(){return inject('js/camera.js');})
      .then(function(){
        window.GardenBloomLibrariesReady = true;
        status('Ready! Click Start Garden AR + Camera and allow the webcam.',false);
        var state=document.getElementById('camera-state');
        if(state) state.textContent='AR engine ready';
        console.info('Garden Bloom AR ready.',log);
      })
      .catch(function(error){
        console.error('Garden Bloom dependency error:',error,log);
        status('Missing AR library or marker assets. Run DOWNLOAD-AR-LIBRARIES.bat, then refresh.',true);
        var state=document.getElementById('camera-state');
        if(state){state.textContent='AR scripts not loaded';state.className='state bad';}
        var old=document.getElementById('library-error');
        if(old) old.remove();
        var details=document.createElement('pre');
        details.id='library-error';
        details.style.cssText='max-height:135px;overflow:auto;white-space:pre-wrap;text-align:left;font-size:11px;color:#ffdad8;background:#301b22;padding:10px;border-radius:10px';
        details.textContent=error.message+'\n'+log.join('\n');
        var target=document.querySelector('#intro .intro-card');
        if(target) target.appendChild(details);
      });
  });
})();
