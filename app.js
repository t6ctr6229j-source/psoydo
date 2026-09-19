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
          if(typeof window.gtag==='function'){
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

  function loadAds(){
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
