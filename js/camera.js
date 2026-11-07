/* Start the AR scene and share its camera stream with the visible backdrop. */
(function () {
  'use strict';
  var el = function (id) { return document.getElementById(id); };
  var startBtn=el('start-ar'), intro=el('intro'), mount=el('scene-mount');
  var mirror=el('camera-backdrop'), state=el('camera-state');
  var details=el('camera-details'), controls=el('garden-controls');
  var active=false, stream=null, mode='marker-tracking';
  var lastError='', startedAt=0, markerSeen=false, lastTime=-1, framesMoving=false;
  var lastPlayAttempt=0, cameraEventSeen=false;

  function showState(message, kind) {
    state.textContent=message;
    state.className='state '+(kind||'');
  }
  function sourceVideo() {
    // The actual AR.js source is stored in the scene system. It does not
    // necessarily use the #arjs-video id, especially across AR.js releases.
    var scene=el('garden-scene');
    var system=scene && scene.systems && scene.systems.arjs;
    var source=system && system._arSession && system._arSession.arSource;
    if (source && source.domElement && source.domElement.tagName === 'VIDEO') return source.domElement;
    return document.querySelector('video#arjs-video') ||
      document.querySelector('video.arjs-video') ||
      document.querySelector('video[data-arjs-video]') || null;
  }
  function acceptStream(candidate) {
    if (!candidate || typeof candidate.getVideoTracks !== 'function') return;
    stream=candidate;
    if (mirror.srcObject !== stream) {
      mirror.srcObject=stream;
      mirror.muted=true;
      mirror.setAttribute('playsinline','');
      lastPlayAttempt=0;
    }
  }
  function videoIsReady(video) {return !!(video && video.readyState>=2 && video.videoWidth>0 && !video.paused);}
  function liveTrack() {
    if (!stream || !stream.getVideoTracks) return null;
    return stream.getVideoTracks()[0] || null;
  }
  function mirrorStream(video) {
    if (!video || !video.srcObject || !video.srcObject.getVideoTracks) return;
    acceptStream(video.srcObject);
    if (mirror.paused && Date.now()-lastPlayAttempt>2500) {
      lastPlayAttempt=Date.now();
      var result=mirror.play();
      if (result && result.catch) result.catch(function(e){lastError='Shared video playback: '+(e.name||e.message);});
    }
  }
  function enforceVideoLayer(video) {
    if (!video) return;
    // Keep the source video visible underneath the 3D overlay.
    video.style.setProperty('z-index','0','important');
    video.style.setProperty('visibility','visible','important');
    video.style.setProperty('opacity','1','important');
    video.setAttribute('playsinline','');
    video.muted=true;
    // The A-Frame WebGL canvas remains above the camera, with alpha=true.
    var canvas=document.querySelector('#garden-scene canvas');
    if (canvas) canvas.style.setProperty('background-color','transparent','important');
  }
  function diagnostics() {
    if (!active) return;
    var video=sourceVideo();
    enforceVideoLayer(video);
    mirrorStream(video);
    if (stream && mirror.paused && Date.now()-lastPlayAttempt>2500) {
      lastPlayAttempt=Date.now();
      var playResult=mirror.play();
      if (playResult && playResult.catch) playResult.catch(function(e){lastError='Background video: '+(e.name||e.message);});
    }
    var track=liveTrack();
    var srcReady=videoIsReady(video), mirrorReady=videoIsReady(mirror);
    // Mirror is a real visible HTML video, even if AR.js rendered its camera behind a background.
    mirror.classList.toggle('live',mirrorReady);
    if (video && video.currentTime !== lastTime) {
      if (lastTime>=0) framesMoving=true;
      lastTime=video.currentTime;
    }
    var sec=Math.round((Date.now()-startedAt)/1000);
    var scene=el('garden-scene');
    var system=scene && scene.systems && scene.systems.arjs;
    var session=system && system._arSession;
    var cameraSource=session && session.arSource;
    var healthy=(srcReady || mirrorReady || (track && track.readyState==='live')) && (!track || track.readyState==='live');
    if (mirrorReady || srcReady) showState('● Camera LIVE · AR tracking ON', 'ok');
    else if (healthy) showState('● Camera detected · AR tracking ON', 'ok');
    else if (lastError) showState('Camera issue · Details', 'bad');
    else if (sec>12) showState('Camera not ready · Details', 'bad');
    else showState('Connecting camera…', '');
    details.textContent=[
      'Garden Bloom AR camera diagnostics',
      'Site: '+location.origin+'  | Secure context: '+window.isSecureContext,
      'Mode: '+mode+'  | AR.js script: '+!!(window.AFRAME && AFRAME.components && AFRAME.components['arjs-anchor']),
      'Marker tracking system: '+(system ? (system.data.videoTexture ? 'DISABLED (texture mode)' : (session ? 'session created' : 'initializing')) : 'not initialized'),
      'Scene loaded: '+!!(el('garden-scene') && el('garden-scene').hasLoaded),
      'AR.js video: '+(video ? video.videoWidth+'x'+video.videoHeight+', paused='+video.paused+', readyState='+video.readyState : 'not created'),
      'Shared live background: '+(mirrorReady ? 'PLAYING' : (stream ? 'waiting' : 'no stream yet')),
      'Camera event received: '+(cameraEventSeen ? 'yes' : 'not yet'),
      'AR source element: '+(cameraSource && cameraSource.domElement ? cameraSource.domElement.tagName : 'not yet'),
      'Webcam track: '+(track ? track.readyState : 'not exposed'),
      'Frames advancing: '+(framesMoving ? 'yes' : 'not confirmed yet'),
      'Marker found: '+(markerSeen ? 'yes' : 'no'),
      'Elapsed: '+sec+'s',
      'Error: '+(lastError || 'none captured'),
      '',
      'If camera test works but no image appears:',
      '1) Close the Camera Test tab and other webcam apps.',
      '2) Marker tracking requires normal video mode, not videoTexture.',
      '3) If marker is still missing, run the library+assets batch downloader.',
      '4) Use HTTPS for phone (local IP over HTTP is not secure).'
    ].join('\n');
  }
  function onCameraError(e) {
    var err=(e && e.detail && e.detail.error) || (e && e.error) || e;
    lastError=(err && (err.name || err.message)) || 'Camera error from AR.js';
    diagnostics();
  }
  document.addEventListener('camera-error',onCameraError);
  window.addEventListener('camera-error',onCameraError);
  function cameraInitialized(e) {
    cameraEventSeen=true;
    lastError='';
    // AR.js dispatches camera-init with a stream property (and on some
    // versions on detail.stream). We only reuse the SAME stream.
    var candidate=(e && e.stream) || (e && e.detail && e.detail.stream);
    acceptStream(candidate);
    diagnostics();
  }
  document.addEventListener('camera-init',cameraInitialized);
  window.addEventListener('camera-init',cameraInitialized);
  window.addEventListener('arjs-video-loaded',function(){cameraEventSeen=true;diagnostics();});
  document.addEventListener('visibilitychange',function(){
    if (!document.hidden && stream && mirror.paused) {
      mirror.play().catch(function(){/* muted playback may require a user gesture */});
    }
  });

  function start() {
    if (active) return;
    if (!window.AFRAME || !AFRAME.components || !AFRAME.components['arjs-anchor']) {
      showState('AR libraries missing', 'bad');
      var message=el('intro').querySelector('.fineprint');
      message.textContent='AR.js marker component unavailable. Check the Console or run DOWNLOAD-AR-LIBRARIES.bat.';
      return;
    }
    active=true;startedAt=Date.now();lastError='';
    var fragment=el('scene-template').content.cloneNode(true);
    var scene=fragment.querySelector('a-scene');
    // Keep marker tracking active while drawing the live camera backdrop.
    scene.setAttribute('arjs','sourceType: webcam; videoTexture: false; debugUIEnabled: false; detectionMode: mono_and_matrix; cameraParametersUrl: vendor/camera_para.dat;');
    var marker=fragment.querySelector('#hiro-marker');
    marker.addEventListener('markerFound',function(){markerSeen=true;diagnostics();});
    marker.addEventListener('markerLost',function(){markerSeen=false;diagnostics();});
    mount.appendChild(fragment);
    intro.hidden=true;
    controls.hidden=false;
    showState('Requesting camera…','');
    diagnostics();
    window.setInterval(diagnostics,750);
  }
  startBtn.addEventListener('click',start);

  document.querySelectorAll('[data-action]').forEach(function(button){
    button.addEventListener('click',function(){
      var config={bloom:['flower','bloom-toggle'],water:['cloud','water-garden'],glow:['firefly','color-changer']};
      var target=config[button.dataset.action];
      var entity=el(target[0]);
      if (!entity || !entity.components || !entity.components[target[1]]) {
        if (window.GardenBloom) GardenBloom.feedback('AR is loading. Point your camera at the Hiro marker.');
        return;
      }
      entity.components[target[1]].activate();
    });
  });
  el('camera-retry').addEventListener('click',function(){location.reload();});
  el('toggle-details').addEventListener('click',function(){details.hidden=!details.hidden;diagnostics();});
  // Ignore obsolete query parameters to preserve the expected AR mode.
  if (new URLSearchParams(location.search).has('mode')) {
    var corrected=new URL(location.href);
    corrected.searchParams.delete('mode');
    history.replaceState(null,'',corrected.href);
  }
  if (location.protocol==='file:') {
    showState('Use Live Server, not file://','bad');
    el('intro').querySelector('.fineprint').textContent='Open index.html with VS Code Live Server or the included Windows server. Camera does not work reliably on file://.';
  }
})();
