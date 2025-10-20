(function(){
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(prefersReduced){
    document.documentElement.classList.add('reduced-motion');
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    const sidebar = document.querySelector('.sidebar');
  // Đánh dấu link sidebar đang active khi cuộn, dùng IntersectionObserver
    try{
      const sideLinks = Array.from(document.querySelectorAll('.side-link'));
      const sections = sideLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
      if(sections.length){
        const mapLink = new Map(sections.map(s => [s.id, document.querySelector(`.side-link[href="#${s.id}"]`)]));
        // chọn phần hiển thị nhiều nhất trong mọi thay đổi và set active cho link tương ứng
        let clickLock = false;
        const LOCK_DURATION = 2000; // ms, thời gian giữ lock sau click
        const io = new IntersectionObserver((entries)=>{
          // lọc các mục đang hiển thị
          if(clickLock) return; // nếu đang lock (vừa click) thì không override
          const visible = entries.filter(e => e.isIntersecting);
          if(visible.length === 0) return;
          // chọn mục có intersectionRatio lớn nhất
          let top = visible.reduce((a,b) => a.intersectionRatio > b.intersectionRatio ? a : b);
          const id = top.target.id;
          const link = mapLink.get(id);
          if(!link) return;
          sideLinks.forEach(l=>l.classList.remove('active'));
          link.classList.add('active');
  }, { root: null, rootMargin: '0px', threshold: [0.5,0.75,1] });
        // bật observer cho từng section
        sections.forEach(s=> io.observe(s));

        // khi click vào link: scroll mượt tới section, set active cho link và card ngay lập tức
        sideLinks.forEach(a => a.addEventListener('click', (ev)=>{
          ev.preventDefault();
          const href = a.getAttribute('href');
          const target = document.querySelector(href);
          // cuộn mượt đến mục (nếu có)
          if(target && target.scrollIntoView){
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
          // set active cho link
          sideLinks.forEach(l=>l.classList.remove('active'));
          a.classList.add('active');
          //tạm thời để giữ trạng thái theo click
          clickLock = true;
          setTimeout(()=>{ clickLock = false }, LOCK_DURATION);
          // set active cho card tương ứng (thêm class .active lên .card chứa section)
          document.querySelectorAll('.card').forEach(c=> c.classList.remove('active'));
          if(target){
            const card = target.closest('.card');
            if(card) card.classList.add('active');
          }
        }));
      }
    }catch(e){ console.warn('Active sidebar observer failed', e) }
  });

// Lightbox: đơn giản, thân thiện (truy cập)
document.addEventListener('DOMContentLoaded', ()=>{
  const imgs = Array.from(document.querySelectorAll('.lightbox-img'));
  if(!imgs.length) return;

  // tạo overlay cho lightbox
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
