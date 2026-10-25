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

})();
