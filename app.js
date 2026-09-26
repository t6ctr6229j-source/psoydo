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

  // 30-second public AI decision check.
  var aiQuiz=document.querySelector('[data-ai-quiz]');
  if(aiQuiz){
    var aiQuizQuestions=[
      {
        eyebrow:'ÖFFENTLICH',
        question:'Die Pressemitteilung steht bereits auf eurer Website. Du möchtest sie von einer KI kürzen lassen.',
        context:'Es werden keine zusätzlichen internen Informationen ergänzt.',
        correct:'allow',
        recommendation:'Rein damit',
        title:'Bereits öffentlich ist etwas anderes als intern.',
        copy:'Wenn wirklich nur bereits veröffentlichte Inhalte enthalten sind, entsteht durch den Upload keine zusätzliche Offenlegung interner Informationen. Unternehmensregeln und Anbieterbedingungen gelten natürlich trotzdem.'
      },
      {
        eyebrow:'PERSONENBEZUG',
        question:'Für eine Auswertung sind 800 Support-Tickets fachlich freigegeben. Darin stehen aber Namen, E-Mail-Adressen und Kundennummern.',
        context:'Das Modell braucht Problemtyp, Verlauf und Lösung – nicht die Identität des Kunden.',
        correct:'protect',
        recommendation:'Erst prüfen & schützen',
        title:'Genau hier wird Pseudonymisierung interessant.',
        copy:'Direkte Identifikatoren können vor der Übergabe konsistent ersetzt werden, während der fachliche Zusammenhang für die Analyse erhalten bleibt.'
      },
      {
        eyebrow:'GESCHÄFTSGEHEIMNIS',
        question:'Ein internes Strategiepapier enthält keine Personendaten. Dafür unveröffentlichte Preise, Margen und mögliche Übernahmeziele.',
        context:'Die Information selbst ist sensibel – nicht die Identität einer Person.',
        correct:'block',
        recommendation:'Auf keinen Fall',
        title:'Keine Namen heißt nicht unkritisch.',
        copy:'Solche Inhalte können Geschäftsgeheimnisse sein. Psoydo prüft deshalb zusätzlich auf Hinweise auf mögliche Geschäftsgeheimnisse nach den Kriterien des GeschGehG. Pseudonymisierung allein würde hier das Kernproblem nicht lösen.'
      },
      {
        eyebrow:'VERTRAGSANALYSE',
        question:'Eine große Vertragsmenge soll extern analysiert werden. Der Vertragsinhalt ist für diesen Analyseweg freigegeben, reale Ansprechpartner aber nicht.',
        context:'Klauseln und Beziehungen sind relevant. Namen, E-Mails, Adressen und Unterschriften stehen trotzdem in den Dokumenten.',
        correct:'protect',
        recommendation:'Erst prüfen & schützen',
        title:'Kontext behalten. Identität ersetzen.',
        copy:'Wenn der fachliche Inhalt genutzt werden darf, aber direkte Identifikatoren nicht zum Modell sollen, kann Psoydo genau diese Trennung herstellen.'
      },
      {
        eyebrow:'IT & SECURITY',
        question:'Für Angriffskorrelation sollen Logs ausgewertet werden. Sie enthalten Usernamen, IP-Adressen und interne Hostnamen.',
        context:'Zeitstempel, Ereignisse und Beziehungen braucht das Modell. Reale Nutzerbezüge nicht; interne Systemnamen können zusätzlich vertraulich sein.',
        correct:'protect',
        recommendation:'Erst prüfen & schützen',
        title:'Hier reicht eine reine Namenssuche nicht.',
        copy:'Psoydo kann Identifikatoren pseudonymisieren und den Inhalt zusätzlich auf Hinweise auf mögliche Geschäftsgeheimnisse prüfen. Welche Informationen als geschützter Kontext verbleiben dürfen, muss für den Einsatz feststehen.'
      }
    ];

    var aiQuizIndex=0;
    var aiQuizScore=0;
    var aiQuizAnswered=false;
    var aiQuizCount=aiQuiz.querySelector('[data-ai-quiz-count]');
    var aiQuizBar=aiQuiz.querySelector('[data-ai-quiz-bar]');
    var aiQuizEyebrow=aiQuiz.querySelector('[data-ai-quiz-eyebrow]');
    var aiQuizQuestion=aiQuiz.querySelector('[data-ai-quiz-question]');
    var aiQuizContext=aiQuiz.querySelector('[data-ai-quiz-context]');
    var aiQuizActions=aiQuiz.querySelector('[data-ai-quiz-actions]');
    var aiQuizButtons=Array.prototype.slice.call(aiQuiz.querySelectorAll('[data-ai-answer]'));
    var aiQuizFeedback=aiQuiz.querySelector('[data-ai-quiz-feedback]');
    var aiQuizVerdict=aiQuiz.querySelector('[data-ai-quiz-verdict]');
    var aiQuizFeedbackTitle=aiQuiz.querySelector('[data-ai-quiz-feedback-title]');
    var aiQuizFeedbackCopy=aiQuiz.querySelector('[data-ai-quiz-feedback-copy]');
    var aiQuizNext=aiQuiz.querySelector('[data-ai-quiz-next]');
    var aiQuizStage=aiQuiz.querySelector('[data-ai-quiz-stage]');
    var aiQuizFinish=aiQuiz.querySelector('[data-ai-quiz-finish]');
    var aiQuizResult=aiQuiz.querySelector('[data-ai-quiz-result]');

    function padQuizNumber(value){
      return value<10?'0'+value:String(value);
    }

    function renderAiQuizQuestion(){
      var item=aiQuizQuestions[aiQuizIndex];
      aiQuizAnswered=false;
      if(aiQuizCount)aiQuizCount.textContent=padQuizNumber(aiQuizIndex+1)+' / '+padQuizNumber(aiQuizQuestions.length);
      if(aiQuizBar)aiQuizBar.style.transform='scaleX('+((aiQuizIndex+1)/aiQuizQuestions.length)+')';
      if(aiQuizEyebrow)aiQuizEyebrow.textContent=item.eyebrow;
      if(aiQuizQuestion)aiQuizQuestion.textContent=item.question;
      if(aiQuizContext)aiQuizContext.textContent=item.context;
      if(aiQuizFeedback)aiQuizFeedback.hidden=true;
      if(aiQuizActions)aiQuizActions.hidden=false;
      aiQuizButtons.forEach(function(button){
        button.disabled=false;
        button.classList.remove('is-selected','is-correct','is-wrong');
      });
    }

    function finishAiQuiz(){
      if(aiQuizStage)aiQuizStage.hidden=true;
      if(aiQuizFinish)aiQuizFinish.hidden=false;
      if(aiQuizCount)aiQuizCount.textContent='FERTIG';
      if(aiQuizBar)aiQuizBar.style.transform='scaleX(1)';
      if(aiQuizResult)aiQuizResult.textContent=aiQuizScore+' von '+aiQuizQuestions.length+' Situationen passend eingeschätzt';
      var finishLink=aiQuizFinish?aiQuizFinish.querySelector('a'):null;
      if(finishLink)window.setTimeout(function(){finishLink.focus();},0);
    }

    aiQuizButtons.forEach(function(button){
      button.addEventListener('click',function(){
        if(aiQuizAnswered)return;
        aiQuizAnswered=true;
        var item=aiQuizQuestions[aiQuizIndex];
        var answer=button.getAttribute('data-ai-answer');
        var correct=answer===item.correct;
        if(correct)aiQuizScore+=1;

        aiQuizButtons.forEach(function(option){
          option.disabled=true;
          if(option.getAttribute('data-ai-answer')===item.correct)option.classList.add('is-correct');
        });
        button.classList.add('is-selected');
        if(!correct)button.classList.add('is-wrong');

        if(aiQuizVerdict)aiQuizVerdict.textContent='EMPFEHLUNG · '+item.recommendation.toUpperCase();
        if(aiQuizFeedbackTitle)aiQuizFeedbackTitle.textContent=item.title;
        if(aiQuizFeedbackCopy)aiQuizFeedbackCopy.textContent=item.copy;
        if(aiQuizActions)aiQuizActions.hidden=false;
        if(aiQuizFeedback)aiQuizFeedback.hidden=false;
        if(aiQuizNext)aiQuizNext.innerHTML=(aiQuizIndex===aiQuizQuestions.length-1?'Auswertung ansehen':'Nächste Situation')+' <span>→</span>';
        if(aiQuizFeedback)window.setTimeout(function(){aiQuizFeedback.focus&&aiQuizFeedback.focus();},0);
      });
    });

    if(aiQuizNext){
      aiQuizNext.addEventListener('click',function(){
        if(!aiQuizAnswered)return;
        if(aiQuizIndex>=aiQuizQuestions.length-1){
          finishAiQuiz();
          return;
        }
        aiQuizIndex+=1;
        renderAiQuizQuestion();
        var firstButton=aiQuizButtons[0];
        if(firstButton)window.setTimeout(function(){firstButton.focus();},0);
      });
    }

    renderAiQuizQuestion();
  }

  var pilotEmail=document.getElementById('pilot-email');
  if(pilotEmail)pilotEmail.addEventListener('click',function(){
    if(window.__psoydoTrack)window.__psoydoTrack('psoydo_pilot_email_click');
  });

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

  var KEY='psoydo-consent-v3';
  var CONSENT_VERSION=4;
  var LIFETIME=180*24*60*60*1000;
  var expiryTimer;

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

  var GA='G-EYFT82SFN7';
  var ADS='AW-18355213487';
  var production=location.protocol==='https:'&&/^(www\.)?psoydo\.com$/.test(location.hostname);
  var current={analytics:false,ads:false};
  var configured=false;
  var analyticsOption=document.getElementById('consent-analytics');
  var adsOption=document.getElementById('consent-ads');
  window['ga-disable-'+GA]=true;

  function cleanURL(value){
    try{var url=new URL(value);return url.origin+url.pathname;}catch(error){return '';}
  }

  window.__psoydoTrack=function(name){
    if(current.expires<=Date.now()){stopMeasurement();return;}
    if(!production||!configured||typeof window.gtag!=='function')return;
    if(current.analytics)window.gtag('event',name,{
      send_to:GA,event_category:'registration',event_label:'pilot_inquiry'
    });
  };

  function loadMeasurement(choice){
    current=choice;
    watchExpiry(choice.expires);
    if(analyticsOption)analyticsOption.checked=choice.analytics;
    if(adsOption)adsOption.checked=choice.ads;
    if(!production||(!choice.analytics&&!choice.ads)||configured)return;
    configured=true;
    window['ga-disable-'+GA]=!choice.analytics;
    window.dataLayer=window.dataLayer||[];
    window.gtag=function(){window.dataLayer.push(arguments);};
    window.gtag('consent','default',{
      analytics_storage:choice.analytics?'granted':'denied',
      ad_storage:choice.ads?'granted':'denied',
      ad_user_data:choice.ads?'granted':'denied',
      ad_personalization:'denied'
    });
    window.gtag('js',new Date());
    window.gtag('set',{
      page_location:cleanURL(location.href),page_referrer:cleanURL(document.referrer),
      allow_ad_personalization_signals:false
    });
    if(choice.analytics)window.gtag('config',GA,{
      send_page_view:true,allow_google_signals:false,
      allow_ad_personalization_signals:false,cookie_expires:LIFETIME/1000,cookie_update:false
    });
    if(choice.ads)window.gtag('config',ADS,{allow_ad_personalization_signals:false});
    var script=document.createElement('script');
    script.id='google-gtag';
    script.async=true;
    script.src='https://www.googletagmanager.com/gtag/js?id='+(choice.analytics?GA:ADS);
    document.head.appendChild(script);
  }

  function clearMeasurementCookies(keep){
    var domains=['',location.hostname,'.'+location.hostname,'.psoydo.com'];
    document.cookie.split(';').forEach(function(cookie){
      var name=cookie.split('=')[0].trim();
      if(!/^(_ga|_gid|_gat|_gcl)(_|$)/.test(name))return;
      if(keep&&((keep.analytics&&/^(_ga|_gid|_gat)(_|$)/.test(name))||(keep.ads&&/^_gcl(_|$)/.test(name))))return;
      domains.forEach(function(domain){
        document.cookie=name+'=; Max-Age=0; path=/'+(domain?'; domain='+domain:'');
      });
    });
  }

  function stopMeasurement(){
    window['ga-disable-'+GA]=true;
    clearTimeout(expiryTimer);
    current={analytics:false,ads:false};
    if(analyticsOption)analyticsOption.checked=false;
    if(adsOption)adsOption.checked=false;
    clearMeasurementCookies();
    if(configured)location.reload();
  }

  function watchExpiry(expires){
    clearTimeout(expiryTimer);
    var remaining=expires-Date.now();
    if(remaining<=0){stopMeasurement();showConsent();return;}
    expiryTimer=setTimeout(function(){watchExpiry(expires);},Math.min(remaining,2147483647));
  }

  function readChoice(){
    try{
      var value=JSON.parse(localStorage.getItem(KEY));
      if(value&&value.version===CONSENT_VERSION&&typeof value.analytics==='boolean'&&
         typeof value.ads==='boolean'&&Number.isFinite(value.expires)&&
         value.expires>Date.now()&&value.expires<=Date.now()+LIFETIME)return value;
    }catch(error){}
    return null;
  }

  function saveChoice(choice){
    choice={version:CONSENT_VERSION,analytics:choice.analytics,ads:choice.ads,expires:Date.now()+LIFETIME};
    var changed=current.analytics!==choice.analytics||current.ads!==choice.ads;
    try{localStorage.setItem(KEY,JSON.stringify(choice));}catch(error){}
    if(configured&&changed){
      // A new document prevents the old runtime from sending further events.
      stopMeasurement();
      return;
    }
    if(!choice.analytics&&!choice.ads)clearMeasurementCookies();
    loadMeasurement(choice);
    hideConsent();
  }

  window.addEventListener('storage',function(event){
    if(event.key!==KEY&&event.key!==null)return;
    stopMeasurement();
    if(!configured){
      var choice=readChoice();
      if(choice){loadMeasurement(choice);hideConsent();}
      else showConsent();
    }
  });
  window.addEventListener('pageshow',function(event){
    if(event.persisted)location.reload();
  });
  // Expired, malformed and old unlimited choices require a new decision.
  var stored=readChoice();
  clearMeasurementCookies(stored);
  if(stored)loadMeasurement(stored);
  else showConsent();

  var yes=document.getElementById('consent-accept');
  var no=document.getElementById('consent-decline');
  var reopen=document.getElementById('consent-reopen');
  if(yes)yes.addEventListener('click',function(){
    saveChoice({analytics:!!analyticsOption.checked,ads:!!adsOption.checked});
  });
  if(no)no.addEventListener('click',function(){saveChoice({analytics:false,ads:false});});

  if(reopen)reopen.addEventListener('click',showConsent);

  box.addEventListener('keydown',function(event){
    if(event.key==='Escape'){
      hideConsent();
      return;
    }
    if(event.key!=='Tab')return;
    var focusable=Array.prototype.slice.call(box.querySelectorAll('button,a[href],input')).filter(function(el){
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

