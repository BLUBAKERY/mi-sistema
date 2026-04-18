import { useState, useEffect, useRef, useCallback } from "react";

const SK = "maritima_v6";
const SK_MANTRAS = "maritima_mantras";
const SK_VIDEOS = "maritima_videos";
const SK_PROFILE = "maritima_profile";

const CYCLE_PHASES = {
  menstrual:{name:"Menstrual",days:[1,2,3,4,5,6],color:"#C4856A",icon:"🌑",desc:"Descanso profundo. Tu cuerpo hace un trabajo enorme. Honrá el ritmo lento.",energy:"Baja",training:"Yoga restaurativo, caminatas suaves.",mood:"Introspección, sensibilidad, soltar.",foods:"Hierro: carnes rojas, lentejas, espinaca, chocolate amargo. Menos cafeína. Más caldos.",foodNote:"Más hierro · menos cafeína · chocolate amargo 🍫"},
  folicular:{name:"Folicular",days:[7,8,9,10,11,12,13],color:"#8A9E8C",icon:"🌒",desc:"El estrógeno sube. Energía fresca, mente clara. Momento de empezar cosas nuevas.",energy:"Subiendo",training:"Cargas nuevas, más intensidad.",mood:"Optimismo, creatividad, arranque.",foods:"Variedad: brotes, semillas de lino, fermentados, proteína magra.",foodNote:"Variedad · fermentados · carbos bienvenidos 🌱"},
  ovulatoria:{name:"Ovulatoria",days:[14,15,16,17],color:"#D4A090",icon:"🌕",desc:"Tu pico. Energía máxima, sociabilidad alta.",energy:"Máxima",training:"Entrená fuerte. Cargas altas, potencia.",mood:"Confianza, magnetismo, conexión.",foods:"Antiinflamatorios: salmón, palta, frutas rojas, cúrcuma.",foodNote:"Antiinflamatorio · omega 3 · frutas rojas 🫐"},
  lutea:{name:"Lútea",days:[18,19,20,21,22,23,24,25,26,27,28],color:"#6B6560",icon:"🌘",desc:"Progesterona sube. El cuerpo pide calma. Los antojos son reales.",energy:"Bajando",training:"Fuerza moderada, Pilates, escuchá al cuerpo.",mood:"Hacia adentro, sensibilidad, orden.",foods:"Carbos complejos y magnesio: batata, arroz integral, nueces, cacao, banana.",foodNote:"Carbos complejos · magnesio · cacao 🍌"},
};
const getPhase=(d)=>{for(const[k,p]of Object.entries(CYCLE_PHASES)){if(p.days.includes(d))return{key:k,...p};}return{key:"lutea",...CYCLE_PHASES.lutea};};

const WORKOUTS={
  1:{name:"Día 1 — Fuerza",subtitle:"Full Body · Énfasis Tren Inferior",exercises:[{name:"Hip Thrust con barra",sets:4,reps:"10-12",notes:"Pelvis neutra, apretar glúteo arriba"},{name:"RDL con mancuernas",sets:3,reps:"10",notes:"Bisagra limpia, sentir isquios"},{name:"Split Squat Búlgaro",sets:3,reps:"8 c/lado",notes:"Descender 3 seg"},{name:"Adductor en máquina",sets:3,reps:"15",notes:"Controlado, rango completo"},{name:"Remo un brazo",sets:3,reps:"10 c/lado",notes:"Codo hacia cadera"},{name:"Press tríceps polea",sets:3,reps:"12-15",notes:"Codos pegados"},{name:"Face pull con cuerda",sets:3,reps:"15",notes:"Codos a altura de hombros"}]},
  2:{name:"Día 2 — Funcional",subtitle:"Full Body · Movilidad + Movimiento",exercises:[{name:"Sentadilla goblet",sets:4,reps:"12",notes:"Pausa 2 seg abajo"},{name:"Peso muerto sumo",sets:3,reps:"12",notes:"Pies abiertos, bisagra limpia"},{name:"Step up con mancuernas",sets:3,reps:"10 c/lado",notes:"Glúteo lidera"},{name:"Clamshell con banda",sets:3,reps:"15 c/lado",notes:"Lento, glúteo medio"},{name:"Serratus press en suelo",sets:3,reps:"12",notes:"Protracción final"},{name:"W-raise banco inclinado",sets:3,reps:"12",notes:"Sin inercia"},{name:"Kettlebell swing",sets:3,reps:"15",notes:"Potencia de cadera"}]},
  3:{name:"Día 3 — Integración",subtitle:"Full Body · Fuerza + Potencia",exercises:[{name:"Hip Thrust unilateral",sets:4,reps:"8 c/lado",notes:"Pausa arriba"},{name:"Sentadilla con barra",sets:4,reps:"10",notes:"Core braced"},{name:"Good morning barra liviana",sets:3,reps:"12",notes:"Bisagra lenta"},{name:"Prensa de piernas",sets:3,reps:"12",notes:"Pies altos = más glúteo"},{name:"Pulldown agarre neutro",sets:3,reps:"10",notes:"Hombros ABAJO"},{name:"Extensión tríceps sobre cabeza",sets:3,reps:"12",notes:"Codos quietos"},{name:"Curl bíceps alterno",sets:2,reps:"10 c/lado",notes:"Supinación completa"}]},
};

const ACTIVATION=["Respiración diafragmática 90/90 — 10 resp","Cat-Cow lento — 8 reps","Hip 90/90 rotación activa — 6 c/lado","Glute bridge isométrico 5 seg — 8 reps","Bird-dog con pausa — 6 c/lado","Wall angels — 10 reps"];
const SESSION_OPTIONS=["Gym","Pilates","Yoga","Caminata","Running","Cinta","Otro"];
const WAKEUP_FEELINGS=["tranquila","acelerada","ansiosa","descansada","confundida","motivada","pesada","liviana","triste","presente","esperanzada","agotada"];
const MORNING_RITUALS=["Estiramientos","Masaje facial","Respiraciones","Drenaje linfático","TRE","Meditación","Journaling","Tapping","Yoga","Caminata"];
const EMOTIONS=["tranquila","ansiosa","motivada","cansada","triste","plena","irritada","agradecida","confundida","conectada","urgencia","libre","asustada","creativa"];
const SUPPLS=["Magnesio","Zinc","Vitamina D3","Omega 3","Hierro","Progesterona","Enzimas digestivas","Glutamina","Soporte adrenal","Ashwaganda"];
const CYCLE_TYPES=["Regular","Irregular","Amenorrea","Anovulatorio","Perimenopausia"];
const CYCLE_SYMPTOMS=["Doloroso","Sin dolor","Flujo abundante","Flujo escaso","Coágulos","Spotting","Náuseas","Hinchazón","Cefalea"];

const P={cream:"#F7F2EA",parchment:"#EDE5D4",sand:"#CFC0A8",terracotta:"#B8745A",terracottaLight:"#CE9680",sage:"#7A9480",charcoal:"#28261F",warmGray:"#7A6E65",white:"#FDFAF3",gold:"#C4A96A",indigo:"#6B7DB3"};

const GS=`
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=Jost:wght@300;400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  html,body{background:${P.cream};font-family:'Jost',sans-serif;color:${P.charcoal};}
  textarea,input,select{font-family:'Jost',sans-serif;}
  textarea:focus,input:focus{outline:none;}
  ::-webkit-scrollbar{width:3px;}
  ::-webkit-scrollbar-thumb{background:${P.sand};border-radius:2px;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
  @keyframes pulse{0%,100%{opacity:0.4;}50%{opacity:1;}}
`;

const today=()=>new Date().toISOString().split("T")[0];
const LS={
  get:(k)=>{try{const r=localStorage.getItem(k);return r?JSON.parse(r):null;}catch{return null;}},
  set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch{}},
};
const loadAppData=()=>LS.get(SK)||{entries:{},cycle:{currentDay:5,cycleType:"Regular"}};
const saveAppData=(d)=>LS.set(SK,d);
const loadMantras=()=>LS.get(SK_MANTRAS)||[];
const saveMantras=(m)=>LS.set(SK_MANTRAS,m);
const loadVideos=()=>LS.get(SK_VIDEOS)||[];
const saveVideos=(v)=>LS.set(SK_VIDEOS,v);

// Universal section saver — writes directly to localStorage
const saveSectionToLS=(section,data)=>{
  const current=loadAppData();
  const updated={...current,entries:{...current.entries,[today()]:{...current.entries?.[today()],[section]:data,date:today()}}};
  saveAppData(updated);
  return updated;
};

const callAI=async(system,user,maxTokens=700)=>{
  try{
    const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:maxTokens,system,messages:[{role:"user",content:user}]})});
    const d=await r.json();
    return d.content?.[0]?.text||"";
  }catch(e){return"";}
};

const JULI_CTX=`Sos el agente personal de bienestar de Julieta, 37 años, argentina, instructora de Pilates y emprendedora. Carta natal: Sol Géminis, Ascendente Aries, Luna Piscis.

Tu rol es como el micelio: conectás todo, ayudás a ver patrones que ella no ve sola. No das consejos directivos. Hacés preguntas que abren rutas nuevas. Podés citar a Clarissa Pinkola Estés, Glennon Doyle, Rumi, Van der Kolk, Gabor Maté.

Nunca sos paternalista. Nunca usás culpa ni generás presión. Ella elige. Vos abrís caminos.
Hablale de vos, español rioplatense. Directa, honesta, cálida.`;

// ── UI primitives ─────────────────────────────────────────────────────────────
const serif=(txt,sz=16,color=P.charcoal,italic=false,weight=400)=><span style={{fontFamily:"'Playfair Display',serif",fontSize:sz,color,fontStyle:italic?"italic":"normal",fontWeight:weight}}>{txt}</span>;
const lbl=(txt)=><div style={{fontSize:10,letterSpacing:"0.12em",textTransform:"uppercase",color:P.warmGray,marginBottom:7,fontWeight:400}}>{txt}</div>;
const Card=({children,style={},delay=0})=><div style={{background:P.white,borderRadius:16,padding:"15px 17px",marginBottom:12,border:`1px solid ${P.parchment}`,animation:`fadeUp 0.4s ease ${delay}s both`,boxShadow:"0 1px 8px rgba(40,38,31,0.05)",...style}}>{children}</div>;
const Chip=({active,onClick,children,color=P.terracotta,small=false})=><button onClick={onClick} style={{padding:small?"4px 9px":"6px 12px",borderRadius:20,border:`1px solid ${active?color:P.sand}`,background:active?color:"transparent",color:active?P.white:P.warmGray,fontSize:small?10:12,cursor:"pointer",fontFamily:"'Jost',sans-serif",fontWeight:active?500:300,transition:"all 0.18s",marginBottom:4}}>{children}</button>;
const Slider=({value,onChange,min=1,max=10,lbl:l,color=P.terracotta})=><div style={{marginBottom:14}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontSize:10,letterSpacing:"0.12em",textTransform:"uppercase",color:P.warmGray}}>{l}</span><span style={{fontFamily:"'Playfair Display',serif",fontSize:14,color}}>{value}</span></div><input type="range" min={min} max={max} value={value} onChange={e=>onChange(+e.target.value)} style={{width:"100%",accentColor:color,cursor:"pointer"}}/></div>;
const Loader=()=><div style={{display:"flex",gap:4,padding:"8px 0"}}>{[0,0.2,0.4].map((d,i)=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:P.sand,animation:`pulse 1s ease ${d}s infinite`}}/>)}</div>;
const AutoSaved=()=><div style={{fontSize:10,color:P.sage,marginBottom:8,display:"flex",alignItems:"center",gap:5}}><span>✓</span>Guardado</div>;

// ── VOICE INPUT ───────────────────────────────────────────────────────────────
function VoiceTextArea({value,onChange,placeholder,rows=3}){
  const[listening,setListening]=useState(false);
  const startListening=()=>{
    if(!('webkitSpeechRecognition'in window||'SpeechRecognition'in window)){alert("Tu navegador no soporta voz. Probá Chrome.");return;}
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    const rec=new SR();
    rec.lang="es-AR";rec.continuous=false;rec.interimResults=false;
    rec.onstart=()=>setListening(true);
    rec.onend=()=>setListening(false);
    rec.onresult=(e)=>{
      const transcript=e.results[0][0].transcript;
      onChange(value?(value+" "+transcript):transcript);
    };
    rec.onerror=()=>setListening(false);
    rec.start();
  };
  return(
    <div style={{position:"relative"}}>
      <textarea value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{width:"100%",background:P.parchment,border:`1px solid ${listening?P.terracotta:P.sand}`,borderRadius:10,padding:"10px 40px 10px 13px",fontSize:13,color:P.charcoal,resize:"none",lineHeight:1.6,fontWeight:300,transition:"border-color 0.2s"}}/>
      <button onClick={startListening} style={{position:"absolute",right:8,top:8,width:26,height:26,borderRadius:"50%",background:listening?P.terracotta:P.terracotta+"20",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>{listening?"●":"🎤"}</button>
      {listening&&<div style={{fontSize:10,color:P.terracotta,marginTop:3,textAlign:"right"}}>Escuchando...</div>}
    </div>
  );
}

// ── MANTRAS ───────────────────────────────────────────────────────────────────
function MantrasManager({mantras,onUpdate}){
  const[newM,setNewM]=useState("");
  const add=()=>{if(newM.trim()){onUpdate([...mantras,newM.trim()]);setNewM("");}};
  const remove=(i)=>onUpdate(mantras.filter((_,idx)=>idx!==i));
  return(
    <div>
      <div style={{display:"flex",gap:8,marginBottom:12}}>
        <input value={newM} onChange={e=>setNewM(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} placeholder="Escribí una frase tuya..." style={{flex:1,background:P.parchment,border:`1px solid ${P.sand}`,borderRadius:10,padding:"9px 13px",fontSize:13,color:P.charcoal}}/>
        <button onClick={add} style={{padding:"9px 16px",background:P.gold,color:P.white,border:"none",borderRadius:10,fontSize:13,cursor:"pointer",fontFamily:"'Playfair Display',serif"}}>+</button>
      </div>
      {mantras.length===0&&<div style={{fontSize:12,color:P.sand,fontStyle:"italic",textAlign:"center",padding:"10px 0"}}>Todavía no agregaste frases</div>}
      {mantras.map((m,i)=>(
        <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:P.parchment,borderRadius:10,padding:"10px 14px",marginBottom:8}}>
          <span style={{fontFamily:"'Playfair Display',serif",fontSize:13,fontStyle:"italic",color:P.charcoal,flex:1,lineHeight:1.5}}>{m}</span>
          <button onClick={()=>remove(i)} style={{background:"none",border:"none",color:P.sand,cursor:"pointer",fontSize:16,marginLeft:8}}>×</button>
        </div>
      ))}
    </div>
  );
}

// ── MORNING TAB ───────────────────────────────────────────────────────────────
function MorningTab({appData,refreshAppData,mantras,onUpdateMantras}){
  // Read fresh from appData every render — no stale state
  const existing=appData.entries?.[today()]?.morning||{};
  const phase=getPhase(appData.cycle?.currentDay||5);
  const todayMantra=mantras.length>0?mantras[new Date().getDate()%mantras.length]:null;
  const[customRitual,setCustomRitual]=useState("");
  const[showMantras,setShowMantras]=useState(false);
  const[saved,setSaved]=useState(false);

  // Any field update → save to LS immediately and refresh parent state
  const update=(patch)=>{
    const newMorning={...existing,...patch};
    saveSectionToLS("morning",newMorning);
    refreshAppData();
    setSaved(true);setTimeout(()=>setSaved(false),1500);
  };

  const togFeel=(f)=>{const cur=existing.wakeupFeel||[];const n=cur.includes(f)?cur.filter(x=>x!==f):[...cur,f];update({wakeupFeel:n});};
  const togRitual=(r)=>{const cur=existing.rituals||[];const n=cur.includes(r)?cur.filter(x=>x!==r):[...cur,r];update({rituals:n});};
  const addCustom=()=>{if(customRitual.trim()){const n=[...(existing.rituals||[]),customRitual.trim()];update({rituals:n});setCustomRitual("");}};

  const cycleStart=appData.cycle?.periodStart;
  const cycleDay=appData.cycle?.currentDay||5;

  return(
    <div>
      <button onClick={()=>setShowMantras(!showMantras)} style={{width:"100%",padding:"9px",background:"transparent",border:`1px dashed ${P.gold}`,borderRadius:10,color:P.gold,fontSize:11,cursor:"pointer",fontFamily:"'Jost',sans-serif",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:12}}>
        {showMantras?"▾ Mis frases":"✦ Mis frases y recordatorios"}
      </button>
      {showMantras&&<Card><MantrasManager mantras={mantras} onUpdate={onUpdateMantras}/></Card>}

      {todayMantra&&(
        <Card style={{background:`linear-gradient(135deg,${P.gold}15,${P.terracotta}08)`,borderColor:P.gold+"40"}}>
          <div style={{fontSize:9,letterSpacing:"0.2em",textTransform:"uppercase",color:P.gold,marginBottom:8}}>Para hoy</div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:17,fontStyle:"italic",color:P.charcoal,lineHeight:1.7,textAlign:"center"}}>{todayMantra}</div>
        </Card>
      )}

      <Card style={{background:phase.color+"12",borderColor:phase.color+"30"}}>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <span style={{fontSize:22}}>{phase.icon}</span>
          <div style={{flex:1}}>
            <div style={{fontSize:9,letterSpacing:"0.1em",textTransform:"uppercase",color:phase.color,marginBottom:2}}>{phase.name} · día {cycleDay}{cycleStart?` · inicio ${new Date(cycleStart+"T12:00:00").toLocaleDateString("es-AR",{day:"numeric",month:"short"})}`:""}</div>
            <div style={{fontSize:12,color:P.charcoal}}>{phase.foodNote}</div>
            <div style={{fontSize:11,color:phase.color,marginTop:3,fontStyle:"italic"}}>{phase.mood}</div>
          </div>
        </div>
      </Card>

      {saved&&<AutoSaved/>}

      <Card>
        {serif("¿Cómo dormiste?",14,P.charcoal,false,500)}
        <div style={{display:"flex",gap:12,marginTop:12}}>
          <div style={{flex:1}}>
            {lbl("Horas")}
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <button onClick={()=>update({sleepH:Math.max(3,(existing.sleepH||7)-0.5)})} style={{width:28,height:28,borderRadius:"50%",border:`1px solid ${P.sand}`,background:P.parchment,cursor:"pointer",fontSize:16}}>−</button>
              <span style={{fontFamily:"'Playfair Display',serif",fontSize:18,color:P.charcoal,minWidth:32,textAlign:"center"}}>{existing.sleepH||7}h</span>
              <button onClick={()=>update({sleepH:Math.min(12,(existing.sleepH||7)+0.5)})} style={{width:28,height:28,borderRadius:"50%",border:`1px solid ${P.sand}`,background:P.parchment,cursor:"pointer",fontSize:16}}>+</button>
            </div>
          </div>
          <div style={{flex:1}}>
            {lbl("Calidad")}
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {["buena","regular","mala"].map(q=><Chip key={q} active={existing.sleepQ===q} onClick={()=>update({sleepQ:q})} color={q==="buena"?P.sage:q==="regular"?P.gold:P.warmGray} small>{q}</Chip>)}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        {serif("Al despertar",14,P.charcoal,false,500)}
        <div style={{marginTop:10,marginBottom:10}}>{lbl("¿Cómo te sentiste?")}</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
          {WAKEUP_FEELINGS.map(f=><Chip key={f} active={(existing.wakeupFeel||[]).includes(f)} onClick={()=>togFeel(f)} color={P.gold} small>{f}</Chip>)}
        </div>
        {lbl("Pensamientos, sensaciones, lo que hay en tu cabeza")}
        <VoiceTextArea value={existing.thoughts||""} onChange={v=>update({thoughts:v})} placeholder="Podés escribir o hablar con el micrófono" rows={2}/>
      </Card>

      <Card>
        {serif("Ritual de mañana",14,P.charcoal,false,500)}
        <div style={{marginTop:10,marginBottom:8}}>{lbl("¿Qué hiciste para vos?")}</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
          {MORNING_RITUALS.map(r=><Chip key={r} active={(existing.rituals||[]).includes(r)} onClick={()=>togRitual(r)} color={P.terracotta} small>{r}</Chip>)}
          {(existing.rituals||[]).filter(r=>!MORNING_RITUALS.includes(r)).map(r=><Chip key={r} active={true} onClick={()=>togRitual(r)} color={P.terracotta} small>{r} ×</Chip>)}
        </div>
        <div style={{display:"flex",gap:8,marginBottom:10}}>
          <input value={customRitual} onChange={e=>setCustomRitual(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addCustom()} placeholder="Otra acción..." style={{flex:1,background:P.parchment,border:`1px solid ${P.sand}`,borderRadius:8,padding:"7px 12px",fontSize:12,color:P.charcoal}}/>
          <button onClick={addCustom} style={{padding:"7px 12px",background:P.terracotta,color:P.white,border:"none",borderRadius:8,fontSize:12,cursor:"pointer"}}>+</button>
        </div>
        <Chip active={!!existing.ritualDone} onClick={()=>update({ritualDone:!existing.ritualDone})} color={P.sage}>{existing.ritualDone?"✓ Lo hice":"¿Lo completaste?"}</Chip>
      </Card>

      <Card>
        {serif("Estado del día",14,P.charcoal,false,500)}
        <div style={{marginTop:10,fontSize:12,color:P.warmGray,marginBottom:8}}>Podés completar esto ahora o volver más tarde</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
          {EMOTIONS.map(e=>{const cur=(existing.dayStateEmotions||[]);return<Chip key={e} active={cur.includes(e)} onClick={()=>{const n=cur.includes(e)?cur.filter(x=>x!==e):[...cur,e];update({dayStateEmotions:n});}} color={P.indigo} small>{e}</Chip>;})}
        </div>
        <VoiceTextArea value={existing.dayState||""} onChange={v=>update({dayState:v})} placeholder="O escribí/hablá libremente sobre cómo estás..." rows={2}/>
      </Card>
    </div>
  );
}

// ── MOVIMIENTO ────────────────────────────────────────────────────────────────
function WorkoutLog({existing,refreshAppData,videos}){
  const data=existing||{};
  const[customOther,setCustomOther]=useState(data.customOther||"");

  const update=(patch)=>{
    const newData={...data,...patch};
    saveSectionToLS("workout",newData);
    refreshAppData();
  };

  const togSession=(t)=>{
    const cur=data.sessionTypes||[];
    const n=cur.includes(t)?cur.filter(x=>x!==t):[...cur,t];
    // Initialize durations object for new session
    const durations={...(data.sessionDurations||{})};
    if(!cur.includes(t)&&!durations[t]) durations[t]=30;
    update({sessionTypes:n,sessionDurations:durations});
  };

  const setDuration=(t,mins)=>{
    update({sessionDurations:{...(data.sessionDurations||{}),[t]:mins}});
  };

  const gymDay=data.gymDay||1;
  const workout=WORKOUTS[gymDay];
  const sets=data.sets||{};
  const upd=(ei,si,f,v)=>{
    const newSets={...sets,[`${ei}-${si}`]:{...(sets[`${ei}-${si}`]||{}),[f]:v}};
    update({sets:newSets});
  };

  const showGym=(data.sessionTypes||[]).includes("Gym");
  const showPY=(data.sessionTypes||[]).some(t=>["Pilates","Yoga"].includes(t));
  const otherSessions=(data.sessionTypes||[]).filter(t=>!["Gym","Pilates","Yoga"].includes(t));
  const showOther=otherSessions.length>0;

  return(
    <div>
      <Card>
        {lbl("¿Qué tipo de sesión hiciste hoy? (podés elegir varias)")}
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {SESSION_OPTIONS.map(t=><Chip key={t} active={(data.sessionTypes||[]).includes(t)} onClick={()=>togSession(t)} color={t==="Gym"?P.terracotta:["Pilates","Yoga"].includes(t)?P.sage:P.warmGray}>{t}</Chip>)}
        </div>
      </Card>

      {/* GYM */}
      {showGym&&(<>
        <Card style={{background:P.terracotta+"10",borderColor:P.terracotta+"30"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>{serif(workout.name,17,P.charcoal,false,500)}<div style={{marginTop:3,fontSize:11,color:P.warmGray}}>{workout.subtitle}</div></div>
            <div>
              {lbl("Día")}
              <div style={{display:"flex",gap:5}}>
                {[1,2,3].map(d=><button key={d} onClick={()=>update({gymDay:d})} style={{width:28,height:28,borderRadius:"50%",border:`2px solid ${gymDay===d?P.terracotta:P.sand}`,background:gymDay===d?P.terracotta:"transparent",color:gymDay===d?P.white:P.warmGray,fontSize:12,cursor:"pointer"}}>{d}</button>)}
              </div>
            </div>
          </div>
          <div style={{display:"flex",gap:10,marginTop:12}}>
            <div style={{flex:1}}>{lbl("Inicio")}<input type="time" value={data.startTime||""} onChange={e=>update({startTime:e.target.value})} style={{width:"100%",background:P.parchment,border:`1px solid ${P.sand}`,borderRadius:8,padding:"7px 10px",fontSize:13,color:P.charcoal}}/></div>
            <div style={{flex:1}}>{lbl("Fin")}<input type="time" value={data.endTime||""} onChange={e=>update({endTime:e.target.value})} style={{width:"100%",background:P.parchment,border:`1px solid ${P.sand}`,borderRadius:8,padding:"7px 10px",fontSize:13,color:P.charcoal}}/></div>
          </div>
        </Card>

        <Card>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:data.actDone?0:10}}>
            {serif("Activación",13,P.charcoal,false,500)}
            <Chip active={!!data.actDone} onClick={()=>update({actDone:!data.actDone})} color={P.sage} small>{data.actDone?"✓ Hecho":"Marcar"}</Chip>
          </div>
          {!data.actDone&&<div style={{marginTop:8}}>{ACTIVATION.map((a,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:6}}><div style={{width:18,height:18,borderRadius:"50%",background:P.parchment,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:9,color:P.warmGray}}>{i+1}</span></div><span style={{fontSize:11,color:P.charcoal,lineHeight:1.5}}>{a}</span></div>)}</div>}
        </Card>

        <div style={{fontSize:11,color:P.warmGray,fontStyle:"italic",textAlign:"center",marginBottom:8,padding:"0 4px"}}>Completá lo que quieras — cuanto más, mejor registro</div>

        {workout.exercises.map((ex,ei)=>(
          <Card key={ei} delay={ei*0.02} style={{padding:"13px 15px"}}>
            {serif(ex.name,13,P.charcoal,false,500)}
            <div style={{marginTop:2,fontSize:10,color:P.warmGray}}>{ex.sets} series · {ex.reps} · {ex.notes}</div>
            <div style={{display:"grid",gridTemplateColumns:"22px 1fr 1fr 1fr",gap:4,alignItems:"center",marginTop:8}}>
              {["","KG","REPS","NOTA"].map((h,i)=><span key={i} style={{fontSize:9,letterSpacing:"0.08em",color:P.warmGray,textTransform:"uppercase"}}>{h}</span>)}
              {Array.from({length:ex.sets},(_,si)=>[
                <div key={`n${si}`} style={{width:18,height:18,borderRadius:"50%",background:P.terracotta+"20",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:9,color:P.terracotta,fontWeight:500}}>{si+1}</span></div>,
                <input key={`k${si}`} type="number" placeholder="—" value={sets[`${ei}-${si}`]?.kg||""} onChange={e=>upd(ei,si,"kg",e.target.value)} style={{background:P.parchment,border:`1px solid ${P.sand}`,borderRadius:6,padding:"5px 6px",fontSize:12,color:P.charcoal,width:"100%"}}/>,
                <input key={`r${si}`} type="number" placeholder="—" value={sets[`${ei}-${si}`]?.reps||""} onChange={e=>upd(ei,si,"reps",e.target.value)} style={{background:P.parchment,border:`1px solid ${P.sand}`,borderRadius:6,padding:"5px 6px",fontSize:12,color:P.charcoal,width:"100%"}}/>,
                <input key={`t${si}`} type="text" placeholder="..." value={sets[`${ei}-${si}`]?.note||""} onChange={e=>upd(ei,si,"note",e.target.value)} style={{background:P.parchment,border:`1px solid ${P.sand}`,borderRadius:6,padding:"5px 6px",fontSize:10,color:P.charcoal,width:"100%"}}/>
              ])}
            </div>
          </Card>
        ))}
      </>)}

      {/* PILATES / YOGA */}
      {showPY&&(
        <Card style={{background:P.sage+"10",borderColor:P.sage+"40"}}>
          {serif("Pilates / Yoga",14,P.charcoal,false,500)}
          <div style={{marginTop:12}}>
            {videos.length>0?(
              <div>
                {lbl("Elegí tu clase")}
                {videos.map(v=>(
                  <div key={v.id} onClick={()=>update({selectedVideo:v})} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:data.selectedVideo?.id===v.id?P.sage+"20":P.parchment,borderRadius:10,padding:"9px 12px",marginBottom:6,border:`1px solid ${data.selectedVideo?.id===v.id?P.sage:P.sand}`,cursor:"pointer"}}>
                    <div>
                      <div style={{fontSize:12,color:P.charcoal,fontWeight:data.selectedVideo?.id===v.id?500:300}}>{v.name}</div>
                      <div style={{fontSize:9,color:P.sage,marginTop:1}}>{v.category}</div>
                    </div>
                    {data.selectedVideo?.id===v.id&&<span style={{color:P.sage}}>✓</span>}
                  </div>
                ))}
                {data.selectedVideo&&(
                  <div style={{display:"flex",gap:8,marginTop:8,marginBottom:12,alignItems:"center"}}>
                    <a href={data.selectedVideo.url} target="_blank" rel="noopener noreferrer" style={{flex:1,padding:"10px",background:P.sage,color:P.white,borderRadius:10,textDecoration:"none",textAlign:"center",fontFamily:"'Playfair Display',serif",fontSize:14}}>▶ Ir al video</a>
                    <Chip active={!!data.videoDone} onClick={()=>update({videoDone:!data.videoDone})} color={P.sage} small>{data.videoDone?"✓ Hecho":"Marcar"}</Chip>
                  </div>
                )}
              </div>
            ):(
              <div style={{textAlign:"center",padding:"12px 0",color:P.sand,fontSize:12,fontStyle:"italic"}}>Agregá videos en la pestaña Videos</div>
            )}
            <VoiceTextArea value={data.pyNotes||""} onChange={v=>update({pyNotes:v})} placeholder="¿Cómo se sintió la sesión?" rows={2}/>
          </div>
        </Card>
      )}

      {/* OTHER SESSIONS — just time */}
      {showOther&&(
        <Card>
          {serif("Otras actividades",13,P.charcoal,false,500)}
          <div style={{marginTop:10}}>
            {otherSessions.map(s=>(
              <div key={s} style={{background:P.parchment,borderRadius:8,padding:"10px 12px",marginBottom:8}}>
                <div style={{fontSize:12,color:P.warmGray,fontWeight:500,marginBottom:8}}>
                  {s==="Otro"?(
                    <input value={customOther} onChange={e=>{setCustomOther(e.target.value);update({customOther:e.target.value});}} placeholder="¿Qué hiciste?" style={{background:P.white,border:`1px solid ${P.sand}`,borderRadius:6,padding:"4px 8px",fontSize:12,color:P.charcoal,width:"100%"}}/>
                  ):s}
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <button onClick={()=>setDuration(s,Math.max(5,((data.sessionDurations||{})[s]||30)-5))} style={{width:26,height:26,borderRadius:"50%",border:`1px solid ${P.sand}`,background:P.white,cursor:"pointer",fontSize:14}}>−</button>
                  <span style={{fontFamily:"'Playfair Display',serif",fontSize:15,minWidth:50,textAlign:"center"}}>{(data.sessionDurations||{})[s]||30} min</span>
                  <button onClick={()=>setDuration(s,Math.min(180,((data.sessionDurations||{})[s]||30)+5))} style={{width:26,height:26,borderRadius:"50%",border:`1px solid ${P.sand}`,background:P.white,cursor:"pointer",fontSize:14}}>+</button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        {lbl("Pasos del día")}
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <input type="number" value={data.steps||""} onChange={e=>update({steps:e.target.value})} placeholder="Cantidad" style={{flex:1,background:P.parchment,border:`1px solid ${P.sand}`,borderRadius:8,padding:"8px 12px",fontSize:14,color:P.charcoal}}/>
          <span style={{fontSize:12,color:P.warmGray}}>pasos</span>
        </div>
      </Card>

      <Card>
        <Slider value={data.bodyFeel||5} onChange={v=>update({bodyFeel:v})} min={1} max={10} lbl="¿Cómo se sintió el cuerpo?"/>
        <VoiceTextArea value={data.notes||""} onChange={v=>update({notes:v})} placeholder="Observaciones..." rows={2}/>
      </Card>
    </div>
  );
}

// ── NUTRICIÓN ─────────────────────────────────────────────────────────────────
function NutritionLog({existing,refreshAppData,profile,appData}){
  const data=existing||{};
  const[customSupp,setCustomSupp]=useState("");
  const[dayClose,setDayClose]=useState(null);
  const[loadingClose,setLoadingClose]=useState(false);

  const MEALS=[
    {key:"desayuno",label:"Desayuno",icon:"☀️",placeholder:"¿Qué comiste?"},
    {key:"almuerzo",label:"Almuerzo",icon:"🌿",placeholder:"¿Qué comiste?"},
    {key:"merienda",label:"Merienda",icon:"🕓",placeholder:"Con proteína — ¿qué comiste?"},
    {key:"cena",label:"Cena",icon:"🌙",placeholder:"¿Qué comiste?"},
  ];

  const update=(patch)=>{
    const newData={...data,...patch};
    saveSectionToLS("nutrition",newData);
    refreshAppData();
  };

  const meals=data.meals||{};
  const setMealF=(k,f,v)=>{
    const newMeals={...meals,[k]:{...(meals[k]||{}),[f]:v}};
    update({meals:newMeals});
  };

  const water=data.water||0;
  const supps=data.supps||[];
  const togSupp=s=>update({supps:supps.includes(s)?supps.filter(x=>x!==s):[...supps,s]});
  const addCustomSupp=()=>{if(customSupp.trim()&&!supps.includes(customSupp.trim())){update({supps:[...supps,customSupp.trim()]});setCustomSupp("");}};

  const handlePhoto=(k)=>{
    const input=document.createElement("input");
    input.type="file";input.accept="image/*";input.capture="environment";
    input.onchange=(e)=>{
      const file=e.target.files[0];
      if(file){
        const reader=new FileReader();
        reader.onload=(ev)=>{
          // Save photo WITHOUT touching existing text
          const currentMeal=meals[k]||{};
          const newMeals={...meals,[k]:{...currentMeal,photo:ev.target.result}};
          update({meals:newMeals});
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const generateClose=async()=>{
    setLoadingClose(true);
    const phase=getPhase(appData.cycle?.currentDay||5);
    const todayData=appData.entries?.[today()]||{};
    const objectives=profile?.objectives||"bajar grasa corporal, reducir antojos de dulce, mejorar energía";
    const challenges=profile?.challenges||"antojos de dulce en la tarde/noche, urgencia financiera";

    const prompt=`Generá un cierre del día BREVE (4-5 líneas máximo) para Julieta. Cálido, útil, sin culpa, sin detalles obsesivos.

Sus objetivos: ${objectives}
Sus fricciones: ${challenges}
Fase actual del ciclo: ${phase.name}, día ${appData.cycle?.currentDay}

Datos del día:
- Desayuno: ${meals.desayuno?.text||"no registrado"} (${meals.desayuno?.time||"sin hora"})
- Almuerzo: ${meals.almuerzo?.text||"no registrado"} (${meals.almuerzo?.time||"sin hora"})
- Merienda: ${meals.merienda?.text||"no registrada"} (${meals.merienda?.time||"sin hora"})
- Cena: ${meals.cena?.text||"no registrada"} (${meals.cena?.time||"sin hora"})
- Agua: ${water} vasos
- Suplementos: ${supps.join(", ")||"ninguno"}
- Movimiento hoy: ${todayData.workout?.sessionTypes?.join(", ")||"no registrado"}
- Estado al despertar: ${todayData.morning?.wakeupFeel?.join(", ")||"no registrado"}
- Emociones: ${todayData.morning?.dayStateEmotions?.join(", ")||"no registradas"}

Tu cierre debe:
- Conectar comida + ciclo + emociones + movimiento cuando tenga sentido
- Dar 1 sugerencia concreta si hay algo útil (ej: "la merienda con más proteína ayuda a llegar con menos ganas de dulce a la noche")
- Reconocer lo bueno cuando estuvo bien
- Mencionar si los horarios fueron caóticos o estuvieron ordenados
- NO contar calorías ni criticar cantidades
- NO usar culpa, NO ser paternalista
- Terminar con algo que sume, no que presione

Máximo 5 líneas. Directo, útil, cálido.`;

    const r=await callAI(JULI_CTX,prompt,400);
    setDayClose(r);setLoadingClose(false);
  };

  return(
    <div>
      {MEALS.map(({key:k,label,icon,placeholder})=>(
        <Card key={k} style={{padding:"13px 15px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:15}}>{icon}</span>{serif(label,13,P.charcoal,false,500)}</div>
            <input type="time" value={meals[k]?.time||""} onChange={e=>setMealF(k,"time",e.target.value)} style={{background:P.parchment,border:`1px solid ${P.sand}`,borderRadius:7,padding:"4px 8px",fontSize:11,color:P.warmGray,width:82}}/>
          </div>
          {meals[k]?.photo&&(
            <div style={{position:"relative",marginBottom:8}}>
              <img src={meals[k].photo} alt="plato" style={{width:"100%",borderRadius:8,maxHeight:150,objectFit:"cover"}}/>
              <button onClick={()=>setMealF(k,"photo","")} style={{position:"absolute",top:6,right:6,background:"rgba(0,0,0,0.6)",color:"white",border:"none",borderRadius:"50%",width:24,height:24,cursor:"pointer",fontSize:12}}>×</button>
            </div>
          )}
          <div style={{display:"flex",gap:6,marginBottom:6,alignItems:"center"}}>
            <button onClick={()=>handlePhoto(k)} style={{padding:"6px 10px",background:P.parchment,border:`1px solid ${P.sand}`,borderRadius:8,fontSize:11,color:P.warmGray,cursor:"pointer"}}>📷 {meals[k]?.photo?"Cambiar foto":"Foto"}</button>
            <span style={{fontSize:11,color:P.sand}}>o escribí / hablá</span>
          </div>
          <VoiceTextArea value={meals[k]?.text||""} onChange={v=>setMealF(k,"text",v)} placeholder={placeholder} rows={2}/>
        </Card>
      ))}

      <Card>
        {lbl("Agua del día")}
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <button onClick={()=>update({water:Math.max(0,water-1)})} style={{width:32,height:32,borderRadius:"50%",border:`1px solid ${P.sand}`,background:P.parchment,cursor:"pointer",fontSize:18}}>−</button>
          <span style={{fontFamily:"'Playfair Display',serif",fontSize:24,color:P.sage,minWidth:40,textAlign:"center"}}>{water}</span>
          <button onClick={()=>update({water:water+1})} style={{width:32,height:32,borderRadius:"50%",border:`1px solid ${P.sand}`,background:P.parchment,cursor:"pointer",fontSize:18}}>+</button>
          <span style={{fontSize:12,color:P.warmGray}}>vasos</span>
        </div>
      </Card>

      <Card>
        <div style={{marginBottom:10}}>{lbl("Inflamación")}<div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{["nada","poca","moderada","mucha"].map(o=><Chip key={o} active={data.inflammation===o} onClick={()=>update({inflammation:o})} small>{o}</Chip>)}</div></div>
        <Chip active={!!data.bathroom} onClick={()=>update({bathroom:!data.bathroom})} color={P.sage} small>{data.bathroom?"✓ Fui al baño":"¿Fuiste al baño?"}</Chip>
      </Card>

      <Card>
        {lbl("Suplementos de hoy")}
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>{SUPPLS.map(s=><Chip key={s} active={supps.includes(s)} onClick={()=>togSupp(s)} small>{s}</Chip>)}</div>
        <div style={{display:"flex",gap:6}}>
          <input value={customSupp} onChange={e=>setCustomSupp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addCustomSupp()} placeholder="Otro suplemento..." style={{flex:1,background:P.parchment,border:`1px solid ${P.sand}`,borderRadius:8,padding:"6px 10px",fontSize:12,color:P.charcoal}}/>
          <button onClick={addCustomSupp} style={{padding:"6px 10px",background:P.terracotta,color:P.white,border:"none",borderRadius:8,fontSize:12,cursor:"pointer"}}>+</button>
        </div>
        {supps.filter(s=>!SUPPLS.includes(s)).map(s=>(
          <span key={s} style={{display:"inline-block",background:P.parchment,border:`1px solid ${P.sand}`,borderRadius:20,padding:"3px 10px",fontSize:11,color:P.charcoal,margin:"4px 4px 0 0"}}>{s} <button onClick={()=>togSupp(s)} style={{background:"none",border:"none",cursor:"pointer",color:P.sand,fontSize:12}}>×</button></span>
        ))}
      </Card>

      <Card>
        {lbl("Notas adicionales")}
        <VoiceTextArea value={data.extraNotes||""} onChange={v=>update({extraNotes:v})} placeholder="Algo fuera del plan, cómo te sentiste..." rows={2}/>
      </Card>

      <Card style={{background:`linear-gradient(135deg,${P.terracotta}10,${P.sage}10)`,borderColor:P.terracotta+"30"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:dayClose?10:0}}>
          {serif("Cierre del día",14,P.charcoal,false,500)}
          <button onClick={generateClose} disabled={loadingClose} style={{padding:"6px 14px",background:loadingClose?P.sand:P.terracotta,color:P.white,border:"none",borderRadius:20,fontSize:11,cursor:"pointer",fontFamily:"'Jost',sans-serif",fontWeight:500}}>
            {loadingClose?"...":dayClose?"↺ Regenerar":"✦ Generar"}
          </button>
        </div>
        {loadingClose&&<Loader/>}
        {dayClose&&<div style={{fontFamily:"'Playfair Display',serif",fontSize:13,lineHeight:1.8,fontStyle:"italic",color:P.charcoal,whiteSpace:"pre-line"}}>{dayClose}</div>}
        {!dayClose&&!loadingClose&&<div style={{fontSize:12,color:P.sand,fontStyle:"italic",textAlign:"center",padding:"8px 0"}}>Tocá cuando hayas terminado el día. Cruza tu comida con ciclo, emociones y movimiento.</div>}
      </Card>
    </div>
  );
}

// ── CICLO ─────────────────────────────────────────────────────────────────────
function CycleView({cycleData,onUpdate}){
  const[day,setDay]=useState(cycleData?.currentDay||5);
  const[cycleType,setCycleType]=useState(cycleData?.cycleType||"Regular");
  const[periodStart,setPeriodStart]=useState(cycleData?.periodStart||"");
  const[periodEnd,setPeriodEnd]=useState(cycleData?.periodEnd||"");
  const[symptoms,setSymptoms]=useState(cycleData?.symptoms||[]);
  const[cycleNote,setCycleNote]=useState(cycleData?.cycleNote||"");
  const phase=getPhase(day);

  const togSymptom=s=>setSymptoms(p=>p.includes(s)?p.filter(x=>x!==s):[...p,s]);

  return(
    <div style={{animation:"fadeUp 0.4s ease"}}>
      <Card>
        <div style={{textAlign:"center",paddingBottom:14}}>
          <div style={{fontSize:36,marginBottom:6}}>{phase.icon}</div>
          {serif(phase.name,20,phase.color)}
          <div style={{marginTop:4,fontSize:11,color:P.warmGray}}>Día {day}</div>
        </div>
        <div style={{background:P.parchment,borderRadius:10,padding:"10px 14px",marginBottom:12,fontSize:12,color:P.charcoal,lineHeight:1.7,fontWeight:300}}>{phase.desc}</div>
        <div style={{background:`linear-gradient(135deg,${phase.color}20,${phase.color}08)`,borderRadius:10,padding:"10px 14px",marginBottom:14,borderLeft:`3px solid ${phase.color}`}}>
          <div style={{fontSize:9,letterSpacing:"0.1em",textTransform:"uppercase",color:phase.color,marginBottom:4}}>Nutrición esta fase</div>
          <div style={{fontSize:12,color:P.charcoal,lineHeight:1.6,fontWeight:300}}>{phase.foods}</div>
        </div>
        {lbl("Día del ciclo")}
        <div style={{display:"flex",gap:2,flexWrap:"wrap",marginBottom:12}}>
          {Array.from({length:28},(_,i)=>{const d=i+1,ph=getPhase(d),active=d===day;return<button key={d} onClick={()=>setDay(d)} style={{width:21,height:21,borderRadius:"50%",border:active?`2px solid ${ph.color}`:"none",background:active?ph.color:ph.color+"30",cursor:"pointer",fontSize:9,color:active?P.white:P.charcoal,fontWeight:active?600:300}}>{d}</button>;})}</div>
      </Card>

      <Card>
        {lbl("Tipo de ciclo")}
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
          {CYCLE_TYPES.map(t=><Chip key={t} active={cycleType===t} onClick={()=>setCycleType(t)} small>{t}</Chip>)}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <div>
            {lbl("Inicio menstruación")}
            <input type="date" value={periodStart} onChange={e=>setPeriodStart(e.target.value)} style={{width:"100%",background:P.parchment,border:`1px solid ${P.sand}`,borderRadius:8,padding:"7px 10px",fontSize:12,color:P.charcoal}}/>
          </div>
          <div>
            {lbl("Fin menstruación")}
            <input type="date" value={periodEnd} onChange={e=>setPeriodEnd(e.target.value)} style={{width:"100%",background:P.parchment,border:`1px solid ${P.sand}`,borderRadius:8,padding:"7px 10px",fontSize:12,color:P.charcoal}}/>
          </div>
        </div>
        {cycleType==="Amenorrea"&&<div style={{background:P.gold+"15",borderRadius:8,padding:"8px 12px",fontSize:12,color:P.charcoal,marginBottom:8}}>Registrando ausencia de menstruación — toda tu data sigue siendo válida.</div>}
      </Card>

      <Card>
        {lbl("Síntomas")}
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
          {CYCLE_SYMPTOMS.map(s=><Chip key={s} active={symptoms.includes(s)} onClick={()=>togSymptom(s)} small>{s}</Chip>)}
        </div>
        <VoiceTextArea value={cycleNote} onChange={setCycleNote} placeholder="Notas libres sobre tu ciclo..." rows={2}/>
      </Card>

      <button onClick={()=>onUpdate({currentDay:day,cycleType,periodStart,periodEnd,symptoms,cycleNote,updatedAt:today()})} style={{width:"100%",padding:"13px",background:P.terracotta,color:P.white,border:"none",borderRadius:11,fontFamily:"'Playfair Display',serif",fontSize:15,cursor:"pointer"}}>Guardar ciclo</button>
    </div>
  );
}

// ── ASTROLOGÍA ────────────────────────────────────────────────────────────────
function AstrologyView({cycleData}){
  const[reading,setReading]=useState(null);
  const[loading,setLoading]=useState(false);
  const phase=getPhase(cycleData?.currentDay||5);

  const generate=async()=>{
    setLoading(true);
    const dateStr=new Date().toLocaleDateString("es-AR",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
    const r=await callAI(
      "Sos una astrologa con conocimiento real de tránsitos planetarios. Solo afirmás cosas astronómicamente verificables. Respondés en español rioplatense.",
      `Carta natal de Julieta: Sol Géminis, Ascendente Aries, Luna Piscis. Nacida el 6/6/1988, 3:30am, Olavarría.
Hoy es ${dateStr}.

Hablame de los tránsitos planetarios verificables hoy (Saturno, Júpiter, Urano, Neptuno, Plutón, más posición lunar). Conectá con su carta.

1. Tránsitos reales de hoy y cómo la tocan
2. Un portal concreto

Máximo 180 palabras. Si no estás 100% segura de algo, decilo.`,500
    );
    setReading(r);setLoading(false);
  };

  return(
    <div style={{animation:"fadeUp 0.4s ease"}}>
      <Card style={{background:`linear-gradient(135deg,${P.indigo}15,${P.gold}08)`,borderColor:P.indigo+"30"}}>
        <div style={{fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:P.indigo,marginBottom:10}}>Tu carta natal</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
          {[{l:"Sol",v:"Géminis ♊",c:P.gold},{l:"Ascendente",v:"Aries ♈",c:P.terracotta},{l:"Luna",v:"Piscis ♓",c:P.indigo}].map(({l,v,c})=>(
            <div key={l} style={{textAlign:"center",background:P.white,borderRadius:8,padding:"8px 6px"}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:13,color:c,marginBottom:2}}>{v}</div>
              <div style={{fontSize:9,color:P.warmGray,letterSpacing:"0.08em",textTransform:"uppercase"}}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{fontSize:11,color:P.warmGray,lineHeight:1.6,fontStyle:"italic"}}>La mente que conecta puntos invisibles · el espíritu que arranca sin permiso · el alma que siente todo</div>
      </Card>

      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:reading?12:0}}>
          {serif("Lectura de hoy",14,P.charcoal,false,500)}
          <button onClick={generate} disabled={loading} style={{padding:"6px 14px",background:loading?P.sand:P.indigo,color:P.white,border:"none",borderRadius:20,fontSize:11,cursor:loading?"default":"pointer",fontFamily:"'Jost',sans-serif",fontWeight:500}}>{loading?"...":"✦ Consultar"}</button>
        </div>
        {loading&&<Loader/>}
        {reading&&!loading&&<div style={{fontFamily:"'Playfair Display',serif",fontSize:13,lineHeight:1.9,color:P.charcoal,whiteSpace:"pre-line",fontStyle:"italic"}}>{reading}</div>}
        {!reading&&!loading&&<div style={{textAlign:"center",padding:"16px 0",color:P.sand,fontSize:12,fontStyle:"italic"}}>Tocá "Consultar" para ver qué dice el cielo hoy</div>}
      </Card>

      <Card style={{background:P.indigo+"08",borderColor:P.indigo+"20"}}>
        <div style={{fontSize:9,letterSpacing:"0.1em",textTransform:"uppercase",color:P.indigo,marginBottom:8}}>Arquetipo — fase {phase.name}</div>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:13,lineHeight:1.7,color:P.charcoal}}>
          {phase.key==="menstrual"&&"La Bruja. La que sabe sin explicar. La que descansa sin culpa. La que suelta lo que ya no sirve."}
          {phase.key==="folicular"&&"La Doncella. La que empieza. La que ve posibilidades donde otros ven problemas."}
          {phase.key==="ovulatoria"&&"La Madre. La que da. La que conecta. La que irradia sin esfuerzo."}
          {phase.key==="lutea"&&"La Hechicera. La que siente todo. La que necesita verdad."}
        </div>
      </Card>
    </div>
  );
}

// ── ANÁLISIS ──────────────────────────────────────────────────────────────────
function AnalisisView({entries,cycleData,profile}){
  const[analysis,setAnalysis]=useState(null);
  const[loading,setLoading]=useState(false);
  const todayEntry=entries[today()]||{};

  const getLast7=()=>{
    const days=[];
    for(let i=6;i>=0;i--){
      const d=new Date();d.setDate(d.getDate()-i);
      const key=d.toISOString().split("T")[0];
      if(entries[key]) days.push({date:key,...entries[key]});
    }
    return days;
  };
  const last7=getLast7();

  const metrics=[
    {l:"Sueño prom.",v:last7.filter(e=>e.morning?.sleepH).length?(Math.round(last7.filter(e=>e.morning?.sleepH).reduce((a,e)=>a+(e.morning.sleepH||0),0)/last7.filter(e=>e.morning?.sleepH).length*10)/10)+"h":"—",c:P.warmGray,icon:"🌙"},
    {l:"Agua prom.",v:last7.filter(e=>e.nutrition?.water).length?Math.round(last7.filter(e=>e.nutrition?.water).reduce((a,e)=>a+(e.nutrition.water||0),0)/last7.filter(e=>e.nutrition?.water).length)+" vasos":"—",c:P.sage,icon:"💧"},
    {l:"Moví el cuerpo",v:last7.filter(e=>e.workout?.sessionTypes?.length>0).length+"/"+last7.length,c:P.terracotta,icon:"✦"},
    {l:"Pasos prom.",v:last7.filter(e=>e.workout?.steps).length?Math.round(last7.filter(e=>e.workout?.steps).reduce((a,e)=>a+(+e.workout.steps||0),0)/last7.filter(e=>e.workout?.steps).length).toLocaleString():"—",c:P.gold,icon:"👣"},
    {l:"Ritual mañana",v:last7.filter(e=>e.morning?.ritualDone).length+"/"+last7.length,c:P.gold,icon:"☀️"},
    {l:"Registrados",v:last7.length+"/7",c:P.sage,icon:"📋"},
  ];

  const generate=async()=>{
    setLoading(true);
    const phase=getPhase(cycleData?.currentDay||5);
    const objectives=profile?.objectives||"mejorar bienestar, reducir antojos, sentirse bien con su cuerpo";
    const challenges=profile?.challenges||"antojos de dulce, procrastinación, urgencia financiera";
    const prompt=`Sos el micelio de Julieta. Analizá sus datos y mostrá conexiones reales que ella quizás no ve.

Objetivos: ${objectives}
Fricciones: ${challenges}
Fase: ${phase.name} día ${cycleData?.currentDay}
Carta: Sol Géminis, Asc Aries, Luna Piscis

Datos últimos días:
${JSON.stringify(last7,null,2)}

3 partes BREVES:
1. **Lo que emerge** — patrón real, conexiones entre emociones/sueño/movimiento/comida
2. **Una conexión que tal vez no viste** — cruza distintas áreas. Pregunta que abre, como "¿y si esta dificultad vino a empujarte a crear algo diferente?"
3. **Una frase o pregunta** que la conecte con quien está construyendo

Máximo 200 palabras. Directo, sin relleno.`;
    const r=await callAI(JULI_CTX,prompt,700);
    setAnalysis(r);setLoading(false);
  };

  return(
    <div style={{animation:"fadeUp 0.4s ease"}}>
      <Card>
        <div style={{fontSize:9,letterSpacing:"0.12em",textTransform:"uppercase",color:P.terracotta,marginBottom:12}}>Últimos {last7.length} días</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
          {metrics.map(({l,v,c,icon})=>(
            <div key={l} style={{background:P.parchment,borderRadius:10,padding:"10px 12px"}}>
              <div style={{fontSize:9,letterSpacing:"0.08em",textTransform:"uppercase",color:P.warmGray,marginBottom:4}}>{icon} {l}</div>
              <span style={{fontFamily:"'Playfair Display',serif",fontSize:16,color:c,fontWeight:500}}>{v}</span>
            </div>
          ))}
        </div>
        {last7.some(e=>e.nutrition?.water)&&(
          <div style={{marginBottom:12}}>
            <div style={{fontSize:10,letterSpacing:"0.08em",textTransform:"uppercase",color:P.warmGray,marginBottom:6}}>💧 Agua</div>
            <div style={{display:"flex",gap:3,alignItems:"flex-end",height:40}}>
              {last7.map((e,i)=>{const w=e.nutrition?.water||0;const h=Math.max(3,(w/12)*40);const color=w>=6?P.sage:w>=3?P.sand:P.terracottaLight;return<div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}><div style={{width:"100%",height:h,background:color,borderRadius:3}}/><span style={{fontSize:8,color:P.warmGray}}>{w||"·"}</span></div>;})}
            </div>
          </div>
        )}
        {last7.some(e=>e.morning?.sleepH)&&(
          <div>
            <div style={{fontSize:10,letterSpacing:"0.08em",textTransform:"uppercase",color:P.warmGray,marginBottom:6}}>🌙 Sueño</div>
            <div style={{display:"flex",gap:3,alignItems:"flex-end",height:40}}>
              {last7.map((e,i)=>{const s=e.morning?.sleepH||0;const h=Math.max(3,(s/10)*40);const color=s>=7?P.sage:s>=5?P.sand:P.terracottaLight;return<div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}><div style={{width:"100%",height:h,background:color,borderRadius:3}}/><span style={{fontSize:8,color:P.warmGray}}>{s||"·"}</span></div>;})}
            </div>
          </div>
        )}
      </Card>

      <Card style={{background:`linear-gradient(135deg,${P.terracotta}10,${P.sage}10)`,borderColor:P.terracotta+"30"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:analysis?12:0}}>
          {serif("Mi análisis",15,P.charcoal,false,500)}
          <button onClick={generate} disabled={loading} style={{padding:"7px 14px",background:loading?P.sand:P.terracotta,color:P.white,border:"none",borderRadius:20,fontSize:11,cursor:"pointer",fontFamily:"'Jost',sans-serif",fontWeight:500}}>
            {loading?"Analizando...":analysis?"↺ Regenerar":"✦ Generar"}
          </button>
        </div>
        {loading&&<Loader/>}
        {analysis&&!loading&&<div style={{fontFamily:"'Playfair Display',serif",fontSize:13,lineHeight:1.9,fontStyle:"italic",color:P.charcoal,whiteSpace:"pre-line"}}>{analysis}</div>}
        {!analysis&&!loading&&<div style={{textAlign:"center",padding:"12px 0",color:P.sand,fontSize:12,fontStyle:"italic"}}>Generá cuando quieras — cruza todo</div>}
      </Card>

      {Object.keys(todayEntry).length>0&&(
        <Card>
          <div style={{fontSize:9,letterSpacing:"0.1em",textTransform:"uppercase",color:P.warmGray,marginBottom:12}}>Hoy</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {[
              {l:"Movimiento",v:todayEntry.workout?.sessionTypes?.join(", ")||"—"},
              {l:"Agua",v:todayEntry.nutrition?.water!=null?`${todayEntry.nutrition.water} vasos`:"—"},
              {l:"Sueño",v:todayEntry.morning?.sleepH?`${todayEntry.morning.sleepH}h`:"—"},
              {l:"Pasos",v:todayEntry.workout?.steps||"—"},
              {l:"Al despertar",v:todayEntry.morning?.wakeupFeel?.slice(0,2).join(", ")||"—"},
              {l:"Ritual",v:todayEntry.morning?.ritualDone?"✓":"—"},
            ].map(({l,v})=>(
              <div key={l} style={{background:P.parchment,borderRadius:8,padding:"8px 11px"}}>
                <div style={{fontSize:9,letterSpacing:"0.08em",textTransform:"uppercase",color:P.warmGray,marginBottom:3}}>{l}</div>
                <span style={{fontFamily:"'Playfair Display',serif",fontSize:13}}>{v}</span>
              </div>
            ))}
          </div>
          {todayEntry.morning?.dayState&&<div style={{marginTop:10,borderTop:`1px solid ${P.parchment}`,paddingTop:10,fontSize:12,color:P.warmGray,fontStyle:"italic"}}>{todayEntry.morning.dayState}</div>}
        </Card>
      )}
    </div>
  );
}

// ── CHAT ──────────────────────────────────────────────────────────────────────
function AIChat({todayEntry,cycleData,profile}){
  const[msgs,setMsgs]=useState([{role:"assistant",content:"Hola Juli. ¿Qué querés explorar hoy?"}]);
  const[input,setInput]=useState("");
  const[loading,setLoading]=useState(false);
  const[listening,setListening]=useState(false);
  const bottomRef=useRef(null);
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[msgs]);

  const QUICK=["¿Qué patrón estás viendo?","Ayudame a ver esto diferente","Estoy procrastinando","¿Y si lo intento de otra manera?"];

  const startVoice=()=>{
    if(!('webkitSpeechRecognition'in window||'SpeechRecognition'in window)){alert("Usá Chrome para voz");return;}
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    const rec=new SR();
    rec.lang="es-AR";rec.continuous=false;rec.interimResults=false;
    rec.onstart=()=>setListening(true);
    rec.onend=()=>setListening(false);
    rec.onresult=(e)=>setInput(e.results[0][0].transcript);
    rec.onerror=()=>setListening(false);
    rec.start();
  };

  const send=async(text)=>{
    if(!text.trim()) return;
    setMsgs(p=>[...p,{role:"user",content:text}]);setInput("");setLoading(true);
    const phase=cycleData?.currentDay?getPhase(cycleData.currentDay):null;
    const ctx=`Contexto completo de hoy:
- Fase: ${phase?`${phase.name} día ${cycleData.currentDay}`:"no registrada"}
- Al despertar: ${todayEntry?.morning?.wakeupFeel?.join(", ")||"—"}
- Pensamientos al despertar: ${todayEntry?.morning?.thoughts||"—"}
- Estado del día: ${todayEntry?.morning?.dayState||"—"}
- Emociones: ${todayEntry?.morning?.dayStateEmotions?.join(", ")||"—"}
- Sueño: ${todayEntry?.morning?.sleepH||"?"}h (${todayEntry?.morning?.sleepQ||"?"})
- Movimiento: ${todayEntry?.workout?.sessionTypes?.join(", ")||"—"}
- Comidas: desayuno ${todayEntry?.nutrition?.meals?.desayuno?.text||"—"}, almuerzo ${todayEntry?.nutrition?.meals?.almuerzo?.text||"—"}, merienda ${todayEntry?.nutrition?.meals?.merienda?.text||"—"}, cena ${todayEntry?.nutrition?.meals?.cena?.text||"—"}
- Agua: ${todayEntry?.nutrition?.water!=null?todayEntry.nutrition.water+" vasos":"—"}
- Objetivos: ${profile?.objectives||"—"}
- Fricciones: ${profile?.challenges||"—"}`;
    const history=msgs.slice(-6).map(m=>({role:m.role,content:m.content}));
    const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:600,system:JULI_CTX+"\n\n"+ctx,messages:[...history,{role:"user",content:text}]})});
    const d=await r.json();
    setMsgs(p=>[...p,{role:"assistant",content:d.content?.[0]?.text||"Seguimos."}]);setLoading(false);
  };

  return(
    <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 150px)"}}>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",paddingBottom:10}}>
        {QUICK.map(q=><button key={q} onClick={()=>send(q)} style={{padding:"4px 10px",borderRadius:20,border:`1px solid ${P.sand}`,background:P.white,color:P.warmGray,fontSize:10,cursor:"pointer",fontFamily:"'Jost',sans-serif"}}>{q}</button>)}
      </div>
      <div style={{flex:1,overflowY:"auto",paddingRight:4}}>
        {msgs.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",marginBottom:10}}>
            <div style={{maxWidth:"84%",padding:"10px 13px",borderRadius:m.role==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px",background:m.role==="user"?P.terracotta:P.white,border:m.role==="assistant"?`1px solid ${P.parchment}`:"none",color:m.role==="user"?P.white:P.charcoal,fontSize:13,lineHeight:1.65,fontWeight:300}}>{m.content}</div>
          </div>
        ))}
        {loading&&<div style={{display:"flex",gap:4,padding:"10px 13px",background:P.white,border:`1px solid ${P.parchment}`,borderRadius:"14px 14px 14px 4px",width:"fit-content",marginBottom:10}}>{[0,0.2,0.4].map((d,i)=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:P.sand,animation:`pulse 1s ease ${d}s infinite`}}/>)}</div>}
        <div ref={bottomRef}/>
      </div>
      <div style={{display:"flex",gap:8,paddingTop:10,borderTop:`1px solid ${P.parchment}`,alignItems:"center"}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send(input)} placeholder="Escribí o hablá..." style={{flex:1,background:P.white,border:`1px solid ${P.sand}`,borderRadius:22,padding:"10px 14px",fontSize:13,color:P.charcoal}}/>
        <button onClick={startVoice} style={{width:38,height:38,borderRadius:"50%",background:listening?P.terracotta:P.terracotta+"20",border:"none",cursor:"pointer",fontSize:14}}>{listening?"●":"🎤"}</button>
        <button onClick={()=>send(input)} disabled={!input.trim()||loading} style={{width:38,height:38,borderRadius:"50%",background:input.trim()?P.terracotta:P.sand,border:"none",cursor:"pointer",color:P.white,fontSize:16}}>↑</button>
      </div>
    </div>
  );
}

// ── VIDEOS ────────────────────────────────────────────────────────────────────
function VideoLibrary({videos,onUpdate}){
  const[name,setName]=useState("");const[url,setUrl]=useState("");const[cat,setCat]=useState("Yoga");
  const CATS=["Yoga","Pilates","Meditación","Respiración","Movilidad","Otro"];
  const add=()=>{if(!name.trim()||!url.trim()) return;onUpdate([...videos,{id:Date.now(),name:name.trim(),url:url.trim(),category:cat}]);setName("");setUrl("");};
  const remove=(id)=>onUpdate(videos.filter(v=>v.id!==id));
  return(
    <div>
      <Card>
        {serif("Agregar clase",14,P.charcoal,false,500)}
        <div style={{marginTop:12}}>
          {lbl("Categoría")}<div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>{CATS.map(c=><Chip key={c} active={cat===c} onClick={()=>setCat(c)} color={P.sage} small>{c}</Chip>)}</div>
          {lbl("Nombre")}<input value={name} onChange={e=>setName(e.target.value)} placeholder="Ej: Yin yoga 45min..." style={{width:"100%",background:P.parchment,border:`1px solid ${P.sand}`,borderRadius:8,padding:"8px 12px",fontSize:13,color:P.charcoal,marginBottom:8}}/>
          {lbl("Link de YouTube")}<input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://youtube.com/..." style={{width:"100%",background:P.parchment,border:`1px solid ${P.sand}`,borderRadius:8,padding:"8px 12px",fontSize:13,color:P.charcoal,marginBottom:10}}/>
          <button onClick={add} disabled={!name.trim()||!url.trim()} style={{width:"100%",padding:"10px",background:P.sage,color:P.white,border:"none",borderRadius:10,fontFamily:"'Playfair Display',serif",fontSize:14,cursor:"pointer"}}>+ Agregar</button>
        </div>
      </Card>
      {videos.length===0&&<div style={{textAlign:"center",padding:"20px",color:P.sand,fontSize:12,fontStyle:"italic"}}>Todavía no agregaste videos</div>}
      {CATS.filter(c=>videos.some(v=>v.category===c)).map(c=>(
        <div key={c}>
          <div style={{fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",color:P.warmGray,marginBottom:6,marginTop:4,paddingLeft:4}}>{c}</div>
          {videos.filter(v=>v.category===c).map(v=>(
            <Card key={v.id} style={{padding:"11px 14px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontFamily:"'Playfair Display',serif",fontSize:13,flex:1}}>{v.name}</span>
                <div style={{display:"flex",gap:6}}>
                  <a href={v.url} target="_blank" rel="noopener noreferrer" style={{padding:"5px 10px",background:P.terracotta,color:P.white,borderRadius:16,fontSize:10,textDecoration:"none"}}>▶ Ver</a>
                  <button onClick={()=>remove(v.id)} style={{background:"none",border:"none",color:P.sand,cursor:"pointer",fontSize:16}}>×</button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── HISTORIAL ─────────────────────────────────────────────────────────────────
function HistoryView({entries}){
  const sorted=Object.values(entries).filter(e=>e.date).sort((a,b)=>b.date.localeCompare(a.date));
  if(!sorted.length) return<div style={{textAlign:"center",padding:"60px 20px"}}>{serif("Tu historia comienza hoy",20,P.warmGray,true)}</div>;
  return<div>{sorted.map((e,i)=>(
    <Card key={e.date} delay={i*0.03} style={{padding:"12px 14px"}}>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:13,fontWeight:500,textTransform:"capitalize",marginBottom:6}}>{new Date(e.date+"T12:00:00").toLocaleDateString("es-AR",{weekday:"long",day:"numeric",month:"long"})}</div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:4}}>
        {e.workout?.sessionTypes?.length>0&&<span style={{fontSize:10,color:P.terracotta}}>✦ {e.workout.sessionTypes.join(", ")}</span>}
        {e.workout?.steps&&<span style={{fontSize:10,color:P.warmGray}}>👣{e.workout.steps}</span>}
        {e.nutrition?.water!=null&&<span style={{fontSize:10,color:P.sage}}>💧{e.nutrition.water}</span>}
        {e.morning?.sleepH&&<span style={{fontSize:10,color:P.warmGray}}>🌙{e.morning.sleepH}h</span>}
        {e.morning?.ritualDone&&<span style={{fontSize:10,color:P.gold}}>☀️</span>}
      </div>
      {e.morning?.wakeupFeel?.length>0&&<div style={{fontSize:10,color:P.warmGray,marginBottom:2}}>{e.morning.wakeupFeel.slice(0,3).join(" · ")}</div>}
      {e.morning?.dayState&&<div style={{fontSize:10,color:P.warmGray,fontStyle:"italic",marginBottom:2}}>{e.morning.dayState.slice(0,60)}{e.morning.dayState.length>60?"...":""}</div>}
    </Card>
  ))}</div>;
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function App(){
  const[tab,setTab]=useState("manana");
  const[subTab,setSubTab]=useState("movimiento");
  const[appData,setAppData]=useState(loadAppData());
  const[mantras,setMantras]=useState(loadMantras());
  const[videos,setVideos]=useState(loadVideos());
  const[profile]=useState({objectives:"bajar grasa corporal, reducir antojos de dulce, mejorar energía, sentirse bien con su cuerpo",challenges:"antojos de dulce en tarde/noche, procrastinación, urgencia financiera"});

  const refreshAppData=useCallback(()=>{
    setAppData(loadAppData());
  },[]);

  const todayEntry=appData.entries?.[today()]||{};
  const phase=getPhase(appData.cycle?.currentDay||5);
  const todayFmt=new Date().toLocaleDateString("es-AR",{weekday:"long",day:"numeric",month:"long"});

  const updateMantras=(m)=>{setMantras(m);saveMantras(m);};
  const updateVideos=(v)=>{setVideos(v);saveVideos(v);};
  const updateCycle=(d)=>{const u={...appData,cycle:d};setAppData(u);saveAppData(u);};

  const TABS=[
    {k:"manana",l:"Mañana"},
    {k:"hoy",l:"Hoy"},
    {k:"ciclo",l:"Ciclo"},
    {k:"astro",l:"Astro"},
    {k:"analisis",l:"Análisis"},
    {k:"chat",l:"Chat"},
    {k:"videos",l:"Videos"},
    {k:"historial",l:"Historial"},
  ];
  const HOY_TABS=[
    {k:"movimiento",l:"Movimiento",done:!!todayEntry.workout},
    {k:"nutricion",l:"Nutrición",done:!!todayEntry.nutrition},
  ];

  return(
    <div style={{minHeight:"100vh",background:P.cream,maxWidth:480,margin:"0 auto"}}>
      <style>{GS}</style>
      <div style={{background:P.white,borderBottom:`1px solid ${P.parchment}`,padding:"16px 18px 0",position:"sticky",top:0,zIndex:10,boxShadow:"0 2px 12px rgba(40,38,31,0.06)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
          <div>
            <div style={{fontSize:9,letterSpacing:"0.2em",textTransform:"uppercase",color:P.terracotta,marginBottom:2}}>mi sistema personal</div>
            {serif("Julieta",22,P.charcoal,false,500)}
            <div style={{marginTop:2,fontSize:11,color:P.warmGray,textTransform:"capitalize"}}>{todayFmt}</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:20}}>{phase.icon}</div>
            <div style={{fontSize:9,letterSpacing:"0.08em",textTransform:"uppercase",color:phase.color,marginTop:1}}>{phase.name}</div>
            <div style={{fontSize:9,color:P.warmGray}}>día {appData.cycle?.currentDay}</div>
          </div>
        </div>
        <div style={{display:"flex",overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
          {TABS.map(t=><button key={t.k} onClick={()=>setTab(t.k)} style={{padding:"8px 9px",background:"transparent",border:"none",whiteSpace:"nowrap",borderBottom:`2px solid ${tab===t.k?P.terracotta:"transparent"}`,color:tab===t.k?P.terracotta:P.warmGray,fontSize:10,cursor:"pointer",fontFamily:"'Jost',sans-serif",letterSpacing:"0.06em",textTransform:"uppercase",fontWeight:tab===t.k?500:300,transition:"all 0.2s"}}>{t.l}</button>)}
        </div>
      </div>

      <div style={{padding:"14px 14px 60px"}}>
        {tab==="manana"&&<MorningTab appData={appData} refreshAppData={refreshAppData} mantras={mantras} onUpdateMantras={updateMantras}/>}

        {tab==="hoy"&&(
          <div>
            <div style={{display:"flex",gap:6,marginBottom:14}}>
              {HOY_TABS.map(st=>(
                <button key={st.k} onClick={()=>setSubTab(st.k)} style={{flex:1,padding:"8px 4px",borderRadius:10,border:`1px solid ${subTab===st.k?P.terracotta:P.sand}`,background:subTab===st.k?P.terracotta+"15":"transparent",color:subTab===st.k?P.terracotta:P.warmGray,fontSize:11,cursor:"pointer",fontFamily:"'Jost',sans-serif",letterSpacing:"0.05em",textTransform:"uppercase",fontWeight:subTab===st.k?500:300,transition:"all 0.2s",position:"relative"}}>
                  {st.l}{st.done&&<span style={{position:"absolute",top:3,right:5,width:5,height:5,borderRadius:"50%",background:P.sage}}/>}
                </button>
              ))}
            </div>
            {subTab==="movimiento"&&<WorkoutLog existing={todayEntry?.workout} refreshAppData={refreshAppData} videos={videos}/>}
            {subTab==="nutricion"&&<NutritionLog existing={todayEntry?.nutrition} refreshAppData={refreshAppData} profile={profile} appData={appData}/>}
          </div>
        )}

        {tab==="ciclo"&&<CycleView cycleData={appData.cycle} onUpdate={updateCycle}/>}
        {tab==="astro"&&<AstrologyView cycleData={appData.cycle}/>}
        {tab==="analisis"&&<AnalisisView entries={appData.entries||{}} cycleData={appData.cycle} profile={profile}/>}
        {tab==="chat"&&<AIChat todayEntry={todayEntry} cycleData={appData.cycle} profile={profile}/>}
        {tab==="videos"&&<VideoLibrary videos={videos} onUpdate={updateVideos}/>}
        {tab==="historial"&&<HistoryView entries={appData.entries||{}}/>}
      </div>
    </div>
  );
}
