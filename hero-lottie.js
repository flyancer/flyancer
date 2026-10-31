(function(){
  var el=document.getElementById('hlAnim'); if(!el) return;
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  function start(){
    if(!window.lottie) return;
    var a=lottie.loadAnimation({container:el,renderer:'svg',loop:true,autoplay:!reduce,path:'assets/business.json',
      rendererSettings:{preserveAspectRatio:'xMidYMid meet',progressiveLoad:true}});
    if(reduce){a.addEventListener('DOMLoaded',function(){a.goToAndStop(60,true)});return;}
    a.setSpeed(0.85);
    if('IntersectionObserver' in window){
      new IntersectionObserver(function(e){e[0].isIntersecting?a.play():a.pause()},{threshold:.1}).observe(el);
    }
    window.__hlAnim=a;
  }
  if(window.lottie) start(); else window.addEventListener('load',start);
})();
