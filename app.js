(function(){
  var header=document.querySelector('.site-header');
  function onScroll(){header.classList.toggle('scrolled',window.scrollY>20)}
  window.addEventListener('scroll',onScroll,{passive:true});onScroll();

  var toggle=document.querySelector('.menu-toggle'), menu=document.querySelector('.mobile-menu');
  if(toggle&&menu){toggle.addEventListener('click',function(){var open=menu.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-hidden',String(!open))});menu.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){menu.classList.remove('open');toggle.setAttribute('aria-expanded','false');menu.setAttribute('aria-hidden','true')})})}

  if('IntersectionObserver' in window){var io=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}})},{threshold:.12});document.querySelectorAll('.reveal').forEach(function(el){io.observe(el)})}else{document.querySelectorAll('.reveal').forEach(function(el){el.classList.add('visible')})}

  function initTF(){if(!window.tf||!window.tf.createWidget){return setTimeout(initTF,200)}var c=document.getElementById('tf-container');if(!c)return;c.innerHTML='';window.tf.createWidget('01KVRJN19YZ8J86JFQYX9N09QG',{container:c,hideHeaders:true,hideFooter:true,inlineOnMobile:true})}
  initTF();

  var box=document.getElementById('consent'),KEY='psoydo-consent-v2';
  function show(){if(box){box.classList.add('show');box.setAttribute('aria-hidden','false')}}
  function hide(){if(box){box.classList.remove('show');box.setAttribute('aria-hidden','true')}}
  function loadAds(){if(document.getElementById('google-gtag'))return;var s=document.createElement('script');s.id='google-gtag';s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id=AW-18355213487';document.head.appendChild(s);window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments)};window.gtag('js',new Date());window.gtag('config','AW-18355213487')}
  var stored=null;try{stored=localStorage.getItem(KEY)}catch(e){}
  if(stored==='granted')loadAds();else if(stored!=='denied')setTimeout(show,900);
  var yes=document.getElementById('consent-accept'),no=document.getElementById('consent-decline'),reopen=document.getElementById('consent-reopen');
  if(yes)yes.addEventListener('click',function(){try{localStorage.setItem(KEY,'granted')}catch(e){}loadAds();hide()});
  if(no)no.addEventListener('click',function(){try{localStorage.setItem(KEY,'denied')}catch(e){}hide()});
  if(reopen)reopen.addEventListener('click',function(){show()});
})();