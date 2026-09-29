const CDN = "https://cdn.jsdelivr.net/gh/workinwithai-create/PreEight@main/public/samples";
const STEPS = 16;
const CHORUS = 8;
const DOOR = 2;
const NEXT = 2;
const TOTAL = CHORUS + DOOR + NEXT;
const recipes = [
  { id:"bass-lean", name:"Bass lean", blurb:"Upright leans into the next root on the last eighth." },
  { id:"kit-thin", name:"Kit thin", blurb:"Hats die on bar 9. Kick only on 1 of the door." },
  { id:"nylon-reply", name:"Nylon reply", blurb:"Nylon answers the last chorus line once, then yields." },
  { id:"piano-door", name:"Piano door", blurb:"Grand opens a fourth above the next root, then resolves." },
  { id:"brass-answer", name:"Brass answer", blurb:"Trumpet on the last eighth of bar 10. Live out." },
  { id:"violin-hold", name:"Violin hold", blurb:"Violin holds the 5 of the chorus, resolves into next." },
  { id:"stop-go", name:"Stop then go", blurb:"Bar 9 is air until beat 3. Then the door opens." },
  { id:"hush-spark", name:"Hush then spark", blurb:"Half pocket on 9. Open hat + nylon on 10." },
  { id:"octave-push", name:"Octave push", blurb:"Bass drops an octave on the door, pushes the next section." },
  { id:"pedal-open", name:"Pedal open", blurb:"Bass holds the V of the next key. Piano adds air tones." }
];
function bar(symbol, piano, guitar, bass){ return { symbol, piano, guitar, bass }; }
const grooves = [
  { id:"amber", name:"Amber Walk", bpm:98, key:"A minor",
    chorus:[bar("Am",[45,48,52,57],[45,52,57],33),bar("F",[41,45,48,53],[41,48,53],41),bar("C",[48,52,55,60],[48,52,55],36),bar("G",[43,47,50,55],[43,47,50],31),bar("Am",[45,48,52,57],[45,52,57],33),bar("F",[41,45,48,53],[41,48,53],41),bar("C",[48,52,55,60],[48,52,55],36),bar("G",[43,47,50,55],[43,47,50],31)],
    door:[bar("G",[43,47,50,55],[43,47,50],31),bar("E7",[40,44,47,52],[40,47,50],28)],
    next:[bar("Am",[45,48,52,57],[45,52,57],33),bar("Am",[45,48,52,57],[45,52,57],33)] },
  { id:"porch", name:"Porch Climb", bpm:86, key:"E major",
    chorus:[bar("E",[40,44,47,52],[40,47,52],28),bar("B",[35,39,42,47],[35,42,47],23),bar("C#m",[44,47,51,56],[44,51,56],32),bar("A",[33,37,40,45],[33,40,45],33),bar("E",[40,44,47,52],[40,47,52],28),bar("B",[35,39,42,47],[35,42,47],23),bar("C#m",[44,47,51,56],[44,51,56],32),bar("A",[33,37,40,45],[33,40,45],33)],
    door:[bar("A",[33,37,40,45],[33,40,45],33),bar("B",[35,39,42,47],[35,42,47],23)],
    next:[bar("E",[40,44,47,52],[40,47,52],28),bar("E",[40,44,47,52],[40,47,52],28)] },
  { id:"fold", name:"Fold Radio", bpm:104, key:"D minor",
    chorus:[bar("Dm",[38,41,45,50],[38,45,50],26),bar("Bb",[34,38,41,46],[34,41,46],34),bar("F",[41,45,48,53],[41,48,53],29),bar("C",[36,40,43,48],[36,43,48],24),bar("Dm",[38,41,45,50],[38,45,50],26),bar("Bb",[34,38,41,46],[34,41,46],34),bar("F",[41,45,48,53],[41,48,53],29),bar("C",[36,40,43,48],[36,43,48],24)],
    door:[bar("C",[36,40,43,48],[36,43,48],24),bar("A7",[33,37,40,45],[33,40,43],21)],
    next:[bar("Dm",[38,41,45,50],[38,45,50],26),bar("Dm",[38,41,45,50],[38,45,50],26)] },
  { id:"harbor", name:"Harbor Quiet", bpm:72, key:"G major",
    chorus:[bar("G",[43,47,50,55],[43,50,55],31),bar("Em",[40,43,47,52],[40,47,52],28),bar("C",[36,40,43,48],[36,43,48],24),bar("D",[38,42,45,50],[38,45,50],26),bar("G",[43,47,50,55],[43,50,55],31),bar("Em",[40,43,47,52],[40,47,52],28),bar("C",[36,40,43,48],[36,43,48],24),bar("D",[38,42,45,50],[38,45,50],26)],
    door:[bar("D",[38,42,45,50],[38,45,50],26),bar("D7",[38,42,45,48],[38,45,48],26)],
    next:[bar("G",[43,47,50,55],[43,50,55],31),bar("G",[43,47,50,55],[43,50,55],31)] }
];
const state = { groove: grooves[0], recipe: recipes[0], playing:false, bar:0, mode:null };
let ctx, bus, buffers = {};
async function load() {
  ctx = new AudioContext();
  bus = ctx.createGain(); bus.gain.value = 0.35; bus.connect(ctx.destination);
  const files = [
    ["kick",`${CDN}/drums/kick.mp3`],["snare",`${CDN}/drums/snare.mp3`],["hat",`${CDN}/drums/hihat.mp3`],["crash",`${CDN}/drums/crash.mp3`],
    ["pC3",`${CDN}/piano/C3.mp3`],["pC4",`${CDN}/piano/C4.mp3`],["pA3",`${CDN}/piano/A3.mp3`],
    ["bE1",`${CDN}/bass/E1.mp3`],["bA1",`${CDN}/bass/A1.mp3`],["bC2",`${CDN}/bass/C2.mp3`],
    ["gE2",`${CDN}/guitar/E2.mp3`],["gA2",`${CDN}/guitar/A2.mp3`],["gE3",`${CDN}/guitar/E3.mp3`],
    ["tC4",`${CDN}/trumpet/C4.mp3`],["vA3",`${CDN}/violin/A3.mp3`]
  ];
  let n=0;
  for (const [k,url] of files) {
    try { const r = await fetch(url); buffers[k] = await ctx.decodeAudioData(await r.arrayBuffer()); } catch (e) { console.warn(k, e); }
    n++; document.getElementById("status").textContent = `Seating chairs ${n}/${files.length}`;
  }
  document.getElementById("status").textContent = "Chairs seated · live FluidR3 + kit";
}
function playBuf(name, when, rate=1, gain=0.4) {
  const b = buffers[name]; if (!b || !ctx) return;
  const src = ctx.createBufferSource(); src.buffer = b; src.playbackRate.value = rate;
  const g = ctx.createGain(); g.gain.value = gain; src.connect(g); g.connect(bus); src.start(when);
}
function rateFromMidi(midi, baseMidi){ return Math.pow(2, (midi-baseMidi)/12); }
function chordAt(i){
  if (i < CHORUS) return state.groove.chorus[i];
  if (i < CHORUS+DOOR) return state.groove.door[i-CHORUS];
  return state.groove.next[i-CHORUS-DOOR];
}
function zone(i){ if (i < CHORUS) return "chorus"; if (i < CHORUS+DOOR) return "door"; return "next"; }
function scheduleBar(barIndex, t0, stepDur){
  const ch = chordAt(barIndex); const z = zone(barIndex); const rec = state.recipe.id;
  const onDoor = z === "door";
  const onNext = z === "next";
  for (let s=0;s<STEPS;s++){
    const when = t0 + s*stepDur;
    if (onDoor && rec==="stop-go" && barIndex===8 && s < 8) continue;
    if (s%2===0) {
      let hatGain = 0.07;
      if (onDoor && rec==="kit-thin") hatGain = 0.02;
      if (onDoor && rec==="hush-spark" && barIndex===8) hatGain = 0.03;
      if (onDoor && rec==="hush-spark" && barIndex===9) hatGain = 0.14;
      playBuf("hat", when, 1, hatGain);
    }
    if (s===0) {
      const kickGain = (onDoor && rec==="kit-thin") ? 0.55 : 0.7;
      playBuf("kick", when, 1, kickGain);
    }
    if (s===8 && !(onDoor && (rec==="kit-thin" || rec==="stop-go"))) playBuf("snare", when, 1, 0.45);
    if (s===0) {
      let pGain = 0.28;
      if (onDoor && rec==="piano-door") pGain = 0.36;
      if (onDoor && rec==="pedal-open") pGain = 0.32;
      playBuf("pC4", when, rateFromMidi(ch.piano[2]||60, 60), pGain);
      playBuf("pA3", when, rateFromMidi(ch.piano[1]||57, 57), 0.22);
      let bassMidi = ch.bass;
      if (onDoor && rec==="bass-lean" && barIndex===9) {
        playBuf("bA1", when, rateFromMidi(bassMidi, 33), 0.4);
        playBuf("bA1", when+14*stepDur, rateFromMidi((state.groove.next[0].bass), 33), 0.5);
      } else if (onDoor && rec==="octave-push") {
        playBuf("bA1", when, rateFromMidi(bassMidi - 12, 33), 0.48);
      } else if (onDoor && rec==="pedal-open") {
        playBuf("bA1", when, rateFromMidi(bassMidi, 33), 0.42);
      } else {
        playBuf("bA1", when, rateFromMidi(bassMidi, 33), 0.45);
      }
      let gGain = 0.22;
      if (onDoor && rec==="nylon-reply") gGain = 0.30;
      if (onDoor && rec==="hush-spark" && barIndex===9) gGain = 0.28;
      playBuf("gA2", when, rateFromMidi(ch.guitar[0]||45, 45), gGain);
    }
    if (onDoor && rec==="nylon-reply" && barIndex===8 && s===8) {
      playBuf("gE3", when, rateFromMidi((ch.guitar[2]||57)+2, 52), 0.26);
    }
    if (onDoor && rec==="brass-answer" && barIndex===9 && s===14) {
      playBuf("tC4", when, rateFromMidi(ch.piano[3]||69, 60), 0.38);
    }
    if (onDoor && rec==="violin-hold" && s===0) {
      playBuf("vA3", when, rateFromMidi(ch.piano[2]||60, 57), 0.18);
    }
    if (onNext && s===0 && barIndex===10) playBuf("crash", when, 1, 0.18);
  }
}
let timer=null;
function stop(){ state.playing=false; state.mode=null; if(timer) clearTimeout(timer); timer=null; paintBars(); }
async function play(mode){
  if (!ctx) await load();
  if (ctx.state==="suspended") await ctx.resume();
  stop(); state.playing=true; state.mode=mode;
  const startBar = mode==="eight" ? CHORUS : 0;
  const endBar = mode==="loop" ? CHORUS : TOTAL;
  const stepDur = 60/state.groove.bpm/4;
  let barIndex = startBar;
  const tick = () => {
    if (!state.playing) return;
    if (barIndex >= endBar) { if (mode==="loop") barIndex = startBar; else { stop(); return; } }
    state.bar = barIndex; paintBars();
    scheduleBar(barIndex, ctx.currentTime+0.02, stepDur);
    barIndex += 1;
    timer = setTimeout(tick, STEPS*stepDur*1000);
  };
  tick();
}
function punch(){
  const g=state.groove, r=state.recipe;
  return `DoorTwo punch list\n${g.name} · ${g.bpm} BPM · ${g.key} · ${r.name}\n\nThe problem: chorus dumps into the next section with a hard cut. Session players write two live bars that open the door, then land the next pocket.\nThe move: ${r.blurb}\n\nChorus (bars 1-8)\n${g.chorus.map((b,i)=>`  ${i+1}. ${b.symbol}`).join("\n")}\n\nDoor (bars 9-10) — ${r.name}\n${g.door.map((b,i)=>`  ${i+9}. ${b.symbol}`).join("\n")}\n\nNext section landing (bars 11-12)\n${g.next.map((b,i)=>`  ${i+11}. ${b.symbol}`).join("\n")}\n\nLive chairs only. Distinct from LiftTwo, PickupTwo, TurnFour, TagFour, PreEight, AfterHook, CueFour.\nDrop the idea on bars 9-10. Do not hard-cut the chorus into the next section.`;
}
function paintGrooves(){
  const el=document.getElementById("grooves"); el.innerHTML="";
  grooves.forEach(g=>{ const b=document.createElement("button"); b.className="card"+(state.groove.id===g.id?" on":""); b.innerHTML=`<b>${g.name}</b><span>${g.bpm} BPM · ${g.key}</span>`; b.onclick=()=>{ state.groove=g; render(); }; el.appendChild(b); });
}
function paintRecipes(){
  const el=document.getElementById("recipes"); el.innerHTML="";
  recipes.forEach(r=>{ const b=document.createElement("button"); b.className="card"+(state.recipe.id===r.id?" on":""); b.innerHTML=`<b>${r.name}</b><span>${r.blurb}</span>`; b.onclick=()=>{ state.recipe=r; render(); }; el.appendChild(b); });
}
function paintBars(){
  const el=document.getElementById("bars"); el.innerHTML="";
  for(let i=0;i<TOTAL;i++){
    const ch=chordAt(i); const z=zone(i);
    const d=document.createElement("div");
    d.className="bar "+z+(state.playing && state.bar===i?" active":"");
    const label = z==="chorus"?"C":z==="door"?"D":"N";
    d.innerHTML=`<div class="n">${i+1} · ${label}</div><div class="c">${ch.symbol}</div>`;
    el.appendChild(d);
  }
}
function render(){ paintGrooves(); paintRecipes(); paintBars(); document.getElementById("punch").textContent = punch(); }
document.getElementById("playA").onclick=()=>play("loop");
document.getElementById("playB").onclick=()=>play("cut");
document.getElementById("play8").onclick=()=>play("eight");
document.getElementById("stop").onclick=stop;
document.getElementById("copy").onclick=()=>navigator.clipboard.writeText(punch());
render();
load();
