
    (function(){
      var secs=[].slice.call(document.querySelectorAll('.st-focus'));
      if(!secs.length)return;
      secs.forEach(function(sec){
        var p=sec.querySelector('.st-focus__text');if(!p)return;
        var words=[].slice.call(p.querySelectorAll('.st-focus__w'));
        var corners=[].slice.call(p.querySelectorAll('.st-focus__c'));
        var n=words.length;if(!n)return;
        var fade=sec.classList.contains('st-focus--fade');
        var boxes=[],corner=0,active=-1,raf=null,rt=null,ctx=null;
        try{ctx=document.createElement('canvas').getContext('2d')}catch(e){}
        function num(v,d){return typeof v==='number'&&!isNaN(v)?v:d}
        function measure(){
          var cs=getComputedStyle(p),fs=parseFloat(cs.fontSize)||16,ls=parseFloat(cs.letterSpacing)||0,pad=.08*fs;
          corner=.2*fs;
          sec.style.setProperty('--st-focus-thick',Math.max(1,Math.round(.04*fs))+'px');
          if(ctx)ctx.font=cs.fontStyle+' '+cs.fontWeight+' '+cs.fontSize+' '+cs.fontFamily;
          boxes=words.map(function(w){
            var m=ctx?ctx.measureText(w.textContent):null;
            var width=m?m.width:w.offsetWidth;
            var asc=m?num(m.fontBoundingBoxAscent,.8*fs):.8*fs,desc=m?num(m.fontBoundingBoxDescent,.2*fs):.2*fs;
            var aAsc=m?num(m.actualBoundingBoxAscent,asc):asc,aDesc=m?num(m.actualBoundingBoxDescent,desc):desc;
            var aL=m?num(m.actualBoundingBoxLeft,0):0,aR=m?num(m.actualBoundingBoxRight,width):width;
            var base=w.offsetTop+(w.offsetHeight-asc-desc)/2+asc;
            var x0=w.offsetLeft-aL,x1=w.offsetLeft+w.offsetWidth-ls-(width-aR);
            return{x:x0-1.5*pad,y:base-aAsc-pad,w:(x1-x0)+3*pad,h:aAsc+aDesc+2*pad};
          });
        }
        function progress(){var r=sec.getBoundingClientRect(),total=sec.offsetHeight-window.innerHeight;if(total<=0)return 0;return Math.min(1,Math.max(0,-r.top/total))}
        function indexFor(pr){return Math.min(n-1,Math.floor(pr*n))}
        function place(i,instant,prev){
          var b=boxes[i];if(!b)return;
          var dx=prev>=0&&boxes[prev]?b.x-boxes[prev].x:0;
          var xs=[b.x,b.x+b.w-corner,b.x,b.x+b.w-corner],ys=[b.y,b.y,b.y+b.h-corner,b.y+b.h-corner];
          corners.forEach(function(c,k){
            var trailing=dx!==0&&((dx>0)!==(k%2===1));
            c.style.transitionDelay=(!instant&&trailing)?'.04s':'0s';
            c.style.transform='translate3d('+xs[k]+'px,'+ys[k]+'px,0)';
          });
        }
        function go(i,instant){
          if(i===active)return;
          var prev=active;active=i;
          if(instant){sec.classList.add('st-focus--instant');void sec.offsetWidth}
          words.forEach(function(w,j){
            if(j===i)w.classList.add('is-on');else w.classList.remove('is-on');
            var d=Math.min(1,Math.abs(j-i)/3);
            w.style.setProperty('--d',String(fade?Math.sqrt(d):d));
          });
          place(i,instant,prev);
          if(instant)requestAnimationFrame(function(){sec.classList.remove('st-focus--instant')});
        }
        function apply(){measure();active=-1;go(indexFor(progress()),true)}
        function onScroll(){if(raf)return;raf=requestAnimationFrame(function(){raf=null;go(indexFor(progress()),false)})}
        window.addEventListener('scroll',onScroll,{passive:true});
        window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(apply,150)});
        apply();
        if(document.fonts&&document.fonts.ready)document.fonts.ready.then(apply);
        window.addEventListener('load',apply);
      });
    })();
    
    (function(){
      var secs=[].slice.call(document.querySelectorAll('.st-strip'));
      if(!secs.length)return;
      var reduced=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      var mqc=window.matchMedia('(hover: none), (pointer: coarse)'),mqm=window.matchMedia('(max-width: 767px)');
      function bez(x1,y1,x2,y2){
        function A(a1,a2){return 1-3*a2+3*a1}function B(a1,a2){return 3*a2-6*a1}function C(a1){return 3*a1}
        function calc(t,a1,a2){return ((A(a1,a2)*t+B(a1,a2))*t+C(a1))*t}
        function slope(t,a1,a2){return 3*A(a1,a2)*t*t+2*B(a1,a2)*t+C(a1)}
        return function(x){if(x<=0)return 0;if(x>=1)return 1;var t=x;for(var i=0;i<8;i++){var s=slope(t,x1,x2);if(s<1e-6)break;t-=(calc(t,x1,x2)-x)/s}return calc(t,y1,y2)}
      }
      var inOut=bez(.7,0,.16,1),out=bez(.3,.9,.1,1);
      var tweens=[],raf=null;
      function tick(){
        var now=performance.now(),i=tweens.length;
        while(i--){var t=tweens[i],p=(now-t.start)/t.dur;if(p<0)continue;if(p>=1){t.set(t.to);tweens.splice(i,1);if(t.done)t.done();continue}t.set(t.from+(t.to-t.from)*t.ease(p))}
        raf=tweens.length?requestAnimationFrame(tick):null;
      }
      function kill(key){for(var i=tweens.length;i--;)if(tweens[i].key===key)tweens.splice(i,1)}
      function tween(key,from,to,dur,ease,delay,set,done){
        kill(key);
        if(reduced||dur<=0||from===to){set(to);if(done)done();return}
        tweens.push({key:key,from:from,to:to,dur:dur*1000,start:performance.now()+(delay||0)*1000,ease:ease,set:set,done:done});
        if(!raf)raf=requestAnimationFrame(tick);
      }
      secs.forEach(function(sec){
        var panels=[].slice.call(sec.querySelectorAll('.st-strip__panel'));
        var n=panels.length;if(n<2)return;
        var imgs=panels.map(function(p){return p.querySelector('.st-strip__img')});
        var shades=panels.map(function(p){return p.querySelector('.st-strip__shade')});
        var scrims=panels.map(function(p){return p.querySelector('.st-strip__scrim')});
        var vls=panels.map(function(p){return p.querySelector('.st-strip__vlabel-in')});
        var tis=panels.map(function(p){return p.querySelector('.st-strip__title-in')});
        var las=panels.map(function(p){return p.querySelector('.st-strip__label-in')});
        function num(a,d){var v=parseFloat(a);return isNaN(v)?d:v}
        var expand=num(sec.getAttribute('data-expand'),4),zoom=num(sec.getAttribute('data-zoom'),1.25),dim=num(sec.getAttribute('data-dim'),.5),blur=num(sec.getAttribute('data-blur'),4),bright=num(sec.getAttribute('data-bright'),.82);
        var MIN=.6,FALL=.7,PAN=6,D=.55;
        var coarse=mqc.matches,mobile=mqm.matches,active=-1,rt=null,lastFocus=-1,lastFocusAt=0;
        var id=sec.getAttribute('data-element-id')||String(Math.random());
        var cur=panels.map(function(){return{g:1,s:zoom,px:0,py:0,b:0,a:1-bright,v:110,t:110,l:110,sc:0}});
        var shown=panels.map(function(){return false});
        function q(i){if(active<0)return 0;if(i===active)return 1;var d=i-active;return Math.exp(-d*d/(2*FALL*FALL))}
        function paint(i){var c=cur[i];panels[i].style.flexGrow=String(c.g);if(imgs[i])imgs[i].style.transform='translate3d('+c.px+'%,'+c.py+'%,0) scale('+c.s+')';if(shades[i]){shades[i].style.setProperty('--st-strip-blur',c.b+'px');shades[i].style.backgroundColor='rgba(10,10,10,'+c.a+')'}}
        function reveal(i){
          if(shown[i])return;shown[i]=true;var c=cur[i];
          tween(id+'t'+i,c.t,0,.5,out,.08,function(v){c.t=v;if(tis[i])tis[i].style.transform='translateY('+v+'%)'});
          tween(id+'l'+i,c.l,0,.5,out,.12,function(v){c.l=v;if(las[i])las[i].style.transform='translateY('+v+'%)'});
          tween(id+'sc'+i,c.sc,1,.7*D,out,0,function(v){c.sc=v;if(scrims[i])scrims[i].style.opacity=String(v)});
        }
        function hide(i){
          if(!shown[i])return;shown[i]=false;var c=cur[i];
          tween(id+'t'+i,c.t,110,.28,out,0,function(v){c.t=v;if(tis[i])tis[i].style.transform='translateY('+v+'%)'});
          tween(id+'l'+i,c.l,110,.28,out,0,function(v){c.l=v;if(las[i])las[i].style.transform='translateY('+v+'%)'});
          tween(id+'sc'+i,c.sc,0,.28,out,0,function(v){c.sc=v;if(scrims[i])scrims[i].style.opacity=String(v)});
        }
        function textTick(){for(var i=0;i<n;i++){var norm=(cur[i].g-MIN)/(expand-MIN);if(i===active&&norm>=.7)reveal(i);else if(i!==active&&shown[i])hide(i)}}
        function setActive(i){
          if(i===active)return;active=i;
          for(var k=0;k<n;k++)(function(k){
            var c=cur[k],qq=q(k);
            var g=active<0?1:MIN+(expand-MIN)*qq,s=active<0?zoom:zoom-(zoom-1)*qq;
            var pan=(active<0||k===active)?0:(k<active?-1:1)*PAN*(1-qq);
            var px=mobile?0:pan,py=mobile?pan:0;
            var b=active<0?0:blur*(1-qq),a=active<0?1-bright:dim*(1-qq);
            tween(id+'g'+k,c.g,g,D,inOut,0,function(v){c.g=v;paint(k);textTick()});
            tween(id+'s'+k,c.s,s,D,inOut,0,function(v){c.s=v;paint(k)});
            tween(id+'px'+k,c.px,px,D,inOut,0,function(v){c.px=v;paint(k)});
            tween(id+'py'+k,c.py,py,D,inOut,0,function(v){c.py=v;paint(k)});
            tween(id+'b'+k,c.b,b,D,inOut,0,function(v){c.b=v;paint(k)});
            tween(id+'a'+k,c.a,a,D,inOut,0,function(v){c.a=v;paint(k)});
            var vx=(active>=0&&k===active)?110:0;
            tween(id+'v'+k,c.v,vx,.7*D,inOut,0,function(v){c.v=v;if(vls[k])vls[k].style.transform='translateX('+v+'%)'});
          })(k);
          textTick();
        }
        panels.forEach(function(p,i){
          p.addEventListener('pointerenter',function(){if(!coarse)setActive(i)});
          p.addEventListener('focus',function(){lastFocus=i;lastFocusAt=performance.now();setActive(i)});
          p.addEventListener('click',function(e){
            if(!coarse)return;e.preventDefault();
            // A tap that just focused (and so opened) this panel must not close it again.
            if(active===i&&lastFocus===i&&performance.now()-lastFocusAt<400)return;
            setActive(active===i?-1:i);
          });
          p.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();setActive(active===i?-1:i)}});
        });
        sec.addEventListener('pointerleave',function(){if(!coarse)setActive(-1)});
        sec.addEventListener('focusout',function(e){if(!sec.contains(e.relatedTarget))setActive(-1)});
        sec.addEventListener('keydown',function(e){
          var nx=e.key==='ArrowRight'||e.key==='ArrowDown',pv=e.key==='ArrowLeft'||e.key==='ArrowUp';
          if(!nx&&!pv)return;e.preventDefault();
          var base=active<0?0:active,t=nx?Math.min(n-1,base+(active<0?0:1)):Math.max(0,base-(active<0?0:1));
          setActive(t);panels[t].focus();
        });
        window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){coarse=mqc.matches;var m=mqm.matches;if(m!==mobile){mobile=m;setActive(-1)}},150)});
        panels.forEach(function(p,i){paint(i);if(tis[i])tis[i].style.transform='translateY(110%)';if(las[i])las[i].style.transform='translateY(110%)';if(scrims[i])scrims[i].style.opacity='0';if(vls[i])vls[i].style.transform='translateX(110%)'});
        panels.forEach(function(p,i){tween(id+'v'+i,110,0,.9,out,.2+i*.06,function(v){cur[i].v=v;if(vls[i])vls[i].style.transform='translateX('+v+'%)'})});
      });
    })();
    
/* verification section: reveal when scrolled into view */
(function(){
  var el=document.querySelector('.tv'); if(!el)return;
  if(!('IntersectionObserver' in window)){el.classList.add('in');return;}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){el.classList.add('in');io.disconnect();}});},{threshold:.18});
  io.observe(el);
})();
