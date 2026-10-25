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
const W={ghost:false,paused:false,scene:"ghostnet",speed:"normal",density:"normal",
  targets:[],hops:[],threats:[],threatScore:0,queue:[],ppsAcc:0,pps:0,start:Date.now(),
  res:{cpu:6,mem:22,net:4,disk:11,temp:41,hist:[]}};
const SESS=(R.hex(4)+"-"+R.hex(4)).toUpperCase();
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
  if(e.key==="Escape"){document.getElementById("cfgwrap").classList.contains("show")?closeCfg():openCfg();return false;}
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
  W.threatScore=Math.min(100,W.threatScore+(sev==="crit"?18:sev==="high"?10:sev==="med"?5:2));
  renderThreat();
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
    `<div class="gauge">THRPUT ${(r.net*12.4).toFixed(1)} Mb/s<br>FD ${R.i(200,9000)}  SOCK ${R.i(20,800)}  TASK ${W.queue.length}</div>`;
  document.getElementById("s-load").textContent=W.ghost?"ACTIVE":r.cpu>50?"busy":"idle";
}
function tickRes(){
  const r=W.res, hi=W.ghost||W.scene==="ddos",
    tg=hi?{cpu:R.i(45,96),mem:R.i(40,88),net:R.i(50,99),temp:R.i(58,82)}:{cpu:R.i(3,18),mem:R.i(18,34),net:R.i(2,20),temp:R.i(38,48)};
  r.cpu+=(tg.cpu-r.cpu)*.25;r.mem+=(tg.mem-r.mem)*.12;r.net+=(tg.net-r.net)*.4;r.temp+=(tg.temp-r.temp)*.08;
  r.disk=Math.min(99,r.disk+(hi?rng()*.4:rng()*.02));
  renderMeters();
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
  ghostnet:{name:"GHOSTNET",desc:"Full-spectrum ambient operation. Everything runs — recon, breaches, capture and logs, cycling endlessly. The default drift-and-hum mode.",
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
let cU,cR,cP,cA,cG;
function startClocks(){
  stopClocks();const sp=SPEEDS[W.speed];
  cU=setInterval(()=>{const s=Math.floor((Date.now()-W.start)/1000);document.getElementById("s-up").textContent=[s/3600,s/60%60,s%60].map(x=>String(Math.floor(x)).padStart(2,"0")).join(":");},1000);
  cR=setInterval(tickRes,900);
  cP=setInterval(()=>{W.pps=W.ppsAcc;W.ppsAcc=0;document.getElementById("s-pps").textContent=(W.ghost||W.scene==="ddos"?R.i(800,24000):W.pps).toLocaleString();},1000);
  cA=setInterval(ambient,sp.a);
  cG=setInterval(ghostTick,sp.g);
}
function stopClocks(){[cU,cR,cP,cA,cG].forEach(clearInterval);}
function ambient(){ if(W.paused||W.ghost)return;
  if(R.chance(.5))GEN.syslog(); if(R.chance(.3))GEN.tcpdump();
}
function ghostTick(){ if(!W.ghost||W.paused)return;
  if(W.queue.length===0){try{R.wpick(SCENES[W.scene].ops).fn();}catch(e){}}
  else{try{W.queue.shift()();}catch(e){}}
}

/* ============================================================================
   COMMANDS
   ========================================================================== */
const HELP=[["help","this list"],["scan [ip]","nmap-style sweep"],["nmap <ip>","alias for scan"],["ping [ip]","icmp echo"],
  ["trace [ip]","route via proxy chain"],["hydra [ip]","credential audit"],["sniff","dump packets"],["syslog","tail log feed"],
  ["scene <id>","switch scene (recon/redteam/ddos/soc/ghostnet)"],["ghost","toggle auto-ghost"],["targets","list hosts"],
  ["hops","rebuild proxy chain"],["setup","open config"],["reseed [n]","regen world"],["pause","freeze streams"],
  ["theme <id>","phosphor colour"],["speed <id>","stream rate"],["full","fullscreen"],["clear","wipe screen"],["about","what this is"]];
function isIp(s){return /^\d{1,3}(\.\d{1,3}){3}$/.test(s||"");}
function findMake(ip){let t=W.targets.find(x=>x.ip===ip);if(!t){t=makeTarget();if(isIp(ip))t.ip=ip;W.targets.push(t);renderTopo();}return t;}
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
    case"ghost":toggleGhost();break;
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
    default:wl(red("ghost: ")+dim(`command not found: ${c}  (try 'help')`)+"\n");
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
  syncCfg();
}
function togglePause(){
  W.paused=!W.paused;
  const b=document.getElementById("b-pause");b.classList.toggle("on",W.paused);b.textContent=W.paused?"▶Run":"⏸Hold";
}
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
  {g:"ghost",opts:[["on","ON"],["off","OFF"]],get:()=>W.ghost?"on":"off",set:v=>{if((v==="on")!==W.ghost)toggleGhost();}}
];
function buildCfg(){
  CFG.forEach(row=>{
    const host=document.querySelector(`.opts[data-group="${row.g}"]`);
    host.innerHTML=row.opts.map(o=>`<span class="opt" data-v="${o[0]}">${o[1]}</span>`).join("");
    host.querySelectorAll(".opt").forEach(o=>o.onclick=()=>{row.set(o.dataset.v);syncCfg();});
  });
  syncCfg();
}
function syncCfg(){
  CFG.forEach(row=>{const cur=row.get();document.querySelectorAll(`.opts[data-group="${row.g}"] .opt`).forEach(o=>o.classList.toggle("sel",o.dataset.v===cur));});
  document.getElementById("scenedesc").textContent=SCENES[W.scene].desc;
}
function openCfg(){syncCfg();document.getElementById("cfgwrap").classList.add("show");}
function closeCfg(){document.getElementById("cfgwrap").classList.remove("show");term.focus();}

/* ---------- wire controls ---------- */
document.getElementById("b-ghost").onclick=toggleGhost;
document.getElementById("b-pause").onclick=togglePause;
document.getElementById("b-pop").onclick=popOut;
document.getElementById("b-full").onclick=goFull;
document.getElementById("b-cfg").onclick=openCfg;
document.getElementById("cfg-x").onclick=closeCfg;
document.getElementById("cfg-ok").onclick=closeCfg;
document.getElementById("cfg-reseed").onclick=()=>{reseed();};
document.getElementById("cfgwrap").addEventListener("mousedown",e=>{if(e.target.id==="cfgwrap")closeCfg();});
/* bare-letter shortcuts only when focus is OUTSIDE the terminal (e.g. a panel) */
addEventListener("keydown",e=>{
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
function boot(){
  const mon=location.hash==="#monitor";
  applyTheme("green");buildCfg();
  ensureTargets(R.i(5,9));rebuildHops();renderTopo();renderThreat();renderMeters();
  setScene("ghostnet",true); // silent on boot; banner prints next
  banner();
  const seq=[
    ()=>wl(pri("[ok] ")+dim("loading procedural network engine…")),
    ()=>wl(pri("[ok] ")+dim(`discovered ${W.targets.length} candidate hosts on bridged segment`)),
    ()=>wl(pri("[ok] ")+dim(`anonymizing route · ${W.hops.length} hops · exit ${R.pick(COUNTRIES)[0]}`)),
    ()=>wl(pri("[ok] ")+dim("stream generators armed: nmap · hydra · tcpdump · syslog")),
    ()=>{wl("");wl(pri("ready. ")+dim("type 'help'  ·  'ghost' or Ctrl+Shift+G = Auto-Ghost  ·  Esc = setup  ·  'full' = fullscreen"));wl("");startPrompt();term.focus();}
  ];
  seq.forEach((f,i)=>setTimeout(f,350+i*340));
  startClocks();
  if(mon){document.querySelector("#controls").style.display="none";setTimeout(()=>{if(!W.ghost)toggleGhost();},2300);}
}
boot();
