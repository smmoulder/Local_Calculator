// Apply before first paint. Theme preference is independent of calculator reset.
(()=>{
 const key='local-ai-theme';
 let theme='dark';
 try{if(localStorage.getItem(key)==='light')theme='light'}catch{}
 document.documentElement.dataset.theme=theme;
 function sync(){document.querySelectorAll('[data-theme-choice]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.themeChoice===theme)))}
 document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('[data-theme-choice]').forEach(button=>button.addEventListener('click',()=>{
   theme=button.dataset.themeChoice==='light'?'light':'dark';
   document.documentElement.dataset.theme=theme;
   try{localStorage.setItem(key,theme)}catch{}
   sync();
  }));
  sync();
 });
})();
