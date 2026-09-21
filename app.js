(function(){
  try{if(new URLSearchParams(window.location.search).get('qa')==='fullpage')document.documentElement.classList.add('qa-fullpage');}catch(error){}

  var header=document.querySelector('.site-header');

  function onScroll(){
    if(header)header.classList.toggle('scrolled',window.scrollY>20);
  }
  window.addEventListener('scroll',onScroll,{passive:true});
  onScroll();

  var toggle=document.querySelector('.menu-toggle');
  var menu=document.querySelector('.mobile-menu');

  function setMenu(open,focusMenu){
    if(!toggle||!menu)return;
    menu.classList.toggle('open',open);
    toggle.setAttribute('aria-expanded',String(open));
    toggle.setAttribute('aria-label',open?'Menü schließen':'Menü öffnen');
    menu.setAttribute('aria-hidden',String(!open));
    if('inert' in menu)menu.inert=!open;
    if(open&&focusMenu){
      var firstLink=menu.querySelector('a');
      if(firstLink)window.setTimeout(function(){firstLink.focus();},0);
    }
  }

  if(toggle&&menu){
    if('inert' in menu)menu.inert=true;
    toggle.addEventListener('click',function(){
      setMenu(!menu.classList.contains('open'),true);
    });
    menu.querySelectorAll('a').forEach(function(link){
      link.addEventListener('click',function(){setMenu(false);});
    });
    document.addEventListener('keydown',function(event){
      if(event.key==='Escape'&&menu.classList.contains('open')){
        setMenu(false);
        toggle.focus();
      }
    });
    document.addEventListener('click',function(event){
      if(!menu.classList.contains('open'))return;
      if(menu.contains(event.target)||toggle.contains(event.target))return;
      setMenu(false);
    });
    window.addEventListener('resize',function(){
      if(window.innerWidth>1180&&menu.classList.contains('open'))setMenu(false);
    },{passive:true});
  }

  document.querySelectorAll('.reveal').forEach(function(el){
    el.classList.add('visible');
  });


  // Motion system: meaningful product animation with reduced-motion fallback.
  var motionParams;try{motionParams=new URLSearchParams(window.location.search);}catch(error){motionParams=null;}
  var forceMotion=motionParams&&motionParams.get('motion')==='1';
  var reduceMotion=!forceMotion&&window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(forceMotion)document.documentElement.classList.add('motion-forced');
  if(!reduceMotion){
    document.documentElement.classList.add('motion-ready');

    var motionSections=document.querySelectorAll(
      '.membrane-stage,.context-stage,.process-rail,.control-room,.pif-loop-v3,.architecture-map,.control-layers,.impact-list,.closed-loop-track'
    );
    function activateMotion(el){el.classList.add('motion-active');}
    var compactMotion=window.matchMedia&&window.matchMedia('(max-width: 780px)').matches;
    if(compactMotion){
      motionSections.forEach(activateMotion);
    }else if('IntersectionObserver' in window){
      var motionObserver=new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){
            activateMotion(entry.target);
            motionObserver.unobserve(entry.target);
          }
        });
      },{threshold:0.10,rootMargin:'0px 0px -4% 0px'});
      motionSections.forEach(function(el){motionObserver.observe(el);});
      window.setTimeout(function(){motionSections.forEach(activateMotion);},1800);
    }else{
      motionSections.forEach(activateMotion);
    }

    // Scroll progress: deliberately subtle, useful on the longer technical pages.
    var progress=document.createElement('div');
    progress.className='page-progress';
    progress.setAttribute('aria-hidden','true');
    document.body.appendChild(progress);
    var progressTick=false;
    function updateProgress(){
      progressTick=false;
      var max=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);
      var ratio=Math.min(1,Math.max(0,window.scrollY/max));
      progress.style.transform='scaleX('+ratio+')';
    }
    window.addEventListener('scroll',function(){
      if(!progressTick){
        progressTick=true;
        window.requestAnimationFrame(updateProgress);
      }
    },{passive:true});
    window.addEventListener('resize',updateProgress,{passive:true});
    updateProgress();

    // Pointer parallax only on precise pointers; values are consumed by CSS glows.
    if(window.matchMedia&&window.matchMedia('(hover:hover) and (pointer:fine)').matches){
      document.querySelectorAll('.v3-hero,.architecture-map-section').forEach(function(stage){
        stage.addEventListener('pointermove',function(event){
          var rect=stage.getBoundingClientRect();
          var x=((event.clientX-rect.left)/Math.max(1,rect.width))*100;
          var y=((event.clientY-rect.top)/Math.max(1,rect.height))*100;
          stage.style.setProperty('--motion-x',x.toFixed(1)+'%');
          stage.style.setProperty('--motion-y',y.toFixed(1)+'%');
        },{passive:true});
        stage.addEventListener('pointerleave',function(){
          stage.style.removeProperty('--motion-x');
          stage.style.removeProperty('--motion-y');
        },{passive:true});
      });
    }
  }else{
    document.documentElement.classList.add('motion-reduced');
  }

  // In-place pseudonymization demo: one record transforms without side-by-side comparison.
  var transformDemo=document.querySelector('[data-transform-demo]');
  if(transformDemo){
    var transformValues=Array.prototype.slice.call(transformDemo.querySelectorAll('[data-original][data-safe]'));
    var transformStatus=transformDemo.querySelector('[data-transform-status]');
    var transformFoot=transformDemo.querySelector('[data-transform-foot]');
    var transformCounter=transformDemo.querySelector('[data-transform-counter]');
    var transformTimers=[];
    var scrambleChars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789_#';

    function clearTransformTimers(){
      transformTimers.forEach(function(timer){window.clearTimeout(timer);});
      transformTimers=[];
    }

    function transformLater(delay,fn){
      transformTimers.push(window.setTimeout(fn,delay));
    }

    function setTransformValue(el,mode){
      el.textContent=el.getAttribute(mode==='safe'?'data-safe':'data-original');
      var row=el.closest('[data-transform-row]');
      if(row){
        row.classList.remove('is-changing','is-safe');
        if(mode==='safe')row.classList.add('is-safe');
      }
    }

    function scrambleTransformValue(el,target,duration,onDone){
      var row=el.closest('[data-transform-row]');
      if(row){
        row.classList.remove('is-safe');
        row.classList.add('is-changing');
      }
      var started=window.performance&&performance.now?performance.now():Date.now();
      var targetLength=target.length;
      var sourceLength=el.textContent.length;
      var width=Math.max(targetLength,sourceLength);

      function frame(now){
        var current=typeof now==='number'?now:Date.now();
        var progress=Math.min(1,(current-started)/duration);
        var settled=Math.floor(progress*targetLength);
        var out='';
        for(var i=0;i<width;i++){
          if(i<settled&&i<targetLength){
            out+=target.charAt(i);
          }else if(i<targetLength||progress<.62){
            out+=scrambleChars.charAt(Math.floor(Math.random()*scrambleChars.length));
          }
        }
        el.textContent=progress>=1?target:out;
        if(progress<1){
          window.requestAnimationFrame(frame);
        }else{
          if(row){
            row.classList.remove('is-changing');
            row.classList.add('is-safe');
          }
          if(onDone)onDone();
        }
      }
      window.requestAnimationFrame(frame);
    }

    function setTransformState(state,status,foot,count){
      transformDemo.setAttribute('data-state',state);
      if(transformStatus)transformStatus.textContent=status;
      if(transformFoot)transformFoot.textContent=foot;
      if(transformCounter)transformCounter.textContent=String(count);
    }

    function resetTransformDemo(){
      transformDemo.classList.remove('is-scanning');
      transformValues.forEach(function(el){setTransformValue(el,'original');});
      setTransformState('original','ORIGINAL','Direkte Identifikatoren erkannt',0);
    }

    function finishTransformDemo(){
      transformDemo.classList.remove('is-scanning');
      setTransformState('safe','PSEUDONYMISIERT','Direkte Identifikatoren ersetzt. Kontext bleibt erhalten.',transformValues.length);
    }

    var transformStarted=false;

    function runTransformDemo(){
      transformStarted=true;
      clearTransformTimers();
      resetTransformDemo();

      transformLater(900,function(){
        transformDemo.setAttribute('data-state','processing');
        if(transformStatus)transformStatus.textContent='PSOYDO VERARBEITET';
        if(transformFoot)transformFoot.textContent='Identifikatoren werden direkt im Datensatz ersetzt';
        transformDemo.classList.add('is-scanning');
      });

      transformValues.forEach(function(el,index){
        transformLater(1350+(index*470),function(){
          var target=el.getAttribute('data-safe');
          scrambleTransformValue(el,target,430,function(){
            if(transformCounter)transformCounter.textContent=String(index+1);
          });
        });
      });

      transformLater(3300,finishTransformDemo);
      transformLater(6750,runTransformDemo);
    }

    function startTransformDemo(){
      if(transformStarted)return;
      runTransformDemo();
    }

    if(reduceMotion){
      transformValues.forEach(function(el){setTransformValue(el,'safe');});
      finishTransformDemo();
    }else if('IntersectionObserver' in window){
      var transformObserver=new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){
            startTransformDemo();
            transformObserver.disconnect();
          }
        });
      },{threshold:0.28,rootMargin:'0px 0px -8% 0px'});
      transformObserver.observe(transformDemo);
    }else{
      startTransformDemo();
    }
  }

  var tfOpen=document.getElementById('tf-open');
  var tfContainer=document.getElementById('tf-container');

  function renderTypeform(attempt){
    if(!tfContainer)return;
    if(window.tf&&window.tf.createWidget){
      tfContainer.classList.remove('registration-entry');
      tfContainer.classList.add('typeform-active');
      tfContainer.innerHTML='';
      window.tf.createWidget('01KVRJN19YZ8J86JFQYX9N09QG',{
        container:tfContainer,
        hideHeaders:true,
        hideFooter:true,
        inlineOnMobile:true,
        onSubmit:function(){
          if(window.__psoydoAdsConsent===true&&typeof window.gtag==='function'){
            window.gtag('event','psoydo_registration_submit',{
              event_category:'registration',
              event_label:'30_day_test'
            });
          }
        }
      });
      return;
    }
    if(attempt<30){
      window.setTimeout(function(){renderTypeform(attempt+1);},200);
      return;
    }
    tfContainer.classList.remove('registration-entry');
    tfContainer.innerHTML='<div class="form-loading">Registrierung konnte nicht geladen werden. Bitte lade die Seite neu.</div>';
  }

  function loadTypeform(){
    if(!tfContainer)return;
    if(window.tf&&window.tf.createWidget){
      renderTypeform(0);
      return;
    }
    tfContainer.classList.remove('registration-entry');
    tfContainer.innerHTML='<div class="form-loading">Registrierung wird geladen …</div>';
    var existing=document.getElementById('typeform-embed-script');
    if(existing){
      renderTypeform(0);
      return;
    }
    var script=document.createElement('script');
    script.id='typeform-embed-script';
    script.src='https://embed.typeform.com/next/embed.js';
    script.async=true;
    script.onload=function(){renderTypeform(0);};
    script.onerror=function(){
      tfContainer.innerHTML='<div class="form-loading">Registrierung konnte nicht geladen werden. Bitte versuche es erneut.</div>';
    };
    document.head.appendChild(script);
  }

  if(tfOpen)tfOpen.addEventListener('click',loadTypeform);

  // Product screenshot lightbox: enlarge real UI screenshots in-place without navigation.
  var lightboxTriggers=Array.prototype.slice.call(document.querySelectorAll('[data-lightbox]'));
  if(lightboxTriggers.length){
    var lightbox=document.createElement('div');
    lightbox.className='product-lightbox';
    lightbox.id='product-lightbox';
    lightbox.setAttribute('role','dialog');
    lightbox.setAttribute('aria-modal','true');
    lightbox.setAttribute('aria-hidden','true');
    lightbox.setAttribute('aria-labelledby','product-lightbox-title');
    lightbox.innerHTML='<div class="product-lightbox-dialog" role="document"><div class="product-lightbox-head"><strong id="product-lightbox-title">Psoydo Produktscreenshot</strong><button class="product-lightbox-close" type="button" aria-label="Großansicht schließen">×</button></div><div class="product-lightbox-body"><img alt=""></div><span class="product-lightbox-hint">ESC ZUM SCHLIESSEN</span></div>';
    document.body.appendChild(lightbox);

    var lightboxImage=lightbox.querySelector('.product-lightbox-body img');
    var lightboxTitle=lightbox.querySelector('#product-lightbox-title');
    var lightboxClose=lightbox.querySelector('.product-lightbox-close');
    var lightboxReturnFocus=null;

    function closeLightbox(){
      if(!lightbox.classList.contains('is-open'))return;
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden','true');
      document.body.classList.remove('lightbox-open');
      if(lightboxImage){
        lightboxImage.removeAttribute('src');
        lightboxImage.alt='';
      }
      if(lightboxReturnFocus&&typeof lightboxReturnFocus.focus==='function'){
        lightboxReturnFocus.focus();
      }
      lightboxReturnFocus=null;
    }

    function openLightbox(trigger){
      var image=trigger.querySelector('img');
      if(!image)return;
      lightboxReturnFocus=trigger;
      if(lightboxImage){
        lightboxImage.src=trigger.getAttribute('data-lightbox-src')||image.currentSrc||image.src;
        lightboxImage.alt=image.alt||'Psoydo Produktscreenshot';
      }
      if(lightboxTitle)lightboxTitle.textContent=trigger.getAttribute('data-lightbox-title')||image.alt||'Psoydo Produktscreenshot';
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden','false');
      document.body.classList.add('lightbox-open');
      if(lightboxClose)window.setTimeout(function(){lightboxClose.focus();},0);
    }

    lightboxTriggers.forEach(function(trigger){
      trigger.setAttribute('aria-haspopup','dialog');
      trigger.setAttribute('aria-controls','product-lightbox');
      trigger.addEventListener('click',function(){openLightbox(trigger);});
    });

    if(lightboxClose)lightboxClose.addEventListener('click',closeLightbox);
    lightbox.addEventListener('click',function(event){
      if(event.target===lightbox)closeLightbox();
    });
    lightbox.addEventListener('keydown',function(event){
      if(event.key==='Escape'){
        event.preventDefault();
        closeLightbox();
        return;
      }
      if(event.key!=='Tab')return;
      var focusable=Array.prototype.slice.call(lightbox.querySelectorAll('button,[href],[tabindex]:not([tabindex="-1"])')).filter(function(el){
        return !el.hasAttribute('disabled')&&el.offsetParent!==null;
      });
      if(focusable.length<2)return;
      var first=focusable[0];
      var last=focusable[focusable.length-1];
      if(event.shiftKey&&document.activeElement===first){
        event.preventDefault();
        last.focus();
      }else if(!event.shiftKey&&document.activeElement===last){
        event.preventDefault();
        first.focus();
      }
    });
  }

  var box=document.getElementById('consent');
  if(!box)return;

  var KEY='psoydo-consent-v2';

  var consentReturnFocus=null;

  function showConsent(){
    consentReturnFocus=document.activeElement;
    box.classList.add('show');
    box.setAttribute('aria-hidden','false');
    box.setAttribute('aria-modal','true');
    var first=box.querySelector('button,a[href]');
    if(first)window.setTimeout(function(){first.focus();},0);
  }

  function hideConsent(){
    box.classList.remove('show');
    box.setAttribute('aria-hidden','true');
    box.removeAttribute('aria-modal');
    if(consentReturnFocus&&typeof consentReturnFocus.focus==='function'){
      consentReturnFocus.focus();
      consentReturnFocus=null;
    }
  }

  window.__psoydoAdsConsent=false;

  function loadAds(){
    window.__psoydoAdsConsent=true;
    if(document.getElementById('google-gtag'))return;
    var script=document.createElement('script');
    script.id='google-gtag';
    script.async=true;
    script.src='https://www.googletagmanager.com/gtag/js?id=AW-18355213487';
    document.head.appendChild(script);
    window.dataLayer=window.dataLayer||[];
    window.gtag=function(){window.dataLayer.push(arguments);};
    window.gtag('js',new Date());
    window.gtag('config','AW-18355213487');
  }

  var stored=null;
  try{stored=localStorage.getItem(KEY);}catch(error){}

  if(stored==='granted')loadAds();
  else if(stored!=='denied')window.setTimeout(showConsent,900);

  var yes=document.getElementById('consent-accept');
  var no=document.getElementById('consent-decline');
  var reopen=document.getElementById('consent-reopen');

  if(yes)yes.addEventListener('click',function(){
    try{localStorage.setItem(KEY,'granted');}catch(error){}
    loadAds();
    hideConsent();
  });

  if(no)no.addEventListener('click',function(){
    try{localStorage.setItem(KEY,'denied');}catch(error){}
    window.__psoydoAdsConsent=false;
    if(typeof window.gtag==='function'){
      window.gtag('consent','update',{
        ad_storage:'denied',
        analytics_storage:'denied',
        ad_user_data:'denied',
        ad_personalization:'denied'
      });
    }
    hideConsent();
  });

  if(reopen)reopen.addEventListener('click',showConsent);

  box.addEventListener('keydown',function(event){
    if(event.key==='Escape'){
      hideConsent();
      return;
    }
    if(event.key!=='Tab')return;
    var focusable=Array.prototype.slice.call(box.querySelectorAll('button,a[href]')).filter(function(el){
      return !el.hasAttribute('disabled')&&el.offsetParent!==null;
    });
    if(focusable.length<2)return;
    var first=focusable[0];
    var last=focusable[focusable.length-1];
    if(event.shiftKey&&document.activeElement===first){
      event.preventDefault();
      last.focus();
    }else if(!event.shiftKey&&document.activeElement===last){
      event.preventDefault();
      first.focus();
    }
  });
})();
