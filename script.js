/* ══════════════════════════════════════════════════════════════
   AUTH — UTG-only login
   This is a CLIENT-SIDE DEMO of access control, suitable for an
   HCI / front-end coursework project. There is no real backend:
   "accounts" are simply stored in localStorage, and the only rule
   we enforce is that the email must end with @utg.edu.gm.
   In a production system this check would happen on a server.
══════════════════════════════════════════════════════════════ */
const ALLOWED_DOMAIN='@utg.edu.gm';   // only this domain may register/login
const USERS_KEY='utg_users';          // localStorage: list of registered accounts
const SESSION_KEY='utg_session';      // localStorage: email of the logged-in user

// All registered users, e.g. [{name,email,studentId,password}]
function getUsers(){
  try{ return JSON.parse(localStorage.getItem(USERS_KEY)||'[]'); }
  catch{ return []; }
}
function saveUsers(arr){ localStorage.setItem(USERS_KEY,JSON.stringify(arr)); }

// The currently logged-in user object, or null if nobody is logged in.
function currentUser(){
  const email=localStorage.getItem(SESSION_KEY);
  if(!email)return null;
  return getUsers().find(u=>u.email===email)||null;
}

// A valid UTG email: normal email shape AND ends with @utg.edu.gm.
function isUtgEmail(email){
  email=email.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.endsWith(ALLOWED_DOMAIN);
}

// Switch between the "Sign in" and "Create account" tabs on the auth card.
function setAuthTab(tab){
  document.getElementById('tabLogin').classList.toggle('on',tab==='login');
  document.getElementById('tabSignup').classList.toggle('on',tab==='signup');
  document.getElementById('formLogin').style.display=tab==='login'?'block':'none';
  document.getElementById('formSignup').style.display=tab==='signup'?'block':'none';
}

// Small helper to show/hide one inline auth error message.
function authError(id,msg){
  const el=document.getElementById(id);
  if(!el)return;
  el.textContent=msg;
  el.classList.toggle('show',!!msg);
}

// SIGN UP — creates a new local account, but only for @utg.edu.gm emails.
function doSignup(){
  const name=document.getElementById('su-name').value.trim();
  const email=document.getElementById('su-email').value.trim().toLowerCase();
  const sid=document.getElementById('su-id').value.trim();
  const pass=document.getElementById('su-pass').value;

  authError('su-err','');
  if(!name){ authError('su-err','Please enter your full name.'); return; }
  if(!isUtgEmail(email)){ authError('su-err',`Access restricted — please use your UTG student email (ends in ${ALLOWED_DOMAIN}).`); return; }
  if(pass.length<4){ authError('su-err','Password must be at least 4 characters.'); return; }
  const users=getUsers();
  if(users.some(u=>u.email===email)){ authError('su-err','An account with this email already exists. Please sign in.'); return; }

  users.push({name,email,studentId:sid,password:pass});
  saveUsers(users);
  localStorage.setItem(SESSION_KEY,email);
  showToast(`Welcome, ${name.split(' ')[0]}! Account created.`,'ok');
  enterApp();
}

// SIGN IN — checks the email belongs to the UTG domain and matches a stored account.
function doLogin(){
  const email=document.getElementById('li-email').value.trim().toLowerCase();
  const pass=document.getElementById('li-pass').value;

  authError('li-err','');
  if(!isUtgEmail(email)){ authError('li-err',`Access restricted — please use your UTG student email (ends in ${ALLOWED_DOMAIN}).`); return; }
  const user=getUsers().find(u=>u.email===email);
  if(!user || user.password!==pass){ authError('li-err','Incorrect email or password.'); return; }

  localStorage.setItem(SESSION_KEY,email);
  showToast(`Welcome back, ${user.name.split(' ')[0]}!`,'ok');
  enterApp();
}

// LOG OUT — clears the session and returns to the login screen.
function doLogout(){
  localStorage.removeItem(SESSION_KEY);
  document.getElementById('authGate').style.display='flex';
  document.getElementById('appRoot').style.display='none';
  showToast('Logged out','info');
}

// Reveal the main app and hide the login gate; refresh the user pill in the nav.
function enterApp(){
  document.getElementById('authGate').style.display='none';
  document.getElementById('appRoot').style.display='block';
  paintUserPill();
  updateBmCount();
  renderHome();
}

// Show the logged-in student's initial + name in the nav bar.
function paintUserPill(){
  const u=currentUser();
  const pill=document.getElementById('navUserPill');
  if(!u||!pill)return;
  pill.innerHTML=`<span class="av">${u.name.charAt(0).toUpperCase()}</span>${u.name.split(' ')[0]}<button onclick="doLogout()">Sign out</button>`;
}

// On page load: if a session already exists, skip the login page entirely.
function checkAuthOnLoad(){
  if(currentUser()){ enterApp(); }
  else { setAuthTab('login'); }
}

/* ══════════════════════════════════════════════════
   DATA
══════════════════════════════════════════════════ */
const NOW = Date.now();
const DAY = 86400000;

const BASE_OPPS = [
  {id:1,title:"Software Development Intern",org:"Gamtel",loc:"Banjul",locTag:"banjul",type:"internship",field:"Technology",deadline:new Date(NOW+4*DAY),remote:false,paid:true,desc:"Join Gamtel's IT department for a 3-month internship working on real telecom infrastructure projects and web applications."},
  {id:2,title:"Commonwealth Masters Scholarship",org:"Commonwealth Secretariat",loc:"United Kingdom",locTag:"international",type:"scholarship",field:"All Fields",deadline:new Date(NOW+18*DAY),remote:false,paid:true,desc:"Fully funded masters scholarships for Commonwealth students. Covers tuition, accommodation, flights, and stipend."},
  {id:3,title:"Data Science Bootcamp",org:"AfricanDev Initiative",loc:"Remote",locTag:"remote",type:"workshop",field:"Technology",deadline:new Date(NOW+7*DAY),remote:true,paid:false,desc:"6-week intensive bootcamp covering Python, data analysis, and machine learning. Certificate on completion. Fully online."},
  {id:4,title:"YALI Mandela Washington Fellowship",org:"U.S. Embassy Banjul",loc:"USA",locTag:"international",type:"scholarship",field:"Leadership",deadline:new Date(NOW+22*DAY),remote:false,paid:true,desc:"Young African Leaders Initiative — fully funded fellowship for emerging African leaders in business, civic, and public management."},
  {id:5,title:"ECOWAS Graphic Design Competition",org:"ECOWAS Youth Hub",loc:"Remote",locTag:"remote",type:"competition",field:"Arts & Design",deadline:new Date(NOW+12*DAY),remote:true,paid:false,desc:"Design the official ECOWAS 2025 Youth Summit poster. Prize: $500 + recognition across West Africa. Open to all students."},
  {id:6,title:"UTG Business Plan Competition",org:"UTG Entrepreneurship Club",loc:"UTG Campus",locTag:"banjul",type:"competition",field:"Business",deadline:new Date(NOW+9*DAY),remote:false,paid:false,desc:"Pitch your business idea to a panel of investors. Top 3 teams receive seed funding up to D50,000. Teams of 2–4."},
  {id:7,title:"Healthcare Administration Intern",org:"Ministry of Health Gambia",loc:"Banjul",locTag:"banjul",type:"internship",field:"Healthcare",deadline:new Date(NOW+14*DAY),remote:false,paid:false,desc:"Support the health admin team on policy research, data collection, and community health outreach projects. 3-month placement."},
  {id:8,title:"Climate Action Student Grant",org:"Green Climate Fund",loc:"Remote",locTag:"remote",type:"grant",field:"Environment",deadline:new Date(NOW+30*DAY),remote:true,paid:true,desc:"Funding for student-led environmental projects in West Africa. Grants from $1,000 to $10,000. Apply with a project proposal."},
  {id:9,title:"Community Literacy Volunteer",org:"Gambia Reads NGO",loc:"Greater Banjul Area",locTag:"banjul",type:"volunteer",field:"Education",deadline:new Date(NOW+5*DAY),remote:false,paid:false,desc:"Teach reading and writing to adults and children in underserved communities on weekend mornings. Training provided."},
  {id:10,title:"Public Health Research Fellowship",org:"MRC The Gambia",loc:"Fajara",locTag:"banjul",type:"internship",field:"Healthcare",deadline:new Date(NOW+25*DAY),remote:false,paid:true,desc:"Join MRC's infectious disease research team. Open to final-year biology and public health students. Stipend included."},
  {id:11,title:"Mobile App Hackathon",org:"GamCode",loc:"Serrekunda",locTag:"banjul",type:"competition",field:"Technology",deadline:new Date(NOW+3*DAY),remote:false,paid:false,desc:"48-hour hackathon to build apps solving local challenges. Teams up to 4. Cash prizes and 3-month mentorship for top teams."},
  {id:12,title:"Digital Journalism Workshop",org:"Gambia Press Union",loc:"Banjul",locTag:"banjul",type:"workshop",field:"Media",deadline:new Date(NOW+16*DAY),remote:false,paid:false,desc:"2-day workshop on digital journalism, fact-checking, and investigative reporting. Certificate issued. Open to all students."},
];

/* ══════════════════════════════════════════════════
   USER-ADDED OPPORTUNITIES (localStorage)
   Anyone logged in can post a new opportunity from the
   "Post Opportunity" page. We never touch BASE_OPPS —
   instead we keep a separate array in localStorage and
   merge the two every time we need the full list.
══════════════════════════════════════════════════ */
const OPPS_KEY='utg_custom_opps';

// Read the array of user-submitted opportunities from localStorage.
// Wrapped in try/catch because localStorage can contain bad/old JSON.
function getCustomOpps(){
  try{ return JSON.parse(localStorage.getItem(OPPS_KEY)||'[]'); }
  catch{ return []; }
}

// Persist the full array of user-submitted opportunities.
function saveCustomOpps(arr){
  localStorage.setItem(OPPS_KEY,JSON.stringify(arr));
}

// Combine the built-in demo data with whatever students have
// added through the Post Opportunity form. Custom items keep
// their `deadline` as an ISO string in storage, so we convert
// it back into a Date object here for the rest of the app.
function getAllOpps(){
  const custom=getCustomOpps().map(o=>({...o,deadline:new Date(o.deadline)}));
  return [...custom,...BASE_OPPS];
}

// Add one new opportunity, owned by the currently logged-in user.
function addOpportunity(opp){
  const list=getCustomOpps();
  const id='c'+Date.now();           // simple unique id, prefixed so it never collides with BASE_OPPS numeric ids
  list.unshift({
    id,
    ...opp,
    deadline:opp.deadline,           // already an ISO date string from <input type="date">
    postedBy: currentUser()?.email || 'unknown',
    createdAt: Date.now()
  });
  saveCustomOpps(list);
  return id;
}

// Remove an opportunity the current user posted (only their own).
function deleteMyOpportunity(id){
  const list=getCustomOpps().filter(o=>o.id!==id);
  saveCustomOpps(list);
}

/* ══════════════════════════════════════════════════
   UTILS
══════════════════════════════════════════════════ */
function daysLeft(d){return Math.ceil((new Date(d)-new Date())/DAY)}
function fmtDate(d){return new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}
function dlClass(n){if(n<=5)return'urgent';if(n<=10)return'soon';return''}
function getBookmarks(){try{return JSON.parse(localStorage.getItem('utg_bm')||'[]')}catch{return[]}}
function saveBookmarks(a){localStorage.setItem('utg_bm',JSON.stringify(a))}
function toggleBm(id){
  id=String(id);
  let a=getBookmarks().map(String);
  const had=a.includes(id);
  a=had?a.filter(x=>x!==id):[...a,id];
  saveBookmarks(a);updateBmCount();
  return !had;
}
function isBm(id){return getBookmarks().map(String).includes(String(id))}

function updateBmCount(){
  const n=getBookmarks().length;
  const el=document.getElementById('bmCount');
  if(el){el.textContent=n;el.style.display=n?'inline-flex':'none'}
}

/* ══════════════════════════════════════════════════
   CARD RENDERER
══════════════════════════════════════════════════ */
function makeCard(opp){
  const days=daysLeft(opp.deadline);
  const saved=isBm(opp.id);
  const dc=dlClass(days);
  const card=document.createElement('article');
  card.className='ocard';
  card.setAttribute('aria-label',`${opp.title} at ${opp.org}`);
  card.innerHTML=`
    <div class="ocard__top">
      <span class="tag tag-${opp.type}">${cap(opp.type)}</span>
      <button class="bm-btn" data-id="${opp.id}" aria-label="${saved?'Remove bookmark':'Bookmark'}: ${opp.title}" title="${saved?'Remove bookmark':'Save for later'}">${saved?'🔖':'🏷️'}</button>
    </div>
    <div class="ocard__title">${opp.title}</div>
    <div class="ocard__org">${opp.org}</div>
    <div class="ocard__meta">
      <span>📍 ${opp.loc}</span>
      <span>📚 ${opp.field}</span>
      ${opp.remote?'<span>🌐 Remote</span>':''}
      ${opp.paid?'<span>💵 Paid</span>':'<span>🆓 Free</span>'}
    </div>
    <div class="dl-bar ${dc}">
      <span style="color:var(--ink-3);font-size:.79rem">📅 ${fmtDate(opp.deadline)}</span>
      <span class="dl-days ${dc}">${days>0?days+' days left':'Closed'}</span>
    </div>
    <div class="ocard__foot">
      <button class="btn btn-primary btn-sm" onclick="openApplyModal('${opp.id}')" aria-label="Apply for ${opp.title}">Apply Now</button>
      <button class="btn btn-outline btn-sm" onclick="openDetailsModal('${opp.id}')" aria-label="View details for ${opp.title}">Details</button>
    </div>`;
  card.querySelector('.bm-btn').addEventListener('click',function(e){
    e.stopPropagation();
    const id=this.dataset.id;
    const now=toggleBm(id);
    this.textContent=now?'🔖':'🏷️';
    this.setAttribute('aria-label',`${now?'Remove bookmark':'Bookmark'}: ${opp.title}`);
    showToast(now?'🔖 Saved to bookmarks!':'Removed from bookmarks',now?'ok':'info');
    if(activePage==='bookmarks')renderBookmarks();
  });
  return card;
}

function cap(s){return s.charAt(0).toUpperCase()+s.slice(1)}

/* ══════════════════════════════════════════════════
   DETAILS + APPLY MODALS
   Two real modal dialogs (not toasts) so students can read full
   opportunity info and submit an application with their details.
══════════════════════════════════════════════════ */
const APPLICATIONS_KEY='utg_applications'; // localStorage: list of submitted applications

function findOpp(id){
  // ids may be numbers (BASE_OPPS) or strings (user-added), so compare as strings
  return getAllOpps().find(o=>String(o.id)===String(id));
}

function openDetailsModal(id){
  const o=findOpp(id); if(!o)return;
  const days=daysLeft(o.deadline);
  document.getElementById('detailsTitle').textContent=o.title;
  document.getElementById('detailsBody').innerHTML=`
    <div class="modal-meta-row">
      <span class="tag tag-${o.type}">${cap(o.type)}</span>
      ${o.paid?'<span class="tag" style="background:#DCFCE7;color:#166534">Paid</span>':'<span class="tag" style="background:#F1F5F9;color:#475569">Unpaid</span>'}
      ${o.remote?'<span class="tag" style="background:#DBEAFE;color:#1E40AF">Remote</span>':''}
    </div>
    <p><strong>${o.org}</strong> · 📍 ${o.loc} · 📚 ${o.field}</p>
    <p>${o.desc}</p>
    <p style="color:var(--ink-2);font-weight:600">📅 Deadline: ${fmtDate(o.deadline)} (${days>0?days+' days left':'closed'})</p>
    ${o.link?`<p><a href="${o.link}" target="_blank" rel="noopener" style="color:var(--forest-l);font-weight:600">External link ↗</a></p>`:''}
  `;
  document.getElementById('detailsApplyBtn').setAttribute('onclick',`closeModal('detailsModal');openApplyModal('${o.id}')`);
  document.getElementById('detailsModal').classList.add('show');
}

function openApplyModal(id){
  const o=findOpp(id); if(!o)return;
  document.getElementById('applyOppId').value=o.id;
  document.getElementById('applyTitle').textContent=`Apply — ${o.title}`;
  document.getElementById('applySub').textContent=`${o.org} · Deadline ${fmtDate(o.deadline)}`;
  document.getElementById('applyForm').style.display='block';
  document.getElementById('applySuccess').style.display='none';
  // pre-fill from the logged-in student's account, since we already know who they are
  const u=currentUser();
  if(u){
    document.getElementById('ap-name').value=u.name||'';
    document.getElementById('ap-email').value=u.email||'';
    document.getElementById('ap-id').value=u.studentId||'';
  }
  document.getElementById('applyModal').classList.add('show');
}

function closeModal(modalId){
  document.getElementById(modalId).classList.remove('show');
}

// Validate and store an application submission (locally — no real backend).
function submitApplication(){
  const oppId=document.getElementById('applyOppId').value;
  const name=document.getElementById('ap-name').value.trim();
  const email=document.getElementById('ap-email').value.trim();
  const sid=document.getElementById('ap-id').value.trim();
  const phone=document.getElementById('ap-phone').value.trim();
  const note=document.getElementById('ap-note').value.trim();

  if(!name||!isUtgEmail(email)||!sid){
    showToast('Please fill in your name, UTG email, and student ID.','info');
    return;
  }

  const apps=JSON.parse(localStorage.getItem(APPLICATIONS_KEY)||'[]');
  apps.push({ oppId, name, email, studentId:sid, phone, note, appliedAt:Date.now() });
  localStorage.setItem(APPLICATIONS_KEY,JSON.stringify(apps));

  document.getElementById('applyForm').style.display='none';
  document.getElementById('applySuccess').style.display='block';
  showToast('✅ Application submitted!','ok');
}

/* ══════════════════════════════════════════════════
   ROUTING
══════════════════════════════════════════════════ */
let activePage='home';
const PAGES=['home','opps','about','bookmarks','contact','post'];

function goto(pg){
  if(!PAGES.includes(pg))return;
  PAGES.forEach(p=>{
    document.getElementById('pg-'+p).classList.toggle('active',p===pg);
  });
  document.querySelectorAll('.nav__link').forEach(el=>{
    el.classList.toggle('on',el.dataset.page===pg);
  });
  activePage=pg;
  window.scrollTo({top:0,behavior:'smooth'});
  // close mobile menu
  const mm=document.getElementById('mobileMenu');
  const bg=document.getElementById('burger');
  mm.classList.remove('open');bg.classList.remove('open');
  bg.setAttribute('aria-expanded','false');

  if(pg==='opps')renderOpps();
  if(pg==='bookmarks')renderBookmarks();
  if(pg==='home')renderHome();
  if(pg==='post')renderMyOpps();
}

function gotoFilter(type){
  goto('opps');
  // set chip
  document.querySelectorAll('.chip').forEach(c=>{
    c.classList.toggle('on',c.dataset.type===type);
  });
  activeType=type;
  renderOpps();
}

/* ══════════════════════════════════════════════════
   HOME
══════════════════════════════════════════════════ */
function renderHome(){
  const grid=document.getElementById('homeGrid');
  if(!grid)return;
  grid.innerHTML='';
  [...getAllOpps()]
    .filter(o=>daysLeft(o.deadline)>0)
    .sort((a,b)=>new Date(a.deadline)-new Date(b.deadline))
    .slice(0,6)
    .forEach(o=>grid.appendChild(makeCard(o)));
}

/* ══════════════════════════════════════════════════
   OPPORTUNITIES PAGE
══════════════════════════════════════════════════ */
let activeType='all';
let searchQuery='';

function doSearch(){
  searchQuery=document.getElementById('searchInput').value.trim().toLowerCase();
  renderOpps();
}
// Also search on Enter
document.getElementById('searchInput').addEventListener('keydown',function(e){
  if(e.key==='Enter')doSearch();
});

document.querySelectorAll('.chip').forEach(chip=>{
  chip.addEventListener('click',function(){
    document.querySelectorAll('.chip').forEach(c=>c.classList.remove('on'));
    this.classList.add('on');
    activeType=this.dataset.type;
    renderOpps();
  });
});

function applyFilters(){renderOpps()}

function getChecked(name){
  return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(i=>i.value);
}

function renderOpps(){
  const grid=document.getElementById('oppGrid');
  const countEl=document.getElementById('resCount');
  if(!grid)return;

  const locs=getChecked('loc');
  const pays=getChecked('pay');
  const dlRadio=document.querySelector('input[name="dl"]:checked');
  const dlDays=dlRadio?parseInt(dlRadio.value)||Infinity:Infinity;
  const sort=document.getElementById('sortSel')?.value||'deadline';

  let res=getAllOpps().filter(o=>{
    if(daysLeft(o.deadline)<=0)return false;
    if(activeType!=='all'&&o.type!==activeType)return false;
    if(searchQuery&&!(o.title+o.org+o.field+o.desc).toLowerCase().includes(searchQuery))return false;
    if(locs.length){
      const match=locs.some(l=>{
        if(l==='remote')return o.remote;
        if(l==='banjul')return o.locTag==='banjul';
        if(l==='international')return o.locTag==='international';
        return false;
      });
      if(!match)return false;
    }
    if(pays.length){
      const match=pays.some(p=>{
        if(p==='paid')return o.paid;
        if(p==='free')return !o.paid;
        return false;
      });
      if(!match)return false;
    }
    if(dlDays!==Infinity&&daysLeft(o.deadline)>dlDays)return false;
    return true;
  });

  if(sort==='deadline')res.sort((a,b)=>new Date(a.deadline)-new Date(b.deadline));
  else if(sort==='newest')res.sort((a,b)=>b.id-a.id);
  else if(sort==='az')res.sort((a,b)=>a.title.localeCompare(b.title));

  grid.innerHTML='';
  if(countEl)countEl.textContent=`${res.length} opportunit${res.length===1?'y':'ies'} found`;

  if(!res.length){
    grid.innerHTML=`<div class="no-res"><div class="big">🔍</div><p>No opportunities match your filters.</p><br/><button class="btn btn-outline btn-sm" onclick="clearAllFilters()">Clear filters</button></div>`;
    return;
  }
  res.forEach(o=>grid.appendChild(makeCard(o)));
}

function clearAllFilters(){
  document.querySelectorAll('input[name="loc"],input[name="pay"]').forEach(i=>i.checked=false);
  const allDl=document.querySelector('input[name="dl"][value="all"]');
  if(allDl)allDl.checked=true;
  document.getElementById('searchInput').value='';
  searchQuery='';
  activeType='all';
  document.querySelectorAll('.chip').forEach(c=>c.classList.toggle('on',c.dataset.type==='all'));
  renderOpps();
  showToast('Filters cleared','info');
}

/* ══════════════════════════════════════════════════
   BOOKMARKS
══════════════════════════════════════════════════ */
function renderBookmarks(){
  const grid=document.getElementById('bmGrid');
  const btn=document.getElementById('clearBmBtn');
  const title=document.getElementById('bmTitle');
  if(!grid)return;
  const bms=getBookmarks();
  grid.innerHTML='';
  if(!bms.length){
    if(btn)btn.style.display='none';
    if(title)title.textContent='No saved opportunities yet';
    grid.innerHTML=`
      <div class="empty-bm" style="grid-column:1/-1">
        <div class="ico">🏷️</div>
        <h3>Nothing saved yet</h3>
        <p>Browse opportunities and tap the bookmark icon to save them here.</p>
        <button class="btn btn-primary" onclick="goto('opps')">Browse Opportunities</button>
      </div>`;
    return;
  }
  if(title)title.textContent=`${bms.length} saved opportunit${bms.length===1?'y':'ies'}`;
  if(btn)btn.style.display='';
  getAllOpps().filter(o=>bms.includes(String(o.id))).forEach(o=>grid.appendChild(makeCard(o)));
}

function clearAllBookmarks(){
  if(!confirm('Remove all bookmarks?'))return;
  saveBookmarks([]);
  updateBmCount();
  renderBookmarks();
  showToast('All bookmarks cleared','info');
}

/* ══════════════════════════════════════════════════
   CONTACT FORM
══════════════════════════════════════════════════ */
function submitForm(){
  let valid=true;
  function check(id,errId,condition){
    const el=document.getElementById(id);
    const err=document.getElementById(errId);
    const fail=condition(el);
    el.classList.toggle('err',fail);
    if(err)err.classList.toggle('show',fail);
    if(fail)valid=false;
  }
  check('f-name','err-name',el=>!el.value.trim());
  check('f-email','err-email',el=>!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()));
  check('f-opp','err-opp',el=>!el.value.trim());
  check('f-type','err-type',el=>!el.value);
  check('f-dl','err-dl',el=>!el.value);
  check('f-desc','err-desc',el=>el.value.trim().length<20);
  const linkEl=document.getElementById('f-link');
  const linkErr=document.getElementById('err-link');
  if(linkEl.value.trim()&&!/^https?:\/\/.+/.test(linkEl.value.trim())){
    linkEl.classList.add('err');if(linkErr)linkErr.classList.add('show');valid=false;
  } else {
    linkEl.classList.remove('err');if(linkErr)linkErr.classList.remove('show');
  }
  if(!valid){showToast('Please fix the errors above','info');return}
  // success
  document.getElementById('formSuccess').classList.add('show');
  ['f-name','f-email','f-opp','f-type','f-dl','f-desc','f-link'].forEach(id=>{
    const el=document.getElementById(id);
    if(el)el.value=el.tagName==='SELECT'?'':'';
  });
  showToast('✅ Submission received! Thank you.','ok');
  setTimeout(()=>document.getElementById('formSuccess').classList.remove('show'),6000);
}

// Clear error on input
['f-name','f-email','f-opp','f-type','f-dl','f-desc','f-link'].forEach(id=>{
  const el=document.getElementById(id);
  if(el)el.addEventListener('input',function(){
    this.classList.remove('err');
    const errId='err-'+id.replace('f-','');
    const err=document.getElementById(errId);
    if(err)err.classList.remove('show');
  });
});

/* ══════════════════════════════════════════════════
   POST OPPORTUNITY PAGE
   Lets a logged-in student add a new listing. Saved to
   localStorage via addOpportunity() and immediately shows
   up across Home / Opportunities / Bookmarks because every
   render function reads from getAllOpps().
══════════════════════════════════════════════════ */
function submitNewOpp(){
  let valid=true;
  function check(id,errId,condition){
    const el=document.getElementById(id);
    const err=document.getElementById(errId);
    const fail=condition(el);
    el.classList.toggle('err',fail);
    if(err)err.classList.toggle('show',fail);
    if(fail)valid=false;
  }
  check('np-title','err-np-title',el=>!el.value.trim());
  check('np-org','err-np-org',el=>!el.value.trim());
  check('np-type','err-np-type',el=>!el.value);
  check('np-loc','err-np-loc',el=>!el.value.trim());
  check('np-field','err-np-field',el=>!el.value.trim());
  check('np-dl','err-np-dl',el=>!el.value);
  check('np-desc','err-np-desc',el=>el.value.trim().length<20);
  if(!valid){ showToast('Please fix the highlighted fields','info'); return; }

  const loc=document.getElementById('np-loc').value.trim();
  const remote=document.getElementById('np-remote').checked;
  addOpportunity({
    title: document.getElementById('np-title').value.trim(),
    org: document.getElementById('np-org').value.trim(),
    loc,
    locTag: remote?'remote':(/banjul|kanifing|serrekunda|fajara/i.test(loc)?'banjul':'international'),
    type: document.getElementById('np-type').value,
    field: document.getElementById('np-field').value.trim(),
    deadline: document.getElementById('np-dl').value, // ISO string, e.g. "2026-08-01"
    remote,
    paid: document.getElementById('np-paid').checked,
    desc: document.getElementById('np-desc').value.trim(),
    link: document.getElementById('np-link').value.trim()
  });

  ['np-title','np-org','np-type','np-loc','np-field','np-dl','np-desc','np-link'].forEach(id=>{
    const el=document.getElementById(id);
    if(el)el.value='';
  });
  document.getElementById('np-remote').checked=false;
  document.getElementById('np-paid').checked=false;

  showToast('✅ Opportunity posted to the board!','ok');
  renderMyOpps();
  renderHome(); // home page "featured" strip should reflect the new listing too
}

// List the opportunities the current student has posted, with a delete option.
function renderMyOpps(){
  const wrap=document.getElementById('myOppsList');
  if(!wrap)return;
  const u=currentUser();
  const mine=getCustomOpps().filter(o=>o.postedBy===u?.email);
  if(!mine.length){
    wrap.innerHTML=`<p style="color:var(--ink-4);font-size:.85rem">You haven't posted any opportunities yet.</p>`;
    return;
  }
  wrap.innerHTML=mine.map(o=>`
    <div class="myopp-row">
      <div>
        <div class="mo-title">${o.title}</div>
        <div class="mo-meta">${o.org} · ${cap(o.type)} · deadline ${fmtDate(o.deadline)}</div>
      </div>
      <button class="mo-del" onclick="removeMyOpp('${o.id}')">Delete</button>
    </div>`).join('');
}

function removeMyOpp(id){
  if(!confirm('Remove this opportunity you posted?'))return;
  deleteMyOpportunity(id);
  renderMyOpps();
  renderHome();
  showToast('Opportunity removed','info');
}

/* ══════════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════════ */
let toastT;
function showToast(msg,type='ok'){
  const el=document.getElementById('toast');
  el.textContent=msg;el.className='toast '+type+' show';
  clearTimeout(toastT);
  toastT=setTimeout(()=>el.classList.remove('show'),3000);
}

/* ══════════════════════════════════════════════════
   NAV EVENTS
══════════════════════════════════════════════════ */
document.querySelectorAll('.nav__link[data-page]').forEach(btn=>{
  btn.addEventListener('click',function(){goto(this.dataset.page)});
});
const burger=document.getElementById('burger');
const mobileMenu=document.getElementById('mobileMenu');
burger.addEventListener('click',function(){
  const open=mobileMenu.classList.toggle('open');
  this.classList.toggle('open',open);
  this.setAttribute('aria-expanded',open);
});
window.addEventListener('scroll',()=>{
  document.getElementById('nav').classList.toggle('raised',window.scrollY>8);
});
// Logo keyboard
document.querySelector('.nav__logo').addEventListener('keydown',e=>{
  if(e.key==='Enter'||e.key===' ')goto('home');
});
// Category card keyboard
document.querySelectorAll('.cat[role="button"]').forEach(el=>{
  el.addEventListener('keydown',e=>{
    if(e.key==='Enter'||e.key===' ')el.click();
  });
});

/* ══════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════ */
checkAuthOnLoad();
