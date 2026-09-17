(function(){
  var polish=document.createElement('link');
  polish.rel='stylesheet';
  polish.href='../polish.css';
  document.head.appendChild(polish);

  function addArchitecture(){
    if(document.getElementById('architecture'))return;
    var security=document.getElementById('security');
    if(!security)return;
    var section=document.createElement('section');
    section.className='architecture light-section';
    section.id='architecture';
    section.innerHTML='\
      <div class="shell architecture-heading">\
        <div class="section-index">05 / ARCHITEKTUR</div>\
        <div>\
          <span class="arch-kicker">Die entscheidende Frage ist nicht, welches Modell du nutzt.</span>\
          <h2>Die entscheidende Frage ist:<br><span>Was verlässt deine Schutzgrenze?</span></h2>\
          <p class="large-copy">Psoydo hält Originaldaten, Zuordnung und Rückübersetzung dort, wo du sie kontrollierst. Externe KI-Systeme erhalten nur den pseudonymisierten Arbeitskontext.</p>\
        </div>\
      </div>\
      <div class="shell architecture-board reveal">\
        <div class="arch-zone trusted-zone">\
          <div class="arch-zone-head"><span>DEINE UMGEBUNG</span><b>VERTRAUENSZONE</b></div>\
          <div class="arch-card original-card"><small>01</small><strong>Originaldaten</strong><span>Verträge · HR · Tickets · Logs</span></div>\
          <div class="arch-card psoydo-card"><small>02</small><strong>Psoydo</strong><span>Erkennung · Mapping · Review</span></div>\
          <div class="arch-vault"><span class="vault-dot"></span><div><strong>Lokales Mapping</strong><small>Original ↔ Pseudonym</small></div><em>unter deiner Kontrolle</em></div>\
        </div>\
        <div class="arch-boundary">\
          <span>DEINE SCHUTZGRENZE</span><i></i><i></i>\
        </div>\
        <div class="arch-zone external-zone">\
          <div class="arch-zone-head"><span>KI-SYSTEM</span><b>FREI WÄHLBAR</b></div>\
          <div class="arch-card payload-card"><small>03</small><strong>Pseudonymisierter Kontext</strong><span>PERSON_041 · ORT_003 · UNTERNEHMEN_018</span></div>\
          <div class="arch-models"><span>GPT</span><span>Claude</span><span>Gemini</span><span>weitere</span></div>\
          <div class="arch-card result-card"><small>04</small><strong>KI-Ergebnis</strong><span>ohne Kenntnis der Originalidentitäten</span></div>\
        </div>\
      </div>\
      <div class="shell architecture-facts reveal">\
        <div><span>01</span><strong>Originale verlassen die Zone nicht</strong><p>Die eigentlichen Identitäten bleiben in deiner Umgebung.</p></div>\
        <div><span>02</span><strong>Die Zuordnung bleibt kontrolliert</strong><p>Das Mapping zwischen Original und Pseudonym bleibt innerhalb deiner kontrollierten Umgebung.</p></div>\
        <div><span>03</span><strong>Das Modell bleibt austauschbar</strong><p>Du wählst die KI nach Eignung für den Use Case und nicht nach der Sensibilität der Identitäten.</p></div>\
      </div>';
    security.parentNode.insertBefore(section,security);
  }

  function polishCopy(){
    var desktop=document.querySelector('.desktop-nav');
    if(desktop&&!desktop.querySelector('a[href="#architecture"]')){
      var link=document.createElement('a');link.href='#architecture';link.textContent='Architektur';
      var securityLink=desktop.querySelector('a[href="#security"]');desktop.insertBefore(link,securityLink);
    }
    var mobile=document.querySelector('.mobile-menu');
    if(mobile&&!mobile.querySelector('a[href="#architecture"]')){
      var m=document.createElement('a');m.href='#architecture';m.textContent='Architektur';
      var ms=mobile.querySelector('a[href="#security"]');mobile.insertBefore(m,ms);
    }

    var eyebrow=document.querySelector('.hero .eyebrow');
    if(eyebrow)eyebrow.innerHTML='<span class="signal"></span> Schutzschicht für Enterprise AI';
    var lead=document.querySelector('.hero-lead');
    if(lead)lead.innerHTML='Psoydo trennt Identität von Kontext, <strong>bevor</strong> sensible Inhalte ein externes KI-System erreichen. So kann dein Unternehmen leistungsfähige Modelle nutzen, ohne echte Personen- und Unternehmensbezüge offenzulegen.';
    var proof=document.querySelectorAll('.proof-row span');
    if(proof.length>=3){proof[0].textContent='Originaldaten lokal';proof[1].textContent='Mapping unter eigener Kontrolle';proof[2].textContent='KI frei wählbar';}
    var bottom=document.querySelectorAll('.hero-bottom p');
    if(bottom.length>=2){bottom[0].textContent='Die leistungsfähigsten Modelle sind längst da.';bottom[1].innerHTML='Was fehlt, ist eine <strong>sichere Datengrenze.</strong>';}

    var cases=document.querySelectorAll('.case-card p');
    if(cases.length>=3){
      cases[0].textContent='2.400 Kunden- und Lieferantenverträge mit Claude oder GPT analysieren. Namen, Ansprechpartner und andere personenbezogene Bezüge bleiben dabei innerhalb der eigenen Schutzgrenze.';
      cases[1].textContent='Ein Jahr Mitarbeitergespräche, Feedback und HR-Dokumentation gemeinsam auswerten. Das Modell erkennt Muster, ohne zu erfahren, welche reale Person hinter PERSON_041 steckt.';
      cases[2].textContent='SIEM-Meldungen, Tickets und technische Logs modellübergreifend korrelieren. Nutzer-, IP- und Systembezüge bleiben konsistent analysierbar, ohne reale Zuordnungen offenzulegen.';
    }

    var sec=document.getElementById('security');
    if(sec){
      var idx=sec.querySelector('.section-index');if(idx)idx.textContent='06 / SECURITY BY ORIGIN';
      var securityArticles=sec.querySelectorAll('.security-list article');
      if(securityArticles.length>=4){
        var h=securityArticles[3].querySelector('h3'),p=securityArticles[3].querySelector('p');
        if(h)h.textContent='Revisionsfähige Prozesse';
        if(p)p.textContent='Dokumentierte Verarbeitungsschritte und geeignete Protokollierung können nachvollziehbare, revisionsfähige KI-Prozesse unterstützen.';
      }
    }
    var dep=document.getElementById('deployment');if(dep){var di=dep.querySelector('.section-index');if(di)di.textContent='07 / BETRIEB';}
    var reg=document.getElementById('register');
    if(reg){
      var ri=reg.querySelector('.section-index');if(ri)ri.textContent='08 / REGISTRIERUNG';
      var h2=reg.querySelector('.register-copy h2');if(h2)h2.innerHTML='Psoydo für dein Unternehmen<br><span>registrieren.</span>';
      var rp=reg.querySelector('.register-copy > p');if(rp)rp.textContent='Kein Newsletter und keine Warteliste. Du registrierst dein Unternehmen mit einem konkreten KI-Use-Case. Wir prüfen, welche Betriebsform und welcher Integrationsweg dazu passen.';
      var points=reg.querySelector('.registration-points');
      if(points)points.innerHTML='<span><i>1</i> Organisation registrieren</span><span><i>2</i> Use Case einordnen</span><span><i>3</i> Technischen nächsten Schritt festlegen</span>';
      if(!reg.querySelector('.registration-note')&&points){
        var note=document.createElement('div');note.className='registration-note';note.innerHTML='<strong>Was danach passiert</strong><span>Wir melden uns mit einer konkreten Einschätzung statt mit einer automatisierten Sales-Sequenz.</span>';points.insertAdjacentElement('afterend',note);
      }
    }
  }

  addArchitecture();
  polishCopy();

  var header=document.querySelector('.site-header');
  function onScroll(){if(header)header.classList.toggle('scrolled',window.scrollY>20)}
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