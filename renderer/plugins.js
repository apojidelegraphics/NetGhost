"use strict";
/* ============================================================================
   NetGhost · built-in plugins
   Each plugin registers via window.NetGhost.registerPlugin({...}).
   A plugin may add:  commands{name:(args,api)=>{}}, scenes{id:{name,desc,ops}},
   themes{id:{rgb,vars}}, onEnable(api), onDisable().
   The engine hands every command/op an `api` of drawing + world helpers:
     api.wl  write a line        api.pri/dim/fg/wht/cyan/amber/red/mag/blue  colours
     api.R   seeded RNG          api.q   queue a step (for scene ops)
     api.pushThreat(sev,txt)     api.W   world state   api.pad(s,n)
   Copy one of these as a template to make your own. SIMULATION ONLY.
   ========================================================================== */
(function(){
const NG = window.NetGhost;
if(!NG){ console.warn("NetGhost API not found — load plugins.js after app.js"); return; }
const A = NG.api;

/* ---------- 1. CRYPTO MINER ------------------------------------------------ */
const GPUS=["RTX 4090","RTX 3090","RX 7900 XTX","A100 80G","H100","Arc A770"];
function mineFeed(n){
  const {wl,dim,pri,amber,fg,R}=A;
  for(let i=0;i<n;i++){
    if(R.chance(.16)) wl(pri("[SHARE] ")+fg(`accepted  0x${R.hex(8)}  diff ${R.i(1,64)}M`)+dim("  "+R.pick(GPUS)));
    else if(R.chance(.05)) wl(amber("[STALE] ")+dim(`rejected  0x${R.hex(8)}`));
    else wl(dim(`GPU${i} ${A.pad(R.pick(GPUS),12)} `)+fg(A.pad((R.i(40,220)+R.i(0,99)/100).toFixed(2)+" MH/s",12))+dim(`${R.i(54,82)}°C  ${R.i(60,100)}% util  ${R.i(120,340)}W`));
  }
}
function payout(){ const {wl,dim,pri,R}=A;
  wl(dim("pool.ghostminer.io  ")+pri((R.i(1,9)+R.i(0,99)/100).toFixed(4)+" GHOST")+dim(`  bal ${(R.i(10,9000)/100).toFixed(2)}  next payout ${R.i(1,240)}m`)); }
NG.registerPlugin({
  id:"cryptominer", name:"Crypto Miner", desc:"GPU rig telemetry — hashrate, shares, pool payouts, thermals",
  commands:{ mine:()=>{ A.wl(A.dim("$ ")+A.wht("./ghostminer --rig 0")); mineFeed(A.R.i(4,7)); payout(); A.wl(""); } },
  scenes:{ mining:{name:"CRYPTO MINE", desc:"A rack of GPUs chewing through hashes — shares, stales, pool payouts and rising thermals.",
    ops:[{fn:()=>{for(let i=0;i<A.R.i(3,6);i++)A.q(()=>mineFeed(1));},w:4},{fn:()=>A.q(payout),w:2}]} }
});

/* ---------- 2. WARDRIVE (wifi) --------------------------------------------- */
const SSIDS=["linksys","NETGEAR-5G","xfinitywifi","HomeNet_2.4","CorpGuest","eduroam","TP-LINK_8842","PentestLab","ATT-WIFI-9f","<hidden>","FreePublicWiFi"];
const ENC=["WPA2","WPA3","WPA2-EAP","WEP","OPEN"];
function wifiScan(n){
  const {wl,dim,pri,amber,fg,R}=A;
  wl(dim("BSSID              PWR  CH  ENC      ESSID"));
  for(let i=0;i<n;i++){
    const bssid=Array.from({length:6},()=>R.hex(2)).join(":");
    const enc=R.pick(ENC), pwr=-R.i(32,92);
    wl(dim(bssid+"  ")+(pwr>-55?fg(pwr+" "):dim(pwr+" "))+dim(` ${A.pad(R.i(1,11),3)} `)+(enc==="OPEN"||enc==="WEP"?amber(A.pad(enc,8)):dim(A.pad(enc,8)))+wht(R.pick(SSIDS)));
  }
}
function handshake(){ const {wl,dim,pri,red,R}=A; const s=R.pick(SSIDS);
  wl(pri("[WPA] ")+dim(`4-way handshake captured: `)+A.wht(s)+dim(`  → ghost-${R.hex(4)}.cap`));
  wl(dim("      ")+red(`${R.i(1200,99000).toLocaleString()} keys/s`)+dim(" against wordlist…"));
  A.pushThreat("high",`handshake captured ${s}`); }
NG.registerPlugin({
  id:"wardrive", name:"Wardrive", desc:"802.11 recon — beacon sweep, signal, encryption, WPA handshake capture",
  commands:{ wifi:()=>{ A.wl(A.dim("$ ")+A.wht("airodump-ng wlan0mon")); wifiScan(A.R.i(5,9)); if(A.R.chance(.6))handshake(); A.wl(""); } },
  scenes:{ wardrive:{name:"WARDRIVE", desc:"Rolling 802.11 capture — APs appear and fade, signal drifts, the odd handshake falls out.",
    ops:[{fn:()=>A.q(()=>wifiScan(A.R.i(4,7))),w:4},{fn:()=>A.q(handshake),w:1}]} }
});

/* ---------- 3. ICS / SCADA ------------------------------------------------- */
const PLCS=["PLC-TURBINE-1","RTU-PUMP-07","HMI-GRID-A","VALVE-CTRL-3","BOILER-PID-2"];
function scadaFeed(n){
  const {wl,dim,pri,amber,red,fg,R}=A;
  for(let i=0;i<n;i++){
    const plc=R.pick(PLCS), reg=40001+R.i(0,200), val=R.i(0,65535);
    if(R.chance(.12)){ wl(red("[ALARM] ")+A.wht(plc)+dim(` coil ${R.i(1,16)} `)+red(R.pick(["OVER-TEMP","OVER-PRESSURE","SETPOINT DEVIATION","E-STOP TRIPPED"]))); A.pushThreat("crit",`ICS alarm ${plc}`); }
    else if(R.chance(.15)) wl(amber("[WRITE] ")+dim(`${plc}  coil ${R.i(1,16)} := ${R.chance(.5)?"ON":"OFF"}`));
    else wl(dim(`modbus ${A.pad(plc,14)} read HR${reg} = `)+fg(A.pad(val,6))+dim(`  (${(val/655.35).toFixed(1)}%)`));
  }
}
NG.registerPlugin({
  id:"scada", name:"ICS / SCADA", desc:"Industrial control theatre — Modbus register reads, coil writes, safety alarms",
  commands:{ scada:()=>{ A.wl(A.dim("$ ")+A.wht("modpoll -m tcp 10.20.0.5")); scadaFeed(A.R.i(5,8)); A.wl(""); } },
  scenes:{ scada:{name:"ICS / SCADA", desc:"Plant-floor control bus — Modbus polling, operator setpoint writes, and the occasional safety alarm.",
    ops:[{fn:()=>{for(let i=0;i<A.R.i(4,7);i++)A.q(()=>scadaFeed(1));},w:5}]} }
});

/* ---------- 4. COFFEE (easter egg) ----------------------------------------- */
NG.registerPlugin({
  id:"coffee", name:"Coffee", desc:"you can't hack without coffee ☕",
  commands:{ coffee:()=>{ const {wl,amber,dim,pri,fg,R}=A;
    [ "        ( (",
      "         ) )",
      "      ........",
      "      |      |]",
      "      \\      /",
      "       `----'"
    ].forEach(l=>wl(amber(l)));
    wl(pri("  brewed. ")+dim(R.pick(["caffeine levels nominal.","now you can hack.","+15 focus for 30 min.","the ghost runs on beans."])));
    wl(""); } }
});

/* ---------- 5. JKLINGER (Kubernetes dupe) ---------------------------------- */
const K_NS=["default","kube-system","prod","staging","ingress","monitoring","data","ghost"];
const K_APP=["api","web","worker","redis","postgres","nginx","cron","queue","auth","cache","gateway","scheduler"];
const K_STAT=[["Running","ok"],["Running","ok"],["Running","ok"],["Running","ok"],["CrashLoopBackOff","bad"],["Pending","warn"],["ContainerCreating","warn"],["Terminating","dim"],["Completed","dim"],["ImagePullBackOff","bad"]];
function kPods(n){
  const {wl,dim,fg,amber,red,R}=A;
  wl(dim("NAMESPACE    NAME                              READY   STATUS             RESTARTS   AGE"));
  for(let i=0;i<n;i++){ const app=R.pick(K_APP), st=R.pick(K_STAT), name=`${app}-${R.hex(4)}-${R.hex(5)}`;
    const col=st[1]==="bad"?red:st[1]==="warn"?amber:st[1]==="dim"?dim:fg;
    const ready=st[0]==="Running"?`${R.i(1,3)}/${R.i(1,3)}`:"0/1";
    wl(dim(A.pad(R.pick(K_NS),13))+dim(A.pad(name,34))+dim(A.pad(ready,8))+col(A.pad(st[0],19))+dim(A.pad(R.i(0,12),11))+dim(R.i(1,340)+"m")); }
}
function kNodes(n){ const {wl,dim,fg,amber,R}=A;
  wl(dim("NAME               STATUS   ROLES          CPU    MEM     PODS"));
  for(let i=0;i<n;i++){ const ready=R.chance(.85);
    wl(dim(A.pad(`jk-node-${R.hex(4)}`,19))+(ready?fg(A.pad("Ready",9)):amber(A.pad("NotReady",9)))+dim(A.pad(R.pick(["control-plane","worker","worker","edge"]),15))+dim(A.pad(R.i(5,98)+"%",7)+A.pad(R.i(20,95)+"%",8)+R.i(3,110))); }
}
function kEvent(){ const {wl,dim,amber,red,fg,R}=A;
  const ev=R.pick([["Scaled",fg],["Pulled",dim],["Killing",amber],["BackOff",red],["Scheduled",dim],["Unhealthy",amber],["OOMKilled",red]]);
  wl(dim(`${R.i(0,59)}s   `)+ev[1](A.pad(ev[0],10))+dim(`${R.pick(K_APP)}-${R.hex(5)}  `)+dim(R.pick(["Deployment","Pod","ReplicaSet","HPA"])+"/"+R.pick(K_NS))); }
NG.registerPlugin({
  id:"jklinger", name:"Jklinger", desc:"Kubernetes-style cluster console — pods, nodes, events, autoscaling churn",
  commands:{ jk:(args)=>{ const sub=(args[0]||"pods").toLowerCase();
    A.wl(A.dim("$ ")+A.wht("jk get "+sub));
    if(sub==="nodes")kNodes(A.R.i(3,6)); else if(sub==="events")for(let i=0;i<A.R.i(4,8);i++)kEvent(); else kPods(A.R.i(5,9));
    A.wl(""); } },
  scenes:{ cluster:{name:"K8S CLUSTER", desc:"A Jklinger cluster breathing — pods scheduled and crashing, nodes flapping, the autoscaler never resting.",
    ops:[{fn:()=>A.q(()=>kPods(A.R.i(4,7))),w:3},{fn:()=>{for(let i=0;i<A.R.i(3,6);i++)A.q(kEvent);},w:3},{fn:()=>A.q(()=>kNodes(A.R.i(3,5))),w:1}]} }
});

/* ---------- 6. hPh (n8n workflow-automation dupe) -------------------------- */
const HPH_FLOWS=["Lead Sync","Slack Alert","Invoice OCR","Backup Rotator","Churn Predictor","Webhook Fanout","CSV→Postgres","Email Digest","Stripe→Ledger","Scrape+Notify"];
const HPH_NODES=["Webhook","HTTP Request","Set","IF","Function","Merge","Postgres","Slack","Schedule","Code","Filter","Split In Batches"];
function hphRun(){ const {wl,dim,fg,pri,red,amber,R}=A;
  const flow=R.pick(HPH_FLOWS), steps=R.i(3,6);
  wl(pri("▶ WORKFLOW ")+A.wht(flow)+dim(`  exec #${R.i(1000,99999)}  trigger=${R.pick(["webhook","schedule","manual"])}`));
  let failed=false;
  for(let i=0;i<steps;i++){ const node=R.pick(HPH_NODES), ms=R.i(8,900), ok=!failed&&R.chance(.9);
    if(!ok&&!failed){ failed=true; wl(dim("   ├─ ")+red(A.pad(node,16))+red(`ERROR  ${R.pick(["ECONNREFUSED","401 Unauthorized","timeout","rate-limited"])}`)); }
    else if(failed) wl(dim("   ├─ ")+dim(A.pad(node,16)+"skipped"));
    else wl(dim("   ├─ ")+fg(A.pad(node,16))+dim(`ok   ${ms}ms   ${R.i(1,80)} items`)); }
  wl(dim("   └─ ")+(failed?red("failed"):pri("success"))+dim(failed?"  retrying in 60s":`   ${R.i(1,80)} items processed`)); }
NG.registerPlugin({
  id:"hph", name:"hPh", desc:"n8n-style workflow automation — nodes firing, webhooks, batch runs, retries",
  commands:{ hph:()=>{ A.wl(A.dim("$ ")+A.wht("hph exec --all")); hphRun(); A.wl(""); } },
  scenes:{ automation:{name:"AUTOMATION", desc:"An hPh instance humming — workflows triggering on webhooks and schedules, most green, the odd node throwing.",
    ops:[{fn:()=>A.q(hphRun),w:5},{fn:()=>A.q(()=>A.wl(A.dim(`${new Date().toTimeString().slice(0,8)} `)+A.cyan("webhook ")+A.dim(`POST /hook/${A.R.hex(8)} → 200  queued`))),w:2}]} }
});

/* ---------- 7. WharF (Docker dupe) ----------------------------------------- */
const W_IMG=["nginx:latest","redis:7","postgres:16","node:20-alpine","python:3.12","ubuntu:24.04","grafana/grafana","traefik:v3","mongo:7","rabbitmq:3-mgmt"];
const W_NAME=["gallant_turing","cranky_hopper","ghost_api","eager_bardeen","vivid_mccarthy","proud_wharf","busy_nexus","zen_ritchie"];
const W_ST=[["Up","ok"],["Up","ok"],["Up","ok"],["Restarting","warn"],["Exited (0)","dim"],["Exited (137)","bad"],["Created","dim"]];
function wharfPs(n){ const {wl,dim,fg,amber,red,wht,R}=A;
  wl(dim("CONTAINER ID   IMAGE                STATUS            PORTS                   NAMES"));
  for(let i=0;i<n;i++){ const st=R.pick(W_ST), col=st[1]==="bad"?red:st[1]==="warn"?amber:st[1]==="dim"?dim:fg;
    wl(dim(A.pad(R.hex(12),15))+dim(A.pad(R.pick(W_IMG),21))+col(A.pad(st[0],18))+dim(A.pad(st[1]==="ok"?`0.0.0.0:${R.i(1024,65535)}->${R.pick([80,443,5432,6379,3000])}/tcp`:"",24))+wht(R.pick(W_NAME))); } }
function wharfPull(){ const {wl,dim,fg,pri,R}=A; const img=R.pick(W_IMG);
  wl(dim("$ ")+A.wht("wharf pull "+img));
  for(let i=0;i<R.i(2,4);i++)wl(dim(R.hex(12)+": ")+(R.chance(.5)?pri("Pull complete"):dim("Downloading ")+fg(R.i(10,99)+"%")));
  wl(pri("Status: ")+fg("Downloaded "+img)); }
NG.registerPlugin({
  id:"wharf", name:"WharF", desc:"Docker-style container console — ps, image pulls, container churn",
  commands:{
    wharf:(args)=>{ const sub=(args[0]||"ps").toLowerCase(); A.wl(A.dim("$ ")+A.wht("wharf "+sub)); if(sub==="pull")wharfPull(); else wharfPs(A.R.i(4,8)); A.wl(""); },
    docker:()=>{ A.wl(A.dim("$ ")+A.wht("docker ps")); wharfPs(A.R.i(4,8)); A.wl(""); }
  },
  scenes:{ containers:{name:"CONTAINERS", desc:"A WharF host breathing — containers starting, restarting, OOM-killed, images pulled.",
    ops:[{fn:()=>A.q(()=>wharfPs(A.R.i(3,6))),w:4},{fn:()=>A.q(wharfPull),w:2}]} }
});

/* ---------- 8. SatCom (satellite / SDR) ------------------------------------ */
const SATS=["GHOST-1","IRIDIUM-9","SENTINEL-2B","STARINK-4411","NROL-GHOST","AQUA-7","METEOR-M2"];
function satFeed(n){ const {wl,dim,fg,pri,amber,cyan,R}=A;
  for(let i=0;i<n;i++){ const s=R.pick(SATS);
    if(R.chance(.25)) wl(pri("[LOCK] ")+fg(s)+dim(`  AOS · az ${R.i(0,359)}° el ${R.i(1,89)}° · downlink ${R.i(1,300)} Mbps`));
    else if(R.chance(.1)) wl(amber("[LOS] ")+dim(s+" over horizon — signal lost"));
    else wl(dim(A.pad(s,14))+cyan(A.pad(R.i(400,1200)+"km",9))+dim(`dop ${R.i(-9,9)}kHz  BER 1e-${R.i(3,9)}  ${R.i(20,99)}% frame-lock`)); } }
NG.registerPlugin({
  id:"satcom", name:"SatCom", desc:"Satellite/SDR uplink telemetry — passes, signal lock, downlink bitrate",
  commands:{ satcom:()=>{ A.wl(A.dim("$ ")+A.wht("satcom --track all")); satFeed(A.R.i(4,7)); A.wl(""); }, uplink:()=>satFeed(A.R.i(3,5)) },
  scenes:{ orbit:{name:"ORBITAL", desc:"Ground-station sweep — satellites rising and setting, locks acquired and lost, downlink streaming.",
    ops:[{fn:()=>{for(let i=0;i<A.R.i(3,6);i++)A.q(()=>satFeed(1));},w:5}]} }
});

/* ---------- 9. Mainframe (retro z/OS + a theme) ---------------------------- */
const JOBS=["PAYROLL","BATCHLD","EOD0100","CICSPROD","DB2BKUP","RPTGEN","SORT900","FTPXFER"];
function jcl(n){ const {wl,dim,fg,red,R}=A;
  for(let i=0;i<n;i++){ const j=R.pick(JOBS)+R.i(100,999);
    if(R.chance(.15)) wl(red("ABEND ")+dim(j+" ")+red(R.pick(["S0C7","S806","U4038","SB37"]))+dim(" — step failed"));
    else wl(dim(`JOB${R.i(10000,99999)} `)+fg(A.pad(j,11))+dim(A.pad(R.pick(["SUBMITTED","EXECUTING","ON OUTPUT QUEUE","MAXCC=0000","RC=0004"]),18))+dim(R.i(1,9999)+" lines")); } }
NG.registerPlugin({
  id:"mainframe", name:"Mainframe", desc:"Retro z/OS batch — JCL jobs, JES queue, MAXCC codes, occasional ABEND (adds 'ibm' theme)",
  commands:{ mainframe:()=>{ A.wl(A.dim("$ ")+A.wht("tso status")); jcl(A.R.i(5,8)); A.wl(""); }, jcl:()=>jcl(A.R.i(4,6)) },
  scenes:{ batch:{name:"MAINFRAME", desc:"The batch window — JCL submitted, jobs cycling through JES, MAXCC codes and abends scrolling.",
    ops:[{fn:()=>{for(let i=0;i<A.R.i(4,7);i++)A.q(()=>jcl(1));},w:5}]} },
  themes:{ ibm:{rgb:[120,200,255], vars:{'--primary':'#78c8ff','--primary2':'#2d6fa0','--fg':'#c6d6e6'}} }
});

/* ---------- 10. VideoWall (opens pop-out monitors) ------------------------- */
NG.registerPlugin({
  id:"videowall", name:"VideoWall", desc:"open extra monitor pop-outs — build a wall of ghost screens:  wall [n]",
  commands:{ wall:(args)=>{ let n=parseInt(args[0])||2; n=Math.max(1,Math.min(4,n));
    A.wl(A.pri("[wall] ")+A.dim("opening "+n+" monitor window(s)…"));
    for(let i=0;i<n;i++)setTimeout(()=>A.popout(), i*400);
    A.wl(""); } }
});

/* ---------- 11. MEMPOOL (blockchain) --------------------------------------- */
const COINS=["BTC","ETH","SOL","GHOST","XMR"];
function memFeed(n){ const {wl,dim,fg,pri,amber,R}=A;
  for(let i=0;i<n;i++){
    if(R.chance(.18)) wl(pri("[BLOCK] ")+fg("#"+R.i(800000,900000))+dim(`  ${R.i(1200,4000)} txs · ${(R.i(1,12)+R.i(0,99)/100)} ${R.pick(COINS)} fees · ${R.i(8,14)}s`));
    else wl(dim("0x"+R.hex(8)+"… ")+fg(A.pad((R.i(1,999)+R.i(0,99)/100)+" "+R.pick(COINS),14))+dim(`gas ${R.i(8,220)} gwei  ${R.pick(["pending","confirmed","dropped","replaced"])}  nonce ${R.i(1,9000)}`)); } }
NG.registerPlugin({ id:"mempool", name:"Mempool", desc:"blockchain mempool — pending txs, blocks, gas, confirmations",
  commands:{ mempool:()=>{A.wl(A.dim("$ ")+A.wht("mempool --watch"));memFeed(A.R.i(5,8));A.wl("");}, chain:()=>memFeed(A.R.i(3,5)) },
  scenes:{ mempool:{name:"MEMPOOL", desc:"The chain breathing — transactions flooding the pool, blocks sealing, gas spiking.",
    ops:[{fn:()=>{for(let i=0;i<A.R.i(4,7);i++)A.q(()=>memFeed(1));},w:5}]} }
});

/* ---------- 12. TRAINER (AI model training) -------------------------------- */
let epoch=0;
function trainFeed(n){ const {wl,dim,fg,pri,amber,R}=A;
  for(let i=0;i<n;i++){ epoch++;
    const loss=(3/(epoch*0.3+1)+R.i(0,30)/100).toFixed(4), acc=(Math.min(99,40+epoch*1.5)+R.i(0,99)/100).toFixed(2);
    if(R.chance(.1)) wl(amber("[WARN] ")+dim(`grad norm ${R.i(10,999)}.0 — clipping`));
    else wl(dim(`epoch ${A.pad(epoch,4)} `)+dim(`[${"=".repeat(R.i(1,20)).padEnd(20,".")}]`)+pri(` loss ${loss}`)+dim(`  acc ${acc}%  lr ${R.i(1,9)}e-${R.i(3,5)}  ${R.i(1,40)}k tok/s`)); }
}
NG.registerPlugin({ id:"trainer", name:"Trainer", desc:"AI model-training logs — epochs, loss curve, grad clipping, throughput",
  commands:{ train:()=>{A.wl(A.dim("$ ")+A.wht("python train.py --model ghost-7b"));trainFeed(A.R.i(5,8));A.wl("");} },
  scenes:{ training:{name:"MODEL TRAIN", desc:"A training run grinding — epochs ticking, loss falling, the odd gradient explosion.",
    ops:[{fn:()=>{for(let i=0;i<A.R.i(4,7);i++)A.q(()=>trainFeed(1));},w:5}]} }
});

/* ---------- 13. KALI (toolkit) --------------------------------------------- */
function msf(){ const {wl,dim,fg,pri,red,amber,R}=A; const t=A.privIP();
  wl(dim("msf6 > ")+A.wht(`use exploit/ghost/${R.pick(["remote_svc","web_app","smb_relay","auth_bypass","file_upload"])}`));
  wl(dim("msf6 exploit > ")+A.wht("set RHOSTS "+t)+dim("  ; run"));
  wl(dim(`[*] Started reverse handler on ${A.privIP()}:4444`));
  for(let i=0;i<A.R.i(1,3);i++)wl(dim(`[*] ${t} - `)+dim(R.pick(["Sending stage","Negotiating","Checking target","Staging payload"])));
  if(R.chance(.5)){wl(pri("[+] ")+fg(`session ${R.i(1,9)} opened (${A.privIP()} -> ${t})`));A.pushThreat("crit","session on "+t);}
  else wl(amber("[-] ")+dim("Exploit completed, but no session was created."));
}
function sqlmap(){ const {wl,dim,fg,pri,amber,R}=A;
  wl(dim("$ ")+A.wht(`sqlmap -u "https://${A.privIP()}/item?id=1" --batch --dbs`));
  wl(dim("[INFO] testing connection to the target URL"));
  wl(amber("[INFO] ")+dim("parameter 'id' appears to be ")+fg("injectable")+dim(` (${R.pick(["boolean-based blind","time-based blind","UNION query"])})`));
  wl(dim("available databases ["+R.i(2,9)+"]:"));
  for(let i=0;i<A.R.i(2,4);i++)wl(dim("[*] ")+fg(R.pick(["information_schema","prod_users","billing","ghost_vault","sessions","wp_main"])));
}
function john(){ const {wl,dim,fg,pri,R}=A;
  wl(dim("$ ")+A.wht("john --wordlist=rockyou.txt shadow.txt"));
  wl(dim(`Loaded ${R.i(4,40)} password hashes (${R.pick(["sha512crypt","bcrypt","NTLM","md5crypt"])})`));
  for(let i=0;i<A.R.i(1,4);i++)wl(fg(R.pick(["Summer2024!","hunter2","P@ssw0rd","letmein1","ghost123"]))+dim("  ("+R.pick(A.USERS)+")"));
  wl(dim(`${R.i(100,9000)}g/s  ${R.i(1,99)}% done`));
}
NG.registerPlugin({ id:"kali", name:"Kali Toolkit", desc:"offensive toolkit — metasploit (msf), sqlmap, john",
  commands:{ msf:()=>{msf();A.wl("");}, sqlmap:()=>{sqlmap();A.wl("");}, john:()=>{john();A.wl("");} },
  scenes:{ exploit:{name:"EXPLOITATION", desc:"The toolkit swinging — Metasploit sessions, SQL injection, hashes falling to John.",
    ops:[{fn:()=>A.q(msf),w:3},{fn:()=>A.q(sqlmap),w:2},{fn:()=>A.q(john),w:2}]} }
});

/* ---------- 14. HONEYPOT (watch others attack you) ------------------------- */
const ATK_CC=[["CN","CN"],["RU","RU"],["BR","BR"],["IN","IN"],["US","US"],["NL","NL"],["VN","VN"],["IR","IR"]];
function hpFeed(n){ const {wl,dim,fg,pri,amber,red,cyan,R}=A;
  for(let i=0;i<n;i++){ const c=R.pick(ATK_CC), ip=A.randIP();
    if(R.chance(.2)) wl(red("[CAUGHT] ")+fg(ip)+dim(` ${c[1]} tried `)+amber(R.pick(["a default login","weak credentials","a malformed request","an oversized payload","a known probe string"]))+dim(" on :"+R.pick([22,80,443,3389])));
    else wl(dim(`${new Date().toTimeString().slice(0,8)} `)+cyan(c[1]+" ")+dim(A.pad(ip,16))+dim(`→ :${R.pick(A.PORTLIST)}  ${R.pick(["SYN scan","login attempt","banner grab","exploit probe"])} · dropped`)); }
}
NG.registerPlugin({ id:"honeypot", name:"Honeypot", desc:"the tables turned — watch the world attack YOUR trap and get logged",
  commands:{ honeypot:()=>{A.wl(A.dim("$ ")+A.wht("ghostpot --listen"));hpFeed(A.R.i(5,9));A.wl("");}, trap:()=>hpFeed(A.R.i(3,5)) },
  scenes:{ honeypot:{name:"HONEYPOT", desc:"Inbound tide — bots and scanners from around the world hammering the trap, every hit logged.",
    ops:[{fn:()=>{for(let i=0;i<A.R.i(4,8);i++)A.q(()=>hpFeed(1));},w:5}]} }
});

/* ---------- 15. DNSTUNNEL (covert exfil) ----------------------------------- */
function dnsFeed(n){ const {wl,dim,fg,pri,cyan,R}=A;
  for(let i=0;i<n;i++){ const sub=A.R.hex(R.i(20,40));
    wl(dim(`${new Date().toTimeString().slice(0,8)} `)+cyan("TXT ")+dim(sub+".")+fg(R.pick(["exfil.ghost.sh","c2.nullsec.io","dns.tunnel.cc"]))+dim(`  ${R.i(40,220)}B  seq ${R.i(1,9999)}`)); }
  if(R.chance(.4))wl(pri("[+] ")+dim(`chunk ${R.i(1,500)}/${R.i(500,999)} exfiltrated via DNS`)); }
NG.registerPlugin({ id:"dnstunnel", name:"DNS Tunnel", desc:"covert channel — data smuggled out one DNS query at a time",
  commands:{ dnstunnel:()=>{A.wl(A.dim("$ ")+A.wht("iodine -f exfil.ghost.sh"));dnsFeed(A.R.i(5,8));A.wl("");}, dns:()=>dnsFeed(A.R.i(3,5)) },
  scenes:{ exfil:{name:"DNS EXFIL", desc:"A slow bleed — bytes leaving the network disguised as DNS lookups, chunk by chunk.",
    ops:[{fn:()=>{for(let i=0;i<A.R.i(4,7);i++)A.q(()=>dnsFeed(1));},w:5}]} }
});

})();
