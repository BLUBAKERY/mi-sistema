import { useState, useEffect, useRef } from "react";

const SK = "maritima_v5";

const CYCLE_PHASES = {
  menstrual: { name: "Menstrual", days: [1,2,3,4,5,6], color: "#C4856A", icon: "🌑", desc: "Descanso profundo. Tu cuerpo hace un trabajo enorme. Honrá el ritmo lento.", energy: "Baja", training: "Yoga restaurativo, caminatas suaves. Nada de alta intensidad.", mood: "Introspección, sensibilidad, soltar." },
  folicular: { name: "Folicular", days: [7,8,9,10,11,12,13], color: "#8A9E8C", icon: "🌒", desc: "El estrógeno sube. Energía fresca, mente clara. Momento de empezar cosas nuevas.", energy: "Subiendo", training: "Ideal para empezar cargas nuevas, probar ejercicios, subir intensidad.", mood: "Optimismo, creatividad, arranque." },
  ovulatoria: { name: "Ovulatoria", days: [14,15,16,17], color: "#D4A090", icon: "🌕", desc: "Tu pico. Energía máxima, sociabilidad alta. Aprovechalo.", energy: "Máxima", training: "Entrená fuerte. Cargas altas, potencia, todo lo que requiera esfuerzo máximo.", mood: "Confianza, magnetismo, conexión." },
  lutea: { name: "Lútea", days: [18,19,20,21,22,23,24,25,26,27,28], color: "#6B6560", icon: "🌘", desc: "Progesterona sube. El cuerpo pide calma. Los antojos son reales y tienen sentido.", energy: "Bajando", training: "Fuerza moderada, Pilates, no forzar. Escuchá más al cuerpo.", mood: "Hacia adentro, sensibilidad, necesidad de orden y calma." },
};
const getPhase = (d) => { for (const [k,p] of Object.entries(CYCLE_PHASES)) { if(p.days.includes(d)) return {key:k,...p}; } return {key:"lutea",...CYCLE_PHASES.lutea}; };

const WORKOUTS = {
  1: { name: "Día 1 — Fuerza", subtitle: "Full Body · Énfasis Tren Inferior", exercises: [
    {name:"Hip Thrust con barra",sets:4,reps:"10-12",notes:"Pelvis neutra, apretar glúteo arriba"},
    {name:"RDL con mancuernas",sets:3,reps:"10",notes:"Bisagra limpia, sentir isquios"},
    {name:"Split Squat Búlgaro",sets:3,reps:"8 c/lado",notes:"Descender 3 seg, rodilla no pasa el pie"},
    {name:"Adductor en máquina",sets:3,reps:"15",notes:"Controlado, rango completo"},
    {name:"Remo un brazo",sets:3,reps:"10 c/lado",notes:"Codo hacia cadera, hombro bajo"},
    {name:"Press tríceps polea",sets:3,reps:"12-15",notes:"Codos pegados, trapecio abajo"},
    {name:"Face pull con cuerda",sets:3,reps:"15",notes:"Codos a altura de hombros"},
  ]},
  2: { name: "Día 2 — Funcional", subtitle: "Full Body · Movilidad + Movimiento", exercises: [
    {name:"Sentadilla goblet",sets:4,reps:"12",notes:"Pausa 2 seg abajo, talones en suelo"},
    {name:"Peso muerto sumo",sets:3,reps:"12",notes:"Pies abiertos, bisagra limpia"},
    {name:"Step up con mancuernas",sets:3,reps:"10 c/lado",notes:"Glúteo del pie apoyado hace el trabajo"},
    {name:"Clamshell con banda",sets:3,reps:"15 c/lado",notes:"Lento, glúteo medio no TFL"},
    {name:"Serratus press en suelo",sets:3,reps:"12",notes:"Protracción final, escápulas se separan"},
    {name:"W-raise banco inclinado",sets:3,reps:"12",notes:"Trapecio medio/bajo, sin inercia"},
    {name:"Kettlebell swing",sets:3,reps:"15",notes:"Potencia de cadera, glúteo explota"},
  ]},
  3: { name: "Día 3 — Integración", subtitle: "Full Body · Fuerza + Potencia", exercises: [
    {name:"Hip Thrust unilateral",sets:4,reps:"8 c/lado",notes:"Pausa arriba, glúteo máximo puro"},
    {name:"Sentadilla con barra",sets:4,reps:"10",notes:"Profundidad completa, core braced"},
    {name:"Good morning barra liviana",sets:3,reps:"12",notes:"Bisagra lenta, cadena posterior"},
    {name:"Prensa de piernas",sets:3,reps:"12",notes:"Pies altos = más glúteo"},
    {name:"Pulldown agarre neutro",sets:3,reps:"10",notes:"Hombros ABAJO antes de empezar"},
    {name:"Extensión tríceps sobre cabeza",sets:3,reps:"12",notes:"Codos quietos"},
    {name:"Curl bíceps alterno",sets:2,reps:"10 c/lado",notes:"Supinación completa al final"},
  ]},
};

const ACTIVATION = ["Respiración diafragmática 90/90 — 10 resp","Cat-Cow lento — 8 reps","Hip 90/90 con rotación activa — 6 c/lado","Glute bridge isométrico hold 5 seg — 8 reps","Bird-dog con pausa — 6 c/lado","Wall angels — 10 reps"];

const MEAL_META = {
  desayuno: { label:"Desayuno", icon:"☀️", target:"~30g proteína · ~40g carbs · ~15g grasa", example:"2 huevos + scoop proteína + 40g pan sarraceno + 30g palta → ~30g P / 42g C / 15g G", placeholder:"¿Qué comiste? Ej: 2 huevos, pan sarraceno, palta..." },
  almuerzo: { label:"Almuerzo", icon:"🌿", target:"~35g proteína · ~50g carbs · ~15g grasa", example:"150g pollo + 1 puño batata + vegetales + AOVE → ~36g P / 48g C / 12g G", placeholder:"¿Qué comiste? Ej: pollo, batata, ensalada..." },
  merienda: { label:"Merienda ⭐", icon:"🕓", target:"~25g proteína · ~20g carbs · ~10g grasa", example:"Yogur griego + frutos rojos + 1 cdita miel → ~18g P / 22g C / 5g G", placeholder:"Obligatoria con proteína. ¿Qué comiste?" },
  cena: { label:"Cena", icon:"🌙", target:"~35g proteína · ~20g carbs · ~15g grasa", example:"150g salmón + vegetales salteados + AOVE → ~34g P / 12g C / 16g G", placeholder:"Más liviana en carbs. ¿Qué comiste?" },
};

const VISUALIZATIONS = [
  { theme: "Cuerpo", text: "Cerrá los ojos un momento. Sentí tu cuerpo tal como va a estar: liviano, definido, vivo. Glúteos que se activan cuando caminás. Espalda larga. Hombros bajos. Piel luminosa. No es un sueño — es el resultado natural de lo que ya estás haciendo hoy. Ese cuerpo ya existe en potencia. Cada decisión de hoy lo convoca." },
  { theme: "Prosperidad", text: "Imaginá abrir tu teléfono y ver 10.000 dólares en tu cuenta. No con ansiedad — con calma. Porque los construiste despacio, con intención, con valor real. Somos Marítima no es una ilusión — es una marca que ya existe y que más mujeres van a necesitar. El dinero es consecuencia de tu claridad. Y tu claridad crece cada día." },
  { theme: "Presencia", text: "La Julieta que construís no espera ser vista. Ya se ve a sí misma. Entra a un lugar y no busca validación — la lleva puesta. Sus relaciones son libres porque ella no necesita nada de ellas para sentirse completa. El amor que busca afuera ya está adentro, solo necesita espacio para crecer." },
  { theme: "Relación contigo", text: "Imaginá despertar mañana y que el primer pensamiento no sea urgencia sino curiosidad. ¿Qué quiero hoy? ¿Cómo está mi cuerpo? Esa mujer que se trata con la misma ternura que le daría a su mejor amiga — esa sos vos. No en el futuro. Hoy, en cada pequeña decisión que tomás desde el amor y no desde el miedo." },
  { theme: "Libertad", text: "Un día no muy lejano vas a estar en un lugar del mundo que hoy solo imaginás, con el cuerpo que construiste, con trabajo que fluye, sin urgencia. No porque la vida se volvió fácil — sino porque aprendiste a moverte desde tu centro. Ese momento empieza hoy, en este check-in, en este vaso de agua, en este estiramiento de mañana." },
];

const P = { cream:"#F7F2EA", parchment:"#EDE5D4", sand:"#CFC0A8", terracotta:"#B8745A", terracottaLight:"#CE9680", sage:"#7A9480", charcoal:"#28261F", warmGray:"#7A6E65", white:"#FDFAF3", gold:"#C4A96A" };

const GS = `
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

const today = () => new Date().toISOString().split("T")[0];
const loadData = async () => { try { const r = localStorage.getItem(SK); return r ? JSON.parse(r) : {}; } catch { return {}; } }
const saveData = async (d) => { try { localStorage.setItem(SK, JSON.stringify(d)); } catch {} };; } catch {} };
const callAI = async (system, user) => {
  const r = await fetch("https://api.anthropic.com/v1/messages", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system,messages:[{role:"user",content:user}]}) });
  const d = await r.json(); return d.content?.[0]?.text || "";
};

const JULI_CTX = `Sos el agente personal de bienestar de Julieta, 37 años, argentina, instructora de Pilates y emprendedora (Somos Marítima). Sus objetivos: 18% grasa corporal, esculpir glúteo máximo, serrato y tríceps, mejorar salud intestinal, sueño y relación consigo misma. Macros objetivo: ~1750 kcal, 135g proteína, 170g carbs, 60g grasas. Contexto físico: TFL dominante, glúteo máximo inhibido, trapecio superior sobreactivado, dolor lumbar. Contexto emocional: urgencia financiera crónica, antojos de dulce de tarde/noche, procrastinación como patrón, está creando Blu Bakery con su hermana. Hablale de vos, español rioplatense. Directa, honesta, cálida. Sin afirmaciones vacías ni juicio.`;

// ── UI primitives ─────────────────────────────────────────────────────────────
const serif = (txt,sz=16,color=P.charcoal,italic=false,weight=400) => <span style={{fontFamily:"'Playfair Display',serif",fontSize:sz,color,fontStyle:italic?"italic":"normal",fontWeight:weight}}>{txt}</span>;
const lbl = (txt) => <div style={{fontSize:10,letterSpacing:"0.12em",textTransform:"uppercase",color:P.warmGray,marginBottom:7,fontWeight:400}}>{txt}</div>;
const Card = ({children,style={},delay=0}) => <div style={{background:P.white,borderRadius:16,padding:"17px 19px",marginBottom:12,border:`1px solid ${P.parchment}`,animation:`fadeUp 0.4s ease ${delay}s both`,boxShadow:"0 1px 8px rgba(40,38,31,0.05)",...style}}>{children}</div>;
const Chip = ({active,onClick,children,color=P.terracotta}) => <button onClick={onClick} style={{padding:"6px 12px",borderRadius:20,border:`1px solid ${active?color:P.sand}`,background:active?color:"transparent",color:active?P.white:P.warmGray,fontSize:12,cursor:"pointer",fontFamily:"'Jost',sans-serif",fontWeight:active?500:300,transition:"all 0.18s",letterSpacing:"0.03em",marginBottom:4}}>{children}</button>;
const Slider = ({value,onChange,min=1,max=10,lbl:l,color=P.terracotta}) => <div style={{marginBottom:14}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontSize:10,letterSpacing:"0.12em",textTransform:"uppercase",color:P.warmGray}}>{l}</span><span style={{fontFamily:"'Playfair Display',serif",fontSize:14,color}}>{value}</span></div><input type="range" min={min} max={max} value={value} onChange={e=>onChange(+e.target.value)} style={{width:"100%",accentColor:color,cursor:"pointer"}}/></div>;
const TA = ({value,onChange,placeholder,rows=3}) => <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{width:"100%",background:P.parchment,border:`1px solid ${P.sand}`,borderRadius:10,padding:"10px 13px",fontSize:13,color:P.charcoal,resize:"none",lineHeight:1.6,fontWeight:300}}/>;
const SavedBanner = () => <div style={{background:P.sage+"25",border:`1px solid ${P.sage}50`,borderRadius:10,padding:"9px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:8}}><span style={{color:P.sage}}>✓</span><span style={{fontSize:12,color:P.sage}}>Guardado — podés editar cuando quieras</span></div>;
const TimeInput = ({value,onChange}) => <input type="time" value={value} onChange={e=>onChange(e.target.value)} style={{background:P.parchment,border:`1px solid ${P.sand}`,borderRadius:8,padding:"5px 9px",fontSize:12,color:P.warmGray,width:90}}/>;

// ── MORNING RITUAL ────────────────────────────────────────────────────────────
const MORNING_OPTIONS = ["Estiramientos","Masaje facial","Respiraciones","Drenaje linfático","Sesión de TRE","Meditación","Journaling","Tapping"];
const WAKEUP_FEELINGS = ["tranquila","acelerada","ansiosa","descansada","confundida","motivada","pesada","liviana","triste","presente"];

function MorningSection({data, onChange}) {
  const [wakeupFeel, setWakeupFeel] = useState(data?.wakeupFeel||[]);
  const [wakeupThoughts, setWakeupThoughts] = useState(data?.wakeupThoughts||"");
  const [rituals, setRituals] = useState(data?.rituals||[]);
  const [customRitual, setCustomRitual] = useState("");
  const [ritualDone, setRitualDone] = useState(data?.ritualDone||false);

  const togFeel = f => { const n = wakeupFeel.includes(f)?wakeupFeel.filter(x=>x!==f):[...wakeupFeel,f]; setWakeupFeel(n); onChange({wakeupFeel:n,wakeupThoughts,rituals,ritualDone}); };
  const togRitual = r => { const n = rituals.includes(r)?rituals.filter(x=>x!==r):[...rituals,r]; setRituals(n); onChange({wakeupFeel,wakeupThoughts,rituals:n,ritualDone}); };
  const addCustom = () => { if(customRitual.trim()){const n=[...rituals,customRitual.trim()];setRituals(n);onChange({wakeupFeel,wakeupThoughts,rituals:n,ritualDone});setCustomRitual("");} };

  return (
    <div>
      <Card>
        {serif("Al despertar",15,P.charcoal,false,500)}
        <div style={{marginTop:12,marginBottom:10}}>{lbl("¿Cómo te despertaste?")}</div>
        <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:14}}>
          {WAKEUP_FEELINGS.map(f=><Chip key={f} active={wakeupFeel.includes(f)} onClick={()=>togFeel(f)} color={P.gold}>{f}</Chip>)}
        </div>
        {lbl("Pensamientos o sensaciones al despertar")}
        <TA value={wakeupThoughts} onChange={v=>{setWakeupThoughts(v);onChange({wakeupFeel,wakeupThoughts:v,rituals,ritualDone});}} placeholder="Hoy desperté acelerada, con el pensamiento puesto en... o me sentí..." rows={2}/>
      </Card>

      <Card>
        {serif("Ritual de mañana",15,P.charcoal,false,500)}
        <div style={{marginTop:12,marginBottom:8}}>{lbl("¿Qué hiciste para vos esta mañana?")}</div>
        <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:12}}>
          {MORNING_OPTIONS.map(r=><Chip key={r} active={rituals.includes(r)} onClick={()=>togRitual(r)} color={P.terracotta}>{r}</Chip>)}
        </div>
        <div style={{display:"flex",gap:8,marginBottom:12}}>
          <input value={customRitual} onChange={e=>setCustomRitual(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addCustom()} placeholder="Agregar otra acción..." style={{flex:1,background:P.parchment,border:`1px solid ${P.sand}`,borderRadius:8,padding:"8px 12px",fontSize:12,color:P.charcoal}}/>
          <button onClick={addCustom} style={{padding:"8px 14px",background:P.terracotta,color:P.white,border:"none",borderRadius:8,fontSize:12,cursor:"pointer"}}>+</button>
        </div>
        <Chip active={ritualDone} onClick={()=>{setRitualDone(!ritualDone);onChange({wakeupFeel,wakeupThoughts,rituals,ritualDone:!ritualDone});}} color={P.sage}>
          {ritualDone?"✓ Lo hice":"¿Lo completaste?"}
        </Chip>
      </Card>
    </div>
  );
}

// ── VISUALIZATION ─────────────────────────────────────────────────────────────
function VisualizationSection({cycleDay}) {
  const [loading, setLoading] = useState(false);
  const [vizText, setVizText] = useState("");
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [aiViz, setAiViz] = useState("");

  const phase = getPhase(cycleDay||5);

  const loadPreset = (v) => { setSelectedTheme(v.theme); setVizText(v.text); setAiViz(""); };

  const generateAI = async () => {
    setLoading(true); setAiViz("");
    const prompt = `Generá una visualización guiada personalizada para Julieta. Debe ser específica para ella: su cuerpo (18% grasa, definida, glúteos, serrato), su negocio (Somos Marítima, 10k USD/mes), su libertad emocional (no buscar validación externa, presencia, amor propio). Está en fase ${phase.name} de su ciclo (día ${cycleDay||5}), lo que significa ${phase.mood}. La visualización debe ser en 2do persona (vos), poética pero concreta, de 4-6 oraciones. Que sienta que ese futuro ya es real hoy.`;
    const r = await callAI(JULI_CTX, prompt);
    setAiViz(r); setSelectedTheme("Personalizada"); setLoading(false);
  };

  return (
    <Card style={{background:`linear-gradient(135deg,${P.gold}10,${P.terracotta}08)`}}>
      {serif("Visualización del día",16,P.charcoal,false,500)}
      <div style={{marginTop:4,marginBottom:14,fontSize:12,color:P.warmGray}}>Conectá con la Julieta que ya sos</div>

      <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:14}}>
        {VISUALIZATIONS.map(v=><Chip key={v.theme} active={selectedTheme===v.theme} onClick={()=>loadPreset(v)} color={P.gold}>{v.theme}</Chip>)}
        <button onClick={generateAI} style={{padding:"6px 14px",borderRadius:20,border:`1px solid ${P.gold}`,background:P.gold,color:P.white,fontSize:12,cursor:"pointer",fontFamily:"'Jost',sans-serif",fontWeight:500,marginBottom:4}}>
          {loading?"...":"✦ Generar para hoy"}
        </button>
      </div>

      {(vizText||aiViz) && (
        <div style={{background:P.white,borderRadius:12,padding:"16px 18px",borderLeft:`3px solid ${P.gold}`}}>
          <div style={{fontSize:9,letterSpacing:"0.15em",textTransform:"uppercase",color:P.gold,marginBottom:10}}>{selectedTheme}</div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:14,lineHeight:1.9,fontStyle:"italic",color:P.charcoal}}>
            {aiViz||vizText}
          </div>
        </div>
      )}
    </Card>
  );
}

// ── WORKOUT ───────────────────────────────────────────────────────────────────
function WorkoutLog({onSave, existing, wasSaved}) {
  const [gymDay, setGymDay] = useState(existing?.gymDay||1);
  const workout = WORKOUTS[gymDay];
  const [startTime, setStartTime] = useState(existing?.startTime||"");
  const [endTime, setEndTime] = useState(existing?.endTime||"");
  const [actDone, setActDone] = useState(existing?.actDone||false);
  const [sets, setSets] = useState(existing?.sets||{});
  const [notes, setNotes] = useState(existing?.notes||"");
  const [bodyFeel, setBodyFeel] = useState(existing?.bodyFeel||5);
  const [pain, setPain] = useState(existing?.pain||1);
  const [cardioType, setCardioType] = useState(existing?.cardioType||"");
  const [cardioDur, setCardioDur] = useState(existing?.cardioDur||30);
  const [pilatesYoga, setPilatesYoga] = useState(existing?.pilatesYoga||false);
  const [pyType, setPyType] = useState(existing?.pyType||"");
  const [pyDuration, setPyDuration] = useState(existing?.pyDuration||45);
  const [pyIntensity, setPyIntensity] = useState(existing?.pyIntensity||5);
  const [pyNotes, setPyNotes] = useState(existing?.pyNotes||"");
  const [showGym, setShowGym] = useState(!existing?.pilatesYoga||existing?.gymDay);

  const upd = (ei,si,f,v) => setSets(p=>({...p,[`${ei}-${si}`]:{...(p[`${ei}-${si}`]||{}),[f]:v}}));

  const handleSave = () => onSave({gymDay,startTime,endTime,actDone,sets,notes,bodyFeel,pain,cardioType,cardioDur,pilatesYoga,pyType,pyDuration,pyIntensity,pyNotes});

  return (
    <div>
      {wasSaved && <SavedBanner/>}

      {/* Session type selector */}
      <Card>
        {lbl("¿Qué tipo de sesión hiciste hoy?")}
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <Chip active={showGym&&!pilatesYoga} onClick={()=>{setShowGym(true);setPilatesYoga(false);}} color={P.terracotta}>Gym</Chip>
          <Chip active={pilatesYoga&&!showGym} onClick={()=>{setShowGym(false);setPilatesYoga(true);}} color={P.sage}>Pilates / Yoga</Chip>
          <Chip active={showGym&&pilatesYoga} onClick={()=>{setShowGym(true);setPilatesYoga(true);}} color={P.gold}>Ambos</Chip>
        </div>
      </Card>

      {/* GYM section */}
      {showGym && (
        <>
          <Card style={{background:P.terracotta+"10",borderColor:P.terracotta+"30"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                {serif(workout.name,20,P.charcoal,false,500)}
                <div style={{marginTop:4,fontSize:12,color:P.warmGray}}>{workout.subtitle}</div>
              </div>
              <div>
                {lbl("Día #")}
                <div style={{display:"flex",gap:6}}>
                  {[1,2,3].map(d=><button key={d} onClick={()=>setGymDay(d)} style={{width:32,height:32,borderRadius:"50%",border:`2px solid ${gymDay===d?P.terracotta:P.sand}`,background:gymDay===d?P.terracotta:"transparent",color:gymDay===d?P.white:P.warmGray,fontSize:13,cursor:"pointer",fontWeight:gymDay===d?500:300}}>{d}</button>)}
                </div>
              </div>
            </div>
            <div style={{display:"flex",gap:12,marginTop:14}}>
              {[["Inicio",startTime,setStartTime],["Fin",endTime,setEndTime]].map(([l,v,s])=>(
                <div key={l} style={{flex:1}}>{lbl(l)}<input type="time" value={v} onChange={e=>s(e.target.value)} style={{width:"100%",background:P.parchment,border:`1px solid ${P.sand}`,borderRadius:8,padding:"8px 10px",fontSize:13,color:P.charcoal}}/></div>
              ))}
            </div>
          </Card>

          <Card>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:actDone?0:12}}>
              {serif("Activación",15,P.charcoal,false,500)}
              <Chip active={actDone} onClick={()=>setActDone(!actDone)} color={P.sage}>{actDone?"✓ Hecho":"Marcar hecho"}</Chip>
            </div>
            {!actDone && <div style={{marginTop:10}}>{ACTIVATION.map((a,i)=><div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:7}}><div style={{width:20,height:20,borderRadius:"50%",background:P.parchment,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:10,color:P.warmGray}}>{i+1}</span></div><span style={{fontSize:12,color:P.charcoal,lineHeight:1.5}}>{a}</span></div>)}</div>}
          </Card>

          {workout.exercises.map((ex,ei)=>(
            <Card key={ei} delay={ei*0.03}>
              {serif(ex.name,15,P.charcoal,false,500)}
              <div style={{marginTop:3,fontSize:11,color:P.warmGray}}>{ex.sets} series · {ex.reps} reps</div>
              <div style={{marginTop:3,fontSize:11,color:P.terracottaLight,fontStyle:"italic",marginBottom:12}}>{ex.notes}</div>
              <div style={{display:"grid",gridTemplateColumns:"26px 1fr 1fr 1fr",gap:5,alignItems:"center"}}>
                {["","KG","REPS","NOTA"].map((h,i)=><span key={i} style={{fontSize:9,letterSpacing:"0.1em",color:P.warmGray,textTransform:"uppercase"}}>{h}</span>)}
                {Array.from({length:ex.sets},(_,si)=>[
                  <div key={`n${si}`} style={{width:22,height:22,borderRadius:"50%",background:P.terracotta+"20",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:10,color:P.terracotta,fontWeight:500}}>{si+1}</span></div>,
                  <input key={`k${si}`} type="number" placeholder="—" value={sets[`${ei}-${si}`]?.kg||""} onChange={e=>upd(ei,si,"kg",e.target.value)} style={{background:P.parchment,border:`1px solid ${P.sand}`,borderRadius:7,padding:"6px 7px",fontSize:13,color:P.charcoal,width:"100%"}}/>,
                  <input key={`r${si}`} type="number" placeholder="—" value={sets[`${ei}-${si}`]?.reps||""} onChange={e=>upd(ei,si,"reps",e.target.value)} style={{background:P.parchment,border:`1px solid ${P.sand}`,borderRadius:7,padding:"6px 7px",fontSize:13,color:P.charcoal,width:"100%"}}/>,
                  <input key={`t${si}`} type="text" placeholder="..." value={sets[`${ei}-${si}`]?.note||""} onChange={e=>upd(ei,si,"note",e.target.value)} style={{background:P.parchment,border:`1px solid ${P.sand}`,borderRadius:7,padding:"6px 7px",fontSize:11,color:P.charcoal,width:"100%"}}/>
                ])}
              </div>
            </Card>
          ))}

          <Card>
            {serif("Cardio",15,P.charcoal,false,500)}
            <div style={{display:"flex",gap:8,flexWrap:"wrap",margin:"12px 0"}}>
              {["Cinta","Bici","Caminata afuera","Ninguno"].map(t=><Chip key={t} active={cardioType===t} onClick={()=>setCardioType(t)}>{t}</Chip>)}
            </div>
            {cardioType&&cardioType!=="Ninguno"&&<Slider value={cardioDur} onChange={setCardioDur} min={10} max={60} lbl="Minutos" color={P.sage}/>}
          </Card>

          <Card>
            <Slider value={bodyFeel} onChange={setBodyFeel} min={1} max={10} lbl="¿Cómo se sintió el cuerpo? (1=mal · 10=increíble)"/>
            <Slider value={pain} onChange={setPain} min={1} max={10} lbl="Dolor o molestia (1=nada · 10=mucho)" color={P.warmGray}/>
            <TA value={notes} onChange={setNotes} placeholder="Observaciones, qué notaste, qué funcionó..."/>
          </Card>
        </>
      )}

      {/* PILATES / YOGA section */}
      {pilatesYoga && (
        <Card style={{background:P.sage+"10",borderColor:P.sage+"40"}}>
          {serif("Pilates / Yoga",16,P.charcoal,false,500)}
          <div style={{marginTop:12,marginBottom:10}}>{lbl("Tipo de sesión")}</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
            {["Pilates mat","Pilates reformer","Yoga vinyasa","Yoga yin","Yoga restaurativo","Yoga ashtanga","Respiración","Otro"].map(t=><Chip key={t} active={pyType===t} onClick={()=>setPyType(t)} color={P.sage}>{t}</Chip>)}
          </div>
          <Slider value={pyDuration} onChange={setPyDuration} min={15} max={90} lbl="Duración (min)" color={P.sage}/>
          <Slider value={pyIntensity} onChange={setPyIntensity} min={1} max={10} lbl="Intensidad (1=muy suave · 10=intensa)" color={P.sage}/>
          <TA value={pyNotes} onChange={setPyNotes} placeholder="¿Qué trabajaste? ¿Cómo se sintió?" rows={2}/>
        </Card>
      )}

      <button onClick={handleSave} style={{width:"100%",padding:"14px",background:P.terracotta,color:P.white,border:"none",borderRadius:11,fontFamily:"'Playfair Display',serif",fontSize:16,cursor:"pointer",marginBottom:8}}>
        Guardar movimiento
      </button>
    </div>
  );
}

// ── NUTRITION ─────────────────────────────────────────────────────────────────
function NutritionLog({onSave, existing, wasSaved}) {
  const [meals, setMeals] = useState(existing?.meals||{desayuno:{food:"",time:""},almuerzo:{food:"",time:""},merienda:{food:"",time:""},cena:{food:"",time:""}});
  const [water, setWater] = useState(existing?.water||4);
  const [supps, setSupps] = useState(existing?.supps||[]);
  const [inflammation, setInflammation] = useState(existing?.inflammation||"nada");
  const [bathroom, setBathroom] = useState(existing?.bathroom||false);
  const [sugar, setSugar] = useState(existing?.sugar||3);
  const [extraNotes, setExtraNotes] = useState(existing?.extraNotes||"");
  const [showMacros, setShowMacros] = useState({});

  const SUPPS = ["Enzimas digestivas","Berberina","Myo-inositol","Soporte adrenal","Ácido butírico","Proteína en polvo"];
  const togSupp = s => setSupps(p=>p.includes(s)?p.filter(x=>x!==s):[...p,s]);
  const setMealF = (k,f,v) => setMeals(p=>({...p,[k]:{...p[k],[f]:v}}));

  return (
    <div>
      {wasSaved && <SavedBanner/>}
      <Card style={{background:`linear-gradient(135deg,${P.terracotta}10,${P.sage}10)`,borderColor:P.terracotta+"30"}}>
        <div style={{fontSize:10,letterSpacing:"0.12em",textTransform:"uppercase",color:P.terracotta,marginBottom:10}}>Tu objetivo diario</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8}}>
          {[{l:"Calorías",v:"~1750",c:P.gold},{l:"Proteína",v:"135g",c:P.terracotta},{l:"Carbs",v:"170g",c:P.sage},{l:"Grasas",v:"60g",c:P.warmGray}].map(({l,v,c})=>(
            <div key={l} style={{textAlign:"center",background:P.white,borderRadius:10,padding:"9px 6px"}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,color:c,fontWeight:500}}>{v}</div>
              <div style={{fontSize:9,color:P.warmGray,letterSpacing:"0.08em",textTransform:"uppercase",marginTop:3}}>{l}</div>
            </div>
          ))}
        </div>
      </Card>

      {Object.entries(MEAL_META).map(([k,meta],i)=>(
        <Card key={k} delay={i*0.05}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{display:"flex",alignItems:"center",gap:7}}><span style={{fontSize:16}}>{meta.icon}</span>{serif(meta.label,15,P.charcoal,false,500)}</div>
            <TimeInput value={meals[k]?.time||""} onChange={v=>setMealF(k,"time",v)}/>
          </div>
          <button onClick={()=>setShowMacros(p=>({...p,[k]:!p[k]}))} style={{background:"none",border:"none",cursor:"pointer",fontSize:11,color:P.terracottaLight,fontFamily:"'Jost',sans-serif",padding:"0 0 8px",letterSpacing:"0.03em"}}>
            {showMacros[k]?"▾ Ocultar guía":"▸ Ver guía de macros"}
          </button>
          {showMacros[k] && <div style={{background:P.parchment,borderRadius:10,padding:"11px 13px",marginBottom:10}}><div style={{fontSize:11,color:P.terracotta,fontWeight:500,marginBottom:4}}>{meta.target}</div><div style={{fontSize:11,color:P.warmGray,lineHeight:1.5,fontStyle:"italic"}}>{meta.example}</div></div>}
          <TA value={meals[k]?.food||""} onChange={v=>setMealF(k,"food",v)} placeholder={meta.placeholder} rows={2}/>
        </Card>
      ))}

      <Card delay={0.22}>
        <Slider value={water} onChange={setWater} min={1} max={12} lbl="💧 Vasos de agua" color={P.sage}/>
        <Slider value={sugar} onChange={setSugar} min={1} max={10} lbl="Antojo de azúcar (1=nada · 10=mucho)" color={P.terracottaLight}/>
        <div style={{marginBottom:14}}>{lbl("Inflamación")}<div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{["nada","poco","moderado","mucho"].map(o=><Chip key={o} active={inflammation===o} onClick={()=>setInflammation(o)}>{o}</Chip>)}</div></div>
        <Chip active={bathroom} onClick={()=>setBathroom(!bathroom)} color={P.sage}>{bathroom?"✓ Fui al baño hoy":"¿Fuiste al baño?"}</Chip>
      </Card>

      <Card delay={0.28}>{lbl("Suplementos de hoy")}<div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{SUPPS.map(s=><Chip key={s} active={supps.includes(s)} onClick={()=>togSupp(s)}>{s}</Chip>)}</div></Card>
      <Card delay={0.34}>{lbl("Notas adicionales")}<TA value={extraNotes} onChange={setExtraNotes} placeholder="Algo fuera del plan, cómo te sentiste después de comer, situación con cookies..."/></Card>

      <button onClick={()=>onSave({meals,water,supps,inflammation,bathroom,sugar,extraNotes})} style={{width:"100%",padding:"14px",background:P.terracotta,color:P.white,border:"none",borderRadius:11,fontFamily:"'Playfair Display',serif",fontSize:16,cursor:"pointer",marginBottom:8}}>
        Guardar nutrición
      </button>
    </div>
  );
}

// ── WELLBEING ─────────────────────────────────────────────────────────────────
function WellbeingLog({onSave, existing, wasSaved, cycleDay}) {
  const EMOTIONS = ["tranquila","ansiosa","motivada","cansada","triste","plena","irritada","agradecida","confundida","conectada","urgencia","libre"];
  const [sleepH, setSleepH] = useState(existing?.sleepH||7);
  const [sleepQ, setSleepQ] = useState(existing?.sleepQ||5);
  const [phone, setPhone] = useState(existing?.phone||false);
  const [emotions, setEmotions] = useState(existing?.emotions||[]);
  const [emotionNote, setEmotionNote] = useState(existing?.emotionNote||"");
  const [bodyNote, setBodyNote] = useState(existing?.bodyNote||"");
  const [win, setWin] = useState(existing?.win||"");
  const [learned, setLearned] = useState(existing?.learned||"");
  const [energy, setEnergy] = useState(existing?.energy||5);
  const [procrastinated, setProcrastinated] = useState(existing?.procrastinated||false);
  const [procrastinationNote, setProcrastinationNote] = useState(existing?.procrastinationNote||"");
  const [procrastinationWhy, setProcrastinationWhy] = useState(existing?.procrastinationWhy||[]);

  const PROC_REASONS = ["Abrumamiento","Perfeccionismo","Miedo al fracaso","Falta de energía","Distracción (redes)","No sé por dónde empezar","Urgencia financiera","Otro"];
  const togEmotion = e => setEmotions(p=>p.includes(e)?p.filter(x=>x!==e):[...p,e]);
  const togProcWhy = r => setProcrastinationWhy(p=>p.includes(r)?p.filter(x=>x!==r):[...p,r]);

  return (
    <div>
      {wasSaved && <SavedBanner/>}

      <VisualizationSection cycleDay={cycleDay}/>

      <Card>
        {serif("Sueño",15,P.charcoal,false,500)}
        <div style={{marginTop:14}}>
          <Slider value={sleepH} onChange={setSleepH} min={4} max={10} lbl="Horas dormidas" color={P.warmGray}/>
          <Slider value={sleepQ} onChange={setSleepQ} min={1} max={10} lbl="Calidad del sueño" color={P.warmGray}/>
          <Chip active={phone} onClick={()=>setPhone(!phone)}>Usé el teléfono antes de dormir</Chip>
        </div>
      </Card>

      <Card>
        {serif("Estado interior",15,P.charcoal,false,500)}
        <div style={{marginTop:14}}>
          <Slider value={energy} onChange={setEnergy} min={1} max={10} lbl="Nivel de energía"/>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>{EMOTIONS.map(e=><Chip key={e} active={emotions.includes(e)} onClick={()=>togEmotion(e)}>{e}</Chip>)}</div>
          <TA value={emotionNote} onChange={setEmotionNote} placeholder="¿Qué está pasando adentro hoy? Sin filtro."/>
        </div>
      </Card>

      {/* PROCRASTINATION tracker */}
      <Card>
        {serif("Procrastinación",15,P.charcoal,false,500)}
        <div style={{marginTop:12,marginBottom:12}}>
          <Chip active={procrastinated} onClick={()=>setProcrastinated(!procrastinated)} color={P.warmGray}>
            {procrastinated?"✓ Sí procrastiné hoy":"¿Procrastinaste hoy?"}
          </Chip>
        </div>
        {procrastinated && (
          <>
            <div style={{marginBottom:10}}>{lbl("¿Por qué creés que pasó?")}</div>
            <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:12}}>
              {PROC_REASONS.map(r=><Chip key={r} active={procrastinationWhy.includes(r)} onClick={()=>togProcWhy(r)} color={P.warmGray}>{r}</Chip>)}
            </div>
            <TA value={procrastinationNote} onChange={setProcrastinationNote} placeholder="¿Qué postergaste? ¿Qué hiciste en su lugar? ¿Cómo te sentiste después?" rows={2}/>
          </>
        )}
      </Card>

      <Card>
        {serif("Cuerpo & Aprendizaje",15,P.charcoal,false,500)}
        <div style={{marginTop:14}}>
          <div style={{marginBottom:12}}>{lbl("¿Cómo está el cuerpo hoy?")}<TA value={bodyNote} onChange={setBodyNote} placeholder="Dolor, rigidez, liviano, algo que notaste..." rows={2}/></div>
          <div style={{marginBottom:12}}>{lbl("¿Aprendiste o leíste algo?")}<TA value={learned} onChange={setLearned} placeholder="Un artículo, podcast, idea que te quedó..." rows={2}/></div>
          {lbl("Victoria del día — una sola cosa")}
          <TA value={win} onChange={setWin} placeholder="Por pequeña que sea. ¿Qué hiciste bien hoy?" rows={2}/>
        </div>
      </Card>

      <button onClick={()=>onSave({sleepH,sleepQ,phone,emotions,emotionNote,bodyNote,win,learned,energy,procrastinated,procrastinationNote,procrastinationWhy})} style={{width:"100%",padding:"14px",background:P.terracotta,color:P.white,border:"none",borderRadius:11,fontFamily:"'Playfair Display',serif",fontSize:16,cursor:"pointer",marginBottom:8}}>
        Guardar bienestar
      </button>
    </div>
  );
}

// ── CYCLE ─────────────────────────────────────────────────────────────────────
function CycleView({cycleData, onUpdate}) {
  const [day, setDay] = useState(cycleData?.currentDay||5);
  const phase = getPhase(day);
  return (
    <div style={{animation:"fadeUp 0.4s ease"}}>
      <Card>
        <div style={{textAlign:"center",paddingBottom:16}}>
          <div style={{fontSize:38,marginBottom:8}}>{phase.icon}</div>
          {serif(phase.name,22,phase.color)}
          <div style={{marginTop:5,fontSize:12,color:P.warmGray}}>Día {day} de tu ciclo</div>
        </div>
        <div style={{background:P.parchment,borderRadius:12,padding:"13px 15px",marginBottom:16,fontSize:13,color:P.charcoal,lineHeight:1.7,fontWeight:300}}>{phase.desc}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16}}>
          {[{l:"Energía",v:phase.energy},{l:"Entreno",v:phase.training.split(".")[0]},{l:"Humor",v:phase.mood.split(",")[0]}].map(({l,v})=>(
            <div key={l} style={{background:phase.color+"18",borderRadius:10,padding:"9px 10px",textAlign:"center"}}>
              <div style={{fontSize:9,letterSpacing:"0.1em",textTransform:"uppercase",color:phase.color,marginBottom:3}}>{l}</div>
              <span style={{fontSize:11,color:P.charcoal}}>{v}</span>
            </div>
          ))}
        </div>
        <Slider value={day} onChange={setDay} min={1} max={28} lbl="Día del ciclo" color={phase.color}/>
        <div style={{display:"flex",gap:3,flexWrap:"wrap",marginBottom:16}}>
          {Array.from({length:28},(_,i)=>{const d=i+1,ph=getPhase(d),active=d===day;return <button key={d} onClick={()=>setDay(d)} style={{width:23,height:23,borderRadius:"50%",border:active?`2px solid ${ph.color}`:"none",background:active?ph.color:ph.color+"30",cursor:"pointer",fontSize:9,color:active?P.white:P.charcoal,fontWeight:active?600:300,transition:"all 0.15s"}}>{d}</button>;})}
        </div>
        <button onClick={()=>onUpdate({currentDay:day,updatedAt:today()})} style={{width:"100%",padding:"13px",background:P.terracotta,color:P.white,border:"none",borderRadius:11,fontFamily:"'Playfair Display',serif",fontSize:16,cursor:"pointer"}}>Guardar ciclo</button>
      </Card>
    </div>
  );
}

// ── CHAT ──────────────────────────────────────────────────────────────────────
function AIChat({todayEntry, cycleData}) {
  const [msgs, setMsgs] = useState([{role:"assistant",content:"Hola Juli. Estoy acá. ¿Qué está pasando?"}]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[msgs]);

  const QUICK = ["Quiero algo dulce ahora","No tengo ganas de entrenar","Tuve un día horrible","¿Qué como para la merienda?","Me siento mal conmigo misma","Estoy procrastinando"];

  const send = async (text) => {
    if(!text.trim()) return;
    setMsgs(p=>[...p,{role:"user",content:text}]); setInput(""); setLoading(true);
    const phase = cycleData?.currentDay ? getPhase(cycleData.currentDay) : null;
    const ctx = `Contexto de hoy: ${phase?`Fase ${phase.name} día ${cycleData.currentDay}.`:""} ${todayEntry?.nutrition?`Comió: ${JSON.stringify(todayEntry.nutrition.meals)}.`:""} ${todayEntry?.wellbeing?`Emociones: ${todayEntry.wellbeing.emotions?.join(", ")}. Energía: ${todayEntry.wellbeing.energy}/10.`:""} ${todayEntry?.morning?`Al despertar se sintió: ${todayEntry.morning.wakeupFeel?.join(", ")}.`:""}`;
    const history = msgs.slice(-6).map(m=>({role:m.role,content:m.content}));
    const r = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:JULI_CTX+"\n\n"+ctx,messages:[...history,{role:"user",content:text}]})});
    const d = await r.json();
    setMsgs(p=>[...p,{role:"assistant",content:d.content?.[0]?.text||"Estoy acá."}]); setLoading(false);
  };

  return (
    <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 150px)"}}>
      <div style={{display:"flex",gap:7,flexWrap:"wrap",paddingBottom:12}}>
        {QUICK.map(q=><button key={q} onClick={()=>send(q)} style={{padding:"5px 11px",borderRadius:20,border:`1px solid ${P.sand}`,background:P.white,color:P.warmGray,fontSize:11,cursor:"pointer",fontFamily:"'Jost',sans-serif"}}>{q}</button>)}
      </div>
      <div style={{flex:1,overflowY:"auto",paddingRight:4}}>
        {msgs.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",marginBottom:12}}>
            <div style={{maxWidth:"82%",padding:"11px 14px",borderRadius:m.role==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px",background:m.role==="user"?P.terracotta:P.white,border:m.role==="assistant"?`1px solid ${P.parchment}`:"none",color:m.role==="user"?P.white:P.charcoal,fontSize:13,lineHeight:1.65,fontWeight:300}}>{m.content}</div>
          </div>
        ))}
        {loading && <div style={{display:"flex",gap:4,padding:"11px 14px",background:P.white,border:`1px solid ${P.parchment}`,borderRadius:"16px 16px 16px 4px",width:"fit-content",marginBottom:12}}>{[0,0.2,0.4].map((d,i)=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:P.sand,animation:`pulse 1s ease ${d}s infinite`}}/>)}</div>}
        <div ref={bottomRef}/>
      </div>
      <div style={{display:"flex",gap:8,paddingTop:12,borderTop:`1px solid ${P.parchment}`}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send(input)} placeholder="Escribí lo que sea..." style={{flex:1,background:P.white,border:`1px solid ${P.sand}`,borderRadius:24,padding:"11px 16px",fontSize:13,color:P.charcoal}}/>
        <button onClick={()=>send(input)} disabled={!input.trim()||loading} style={{width:44,height:44,borderRadius:"50%",background:input.trim()?P.terracotta:P.sand,border:"none",cursor:"pointer",color:P.white,fontSize:18,transition:"all 0.2s"}}>↑</button>
      </div>
    </div>
  );
}

// ── FEEDBACK ──────────────────────────────────────────────────────────────────
function FeedbackView({entry}) {
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(()=>{
    if(entry && !feedback) {
      setLoading(true);
      const prompt = `Analizá el día completo de Julieta y dále feedback real, específico, amoroso. NO genérico. Macros objetivo: ~1750 kcal, 135g proteína, 170g carbs, 60g grasas.

Estructura en 3 partes:
1. **Lo que funcionó** — concreto y real, no vacío
2. **Un ajuste para mañana** — sobre proteína, timing de comidas, antojos, entrenamiento, sueño, procrastinación o emociones. Conectá causas y efectos (ej: merienda tarde → antojos nocturnos). Desde la curiosidad, nunca el juicio.
3. **Una frase** — que la conecte con la Julieta que ya tiene ese cuerpo y esa vida. Poética pero real.

Datos del día:
${JSON.stringify(entry,null,2)}`;
      callAI(JULI_CTX, prompt).then(r=>{setFeedback(r);setLoading(false);});
    }
  },[entry]);

  if(!entry) return <div style={{textAlign:"center",padding:"50px 20px"}}>{serif("Completá tu día primero",18,P.warmGray,true)}<div style={{marginTop:8,fontSize:12,color:P.sand}}>Registrá algo en Hoy para recibir tu feedback</div></div>;

  return (
    <div style={{animation:"fadeUp 0.4s ease"}}>
      <Card style={{background:`linear-gradient(135deg,${P.terracotta}10,${P.sage}10)`,borderColor:P.terracotta+"30"}}>
        <div style={{fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",color:P.terracotta,marginBottom:14}}>Tu feedback de hoy</div>
        {loading ? <div style={{display:"flex",gap:4,padding:"8px 0"}}>{[0,0.2,0.4].map((d,i)=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:P.sand,animation:`pulse 1s ease ${d}s infinite`}}/>)}</div>
          : <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,lineHeight:1.9,fontStyle:"italic",color:P.charcoal,whiteSpace:"pre-line"}}>{feedback}</div>}
      </Card>
      <Card>
        <div style={{fontSize:10,letterSpacing:"0.12em",textTransform:"uppercase",color:P.warmGray,marginBottom:14}}>Resumen del día</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {[
            {l:"Entreno",v:entry.workout?.gymDay?`Día ${entry.workout.gymDay} ✓`:entry.workout?.pyType||"—"},
            {l:"Agua",v:entry.nutrition?.water?`${entry.nutrition.water} vasos`:"—"},
            {l:"Sueño",v:entry.wellbeing?.sleepH?`${entry.wellbeing.sleepH}h`:"—"},
            {l:"Al despertar",v:entry.morning?.wakeupFeel?.slice(0,2).join(", ")||"—"},
            {l:"Inflamación",v:entry.nutrition?.inflammation||"—"},
            {l:"Procrastinación",v:entry.wellbeing?.procrastinated?"sí":"no"},
          ].map(({l,v})=>(
            <div key={l} style={{background:P.parchment,borderRadius:10,padding:"10px 13px"}}>
              <div style={{fontSize:9,letterSpacing:"0.1em",textTransform:"uppercase",color:P.warmGray,marginBottom:4}}>{l}</div>
              <span style={{fontFamily:"'Playfair Display',serif",fontSize:14}}>{v}</span>
            </div>
          ))}
        </div>
        {entry.wellbeing?.win && <div style={{marginTop:14,borderTop:`1px solid ${P.parchment}`,paddingTop:14}}><div style={{fontSize:9,letterSpacing:"0.1em",textTransform:"uppercase",color:P.terracotta,marginBottom:6}}>Victoria del día</div><div style={{fontFamily:"'Playfair Display',serif",fontSize:14,fontStyle:"italic"}}>"{entry.wellbeing.win}"</div></div>}
      </Card>
    </div>
  );
}

// ── HISTORY ───────────────────────────────────────────────────────────────────
function HistoryView({entries}) {
  const sorted = Object.values(entries).filter(e=>e.date).sort((a,b)=>b.date.localeCompare(a.date));
  if(!sorted.length) return <div style={{textAlign:"center",padding:"60px 20px"}}>{serif("Tu historia comienza hoy",20,P.warmGray,true)}</div>;
  return <div>{sorted.map((e,i)=>(
    <Card key={e.date} delay={i*0.05}>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:500,textTransform:"capitalize",marginBottom:8}}>{new Date(e.date+"T12:00:00").toLocaleDateString("es-AR",{weekday:"long",day:"numeric",month:"long"})}</div>
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        {e.workout?.gymDay && <span style={{fontSize:11,color:P.terracotta}}>✦ Gym día {e.workout.gymDay}</span>}
        {e.workout?.pyType && <span style={{fontSize:11,color:P.sage}}>✦ {e.workout.pyType}</span>}
        {e.nutrition?.water && <span style={{fontSize:11,color:P.sage}}>💧{e.nutrition.water}</span>}
        {e.wellbeing?.sleepH && <span style={{fontSize:11,color:P.warmGray}}>🌙{e.wellbeing.sleepH}h</span>}
        {e.morning?.ritualDone && <span style={{fontSize:11,color:P.gold}}>☀️ ritual</span>}
        {e.wellbeing?.procrastinated && <span style={{fontSize:11,color:P.warmGray}}>⟳ procrastinó</span>}
        {e.wellbeing?.emotions?.slice(0,2).map(em=><span key={em} style={{fontSize:11,color:P.warmGray}}>{em}</span>)}
      </div>
      {e.wellbeing?.win && <div style={{marginTop:8,borderTop:`1px solid ${P.parchment}`,paddingTop:8,fontSize:11,color:P.warmGray,fontStyle:"italic"}}>"{e.wellbeing.win}"</div>}
    </Card>
  ))}</div>;
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("manana");
  const [subTab, setSubTab] = useState("entrenamiento");
  const [appData, setAppData] = useState({entries:{},cycle:{currentDay:5}});
  const [saved, setSaved] = useState({morning:false,workout:false,nutrition:false,wellbeing:false});

  useEffect(()=>{ loadData().then(d=>{ if(d&&Object.keys(d).length){setAppData(d);const t=d.entries?.[today()];if(t)setSaved({morning:!!t.morning,workout:!!t.workout,nutrition:!!t.nutrition,wellbeing:!!t.wellbeing}); } }); },[]);

  const todayEntry = appData.entries?.[today()]||{};
  const phase = getPhase(appData.cycle?.currentDay||5);
  const persist = async (nd) => { await saveData(nd); };

  const saveSection = async (section, data) => {
    const updated = {...appData,entries:{...appData.entries,[today()]:{...todayEntry,[section]:data,date:today()}}};
    setAppData(updated); setSaved(p=>({...p,[section]:true})); await persist(updated);
  };

  const todayFmt = new Date().toLocaleDateString("es-AR",{weekday:"long",day:"numeric",month:"long"});
  const TABS = [{k:"manana",l:"Mañana"},{k:"hoy",l:"Hoy"},{k:"chat",l:"Chat"},{k:"ciclo",l:"Ciclo"},{k:"feedback",l:"Feedback"},{k:"historial",l:"Historial"}];
  const SUBTABS = [{k:"entrenamiento",l:"Movimiento",done:saved.workout},{k:"nutricion",l:"Nutrición",done:saved.nutrition},{k:"bienestar",l:"Bienestar",done:saved.wellbeing}];

  return (
    <div style={{minHeight:"100vh",background:P.cream,maxWidth:480,margin:"0 auto"}}>
      <style>{GS}</style>
      <div style={{background:P.white,borderBottom:`1px solid ${P.parchment}`,padding:"18px 20px 0",position:"sticky",top:0,zIndex:10,boxShadow:"0 2px 14px rgba(40,38,31,0.06)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
          <div>
            <div style={{fontSize:9,letterSpacing:"0.2em",textTransform:"uppercase",color:P.terracotta,marginBottom:3}}>Somos Marítima</div>
            {serif("Mi Sistema",24,P.charcoal,false,500)}
            <div style={{marginTop:3,fontSize:11,color:P.warmGray,textTransform:"capitalize"}}>{todayFmt}</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:22}}>{phase.icon}</div>
            <div style={{fontSize:9,letterSpacing:"0.1em",textTransform:"uppercase",color:phase.color,marginTop:2}}>{phase.name}</div>
            <div style={{fontSize:9,color:P.warmGray}}>día {appData.cycle?.currentDay}</div>
          </div>
        </div>
        <div style={{display:"flex",overflowX:"auto"}}>
          {TABS.map(t=><button key={t.k} onClick={()=>setTab(t.k)} style={{padding:"9px 11px",background:"transparent",border:"none",whiteSpace:"nowrap",borderBottom:`2px solid ${tab===t.k?P.terracotta:"transparent"}`,color:tab===t.k?P.terracotta:P.warmGray,fontSize:11,cursor:"pointer",fontFamily:"'Jost',sans-serif",letterSpacing:"0.08em",textTransform:"uppercase",fontWeight:tab===t.k?500:300,transition:"all 0.2s"}}>{t.l}</button>)}
        </div>
      </div>

      <div style={{padding:"16px 16px 60px"}}>
        {tab==="manana" && (
          <div>
            {saved.morning && <SavedBanner/>}
            <MorningSection data={todayEntry?.morning} onChange={d=>saveSection("morning",d)}/>
          </div>
        )}

        {tab==="hoy" && (
          <div>
            <div style={{display:"flex",gap:8,marginBottom:16}}>
              {SUBTABS.map(st=><button key={st.k} onClick={()=>setSubTab(st.k)} style={{flex:1,padding:"9px 4px",borderRadius:10,border:`1px solid ${subTab===st.k?P.terracotta:P.sand}`,background:subTab===st.k?P.terracotta+"15":"transparent",color:subTab===st.k?P.terracotta:P.warmGray,fontSize:11,cursor:"pointer",fontFamily:"'Jost',sans-serif",letterSpacing:"0.05em",textTransform:"uppercase",fontWeight:subTab===st.k?500:300,transition:"all 0.2s",position:"relative"}}>
                {st.l}{st.done&&<span style={{position:"absolute",top:4,right:6,width:6,height:6,borderRadius:"50%",background:P.sage}}/>}
              </button>)}
            </div>
            {subTab==="entrenamiento" && <WorkoutLog onSave={d=>saveSection("workout",d)} existing={todayEntry?.workout} wasSaved={saved.workout}/>}
            {subTab==="nutricion" && <NutritionLog onSave={d=>saveSection("nutrition",d)} existing={todayEntry?.nutrition} wasSaved={saved.nutrition}/>}
            {subTab==="bienestar" && <WellbeingLog onSave={d=>saveSection("wellbeing",d)} existing={todayEntry?.wellbeing} wasSaved={saved.wellbeing} cycleDay={appData.cycle?.currentDay}/>}
          </div>
        )}

        {tab==="chat" && <AIChat todayEntry={todayEntry} cycleData={appData.cycle}/>}
        {tab==="ciclo" && <CycleView cycleData={appData.cycle} onUpdate={d=>{const u={...appData,cycle:d};setAppData(u);persist(u);}}/>}
        {tab==="feedback" && <FeedbackView entry={Object.keys(todayEntry).length>0?todayEntry:null}/>}
        {tab==="historial" && <HistoryView entries={appData.entries||{}}/>}
      </div>
    </div>
  );
}
