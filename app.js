(function(){
  var header=document.querySelector('.site-header');

  function onScroll(){
    if(header)header.classList.toggle('scrolled',window.scrollY>20);
  }
  window.addEventListener('scroll',onScroll,{passive:true});
  onScroll();

  var toggle=document.querySelector('.menu-toggle');
  var menu=document.querySelector('.mobile-menu');

  function setMenu(open){
    if(!toggle||!menu)return;
    menu.classList.toggle('open',open);
    toggle.setAttribute('aria-expanded',String(open));
    toggle.setAttribute('aria-label',open?'Menü schließen':'Menü öffnen');
    menu.setAttribute('aria-hidden',String(!open));
  }

  if(toggle&&menu){
    toggle.addEventListener('click',function(){
      setMenu(!menu.classList.contains('open'));
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
  }

  var revealElements=document.querySelectorAll('.reveal');
  var reduceMotion=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduceMotion||!('IntersectionObserver' in window)){
    revealElements.forEach(function(el){el.classList.add('visible');});
  }else{
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    },{threshold:.12});
    revealElements.forEach(function(el){io.observe(el);});
  }

  function initTF(attempt){
    var container=document.getElementById('tf-container');
    if(!container)return;
    if(window.tf&&window.tf.createWidget){
      container.innerHTML='';
      window.tf.createWidget('01KVRJN19YZ8J86JFQYX9N09QG',{
        container:container,
        hideHeaders:true,
        hideFooter:true,
        inlineOnMobile:true
      });
      return;
    }
    if(attempt<30){
      window.setTimeout(function(){initTF(attempt+1);},200);
      return;
    }
    container.innerHTML='<div class="form-loading">Registrierung konnte nicht geladen werden. Bitte lade die Seite neu.</div>';
  }
  initTF(0);

  var box=document.getElementById('consent');
  if(!box)return;

  var KEY='psoydo-consent-v2';

  function showConsent(){
    box.classList.add('show');
    box.setAttribute('aria-hidden','false');
  }

  function hideConsent(){
    box.classList.remove('show');
    box.setAttribute('aria-hidden','true');
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
})();
