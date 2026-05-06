'use client'
import { useState, useEffect, useCallback, useRef } from 'react'

interface User { name: string; username: string; role: string; plant: string; modules: string }

const ML: Record<string, string> = {
  mis:"MIS", ims:"IMS Stock", production:"Production", planning:"Planning",
  quality:"Quality", rejection:"Rejection", mouldchange:"Mould Change",
  dispatch:"Dispatch", batch:"Batch", sales:"Sales", spares:"Spares",
  mouldpm:"Mould PM", breakdown:"Breakdown", reports:"Reports",
  users:"Users", performance:"Performance"
}

const MACH: Record<string, string[]> = {
  "Plant 477": ["M1-Sumitomo 180T","M2-Sumitomo 180T","M3-Sumitomo 180T","M4-Sumitomo 280T","M5-JSW 180T","M6-Sumitomo 180T"],
  "Plant 488": ["M1-Sumitomo 180T","M2-Sumitomo 180T","M3-JSW 350T","M4-Sumitomo 180T","M5-Sumitomo 350T","M6-JSW 350T","M7-JSW 350T"],
  "Plant 433": ["M1-Milacron 200T","M2-Milacron 200T"]
}

const OPS = ["Dayanand","Alok Kumar","Satyanand","Uday","Sudarshan","Rahul","Pintoo","Parveen","Rahul Singh","Deepak","Karan","Ankush"]

const MOULDS = [
  // Tub Moulds
  {code:"6640",name:"50 ml Tub"},{code:"6774",name:"100 ml Tub"},{code:"6619",name:"175 ml Tub"},
  {code:"6369",name:"250 ml Tub"},{code:"6371",name:"300 ml Tub"},{code:"6537",name:"400 ml Tub"},
  {code:"6372",name:"500 ml Tub 4 Cav"},{code:"6889",name:"500 ml Tub 6 Cav"},
  {code:"6374",name:"750 ml Tub"},{code:"6987",name:"New 750 ml Tub"},
  {code:"6375",name:"1000 ml Tub"},{code:"6988",name:"1000 ml Tub New"},
  {code:"6500",name:"1200 ml Tub"},{code:"6501",name:"1500 ml Tub"},
  {code:"6899",name:"2000 ml Tub"},{code:"6688",name:"2500 ml Tub"},
  // Rectangle
  {code:"6479",name:"500 ml Rectangle"},{code:"6480",name:"650 ml Rectangle"},
  {code:"6481",name:"750 ml Rectangle"},{code:"6482",name:"1000 ml Rectangle"},
  {code:"6872",name:"1000 ml Rectangle New"},
  // Oval
  {code:"6714",name:"500 ml Oval"},{code:"6715",name:"750 ml Oval"},{code:"6716",name:"1000 ml Oval"},
  // Glass
  {code:"6709",name:"350 ml Glass Old"},{code:"6903",name:"300 ml Glass"},
  {code:"6904",name:"350 ml Glass"},{code:"6905",name:"500 ml Glass"},{code:"6502",name:"650 ml Bowl"},
  // RO Series
  {code:"6753",name:"RO 16 Tub"},{code:"6754",name:"RO 24 Tub"},{code:"6755",name:"RO 32 Tub"},
  // RE Series
  {code:"6758",name:"RE 16 Tub"},{code:"6759",name:"RE 24 Tub"},
  {code:"6760",name:"RE 28 Tub"},{code:"6761",name:"RE 38 Tub"},
  // Lid Moulds
  {code:"6641",name:"50 ml Lid"},{code:"6775",name:"100 ml Lid"},
  {code:"6370",name:"250 ml Lid"},{code:"6373",name:"Common Lid 1st"},
  {code:"6605",name:"Common Lid 2nd"},{code:"6840",name:"Common Lid 8 Cav"},
  {code:"6690",name:"Hydraulic Lid"},{code:"6483",name:"Rectangle Lid"},
  {code:"6873",name:"Rectangle Common Lid"},{code:"6717",name:"Oval Lid"},
  {code:"6756",name:"RO 16 Lid"},{code:"6757",name:"RO 24/32 Lid"},
  {code:"6762",name:"RE 16/24 Lid"},{code:"6763",name:"RE 28/38 Lid"},
  {code:"6710",name:"Sipper Lid Old"},{code:"6906",name:"Sipper Lid New"},
  {code:"6620",name:"175 ml Lid"},{code:"6503",name:"Big Common Lid"},
  {code:"6809",name:"500 ml Tamper Lock Rectangle"},{code:"6870",name:"650 ml Tamper Lock Rectangle"},
  {code:"6871",name:"750 ml Tamper Lock Rectangle"},{code:"6872",name:"1000 ml Tamper Lock Rectangle"},
  {code:"6873",name:"Lid Tamper Lock Rectangle"},
]

const PRODUCT_MOULD_MAP: Record<string, string> = {
  "50 ml Container Black":"6640 - 50 ml Tub",
  "50 ml Container Natural":"6641 - 50 ml Lid",
  "100 ml Container Milky":"6774 - 100 ml Tub",
  "100 ml Container Natural":"6775 - 100 ml Lid",
  "100 ml Container Black":"6774 - 100 ml Tub",
  "175 ml Container Milky":"6619 - 175 ml Tub",
  "175 ml Container Black":"6619 - 175 ml Tub",
  "250 ml Container Milky":"6369 - 250 ml Tub",
  "250 ml Container Black":"6369 - 250 ml Tub",
  "250 ml Container Milky (500/ctn)":"6369 - 250 ml Tub",
  "300 ml Container Black":"6371 - 300 ml Tub",
  "300 ml Container Milky":"6371 - 300 ml Tub",
  "400 ml Container Milky":"6537 - 400 ml Tub",
  "400 ml Container Black":"6537 - 400 ml Tub",
  "500 ml Container Black":"6372 - 500 ml Tub 4 Cav",
  "500 ml Container Milky":"6889 - 500 ml Tub 6 Cav",
  "750 ml Container Milky":"6374 - 750 ml Tub",
  "750 ml Container Black":"6987 - New 750 ml Tub",
  "1000 ml Container Milky":"6375 - 1000 ml Tub",
  "1000 ml Container Black":"6988 - 1000 ml Tub New",
  "1200 ml Container Milky":"6500 - 1200 ml Tub",
  "1200 ml Container Black":"6500 - 1200 ml Tub",
  "1500 ml Container Milky":"6501 - 1500 ml Tub",
  "1500 ml Container Black":"6501 - 1500 ml Tub",
  "500 ml Rectangle Container (Black)":"6479 - 500 ml Rectangle",
  "650 ml Rectangle Container (Black)":"6480 - 650 ml Rectangle",
  "750 ml Rectangle Container (Black)":"6481 - 750 ml Rectangle",
  "1000 ml Rectangle Container (Black)":"6482 - 1000 ml Rectangle",
  "2000 ml Tamper Lock Milky":"6899 - 2000 ml Tub",
  "2000 ml Tamper Lock Black":"6899 - 2000 ml Tub",
  "2000 ml Tamper Lock Natural":"6899 - 2000 ml Tub",
  "2500 ml Tamper Lock Milky":"6688 - 2500 ml Tub",
  "2500 ml Tamper Lock Black":"6688 - 2500 ml Tub",
  "2500 ml Tamper Lock Natural":"6688 - 2500 ml Tub",
  "500 ml Oval Tamper Evident":"6714 - 500 ml Oval",
  "750 ml Oval Tamper Evident":"6715 - 750 ml Oval",
  "1000 ml Oval Tamper Evident":"6716 - 1000 ml Oval",
  "Cafe Glass With Sipper Lid 350 ml":"6709 - 350 ml Glass Old",
  "Cafe Glass With Sipper Lid 500 ml":"6905 - 500 ml Glass",
  "Cafe Sipper XL With Lid 300 ml":"6903 - 300 ml Glass",
  "Cafe Sipper XL With Lid 350 ml":"6904 - 350 ml Glass",
  "Cafe Sipper XL With Lid 500 ml":"6905 - 500 ml Glass",
  "RO Series - RO 16 Natural":"6753 - RO 16 Tub",
  "RO Series - RO 16 Black":"6753 - RO 16 Tub",
  "RO Series - RO 24 Natural":"6754 - RO 24 Tub",
  "RO Series - RO 24 Black":"6754 - RO 24 Tub",
  "RO Series - RO 32 Natural":"6755 - RO 32 Tub",
  "RO Series - RO 32 Black":"6755 - RO 32 Tub",
  "Re Series - Re 16 Natural":"6758 - RE 16 Tub",
  "Re Series - Re 16 Black":"6758 - RE 16 Tub",
  "Re Series - Re 24 Natural":"6759 - RE 24 Tub",
  "Re Series - Re 24 Black":"6759 - RE 24 Tub",
  "Re Series - Re 28 Natural":"6760 - RE 28 Tub",
  "Re Series - Re 28 Black":"6760 - RE 28 Tub",
  "Re Series - Re 38 Natural":"6761 - RE 38 Tub",
  "Re Series - Re 38 Black":"6761 - RE 38 Tub",
}

const SPARE_CATEGORIES = [
  // Mould Related
  {group:"🔩 Mould — Lock & Fasteners", items:["Allen Bolt","Locking Bolt","Socket Head Screw","Hex Nut","Spring Washer","Flat Washer","Dowel Pin","Guide Pillar","Guide Bush","Locating Ring"]},
  {group:"💧 Mould — Cooling System", items:["Cooling Nipple","Teflon Tape","O-Ring (Cooling)","Water Plug","Cooling Channel Brush","Pipe Fitting","Hose Pipe","Hose Clamp"]},
  {group:"🔲 Mould — Plate & Body", items:["Mould Plate","Core Plate","Cavity Plate","Spacer Block","Support Pillar","Backing Plate","Parting Surface"]},
  {group:"⚙️ Mould — Core & Cavity", items:["Core Insert","Cavity Insert","Core Block","Cavity Block","Beryllium Copper Insert","Steel Insert","Mould Steel Block"]},
  {group:"🔄 Mould — Ejector System", items:["Ejector Pin","Ejector Sleeve","Return Pin","Ejector Plate","Ejector Bar","Spring (Ejector)","Ejector Guide Bush"]},
  {group:"🔥 Mould — Hot Runner", items:["Hot Runner Nozzle","Heater Band (Nozzle)","Thermocouple (Nozzle)","Nozzle Tip","Hot Runner Controller","Manifold Block"]},
  {group:"↔️ Mould — Slider & Lifter", items:["Slider Block","Slider Insert","Heel Block","Wear Plate","Lifter","Lifter Guide","Angular Pin","Cam Slider"]},
  {group:"🌬️ Mould — Gas Vent & Seal", items:["Gas Vent Insert","O-Ring (Mould)","Parting Seal","Mould Seal Strip","Venting Pin"]},
  {group:"🧴 Mould — Maintenance", items:["Mould Spray (Release)","Mould Rust Preventive","Mould Cleaner","Mould Polish","Grinding Wheel","Mould Repair Weld"]},
  // Machine Related  
  {group:"🌡️ Machine — Heating & Barrel", items:["Heater Band","Thermocouple","Temperature Controller","Barrel Liner","Screw","Barrel","Nozzle","Nozzle Tip","Check Ring","Screw Tip"]},
  {group:"🔧 Machine — Hydraulic", items:["Hydraulic Oil","Hydraulic Pump","Hydraulic Motor","Hydraulic Valve","Hydraulic Cylinder","Oil Seal","Hydraulic Filter","Hydraulic Hose","Pressure Gauge","Flow Control Valve"]},
  {group:"⚡ Machine — Electrical", items:["Contactor","Relay","Timer","PLC Module","Encoder","Servo Motor","Servo Drive","Proximity Sensor","Limit Switch","Fuse","MCB","RCCB","Cable","Wire","Connector"]},
  {group:"🔒 Machine — Clamping", items:["Tie Bar","Tie Bar Nut","Clamping Cylinder","Platen","Toggle Link","Toggle Pin","Toggle Bush","Clamping Bolt","Lock Nut"]},
  {group:"💉 Machine — Injection Unit", items:["Injection Cylinder","Screw Drive Motor","Screw Coupling","Injection Carriage","Ball Screw","Linear Guide","Linear Block"]},
  {group:"❄️ Machine — Cooling & Chiller", items:["Chiller Water Pump","Cooling Tower Fan","Water Filter","Flow Meter","Temperature Sensor","Cooling Pipe","Ball Valve"]},
  {group:"💨 Machine — Pneumatic", items:["Air Filter","Air Regulator","Solenoid Valve (Air)","Air Cylinder","Pneumatic Fitting","Air Pipe","Compressor Filter"]},
  {group:"🛢️ Machine — Lubrication", items:["Machine Oil","Grease","Lubrication Pump","Grease Nipple","Oil Can","Lubricant (Chain)"]},
  {group:"🔐 Machine — Safety & Sensors", items:["Safety Door Switch","Emergency Stop Button","Safety Gate","Light Curtain","Pressure Switch","Level Sensor"]},
  {group:"⛓️ Machine — Drive & Motion", items:["Belt (V-Belt)","Belt (Timing)","Chain","Sprocket","Gear","Coupling","Bearing","Bearing Housing","Shaft","Pulley"]},
  // General
  {group:"🧰 General — Tools", items:["Allen Key Set","Spanner Set","Torque Wrench","Dial Gauge","Vernier Caliper","Micrometer","Temperature Gun","Multimeter"]},
  {group:"🧹 General — Consumables", items:["Sandpaper","Cleaning Cloth","Tissue Paper","Adhesive Tape","Cable Tie","Safety Gloves","Safety Glasses","Welding Rod"]},
]

const ALL_SPARE_CATS = SPARE_CATEGORIES.reduce((a:string[],g)=>[...a,...g.items],[])

const RREJ = ["Short Shot","Flash","Burn Mark","Sink Mark","Warpage","Flow Mark","Contamination","Dimensional","Colour Issue","Other"]
const DAY_SLOTS = ["8am-11am","11am-2pm","2pm-5pm","5pm-8pm"]
const NIGHT_SLOTS = ["8pm-11pm","11pm-2am","2am-5am","5am-8am"]

const VIS_CHECKS = ["No short shots","No flash","No burn marks","No flow marks","No sink marks","Uniform color","No contamination"]
const DIM_CHECKS = ["Wall Thickness","Height","Diameter","Lid Fit","Stack Ability","Drop Test","Weight Check"]

const PM_CHECKLIST = [
  {s:"1. MOLD LOCK",h:true},{s:"No looseness of locking Allen Bolt",m:"Manual"},
  {s:"2. COOLING NIPPLE",h:true},{s:"No looseness, use Teflon on thread",m:"Manual"},
  {s:"3. MOLD PLATE",h:true},{s:"Free from Rust, Bulge, Crack",m:"Visual"},
  {s:"O-Ring slot free from damage",m:"Visual/Manual"},{s:"Cooling channel free from blockage",m:"Air Blow"},
  {s:"Free from deposits, Celan surface",m:"Visual"},{s:"Lifting bolt thread free from damage",m:"Visual/Manual"},
  {s:"4. CORE INSERT, CORE BLOCK",h:true},{s:"Free from Dent, Crack, Damage, Bend",m:"Visual"},
  {s:"No wear out, Damage, Dent, Profile/Shape",m:"Visual"},{s:"Free from deposits, Celan surface",m:"Visual"},
  {s:"Insert position as per Match Mark",m:"Visual"},{s:"O-Ring slot free from damage",m:"Visual/Manual"},
  {s:"Air Vent free from blockage",m:"Visual/Manual"},{s:"No looseness of locking Allen Bolt",m:"Manual, Hand Tight"},
  {s:"5. CAVITY INSERT, CAVITY BLOCK",h:true},{s:"Free from Dent, Crack, Damage, Bend",m:"Visual"},
  {s:"No wear out, Damage, Dent, Profile/Shape",m:"Visual"},{s:"Free from deposits, Celan surface",m:"Visual"},
  {s:"Insert position as per Match Mark",m:"Visual"},{s:"O-Ring slot free from damage",m:"Visual/Manual"},
  {s:"Air Vent free from blockage",m:"Visual/Manual"},{s:"No looseness of locking Allen Bolt",m:"Manual, Hand Tight"},
  {s:"Gate area free from Dent",m:"Visual"},
  {s:"6. GAS VENT",h:true},{s:"Free from blockage",m:"Visual"},{s:"Connected to open exit path",m:"Visual"},
  {s:"7. SLIDER BLOCK, SLIDER INSERT",h:true},{s:"Free from deposits, Celan surface",m:"Visual"},
  {s:"Insert position as per Match Mark",m:"Visual"},{s:"Proper greasing on all sliding portion",m:"Visual/Manual"},
  {s:"Guide rail free from damage, Crack, Chip off",m:"Visual"},{s:"Sliding movement smooth",m:"Visual/Manual"},
]

const nd = () => new Date().toISOString().slice(0,10)

const S = {
  topbar:{background:'#1F3864',padding:'10px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky' as const,top:0,zIndex:100},
  nav:{display:'flex',gap:6,padding:'8px 12px',overflowX:'auto' as const,background:'#fff',borderBottom:'1px solid #E0E0E0',position:'sticky' as const,top:44,zIndex:99},
  nb:{padding:'6px 12px',fontSize:11,fontWeight:600,border:'1px solid #E0E0E0',borderRadius:6,background:'#fff',color:'#666',cursor:'pointer',whiteSpace:'nowrap' as const,flexShrink:0},
  nbA:{padding:'6px 12px',fontSize:11,fontWeight:600,border:'1px solid #1F3864',borderRadius:6,background:'#1F3864',color:'#fff',cursor:'pointer',whiteSpace:'nowrap' as const,flexShrink:0},
  card:{background:'#fff',borderRadius:10,padding:'14px 16px',marginBottom:8,boxShadow:'0 1px 3px rgba(0,0,0,.06)'},
  sb:{width:'100%',padding:10,fontSize:14,fontWeight:700,background:'#1F3864',color:'#fff',border:'none',borderRadius:8,cursor:'pointer',marginTop:4},
  fi:{padding:'9px 12px',fontSize:13,border:'1px solid #E0E0E0',borderRadius:8,outline:'none',background:'#FAFAFA',color:'#1a1a1a',width:'100%'},
  f:{display:'flex',flexDirection:'column' as const,gap:5,marginBottom:12},
  lbl:{fontSize:11,fontWeight:600,color:'#666',textTransform:'uppercase' as const},
  met:{background:'#fff',borderRadius:10,padding:'10px 12px',boxShadow:'0 1px 3px rgba(0,0,0,.06)',textAlign:'center' as const},
  fr:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8},
}

function Toast({msg,ok}:{msg:string,ok:boolean}) {
  return <div style={{padding:'8px 14px',borderRadius:8,fontSize:12,textAlign:'center',marginTop:8,background:ok?'#276221':'#C00000',color:'#fff'}}>{msg}</div>
}

export default function MOS() {
  const [screen,setScreen] = useState<'login'|'main'>('login')
  const [user,setUser] = useState<User|null>(null)
  const [tab,setTab] = useState('')
  const [username,setUsername] = useState('')
  const [password,setPassword] = useState('')
  const [loginErr,setLoginErr] = useState('')
  const [loading,setLoading] = useState(false)

  const doLogin = async () => {
    if (!username||!password){setLoginErr('Username aur password daalo!');return}
    setLoading(true);setLoginErr('')
    const res = await fetch('/api/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password})}).then(r=>r.json())
    setLoading(false)
    if(res.success){setUser(res.user);setScreen('main');setTab(res.user.modules.split(',')[0].trim().toLowerCase())}
    else setLoginErr(res.msg||'Login failed!')
  }

  if(screen==='login') return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:16,background:'#F2F4F7'}}>
      <div style={{background:'#1F3864',color:'#fff',padding:'16px 32px',borderRadius:12,textAlign:'center',marginBottom:24}}>
        <div style={{fontSize:16,fontWeight:700}}>Mayur Operations System</div>
        <div style={{fontSize:11,color:'#90A8C8',marginTop:4}}>Mayur Food Packaging Products — Bawana, Delhi</div>
      </div>
      <div style={{background:'#fff',borderRadius:12,padding:24,width:'100%',maxWidth:340,boxShadow:'0 2px 8px rgba(0,0,0,.08)'}}>
        <div style={{fontSize:18,fontWeight:700,marginBottom:4}}>Welcome</div>
        <div style={{fontSize:13,color:'#666',marginBottom:20}}>Apni ID se login karein</div>
        <div style={S.f}><label style={S.lbl}>Username</label><input style={S.fi} value={username} onChange={e=>setUsername(e.target.value)} placeholder="username" onKeyDown={e=>e.key==='Enter'&&doLogin()}/></div>
        <div style={S.f}><label style={S.lbl}>Password</label><input style={S.fi} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="password" onKeyDown={e=>e.key==='Enter'&&doLogin()}/></div>
        <button style={S.sb} onClick={doLogin} disabled={loading}>{loading?'Logging in...':'Login'}</button>
        {loginErr&&<div style={{fontSize:12,color:'#C00000',marginTop:8,textAlign:'center'}}>{loginErr}</div>}
      </div>
    </div>
  )

  if(!user) return null
  const modules = user.modules.split(',').map((m:string)=>m.trim().toLowerCase())

  return (
    <div>
      <div style={S.topbar}>
        <div><div style={{color:'#fff',fontSize:13,fontWeight:700}}>Mayur Operations System</div><div style={{fontSize:10,color:'#90A8C8'}}>{new Date().toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'})}</div></div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{background:'rgba(255,255,255,.15)',color:'#fff',fontSize:11,padding:'4px 10px',borderRadius:999}}>{user.name} — {user.role}</div>
          <button onClick={()=>{setUser(null);setScreen('login');setUsername('');setPassword('')}} style={{background:'transparent',border:'1px solid rgba(255,255,255,.3)',color:'#fff',fontSize:11,padding:'4px 10px',borderRadius:8,cursor:'pointer'}}>Logout</button>
        </div>
      </div>
      <div style={S.nav}>
        {modules.map((m:string)=><button key={m} style={tab===m?S.nbA:S.nb} onClick={()=>setTab(m)}>{ML[m]||m}</button>)}
      </div>
      <div style={{padding:12}}>
        {tab==='mis'&&<MISTab/>}
        {tab==='ims'&&<IMSTab user={user}/>}
        {tab==='production'&&<ProductionTab user={user}/>}
        {tab==='breakdown'&&<BreakdownTab user={user}/>}
        {tab==='mouldchange'&&<MouldChangeTab user={user}/>}
        {tab==='mouldpm'&&<MouldPMTab user={user}/>}
        {tab==='rejection'&&<RejectionTab user={user}/>}
        {tab==='reports'&&<ReportsTab/>}
        {tab==='dispatch'&&<DispatchTab user={user}/>}
        {tab==='spares'&&<SparesTab user={user}/>}
        {tab==='quality'&&<QualityTab user={user}/>}
        {tab==='batch'&&<BatchTab user={user}/>}
        {tab==='sales'&&<SalesTab user={user}/>}
        {tab==='planning'&&<PlanningTab user={user}/>}
        {tab==='users'&&<UsersTab user={user}/>}
        {tab==='performance'&&<PerformanceTab user={user}/>}
        {!['mis','ims','production','breakdown','mouldchange','mouldpm','rejection','reports','dispatch','spares','quality','batch','sales','planning','users','performance'].includes(tab)&&(
          <div style={S.card}><div style={{fontWeight:700,marginBottom:8}}>{ML[tab]||tab}</div><div style={{color:'#666',fontSize:13}}>Yeh module jald aayega! 🔄</div></div>
        )}
      </div>
    </div>
  )
}

function MISTab() {
  const [data,setData]=useState<any>(null)
  const [loading,setLoading]=useState(true)
  const [activeSection,setActiveSection]=useState('overview')

  useEffect(()=>{
    fetch('/api/mis').then(r=>r.json()).then(d=>{setData(d);setLoading(false)})
  },[])

  if(loading) return <div style={{textAlign:'center',padding:32,color:'#666'}}>Loading MIS...</div>
  if(!data) return <div style={S.card}>Error loading data!</div>

  const prod=data.production||{},plants=prod.plants||{}
  const totalParts=(prod.total||0)+(prod.totalRej||0)
  const rejPct=totalParts>0?Math.round((prod.totalRej||0)/totalParts*100*10)/10:0

  const SECTIONS=[
    {id:'overview',label:'Overview'},
    {id:'production',label:'Production'},
    {id:'quality',label:'Quality'},
    {id:'mould',label:'Mould'},
    {id:'comparison',label:'📊 Comparison'},
    {id:'pivot',label:'📋 Pivot'},
  ]

  return <div>
    {/* Section tabs */}
    <div style={{display:'flex',gap:6,marginBottom:8,overflowX:'auto'}}>
      {SECTIONS.map(s=><button key={s.id} style={activeSection===s.id?S.nbA:S.nb} onClick={()=>setActiveSection(s.id)}>{s.label}</button>)}
    </div>

    {/* OVERVIEW SECTION */}
    {activeSection==='overview'&&<div>
      {/* Alerts */}
      {data.alerts?.length>0&&<div style={{...S.card,border:'2px solid #C00000',background:'#FFEBEE'}}>
        <div style={{fontWeight:700,color:'#C00000',marginBottom:8}}>🚨 System Alerts</div>
        {data.alerts.map((a:string,i:number)=><div key={i} style={{fontSize:12,color:'#C00000',padding:'4px 0',borderBottom:'1px solid #FFCDD2'}}>{a}</div>)}
      </div>}

      {/* Missing entries */}
      {data.missing?.length>0?<div style={{...S.card,border:'2px solid #FF9800',background:'#FFF3E0'}}>
        <div style={{fontWeight:700,color:'#E65100',marginBottom:8}}>⚠️ Missing Entries ({data.missing.length})</div>
        {data.missing.map((m:string,i:number)=><div key={i} style={{fontSize:12,color:'#E65100',padding:'3px 0'}}>{m}</div>)}
      </div>:<div style={{...S.card,border:'1px solid #276221',background:'#E8F5E9'}}>
        <div style={{fontSize:12,color:'#276221',fontWeight:600}}>✅ Aaj saari entries ho gayi!</div>
      </div>}

      {/* Key Metrics */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
        <div style={{...S.met,background:'#E8F5E9',border:'1px solid #276221'}}>
          <div style={{fontSize:10,color:'#276221'}}>Total Good Parts</div>
          <div style={{fontSize:24,fontWeight:700,color:'#276221'}}>{((prod.total||0)/1000).toFixed(1)}K</div>
          <div style={{fontSize:10,color:'#666'}}>{prod.entries||0} entries</div>
        </div>
        <div style={{...S.met,background:rejPct>3?'#FFEBEE':'#FFF9E6',border:`1px solid ${rejPct>3?'#C00000':'#F4B942'}`}}>
          <div style={{fontSize:10,color:rejPct>3?'#C00000':'#854F0B'}}>Rejection %</div>
          <div style={{fontSize:24,fontWeight:700,color:rejPct>3?'#C00000':rejPct>1?'#854F0B':'#276221'}}>{rejPct}%</div>
          <div style={{fontSize:10,color:'#666'}}>{(prod.totalRej||0).toLocaleString()} pcs</div>
        </div>
      </div>

      {/* Module Status Grid */}
      <div style={S.card}>
        <div style={{fontWeight:700,marginBottom:10}}>Module Status</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          {/* IMS */}
          <div style={{background:'#F8F9FF',border:'1px solid #E0E8FF',borderRadius:8,padding:10}}>
            <div style={{fontSize:11,fontWeight:700,color:'#1F3864',marginBottom:4}}>📦 IMS Stock</div>
            <div style={{fontSize:11,color:data.ims?.lastUpdated===data.date?'#276221':'#C00000',fontWeight:600}}>
              {data.ims?.lastUpdated===data.date?'✅ Updated':'❌ Not Updated'}
            </div>
            <div style={{fontSize:10,color:'#666'}}>Last: {data.ims?.lastUpdated||'Never'}</div>
          </div>
          {/* Breakdown */}
          <div style={{background:(data.breakdown?.pending||0)>0?'#FFEBEE':'#F8F9FF',border:`1px solid ${(data.breakdown?.pending||0)>0?'#C00000':'#E0E8FF'}`,borderRadius:8,padding:10}}>
            <div style={{fontSize:11,fontWeight:700,color:'#1F3864',marginBottom:4}}>🔧 Breakdown</div>
            <div style={{fontSize:11,color:(data.breakdown?.pending||0)>0?'#C00000':'#276221',fontWeight:600}}>
              {(data.breakdown?.pending||0)>0?`⚠️ ${data.breakdown.pending} Pending`:'✅ All Clear'}
            </div>
            <div style={{fontSize:10,color:'#666'}}>Avg: {data.breakdown?.avgDowntime||0} min</div>
          </div>
          {/* Mould PM */}
          <div style={{background:(data.mouldPM?.overdue||0)>0?'#FFEBEE':'#F8F9FF',border:`1px solid ${(data.mouldPM?.overdue||0)>0?'#C00000':'#E0E8FF'}`,borderRadius:8,padding:10}}>
            <div style={{fontSize:11,fontWeight:700,color:'#1F3864',marginBottom:4}}>⚙️ Mould PM</div>
            <div style={{fontSize:11,color:(data.mouldPM?.overdue||0)>0?'#C00000':'#276221',fontWeight:600}}>
              {(data.mouldPM?.overdue||0)>0?`🚨 ${data.mouldPM.overdue} Overdue`:'✅ All OK'}
            </div>
            <div style={{fontSize:10,color:'#666'}}>Due Soon: {data.mouldPM?.dueSoon||0}</div>
          </div>
          {/* Production Entries */}
          <div style={{background:'#F8F9FF',border:'1px solid #E0E8FF',borderRadius:8,padding:10}}>
            <div style={{fontSize:11,fontWeight:700,color:'#1F3864',marginBottom:4}}>🏭 Production</div>
            <div style={{fontSize:11,color:(prod.entries||0)>0?'#276221':'#C00000',fontWeight:600}}>
              {prod.entries||0} entries today
            </div>
            <div style={{fontSize:10,color:'#666'}}>Missing: {data.missing?.length||0} shifts</div>
          </div>
        </div>
      </div>

      {/* Plant-wise production */}
      <div style={S.card}>
        <div style={{fontWeight:700,marginBottom:10}}>Plant-wise Production</div>
        {['477','488','433'].map(p=>{
          const pl=plants[p]||{good:0,rej:0,eff:0,entries:0}
          const effCol=pl.eff>=90?'#276221':pl.eff>=75?'#854F0B':'#C00000'
          return <div key={p} style={{background:'#F8F9FF',border:'1px solid #E0E8FF',borderRadius:8,padding:10,marginBottom:8}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
              <span style={{fontWeight:700,color:'#1F3864'}}>Plant {p}</span>
              <span style={{background:pl.eff>=90?'#E8F5E9':pl.eff>=75?'#FFF3E0':'#FFEBEE',color:effCol,padding:'2px 10px',borderRadius:999,fontSize:11,fontWeight:700}}>{pl.eff}%</span>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6,textAlign:'center'}}>
              <div><div style={{fontSize:9,color:'#666'}}>Good</div><div style={{fontSize:16,fontWeight:700,color:'#276221'}}>{(pl.good||0).toLocaleString()}</div></div>
              <div><div style={{fontSize:9,color:'#666'}}>Rejection</div><div style={{fontSize:16,fontWeight:700,color:'#C00000'}}>{(pl.rej||0).toLocaleString()}</div></div>
              <div><div style={{fontSize:9,color:'#666'}}>Entries</div><div style={{fontSize:16,fontWeight:700}}>{pl.entries||0}</div></div>
            </div>
            <div style={{marginTop:8,height:6,background:'#F0F0F0',borderRadius:999,overflow:'hidden'}}>
              <div style={{width:`${Math.min(pl.eff||0,100)}%`,height:'100%',background:effCol,borderRadius:999}}/>
            </div>
          </div>
        })}
      </div>

      {/* 7-day trend */}
      {data.trend?.length>0&&<div style={S.card}>
        <div style={{fontWeight:700,marginBottom:10}}>7-Day Production Trend</div>
        <div style={{display:'flex',alignItems:'flex-end',gap:4,height:100}}>
          {data.trend.map((t:any,i:number)=>{
            const maxV=Math.max(...data.trend.map((x:any)=>x.good))||1
            const h=Math.round((t.good/maxV)*80)
            const rh=Math.round((t.rej/maxV)*80)
            return <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center'}}>
              <div style={{fontSize:9,color:'#276221'}}>{Math.round(t.good/1000)}K</div>
              <div style={{width:'100%',display:'flex',flexDirection:'column',justifyContent:'flex-end',height:80,gap:1}}>
                <div style={{width:'100%',height:rh,background:'#FFCDD2',borderRadius:'2px 2px 0 0'}}/>
                <div style={{width:'100%',height:h,background:'#1F3864',borderRadius:'2px 2px 0 0'}}/>
              </div>
              <div style={{fontSize:8,color:'#666'}}>{t.date?.slice(5)}</div>
            </div>
          })}
        </div>
        <div style={{display:'flex',gap:12,marginTop:6,fontSize:10}}>
          <span style={{display:'flex',alignItems:'center',gap:4}}><span style={{width:10,height:10,background:'#1F3864',display:'inline-block',borderRadius:2}}/> Good</span>
          <span style={{display:'flex',alignItems:'center',gap:4}}><span style={{width:10,height:10,background:'#FFCDD2',display:'inline-block',borderRadius:2}}/> Rejection</span>
        </div>
      </div>}
    </div>}

    {/* PRODUCTION SECTION */}
    {activeSection==='production'&&<MISProductionSection data={data}/>}

    {/* QUALITY SECTION */}
    {activeSection==='quality'&&<MISQualitySection data={data}/>}

    {/* MOULD SECTION */}
    {activeSection==='mould'&&<MISMouldSection data={data}/>}

    {/* COMPARISON SECTION */}
    {activeSection==='comparison'&&<MISComparisonSection/>}

    {/* PIVOT SECTION */}
    {activeSection==='pivot'&&<MISPivotSection/>}
  </div>
}

function MISProductionSection({data}:{data:any}) {
  const prod=data.production||{}
  const plants=prod.plants||{}

  return <div>
    {/* Shift Comparison */}
    <div style={S.card}>
      <div style={{fontWeight:700,marginBottom:10}}>🌅 Shift Comparison</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
        <div style={{background:'#E6F1FB',border:'1px solid #1F3864',borderRadius:8,padding:10,textAlign:'center'}}>
          <div style={{fontSize:11,fontWeight:700,color:'#1F3864',marginBottom:6}}>Day Shift</div>
          <div style={{fontSize:22,fontWeight:700,color:'#1F3864'}}>{((prod.dayGood||0)/1000).toFixed(1)}K</div>
          <div style={{fontSize:10,color:'#666'}}>Good Parts</div>
          <div style={{fontSize:11,color:'#C00000',marginTop:4}}>{prod.dayRej||0} rejected</div>
        </div>
        <div style={{background:'#1F3864',border:'1px solid #1F3864',borderRadius:8,padding:10,textAlign:'center'}}>
          <div style={{fontSize:11,fontWeight:700,color:'#FFD966',marginBottom:6}}>🌙 Night Shift</div>
          <div style={{fontSize:22,fontWeight:700,color:'#fff'}}>{((prod.nightGood||0)/1000).toFixed(1)}K</div>
          <div style={{fontSize:10,color:'#90A8C8'}}>Good Parts</div>
          <div style={{fontSize:11,color:'#FF9800',marginTop:4}}>{prod.nightRej||0} rejected</div>
        </div>
      </div>
    </div>

    {/* Machine-wise production */}
    <div style={S.card}>
      <div style={{fontWeight:700,marginBottom:10}}>🏭 Machine-wise Production</div>
      {(data.machineWise||[]).length===0?<div style={{textAlign:'center',color:'#666',padding:16}}>Aaj koi production entry nahi!</div>:
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
          <thead><tr>
            {['Plant','Machine','Product','Good','Rej','Efficiency','Shift'].map(h=>
              <th key={h} style={{background:'#1F3864',color:'#fff',padding:'6px 8px',textAlign:'left'}}>{h}</th>)}
          </tr></thead>
          <tbody>{(data.machineWise||[]).map((r:any,i:number)=>{
            const eff=r.eff||0
            const effCol=eff>=90?'#276221':eff>=75?'#854F0B':'#C00000'
            return <tr key={i} style={{background:i%2===0?'#FAFAFA':'#fff'}}>
              <td style={{padding:'6px 8px'}}>{r.plant}</td>
              <td style={{padding:'6px 8px',fontWeight:600}}>{r.machine}</td>
              <td style={{padding:'6px 8px',fontSize:10}}>{r.product}</td>
              <td style={{padding:'6px 8px',color:'#276221',fontWeight:700}}>{(r.good||0).toLocaleString()}</td>
              <td style={{padding:'6px 8px',color:'#C00000',fontWeight:700}}>{r.rej||0}</td>
              <td style={{padding:'6px 8px'}}>
                <span style={{background:eff>=90?'#E8F5E9':eff>=75?'#FFF3E0':'#FFEBEE',color:effCol,padding:'2px 7px',borderRadius:999,fontSize:10,fontWeight:600}}>{eff}%</span>
              </td>
              <td style={{padding:'6px 8px',fontSize:10}}>{r.shift}</td>
            </tr>
          })}</tbody>
        </table>
      </div>}
    </div>

    {/* Top 5 Products */}
    <div style={S.card}>
      <div style={{fontWeight:700,marginBottom:10}}>🏆 Top Products Today</div>
      {(data.topProducts||[]).length===0?<div style={{textAlign:'center',color:'#666',padding:16}}>Koi data nahi!</div>:
      (data.topProducts||[]).slice(0,5).map((p:any,i:number)=>{
        const maxG=data.topProducts[0]?.good||1
        const w=Math.round((p.good/maxG)*100)
        return <div key={i} style={{marginBottom:8}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
            <span style={{fontSize:11,fontWeight:600}}>#{i+1} {p.product}</span>
            <span style={{fontSize:11,color:'#276221',fontWeight:700}}>{(p.good||0).toLocaleString()} pcs</span>
          </div>
          <div style={{height:8,background:'#F0F0F0',borderRadius:999,overflow:'hidden'}}>
            <div style={{width:`${w}%`,height:'100%',background:i===0?'#1F3864':i===1?'#276221':i===2?'#854F0B':'#C2185B',borderRadius:999}}/>
          </div>
        </div>
      })}
    </div>
  </div>
}

function MISQualitySection({data}:{data:any}) {
  return <div>
    {/* Rejection by reason */}
    <div style={S.card}>
      <div style={{fontWeight:700,marginBottom:10}}>❌ Rejection by Reason</div>
      {(data.rejByReason||[]).length===0?<div style={{textAlign:'center',color:'#666',padding:16}}>Aaj koi rejection nahi!</div>:
      (data.rejByReason||[]).map((r:any,i:number)=>{
        const maxQ=(data.rejByReason||[])[0]?.qty||1
        const w=Math.round((r.qty/maxQ)*100)
        return <div key={i} style={{marginBottom:8}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
            <span style={{fontSize:11,fontWeight:600}}>{r.reason}</span>
            <span style={{fontSize:11,color:'#C00000',fontWeight:700}}>{r.qty.toLocaleString()} pcs ({r.pct}%)</span>
          </div>
          <div style={{height:8,background:'#F0F0F0',borderRadius:999,overflow:'hidden'}}>
            <div style={{width:`${w}%`,height:'100%',background:'#C00000',borderRadius:999}}/>
          </div>
        </div>
      })}
    </div>

    {/* Top rejection items */}
    <div style={S.card}>
      <div style={{fontWeight:700,marginBottom:10}}>📦 Top Rejection Items</div>
      {(data.rejByItem||[]).length===0?<div style={{textAlign:'center',color:'#666',padding:16}}>Koi rejection nahi!</div>:
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
          <thead><tr>
            {['Product','Qty','Reason','Plant'].map(h=>
              <th key={h} style={{background:'#C00000',color:'#fff',padding:'6px 8px',textAlign:'left'}}>{h}</th>)}
          </tr></thead>
          <tbody>{(data.rejByItem||[]).slice(0,10).map((r:any,i:number)=>(
            <tr key={i} style={{background:i%2===0?'#FAFAFA':'#fff'}}>
              <td style={{padding:'6px 8px',fontWeight:600,fontSize:11}}>{r.product}</td>
              <td style={{padding:'6px 8px',color:'#C00000',fontWeight:700}}>{r.qty.toLocaleString()}</td>
              <td style={{padding:'6px 8px',fontSize:10}}>{r.reason}</td>
              <td style={{padding:'6px 8px',fontSize:10}}>{r.plant}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>}
    </div>

    {/* Quality score summary */}
    <div style={S.card}>
      <div style={{fontWeight:700,marginBottom:10}}>✅ Quality Score Today</div>
      {(data.qualityScore||[]).length===0?<div style={{textAlign:'center',color:'#666',padding:16}}>Koi quality check nahi!</div>:
      (data.qualityScore||[]).map((q:any,i:number)=>{
        const col=q.ngCount===0?'#276221':q.ngCount<3?'#854F0B':'#C00000'
        return <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0',borderBottom:'1px solid #F5F5F5'}}>
          <div>
            <div style={{fontSize:11,fontWeight:600}}>{q.machine}</div>
            <div style={{fontSize:10,color:'#666'}}>{q.product}</div>
          </div>
          <span style={{background:q.ngCount===0?'#E8F5E9':q.ngCount<3?'#FFF3E0':'#FFEBEE',color:col,padding:'2px 10px',borderRadius:999,fontSize:11,fontWeight:600}}>
            {q.ngCount===0?'✅ All OK':`⚠️ ${q.ngCount} NG`}
          </span>
        </div>
      })}
    </div>
  </div>
}

function MISMouldSection({data}:{data:any}) {
  return <div>
    {/* Mould change today */}
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:8}}>
      <div style={S.met}><div style={{fontSize:10,color:'#666'}}>Changes Today</div><div style={{fontSize:20,fontWeight:700}}>{data.mouldChangesToday||0}</div></div>
      <div style={S.met}><div style={{fontSize:10,color:'#666'}}>PM Overdue</div><div style={{fontSize:20,fontWeight:700,color:'#C00000'}}>{data.mouldPM?.overdue||0}</div></div>
      <div style={S.met}><div style={{fontSize:10,color:'#666'}}>Due Soon</div><div style={{fontSize:20,fontWeight:700,color:'#854F0B'}}>{data.mouldPM?.dueSoon||0}</div></div>
    </div>

    {/* PM Due List */}
    <div style={S.card}>
      <div style={{fontWeight:700,marginBottom:10}}>⚙️ PM Due List</div>
      {(data.pmDueList||[]).length===0?<div style={{textAlign:'center',color:'#276221',padding:16}}>✅ Koi PM overdue nahi!</div>:
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
          <thead><tr>
            {['Mould','Plant','Current Shots','PM At','Remaining','Status'].map(h=>
              <th key={h} style={{background:'#1F3864',color:'#fff',padding:'6px 8px',textAlign:'left'}}>{h}</th>)}
          </tr></thead>
          <tbody>{(data.pmDueList||[]).map((m:any,i:number)=>{
            const col=m.status==='OVERDUE'?'#C00000':'#854F0B'
            const bg=m.status==='OVERDUE'?'#FFEBEE':'#FFF3E0'
            return <tr key={i} style={{background:bg}}>
              <td style={{padding:'6px 8px',fontWeight:600}}>{m.mould_name}</td>
              <td style={{padding:'6px 8px',fontSize:10}}>{m.plant}</td>
              <td style={{padding:'6px 8px',textAlign:'center'}}>{(m.current_shots||0).toLocaleString()}</td>
              <td style={{padding:'6px 8px',textAlign:'center'}}>{(m.next_pm_at_shots||0).toLocaleString()}</td>
              <td style={{padding:'6px 8px',textAlign:'center',fontWeight:700,color:col}}>{m.remaining>0?m.remaining.toLocaleString()+' shots':'OVERDUE!'}</td>
              <td style={{padding:'6px 8px'}}><span style={{background:col,color:'#fff',padding:'2px 7px',borderRadius:999,fontSize:10,fontWeight:600}}>{m.status}</span></td>
            </tr>
          })}</tbody>
        </table>
      </div>}
    </div>

    {/* Shots Progress */}
    <div style={S.card}>
      <div style={{fontWeight:700,marginBottom:10}}>📊 Shots Counter Progress</div>
      {(data.shotsProgress||[]).length===0?<div style={{textAlign:'center',color:'#666',padding:16}}>Koi mould setup nahi!</div>:
      (data.shotsProgress||[]).slice(0,10).map((m:any,i:number)=>{
        const pct=Math.min(m.pct||0,100)
        const col=pct>=90?'#C00000':pct>=75?'#854F0B':'#276221'
        return <div key={i} style={{marginBottom:8}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
            <span style={{fontSize:11,fontWeight:600}}>{m.mould_name}</span>
            <span style={{fontSize:10,color:col,fontWeight:700}}>{pct}% used</span>
          </div>
          <div style={{height:8,background:'#F0F0F0',borderRadius:999,overflow:'hidden'}}>
            <div style={{width:`${pct}%`,height:'100%',background:col,borderRadius:999}}/>
          </div>
          <div style={{fontSize:9,color:'#666',marginTop:2}}>{(m.current_shots||0).toLocaleString()} / {(m.next_pm_at_shots||0).toLocaleString()} shots</div>
        </div>
      })}
    </div>
  </div>
}


function IMSTab({user}:{user:User}) {
  const [items,setItems]=useState<any[]>([])
  const [loading,setLoading]=useState(true)
  const [plant,setPlant]=useState('Plant 477')
  const [saving,setSaving]=useState(false)
  const [toast,setToast]=useState<{msg:string,ok:boolean}|null>(null)
  const [vals,setVals]=useState<Record<string,{pk:string,uc:string,ul:string}>>({})
  const [editMin,setEditMin]=useState(false)
  const [minVals,setMinVals]=useState<Record<string,string>>({})
  const [savingMin,setSavingMin]=useState(false)
  const [viewDate,setViewDate]=useState(nd())

  const loadStock=(date:string)=>{
    setLoading(true)
    fetch(`/api/ims?date=${date}`).then(r=>r.json()).then(d=>{
      setItems(d.items||[])
      const init:Record<string,any>={}
      d.items?.forEach((it:any)=>{init[it.name]={pk:it.stockC||'',uc:it.unpackC||'',ul:it.unpackL||''}})
      setVals(init);setLoading(false)
    })
  }

  useEffect(()=>{loadStock(nd())},[])
  const showToast=(msg:string,ok:boolean)=>{setToast({msg,ok});setTimeout(()=>setToast(null),3500)}
  const save=async()=>{
    const entries=items.map(it=>({itemName:it.name,category:it.category,stockCartons:parseFloat(vals[it.name]?.pk||'0')||0,unpackCartons:parseFloat(vals[it.name]?.uc||'0')||0,unpackLid:parseFloat(vals[it.name]?.ul||'0')||0}))
    setSaving(true)
    const res=await fetch('/api/ims',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({plant,enteredBy:user.name,entries})}).then(r=>r.json())
    setSaving(false);showToast(res.msg,res.success)
  }
  if(loading) return <div style={{textAlign:'center',padding:32,color:'#666'}}>Loading stock...</div>
  const safe=items.filter(i=>i.status==='SAFE').length,critical=items.filter(i=>i.status==='CRITICAL').length,low=items.filter(i=>['LOW','DANGER'].includes(i.status)).length
  return <div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:8}}>
      <div style={S.met}><div style={{fontSize:10,color:'#666'}}>Safe</div><div style={{fontSize:20,fontWeight:700,color:'#276221'}}>{safe}</div></div>
      <div style={S.met}><div style={{fontSize:10,color:'#666'}}>Critical</div><div style={{fontSize:20,fontWeight:700,color:'#C00000'}}>{critical}</div></div>
      <div style={S.met}><div style={{fontSize:10,color:'#666'}}>Low</div><div style={{fontSize:20,fontWeight:700,color:'#854F0B'}}>{low}</div></div>
    </div>
    <div style={S.card}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
        <div style={{fontWeight:700}}>Bulk Stock Entry</div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <span style={{fontSize:11,color:'#666'}}>Date:</span>
          <input type="date" value={viewDate} onChange={e=>{setViewDate(e.target.value);loadStock(e.target.value)}} style={{padding:'4px 8px',border:'1px solid #1F3864',borderRadius:6,fontSize:12,fontWeight:600,color:'#1F3864'}}/>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
        <div style={S.f}><label style={S.lbl}>Plant</label><select style={S.fi} value={plant} onChange={e=>setPlant(e.target.value)}><option>Plant 477</option><option>Plant 488</option><option>Plant 433</option></select></div>
        <div style={{display:'flex',alignItems:'flex-end',paddingBottom:12}}>
          <button onClick={()=>{setEditMin(!editMin);setMinVals({})}} style={{width:'100%',padding:'9px',border:'1px solid #854F0B',borderRadius:8,background:editMin?'#854F0B':'#fff',color:editMin?'#fff':'#854F0B',fontSize:12,fontWeight:600,cursor:'pointer'}}>
            {editMin?'✅ Edit Mode ON':'✏️ Min Stock Edit'}
          </button>
        </div>
      </div>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
          <thead><tr>
            <th style={{background:'#1F3864',color:'#fff',padding:'6px 8px',textAlign:'left',minWidth:150}}>Item</th>
            <th style={{background:editMin?'#854F0B':'#1F3864',color:'#fff',padding:'6px 8px',textAlign:'center'}}>{editMin?'Min ✏️':'Min'}</th>
            <th style={{background:'#1F6B3A',color:'#fff',padding:'6px 8px',textAlign:'center'}}>Pack ✅</th>
            <th style={{background:'#1565C0',color:'#fff',padding:'6px 8px',textAlign:'center'}}>Unpack📦</th>
            <th style={{background:'#880E4F',color:'#fff',padding:'6px 8px',textAlign:'center'}}>Lid🔖</th>
            <th style={{background:'#1F3864',color:'#fff',padding:'6px 8px',textAlign:'center'}}>Status</th>
          </tr></thead>
          <tbody>{items.map((it,i)=>{
            const v=vals[it.name]||{pk:'',uc:'',ul:''}
            const pct=it.pct||0,col=pct>100?'#276221':pct>=75?'#C2185B':pct>=50?'#7B1FA2':pct>=25?'#E65100':'#C00000'
            const bg=pct>100?'#F1FFF4':pct>=75?'#FFF0F5':pct>=50?'#F8F0FF':pct>=25?'#FFF8F0':'#FFF0F0'
            const stC=it.status==='SAFE'?'#276221':it.status==='CRITICAL'?'#C00000':it.status==='Not Updated'?'#616161':'#854F0B'
            const stB=it.status==='SAFE'?'#E8F5E9':it.status==='CRITICAL'?'#FFEBEE':it.status==='Not Updated'?'#F5F5F5':'#FFF3E0'
            return <tr key={i} style={{background:i%2===0?'#FAFAFA':'#fff'}}>
              <td style={{padding:'5px 8px',fontSize:11,fontWeight:600}}>{it.name}</td>
              <td style={{padding:2,textAlign:'center'}}>{editMin?(<input type='number' min='0' value={minVals[it.name]!==undefined?minVals[it.name]:String(it.minC||0)} onChange={e=>setMinVals(p=>({...p,[it.name]:e.target.value}))} style={{width:55,padding:4,border:'2px solid #854F0B',borderRadius:6,textAlign:'center',fontSize:12,fontWeight:700,background:'#FFF9E6'}}/>):<span style={{color:'#666'}}>{it.minC}</span>}</td>
              <td style={{padding:3}}><input type="number" min="0" value={v.pk} onChange={e=>setVals(p=>({...p,[it.name]:{...v,pk:e.target.value}}))} style={{width:60,padding:4,border:`1px solid ${col}`,borderRadius:6,textAlign:'center',fontSize:12,fontWeight:600,background:bg}}/></td>
              <td style={{padding:3}}><input type="number" min="0" value={v.uc} onChange={e=>setVals(p=>({...p,[it.name]:{...v,uc:e.target.value}}))} style={{width:55,padding:4,border:'1px solid #E0E0E0',borderRadius:6,textAlign:'center',fontSize:12,background:'#F5F9FF'}}/></td>
              <td style={{padding:3}}><input type="number" min="0" value={v.ul} onChange={e=>setVals(p=>({...p,[it.name]:{...v,ul:e.target.value}}))} style={{width:55,padding:4,border:'1px solid #E0E0E0',borderRadius:6,textAlign:'center',fontSize:12,background:'#FFF5F9'}}/></td>
              <td style={{textAlign:'center'}}><span style={{background:stB,color:stC,padding:'2px 7px',borderRadius:999,fontSize:10,fontWeight:600}}>{it.status}</span></td>
            </tr>
          })}</tbody>
        </table>
      </div>
      {editMin&&<button onClick={async()=>{
        if(Object.keys(minVals).length===0){setToast({msg:'Koi change nahi kiya!',ok:false});return}
        setSavingMin(true)
        const updates=Object.entries(minVals).map(([name,val])=>({name,minC:parseFloat(val)||0}))
        const res=await fetch('/api/ims',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({updates})}).then(r=>r.json()).catch(()=>({success:false,msg:'Error!'}))
        setSavingMin(false);setToast({msg:res.msg||'Saved!',ok:res.success})
        if(res.success){setEditMin(false);setMinVals({});}
      }} disabled={savingMin} style={{...S.sb,marginTop:8,background:'#854F0B'}}>{savingMin?'Saving...':'💾 Save Min Stock Changes'}</button>}
      <button style={{...S.sb,marginTop:8}} onClick={save} disabled={saving}>{saving?'Saving...':'💾 Save All Stock Entry'}</button>
      {toast&&<Toast {...toast}/>}
    </div>
  </div>
}

function ProductionTab({user}:{user:User}) {
  const [items,setItems]=useState<any[]>([])
  const [loading,setLoading]=useState(true)
  const [saving,setSaving]=useState(false)
  const [toast,setToast]=useState<{msg:string,ok:boolean}|null>(null)
  
  // Machine details - common for all products
  const [machForm,setMachForm]=useState({
    date:nd(),shift:'day',plant:'',machine:'',
    machineStatus:'running',stopReason:''
  })
  
  // Multiple products in same shift
  const [products,setProducts]=useState([{
    id:1,product:'',mould:'',cavities:'',cycleTime:'',
    operator:'',operator2:'',material:'',
    slots:DAY_SLOTS.map(s=>({slot:s,good:'',rejection:'',down:'',remarks:''}))
  }])

  useEffect(()=>{
    fetch('/api/ims').then(r=>r.json()).then(d=>{setItems(d.items||[]);setLoading(false)})
  },[])

  const updateSlots=(shift:string)=>{
    const slotNames=shift==='night'?NIGHT_SLOTS:DAY_SLOTS
    setProducts(prev=>prev.map(p=>({...p,slots:slotNames.map(s=>({slot:s,good:'',rejection:'',down:'',remarks:''}))})))
  }

  const addProduct=()=>{
    const slotNames=machForm.shift==='night'?NIGHT_SLOTS:DAY_SLOTS
    setProducts(prev=>[...prev,{
      id:Date.now(),product:'',mould:'',cavities:'',cycleTime:'',
      operator:'',operator2:'',material:'',
      slots:slotNames.map(s=>({slot:s,good:'',rejection:'',down:'',remarks:''}))
    }])
  }

  const removeProduct=(id:number)=>{
    if(products.length===1) return
    setProducts(prev=>prev.filter(p=>p.id!==id))
  }

  const updateProduct=(id:number,field:string,val:string)=>{
    setProducts(prev=>prev.map(p=>{
      if(p.id!==id) return p
      if(field==='product'){
        const mould=PRODUCT_MOULD_MAP[val]||''
        return {...p,product:val,mould:mould}
      }
      return {...p,[field]:val}
    }))
  }

  const updateSlot=(prodId:number,slotIdx:number,field:string,val:string)=>{
    setProducts(prev=>prev.map(p=>{
      if(p.id!==prodId) return p
      const newSlots=[...p.slots]
      newSlots[slotIdx]={...newSlots[slotIdx],[field]:val}
      return {...p,slots:newSlots}
    }))
  }

  const calcProj=(cav:string,ct:string)=>{
    const c=parseFloat(cav||'0'),t=parseFloat(ct||'0')
    if(c>0&&t>0) return Math.floor((180*60)/t)*c
    return 0
  }

  const calcEff=(good:string,proj:number)=>{
    const g=parseFloat(good||'0')
    if(proj>0&&g>0) return Math.round(g/proj*100)
    return 0
  }

  const machines=MACH[machForm.plant]||[]
  const isRunning=machForm.machineStatus==='running'

  const save=async()=>{
    if(!machForm.plant||!machForm.machine){setToast({msg:'Plant aur Machine select karo!',ok:false});return}
    
    let savedCount=0
    let errors=[]
    
    for(const prod of products){
      if(!prod.product) continue
      
      const totalGood=prod.slots.reduce((a,s)=>a+(parseFloat(s.good)||0),0)
      const totalRej=prod.slots.reduce((a,s)=>a+(parseFloat(s.rejection)||0),0)
      
      const res=await fetch('/api/production',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          date:machForm.date,
          shift:machForm.shift==='night'?'Night (8pm-8am)':'Day (8am-8pm)',
          plant:machForm.plant,
          machine:machForm.machine,
          operator:prod.operator,
          operator2:prod.operator2,
          product:prod.product,
          mould:prod.mould,
          cavities:prod.cavities||'0',
          cycleTime:prod.cycleTime||'0',
          material:prod.material,
          machineStatus:machForm.machineStatus,
          stopReason:machForm.stopReason||'',
          remarks:'',
          slots:isRunning?prod.slots:prod.slots.map(s=>({...s,good:'0',rejection:'0',down:'180',remarks:machForm.machineStatus+' - '+machForm.stopReason})),
          enteredBy:user.name
        })
      }).then(r=>r.json())
      
      if(res.success) savedCount++
      else errors.push(res.msg)
    }
    
    setSaving(false)
    if(savedCount>0) setToast({msg:`${savedCount} product entries saved!`,ok:true})
    else setToast({msg:errors[0]||'Error!',ok:false})
  }

  if(loading) return <div style={{textAlign:'center',padding:32,color:'#666'}}>Loading...</div>

  return <div>
    {/* Machine Details Card - Common */}
    <div style={{...S.card,border:'2px solid #1F3864'}}>
      <div style={{fontWeight:700,color:'#1F3864',marginBottom:10,fontSize:14}}>🏭 Machine Details</div>
      <div style={S.fr}>
        <div style={S.f}><label style={S.lbl}>Date</label>
          <input type="date" style={S.fi} value={machForm.date} onChange={e=>setMachForm(p=>({...p,date:e.target.value}))}/>
        </div>
        <div style={S.f}><label style={S.lbl}>Shift</label>
          <select style={S.fi} value={machForm.shift} onChange={e=>{setMachForm(p=>({...p,shift:e.target.value}));updateSlots(e.target.value)}}>
            <option value="day">Day Shift (8am-8pm)</option>
            <option value="night">Night Shift (8pm-8am)</option>
          </select>
        </div>
      </div>
      <div style={S.fr}>
        <div style={S.f}><label style={S.lbl}>Plant</label>
          <select style={S.fi} value={machForm.plant} onChange={e=>setMachForm(p=>({...p,plant:e.target.value,machine:''}))}>
            <option value="">Select</option><option>Plant 477</option><option>Plant 488</option><option>Plant 433</option>
          </select>
        </div>
        <div style={S.f}><label style={S.lbl}>Machine</label>
          <select style={S.fi} value={machForm.machine} onChange={e=>setMachForm(p=>({...p,machine:e.target.value}))}>
            <option>Select plant</option>{machines.map(m=><option key={m}>{m}</option>)}
          </select>
        </div>
      </div>
      <div style={S.f}><label style={S.lbl}>Machine Status</label>
        <select style={S.fi} value={machForm.machineStatus} onChange={e=>setMachForm(p=>({...p,machineStatus:e.target.value}))}>
          <option value="running">Running</option>
          <option value="noplan">No Plan</option>
          <option value="breakdown">Breakdown</option>
          <option value="mouldchange">Mould Change</option>
          <option value="maintenance">Maintenance</option>
          <option value="powercut">Power Cut</option>
        </select>
      </div>
      {!isRunning&&<>
        <div style={{background:'#FFF3E0',border:'1px solid #FF9800',borderRadius:8,padding:'8px 12px',marginBottom:8,fontSize:12,color:'#E65100'}}>⚠️ Machine band hai — reason mandatory!</div>
        <div style={S.f}><label style={S.lbl}>Reason</label><input style={S.fi} value={machForm.stopReason} onChange={e=>setMachForm(p=>({...p,stopReason:e.target.value}))} placeholder="Detail mein reason..."/></div>
      </>}
    </div>

    {/* Products */}
    {products.map((prod,prodIdx)=>{
      const proj=calcProj(prod.cavities,prod.cycleTime)
      const totalGood=prod.slots.reduce((a,s)=>a+(parseFloat(s.good)||0),0)
      const totalRej=prod.slots.reduce((a,s)=>a+(parseFloat(s.rejection)||0),0)
      const totalDown=prod.slots.reduce((a,s)=>a+(parseFloat(s.down)||0),0)
      
      return <div key={prod.id} style={{...S.card,border:`2px solid ${prodIdx===0?'#276221':'#854F0B'}`,marginBottom:8}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
          <div style={{fontWeight:700,color:prodIdx===0?'#276221':'#854F0B',fontSize:14}}>
            📦 Product {prodIdx+1} {prodIdx>0?'(Mould Change ke baad)':''}
          </div>
          {products.length>1&&<button onClick={()=>removeProduct(prod.id)} style={{background:'#FFEBEE',color:'#C00000',border:'none',borderRadius:6,padding:'4px 10px',fontSize:12,cursor:'pointer'}}>Remove</button>}
        </div>
        
        {/* Product details */}
        <div style={S.fr}>
          <div style={S.f}><label style={S.lbl}>Product</label>
            <select style={S.fi} value={prod.product} onChange={e=>updateProduct(prod.id,'product',e.target.value)}>
              <option value="">Select</option>{items.map(i=><option key={i.name}>{i.name}</option>)}
            </select>
          </div>
          <div style={S.f}><label style={S.lbl}>Mould No.</label>
            <select style={{...S.fi,background:prod.mould?'#E2EFDA':'#FAFAFA'}} value={prod.mould} onChange={e=>updateProduct(prod.id,'mould',e.target.value)}>
              <option value="">-- Select Mould --</option>
              <optgroup label="── Tub Moulds ──">
                {MOULDS.filter(m=>!m.name.includes('Lid')&&!m.name.includes('Sipper')).map(m=><option key={m.code} value={m.code+' - '+m.name}>{m.code} - {m.name}</option>)}
              </optgroup>
              <optgroup label="── Lid Moulds ──">
                {MOULDS.filter(m=>m.name.includes('Lid')||m.name.includes('Sipper')).map(m=><option key={m.code} value={m.code+' - '+m.name}>{m.code} - {m.name}</option>)}
              </optgroup>
            </select>
          </div>
        </div>
        <div style={S.fr}>
          <div style={S.f}><label style={S.lbl}>Cavities</label>
            <input type="number" style={S.fi} value={prod.cavities} onChange={e=>updateProduct(prod.id,'cavities',e.target.value)} placeholder="e.g. 4"/>
          </div>
          <div style={S.f}><label style={S.lbl}>Cycle Time (sec)</label>
            <input type="number" style={S.fi} value={prod.cycleTime} onChange={e=>updateProduct(prod.id,'cycleTime',e.target.value)} placeholder="e.g. 12"/>
          </div>
        </div>
        <div style={S.fr}>
          <div style={S.f}><label style={S.lbl}>Operator 1</label>
            <select style={S.fi} value={prod.operator} onChange={e=>updateProduct(prod.id,'operator',e.target.value)}>
              <option value="">Select</option>{OPS.map(o=><option key={o}>{o}</option>)}
            </select>
          </div>
          <div style={S.f}><label style={S.lbl}>Operator 2</label>
            <select style={S.fi} value={prod.operator2} onChange={e=>updateProduct(prod.id,'operator2',e.target.value)}>
              <option value="">None</option>{OPS.map(o=><option key={o}>{o}</option>)}
            </select>
          </div>
        </div>

        {/* Slots */}
        {isRunning&&<div style={{background:'#F8F9FF',border:'1px solid #E0E8FF',borderRadius:8,padding:10,marginTop:8}}>
          <div style={{fontWeight:700,fontSize:12,color:'#1F3864',marginBottom:8}}>Slot-wise Production</div>
          {/* Summary */}
          <div style={{background:'#1F3864',borderRadius:6,padding:'6px 10px',marginBottom:8,display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:6,textAlign:'center'}}>
            <div><div style={{fontSize:9,color:'#90A8C8'}}>Good Parts</div><div style={{fontSize:13,fontWeight:700,color:'#4CAF50'}}>{Math.round(totalGood).toLocaleString()}</div></div>
            <div><div style={{fontSize:9,color:'#90A8C8'}}>Rejection</div><div style={{fontSize:13,fontWeight:700,color:'#FF5252'}}>{Math.round(totalRej).toLocaleString()}</div></div>
            <div><div style={{fontSize:9,color:'#90A8C8'}}>Downtime</div><div style={{fontSize:13,fontWeight:700,color:'#FF9800'}}>{Math.round(totalDown)}m</div></div>
            <div><div style={{fontSize:9,color:'#90A8C8'}}>Projected</div><div style={{fontSize:13,fontWeight:700,color:'#FFD966'}}>{proj>0?(proj*prod.slots.length).toLocaleString():'--'}</div></div>
          </div>
          {prod.slots.map((slot,si)=>{
            const slotProj=proj
            const eff=calcEff(slot.good,slotProj)
            const effCol=eff>=90?'#276221':eff>=75?'#854F0B':'#C00000'
            return <div key={si} style={{background:'#fff',border:'1px solid #E0E8FF',borderRadius:6,padding:'8px 10px',marginBottom:6}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                <span style={{fontWeight:700,fontSize:11,color:'#1F3864'}}>{slot.slot}</span>
                <span style={{background:'#1F3864',color:'#FFD966',padding:'2px 8px',borderRadius:999,fontSize:9}}>Proj: {slotProj>0?slotProj.toLocaleString():'--'}</span>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:5}}>
                <div><div style={{fontSize:9,color:'#666',textAlign:'center'}}>Good Parts</div>
                  <input type="number" min="0" value={slot.good} onChange={e=>updateSlot(prod.id,si,'good',e.target.value)} style={{width:'100%',padding:'5px 3px',border:'1px solid #276221',borderRadius:6,textAlign:'center',fontSize:12,fontWeight:600}}/>
                </div>
                <div><div style={{fontSize:9,color:'#666',textAlign:'center'}}>Rejection</div>
                  <input type="number" min="0" value={slot.rejection} onChange={e=>updateSlot(prod.id,si,'rejection',e.target.value)} style={{width:'100%',padding:'5px 3px',border:'1px solid #C00000',borderRadius:6,textAlign:'center',fontSize:12}}/>
                </div>
                <div><div style={{fontSize:9,color:'#666',textAlign:'center'}}>Downtime(min)</div>
                  <input type="number" min="0" value={slot.down} onChange={e=>updateSlot(prod.id,si,'down',e.target.value)} style={{width:'100%',padding:'5px 3px',border:'1px solid #E0E0E0',borderRadius:6,textAlign:'center',fontSize:12}}/>
                </div>
                <div><div style={{fontSize:9,color:'#666',textAlign:'center'}}>Efficiency</div>
                  <div style={{padding:'5px 3px',border:'1px solid #E0E0E0',borderRadius:6,textAlign:'center',fontSize:12,fontWeight:700,color:eff>0?effCol:'#666',background:eff>=90?'#E8F5E9':eff>=75?'#FFF3E0':eff>0?'#FFEBEE':'#F0F0F0'}}>{eff>0?eff+'%':'--'}</div>
                </div>
              </div>
              <input type="text" value={slot.remarks} onChange={e=>updateSlot(prod.id,si,'remarks',e.target.value)} placeholder="Remarks / Loss reason..." style={{width:'100%',marginTop:5,padding:'4px 8px',border:'1px solid #E0E0E0',borderRadius:6,fontSize:11,background:'#FFFFF0'}}/>
            </div>
          })}
        </div>}
      </div>
    })}

    {/* Add product button */}
    {isRunning&&<button onClick={addProduct} style={{width:'100%',padding:10,border:'2px dashed #854F0B',borderRadius:8,background:'#FFF9E6',color:'#854F0B',fontSize:13,fontWeight:700,cursor:'pointer',marginBottom:8}}>
      + Mould Change — Doosra Product Add Karo
    </button>}

    <button style={S.sb} onClick={async()=>{setSaving(true);await save()}} disabled={saving}>
      {saving?'Saving...':products.length>1?`Save ${products.length} Products`:'Save Production Entry'}
    </button>
    {toast&&<Toast {...toast}/>}
  </div>
}


function RejectionTab({user}:{user:User}) {
  const [items,setItems]=useState<any[]>([])
  const [saving,setSaving]=useState(false)
  const [toast,setToast]=useState<{msg:string,ok:boolean}|null>(null)
  const [form,setForm]=useState({date:nd(),shift:'Day',plant:'',machine:'',product:'',rejectionQty:'',reason:'Short Shot',action:'Rework',notes:''})
  useEffect(()=>{fetch('/api/ims').then(r=>r.json()).then(d=>setItems(d.items||[]))},[])
  const machines=MACH[form.plant]||[]
  const save=async()=>{
    if(!form.plant||!form.product){setToast({msg:'Plant aur Product select karo!',ok:false});return}
    setSaving(true)
    const res=await fetch('/api/rejection',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...form,enteredBy:user.name})}).then(r=>r.json())
    setSaving(false);setToast({msg:res.msg,ok:res.success})
  }
  return <div style={S.card}>
    <div style={{fontWeight:700,marginBottom:10}}>Rejection Entry</div>
    <div style={S.fr}>
      <div style={S.f}><label style={S.lbl}>Date</label><input type="date" style={S.fi} value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))}/></div>
      <div style={S.f}><label style={S.lbl}>Shift</label><select style={S.fi} value={form.shift} onChange={e=>setForm(p=>({...p,shift:e.target.value}))}><option>Day</option><option>Night</option></select></div>
    </div>
    <div style={S.fr}>
      <div style={S.f}><label style={S.lbl}>Plant</label><select style={S.fi} value={form.plant} onChange={e=>setForm(p=>({...p,plant:e.target.value,machine:''}))}>
        <option value="">Select</option><option>Plant 477</option><option>Plant 488</option><option>Plant 433</option>
      </select></div>
      <div style={S.f}><label style={S.lbl}>Machine</label><select style={S.fi} value={form.machine} onChange={e=>setForm(p=>({...p,machine:e.target.value}))}>
        <option>Select plant</option>{machines.map(m=><option key={m}>{m}</option>)}
      </select></div>
    </div>
    <div style={S.fr}>
      <div style={S.f}><label style={S.lbl}>Product</label><select style={S.fi} value={form.product} onChange={e=>setForm(p=>({...p,product:e.target.value}))}>
        <option value="">Select</option>{items.map(i=><option key={i.name}>{i.name}</option>)}
      </select></div>
      <div style={S.f}><label style={S.lbl}>Rejection Qty (pcs)</label><input type="number" style={S.fi} value={form.rejectionQty} onChange={e=>setForm(p=>({...p,rejectionQty:e.target.value}))} placeholder="e.g. 250"/></div>
    </div>
    <div style={S.fr}>
      <div style={S.f}><label style={S.lbl}>Reason</label><select style={S.fi} value={form.reason} onChange={e=>setForm(p=>({...p,reason:e.target.value}))}>
        {RREJ.map(r=><option key={r}>{r}</option>)}
      </select></div>
      <div style={S.f}><label style={S.lbl}>Action</label><select style={S.fi} value={form.action} onChange={e=>setForm(p=>({...p,action:e.target.value}))}>
        <option>Rework</option><option>Scrap</option><option>Under Review</option><option>Machine Adjusted</option>
      </select></div>
    </div>
    <div style={S.f}><label style={S.lbl}>Notes</label><input style={S.fi} value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} placeholder="More details..."/></div>
    <button style={S.sb} onClick={save} disabled={saving}>{saving?'Saving...':'Save Rejection Entry'}</button>
    {toast&&<Toast {...toast}/>}
  </div>
}

function MouldChangeTab({user}:{user:User}) {
  const [data,setData]=useState<any>(null)
  const [saving,setSaving]=useState(false)
  const [toast,setToast]=useState<{msg:string,ok:boolean}|null>(null)
  const [spray,setSpray]=useState<number|null>(null)
  const [timerStart,setTimerStart]=useState<number|null>(null)
  const [elapsed,setElapsed]=useState(0)
  const [timerRunning,setTimerRunning]=useState(false)
  const [form,setForm]=useState({date:nd(),shift:'Day',plant:'',machine:'',oldMould:'',newMould:'',operator:OPS[0],helper:'',estimatedTime:'',mouldLoadTime:'',mouldRunTime:'',remarks:''})
  const timerRef=useRef<any>(null)

  useEffect(()=>{fetch('/api/mouldchange').then(r=>r.json()).then(setData)},[])

  const startTimer=()=>{
    if(!form.estimatedTime){setToast({msg:'Estimated time daalo!',ok:false});return}
    if(!form.plant||!form.oldMould||!form.newMould){setToast({msg:'Plant, Old aur New Mould select karo!',ok:false});return}
    const now=Date.now();setTimerStart(now);setTimerRunning(true);setElapsed(0)
    timerRef.current=setInterval(()=>setElapsed(Math.floor((Date.now()-now)/1000)),1000)
    setToast({msg:`Timer started! Target: ${form.estimatedTime} min`,ok:true})
  }

  const stopTimer=()=>{if(timerRef.current){clearInterval(timerRef.current);setTimerRunning(false)}}

  const mins=Math.floor(elapsed/60),secs=elapsed%60
  const targetSecs=(parseFloat(form.estimatedTime)||0)*60
  const overTarget=elapsed>targetSecs&&targetSecs>0

  const save=async()=>{
    if(!form.plant||!form.oldMould||!form.newMould){setToast({msg:'Plant, Old aur New Mould select karo!',ok:false});return}
    stopTimer()
    const actualMin=timerStart?Math.round((Date.now()-timerStart)/60000):0
    setSaving(true)
    const res=await fetch('/api/mouldchange',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...form,actualTime:actualMin,sprayDone:spray===1?'Yes':'No',enteredBy:user.name})}).then(r=>r.json())
    setSaving(false);setToast({msg:res.msg,ok:res.success})
    if(res.success){setTimerStart(null);setElapsed(0);setSpray(null);fetch('/api/mouldchange').then(r=>r.json()).then(setData)}
  }

  const machines=MACH[form.plant]||[]

  return <div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:8}}>
      <div style={S.met}><div style={{fontSize:10,color:'#666'}}>Total Changes</div><div style={{fontSize:20,fontWeight:700}}>{data?.totalChanges||0}</div></div>
      <div style={S.met}><div style={{fontSize:10,color:'#666'}}>Avg Time</div><div style={{fontSize:20,fontWeight:700,color:'#854F0B'}}>{data?.avgTime||0}m</div></div>
      <div style={S.met}><div style={{fontSize:10,color:'#666'}}>Best Time</div><div style={{fontSize:20,fontWeight:700,color:'#276221'}}>{data?.bestTime||0}m</div></div>
    </div>

    <div style={{...S.card,border:'1px solid #1F3864'}}>
      <div style={{fontWeight:700,color:'#1F3864',marginBottom:10}}>New Mould Change Entry</div>
      <div style={S.fr}>
        <div style={S.f}><label style={S.lbl}>Date</label><input type="date" style={S.fi} value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))}/></div>
        <div style={S.f}><label style={S.lbl}>Shift</label><select style={S.fi} value={form.shift} onChange={e=>setForm(p=>({...p,shift:e.target.value}))}><option>Day</option><option>Night</option></select></div>
      </div>
      <div style={S.fr}>
        <div style={S.f}><label style={S.lbl}>Plant</label><select style={S.fi} value={form.plant} onChange={e=>setForm(p=>({...p,plant:e.target.value,machine:''}))}>
          <option value="">Select</option><option>Plant 477</option><option>Plant 488</option><option>Plant 433</option>
        </select></div>
        <div style={S.f}><label style={S.lbl}>Machine</label><select style={S.fi} value={form.machine} onChange={e=>setForm(p=>({...p,machine:e.target.value}))}>
          <option>Select plant</option>{machines.map(m=><option key={m}>{m}</option>)}
        </select></div>
      </div>
      <div style={S.fr}>
        <div style={S.f}><label style={S.lbl}>Old Mould</label><select style={S.fi} value={form.oldMould} onChange={e=>setForm(p=>({...p,oldMould:e.target.value}))}>
          <option value="">Select</option>{MOULDS.map(m=><option key={m.code} value={`${m.code} - ${m.name}`}>{m.code} - {m.name}</option>)}
        </select></div>
        <div style={S.f}><label style={S.lbl}>New Mould</label><select style={S.fi} value={form.newMould} onChange={e=>setForm(p=>({...p,newMould:e.target.value}))}>
          <option value="">Select</option>{MOULDS.map(m=><option key={m.code} value={`${m.code} - ${m.name}`}>{m.code} - {m.name}</option>)}
        </select></div>
      </div>
      <div style={S.fr}>
        <div style={S.f}><label style={S.lbl}>Operator</label><select style={S.fi} value={form.operator} onChange={e=>setForm(p=>({...p,operator:e.target.value}))}>
          {OPS.map(o=><option key={o}>{o}</option>)}
        </select></div>
        <div style={S.f}><label style={S.lbl}>Helper</label><select style={S.fi} value={form.helper} onChange={e=>setForm(p=>({...p,helper:e.target.value}))}>
          <option value="">None</option>{OPS.map(o=><option key={o}>{o}</option>)}
        </select></div>
      </div>

      {/* Spray */}
      <div style={{background:'#FFF9E6',border:'1px solid #F4B942',borderRadius:8,padding:10,marginBottom:10}}>
        <div style={{fontSize:12,fontWeight:700,color:'#854F0B',marginBottom:6}}>Purane Mould ki Spray</div>
        <div style={{display:'flex',gap:10}}>
          <button onClick={()=>setSpray(1)} style={{flex:1,padding:8,border:`2px solid ${spray===1?'#276221':'#E0E0E0'}`,borderRadius:6,background:spray===1?'#E8F5E9':'#fff',fontSize:12,cursor:'pointer'}}>Yes — Spray Kiya ✅</button>
          <button onClick={()=>setSpray(0)} style={{flex:1,padding:8,border:`2px solid ${spray===0?'#C00000':'#E0E0E0'}`,borderRadius:6,background:spray===0?'#FFEBEE':'#fff',fontSize:12,cursor:'pointer'}}>No — Spray Nahi ❌</button>
        </div>
      </div>

      {/* Timer */}
      <div style={{background:'#F0F4FF',border:'1px solid #1F3864',borderRadius:8,padding:10,marginBottom:10}}>
        <div style={{fontSize:12,fontWeight:700,color:'#1F3864',marginBottom:8}}>Estimated Time → Timer</div>
        <div style={S.fr}>
          <div style={S.f}><label style={S.lbl}>Estimated Time (min)</label><input type="number" style={{...S.fi,fontSize:18,fontWeight:700}} value={form.estimatedTime} onChange={e=>setForm(p=>({...p,estimatedTime:e.target.value}))} placeholder="e.g. 45"/></div>
          <div style={{display:'flex',alignItems:'flex-end'}}>
            <button onClick={timerRunning?stopTimer:startTimer} style={{width:'100%',padding:10,background:timerRunning?'#C00000':'#1F3864',color:'#FFD966',border:'none',borderRadius:8,fontSize:13,fontWeight:700,cursor:'pointer'}}>
              {timerRunning?'⏹ Stop':'▶ Start Timer'}
            </button>
          </div>
        </div>
        {(timerRunning||elapsed>0)&&<div style={{textAlign:'center',marginTop:10}}>
          <div style={{fontSize:9,color:'#666'}}>Time Elapsed</div>
          <div style={{fontSize:36,fontWeight:700,fontFamily:'monospace',color:overTarget?'#C00000':'#1F3864'}}>{String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}</div>
          <div style={{fontSize:11,color:overTarget?'#C00000':'#276221'}}>{overTarget?`⚠️ ${Math.floor((elapsed-targetSecs)/60)} min over!`:`Target: ${form.estimatedTime} min | ${Math.max(0,Math.ceil((targetSecs-elapsed)/60))} min baaki`}</div>
        </div>}
      </div>

      <div style={S.fr}>
        <div style={S.f}><label style={S.lbl}>Mould Load Time</label><input type="time" style={S.fi} value={form.mouldLoadTime} onChange={e=>setForm(p=>({...p,mouldLoadTime:e.target.value}))}/></div>
        <div style={S.f}><label style={S.lbl}>Mould Run Time</label><input type="time" style={S.fi} value={form.mouldRunTime} onChange={e=>setForm(p=>({...p,mouldRunTime:e.target.value}))}/></div>
      </div>
      <div style={S.f}><label style={S.lbl}>Remarks</label><input style={S.fi} value={form.remarks} onChange={e=>setForm(p=>({...p,remarks:e.target.value}))} placeholder="Any notes..."/></div>
      <button style={S.sb} onClick={save} disabled={saving}>{saving?'Saving...':'Save Mould Change'}</button>
      {toast&&<Toast {...toast}/>}
    </div>

    {data?.recent?.length>0&&<div style={S.card}>
      <div style={{fontWeight:700,marginBottom:8}}>Recent Changes</div>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
          <thead><tr>{['Date','Plant','Machine','Old','New','Target','Actual','Status'].map(h=><th key={h} style={{background:'#1F3864',color:'#fff',padding:'6px 8px',textAlign:'left'}}>{h}</th>)}</tr></thead>
          <tbody>{data.recent.map((r:any,i:number)=>{
            const col=r.on_time==='Yes'?'#276221':'#C00000'
            return <tr key={i}>
              <td style={{padding:'6px 8px',fontSize:10}}>{r.date}</td>
              <td style={{padding:'6px 8px',fontSize:10}}>{r.plant}</td>
              <td style={{padding:'6px 8px',fontSize:10}}>{r.machine}</td>
              <td style={{padding:'6px 8px',fontSize:10}}>{r.old_mould}</td>
              <td style={{padding:'6px 8px',fontSize:10}}>{r.new_mould}</td>
              <td style={{padding:'6px 8px',textAlign:'center'}}>{r.estimated_time}m</td>
              <td style={{padding:'6px 8px',textAlign:'center',fontWeight:700,color:col}}>{r.actual_time}m</td>
              <td style={{padding:'6px 8px'}}><span style={{background:r.on_time==='Yes'?'#E8F5E9':'#FFEBEE',color:col,padding:'2px 7px',borderRadius:999,fontSize:10}}>{r.on_time==='Yes'?'On Time':'Delayed'}</span></td>
            </tr>
          })}</tbody>
        </table>
      </div>
    </div>}
  </div>
}

function MouldPMTab({user}:{user:User}) {
  const [moulds,setMoulds]=useState<any[]>([])
  const [loading,setLoading]=useState(true)
  const [saving,setSaving]=useState(false)
  const [toast,setToast]=useState<{msg:string,ok:boolean}|null>(null)
  const [checks,setChecks]=useState<Record<number,string>>({})
  const [setupForm,setSetupForm]=useState({mouldName:'',pmShots:'',currentShots:'',plant:'',machine:''})
  const [doneForm,setDoneForm]=useState({pmDate:nd(),mouldName:'',doneBy:OPS[0],currentShots:'',overallResult:'OK',correction:''})

  const load=useCallback(()=>{fetch('/api/mouldpm').then(r=>r.json()).then(d=>{setMoulds(d.moulds||[]);setLoading(false)})},[])
  useEffect(()=>{load()},[load])

  const setCheck=(i:number,val:string)=>setChecks(p=>({...p,[i]:val}))

  const saveSetup=async()=>{
    if(!setupForm.mouldName||!setupForm.pmShots){setToast({msg:'Mould aur PM shots daalo!',ok:false});return}
    setSaving(true)
    const res=await fetch('/api/mouldpm',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'setup',...setupForm})}).then(r=>r.json())
    setSaving(false);setToast({msg:res.msg,ok:res.success});if(res.success)load()
  }

  const saveDone=async()=>{
    if(!doneForm.mouldName||!doneForm.currentShots){setToast({msg:'Mould aur shots daalo!',ok:false});return}
    setSaving(true)
    const mould=moulds.find(m=>m.mould_name===doneForm.mouldName)
    const res=await fetch('/api/mouldpm',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'done',...doneForm,pmFrequency:mould?.pm_frequency_shots||0,checks,ngCount:Object.values(checks).filter(v=>v==='NG').length})}).then(r=>r.json())
    setSaving(false);setToast({msg:res.msg,ok:res.success});if(res.success){load();setChecks({})}
  }

  const machines=MACH[setupForm.plant]||[]

  if(loading) return <div style={{textAlign:'center',padding:32,color:'#666'}}>Loading...</div>

  const overdue=moulds.filter(m=>m.status==='OVERDUE').length
  const dueSoon=moulds.filter(m=>m.status==='DUE SOON').length

  let checkIdx=0
  return <div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:8}}>
      <div style={S.met}><div style={{fontSize:10,color:'#666'}}>Total Moulds</div><div style={{fontSize:20,fontWeight:700}}>{moulds.length}</div></div>
      <div style={S.met}><div style={{fontSize:10,color:'#666'}}>Overdue</div><div style={{fontSize:20,fontWeight:700,color:'#C00000'}}>{overdue}</div></div>
      <div style={S.met}><div style={{fontSize:10,color:'#666'}}>Due Soon</div><div style={{fontSize:20,fontWeight:700,color:'#854F0B'}}>{dueSoon}</div></div>
    </div>

    {/* Status table */}
    <div style={S.card}>
      <div style={{fontWeight:700,marginBottom:8}}>Mould PM Status</div>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
          <thead><tr>{['Mould','Code','Current','PM At','Progress','Remaining','Status'].map(h=><th key={h} style={{background:'#1F3864',color:'#fff',padding:'6px 8px',textAlign:'left'}}>{h}</th>)}</tr></thead>
          <tbody>{moulds.length===0?<tr><td colSpan={7} style={{textAlign:'center',color:'#666',padding:16}}>Koi mould setup nahi!</td></tr>:moulds.map((m:any,i:number)=>{
            const col=m.status==='OVERDUE'?'#C00000':m.status==='DUE SOON'?'#854F0B':'#276221'
            const bg=m.status==='OVERDUE'?'#FFEBEE':m.status==='DUE SOON'?'#FFF3E0':'#E8F5E9'
            return <tr key={i}>
              <td style={{padding:'6px 8px',fontWeight:600,fontSize:11}}>{m.mould_name}</td>
              <td style={{padding:'6px 8px',fontSize:10,color:'#666'}}>{m.mould_code||'--'}</td>
              <td style={{padding:'6px 8px',textAlign:'center'}}>{(m.current_shots||0).toLocaleString()}</td>
              <td style={{padding:'6px 8px',textAlign:'center'}}>{(m.next_pm_at_shots||0).toLocaleString()}</td>
              <td style={{padding:'6px 8px'}}>
                <div style={{display:'flex',alignItems:'center',gap:4}}>
                  <div style={{flex:1,height:6,background:'#F0F0F0',borderRadius:999,overflow:'hidden'}}><div style={{width:`${Math.min(m.pct,100)}%`,height:'100%',background:col,borderRadius:999}}/></div>
                  <span style={{fontSize:10,fontWeight:700,color:col}}>{m.pct}%</span>
                </div>
              </td>
              <td style={{padding:'6px 8px',textAlign:'center',fontWeight:700,color:col}}>{m.remaining>0?m.remaining.toLocaleString()+' shots':'OVERDUE'}</td>
              <td style={{padding:'6px 8px'}}><span style={{background:bg,color:col,padding:'2px 7px',borderRadius:999,fontSize:10,fontWeight:600}}>{m.status}</span></td>
            </tr>
          })}</tbody>
        </table>
      </div>
    </div>

    {/* Setup form */}
    <div style={{...S.card,border:'1px solid #1F3864'}}>
      <div style={{fontWeight:700,color:'#1F3864',marginBottom:8}}>PM Schedule Setup</div>
      <div style={S.fr}>
        <div style={S.f}><label style={S.lbl}>Mould Name</label>
          <select style={S.fi} value={setupForm.mouldName} onChange={e=>setSetupForm(p=>({...p,mouldName:e.target.value}))}>
            <option value="">-- Select Mould --</option>
            {moulds.map((m:any)=><option key={m.id} value={m.mould_name}>{m.mould_name}</option>)}
          </select>
        </div>
        <div style={S.f}><label style={S.lbl}>PM Frequency (Shots)</label><input type="number" style={S.fi} value={setupForm.pmShots} onChange={e=>setSetupForm(p=>({...p,pmShots:e.target.value}))} placeholder="e.g. 500000"/></div>
      </div>
      <div style={S.fr}>
        <div style={S.f}><label style={S.lbl}>Current Shots</label><input type="number" style={S.fi} value={setupForm.currentShots} onChange={e=>setSetupForm(p=>({...p,currentShots:e.target.value}))} placeholder="Machine counter"/></div>
        <div style={S.f}><label style={S.lbl}>Plant</label><select style={S.fi} value={setupForm.plant} onChange={e=>setSetupForm(p=>({...p,plant:e.target.value,machine:''}))}>
          <option value="">Select</option><option>Plant 477</option><option>Plant 488</option><option>Plant 433</option>
        </select></div>
      </div>
      <button style={S.sb} onClick={saveSetup} disabled={saving}>Set PM Schedule</button>
    </div>

    {/* PM Done form */}
    <div style={S.card}>
      <div style={{fontWeight:700,marginBottom:8}}>PM Done Entry — Checklist</div>
      <div style={S.fr}>
        <div style={S.f}><label style={S.lbl}>Date</label><input type="date" style={S.fi} value={doneForm.pmDate} onChange={e=>setDoneForm(p=>({...p,pmDate:e.target.value}))}/></div>
        <div style={S.f}><label style={S.lbl}>Mould</label><select style={S.fi} value={doneForm.mouldName} onChange={e=>setDoneForm(p=>({...p,mouldName:e.target.value}))}>
          <option value="">Select</option>{moulds.map(m=><option key={m.id}>{m.mould_name}</option>)}
        </select></div>
      </div>
      <div style={S.fr}>
        <div style={S.f}><label style={S.lbl}>Current Shots</label><input type="number" style={S.fi} value={doneForm.currentShots} onChange={e=>setDoneForm(p=>({...p,currentShots:e.target.value}))} placeholder="Machine counter"/></div>
        <div style={S.f}><label style={S.lbl}>Done By</label><select style={S.fi} value={doneForm.doneBy} onChange={e=>setDoneForm(p=>({...p,doneBy:e.target.value}))}>
          {PM_OPS.map(o=><option key={o}>{o}</option>)}
        </select></div>
      </div>
      {/* PM Checklist */}
      <div style={{background:'#F9F9F9',borderRadius:8,padding:'10px 12px',marginBottom:10}}>
        <div style={{fontSize:11,fontWeight:700,marginBottom:8}}>PM Checklist</div>
        {PM_CHECKLIST.map((item,i)=>{
          if(item.h) return <div key={i} style={{background:'#1F3864',color:'#FFD966',padding:'4px 8px',fontSize:10,fontWeight:700,borderRadius:4,margin:'6px 0 3px'}}>{item.s}</div>
          const idx=checkIdx++
          const val=checks[idx]
          return <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'4px 0',borderBottom:'1px solid #F0F0F0'}}>
            <div style={{flex:1}}>
              <span style={{fontSize:11}}>{item.s}</span>
              <span style={{fontSize:9,color:'#888',marginLeft:6}}>[{item.m}]</span>
            </div>
            <div style={{display:'flex',gap:4}}>
              {['OK','NG','N/A'].map(v=><button key={v} onClick={()=>setCheck(idx,v)} style={{padding:'3px 8px',fontSize:10,fontWeight:600,border:`1px solid ${val===v?(v==='OK'?'#276221':v==='NG'?'#C00000':'#666'):'#E0E0E0'}`,borderRadius:999,background:val===v?(v==='OK'?'#E2EFDA':v==='NG'?'#FFEBEE':'#F0F0F0'):'transparent',color:val===v?(v==='OK'?'#276221':v==='NG'?'#C00000':'#666'):'#666',cursor:'pointer'}}>{v}</button>)}
            </div>
          </div>
        })}
      </div>
      <div style={S.fr}>
        <div style={S.f}><label style={S.lbl}>Overall Result</label><select style={S.fi} value={doneForm.overallResult} onChange={e=>setDoneForm(p=>({...p,overallResult:e.target.value}))}><option>OK</option><option>NG - Repair Required</option><option>NG - Replaced</option></select></div>
        <div style={S.f}><label style={S.lbl}>Corrections</label><input style={S.fi} value={doneForm.correction} onChange={e=>setDoneForm(p=>({...p,correction:e.target.value}))} placeholder="Kya correction ki..."/></div>
      </div>
      <button style={S.sb} onClick={saveDone} disabled={saving}>{saving?'Saving...':'Save PM Done Entry'}</button>
      {toast&&<Toast {...toast}/>}
    </div>
  </div>
}

function BreakdownTab({user}:{user:User}) {
  const [data,setData]=useState<any>(null)
  const [loading,setLoading]=useState(true)
  const [toast,setToast]=useState<{msg:string,ok:boolean}|null>(null)
  const [form,setForm]=useState({plant:'',machine:'',shift:'Day',operator:user.name,problem:'',mouldRunning:'',category:'Mechanical'})
  const [resolveId,setResolveId]=useState<string|null>(null)
  const [resForm,setResForm]=useState({analysis:'',actionTaken:'',sparesUsed:'',resolvedBy:user.name,workFinishTime:'',result:'OK - Resolved',remarks:''})
  const isMaintenance=user.role==='Maintenance'||user.username==='prince'||user.username==='rohit'

  const load=useCallback(()=>{fetch('/api/breakdown').then(r=>r.json()).then(d=>{setData(d);setLoading(false)})},[])
  useEffect(()=>{load()},[load])

  const showToast=(msg:string,ok:boolean)=>{setToast({msg,ok});setTimeout(()=>setToast(null),3500)}

  const report=async()=>{
    if(!form.plant||!form.machine){showToast('Plant aur Machine select karo!',false);return}
    if(!form.problem){showToast('Problem describe karo!',false);return}
    const res=await fetch('/api/breakdown',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'report',...form,reportedBy:user.name})}).then(r=>r.json())
    showToast(res.msg,res.success);if(res.success){setForm({plant:'',machine:'',shift:'Day',operator:user.name,problem:'',mouldRunning:'',category:'Mechanical'});load()}
  }

  const resolve=async()=>{
    if(!resForm.workFinishTime){showToast('Finish time daalo!',false);return}
    const res=await fetch('/api/breakdown',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'resolve',bdId:resolveId,...resForm})}).then(r=>r.json())
    showToast(res.msg,res.success);if(res.success){setResolveId(null);load()}
  }

  const machines=MACH[form.plant]||[]
  if(loading) return <div style={{textAlign:'center',padding:32,color:'#666'}}>Loading...</div>

  return <div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:8}}>
      <div style={S.met}><div style={{fontSize:10,color:'#666'}}>Total</div><div style={{fontSize:20,fontWeight:700,color:'#C00000'}}>{data?.totalBreakdowns||0}</div></div>
      <div style={S.met}><div style={{fontSize:10,color:'#666'}}>Pending</div><div style={{fontSize:20,fontWeight:700,color:'#C00000'}}>{data?.pending?.length||0}</div></div>
      <div style={S.met}><div style={{fontSize:10,color:'#666'}}>Downtime</div><div style={{fontSize:20,fontWeight:700,color:'#854F0B'}}>{data?.totalDowntime||0}m</div></div>
    </div>

    {isMaintenance&&data?.pending?.length>0&&<div style={{...S.card,border:'2px solid #FF9800'}}>
      <div style={{fontWeight:700,color:'#E65100',marginBottom:8}}>Pending ({data.pending.length})</div>
      {data.pending.map((b:any)=><div key={b.bd_id} style={{background:'#FFF3E0',border:'1px solid #FF9800',borderRadius:8,padding:10,marginBottom:8}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <div style={{fontSize:12,fontWeight:700,color:'#E65100'}}>{b.bd_id}</div>
            <div style={{fontSize:11,color:'#666'}}>{b.plant} {b.machine} | {b.time_of_call}</div>
            <div style={{fontSize:11,fontWeight:600}}>{b.problem}</div>
          </div>
          <button onClick={()=>setResolveId(b.bd_id)} style={{background:'#1F3864',color:'#fff',border:'none',borderRadius:6,padding:'6px 14px',fontSize:11,cursor:'pointer'}}>Resolve</button>
        </div>
      </div>)}
    </div>}

    {resolveId&&<div style={{...S.card,border:'2px solid #276221'}}>
      <div style={{fontWeight:700,color:'#276221',marginBottom:8}}>Resolution — {resolveId}</div>
      {[['Analysis','analysis','Root cause...'],['Action Taken','actionTaken','Kya kiya...'],['Spares Used','sparesUsed','Part name + qty']].map(([label,key,ph])=>(
        <div key={key} style={S.f}><label style={S.lbl}>{label}</label><input style={S.fi} value={(resForm as any)[key]} onChange={e=>setResForm(p=>({...p,[key]:e.target.value}))} placeholder={ph}/></div>
      ))}
      <div style={S.fr}>
        <div style={S.f}><label style={S.lbl}>Finish Time</label><input type="time" style={S.fi} value={resForm.workFinishTime} onChange={e=>setResForm(p=>({...p,workFinishTime:e.target.value}))}/></div>
        <div style={S.f}><label style={S.lbl}>Result</label><select style={S.fi} value={resForm.result} onChange={e=>setResForm(p=>({...p,result:e.target.value}))}><option>OK - Resolved</option><option>Under Observation</option><option>Pending - Part Ordered</option></select></div>
      </div>
      <button style={{...S.sb,background:'#276221'}} onClick={resolve}>Save Resolution</button>
      <button style={{...S.sb,background:'#666',marginTop:4}} onClick={()=>setResolveId(null)}>Cancel</button>
    </div>}

    <div style={{...S.card,border:'1px solid #C00000'}}>
      <div style={{fontWeight:700,color:'#C00000',marginBottom:8}}>Report Breakdown</div>
      <div style={S.fr}>
        <div style={S.f}><label style={S.lbl}>Plant</label><select style={S.fi} value={form.plant} onChange={e=>setForm(p=>({...p,plant:e.target.value,machine:''}))}>
          <option value="">Select</option><option>Plant 477</option><option>Plant 488</option><option>Plant 433</option>
        </select></div>
        <div style={S.f}><label style={S.lbl}>Machine</label><select style={S.fi} value={form.machine} onChange={e=>setForm(p=>({...p,machine:e.target.value}))}>
          <option>Select plant</option>{machines.map(m=><option key={m}>{m}</option>)}
        </select></div>
      </div>
      <div style={S.f}><label style={S.lbl}>Problem Description</label><input style={S.fi} value={form.problem} onChange={e=>setForm(p=>({...p,problem:e.target.value}))} placeholder="Machine band kyun hui..."/></div>
      <div style={S.fr}>
        <div style={S.f}><label style={S.lbl}>Category</label><select style={S.fi} value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>
          {['Mechanical','Electrical','Hydraulic','Heating','Mould Issue','Material Issue','Operator Error','Other'].map(c=><option key={c}>{c}</option>)}
        </select></div>
        <div style={S.f}><label style={S.lbl}>Shift</label><select style={S.fi} value={form.shift} onChange={e=>setForm(p=>({...p,shift:e.target.value}))}><option>Day</option><option>Night</option></select></div>
      </div>
      <button style={{...S.sb,background:'#C00000'}} onClick={report}>Report Breakdown + Alert</button>
      {toast&&<Toast {...toast}/>}
    </div>

    <div style={S.card}>
      <div style={{fontWeight:700,marginBottom:8}}>Recent Breakdowns</div>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
          <thead><tr>{['BD ID','Date','Plant','Machine','Problem','Downtime','Status'].map(h=><th key={h} style={{background:'#1F3864',color:'#fff',padding:'6px 8px',textAlign:'left'}}>{h}</th>)}</tr></thead>
          <tbody>{(data?.recent||[]).map((r:any,i:number)=>(
            <tr key={i}>
              <td style={{padding:'6px 8px',fontSize:10,fontWeight:600}}>{r.bd_id}</td>
              <td style={{padding:'6px 8px',fontSize:10}}>{r.date}</td>
              <td style={{padding:'6px 8px',fontSize:10}}>{r.plant}</td>
              <td style={{padding:'6px 8px',fontSize:10}}>{r.machine}</td>
              <td style={{padding:'6px 8px',fontSize:10}}>{r.problem}</td>
              <td style={{padding:'6px 8px',fontWeight:700,color:r.downtime_min>60?'#C00000':'#854F0B'}}>{r.downtime_min||0}m</td>
              <td style={{padding:'6px 8px'}}><span style={{background:r.status==='Pending'?'#FFEBEE':'#E8F5E9',color:r.status==='Pending'?'#C00000':'#276221',padding:'2px 7px',borderRadius:999,fontSize:10}}>{r.status}</span></td>
            </tr>
          ))}
          {!data?.recent?.length&&<tr><td colSpan={7} style={{textAlign:'center',color:'#666',padding:16}}>Koi breakdown nahi!</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  </div>
}

// ─── Reports Tab ──────────────────────────────────────────────
function ReportsTab() {
  const [module, setModule] = useState('production')
  const [from, setFrom] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 7)
    return d.toISOString().slice(0, 10)
  })
  const [to, setTo] = useState(nd())
  const [plant, setPlant] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)
  const [toast, setToast] = useState<{msg:string,ok:boolean}|null>(null)

  const load = async () => {
    setLoading(true); setData(null)
    const params = new URLSearchParams({ module, from, to, plant })
    const res = await fetch(`/api/reports?${params}`).then(r => r.json())
    setLoading(false)
    if (res.success) setData(res)
    else setToast({ msg: res.msg, ok: false })
  }

  const MODULES = [
    { id: 'production', label: 'Production' },
    { id: 'ims', label: 'IMS Stock' },
    { id: 'breakdown', label: 'Breakdown' },
    { id: 'mouldchange', label: 'Mould Change' },
    { id: 'rejection', label: 'Rejection' },
    { id: 'mouldpm', label: 'Mould PM' },
  ]

  return (
    <div>
      {/* Filter card */}
      <div style={S.card}>
        <div style={{ fontWeight: 700, marginBottom: 10 }}>📊 Date Range Report</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
          <div style={S.f}><label style={S.lbl}>From Date</label><input type="date" style={S.fi} value={from} onChange={e => setFrom(e.target.value)} /></div>
          <div style={S.f}><label style={S.lbl}>To Date</label><input type="date" style={S.fi} value={to} onChange={e => setTo(e.target.value)} /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
          <div style={S.f}><label style={S.lbl}>Module</label>
            <select style={S.fi} value={module} onChange={e => setModule(e.target.value)}>
              {MODULES.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </div>
          <div style={S.f}><label style={S.lbl}>Plant (Optional)</label>
            <select style={S.fi} value={plant} onChange={e => setPlant(e.target.value)}>
              <option value="">All Plants</option>
              <option>Plant 477</option><option>Plant 488</option><option>Plant 433</option>
            </select>
          </div>
        </div>
        {/* Quick date buttons */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' as const }}>
          {[
            { label: 'Aaj', days: 0 },
            { label: 'Kal', days: 1 },
            { label: '7 Din', days: 7 },
            { label: '15 Din', days: 15 },
            { label: '30 Din', days: 30 },
            { label: 'Is Mahina', days: -1 },
          ].map(btn => (
            <button key={btn.label} onClick={() => {
              const today = new Date()
              const toDate = today.toISOString().slice(0, 10)
              if (btn.days === -1) {
                // This month
                const fromDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10)
                setFrom(fromDate); setTo(toDate)
              } else if (btn.days === 0) {
                setFrom(toDate); setTo(toDate)
              } else {
                const fromDate = new Date(today)
                fromDate.setDate(fromDate.getDate() - btn.days)
                setFrom(fromDate.toISOString().slice(0, 10)); setTo(toDate)
              }
            }} style={{ padding: '5px 12px', border: '1px solid #1F3864', borderRadius: 6, background: '#fff', color: '#1F3864', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
              {btn.label}
            </button>
          ))}
        </div>
        <button style={S.sb} onClick={load} disabled={loading}>{loading ? 'Loading...' : '🔍 Report Dekho'}</button>
        {toast && <Toast {...toast} />}
      </div>

      {/* Results */}
      {data && (
        <div>
          {/* Production Report */}
          {module === 'production' && data.summary && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
                <div style={S.met}><div style={{ fontSize: 10, color: '#666' }}>Good Parts</div><div style={{ fontSize: 18, fontWeight: 700, color: '#276221' }}>{(data.summary.totalGood || 0).toLocaleString()}</div></div>
                <div style={S.met}><div style={{ fontSize: 10, color: '#666' }}>Rejection</div><div style={{ fontSize: 18, fontWeight: 700, color: '#C00000' }}>{(data.summary.totalRej || 0).toLocaleString()}</div></div>
                <div style={S.met}><div style={{ fontSize: 10, color: '#666' }}>Efficiency</div><div style={{ fontSize: 18, fontWeight: 700, color: '#1F3864' }}>{data.summary.avgEff}%</div></div>
                <div style={S.met}><div style={{ fontSize: 10, color: '#666' }}>Entries</div><div style={{ fontSize: 18, fontWeight: 700 }}>{data.summary.entries}</div></div>
              </div>
              {/* Date-wise table */}
              <div style={S.card}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Date-wise Summary</div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                    <thead><tr>
                      {['Date', 'Good Parts', 'Rejection', 'Rej %', 'Downtime', 'Entries'].map(h =>
                        <th key={h} style={{ background: '#1F3864', color: '#fff', padding: '6px 8px', textAlign: 'left' }}>{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {(data.byDate || []).map((r: any, i: number) => {
                        const total = r.good + r.rej
                        const rejPct = total > 0 ? Math.round(r.rej / total * 100 * 10) / 10 : 0
                        return <tr key={i} style={{ background: i % 2 === 0 ? '#FAFAFA' : '#fff' }}>
                          <td style={{ padding: '6px 8px', fontWeight: 600 }}>{r.date}</td>
                          <td style={{ padding: '6px 8px', color: '#276221', fontWeight: 700 }}>{r.good.toLocaleString()}</td>
                          <td style={{ padding: '6px 8px', color: '#C00000', fontWeight: 700 }}>{r.rej.toLocaleString()}</td>
                          <td style={{ padding: '6px 8px', color: rejPct > 3 ? '#C00000' : '#276221', fontWeight: 700 }}>{rejPct}%</td>
                          <td style={{ padding: '6px 8px' }}>{Math.round(r.down)} min</td>
                          <td style={{ padding: '6px 8px' }}>{r.entries}</td>
                        </tr>
                      })}
                      {!data.byDate?.length && <tr><td colSpan={6} style={{ textAlign: 'center', color: '#666', padding: 16 }}>Is period mein koi data nahi!</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* Detail records */}
              <div style={S.card}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Detailed Records ({data.data?.length || 0})</div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                    <thead><tr>
                      {['Date', 'Shift', 'Plant', 'Machine', 'Product', 'Good', 'Rej', 'By'].map(h =>
                        <th key={h} style={{ background: '#1F3864', color: '#fff', padding: '6px 8px', textAlign: 'left' }}>{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {(data.data || []).map((r: any, i: number) => (
                        <tr key={i} style={{ background: i % 2 === 0 ? '#FAFAFA' : '#fff' }}>
                          <td style={{ padding: '6px 8px' }}>{r.date}</td>
                          <td style={{ padding: '6px 8px', fontSize: 10 }}>{r.shift}</td>
                          <td style={{ padding: '6px 8px', fontSize: 10 }}>{r.plant}</td>
                          <td style={{ padding: '6px 8px', fontSize: 10 }}>{r.machine}</td>
                          <td style={{ padding: '6px 8px', fontSize: 10 }}>{r.product}</td>
                          <td style={{ padding: '6px 8px', color: '#276221', fontWeight: 700 }}>{(r.good_parts || 0).toLocaleString()}</td>
                          <td style={{ padding: '6px 8px', color: '#C00000', fontWeight: 700 }}>{r.rejection || 0}</td>
                          <td style={{ padding: '6px 8px', fontSize: 10 }}>{r.entered_by}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Breakdown Report */}
          {module === 'breakdown' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
                <div style={S.met}><div style={{ fontSize: 10, color: '#666' }}>Total</div><div style={{ fontSize: 18, fontWeight: 700, color: '#C00000' }}>{data.summary?.total || 0}</div></div>
                <div style={S.met}><div style={{ fontSize: 10, color: '#666' }}>Total Downtime</div><div style={{ fontSize: 18, fontWeight: 700, color: '#854F0B' }}>{data.summary?.totalDowntime || 0} min</div></div>
                <div style={S.met}><div style={{ fontSize: 10, color: '#666' }}>Avg Downtime</div><div style={{ fontSize: 18, fontWeight: 700 }}>{data.summary?.avgDowntime || 0} min</div></div>
              </div>
              <div style={S.card}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Breakdown Records</div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                    <thead><tr>
                      {['Date', 'Plant', 'Machine', 'Problem', 'Category', 'Downtime', 'Status'].map(h =>
                        <th key={h} style={{ background: '#1F3864', color: '#fff', padding: '6px 8px', textAlign: 'left' }}>{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {(data.data || []).map((r: any, i: number) => (
                        <tr key={i} style={{ background: i % 2 === 0 ? '#FAFAFA' : '#fff' }}>
                          <td style={{ padding: '6px 8px' }}>{r.date}</td>
                          <td style={{ padding: '6px 8px', fontSize: 10 }}>{r.plant}</td>
                          <td style={{ padding: '6px 8px', fontSize: 10 }}>{r.machine}</td>
                          <td style={{ padding: '6px 8px', fontSize: 10 }}>{r.problem}</td>
                          <td style={{ padding: '6px 8px', fontSize: 10 }}>{r.category}</td>
                          <td style={{ padding: '6px 8px', fontWeight: 700, color: (r.downtime_min || 0) > 60 ? '#C00000' : '#854F0B' }}>{r.downtime_min || 0} min</td>
                          <td style={{ padding: '6px 8px' }}><span style={{ background: r.status === 'Pending' ? '#FFEBEE' : '#E8F5E9', color: r.status === 'Pending' ? '#C00000' : '#276221', padding: '2px 7px', borderRadius: 999, fontSize: 10 }}>{r.status}</span></td>
                        </tr>
                      ))}
                      {!data.data?.length && <tr><td colSpan={7} style={{ textAlign: 'center', color: '#666', padding: 16 }}>Koi data nahi!</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Mould Change Report */}
          {module === 'mouldchange' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
                <div style={S.met}><div style={{ fontSize: 10, color: '#666' }}>Total</div><div style={{ fontSize: 18, fontWeight: 700 }}>{data.summary?.total || 0}</div></div>
                <div style={S.met}><div style={{ fontSize: 10, color: '#666' }}>On Time</div><div style={{ fontSize: 18, fontWeight: 700, color: '#276221' }}>{data.summary?.onTime || 0}</div></div>
                <div style={S.met}><div style={{ fontSize: 10, color: '#666' }}>Delayed</div><div style={{ fontSize: 18, fontWeight: 700, color: '#C00000' }}>{data.summary?.delayed || 0}</div></div>
                <div style={S.met}><div style={{ fontSize: 10, color: '#666' }}>Avg Time</div><div style={{ fontSize: 18, fontWeight: 700, color: '#854F0B' }}>{data.summary?.avgTime || 0} min</div></div>
              </div>
              <div style={S.card}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Mould Change Records</div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                    <thead><tr>
                      {['Date', 'Plant', 'Machine', 'Old Mould', 'New Mould', 'Target', 'Actual', 'Status'].map(h =>
                        <th key={h} style={{ background: '#1F3864', color: '#fff', padding: '6px 8px', textAlign: 'left' }}>{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {(data.data || []).map((r: any, i: number) => {
                        const col = r.on_time === 'Yes' ? '#276221' : '#C00000'
                        return <tr key={i} style={{ background: i % 2 === 0 ? '#FAFAFA' : '#fff' }}>
                          <td style={{ padding: '6px 8px' }}>{r.date}</td>
                          <td style={{ padding: '6px 8px', fontSize: 10 }}>{r.plant}</td>
                          <td style={{ padding: '6px 8px', fontSize: 10 }}>{r.machine}</td>
                          <td style={{ padding: '6px 8px', fontSize: 10 }}>{r.old_mould}</td>
                          <td style={{ padding: '6px 8px', fontSize: 10 }}>{r.new_mould}</td>
                          <td style={{ padding: '6px 8px', textAlign: 'center' }}>{r.estimated_time} min</td>
                          <td style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 700, color: col }}>{r.actual_time} min</td>
                          <td style={{ padding: '6px 8px' }}><span style={{ background: r.on_time === 'Yes' ? '#E8F5E9' : '#FFEBEE', color: col, padding: '2px 7px', borderRadius: 999, fontSize: 10 }}>{r.on_time === 'Yes' ? 'On Time' : 'Delayed'}</span></td>
                        </tr>
                      })}
                      {!data.data?.length && <tr><td colSpan={8} style={{ textAlign: 'center', color: '#666', padding: 16 }}>Koi data nahi!</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Rejection Report */}
          {module === 'rejection' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                <div style={S.met}><div style={{ fontSize: 10, color: '#666' }}>Total Entries</div><div style={{ fontSize: 18, fontWeight: 700, color: '#C00000' }}>{data.summary?.total || 0}</div></div>
                <div style={S.met}><div style={{ fontSize: 10, color: '#666' }}>Total Qty</div><div style={{ fontSize: 18, fontWeight: 700, color: '#C00000' }}>{(data.summary?.totalQty || 0).toLocaleString()} pcs</div></div>
              </div>
              {/* By reason */}
              {data.byReason && Object.keys(data.byReason).length > 0 && (
                <div style={S.card}>
                  <div style={{ fontWeight: 700, marginBottom: 8 }}>Reason-wise Breakdown</div>
                  {Object.entries(data.byReason).sort((a: any, b: any) => b[1] - a[1]).map(([reason, qty]: any) => {
                    const total = data.summary?.totalQty || 1
                    const pct = Math.round(qty / total * 100)
                    return <div key={reason} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: '1px solid #F0F0F0' }}>
                      <div style={{ width: 120, fontSize: 11, fontWeight: 600 }}>{reason}</div>
                      <div style={{ flex: 1, height: 8, background: '#F0F0F0', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: '#C00000', borderRadius: 999 }} />
                      </div>
                      <div style={{ fontSize: 11, color: '#C00000', fontWeight: 700, width: 80, textAlign: 'right' }}>{qty.toLocaleString()} pcs ({pct}%)</div>
                    </div>
                  })}
                </div>
              )}
              <div style={S.card}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Rejection Records</div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                    <thead><tr>
                      {['Date', 'Plant', 'Machine', 'Product', 'Qty', 'Reason', 'Action'].map(h =>
                        <th key={h} style={{ background: '#1F3864', color: '#fff', padding: '6px 8px', textAlign: 'left' }}>{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {(data.data || []).map((r: any, i: number) => (
                        <tr key={i} style={{ background: i % 2 === 0 ? '#FAFAFA' : '#fff' }}>
                          <td style={{ padding: '6px 8px' }}>{r.date}</td>
                          <td style={{ padding: '6px 8px', fontSize: 10 }}>{r.plant}</td>
                          <td style={{ padding: '6px 8px', fontSize: 10 }}>{r.machine}</td>
                          <td style={{ padding: '6px 8px', fontSize: 10 }}>{r.product}</td>
                          <td style={{ padding: '6px 8px', fontWeight: 700, color: '#C00000' }}>{(r.rejection_qty || 0).toLocaleString()}</td>
                          <td style={{ padding: '6px 8px', fontSize: 10 }}>{r.reason}</td>
                          <td style={{ padding: '6px 8px', fontSize: 10 }}>{r.action_taken}</td>
                        </tr>
                      ))}
                      {!data.data?.length && <tr><td colSpan={7} style={{ textAlign: 'center', color: '#666', padding: 16 }}>Koi data nahi!</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* IMS Report */}
          {module === 'ims' && (
            <div style={S.card}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>IMS Stock History ({data.data?.length || 0} entries)</div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                  <thead><tr>
                    {['Date', 'Plant', 'Item', 'Pack Ctn', 'Unpack', 'Lid', 'By'].map(h =>
                      <th key={h} style={{ background: '#1F3864', color: '#fff', padding: '6px 8px', textAlign: 'left' }}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {(data.data || []).map((r: any, i: number) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? '#FAFAFA' : '#fff' }}>
                        <td style={{ padding: '6px 8px' }}>{r.date}</td>
                        <td style={{ padding: '6px 8px', fontSize: 10 }}>{r.plant}</td>
                        <td style={{ padding: '6px 8px', fontSize: 10 }}>{r.item_name}</td>
                        <td style={{ padding: '6px 8px', fontWeight: 700 }}>{r.stock_cartons}</td>
                        <td style={{ padding: '6px 8px' }}>{r.unpack_cartons}</td>
                        <td style={{ padding: '6px 8px' }}>{r.unpack_lid}</td>
                        <td style={{ padding: '6px 8px', fontSize: 10 }}>{r.entered_by}</td>
                      </tr>
                    ))}
                    {!data.data?.length && <tr><td colSpan={7} style={{ textAlign: 'center', color: '#666', padding: 16 }}>Koi data nahi!</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Mould PM Report */}
          {module === 'mouldpm' && (
            <div style={S.card}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Mould PM Logs ({data.total || 0})</div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                  <thead><tr>
                    {['Date', 'Mould', 'Done By', 'Current Shots', 'Next PM', 'NG Count', 'Result'].map(h =>
                      <th key={h} style={{ background: '#1F3864', color: '#fff', padding: '6px 8px', textAlign: 'left' }}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {(data.data || []).map((r: any, i: number) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? '#FAFAFA' : '#fff' }}>
                        <td style={{ padding: '6px 8px' }}>{r.date}</td>
                        <td style={{ padding: '6px 8px', fontWeight: 600 }}>{r.mould_name}</td>
                        <td style={{ padding: '6px 8px', fontSize: 10 }}>{r.done_by}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'center' }}>{(r.current_shots || 0).toLocaleString()}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'center' }}>{(r.next_pm_shots || 0).toLocaleString()}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'center', color: r.ng_count > 0 ? '#C00000' : '#276221', fontWeight: 700 }}>{r.ng_count}</td>
                        <td style={{ padding: '6px 8px' }}><span style={{ background: r.overall_result === 'OK' ? '#E8F5E9' : '#FFEBEE', color: r.overall_result === 'OK' ? '#276221' : '#C00000', padding: '2px 7px', borderRadius: 999, fontSize: 10 }}>{r.overall_result}</span></td>
                      </tr>
                    ))}
                    {!data.data?.length && <tr><td colSpan={7} style={{ textAlign: 'center', color: '#666', padding: 16 }}>Koi data nahi!</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Dispatch Tab ─────────────────────────────────────────────
function DispatchTab({user}:{user:User}) {
  const [items,setItems]=useState<any[]>([])
  const [parties,setParties]=useState<any[]>([])
  const [recent,setRecent]=useState<any[]>([])
  const [loading,setLoading]=useState(true)
  const [saving,setSaving]=useState(false)
  const [toast,setToast]=useState<{msg:string,ok:boolean}|null>(null)
  const [challan,setChallan]=useState<any>(null)
  const [customer,setCustomer]=useState('')
  const [vehicleType,setVehicleType]=useState('5')
  const [vehicleNo,setVehicleNo]=useState('')
  const [driverName,setDriverName]=useState('')
  const [deliveryAddress,setDeliveryAddress]=useState('')
  const [notes,setNotes]=useState('')
  const [date,setDate]=useState(nd())
  const [lines,setLines]=useState<any[]>([
    {items:[{item:'',qty:''}]},
    {items:[{item:'',qty:''}]},
    {items:[{item:'',qty:''}]},
    {items:[{item:'',qty:''}]},
    {items:[{item:'',qty:''}]},
  ])

  useEffect(()=>{
    Promise.all([
      fetch('/api/ims').then(r=>r.json()),
      fetch('/api/dispatch').then(r=>r.json())
    ]).then(([imsRes,dispRes])=>{
      setItems(imsRes.items||[])
      setParties(dispRes.parties||[])
      setRecent(dispRes.recent||[])
      setLoading(false)
    })
  },[])

  const maxLines = parseInt(vehicleType)

  const updateLineItem=(lineIdx:number,itemIdx:number,field:string,val:string)=>{
    setLines(prev=>{
      const n=[...prev]
      n[lineIdx]={...n[lineIdx],items:[...n[lineIdx].items]}
      n[lineIdx].items[itemIdx]={...n[lineIdx].items[itemIdx],[field]:val}
      return n
    })
  }

  const addItemToLine=(lineIdx:number)=>{
    setLines(prev=>{
      const n=[...prev]
      n[lineIdx]={...n[lineIdx],items:[...n[lineIdx].items,{item:'',qty:''}]}
      return n
    })
  }

  const removeItemFromLine=(lineIdx:number,itemIdx:number)=>{
    setLines(prev=>{
      const n=[...prev]
      n[lineIdx]={...n[lineIdx],items:n[lineIdx].items.filter((_:any,i:number)=>i!==itemIdx)}
      return n
    })
  }

  const calcLineTotal=(lineIdx:number)=>lines[lineIdx]?.items.reduce((a:number,i:any)=>a+(parseFloat(i.qty)||0),0)||0
  const grandTotal=lines.slice(0,maxLines).reduce((a,_,i)=>a+calcLineTotal(i),0)

  const save=async()=>{
    if(!customer){setToast({msg:'Party naam daalo!',ok:false});return}
    const dispLines:any[]=[]
    lines.slice(0,maxLines).forEach((line,lineIdx)=>{
      line.items.forEach((item:any)=>{
        if(item.item&&parseFloat(item.qty)>0){
          const found=items.find(i=>i.name===item.item)
          dispLines.push({lineNo:lineIdx+1,plant:'All',itemName:item.item,qty:parseFloat(item.qty),category:found?.category||''})
        }
      })
    })
    if(dispLines.length===0){setToast({msg:'Koi item nahi bhara!',ok:false});return}
    setSaving(true)
    const res=await fetch('/api/dispatch',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({date,customer,vehicleType:vehicleType==='5'?'Choti Gaadi':'Badi Gaadi',vehicleNo,driverName,deliveryAddress,notes,dispatchBy:user.name,lines:dispLines})}).then(r=>r.json())
    setSaving(false)
    if(res.success){
      setToast({msg:res.msg,ok:true})
      setChallan({...res,customer,vehicleNo,driverName,date,lines:dispLines,grandTotal})
      fetch('/api/dispatch').then(r=>r.json()).then(d=>setRecent(d.recent||[]))
    } else {
      setToast({msg:res.msg,ok:false})
    }
  }

  if(loading) return <div style={{textAlign:'center',padding:32,color:'#666'}}>Loading...</div>

  return <div>
    {/* Recent dispatches */}
    {recent.length>0&&<div style={S.card}>
      <div style={{fontWeight:700,marginBottom:8}}>Recent Dispatches</div>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
          <thead><tr>{['Challan','Date','Party','Items','Total Ctn','Vehicle','Driver','By','Action'].map(h=><th key={h} style={{background:'#1F3864',color:'#fff',padding:'6px 8px',textAlign:'left'}}>{h}</th>)}</tr></thead>
          <tbody>{recent.map((r:any,i:number)=>(
            <tr key={i} style={{background:i%2===0?'#FAFAFA':'#fff'}}>
              <td style={{padding:'6px 8px',fontWeight:600,color:'#1F3864'}}>{r.challan_no}</td>
              <td style={{padding:'6px 8px',fontSize:10}}>{r.date}</td>
              <td style={{padding:'6px 8px',fontWeight:600}}>{r.customer}</td>
              <td style={{padding:'6px 8px',fontSize:10}}>
                {(r.dispatch_lines||[]).slice(0,2).map((l:any,li:number)=>(
                  <div key={li}>{l.item_name||l.itemName||'--'} — {l.qty} Ctn</div>
                ))}
                {(r.dispatch_lines||[]).length>2&&<div style={{color:'#666'}}>+{(r.dispatch_lines||[]).length-2} more...</div>}
              </td>
              <td style={{padding:'6px 8px',fontWeight:700,color:'#276221'}}>{r.total_cartons} Ctn</td>
              <td style={{padding:'6px 8px',fontSize:10}}>{r.vehicle_no||'--'}</td>
              <td style={{padding:'6px 8px',fontSize:10}}>{r.driver_name||'--'}</td>
              <td style={{padding:'6px 8px',fontSize:10}}>{r.dispatch_by}</td>
              <td style={{padding:'6px 8px'}}>
                <button onClick={()=>setChallan({
                  challanNo:r.challan_no,
                  date:r.date,
                  customer:r.customer,
                  vehicleNo:r.vehicle_no||'',
                  driverName:r.driver_name||'',
                  notes:r.notes||'',
                  lines:(r.dispatch_lines||[]).map((l:any)=>({...l,itemName:l.item_name,lineNo:l.line_no})),
                  grandTotal:r.total_cartons
                })} style={{background:'#1F3864',color:'#fff',border:'none',borderRadius:4,padding:'3px 8px',fontSize:10,cursor:'pointer'}}>
                  🖨️ Challan
                </button>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>}

    {/* Challan preview */}
    {challan&&<div style={{...S.card,border:'2px solid #1F3864'}}>
      <div style={{textAlign:'center',marginBottom:10}}>
        <div style={{fontSize:14,fontWeight:700,color:'#1F3864'}}>MAYUR FOOD PACKAGING PRODUCTS</div>
        <div style={{fontSize:10,color:'#666'}}>Bawana, Delhi — Delivery Challan</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:4,marginBottom:8,fontSize:11}}>
        <div><span style={{color:'#666'}}>Challan: </span><strong>{challan.challanNo}</strong></div>
        <div><span style={{color:'#666'}}>Date: </span><strong>{challan.date}</strong></div>
        <div><span style={{color:'#666'}}>Party: </span><strong>{challan.customer}</strong></div>
        <div><span style={{color:'#666'}}>Vehicle: </span><strong>{challan.vehicleNo}</strong></div>
        <div><span style={{color:'#666'}}>Driver: </span><strong>{challan.driverName}</strong></div>
        <div><span style={{color:'#666'}}>Type: </span><strong>{vehicleType==='5'?'Choti':'Badi'} Gaadi</strong></div>
      </div>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
          <thead><tr>
            <th style={{background:'#1F3864',color:'#fff',padding:'6px 8px'}}>Line</th>
            <th style={{background:'#1F3864',color:'#fff',padding:'6px 8px'}}>Item</th>
            <th style={{background:'#1F3864',color:'#fff',padding:'6px 8px',textAlign:'center'}}>Qty (Ctn)</th>
          </tr></thead>
          <tbody>{challan.lines.map((l:any,i:number)=>(
            <tr key={i} style={{background:i%2===0?'#FAFAFA':'#fff'}}>
              <td style={{padding:'6px 8px'}}>Line {l.line_no||l.lineNo||i+1}</td>
              <td style={{padding:'6px 8px'}}>{l.item_name||l.itemName||'--'}</td>
              <td style={{padding:'6px 8px',textAlign:'center',fontWeight:700}}>{l.qty}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <div style={{background:'#1F3864',color:'#FFD966',padding:'8px 14px',textAlign:'center',marginTop:8,borderRadius:4,fontSize:13,fontWeight:700}}>
        TOTAL: {challan.grandTotal} CARTONS
      </div>
      <button onClick={()=>window.print()} style={{width:'100%',marginTop:8,padding:8,background:'#276221',color:'#fff',border:'none',borderRadius:6,fontSize:12,cursor:'pointer'}}>🖨️ Print Challan</button>
    </div>}

    {/* New Dispatch Form */}
    <div style={S.card}>
      <div style={{fontWeight:700,marginBottom:10}}>New Dispatch Order</div>
      <div style={S.fr}>
        <div style={S.f}><label style={S.lbl}>Date</label><input type="date" style={S.fi} value={date} onChange={e=>setDate(e.target.value)}/></div>
        <div style={S.f}><label style={S.lbl}>Vehicle Type</label>
          <select style={S.fi} value={vehicleType} onChange={e=>{setVehicleType(e.target.value);const n=parseInt(e.target.value);setLines(Array.from({length:Math.max(n,lines.length)},(_,i)=>lines[i]||{items:[{item:'',qty:''}]}))}}>
            <option value="5">Choti Gaadi (5 lines)</option>
            <option value="11">Badi Gaadi (11 lines)</option>
          </select>
        </div>
      </div>
      <div style={S.f}>
        <label style={S.lbl}>Party / Customer Name</label>
        <input style={S.fi} value={customer} onChange={e=>setCustomer(e.target.value)} placeholder="Party naam..." list="party-list"/>
        <datalist id="party-list">{parties.map((p:any)=><option key={p.party_name} value={p.party_name}/>)}</datalist>
      </div>
      <div style={S.fr}>
        <div style={S.f}><label style={S.lbl}>Vehicle No.</label><input style={S.fi} value={vehicleNo} onChange={e=>setVehicleNo(e.target.value)} placeholder="e.g. DL 1C 1234"/></div>
        <div style={S.f}><label style={S.lbl}>Driver Name</label><input style={S.fi} value={driverName} onChange={e=>setDriverName(e.target.value)} placeholder="Driver naam"/></div>
      </div>
      <div style={S.f}><label style={S.lbl}>Delivery Address</label><input style={S.fi} value={deliveryAddress} onChange={e=>setDeliveryAddress(e.target.value)} placeholder="Location"/></div>
    </div>

    {/* Lines */}
    {Array.from({length:maxLines},(_,lineIdx)=>(
      <div key={lineIdx} style={{...S.card,border:'1px solid #E0E8FF'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
          <span style={{fontWeight:700,color:'#1F3864',fontSize:13}}>Line {lineIdx+1}</span>
          <span style={{color:'#276221',fontWeight:700,fontSize:12}}>{calcLineTotal(lineIdx)} Ctn</span>
        </div>
        {(lines[lineIdx]?.items||[{item:'',qty:''}]).map((item:any,itemIdx:number)=>(
          <div key={itemIdx} style={{display:'grid',gridTemplateColumns:'2fr 1fr 0.3fr',gap:5,marginBottom:5}}>
            <select style={{...S.fi,fontSize:11}} value={item.item} onChange={e=>updateLineItem(lineIdx,itemIdx,'item',e.target.value)}>
              <option value="">-- Item --</option>
              {items.map(i=><option key={i.name} value={i.name}>{i.name}</option>)}
            </select>
            <input type="number" min="0" placeholder="Ctn" value={item.qty} onChange={e=>updateLineItem(lineIdx,itemIdx,'qty',e.target.value)} style={{padding:'6px',fontSize:12,fontWeight:600,border:'1px solid #E0E0E0',borderRadius:6,textAlign:'center'}}/>
            <button onClick={()=>removeItemFromLine(lineIdx,itemIdx)} style={{background:'#FFEBEE',color:'#C00000',border:'none',borderRadius:6,fontSize:14,cursor:'pointer'}}>×</button>
          </div>
        ))}
        <button onClick={()=>addItemToLine(lineIdx)} style={{width:'100%',padding:5,border:'1px dashed #1F3864',borderRadius:6,background:'transparent',color:'#1F3864',fontSize:11,cursor:'pointer'}}>+ Item Add Karo</button>
      </div>
    ))}

    {/* Grand total */}
    <div style={{background:'#1F3864',borderRadius:10,padding:'10px 14px',marginBottom:10,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <span style={{color:'#90A8C8',fontSize:12,fontWeight:600}}>Grand Total</span>
      <span style={{color:'#FFD966',fontSize:22,fontWeight:700}}>{grandTotal} Ctn</span>
    </div>

    <div style={S.f}><label style={S.lbl}>Notes</label><input style={S.fi} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Any instructions..."/></div>
    <button style={S.sb} onClick={save} disabled={saving}>{saving?'Saving...':'Save Dispatch + Generate Challan'}</button>
    {toast&&<Toast {...toast}/>}
  </div>
}

// ─── Spares Tab ───────────────────────────────────────────────
function SparesTab({user}:{user:User}) {
  const [spares,setSpares]=useState<any[]>([])
  const [movements,setMovements]=useState<any[]>([])
  const [loading,setLoading]=useState(true)
  const [saving,setSaving]=useState(false)
  const [toast,setToast]=useState<{msg:string,ok:boolean}|null>(null)
  const [vendor,setVendor]=useState(()=>localStorage.getItem('lastVendor')||'')
  const [slipNo,setSlipNo]=useState('')
  const [date,setDate]=useState(nd())
  const [action,setAction]=useState('Stock In')
  const [showOpeningStock,setShowOpeningStock]=useState(false)
  const [spareItems,setSpareItems]=useState([{partName:'',category:'',unit:'Pcs',qty:'',minQty:'',pricePerPc:'',total:0,plant:'',room:'',almirah:'',boxNo:'',storageType:'Box',lastVendor:'',lastPrice:0,currentStock:0,historyInfo:''}])

  const load=useCallback(()=>{fetch('/api/spares').then(r=>r.json()).then(d=>{setSpares(d.spares||[]);setMovements(d.recentMovements||[]);setLoading(false)})},[])
  useEffect(()=>{load()},[load])

  const addItem=()=>setSpareItems(p=>[...p,{partName:'',category:'',unit:'Pcs',qty:'',minQty:'',pricePerPc:'',total:0,plant:'',room:'',almirah:'',boxNo:'',storageType:'Box',lastVendor:'',lastPrice:0,currentStock:0,historyInfo:''}])
  const removeItem=(i:number)=>setSpareItems(p=>p.filter((_,idx)=>idx!==i))
  const updateItem=(i:number,field:string,val:string)=>{
    setSpareItems(p=>{
      const n=[...p]
      n[i]={...n[i],[field]:val}
      if(field==='qty'||field==='pricePerPc'){
        n[i].total=parseFloat(n[i].qty||'0')*(parseFloat(n[i].pricePerPc||'0'))
      }
      // Auto-fill from master with history
      if(field==='partName'){
        const found=spares.find((s:any)=>s.part_name.toLowerCase()===val.toLowerCase())
        if(found){
          n[i].category=found.category||''
          n[i].unit=found.unit||'Pcs'
          n[i].minQty=String(found.min_qty||0)
          n[i].pricePerPc=String(found.last_price||0)
          n[i].lastVendor=found.last_vendor||''
          n[i].lastPrice=found.last_price||0
          n[i].currentStock=found.current_stock||0
          n[i].historyInfo=`Last: ${found.last_vendor||'--'} @ ₹${found.last_price||0} | Stock: ${found.current_stock||0} ${found.unit||'Pcs'} | Min: ${found.min_qty||0}`
        }
      }
      return n
    })
  }

  const save=async()=>{
    if(!vendor){setToast({msg:'Vendor naam daalo!',ok:false});return}
    const validItems=spareItems.filter(i=>i.partName&&parseFloat(i.qty||'0')>0)
    if(validItems.length===0){setToast({msg:'Koi item nahi bhara!',ok:false});return}
    setSaving(true)
    // Save vendor name for next time
    if(vendor) localStorage.setItem('lastVendor', vendor)
    const res=await fetch('/api/spares',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({vendor,slipNo,date,action,doneBy:user.name,items:validItems})}).then(r=>r.json())
    setSaving(false);setToast({msg:res.msg,ok:res.success})
    if(res.success){load();setSpareItems([{partName:'',category:'',unit:'Pcs',qty:'',minQty:'',pricePerPc:'',total:0,plant:'',room:'',almirah:'',boxNo:'',storageType:'Box',lastVendor:'',lastPrice:0,currentStock:0,historyInfo:''}]);setVendor('');setSlipNo('')}
  }

  const outOfStock=spares.filter(s=>s.status==='Out of Stock').length
  const low=spares.filter(s=>s.status==='Low').length

  if(loading) return <div style={{textAlign:'center',padding:32,color:'#666'}}>Loading...</div>

  // Get unique vendors
  const vendors=spares.map(s=>s.last_vendor).filter((v:any,i:number,a:any[])=>v&&a.indexOf(v)===i)

  return <div>
    {/* Stock status */}
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:8}}>
      <div style={S.met}><div style={{fontSize:10,color:'#666'}}>Total Spares</div><div style={{fontSize:20,fontWeight:700}}>{spares.length}</div></div>
      <div style={S.met}><div style={{fontSize:10,color:'#666'}}>Out of Stock</div><div style={{fontSize:20,fontWeight:700,color:'#C00000'}}>{outOfStock}</div></div>
      <div style={S.met}><div style={{fontSize:10,color:'#666'}}>Low Stock</div><div style={{fontSize:20,fontWeight:700,color:'#854F0B'}}>{low}</div></div>
    </div>

    {/* Reorder Alert */}
    {(outOfStock+low)>0&&<div style={{...S.card,border:'2px solid #C00000',background:'#FFEBEE',marginBottom:8}}>
      <div style={{fontWeight:700,color:'#C00000',marginBottom:8}}>🚨 Reorder Alert — {outOfStock+low} items!</div>
      {spares.filter((s:any)=>s.status==='Out of Stock'||s.status==='Low').map((s:any,i:number)=>{
        const col=s.status==='Out of Stock'?'#C00000':'#854F0B'
        const bg=s.status==='Out of Stock'?'#FFEBEE':'#FFF3E0'
        return <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 8px',borderRadius:6,marginBottom:4,background:bg,border:`1px solid ${col}`}}>
          <div>
            <div style={{fontSize:11,fontWeight:600,color:col}}>{s.part_name}</div>
            <div style={{fontSize:10,color:'#666',marginTop:2}}>
              📦 Stock: <strong>{s.current_stock} {s.unit}</strong> | Min: {s.min_qty}
            </div>
            <div style={{fontSize:10,color:'#854F0B',marginTop:2}}>
              🏪 Purana Vendor: <strong>{s.last_vendor||'--'}</strong> | 💰 Purana Price: <strong>₹{s.last_price||0}/{s.unit||'Pcs'}</strong>
            </div>
          </div>
          <div style={{display:'flex',gap:6,alignItems:'center'}}>
            <span style={{background:col,color:'#fff',padding:'2px 8px',borderRadius:999,fontSize:10,fontWeight:600}}>{s.status}</span>
            <button onClick={()=>{
              setVendor(s.last_vendor||'')
              setAction('Stock In')
              setSpareItems([{partName:s.part_name,category:s.category||'',unit:s.unit||'Pcs',qty:'',minQty:String(s.min_qty||0),pricePerPc:String(s.last_price||0),total:0,plant:'',room:'',almirah:'',boxNo:'',storageType:'Box',lastVendor:s.last_vendor||'',lastPrice:s.last_price||0,currentStock:s.current_stock||0,historyInfo:''}])
              setTimeout(()=>document.getElementById('spares-entry-form')?.scrollIntoView({behavior:'smooth'}),100)
            }} style={{background:'#1F3864',color:'#fff',border:'none',borderRadius:4,padding:'3px 8px',fontSize:10,cursor:'pointer',whiteSpace:'nowrap' as const}}>Order Karo</button>
          </div>
        </div>
      })}
    </div>}

    {/* Stock table */}
    <div style={S.card}>
      <div style={{fontWeight:700,marginBottom:8}}>Spares Stock Status</div>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
          <thead><tr>{['Part Name','Category','Stock','Min','Last Vendor','Last Price','Status'].map(h=><th key={h} style={{background:'#1F3864',color:'#fff',padding:'6px 8px',textAlign:'left'}}>{h}</th>)}</tr></thead>
          <tbody>{spares.length===0?<tr><td colSpan={7} style={{textAlign:'center',color:'#666',padding:16}}>Koi spare nahi — neeche add karo!</td></tr>:spares.map((s:any,i:number)=>{
            const col=s.status==='Out of Stock'?'#C00000':s.status==='Low'?'#854F0B':'#276221'
            const bg=s.status==='Out of Stock'?'#FFEBEE':s.status==='Low'?'#FFF3E0':'#E8F5E9'
            return <tr key={i} style={{background:i%2===0?'#FAFAFA':'#fff'}}>
              <td style={{padding:'6px 8px',fontWeight:600,fontSize:11}}>{s.part_name}</td>
              <td style={{padding:'6px 8px',fontSize:10,color:'#666'}}>{s.category||'--'}</td>
              <td style={{padding:'6px 8px',fontSize:10}}>{s.plant||'--'}</td>
              <td style={{padding:'6px 8px',fontSize:10}}>{s.room||'--'}</td>
              <td style={{padding:'6px 8px',fontSize:10}}>{s.almirah||'--'}</td>
              <td style={{padding:'6px 8px',fontSize:10}}>{s.box_no||'--'}</td>
              <td style={{padding:'6px 8px',fontWeight:700,color:col}}>{s.current_stock} {s.unit}</td>
              <td style={{padding:'6px 8px',textAlign:'center',color:'#666'}}>{s.min_qty}</td>
              <td style={{padding:'6px 8px'}}><span style={{background:bg,color:col,padding:'2px 7px',borderRadius:999,fontSize:10,fontWeight:600}}>{s.status}</span></td>
            </tr>
          })}</tbody>
        </table>
      </div>
    </div>

    {/* Purchase / Movement form */}
    {/* Opening Stock Entry button */}
    <div style={{...S.card,background:'#FFF9E6',border:'1px solid #F4B942'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <div style={{fontWeight:700,color:'#854F0B'}}>📦 Factory mein jo spares pade hain?</div>
          <div style={{fontSize:11,color:'#666',marginTop:2}}>Opening stock entry karo — current inventory add ho jaayegi</div>
        </div>
        <button onClick={()=>setShowOpeningStock(!showOpeningStock)} style={{background:'#854F0B',color:'#fff',border:'none',borderRadius:6,padding:'6px 14px',fontSize:11,fontWeight:600,cursor:'pointer'}}>
          {showOpeningStock?'✕ Close':'+ Opening Stock'}
        </button>
      </div>
      {showOpeningStock&&<div style={{marginTop:12,padding:12,background:'#fff',borderRadius:8,border:'1px solid #E0E0E0'}}>
        <div style={{fontSize:12,color:'#854F0B',fontWeight:600,marginBottom:8}}>⚠️ Opening Stock = Abhi factory mein jo hai uski entry</div>
        <div style={{fontSize:11,color:'#666',marginBottom:10}}>Vendor = "Opening Stock" | Action = "Stock In" | Price = 0 (ya actual cost)</div>
        <button onClick={()=>{
          setVendor('Opening Stock')
          setAction('Stock In')
          setSlipNo('OPENING-'+nd())
          setShowOpeningStock(false)
          // Scroll to form
          setTimeout(()=>document.getElementById('spares-entry-form')?.scrollIntoView({behavior:'smooth'}),100)
        }} style={{...S.sb,marginTop:0,background:'#854F0B'}}>Opening Stock Entry Shuru Karo</button>
      </div>}
    </div>

    <div id="spares-entry-form" style={{...S.card,border:'1px solid #1F3864'}}>
      <div style={{fontWeight:700,color:'#1F3864',marginBottom:10}}>Stock Entry (Purchase / Use)</div>
      <div style={S.fr}>
        <div style={S.f}><label style={S.lbl}>Vendor Name</label>
          <input style={S.fi} value={vendor} onChange={e=>setVendor(e.target.value)} placeholder="Vendor naam..." list="vendor-list"/>
          <datalist id="vendor-list">{vendors.map((v:any)=><option key={v} value={v}/>)}</datalist>
          {vendor&&<div style={{fontSize:10,color:'#276221',marginTop:2}}>✅ Saved — next time auto-fill hoga!</div>}
        </div>
        <div style={S.f}><label style={S.lbl}>Slip No. (Optional)</label><input style={S.fi} value={slipNo} onChange={e=>setSlipNo(e.target.value)} placeholder="INV-001"/></div>
      </div>
      <div style={S.fr}>
        <div style={S.f}><label style={S.lbl}>Date</label><input type="date" style={S.fi} value={date} onChange={e=>setDate(e.target.value)}/></div>
        <div style={S.f}><label style={S.lbl}>Action</label>
          <select style={S.fi} value={action} onChange={e=>setAction(e.target.value)}>
            <option>Stock In</option><option>Stock Out</option><option>Used in Machine</option>
          </select>
        </div>
      </div>

      {/* Items */}
      <div style={{fontWeight:600,fontSize:12,marginBottom:8,color:'#1F3864'}}>Items</div>
      {spareItems.map((item,i)=>(
        <div key={i} style={{background:'#F8F9FF',border:'1px solid #E0E8FF',borderRadius:8,padding:10,marginBottom:8}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
            <span style={{fontSize:11,fontWeight:700,color:'#1F3864'}}>Item {i+1}</span>
            {i>0&&<button onClick={()=>removeItem(i)} style={{background:'#FFEBEE',color:'#C00000',border:'none',borderRadius:4,padding:'2px 8px',fontSize:11,cursor:'pointer'}}>Remove</button>}
          </div>
          <div style={S.f}><label style={S.lbl}>Part Name</label>
            <input 
              style={{...S.fi, border: spares.find((s:any)=>s.part_name.toLowerCase()===item.partName.toLowerCase())?'1px solid #276221':'1px solid #E0E0E0'}}
              value={item.partName} 
              onChange={e=>updateItem(i,'partName',e.target.value)} 
              placeholder="Spare ka naam type karo..."
              list={`part-list-${i}`}
            />
            <datalist id={`part-list-${i}`}>
              {spares.map((s:any)=><option key={s.part_name} value={s.part_name}>{s.part_name} (Stock: {s.current_stock} {s.unit})</option>)}
            </datalist>
            {item.partName&&spares.find((s:any)=>s.part_name.toLowerCase()===item.partName.toLowerCase())&&
              <div style={{fontSize:10,color:'#276221',marginTop:2}}>✅ Already in master — stock update hoga!</div>}
            {item.partName&&!spares.find((s:any)=>s.part_name.toLowerCase()===item.partName.toLowerCase())&&item.partName.length>2&&
              <div style={{fontSize:10,color:'#854F0B',marginTop:2}}>🆕 Naya spare — master mein add ho jaayega!</div>}
            {item.historyInfo&&<div style={{fontSize:10,background:'#E6F1FB',border:'1px solid #1F3864',borderRadius:6,padding:'4px 8px',marginTop:4,color:'#0C447C'}}>
              📋 {item.historyInfo}
              {item.lastVendor&&<button onClick={()=>setVendor(item.lastVendor)} style={{marginLeft:8,background:'#1F3864',color:'#fff',border:'none',borderRadius:4,padding:'1px 6px',fontSize:10,cursor:'pointer'}}>Use Vendor</button>}
            </div>}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:5}}>
            <div style={S.f}><label style={S.lbl}>Category</label>
                <select style={S.fi} value={item.category} onChange={e=>updateItem(i,'category',e.target.value)}>
                  <option value="">-- Select --</option>
                  <optgroup label="🔩 Mould Related">
                    <option>Mould — Lock & Fasteners</option>
                    <option>Mould — Cooling System</option>
                    <option>Mould — Plate & Body</option>
                    <option>Mould — Core & Cavity</option>
                    <option>Mould — Ejector System</option>
                    <option>Mould — Hot Runner</option>
                    <option>Mould — Slider & Lifter</option>
                    <option>Mould — Gas Vent & Seal</option>
                    <option>Mould — Maintenance</option>
                  </optgroup>
                  <optgroup label="⚙️ Machine Related">
                    <option>Machine — Heating & Barrel</option>
                    <option>Machine — Hydraulic</option>
                    <option>Machine — Electrical</option>
                    <option>Machine — Clamping</option>
                    <option>Machine — Injection Unit</option>
                    <option>Machine — Cooling & Chiller</option>
                    <option>Machine — Pneumatic</option>
                    <option>Machine — Lubrication</option>
                    <option>Machine — Safety & Sensors</option>
                    <option>Machine — Drive & Motion</option>
                  </optgroup>
                  <optgroup label="🧰 General">
                    <option>General — Tools</option>
                    <option>General — Consumables</option>
                  </optgroup>
                </select>
              </div>
            <div style={S.f}><label style={S.lbl}>Unit</label>
              <select style={S.fi} value={item.unit} onChange={e=>updateItem(i,'unit',e.target.value)}>
                <option>Pcs</option><option>Set</option><option>Kg</option><option>Ltr</option><option>Mtr</option><option>Box</option>
              </select>
            </div>
            <div style={S.f}><label style={S.lbl}>Qty</label><input type="number" min="0" style={S.fi} value={item.qty} onChange={e=>updateItem(i,'qty',e.target.value)} placeholder="0"/></div>
            <div style={S.f}><label style={S.lbl}>Price/Pc (₹)</label><input type="number" min="0" style={S.fi} value={item.pricePerPc} onChange={e=>updateItem(i,'pricePerPc',e.target.value)} placeholder="0"/></div>
          </div>
          {/* Location Details */}
          <div style={{background:'#F0F4FF',border:'1px solid #1F3864',borderRadius:8,padding:'8px 10px',marginTop:6}}>
            <div style={{fontSize:11,fontWeight:700,color:'#1F3864',marginBottom:6}}>📍 Storage Location</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:5}}>
              <div style={S.f}><label style={S.lbl}>Plant</label>
                <select style={S.fi} value={item.plant||''} onChange={e=>updateItem(i,'plant',e.target.value)}>
                  <option value="">Select</option><option>Plant 477</option><option>Plant 488</option><option>Plant 433</option><option>Main Store</option>
                </select>
              </div>
              <div style={S.f}><label style={S.lbl}>Room</label>
                <select style={S.fi} value={item.room||''} onChange={e=>updateItem(i,'room',e.target.value)}>
                  <option value="">Select</option>
                  <option>Tool Room</option><option>Maintenance Room</option><option>Store Room</option><option>Production Floor</option>
                </select>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:5}}>
              <div style={S.f}><label style={S.lbl}>Almirah/Rack</label><input style={S.fi} value={item.almirah||''} onChange={e=>updateItem(i,'almirah',e.target.value)} placeholder="e.g. A1, Rack-2"/></div>
              <div style={S.f}><label style={S.lbl}>Box No.</label><input style={S.fi} value={item.boxNo||''} onChange={e=>updateItem(i,'boxNo',e.target.value)} placeholder="e.g. Box-5"/></div>
              <div style={S.f}><label style={S.lbl}>Storage Type</label>
                <select style={S.fi} value={item.storageType||'Box'} onChange={e=>updateItem(i,'storageType',e.target.value)}>
                  <option>Box</option><option>Loose</option><option>Drawer</option><option>Shelf</option><option>Hook</option>
                </select>
              </div>
            </div>
          </div>
          {item.total>0&&<div style={{fontSize:11,color:'#276221',fontWeight:700,marginTop:4}}>Total: ₹{item.total.toLocaleString('en-IN',{maximumFractionDigits:2})}</div>}
        </div>
      ))}
      <button onClick={addItem} style={{width:'100%',padding:8,border:'1.5px dashed #1F3864',borderRadius:8,background:'transparent',color:'#1F3864',fontSize:12,fontWeight:600,cursor:'pointer',marginBottom:10}}>+ Item Add Karo</button>
      <button style={S.sb} onClick={save} disabled={saving}>{saving?'Saving...':'Save Stock Entry'}</button>
      {toast&&<Toast {...toast}/>}
    </div>

    {/* Recent movements */}
    {movements.length>0&&<div style={S.card}>
      <div style={{fontWeight:700,marginBottom:8}}>Recent Movements</div>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
          <thead><tr>{['Date','Part','Action','Qty','Price','Vendor','By'].map(h=><th key={h} style={{background:'#1F3864',color:'#fff',padding:'6px 8px',textAlign:'left'}}>{h}</th>)}</tr></thead>
          <tbody>{movements.map((m:any,i:number)=>(
            <tr key={i} style={{background:i%2===0?'#FAFAFA':'#fff'}}>
              <td style={{padding:'6px 8px',fontSize:10}}>{m.date}</td>
              <td style={{padding:'6px 8px',fontWeight:600,fontSize:11}}>{m.part_name}</td>
              <td style={{padding:'6px 8px'}}><span style={{background:m.action==='Stock In'?'#E8F5E9':'#FFEBEE',color:m.action==='Stock In'?'#276221':'#C00000',padding:'2px 7px',borderRadius:999,fontSize:10}}>{m.action}</span></td>
              <td style={{padding:'6px 8px',fontWeight:700}}>{m.qty} {m.unit}</td>
              <td style={{padding:'6px 8px',fontSize:10}}>{m.price_per_pc?`₹${m.price_per_pc}`:'--'}</td>
              <td style={{padding:'6px 8px',fontSize:10}}>{m.vendor||'--'}</td>
              <td style={{padding:'6px 8px',fontSize:10}}>{m.done_by}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>}
  </div>
}

// ─── Quality Tab ──────────────────────────────────────────────
function QualityTab({user}:{user:User}) {
  const [items,setItems]=useState<any[]>([])
  const [loading,setLoading]=useState(true)
  const [saving,setSaving]=useState(false)
  const [toast,setToast]=useState<{msg:string,ok:boolean}|null>(null)
  const [date,setDate]=useState(nd())
  const [shift,setShift]=useState('Day')
  const [plant,setPlant]=useState('')
  const [qcPerson,setQcPerson]=useState(user.name)
  const [machineData,setMachineData]=useState<Record<string,any>>({})

  useEffect(()=>{fetch('/api/ims').then(r=>r.json()).then(d=>{setItems(d.items||[]);setLoading(false)})},[])

  const machines=MACH[plant]||[]

  const setCheck=(machine:string,type:string,idx:number,val:string)=>{
    setMachineData(prev=>({
      ...prev,
      [machine]:{
        ...prev[machine],
        [`${type}_${idx}`]:val
      }
    }))
  }

  const getCheck=(machine:string,type:string,idx:number)=>machineData[machine]?.[`${type}_${idx}`]||''
  const setProduct=(machine:string,val:string)=>setMachineData(prev=>({...prev,[machine]:{...prev[machine],product:val}}))

  const copyM1ToAll=()=>{
    const m1=machines[0]
    if(!m1) return
    const m1Data=machineData[m1]||{}
    const newData:{[key:string]:any}={...machineData}
    machines.forEach((m,i)=>{
      if(i===0) return
      newData[m]={...m1Data,product:machineData[m]?.product||m1Data.product}
    })
    setMachineData(newData)
    setToast({msg:'M1 ke results sabko copy ho gaye!',ok:true})
  }

  const save=async()=>{
    if(!plant){setToast({msg:'Plant select karo!',ok:false});return}
    const entries=machines.map(machine=>{
      const d=machineData[machine]||{}
      if(!d.product) return null
      return {
        date,shift,machine:`${plant} - ${machine}`,part_name:d.product,qc_person:qcPerson,
        no_short_shots:getCheck(machine,'vis',0)||'N/A',
        no_flash:getCheck(machine,'vis',1)||'N/A',
        no_burn_marks:getCheck(machine,'vis',2)||'N/A',
        no_flow_marks:getCheck(machine,'vis',3)||'N/A',
        no_sink_marks:getCheck(machine,'vis',4)||'N/A',
        uniform_color:getCheck(machine,'vis',5)||'N/A',
        no_contamination:getCheck(machine,'vis',6)||'N/A',
        wall_thickness:getCheck(machine,'dim',0)||'N/A',
        height:getCheck(machine,'dim',1)||'N/A',
        diameter:getCheck(machine,'dim',2)||'N/A',
        lid_fit:getCheck(machine,'dim',3)||'N/A',
        stack_ability:getCheck(machine,'dim',4)||'N/A',
        drop_test:getCheck(machine,'dim',5)||'N/A',
        weight_check:getCheck(machine,'dim',6)||'N/A',
        overall_result: Object.values(d).some((v:any)=>v==='NG')?'NG':'OK',
        remarks:d.remarks||''
      }
    }).filter(Boolean)

    if(entries.length===0){setToast({msg:'Koi machine ka product select nahi!',ok:false});return}
    setSaving(true)
    const res=await fetch('/api/quality',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({entries})}).then(r=>r.json())
    setSaving(false);setToast({msg:res.msg,ok:res.success})
  }

  const VIS=['No short shots','No flash','No burn marks','No flow marks','No sink marks','Uniform color','No contamination']
  const DIM=['Wall Thickness','Height','Diameter','Lid Fit','Stack Ability','Drop Test','Weight Check']

  if(loading) return <div style={{textAlign:'center',padding:32,color:'#666'}}>Loading...</div>

  return <div>
    <div style={S.card}>
      <div style={{fontWeight:700,marginBottom:10}}>Quality Check — Bulk Entry</div>
      <div style={S.fr}>
        <div style={S.f}><label style={S.lbl}>Date</label><input type="date" style={S.fi} value={date} onChange={e=>setDate(e.target.value)}/></div>
        <div style={S.f}><label style={S.lbl}>Shift</label><select style={S.fi} value={shift} onChange={e=>setShift(e.target.value)}><option>Day</option><option>Night</option></select></div>
      </div>
      <div style={S.fr}>
        <div style={S.f}><label style={S.lbl}>Plant</label>
          <select style={S.fi} value={plant} onChange={e=>setPlant(e.target.value)}>
            <option value="">Select Plant</option><option>Plant 477</option><option>Plant 488</option><option>Plant 433</option>
          </select>
        </div>
        <div style={S.f}><label style={S.lbl}>QC Person</label><input style={S.fi} value={qcPerson} onChange={e=>setQcPerson(e.target.value)}/></div>
      </div>
      {plant&&<button onClick={copyM1ToAll} style={{marginBottom:10,background:'#1F3864',color:'#fff',border:'none',borderRadius:6,padding:'6px 14px',fontSize:11,cursor:'pointer'}}>M1 ke results sabko copy karo</button>}
    </div>

    {machines.map((machine,mi)=>{
      const d=machineData[machine]||{}
      const hasNG=Object.values(d).some((v:any)=>v==='NG')
      const hasProduct=!!d.product
      return <div key={machine} style={{...S.card,marginBottom:8}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
          <span style={{fontWeight:700,color:'#1F3864',fontSize:13}}>{machine}</span>
          {hasProduct&&<span style={{background:hasNG?'#FFEBEE':'#E8F5E9',color:hasNG?'#C00000':'#276221',padding:'2px 10px',borderRadius:999,fontSize:11,fontWeight:600}}>{hasNG?'NG Found!':'OK'}</span>}
        </div>
        <div style={S.f}><label style={S.lbl}>Product</label>
          <select style={S.fi} value={d.product||''} onChange={e=>setProduct(machine,e.target.value)}>
            <option value="">-- Select Product --</option>
            {items.map(i=><option key={i.name}>{i.name}</option>)}
          </select>
        </div>
        {hasProduct&&<>
          <div style={{fontSize:11,fontWeight:600,color:'#1F3864',marginBottom:6}}>Visual Inspection</div>
          {VIS.map((check,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'4px 0',borderBottom:'1px solid #F5F5F5'}}>
              <span style={{fontSize:11,flex:1}}>{check}</span>
              <div style={{display:'flex',gap:4}}>
                {['OK','NG','N/A'].map(v=>{
                  const val=getCheck(machine,'vis',i)
                  return <button key={v} onClick={()=>setCheck(machine,'vis',i,v)} style={{padding:'3px 8px',fontSize:10,fontWeight:600,border:`1px solid ${val===v?(v==='OK'?'#276221':v==='NG'?'#C00000':'#666'):'#E0E0E0'}`,borderRadius:999,background:val===v?(v==='OK'?'#E2EFDA':v==='NG'?'#FFEBEE':'#F0F0F0'):'transparent',color:val===v?(v==='OK'?'#276221':v==='NG'?'#C00000':'#666'):'#666',cursor:'pointer'}}>{v}</button>
                })}
              </div>
            </div>
          ))}
          <div style={{fontSize:11,fontWeight:600,color:'#1F3864',margin:'8px 0 6px'}}>Dimensional & Functional</div>
          {DIM.map((check,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'4px 0',borderBottom:'1px solid #F5F5F5'}}>
              <span style={{fontSize:11,flex:1}}>{check}</span>
              <div style={{display:'flex',gap:4}}>
                {['OK','NG'].map(v=>{
                  const val=getCheck(machine,'dim',i)
                  return <button key={v} onClick={()=>setCheck(machine,'dim',i,v)} style={{padding:'3px 8px',fontSize:10,fontWeight:600,border:`1px solid ${val===v?(v==='OK'?'#276221':'#C00000'):'#E0E0E0'}`,borderRadius:999,background:val===v?(v==='OK'?'#E2EFDA':'#FFEBEE'):'transparent',color:val===v?(v==='OK'?'#276221':'#C00000'):'#666',cursor:'pointer'}}>{v}</button>
                })}
              </div>
            </div>
          ))}
          <div style={{marginTop:8}}><label style={S.lbl}>Remarks</label><input style={S.fi} value={d.remarks||''} onChange={e=>setMachineData(prev=>({...prev,[machine]:{...prev[machine],remarks:e.target.value}}))} placeholder="Any observations..."/></div>
        </>}
      </div>
    })}

    {plant&&machines.length>0&&<>
      <button style={S.sb} onClick={save} disabled={saving}>{saving?'Saving...':'Save All Machines Quality Check'}</button>
      {toast&&<Toast {...toast}/>}
    </>}
    {!plant&&<div style={{...S.card,textAlign:'center',color:'#666'}}>Pehle Plant select karo! 👆</div>}
  </div>
}

// ─── Batch Tab ────────────────────────────────────────────────
function BatchTab({user}:{user:User}) {
  const [items,setItems]=useState<any[]>([])
  const [loading,setLoading]=useState(true)
  const [saving,setSaving]=useState(false)
  const [toast,setToast]=useState<{msg:string,ok:boolean}|null>(null)
  const [form,setForm]=useState({date:nd(),plant:'Plant 477',item:'',qtyCartons:'',machine:'',mouldNo:'',operator:OPS[0],shift:'Day',qcStatus:'Passed',notes:''})

  useEffect(()=>{fetch('/api/ims').then(r=>r.json()).then(d=>{setItems(d.items||[]);setLoading(false)})},[])

  const save=async()=>{
    if(!form.item||!form.qtyCartons){setToast({msg:'Item aur Qty daalo!',ok:false});return}
    setSaving(true)
    const found=items.find(i=>i.name===form.item)
    const pkg=found?.pkg||500
    const units=Math.round(parseFloat(form.qtyCartons)*pkg)
    const res=await fetch('/api/production',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
      date:form.date,shift:form.shift==='Day'?'Day (8am-8pm)':'Night (8pm-8am)',
      plant:form.plant,machine:form.machine,operator:form.operator,
      product:form.item,mould:form.mouldNo,cavities:'',cycleTime:'',material:'',
      machineStatus:'running',stopReason:'',remarks:`Batch Entry | QC: ${form.qcStatus} | ${form.notes}`,
      slots:[{slot:'Batch',good:units,rejection:'0',down:'0',remarks:form.notes}],
      enteredBy:user.name
    })}).then(r=>r.json())
    setSaving(false);setToast({msg:res.success?`Batch saved! ${form.qtyCartons} Ctn = ${units} pcs`:res.msg,ok:res.success})
    if(res.success) setForm(p=>({...p,item:'',qtyCartons:'',machine:'',mouldNo:'',notes:''}))
  }

  const machines=MACH[form.plant]||[]
  if(loading) return <div style={{textAlign:'center',padding:32,color:'#666'}}>Loading...</div>

  return <div style={S.card}>
    <div style={{fontWeight:700,marginBottom:10}}>Batch Registration</div>
    <div style={S.fr}>
      <div style={S.f}><label style={S.lbl}>Date</label><input type="date" style={S.fi} value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))}/></div>
      <div style={S.f}><label style={S.lbl}>Plant</label>
        <select style={S.fi} value={form.plant} onChange={e=>setForm(p=>({...p,plant:e.target.value,machine:''}))}>
          <option>Plant 477</option><option>Plant 488</option><option>Plant 433</option>
        </select>
      </div>
    </div>
    <div style={S.fr}>
      <div style={S.f}><label style={S.lbl}>Item</label>
        <select style={S.fi} value={form.item} onChange={e=>setForm(p=>({...p,item:e.target.value}))}>
          <option value="">-- Select --</option>{items.map(i=><option key={i.name}>{i.name}</option>)}
        </select>
      </div>
      <div style={S.f}><label style={S.lbl}>Qty (Cartons)</label><input type="number" style={S.fi} value={form.qtyCartons} onChange={e=>setForm(p=>({...p,qtyCartons:e.target.value}))} placeholder="e.g. 50"/></div>
    </div>
    <div style={S.fr}>
      <div style={S.f}><label style={S.lbl}>Machine</label>
        <select style={S.fi} value={form.machine} onChange={e=>setForm(p=>({...p,machine:e.target.value}))}>
          <option value="">Select</option>{machines.map(m=><option key={m}>{m}</option>)}
        </select>
      </div>
      <div style={S.f}><label style={S.lbl}>Mould No.</label><input style={S.fi} value={form.mouldNo} onChange={e=>setForm(p=>({...p,mouldNo:e.target.value}))} placeholder="Mould name"/></div>
    </div>
    <div style={S.fr}>
      <div style={S.f}><label style={S.lbl}>Operator</label>
        <select style={S.fi} value={form.operator} onChange={e=>setForm(p=>({...p,operator:e.target.value}))}>
          {OPS.map(o=><option key={o}>{o}</option>)}
        </select>
      </div>
      <div style={S.f}><label style={S.lbl}>Shift</label>
        <select style={S.fi} value={form.shift} onChange={e=>setForm(p=>({...p,shift:e.target.value}))}>
          <option>Day</option><option>Night</option>
        </select>
      </div>
    </div>
    <div style={S.fr}>
      <div style={S.f}><label style={S.lbl}>QC Status</label>
        <select style={S.fi} value={form.qcStatus} onChange={e=>setForm(p=>({...p,qcStatus:e.target.value}))}>
          <option>Passed</option><option>Failed</option><option>Pending</option>
        </select>
      </div>
      <div style={S.f}><label style={S.lbl}>Notes</label><input style={S.fi} value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} placeholder="Any notes..."/></div>
    </div>
    <button style={S.sb} onClick={save} disabled={saving}>{saving?'Saving...':'Register Batch'}</button>
    {toast&&<Toast {...toast}/>}
  </div>
}

// ─── Sales Tab ────────────────────────────────────────────────
function SalesTab({user}:{user:User}) {
  const [items,setItems]=useState<any[]>([])
  const [parties,setParties]=useState<any[]>([])
  const [loading,setLoading]=useState(true)
  const [saving,setSaving]=useState(false)
  const [toast,setToast]=useState<{msg:string,ok:boolean}|null>(null)
  const [form,setForm]=useState({customer:'',source:'WhatsApp',item:'',qtyCartons:'',ratePerUnit:'',deliveryDate:'',priority:'High',notes:''})

  useEffect(()=>{
    Promise.all([fetch('/api/ims').then(r=>r.json()),fetch('/api/party').then(r=>r.json())])
      .then(([ims,party])=>{setItems(ims.items||[]);setParties(party.parties||[]);setLoading(false)})
  },[])

  const save=async()=>{
    if(!form.customer||!form.item){setToast({msg:'Customer aur Item daalo!',ok:false});return}
    setSaving(true)
    // Save as dispatch order for now
    const res=await fetch('/api/dispatch',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
      date:nd(),customer:form.customer,vehicleType:'Order',vehicleNo:'',driverName:'',
      deliveryAddress:'',notes:`Source: ${form.source} | Rate: ₹${form.ratePerUnit} | Delivery: ${form.deliveryDate} | Priority: ${form.priority} | ${form.notes}`,
      dispatchBy:user.name,
      lines:[{lineNo:1,plant:'All',itemName:form.item,qty:parseFloat(form.qtyCartons)||0,category:''}]
    })}).then(r=>r.json())
    setSaving(false);setToast({msg:res.success?`Order saved! ID: ${res.orderId}`:res.msg,ok:res.success})
    if(res.success) setForm({customer:'',source:'WhatsApp',item:'',qtyCartons:'',ratePerUnit:'',deliveryDate:'',priority:'High',notes:''})
  }

  if(loading) return <div style={{textAlign:'center',padding:32,color:'#666'}}>Loading...</div>

  return <div style={S.card}>
    <div style={{fontWeight:700,marginBottom:10}}>New Sales Order</div>
    <div style={S.fr}>
      <div style={S.f}><label style={S.lbl}>Customer</label>
        <input style={S.fi} value={form.customer} onChange={e=>setForm(p=>({...p,customer:e.target.value}))} placeholder="Party naam..." list="sales-party-list"/>
        <datalist id="sales-party-list">{parties.map((p:any)=><option key={p.name} value={p.name}/>)}</datalist>
      </div>
      <div style={S.f}><label style={S.lbl}>Source</label>
        <select style={S.fi} value={form.source} onChange={e=>setForm(p=>({...p,source:e.target.value}))}>
          <option>WhatsApp</option><option>Phone</option><option>Email</option><option>In Person</option>
        </select>
      </div>
    </div>
    <div style={S.fr}>
      <div style={S.f}><label style={S.lbl}>Item</label>
        <select style={S.fi} value={form.item} onChange={e=>setForm(p=>({...p,item:e.target.value}))}>
          <option value="">-- Select --</option>{items.map(i=><option key={i.name}>{i.name}</option>)}
        </select>
      </div>
      <div style={S.f}><label style={S.lbl}>Qty (Cartons)</label><input type="number" style={S.fi} value={form.qtyCartons} onChange={e=>setForm(p=>({...p,qtyCartons:e.target.value}))} placeholder="e.g. 100"/></div>
    </div>
    <div style={S.fr}>
      <div style={S.f}><label style={S.lbl}>Rate per Unit (₹)</label><input type="number" style={S.fi} value={form.ratePerUnit} onChange={e=>setForm(p=>({...p,ratePerUnit:e.target.value}))} placeholder="e.g. 2.50"/></div>
      <div style={S.f}><label style={S.lbl}>Delivery Date</label><input type="date" style={S.fi} value={form.deliveryDate} onChange={e=>setForm(p=>({...p,deliveryDate:e.target.value}))}/></div>
    </div>
    <div style={S.fr}>
      <div style={S.f}><label style={S.lbl}>Priority</label>
        <select style={S.fi} value={form.priority} onChange={e=>setForm(p=>({...p,priority:e.target.value}))}>
          <option>High</option><option>Medium</option><option>Low</option>
        </select>
      </div>
      <div style={S.f}><label style={S.lbl}>Notes</label><input style={S.fi} value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} placeholder="Any notes..."/></div>
    </div>
    <button style={S.sb} onClick={save} disabled={saving}>{saving?'Saving...':'Save Sales Order'}</button>
    {toast&&<Toast {...toast}/>}
  </div>
}

// ─── Planning Tab ─────────────────────────────────────────────
function PlanningTab({user}:{user:User}) {
  const [items,setItems]=useState<any[]>([])
  const [loading,setLoading]=useState(true)
  const [saving,setSaving]=useState(false)
  const [toast,setToast]=useState<{msg:string,ok:boolean}|null>(null)
  const [form,setForm]=useState({plant:'',machine:'',product:'',plannedQty:'',plannedDate:nd(),shift:'Day',priority:'High',notes:''})
  const [selectedItem,setSelectedItem]=useState<any>(null)

  useEffect(()=>{fetch('/api/ims').then(r=>r.json()).then(d=>{setItems(d.items||[]);setLoading(false)})},[])

  const onProductChange=(val:string)=>{
    setForm(p=>({...p,product:val}))
    const found=items.find(i=>i.name===val)
    setSelectedItem(found||null)
  }

  const machines=MACH[form.plant]||[]

  const save=async()=>{
    if(!form.plant||!form.product||!form.plannedQty){setToast({msg:'Plant, Product aur Qty daalo!',ok:false});return}
    setSaving(true)
    // Store as a production entry with future date
    const res=await fetch('/api/production',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
      date:form.plannedDate,shift:form.shift==='Day'?'Day (8am-8pm)':'Night (8pm-8am)',
      plant:form.plant,machine:form.machine,operator:'TBD',product:form.product,
      mould:'',cavities:'',cycleTime:'',material:'',machineStatus:'running',stopReason:'',
      remarks:`PLAN | Qty: ${form.plannedQty} Ctn | Priority: ${form.priority} | ${form.notes}`,
      slots:[{slot:'Planned',good:'0',rejection:'0',down:'0',remarks:`Planned: ${form.plannedQty} Ctn`}],
      enteredBy:user.name
    })}).then(r=>r.json())
    setSaving(false);setToast({msg:res.success?'Production plan saved!':res.msg,ok:res.success})
    if(res.success) setForm(p=>({...p,product:'',plannedQty:'',notes:''}))
  }

  if(loading) return <div style={{textAlign:'center',padding:32,color:'#666'}}>Loading...</div>

  return <div>
    {/* Low stock alerts */}
    {items.filter(i=>i.pct<75&&i.pct!==null).length>0&&<div style={{...S.card,border:'2px solid #C00000'}}>
      <div style={{fontWeight:700,color:'#C00000',marginBottom:8}}>Stock Alert — Plan karo! ({items.filter(i=>i.pct<75).length} items low)</div>
      {items.filter(i=>i.pct<75&&i.pct!==null).sort((a,b)=>(a.pct||0)-(b.pct||0)).slice(0,8).map((item,i)=>{
        const col=item.pct<25?'#C00000':item.pct<50?'#7B1FA2':'#E65100'
        const bg=item.pct<25?'#FFEBEE':item.pct<50?'#F3E5F5':'#FFF3E0'
        const tag=item.pct<25?'CRITICAL':item.pct<50?'DANGER':'LOW'
        return <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'6px 8px',borderRadius:6,marginBottom:4,background:bg,border:`1px solid ${col}`}}>
          <span style={{fontSize:11,fontWeight:600,color:col}}>{item.name}</span>
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            <span style={{fontSize:11,color:col}}>{item.stockC||0} ctns</span>
            <span style={{background:col,color:'#fff',fontSize:10,padding:'2px 7px',borderRadius:999}}>{tag} {item.pct}%</span>
            <button onClick={()=>onProductChange(item.name)} style={{background:'#1F3864',color:'#fff',border:'none',borderRadius:4,padding:'2px 8px',fontSize:10,cursor:'pointer'}}>Plan</button>
          </div>
        </div>
      })}
    </div>}

    <div style={S.card}>
      <div style={{fontWeight:700,marginBottom:10}}>New Production Plan</div>
      <div style={S.fr}>
        <div style={S.f}><label style={S.lbl}>Plant</label>
          <select style={S.fi} value={form.plant} onChange={e=>setForm(p=>({...p,plant:e.target.value,machine:''}))}>
            <option value="">Select</option><option>Plant 477</option><option>Plant 488</option><option>Plant 433</option>
          </select>
        </div>
        <div style={S.f}><label style={S.lbl}>Machine</label>
          <select style={S.fi} value={form.machine} onChange={e=>setForm(p=>({...p,machine:e.target.value}))}>
            <option value="">Select</option>{machines.map(m=><option key={m}>{m}</option>)}
          </select>
        </div>
      </div>
      <div style={S.f}><label style={S.lbl}>Product</label>
        <select style={S.fi} value={form.product} onChange={e=>onProductChange(e.target.value)}>
          <option value="">-- Select Product --</option>
          {items.map(i=>{
            const tag=i.pct<25?' ⚠ CRITICAL':i.pct<50?' ⚠ DANGER':i.pct<75?' ⚠ LOW':''
            return <option key={i.name} value={i.name}>{i.name}{tag}</option>
          })}
        </select>
      </div>
      {selectedItem&&<div style={{background:selectedItem.pct<75?'#FFEBEE':'#E8F5E9',border:`1px solid ${selectedItem.pct<75?'#C00000':'#276221'}`,borderRadius:8,padding:'8px 12px',marginBottom:8,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span style={{fontSize:12,fontWeight:600,color:selectedItem.pct<75?'#C00000':'#276221'}}>Current Stock: {selectedItem.stockC||0} cartons ({selectedItem.pct}% of min)</span>
        <span style={{background:selectedItem.pct<75?'#C00000':'#276221',color:'#fff',fontSize:10,padding:'2px 10px',borderRadius:999}}>{selectedItem.status}</span>
      </div>}
      <div style={S.fr}>
        <div style={S.f}><label style={S.lbl}>Planned Qty (Cartons)</label><input type="number" style={S.fi} value={form.plannedQty} onChange={e=>setForm(p=>({...p,plannedQty:e.target.value}))} placeholder="e.g. 50"/></div>
        <div style={S.f}><label style={S.lbl}>Date</label><input type="date" style={S.fi} value={form.plannedDate} onChange={e=>setForm(p=>({...p,plannedDate:e.target.value}))}/></div>
      </div>
      <div style={S.fr}>
        <div style={S.f}><label style={S.lbl}>Shift</label>
          <select style={S.fi} value={form.shift} onChange={e=>setForm(p=>({...p,shift:e.target.value}))}>
            <option>Day</option><option>Night</option><option>Both</option>
          </select>
        </div>
        <div style={S.f}><label style={S.lbl}>Priority</label>
          <select style={S.fi} value={form.priority} onChange={e=>setForm(p=>({...p,priority:e.target.value}))}>
            <option>High</option><option>Medium</option><option>Low</option>
          </select>
        </div>
      </div>
      <div style={S.f}><label style={S.lbl}>Notes</label><input style={S.fi} value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} placeholder="Special instructions..."/></div>
      <button style={S.sb} onClick={save} disabled={saving}>{saving?'Saving...':'Save Production Plan'}</button>
      {toast&&<Toast {...toast}/>}
    </div>
  </div>
}

// ─── Users Tab ────────────────────────────────────────────────
function UsersTab({user}:{user:User}) {
  const [users,setUsers]=useState<any[]>([])
  const [loading,setLoading]=useState(true)
  const [saving,setSaving]=useState(false)
  const [toast,setToast]=useState<{msg:string,ok:boolean}|null>(null)
  const [showForm,setShowForm]=useState(false)
  const [form,setForm]=useState({username:'',password:'',fullName:'',role:'Operator',plant:'Plant 477',modules:'production,breakdown,mouldchange',status:'Active'})

  const load=useCallback(()=>{
    // Load users from Supabase via a simple fetch
    fetch('/api/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'list'})})
      .then(r=>r.json()).then(d=>{if(d.users)setUsers(d.users);setLoading(false)})
      .catch(()=>setLoading(false))
  },[])

  useEffect(()=>{
    // Show static user info for now
    setUsers([
      {username:'nitin',full_name:'Nitin Nagpal',role:'Admin',plant:'All',status:'Active'},
      {username:'ranjan',full_name:'Ranjan Kumar',role:'Plant Head',plant:'All',status:'Active'},
      {username:'prince',full_name:'Prince',role:'Maintenance',plant:'All',status:'Active'},
      {username:'rohit',full_name:'Rohit',role:'Maintenance',plant:'All',status:'Active'},
      {username:'karan',full_name:'Karan',role:'Supervisor',plant:'Plant 477',status:'Active'},
      {username:'ankush',full_name:'Ankush',role:'Supervisor',plant:'Plant 488',status:'Active'},
      {username:'deepak',full_name:'Deepak',role:'Senior Foreman',plant:'Plant 488',status:'Active'},
      {username:'parveen',full_name:'Parveen',role:'Senior Foreman',plant:'Plant 477',status:'Active'},
      {username:'dayanand',full_name:'Dayanand',role:'Operator',plant:'Plant 477',status:'Active'},
      {username:'alok',full_name:'Alok Kumar',role:'Operator',plant:'Plant 477',status:'Active'},
      {username:'uday',full_name:'Uday',role:'Operator',plant:'Plant 488',status:'Active'},
      {username:'sudarshan',full_name:'Sudarshan',role:'Operator',plant:'Plant 488',status:'Active'},
      {username:'rahul',full_name:'Rahul',role:'Operator',plant:'Plant 477',status:'Active'},
      {username:'pintoo',full_name:'Pintoo',role:'Operator',plant:'Plant 488',status:'Active'},
      {username:'satyanand',full_name:'Satyanand',role:'Operator',plant:'Plant 433',status:'Active'},
      {username:'rahulsingh',full_name:'Rahul Singh',role:'Maintenance Foreman',plant:'All',status:'Active'},
    ])
    setLoading(false)
  },[])

  const ROLE_MODULES:Record<string,string> = {
    'Admin':'mis,ims,production,planning,quality,rejection,mouldchange,dispatch,batch,sales,spares,mouldpm,breakdown,reports,users,performance',
    'Plant Head':'mis,ims,production,planning,quality,rejection,mouldchange,mouldpm,breakdown,reports',
    'Maintenance':'breakdown,mouldpm,mouldchange,spares,reports',
    'Maintenance Foreman':'breakdown,mouldpm,mouldchange,spares,reports',
    'Supervisor':'mis,production,quality,rejection,breakdown,reports',
    'Senior Foreman':'mis,production,quality,rejection,breakdown,reports',
    'Operator':'production,breakdown,mouldchange',
    'Dispatch':'dispatch,ims,reports',
    'QC':'quality,rejection,reports',
  }

  const save=async()=>{
    if(!form.username||!form.password||!form.fullName){setToast({msg:'Saari fields bharo!',ok:false});return}
    setSaving(true)
    // Generate SQL for user
    const modules=ROLE_MODULES[form.role]||'production,breakdown'
    const sql=`INSERT INTO users (username, password, full_name, role, plant, modules, status) VALUES ('${form.username}','${form.password}','${form.fullName}','${form.role}','${form.plant}','${modules}','${form.status}') ON CONFLICT (username) DO UPDATE SET password='${form.password}',full_name='${form.fullName}',role='${form.role}',plant='${form.plant}',modules='${modules}',status='${form.status}';`
    setSaving(false)
    setToast({msg:`SQL ready! Supabase SQL Editor mein run karo.`,ok:true})
    // Copy to clipboard
    navigator.clipboard?.writeText(sql).catch(()=>{})
    setShowForm(false)
    alert(`User ke liye yeh SQL Supabase mein run karo:\n\n${sql}`)
  }

  if(loading) return <div style={{textAlign:'center',padding:32,color:'#666'}}>Loading...</div>

  return <div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
      <div style={{fontWeight:700,fontSize:14}}>Users ({users.length})</div>
      {user.role==='Admin'&&<button onClick={()=>setShowForm(!showForm)} style={{background:'#1F3864',color:'#fff',border:'none',borderRadius:6,padding:'6px 14px',fontSize:11,cursor:'pointer'}}>+ Add User</button>}
    </div>

    {showForm&&<div style={{...S.card,border:'1px solid #1F3864',marginBottom:8}}>
      <div style={{fontWeight:700,color:'#1F3864',marginBottom:10}}>New User</div>
      <div style={S.fr}>
        <div style={S.f}><label style={S.lbl}>Username</label><input style={S.fi} value={form.username} onChange={e=>setForm(p=>({...p,username:e.target.value.toLowerCase()}))} placeholder="lowercase only"/></div>
        <div style={S.f}><label style={S.lbl}>Password</label><input style={S.fi} value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} placeholder="password"/></div>
      </div>
      <div style={S.f}><label style={S.lbl}>Full Name</label><input style={S.fi} value={form.fullName} onChange={e=>setForm(p=>({...p,fullName:e.target.value}))} placeholder="Poora naam"/></div>
      <div style={S.fr}>
        <div style={S.f}><label style={S.lbl}>Role</label>
          <select style={S.fi} value={form.role} onChange={e=>setForm(p=>({...p,role:e.target.value}))}>
            {Object.keys(ROLE_MODULES).map(r=><option key={r}>{r}</option>)}
          </select>
        </div>
        <div style={S.f}><label style={S.lbl}>Plant</label>
          <select style={S.fi} value={form.plant} onChange={e=>setForm(p=>({...p,plant:e.target.value}))}>
            <option>All</option><option>Plant 477</option><option>Plant 488</option><option>Plant 433</option>
          </select>
        </div>
      </div>
      <div style={{background:'#E6F1FB',border:'1px solid #1F3864',borderRadius:8,padding:'8px 12px',marginBottom:8,fontSize:12,color:'#0C447C'}}>
        ℹ️ User add hone ke baad Supabase SQL Editor mein SQL run karna hoga — system copy kar dega!
      </div>
      <button style={S.sb} onClick={save} disabled={saving}>{saving?'Processing...':'Generate SQL + Copy'}</button>
      {toast&&<Toast {...toast}/>}
    </div>}

    <div style={S.card}>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
          <thead><tr>{['Username','Full Name','Role','Plant','Status'].map(h=><th key={h} style={{background:'#1F3864',color:'#fff',padding:'6px 8px',textAlign:'left'}}>{h}</th>)}</tr></thead>
          <tbody>{users.map((u:any,i:number)=>(
            <tr key={i} style={{background:i%2===0?'#FAFAFA':'#fff'}}>
              <td style={{padding:'6px 8px',fontWeight:600,color:'#1F3864'}}>{u.username}</td>
              <td style={{padding:'6px 8px'}}>{u.full_name}</td>
              <td style={{padding:'6px 8px',fontSize:10}}>{u.role}</td>
              <td style={{padding:'6px 8px',fontSize:10}}>{u.plant}</td>
              <td style={{padding:'6px 8px'}}><span style={{background:'#E8F5E9',color:'#276221',padding:'2px 7px',borderRadius:999,fontSize:10,fontWeight:600}}>{u.status}</span></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  </div>
}

// ─── Performance Tab ──────────────────────────────────────────
const PERF_EMP = [
  {id:'E001',name:'Ranjan Kumar',role:'Plant Head'},
  {id:'E002',name:'Parveen',role:'Senior Foreman'},
  {id:'E003',name:'Rahul Singh',role:'Maintenance Foreman'},
  {id:'E004',name:'Deepak',role:'Senior Foreman'},
  {id:'E005',name:'Karan',role:'Supervisor'},
  {id:'E006',name:'Ankush',role:'Supervisor'},
  {id:'E007',name:'Dayanand',role:'Operator'},
  {id:'E008',name:'Alok Kumar',role:'Operator'},
  {id:'E009',name:'Satyanand',role:'Operator'},
  {id:'E010',name:'Uday',role:'Operator'},
  {id:'E011',name:'Sudarshan',role:'Operator'},
  {id:'E012',name:'Rahul',role:'Operator'},
  {id:'E013',name:'Pintoo',role:'Operator'},
]

function PerformanceTab({user}:{user:User}) {
  const [activePerf,setActivePerf]=useState('weekly')
  const PTABS=[{id:'weekly',label:'Weekly'},{id:'increment',label:'Increment Calc'}]

  return <div>
    <div style={{display:'flex',gap:6,marginBottom:12}}>
      {PTABS.map(t=><button key={t.id} style={activePerf===t.id?S.nbA:S.nb} onClick={()=>setActivePerf(t.id)}>{t.label}</button>)}
    </div>
    {activePerf==='weekly'&&<WeeklyScoreForm user={user}/>}
    {activePerf==='increment'&&<IncrementCalc/>}
  </div>
}

function WeeklyScoreForm({user}:{user:User}) {
  const [emp,setEmp]=useState('')
  const [week,setWeek]=useState('Week 1')
  const [year,setYear]=useState(String(new Date().getFullYear()))
  const [scores,setScores]=useState<Record<string,string>>({})
  const [remarks,setRemarks]=useState('')
  const [toast,setToast]=useState<{msg:string,ok:boolean}|null>(null)

  const selEmp=PERF_EMP.find(e=>e.id===emp)
  const isOp=selEmp?.role==='Operator'
  const isFm=selEmp?.role?.includes('Foreman')

  const params=isOp?[
    {id:'prod',label:'Production Output vs Target',weight:30,hint:'>=100%=10, >=90%=7, >=80%=5'},
    {id:'rej',label:'Rejection Rate',weight:25,hint:'<=1%=10, <=2%=7, <=3%=5'},
    {id:'att',label:'Attendance',weight:20,hint:'>=97%=10, >=95%=7, >=90%=5'},
    {id:'down',label:'Downtime Score',weight:15,hint:'0min=10, <=30=7, <=60=5'},
    {id:'disc',label:'Discipline',weight:10,hint:'Excellent=10, Good=7, Avg=5'},
  ]:isFm?[
    {id:'team',label:'Team Production',weight:25,hint:'>=100%=10'},
    {id:'qual',label:'Quality Score',weight:20,hint:'0NG=10'},
    {id:'att',label:'Attendance',weight:15,hint:'>=97%=10'},
    {id:'pm',label:'Mould PM Compliance',weight:15,hint:'100%=10'},
    {id:'bd',label:'Breakdown Resolution',weight:15,hint:'<=30min=10'},
    {id:'rep',label:'Reporting On Time',weight:10,hint:'Always=10'},
  ]:[
    {id:'eff',label:'Plant Efficiency',weight:30,hint:'>=95%=10'},
    {id:'plan',label:'Planning Accuracy',weight:20,hint:'>=95%=10'},
    {id:'tmgt',label:'Team Management',weight:20,hint:'Excellent=10'},
    {id:'att',label:'Attendance',weight:15,hint:'>=97%=10'},
    {id:'safe',label:'Safety & Compliance',weight:15,hint:'0 incidents=10'},
  ]

  const calcScore=()=>{
    if(!params.length) return 0
    const total=params.reduce((a,p)=>a+(parseFloat(scores[p.id]||'0')*p.weight/100),0)*10
    return Math.round(total)
  }

  const score=calcScore()
  const grade=score>=90?'A':score>=75?'B':score>=60?'C':score>=50?'D':'F'
  const gradeCol=score>=90?'#276221':score>=75?'#854F0B':score>=60?'#0C447C':score>=50?'#C2185B':'#C00000'

  const weeks=Array.from({length:52},(_,i)=>`Week ${i+1}`)

  return <div style={S.card}>
    <div style={{fontWeight:700,marginBottom:10}}>Weekly Scorecard</div>
    <div style={S.fr}>
      <div style={S.f}><label style={S.lbl}>Week</label>
        <select style={S.fi} value={week} onChange={e=>setWeek(e.target.value)}>
          {weeks.map(w=><option key={w}>{w}</option>)}
        </select>
      </div>
      <div style={S.f}><label style={S.lbl}>Year</label><input type="number" style={S.fi} value={year} onChange={e=>setYear(e.target.value)}/></div>
    </div>
    <div style={S.f}><label style={S.lbl}>Employee</label>
      <select style={S.fi} value={emp} onChange={e=>setEmp(e.target.value)}>
        <option value="">-- Select Employee --</option>
        {PERF_EMP.map(e=><option key={e.id} value={e.id}>{e.name} ({e.role})</option>)}
      </select>
    </div>

    {emp&&params.length>0&&<>
      <div style={{background:'#F9F9F9',borderRadius:8,padding:'10px 12px',marginBottom:10}}>
        {params.map(p=>(
          <div key={p.id} style={{display:'grid',gridTemplateColumns:'2fr 0.5fr 0.8fr',gap:6,alignItems:'center',padding:'6px 0',borderBottom:'1px solid #F0F0F0'}}>
            <div>
              <div style={{fontSize:11,fontWeight:600}}>{p.label}</div>
              <div style={{fontSize:9,color:'#888'}}>{p.hint}</div>
            </div>
            <div style={{fontSize:10,fontWeight:600,color:'#1F3864',textAlign:'center'}}>{p.weight}%</div>
            <input type="number" min="0" max="10" step="0.5" placeholder="0-10" value={scores[p.id]||''} onChange={e=>setScores(prev=>({...prev,[p.id]:e.target.value}))} style={{padding:'5px',border:'1px solid #E0E0E0',borderRadius:6,fontSize:13,fontWeight:600,textAlign:'center',width:'100%'}}/>
          </div>
        ))}
        {score>0&&<div style={{background:'#1F3864',borderRadius:6,marginTop:8,padding:'8px 12px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span style={{color:'#fff',fontSize:12,fontWeight:600}}>Total Score:</span>
          <span style={{color:'#FFD966',fontSize:16,fontWeight:700}}>{score}%</span>
          <span style={{background:gradeCol,color:'#fff',padding:'3px 12px',borderRadius:999,fontSize:12,fontWeight:700}}>Grade {grade}</span>
        </div>}
      </div>
      <div style={S.f}><label style={S.lbl}>Remarks</label><input style={S.fi} value={remarks} onChange={e=>setRemarks(e.target.value)} placeholder="Any observations..."/></div>
      <button style={S.sb} onClick={()=>setToast({msg:`Score saved! ${selEmp?.name}: ${score}% Grade ${grade}`,ok:true})}>Save Weekly Score</button>
      {toast&&<Toast {...toast}/>}
    </>}
  </div>
}

function IncrementCalc() {
  const [data,setData]=useState<Record<string,any>>({})

  const calcInc=(empId:string)=>{
    const d=data[empId]||{}
    const sal=parseFloat(d.sal||'0')
    const score=parseFloat(d.score||'0')
    const pct=score>=90?10:score>=75?7.5:score>=60?5:score>=50?3:0
    const amt=Math.round(sal*pct/100)
    return {grade:score>=90?'A':score>=75?'B':score>=60?'C':score>=50?'D':'F',pct,amt,newSal:sal+amt}
  }

  return <div style={S.card}>
    <div style={{fontWeight:700,marginBottom:8}}>Annual Increment Calculator {new Date().getFullYear()}</div>
    <div style={{background:'#FFF9E6',border:'1px solid #F4B942',borderRadius:8,padding:'8px 12px',marginBottom:10,fontSize:12,color:'#633806'}}>
      Salary aur Yearly Score % daalo — Increment auto calculate hoga!
    </div>
    <div style={{overflowX:'auto'}}>
      <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
        <thead><tr>
          {['Name','Role','Salary (₹)','Score %','Grade','Inc %','Inc Amt','New Salary'].map(h=>
            <th key={h} style={{background:'#1F3864',color:'#fff',padding:'6px 8px',textAlign:'left'}}>{h}</th>)}
        </tr></thead>
        <tbody>{PERF_EMP.map((e,i)=>{
          const d=data[e.id]||{}
          const inc=calcInc(e.id)
          const col=inc.pct>=7.5?'#276221':inc.pct>=5?'#854F0B':inc.pct>0?'#C2185B':'#C00000'
          return <tr key={i} style={{background:i%2===0?'#FAFAFA':'#fff'}}>
            <td style={{padding:'6px 8px',fontWeight:600}}>{e.name}</td>
            <td style={{padding:'6px 8px',fontSize:10,color:'#666'}}>{e.role}</td>
            <td style={{padding:'4px'}}><input type="number" placeholder="Salary" value={d.sal||''} onChange={ev=>setData(p=>({...p,[e.id]:{...p[e.id]||{},sal:ev.target.value}}))} style={{width:80,padding:'4px',border:'1px solid #E0E0E0',borderRadius:4,textAlign:'center',fontSize:11}}/></td>
            <td style={{padding:'4px'}}><input type="number" placeholder="Score" value={d.score||''} onChange={ev=>setData(p=>({...p,[e.id]:{...p[e.id]||{},score:ev.target.value}}))} style={{width:60,padding:'4px',border:'1px solid #E0E0E0',borderRadius:4,textAlign:'center',fontSize:11}}/></td>
            <td style={{padding:'6px 8px',fontWeight:700,color:col,textAlign:'center'}}>{d.score?inc.grade:'--'}</td>
            <td style={{padding:'6px 8px',fontWeight:700,color:col,textAlign:'center'}}>{d.score?inc.pct+'%':'--'}</td>
            <td style={{padding:'6px 8px',fontWeight:700,color:col}}>{inc.amt>0?'₹'+inc.amt.toLocaleString():'--'}</td>
            <td style={{padding:'6px 8px',fontWeight:700,color:'#1F3864'}}>{inc.newSal>0?'₹'+inc.newSal.toLocaleString():'--'}</td>
          </tr>
        })}</tbody>
      </table>
    </div>
  </div>
}

// ─── MIS Comparison Section ───────────────────────────────────
function MISComparisonSection() {
  const [compareType, setCompareType] = useState('today-yesterday')
  const [plant, setPlant] = useState('')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const nd = () => new Date().toISOString().slice(0,10)
  const prevDay = () => { const d = new Date(); d.setDate(d.getDate()-1); return d.toISOString().slice(0,10) }
  const weekStart = () => { const d = new Date(); d.setDate(d.getDate()-7); return d.toISOString().slice(0,10) }
  const prevWeekStart = () => { const d = new Date(); d.setDate(d.getDate()-14); return d.toISOString().slice(0,10) }
  const prevWeekEnd = () => { const d = new Date(); d.setDate(d.getDate()-8); return d.toISOString().slice(0,10) }
  const monthStart = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01` }
  const prevMonthStart = () => { const d = new Date(); d.setMonth(d.getMonth()-1); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01` }
  const prevMonthEnd = () => { const d = new Date(); d.setDate(0); return d.toISOString().slice(0,10) }

  const load = async () => {
    setLoading(true)
    let period1From='', period1To='', period2From='', period2To=''
    let p1Label='', p2Label=''

    if (compareType === 'today-yesterday') {
      period1From=nd(); period1To=nd(); p1Label='Aaj'
      period2From=prevDay(); period2To=prevDay(); p2Label='Kal'
    } else if (compareType === 'week') {
      period1From=weekStart(); period1To=nd(); p1Label='Is Hafte'
      period2From=prevWeekStart(); period2To=prevWeekEnd(); p2Label='Pichle Hafte'
    } else if (compareType === 'month') {
      period1From=monthStart(); period1To=nd(); p1Label='Is Mahine'
      period2From=prevMonthStart(); period2To=prevMonthEnd(); p2Label='Pichle Mahine'
    } else if (compareType === 'shift') {
      period1From=nd(); period1To=nd(); p1Label='Day Shift'; p2Label='Night Shift'
    }

    const [r1, r2] = await Promise.all([
      fetch(`/api/reports?module=production&from=${period1From}&to=${period1To}${plant?`&plant=${plant}`:''}`).then(r=>r.json()),
      compareType !== 'shift' ? fetch(`/api/reports?module=production&from=${period2From}&to=${period2To}${plant?`&plant=${plant}`:''}`).then(r=>r.json()) : Promise.resolve(null)
    ])

    if (compareType === 'shift') {
      // Split by shift from r1
      const dayData = (r1.data||[]).filter((r:any)=>r.shift?.includes('Day'))
      const nightData = (r1.data||[]).filter((r:any)=>r.shift?.includes('Night'))
      const calcSummary = (rows:any[]) => ({
        good: rows.reduce((a:number,r:any)=>a+(r.good_parts||0),0),
        rej: rows.reduce((a:number,r:any)=>a+(r.rejection||0),0),
        entries: rows.length,
        down: rows.reduce((a:number,r:any)=>a+(r.downtime||0),0)
      })
      setData({ p1Label, p2Label, s1: calcSummary(dayData), s2: calcSummary(nightData), byPlant: null })
    } else {
      const calcSummary = (rows:any[]) => ({
        good: rows.reduce((a:number,r:any)=>a+(r.good_parts||0),0),
        rej: rows.reduce((a:number,r:any)=>a+(r.rejection||0),0),
        entries: rows.length,
        down: rows.reduce((a:number,r:any)=>a+(r.downtime||0),0)
      })
      const s1 = calcSummary(r1.data||[])
      const s2 = calcSummary(r2?.data||[])

      // By plant comparison
      const plants = ['Plant 477','Plant 488','Plant 433']
      const byPlant = plants.map(p => ({
        plant: p,
        p1: calcSummary((r1.data||[]).filter((r:any)=>r.plant===p)),
        p2: calcSummary((r2?.data||[]).filter((r:any)=>r.plant===p))
      }))

      setData({ p1Label, p2Label, s1, s2, byPlant })
    }
    setLoading(false)
  }

  const diffPct = (a:number,b:number) => b===0?100:Math.round((a-b)/b*100)
  const diffColor = (d:number,inverse=false) => {
    if(inverse) d=-d
    return d>0?'#276221':d<0?'#C00000':'#666'
  }
  const diffIcon = (d:number,inverse=false) => {
    if(inverse) d=-d
    return d>0?'↑':d<0?'↓':'→'
  }

  return <div>
    {/* Controls */}
    <div style={S.card}>
      <div style={{fontWeight:700,marginBottom:10}}>📊 Production Comparison</div>
      <div style={S.fr}>
        <div style={S.f}><label style={S.lbl}>Compare</label>
          <select style={S.fi} value={compareType} onChange={e=>setCompareType(e.target.value)}>
            <option value="today-yesterday">Aaj vs Kal</option>
            <option value="week">Is Hafte vs Pichle Hafte</option>
            <option value="month">Is Mahine vs Pichle Mahine</option>
            <option value="shift">Day Shift vs Night Shift</option>
          </select>
        </div>
        <div style={S.f}><label style={S.lbl}>Plant (Optional)</label>
          <select style={S.fi} value={plant} onChange={e=>setPlant(e.target.value)}>
            <option value="">All Plants</option>
            <option>Plant 477</option><option>Plant 488</option><option>Plant 433</option>
          </select>
        </div>
      </div>
      <button style={S.sb} onClick={load} disabled={loading}>{loading?'Loading...':'📊 Compare Karo'}</button>
    </div>

    {data&&<div>
      {/* Summary comparison */}
      <div style={S.card}>
        <div style={{fontWeight:700,marginBottom:10}}>{data.p1Label} vs {data.p2Label}</div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
            <thead><tr>
              <th style={{background:'#1F3864',color:'#fff',padding:'8px 12px',textAlign:'left'}}>Metric</th>
              <th style={{background:'#276221',color:'#fff',padding:'8px 12px',textAlign:'center'}}>{data.p1Label}</th>
              <th style={{background:'#854F0B',color:'#fff',padding:'8px 12px',textAlign:'center'}}>{data.p2Label}</th>
              <th style={{background:'#1F3864',color:'#fff',padding:'8px 12px',textAlign:'center'}}>Change</th>
            </tr></thead>
            <tbody>
              {[
                {label:'Good Parts',k:'good',inverse:false,fmt:(v:number)=>v.toLocaleString()},
                {label:'Rejection',k:'rej',inverse:true,fmt:(v:number)=>v.toLocaleString()},
                {label:'Downtime (min)',k:'down',inverse:true,fmt:(v:number)=>Math.round(v)+' min'},
                {label:'Entries',k:'entries',inverse:false,fmt:(v:number)=>String(v)},
              ].map((row,i)=>{
                const v1=data.s1?.[row.k]||0, v2=data.s2?.[row.k]||0
                const diff=diffPct(v1,v2)
                const col=diffColor(diff,row.inverse)
                const icon=diffIcon(diff,row.inverse)
                const totalP = (v1+v2)>0?Math.round(v1/(v1+v2)*100):0
                return <tr key={i} style={{background:i%2===0?'#FAFAFA':'#fff'}}>
                  <td style={{padding:'8px 12px',fontWeight:600}}>{row.label}</td>
                  <td style={{padding:'8px 12px',textAlign:'center',fontWeight:700,color:'#276221',fontSize:14}}>{row.fmt(v1)}</td>
                  <td style={{padding:'8px 12px',textAlign:'center',fontWeight:700,color:'#854F0B',fontSize:14}}>{row.fmt(v2)}</td>
                  <td style={{padding:'8px 12px',textAlign:'center'}}>
                    <span style={{color:col,fontWeight:700,fontSize:13}}>{icon} {Math.abs(diff)}%</span>
                  </td>
                </tr>
              })}
              {/* Efficiency row */}
              {(() => {
                const eff1=(data.s1?.good||0)+(data.s1?.rej||0)>0?Math.round((data.s1?.good||0)/((data.s1?.good||0)+(data.s1?.rej||0))*100):0
                const eff2=(data.s2?.good||0)+(data.s2?.rej||0)>0?Math.round((data.s2?.good||0)/((data.s2?.good||0)+(data.s2?.rej||0))*100):0
                const diff=eff1-eff2
                const col=diff>0?'#276221':diff<0?'#C00000':'#666'
                return <tr style={{background:'#E6F1FB'}}>
                  <td style={{padding:'8px 12px',fontWeight:700,color:'#1F3864'}}>Efficiency %</td>
                  <td style={{padding:'8px 12px',textAlign:'center',fontWeight:700,color:'#276221',fontSize:14}}>{eff1}%</td>
                  <td style={{padding:'8px 12px',textAlign:'center',fontWeight:700,color:'#854F0B',fontSize:14}}>{eff2}%</td>
                  <td style={{padding:'8px 12px',textAlign:'center'}}><span style={{color:col,fontWeight:700}}>{diff>0?'↑':'↓'} {Math.abs(diff)}%</span></td>
                </tr>
              })()}
            </tbody>
          </table>
        </div>

        {/* Visual bar comparison */}
        <div style={{marginTop:12}}>
          {[
            {label:'Good Parts',v1:data.s1?.good||0,v2:data.s2?.good||0,col1:'#276221',col2:'#854F0B'},
            {label:'Rejection',v1:data.s1?.rej||0,v2:data.s2?.rej||0,col1:'#C00000',col2:'#FF9800'},
          ].map((bar,i)=>{
            const max=Math.max(bar.v1,bar.v2)||1
            const w1=Math.round(bar.v1/max*100)
            const w2=Math.round(bar.v2/max*100)
            return <div key={i} style={{marginBottom:10}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                <span style={{fontSize:11,fontWeight:600}}>{bar.label}</span>
              </div>
              <div style={{marginBottom:3}}>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <span style={{fontSize:10,color:'#276221',width:80,textAlign:'right'}}>{data.p1Label}</span>
                  <div style={{flex:1,height:12,background:'#F0F0F0',borderRadius:999,overflow:'hidden'}}>
                    <div style={{width:`${w1}%`,height:'100%',background:bar.col1,borderRadius:999}}/>
                  </div>
                  <span style={{fontSize:11,fontWeight:700,color:bar.col1,width:80}}>{bar.v1.toLocaleString()}</span>
                </div>
              </div>
              <div>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <span style={{fontSize:10,color:'#854F0B',width:80,textAlign:'right'}}>{data.p2Label}</span>
                  <div style={{flex:1,height:12,background:'#F0F0F0',borderRadius:999,overflow:'hidden'}}>
                    <div style={{width:`${w2}%`,height:'100%',background:bar.col2,borderRadius:999}}/>
                  </div>
                  <span style={{fontSize:11,fontWeight:700,color:bar.col2,width:80}}>{bar.v2.toLocaleString()}</span>
                </div>
              </div>
            </div>
          })}
        </div>
      </div>

      {/* Plant-wise comparison */}
      {data.byPlant&&<div style={S.card}>
        <div style={{fontWeight:700,marginBottom:10}}>Plant-wise Comparison</div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
            <thead><tr>
              <th style={{background:'#1F3864',color:'#fff',padding:'6px 8px'}}>Plant</th>
              <th style={{background:'#276221',color:'#fff',padding:'6px 8px',textAlign:'center'}}>{data.p1Label} Good</th>
              <th style={{background:'#854F0B',color:'#fff',padding:'6px 8px',textAlign:'center'}}>{data.p2Label} Good</th>
              <th style={{background:'#276221',color:'#fff',padding:'6px 8px',textAlign:'center'}}>{data.p1Label} Rej</th>
              <th style={{background:'#854F0B',color:'#fff',padding:'6px 8px',textAlign:'center'}}>{data.p2Label} Rej</th>
              <th style={{background:'#1F3864',color:'#fff',padding:'6px 8px',textAlign:'center'}}>Change</th>
            </tr></thead>
            <tbody>{data.byPlant.map((p:any,i:number)=>{
              const diff=diffPct(p.p1.good,p.p2.good)
              const col=diffColor(diff,false)
              const icon=diffIcon(diff,false)
              return <tr key={i} style={{background:i%2===0?'#FAFAFA':'#fff'}}>
                <td style={{padding:'6px 8px',fontWeight:700,color:'#1F3864'}}>{p.plant}</td>
                <td style={{padding:'6px 8px',textAlign:'center',fontWeight:700,color:'#276221'}}>{p.p1.good.toLocaleString()}</td>
                <td style={{padding:'6px 8px',textAlign:'center',fontWeight:700,color:'#854F0B'}}>{p.p2.good.toLocaleString()}</td>
                <td style={{padding:'6px 8px',textAlign:'center',color:'#C00000'}}>{p.p1.rej.toLocaleString()}</td>
                <td style={{padding:'6px 8px',textAlign:'center',color:'#FF9800'}}>{p.p2.rej.toLocaleString()}</td>
                <td style={{padding:'6px 8px',textAlign:'center'}}><span style={{color:col,fontWeight:700}}>{icon} {Math.abs(diff)}%</span></td>
              </tr>
            })}</tbody>
          </table>
        </div>
      </div>}
    </div>}
  </div>
}

// ─── MIS Pivot Section ────────────────────────────────────────
function MISPivotSection() {
  const [from,setFrom]=useState(()=>{const d=new Date();d.setDate(d.getDate()-7);return d.toISOString().slice(0,10)})
  const [to,setTo]=useState(()=>new Date().toISOString().slice(0,10))
  const [rowBy,setRowBy]=useState('machine')
  const [colBy,setColBy]=useState('date')
  const [metric,setMetric]=useState('good')
  const [data,setData]=useState<any[]>([])
  const [rows,setRows]=useState<string[]>([])
  const [cols,setCols]=useState<string[]>([])
  const [loading,setLoading]=useState(false)

  const load=async()=>{
    setLoading(true)
    const res=await fetch(`/api/reports?module=production&from=${from}&to=${to}`).then(r=>r.json())
    const records=res.data||[]

    // Build pivot
    const rowVals=new Set<string>()
    const colVals=new Set<string>()
    const pivot:Record<string,Record<string,number>>={}

    records.forEach((r:any)=>{
      const rowKey=rowBy==='machine'?r.machine:rowBy==='plant'?r.plant:rowBy==='product'?r.product:rowBy==='shift'?(r.shift?.includes('Day')?'Day':'Night'):r.operator||''
      const colKey=colBy==='date'?r.date:colBy==='plant'?r.plant:colBy==='shift'?(r.shift?.includes('Day')?'Day':'Night'):colBy==='machine'?r.machine:r.product||''
      const val=metric==='good'?r.good_parts||0:metric==='rej'?r.rejection||0:metric==='down'?r.downtime||0:r.good_parts||0

      if(!rowKey||!colKey) return
      rowVals.add(rowKey)
      colVals.add(colKey)
      if(!pivot[rowKey]) pivot[rowKey]={}
      pivot[rowKey][colKey]=(pivot[rowKey][colKey]||0)+val
    })

    const sortedRows=Array.from(rowVals).sort()
    const sortedCols=Array.from(colVals).sort()
    setRows(sortedRows)
    setCols(sortedCols)
    setData(sortedRows.map(row=>({
      row,
      values:sortedCols.map(col=>pivot[row]?.[col]||0),
      total:sortedCols.reduce((a,col)=>a+(pivot[row]?.[col]||0),0)
    })))
    setLoading(false)
  }

  const maxVal=Math.max(...data.flatMap(r=>r.values))||1

  const metricLabel=metric==='good'?'Good Parts':metric==='rej'?'Rejection':'Downtime'
  const metricColor=metric==='good'?'#276221':metric==='rej'?'#C00000':'#854F0B'

  return <div>
    <div style={S.card}>
      <div style={{fontWeight:700,marginBottom:10}}>📋 Pivot Table — Production Analysis</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
        <div style={S.f}><label style={S.lbl}>From</label><input type="date" style={S.fi} value={from} onChange={e=>setFrom(e.target.value)}/></div>
        <div style={S.f}><label style={S.lbl}>To</label><input type="date" style={S.fi} value={to} onChange={e=>setTo(e.target.value)}/></div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:10}}>
        <div style={S.f}><label style={S.lbl}>Rows (By)</label>
          <select style={S.fi} value={rowBy} onChange={e=>setRowBy(e.target.value)}>
            <option value="machine">Machine</option>
            <option value="plant">Plant</option>
            <option value="product">Product</option>
            <option value="shift">Shift</option>
            <option value="operator">Operator</option>
          </select>
        </div>
        <div style={S.f}><label style={S.lbl}>Columns (By)</label>
          <select style={S.fi} value={colBy} onChange={e=>setColBy(e.target.value)}>
            <option value="date">Date</option>
            <option value="plant">Plant</option>
            <option value="shift">Shift</option>
            <option value="machine">Machine</option>
            <option value="product">Product</option>
          </select>
        </div>
        <div style={S.f}><label style={S.lbl}>Metric</label>
          <select style={S.fi} value={metric} onChange={e=>setMetric(e.target.value)}>
            <option value="good">Good Parts</option>
            <option value="rej">Rejection</option>
            <option value="down">Downtime (min)</option>
          </select>
        </div>
      </div>
      <button style={S.sb} onClick={load} disabled={loading}>{loading?'Loading...':'📋 Generate Pivot'}</button>
    </div>

    {data.length>0&&<div style={S.card}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
        <div style={{fontWeight:700}}>{metricLabel} — {rowBy.charAt(0).toUpperCase()+rowBy.slice(1)} × {colBy.charAt(0).toUpperCase()+colBy.slice(1)}</div>
        <div style={{fontSize:11,color:'#666'}}>{from} to {to}</div>
      </div>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:11,minWidth:600}}>
          <thead>
            <tr>
              <th style={{background:'#1F3864',color:'#fff',padding:'6px 8px',textAlign:'left',position:'sticky' as const,left:0,minWidth:120}}>{rowBy.toUpperCase()}</th>
              {cols.map(c=><th key={c} style={{background:'#1F3864',color:'#fff',padding:'6px 8px',textAlign:'center',whiteSpace:'nowrap' as const}}>{c}</th>)}
              <th style={{background:'#276221',color:'#fff',padding:'6px 8px',textAlign:'center'}}>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row,ri)=>(
              <tr key={ri} style={{background:ri%2===0?'#FAFAFA':'#fff'}}>
                <td style={{padding:'6px 8px',fontWeight:600,position:'sticky' as const,left:0,background:ri%2===0?'#FAFAFA':'#fff',borderRight:'2px solid #E0E0E0'}}>{row.row}</td>
                {row.values.map((v:number,ci:number)=>{
                  const intensity=Math.round((v/maxVal)*100)
                  const bg=v===0?'#fff':`rgba(${metric==='good'?'39,98,33':metric==='rej'?'192,0,0':'133,79,11'},${intensity/100*0.4+0.05})`
                  return <td key={ci} style={{padding:'6px 8px',textAlign:'center',background:bg,fontWeight:v>0?600:400,color:v>0?metricColor:'#ccc'}}>
                    {v>0?v.toLocaleString():'—'}
                  </td>
                })}
                <td style={{padding:'6px 8px',textAlign:'center',fontWeight:700,color:metricColor,background:'#F0F0F0'}}>
                  {row.total.toLocaleString()}
                </td>
              </tr>
            ))}
            {/* Column totals */}
            <tr style={{background:'#E6F1FB',fontWeight:700}}>
              <td style={{padding:'6px 8px',color:'#1F3864',position:'sticky' as const,left:0,background:'#E6F1FB',borderRight:'2px solid #E0E0E0'}}>TOTAL</td>
              {cols.map((_,ci)=>{
                const colTotal=data.reduce((a,row)=>a+(row.values[ci]||0),0)
                return <td key={ci} style={{padding:'6px 8px',textAlign:'center',color:metricColor}}>{colTotal.toLocaleString()}</td>
              })}
              <td style={{padding:'6px 8px',textAlign:'center',background:'#1F3864',color:'#FFD966'}}>
                {data.reduce((a,row)=>a+row.total,0).toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div style={{marginTop:8,fontSize:10,color:'#666'}}>
        💡 Color intensity = value ka relative size. Darker = Higher value.
      </div>
    </div>}

    {data.length===0&&!loading&&<div style={{...S.card,textAlign:'center',color:'#666',padding:32}}>
      Upar se date range aur options select karo → Generate Pivot click karo!
    </div>}
  </div>
}
