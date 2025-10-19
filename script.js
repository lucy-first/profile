(function(){
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(prefersReduced){
    document.documentElement.classList.add('reduced-motion');
  }

  // Sidebar toggle for small screens (minimal JS)
  document.addEventListener('DOMContentLoaded', ()=>{
    const toggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');
    if(toggle && sidebar){
      toggle.addEventListener('click', ()=> sidebar.classList.toggle('open'));
    }

    // Close sidebar after clicking a link (mobile)
    document.querySelectorAll('.side-link').forEach(a=>{
      a.addEventListener('click', ()=>{ if(window.innerWidth <= 520) sidebar.classList.remove('open'); });
    });

    // Highlight active sidebar link while scrolling using IntersectionObserver
    try{
      const sideLinks = Array.from(document.querySelectorAll('.side-link'));
      const sections = sideLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
      if(sections.length){
        const mapLink = new Map(sections.map(s => [s.id, document.querySelector(`.side-link[href="#${s.id}"]`)]));
        const io = new IntersectionObserver((entries)=>{
          entries.forEach(entry => {
            const id = entry.target.id;
            const link = mapLink.get(id);
            if(!link) return;
            if(entry.isIntersecting && entry.intersectionRatio > 0.45){
              sideLinks.forEach(l=>l.classList.remove('active'));
              link.classList.add('active');
            }
          });
        }, { root: null, rootMargin: '0px', threshold: [0.45, 0.75] });
        sections.forEach(s=> io.observe(s));
      }
    }catch(e){ console.warn('Active sidebar observer failed', e) }
  });

// Lightbox: simple, accessible
document.addEventListener('DOMContentLoaded', ()=>{
  const imgs = Array.from(document.querySelectorAll('.lightbox-img'));
  if(!imgs.length) return;

  // create overlay
  const overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.innerHTML = '<img class="lightbox-img-view" alt="" />';
  document.body.appendChild(overlay);
  const view = overlay.querySelector('.lightbox-img-view');
  let current = -1;

  function open(i){
    current = i;
    view.src = imgs[i].src;
    view.alt = imgs[i].alt || '';
    overlay.classList.add('open');
    view.focus && view.focus();
  }
  function close(){ overlay.classList.remove('open'); current = -1 }

  imgs.forEach((img,i)=> img.addEventListener('click', ()=> open(i)));
  overlay.addEventListener('click', (e)=>{ if(e.target === overlay) close(); });
  document.addEventListener('keydown', (e)=>{
    if(overlay.classList.contains('open')){
      if(e.key === 'Escape') close();
      if(e.key === 'ArrowRight') open((current+1)%imgs.length);
      if(e.key === 'ArrowLeft') open((current-1+imgs.length)%imgs.length);
    }
  });
});
})();
