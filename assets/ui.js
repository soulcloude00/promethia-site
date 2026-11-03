(function(){
  var d=document, reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  // nav
  var nav=d.getElementById('nav'), burger=d.getElementById('burger'), menu=d.getElementById('menu');
  burger.addEventListener('click',function(){var o=menu.classList.toggle('open');burger.setAttribute('aria-expanded',o);burger.setAttribute('aria-label',o?'Close menu':'Open menu');});
  menu.addEventListener('click',function(e){if(e.target.closest('a')){menu.classList.remove('open');burger.setAttribute('aria-expanded','false');}});
  addEventListener('scroll',function(){nav.classList.toggle('scrolled',scrollY>10);},{passive:true});
  // reveal
  var rv=d.querySelectorAll('.reveal');
  if(!('IntersectionObserver' in window)||reduce){rv.forEach(function(e){e.classList.add('in')});}
  else{var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){var el=e.target,sib=[].indexOf.call(el.parentNode.children,el);el.style.transitionDelay=Math.min(sib,5)*70+'ms';el.classList.add('in');io.unobserve(el);}})},{threshold:.12,rootMargin:'0px 0px -40px 0px'});rv.forEach(function(e){io.observe(e)});}
  var pf=d.querySelector('.pf');if(pf){new IntersectionObserver(function(es,o){if(es[0].isIntersecting){pf.classList.add('in');o.disconnect();}},{threshold:.3}).observe(pf);}
  // flip cards
  d.querySelectorAll('.card').forEach(function(c){c.addEventListener('click',function(){c.setAttribute('aria-pressed',c.getAttribute('aria-pressed')!=='true');});});
  // tabs
  var tabs=[].slice.call(d.querySelectorAll('[role=tab]'));
  function sel(t,focus){tabs.forEach(function(x){var on=x===t;x.setAttribute('aria-selected',on);x.tabIndex=on?0:-1;d.getElementById(x.getAttribute('aria-controls')).hidden=!on;});if(focus)t.focus();}
  tabs.forEach(function(t,i){t.addEventListener('click',function(){sel(t)});t.addEventListener('keydown',function(e){var k=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;if(k){e.preventDefault();sel(tabs[(i+k+tabs.length)%tabs.length],true);}});});
  function fromHash(){var id=location.hash.slice(1),t=tabs.filter(function(x){return x.getAttribute('aria-controls')===id})[0];if(t){sel(t);setTimeout(function(){d.getElementById('for').scrollIntoView({behavior:reduce?'auto':'smooth'})},0);}}
  addEventListener('hashchange',fromHash);fromHash();
  // Promo guide
  var g=d.getElementById('guide'),tip=d.getElementById('guideTip'),btn=d.getElementById('guideBtn'),cur='';
  btn.addEventListener('click',function(){var off=g.classList.toggle('off');btn.setAttribute('aria-pressed',!off);btn.setAttribute('aria-label',off?"Show Promo's tips":"Hide Promo's tips");});
  if('IntersectionObserver' in window){var so=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){var t=e.target.getAttribute('data-tip');if(t&&t!==cur){cur=t;tip.classList.add('swap');setTimeout(function(){tip.textContent=t;tip.classList.remove('swap');},200);}}})},{rootMargin:'-45% 0px -45% 0px'});
    d.querySelectorAll('[data-tip]').forEach(function(s){so.observe(s)});}
  if(innerWidth<600)setTimeout(function(){if(!g.classList.contains('off')){g.classList.add('off');btn.setAttribute('aria-pressed','false');btn.setAttribute('aria-label',"Show Promo's tips");}},6000);
})();
