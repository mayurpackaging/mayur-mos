'use client'
import { useState, useEffect, useCallback, useRef } from 'react'

interface User { name: string; username: string; role: string; plant: string; modules: string }

const ML: Record<string, string> = {
  mis:"MIS", ims:"IMS Stock", production:"Production", planning:"Planning",
  quality:"Quality", rejection:"Rejection", mouldchange:"Mould Change",
  dispatch:"Dispatch", batch:"Batch", sales:"Sales", spares:"Spares",
  mouldpm:"Mould PM", breakdown:"Breakdown", maintenance:"Maintenance",
  bulkproduction:"Bulk Production", dailyreport:"Daily Report",
  mouldhistory:"Mould History",
  qcalerts:"QC Alerts",
  processcheck:"✅ Process Checker",
  reports:"Reports", users:"Users", performance:"Performance"
}

const MACH: Record<string, string[]> = {
  "Plant 477": ["M1-Sumitomo 180T","M2-Sumitomo 180T","M3-Sumitomo 180T","M4-Sumitomo 280T","M5-JSW 180T","M6-Sumitomo 180T"],
  "Plant 488": ["M1-Sumitomo 180T","M2-Sumitomo 180T","M3-JSW 350T","M4-Sumitomo 180T","M5-Sumitomo 350T","M6-JSW 350T","M7-JSW 350T"],
  "Plant 433": ["M1-Milacron N200T","M2-Milacron N200T"]
}

const OPS = ["Dayanand","Alok Kumar","Satyanand","Uday","Sudarshan","Rahul","Pintoo","Parveen","Rahul Singh","Deepak","Karan","Ankush","Sandeep"]

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
  {code:"6690",name:"2000 ml Common Lid"},{code:"6483",name:"Rectangle Lid"},
  {code:"6873",name:"Tamper Lock Rectangle Lid"},{code:"6717",name:"Oval Lid"},
  {code:"6756",name:"RO 16 Lid"},{code:"6757",name:"RO 24/32 Lid"},
  {code:"6762",name:"RE 16/24 Lid"},{code:"6763",name:"RE 28/38 Lid"},
  {code:"6710",name:"Sipper Lid Old"},{code:"6906",name:"Sipper Lid New"},
  {code:"6620",name:"175 ml Lid"},{code:"6503",name:"Big Common Lid"},
  {code:"6809",name:"500 ml Tamper Lock Rectangle"},{code:"6870",name:"650 ml Tamper Lock Rectangle"},
  {code:"6871",name:"750 ml Tamper Lock Rectangle"},{code:"6872B",name:"1000 ml Tamper Lock Rectangle"},
  {code:"6873T",name:"Lid Tamper Lock Rectangle"},
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

const PM_OPS = ["Prince","Rohit","Ranjan Kumar"]

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
  const [pmAlertCount,setPmAlertCount]=useState(0)
  useEffect(()=>{
    fetch('/api/mouldpm').then(r=>r.json()).then(d=>{
      const moulds=d.moulds||[]
      setPmAlertCount(moulds.filter((m:any)=>m.pct>=80).length)
    }).catch(()=>{})
  },[])
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
        {modules.map((m:string)=><button key={m} style={{...(tab===m?S.nbA:S.nb),position:'relative'}} onClick={()=>setTab(m)}>
            {ML[m]||m}
            {m==='mouldpm'&&pmAlertCount>0&&<span style={{position:'absolute',top:-4,right:-4,background:'#C00000',color:'#fff',borderRadius:'50%',width:16,height:16,fontSize:9,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,lineHeight:'16px'}}>{pmAlertCount}</span>}
          </button>)}
      </div>
      <TodaysPlanBanner/>
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
        {tab==='maintenance'&&<MaintenanceTab user={user}/>}
        {tab==='dailyreport'&&<DailyReportTab user={user}/>}
        {tab==='mouldhistory'&&<MouldHistoryTab/>}
        {tab==='bulkproduction'&&<BulkProductionTab user={user}/>}
        {tab==='qcalerts'&&<QCAlertsTab user={user}/>}
        {tab==='processcheck'&&<ProcessCheckTab user={user}/>}
        {!['mis','ims','production','breakdown','mouldchange','mouldpm','rejection','reports','dispatch','spares','quality','batch','sales','planning','users','performance','maintenance','bulkproduction','dailyreport','mouldhistory','qcalerts','processcheck'].includes(tab)&&(
          <div style={S.card}><div style={{fontWeight:700,marginBottom:8}}>{ML[tab]||tab}</div><div style={{color:'#666',fontSize:13}}>Yeh module jald aayega! 🔄</div></div>
        )}
      </div>
    </div>
  )
}


// ─── Rejection Comparison Component ──────────────────────────
function RejectionComparison({from,to,plant}:{from:string,to:string,plant:string}) {
  const [data,setData]=useState<any[]>([])
  const [loading,setLoading]=useState(false)
  const [toast,setToast]=useState<{msg:string,ok:boolean}|null>(null)

  const load=async()=>{
    setLoading(true)
    // Get production rejection data
    const [prodRes,rejRes]=await Promise.all([
      fetch(`/api/reports?module=production&from=${from}&to=${to}${plant?`&plant=${plant}`:''}`).then(r=>r.json()),
      fetch(`/api/reports?module=rejection&from=${from}&to=${to}${plant?`&plant=${plant}`:''}`).then(r=>r.json())
    ])

    const prodData=prodRes.data||[]
    const rejData=rejRes.data||[]

    // Group production by date+machine+product
    const prodMap:Record<string,any>={}
    prodData.forEach(r=>{
      const key=`${r.date}||${r.machine}||${r.product}`
      if(!prodMap[key]) prodMap[key]={date:r.date,machine:r.machine,product:r.product,plant:r.plant,operatorRej:0,shift:r.shift}
      prodMap[key].operatorRej+=(r.rejection||0)
    })

    // Group rejection by date+machine+product
    const rejMap:Record<string,any>={}
    rejData.forEach(r=>{
      const key=`${r.date}||${r.machine}||${r.product}`
      if(!rejMap[key]) rejMap[key]={date:r.date,machine:r.machine,product:r.product,plant:r.plant,qcRej:0,reason:r.reason}
      rejMap[key].qcRej+=(r.rejection_qty||0)
    })

    // Merge and compare
    const allKeys=new Set([...Object.keys(prodMap),...Object.keys(rejMap)])
    const comparison=Array.from(allKeys).map(key=>{
      const prod=prodMap[key]||{}
      const rej=rejMap[key]||{}
      const operatorRej=prod.operatorRej||0
      const qcRej=rej.qcRej||0
      const diff=Math.abs(qcRej-operatorRej)
      const diffPct=operatorRej>0?Math.round(diff/operatorRej*100):qcRej>0?100:0
      const isAlert=diff>50&&diffPct>10
      const isWarning=diff>5&&diffPct>5&&!isAlert
      return {
        date:prod.date||rej.date,
        machine:prod.machine||rej.machine,
        product:prod.product||rej.product,
        plant:prod.plant||rej.plant,
        shift:prod.shift||'--',
        operatorRej,qcRej,diff,diffPct,isAlert,isWarning,
        reason:rej.reason||'--'
      }
    }).sort((a,b)=>b.diff-a.diff)

    setData(comparison)
    setLoading(false)
  }

  const alerts=data.filter(d=>d.isAlert)
  const warnings=data.filter(d=>d.isWarning)
  const ok=data.filter(d=>!d.isAlert&&!d.isWarning)

  return <div>
    {/* Summary */}
    {data.length>0&&<div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:8}}>
      <div style={{...S.met,background:'#FFEBEE',border:'1px solid #C00000'}}>
        <div style={{fontSize:10,color:'#C00000',fontWeight:600}}>🚨 Alert ({">"}10% {"&"} {">"}50pcs)</div>
        <div style={{fontSize:24,fontWeight:700,color:'#C00000'}}>{alerts.length}</div>
      </div>
      <div style={{...S.met,background:'#FFF3E0',border:'1px solid #FF9800'}}>
        <div style={{fontSize:10,color:'#E65100',fontWeight:600}}>⚠️ Warning ({">"}5%)</div>
        <div style={{fontSize:24,fontWeight:700,color:'#E65100'}}>{warnings.length}</div>
      </div>
      <div style={{...S.met,background:'#E8F5E9',border:'1px solid #276221'}}>
        <div style={{fontSize:10,color:'#276221',fontWeight:600}}>✅ OK (≤5pcs)</div>
        <div style={{fontSize:24,fontWeight:700,color:'#276221'}}>{ok.length}</div>
      </div>
    </div>}

    <button style={S.sb} onClick={load} disabled={loading}>
      {loading?'Loading...':'🔍 Cross-Check Rejection Data'}
    </button>

    {data.length>0&&<div style={S.card}>
      <div style={{fontWeight:700,marginBottom:4}}>🔍 Operator vs QC Rejection</div>
      <div style={{fontSize:11,color:'#854F0B',background:'#FFF9E6',borderRadius:6,padding:'6px 10px',marginBottom:10}}>
        ⚠️ Note: Product naam alag hone se mismatch dikhta hai — same date + machine dekho
      </div>

      {/* Plant wise summary */}
      {(()=>{
        const plantSummary:{[k:string]:{opRej:number,qcRej:number}}={}
        data.forEach((r:any)=>{
          const p=r.plant||r.machine?.split('-')[0]||'Unknown'
          if(!plantSummary[p]) plantSummary[p]={opRej:0,qcRej:0}
          plantSummary[p].opRej+=r.operatorRej||0
          plantSummary[p].qcRej+=r.qcRej||0
        })
        return <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
          {Object.entries(plantSummary).map(([plant,s],i)=>(
            <div key={i} style={{background:'#F0F4FF',borderRadius:8,padding:10,border:'1px solid #1F3864'}}>
              <div style={{fontWeight:700,color:'#1F3864',fontSize:12,marginBottom:6}}>{plant}</div>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                <span style={{fontSize:11,color:'#854F0B'}}>Operator dala:</span>
                <span style={{fontWeight:700,color:'#854F0B'}}>{(s.opRej as number).toLocaleString()}</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                <span style={{fontSize:11,color:'#1F3864'}}>QC ne daala:</span>
                <span style={{fontWeight:700,color:'#1F3864'}}>{(s.qcRej as number).toLocaleString()}</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',paddingTop:4,borderTop:'1px solid #ddd'}}>
                <span style={{fontSize:11,color:'#666'}}>Difference:</span>
                <span style={{fontWeight:700,color:Math.abs((s.opRej as number)-(s.qcRej as number))>200?'#C00000':'#276221'}}>
                  {((s.qcRej as number)-(s.opRej as number)).toLocaleString()} pcs
                </span>
              </div>
            </div>
          ))}
        </div>
      })()}

      {/* Detail table — only show where BOTH have data */}
      <div style={{fontWeight:600,color:'#1F3864',fontSize:11,marginBottom:6}}>Detail — sirf woh records jahan dono ne entry ki:</div>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
          <thead><tr>
            {['Date','Machine','Operator Rej','QC Rej','Diff','Status'].map(h=>(
              <th key={h} style={{background:'#1F3864',color:'#fff',padding:'5px 8px',textAlign:'left'}}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {data.filter((r:any)=>r.operatorRej>0&&r.qcRej>0).map((r:any,i:number)=>{
              const diff=r.qcRej-r.operatorRej
              const pct=r.operatorRej>0?Math.round(Math.abs(diff)/r.operatorRej*100):0
              const isHigh=Math.abs(diff)>50&&pct>10
              return <tr key={i} style={{background:isHigh?'#FFEBEE':i%2===0?'#FAFAFA':'#fff'}}>
                <td style={{padding:'5px 8px',fontWeight:600}}>{r.date}</td>
                <td style={{padding:'5px 8px'}}>{r.machine}</td>
                <td style={{padding:'5px 8px',color:'#854F0B',fontWeight:700}}>{r.operatorRej.toLocaleString()}</td>
                <td style={{padding:'5px 8px',color:'#1F3864',fontWeight:700}}>{r.qcRej.toLocaleString()}</td>
                <td style={{padding:'5px 8px',fontWeight:700,color:isHigh?'#C00000':'#276221'}}>{diff>0?'+':''}{diff.toLocaleString()}</td>
                <td style={{padding:'5px 8px'}}>
                  <span style={{background:isHigh?'#C00000':'#276221',color:'#fff',padding:'2px 8px',borderRadius:999,fontSize:9,fontWeight:600}}>
                    {isHigh?'⚠️ CHECK':'✅ OK'}
                  </span>
                </td>
              </tr>
            })}
            {data.filter((r:any)=>r.operatorRej>0&&r.qcRej>0).length===0&&
              <tr><td colSpan={6} style={{textAlign:'center',color:'#888',padding:16,fontSize:11}}>
                Koi matching record nahi — product names alag hain operator aur QC mein
              </td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>}
  </div>
}


// ─── Production Status Report ─────────────────────────────────
function ProductionStatusReport({date,plant}:{date:string,plant:string}) {
  const [data,setData]=useState<any>(null)
  const [loading,setLoading]=useState(false)
  const [selectedPlant,setSelectedPlant]=useState(plant||'Plant 477')
  const [selectedDate,setSelectedDate]=useState(date||nd())
  const [selectedShift,setSelectedShift]=useState('day')

  const DAY_SLOTS=['8am-11am','11am-2pm','2pm-5pm','5pm-8pm']
  const NIGHT_SLOTS=['8pm-11pm','11pm-2am','2am-5am','5am-8am']

  const load=async()=>{
    setLoading(true)
    const res=await fetch(`/api/production?date=${selectedDate}&plant=${encodeURIComponent(selectedPlant)}`).then(r=>r.json())
    setData(res.data||[])
    setLoading(false)
  }

  useEffect(()=>{load()},[selectedPlant,selectedDate,selectedShift])

  const slots=selectedShift==='day'?DAY_SLOTS:NIGHT_SLOTS
  const shiftLabel=selectedShift==='day'?'Day (8am-8pm)':'Night (8pm-8am)'
  const machines=MACH[selectedPlant]||[]

  // Build slot matrix
  const getEntry=(machine:string,slot:string)=>{
    const entries=(data||[]).filter(e=>
      e.machine===machine&&
      e.shift?.toLowerCase().includes(selectedShift==='day'?'day':'night')&&
      (e.production_slots||[]).some((s:any)=>s.slot_name===slot)
    )
    if(entries.length===0) return null
    const slotData=entries[0].production_slots?.find((s:any)=>s.slot_name===slot)
    return {good:slotData?.good_parts||0,rej:slotData?.rejection||0,product:entries[0].product,enteredBy:entries[0].entered_by}
  }

  const getMachineTotal=(machine:string)=>{
    const entries=(data||[]).filter(e=>
      e.machine===machine&&
      e.shift?.toLowerCase().includes(selectedShift==='day'?'day':'night')
    )
    return entries.reduce((a:number,e:any)=>a+(e.good_parts||0),0)
  }

  const getMachinePendingSlots=(machine:string)=>{
    return slots.filter(slot=>!getEntry(machine,slot))
  }

  const totalGood=(data||[]).filter(e=>e.shift?.toLowerCase().includes(selectedShift==='day'?'day':'night')).reduce((a:number,e:any)=>a+(e.good_parts||0),0)
  const pendingMachines=machines.filter(m=>getMachinePendingSlots(m).length===slots.length)
  const partialMachines=machines.filter(m=>{const p=getMachinePendingSlots(m);return p.length>0&&p.length<slots.length})
  const doneMachines=machines.filter(m=>getMachinePendingSlots(m).length===0)

  return <div>
    {/* Filters */}
    <div style={S.card}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
        <div style={S.f}><label style={S.lbl}>Date</label>
          <input type="date" style={S.fi} value={selectedDate} onChange={e=>{setSelectedDate(e.target.value)}}/>
        </div>
        <div style={S.f}><label style={S.lbl}>Plant</label>
          <select style={S.fi} value={selectedPlant} onChange={e=>setSelectedPlant(e.target.value)}>
            <option>Plant 477</option><option>Plant 488</option><option>Plant 433</option>
          </select>
        </div>
        <div style={S.f}><label style={S.lbl}>Shift</label>
          <select style={S.fi} value={selectedShift} onChange={e=>setSelectedShift(e.target.value)}>
            <option value="day">☀️ Day (8am-8pm)</option>
            <option value="night">🌙 Night (8pm-8am)</option>
          </select>
        </div>
      </div>
      <button style={{...S.sb,marginTop:8}} onClick={load} disabled={loading}>
        {loading?'Loading...':'🔄 Refresh'}
      </button>
    </div>

    {/* Summary Cards */}
    {data&&<div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:8,marginBottom:8}}>
      <div style={{...S.met,background:'#E8F5E9',border:'1px solid #276221'}}>
        <div style={{fontSize:10,color:'#276221',fontWeight:600}}>✅ All Slots Done</div>
        <div style={{fontSize:24,fontWeight:700,color:'#276221'}}>{doneMachines.length}</div>
        <div style={{fontSize:10,color:'#666'}}>{doneMachines.join(', ')||'--'}</div>
      </div>
      <div style={{...S.met,background:'#FFF3E0',border:'1px solid #FF9800'}}>
        <div style={{fontSize:10,color:'#E65100',fontWeight:600}}>⏳ Partial Entry</div>
        <div style={{fontSize:24,fontWeight:700,color:'#E65100'}}>{partialMachines.length}</div>
        <div style={{fontSize:10,color:'#666'}}>{partialMachines.join(', ')||'--'}</div>
      </div>
      <div style={{...S.met,background:'#FFEBEE',border:'1px solid #C00000'}}>
        <div style={{fontSize:10,color:'#C00000',fontWeight:600}}>❌ No Entry</div>
        <div style={{fontSize:24,fontWeight:700,color:'#C00000'}}>{pendingMachines.length}</div>
        <div style={{fontSize:10,color:'#666'}}>{pendingMachines.join(', ')||'--'}</div>
      </div>
      <div style={{...S.met,background:'#E6F1FB',border:'1px solid #1F3864'}}>
        <div style={{fontSize:10,color:'#1F3864',fontWeight:600}}>🏭 Total Good</div>
        <div style={{fontSize:20,fontWeight:700,color:'#1F3864'}}>{totalGood.toLocaleString()}</div>
      </div>
    </div>}

    {/* Slot Matrix Table */}
    {data&&<div style={S.card}>
      <div style={{fontWeight:700,color:'#1F3864',marginBottom:10}}>
        📊 {selectedPlant} — {selectedShift==='day'?'☀️ Day':'🌙 Night'} Shift — {selectedDate}
      </div>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
          <thead><tr>
            <th style={{background:'#1F3864',color:'#fff',padding:'8px 10px',textAlign:'left',minWidth:140}}>Machine</th>
            {slots.map(s=><th key={s} style={{background:'#1F3864',color:'#fff',padding:'8px 6px',textAlign:'center',minWidth:90}}>{s}</th>)}
            <th style={{background:'#1F3864',color:'#fff',padding:'8px 6px',textAlign:'center'}}>Total Good</th>
            <th style={{background:'#276221',color:'#fff',padding:'8px 6px',textAlign:'center'}}>Efficiency</th>
            <th style={{background:'#1F3864',color:'#fff',padding:'8px 6px',textAlign:'center'}}>Status</th>
          </tr></thead>
          <tbody>{machines.map((machine:string,mi:number)=>{
            const pendingSlots=getMachinePendingSlots(machine)
            const total=getMachineTotal(machine)
            const allDone=pendingSlots.length===0
            const noDone=pendingSlots.length===slots.length
            const rowBg=allDone?'#F0FFF4':noDone?'#FFF5F5':'#FFFFF0'
            return <tr key={mi} style={{background:rowBg}}>
              <td style={{padding:'8px 10px',fontWeight:700,color:'#1F3864',borderBottom:'1px solid #E0E0E0'}}>{machine}</td>
              {slots.map(slot=>{
                const entry=getEntry(machine,slot)
                return <td key={slot} style={{padding:'6px 4px',textAlign:'center',borderBottom:'1px solid #E0E0E0',borderLeft:'1px solid #F0F0F0'}}>
                  {entry
                    ? <div>
                        <div style={{color:'#276221',fontWeight:700,fontSize:12}}>{entry.good.toLocaleString()}</div>
                        {entry.rej>0&&<div style={{color:'#C00000',fontSize:10}}>Rej: {entry.rej}</div>}
                        <div style={{color:'#666',fontSize:9,marginTop:2}}>{entry.product?.split(' ').slice(0,2).join(' ')}</div>
                      </div>
                    : <div style={{color:'#C00000',fontSize:18}}>⏳</div>
                  }
                </td>
              })}
              <td style={{padding:'8px 6px',textAlign:'center',fontWeight:700,color:'#1F3864',fontSize:13,borderBottom:'1px solid #E0E0E0'}}>
                {total>0?total.toLocaleString():'--'}
              </td>
              <td style={{padding:'6px',textAlign:'center',borderBottom:'1px solid #E0E0E0'}}>
                {(()=>{
                  // Calculate machine efficiency
                  const machEntries=(data||[]).filter(e=>
                    e.machine===machine&&e.shift?.toLowerCase().includes(selectedShift==='day'?'day':'night')
                  )
                  const totalGoodM=machEntries.reduce((a:number,e:any)=>a+(e.good_parts||0),0)
                  const totalRejM=machEntries.reduce((a:number,e:any)=>a+(e.rejection||0),0)
                  const cavities=machEntries[0]?.cavities||0
                  const ct=machEntries[0]?.cycle_time||0
                  const doneSlots=slots.length-pendingSlots.length
                  const projPerSlot=cavities>0&&ct>0?Math.floor((180*60)/ct)*cavities:0
                  const totalProj=projPerSlot*doneSlots
                  const eff=totalProj>0?Math.round(totalGoodM/totalProj*100):0
                  const effCol=eff>=90?'#276221':eff>=75?'#854F0B':'#C00000'
                  return <div style={{fontSize:eff>0?13:11,fontWeight:700,color:eff>0?effCol:'#ccc'}}>
                    {eff>0?eff+'%':'--'}
                  </div>
                })()}
              </td>
              <td style={{padding:'6px',textAlign:'center',borderBottom:'1px solid #E0E0E0'}}>
                {allDone
                  ? <span style={{background:'#276221',color:'#fff',padding:'3px 8px',borderRadius:999,fontSize:10,fontWeight:600}}>✅ Done</span>
                  : noDone
                    ? <span style={{background:'#C00000',color:'#fff',padding:'3px 8px',borderRadius:999,fontSize:10,fontWeight:600}}>❌ Pending</span>
                    : <span style={{background:'#FF9800',color:'#fff',padding:'3px 8px',borderRadius:999,fontSize:10,fontWeight:600}}>⏳ {slots.length-pendingSlots.length}/{slots.length}</span>
                }
              </td>
            </tr>
          })}</tbody>
          {/* Total Row */}
          <tfoot><tr style={{background:'#1F3864'}}>
            <td style={{padding:'8px 10px',color:'#FFD966',fontWeight:700}}>TOTAL</td>
            {slots.map(slot=>{
              const slotTotal=(data||[]).filter(e=>
                e.shift?.toLowerCase().includes(selectedShift==='day'?'day':'night')&&
                (e.production_slots||[]).some((s:any)=>s.slot_name===slot)
              ).reduce((a:number,e:any)=>{
                const sd=e.production_slots?.find((s:any)=>s.slot_name===slot)
                return a+(sd?.good_parts||0)
              },0)
              return <td key={slot} style={{padding:'8px 4px',textAlign:'center',color:'#4CAF50',fontWeight:700}}>
                {slotTotal>0?slotTotal.toLocaleString():'--'}
              </td>
            })}
            <td style={{padding:'8px 6px',textAlign:'center',color:'#FFD966',fontWeight:700,fontSize:14}}>{totalGood.toLocaleString()}</td>
            <td style={{padding:'8px 6px',textAlign:'center',color:'#90A8C8',fontSize:11}}>
              {doneMachines.length}/{machines.length} Done
            </td>
          </tr></tfoot>
        </table>
      </div>

      {/* Pending Alert */}
      {(pendingMachines.length>0||partialMachines.length>0)&&<div style={{marginTop:10,background:'#FFF3E0',border:'1px solid #FF9800',borderRadius:8,padding:'10px 14px'}}>
        <div style={{fontWeight:700,color:'#E65100',marginBottom:6}}>⚠️ Entry Pending:</div>
        {pendingMachines.length>0&&<div style={{fontSize:11,marginBottom:4}}>
          <span style={{color:'#C00000',fontWeight:600}}>❌ No Entry: </span>
          {pendingMachines.join(' | ')}
        </div>}
        {partialMachines.map(m=>{
          const pending=getMachinePendingSlots(m)
          return <div key={m} style={{fontSize:11,marginBottom:2}}>
            <span style={{color:'#E65100',fontWeight:600}}>⏳ {m}: </span>
            {pending.join(', ')} pending
          </div>
        })}
      </div>}
    </div>}

    {!data&&!loading&&<div style={{...S.card,textAlign:'center',color:'#666',padding:32}}>
      Refresh click karo — data load hoga! 👆
    </div>}
  </div>
}

function WeeklyReport() {
  const [wData,setWData]=useState(null)
  const [loading,setLoading]=useState(false)
  const [fromDate,setFromDate]=useState('')
  const [toDate,setToDate]=useState('')

  useEffect(()=>{
    const today=new Date()
    const weekAgo=new Date(today.getTime()-6*24*60*60*1000)
    const fmt=d=>d.toISOString().split('T')[0]
    setToDate(fmt(today))
    setFromDate(fmt(weekAgo))
  },[])

  const setQuick=(days)=>{
    const t=new Date()
    const f=new Date(t.getTime()-days*24*60*60*1000)
    setToDate(t.toISOString().split('T')[0])
    setFromDate(f.toISOString().split('T')[0])
  }

  const fmtDate=d=>{
    if(!d) return '--'
    const parts=d.split('-')
    const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    return parts[2]+' '+months[parseInt(parts[1])-1]
  }

  const load=async()=>{
    if(!fromDate||!toDate) return
    setLoading(true)
    try {
      const [prodRes,qualRes,bdRes,mcRes] = await Promise.all([
        fetch('/api/production?from='+fromDate+'&to='+toDate).then(r=>r.json()).catch(()=>({data:[]})),
        fetch('/api/quality?report=1&from='+fromDate+'&to='+toDate).then(r=>r.json()).catch(()=>({data:[]})),
        fetch('/api/breakdown?from='+fromDate+'&to='+toDate).then(r=>r.json()).catch(()=>({data:[]})),
        fetch('/api/mouldchange?from='+fromDate+'&to='+toDate).then(r=>r.json()).catch(()=>({data:[]})),
      ])

      const prod=prodRes.data||[]
      const qual=qualRes.data||[]
      const bd=bdRes.data||[]
      const mc=mcRes.data||[]

      // Production — plant wise + day wise
      const totalGood=prod.reduce((s,r)=>s+(r.good_parts||0),0)
      const totalRej=prod.reduce((s,r)=>s+(r.rejection||0),0)
      const rejPct=totalGood+totalRej>0?((totalRej/(totalGood+totalRej))*100).toFixed(1):0

      // Plant wise
      const plantWise={}
      prod.forEach(r=>{
        const p=r.plant||'Unknown'
        if(!plantWise[p]) plantWise[p]={good:0,rej:0}
        plantWise[p].good+=(r.good_parts||0)
        plantWise[p].rej+=(r.rejection||0)
      })

      // Day wise with plant breakdown
      const dayWise={}
      prod.forEach(r=>{
        if(!dayWise[r.date]) dayWise[r.date]={total_good:0,total_rej:0,plants:{}}
        dayWise[r.date].total_good+=(r.good_parts||0)
        dayWise[r.date].total_rej+=(r.rejection||0)
        const p=r.plant||'Unknown'
        if(!dayWise[r.date].plants[p]) dayWise[r.date].plants[p]={good:0,rej:0}
        dayWise[r.date].plants[p].good+=(r.good_parts||0)
        dayWise[r.date].plants[p].rej+=(r.rejection||0)
      })

      // Quality
      const totalQC=qual.length
      const ngQC=qual.filter(r=>r.overall_result==='NG').length
      const ngPct=totalQC>0?Math.round(ngQC/totalQC*100):0
      const machNG={}
      qual.filter(r=>r.overall_result==='NG').forEach(r=>{
        const k=r.machine||'Unknown'
        if(!machNG[k]) machNG[k]={count:0,product:r.part_name||'',mould:r.mould_name||''}
        machNG[k].count++
      })
      const topNG=Object.entries(machNG).sort((a,b)=>(b[1] as any).count-(a[1] as any).count).slice(0,5)

      // Breakdown
      const bdTotal=bd.length
      const bdPending=bd.filter(r=>r.status==='Pending'||r.status==='In Progress').length
      const bdResolved=bd.filter(r=>r.status?.includes('Resolved')).length
      const totalDowntime=bd.reduce((s,r)=>s+(r.downtime_min||0),0)
      const machBD={}
      bd.forEach(r=>{
        const k=r.machine||'Unknown'
        if(!machBD[k]) machBD[k]={count:0,downtime:0}
        machBD[k].count++
        machBD[k].downtime+=(r.downtime_min||0)
      })
      const topBD=Object.entries(machBD).sort((a,b)=>(b[1] as any).downtime-(a[1] as any).downtime).slice(0,5)

      // Mould change
      const mcTotal=mc.length
      const mcWithTime=mc.filter(r=>r.total_minutes>0)
      const mcAvgTime=mcWithTime.length>0?Math.round(mcWithTime.reduce((s,r)=>s+(r.total_minutes||0),0)/mcWithTime.length):0

      setWData({totalGood,totalRej,rejPct,plantWise,dayWise,totalQC,ngQC,ngPct,topNG,bdTotal,bdPending,bdResolved,totalDowntime,mcTotal,mcAvgTime,topBD,prod,qual,bd,mc})
    } catch(e){console.error(e)}
    setLoading(false)
  }

  const downloadCSV=()=>{
    if(!wData) return
    const rows=[
      ['Weekly Report','From: '+fromDate,'To: '+toDate],
      [''],
      ['=== PRODUCTION ==='],
      ['Total Good',wData.totalGood,'Total Rejection',wData.totalRej,'Rej%',wData.rejPct+'%'],
      [''],
      ['Date','Plant 477 Good','Plant 477 Rej','Plant 488 Good','Plant 488 Rej','Total Good','Total Rej','Rej%'],
      ...Object.entries(wData.dayWise).sort((a,b)=>a[0].localeCompare(b[0])).map(([dt,s])=>{
        const sv=s as any
        const p477=sv.plants['Plant 477']||{good:0,rej:0}
        const p488=sv.plants['Plant 488']||{good:0,rej:0}
        const rp=sv.total_good+sv.total_rej>0?((sv.total_rej/(sv.total_good+sv.total_rej))*100).toFixed(1):0
        return [dt,p477.good,p477.rej,p488.good,p488.rej,sv.total_good,sv.total_rej,rp+'%']
      }),
      [''],
      ['=== QUALITY ==='],
      ['Total Checks',wData.totalQC,'NG',wData.ngQC,'NG%',wData.ngPct+'%'],
      [''],
      ['=== BREAKDOWNS ==='],
      ['Total',wData.bdTotal,'Resolved',wData.bdResolved,'Pending',wData.bdPending,'Total Downtime(min)',wData.totalDowntime],
      [''],
      ['=== MOULD CHANGES ==='],
      ['Total',wData.mcTotal,'Avg Time(min)',wData.mcAvgTime],
    ]
    const csv=rows.map(r=>r.join(',')).join('\n')
    const blob=new Blob([csv],{type:'text/csv'})
    const url=URL.createObjectURL(blob)
    const a=document.createElement('a')
    a.href=url
    a.download='weekly_'+fromDate+'_to_'+toDate+'.csv'
    a.click()
  }

  return (
    <div>
      {/* Header + Date Range */}
      <div style={S.card}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
          <div style={{fontWeight:700,color:'#1F3864',fontSize:14}}>Weekly Consolidated Report</div>
          {wData&&<button onClick={downloadCSV} style={{background:'#276221',color:'#fff',border:'none',borderRadius:6,padding:'5px 12px',fontSize:11,fontWeight:700,cursor:'pointer'}}>Download CSV</button>}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr auto',gap:8,alignItems:'end',marginBottom:10}}>
          <div style={S.f}><label style={S.lbl}>From</label><input type="date" style={S.fi} value={fromDate} onChange={e=>setFromDate(e.target.value)}/></div>
          <div style={S.f}><label style={S.lbl}>To</label><input type="date" style={S.fi} value={toDate} onChange={e=>setToDate(e.target.value)}/></div>
          <button onClick={load} style={{...S.sb,margin:0,padding:'8px 20px'}}>Load</button>
        </div>
        <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
          {[{l:'Last 7 Days',d:6},{l:'Last 15 Days',d:14},{l:'Last 30 Days',d:29}].map(p=>(
            <button key={p.l} onClick={()=>setQuick(p.d)} style={{padding:'4px 12px',borderRadius:999,border:'1px solid #1F3864',background:'#E8EDF5',color:'#1F3864',fontSize:11,cursor:'pointer',fontWeight:600}}>{p.l}</button>
          ))}
        </div>
      </div>

      {loading&&<div style={{textAlign:'center',padding:32,color:'#666'}}>Loading...</div>}

      {wData&&!loading&&<div>
        {/* Date range banner */}
        <div style={{background:'#1F3864',color:'#fff',borderRadius:8,padding:'8px 14px',marginBottom:8,fontSize:12,fontWeight:600}}>
          {fmtDate(fromDate)} – {fmtDate(toDate)} &nbsp;|&nbsp; {Object.keys(wData.dayWise).length} days
        </div>

        {/* Summary Cards */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:8}}>
          {[
            {label:'Production',val:(wData.totalGood/1000).toFixed(1)+'K',sub:'Rej: '+wData.rejPct+'%',bg:'#E8F5E9',color:'#276221'},
            {label:'Quality NG',val:wData.ngPct+'%',sub:wData.totalQC+' checks | '+wData.ngQC+' NG',bg:wData.ngPct>10?'#FFEBEE':'#FFF9E6',color:wData.ngPct>10?'#C00000':'#854F0B'},
            {label:'Breakdowns',val:String(wData.bdTotal),sub:Math.round(wData.totalDowntime/60)+'h '+wData.totalDowntime%60+'m down',bg:'#FFEBEE',color:'#C00000'},
            {label:'Mould Changes',val:String(wData.mcTotal),sub:'Avg '+wData.mcAvgTime+' min',bg:'#F3E5F5',color:'#7B1FA2'},
          ].map((k,i)=>(
            <div key={i} style={{background:k.bg,borderRadius:10,padding:12,textAlign:'center'}}>
              <div style={{fontSize:11,color:k.color,marginBottom:4}}>{k.label}</div>
              <div style={{fontSize:22,fontWeight:700,color:k.color}}>{k.val}</div>
              <div style={{fontSize:10,color:k.color,marginTop:2,opacity:0.8}}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* Day wise production — Plant wise */}
        <div style={{...S.card,marginBottom:8}}>
          <div style={{fontWeight:700,color:'#1F3864',fontSize:12,marginBottom:10}}>Production — Day wise (Plant wise)</div>
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:11,tableLayout:'fixed'}}>
              <thead><tr>
                <th style={{background:'#1F3864',color:'#fff',padding:'6px 8px',textAlign:'left',width:70}}>Date</th>
                <th style={{background:'#276221',color:'#fff',padding:'6px 8px',textAlign:'right'}}>P-477 Good</th>
                <th style={{background:'#276221',color:'#fff',padding:'6px 8px',textAlign:'right'}}>P-477 Rej</th>
                <th style={{background:'#1F5E8C',color:'#fff',padding:'6px 8px',textAlign:'right'}}>P-488 Good</th>
                <th style={{background:'#1F5E8C',color:'#fff',padding:'6px 8px',textAlign:'right'}}>P-488 Rej</th>
                <th style={{background:'#444',color:'#fff',padding:'6px 8px',textAlign:'right'}}>Total</th>
                <th style={{background:'#C00000',color:'#fff',padding:'6px 8px',textAlign:'right'}}>Rej%</th>
              </tr></thead>
              <tbody>
                {Object.entries(wData.dayWise).sort((a,b)=>a[0].localeCompare(b[0])).map(([dt,s],i)=>{
                  const sv=s as any
                  const p477=sv.plants['Plant 477']||{good:0,rej:0}
                  const p488=sv.plants['Plant 488']||{good:0,rej:0}
                  const rp=sv.total_good+sv.total_rej>0?((sv.total_rej/(sv.total_good+sv.total_rej))*100).toFixed(1):0
                  const isHigh=Number(rp)>3
                  return <tr key={i} style={{background:isHigh?'#FFF5F5':i%2===0?'#FAFAFA':'#fff'}}>
                    <td style={{padding:'5px 8px',fontWeight:600}}>{fmtDate(dt)}</td>
                    <td style={{padding:'5px 8px',textAlign:'right',color:'#276221'}}>{p477.good.toLocaleString()}</td>
                    <td style={{padding:'5px 8px',textAlign:'right',color:'#C00000'}}>{p477.rej.toLocaleString()}</td>
                    <td style={{padding:'5px 8px',textAlign:'right',color:'#1F5E8C'}}>{p488.good.toLocaleString()}</td>
                    <td style={{padding:'5px 8px',textAlign:'right',color:'#C00000'}}>{p488.rej.toLocaleString()}</td>
                    <td style={{padding:'5px 8px',textAlign:'right',fontWeight:600}}>{sv.total_good.toLocaleString()}</td>
                    <td style={{padding:'5px 8px',textAlign:'right',fontWeight:700,color:isHigh?'#C00000':'#276221'}}>{rp}%</td>
                  </tr>
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Two column — Quality + Breakdown */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
          <div style={S.card}>
            <div style={{fontWeight:700,color:'#C00000',fontSize:12,marginBottom:8}}>Top NG Machines (Quality)</div>
            {wData.topNG.length===0
              ?<div style={{color:'#888',fontSize:11}}>Koi NG nahi</div>
              :wData.topNG.map((m,i)=>{
                const mv=m[1] as any
                return <div key={i} style={{padding:'5px 0',borderBottom:'0.5px solid #F5F5F5'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div>
                      <div style={{fontSize:12,fontWeight:600}}>{m[0]}</div>
                      <div style={{fontSize:10,color:'#666'}}>{mv.product}{mv.mould?' · '+mv.mould:''}</div>
                    </div>
                    <span style={{background:'#FFEBEE',color:'#C00000',padding:'2px 8px',borderRadius:999,fontSize:11,fontWeight:700}}>{mv.count} NG</span>
                  </div>
                </div>
              })
            }
          </div>
          <div style={S.card}>
            <div style={{fontWeight:700,color:'#854F0B',fontSize:12,marginBottom:8}}>Top Breakdown Machines</div>
            {wData.topBD.length===0
              ?<div style={{color:'#888',fontSize:11}}>Koi breakdown nahi</div>
              :wData.topBD.map((m,i)=>{
                const mv=m[1] as any
                return <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'5px 0',borderBottom:'0.5px solid #F5F5F5'}}>
                  <div>
                    <div style={{fontSize:12,fontWeight:600}}>{m[0]}</div>
                    <div style={{fontSize:10,color:'#666'}}>{mv.downtime} min downtime</div>
                  </div>
                  <span style={{background:'#FFEBEE',color:'#C00000',padding:'2px 8px',borderRadius:999,fontSize:11,fontWeight:700}}>{mv.count} BD</span>
                </div>
              })
            }
          </div>
        </div>

        {/* Rejection Comparison */}
        <div style={{...S.card,marginBottom:8}}>
          <div style={{fontWeight:700,color:'#1F3864',fontSize:12,marginBottom:10}}>Rejection — Operator vs QC (Plant wise)</div>
          <RejectionComparison from={fromDate} to={toDate} plant=""/>
        </div>

        {/* Quality + Production Correlation — sirf issues dikhao */}
        {(()=>{
          const qMap:{[k:string]:{total:number,ng:number,product:string,machine:string,mould:string,lastDate:string}}={}
          wData.qual.forEach(q=>{
            const k=(q.machine||'')+'|'+(q.part_name||'')
            if(!qMap[k]) qMap[k]={total:0,ng:0,product:q.part_name||'',machine:q.machine||'',mould:q.mould_name||'',lastDate:q.date||''}
            qMap[k].total++
            if(q.overall_result==='NG'){qMap[k].ng++;qMap[k].lastDate=q.date||qMap[k].lastDate}
          })
          const pMap:{[k:string]:{rej:number,good:number}}={}
          wData.prod.forEach(p=>{
            const k=(p.machine||'')+'|'+(p.product||'')
            if(!pMap[k]) pMap[k]={rej:0,good:0}
            pMap[k].rej+=(p.rejection||0)
            pMap[k].good+=(p.good_parts||0)
          })
          const issues=Object.entries(qMap).map(([k,q])=>{
            const p=pMap[k]||{rej:0,good:0}
            const qcNGPct=q.total>0?Math.round(q.ng/q.total*100):0
            const prodRejPct=p.good+p.rej>0?Math.round(p.rej/(p.good+p.rej)*100):0
            return {machine:q.machine,product:q.product,mould:q.mould,date:q.lastDate||'',qcTotal:q.total,qcNG:q.ng,qcNGPct,prodRej:p.rej,prodRejPct}
          }).filter(r=>r.qcNGPct>0||r.prodRejPct>3).sort((a,b)=>b.qcNGPct-a.qcNGPct)

          if(issues.length===0) return null
          return <div style={{...S.card,marginBottom:8,border:'2px solid #C00000'}}>
            <div style={{fontWeight:700,color:'#C00000',fontSize:12,marginBottom:10}}>Issues needing attention ({issues.length})</div>
            {issues.map((r,i)=>(
              <div key={i} style={{background:i%2===0?'#FFF5F5':'#fff',borderRadius:6,padding:'8px 10px',marginBottom:4,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
                <div>
                  <div style={{fontSize:12,fontWeight:700,color:'#1F3864'}}>{r.machine}</div>
                  <div style={{fontSize:11,color:'#666'}}>{r.product} {r.mould?'· '+r.mould:''}</div>
                {r.date&&<div style={{fontSize:10,color:'#888'}}>{fmtDate(r.date)}</div>}
                </div>
                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  {r.qcNGPct>0&&<div style={{textAlign:'center'}}>
                    <div style={{fontSize:16,fontWeight:700,color:r.qcNGPct>20?'#C00000':'#854F0B'}}>{r.qcNGPct}%</div>
                    <div style={{fontSize:9,color:'#666'}}>QC NG</div>
                  </div>}
                  {r.prodRejPct>0&&<div style={{textAlign:'center'}}>
                    <div style={{fontSize:16,fontWeight:700,color:r.prodRejPct>5?'#C00000':'#854F0B'}}>{r.prodRejPct}%</div>
                    <div style={{fontSize:9,color:'#666'}}>Prod Rej</div>
                  </div>}
                  <span style={{background:r.qcNGPct>20||r.prodRejPct>5?'#C00000':'#FF9800',color:'#fff',padding:'3px 10px',borderRadius:999,fontSize:10,fontWeight:700}}>
                    {r.qcNGPct>20||r.prodRejPct>5?'HIGH':'WATCH'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        })()}

      </div>}

      {!wData&&!loading&&<div style={{...S.card,textAlign:'center',color:'#888',padding:40}}>
        <div style={{fontSize:32,marginBottom:8}}>📅</div>
        <div style={{fontSize:13,fontWeight:600,color:'#444',marginBottom:4}}>Date range select karo</div>
        <div style={{fontSize:11}}>Ya quick buttons use karo</div>
      </div>}
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
    {id:'weekly',label:'📅 Weekly'},
    {id:'production',label:'Production'},
    {id:'quality',label:'Quality'},
    {id:'mould',label:'Mould'},
    {id:'comparison',label:'📊 Comparison'},
    {id:'pivot',label:'📋 Pivot'},
    {id:'alerts',label:'📧 Alerts'},
  ]

  return <div>
    {/* Section tabs */}
    <div style={{display:'flex',gap:6,marginBottom:8,overflowX:'auto'}}>
      {SECTIONS.map(s=><button key={s.id} style={activeSection===s.id?S.nbA:S.nb} onClick={()=>setActiveSection(s.id)}>{s.label}</button>)}
    </div>

    {/* WEEKLY SECTION */}
    {activeSection==='weekly'&&<WeeklyReport/>}

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

    {/* ALERTS SECTION */}
    {activeSection==='alerts'&&<MISAlertsSection/>}
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

  const [prevItems,setPrevItems]=useState<any[]>([])
  const [showComparison,setShowComparison]=useState(false)
  const [showTrend,setShowTrend]=useState(false)
  const [trendData,setTrendData]=useState<any>(null)
  const [trendDays,setTrendDays]=useState(15)
  const [trendLoading,setTrendLoading]=useState(false)

  const loadTrend=async(days:number)=>{
    setTrendLoading(true)
    const res=await fetch(`/api/ims-trend?days=${days}`).then(r=>r.json())
    setTrendData(res)
    setTrendLoading(false)
  }

  const loadStock=(date:string, clearVals=false)=>{
    setLoading(true)
    fetch(`/api/ims?date=${date}`).then(r=>r.json()).then(d=>{
      setItems(d.items||[])
      const init:Record<string,any>={}
      // If date changed or clearVals — start fresh (empty fields)
      if(clearVals){
        d.items?.forEach((it:any)=>{init[it.name]={pk:'',uc:'',ul:''}})
      } else {
        d.items?.forEach((it:any)=>{init[it.name]={pk:it.stockC||'',uc:it.unpackC||'',ul:it.unpackL||''}})
      }
      setVals(init);setLoading(false)
    })
  }

  // Load previous day for comparison
  const loadComparison=async(currentDate:string)=>{
    const prev=new Date(currentDate)
    prev.setDate(prev.getDate()-1)
    const prevDate=prev.toISOString().slice(0,10)
    const res=await fetch(`/api/ims?date=${prevDate}`).then(r=>r.json())
    setPrevItems(res.items||[])
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
          <button onClick={()=>{setShowComparison(!showComparison);if(!showComparison)loadComparison(viewDate)}}
            style={{padding:'4px 10px',border:'1px solid #1F3864',borderRadius:6,fontSize:11,fontWeight:600,background:showComparison?'#1F3864':'#fff',color:showComparison?'#fff':'#1F3864',cursor:'pointer'}}>
            {showComparison?'✕ Comparison':'📊 Kal vs Aaj'}
          </button>
          <button onClick={()=>{setShowTrend(!showTrend);if(!showTrend)loadTrend(trendDays)}}
            style={{padding:'4px 10px',border:'1px solid #276221',borderRadius:6,fontSize:11,fontWeight:600,background:showTrend?'#276221':'#fff',color:showTrend?'#fff':'#276221',cursor:'pointer'}}>
            {showTrend?'✕ Trend':'📈 15-Day Trend'}
          </button>
          <button onClick={async()=>{
            // Download Excel
            const res=await fetch('/api/ims-trend?days=31').then(r=>r.json())
            if(!res.success) return
            // Generate CSV for now
            const nl='\n';let csv='Item,Category,'+res.dates.join(',')+nl
            res.trendData.forEach((item:any)=>{
              csv+=`"${item.name}",${item.category},`
              csv+=item.trend.map(t=>t.stock??'').join(',')
              csv+=nl
            })
            const blob=new Blob([csv],{type:'text/csv'})
            const url=URL.createObjectURL(blob)
            const a=document.createElement('a')
            a.href=url
            a.download=`IMS_Stock_Register_${new Date().toISOString().slice(0,7)}.csv`
            a.click()
            URL.revokeObjectURL(url)
          }} style={{padding:'4px 10px',border:'1px solid #854F0B',borderRadius:6,fontSize:11,fontWeight:600,background:'#FFF9E6',color:'#854F0B',cursor:'pointer'}}>
            📥 Download
          </button>
          <span style={{fontSize:11,color:'#666'}}>Date:</span>
          <input type="date" value={viewDate} onChange={e=>{
            setViewDate(e.target.value)
            const isToday=e.target.value===nd()
            loadStock(e.target.value, isToday)
            loadComparison(e.target.value)
          }} style={{padding:'4px 8px',border:'1px solid #1F3864',borderRadius:6,fontSize:12,fontWeight:600,color:'#1F3864'}}/>
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

function QCAlertBanner({user}:{user:User}) {
  const [alerts,setAlerts]=useState([])
  const [resolveId,setResolveId]=useState(null)
  const [resolution,setResolution]=useState('')
  const [saving,setSaving]=useState(false)

  const load=()=>{
    const plant=user?.modules?.includes('Plant 488')?'Plant 488':user?.modules?.includes('Plant 477')?'Plant 477':''
    fetch('/api/qcalerts?status=Pending'+(plant?'&plant='+plant:'')).then(r=>r.json()).then(d=>setAlerts(d.data||[])).catch(()=>{})
  }

  useEffect(()=>{ load() },[])

  if(alerts.length===0) return null

  return <div style={{marginBottom:8}}>
    {alerts.map((a:any)=><div key={a.id} style={{background:'#FFEBEE',border:'2px solid #C00000',borderRadius:10,padding:12,marginBottom:6}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
        <div>
          <div style={{fontWeight:700,color:'#C00000',fontSize:13}}>QC Alert — Action Required!</div>
          <div style={{fontSize:11,color:'#1F3864',fontWeight:600,marginTop:2}}>{a.machine} | {a.date} {a.check_time}</div>
          <div style={{fontSize:11,color:'#854F0B',marginTop:1}}>{a.product} {a.mould_name?'· '+a.mould_name:''}</div>
        </div>
        <span style={{background:'#C00000',color:'#fff',fontSize:9,padding:'2px 8px',borderRadius:999,fontWeight:700}}>PENDING</span>
      </div>
      <div style={{background:'#fff',borderRadius:6,padding:'6px 10px',marginBottom:8,fontSize:11}}>
        <div style={{fontWeight:600,color:'#C00000',marginBottom:3}}>Issues:</div>
        <div style={{color:'#333'}}>{a.issues}</div>
        {a.weight_actual&&a.weight_standard&&<div style={{color:'#C00000',marginTop:3}}>Weight: {a.weight_actual}g (std: {a.weight_standard}g)</div>}
        {a.remarks&&<div style={{color:'#666',marginTop:3,fontStyle:'italic'}}>QC remarks: {a.remarks}</div>}
      </div>
      {resolveId===a.id
        ?<div>
          <textarea style={{...S.fi,height:60,resize:'none' as const,marginBottom:6}} value={resolution} onChange={e=>setResolution(e.target.value)} placeholder="Kya kiya — e.g. cavity 13 polish done, speed adjust ki, mould clean kiya..."/>
          <div style={{display:'flex',gap:6}}>
            <button disabled={saving||!resolution} onClick={async()=>{
              setSaving(true)
              await fetch('/api/qcalerts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'resolve',id:a.id,resolution,resolvedBy:user.name})}).then(r=>r.json())
              setSaving(false)
              setResolveId(null)
              setResolution('')
              load()
            }} style={{flex:1,background:'#276221',color:'#fff',border:'none',borderRadius:6,padding:'8px',fontSize:12,fontWeight:700,cursor:'pointer',opacity:!resolution?0.5:1}}>
              {saving?'Saving...':'Mark as Resolved'}
            </button>
            <button onClick={()=>{setResolveId(null);setResolution('')}} style={{background:'#f0f0f0',border:'none',borderRadius:6,padding:'8px 14px',cursor:'pointer',fontSize:12}}>Cancel</button>
          </div>
        </div>
        :<button onClick={()=>setResolveId(a.id)} style={{width:'100%',background:'#1F3864',color:'#fff',border:'none',borderRadius:6,padding:'8px',fontSize:12,fontWeight:700,cursor:'pointer'}}>
          Action Karo + Resolve Karo
        </button>
      }
    </div>)}
  </div>
}

function ProductionTab({user}:{user:User}) {
  const [items,setItems]=useState<any[]>([])
  const [loading,setLoading]=useState(true)
  const [saving,setSaving]=useState(false)
  const [toast,setToast]=useState<{msg:string,ok:boolean}|null>(null)
  const [existingEntries,setExistingEntries]=useState<{slot:string}[]>([])
  const [todayEntries,setTodayEntries]=useState<any[]>([])

  useEffect(()=>{
    fetch(`/api/production?date=${nd()}`).then(r=>r.json()).then(d=>{
      setTodayEntries(d.data||[])
    })
  },[])
  const [machForm,setMachForm]=useState({
    date:nd(),shift:'day',plant:'',machine:'',
    machineStatus:'running',stopReason:''
  })
  const [products,setProducts]=useState([{
    id:1,product:'',mould:'',cavities:'',cycleTime:'',
    operator:'',operator2:'',material:'',
    slots:DAY_SLOTS.map(s=>({slot:s,good:'',rejection:'',rejWeight:'',down:'',remarks:''}))
  }])

  useEffect(()=>{
    fetch('/api/ims').then(r=>r.json()).then(d=>{setItems(d.items||[]);setLoading(false)})
  },[])

  const loadExistingEntries=async(date:string,machine:string)=>{
    if(!date||!machine) return
    const res=await fetch(`/api/production?date=${date}&machine=${encodeURIComponent(machine)}`).then(r=>r.json())
    const slots=((res.data||[]) as any[]).flatMap(r=>
      (r.production_slots||[]).map((s:any)=>({slot:s.slot_name||s.slot}))
    )
    setExistingEntries(slots)
  }

  const updateSlots=(shift:string)=>{
    const slotNames=shift==='night'?NIGHT_SLOTS:DAY_SLOTS
    setProducts(prev=>prev.map(p=>({...p,slots:slotNames.map(s=>({slot:s,good:'',rejection:'',rejWeight:'',down:'',remarks:''}))})))
  }

  const addProduct=()=>{
    const slotNames=machForm.shift==='night'?NIGHT_SLOTS:DAY_SLOTS
    setProducts(prev=>[...prev,{
      id:Date.now(),product:'',mould:'',cavities:'',cycleTime:'',
      operator:'',operator2:'',material:'',
      slots:slotNames.map(s=>({slot:s,good:'',rejection:'',rejWeight:'',down:'',remarks:''}))
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
    setSaving(true)
    let savedCount=0
    const errors:string[]=[]

    for(const prod of products){
      if(!prod.product) continue
      const res=await fetch('/api/production',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          date:machForm.date,
          shift:machForm.shift==='night'?'Night (8pm-8am)':'Day (8am-8pm)',
          plant:machForm.plant,machine:machForm.machine,
          operator:prod.operator,operator2:prod.operator2,
          product:prod.product,mould:prod.mould,
          cavities:prod.cavities||'0',cycleTime:prod.cycleTime||'0',
          material:prod.material,machineStatus:machForm.machineStatus,
          stopReason:machForm.stopReason||'',remarks:'',
          slots:isRunning?prod.slots:prod.slots.map(s=>({...s,good:'0',rejection:'0',rejWeight:'0',down:'180',remarks:machForm.machineStatus+' - '+machForm.stopReason})),
          enteredBy:user.name
        })
      }).then(r=>r.json())
      if(res.success) savedCount++
      else errors.push(res.msg)
    }
    setSaving(false)
    if(savedCount>0){
      setToast({msg:`${savedCount} product entries saved!`,ok:true})
      loadExistingEntries(machForm.date,machForm.machine)
    } else setToast({msg:errors[0]||'Error!',ok:false})
  }

  if(loading) return <div style={{textAlign:'center',padding:32,color:'#666'}}>Loading...</div>

  return <div>
    <QCAlertBanner user={user}/>
    {/* Today's entries summary */}
    {todayEntries.length>0&&<div style={{...S.card,border:'1px solid #276221',background:'#F0FFF4',marginBottom:8}}>
      <div style={{fontWeight:700,color:'#276221',marginBottom:8}}>📋 Aaj Ki Entries ({nd()})</div>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
          <thead><tr>
            {['Machine','Shift','Product','Slots Done','Good','Rej'].map(h=>
              <th key={h} style={{background:'#276221',color:'#fff',padding:'5px 8px',textAlign:'left'}}>{h}</th>)}
          </tr></thead>
          <tbody>{todayEntries.map((e:any,i:number)=>(
            <tr key={i} style={{background:i%2===0?'#F8FFF8':'#fff'}}>
              <td style={{padding:'5px 8px',fontWeight:600,color:'#1F3864'}}>{e.machine}</td>
              <td style={{padding:'5px 8px',fontSize:10}}>{e.shift?.includes('Day')?'☀️ Day':'🌙 Night'}</td>
              <td style={{padding:'5px 8px',fontSize:10}}>{e.product}</td>
              <td style={{padding:'5px 8px'}}>
                {(e.production_slots||[]).map((s:any,si:number)=>(
                  <span key={si} style={{background:'#276221',color:'#fff',borderRadius:4,padding:'1px 6px',fontSize:9,marginRight:3}}>
                    {s.slot_name?.split('(')[0]||s.slot_name}
                  </span>
                ))}
              </td>
              <td style={{padding:'5px 8px',color:'#276221',fontWeight:700}}>{(e.good_parts||0).toLocaleString()}</td>
              <td style={{padding:'5px 8px',color:'#C00000'}}>{e.rejection||0}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>}

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
          <select style={S.fi} value={machForm.machine} onChange={e=>{
            setMachForm(p=>({...p,machine:e.target.value}))
            loadExistingEntries(machForm.date,e.target.value)
          }}>
            <option value="">Select</option>{machines.map(m=><option key={m}>{m}</option>)}
          </select>
        </div>
      </div>
      {existingEntries.length>0&&<div style={{background:'#E8F5E9',border:'1px solid #276221',borderRadius:6,padding:'6px 10px',fontSize:11,color:'#276221',fontWeight:600}}>
        ✅ Already entered today: {todayEntries.filter(e=>e.machine===machForm.machine).flatMap(e=>(e.production_slots||[]).map((s:any)=>s.slot_name?.split('(')[0]||s.slot_name)).filter((v:string,i:number,a:string[])=>a.indexOf(v)===i).join(', ')}
      </div>}
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

        <div style={S.fr}>
          <div style={S.f}><label style={S.lbl}>Product</label>
            <select style={S.fi} value={prod.product} onChange={e=>updateProduct(prod.id,'product',e.target.value)}>
              <option value="">Select</option>{items.map(i=><option key={i.name}>{i.name}</option>)}
            </select>
          </div>
          <div style={S.f}><label style={S.lbl}>Mould No.</label>
            <select style={{...S.fi,background:prod.mould?'#E2EFDA':'#FAFAFA'}} value={prod.mould} onChange={e=>updateProduct(prod.id,'mould',e.target.value)}>
              <option value="">-- Select Mould --</option>
              <optgroup label="── Tub/Container Moulds ──">
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

        {isRunning&&<div style={{background:'#F8F9FF',border:'1px solid #E0E8FF',borderRadius:8,padding:10,marginTop:8}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
            <div style={{fontWeight:700,fontSize:12,color:'#1F3864'}}>Slot-wise Production</div>
            <div style={{display:'flex',gap:4,flexWrap:'wrap' as const}}>
              {prod.slots.map((_:any,si:number)=>{
                const slotName=(machForm.shift==='night'?NIGHT_SLOTS:DAY_SLOTS)[si]
                const isDone=machForm.machine?todayEntries.some(e=>
                  e.machine===machForm.machine&&
                  (e.production_slots||[]).some((s:any)=>s.slot_name===slotName)
                ):false
                return <button key={si} onClick={()=>document.getElementById(`slot-${prod.id}-${si}`)?.scrollIntoView({behavior:'smooth',block:'center'})}
                  style={{padding:'3px 8px',fontSize:10,fontWeight:600,border:`1px solid ${isDone?'#276221':'#1F3864'}`,borderRadius:999,background:isDone?'#276221':'#1F3864',color:'#fff',cursor:'pointer'}}>
                  {slotName?.split('(')[0]||`S${si+1}`}{isDone?' ✅':''}
                </button>
              })}
            </div>
          </div>

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
            // Freeze if same machine + same slot already saved
            const isDone=machForm.machine?todayEntries.some(e=>
              e.machine===machForm.machine&&
              (e.production_slots||[]).some((s:any)=>s.slot_name===slot.slot)
            ):false
            
            // Find existing data for this slot
            const existingSlotData=todayEntries
              .filter(e=>e.machine===machForm.machine&&e.product===prod.product)
              .flatMap(e=>e.production_slots||[])
              .find((s:any)=>s.slot_name===slot.slot)

            return <div key={si} id={`slot-${prod.id}-${si}`} style={{
              background:isDone?'#E8F5E9':'#fff',
              border:`2px solid ${isDone?'#276221':'#E0E8FF'}`,
              borderRadius:6,padding:'8px 10px',marginBottom:6,
              opacity:isDone?0.85:1
            }}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>
                <span style={{fontWeight:700,fontSize:11,color:isDone?'#276221':'#1F3864'}}>{slot.slot}</span>
                {isDone
                  ? <span style={{background:'#276221',color:'#fff',padding:'2px 10px',borderRadius:999,fontSize:10,fontWeight:600}}>✅ Done</span>
                  : <span style={{background:'#1F3864',color:'#FFD966',padding:'2px 8px',borderRadius:999,fontSize:9}}>Proj: {slotProj>0?slotProj.toLocaleString():'--'}</span>
                }
              </div>

              {isDone&&existingSlotData
                ? <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6,background:'#F0FFF4',borderRadius:6,padding:'6px 8px'}}>
                    <div style={{textAlign:'center'}}>
                      <div style={{fontSize:9,color:'#666'}}>Good Parts</div>
                      <div style={{fontSize:14,fontWeight:700,color:'#276221'}}>{(existingSlotData.good_parts||0).toLocaleString()}</div>
                    </div>
                    <div style={{textAlign:'center'}}>
                      <div style={{fontSize:9,color:'#666'}}>Rejection</div>
                      <div style={{fontSize:14,fontWeight:700,color:'#C00000'}}>{existingSlotData.rejection||0}</div>
                    </div>
                    <div style={{textAlign:'center'}}>
                      <div style={{fontSize:9,color:'#666'}}>Downtime</div>
                      <div style={{fontSize:14,fontWeight:700,color:'#854F0B'}}>{existingSlotData.downtime||0}m</div>
                    </div>
                  </div>
                : isDone
                  ? <div style={{background:'#E8F5E9',borderRadius:6,padding:'6px 8px',fontSize:11,color:'#276221',textAlign:'center'}}>✅ Entry saved — frozen!</div>
                  : <div>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:5}}>
                        <div><div style={{fontSize:9,color:'#666',textAlign:'center'}}>Good Parts</div>
                          <input type="number" min="0" value={slot.good} onChange={e=>updateSlot(prod.id,si,'good',e.target.value)} style={{width:'100%',padding:'5px 3px',border:'1px solid #276221',borderRadius:6,textAlign:'center',fontSize:12,fontWeight:600}}/>
                        </div>
                        <div><div style={{fontSize:9,color:'#666',textAlign:'center'}}>Rejection</div>
                          <input type="number" min="0" value={slot.rejection} onChange={e=>updateSlot(prod.id,si,'rejection',e.target.value)} style={{width:'100%',padding:'5px 3px',border:'1px solid #C00000',borderRadius:6,textAlign:'center',fontSize:12}}/>
                          <input type="number" min="0" step="0.01" value={slot.rejWeight||''} onChange={e=>updateSlot(prod.id,si,'rejWeight',e.target.value)} style={{width:'100%',padding:'3px',border:'1px solid #FF9800',borderRadius:6,textAlign:'center',fontSize:10,marginTop:2}} placeholder="kg"/>
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
              }
            </div>
          })}
        </div>}
      </div>
    })}

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
  const [form,setForm]=useState({date:nd(),shift:'Day',plant:'',machine:'',product:'',rejectionQty:'',rejectionWeight:'',reason:'Short Shot',action:'Rework',notes:''})
  const [weights,setWeights]=useState([])
  useEffect(()=>{
    fetch('/api/weights').then(r=>r.json()).then(d=>setWeights(d.data||[])).catch(()=>{})
  },[])
  const getWeight=(product,qty)=>{
    if(!product||!qty) return ''
    const w=weights.find(w=>product.toLowerCase().includes(w.item_name.toLowerCase().replace(' container','').replace(' lid','').trim())||w.item_name.toLowerCase().includes(product.toLowerCase().split(' ').slice(0,3).join(' ')))
    if(!w) return ''
    const isLid=product.toLowerCase().includes('lid')
    const gramsPerPc=isLid?w.lid_weight_g:w.container_weight_g
    if(!gramsPerPc) return ''
    return (gramsPerPc*parseFloat(qty)/1000).toFixed(2)
  }
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
      <div style={S.f}><label style={S.lbl}>Product</label><select style={S.fi} value={form.product} onChange={e=>{const prod=e.target.value;const autoWt=getWeight(prod,form.rejectionQty);setForm(p=>({...p,product:prod,rejectionWeight:autoWt||p.rejectionWeight}))}}>
        <option value="">Select</option>{items.map(i=><option key={i.name}>{i.name}</option>)}
      </select></div>
      <div style={S.f}><label style={S.lbl}>Rejection Qty (pcs)</label>
        <input type="number" style={S.fi} value={form.rejectionQty} onChange={e=>{
          const qty=e.target.value
          const autoWt=getWeight(form.product,qty)
          setForm(p=>({...p,rejectionQty:qty,rejectionWeight:autoWt||p.rejectionWeight}))
        }} placeholder="e.g. 250"/>
      </div>
      <div style={S.f}><label style={S.lbl}>Rejection Weight (kg) <span style={{fontSize:10,color:'#276221'}}>{form.rejectionWeight&&form.rejectionQty?'(auto calculated)':''}</span></label>
        <input type="number" step="0.01" style={S.fi} value={form.rejectionWeight} onChange={e=>setForm(p=>({...p,rejectionWeight:e.target.value}))} placeholder="e.g. 2.5"/>
      </div>
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
  const [form,setForm]=useState({date:nd(),shift:'Day',plant:'',machine:'',oldMould:'',newMould:'',operator:'',helper:'',remarks:'',estimatedTime:''})
  const [saving,setSaving]=useState(false)
  const [toast,setToast]=useState<{msg:string,ok:boolean}|null>(null)
  const [history,setHistory]=useState<any[]>([])
  const [pendingEntries,setPendingEntries]=useState<any[]>([]) // All machines in progress
  const [activeEntry,setActiveEntry]=useState<any>(null) // Currently working on
  const [elapsed,setElapsed]=useState<Record<string,number>>({}) // per entry id
  const [showNewForm,setShowNewForm]=useState(false)
  const [benchmark,setBenchmark]=useState<any>(null)

  const machines=MACH[form.plant]||[]

  const loadBenchmark=async(oldMould:string,newMould:string)=>{
    if(!oldMould||!newMould) return
    const res=await fetch(`/api/mouldchange?benchmark=1&oldMould=${encodeURIComponent(oldMould)}&newMould=${encodeURIComponent(newMould)}`).then(r=>r.json())
    setBenchmark(res.benchmark||null)
  }

  const loadData=async()=>{
    const [histRes,pendRes]=await Promise.all([
      fetch(`/api/mouldchange?date=${nd()}`).then(r=>r.json()),
      fetch('/api/mouldchange?pending=1').then(r=>r.json())
    ])
    setHistory(histRes.data||[])
    setPendingEntries(pendRes.data||[])
  }

  useEffect(()=>{loadData()},[])

  // Auto refresh every 30 seconds - so all users see updates
  useEffect(()=>{
    const iv=setInterval(loadData, 30000)
    return ()=>clearInterval(iv)
  },[])

  // Timer tick for all pending entries
  useEffect(()=>{
    if(pendingEntries.length===0) return
    const iv=setInterval(()=>{
      const now=Date.now()
      const newElapsed:Record<string,number>={}
      pendingEntries.forEach((pe:any)=>{
        if(pe.start_time&&!pe.run_time){
          newElapsed[pe.id]=Math.floor((now-new Date(pe.start_time).getTime())/1000)
        }
      })
      setElapsed(newElapsed)
    },1000)
    return ()=>clearInterval(iv)
  },[pendingEntries])

  const fmt=(ts:string|null)=>ts?new Date(ts).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit'}):''
  const diffMin=(a:string,b:string)=>Math.round(Math.abs(new Date(b).getTime()-new Date(a).getTime())/60000)
  const fmtElapsed=(s:number)=>`${Math.floor(s/60)}m ${s%60}s`

  const startTimer=async()=>{
    if(!form.plant||!form.machine||!form.oldMould||!form.newMould){
      setToast({msg:'Pehle Plant, Machine, Old aur New Mould select karo!',ok:false});return
    }
    // Check if this machine already has pending
    const alreadyPending=pendingEntries.find((pe:any)=>pe.machine===form.machine && pe.plant===form.plant)
    if(alreadyPending){
      setToast({msg:`${form.plant} - ${form.machine} ka mould change already chal raha hai!`,ok:false});return
    }
    setSaving(true)
    const res=await fetch('/api/mouldchange',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({type:'start',...form,estimatedTime:parseFloat(form.estimatedTime)||0,enteredBy:user.name})
    }).then(r=>r.json())
    setSaving(false)
    if(res.success){
      setShowNewForm(false)
      setToast({msg:'Timer started!',ok:true})
      await loadData()
    } else setToast({msg:res.msg,ok:false})
  }

  const updateStep=async(step:string,entryId:string)=>{
    setSaving(true)
    const res=await fetch('/api/mouldchange',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({type:'update_step',id:entryId,step,remarks:form.remarks,enteredBy:user.name})
    }).then(r=>r.json())
    setSaving(false)
    setToast({msg:res.msg,ok:res.success})
    if(res.success) await loadData()
  }

  const stepStyle=(done:boolean,active:boolean)=>({
    padding:'10px 14px',borderRadius:8,marginBottom:6,
    border:`2px solid ${done?'#276221':active?'#1F3864':'#E0E0E0'}`,
    background:done?'#E8F5E9':active?'#E6F1FB':'#F5F5F5'
  })

  return <div>
    {/* Summary */}
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:8}}>
      <div style={S.met}><div style={{fontSize:10,color:'#666'}}>Total Changes</div><div style={{fontSize:20,fontWeight:700,color:'#1F3864'}}>{history.filter((h:any)=>h.status==='complete').length}</div></div>
      <div style={S.met}><div style={{fontSize:10,color:'#666'}}>Avg Time</div><div style={{fontSize:20,fontWeight:700,color:'#854F0B'}}>{history.filter((h:any)=>h.total_minutes>0).length>0?Math.round(history.filter((h:any)=>h.total_minutes>0).reduce((a:number,h:any)=>a+(h.total_minutes||0),0)/history.filter((h:any)=>h.total_minutes>0).length):0}m</div></div>
      <div style={{...S.met,background:pendingEntries.length>0?'#FFF3E0':'#fff',border:pendingEntries.length>0?'2px solid #FF9800':'1px solid #E0E0E0'}}>
        <div style={{fontSize:10,color:pendingEntries.length>0?'#E65100':'#666'}}>🔄 In Progress</div>
        <div style={{fontSize:20,fontWeight:700,color:pendingEntries.length>0?'#E65100':'#276221'}}>{pendingEntries.length}</div>
      </div>
    </div>

    {/* ALL PENDING ENTRIES — visible to all users */}
    {pendingEntries.length>0&&<div style={S.card}>
      <div style={{fontWeight:700,color:'#E65100',marginBottom:10,fontSize:13}}>🔄 Mould Change In Progress — {pendingEntries.length} Machine(s)</div>
      {pendingEntries.map((pe:any,pi:number)=>{
        const isActive=activeEntry?.id===pe.id
        const myEntry=pe.entered_by===user.name
        const el=elapsed[pe.id]||0
        const elMin=Math.floor(el/60)
        const elCol=elMin<=30?'#276221':elMin<=45?'#854F0B':'#C00000'

        return <div key={pi} style={{border:`2px solid ${isActive?'#1F3864':'#FF9800'}`,borderRadius:8,padding:'10px 12px',marginBottom:8,background:isActive?'#E6F1FB':'#FFF9E6'}}>
          {/* Header */}
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
            <div>
              <div style={{fontWeight:700,fontSize:13,color:'#1F3864'}}>{pe.machine}</div>
              <div style={{fontSize:11,color:'#666'}}>{pe.old_mould?.split(' - ')[0]} → <strong>{pe.new_mould?.split(' - ')[0]}</strong></div>
              <div style={{fontSize:11,color:'#666'}}>{pe.plant} | Started by: {pe.entered_by}</div>
              {pe.estimated_time>0&&<div style={{fontSize:11,color:'#854F0B',fontWeight:600}}>Target: {pe.estimated_time} min</div>}
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:18,fontWeight:700,color:elCol}}>⏱️ {fmtElapsed(el)}</div>
              {!isActive&&<button onClick={()=>setActiveEntry(pe)} style={{background:'#1F3864',color:'#fff',border:'none',borderRadius:6,padding:'5px 12px',fontSize:11,cursor:'pointer',marginTop:4}}>
                {myEntry?'Continue ▶':'View Steps'}
              </button>}
              {isActive&&<button onClick={()=>setActiveEntry(null)} style={{background:'#666',color:'#fff',border:'none',borderRadius:6,padding:'5px 12px',fontSize:11,cursor:'pointer',marginTop:4}}>Close ✕</button>}
            </div>
          </div>

          {/* Steps Progress Bar */}
          <div style={{display:'flex',gap:4,marginBottom:isActive?10:0}}>
            {[
              {label:'Start',done:!!pe.start_time},
              {label:'Spray',done:!!pe.spray_time||pe.spray_done===false},
              {label:'Load',done:!!pe.load_time},
              {label:'Run',done:!!pe.run_time},
            ].map((step,si)=><div key={si} style={{flex:1,textAlign:'center'}}>
              <div style={{height:6,borderRadius:3,background:step.done?'#276221':'#E0E0E0',marginBottom:3}}/>
              <div style={{fontSize:9,color:step.done?'#276221':'#999',fontWeight:step.done?700:400}}>{step.label}</div>
            </div>)}
          </div>

          {/* Step Controls — only when active */}
          {isActive&&<div>
            <div style={stepStyle(true,false)}>
              <div style={{display:'flex',justifyContent:'space-between'}}>
                <div><div style={{fontWeight:600,fontSize:11}}>Step 1 — Start</div><div style={{fontSize:10,color:'#276221'}}>🕐 {fmt(pe.start_time)}</div></div>
                <span style={{background:'#276221',color:'#fff',padding:'2px 10px',borderRadius:999,fontSize:10}}>✅</span>
              </div>
            </div>

            <div style={stepStyle(!!pe.spray_time||pe.spray_done===false,!pe.spray_time&&pe.spray_done!==false)}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div><div style={{fontWeight:600,fontSize:11}}>Step 2 — Spray</div>
                  {pe.spray_time?<div style={{fontSize:10,color:'#276221'}}>🕐 {fmt(pe.spray_time)} (+{diffMin(pe.start_time,pe.spray_time)}m)</div>:<div style={{fontSize:10,color:'#666'}}>Spray karo</div>}
                </div>
                {!pe.spray_time&&pe.spray_done!==false
                  ? <div style={{display:'flex',gap:4}}>
                      <button onClick={()=>updateStep('spray',pe.id)} style={{background:'#276221',color:'#fff',border:'none',borderRadius:6,padding:'6px 12px',fontSize:11,fontWeight:700,cursor:'pointer'}}>✅ Spray</button>
                      <button onClick={()=>updateStep('spray_skip',pe.id)} style={{background:'#C00000',color:'#fff',border:'none',borderRadius:6,padding:'6px 8px',fontSize:11,cursor:'pointer'}}>❌ Skip</button>
                    </div>
                  : <span style={{background:'#276221',color:'#fff',padding:'2px 10px',borderRadius:999,fontSize:10}}>✅</span>}
              </div>
            </div>

            <div style={stepStyle(!!pe.load_time,(pe.spray_time||pe.spray_done===false)&&!pe.load_time)}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div><div style={{fontWeight:600,fontSize:11}}>Step 3 — Mould Load</div>
                  {pe.load_time?<div style={{fontSize:10,color:'#276221'}}>🕐 {fmt(pe.load_time)} (+{diffMin(pe.start_time,pe.load_time)}m)</div>:<div style={{fontSize:10,color:'#666'}}>Mould daalo</div>}
                </div>
                {!pe.load_time
                  ? <button onClick={()=>updateStep('load',pe.id)} disabled={!pe.spray_time&&pe.spray_done!==false} style={{background:(pe.spray_time||pe.spray_done===false)?'#854F0B':'#ccc',color:'#fff',border:'none',borderRadius:6,padding:'6px 12px',fontSize:11,fontWeight:700,cursor:(pe.spray_time||pe.spray_done===false)?'pointer':'not-allowed'}}>✅ Loaded</button>
                  : <span style={{background:'#276221',color:'#fff',padding:'2px 10px',borderRadius:999,fontSize:10}}>✅</span>}
              </div>
            </div>

            <div style={stepStyle(!!pe.run_time,!!pe.load_time&&!pe.run_time)}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div><div style={{fontWeight:600,fontSize:11}}>Step 4 — Machine Running</div>
                  {pe.run_time?<div style={{fontSize:10,color:'#276221'}}>🕐 {fmt(pe.run_time)} — Total: {pe.total_minutes}m</div>:<div style={{fontSize:10,color:'#666'}}>Machine chalu hone par</div>}
                </div>
                {!pe.run_time
                  ? <button onClick={()=>updateStep('run',pe.id)} disabled={!pe.load_time} style={{background:pe.load_time?'#276221':'#ccc',color:'#fff',border:'none',borderRadius:6,padding:'6px 12px',fontSize:11,fontWeight:700,cursor:pe.load_time?'pointer':'not-allowed'}}>🏃 Running!</button>
                  : <span style={{background:'#276221',color:'#fff',padding:'2px 10px',borderRadius:999,fontSize:10}}>✅</span>}
              </div>
            </div>
          </div>}

          {/* Complete */}
          {pe.run_time&&<div style={{background:'#E8F5E9',borderRadius:6,padding:'8px 10px',fontSize:11}}>
            <div style={{fontWeight:700,color:'#276221',marginBottom:4}}>✅ Complete! {pe.total_minutes}m</div>
            {pe.benchmark_best>0&&pe.total_minutes>0&&<div style={{fontSize:12,fontWeight:700,color:pe.total_minutes<pe.benchmark_best?'#276221':pe.total_minutes===pe.benchmark_best?'#854F0B':'#C00000'}}>
              {pe.total_minutes<pe.benchmark_best?`🏆 New Record! Pehle ${pe.benchmark_best}m tha!`:pe.total_minutes===pe.benchmark_best?`🟠 Same as best (${pe.benchmark_best}m)`:`🔴 ${pe.total_minutes-pe.benchmark_best}m slow — Best: ${pe.benchmark_best}m`}
            </div>}
            {!pe.benchmark_best&&<div style={{fontSize:11,color:'#276221'}}>🆕 Pehli baar! Yeh ab benchmark banega!</div>}
          </div>}
        </div>
      })}
    </div>}

    {/* New Mould Change Button */}
    {!showNewForm&&<button onClick={()=>setShowNewForm(true)} style={{...S.sb,background:'#1F3864',marginBottom:8}}>
      + New Mould Change Entry
    </button>}

    {/* New Form */}
    {showNewForm&&<div style={S.card}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
        <div style={{fontWeight:700,color:'#1F3864'}}>🔄 New Mould Change</div>
        <button onClick={()=>setShowNewForm(false)} style={{background:'none',border:'none',fontSize:18,cursor:'pointer',color:'#666'}}>✕</button>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
        <div style={S.f}><label style={S.lbl}>Date</label><input type="date" style={S.fi} value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))}/></div>
        <div style={S.f}><label style={S.lbl}>Shift</label>
          <select style={S.fi} value={form.shift} onChange={e=>setForm(p=>({...p,shift:e.target.value}))}>
            <option>Day</option><option>Night</option>
          </select>
        </div>
        <div style={S.f}><label style={S.lbl}>Plant</label>
          <select style={S.fi} value={form.plant} onChange={e=>setForm(p=>({...p,plant:e.target.value,machine:''}))}>
            <option value="">Select</option><option>Plant 477</option><option>Plant 488</option><option>Plant 433</option>
          </select>
        </div>
        <div style={S.f}><label style={S.lbl}>Machine</label>
          <select style={S.fi} value={form.machine} onChange={e=>setForm(p=>({...p,machine:e.target.value}))}>
            <option value="">Select</option>{machines.map(m=>{
              const busy=pendingEntries.find((pe:any)=>pe.machine===m&&!pe.run_time)
              return <option key={m} value={m} disabled={!!busy}>{m}{busy?' (In Progress)':''}</option>
            })}
          </select>
        </div>
        <div style={S.f}><label style={S.lbl}>Old Mould</label>
          <select style={S.fi} value={form.oldMould} onChange={e=>{
            setForm(p=>({...p,oldMould:e.target.value}))
            loadBenchmark(e.target.value,form.newMould)
          }}>
            <option value="">Select</option>{MOULDS.map(m=><option key={m.code} value={m.code+' - '+m.name}>{m.code} - {m.name}</option>)}
          </select>
        </div>
        <div style={S.f}><label style={S.lbl}>New Mould</label>
          <select style={S.fi} value={form.newMould} onChange={e=>{
            setForm(p=>({...p,newMould:e.target.value}))
            loadBenchmark(form.oldMould,e.target.value)
          }}>
            <option value="">Select</option>{MOULDS.map(m=><option key={m.code} value={m.code+' - '+m.name}>{m.code} - {m.name}</option>)}
          </select>
        </div>
        <div style={S.f}><label style={S.lbl}>Operator</label>
          <select style={S.fi} value={form.operator} onChange={e=>setForm(p=>({...p,operator:e.target.value}))}>
            <option value="">Select</option>{OPS.map(o=><option key={o}>{o}</option>)}
          </select>
        </div>
        <div style={S.f}><label style={S.lbl}>Helper</label>
          <select style={S.fi} value={form.helper} onChange={e=>setForm(p=>({...p,helper:e.target.value}))}>
            <option value="">None</option>{OPS.map(o=><option key={o}>{o}</option>)}
          </select>
        </div>
      </div>
      <div style={S.f}><label style={S.lbl}>Estimated Time (min)</label>
        <input type="number" style={S.fi} value={form.estimatedTime||''} onChange={e=>setForm(p=>({...p,estimatedTime:e.target.value}))} placeholder="e.g. 30"/>
      </div>
      {/* Benchmark Info */}
      {benchmark&&<div style={{background:'#E6F1FB',border:'1px solid #1F3864',borderRadius:8,padding:'10px 12px',marginTop:8}}>
        <div style={{fontWeight:700,color:'#1F3864',marginBottom:6,fontSize:12}}>📊 Is Mould Change Ka History</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6,fontSize:11}}>
          <div style={{textAlign:'center'}}>
            <div style={{color:'#666',fontSize:10}}>Best Time</div>
            <div style={{fontWeight:700,color:'#276221',fontSize:16}}>{benchmark.best}m</div>
            <div style={{fontSize:9,color:'#666'}}>{benchmark.bestBy}</div>
          </div>
          <div style={{textAlign:'center'}}>
            <div style={{color:'#666',fontSize:10}}>Avg Time</div>
            <div style={{fontWeight:700,color:'#854F0B',fontSize:16}}>{benchmark.avg}m</div>
            <div style={{fontSize:9,color:'#666'}}>{benchmark.count} baar hua</div>
          </div>
          <div style={{textAlign:'center'}}>
            <div style={{color:'#666',fontSize:10}}>Last Time</div>
            <div style={{fontWeight:700,color:'#1F3864',fontSize:16}}>{benchmark.last}m</div>
            <div style={{fontSize:9,color:'#666'}}>{benchmark.lastBy}</div>
          </div>
        </div>
        <div style={{marginTop:8,background:'#1F3864',color:'#FFD966',borderRadius:6,padding:'6px 10px',fontSize:11,fontWeight:600,textAlign:'center'}}>
          🎯 Target: {benchmark.best}m se kam karo! Beat karo record!
        </div>
      </div>}
      {benchmark===null&&form.oldMould&&form.newMould&&<div style={{background:'#F5F5F5',borderRadius:6,padding:'8px 10px',fontSize:11,color:'#666',marginTop:8,textAlign:'center'}}>
        🆕 Pehli baar yeh mould change ho raha hai — record set karo!
      </div>}

      <button style={{...S.sb,background:'#1F3864',marginTop:8}} onClick={startTimer} disabled={saving}>
        {saving?'Starting...':'▶ Start Timer'}
      </button>
      {toast&&<Toast {...toast}/>}
    </div>}

    {/* History */}
    {history.filter((h:any)=>h.status==='complete').length>0&&<div style={S.card}>
      <div style={{fontWeight:700,marginBottom:8,color:'#1F3864'}}>📋 Aaj Ki Completed Changes</div>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
          <thead><tr>
            {['Machine','Old','New','Start','Spray','Load','Run','Total','Spray?','By'].map(h=>
              <th key={h} style={{background:'#1F3864',color:'#fff',padding:'6px 8px',textAlign:'left',whiteSpace:'nowrap' as const}}>{h}</th>)}
          </tr></thead>
          <tbody>{history.filter((h:any)=>h.status==='complete').map((h:any,i:number)=><tr key={i} style={{background:i%2===0?'#F8F9FF':'#fff'}}>
            <td style={{padding:'6px 8px',fontWeight:600}}>{h.machine}</td>
            <td style={{padding:'6px 8px',fontSize:10,color:'#666'}}>{h.old_mould?.split(' - ')[0]}</td>
            <td style={{padding:'6px 8px',fontSize:10,color:'#1F3864',fontWeight:600}}>{h.new_mould?.split(' - ')[0]}</td>
            <td style={{padding:'6px 8px',fontSize:10}}>{fmt(h.start_time)}</td>
            <td style={{padding:'6px 8px',fontSize:10}}>{h.spray_time?fmt(h.spray_time):'-'}</td>
            <td style={{padding:'6px 8px',fontSize:10}}>{h.load_time?fmt(h.load_time):'-'}</td>
            <td style={{padding:'6px 8px',fontSize:10}}>{h.run_time?fmt(h.run_time):'-'}</td>
            <td style={{padding:'6px 8px',fontWeight:700,color:h.total_minutes<=30?'#276221':h.total_minutes<=45?'#854F0B':'#C00000'}}>{h.total_minutes}m</td>
            <td style={{padding:'6px 8px'}}>{h.spray_done?'✅':'❌'}</td>
            <td style={{padding:'6px 8px',fontSize:10,color:'#666'}}>{h.entered_by}</td>
          </tr>)}</tbody>
        </table>
      </div>
    </div>}
  </div>
}

function MouldPMTab({user}:{user:User}) {
  const [moulds,setMoulds]=useState<any[]>([])
  const [loading,setLoading]=useState(true)
  const [pmFilter,setPmFilter]=useState<string>('')
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
    // Match by base name (ignore code in brackets) so mould_master frequency mil jaye
    const baseName=(s:string)=>(s||'').replace(/\s*\([^)]*\)\s*$/,'').trim().toLowerCase()
    const mould=moulds.find(m=>m.mould_name===doneForm.mouldName)||moulds.find(m=>baseName(m.mould_name)===baseName(doneForm.mouldName))
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
      <div style={{...S.met,cursor:'pointer',border:pmFilter===''?'2px solid #1F3864':'1px solid #E0E0E0'}} onClick={()=>setPmFilter('')}><div style={{fontSize:10,color:'#666'}}>Total Moulds</div><div style={{fontSize:20,fontWeight:700}}>{moulds.length}</div></div>
      <div style={{...S.met,cursor:'pointer',border:pmFilter==='OVERDUE'?'2px solid #C00000':'1px solid #E0E0E0'}} onClick={()=>setPmFilter(pmFilter==='OVERDUE'?'':'OVERDUE')}><div style={{fontSize:10,color:'#666'}}>Overdue 👆</div><div style={{fontSize:20,fontWeight:700,color:'#C00000'}}>{overdue}</div></div>
      <div style={{...S.met,cursor:'pointer',border:pmFilter==='DUE SOON'?'2px solid #854F0B':'1px solid #E0E0E0'}} onClick={()=>setPmFilter(pmFilter==='DUE SOON'?'':'DUE SOON')}><div style={{fontSize:10,color:'#666'}}>Due Soon 👆</div><div style={{fontSize:20,fontWeight:700,color:'#854F0B'}}>{dueSoon}</div></div>
    </div>

    {/* Status table */}
    <div style={S.card}>
      <div style={{fontWeight:700,marginBottom:8}}>Mould PM Status {pmFilter&&<span style={{fontSize:11,color:'#1F3864',fontWeight:600}}>— {pmFilter} only <span style={{color:'#C00000',cursor:'pointer'}} onClick={()=>setPmFilter('')}>✕ clear</span></span>}</div>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
          <thead><tr>{['Mould','Code','Current','PM At','Progress','Remaining','Status'].map(h=><th key={h} style={{background:'#1F3864',color:'#fff',padding:'6px 8px',textAlign:'left'}}>{h}</th>)}</tr></thead>
          <tbody>{(()=>{
            const rank=(s:string)=>s==='OVERDUE'?0:s==='DUE SOON'?1:2
            const shown=moulds
              .filter((m:any)=>pmFilter?m.status===pmFilter:true)
              .sort((a:any,b:any)=>rank(a.status)-rank(b.status))
            if(shown.length===0) return <tr><td colSpan={7} style={{textAlign:'center',color:'#666',padding:16}}>{pmFilter?`Koi ${pmFilter} mould nahi!`:'Koi mould setup nahi!'}</td></tr>
            return shown.map((m:any,i:number)=>{
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
          })})()}</tbody>
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
            {MOULDS.map(m=><option key={m.code} value={m.name+' ('+m.code+')'}>{m.name} ({m.code})</option>)}
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
          <option value="">Select</option>{MOULDS.map(m=><option key={m.code} value={m.name+' ('+m.code+')'}>{m.name} ({m.code})</option>)}
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
  const [bds,setBds]=useState<any[]>([])
  const [saving,setSaving]=useState(false)
  const [toast,setToast]=useState<{msg:string,ok:boolean}|null>(null)
  const [showForm,setShowForm]=useState(false)
  const [form,setForm]=useState({date:nd(),plant:'',machine:'',mouldRunning:'',problem:'',category:'Mechanical',operator:user.name,remarks:''})
  const [resolveId,setResolveId]=useState<string|null>(null)
  const [selectedBD,setSelectedBD]=useState<any>(null)
  const [resolveForm,setResolveForm]=useState({solution:'',analysis:'',sparesUsed:'',remarks:''})
  const [resolveParts,setResolveParts]=useState<{partName:string,qty:string,category:string,stock:number,source:string}[]>([])
  const [spareSearch,setSpareSearch]=useState('')
  const [selectedPart,setSelectedPart]=useState<any>(null)
  const [partHistory,setPartHistory]=useState<any[]>([])
  const [partHistoryLoading,setPartHistoryLoading]=useState(false)

  const loadPartHistory=async(part:any)=>{
    setSelectedPart(part)
    setPartHistoryLoading(true)
    const res=await fetch('/api/spares?part='+encodeURIComponent(part.part_name)).then(r=>r.json()).catch(()=>({movements:[]}))
    setPartHistory(res.movements||[])
    setPartHistoryLoading(false)
  }
  const [sparesList,setSparesList]=useState<any[]>([])
  const [showSpareSearch,setShowSpareSearch]=useState(false)

  const load=async()=>{
    const res=await fetch('/api/breakdown').then(r=>r.json())
    setBds(res.data||[])
  }

  useEffect(()=>{load()},[])

  // Auto refresh every 30s
  useEffect(()=>{
    const iv=setInterval(load,30000)
    return ()=>clearInterval(iv)
  },[])

  const machines=MACH[form.plant]||[]

  const fmt=(ts:string|null)=>ts?new Date(ts).toLocaleString('en-IN',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}):''
  const fmtTime=(ts:string|null)=>ts?new Date(ts).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}):''

  const calcDowntime=(reported:string,resolved:string|null)=>{
    if(!resolved) return null
    const mins=Math.round((new Date(resolved).getTime()-new Date(reported).getTime())/60000)
    const h=Math.floor(mins/60),m=mins%60
    return h>0?`${h}h ${m}m`:`${m}m`
  }

  const report=async()=>{
    if(!form.plant||!form.machine||!form.problem){
      setToast({msg:'Plant, Machine aur Problem bharo!',ok:false});return
    }
    setSaving(true)
    const res=await fetch('/api/breakdown',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        type:'report',
        ...form,
        mouldRunning:form.mouldRunning,
        reportedTime:new Date().toISOString(),
        enteredBy:user.name
      })
    }).then(r=>r.json())
    setSaving(false)
    setToast({msg:res.msg,ok:res.success})
    if(res.success){
      setShowForm(false)
      setForm({date:nd(),plant:'',machine:'',mouldRunning:'',problem:'',category:'Mechanical',operator:user.name,remarks:''})
      load()
    }
  }

  const startWork=async(id:string)=>{
    setSaving(true)
    const res=await fetch('/api/breakdown',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({type:'start_work',id,workStartedTime:new Date().toISOString(),enteredBy:user.name})
    }).then(r=>r.json())
    setSaving(false)
    setToast({msg:res.msg,ok:res.success})
    if(res.success) load()
  }

  const resolve=async(id:string)=>{
    if(!resolveForm.solution){setToast({msg:'Solution likho!',ok:false});return}
    setSaving(true)
    const res=await fetch('/api/breakdown',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        type:'resolve',id,
        solution:resolveForm.solution,
        analysis:resolveForm.analysis,
        sparesUsed:resolveParts.length>0 ? resolveParts.map(p=>p.partName+' x'+p.qty+(p.source==='purchased'?' [Purchased]':' [Factory]')).join(', ') : resolveForm.sparesUsed,
        remarks:resolveForm.remarks,
        resolvedParts:resolveParts,
        resolvedTime:new Date().toISOString(),
        enteredBy:user.name
      })
    }).then(r=>r.json())
    setSaving(false)
    setToast({msg:res.msg,ok:res.success})
    if(res.success){setResolveId(null);setResolveForm({solution:'',analysis:'',sparesUsed:'',remarks:''});setResolveParts([]);setSparesList([]);load()}
  }

  const pending=bds.filter(b=>b.status==='Pending'||b.status==='In Progress')
  const resolved=bds.filter(b=>b.status==='Resolved')

  return <div>
    {/* Summary */}
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:8}}>
      <div style={{...S.met,background:pending.length>0?'#FFEBEE':'#fff',border:pending.length>0?'2px solid #C00000':'1px solid #E0E0E0'}}>
        <div style={{fontSize:10,color:'#C00000',fontWeight:600}}>🔴 Pending</div>
        <div style={{fontSize:24,fontWeight:700,color:'#C00000'}}>{pending.length}</div>
      </div>
      <div style={S.met}>
        <div style={{fontSize:10,color:'#276221',fontWeight:600}}>✅ Resolved Today</div>
        <div style={{fontSize:24,fontWeight:700,color:'#276221'}}>{resolved.filter(b=>b.date===nd()).length}</div>
      </div>
      <div style={S.met}>
        <div style={{fontSize:10,color:'#854F0B',fontWeight:600}}>⏱️ Avg Downtime</div>
        <div style={{fontSize:18,fontWeight:700,color:'#854F0B'}}>
          {resolved.filter(b=>b.resolved_time&&b.reported_time).length>0
            ?`${Math.round(resolved.filter(b=>b.resolved_time&&b.reported_time).reduce((a:number,b:any)=>a+Math.round((new Date(b.resolved_time).getTime()-new Date(b.reported_time).getTime())/60000),0)/resolved.filter(b=>b.resolved_time&&b.reported_time).length)}m`
            :'--'}
        </div>
      </div>
    </div>

    {/* Report Button */}
    {!showForm&&<button onClick={()=>setShowForm(true)} style={{...S.sb,background:'#C00000',marginBottom:8}}>
      🚨 Report New Breakdown
    </button>}

    {/* Report Form */}
    {showForm&&<div style={{...S.card,border:'2px solid #C00000'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
        <div style={{fontWeight:700,color:'#C00000',fontSize:14}}>🚨 Report Breakdown</div>
        <button onClick={()=>setShowForm(false)} style={{background:'none',border:'none',fontSize:18,cursor:'pointer'}}>✕</button>
      </div>
      <div style={{background:'#FFEBEE',border:'1px solid #C00000',borderRadius:6,padding:'6px 10px',marginBottom:10,fontSize:11,color:'#C00000',fontWeight:600}}>
        ⏰ Reported Time: {new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit'})} — Automatically save hoga!
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
        <div style={S.f}><label style={S.lbl}>Date</label><input type="date" style={S.fi} value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))}/></div>
        <div style={S.f}><label style={S.lbl}>Category</label>
          <select style={S.fi} value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>
            <option>Mechanical</option><option>Electrical</option><option>Hydraulic</option>
            <option>Mould</option><option>Pneumatic</option><option>Other</option>
          </select>
        </div>
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
        <div style={{...S.f,gridColumn:'span 2'}}><label style={S.lbl}>Mould Running (Konsa mould chal raha tha?)</label>
          <select style={S.fi} value={form.mouldRunning} onChange={e=>setForm(p=>({...p,mouldRunning:e.target.value}))}>
            <option value="">-- Select Mould --</option>
            {MOULDS.map(m=><option key={m.code} value={`${m.name} (${m.code})`}>{m.name} ({m.code})</option>)}
          </select>
        </div>
      </div>
      <div style={S.f}><label style={S.lbl}>Problem Description</label>
        <textarea style={{...S.fi,height:70,resize:'none' as const}} value={form.problem} onChange={e=>setForm(p=>({...p,problem:e.target.value}))} placeholder="Kya problem hai? Detail mein likho..."/>
      </div>
      <button style={{...S.sb,background:'#C00000',marginTop:8}} onClick={report} disabled={saving}>
        {saving?'Saving...':'🚨 Report Breakdown — Time Stamp Auto Save!'}
      </button>
      {toast&&<Toast {...toast}/>}
    </div>}

    {/* Pending Breakdowns */}
    {pending.length>0&&<div style={S.card}>
      <div style={{fontWeight:700,color:'#C00000',marginBottom:10,fontSize:13}}>🔴 Pending Breakdowns ({pending.length})</div>
      {pending.map((b:any,i:number)=>{
        const isResolving=resolveId===b.id
        const elapsed=b.reported_time?Math.round((Date.now()-new Date(b.reported_time).getTime())/60000):0
        const elH=Math.floor(elapsed/60),elM=elapsed%60
        const elCol=elapsed<=60?'#276221':elapsed<=120?'#854F0B':'#C00000'

        return <div key={i} style={{border:`2px solid ${b.status==='In Progress'?'#854F0B':'#C00000'}`,borderRadius:8,padding:'12px',marginBottom:8,background:b.status==='In Progress'?'#FFF9E6':'#FFF5F5'}}>
          {/* Header */}
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
            <div>
              <div style={{fontWeight:700,fontSize:13,color:'#1F3864'}}>{b.machine} — {b.plant}</div>
              <div style={{fontSize:11,color:'#666',marginTop:2}}>{b.category} | {b.bd_id||b.id?.slice(0,8)}</div>
              {b.mould_running&&<div style={{fontSize:11,color:'#1F3864',marginTop:3,fontWeight:600,background:'#E8EDF5',display:'inline-block',padding:'2px 8px',borderRadius:4}}>⚙️ {b.mould_running}</div>}
              <div style={{fontSize:12,color:'#333',marginTop:4,fontWeight:500}}>{b.problem}</div>
            </div>
            <div style={{textAlign:'right',flexShrink:0}}>
              <div style={{fontSize:16,fontWeight:700,color:elCol}}>⏱️ {elH>0?`${elH}h ${elM}m`:`${elM}m`}</div>
              <div style={{fontSize:10,color:'#666',marginTop:2}}>since report</div>
            </div>
          </div>

          {/* Timestamps */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6,marginBottom:8,fontSize:10}}>
            <div style={{background:'#FFEBEE',borderRadius:6,padding:'6px 8px',textAlign:'center'}}>
              <div style={{color:'#C00000',fontWeight:600}}>🔴 Reported</div>
              <div style={{fontWeight:700,marginTop:2}}>{fmtTime(b.reported_time)||fmt(b.created_at)}</div>
            </div>
            <div style={{background:b.work_started_time?'#FFF3E0':'#F5F5F5',borderRadius:6,padding:'6px 8px',textAlign:'center'}}>
              <div style={{color:b.work_started_time?'#854F0B':'#999',fontWeight:600}}>🔧 Work Started</div>
              <div style={{fontWeight:700,marginTop:2,color:b.work_started_time?'#854F0B':'#ccc'}}>{b.work_started_time?fmtTime(b.work_started_time):'--:--'}</div>
            </div>
            <div style={{background:'#F5F5F5',borderRadius:6,padding:'6px 8px',textAlign:'center'}}>
              <div style={{color:'#999',fontWeight:600}}>✅ Resolved</div>
              <div style={{fontWeight:700,marginTop:2,color:'#ccc'}}>--:--</div>
            </div>
          </div>

          {/* Action Buttons */}
          {!isResolving&&<div style={{display:'flex',gap:6}}>
            {!b.work_started_time&&<button onClick={()=>startWork(b.id)} style={{flex:1,background:'#854F0B',color:'#fff',border:'none',borderRadius:6,padding:'8px',fontSize:11,fontWeight:700,cursor:'pointer'}}>
              🔧 Work Started — Mark Time
            </button>}
            <button onClick={async()=>{
                setResolveId(b.id)
                setResolveForm({solution:'',analysis:'',sparesUsed:'',remarks:''})
                setResolveParts([])
                setSpareSearch('')
                // Load spares list
                const res=await fetch('/api/spares').then(r=>r.json()).catch(()=>({spares:[]}))
                setSparesList(res.spares||[])
              }} style={{flex:1,background:'#276221',color:'#fff',border:'none',borderRadius:6,padding:'8px',fontSize:11,fontWeight:700,cursor:'pointer'}}>
              ✅ Mark Resolved
            </button>
          </div>}

          {/* Resolve Form */}
          {isResolving&&<div style={{background:'#E8F5E9',borderRadius:6,padding:'10px',marginTop:6}}>
            <div style={{background:'#276221',color:'#fff',borderRadius:4,padding:'4px 8px',fontSize:10,fontWeight:600,marginBottom:8,display:'inline-block'}}>
              ✅ Resolved Time: {new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})} — Auto Save!
            </div>
            <textarea style={{...S.fi,height:50,resize:'none' as const,marginBottom:6}} value={resolveForm.analysis||''} onChange={e=>setResolveForm(p=>({...p,analysis:e.target.value}))} placeholder="Analysis — kya problem thi exactly?"/>
            <textarea style={{...S.fi,height:50,resize:'none' as const,marginBottom:6}} value={resolveForm.solution} onChange={e=>setResolveForm(p=>({...p,solution:e.target.value}))} placeholder="Solution — kya kiya resolve karne ke liye?"/>
            
            {/* Parts Used — Spares Stock se */}
            <div style={{border:'2px solid #854F0B',borderRadius:8,padding:10,marginBottom:6,background:'#FFF9E6'}}>
              <div style={{fontWeight:700,color:'#854F0B',fontSize:11,marginBottom:8}}>🔧 Parts Used (Stock se automatically minus hoga)</div>
              
              {/* Added parts list */}
              {resolveParts.length>0&&<div style={{marginBottom:8}}>
                {resolveParts.map((p,i)=><div key={i} style={{background:'#fff',borderRadius:6,padding:'6px 8px',border:'1px solid #ddd',marginBottom:4}}>
                  <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
                    <span style={{flex:1,fontSize:11,fontWeight:600}}>{p.partName}</span>
                    <span style={{fontSize:10,color:'#666',background:'#F0F0F0',padding:'1px 6px',borderRadius:4}}>{p.category?.includes('Mould')?'🔩 Mould':'⚙️ Machine'}</span>
                    <input type="number" min="1" value={p.qty}
                      onChange={e=>setResolveParts(prev=>prev.map((x,j)=>j===i?{...x,qty:e.target.value}:x))}
                      style={{width:50,padding:'2px 4px',border:'1px solid #ccc',borderRadius:4,fontSize:11,textAlign:'center'}}/>
                    <button onClick={()=>setResolveParts(prev=>prev.filter((_,j)=>j!==i))}
                      style={{background:'#FFEBEE',border:'none',borderRadius:4,padding:'2px 6px',cursor:'pointer',color:'#C00000',fontSize:12}}>✕</button>
                  </div>
                  <div style={{display:'flex',gap:6,alignItems:'center'}}>
                    <span style={{fontSize:10,color:'#666'}}>Source:</span>
                    <button onClick={()=>setResolveParts(prev=>prev.map((x,j)=>j===i?{...x,source:'factory'}:x))}
                      style={{padding:'2px 10px',fontSize:10,fontWeight:600,border:'1px solid '+(p.source==='purchased'?'#ddd':'#276221'),borderRadius:999,background:p.source==='purchased'?'#fff':'#E8F5E9',color:p.source==='purchased'?'#888':'#276221',cursor:'pointer'}}>
                      🏭 Factory Stock
                    </button>
                    <button onClick={()=>setResolveParts(prev=>prev.map((x,j)=>j===i?{...x,source:'purchased'}:x))}
                      style={{padding:'2px 10px',fontSize:10,fontWeight:600,border:'1px solid '+(p.source==='purchased'?'#C00000':'#ddd'),borderRadius:999,background:p.source==='purchased'?'#FFEBEE':'#fff',color:p.source==='purchased'?'#C00000':'#888',cursor:'pointer'}}>
                      🛒 Bahar se Mangwaya
                    </button>
                    {p.source!=='purchased'&&<span style={{fontSize:10,color:'#276221'}}>Stock: {p.stock}</span>}
                    {p.source==='purchased'&&<span style={{fontSize:10,color:'#C00000',fontWeight:600}}>⚠️ Purchase required</span>}
                  </div>
                </div>)}
              </div>}
              
              {/* Search spare */}
              <div style={{position:'relative' as const}}>
                <input style={{...S.fi,marginBottom:0}}
                  value={spareSearch}
                  onChange={e=>{setSpareSearch(e.target.value);setShowSpareSearch(true)}}
                  placeholder="Part search karo — e.g. O-Ring, Heater..."
                  onFocus={()=>setShowSpareSearch(true)}/>
                {showSpareSearch&&spareSearch&&<div style={{position:'absolute' as const,top:'100%',left:0,right:0,background:'#fff',border:'1px solid #ddd',borderRadius:6,maxHeight:150,overflowY:'auto',zIndex:100}}>
                  {sparesList.filter((s:any)=>s.part_name?.toLowerCase().includes(spareSearch.toLowerCase())).slice(0,8).map((s:any)=><div
                    key={s.id}
                    onClick={()=>{
                      if(!resolveParts.find(p=>p.partName===s.part_name)){
                        setResolveParts(prev=>[...prev,{partName:s.part_name,qty:'1',category:s.category||'',stock:s.current_stock||0,source:'factory'}])
                      }
                      setSpareSearch('')
                      setShowSpareSearch(false)
                    }}
                    style={{padding:'6px 10px',cursor:'pointer',fontSize:11,borderBottom:'1px solid #f0f0f0',display:'flex',justifyContent:'space-between'}}
                    onMouseEnter={e=>(e.currentTarget.style.background='#FFF9E6')}
                    onMouseLeave={e=>(e.currentTarget.style.background='#fff')}>
                    <span style={{fontWeight:600}}>{s.part_name}</span>
                    <span style={{color:s.current_stock>0?'#276221':'#C00000',fontSize:10}}>Stock: {s.current_stock} {s.unit}</span>
                  </div>)}
                  {sparesList.filter((s:any)=>s.part_name?.toLowerCase().includes(spareSearch.toLowerCase())).length===0&&
                    <div style={{padding:'8px 10px',fontSize:11,color:'#888'}}>Koi spare nahi mila</div>}
                </div>}
              </div>
              {resolveParts.length===0&&<div style={{fontSize:10,color:'#888',marginTop:4}}>
                💡 Spare select karo — Mould part → mould_history mein, Machine part → maintenance mein jayega
              </div>}
            </div>
            
            <textarea style={{...S.fi,height:35,resize:'none' as const,marginBottom:8}} value={resolveForm.remarks} onChange={e=>setResolveForm(p=>({...p,remarks:e.target.value}))} placeholder="Remarks (optional)"/>
            <div style={{display:'flex',gap:6}}>
              <button onClick={()=>resolve(b.id)} style={{flex:2,background:'#276221',color:'#fff',border:'none',borderRadius:6,padding:'8px',fontSize:12,fontWeight:700,cursor:'pointer'}} disabled={saving}>
                {saving?'Saving...':'✅ Confirm Resolved'}
              </button>
              <button onClick={()=>setResolveId(null)} style={{flex:1,background:'#666',color:'#fff',border:'none',borderRadius:6,padding:'8px',fontSize:12,cursor:'pointer'}}>
                Cancel
              </button>
            </div>
          </div>}
        </div>
      })}
    </div>}

    {/* Resolved History */}
    {resolved.length>0&&<div style={S.card}>
      {/* BD Detail Modal */}
      {selectedBD&&<div style={{position:'fixed' as const,inset:0,background:'rgba(0,0,0,0.6)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{background:'#fff',borderRadius:12,padding:20,width:400,maxHeight:'90vh',overflowY:'auto'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
            <div style={{fontWeight:700,color:'#C00000',fontSize:14}}>{(selectedBD as any).bd_id||(selectedBD as any).id?.slice(0,8)}</div>
            <button onClick={()=>setSelectedBD(null)} style={{background:'#f0f0f0',border:'none',borderRadius:999,width:28,height:28,cursor:'pointer',fontSize:14}}>✕</button>
          </div>

          {/* Summary */}
          <div style={{background:'#FFEBEE',borderRadius:8,padding:10,marginBottom:12}}>
            <div style={{fontWeight:700,fontSize:13,color:'#1F3864',marginBottom:2}}>{(selectedBD as any).machine} — {(selectedBD as any).plant}</div>
            {(selectedBD as any).mould_running&&<div style={{fontSize:11,color:'#854F0B',fontWeight:600}}>⚙️ {(selectedBD as any).mould_running}</div>}
            <div style={{fontSize:11,color:'#666',marginTop:4}}>{(selectedBD as any).category} | {(selectedBD as any).date}</div>
          </div>

          {/* Details */}
          {[
            {label:'Problem',val:(selectedBD as any).problem},
            {label:'Analysis',val:(selectedBD as any).analysis},
            {label:'Solution',val:(selectedBD as any).solution},
            {label:'Parts Used',val:(selectedBD as any).spares_used},
            {label:'Reported By',val:(selectedBD as any).reported_by},
            {label:'Resolved By',val:(selectedBD as any).resolved_by},
            {label:'Remarks',val:(selectedBD as any).remarks},
          ].filter(f=>f.val&&f.val!=='--').map((f,i)=>(
            <div key={i} style={{marginBottom:8,borderBottom:'1px solid #F5F5F5',paddingBottom:6}}>
              <div style={{fontSize:10,color:'#888',fontWeight:600,marginBottom:2}}>{f.label}</div>
              <div style={{fontSize:12,color:'#333'}}>{f.val}</div>
            </div>
          ))}

          {/* Timing */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6,marginTop:8}}>
            <div style={{background:'#FFEBEE',borderRadius:6,padding:6,textAlign:'center'}}>
              <div style={{fontSize:10,color:'#666'}}>Reported</div>
              <div style={{fontSize:11,fontWeight:600}}>{(selectedBD as any).reported_time?new Date((selectedBD as any).reported_time).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}):'--'}</div>
            </div>
            <div style={{background:'#FFF9E6',borderRadius:6,padding:6,textAlign:'center'}}>
              <div style={{fontSize:10,color:'#666'}}>Work Start</div>
              <div style={{fontSize:11,fontWeight:600}}>{(selectedBD as any).work_started_time?new Date((selectedBD as any).work_started_time).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}):'--'}</div>
            </div>
            <div style={{background:'#E8F5E9',borderRadius:6,padding:6,textAlign:'center'}}>
              <div style={{fontSize:10,color:'#666'}}>Resolved</div>
              <div style={{fontSize:11,fontWeight:600}}>{(selectedBD as any).resolved_time?new Date((selectedBD as any).resolved_time).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}):'--'}</div>
            </div>
          </div>
          <div style={{textAlign:'center',marginTop:8,fontSize:13,fontWeight:700,color:(selectedBD as any).downtime_min>180?'#C00000':(selectedBD as any).downtime_min>60?'#854F0B':'#276221'}}>
            ⏱️ Downtime: {(selectedBD as any).downtime_min||0} min
          </div>

          {/* Mould History link */}
          {(selectedBD as any).mould_running&&<div style={{marginTop:10,background:'#E8EDF5',borderRadius:6,padding:'6px 10px',fontSize:11,color:'#1F3864',fontWeight:600}}>
            📋 Mould History mein check karo: {(selectedBD as any).mould_running}
          </div>}
        </div>
      </div>}

      <div style={{fontWeight:700,marginBottom:8,color:'#276221'}}>✅ Resolved Breakdowns</div>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
          <thead><tr>
            {['BD ID','Machine','Plant','⚙️ Mould','Category','Problem','Analysis','Solution','Parts Used','🔴 Reported','🔧 Work Start','✅ Resolved','⏱️ Downtime','By'].map(h=>
              <th key={h} style={{background:'#1F3864',color:'#fff',padding:'6px 8px',textAlign:'left',whiteSpace:'nowrap' as const}}>{h}</th>)}
          </tr></thead>
          <tbody>{resolved.map((b:any,i:number)=>{
            const downtime=b.reported_time&&b.resolved_time?calcDowntime(b.reported_time,b.resolved_time):b.downtime_min?`${b.downtime_min}m`:'--'
            const dtMins=b.reported_time&&b.resolved_time?Math.round((new Date(b.resolved_time).getTime()-new Date(b.reported_time).getTime())/60000):0
            const dtCol=dtMins>0?(dtMins<=60?'#276221':dtMins<=180?'#854F0B':'#C00000'):'#666'
            return <tr key={i} onClick={()=>setSelectedBD(b)} style={{background:i%2===0?'#F8FFF8':'#fff',cursor:'pointer'}} onMouseEnter={e=>(e.currentTarget.style.background='#E8EDF5')} onMouseLeave={e=>(e.currentTarget.style.background=i%2===0?'#F8FFF8':'#fff')}>
              <td style={{padding:'6px 8px',fontSize:10,color:'#666',whiteSpace:'nowrap' as const}}>{b.bd_id||b.id?.slice(0,8)}</td>
              <td style={{padding:'6px 8px',fontWeight:600,color:'#1F3864',whiteSpace:'nowrap' as const}}>{b.machine}</td>
              <td style={{padding:'6px 8px',fontSize:10,color:'#555',whiteSpace:'nowrap' as const}}>{b.plant||'--'}</td>
              <td style={{padding:'6px 8px',fontSize:10,fontWeight:600,color:'#854F0B',maxWidth:100,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' as const}} title={b.mould_running||'--'}>{b.mould_running||'--'}</td>
              <td style={{padding:'6px 8px',fontSize:10}}><span style={{background:'#E6F1FB',color:'#1F3864',padding:'2px 6px',borderRadius:4,fontSize:9}}>{b.category}</span></td>
              <td style={{padding:'6px 8px',fontSize:10,maxWidth:140,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' as const}} title={b.problem}>{b.problem}</td>
              <td style={{padding:'6px 8px',fontSize:10,maxWidth:140,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' as const,color:'#854F0B'}} title={b.analysis||'--'}>{b.analysis||'--'}</td>
              <td style={{padding:'6px 8px',fontSize:10,maxWidth:140,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' as const,color:'#276221'}} title={b.solution||'--'}>{b.solution||'--'}</td>
              <td style={{padding:'6px 8px',fontSize:10,maxWidth:120,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' as const,color:'#5B2C8D'}} title={b.spares_used||'--'}>{b.spares_used||'--'}</td>
              <td style={{padding:'6px 8px',fontSize:10,color:'#C00000',fontWeight:600,whiteSpace:'nowrap' as const}}>{fmtTime(b.reported_time)||fmt(b.created_at)}</td>
              <td style={{padding:'6px 8px',fontSize:10,color:'#854F0B',fontWeight:600,whiteSpace:'nowrap' as const}}>{b.work_started_time?fmtTime(b.work_started_time):'--'}</td>
              <td style={{padding:'6px 8px',fontSize:10,color:'#276221',fontWeight:600,whiteSpace:'nowrap' as const}}>{b.resolved_time?fmtTime(b.resolved_time):'--'}</td>
              <td style={{padding:'6px 8px',fontWeight:700,color:dtCol,whiteSpace:'nowrap' as const}}>{downtime}</td>
              <td style={{padding:'6px 8px',fontSize:10,color:'#666',whiteSpace:'nowrap' as const}}>{b.resolved_by||b.reported_by}</td>
            </tr>
          })}</tbody>
        </table>
      </div>
    </div>}

    {toast&&<Toast {...toast}/>}
  </div>
}

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
    { id: 'productionstatus', label: '📊 Production Status' },
    { id: 'rej_comparison', label: '🔍 Rejection Cross-Check' },
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
                      {['Date', 'Good Parts', 'Rejection', 'Rej %', 'Efficiency', 'Downtime', 'Entries'].map(h =>
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
                          <td style={{ padding: '6px 8px', fontWeight: 700, color: r.good+r.rej>0?(Math.round(r.good/(r.good+r.rej)*100)>=90?'#276221':Math.round(r.good/(r.good+r.rej)*100)>=75?'#854F0B':'#C00000'):'#999' }}>{r.good+r.rej>0?Math.round(r.good/(r.good+r.rej)*100)+'%':'--'}</td>
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
                          <td style={{ padding: '6px 8px', textAlign: 'center', color: '#854F0B', fontWeight: 600 }}>{r.estimated_min>0?r.estimated_min+' min':'--'}</td>
                          <td style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 700, color: col }}>{r.total_minutes>0?r.total_minutes+' min':r.actual_time>0?r.actual_time+' min':'--'}</td>
                          <td style={{ padding: '6px 8px' }}>{(()=>{
                            const actual=r.total_minutes||r.actual_time||0
                            const target=r.estimated_min||r.estimated_time||0
                            const isOnTime=target>0&&actual>0&&actual<=target
                            const isComplete=actual>0
                            const statusBg=!isComplete?'#F5F5F5':isOnTime?'#E8F5E9':'#FFEBEE'
                            const statusCol=!isComplete?'#666':isOnTime?'#276221':'#C00000'
                            const statusText=!isComplete?'In Progress':isOnTime?'✅ On Time':'⚠️ Delayed'
                            return <span style={{background:statusBg,color:statusCol,padding:'2px 7px',borderRadius:999,fontSize:10,fontWeight:600}}>{statusText}</span>
                          })()}</td>
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
                          <td style={{ padding: '6px 8px', color: '#854F0B', fontWeight: 600 }}>{r.rejection_weight ? r.rejection_weight+' kg' : '--'}</td>
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
          {module === 'mouldpm' && <PMLogsReport logs={data.data || []} />}
        </div>
      )}
      {module==='productionstatus'&&<ProductionStatusReport date={to} plant={plant}/>}
      {module==='rej_comparison'&&<RejectionComparison from={from} to={to} plant={plant}/>}
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
        <datalist id="party-list">{parties.map(p=><option key={p.party_name} value={p.party_name}/>)}</datalist>
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
  const canEdit = user?.modules?.includes('spares_edit') || user?.role==='Admin'
  const [spares,setSpares]=useState<any[]>([])
  const [movements,setMovements]=useState<any[]>([])
  const [loading,setLoading]=useState(true)
  const [saving,setSaving]=useState(false)
  const [toast,setToast]=useState<{msg:string,ok:boolean}|null>(null)
  const [editSpare,setEditSpare]=useState<any>(null)
  const [spareSearch,setSpareSearch]=useState('')
  const [selectedPart,setSelectedPart]=useState<any>(null)
  const [partHistory,setPartHistory]=useState<any[]>([])
  const [partHistoryLoading,setPartHistoryLoading]=useState(false)

  const loadPartHistory=async(part:any)=>{
    setSelectedPart(part)
    setPartHistoryLoading(true)
    const res=await fetch('/api/spares?part='+encodeURIComponent(part.part_name)).then(r=>r.json()).catch(()=>({movements:[]}))
    setPartHistory(res.movements||[])
    setPartHistoryLoading(false)
  }
  const [editForm,setEditForm]=useState<any>({})
  const [editSaving,setEditSaving]=useState(false)
  const [vendor,setVendor]=useState(()=>localStorage.getItem('lastVendor')||'')
  const [slipNo,setSlipNo]=useState('')
  const [date,setDate]=useState(nd())
  const [action,setAction]=useState('Stock In')
  const [showOpeningStock,setShowOpeningStock]=useState(false)
  const [spareItems,setSpareItems]=useState([{partName:'',category:'',unit:'Pcs',qty:'',minQty:'',pricePerPc:'',total:0,plant:'',room:'',almirah:'',boxNo:'',storageType:'Box',lastVendor:'',lastPrice:0,currentStock:0,historyInfo:''}])
  const [usedForPlant,setUsedForPlant]=useState('')
  const [usedForMachine,setUsedForMachine]=useState('')
  const [usedForMould,setUsedForMould]=useState('')
  const [usedFor,setUsedFor]=useState('Machine')
  const [spareView,setSpareView]=useState<'entry'|'stock'|'movements'>('entry')

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
    const res=await fetch('/api/spares',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({vendor,slipNo,date,action,doneBy:user.name,items:validItems,plant:usedForPlant,machine:usedForMachine,mouldNo:usedForMould,usedFor})}).then(r=>r.json())
    setSaving(false);setToast({msg:res.msg,ok:res.success})
    if(res.success){load();setSpareItems([{partName:'',category:'',unit:'Pcs',qty:'',minQty:'',pricePerPc:'',total:0,plant:'',room:'',almirah:'',boxNo:'',storageType:'Box',lastVendor:'',lastPrice:0,currentStock:0,historyInfo:''}]);setVendor('');setSlipNo('');setUsedForPlant('');setUsedForMachine('');setUsedForMould('');setUsedFor('Machine')}
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

    {/* ── Top Nav Tabs ── */}
    <div style={{display:'flex',gap:6,marginBottom:8}}>
      {[
        {key:'entry',label:'➕ Entry',color:'#276221',bg:'#E8F5E9'},
        {key:'stock',label:'📦 Stock Status',color:'#1F3864',bg:'#E8EDF5'},
        {key:'movements',label:'🔄 Movements',color:'#854F0B',bg:'#FFF9E6'},
      ].map(t=><button key={t.key} onClick={()=>setSpareView(t.key as any)}
        style={{flex:1,padding:'10px 6px',border:'none',borderRadius:8,cursor:'pointer',fontWeight:700,fontSize:12,
          background:spareView===t.key?t.color:'#F5F5F5',
          color:spareView===t.key?'#fff':t.color,
        }}>{t.label}</button>)}
    </div>

    {/* Stock table */}
    {spareView==='stock'&&<div style={S.card}>
      <div style={{fontWeight:700,marginBottom:8,color:'#1F3864',fontSize:13}}>📦 Spares Stock Status {canEdit&&<span style={{fontSize:10,color:'#854F0B',marginLeft:8}}>✏️ Edit rights: Sirf aapke paas</span>}</div>
      <div style={{overflowX:'auto'}}>
        {/* Part History Modal */}
        {selectedPart&&<div style={{position:'fixed' as const,inset:0,background:'rgba(0,0,0,0.6)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'#fff',borderRadius:12,padding:20,width:400,maxHeight:'85vh',overflowY:'auto'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <div style={{fontWeight:700,color:'#1F3864',fontSize:14}}>{selectedPart.part_name}</div>
              <button onClick={()=>setSelectedPart(null)} style={{background:'#f0f0f0',border:'none',borderRadius:999,width:28,height:28,cursor:'pointer',fontSize:14}}>✕</button>
            </div>

            {/* Current Stock Summary */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:12}}>
              <div style={{background:'#E8F5E9',borderRadius:8,padding:8,textAlign:'center'}}>
                <div style={{fontSize:18,fontWeight:700,color:'#276221'}}>{selectedPart.current_stock}</div>
                <div style={{fontSize:10,color:'#276221'}}>Current Stock</div>
              </div>
              <div style={{background:'#FFF9E6',borderRadius:8,padding:8,textAlign:'center'}}>
                <div style={{fontSize:18,fontWeight:700,color:'#854F0B'}}>{selectedPart.min_qty||0}</div>
                <div style={{fontSize:10,color:'#854F0B'}}>Min Qty</div>
              </div>
              <div style={{background:selectedPart.status==='Out of Stock'?'#FFEBEE':selectedPart.status==='Low'?'#FFF3E0':'#E8F5E9',borderRadius:8,padding:8,textAlign:'center'}}>
                <div style={{fontSize:11,fontWeight:700,color:selectedPart.status==='Out of Stock'?'#C00000':selectedPart.status==='Low'?'#854F0B':'#276221'}}>{selectedPart.status}</div>
                <div style={{fontSize:10,color:'#666'}}>Status</div>
              </div>
            </div>

            <div style={{fontSize:12,color:'#666',marginBottom:4}}>{selectedPart.plant||'--'} | {selectedPart.room||'--'} | {selectedPart.almirah||'--'}</div>
            <div style={{fontSize:11,color:'#888',marginBottom:12}}>Last Vendor: {selectedPart.last_vendor||'--'} | Price: ₹{selectedPart.last_price||0}/{selectedPart.unit}</div>

            {/* Movement History */}
            <div style={{fontWeight:700,color:'#1F3864',fontSize:12,marginBottom:8}}>📋 Movement History</div>
            {partHistoryLoading
              ?<div style={{textAlign:'center',padding:16,color:'#666'}}>Loading...</div>
              :partHistory.length===0
                ?<div style={{textAlign:'center',color:'#888',padding:16,fontSize:11}}>Koi movement nahi</div>
                :<div>
                  {partHistory.map((m:any,i:number)=>(
                    <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0',borderBottom:'1px solid #F5F5F5'}}>
                      <div>
                        <div style={{fontSize:11,fontWeight:600}}>{m.date}</div>
                        <div style={{fontSize:10,color:'#666'}}>{m.done_by||m.vendor||'--'}{m.machine?' | '+m.machine:''}</div>
                        {m.plant&&<div style={{fontSize:10,color:'#1F3864',fontWeight:600}}>{m.plant}</div>}
                      </div>
                      <div style={{textAlign:'right'}}>
                        <span style={{background:m.action==='Stock In'?'#E8F5E9':'#FFEBEE',color:m.action==='Stock In'?'#276221':'#C00000',padding:'2px 8px',borderRadius:999,fontSize:10,fontWeight:600}}>
                          {m.action==='Stock In'?'+':'-'}{m.qty} {selectedPart.unit}
                        </span>
                        <div style={{fontSize:10,color:'#888',marginTop:2}}>Stock: {m.new_stock}</div>
                      </div>
                    </div>
                  ))}
                </div>
            }
          </div>
        </div>}

        {/* Edit Modal — sirf Admin/nitin ke liye */}
        {editSpare&&canEdit&&<div style={{position:'fixed' as const,inset:0,background:'rgba(0,0,0,0.5)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'#fff',borderRadius:12,padding:20,width:340,maxHeight:'90vh',overflowY:'auto'}}>
            <div style={{fontWeight:700,color:'#1F3864',fontSize:14,marginBottom:12}}>✏️ Edit Spare — {editSpare.part_name}</div>
            
            <div style={S.f}><label style={S.lbl}>Part Name</label>
              <input style={S.fi} value={editForm.part_name||''} onChange={e=>setEditForm(p=>({...p,part_name:e.target.value}))}/>
            </div>
            <div style={S.f}><label style={S.lbl}>Category</label>
              <select style={S.fi} value={editForm.category||''} onChange={e=>setEditForm(p=>({...p,category:e.target.value}))}>
                <option value="">-- Select --</option>
                {['Mould — Lock & Fasteners','Mould — Cooling System','Mould — Plate & Body','Mould — Core & Cavity','Mould — Ejector System','Mould — Hot Runner','Mould — Slider & Lifter','Mould — Gas Vent & Seal','Mould — Maintenance','Machine — Heating & Barrel','Machine — Hydraulic','Machine — Electrical','Machine — Clamping','Machine — Injection Unit','Machine — Cooling & Chiller','Machine — Pneumatic','Machine — Lubrication','Machine — Safety & Sensors','Machine — Drive & Motion','General — Tools','General — Consumables'].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              <div style={S.f}><label style={S.lbl}>Current Stock</label>
                <input type="number" style={S.fi} value={editForm.current_stock||0} onChange={e=>setEditForm(p=>({...p,current_stock:e.target.value}))}/>
              </div>
              <div style={S.f}><label style={S.lbl}>Min Qty (Alert)</label>
                <input type="number" style={S.fi} value={editForm.min_qty||0} onChange={e=>setEditForm(p=>({...p,min_qty:e.target.value}))}/>
              </div>
              <div style={S.f}><label style={S.lbl}>Unit</label>
                <select style={S.fi} value={editForm.unit||'Pcs'} onChange={e=>setEditForm(p=>({...p,unit:e.target.value}))}>
                  <option>Pcs</option><option>Set</option><option>Kg</option><option>Ltr</option><option>Mtr</option><option>Box</option>
                </select>
              </div>
              <div style={S.f}><label style={S.lbl}>Last Price (₹)</label>
                <input type="number" style={S.fi} value={editForm.last_price||0} onChange={e=>setEditForm(p=>({...p,last_price:e.target.value}))}/>
              </div>
            </div>
            <div style={S.f}><label style={S.lbl}>Last Vendor</label>
              <input style={S.fi} value={editForm.last_vendor||''} onChange={e=>setEditForm(p=>({...p,last_vendor:e.target.value}))}/>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              <div style={S.f}><label style={S.lbl}>Plant</label>
                <select style={S.fi} value={editForm.plant||''} onChange={e=>setEditForm(p=>({...p,plant:e.target.value}))}>
                  <option value="">Select</option><option>Plant 477</option><option>Plant 488</option><option>Plant 433</option><option>Main Store</option>
                </select>
              </div>
              <div style={S.f}><label style={S.lbl}>Room</label>
                <select style={S.fi} value={editForm.room||''} onChange={e=>setEditForm(p=>({...p,room:e.target.value}))}>
                  <option value="">Select</option><option>Tool Room</option><option>Maintenance Room</option><option>Store Room</option><option>Production Floor</option>
                </select>
              </div>
              <div style={S.f}><label style={S.lbl}>Almirah/Rack</label>
                <input style={S.fi} value={editForm.almirah||''} onChange={e=>setEditForm(p=>({...p,almirah:e.target.value}))} placeholder="e.g. A1"/>
              </div>
              <div style={S.f}><label style={S.lbl}>Box No.</label>
                <input style={S.fi} value={editForm.box_no||''} onChange={e=>setEditForm(p=>({...p,box_no:e.target.value}))} placeholder="e.g. Box-5"/>
              </div>
            </div>
            
            <div style={{display:'flex',gap:8,marginTop:12}}>
              <button onClick={async()=>{
                setEditSaving(true)
                const status = parseFloat(editForm.current_stock)===0?'Out of Stock':parseFloat(editForm.current_stock)<parseFloat(editForm.min_qty||0)?'Low':'OK'
                await fetch('/api/spares',{method:'PUT',headers:{'Content-Type':'application/json'},
                  body:JSON.stringify({id:editSpare.id,...editForm,status,updatedBy:user.name})
                }).then(r=>r.json())
                setEditSaving(false)
                setEditSpare(null)
                load()
              }} style={{flex:1,background:'#1F3864',color:'#fff',border:'none',borderRadius:6,padding:'8px',fontSize:12,fontWeight:700,cursor:'pointer'}}>
                {editSaving?'Saving...':'✅ Save Changes'}
              </button>
              <button onClick={()=>setEditSpare(null)} style={{background:'#f0f0f0',border:'none',borderRadius:6,padding:'8px 14px',cursor:'pointer',fontSize:12}}>Cancel</button>
            </div>
          </div>
        </div>}

        {/* Search */}
        <input style={{...S.fi,marginBottom:8}} placeholder="Part name search karo..." value={spareSearch||''} onChange={e=>setSpareSearch(e.target.value)}/>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
          <thead><tr>{['Part Name','Plant','Category','Stock','Min Qty','Status',canEdit?'Edit':''].filter(Boolean).map(h=><th key={h} style={{background:'#1F3864',color:'#fff',padding:'6px 8px',textAlign:'left'}}>{h}</th>)}</tr></thead>
          <tbody>{spares.filter((s:any)=>!spareSearch||s.part_name?.toLowerCase().includes(spareSearch.toLowerCase())).length===0?<tr><td colSpan={7} style={{textAlign:'center',color:'#666',padding:16}}>Koi spare nahi mila!</td></tr>:spares.filter((s:any)=>!spareSearch||s.part_name?.toLowerCase().includes(spareSearch.toLowerCase())).map((s:any,i:number)=>{
            const col=s.status==='Out of Stock'?'#C00000':s.status==='Low'?'#854F0B':'#276221'
            const bg=s.status==='Out of Stock'?'#FFEBEE':s.status==='Low'?'#FFF3E0':'#E8F5E9'
            return <tr key={i} style={{background:i%2===0?'#FAFAFA':'#fff'}}>
              <td style={{padding:'6px 8px',fontWeight:600,fontSize:11,cursor:'pointer',color:'#1F3864',textDecoration:'underline'}} onClick={()=>loadPartHistory(s)}>
                {s.part_name}
                <div style={{fontSize:9,color:'#888',fontWeight:400,textDecoration:'none'}}>{s.room||''}{s.almirah?' | '+s.almirah:''}</div>
              </td>
              <td style={{padding:'6px 8px',fontSize:10,fontWeight:600,color:'#1F3864'}}>{s.plant||'--'}</td>
              <td style={{padding:'6px 8px',fontSize:10,color:'#666'}}>{s.category||'--'}</td>
              <td style={{padding:'6px 8px',fontWeight:700,color:col}}>{s.current_stock} {s.unit}</td>
              <td style={{padding:'6px 8px',textAlign:'center',color:'#666'}}>{s.min_qty||0}</td>
              <td style={{padding:'6px 8px'}}><span style={{background:bg,color:col,padding:'2px 7px',borderRadius:999,fontSize:10,fontWeight:600}}>{s.status}</span></td>
              {canEdit&&<td style={{padding:'4px 8px'}}>
                <button onClick={()=>{setEditSpare(s);setEditForm({...s})}}
                  style={{background:'#E8EDF5',border:'1px solid #1F3864',borderRadius:4,padding:'2px 8px',fontSize:10,cursor:'pointer',color:'#1F3864',fontWeight:600}}>
                  ✏️ Edit
                </button>
              </td>}
            </tr>
          })}</tbody>
        </table>
      </div>
    </div>}

    {/* Entry form — shown when entry tab active */}
    {spareView==='entry'&&<div>
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

    {/* Entry Type Tabs */}
    <div style={{display:'flex',gap:8,marginBottom:8}}>
      <button onClick={()=>setAction('Stock In')} style={{flex:1,padding:'10px',border:`2px solid ${action==='Stock In'?'#276221':'#E0E0E0'}`,borderRadius:8,background:action==='Stock In'?'#E8F5E9':'#fff',color:action==='Stock In'?'#276221':'#666',fontWeight:700,fontSize:12,cursor:'pointer'}}>
        📦 Purchase Entry
      </button>
      <button onClick={()=>setAction('Used in Machine')} style={{flex:1,padding:'10px',border:`2px solid ${action==='Used in Machine'?'#854F0B':'#E0E0E0'}`,borderRadius:8,background:action==='Used in Machine'?'#FFF3E0':'#fff',color:action==='Used in Machine'?'#854F0B':'#666',fontWeight:700,fontSize:12,cursor:'pointer'}}>
        🔧 Use Entry
      </button>
    </div>

    <div id="spares-entry-form" style={{...S.card,border:`2px solid ${action==='Stock In'?'#276221':'#854F0B'}`}}>
      <div style={{fontWeight:700,color:action==='Stock In'?'#276221':'#854F0B',marginBottom:10,fontSize:13}}>
        {action==='Stock In'?'📦 Purchase Entry — Naya Samaan Aaya':'🔧 Use Entry — Machine Mein Lagaya'}
      </div>

      {/* Purchase fields - only for Stock In */}
      {action==='Stock In'&&<div>
        <div style={S.fr}>
          <div style={S.f}><label style={S.lbl}>Vendor Name</label>
            <input style={S.fi} value={vendor} onChange={e=>setVendor(e.target.value)} placeholder="Vendor naam..." list="vendor-list"/>
            <datalist id="vendor-list">{vendors.map((v:any)=><option key={v} value={v}/>)}</datalist>
            {vendor&&<div style={{fontSize:10,color:'#276221',marginTop:2}}>✅ Next time auto-fill hoga!</div>}
          </div>
          <div style={S.f}><label style={S.lbl}>Slip / Invoice No.</label><input style={S.fi} value={slipNo} onChange={e=>setSlipNo(e.target.value)} placeholder="INV-001"/></div>
        </div>
      </div>}

      {/* Plant field — Stock In mein bhi dikhao */}
      {action==='Stock In'&&<div style={{marginBottom:8}}>
        <div style={S.f}><label style={S.lbl}>Plant (Kahan aayi stock?)</label>
          <select style={S.fi} value={usedForPlant} onChange={e=>setUsedForPlant(e.target.value)}>
            <option value="">Select Plant</option>
            <option>Plant 477</option><option>Plant 488</option><option>Plant 433</option><option>Main Store</option>
          </select>
        </div>
      </div>}

      {/* Use Entry — Machine & Mould fields */}
      {action==='Used in Machine'&&<div style={{background:'#FFF9E6',border:'2px solid #854F0B',borderRadius:8,padding:12,marginBottom:10}}>
        <div style={{fontWeight:700,color:'#854F0B',fontSize:12,marginBottom:8}}>🔧 Kahan Use Hua?</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
          <div style={S.f}><label style={S.lbl}>Used For</label>
            <select style={S.fi} value={usedFor} onChange={e=>setUsedFor(e.target.value)}>
              <option value="Machine">Machine</option>
              <option value="Mould">Mould</option>
              <option value="Both">Machine + Mould</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div style={S.f}><label style={S.lbl}>Plant</label>
            <select style={S.fi} value={usedForPlant} onChange={e=>{setUsedForPlant(e.target.value);setUsedForMachine('')}}>
              <option value="">Select Plant</option>
              <option>Plant 477</option><option>Plant 488</option><option>Plant 433</option>
            </select>
          </div>
          <div style={S.f}><label style={S.lbl}>Machine No.</label>
            <select style={S.fi} value={usedForMachine} onChange={e=>setUsedForMachine(e.target.value)}>
              <option value="">Select Machine</option>
              {(MACH[usedForPlant]||[]).map((m:string)=><option key={m}>{m}</option>)}
            </select>
          </div>
          {(usedFor==='Mould'||usedFor==='Both')&&<div style={S.f}><label style={S.lbl}>Mould (Job No / Name)</label>
            <select style={S.fi} value={usedForMould} onChange={e=>setUsedForMould(e.target.value)}>
              <option value="">-- Select Mould --</option>
              {MOULDS.map(m=><option key={m.code} value={`${m.name} (${m.code})`}>{m.name} ({m.code})</option>)}
            </select>
          </div>}
        </div>
        {usedForMachine&&<div style={{fontSize:11,color:'#276221',fontWeight:600}}>
          ✅ {usedForPlant} — {usedForMachine} {usedForMould?`| ⚙️ ${usedForMould}`:''}
        </div>}
        {(usedFor==='Mould'||usedFor==='Both')&&usedForMould&&<div style={{fontSize:10,color:'#854F0B',marginTop:4,fontWeight:600}}>
          📋 Yeh spare Mould History mein bhi record hoga!
        </div>}
      </div>}

      <div style={S.fr}>
        <div style={S.f}><label style={S.lbl}>Date</label><input type="date" style={S.fi} value={date} onChange={e=>setDate(e.target.value)}/></div>
        <div style={S.f}><label style={S.lbl}>Done By</label><input style={S.fi} value={user.name} disabled/></div>
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
            {action==='Stock In'&&<div style={S.f}><label style={S.lbl}>Price/Pc (₹)</label><input type="number" min="0" style={S.fi} value={item.pricePerPc} onChange={e=>updateItem(i,'pricePerPc',e.target.value)} placeholder="0"/></div>}
          </div>
          {/* Storage Location — only for Stock In */}
          {action==='Stock In'&&<div style={{background:'#F0F4FF',border:'1px solid #1F3864',borderRadius:8,padding:'8px 10px',marginTop:6}}>
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
          </div>}
          {action==='Stock In'&&item.total>0&&<div style={{fontSize:11,color:'#276221',fontWeight:700,marginTop:4}}>Total: ₹{item.total.toLocaleString('en-IN',{maximumFractionDigits:2})}</div>}
        </div>
      ))}
      <button onClick={addItem} style={{width:'100%',padding:8,border:'1.5px dashed #1F3864',borderRadius:8,background:'transparent',color:'#1F3864',fontSize:12,fontWeight:600,cursor:'pointer',marginBottom:10}}>+ Item Add Karo</button>
      <button style={S.sb} onClick={save} disabled={saving}>{saving?'Saving...':'Save Stock Entry'}</button>
      {toast&&<Toast {...toast}/>}
    </div>

    </div>}{/* close entry div */}

    {/* Recent movements tab */}
    {spareView==='movements'&&<div style={S.card}>
      <div style={{fontWeight:700,marginBottom:8,color:'#854F0B',fontSize:13}}>🔄 Recent Movements</div>

      {/* Edit Movement Modal */}
      {editSpare&&editSpare._movement&&canEdit&&<div style={{position:'fixed' as const,inset:0,background:'rgba(0,0,0,0.5)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{background:'#fff',borderRadius:12,padding:20,width:320,maxHeight:'90vh',overflowY:'auto'}}>
          <div style={{fontWeight:700,color:'#1F3864',fontSize:14,marginBottom:12}}>✏️ Edit Movement</div>
          <div style={S.f}><label style={S.lbl}>Part Name</label>
            <input style={S.fi} value={editForm.part_name||''} onChange={e=>setEditForm((p:any)=>({...p,part_name:e.target.value}))}/>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            <div style={S.f}><label style={S.lbl}>Date</label>
              <input type="date" style={S.fi} value={editForm.date||''} onChange={e=>setEditForm((p:any)=>({...p,date:e.target.value}))}/>
            </div>
            <div style={S.f}><label style={S.lbl}>Action</label>
              <select style={S.fi} value={editForm.action||''} onChange={e=>setEditForm((p:any)=>({...p,action:e.target.value}))}>
                <option>Stock In</option><option>Used in Machine</option><option>Stock Out</option>
              </select>
            </div>
            <div style={S.f}><label style={S.lbl}>Qty</label>
              <input type="number" style={S.fi} value={editForm.qty||''} onChange={e=>setEditForm((p:any)=>({...p,qty:e.target.value}))}/>
            </div>
            <div style={S.f}><label style={S.lbl}>Done By</label>
              <input style={S.fi} value={editForm.done_by||''} onChange={e=>setEditForm((p:any)=>({...p,done_by:e.target.value}))}/>
            </div>
          </div>
          <div style={S.f}><label style={S.lbl}>Vendor</label>
            <input style={S.fi} value={editForm.vendor||''} onChange={e=>setEditForm((p:any)=>({...p,vendor:e.target.value}))}/>
          </div>
          <div style={{display:'flex',gap:8,marginTop:12}}>
            <button onClick={async()=>{
              setEditSaving(true)
              await fetch('/api/spares',{method:'PUT',headers:{'Content-Type':'application/json'},
                body:JSON.stringify({id:editSpare.id,_movement:true,...editForm,updatedBy:user.name})
              }).then(r=>r.json())
              setEditSaving(false)
              setEditSpare(null)
              load()
            }} style={{flex:1,background:'#1F3864',color:'#fff',border:'none',borderRadius:6,padding:'8px',fontSize:12,fontWeight:700,cursor:'pointer'}}>
              {editSaving?'Saving...':'✅ Save'}
            </button>
            <button onClick={async()=>{
              if(!confirm('Delete karo yeh movement?')) return
              await fetch('/api/spares?movement_id='+editSpare.id,{method:'DELETE'}).then(r=>r.json())
              setEditSpare(null)
              load()
            }} style={{background:'#FFEBEE',border:'1px solid #C00000',color:'#C00000',borderRadius:6,padding:'8px 12px',fontSize:12,fontWeight:700,cursor:'pointer'}}>🗑️</button>
            <button onClick={()=>setEditSpare(null)} style={{background:'#f0f0f0',border:'none',borderRadius:6,padding:'8px 12px',cursor:'pointer',fontSize:12}}>Cancel</button>
          </div>
        </div>
      </div>}

      {movements.length===0
        ? <div style={{textAlign:'center',color:'#888',padding:24,fontSize:12}}>Koi movement nahi abhi tak</div>
        : <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
            <thead><tr>{['Date','Part','Action','Qty','Machine/Mould','Vendor/By','Stock After',canEdit?'Edit':''].filter(Boolean).map(h=><th key={h} style={{background:'#1F3864',color:'#fff',padding:'6px 8px',textAlign:'left'}}>{h}</th>)}</tr></thead>
            <tbody>{movements.map((m:any,i:number)=>(
              <tr key={i} style={{background:i%2===0?'#FAFAFA':'#fff'}}>
                <td style={{padding:'6px 8px',fontSize:10}}>{m.date}</td>
                <td style={{padding:'6px 8px',fontWeight:600,fontSize:11}}>{m.part_name}</td>
                <td style={{padding:'6px 8px'}}><span style={{background:m.action==='Stock In'?'#E8F5E9':'#FFEBEE',color:m.action==='Stock In'?'#276221':'#C00000',padding:'2px 7px',borderRadius:999,fontSize:10}}>{m.action}</span></td>
                <td style={{padding:'6px 8px',fontWeight:700}}>{m.qty}</td>
                <td style={{padding:'6px 8px',fontSize:10,color:'#1F3864'}}>
                  {m.machine&&<div>⚙️ {m.machine}</div>}
                  {m.mould_name&&<div>🔩 {m.mould_name}</div>}
                  {!m.machine&&!m.mould_name&&'--'}
                </td>
                <td style={{padding:'6px 8px',fontSize:10}}>{m.vendor||m.done_by||'--'}</td>
                <td style={{padding:'6px 8px',fontWeight:700,color:m.new_stock===0?'#C00000':'#276221'}}>{m.new_stock}</td>
                {canEdit&&<td style={{padding:'4px 8px'}}>
                  <button onClick={()=>{setEditSpare({...m,_movement:true});setEditForm({part_name:m.part_name,date:m.date,action:m.action,qty:m.qty,done_by:m.done_by||'',vendor:m.vendor||''})}}
                    style={{background:'#E8EDF5',border:'1px solid #1F3864',borderRadius:4,padding:'2px 8px',fontSize:10,cursor:'pointer',color:'#1F3864',fontWeight:600}}>
                    ✏️
                  </button>
                </td>}
              </tr>
            ))}</tbody>
          </table>
        </div>
      }
    </div>}
  </div>
}

// ─── Quality Tab ──────────────────────────────────────────────
function QualityTab({user}:{user:User}) {
  const [items,setItems]=useState([])
  const [weights,setWeights]=useState([])
  const [loading,setLoading]=useState(true)
  const [saving,setSaving]=useState(false)
  const [toast,setToast]=useState(null)
  const [date,setDate]=useState(nd())
  const [shift,setShift]=useState('Day')
  const [plant,setPlant]=useState('')
  const [qcPerson,setQcPerson]=useState(user.name)
  const [machineData,setMachineData]=useState({})
  const [qualityView,setQualityView]=useState('entry')
  const [reportData,setReportData]=useState([])
  const [reportLoading,setReportLoading]=useState(false)
  const [reportFrom,setReportFrom]=useState(nd())
  const [reportTo,setReportTo]=useState(nd())

  const TIME_SLOTS=['06:00','09:00','12:00','15:00','18:00','21:00']
  const getCurrentSlot=()=>{
    const h=new Date().getHours()
    if(h<9) return '06:00'
    if(h<12) return '09:00'
    if(h<15) return '12:00'
    if(h<18) return '15:00'
    if(h<21) return '18:00'
    return '21:00'
  }
  const [checkTime,setCheckTime]=useState(getCurrentSlot())

  useEffect(()=>{
    Promise.all([
      fetch('/api/ims').then(r=>r.json()).catch(()=>({items:[]})),
      fetch('/api/weights').then(r=>r.json()).catch(()=>({data:[]}))
    ]).then(([imsRes,wtRes])=>{
      setItems(imsRes.items||[])
      setWeights(wtRes.data||[])
      setLoading(false)
    })
  },[])

  const getStdWeight=(product)=>{
    if(!product) return null
    const w=weights.find(w=>
      product.toLowerCase().includes(w.item_name.toLowerCase().split(' container')[0].split(' lid')[0].trim())||
      w.item_name.toLowerCase().includes(product.toLowerCase().split(' ').slice(0,3).join(' '))
    )
    if(!w) return null
    const isLid=product.toLowerCase().includes('lid')
    return isLid?w.lid_weight_g:w.container_weight_g
  }

  const machines=MACH[plant]||[]
  const VIS=['No short shots','No flash','No burn marks','No flow marks','No sink marks','Uniform color','No contamination']
  const DIM=['Wall thickness','Height','Diameter','Lid fit','Stack ability','Drop test']

  const setCheck=(machine,type,idx,val)=>setMachineData(prev=>({...prev,[machine]:{...prev[machine],[type+'_'+idx]:val}}))
  const getCheck=(machine,type,idx)=>machineData[machine]?.[type+'_'+idx]||''
  const setField=(machine,field,val)=>setMachineData(prev=>({...prev,[machine]:{...prev[machine],[field]:val}}))

  const loadReport=async()=>{
    setReportLoading(true)
    const res=await fetch('/api/quality?report=1&from='+reportFrom+'&to='+reportTo).then(r=>r.json()).catch(()=>({data:[]}))
    setReportData(res.data||[])
    setReportLoading(false)
  }

  const save=async()=>{
    if(!plant){setToast({msg:'Plant select karo!',ok:false});return}
    const submittedAt=new Date().toISOString()
    const entries=[]
    const alerts=[]

    for(const machine of machines){
      const d=machineData[machine]||{}
      if(!d.product) continue

      const stdWt=getStdWeight(d.product)
      const actualWt=parseFloat(d.weightActual||'0')||0
      const wtNG=stdWt&&actualWt>0?Math.abs(actualWt-stdWt)>0.3:false
      const hasNG=Object.entries(d).some(([k,v])=>v==='NG')||wtNG

      entries.push({
        date,shift,
        machine:plant+' - '+machine,
        part_name:d.product,
        qc_person:qcPerson,
        mould_code:d.mould?d.mould.split('(')[1]?.replace(')',''):'',
        mould_name:d.mould?d.mould.split('(')[0].trim():'',
        check_time:checkTime,
        submitted_at:submittedAt,
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
        weight_check:actualWt>0?(wtNG?'NG':'OK'):'N/A',
        overall_result:hasNG?'NG':'OK',
        remarks:d.remarks||''
      })

      // Create alert if NG
      if(hasNG){
        const issueList=[]
        VIS.forEach((v,i)=>{ if(getCheck(machine,'vis',i)==='NG') issueList.push(v) })
        DIM.forEach((v,i)=>{ if(getCheck(machine,'dim',i)==='NG') issueList.push(v) })
        if(wtNG) issueList.push('Weight: '+actualWt+'g (std: '+stdWt+'g)')
        alerts.push({
          date,check_time:checkTime,
          machine:plant+' - '+machine,
          plant,
          product:d.product,
          mould_name:d.mould?d.mould.split('(')[0].trim():'',
          mould_code:d.mould?d.mould.split('(')[1]?.replace(')',''):'',
          issues:issueList.join(', '),
          weight_actual:actualWt||null,
          weight_standard:stdWt||null,
          remarks:d.remarks||'',
          qc_person:qcPerson,
          status:'Pending'
        })
      }
    }

    if(entries.length===0){setToast({msg:'Koi machine ka product select nahi!',ok:false});return}
    setSaving(true)

    // Save quality checks
    await fetch('/api/quality',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({entries})}).then(r=>r.json())

    // Save alerts
    if(alerts.length>0){
      await fetch('/api/qcalerts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({alerts})}).then(r=>r.json()).catch(()=>{})
    }

    setSaving(false)
    setToast({msg:entries.length+' machines saved!'+(alerts.length>0?' | '+alerts.length+' NG alerts sent!':''),ok:true})
    if(true) setMachineData({})
  }

  const completedCount=machines.filter(m=>machineData[m]?.product).length
  const ngCount=machines.filter(m=>{
    const d=machineData[m]||{}
    const stdWt=getStdWeight(d.product)
    const actualWt=parseFloat(d.weightActual||'0')||0
    const wtNG=stdWt&&actualWt>0?Math.abs(actualWt-stdWt)>0.3:false
    return Object.values(d).some(v=>v==='NG')||wtNG
  }).length

  const totalChecks=reportData.length
  const ngChecks=reportData.filter(r=>r.overall_result==='NG').length
  const okChecks=reportData.filter(r=>r.overall_result==='OK').length
  const ngPct=totalChecks>0?Math.round(ngChecks/totalChecks*100):0
  const machineNG:{[k:string]:{count:number}}={}
  reportData.filter(r=>r.overall_result==='NG').forEach(r=>{ machineNG[r.machine]={count:(machineNG[r.machine]?.count||0)+1} })
  const topNG=Object.entries(machineNG).sort((a,b)=>b[1].count-a[1].count).slice(0,5)
  const dateWise:{[k:string]:{total:number,ng:number,ok:number}}={}
  reportData.forEach(r=>{
    if(!dateWise[r.date]) dateWise[r.date]={total:0,ng:0,ok:0}
    dateWise[r.date].total++
    if(r.overall_result==='NG') dateWise[r.date].ng++
    else dateWise[r.date].ok++
  })

  const downloadCSV=()=>{
    const headers=['Date','Check Time','Machine','Product','Mould','QC Person','Weight Actual','Weight Std','Short Shots','Flash','Burn','Flow','Sink','Color','Contamination','Wall','Height','Diameter','Lid Fit','Stack','Drop','Weight Check','Overall','Remarks']
    const rows=reportData.map(r=>[r.date,r.check_time||'',r.machine,r.part_name,r.mould_name||'',r.qc_person,r.weight_actual||'',r.weight_standard||'',r.no_short_shots,r.no_flash,r.no_burn_marks,r.no_flow_marks,r.no_sink_marks,r.uniform_color,r.no_contamination,r.wall_thickness,r.height,r.diameter,r.lid_fit,r.stack_ability,r.drop_test,r.weight_check,r.overall_result,r.remarks||''])
    const csv=[headers,...rows].map(r=>r.join(',')).join('\n')
    const blob=new Blob([csv],{type:'text/csv'})
    const url=URL.createObjectURL(blob)
    const a=document.createElement('a')
    a.href=url
    a.download='quality_'+reportFrom+'_to_'+reportTo+'.csv'
    a.click()
  }

  if(loading) return <div style={{textAlign:'center',padding:32,color:'#666'}}>Loading...</div>

  return (
    <div>
      <div style={{display:'flex',gap:6,marginBottom:8}}>
        {[{k:'entry',l:'Entry'},{k:'today',l:'Aaj ki Report'},{k:'report',l:'Date Range'}].map(t=>(
          <button key={t.k} onClick={()=>{setQualityView(t.k);if(t.k==='today'){setReportFrom(nd());setReportTo(nd());setTimeout(()=>loadReport(),100)}}}
            style={{flex:1,padding:'8px',border:'none',borderRadius:8,cursor:'pointer',fontWeight:700,fontSize:12,
              background:qualityView===t.k?'#1F3864':'#F0F0F0',color:qualityView===t.k?'#fff':'#444'}}>
            {t.l}
          </button>
        ))}
      </div>

      {qualityView==='entry'&&<div>
        <div style={S.card}>
          <div style={{fontWeight:700,marginBottom:10,fontSize:14,color:'#1F3864'}}>Quality Check — Every 3 Hours</div>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:11,color:'#666',marginBottom:6}}>Check Slot</div>
            <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
              {TIME_SLOTS.map(slot=>(
                <button key={slot} onClick={()=>setCheckTime(slot)}
                  style={{padding:'5px 12px',borderRadius:999,border:'none',cursor:'pointer',fontSize:11,fontWeight:600,
                    background:checkTime===slot?'#1F3864':'#F0F0F0',color:checkTime===slot?'#fff':'#666'}}>
                  {slot}
                </button>
              ))}
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
            <div style={S.f}><label style={S.lbl}>Date</label><input type="date" style={S.fi} value={date} onChange={e=>setDate(e.target.value)}/></div>
            <div style={S.f}><label style={S.lbl}>Shift</label>
              <select style={S.fi} value={shift} onChange={e=>setShift(e.target.value)}><option>Day</option><option>Night</option></select>
            </div>
            <div style={S.f}><label style={S.lbl}>Plant</label>
              <select style={S.fi} value={plant} onChange={e=>{setPlant(e.target.value);setMachineData({})}}>
                <option value="">Select Plant</option><option>Plant 477</option><option>Plant 488</option><option>Plant 433</option>
              </select>
            </div>
            <div style={S.f}><label style={S.lbl}>QC Person</label>
              <input style={S.fi} value={qcPerson} onChange={e=>setQcPerson(e.target.value)}/>
            </div>
          </div>
          {plant&&<div style={{display:'flex',justifyContent:'space-between',background:ngCount>0?'#FFEBEE':'#FFF9E6',border:'1px solid '+(ngCount>0?'#C00000':'#854F0B'),borderRadius:6,padding:'6px 12px',fontSize:11,fontWeight:600}}>
            <span style={{color:ngCount>0?'#C00000':'#854F0B'}}>Slot: {checkTime} | {completedCount}/{machines.length} complete</span>
            {ngCount>0&&<span style={{color:'#C00000'}}>NG: {ngCount} machines</span>}
          </div>}
        </div>

        {machines.map(machine=>{
          const d=machineData[machine]||{}
          const stdWt=getStdWeight(d.product)
          const actualWt=parseFloat(d.weightActual||'0')||0
          const wtNG=stdWt&&actualWt>0?Math.abs(actualWt-stdWt)>0.3:false
          const hasNG=Object.values(d).some(v=>v==='NG')||wtNG
          const hasProduct=!!d.product
          return (
            <div key={machine} style={{...S.card,marginBottom:8,border:hasNG?'2px solid #C00000':'1px solid #E0E0E0'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                <span style={{fontWeight:700,color:'#1F3864',fontSize:13}}>{machine}</span>
                {hasProduct
                  ?<span style={{background:hasNG?'#FFEBEE':'#E8F5E9',color:hasNG?'#C00000':'#276221',padding:'2px 10px',borderRadius:999,fontSize:11,fontWeight:600}}>{hasNG?'NG!':'OK'}</span>
                  :<span style={{background:'#F0F0F0',color:'#888',padding:'2px 10px',borderRadius:999,fontSize:11}}>Pending</span>
                }
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:hasProduct?10:0}}>
                <div style={S.f}><label style={S.lbl}>Product</label>
                  <select style={S.fi} value={d.product||''} onChange={e=>setField(machine,'product',e.target.value)}>
                    <option value="">-- Select --</option>
                    {items.map(i=><option key={i.name}>{i.name}</option>)}
                  </select>
                </div>
                <div style={S.f}><label style={S.lbl}>Mould</label>
                  <select style={S.fi} value={d.mould||''} onChange={e=>setField(machine,'mould',e.target.value)}>
                    <option value="">-- Select --</option>
                    {MOULDS.map(m=><option key={m.code} value={m.name+' ('+m.code+')'}>{m.name} ({m.code})</option>)}
                  </select>
                </div>
              </div>
              {hasProduct&&<>
                <div style={{fontSize:11,fontWeight:600,color:'#1F3864',marginBottom:6}}>Visual inspection</div>
                {VIS.map((check,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'4px 0',borderBottom:'1px solid #F5F5F5'}}>
                    <span style={{fontSize:11,flex:1}}>{check}</span>
                    <div style={{display:'flex',gap:4}}>
                      {['OK','NG','N/A'].map(v=>{
                        const val=getCheck(machine,'vis',i)
                        const active=val===v
                        return <button key={v} onClick={()=>setCheck(machine,'vis',i,v)} style={{padding:'3px 8px',fontSize:10,fontWeight:600,cursor:'pointer',borderRadius:999,border:'1px solid '+(active?(v==='OK'?'#276221':v==='NG'?'#C00000':'#666'):'#E0E0E0'),background:active?(v==='OK'?'#E2EFDA':v==='NG'?'#FFEBEE':'#F0F0F0'):'transparent',color:active?(v==='OK'?'#276221':v==='NG'?'#C00000':'#555'):'#aaa'}}>{v}</button>
                      })}
                    </div>
                  </div>
                ))}
                <div style={{fontSize:11,fontWeight:600,color:'#1F3864',margin:'8px 0 6px'}}>Dimensional & functional</div>
                {DIM.map((check,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'4px 0',borderBottom:'1px solid #F5F5F5'}}>
                    <span style={{fontSize:11,flex:1}}>{check}</span>
                    <div style={{display:'flex',gap:4}}>
                      {['OK','NG'].map(v=>{
                        const val=getCheck(machine,'dim',i)
                        const active=val===v
                        return <button key={v} onClick={()=>setCheck(machine,'dim',i,v)} style={{padding:'3px 8px',fontSize:10,fontWeight:600,cursor:'pointer',borderRadius:999,border:'1px solid '+(active?(v==='OK'?'#276221':'#C00000'):'#E0E0E0'),background:active?(v==='OK'?'#E2EFDA':'#FFEBEE'):'transparent',color:active?(v==='OK'?'#276221':'#C00000'):'#aaa'}}>{v}</button>
                      })}
                    </div>
                  </div>
                ))}

                {/* Weight Check */}
                <div style={{background:wtNG?'#FFEBEE':'#F0F7FF',border:'1px solid '+(wtNG?'#C00000':'#1F3864'),borderRadius:8,padding:10,marginTop:8}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                    <div style={{fontSize:11,fontWeight:700,color:'#1F3864'}}>Weight Check</div>
                    {stdWt&&<div style={{fontSize:10,color:'#666'}}>Standard: {stdWt}g | Tolerance: ±0.3g</div>}
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <input type="number" step="0.1" style={{...S.fi,flex:1,marginBottom:0}} value={d.weightActual||''} onChange={e=>setField(machine,'weightActual',e.target.value)} placeholder="Actual weight (grams)"/>
                    <span style={{fontSize:12,color:'#666',whiteSpace:'nowrap'}}>g</span>
                    {d.weightActual&&stdWt&&<span style={{background:wtNG?'#FFEBEE':'#E8F5E9',color:wtNG?'#C00000':'#276221',padding:'3px 10px',borderRadius:999,fontSize:11,fontWeight:700,whiteSpace:'nowrap'}}>{wtNG?'NG':'OK'}</span>}
                  </div>
                  {wtNG&&<div style={{fontSize:10,color:'#C00000',marginTop:4}}>Diff: {Math.abs(actualWt-(stdWt||0)).toFixed(1)}g — tolerance exceeded!</div>}
                </div>

                <div style={{marginTop:8}}>
                  <label style={S.lbl}>Remarks (cavity no., issue details)</label>
                  <textarea style={{...S.fi,height:50,resize:'none' as const}} value={d.remarks||''} onChange={e=>setField(machine,'remarks',e.target.value)} placeholder="e.g. Cavity 13 flash, cavity 9 dhaga aa rha..."/>
                </div>
              </>}
            </div>
          )
        })}

        {plant&&machines.length>0&&<>
          <button style={S.sb} onClick={save} disabled={saving}>{saving?'Saving...':'Save Quality Check — '+checkTime+(ngCount>0?' ('+ngCount+' NG alerts jayenge)':'')}</button>
          {toast&&<Toast {...toast}/>}
        </>}
      </div>}

      {(qualityView==='today'||qualityView==='report')&&<div>
        {qualityView==='report'&&<div style={S.card}>
          <div style={{fontWeight:700,color:'#1F3864',fontSize:13,marginBottom:10}}>Date Range</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr auto',gap:8,alignItems:'end'}}>
            <div style={S.f}><label style={S.lbl}>From</label><input type="date" style={S.fi} value={reportFrom} onChange={e=>setReportFrom(e.target.value)}/></div>
            <div style={S.f}><label style={S.lbl}>To</label><input type="date" style={S.fi} value={reportTo} onChange={e=>setReportTo(e.target.value)}/></div>
            <button onClick={loadReport} style={{...S.sb,margin:0,padding:'8px 16px'}}>Load</button>
          </div>
        </div>}

        {qualityView==='today'&&<div style={{...S.card,background:'#E8EDF5',marginBottom:8}}>
          <div style={{fontWeight:700,color:'#1F3864',fontSize:13}}>Aaj ki Quality Report — {nd()}</div>
          <button onClick={loadReport} style={{marginTop:6,background:'#1F3864',color:'#fff',border:'none',borderRadius:6,padding:'4px 12px',fontSize:11,cursor:'pointer'}}>Refresh</button>
        </div>}

        {reportLoading&&<div style={{textAlign:'center',padding:24,color:'#666'}}>Loading...</div>}

        {!reportLoading&&reportData.length>0&&<>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:8}}>
            {[{label:'Total',val:totalChecks,bg:'#E8EDF5',color:'#1F3864'},{label:'OK',val:okChecks,bg:'#E8F5E9',color:'#276221'},{label:'NG',val:ngChecks,bg:'#FFEBEE',color:'#C00000'},{label:'NG%',val:ngPct+'%',bg:'#FFF9E6',color:'#854F0B'}].map((s,i)=>(
              <div key={i} style={{background:s.bg,borderRadius:8,padding:10,textAlign:'center'}}>
                <div style={{fontSize:20,fontWeight:700,color:s.color}}>{s.val}</div>
                <div style={{fontSize:10,color:s.color,marginTop:2}}>{s.label}</div>
              </div>
            ))}
          </div>
          {topNG.length>0&&<div style={{...S.card,marginBottom:8}}>
            <div style={{fontWeight:700,color:'#C00000',fontSize:12,marginBottom:8}}>Top NG Machines</div>
            {topNG.map((m,i)=>(
              <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'5px 0',borderBottom:'1px solid #F5F5F5'}}>
                <span style={{fontSize:12}}>{m[0]}</span>
                <span style={{background:'#FFEBEE',color:'#C00000',padding:'2px 10px',borderRadius:999,fontSize:11,fontWeight:700}}>{m[1].count} NG</span>
              </div>
            ))}
          </div>}
          {qualityView==='report'&&<div style={{...S.card,marginBottom:8}}>
            <div style={{fontWeight:700,color:'#1F3864',fontSize:12,marginBottom:8}}>Date Wise</div>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
                <thead><tr>{['Date','Total','OK','NG','NG%'].map(h=><th key={h} style={{background:'#1F3864',color:'#fff',padding:'6px 8px',textAlign:'left'}}>{h}</th>)}</tr></thead>
                <tbody>{Object.entries(dateWise).sort((a,b)=>b[0].localeCompare(a[0])).map(([dt,s],i)=>(
                  <tr key={i} style={{background:i%2===0?'#FAFAFA':'#fff'}}>
                    <td style={{padding:'5px 8px',fontWeight:600}}>{dt}</td>
                    <td style={{padding:'5px 8px'}}>{s.total}</td>
                    <td style={{padding:'5px 8px',color:'#276221',fontWeight:600}}>{s.ok}</td>
                    <td style={{padding:'5px 8px',color:'#C00000',fontWeight:600}}>{s.ng}</td>
                    <td style={{padding:'5px 8px',color:s.ng>0?'#C00000':'#276221',fontWeight:700}}>{s.total>0?Math.round(s.ng/s.total*100):0}%</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>}
          <div style={S.card}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
              <div style={{fontWeight:700,color:'#1F3864',fontSize:12}}>Detail ({reportData.length})</div>
              <button onClick={downloadCSV} style={{background:'#276221',color:'#fff',border:'none',borderRadius:6,padding:'5px 12px',fontSize:11,fontWeight:700,cursor:'pointer'}}>CSV Download</button>
            </div>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
                <thead><tr>{['Date','Slot','Machine','Product','Mould','Weight','Overall','Remarks'].map(h=><th key={h} style={{background:'#1F3864',color:'#fff',padding:'5px 8px',textAlign:'left'}}>{h}</th>)}</tr></thead>
                <tbody>{reportData.map((r,i)=>(
                  <tr key={i} style={{background:r.overall_result==='NG'?'#FFF5F5':i%2===0?'#FAFAFA':'#fff'}}>
                    <td style={{padding:'5px 8px',fontWeight:600}}>{r.date}</td>
                    <td style={{padding:'5px 8px',color:'#854F0B'}}>{r.check_time||'--'}</td>
                    <td style={{padding:'5px 8px'}}>{r.machine}</td>
                    <td style={{padding:'5px 8px',color:'#854F0B'}}>{r.part_name}</td>
                    <td style={{padding:'5px 8px',fontSize:10}}>{r.mould_name||'--'}</td>
                    <td style={{padding:'5px 8px',fontSize:10,color:r.weight_check==='NG'?'#C00000':'#276221'}}>{r.weight_check||'--'}</td>
                    <td style={{padding:'5px 8px'}}><span style={{background:r.overall_result==='NG'?'#FFEBEE':'#E8F5E9',color:r.overall_result==='NG'?'#C00000':'#276221',padding:'2px 8px',borderRadius:999,fontSize:10,fontWeight:700}}>{r.overall_result}</span></td>
                    <td style={{padding:'5px 8px',fontSize:10,color:'#666',maxWidth:120,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.remarks||'--'}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        </>}
        {!reportLoading&&reportData.length===0&&<div style={{...S.card,textAlign:'center',color:'#888',padding:32}}>Koi data nahi</div>}
      </div>}
    </div>
  )
}


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
        <datalist id="sales-party-list">{parties.map(p=><option key={p.name} value={p.name}/>)}</datalist>
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
    const res=await fetch('/api/planning',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
      date:form.plannedDate,shift:form.shift,
      plant:form.plant,machine:form.machine,product:form.product,
      plannedQty:form.plannedQty,priority:form.priority,notes:form.notes,
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
    'Admin':'mis,ims,production,planning,quality,rejection,mouldchange,dispatch,batch,sales,spares,mouldpm,breakdown,reports,users,performance,qcalerts,processcheck',
    'Process Coordinator':'processcheck,mis,production,quality,rejection,breakdown,mouldpm,reports',
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
  const PTABS=[
    {id:'mis',label:'📊 MIS Dashboard'},
    {id:'kra',label:'👤 KRA Report'},
    {id:'weekly',label:'Weekly Score'},
    {id:'increment',label:'Increment Calc'}
  ]

  return <div>
    <div style={{display:'flex',gap:6,marginBottom:12,flexWrap:'wrap' as const}}>
      {PTABS.map(t=><button key={t.id} style={activePerf===t.id?S.nbA:S.nb} onClick={()=>setActivePerf(t.id)}>{t.label}</button>)}
    </div>
    {activePerf==='mis'&&<MISDashboard/>}
    {activePerf==='kra'&&<KRAReport user={user}/>}
    {activePerf==='weekly'&&<WeeklyScoreForm user={user}/>}
    {activePerf==='increment'&&<IncrementCalc/>}
  </div>
}

function WeeklyScoreForm({user}:{user:User}) {
  const [emp,setEmp]=useState('')
  const [fromDate,setFromDate]=useState(()=>{
    const d=new Date(); d.setDate(d.getDate()-7); return d.toISOString().slice(0,10)
  })
  const [toDate,setToDate]=useState(()=>new Date().toISOString().slice(0,10))
  const [autoData,setAutoData]=useState<any>(null)
  const [loading,setLoading]=useState(false)
  const [manualScores,setManualScores]=useState({attendance:'',safety:'',behaviour:''})
  const [remarks,setRemarks]=useState('')
  const [toast,setToast]=useState<{msg:string,ok:boolean}|null>(null)

  const selEmp=PERF_EMP.find(e=>e.id===emp)

  const loadAutoData=async(empName:string)=>{
    if(!empName||!fromDate||!toDate) return
    setLoading(true)
    const res=await fetch(`/api/performance?operator=${encodeURIComponent(empName)}&from=${fromDate}&to=${toDate}`).then(r=>r.json())
    setLoading(false)
    if(res.success) setAutoData(res)
  }

  const onEmpChange=(id:string)=>{
    setEmp(id)
    setAutoData(null)
    const found=PERF_EMP.find(e=>e.id===id)
    if(found) loadAutoData(found.name)
  }

  const onDateChange=()=>{
    if(emp&&selEmp) loadAutoData(selEmp.name)
  }

  // Calculate total score
  const calcTotal=()=>{
    if(!autoData) return 0
    const prod=autoData.production
    const mc=autoData.mouldChange
    const pm=autoData.mouldPM
    const att=parseFloat(manualScores.attendance||'0')
    const saf=parseFloat(manualScores.safety||'0')
    const beh=parseFloat(manualScores.behaviour||'0')

    // Weights for Operator
    let total=0, weight=0
    // Auto scores
    if(prod.entries>0){
      total += prod.rejScore * 25  // Rejection 25%
      total += prod.downtimeScore * 15  // Downtime 15%
      weight += 40
    }
    if(mc.total>0){
      total += (mc.score||0) * 15  // Mould change 15%
      weight += 15
    }
    // Manual scores
    if(att>0){ total += att*20; weight+=20 }  // Attendance 20%
    if(saf>0){ total += saf*10; weight+=10 }  // Safety 10%
    if(beh>0){ total += beh*15; weight+=15 }  // Behaviour 15%

    return weight>0 ? Math.round(total/weight) : 0
  }

  const totalScore=calcTotal()
  const grade=totalScore>=90?'A':totalScore>=75?'B':totalScore>=60?'C':totalScore>=50?'D':'F'
  const gradeCol=totalScore>=90?'#276221':totalScore>=75?'#854F0B':totalScore>=60?'#0C447C':totalScore>=50?'#C2185B':'#C00000'

  const ScoreBox=({label,score,detail,auto}:{label:string,score:number|null,detail:string,auto:boolean})=>{
    const col=score===null?'#666':score>=8?'#276221':score>=6?'#854F0B':score>=4?'#C2185B':'#C00000'
    return <div style={{background:score===null?'#F5F5F5':score>=8?'#E8F5E9':score>=6?'#FFF3E0':score>=4?'#FCE4EC':'#FFEBEE',border:`1px solid ${col}`,borderRadius:8,padding:'8px 10px',marginBottom:8}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <div style={{fontSize:11,fontWeight:700,color:col}}>{label} {auto&&<span style={{background:'#1F3864',color:'#fff',fontSize:9,padding:'1px 5px',borderRadius:999,marginLeft:4}}>AUTO</span>}</div>
          <div style={{fontSize:10,color:'#666',marginTop:2}}>{detail}</div>
        </div>
        <div style={{fontSize:22,fontWeight:700,color:col}}>{score===null?'N/A':score+'/10'}</div>
      </div>
    </div>
  }

  return <div style={S.card}>
    <div style={{fontWeight:700,marginBottom:10}}>Weekly Scorecard — Auto Calculate</div>
    
    {/* Employee + Date */}
    <div style={S.f}><label style={S.lbl}>Employee</label>
      <select style={S.fi} value={emp} onChange={e=>onEmpChange(e.target.value)}>
        <option value="">-- Select Employee --</option>
        {PERF_EMP.map(e=><option key={e.id} value={e.id}>{e.name} ({e.role})</option>)}
      </select>
    </div>
    <div style={S.fr}>
      <div style={S.f}><label style={S.lbl}>From Date</label><input type="date" style={S.fi} value={fromDate} onChange={e=>{setFromDate(e.target.value);setTimeout(onDateChange,100)}}/></div>
      <div style={S.f}><label style={S.lbl}>To Date</label><input type="date" style={S.fi} value={toDate} onChange={e=>{setToDate(e.target.value);setTimeout(onDateChange,100)}}/></div>
    </div>

    {loading&&<div style={{textAlign:'center',padding:16,color:'#666'}}>Loading data...</div>}

    {autoData&&emp&&<div>
      {/* Auto-calculated scores */}
      <div style={{background:'#E6F1FB',border:'1px solid #1F3864',borderRadius:8,padding:'8px 12px',marginBottom:10}}>
        <div style={{fontSize:11,fontWeight:700,color:'#1F3864',marginBottom:6}}>
          🤖 Auto-Calculated — {autoData.period.from} to {autoData.period.to}
        </div>
        <div style={{fontSize:10,color:'#666'}}>
          Total Entries: {autoData.production.entries} | 
          Good: {autoData.production.totalGood.toLocaleString()} | 
          Rej: {autoData.production.rejPct}% | 
          Avg Downtime: {autoData.production.avgDown} min
        </div>
      </div>

      <ScoreBox
        label="Rejection Rate"
        score={autoData.production.entries>0?autoData.production.rejScore:null}
        detail={`${autoData.production.rejPct}% rejection (${autoData.production.totalRej.toLocaleString()} pcs)`}
        auto={true}
      />
      <ScoreBox
        label="Downtime Score"
        score={autoData.production.entries>0?autoData.production.downtimeScore:null}
        detail={`Avg ${autoData.production.avgDown} min/shift downtime`}
        auto={true}
      />
      <ScoreBox
        label="Mould Change On-Time"
        score={autoData.mouldChange.score}
        detail={autoData.mouldChange.total>0?`${autoData.mouldChange.onTime}/${autoData.mouldChange.total} on time (${autoData.mouldChange.onTimePct}%)`:'Koi mould change nahi is period mein'}
        auto={true}
      />
      {autoData.mouldPM.total>0&&<ScoreBox
        label="Mould PM Done"
        score={autoData.mouldPM.score}
        detail={`${autoData.mouldPM.ok}/${autoData.mouldPM.total} OK result`}
        auto={true}
      />}

      {/* Manual scores */}
      <div style={{background:'#FFF9E6',border:'1px solid #F4B942',borderRadius:8,padding:'10px 12px',marginBottom:10}}>
        <div style={{fontSize:11,fontWeight:700,color:'#854F0B',marginBottom:8}}>✏️ Manual Scores (Aap denge — 0 to 10)</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
          <div style={S.f}>
            <label style={S.lbl}>Attendance (0-10)</label>
            <input type="number" min="0" max="10" step="0.5" style={S.fi} value={manualScores.attendance} onChange={e=>setManualScores(p=>({...p,attendance:e.target.value}))} placeholder="0-10"/>
            <div style={{fontSize:9,color:'#666',marginTop:2}}>10=100%, 8=96%, 6=90%</div>
          </div>
          <div style={S.f}>
            <label style={S.lbl}>Safety (0-10)</label>
            <input type="number" min="0" max="10" step="0.5" style={S.fi} value={manualScores.safety} onChange={e=>setManualScores(p=>({...p,safety:e.target.value}))} placeholder="0-10"/>
            <div style={{fontSize:9,color:'#666',marginTop:2}}>10=No incidents</div>
          </div>
          <div style={S.f}>
            <label style={S.lbl}>Behaviour (0-10)</label>
            <input type="number" min="0" max="10" step="0.5" style={S.fi} value={manualScores.behaviour} onChange={e=>setManualScores(p=>({...p,behaviour:e.target.value}))} placeholder="0-10"/>
            <div style={{fontSize:9,color:'#666',marginTop:2}}>10=Excellent</div>
          </div>
        </div>
      </div>

      {/* Total Score */}
      {totalScore>0&&<div style={{background:'#1F3864',borderRadius:10,padding:'12px 16px',marginBottom:10,display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,textAlign:'center'}}>
        <div><div style={{fontSize:10,color:'#90A8C8'}}>Total Score</div><div style={{fontSize:28,fontWeight:700,color:'#FFD966'}}>{totalScore}%</div></div>
        <div><div style={{fontSize:10,color:'#90A8C8'}}>Grade</div><div style={{fontSize:28,fontWeight:700,color:gradeCol,background:'#fff',borderRadius:6,margin:'0 auto',width:40,height:40,display:'flex',alignItems:'center',justifyContent:'center'}}>{grade}</div></div>
        <div><div style={{fontSize:10,color:'#90A8C8'}}>Period</div><div style={{fontSize:11,color:'#fff',marginTop:4}}>{fromDate}<br/>to<br/>{toDate}</div></div>
      </div>}

      <div style={S.f}><label style={S.lbl}>Remarks</label><input style={S.fi} value={remarks} onChange={e=>setRemarks(e.target.value)} placeholder="Any observations..."/></div>
      <button style={S.sb} onClick={()=>setToast({msg:`Score saved! ${selEmp?.name}: ${totalScore}% Grade ${grade}`,ok:true})}>
        💾 Save Weekly Score
      </button>
      {toast&&<div style={{...S.card,background:toast.ok?'#276221':'#C00000',color:'#fff',textAlign:'center',marginTop:8}}>{toast.msg}</div>}
    </div>}

    {!autoData&&!loading&&emp&&<div style={{textAlign:'center',padding:16,color:'#666',fontSize:12}}>
      Date range select karo → data automatically load hoga!
    </div>}
    {!emp&&<div style={{textAlign:'center',padding:16,color:'#666',fontSize:12}}>
      Pehle employee select karo! 👆
    </div>}
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
      const dayData = (r1.data||[]).filter(r=>r.shift?.includes('Day'))
      const nightData = (r1.data||[]).filter(r=>r.shift?.includes('Night'))
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
        p1: calcSummary((r1.data||[]).filter(r=>r.plant===p)),
        p2: calcSummary((r2?.data||[]).filter(r=>r.plant===p))
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

    records.forEach(r=>{
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

// ─── MIS Alerts Section ───────────────────────────────────────
function MISAlertsSection() {
  const [sending,setSending]=useState<string|null>(null)
  const [results,setResults]=useState<Record<string,{msg:string,ok:boolean}>>({})

  const sendAlert=async(type:string,label:string)=>{
    setSending(type)
    const res=await fetch('/api/alerts',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({type})
    }).then(r=>r.json()).catch(()=>({success:false,msg:'Error!'}))
    setSending(null)
    setResults(p=>({...p,[type]:{msg:res.msg,ok:res.success}}))
  }

  const ALERTS=[
    {type:'daily_report',icon:'📊',label:'Daily Report',desc:'Aaj ki poori production summary — Nitin, Ranjan ko',color:'#1F3864'},
    {type:'breakdown_alert',icon:'🚨',label:'Breakdown Alert Test',desc:'Prince, Rohit, Ranjan ko alert',color:'#C00000'},
    {type:'pm_overdue_alert',icon:'⚙️',label:'PM Overdue Alert',desc:'Overdue moulds ki list — Maintenance ko',color:'#854F0B'},
    {type:'stock_alert',icon:'📦',label:'Stock Critical Alert',desc:'Critical stock items — Admin ko',color:'#276221'},
  ]

  return <div>
    <div style={S.card}>
      <div style={{fontWeight:700,marginBottom:4}}>📧 Email Alerts</div>
      <div style={{fontSize:11,color:'#666',marginBottom:12}}>Manual alerts bhejne ke liye — Automatic alerts breakdown report karne pe jaati hain!</div>
      
      {ALERTS.map(alert=>(
        <div key={alert.type} style={{background:'#F8F9FF',border:'1px solid #E0E8FF',borderRadius:8,padding:12,marginBottom:8}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:alert.color}}>{alert.icon} {alert.label}</div>
              <div style={{fontSize:11,color:'#666',marginTop:2}}>{alert.desc}</div>
              {results[alert.type]&&<div style={{fontSize:11,color:results[alert.type].ok?'#276221':'#C00000',marginTop:4,fontWeight:600}}>
                {results[alert.type].ok?'✅':'❌'} {results[alert.type].msg}
              </div>}
            </div>
            <button 
              onClick={()=>sendAlert(alert.type,alert.label)}
              disabled={sending===alert.type}
              style={{background:alert.color,color:'#fff',border:'none',borderRadius:6,padding:'8px 16px',fontSize:12,fontWeight:600,cursor:'pointer',flexShrink:0,marginLeft:10}}
            >
              {sending===alert.type?'Sending...':'Send Email'}
            </button>
          </div>
        </div>
      ))}
    </div>

    <div style={{...S.card,background:'#FFF9E6',border:'1px solid #F4B942'}}>
      <div style={{fontWeight:700,color:'#854F0B',marginBottom:8}}>📋 Emails List</div>
      <div style={{fontSize:11,color:'#666'}}>
        <div style={{marginBottom:4}}>✅ <strong>Nitin</strong> — nitin.nagpall@gmail.com</div>
        <div style={{marginBottom:4}}>✅ <strong>Ranjan</strong> — ranjan.spipl@gmail.com</div>
        <div style={{marginBottom:4}}>✅ <strong>Prince</strong> — prince.spipl@gmail.com</div>
        <div style={{marginBottom:4}}>✅ <strong>Rohit</strong> — rohit.spipl@gmail.com</div>
        <div style={{marginBottom:4}}>✅ <strong>Karan</strong> — karan.khattar.980@gmail.com</div>
        <div style={{marginBottom:4}}>✅ <strong>Ankush</strong> — ankush.nagpall@gmail.com</div>
        <div style={{marginBottom:4}}>✅ <strong>Deepak</strong> — deepak.spipl@gmail.com</div>
        <div style={{marginBottom:4}}>✅ <strong>Alok</strong> — alok.spipl@gmail.com</div>
        <div style={{marginBottom:4}}>✅ <strong>Uday</strong> — uday.spipl@gmail.com</div>
        <div style={{marginBottom:4}}>✅ <strong>Rahul</strong> — rahulnew.spipl@gmail.com</div>
      </div>
    </div>
  </div>
}

// ─── Maintenance Checklist Data ───────────────────────────────
const MAINT_CHECKS: Record<string, Record<string, string[][]>> = {
  Daily: {
    "⚡ Electric Drive System": [
      ["Check servo motor status on HMI — no fault/alarm", "HMI Display", "Green status, no fault code"],
      ["Check servo drive temperature", "HMI / Temp Gun", "Max 70°C"],
      ["Check regenerative resistor — no burning smell", "Visual + Smell", "No burn smell"],
      ["Check encoder cable — no damage, no kink", "Visual", "Cable intact"],
      ["Check UPS / power supply indicator lights", "Visual", "All green, no fault"],
    ],
    "🔧 Mechanical Checks": [
      ["Check tie bar condition — no crack, no damage", "Visual", "No damage, no scoring"],
      ["Check ball screw lubrication — grease level", "Visual / Touch", "Lightly greased, not dry"],
      ["Check linear guide — smooth movement", "Manual Test", "No jerks, smooth sliding"],
      ["Check platen movement — smooth, no vibration", "Test Run", "Smooth, no noise"],
      ["Check mould clamping — proper alignment", "Visual + Test", "Properly clamped"],
      ["Check ejector system — smooth movement", "Test Cycle", "Forward/backward smooth"],
      ["Check hopper — no blockage, material flowing", "Visual", "Material freely flowing"],
      ["Check nozzle — no drool, no carbonized material", "Visual", "Clean nozzle tip"],
      ["Check toggle mechanism — no unusual noise", "Listen during cycle", "No grinding, no clicking"],
    ],
    "🌡️ Heating System": [
      ["Check all barrel zone temperatures", "HMI Screen", "Set point ±5°C"],
      ["Check nozzle temperature", "HMI Screen", "Set point ±5°C"],
      ["Check heater band condition — no burn marks", "Visual", "No physical damage"],
    ],
    "💧 Cooling System": [
      ["Check cooling water flow — mould + barrel", "Visual + Flow Meter", "Proper flow"],
      ["Check water temperature in and out", "Temp Gun", "In: 25–30°C, Out: max 40°C"],
      ["Check for water leaks near mould area", "Visual", "No leak"],
    ],
    "🔒 Safety Checks": [
      ["Test emergency stop button", "Press E-Stop", "Machine turant rukni chahiye"],
      ["Check safety door — interlock working", "Test", "Door khula ho toh cycle na chale"],
      ["Check all machine guards — in place", "Visual", "Koi guard missing nahi"],
      ["Clean machine exterior", "Cloth / Air", "Clean and dry machine body"],
    ],
    "💧 Hydraulic — Milacron Only": [
      ["Check hydraulic oil level in tank", "Oil Level Sight Glass", "Min mark pe hona chahiye"],
      ["Check oil temperature", "Oil Temp Gauge", "40–55°C Normal, Max 60°C"],
      ["Check for hydraulic oil leaks", "Visual Inspection", "Koi bhi leak nahi"],
      ["Check hydraulic pump — unusual noise", "Listen", "No grinding, no squealing"],
      ["Check lubrication oil level", "Visual", "Half ya upar hona chahiye"],
    ],
  },
  Weekly: {
    "⚡ Electric System": [
      ["Check servo drive fault history log", "HMI Screen", "No recurring faults"],
      ["Check all servo motor connections — tighten", "Spanner Check", "No loose connectors"],
      ["Clean servo drive cooling vents", "Compressed Air", "No dust blockage"],
      ["Clean control panel filter", "Remove + Clean", "Clean mesh filter"],
      ["Check panel cooling fan", "Visual + Listen", "Fan running, no noise"],
      ["Check power cable condition — no damage", "Visual", "No cuts, no heat damage"],
    ],
    "🔧 Mechanical": [
      ["Grease toggle links and pins", "Grease Gun", "Fresh grease"],
      ["Grease platen guide rails", "Grease Gun", "Even coating"],
      ["Grease ball screws — injection + clamping", "Grease Gun", "As per manual"],
      ["Check tie bar nuts — tighten if required", "Torque Wrench", "As per machine spec"],
      ["Check shot weight — 5 shots weigh karo", "Weighing Scale", "±2% variation max"],
      ["Lubricate ejector pins and guide bushes", "Oil / Grease", "Light lubrication"],
    ],
    "🌡️ Heating": [
      ["Check heater band resistance — all zones", "Multimeter", "Within 5% of rated"],
      ["Check thermocouple readings", "HMI Screen", "Consistent readings"],
    ],
    "💧 Cooling": [
      ["Check chiller water temperature setting", "Chiller Display", "As per product"],
      ["Clean mould cooling water filter", "Remove + Clean", "No blockage"],
      ["Check cooling hose connections — no leaks", "Visual", "All connections tight"],
    ],
    "🧹 Cleaning": [
      ["Purge barrel — clean material", "Purging Compound", "Clean purge material"],
      ["Clean mould area — debris remove karo", "Compressed Air + Cloth", "Clean and dry"],
    ],
    "💧 Hydraulic — Milacron Only": [
      ["Check hydraulic oil condition — color check", "Visual", "Golden/amber — not dark"],
      ["Check all hydraulic hose connections", "Spanner Check", "No loose connections"],
      ["Check hydraulic filter indicator", "Visual", "Green=OK, Red=Change now"],
      ["Check system pressure — relief valve", "Pressure Gauge", "As per machine spec"],
    ],
  },
  Monthly: {
    "⚡ Electric System": [
      ["Check servo motor insulation — megger test", "Megger Tester (500V)", "Min 1 MΩ per phase"],
      ["Tighten all electrical connections — full panel", "Torque Screwdriver", "As per OEM spec"],
      ["Check servo drive parameters", "HMI + Drive Display", "No drift from settings"],
      ["Check PLC backup battery voltage", "Multimeter / HMI", "Replace if < 3.0V"],
      ["Thermal scan of panel — hot spots check", "Thermal Camera / Temp Gun", "No spot > 60°C"],
      ["Test all interlocks — complete safety test", "Function Test", "All working"],
    ],
    "🔧 Mechanical": [
      ["Measure tie bar diameter — wear check", "Vernier Caliper", "Within ±0.1mm"],
      ["Check screw and barrel wear", "Micrometer", "Wear < 0.5mm from original"],
      ["Check clamping force — actual vs set", "Dial Gauge", "±3% variation max"],
      ["Lubricate all grease points — complete", "Grease Gun", "All points covered"],
      ["Check ball screw end bearings — play check", "Dial Gauge", "No axial play"],
    ],
    "🌡️ Temperature": [
      ["Calibrate all thermocouples", "Reference Thermometer", "±2°C accuracy"],
      ["Check heater band wattage", "Clamp Meter", "Within 5% of rated"],
    ],
    "🔒 Safety": [
      ["Test emergency stop circuit — full test", "Function Test", "Immediate stop < 0.5 sec"],
      ["Check safety door interlock circuit", "Function Test", "Machine stops immediately"],
      ["Test all limit switches", "Function Test", "Proper actuation at position"],
    ],
    "💧 Hydraulic — Milacron Only": [
      ["Change hydraulic filter element", "Replace", "New element"],
      ["Check hydraulic pump flow", "Flow Meter", "Within 5% of rated"],
      ["Check all proportional valves", "Test Equipment", "As per machine spec"],
      ["Check accumulator pre-charge pressure", "N2 Pressure Gauge", "As per spec"],
    ],
  },
  Quarterly: {
    "⚡ Electric — Quarterly": [
      ["Complete motor performance test — speed, torque", "Test Equipment", "Within 5% of rated"],
      ["Check and recalibrate servo drive parameters", "Drive Software", "As per OEM baseline"],
      ["Inspect servo motor bearings — vibration analysis", "Vibration Analyzer", "< 4.5 mm/s RMS"],
      ["Check earthing / grounding connections", "Earth Tester", "< 1 Ohm resistance"],
      ["Calibrate all analog I/O cards", "Calibration Equipment", "As per specification"],
      ["Full thermography scan — complete panel", "Thermal Camera", "No hot spot > 70°C"],
      ["Check and test UPS full load test", "Load Bank Test", "Min 30 min backup"],
    ],
    "🔧 Mechanical — Quarterly": [
      ["Complete screw and barrel dimensional check", "Micrometer + Vernier", "Screw wear < 1mm"],
      ["Check platen parallelism — 4 corner measurement", "Dial Gauge", "Max 0.05mm difference"],
      ["Check toggle pin and bush clearance", "Feeler Gauge", "Replace if > 0.3mm"],
      ["Ball screw backlash measurement", "Dial Gauge", "< 0.05mm backlash"],
      ["Linear guide preload check — adjust if needed", "Torque Check", "As per OEM spec"],
      ["Inspect and replace grease in all linear guides", "Full Grease Change", "Remove old, add fresh"],
    ],
    "📋 Performance Test": [
      ["Dry cycle time test — compare with baseline", "Stopwatch", "Within 5% of baseline"],
      ["Shot weight repeatability — 20 shots test", "Weighing Scale", "CV < 0.3%"],
      ["Temperature stability test — all zones 30 min", "Data Logger", "±2°C stability"],
      ["Clamp speed accuracy test", "HMI + Timer", "Within 5% of set speed"],
    ],
    "💧 Hydraulic — Milacron Only": [
      ["Oil sample lab analysis", "Oil Sample Kit", "Send to lab — TAN, viscosity, particles"],
      ["Check hydraulic cylinder seals", "Visual + Leak Test", "No rod seal leakage"],
      ["Check clamping cylinder — measure rod", "Vernier Caliper", "No scoring on rod"],
      ["Flush and clean oil cooler completely", "Chemical Flush", "No scale, proper flow"],
    ],
  },
  "Half Yearly": {
    "⚡ Major Electric — 6 Monthly": [
      ["Replace PLC backup battery (preventive)", "Battery Replacement", "New OEM battery"],
      ["Overhaul servo drives — capacitor check", "Visual + ESR Meter", "No bulging capacitors"],
      ["Replace panel cooling fans if age > 2 years", "Replace", "New fan — prevent failure"],
      ["Calibrate all sensors and transducers", "Reference Instrument", "As per specification"],
      ["Inspect servo motor winding — thermal imaging", "Thermal Camera", "No hot spots"],
      ["Check encoder accuracy — position test", "Laser Measurement", "Error < 0.01mm"],
    ],
    "🔧 Major Mechanical — 6 Monthly": [
      ["Complete screw/barrel/check ring replace if worn", "Measurement Based", "Replace when > OEM limit"],
      ["Replace toggle pins and bushes if clearance > 0.3mm", "Measurement Based", "New OEM pins + bushes"],
      ["Replace all linear guide blocks if worn", "Preload Check", "New blocks if preload lost"],
      ["Replace ball screw nut if backlash > 0.1mm", "Backlash Measurement", "New ball nut assembly"],
      ["Check and align injection unit centerline", "Dial Gauge", "< 0.05mm misalignment"],
      ["Replace ejector rod seals and guide bushes", "Preventive Replacement", "New seals throughout"],
    ],
    "🌡️ Heating System — 6 Monthly": [
      ["Replace heater bands if resistance drift > 10%", "Measurement Based", "New OEM heater bands"],
      ["Replace thermocouples preventive if age > 2 years", "Preventive", "New Type-J or Type-K TC"],
      ["Check barrel chrome plating condition", "Visual + Measurement", "No peeling, no scoring"],
    ],
    "💧 Hydraulic — Milacron Only": [
      ["COMPLETE HYDRAULIC OIL CHANGE", "Full Drain + Flush + Refill", "OEM recommended grade"],
      ["Replace hydraulic pump seals", "Seal Kit", "New seals throughout pump"],
      ["Overhaul all proportional valves", "Disassemble + Clean", "New seals, calibrated"],
      ["Replace accumulator bladder if life > 3 years", "Bladder Test", "Proper nitrogen pre-charge"],
      ["Replace all hydraulic hoses", "Visual + Age Check", "New hoses if > 3 years"],
    ],
  },
  Yearly: {
    "⚡ Complete Electric Overhaul": [
      ["Replace ALL servo motors if bearing worn", "Vibration Test + Replace", "New OEM motors"],
      ["Replace all contactors and relays in panel", "Preventive Replacement", "New OEM parts"],
      ["Replace UPS batteries completely", "Replace", "New sealed lead acid / Li-Ion"],
      ["Update PLC and HMI software to latest version", "OEM Software Tool", "Latest stable version"],
      ["Complete panel refurbishment — clean, check all", "Full Inspection + Clean", "No corrosion"],
      ["OEM servo calibration — factory calibration tool", "OEM Calibration Software", "Factory baseline"],
    ],
    "🔧 Complete Mechanical Overhaul": [
      ["FULL MACHINE OVERHAUL — per OEM manual", "Full Disassembly", "Document all measurements"],
      ["Replace screw and barrel if not done in 6 months", "Measurement → Replace", "New OEM injection unit"],
      ["Replace all toggle pins, bushes if worn", "Full Toggle Replacement", "New OEM toggle kit"],
      ["Overhaul injection unit — complete rebuild", "Full Overhaul", "New seals, guides, bearings"],
      ["Replace all linear guide rails if worn", "Measurement → Replace", "New rails + new blocks"],
      ["Replace all ball screws if backlash > limit", "Backlash Test → Replace", "New ball screws"],
      ["Replace all O-rings and seals throughout", "Complete Seal Kit", "New seals — full machine"],
    ],
    "🌡️ Heating System — Annual": [
      ["Replace complete barrel if worn/scored", "Bore Measurement → Replace", "New barrel assembly"],
      ["Replace all heater bands throughout", "Annual Preventive", "New OEM heater bands all zones"],
      ["Replace all thermocouples — full set", "Annual Preventive", "New calibrated TC set"],
      ["Replace nozzle assembly complete", "Visual + Measurement", "New nozzle tip + body"],
    ],
    "📋 Annual Certification": [
      ["Complete machine performance report", "Full Performance Test", "Documented report"],
      ["Electrical safety certification", "Certified Electrician", "Certificate obtained"],
      ["Calibration certificates for all instruments", "Certified Lab", "All certificates renewed"],
      ["Machine accuracy test — repeatability report", "Standard Test Parts", "Within machine spec"],
      ["Update machine history card — complete record", "Documentation", "All work documented"],
      ["OEM service call — annual contract visit", "OEM Engineer", "OEM inspection + sign-off"],
    ],
    "💧 Hydraulic — Milacron Annual": [
      ["FULL HYDRAULIC SYSTEM OVERHAUL", "Complete Disassembly", "As per OEM manual"],
      ["Replace hydraulic pump completely", "Performance Test → Replace", "New OEM pump"],
      ["Replace ALL hydraulic hoses throughout", "Full Replacement", "New hoses — all lengths"],
      ["Clean and inspect hydraulic oil tank", "Full Inspection", "No corrosion, clean tank"],
      ["Test and certify pressure relief valves", "Certified Pressure Test", "Opens at set pressure ±3%"],
    ],
  },
}

// ─── MaintenanceTab ───────────────────────────────────────────
function MaintenanceTab({user}:{user:User}) {
  const [activeFreq,setActiveFreq]=useState('Daily')
  const [plant,setPlant]=useState('')
  const [machine,setMachine]=useState('')
  const [date,setDate]=useState(nd())
  const [shift,setShift]=useState('Day')
  const [results,setResults]=useState<Record<string,{result:string,remarks:string}>>({})
  const [shots,setShots]=useState<any[]>([])
  const [history,setHistory]=useState<any[]>([])
  const [saving,setSaving]=useState(false)
  const [toast,setToast]=useState<{msg:string,ok:boolean}|null>(null)
  const [showHistory,setShowHistory]=useState(false)

  const machines=MACH[plant]||[]
  const isHydraulic=machine.includes('Milacron')

  // Load existing entries
  useEffect(()=>{
    if(machine&&date&&activeFreq){
      fetch(`/api/maintenance?date=${date}&machine=${encodeURIComponent(machine)}&frequency=${activeFreq}`)
        .then(r=>r.json()).then(d=>{
          const r:Record<string,{result:string,remarks:string}>={}
          ;(d.data||[]).forEach((item:any)=>{
            r[`${item.section}||${item.check_point}`]={result:item.result,remarks:item.remarks}
          })
          setResults(r)
          setShots(d.shots||[])
        })
    }
  },[machine,date,activeFreq])

  // Init shots for plant machines
  useEffect(()=>{
    if(plant&&machines.length>0&&activeFreq==='Daily'){
      setShots(prev=>{
        const existing=prev.filter(s=>s.plant===plant)
        const newMachines=machines.filter(m=>!existing.find((s:any)=>s.machine===m))
        return [...existing,...newMachines.map(m=>({machine:m,plant,product:'',mould:'',startCounter:'',endCounter:'',totalCounter:''}))]
      })
    }
  },[plant,machines,activeFreq])

  const getResult=(section:string,check:string)=>results[`${section}||${check}`]?.result||''
  const getRemarks=(section:string,check:string)=>results[`${section}||${check}`]?.remarks||''

  const setResult=(section:string,check:string,result:string)=>{
    setResults(p=>({...p,[`${section}||${check}`]:{result,remarks:p[`${section}||${check}`]?.remarks||''}}))
  }
  const setRemarks=(section:string,check:string,val:string)=>{
    setResults(p=>({...p,[`${section}||${check}`]:{result:p[`${section}||${check}`]?.result||'',remarks:val}}))
  }

  const sections=MAINT_CHECKS[activeFreq]||{}
  const filteredSections=Object.entries(sections).filter(([sec])=>
    isHydraulic?true:!sec.includes('Milacron')
  )

  // Count results
  const allItems=filteredSections.flatMap(([sec,items])=>items.map(i=>`${sec}||${i[0]}`))
  const okCount=allItems.filter(k=>results[k]?.result==='OK').length
  const ngCount=allItems.filter(k=>results[k]?.result==='NG').length
  const naCount=allItems.filter(k=>results[k]?.result==='NA').length
  const doneCount=okCount+ngCount+naCount
  const totalCount=allItems.length

  const save=async()=>{
    if(!plant||!machine){setToast({msg:'Plant aur Machine select karo!',ok:false});return}
    setSaving(true)

    // Save checklist
    const items=filteredSections.flatMap(([sec,checks])=>
      checks.map(c=>({
        section:sec,
        checkPoint:c[0],
        result:results[`${sec}||${c[0]}`]?.result||'Pending',
        remarks:results[`${sec}||${c[0]}`]?.remarks||''
      }))
    )

    const res=await fetch('/api/maintenance',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        type:'checklist',date,frequency:activeFreq,plant,machine,
        machineType:isHydraulic?'Hydraulic':'All Electric',
        doneBy:user.name,items
      })
    }).then(r=>r.json())

    // Save shots if Daily
    if(activeFreq==='Daily'&&shots.length>0){
      await fetch('/api/maintenance',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({type:'shots',date,shift,plant,doneBy:user.name,shots})
      }).then(r=>r.json())
    }

    setSaving(false)
    setToast({msg:res.success?`Checklist saved! ${doneCount}/${totalCount} items done`:res.msg,ok:res.success})
  }

  const FREQS=['Daily','Weekly','Monthly','Quarterly','Half Yearly','Yearly']
  const FREQ_COLORS:Record<string,string>={Daily:'#276221',Weekly:'#2E75B6',Monthly:'#E65100',Quarterly:'#5B2C8D','Half Yearly':'#854F0B',Yearly:'#C00000'}

  return <div>
    {/* Frequency tabs */}
    <div style={{display:'flex',gap:4,marginBottom:8,overflowX:'auto',flexWrap:'wrap' as const}}>
      {FREQS.map(f=><button key={f} onClick={()=>setActiveFreq(f)} style={{
        padding:'6px 10px',border:`2px solid ${FREQ_COLORS[f]}`,borderRadius:6,
        background:activeFreq===f?FREQ_COLORS[f]:'#fff',
        color:activeFreq===f?'#fff':FREQ_COLORS[f],
        fontWeight:700,fontSize:11,cursor:'pointer',whiteSpace:'nowrap' as const
      }}>{f}</button>)}
    </div>

    {/* Machine Selection */}
    <div style={S.card}>
      <div style={{fontWeight:700,color:'#1F3864',marginBottom:10}}>🔧 {activeFreq} Maintenance Checklist</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
        <div style={S.f}><label style={S.lbl}>Date</label>
          <input type="date" style={S.fi} value={date} onChange={e=>setDate(e.target.value)}/>
        </div>
        <div style={S.f}><label style={S.lbl}>Shift</label>
          <select style={S.fi} value={shift} onChange={e=>setShift(e.target.value)}>
            <option>Day</option><option>Night</option>
          </select>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
        <div style={S.f}><label style={S.lbl}>Plant</label>
          <select style={S.fi} value={plant} onChange={e=>{setPlant(e.target.value);setMachine('')}}>
            <option value="">Select Plant</option>
            <option>Plant 477</option><option>Plant 488</option><option>Plant 433</option>
          </select>
        </div>
        <div style={S.f}><label style={S.lbl}>Machine</label>
          <select style={S.fi} value={machine} onChange={e=>setMachine(e.target.value)}>
            <option value="">Select Machine</option>
            {machines.map(m=><option key={m}>{m}</option>)}
          </select>
        </div>
      </div>
      {machine&&<div style={{marginTop:8,background:isHydraulic?'#FFF9E6':'#E6F1FB',border:`1px solid ${isHydraulic?'#854F0B':'#1F3864'}`,borderRadius:6,padding:'6px 10px',fontSize:11,fontWeight:600,color:isHydraulic?'#854F0B':'#1F3864'}}>
        {isHydraulic?'💧 Hydraulic Machine — Extra hydraulic sections included!':'⚡ All Electric Machine — Servo + Ball Screw checks included!'}
      </div>}
    </div>

    {/* Progress */}
    {machine&&<div style={{...S.card,padding:'10px 14px'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
        <span style={{fontSize:12,fontWeight:700,color:'#1F3864'}}>{doneCount}/{totalCount} items done</span>
        <div style={{display:'flex',gap:6}}>
          <span style={{background:'#E8F5E9',color:'#276221',padding:'2px 8px',borderRadius:999,fontSize:10,fontWeight:600}}>✅ OK: {okCount}</span>
          <span style={{background:'#FFEBEE',color:'#C00000',padding:'2px 8px',borderRadius:999,fontSize:10,fontWeight:600}}>❌ NG: {ngCount}</span>
          <span style={{background:'#F5F5F5',color:'#666',padding:'2px 8px',borderRadius:999,fontSize:10,fontWeight:600}}>N/A: {naCount}</span>
        </div>
      </div>
      <div style={{height:8,background:'#F0F0F0',borderRadius:999,overflow:'hidden'}}>
        <div style={{width:`${totalCount>0?Math.round(doneCount/totalCount*100):0}%`,height:'100%',background:ngCount>0?'#C00000':'#276221',borderRadius:999,transition:'width 0.3s'}}/>
      </div>
    </div>}

    {/* Shot Counter — Daily only */}
    {machine&&activeFreq==='Daily'&&<div style={S.card}>
      <div style={{fontWeight:700,color:'#1F3864',marginBottom:10}}>🔢 Machine Shot Counter — {date}</div>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
          <thead><tr>
            {['Machine','Product','Mould','Start Counter','End Counter','Shots This Shift','Total Counter'].map(h=>
              <th key={h} style={{background:'#276221',color:'#fff',padding:'6px 8px',textAlign:'center',whiteSpace:'nowrap' as const}}>{h}</th>)}
          </tr></thead>
          <tbody>{shots.filter((s:any)=>s.plant===plant).map((s:any,i:number)=>{
            const shotsThisShift=(parseFloat(s.endCounter)||0)-(parseFloat(s.startCounter)||0)
            return <tr key={i} style={{background:i%2===0?'#F8F9FF':'#fff'}}>
              <td style={{padding:'6px 8px',fontWeight:700,color:'#1F3864',textAlign:'center'}}>{s.machine}</td>
              {['product','mould'].map(f=><td key={f} style={{padding:3}}>
                <input style={{width:'100%',padding:'4px',border:'1px solid #E0E0E0',borderRadius:4,fontSize:11,textAlign:'center'}}
                  value={s[f]||''} onChange={e=>setShots(prev=>prev.map((sh:any)=>sh.machine===s.machine?{...sh,[f]:e.target.value}:sh))}
                  placeholder={f==='product'?'Product...':'Mould...'}/>
              </td>)}
              {['startCounter','endCounter'].map(f=><td key={f} style={{padding:3}}>
                <input type="number" style={{width:'100%',padding:'4px',border:'1px solid #1F3864',borderRadius:4,fontSize:12,fontWeight:600,textAlign:'center',background:'#FFFDE7'}}
                  value={s[f]||''} onChange={e=>setShots(prev=>prev.map((sh:any)=>sh.machine===s.machine?{...sh,[f]:e.target.value}:sh))}
                  placeholder="0"/>
              </td>)}
              <td style={{padding:'6px 8px',textAlign:'center',fontWeight:700,fontSize:13,color:shotsThisShift>0?'#276221':'#666'}}>
                {shotsThisShift>0?shotsThisShift.toLocaleString():'--'}
              </td>
              <td style={{padding:3}}>
                <input type="number" style={{width:'100%',padding:'4px',border:'1px solid #2E75B6',borderRadius:4,fontSize:12,fontWeight:600,textAlign:'center',background:'#E6F1FB'}}
                  value={s.totalCounter||''} onChange={e=>setShots(prev=>prev.map((sh:any)=>sh.machine===s.machine?{...sh,totalCounter:e.target.value}:sh))}
                  placeholder="Total"/>
              </td>
            </tr>
          })}</tbody>
          {shots.filter((s:any)=>s.plant===plant).length>0&&<tfoot>
            <tr style={{background:'#1F3864'}}>
              <td colSpan={5} style={{padding:'6px 8px',color:'#FFD966',fontWeight:700,textAlign:'right'}}>Total Shots Today:</td>
              <td style={{padding:'6px 8px',color:'#FFD966',fontWeight:700,fontSize:14,textAlign:'center'}}>
                {shots.filter((s:any)=>s.plant===plant).reduce((a:number,s:any)=>{
                  const sh=(parseFloat(s.endCounter)||0)-(parseFloat(s.startCounter)||0)
                  return a+(sh>0?sh:0)
                },0).toLocaleString()}
              </td>
              <td style={{padding:'6px 8px',color:'#90A8C8',textAlign:'center'}}>—</td>
            </tr>
          </tfoot>}
        </table>
      </div>
    </div>}

    {/* Checklist */}
    {machine&&filteredSections.map(([section,items])=>{
      const secOK=items.filter(i=>results[`${section}||${i[0]}`]?.result==='OK').length
      const secNG=items.filter(i=>results[`${section}||${i[0]}`]?.result==='NG').length
      const secBg=section.includes('Milacron')?'#854F0B':FREQ_COLORS[activeFreq]||'#1F3864'
      return <div key={section} style={{...S.card,marginBottom:8}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
          <div style={{fontWeight:700,color:'#1F3864',fontSize:13}}>{section}</div>
          <div style={{display:'flex',gap:4}}>
            {secOK>0&&<span style={{background:'#E8F5E9',color:'#276221',padding:'2px 8px',borderRadius:999,fontSize:10,fontWeight:600}}>✅ {secOK}</span>}
            {secNG>0&&<span style={{background:'#FFEBEE',color:'#C00000',padding:'2px 8px',borderRadius:999,fontSize:10,fontWeight:600}}>❌ {secNG}</span>}
          </div>
        </div>
        {items.map((item,ii)=>{
          const key=`${section}||${item[0]}`
          const res=results[key]?.result||''
          return <div key={ii} style={{background:res==='OK'?'#F0FFF4':res==='NG'?'#FFEBEE':'#FAFAFA',border:`1px solid ${res==='OK'?'#276221':res==='NG'?'#C00000':'#E0E0E0'}`,borderRadius:6,padding:'8px 10px',marginBottom:6}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8}}>
              <div style={{flex:1}}>
                <div style={{fontSize:11,fontWeight:600,marginBottom:2}}>{item[0]}</div>
                <div style={{fontSize:10,color:'#666'}}>🔧 {item[1]} | ✅ {item[2]}</div>
              </div>
              <div style={{display:'flex',gap:4,flexShrink:0}}>
                {['OK','NG','NA'].map(v=><button key={v} onClick={()=>setResult(section,item[0],v)} style={{
                  padding:'4px 10px',fontSize:11,fontWeight:700,cursor:'pointer',
                  border:`2px solid ${v==='OK'?'#276221':v==='NG'?'#C00000':'#666'}`,
                  borderRadius:6,
                  background:res===v?(v==='OK'?'#276221':v==='NG'?'#C00000':'#666'):'transparent',
                  color:res===v?'#fff':(v==='OK'?'#276221':v==='NG'?'#C00000':'#666')
                }}>{v}</button>)}
              </div>
            </div>
            {res==='NG'&&<input value={results[key]?.remarks||''} onChange={e=>setRemarks(section,item[0],e.target.value)}
              placeholder="NG reason / action taken..." 
              style={{width:'100%',marginTop:6,padding:'4px 8px',border:'1px solid #C00000',borderRadius:4,fontSize:11,background:'#FFF9F9'}}/>}
          </div>
        })}
      </div>
    })}

    {machine&&<>
      <button style={S.sb} onClick={save} disabled={saving}>
        {saving?'Saving...':`💾 Save ${activeFreq} Checklist (${doneCount}/${totalCount} done)`}
      </button>
      {toast&&<Toast {...toast}/>}
    </>}

    {!machine&&<div style={{...S.card,textAlign:'center',color:'#666',padding:32}}>
      Plant aur Machine select karo — checklist load hogi! 👆
    </div>}
  </div>
}

// ─── Bulk Production Tab ──────────────────────────────────────
function BulkProductionTab({user}:{user:User}) {
  const [items,setItems]=useState<any[]>([])
  const [loading,setLoading]=useState(true)
  const [saving,setSaving]=useState(false)
  const [toast,setToast]=useState<{msg:string,ok:boolean}|null>(null)
  const [activeView,setActiveView]=useState<'setup'|'entry'|'history'>('entry')
  
  // Common fields
  const [date,setDate]=useState(nd())
  const [shift,setShift]=useState('day')
  const [plant,setPlant]=useState('')
  const [slot,setSlot]=useState('8am-11am')
  
  // Machine setup for today
  const [machineSetup,setMachineSetup]=useState<any[]>([])
  const [setupLoaded,setSetupLoaded]=useState(false)
  
  // Slot entries - each machine can have multiple rows (mould change)
  const [entries,setEntries]=useState<any[]>([])
  
  const addMouldChange=(machine:string)=>{
    const existing=entries.find(e=>e.machine===machine)
    setEntries(prev=>[...prev,{
      machine,product:'',mould:'',cavities:existing?.cavities||'',
      cycleTime:existing?.cycleTime||'',operator:existing?.operator||'',
      operator2:existing?.operator2||'',good:'',rejection:'',down:'',
      remarks:'',status:'running',stopReason:'',editId:null,isMC:true,
      oldMould:existing?.mould||''
    }])
  }
  
  const removeMCRow=(machine:string,idx:number)=>{
    const machineRows=entries.filter(e=>e.machine===machine)
    if(machineRows.length<=1) return
    const globalIdx=entries.indexOf(machineRows[idx])
    setEntries(prev=>prev.filter((_,i)=>i!==globalIdx))
  }
  
  // Today's production history
  const [history,setHistory]=useState<any[]>([])
  const [editingId,setEditingId]=useState<string|null>(null)
  const [editVals,setEditVals]=useState<any>({})

  useEffect(()=>{
    fetch('/api/ims').then(r=>r.json()).then(d=>{setItems(d.items||[]);setLoading(false)})
  },[])

  const machines=MACH[plant]||[]

  // Load setup when plant/date changes
  const loadSetup=async(p:string,d:string)=>{
    if(!p||!d) return
    const res=await fetch(`/api/machine-setup?date=${d}&plant=${p}`).then(r=>r.json())
    const setup=res.setup||[]
    
    if(setup.length>0){
      setMachineSetup(setup)
      setSetupLoaded(true)
      // Init entries from setup
      setEntries(MACH[p]?.map(m=>{
        const s=setup.find((x:any)=>x.machine===m&&x.valid_from_slot===slot)||setup.find((x:any)=>x.machine===m)
        return {machine:m,product:s?.product||'',mould:s?.mould||'',cavities:s?.cavities||'',cycleTime:s?.cycle_time||'',operator:s?.operator||'',operator2:s?.operator2||'',good:'',rejection:'',down:'',remarks:'',status:'running',stopReason:'',editId:null}
      })||[])
    } else {
      setSetupLoaded(false)
      setMachineSetup(MACH[p]?.map(m=>({machine:m,product:'',mould:'',cavities:'',cycleTime:'',operator:'',operator2:'',validFromSlot:'8am-11am'}))||[])
      setEntries(MACH[p]?.map(m=>({machine:m,product:'',mould:'',cavities:'',cycleTime:'',operator:'',operator2:'',good:'',rejection:'',down:'',remarks:'',status:'running',stopReason:'',editId:null}))||[])
    }
  }

  // Load today's history
  const loadHistory=async(p?:string,d?:string)=>{
    const usePlant=p||plant
    const useDate=d||date
    if(!usePlant||!useDate) return
    const res=await fetch(`/api/production?date=${useDate}&plant=${encodeURIComponent(usePlant)}`).then(r=>r.json())
    // Filter strictly by plant
    setHistory((res.data||[]).filter(e=>e.plant===usePlant))
  }

  useEffect(()=>{
    if(plant&&date){loadSetup(plant,date);loadHistory(plant,date)}
  },[plant,date])

  // Update slot in entries when slot changes
  useEffect(()=>{
    if(setupLoaded&&plant){
      setEntries(prev=>prev.map(e=>{
        const s=machineSetup.find((x:any)=>x.machine===e.machine&&x.valid_from_slot===slot)||machineSetup.find((x:any)=>x.machine===e.machine)
        return {...e,product:s?.product||e.product,mould:s?.mould||e.mould,cavities:s?.cavities||e.cavities,cycleTime:s?.cycle_time||e.cycleTime,good:'',rejection:'',down:'',remarks:'',editId:null}
      }))
    }
  },[slot])

  const updateSetup=(machine:string,field:string,val:string)=>{
    setMachineSetup(prev=>prev.map(m=>m.machine===machine?{...m,[field]:val}:m))
    // Also sync entries
    const entryField=field==='cycle_time'?'cycleTime':field
    setEntries(prev=>prev.map(e=>{
      if(e.machine!==machine||e.isMC) return e
      const update:{[k:string]:string}={[entryField]:val}
      if(field==='product'){
        const mould=PRODUCT_MOULD_MAP[val]||''
        if(mould) update.mould=mould
      }
      return {...e,...update}
    }))
  }

  const updateEntry=(machine:string,field:string,val:string,rowIdx:number=0)=>{
    setEntries(prev=>{
      const machineRows=prev.filter(e=>e.machine===machine)
      const targetEntry=machineRows[rowIdx]
      if(!targetEntry) return prev
      const globalIdx=prev.indexOf(targetEntry)
      const newEntries=[...prev]
      newEntries[globalIdx]={...newEntries[globalIdx],[field]:val}
      if(field==='product'){
        const mould=PRODUCT_MOULD_MAP[val]||''
        if(mould) newEntries[globalIdx].mould=mould
      }
      return newEntries
    })
  }

  const saveSetup=async()=>{
    if(!plant){setToast({msg:'Plant select karo!',ok:false});return}
    if(saving){return}
    setSaving(true)
    console.log('Saving setup:', {plant, date, machines: machineSetup})
    const res=await fetch('/api/machine-setup',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        type:'setup',date,plant,createdBy:user.name,
        machines:machineSetup.map(m=>({
          machine:m.machine,
          product:m.product||'',
          mould:m.mould||'',
          cavities:parseFloat(String(m.cavities||0)),
          cycleTime:parseFloat(String(m.cycleTime||m.cycle_time||0)),
          operator:m.operator||'',
          operator2:m.operator2||'',
          validFromSlot:m.validFromSlot||'8am-11am'
        }))
      })
    }).then(r=>r.json())
    setSaving(false)
    setToast({msg:res.msg,ok:res.success})
    if(res.success){setSetupLoaded(true);setActiveView('entry')}
  }

  const saveSlot=async()=>{
    if(!plant){setToast({msg:'Plant select karo!',ok:false});return}
    if(saving){return} // prevent double save
    const filledEntries=entries.filter(e=>e.good||e.rejection||e.down||e.status!=='running')
    if(filledEntries.length===0){setToast({msg:'Koi data nahi bhara!',ok:false});return}
    
    // Validation checks
    const warnings:string[]=[]
    const errors:string[]=[]

    for(const e of filledEntries){
      const good=parseFloat(e.good)||0
      const rej=parseFloat(e.rejection)||0
      const proj=calcProj(e.cavities,e.cycleTime)
      const eff=proj>0?Math.round(good/proj*100):0

      // 1. Good = 0 but status running
      if(good===0&&e.status==='running'){
        warnings.push(`${e.machine}: Good Parts 0 hai — machine band thi?`)
      }

      // 2. Rejection > Good Parts
      if(rej>good&&good>0){
        errors.push(`${e.machine}: Rejection (${rej}) Good Parts (${good}) se zyada hai!`)
      }

      // 3. Efficiency < 50%
      if(eff>0&&eff<50){
        warnings.push(`${e.machine}: Efficiency bahut kam hai — sirf ${eff}%!`)
      }

      // 4. Product different from setup
      const setupEntry=machineSetup.find(m=>m.machine===e.machine)
      if(setupEntry&&setupEntry.product&&e.product&&setupEntry.product!==e.product&&!e.isMC){
        warnings.push(`${e.machine}: Product alag hai! Setup: "${setupEntry.product}" → Entry: "${e.product}"`)
      }
    }

    // Check duplicate slot
    // Check duplicate - but allow MC entries (isMC=true)
    const nonMCEntries=filledEntries.filter(e=>!e.isMC)
    const alreadySaved=nonMCEntries.some(e=>
      history.some((h:any)=>
        h.plant===plant&&
        h.machine===e.machine&&
        h.shift?.toLowerCase().includes(shift==='night'?'night':'day')&&
        (h.production_slots||[]).some((s:any)=>s.slot_name===slot)&&
        !e.editId
      )
    )
    if(alreadySaved){
      errors.push(`Kuch machines ka ${slot} already saved hai! Sirf MC (Mould Change) entry karo.`)
    }

    // Show errors - block save
    if(errors.length>0){
      setToast({msg:'❌ '+errors[0],ok:false})
      setSaving(false)
      return
    }

    // Show warnings - ask confirm
    if(warnings.length>0){
      const msg=warnings.join('\n')
      const ok=window.confirm('⚠️ WARNING:\n\n'+msg+'\n\nPhir bhi save karo?')
      if(!ok){setSaving(false);return}
    }
    setSaving(true)
    const res=await fetch('/api/machine-setup',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        type:'bulk_slot',date,
        shift:shift==='night'?'Night (8pm-8am)':'Day (8am-8pm)',
        plant,slot,enteredBy:user.name,entries:filledEntries
      })
    }).then(r=>r.json())
    setSaving(false)
    setToast({msg:res.msg,ok:res.success})
    if(res.success){
      // Auto save mould change for MC entries
      const mcEntries=filledEntries.filter(e=>e.isMC&&e.oldMould&&e.mould)
      for(const mc of mcEntries){
        const mcRes=await fetch('/api/mouldchange',{
          method:'POST',headers:{'Content-Type':'application/json'},
          body:JSON.stringify({type:'start',date,shift:shift==='day'?'Day':'Night',plant,machine:mc.machine,oldMould:mc.oldMould||'',newMould:mc.mould||'',operator:mc.operator||'',enteredBy:user.name,estimatedTime:0})
        }).then(r=>r.json())
        if(mcRes.success&&mcRes.id){
          await fetch('/api/mouldchange',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'update_step',id:mcRes.id,step:'run'})})
        }
      }
      setEntries(prev=>prev.map(e=>({...e,good:'',rejection:'',down:'',remarks:'',editId:null})))
      loadHistory()
    }
  }

  const startEdit=(prod:any,slotObj?:any)=>{
    const key=prod.id+'-'+(slotObj?.slot_name||'')
    setEditingId(key)
    setEditVals({good:slotObj?.good_parts??prod.good_parts,rejection:slotObj?.rejection??prod.rejection,down:slotObj?.downtime??prod.downtime,remarks:slotObj?.remarks||prod.remarks||''})
  }

  const saveEdit=async(prod:any,slotName?:string)=>{
    setSaving(true)
    const useSlot=slotName||prod.production_slots?.[0]?.slot_name||slot
    const res=await fetch('/api/machine-setup',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        type:'bulk_slot',date,
        shift:prod.shift,plant,slot:useSlot,
        enteredBy:user.name,
        entries:[{machine:prod.machine,product:prod.product,mould:prod.mould,cavities:prod.cavities,cycleTime:prod.cycle_time,operator:prod.operator,good:editVals.good,rejection:editVals.rejection,down:editVals.down,remarks:editVals.remarks,editId:prod.id}]
      })
    }).then(r=>r.json())
    setSaving(false)
    setToast({msg:res.success?'Entry updated!':res.msg,ok:res.success})
    if(res.success){setEditingId(null);loadHistory()}
  }

  const slotNames=shift==='night'?NIGHT_SLOTS:DAY_SLOTS
  const calcProj=(cav:string,ct:string)=>{const c=parseFloat(cav||'0'),t=parseFloat(ct||'0');return c>0&&t>0?Math.floor((180*60)/t)*c:0}
  const calcEff=(good:string,proj:number)=>{const g=parseFloat(good||'0');return proj>0&&g>0?Math.round(g/proj*100):0}

  if(loading) return <div style={{textAlign:'center',padding:32,color:'#666'}}>Loading...</div>

  return <div>
    {/* View tabs */}
    <div style={{display:'flex',gap:6,marginBottom:8}}>
      {[{id:'entry',label:'📝 Slot Entry'},{id:'setup',label:'⚙️ Machine Setup'},{id:'history',label:'📋 Today\'s History'}].map(v=>
        <button key={v.id} onClick={()=>{setActiveView(v.id as any);if(v.id==='history')loadHistory(plant,date)}}
          style={{flex:1,padding:'8px',border:`2px solid #1F3864`,borderRadius:8,background:activeView===v.id?'#1F3864':'#fff',color:activeView===v.id?'#fff':'#1F3864',fontWeight:700,fontSize:12,cursor:'pointer'}}>
          {v.label}
        </button>
      )}
    </div>

    {/* Common header */}
    <div style={S.card}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
        <div style={S.f}><label style={S.lbl}>Date</label><input type="date" style={S.fi} value={date} onChange={e=>setDate(e.target.value)}/></div>
        <div style={S.f}><label style={S.lbl}>Shift</label>
          <select style={S.fi} value={shift} onChange={e=>setShift(e.target.value)}>
            <option value="day">Day Shift (8am-8pm)</option>
            <option value="night">Night Shift (8pm-8am)</option>
          </select>
        </div>
      </div>
      <div style={S.f}><label style={S.lbl}>Plant</label>
        <select style={S.fi} value={plant} onChange={e=>setPlant(e.target.value)}>
          <option value="">Select Plant</option>
          <option>Plant 477</option><option>Plant 488</option><option>Plant 433</option>
        </select>
      </div>
      {setupLoaded&&plant&&<div style={{background:'#E8F5E9',border:'1px solid #276221',borderRadius:6,padding:'6px 10px',fontSize:11,color:'#276221',fontWeight:600,marginTop:6}}>
        ✅ Aaj ka machine setup loaded! Slot entry karo.
      </div>}
      {!setupLoaded&&plant&&<div style={{background:'#FFF3E0',border:'1px solid #FF9800',borderRadius:6,padding:'6px 10px',fontSize:11,color:'#E65100',fontWeight:600,marginTop:6}}>
        ⚠️ Aaj ka setup nahi hai! Pehle ⚙️ Machine Setup karo.
      </div>}
    </div>

    {/* MACHINE SETUP VIEW */}
    {activeView==='setup'&&plant&&<div style={S.card}>
      <div style={{fontWeight:700,color:'#1F3864',marginBottom:10,fontSize:14}}>⚙️ Aaj Ka Machine Setup — {date}</div>
      <div style={{fontSize:11,color:'#666',marginBottom:10}}>Ek baar define karo — phir din bhar slot entry mein auto-fill hoga!</div>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
          <thead><tr>
            {['Machine','Product','Mould No.','Cavities','Cycle Time (sec)','Operator 1','Operator 2'].map(h=>
              <th key={h} style={{background:'#1F3864',color:'#fff',padding:'8px 6px',textAlign:'center',whiteSpace:'nowrap' as const}}>{h}</th>)}
          </tr></thead>
          <tbody>{machineSetup.map((m:any,i:number)=>(
            <tr key={i} style={{background:i%2===0?'#F8F9FF':'#fff'}}>
              <td style={{padding:'6px 8px',fontWeight:700,color:'#1F3864',textAlign:'center'}}>{m.machine}</td>
              <td style={{padding:3}}>
                <select style={{width:'100%',padding:'5px',border:'1px solid #E0E0E0',borderRadius:6,fontSize:11}}
                  value={m.product||''} onChange={e=>{
                    const mould=PRODUCT_MOULD_MAP[e.target.value]||''
                    updateSetup(m.machine,'product',e.target.value)
                    if(mould) updateSetup(m.machine,'mould',mould)
                  }}>
                  <option value="">-- Select --</option>
                  {items.map(it=><option key={it.name}>{it.name}</option>)}
                </select>
              </td>
              <td style={{padding:3}}>
                <select style={{width:'100%',padding:'5px',border:'1px solid #E0E0E0',borderRadius:6,fontSize:11,background:m.mould?'#E2EFDA':'#fff'}}
                  value={m.mould||''} onChange={e=>updateSetup(m.machine,'mould',e.target.value)}>
                  <option value="">-- Mould --</option>
                  <optgroup label="Tub/Container">
                    {MOULDS.filter(md=>!md.name.includes('Lid')&&!md.name.includes('Sipper')).map(md=><option key={md.code} value={md.code+' - '+md.name}>{md.code} - {md.name}</option>)}
                  </optgroup>
                  <optgroup label="Lid Moulds">
                    {MOULDS.filter(md=>md.name.includes('Lid')||md.name.includes('Sipper')).map(md=><option key={md.code} value={md.code+' - '+md.name}>{md.code} - {md.name}</option>)}
                  </optgroup>
                </select>
              </td>
              <td style={{padding:3}}><input type="number" style={{width:60,padding:'5px',border:'1px solid #E0E0E0',borderRadius:6,textAlign:'center',fontSize:12,fontWeight:600}} value={m.cavities||''} onChange={e=>updateSetup(m.machine,'cavities',e.target.value)} placeholder="4"/></td>
              <td style={{padding:3}}><input type="number" style={{width:60,padding:'5px',border:'1px solid #E0E0E0',borderRadius:6,textAlign:'center',fontSize:12,fontWeight:600}} value={m.cycle_time||''} onChange={e=>updateSetup(m.machine,'cycle_time',e.target.value)} placeholder="12"/></td>
              <td style={{padding:3}}>
                <select style={{width:'100%',padding:'5px',border:'1px solid #E0E0E0',borderRadius:6,fontSize:11}} value={m.operator||''} onChange={e=>updateSetup(m.machine,'operator',e.target.value)}>
                  <option value="">Select</option>{OPS.map(o=><option key={o}>{o}</option>)}
                </select>
              </td>
              <td style={{padding:3}}>
                <select style={{width:'100%',padding:'5px',border:'1px solid #E0E0E0',borderRadius:6,fontSize:11}} value={m.operator2||''} onChange={e=>updateSetup(m.machine,'operator2',e.target.value)}>
                  <option value="">None</option>{OPS.map(o=><option key={o}>{o}</option>)}
                </select>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <button style={{...S.sb,marginTop:12,background:'#276221'}} onClick={saveSetup} disabled={saving}>
        {saving?'Saving...':'💾 Save Today\'s Machine Setup'}
      </button>
      {toast&&<Toast {...toast}/>}
    </div>}

    {/* SLOT ENTRY VIEW */}
    {activeView==='entry'&&plant&&<div>
      {/* Slot selector */}
      <div style={S.card}>
        <div style={{fontWeight:700,color:'#1F3864',marginBottom:8}}>⏰ Slot Select Karo</div>
        <div style={{display:'flex',gap:6,flexWrap:'wrap' as const}}>
          {slotNames.map(s=>{
            const isDone=history.some((h:any)=>h.plant===plant&&(h.production_slots||[]).some((ps:any)=>ps.slot_name===s))
            return <button key={s} onClick={()=>setSlot(s)} style={{
              padding:'8px 12px',border:`2px solid ${slot===s?'#1F3864':isDone?'#276221':'#E0E0E0'}`,
              borderRadius:8,background:slot===s?'#1F3864':isDone?'#E8F5E9':'#fff',
              color:slot===s?'#fff':isDone?'#276221':'#666',
              fontWeight:700,fontSize:12,cursor:'pointer'
            }}>{s.split('(')[0]}{isDone?' ✅':''}</button>
          })}
        </div>
      </div>

      {/* Bulk entry table */}
      <div style={S.card}>
        <div style={{fontWeight:700,color:'#1F3864',marginBottom:6,fontSize:14}}>
          📝 {slot} — {plant} — {shift==='day'?'☀️ Day':'🌙 Night'} Shift
        </div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
            <thead><tr>
              {['Machine','Product','Mould','Cav','CT(s)','Proj','Good Parts','Rejection','Down(min)','Eff%','Status','Remarks'].map(h=>
                <th key={h} style={{background:'#1F3864',color:'#fff',padding:'6px 5px',textAlign:'center',whiteSpace:'nowrap' as const,fontSize:10}}>{h}</th>)}
            </tr></thead>
            <tbody>{entries.map((e:any,i:number)=>{
              const proj=calcProj(e.cavities,e.cycleTime)
              const eff=calcEff(e.good,proj)
              const effCol=eff>=90?'#276221':eff>=75?'#854F0B':'#C00000'
              const isRunning=e.status==='running'
              const machineRows=entries.filter(x=>x.machine===e.machine)
              const machineRowIdx=machineRows.indexOf(e)
              const isFirstRow=machineRowIdx===0
              const totalMachineRows=machineRows.length
              return <tr key={i} style={{background:e.isMC?'#FFF9E6':i%2===0?'#F8F9FF':'#fff',borderTop:e.isMC?'2px dashed #854F0B':'none'}}>
                <td style={{padding:'5px 6px',fontWeight:700,color:e.isMC?'#854F0B':'#1F3864',textAlign:'center',whiteSpace:'nowrap' as const}}>
                  {e.isMC?<span>↳ {e.machine}<br/><span style={{fontSize:9,color:'#854F0B'}}>MC</span></span>:e.machine}
                </td>
                <td style={{padding:2,fontSize:10,maxWidth:100}}>
                  <select style={{width:'100%',padding:'3px',border:'1px solid #E0E0E0',borderRadius:4,fontSize:10}} value={e.product||''} onChange={ev=>{const mould=PRODUCT_MOULD_MAP[ev.target.value]||'';updateEntry(e.machine,'product',ev.target.value);if(mould)updateEntry(e.machine,'mould',mould)}}>
                    <option value="">--</option>{items.map(it=><option key={it.name}>{it.name}</option>)}
                  </select>
                </td>
                <td style={{padding:2,fontSize:10,color:'#666',maxWidth:80,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' as const}}>
                  <span title={e.mould||''}>{e.mould?.split(' - ')[0]||'--'}</span>
                </td>
                <td style={{padding:2}}>
                  {e.isMC
                    ? <input type="number" value={e.cavities||''} onChange={ev=>updateEntry(e.machine,'cavities',ev.target.value,machineRowIdx)}
                        style={{width:45,padding:'4px 2px',border:'2px solid #854F0B',borderRadius:4,textAlign:'center',fontSize:12,fontWeight:700,background:'#FFF9E6'}} placeholder="Cav"/>
                    : <span style={{fontWeight:600,padding:'0 4px'}}>{e.cavities||'--'}</span>}
                </td>
                <td style={{padding:2}}>
                  {e.isMC
                    ? <input type="number" value={e.cycleTime||''} onChange={ev=>updateEntry(e.machine,'cycleTime',ev.target.value,machineRowIdx)}
                        style={{width:45,padding:'4px 2px',border:'2px solid #854F0B',borderRadius:4,textAlign:'center',fontSize:12,background:'#FFF9E6'}} placeholder="CT"/>
                    : <span style={{color:'#666',padding:'0 4px'}}>{e.cycleTime||'--'}</span>}
                </td>
                <td style={{padding:'5px',textAlign:'center',color:'#854F0B',fontWeight:600}}>{proj>0?proj.toLocaleString():'--'}</td>
                <td style={{padding:2}}>
                  <input type="number" min="0" value={e.good||''} onChange={ev=>updateEntry(e.machine,'good',ev.target.value)} disabled={!isRunning}
                    style={{width:70,padding:'5px 3px',border:'2px solid #276221',borderRadius:6,textAlign:'center',fontSize:12,fontWeight:700,background:isRunning?'#fff':'#F5F5F5'}} placeholder="0"/>
                </td>
                <td style={{padding:2}}>
                  <input type="number" min="0" value={e.rejection||''} onChange={ev=>updateEntry(e.machine,'rejection',ev.target.value)} disabled={!isRunning}
                    style={{width:60,padding:'5px 3px',border:'2px solid #C00000',borderRadius:6,textAlign:'center',fontSize:12,background:isRunning?'#fff':'#F5F5F5'}} placeholder="0"/>
                </td>
                <td style={{padding:2}}>
                  <input type="number" min="0" value={e.down||''} onChange={ev=>updateEntry(e.machine,'down',ev.target.value)}
                    style={{width:55,padding:'5px 3px',border:'1px solid #E0E0E0',borderRadius:6,textAlign:'center',fontSize:12}} placeholder="0"/>
                </td>
                <td style={{padding:'5px',textAlign:'center',fontWeight:700,color:eff>0?effCol:'#ccc',background:eff>=90?'#E8F5E9':eff>=75?'#FFF3E0':eff>0?'#FFEBEE':'transparent'}}>
                  {eff>0?eff+'%':'--'}
                </td>
                <td style={{padding:2}}>
                  <div style={{display:'flex',flexDirection:'column' as const,gap:3}}>
                    <select style={{width:'100%',padding:'3px',border:'1px solid #E0E0E0',borderRadius:4,fontSize:10,background:!isRunning?'#FFEBEE':'#fff'}}
                      value={e.status||'running'} onChange={ev=>updateEntry(e.machine,'status',ev.target.value)}>
                      <option value="running">Running</option>
                      <option value="noplan">No Plan</option>
                      <option value="breakdown">Breakdown</option>
                      <option value="mouldchange">Mould Change</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="powercut">Power Cut</option>
                    </select>
                    {isFirstRow&&<button onClick={()=>addMouldChange(e.machine)} style={{background:'#854F0B',color:'#fff',border:'none',borderRadius:4,padding:'3px 4px',fontSize:9,cursor:'pointer',fontWeight:700}}>+ MC</button>}
              {isFirstRow&&history.some((h:any)=>h.machine===e.machine&&(h.production_slots||[]).some((s:any)=>s.slot_name===slot))&&<div style={{fontSize:8,color:'#854F0B',marginTop:2}}>Slot saved — MC se new entry</div>}
                    {e.isMC&&<button onClick={()=>removeMCRow(e.machine,machineRowIdx)} style={{background:'#FFEBEE',color:'#C00000',border:'1px solid #C00000',borderRadius:4,padding:'3px 4px',fontSize:9,cursor:'pointer'}}>✕ Remove</button>}
                  </div>
                </td>
                <td style={{padding:2}}>
                  <input value={e.remarks||''} 
                    onChange={ev=>{
                      const idx=entries.indexOf(e)
                      setEntries(prev=>{const n=[...prev];n[idx]={...n[idx],remarks:ev.target.value};return n})
                    }}
                    placeholder="Remarks..." 
                    style={{width:100,padding:'4px',border:'1px solid #E0E0E0',borderRadius:4,fontSize:10,background:'#FFFFF0'}}/>
                </td>
              </tr>
            })}</tbody>
            {/* Summary row */}
            <tfoot><tr style={{background:'#1F3864'}}>
              <td colSpan={7} style={{padding:'6px 8px',color:'#FFD966',fontWeight:700}}>TOTAL</td>
              <td style={{padding:'6px 5px',color:'#4CAF50',fontWeight:700,textAlign:'center',fontSize:13}}>
                {entries.reduce((a,e)=>a+(parseFloat(e.good)||0),0).toLocaleString()}
              </td>
              <td style={{padding:'6px 5px',color:'#FF5252',fontWeight:700,textAlign:'center',fontSize:13}}>
                {entries.reduce((a,e)=>a+(parseFloat(e.rejection)||0),0).toLocaleString()}
              </td>
              <td style={{padding:'6px 5px',color:'#FF9800',fontWeight:700,textAlign:'center'}}>
                {entries.reduce((a,e)=>a+(parseFloat(e.down)||0),0)}m
              </td>
              <td colSpan={2} style={{padding:'6px 5px',color:'#90A8C8',textAlign:'center'}}>
                {entries.filter(e=>e.status==='running').length}/{entries.length} Running
              </td>
            </tr></tfoot>
          </table>
        </div>
        <button style={{...S.sb,marginTop:12}} onClick={saveSlot} disabled={saving}>
          {saving?'Saving...':`💾 Save ${slot} — ${entries.filter(e=>e.good||e.rejection||e.down).length} Machines`}
        </button>
        {toast&&<Toast {...toast}/>}
      </div>
    </div>}

    {/* HISTORY VIEW with EDIT */}
    {activeView==='history'&&plant&&<div style={S.card}>
      <div style={{fontWeight:700,color:'#1F3864',marginBottom:10,fontSize:14}}>📋 Aaj Ki Entries — {date} — {plant}</div>
      {history.length===0?<div style={{textAlign:'center',color:'#666',padding:24}}>Koi entry nahi aaj!</div>:
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
          <thead><tr>
            {['Machine','Shift','Product','Slot','Good','Rej','Down','By','Action'].map(h=>
              <th key={h} style={{background:'#1F3864',color:'#fff',padding:'6px 8px',textAlign:'left'}}>{h}</th>)}
          </tr></thead>
          <tbody>{history.flatMap((h:any)=>{
            const slots=(h.production_slots&&h.production_slots.length>0)?h.production_slots:[{slot_name:'--',good_parts:h.good_parts,rejection:h.rejection,downtime:h.downtime}]
            return slots.map((s:any)=>({h,s,key:h.id+'-'+(s.slot_name||'x')}))
          }).sort((a:any,b:any)=>{
            // sort by slot order first, then machine name
            const order=['8am-11am','11am-2pm','2pm-5pm','5pm-8pm','8pm-11pm','11pm-2am','2am-5am','5am-8am']
            const sa=order.indexOf(a.s.slot_name), sb=order.indexOf(b.s.slot_name)
            if(sa!==sb) return sa-sb
            return (a.h.machine||'').localeCompare(b.h.machine||'')
          }).map(({h,s,key}:any,i:number)=>{
            const isEditing=editingId===key
            const slotName=s.slot_name||'--'
            return <tr key={key} style={{background:i%2===0?'#FAFAFA':'#fff'}}>
              <td style={{padding:'6px 8px',fontWeight:700,color:'#1F3864'}}>{h.machine}</td>
              <td style={{padding:'6px 8px',fontSize:10}}>{h.shift?.includes('Day')?'☀️ Day':'🌙 Night'}</td>
              <td style={{padding:'6px 8px',fontSize:10}}>{h.product}</td>
              <td style={{padding:'6px 8px'}}><span style={{background:'#E6F1FB',color:'#1F3864',padding:'2px 6px',borderRadius:4,fontSize:10,fontWeight:600}}>{slotName}</span></td>
              {isEditing?<>
                <td style={{padding:2}}><input type="number" value={editVals.good} onChange={e=>setEditVals(p=>({...p,good:e.target.value}))} style={{width:70,padding:'4px',border:'2px solid #276221',borderRadius:4,textAlign:'center',fontSize:12,fontWeight:700}}/></td>
                <td style={{padding:2}}><input type="number" value={editVals.rejection} onChange={e=>setEditVals(p=>({...p,rejection:e.target.value}))} style={{width:60,padding:'4px',border:'2px solid #C00000',borderRadius:4,textAlign:'center',fontSize:12}}/></td>
                <td style={{padding:2}}><input type="number" value={editVals.down} onChange={e=>setEditVals(p=>({...p,down:e.target.value}))} style={{width:55,padding:'4px',border:'1px solid #E0E0E0',borderRadius:4,textAlign:'center',fontSize:12}}/></td>
                <td style={{padding:'6px 8px',fontSize:10}}>{h.entered_by}</td>
                <td style={{padding:4,display:'flex',gap:4}}>
                  <button onClick={()=>saveEdit(h,s.slot_name)} style={{background:'#276221',color:'#fff',border:'none',borderRadius:4,padding:'4px 8px',fontSize:10,cursor:'pointer',fontWeight:700}}>Save</button>
                  <button onClick={()=>setEditingId(null)} style={{background:'#666',color:'#fff',border:'none',borderRadius:4,padding:'4px 8px',fontSize:10,cursor:'pointer'}}>Cancel</button>
                </td>
              </>:<>
                <td style={{padding:'6px 8px',color:'#276221',fontWeight:700}}>{(s.good_parts||0).toLocaleString()}</td>
                <td style={{padding:'6px 8px',color:'#C00000',fontWeight:700}}>{s.rejection||0}</td>
                <td style={{padding:'6px 8px',color:'#854F0B'}}>{s.downtime||0}m</td>
                <td style={{padding:'6px 8px',fontSize:10}}>{h.entered_by}</td>
                <td style={{padding:4}}>
                  <button onClick={()=>startEdit(h,s)} style={{background:'#1F3864',color:'#fff',border:'none',borderRadius:4,padding:'4px 10px',fontSize:10,cursor:'pointer',fontWeight:600}}>✏️ Edit</button>
                </td>
              </>}
            </tr>
          })}</tbody>
        </table>
      </div>}
      {toast&&<Toast {...toast}/>}
    </div>}

    {!plant&&<div style={{...S.card,textAlign:'center',color:'#666',padding:32}}>
      Plant select karo upar se! 👆
    </div>}
  </div>
}

// ─── KRA Report Component ─────────────────────────────────────
function KRAReport({user}:{user:User}) {
  const [selectedUser,setSelectedUser]=useState(user.name)
  const [weekOffset,setWeekOffset]=useState(0)
  const [data,setData]=useState<any>(null)
  const [loading,setLoading]=useState(false)
  const [allUsers,setAllUsers]=useState<any[]>([])

  // Get week dates
  const getWeekDates=(offset:number)=>{
    const today=new Date()
    const day=today.getDay()
    const monday=new Date(today)
    monday.setDate(today.getDate()-(day===0?6:day-1)+(offset*7))
    const sunday=new Date(monday)
    sunday.setDate(monday.getDate()+6)
    return {
      from:monday.toISOString().split('T')[0],
      to:sunday.toISOString().split('T')[0],
      label:`${monday.toLocaleDateString('en-IN',{day:'2-digit',month:'short'})} – ${sunday.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}`
    }
  }

  const week=getWeekDates(weekOffset)

  useEffect(()=>{
    fetch('/api/users').then(r=>r.json()).then(d=>{
      if(d.data&&d.data.length>0) setAllUsers(d.data)
      else setAllUsers(OPS.map(name=>({full_name:name,role:'Operator'})))
    }).catch(()=>{
      setAllUsers(OPS.map(name=>({full_name:name,role:'Operator'})))
    })
  },[])

  useEffect(()=>{loadReport()},[selectedUser,weekOffset])

  const loadReport=async()=>{
    if(!selectedUser) return
    setLoading(true)
    const [prodRes,rejRes,bdRes,mcRes]=await Promise.all([
      fetch(`/api/production?from=${week.from}&to=${week.to}`).then(r=>r.json()),
      fetch(`/api/reports?module=rejection&from=${week.from}&to=${week.to}`).then(r=>r.json()),
      fetch(`/api/breakdown?from=${week.from}&to=${week.to}`).then(r=>r.json()),
      fetch(`/api/mouldchange?from=${week.from}&to=${week.to}`).then(r=>r.json()),
    ])

    // Production stats for this person
    // Ranjan = Plant Head → responsible for ALL production
    const isPlantHead=selectedUser==='Ranjan Kumar'
    const myProd=isPlantHead
      ? (prodRes.data||[]) // All entries
      : (prodRes.data||[]).filter(e=>
          e.entered_by===selectedUser||
          e.operator===selectedUser||
          e.operator2===selectedUser||  // Helper bhi counted
          e.operator2===selectedUser    // Operator 2 = helper
        )
    const totalGood=myProd.reduce((a:number,e:any)=>a+(e.good_parts||0),0)
    const totalRej=myProd.reduce((a:number,e:any)=>a+(e.rejection||0),0)
    const totalDown=myProd.reduce((a:number,e:any)=>a+(e.downtime||0),0)
    const shifts=myProd.length
    const eff=totalGood+totalRej>0?Math.round(totalGood/(totalGood+totalRej)*100):0

    // Previous week for comparison
    const prevWeek=getWeekDates(weekOffset-1)
    const prevProdRes=await fetch(`/api/production?from=${prevWeek.from}&to=${prevWeek.to}`).then(r=>r.json())
    const prevProd=isPlantHead
      ? (prevProdRes.data||[])
      : (prevProdRes.data||[]).filter(e=>
          e.entered_by===selectedUser||e.operator===selectedUser||e.operator2===selectedUser
        )
    const prevGood=prevProd.reduce((a:number,e:any)=>a+(e.good_parts||0),0)
    const prevRej=prevProd.reduce((a:number,e:any)=>a+(e.rejection||0),0)
    const prevEff=prevGood+prevRej>0?Math.round(prevGood/(prevGood+prevRej)*100):0

    // Rejection stats
    const myRej=isPlantHead
      ? (rejRes.data||[])
      : (rejRes.data||[]).filter(e=>e.operator===selectedUser||e.entered_by===selectedUser)
    const rejQty=myRej.reduce((a:number,e:any)=>a+(e.rejection_qty||0),0)

    // Breakdown stats
    const myBd=isPlantHead
      ? (bdRes.data||[])
      : (bdRes.data||[]).filter(e=>e.entered_by===selectedUser||e.operator_name===selectedUser)
    const bdResolved=myBd.filter(e=>e.status==='Resolved').length
    const avgBdTime=myBd.filter(e=>e.total_minutes>0).length>0
      ?Math.round(myBd.filter(e=>e.total_minutes>0).reduce((a:number,e:any)=>a+(e.downtime_min||0),0)/myBd.filter(e=>e.total_minutes>0).length):0

    // Mould change stats
    const myMC=isPlantHead
      ? (mcRes.data||[])
      : (mcRes.data||[]).filter(e=>
          e.entered_by===selectedUser||e.operator_name===selectedUser
        )
    const mcCount=myMC.filter(e=>e.status==='complete').length
    const avgMCTime=myMC.filter(e=>e.total_minutes>0).length>0
      ?Math.round(myMC.filter(e=>e.total_minutes>0).reduce((a:number,e:any)=>a+(e.total_minutes||0),0)/myMC.filter(e=>e.total_minutes>0).length):0
    const bestMCTime=myMC.filter(e=>e.total_minutes>0).length>0
      ?Math.min(...myMC.filter(e=>e.total_minutes>0).map(e=>e.total_minutes)):0

    setData({
      totalGood,totalRej,totalDown,shifts,eff,
      prevGood,prevRej,prevEff,
      rejQty,myRej,
      bdResolved,avgBdTime,myBd,
      mcCount,avgMCTime,bestMCTime,myMC,
      prodByDay:myProd.reduce((acc:any,e:any)=>{
        if(!acc[e.date]) acc[e.date]={good:0,rej:0}
        acc[e.date].good+=e.good_parts||0
        acc[e.date].rej+=e.rejection||0
        return acc
      },{})
    })
    setLoading(false)
  }

  const trend=(curr:number,prev:number)=>{
    if(prev===0) return {icon:'🆕',color:'#666',text:'Pehla hafta'}
    const diff=curr-prev
    const pct=Math.round(Math.abs(diff)/prev*100)
    if(diff>0) return {icon:'📈',color:'#276221',text:`+${pct}% pichle hafte se`}
    if(diff<0) return {icon:'📉',color:'#C00000',text:`-${pct}% pichle hafte se`}
    return {icon:'➡️',color:'#666',text:'Same as last week'}
  }

  const getGrade=(eff:number)=>{
    if(eff>=95) return {grade:'A+',color:'#276221',msg:'Excellent! Bahut acha kaam!'}
    if(eff>=90) return {grade:'A',color:'#276221',msg:'Bahut acha performance!'}
    if(eff>=80) return {grade:'B',color:'#2E75B6',msg:'Acha hai — aur improve kar sakte ho!'}
    if(eff>=70) return {grade:'C',color:'#854F0B',msg:'Average — dhyan do efficiency par!'}
    return {grade:'D',color:'#C00000',msg:'Improvement chahiye — supervisor se baat karo!'}
  }

  const generateAnalysis=(d:any,isHead:boolean)=>{
    const points:string[]=[]
    const improvements:string[]=[]
    if(isHead){
      points.push('📋 Plant Head Score: Saari machines ka combined performance')
      points.push(`👥 Total ${d.shifts} shifts across all operators supervised`)
    }

    if(d.eff>=90) points.push(`✅ Efficiency ${d.eff}% rahi — bahut badhiya!`)
    else improvements.push(`⚠️ Efficiency ${d.eff}% hai — target 90%+ karo. Cycle time aur downtime kam karo.`)

    if(d.totalRej<100) points.push(`✅ Rejection bahut kam rahi sirf ${d.totalRej} pcs — quality control acha hai!`)
    else improvements.push(`⚠️ Rejection ${d.totalRej.toLocaleString()} pcs thi — reasons check karo aur material quality par dhyan do.`)

    if(d.totalDown<120) points.push(`✅ Downtime kam raha ${d.totalDown} min — machine theek chalti rahi!`)
    else improvements.push(`⚠️ Downtime ${d.totalDown} min tha — zyada hai. Preventive maintenance time par karo.`)

    const prodTrend=trend(d.totalGood,d.prevGood)
    if(d.totalGood>d.prevGood) points.push(`✅ Production ${prodTrend.text} — improvement dikh rahi hai!`)
    else if(d.totalGood<d.prevGood) improvements.push(`⚠️ Production ${prodTrend.text} — dhyan do, consistency maintain karo.`)

    if(d.mcCount>0&&d.avgMCTime>0){
      if(d.avgMCTime<=35) points.push(`✅ Mould change avg ${d.avgMCTime}m — fast hai!`)
      else improvements.push(`⚠️ Mould change avg ${d.avgMCTime}m — 35 min se kam karne ki koshish karo.`)
    }

    if(d.bdResolved>0) points.push(`✅ ${d.bdResolved} breakdown resolve kiye — acha kaam!`)

    return {points,improvements}
  }

  const grade=data?getGrade(data.eff):null
  const isHead=selectedUser==='Ranjan Kumar'
  const analysis=data?generateAnalysis(data,isHead):null
  const prodTrend=data?trend(data.totalGood,data.prevGood):null

  return <div>
    {/* Controls */}
    <div style={S.card}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
        <div style={S.f}><label style={S.lbl}>Staff Member</label>
          <select style={S.fi} value={selectedUser} onChange={e=>setSelectedUser(e.target.value)}>
            {user.role==='Admin'||user.role==='Plant Head'
              ? (allUsers.length>0?allUsers:OPS.map(n=>({full_name:n,role:'Operator'}))).map((u:any)=>{
                const name=u.full_name||u.name||u.username||u
                return <option key={name} value={name}>{name} {u.role?`(${u.role})`:''}</option>
              })
              : <option value={user.name}>{user.name}</option>
            }
          </select>
        </div>
        <div style={S.f}><label style={S.lbl}>Week</label>
          <div style={{display:'flex',gap:6,alignItems:'center'}}>
            <button onClick={()=>setWeekOffset(p=>p-1)} style={{background:'#1F3864',color:'#fff',border:'none',borderRadius:6,padding:'6px 12px',cursor:'pointer'}}>◀</button>
            <span style={{fontSize:11,fontWeight:600,color:'#1F3864',flex:1,textAlign:'center'}}>{week.label}</span>
            <button onClick={()=>setWeekOffset(p=>Math.min(0,p+1))} disabled={weekOffset===0} style={{background:weekOffset===0?'#ccc':'#1F3864',color:'#fff',border:'none',borderRadius:6,padding:'6px 12px',cursor:weekOffset===0?'not-allowed':'pointer'}}>▶</button>
          </div>
        </div>
      </div>
      {weekOffset===0&&<div style={{background:'#E8F5E9',borderRadius:6,padding:'4px 10px',fontSize:11,color:'#276221',fontWeight:600}}>📅 This Week</div>}
      {weekOffset<0&&<div style={{background:'#FFF3E0',borderRadius:6,padding:'4px 10px',fontSize:11,color:'#854F0B',fontWeight:600}}>📅 {Math.abs(weekOffset)} week{Math.abs(weekOffset)>1?'s':''} ago</div>}
    </div>

    {loading&&<div style={{textAlign:'center',padding:32,color:'#666'}}>Loading report... ⏳</div>}

    {data&&!loading&&<div>
      {/* Grade Card */}
      <div style={{background:`linear-gradient(135deg, #1F3864, #2E75B6)`,borderRadius:12,padding:'20px',marginBottom:8,color:'#fff'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <div style={{fontSize:13,opacity:0.8}}>{selectedUser}</div>
            {selectedUser==='Ranjan Kumar'&&<div style={{background:'#FFD966',color:'#1F3864',borderRadius:4,padding:'2px 8px',fontSize:10,fontWeight:700,display:'inline-block',marginTop:4}}>🏆 Plant Head — All Plant Score</div>}
            {data?.myProdHelper&&data.myProdHelper>0&&selectedUser!=='Ranjan Kumar'&&<div style={{background:'rgba(255,255,255,0.2)',borderRadius:4,padding:'2px 8px',fontSize:10,marginTop:4}}>👥 Helper entries bhi included</div>}
            <div style={{fontSize:11,opacity:0.6,marginTop:4}}>{week.label}</div>
            <div style={{fontSize:28,fontWeight:700,marginTop:8,color:'#FFD966'}}>{grade?.grade}</div>
            <div style={{fontSize:12,marginTop:4}}>{grade?.msg}</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:40,fontWeight:700,color:'#FFD966'}}>{data.eff}%</div>
            <div style={{fontSize:11,opacity:0.8}}>Overall Efficiency</div>
            {prodTrend&&<div style={{fontSize:11,marginTop:4,color:prodTrend.color==='#276221'?'#90EE90':prodTrend.color==='#C00000'?'#FF9090':'#ccc'}}>{prodTrend.icon} {prodTrend.text}</div>}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
        <div style={{...S.met,border:'1px solid #276221',background:'#E8F5E9'}}>
          <div style={{fontSize:10,color:'#276221',fontWeight:600}}>🏭 Total Production</div>
          <div style={{fontSize:22,fontWeight:700,color:'#276221'}}>{data.totalGood.toLocaleString()}</div>
          <div style={{fontSize:10,color:'#666'}}>{data.shifts} shifts | Prev: {data.prevGood.toLocaleString()}</div>
        </div>
        <div style={{...S.met,border:'1px solid #C00000',background:'#FFEBEE'}}>
          <div style={{fontSize:10,color:'#C00000',fontWeight:600}}>❌ Total Rejection</div>
          <div style={{fontSize:22,fontWeight:700,color:'#C00000'}}>{data.totalRej.toLocaleString()}</div>
          <div style={{fontSize:10,color:'#666'}}>Rej %: {data.totalGood+data.totalRej>0?Math.round(data.totalRej/(data.totalGood+data.totalRej)*100*10)/10:0}%</div>
        </div>
        <div style={{...S.met,border:'1px solid #854F0B',background:'#FFF3E0'}}>
          <div style={{fontSize:10,color:'#854F0B',fontWeight:600}}>⏱️ Total Downtime</div>
          <div style={{fontSize:22,fontWeight:700,color:'#854F0B'}}>{data.totalDown}m</div>
          <div style={{fontSize:10,color:'#666'}}>{Math.floor(data.totalDown/60)}h {data.totalDown%60}m total</div>
        </div>
        {data.mcCount>0&&<div style={{...S.met,border:'1px solid #5B2C8D',background:'#F3E5F5'}}>
          <div style={{fontSize:10,color:'#5B2C8D',fontWeight:600}}>🔄 Mould Changes</div>
          <div style={{fontSize:22,fontWeight:700,color:'#5B2C8D'}}>{data.mcCount}</div>
          <div style={{fontSize:10,color:'#666'}}>Avg: {data.avgMCTime}m | Best: {data.bestMCTime}m</div>
        </div>}
      </div>

      {/* Day-wise Production */}
      {Object.keys(data.prodByDay).length>0&&<div style={S.card}>
        <div style={{fontWeight:700,color:'#1F3864',marginBottom:8,fontSize:12}}>📅 Din-wise Production</div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
            <thead><tr>
              {['Date','Good Parts','Rejection','Rej %','Efficiency'].map(h=>
                <th key={h} style={{background:'#1F3864',color:'#fff',padding:'6px 8px',textAlign:'center'}}>{h}</th>)}
            </tr></thead>
            <tbody>{Object.entries(data.prodByDay).sort().map(([date,d]:any,i:number)=>{
              const eff=d.good+d.rej>0?Math.round(d.good/(d.good+d.rej)*100):0
              const effCol=eff>=90?'#276221':eff>=75?'#854F0B':'#C00000'
              return <tr key={i} style={{background:i%2===0?'#FAFAFA':'#fff'}}>
                <td style={{padding:'6px 8px',textAlign:'center',fontWeight:600}}>{date}</td>
                <td style={{padding:'6px 8px',textAlign:'center',color:'#276221',fontWeight:700}}>{d.good.toLocaleString()}</td>
                <td style={{padding:'6px 8px',textAlign:'center',color:'#C00000',fontWeight:700}}>{d.rej}</td>
                <td style={{padding:'6px 8px',textAlign:'center',color:d.rej>100?'#C00000':'#666'}}>{d.good+d.rej>0?Math.round(d.rej/(d.good+d.rej)*100*10)/10:0}%</td>
                <td style={{padding:'6px 8px',textAlign:'center',fontWeight:700,color:effCol,background:eff>=90?'#E8F5E9':eff>=75?'#FFF3E0':'#FFEBEE'}}>{eff>0?eff+'%':'--'}</td>
              </tr>
            })}</tbody>
          </table>
        </div>
      </div>}

      {/* Analysis & Improvement */}
      {analysis&&<div style={S.card}>
        <div style={{fontWeight:700,color:'#1F3864',marginBottom:10,fontSize:13}}>🔍 Analysis & Improvement Tips</div>

        {analysis.points.length>0&&<div style={{marginBottom:10}}>
          <div style={{fontWeight:600,color:'#276221',marginBottom:6,fontSize:12}}>✅ Acha Kiya:</div>
          {analysis.points.map((p:string,i:number)=><div key={i} style={{background:'#E8F5E9',borderRadius:6,padding:'8px 10px',marginBottom:4,fontSize:11}}>{p}</div>)}
        </div>}

        {analysis.improvements.length>0&&<div>
          <div style={{fontWeight:600,color:'#C00000',marginBottom:6,fontSize:12}}>💡 Improvement Chahiye:</div>
          {analysis.improvements.map((p:string,i:number)=><div key={i} style={{background:'#FFF3E0',border:'1px solid #FF9800',borderRadius:6,padding:'8px 10px',marginBottom:4,fontSize:11}}>{p}</div>)}
        </div>}

        {analysis.points.length>0&&analysis.improvements.length===0&&<div style={{background:'#E8F5E9',borderRadius:8,padding:'12px',textAlign:'center',marginTop:8}}>
          <div style={{fontSize:20}}>🏆</div>
          <div style={{fontWeight:700,color:'#276221',fontSize:13}}>Perfect Week! Koi improvement nahi chahiye!</div>
          <div style={{fontSize:11,color:'#666',marginTop:4}}>Aise hi chalate raho — bahut acha kaam!</div>
        </div>}
      </div>}

      {/* Mould Change Details */}
      {data.myMC.length>0&&<div style={S.card}>
        <div style={{fontWeight:700,color:'#5B2C8D',marginBottom:8,fontSize:12}}>🔄 Mould Change Performance</div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
            <thead><tr>
              {['Date','Machine','Old→New','Time','vs Best','Result'].map(h=>
                <th key={h} style={{background:'#5B2C8D',color:'#fff',padding:'6px 8px',textAlign:'left'}}>{h}</th>)}
            </tr></thead>
            <tbody>{data.myMC.filter(m=>m.status==='complete').map((m:any,i:number)=>{
              const isBest=m.total_minutes===data.bestMCTime
              const isOver=m.total_minutes>data.avgMCTime
              return <tr key={i} style={{background:i%2===0?'#F8F5FF':'#fff'}}>
                <td style={{padding:'6px 8px',fontSize:10}}>{m.date}</td>
                <td style={{padding:'6px 8px',fontWeight:600}}>{m.machine}</td>
                <td style={{padding:'6px 8px',fontSize:10}}>{m.old_mould?.split(' - ')[0]} → {m.new_mould?.split(' - ')[0]}</td>
                <td style={{padding:'6px 8px',fontWeight:700,color:isOver?'#C00000':'#276221'}}>{m.total_minutes}m</td>
                <td style={{padding:'6px 8px',fontSize:10,color:isBest?'#276221':'#666'}}>{isBest?'🏆 Best!':m.total_minutes>data.bestMCTime?`+${m.total_minutes-data.bestMCTime}m`:'-'}</td>
                <td style={{padding:'6px 8px'}}>
                  <span style={{background:m.total_minutes<=35?'#276221':m.total_minutes<=45?'#854F0B':'#C00000',color:'#fff',padding:'2px 8px',borderRadius:999,fontSize:9,fontWeight:600}}>
                    {m.total_minutes<=35?'🟢 Fast':m.total_minutes<=45?'🟠 OK':'🔴 Slow'}
                  </span>
                </td>
              </tr>
            })}</tbody>
          </table>
        </div>
      </div>}

    </div>}

    {!data&&!loading&&<div style={{...S.card,textAlign:'center',color:'#666',padding:32}}>
      Staff member select karo — weekly report load hoga! 👆
    </div>}
  </div>
}

// ─── MIS Dashboard Component ──────────────────────────────────

// ─── Today's Plan Banner ─────────────────────────────────────
function TodaysPlanBanner() {
  const [plans,setPlans]=useState<any[]>([])
  const [show,setShow]=useState(true)

  useEffect(()=>{
    fetch(`/api/planning?date=${nd()}`).then(r=>r.json()).then(d=>{
      setPlans(d.data||[])
    })
  },[])

  if(!plans.length||!show) return null

  const priorityCol=(p:string)=>p==='High'?'#C00000':p==='Medium'?'#854F0B':'#276221'
  const priorityBg=(p:string)=>p==='High'?'#FFEBEE':p==='Medium'?'#FFF3E0':'#E8F5E9'
  const priorityIcon=(p:string)=>p==='High'?'🔴':p==='Medium'?'🟡':'🟢'

  return <div style={{margin:'0 8px 8px 8px',background:'#1F3864',borderRadius:10,padding:'10px 14px'}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
      <div style={{color:'#FFD966',fontWeight:700,fontSize:13}}>📋 Aaj Ka Production Plan — {nd()}</div>
      <button onClick={()=>setShow(false)} style={{background:'none',border:'none',color:'#FFD966',fontSize:16,cursor:'pointer'}}>✕</button>
    </div>
    <div style={{display:'flex',gap:6,overflowX:'auto',paddingBottom:4}}>
      {plans.map((p:any,i:number)=><div key={i} style={{
        background:priorityBg(p.priority),
        borderRadius:8,
        padding:'8px 12px',
        minWidth:160,
        flexShrink:0,
        border:`2px solid ${priorityCol(p.priority)}`
      }}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
          <span style={{fontSize:10,fontWeight:700,color:priorityCol(p.priority)}}>{priorityIcon(p.priority)} {p.priority}</span>
          <span style={{fontSize:10,color:'#666'}}>{p.shift==='Day'?'☀️':'🌙'} {p.shift}</span>
        </div>
        <div style={{fontWeight:700,fontSize:12,color:'#1F3864',marginBottom:2}}>{p.machine||'Any Machine'}</div>
        <div style={{fontSize:11,color:'#333',marginBottom:4}}>{p.product}</div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span style={{background:'#1F3864',color:'#FFD966',borderRadius:4,padding:'2px 8px',fontSize:11,fontWeight:700}}>{p.planned_qty} Ctn</span>
          <span style={{fontSize:9,color:'#666'}}>{p.plant}</span>
        </div>
        {p.notes&&<div style={{fontSize:10,color:'#666',marginTop:4,fontStyle:'italic'}}>{p.notes}</div>}
      </div>)}
    </div>
    <div style={{fontSize:10,color:'#90A8C8',marginTop:6,textAlign:'right'}}>
      {plans.length} plan{plans.length>1?'s':''} aaj ke liye | Planning tab mein details dekho
    </div>
  </div>
}

function MISDashboard() {
  const [period,setPeriod]=useState('week')
  const [from,setFrom]=useState(()=>{const d=new Date();d.setDate(d.getDate()-d.getDay()+1);return d.toISOString().split('T')[0]})
  const [to,setTo]=useState(nd())
  const [data,setData]=useState<any>(null)
  const [loading,setLoading]=useState(false)
  const [activeTab,setActiveTab]=useState('summary')

  const setPeriodDates=(p:string)=>{
    const today=new Date()
    let f=new Date(),t=new Date()
    if(p==='week'){f=new Date(today);f.setDate(today.getDate()-today.getDay()+1)}
    else if(p==='month'){f=new Date(today.getFullYear(),today.getMonth(),1)}
    else if(p==='15days'){f=new Date(today);f.setDate(today.getDate()-14)}
    else if(p==='7days'){f=new Date(today);f.setDate(today.getDate()-6)}
    setFrom(f.toISOString().split('T')[0])
    setTo(t.toISOString().split('T')[0])
    setPeriod(p)
  }

  const load=async()=>{
    setLoading(true)
    const [prodRes,bdRes,mcRes]=await Promise.all([
      fetch(`/api/production?from=${from}&to=${to}`).then(r=>r.json()),
      fetch(`/api/breakdown?from=${from}&to=${to}`).then(r=>r.json()),
      fetch(`/api/mouldchange?from=${from}&to=${to}`).then(r=>r.json()),
    ])

    const prod=prodRes.data||[]
    const bd=bdRes.data||[]
    const mc=mcRes.data||[]

    // Overall KPIs
    const totalGood=prod.reduce((a:number,e:any)=>a+(e.good_parts||0),0)
    const totalRej=prod.reduce((a:number,e:any)=>a+(e.rejection||0),0)
    const totalDown=prod.reduce((a:number,e:any)=>a+(e.downtime||0),0)
    const overallEff=totalGood+totalRej>0?Math.round(totalGood/(totalGood+totalRej)*100*100)/100:0

    // Day vs Night
    const dayProd=prod.filter(e=>e.shift?.toLowerCase().includes('day'))
    const nightProd=prod.filter(e=>e.shift?.toLowerCase().includes('night'))
    const dayGood=dayProd.reduce((a:number,e:any)=>a+(e.good_parts||0),0)
    const dayRej=dayProd.reduce((a:number,e:any)=>a+(e.rejection||0),0)
    const dayDown=dayProd.reduce((a:number,e:any)=>a+(e.downtime||0),0)
    const nightGood=nightProd.reduce((a:number,e:any)=>a+(e.good_parts||0),0)
    const nightRej=nightProd.reduce((a:number,e:any)=>a+(e.rejection||0),0)
    const nightDown=nightProd.reduce((a:number,e:any)=>a+(e.downtime||0),0)
    const dayRejRate=dayGood+dayRej>0?Math.round(dayRej/(dayGood+dayRej)*100*100)/100:0
    const nightRejRate=nightGood+nightRej>0?Math.round(nightRej/(nightGood+nightRej)*100*100)/100:0
    const dayEff=dayGood+dayRej>0?Math.round(dayGood/(dayGood+dayRej)*100*100)/100:0
    const nightEff=nightGood+nightRej>0?Math.round(nightGood/(nightGood+nightRej)*100*100)/100:0

    // Machine wise
    const allMachines=prod.map(e=>e.machine).filter((v:string,i:number,a:string[])=>a.indexOf(v)===i)
    const machineData=allMachines.map((machine:string)=>{
      const mp=prod.filter(e=>e.machine===machine)
      const good=mp.reduce((a:number,e:any)=>a+(e.good_parts||0),0)
      const rej=mp.reduce((a:number,e:any)=>a+(e.rejection||0),0)
      const down=mp.reduce((a:number,e:any)=>a+(e.downtime||0),0)
      const eff=good+rej>0?Math.round(good/(good+rej)*100*100)/100:0
      const rejRate=good+rej>0?Math.round(rej/(good+rej)*100*100)/100:0
      const plant=mp[0]?.plant||''
      const product=mp[mp.length-1]?.product||''
      const shifts=mp.length
      const status=rejRate<=0.5?'✅ Excellent':rejRate<=1?'⚠️ Monitor':'❌ Action'
      return {machine,plant,product,good,rej,down,eff,rejRate,shifts,status}
    }).sort((a,b)=>b.good-a.good)

    // Operator wise
    const allOps=prod.map(e=>e.entered_by||e.operator).filter(Boolean).filter((v:string,i:number,a:string[])=>a.indexOf(v)===i)
    const operatorData=allOps.map((op:string)=>{
      const dayP=prod.filter(e=>(e.entered_by===op||e.operator===op)&&e.shift?.toLowerCase().includes('day'))
      const nightP=prod.filter(e=>(e.entered_by===op||e.operator===op)&&e.shift?.toLowerCase().includes('night'))
      const allP=prod.filter(e=>e.entered_by===op||e.operator===op)
      const good=allP.reduce((a:number,e:any)=>a+(e.good_parts||0),0)
      const rej=allP.reduce((a:number,e:any)=>a+(e.rejection||0),0)
      const down=allP.reduce((a:number,e:any)=>a+(e.downtime||0),0)
      const eff=good+rej>0?Math.round(good/(good+rej)*100*100)/100:0
      const rejRate=good+rej>0?Math.round(rej/(good+rej)*100*100)/100:0
      const shifts=allP.length
      const volGrade=good>=500000?'A+':good>=200000?'A':good>=100000?'B':'C'
      const qualGrade=rejRate<=0.1?'A+':rejRate<=0.3?'A':rejRate<=0.5?'B':'C'
      const overall=volGrade==='A+'&&qualGrade==='A+'?'A+':volGrade>='A'&&qualGrade>='A'?'A':volGrade>='B'&&qualGrade>='B'?'B':'C'
      return {op,good,rej,down,eff,rejRate,shifts,volGrade,qualGrade,overall,dayShifts:dayP.length,nightShifts:nightP.length}
    }).sort((a,b)=>b.good-a.good)

    // Date wise
    const dates:string[]=prod.map(e=>e.date).filter((v:string,i:number,a:string[])=>a.indexOf(v)===i).sort()
    const dateData=dates.map((date:string)=>{
      const dp=prod.filter(e=>e.date===date&&e.shift?.toLowerCase().includes('day'))
      const np=prod.filter(e=>e.date===date&&e.shift?.toLowerCase().includes('night'))
      const dg=dp.reduce((a:number,e:any)=>a+(e.good_parts||0),0)
      const dr=dp.reduce((a:number,e:any)=>a+(e.rejection||0),0)
      const dd=dp.reduce((a:number,e:any)=>a+(e.downtime||0),0)
      const ng=np.reduce((a:number,e:any)=>a+(e.good_parts||0),0)
      const nr=np.reduce((a:number,e:any)=>a+(e.rejection||0),0)
      const nd_=np.reduce((a:number,e:any)=>a+(e.downtime||0),0)
      return {date,dg,dr,dd,ng,nr,nd_,
        dayEff:dg+dr>0?Math.round(dg/(dg+dr)*100*10)/10:0,
        nightEff:ng+nr>0?Math.round(ng/(ng+nr)*100*10)/10:0,
        winner:dg>ng?'☀️ Day':'🌙 Night'}
    })

    // KRA
    const kras=[
      {kra:'KRA 1: Production Volume',value:`${(totalGood/1000).toFixed(1)}K parts`,target:'≥ 5,00,000/week',status:totalGood>=500000?'achieved':totalGood>=300000?'monitor':'action'},
      {kra:'KRA 2: Overall Efficiency',value:`${overallEff}%`,target:'≥ 95%',status:overallEff>=95?'achieved':overallEff>=90?'monitor':'action'},
      {kra:'KRA 3: Rejection Control',value:`${(totalRej/(totalGood+totalRej)*100).toFixed(2)}%`,target:'≤ 1%',status:totalRej/(totalGood+totalRej||1)<=0.01?'achieved':totalRej/(totalGood+totalRej||1)<=0.02?'monitor':'action'},
      {kra:'KRA 4: Downtime Control',value:`${totalDown} min`,target:'≤ 500 min/week',status:totalDown<=500?'achieved':totalDown<=1000?'monitor':'action'},
      {kra:'KRA 5: Day Shift Quality',value:`${dayRejRate}%`,target:'≤ 0.3%',status:dayRejRate<=0.3?'achieved':dayRejRate<=0.5?'monitor':'action'},
      {kra:'KRA 6: Night Shift Quality',value:`${nightRejRate}%`,target:'≤ 0.3%',status:nightRejRate<=0.3?'achieved':nightRejRate<=0.5?'monitor':'action'},
      {kra:'KRA 7: Breakdown Resolved',value:`${bd.filter(b=>b.status==='Resolved').length}/${bd.length}`,target:'100% resolved',status:bd.length===0||bd.every(b=>b.status==='Resolved')?'achieved':bd.filter(b=>b.status==='Resolved').length/bd.length>=0.8?'monitor':'action'},
    ]

    setData({totalGood,totalRej,totalDown,overallEff,dayGood,dayRej,dayDown,dayRejRate,dayEff,nightGood,nightRej,nightDown,nightRejRate,nightEff,machineData,operatorData,dateData,kras,bd,mc})
    setLoading(false)
  }

  useEffect(()=>{load()},[from,to])

  const TABS=[{id:'summary',label:'📊 Summary'},{id:'machines',label:'🏭 Machines'},{id:'operators',label:'👷 Operators'},{id:'daily',label:'🌗 Day vs Night'},{id:'kra',label:'🎯 KRA'}]

  const statusBg=(s:string)=>s==='achieved'?'#E8F5E9':s==='monitor'?'#FFF3E0':'#FFEBEE'
  const statusCol=(s:string)=>s==='achieved'?'#276221':s==='monitor'?'#E65100':'#C00000'
  const statusIcon=(s:string)=>s==='achieved'?'✅ ACHIEVED':s==='monitor'?'⚠️ MONITOR':'❌ ACTION'

  return <div>
    {/* Period Selector */}
    <div style={S.card}>
      <div style={{display:'flex',gap:6,flexWrap:'wrap' as const,marginBottom:8}}>
        {[{id:'7days',label:'7 Din'},{id:'week',label:'Is Hafte'},{id:'15days',label:'15 Din'},{id:'month',label:'Is Mahine'},{id:'custom',label:'Custom'}].map(p=>
          <button key={p.id} onClick={()=>setPeriodDates(p.id)} style={{padding:'5px 12px',border:`1px solid ${period===p.id?'#1F3864':'#E0E0E0'}`,borderRadius:6,background:period===p.id?'#1F3864':'#fff',color:period===p.id?'#fff':'#666',fontSize:11,fontWeight:600,cursor:'pointer'}}>{p.label}</button>
        )}
      </div>
      <div style={{display:'flex',gap:8,alignItems:'center'}}>
        <input type="date" style={{...S.fi,flex:1}} value={from} onChange={e=>{setFrom(e.target.value);setPeriod('custom')}}/>
        <span style={{color:'#666',fontSize:12}}>to</span>
        <input type="date" style={{...S.fi,flex:1}} value={to} onChange={e=>{setTo(e.target.value);setPeriod('custom')}}/>
        <button onClick={load} style={{background:'#1F3864',color:'#fff',border:'none',borderRadius:6,padding:'8px 16px',fontSize:12,fontWeight:600,cursor:'pointer'}}>🔍 Load</button>
      </div>
    </div>

    {loading&&<div style={{textAlign:'center',padding:32,color:'#666',fontSize:14}}>Loading MIS Dashboard... ⏳</div>}

    {data&&!loading&&<div>
      {/* Tab Navigation */}
      <div style={{display:'flex',gap:4,marginBottom:8,overflowX:'auto' as const,flexWrap:'wrap' as const}}>
        {TABS.map(t=><button key={t.id} onClick={()=>setActiveTab(t.id)} style={{padding:'7px 12px',border:`2px solid ${activeTab===t.id?'#1F3864':'#E0E0E0'}`,borderRadius:8,background:activeTab===t.id?'#1F3864':'#fff',color:activeTab===t.id?'#fff':'#666',fontSize:11,fontWeight:700,cursor:'pointer',whiteSpace:'nowrap' as const}}>{t.label}</button>)}
      </div>

      {/* SUMMARY TAB */}
      {activeTab==='summary'&&<div>
        {/* Top KPI Row */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:8,marginBottom:8}}>
          {[
            {label:'Total Good Parts',val:data.totalGood.toLocaleString(),col:'#276221',bg:'#E8F5E9',icon:'🏭'},
            {label:'Total Rejection',val:data.totalRej.toLocaleString(),col:'#C00000',bg:'#FFEBEE',icon:'❌'},
            {label:'Overall Efficiency',val:data.overallEff+'%',col:data.overallEff>=95?'#276221':data.overallEff>=90?'#854F0B':'#C00000',bg:data.overallEff>=95?'#E8F5E9':data.overallEff>=90?'#FFF3E0':'#FFEBEE',icon:'⚡'},
            {label:'Total Downtime',val:data.totalDown+'m',col:'#854F0B',bg:'#FFF3E0',icon:'⏱️'},
          ].map((k,i)=><div key={i} style={{background:k.bg,borderRadius:10,padding:'12px',border:`1px solid ${k.col}33`}}>
            <div style={{fontSize:10,color:k.col,fontWeight:600}}>{k.icon} {k.label}</div>
            <div style={{fontSize:22,fontWeight:700,color:k.col,marginTop:4}}>{k.val}</div>
          </div>)}
        </div>

        {/* Shift Comparison */}
        <div style={S.card}>
          <div style={{fontWeight:700,color:'#1F3864',marginBottom:10,fontSize:13}}>🌗 Shift Comparison</div>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
            <thead><tr>
              {['Metric','☀️ Day Shift','🌙 Night Shift','Winner'].map(h=><th key={h} style={{background:'#1F3864',color:'#fff',padding:'8px',textAlign:'center'}}>{h}</th>)}
            </tr></thead>
            <tbody>{[
              {metric:'Good Parts',day:data.dayGood.toLocaleString(),night:data.nightGood.toLocaleString(),winner:data.dayGood>data.nightGood?'☀️ Day':'🌙 Night'},
              {metric:'Rejection',day:data.dayRej.toLocaleString(),night:data.nightRej.toLocaleString(),winner:data.dayRej<data.nightRej?'☀️ Day ✓':'🌙 Night ✓'},
              {metric:'Rej Rate %',day:data.dayRejRate+'%',night:data.nightRejRate+'%',winner:data.dayRejRate<data.nightRejRate?'☀️ Day ✓':'🌙 Night ✓'},
              {metric:'Efficiency',day:data.dayEff+'%',night:data.nightEff+'%',winner:data.dayEff>data.nightEff?'☀️ Day':'🌙 Night'},
              {metric:'Downtime (min)',day:data.dayDown+'m',night:data.nightDown+'m',winner:data.dayDown<data.nightDown?'☀️ Day ✓':'🌙 Night ✓'},
            ].map((r:any,i:number)=><tr key={i} style={{background:i%2===0?'#FAFAFA':'#fff'}}>
              <td style={{padding:'8px',fontWeight:600,color:'#1F3864'}}>{r.metric}</td>
              <td style={{padding:'8px',textAlign:'center',color:'#E65100',fontWeight:700,background:'#FFF8F0'}}>{r.day}</td>
              <td style={{padding:'8px',textAlign:'center',color:'#5B2C8D',fontWeight:700,background:'#F8F5FF'}}>{r.night}</td>
              <td style={{padding:'8px',textAlign:'center',fontWeight:700,color:'#276221'}}>{r.winner}</td>
            </tr>)}</tbody>
          </table>
        </div>
      </div>}

      {/* MACHINES TAB */}
      {activeTab==='machines'&&<div style={S.card}>
        <div style={{fontWeight:700,color:'#1F3864',marginBottom:10,fontSize:13}}>🏭 Machine-wise KPI Report</div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
            <thead><tr>
              {['Machine','Plant','Product','Good Parts','Rejection','Rej %','Downtime','Efficiency','Shifts','Status'].map(h=>
                <th key={h} style={{background:'#1F3864',color:'#fff',padding:'7px 8px',textAlign:'center',whiteSpace:'nowrap' as const}}>{h}</th>)}
            </tr></thead>
            <tbody>{data.machineData.map((m:any,i:number)=>{
              const rejCol=m.rejRate<=0.5?'#276221':m.rejRate<=1?'#854F0B':'#C00000'
              const effCol=m.eff>=95?'#276221':m.eff>=90?'#854F0B':'#C00000'
              return <tr key={i} style={{background:i%2===0?'#F8F9FF':'#fff'}}>
                <td style={{padding:'7px 8px',fontWeight:700,color:'#1F3864'}}>{m.machine}</td>
                <td style={{padding:'7px 8px',fontSize:10,color:'#666'}}>{m.plant}</td>
                <td style={{padding:'7px 8px',fontSize:10,maxWidth:100,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' as const}}>{m.product}</td>
                <td style={{padding:'7px 8px',textAlign:'center',fontWeight:700,color:'#276221'}}>{m.good.toLocaleString()}</td>
                <td style={{padding:'7px 8px',textAlign:'center',fontWeight:700,color:'#C00000'}}>{m.rej.toLocaleString()}</td>
                <td style={{padding:'7px 8px',textAlign:'center',fontWeight:700,color:rejCol,background:m.rejRate<=0.5?'#E8F5E9':m.rejRate<=1?'#FFF3E0':'#FFEBEE'}}>{m.rejRate}%</td>
                <td style={{padding:'7px 8px',textAlign:'center',color:'#854F0B'}}>{m.down}m</td>
                <td style={{padding:'7px 8px',textAlign:'center',fontWeight:700,color:effCol}}>{m.eff}%</td>
                <td style={{padding:'7px 8px',textAlign:'center',color:'#666'}}>{m.shifts}</td>
                <td style={{padding:'7px 8px',textAlign:'center'}}>
                  <span style={{background:m.rejRate<=0.5?'#276221':m.rejRate<=1?'#854F0B':'#C00000',color:'#fff',padding:'3px 8px',borderRadius:999,fontSize:9,fontWeight:600}}>{m.status}</span>
                </td>
              </tr>
            })}</tbody>
            <tfoot><tr style={{background:'#1F3864'}}>
              <td colSpan={3} style={{padding:'8px',color:'#FFD966',fontWeight:700}}>TOTAL</td>
              <td style={{padding:'8px',textAlign:'center',color:'#4CAF50',fontWeight:700,fontSize:13}}>{data.totalGood.toLocaleString()}</td>
              <td style={{padding:'8px',textAlign:'center',color:'#FF5252',fontWeight:700,fontSize:13}}>{data.totalRej.toLocaleString()}</td>
              <td style={{padding:'8px',textAlign:'center',color:'#FFD966',fontWeight:700}}>{data.overallEff}%</td>
              <td style={{padding:'8px',textAlign:'center',color:'#FF9800',fontWeight:700}}>{data.totalDown}m</td>
              <td colSpan={3} style={{padding:'8px',color:'#90A8C8',textAlign:'center'}}>{data.machineData.length} machines</td>
            </tr></tfoot>
          </table>
        </div>
      </div>}

      {/* OPERATORS TAB */}
      {activeTab==='operators'&&<div style={S.card}>
        <div style={{fontWeight:700,color:'#1F3864',marginBottom:10,fontSize:13}}>👷 Operator-wise KPI Report</div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
            <thead><tr>
              {['Operator','Good Parts','Rejection','Rej %','Downtime','Shifts','Efficiency','Vol Grade','Quality Grade','Overall KRA'].map(h=>
                <th key={h} style={{background:'#1F3864',color:'#fff',padding:'7px 8px',textAlign:'center',whiteSpace:'nowrap' as const}}>{h}</th>)}
            </tr></thead>
            <tbody>{data.operatorData.map((op:any,i:number)=>{
              const gradeCol=(g:string)=>g==='A+'?'#276221':g==='A'?'#2E75B6':g==='B'?'#854F0B':'#C00000'
              const gradeBg=(g:string)=>g==='A+'?'#E8F5E9':g==='A'?'#E6F1FB':g==='B'?'#FFF3E0':'#FFEBEE'
              return <tr key={i} style={{background:i%2===0?'#FAFAFA':'#fff'}}>
                <td style={{padding:'7px 8px',fontWeight:700,color:'#1F3864'}}>{op.op}</td>
                <td style={{padding:'7px 8px',textAlign:'center',color:'#276221',fontWeight:700}}>{op.good.toLocaleString()}</td>
                <td style={{padding:'7px 8px',textAlign:'center',color:'#C00000',fontWeight:700}}>{op.rej.toLocaleString()}</td>
                <td style={{padding:'7px 8px',textAlign:'center',fontWeight:700,color:op.rejRate<=0.3?'#276221':op.rejRate<=0.5?'#854F0B':'#C00000'}}>{op.rejRate}%</td>
                <td style={{padding:'7px 8px',textAlign:'center',color:'#854F0B'}}>{op.down}m</td>
                <td style={{padding:'7px 8px',textAlign:'center',color:'#666'}}>{op.shifts}</td>
                <td style={{padding:'7px 8px',textAlign:'center',fontWeight:700,color:op.eff>=95?'#276221':op.eff>=90?'#854F0B':'#C00000'}}>{op.eff}%</td>
                {['volGrade','qualGrade','overall'].map(g=><td key={g} style={{padding:'5px'}}>
                  <div style={{background:gradeBg(op[g]),color:gradeCol(op[g]),fontWeight:700,fontSize:14,textAlign:'center',borderRadius:6,padding:'4px'}}>{op[g]}</div>
                </td>)}
              </tr>
            })}</tbody>
          </table>
        </div>
        <div style={{marginTop:8,fontSize:10,color:'#666',background:'#F5F5F5',padding:'6px 10px',borderRadius:6}}>
          A+ = Excellent | A = Good | B = Average | C = Needs Improvement
        </div>
      </div>}

      {/* DAILY TAB */}
      {activeTab==='daily'&&<div style={S.card}>
        <div style={{fontWeight:700,color:'#1F3864',marginBottom:10,fontSize:13}}>🌗 Day vs Night — Daily Data</div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
            <thead>
              <tr>
                <th rowSpan={2} style={{background:'#1F3864',color:'#fff',padding:'7px 8px'}}>Date</th>
                <th colSpan={4} style={{background:'#E65100',color:'#fff',padding:'7px 8px',textAlign:'center'}}>☀️ Day Shift</th>
                <th colSpan={4} style={{background:'#5B2C8D',color:'#fff',padding:'7px 8px',textAlign:'center'}}>🌙 Night Shift</th>
                <th rowSpan={2} style={{background:'#276221',color:'#fff',padding:'7px 8px'}}>Winner</th>
              </tr>
              <tr>
                {['Good','Rej','Rej%','Eff%','Good','Rej','Rej%','Eff%'].map((h,i)=>
                  <th key={i} style={{background:i<4?'#FFF3E0':'#F3E5F5',color:i<4?'#E65100':'#5B2C8D',padding:'5px 6px',textAlign:'center',fontSize:10}}>{h}</th>)}
              </tr>
            </thead>
            <tbody>{data.dateData.map((d:any,i:number)=><tr key={i} style={{background:i%2===0?'#FAFAFA':'#fff'}}>
              <td style={{padding:'7px 8px',fontWeight:600,fontSize:11}}>{d.date}</td>
              <td style={{padding:'6px',textAlign:'center',color:'#276221',fontWeight:600}}>{d.dg.toLocaleString()}</td>
              <td style={{padding:'6px',textAlign:'center',color:'#C00000'}}>{d.dr}</td>
              <td style={{padding:'6px',textAlign:'center',color:d.dg+d.dr>0&&d.dr/(d.dg+d.dr)*100>1?'#C00000':'#276221',fontWeight:600}}>{d.dg+d.dr>0?Math.round(d.dr/(d.dg+d.dr)*100*100)/100:0}%</td>
              <td style={{padding:'6px',textAlign:'center',fontWeight:700,color:d.dayEff>=95?'#276221':d.dayEff>=90?'#854F0B':'#C00000'}}>{d.dayEff}%</td>
              <td style={{padding:'6px',textAlign:'center',color:'#5B2C8D',fontWeight:600}}>{d.ng.toLocaleString()}</td>
              <td style={{padding:'6px',textAlign:'center',color:'#C00000'}}>{d.nr}</td>
              <td style={{padding:'6px',textAlign:'center',color:d.ng+d.nr>0&&d.nr/(d.ng+d.nr)*100>1?'#C00000':'#276221',fontWeight:600}}>{d.ng+d.nr>0?Math.round(d.nr/(d.ng+d.nr)*100*100)/100:0}%</td>
              <td style={{padding:'6px',textAlign:'center',fontWeight:700,color:d.nightEff>=95?'#276221':d.nightEff>=90?'#854F0B':'#C00000'}}>{d.nightEff}%</td>
              <td style={{padding:'6px',textAlign:'center',fontWeight:600,fontSize:11}}>{d.winner}</td>
            </tr>)}</tbody>
            <tfoot><tr style={{background:'#1F3864'}}>
              <td style={{padding:'8px',color:'#FFD966',fontWeight:700}}>TOTAL</td>
              <td style={{padding:'8px',textAlign:'center',color:'#4CAF50',fontWeight:700}}>{data.dayGood.toLocaleString()}</td>
              <td style={{padding:'8px',textAlign:'center',color:'#FF5252',fontWeight:700}}>{data.dayRej}</td>
              <td style={{padding:'8px',textAlign:'center',color:'#FFD966',fontWeight:700}}>{data.dayRejRate}%</td>
              <td style={{padding:'8px',textAlign:'center',color:'#FFD966',fontWeight:700}}>{data.dayEff}%</td>
              <td style={{padding:'8px',textAlign:'center',color:'#CE93D8',fontWeight:700}}>{data.nightGood.toLocaleString()}</td>
              <td style={{padding:'8px',textAlign:'center',color:'#FF5252',fontWeight:700}}>{data.nightRej}</td>
              <td style={{padding:'8px',textAlign:'center',color:'#FFD966',fontWeight:700}}>{data.nightRejRate}%</td>
              <td style={{padding:'8px',textAlign:'center',color:'#FFD966',fontWeight:700}}>{data.nightEff}%</td>
              <td style={{padding:'8px',textAlign:'center',color:'#90A8C8'}}>—</td>
            </tr></tfoot>
          </table>
        </div>
      </div>}

      {/* KRA TAB */}
      {activeTab==='kra'&&<div style={S.card}>
        <div style={{fontWeight:700,color:'#1F3864',marginBottom:10,fontSize:13}}>🎯 Key Result Areas (KRA) — Plant Level</div>
        {data.kras.map((k,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 14px',marginBottom:6,background:statusBg(k.status),border:`1px solid ${statusCol(k.status)}33`,borderRadius:8}}>
          <div>
            <div style={{fontWeight:700,fontSize:12,color:'#1F3864'}}>{k.kra}</div>
            <div style={{fontSize:11,color:'#666',marginTop:2}}>Target: {k.target}</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:16,fontWeight:700,color:statusCol(k.status)}}>{k.value}</div>
            <div style={{marginTop:4}}>
              <span style={{background:statusCol(k.status),color:'#fff',padding:'3px 10px',borderRadius:999,fontSize:10,fontWeight:600}}>{statusIcon(k.status)}</span>
            </div>
          </div>
        </div>)}
      </div>}
    </div>}
  </div>
}

// ─── Daily Activity Report ────────────────────────────────────
function DailyReportTab({user}:{user:User}) {
  const [date,setDate]=useState(nd())
  const [plant,setPlant]=useState('All')
  const [data,setData]=useState<any>(null)
  const [loading,setLoading]=useState(false)

  const load=async()=>{
    setLoading(true)
    const plantParam=plant==='All'?'':encodeURIComponent(plant)
    const [prodRes,bdRes,mcRes,pmRes,sparesRes]=await Promise.all([
      fetch(`/api/production?date=${date}${plantParam?`&plant=${plantParam}`:''}`).then(r=>r.json()),
      fetch(`/api/breakdown?date=${date}`).then(r=>r.json()),
      fetch(`/api/mouldchange?date=${date}`).then(r=>r.json()),
      fetch(`/api/mouldpm?date=${date}`).then(r=>r.json()),
      fetch(`/api/spares?date=${date}`).then(r=>r.json()),
    ])
    setData({
      prod:prodRes.data||[],
      bd:bdRes.data||[],
      mc:mcRes.data||[],
      pm:pmRes.data||[],
      spares:sparesRes.data||[]
    })
    setLoading(false)
  }

  useEffect(()=>{load()},[date,plant])

  const goDate=(days:number)=>{
    const d=new Date(date)
    d.setDate(d.getDate()+days)
    setDate(d.toISOString().split('T')[0])
  }

  if(!data&&!loading) return <div style={{textAlign:'center',padding:32}}>Loading...</div>

  // Calculations
  const totalGood=data?.prod?.reduce((a:number,e:any)=>a+(e.good_parts||0),0)||0
  const totalRej=data?.prod?.reduce((a:number,e:any)=>a+(e.rejection||0),0)||0
  const totalDown=data?.prod?.reduce((a:number,e:any)=>a+(e.downtime||0),0)||0
  const eff=totalGood+totalRej>0?Math.round(totalGood/(totalGood+totalRej)*100*10)/10:0
  const dayProd=data?.prod?.filter(e=>e.shift?.toLowerCase().includes('day'))||[]
  const nightProd=data?.prod?.filter(e=>e.shift?.toLowerCase().includes('night'))||[]
  const dayGood=dayProd.reduce((a:number,e:any)=>a+(e.good_parts||0),0)
  const nightGood=nightProd.reduce((a:number,e:any)=>a+(e.rejection||0),0)
  const pendingBd=data?.bd?.filter(b=>b.status!=='Resolved')||[]
  const resolvedBd=data?.bd?.filter(b=>b.status==='Resolved')||[]
  const mcDone=data?.mc?.filter(m=>m.status==='complete')||[]
  const mcInProgress=data?.mc?.filter(m=>m.status==='in_progress')||[]
  const sparesIn=data?.spares?.filter((s:any)=>s.action==='Stock In')||[]
  const sparesOut=data?.spares?.filter((s:any)=>s.action!=='Stock In')||[]

  // Machine wise production
  const machines=(data?.prod||[]).map(e=>e.machine).filter(Boolean).filter((v:string,i:number,a:string[])=>a.indexOf(v)===i)
  const machineStats=machines.map((m:string)=>{
    const mp=(data?.prod||[]).filter(e=>e.machine===m)
    const good=mp.reduce((a:number,e:any)=>a+(e.good_parts||0),0)
    const rej=mp.reduce((a:number,e:any)=>a+(e.rejection||0),0)
    const down=mp.reduce((a:number,e:any)=>a+(e.downtime||0),0)
    const eff=good+rej>0?Math.round(good/(good+rej)*100):0
    const remarks=mp.map(e=>e.remarks).filter(Boolean).join(' | ')
    return {machine:m,good,rej,down,eff,product:mp[mp.length-1]?.product||'',shift:mp[0]?.shift||'',remarks}
  }).sort((a,b)=>b.good-a.good)

  // Simple SVG pie chart
  const PieChart=({good,rej}:{good:number,rej:number})=>{
    const total=good+rej
    if(total===0) return <div style={{textAlign:'center',color:'#ccc',fontSize:12}}>No data</div>
    const goodPct=good/total
    const rejPct=rej/total
    const r=60,cx=70,cy=70
    const goodAngle=goodPct*360
    const toRad=(deg:number)=>deg*Math.PI/180
    const x1=cx+r*Math.sin(toRad(0))
    const y1=cy-r*Math.cos(toRad(0))
    const x2=cx+r*Math.sin(toRad(goodAngle))
    const y2=cy-r*Math.cos(toRad(goodAngle))
    const largeArc=goodAngle>180?1:0
    return <svg width="140" height="140">
      {goodPct<1&&<path d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`} fill="#276221"/>}
      {goodPct===1&&<circle cx={cx} cy={cy} r={r} fill="#276221"/>}
      {rejPct>0&&goodPct<1&&<path d={`M ${cx} ${cy} L ${x2} ${y2} A ${r} ${r} 0 ${1-largeArc} 1 ${x1} ${y1} Z`} fill="#C00000"/>}
      <circle cx={cx} cy={cy} r={40} fill="white"/>
      <text x={cx} y={cy-8} textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1F3864">{goodPct>0?Math.round(goodPct*100):0}%</text>
      <text x={cx} y={cy+10} textAnchor="middle" fontSize="9" fill="#666">efficiency</text>
    </svg>
  }

  // Bar chart for machines
  const BarChart=({stats}:{stats:any[]})=>{
    if(!stats.length) return null
    return <div style={{overflowX:'auto'}}>
      <table style={{width:'100%',borderCollapse:'collapse',fontSize:10}}>
        <thead><tr>
          {['Machine','Product','Good','Eff%'].map(h=><th key={h} style={{background:'#1F3864',color:'#fff',padding:'4px 6px',textAlign:'center'}}>{h}</th>)}
        </tr></thead>
        <tbody>{stats.map((s:any,i:number)=>{
          const effCol=s.eff>=90?'#276221':s.eff>=75?'#854F0B':'#C00000'
          const effBg=s.eff>=90?'#E8F5E9':s.eff>=75?'#FFF3E0':s.eff>0?'#FFEBEE':'transparent'
          return <tr key={i} style={{background:i%2===0?'#F8F9FF':'#fff'}}>
            <td style={{padding:'4px 6px',fontWeight:700,color:'#1F3864',whiteSpace:'nowrap' as const}}>{s.machine}</td>
            <td style={{padding:'4px 6px',fontSize:9,color:'#666',maxWidth:80,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' as const}}>{s.product}</td>
            <td style={{padding:'4px 6px',textAlign:'center',color:'#276221',fontWeight:600}}>{s.good.toLocaleString()}</td>
            <td style={{padding:'4px 6px',textAlign:'center',fontWeight:700,color:effCol,background:effBg}}>{s.eff>0?s.eff+'%':'--'}</td>
          </tr>
        })}</tbody>
      </table>
    </div>
  }

  return <div>
    {/* Header */}
    <div style={{background:'linear-gradient(135deg,#1F3864,#2E75B6)',borderRadius:12,padding:'14px 16px',marginBottom:8,color:'#fff'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
        <div style={{fontWeight:700,fontSize:16}}>📅 Daily Activity Report</div>
        <div style={{display:'flex',gap:6,alignItems:'center'}}>
          <select value={plant} onChange={e=>setPlant(e.target.value)} style={{padding:'5px 8px',borderRadius:6,border:'none',fontSize:11,fontWeight:600}}>
            <option value="All">All Plants</option>
            <option>Plant 477</option><option>Plant 488</option><option>Plant 433</option>
          </select>
        </div>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:8,justifyContent:'center'}}>
        <button onClick={()=>goDate(-1)} style={{background:'rgba(255,255,255,0.2)',border:'none',color:'#fff',borderRadius:6,padding:'6px 14px',cursor:'pointer',fontSize:16}}>◀</button>
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{padding:'6px 12px',borderRadius:8,border:'none',fontSize:13,fontWeight:700,color:'#1F3864',textAlign:'center'}}/>
        <button onClick={()=>goDate(1)} disabled={date>=nd()} style={{background:date>=nd()?'rgba(255,255,255,0.1)':'rgba(255,255,255,0.2)',border:'none',color:'#fff',borderRadius:6,padding:'6px 14px',cursor:date>=nd()?'not-allowed':'pointer',fontSize:16}}>▶</button>
      </div>
      {date===nd()&&<div style={{textAlign:'center',marginTop:6,fontSize:11,color:'#90CAF9'}}>📌 Aaj Ka Report</div>}
    </div>

    {loading&&<div style={{textAlign:'center',padding:32,color:'#666'}}>Loading... ⏳</div>}

    {data&&!loading&&<div>
      {/* KPI Summary */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:6,marginBottom:8}}>
        {[
          {icon:'🏭',label:'Good Parts',val:totalGood.toLocaleString(),col:'#276221',bg:'#E8F5E9'},
          {icon:'❌',label:'Rejection',val:totalRej.toLocaleString(),col:'#C00000',bg:'#FFEBEE'},
          {icon:'⚡',label:'Efficiency',val:eff+'%',col:eff>=90?'#276221':eff>=75?'#854F0B':'#C00000',bg:eff>=90?'#E8F5E9':eff>=75?'#FFF3E0':'#FFEBEE'},
          {icon:'⏱️',label:'Downtime',val:totalDown+'m',col:'#854F0B',bg:'#FFF3E0'},
        ].map((k,i)=><div key={i} style={{background:k.bg,borderRadius:8,padding:'10px 8px',textAlign:'center',border:`1px solid ${k.col}33`}}>
          <div style={{fontSize:16}}>{k.icon}</div>
          <div style={{fontSize:18,fontWeight:700,color:k.col}}>{k.val}</div>
          <div style={{fontSize:9,color:'#666',marginTop:2}}>{k.label}</div>
        </div>)}
      </div>

      {/* Charts Row */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
        {/* Pie Chart */}
        <div style={S.card}>
          <div style={{fontWeight:700,color:'#1F3864',marginBottom:8,fontSize:12}}>📊 Good vs Rejection</div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:12}}>
            <PieChart good={totalGood} rej={totalRej}/>
            <div>
              <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:6}}>
                <div style={{width:12,height:12,borderRadius:2,background:'#276221'}}/>
                <span style={{fontSize:11}}>Good: {totalGood.toLocaleString()}</span>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:6}}>
                <div style={{width:12,height:12,borderRadius:2,background:'#C00000'}}/>
                <span style={{fontSize:11}}>Rej: {totalRej.toLocaleString()}</span>
              </div>
              <div style={{marginTop:8,fontSize:11}}>
                <div style={{color:'#E65100',fontWeight:600}}>☀️ Day: {dayGood.toLocaleString()}</div>
                <div style={{color:'#5B2C8D',fontWeight:600}}>🌙 Night: {nightGood.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div style={S.card}>
          <div style={{fontWeight:700,color:'#1F3864',marginBottom:8,fontSize:12}}>🏭 Machine Efficiency</div>
          {machineStats.length>0?<BarChart stats={machineStats}/>:<div style={{textAlign:'center',color:'#ccc',padding:20,fontSize:12}}>No data</div>}
        </div>
      </div>

      {/* Production Summary */}
      {data.prod.length>0&&<div style={S.card}>
        <div style={{fontWeight:700,color:'#276221',marginBottom:8,fontSize:12}}>🏭 Production Summary</div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
            <thead><tr>
              {['Machine','Product','Shift','Good','Rej','Down','Eff%','Remarks'].map(h=><th key={h} style={{background:'#276221',color:'#fff',padding:'6px 8px',textAlign:'center'}}>{h}</th>)}
            </tr></thead>
            <tbody>{(()=>{
              const byMachine:(typeof machineStats[0]&{shift:string,product:string})[]=[]
              data.prod.forEach(e=>{
                const eff=e.good_parts+e.rejection>0?Math.round(e.good_parts/(e.good_parts+e.rejection)*100):0
                byMachine.push({machine:e.machine,good:e.good_parts,rej:e.rejection,eff,shift:e.shift,product:e.product})
              })
              return byMachine.map((m:any,i:number)=>{
                const effCol=m.eff>=90?'#276221':m.eff>=75?'#854F0B':'#C00000'
                return <tr key={i} style={{background:i%2===0?'#F8FFF8':'#fff'}}>
                  <td style={{padding:'6px 8px',fontWeight:600,color:'#1F3864'}}>{m.machine}</td>
                  <td style={{padding:'6px 8px',fontSize:10}}>{m.product}</td>
                  <td style={{padding:'6px 8px',textAlign:'center',fontSize:10}}>{m.shift?.includes('Day')?'☀️':'🌙'}</td>
                  <td style={{padding:'6px 8px',textAlign:'center',color:'#276221',fontWeight:700}}>{m.good.toLocaleString()}</td>
                  <td style={{padding:'6px 8px',textAlign:'center',color:'#C00000'}}>{m.rej}</td>
                  <td style={{padding:'6px 8px',textAlign:'center',color:'#854F0B'}}>{m.down||0}m</td>
                  <td style={{padding:'6px 8px',textAlign:'center',fontWeight:700,color:effCol,background:m.eff>=90?'#E8F5E9':m.eff>=75?'#FFF3E0':m.eff>0?'#FFEBEE':'transparent'}}>{m.eff>0?m.eff+'%':'--'}</td>
                  <td style={{padding:'6px 8px',fontSize:10,color:'#666',fontStyle:'italic'}}>{m.remarks||'--'}</td>
                </tr>
              })
            })()}</tbody>
          </table>
        </div>
      </div>}

      {/* Breakdown */}
      <div style={S.card}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
          <div style={{fontWeight:700,color:'#C00000',fontSize:12}}>🔧 Breakdown Activity</div>
          <div style={{display:'flex',gap:6}}>
            {pendingBd.length>0&&<span style={{background:'#FFEBEE',color:'#C00000',padding:'2px 8px',borderRadius:999,fontSize:10,fontWeight:600}}>🔴 {pendingBd.length} Pending</span>}
            {resolvedBd.length>0&&<span style={{background:'#E8F5E9',color:'#276221',padding:'2px 8px',borderRadius:999,fontSize:10,fontWeight:600}}>✅ {resolvedBd.length} Resolved</span>}
          </div>
        </div>
        {data.bd.length===0?<div style={{textAlign:'center',color:'#276221',padding:12,fontSize:12}}>✅ Aaj koi breakdown nahi!</div>:
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
            <thead><tr>
              {['Machine','Plant','Mould Running','Problem','Analysis','Solution','Parts Used','Category','Reported','Resolved','Downtime','Status'].map(h=><th key={h} style={{background:'#C00000',color:'#fff',padding:'5px 8px',textAlign:'left',whiteSpace:'nowrap' as const}}>{h}</th>)}
            </tr></thead>
            <tbody>{data.bd.map((b:any,i:number)=>{
              const dtMins=b.reported_time&&b.resolved_time?Math.round((new Date(b.resolved_time).getTime()-new Date(b.reported_time).getTime())/60000):0
              return <tr key={i} style={{background:i%2===0?'#FFF5F5':'#fff'}}>
                <td style={{padding:'5px 8px',fontWeight:600,whiteSpace:'nowrap' as const}}>{b.machine}</td>
                <td style={{padding:'5px 8px',fontSize:10,color:'#666'}}>{b.plant}</td>
                <td style={{padding:'5px 8px',fontSize:10,color:'#1F3864',fontWeight:600,maxWidth:120,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' as const}} title={b.mould_running||'--'}>{b.mould_running||'--'}</td>
                <td style={{padding:'5px 8px',fontSize:10,maxWidth:120,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' as const}} title={b.problem}>{b.problem}</td>
                <td style={{padding:'5px 8px',fontSize:10,color:'#854F0B',maxWidth:120,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' as const}} title={b.analysis||'--'}>{b.analysis||'--'}</td>
                <td style={{padding:'5px 8px',fontSize:10,color:'#276221',maxWidth:120,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' as const}} title={b.solution||'--'}>{b.solution||'--'}</td>
                <td style={{padding:'5px 8px',fontSize:10,color:'#5B2C8D',maxWidth:100,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' as const}} title={b.spares_used||'--'}>{b.spares_used||'--'}</td>
                <td style={{padding:'5px 8px',fontSize:10}}><span style={{background:'#E6F1FB',color:'#1F3864',padding:'2px 5px',borderRadius:4,fontSize:9}}>{b.category}</span></td>
                <td style={{padding:'5px 8px',fontSize:10,color:'#C00000'}}>{b.reported_time?new Date(b.reported_time).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}):''}</td>
                <td style={{padding:'5px 8px',fontSize:10,color:'#276221'}}>{b.resolved_time?new Date(b.resolved_time).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}):'-'}</td>
                <td style={{padding:'5px 8px',fontWeight:600,color:dtMins>120?'#C00000':dtMins>60?'#854F0B':'#276221'}}>{dtMins>0?dtMins+'m':'--'}</td>
                <td style={{padding:'5px 8px'}}>
                  <span style={{background:b.status==='Resolved'?'#E8F5E9':'#FFEBEE',color:b.status==='Resolved'?'#276221':'#C00000',padding:'2px 8px',borderRadius:999,fontSize:9,fontWeight:600}}>
                    {b.status==='Resolved'?'✅ Resolved':'🔴 Pending'}
                  </span>
                </td>
              </tr>
            })}</tbody>
          </table>
        </div>}
      </div>

      {/* Mould Change */}
      <div style={S.card}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
          <div style={{fontWeight:700,color:'#854F0B',fontSize:12}}>🔄 Mould Change Activity</div>
          <div style={{display:'flex',gap:6}}>
            {mcDone.length>0&&<span style={{background:'#E8F5E9',color:'#276221',padding:'2px 8px',borderRadius:999,fontSize:10,fontWeight:600}}>✅ {mcDone.length} Done</span>}
            {mcInProgress.length>0&&<span style={{background:'#FFF3E0',color:'#E65100',padding:'2px 8px',borderRadius:999,fontSize:10,fontWeight:600}}>⏳ {mcInProgress.length} In Progress</span>}
          </div>
        </div>
        {data.mc.length===0?<div style={{textAlign:'center',color:'#276221',padding:12,fontSize:12}}>✅ Aaj koi mould change nahi!</div>:
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
            <thead><tr>
              {['Plant','Machine','Old Mould','New Mould','Start','Run','Total','Target','Result'].map(h=><th key={h} style={{background:'#854F0B',color:'#fff',padding:'5px 8px',textAlign:'left',whiteSpace:'nowrap' as const}}>{h}</th>)}
            </tr></thead>
            <tbody>{data.mc.map((m:any,i:number)=>{
              const onTime=m.estimated_min>0&&m.total_minutes>0&&m.total_minutes<=m.estimated_min
              return <tr key={i} style={{background:i%2===0?'#FFF9E6':'#fff'}}>
                <td style={{padding:'5px 8px',fontWeight:600}}>{m.machine}</td>
                <td style={{padding:'5px 8px',fontSize:10,color:'#666'}}>
                  <div style={{fontWeight:600}}>{m.old_mould?.split(' - ')[0]}</div>
                  <div style={{fontSize:9,color:'#999'}}>{m.old_mould?.split(' - ')[1]||''}</div>
                </td>
                <td style={{padding:'5px 8px',fontSize:10,fontWeight:600,color:'#1F3864'}}>
                  <div>{m.new_mould?.split(' - ')[0]}</div>
                  <div style={{fontSize:9,color:'#2E75B6'}}>{m.new_mould?.split(' - ')[1]||''}</div>
                </td>
                <td style={{padding:'5px 8px',fontSize:10}}>{m.start_time?new Date(m.start_time).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}):'-'}</td>
                <td style={{padding:'5px 8px',fontSize:10}}>{m.run_time?new Date(m.run_time).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}):'-'}</td>
                <td style={{padding:'5px 8px',fontWeight:700,color:m.total_minutes>0?(onTime?'#276221':'#C00000'):'#666'}}>{m.total_minutes>0?m.total_minutes+'m':'--'}</td>
                <td style={{padding:'5px 8px',color:'#854F0B'}}>{m.estimated_min>0?m.estimated_min+'m':'--'}</td>
                <td style={{padding:'5px 8px'}}>
                  <span style={{background:m.status==='complete'?(onTime?'#E8F5E9':'#FFEBEE'):'#FFF3E0',color:m.status==='complete'?(onTime?'#276221':'#C00000'):'#E65100',padding:'2px 8px',borderRadius:999,fontSize:9,fontWeight:600}}>
                    {m.status==='complete'
                    ? (m.estimated_min>0
                        ? (onTime?'✅ On Time':'⚠️ Delayed')
                        : '✅ Done')
                    : '⏳ In Progress'}
                  </span>
                </td>
              </tr>
            })}</tbody>
          </table>
        </div>}
      </div>

      {/* Mould PM */}
      {data.pm.length>0&&<div style={S.card}>
        <div style={{fontWeight:700,color:'#5B2C8D',marginBottom:8,fontSize:12}}>⚙️ Mould PM Done</div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
            <thead><tr>
              {['Mould','Done By','Result','Shots'].map(h=><th key={h} style={{background:'#5B2C8D',color:'#fff',padding:'5px 8px',textAlign:'left'}}>{h}</th>)}
            </tr></thead>
            <tbody>{data.pm.map((p:any,i:number)=><tr key={i} style={{background:i%2===0?'#F3E5F5':'#fff'}}>
              <td style={{padding:'5px 8px',fontWeight:600}}>{p.mould_code||p.mould}</td>
              <td style={{padding:'5px 8px',fontSize:10}}>{p.done_by}</td>
              <td style={{padding:'5px 8px'}}><span style={{background:p.overall_result==='OK'?'#E8F5E9':'#FFEBEE',color:p.overall_result==='OK'?'#276221':'#C00000',padding:'2px 8px',borderRadius:999,fontSize:9,fontWeight:600}}>{p.overall_result}</span></td>
              <td style={{padding:'5px 8px',fontSize:10,color:'#5B2C8D'}}>{p.current_shots?.toLocaleString()}</td>
            </tr>)}</tbody>
          </table>
        </div>
      </div>}

      {/* Spares */}
      {(sparesIn.length>0||sparesOut.length>0)&&<div style={S.card}>
        <div style={{fontWeight:700,color:'#1F3864',marginBottom:8,fontSize:12}}>🔩 Spares Activity</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          {sparesIn.length>0&&<div>
            <div style={{fontWeight:600,color:'#276221',marginBottom:6,fontSize:11}}>📦 Stock In ({sparesIn.length})</div>
            {sparesIn.slice(0,5).map((s:any,i:number)=><div key={i} style={{background:'#E8F5E9',borderRadius:6,padding:'5px 8px',marginBottom:4,fontSize:11}}>
              <div style={{fontWeight:600}}>{s.part_name||s.item_name}</div>
              <div style={{color:'#666',fontSize:10}}>Qty: {s.quantity||s.qty} | {s.vendor_name||s.vendor}</div>
            </div>)}
          </div>}
          {sparesOut.length>0&&<div>
            <div style={{fontWeight:600,color:'#C00000',marginBottom:6,fontSize:11}}>🔧 Used ({sparesOut.length})</div>
            {sparesOut.slice(0,5).map((s:any,i:number)=><div key={i} style={{background:'#FFEBEE',borderRadius:6,padding:'5px 8px',marginBottom:4,fontSize:11}}>
              <div style={{fontWeight:600}}>{s.part_name||s.item_name}</div>
              <div style={{color:'#666',fontSize:10}}>Qty: {s.quantity||s.qty} | {s.machine}</div>
            </div>)}
          </div>}
        </div>
      </div>}

      {/* Day Summary */}
      <div style={{background:'linear-gradient(135deg,#1F3864,#2E75B6)',borderRadius:10,padding:'14px',color:'#fff',marginBottom:8}}>
        <div style={{fontWeight:700,fontSize:13,marginBottom:10}}>📋 Day Summary — {date}</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,fontSize:11}}>
          <div>✅ Production: {data.prod.length} entries</div>
          <div>{eff>=90?'🟢 ':eff>=75?'🟠 ':'🔴 '}Efficiency: {eff}%</div>
          <div>{data.bd.length>0?`🔴 Breakdowns: ${data.bd.length}`:'✅ No Breakdowns'}</div>
          <div>{mcDone.length>0?`🔄 Mould Changes: ${mcDone.length}`:'—'}</div>
          <div>{data.pm.length>0?`⚙️ PM Done: ${data.pm.length}`:'—'}</div>
          <div>{sparesIn.length>0?`📦 Spares In: ${sparesIn.length}`:'—'}</div>
          <div style={{color:'#FF5252'}}>❌ Total Rejection: {totalRej.toLocaleString()}</div>
          <div style={{color:'#FF9800'}}>⏱️ Total Downtime: {totalDown}m</div>
        </div>
      </div>
    </div>}
  </div>
}

// ─── Mould History Tab ────────────────────────────────────────
function MouldHistoryTab() {
  const [search,setSearch]=useState('')
  const [selected,setSelected]=useState(null)
  const [loading,setLoading]=useState(false)
  const [history,setHistory]=useState([])
  const [activeTab,setActiveTab]=useState('all')
  const [stats,setStats]=useState(null)
  const [pmDetail,setPmDetail]=useState<any>(null)

  const filteredMoulds = !search ? [] : MOULDS.filter(
    m=>m.name.toLowerCase().includes(search.toLowerCase())||m.code.includes(search)
  )

  const loadHistory=async(mould)=>{
    setSelected(mould)
    setLoading(true)
    setHistory([])
    setStats(null)
    setActiveTab('all')
    setSearch('')
    try {
      const [histRes,pmRes] = await Promise.all([
        fetch('/api/mouldhistory?job_no='+mould.code).then(r=>r.json()).catch(()=>[]),
        fetch('/api/mouldpm?logs_mould='+encodeURIComponent(mould.name)).then(r=>r.json()).catch(()=>({logs:[]}))
      ])
      const logbookRows = Array.isArray(histRes) ? histRes : []
      // Convert pm_logs (app-entered PMs with checklist) into timeline rows
      const pmLogRows = (pmRes.logs||[]).map((p:any)=>({
        record_type:'PM',
        record_date:p.date,
        machine_no:p.plant||'',
        issue:'',
        work_done:p.correction||(p.overall_result==='OK'?'PM completed — all OK':'PM done'),
        parts_changed:'',
        result:p.overall_result||'OK',
        _pmLog:p  // full pm_log with checks, for detail modal
      }))
      const allRows = [...logbookRows,...pmLogRows].sort((a,b)=>new Date(a.record_date||'1900').getTime()-new Date(b.record_date||'1900').getTime())
      const pmRows=allRows.filter(r=>r.record_type==='PM')
      const bdRows=allRows.filter(r=>r.record_type==='BD')
      const rmRows=allRows.filter(r=>r.record_type==='RM')
      const mcRows=allRows.filter(r=>r.record_type==='MC')
      setStats({total:allRows.length,pmCount:pmRows.length,bdCount:bdRows.length,rmCount:rmRows.length,mcCount:mcRows.length,lastPM:pmRows[pmRows.length-1]||null,lastBD:bdRows[bdRows.length-1]||null,firstDate:allRows[0]?.record_date||'--',lastDate:allRows[allRows.length-1]?.record_date||'--'})
      setHistory(allRows)
    } catch(e) { console.error(e) }
    setLoading(false)
  }

  const shown = activeTab==='all' ? history : history.filter(r=>r.record_type===activeTab)
  const cfg = {PM:{color:'#276221',bg:'#E8F5E9',border:'#276221',icon:'🟢'},BD:{color:'#C00000',bg:'#FFEBEE',border:'#C00000',icon:'🔴'},RM:{color:'#555',bg:'#F5F5F5',border:'#aaa',icon:'⚪'},MC:{color:'#854F0B',bg:'#FFF9E6',border:'#854F0B',icon:'🟡'}}

  return (
    <div>
      <div style={S.card}>
        <div style={{fontWeight:700,color:'#1F3864',fontSize:14,marginBottom:8}}>🔍 Mould History</div>
        <input style={{...S.fi,marginBottom:4}} value={search} onChange={e=>setSearch(e.target.value)} placeholder="Job No ya naam type karo — e.g. 6374"/>
        {search.length>0&&<div style={{border:'1px solid #ddd',borderRadius:8,background:'#fff',maxHeight:200,overflowY:'auto',marginTop:2}}>
          {filteredMoulds.length===0
            ?<div style={{padding:'10px 14px',color:'#888',fontSize:12}}>Koi mould nahi mila</div>
            :filteredMoulds.map(m=><div key={m.code} onClick={()=>loadHistory(m)}
                style={{padding:'9px 14px',cursor:'pointer',borderBottom:'1px solid #F5F5F5',fontSize:12,display:'flex',justifyContent:'space-between'}}>
                <span style={{fontWeight:600,color:'#1F3864'}}>{m.name}</span>
                <span style={{color:'#888',fontSize:11,background:'#F0F0F0',padding:'2px 8px',borderRadius:4}}>#{m.code}</span>
              </div>)
          }
        </div>}
        {selected&&!search&&<div style={{display:'flex',alignItems:'center',gap:8,marginTop:6}}>
          <div style={{background:'#1F3864',color:'#fff',borderRadius:999,padding:'5px 16px',fontSize:12,fontWeight:600}}>⚙️ {selected.name} — #{selected.code}</div>
          <button onClick={()=>{setSelected(null);setHistory([]);setStats(null)}} style={{background:'#f0f0f0',border:'none',borderRadius:999,width:26,height:26,cursor:'pointer',color:'#666'}}>✕</button>
        </div>}
      </div>

      {loading&&<div style={{textAlign:'center',padding:40,color:'#666'}}>⏳ Loading...</div>}

      {stats&&!loading&&<div>
        <div style={{background:'linear-gradient(135deg,#1F3864,#2E75B6)',borderRadius:12,padding:16,marginBottom:8,color:'#fff'}}>
          <div style={{fontSize:17,fontWeight:700,marginBottom:2}}>⚙️ {selected.name}</div>
          <div style={{fontSize:11,opacity:0.75,marginBottom:12}}>#{selected.code} | {stats.firstDate} → {stats.lastDate}</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:6}}>
            {[{icon:'📋',label:'Total',val:stats.total},{icon:'🟢',label:'PM',val:stats.pmCount},{icon:'🔴',label:'BD',val:stats.bdCount},{icon:'⚪',label:'RM',val:stats.rmCount},{icon:'🟡',label:'MC',val:stats.mcCount}].map((k,i)=>(
              <div key={i} style={{background:'rgba(255,255,255,0.15)',borderRadius:8,padding:'8px 4px',textAlign:'center'}}>
                <div style={{fontSize:13}}>{k.icon}</div>
                <div style={{fontSize:20,fontWeight:700}}>{k.val}</div>
                <div style={{fontSize:9,opacity:0.8}}>{k.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
          <div style={{background:'#E8F5E9',border:'2px solid #276221',borderRadius:10,padding:12}}>
            <div style={{fontWeight:700,color:'#276221',fontSize:11,marginBottom:4}}>🟢 Last PM</div>
            {stats.lastPM?<div><div style={{fontWeight:700,fontSize:13}}>{stats.lastPM.record_date}</div><div style={{fontSize:11,color:'#444',marginTop:2}}>{(stats.lastPM.work_done||'').slice(0,70)}</div></div>:<div style={{fontSize:11,color:'#888'}}>Koi PM nahi</div>}
          </div>
          <div style={{background:'#FFEBEE',border:'2px solid #C00000',borderRadius:10,padding:12}}>
            <div style={{fontWeight:700,color:'#C00000',fontSize:11,marginBottom:4}}>🔴 Last Breakdown</div>
            {stats.lastBD?<div><div style={{fontWeight:700,fontSize:13}}>{stats.lastBD.record_date}</div><div style={{fontSize:11,color:'#444',marginTop:2}}>{(stats.lastBD.issue||'').slice(0,70)}</div></div>:<div style={{fontSize:11,color:'#888'}}>Koi breakdown nahi</div>}
          </div>
        </div>

        <div style={{display:'flex',gap:6,marginBottom:8,flexWrap:'wrap'}}>
          {[{k:'all',l:'All ('+stats.total+')',c:'#1F3864'},{k:'PM',l:'🟢 PM ('+stats.pmCount+')',c:'#276221'},{k:'BD',l:'🔴 BD ('+stats.bdCount+')',c:'#C00000'},{k:'RM',l:'⚪ RM ('+stats.rmCount+')',c:'#555'},{k:'MC',l:'🟡 MC ('+stats.mcCount+')',c:'#854F0B'}].map(t=>(
            <button key={t.k} onClick={()=>setActiveTab(t.k)} style={{padding:'6px 14px',borderRadius:999,border:'none',cursor:'pointer',fontSize:11,fontWeight:600,background:activeTab===t.k?t.c:'#F0F0F0',color:activeTab===t.k?'#fff':t.c}}>{t.l}</button>
          ))}
        </div>

        <div style={S.card}>
          <div style={{fontWeight:700,color:'#1F3864',fontSize:13,marginBottom:12}}>📅 Timeline — {shown.length} records</div>
          {shown.length===0
            ?<div style={{textAlign:'center',color:'#888',padding:24}}>Koi record nahi!</div>
            :<div>
              {shown.map((rec,i)=>{
                const c=cfg[rec.record_type]||{color:'#666',bg:'#F5F5F5',border:'#ccc',icon:'📌'}
                return (
                  <div key={i} style={{display:'flex',gap:10,marginBottom:10}}>
                    <div style={{width:38,height:38,borderRadius:'50%',flexShrink:0,background:c.bg,border:'2px solid '+c.border,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13}}>{c.icon}</div>
                    <div onClick={()=>rec._pmLog&&setPmDetail(rec._pmLog)} style={{flex:1,background:c.bg,border:'1px solid '+c.border+'44',borderRadius:8,padding:'8px 12px',cursor:rec._pmLog?'pointer':'default'}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                        <span style={{fontWeight:700,fontSize:12,color:c.color}}>{rec.record_type==='PM'?'Preventive Maintenance':rec.record_type==='BD'?'Breakdown':rec.record_type==='RM'?'Routine Maintenance':'Mould Change'}{rec.machine_no&&rec.machine_no!=='--'?' | '+rec.machine_no:''}{rec._live?' 🔴 LIVE':''}</span>
                        <span style={{fontSize:10,color:'#666',fontWeight:600}}>{rec.record_date}</span>
                      </div>
                      {rec.issue&&rec.issue!=='--'&&<div style={{fontSize:11,color:'#333',marginBottom:2}}><b>Issue: </b>{rec.issue}</div>}
                      {rec.work_done&&rec.work_done!=='--'&&<div style={{fontSize:11,color:'#444',marginBottom:2}}><b>Work: </b>{rec.work_done}</div>}
                      {rec.parts_changed&&rec.parts_changed!=='--'&&rec.parts_changed!==''&&<div style={{fontSize:11,color:'#5B2C8D',marginBottom:2}}><b>Parts: </b>{rec.parts_changed}</div>}
                      {rec.result&&rec.result!=='--'&&<span style={{background:['Fixed','Done','Running','OK','Ready'].includes(rec.result)?'#276221':'#854F0B',color:'#fff',fontSize:9,padding:'2px 8px',borderRadius:999,fontWeight:600}}>{rec.result}</span>}
                      {rec._pmLog&&<div style={{fontSize:10,color:'#1F3864',marginTop:4,fontWeight:700}}>👆 Checklist detail dekhne ke liye click karo {rec._pmLog.ng_count>0?`(${rec._pmLog.ng_count} NG)`:''}</div>}
                    </div>
                  </div>
                )
              })}
            </div>
          }
        </div>
      </div>}

      {!selected&&!loading&&<div style={{...S.card,textAlign:'center',color:'#888',padding:40}}>
        <div style={{fontSize:32,marginBottom:8}}>🔍</div>
        <div style={{fontSize:13,fontWeight:600,color:'#444',marginBottom:4}}>Koi bhi mould search karo</div>
        <div style={{fontSize:11}}>530+ records | Jun 2022 – May 2026</div>
      </div>}
      {pmDetail&&<PMDetailModal log={pmDetail} onClose={()=>setPmDetail(null)}/>}
    </div>
  )
}


function UploadOldRecords() {
  const [uploading,setUploading]=useState(false)
  const [extracting,setExtracting]=useState(false)
  const [preview,setPreview]=useState<string|null>(null)
  const [extracted,setExtracted]=useState<any[]>([])
  const [saving,setSaving]=useState(false)
  const [toast,setToast]=useState<{msg:string,ok:boolean}|null>(null)
  const [imageData,setImageData]=useState<string|null>(null)

  const handleFile=async(e:React.ChangeEvent<HTMLInputElement>)=>{
    const file=e.target.files?.[0]
    if(!file) return

    setUploading(true)
    setExtracted([])
    setPreview(null)

    // Convert to base64
    const reader=new FileReader()
    reader.onload=async(ev)=>{
      const base64=ev.target?.result as string
      setPreview(base64)
      setImageData(base64)
      setUploading(false)
    }
    reader.readAsDataURL(file)
  }

  const extractData=async()=>{
    if(!imageData) return
    setExtracting(true)

    try {
      // Send to Claude API to extract data
      const base64Data=imageData.split(',')[1]
      const mimeType=imageData.split(';')[0].split(':')[1]

      const response=await fetch('https://api.anthropic.com/v1/messages',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          model:'claude-sonnet-4-20250514',
          max_tokens:4000,
          messages:[{
            role:'user',
            content:[
              {
                type:'image',
                source:{type:'base64',media_type:mimeType,data:base64Data}
              },
              {
                type:'text',
                text:`This is a mould maintenance record from a plastic injection moulding factory. 
Extract ALL entries and return ONLY a JSON array (no markdown, no explanation) with this format:
[
  {
    "date": "YYYY-MM-DD",
    "mould_name": "e.g. Common Lid 2nd or 500ml Tub",
    "machine": "e.g. M/C No-1 or M1",
    "type": "PM" or "Breakdown" or "Loading",
    "problem": "what problem was found (empty if PM/loading)",
    "work_done": "detailed description of what was done",
    "result": "OK or NG",
    "parts_used": "any parts or spares used (empty if none)"
  }
]
Dates are in DD-MM-YY or DD/MM/YY format - convert to YYYY-MM-DD.
Extract every single entry you can see. Return ONLY the JSON array.`
              }
            ]
          }]
        })
      })

      const data=await response.json()
      const text=data.content?.[0]?.text||'[]'
      
      // Clean and parse JSON
      const clean=text.replace(/```json|```/g,'').trim()
      const entries=JSON.parse(clean)
      setExtracted(entries)
    } catch(err) {
      setToast({msg:'Error reading image — try again!',ok:false})
    }
    setExtracting(false)
  }

  const saveAll=async()=>{
    setSaving(true)
    let saved=0

    for(const entry of extracted){
      if(!entry.date||!entry.mould_name) continue

      // Find mould code
      const mouldMatch=MOULDS.find(m=>
        entry.mould_name.toLowerCase().includes(m.name.toLowerCase().slice(0,8))||
        entry.mould_name.toLowerCase().includes(m.code)
      )
      const mouldCode=mouldMatch?.code||''

      if(entry.type==='Breakdown'||entry.type==='breakdown'){
        await fetch('/api/breakdown',{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({
            type:'report',
            date:entry.date,
            plant:'Plant 477',
            machine:entry.machine||'Unknown',
            problem:entry.problem||entry.work_done,
            category:'Mould',
            operator:'Historical',
            reportedTime:new Date(entry.date).toISOString(),
            enteredBy:'Historical Upload'
          })
        }).then(r=>r.json()).then(async(res)=>{
          if(res.success){
            // Auto resolve it
            await fetch('/api/breakdown',{
              method:'POST',
              headers:{'Content-Type':'application/json'},
              body:JSON.stringify({
                type:'resolve',
                id:res.id,
                solution:entry.work_done,
                analysis:entry.problem,
                sparesUsed:entry.parts_used||'',
                resolvedTime:new Date(entry.date).toISOString(),
                enteredBy:'Historical Upload'
              })
            })
          }
        })
      } else {
        // PM or Loading
        await fetch('/api/mouldpm',{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({
            date:entry.date,
            mouldCode,
            mould:entry.mould_name,
            currentShots:0,
            doneBy:'Historical Upload',
            overallResult:entry.result||'OK',
            remarks:entry.work_done,
            checklistItems:[]
          })
        })
      }
      saved++
    }

    setSaving(false)
    setToast({msg:`✅ ${saved} entries saved!`,ok:true})
    setExtracted([])
    setPreview(null)
    setImageData(null)
  }

  return <div>
    {/* Upload Area */}
    {!preview&&<label style={{display:'block',border:'2px dashed #1F3864',borderRadius:10,padding:'20px',textAlign:'center',cursor:'pointer',background:'#F8F9FF'}}>
      <input type="file" accept="image/*,.pdf" onChange={handleFile} style={{display:'none'}}/>
      <div style={{fontSize:32,marginBottom:8}}>📷</div>
      <div style={{fontWeight:600,color:'#1F3864',marginBottom:4}}>Photo ya PDF upload karo</div>
      <div style={{fontSize:11,color:'#666'}}>Mould PM ya Breakdown ki photo khicho aur yahan upload karo</div>
    </label>}

    {uploading&&<div style={{textAlign:'center',padding:16,color:'#666'}}>⏳ Loading...</div>}

    {/* Preview */}
    {preview&&!uploading&&<div>
      <div style={{marginBottom:8,borderRadius:8,overflow:'hidden',maxHeight:300,position:'relative' as const}}>
        <img src={preview} style={{width:'100%',objectFit:'cover' as const}}/>
      </div>
      <div style={{display:'flex',gap:8,marginBottom:8}}>
        <button onClick={extractData} disabled={extracting} style={{flex:2,background:'#1F3864',color:'#fff',border:'none',borderRadius:8,padding:'10px',fontSize:12,fontWeight:700,cursor:'pointer'}}>
          {extracting?'🤖 AI Read kar raha hai...':'🤖 AI se Data Extract Karo'}
        </button>
        <button onClick={()=>{setPreview(null);setExtracted([]);setImageData(null)}} style={{flex:1,background:'#666',color:'#fff',border:'none',borderRadius:8,padding:'10px',fontSize:12,cursor:'pointer'}}>
          ✕ Cancel
        </button>
      </div>
    </div>}

    {/* Extracted Data Preview */}
    {extracted.length>0&&<div>
      <div style={{fontWeight:700,color:'#276221',marginBottom:8,fontSize:13}}>✅ {extracted.length} entries mili! Review karo:</div>
      <div style={{maxHeight:300,overflowY:'auto',marginBottom:8}}>
        {extracted.map((e:any,i:number)=><div key={i} style={{background:e.type==='Breakdown'?'#FFEBEE':'#E8F5E9',border:`1px solid ${e.type==='Breakdown'?'#C00000':'#276221'}`,borderRadius:8,padding:'8px 12px',marginBottom:6}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
            <span style={{fontWeight:700,fontSize:12}}>{e.type==='Breakdown'?'🔴':'⚙️'} {e.date} — {e.mould_name}</span>
            <span style={{fontSize:10,color:'#666'}}>{e.machine}</span>
          </div>
          {e.problem&&<div style={{fontSize:11,color:'#C00000',marginBottom:2}}>Problem: {e.problem}</div>}
          <div style={{fontSize:11,color:'#444'}}>{e.work_done}</div>
          {e.parts_used&&<div style={{fontSize:10,color:'#5B2C8D',marginTop:2}}>Parts: {e.parts_used}</div>}
        </div>)}
      </div>
      <button onClick={saveAll} disabled={saving} style={{width:'100%',background:'#276221',color:'#fff',border:'none',borderRadius:8,padding:'12px',fontSize:13,fontWeight:700,cursor:'pointer'}}>
        {saving?'Saving...':'💾 Save All Entries to System'}
      </button>
    </div>}

    {toast&&<Toast {...toast}/>}
  </div>
}

// ─── QC Alerts Tab ────────────────────────────────────────────
function QCAlertsTab({user}:{user:User}) {
  const [alerts,setAlerts]=useState<any[]>([])
  const [loading,setLoading]=useState(true)
  const [filter,setFilter]=useState('all') // all | Pending | Resolved
  const [selected,setSelected]=useState<any>(null)
  const [resolvedBy,setResolvedBy]=useState(user.name)
  const [resolution,setResolution]=useState('')
  const [saving,setSaving]=useState(false)
  const [toast,setToast]=useState<{msg:string,ok:boolean}|null>(null)

  const load=async()=>{
    setLoading(true)
    const statusQ=filter!=='all'?`?status=${filter}`:''
    const res=await fetch(`/api/qcalerts${statusQ}`).then(r=>r.json()).catch(()=>({data:[]}))
    setAlerts(res.data||[])
    setLoading(false)
  }

  useEffect(()=>{load()},[filter])

  const openDetail=(a:any)=>{
    setSelected(a)
    setResolvedBy(a.resolved_by||user.name)
    setResolution(a.resolution||'')
  }

  const handleResolve=async()=>{
    if(!resolution.trim()){setToast({msg:'Action / resolution likho!',ok:false});return}
    setSaving(true)
    const res=await fetch('/api/qcalerts',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({type:'resolve',id:selected.id,resolvedBy,resolution})
    }).then(r=>r.json())
    setSaving(false)
    setToast({msg:res.msg,ok:res.success})
    if(res.success){setSelected(null);load()}
  }

  const handleReopen=async()=>{
    setSaving(true)
    const res=await fetch('/api/qcalerts',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({type:'reopen',id:selected.id})
    }).then(r=>r.json())
    setSaving(false)
    setToast({msg:res.msg,ok:res.success})
    if(res.success){setSelected(null);load()}
  }

  const fmt=(ts:string|null)=>ts?new Date(ts).toLocaleString('en-IN',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}):'--'

  const pendingCount=alerts.filter(a=>a.status==='Pending').length
  const resolvedCount=alerts.filter(a=>a.status==='Resolved').length

  return <div>
    {/* Summary */}
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
      <div style={{...S.met,background:pendingCount>0?'#FFEBEE':'#fff',border:pendingCount>0?'2px solid #C00000':'1px solid #E0E0E0'}}>
        <div style={{fontSize:10,color:'#C00000',fontWeight:600}}>🔴 Action Pending</div>
        <div style={{fontSize:24,fontWeight:700,color:'#C00000'}}>{pendingCount}</div>
      </div>
      <div style={S.met}>
        <div style={{fontSize:10,color:'#276221',fontWeight:600}}>✅ Resolved</div>
        <div style={{fontSize:24,fontWeight:700,color:'#276221'}}>{resolvedCount}</div>
      </div>
    </div>

    {/* Filter tabs */}
    <div style={{display:'flex',gap:6,marginBottom:8}}>
      {[{k:'all',l:'All'},{k:'Pending',l:'🔴 Pending'},{k:'Resolved',l:'✅ Resolved'}].map(f=>(
        <button key={f.k} onClick={()=>setFilter(f.k)} style={{
          flex:1,padding:'8px',border:'none',borderRadius:8,cursor:'pointer',fontWeight:700,fontSize:12,
          background:filter===f.k?'#1F3864':'#F0F0F0',color:filter===f.k?'#fff':'#444'
        }}>{f.l}</button>
      ))}
      <button onClick={load} style={{padding:'8px 12px',border:'1px solid #1F3864',borderRadius:8,background:'#fff',color:'#1F3864',cursor:'pointer',fontSize:12}}>↻</button>
    </div>

    {/* List */}
    {loading?<div style={{textAlign:'center',padding:32,color:'#666'}}>Loading...</div>
      :alerts.length===0?<div style={{...S.card,textAlign:'center',color:'#888',padding:32}}>Koi alert nahi.</div>
      :alerts.map((a:any)=>(
        <div key={a.id} onClick={()=>openDetail(a)} style={{...S.card,marginBottom:8,cursor:'pointer',
          borderLeft:`4px solid ${a.status==='Resolved'?'#276221':'#C00000'}`}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8}}>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:13,color:'#1F3864'}}>{a.machine} · {a.product||a.mould_name}</div>
              <div style={{fontSize:12,color:'#C00000',marginTop:3,fontWeight:500}}>{a.issues}</div>
              <div style={{fontSize:11,color:'#666',marginTop:4}}>{a.date} {a.check_time&&`· ${a.check_time}`} · {a.plant} · QC: {a.qc_person||'--'}</div>
            </div>
            <span style={{fontSize:10,fontWeight:700,padding:'3px 10px',borderRadius:999,whiteSpace:'nowrap' as const,
              background:a.status==='Resolved'?'#E8F5E9':'#FFEBEE',color:a.status==='Resolved'?'#276221':'#C00000'}}>
              {a.status==='Resolved'?'✅ Resolved':'🔴 Pending'}
            </span>
          </div>
          <div style={{fontSize:10,color:'#1F3864',marginTop:6,fontWeight:600}}>👆 Detail dekhne ke liye click karo</div>
        </div>
      ))
    }

    {/* Detail Modal */}
    {selected&&<div onClick={()=>setSelected(null)} style={{position:'fixed' as const,inset:0,background:'rgba(0,0,0,0.6)',zIndex:1000,display:'flex',alignItems:'flex-start',justifyContent:'center',padding:16,overflowY:'auto' as const}}>
      <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:12,padding:18,width:'100%',maxWidth:480,marginTop:30}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <div style={{fontWeight:700,color:'#1F3864',fontSize:15}}>Alert Detail</div>
          <button onClick={()=>setSelected(null)} style={{background:'#f0f0f0',border:'none',borderRadius:999,width:28,height:28,cursor:'pointer',fontSize:14}}>✕</button>
        </div>

        {/* QC ne kya report kiya */}
        <div style={{background:'#FFEBEE',borderRadius:8,padding:12,marginBottom:10}}>
          <div style={{fontSize:11,fontWeight:700,color:'#C00000',marginBottom:8,textTransform:'uppercase' as const}}>QC ne kya report kiya</div>
          {[
            {l:'Issue',v:selected.issues,bold:true},
            {l:'Machine',v:selected.machine},
            {l:'Plant',v:selected.plant},
            {l:'Product',v:selected.product},
            {l:'Mould',v:[selected.mould_name,selected.mould_code].filter(Boolean).join(' · ')},
            {l:'Date / Slot',v:`${selected.date} ${selected.check_time||''}`},
            {l:'Weight (act/std)',v:(selected.weight_actual!=null||selected.weight_standard!=null)?`${selected.weight_actual??'--'}g / ${selected.weight_standard??'--'}g`:''},
            {l:'QC Remarks',v:selected.remarks},
            {l:'Reported by',v:selected.qc_person},
          ].filter(f=>f.v).map((f,i)=>(
            <div key={i} style={{display:'flex',gap:8,marginTop:5,fontSize:12}}>
              <span style={{color:'#666',minWidth:110}}>{f.l}</span>
              <span style={{fontWeight:f.bold?700:400,color:'#1a1a1a'}}>{f.v}</span>
            </div>
          ))}
        </div>

        {/* Operator action */}
        <div style={{background:selected.status==='Resolved'?'#E8F5E9':'#F9F9F9',borderRadius:8,padding:12}}>
          <div style={{fontSize:11,fontWeight:700,color:selected.status==='Resolved'?'#276221':'#666',marginBottom:8,textTransform:'uppercase' as const}}>Operator Action</div>

          {selected.status==='Resolved'?<>
            {[
              {l:'Status',v:'✅ Resolved',bold:true},
              {l:'Resolved by',v:selected.resolved_by},
              {l:'Resolved at',v:fmt(selected.resolved_at)},
              {l:'Action taken',v:selected.resolution},
            ].filter(f=>f.v).map((f,i)=>(
              <div key={i} style={{display:'flex',gap:8,marginTop:5,fontSize:12}}>
                <span style={{color:'#666',minWidth:110}}>{f.l}</span>
                <span style={{fontWeight:f.bold?700:400,color:'#1a1a1a'}}>{f.v}</span>
              </div>
            ))}
            <button onClick={handleReopen} disabled={saving} style={{marginTop:10,padding:'8px 14px',borderRadius:8,border:'1px solid #ccc',background:'#fff',cursor:'pointer',fontSize:12}}>Re-open</button>
          </>:<>
            <div style={{fontSize:12,color:'#C00000',marginBottom:10,fontWeight:600}}>⚠️ Operator ne abhi tak action nahi liya!</div>
            <input value={resolvedBy} onChange={e=>setResolvedBy(e.target.value)} placeholder="Operator ka naam" style={{...S.fi,marginBottom:8}}/>
            <textarea value={resolution} onChange={e=>setResolution(e.target.value)} rows={3} placeholder="Kya action liya? (e.g. cavity 13,16 saaf ki, dhaga hata diya)" style={{...S.fi,resize:'vertical' as const,marginBottom:8}}/>
            <button onClick={handleResolve} disabled={saving} style={{...S.sb,background:'#276221',marginTop:0}}>{saving?'Saving...':'✅ Mark Resolved'}</button>
          </>}
        </div>
        {toast&&<Toast {...toast}/>}
      </div>
    </div>}
    {toast&&!selected&&<Toast {...toast}/>}
  </div>
}

// ─── PM Checklist Detail Helper ───────────────────────────────
// checks object keys = sequential index of non-header PM_CHECKLIST items
function pmChecklistDetail(checks:Record<string,string>){
  const items:{section:string,point:string,method:string,result:string}[]=[]
  let section=''
  let idx=0
  PM_CHECKLIST.forEach((item:any)=>{
    if(item.h){ section=item.s; return }
    const result=(checks&&checks[idx]!==undefined)?checks[idx]:(checks&&checks[String(idx)]!==undefined?checks[String(idx)]:'')
    items.push({section,point:item.s,method:item.m||'',result:result||'--'})
    idx++
  })
  return items
}

// ─── PM Detail Modal (shared by Reports + Mould History) ──────
function PMDetailModal({log,onClose}:{log:any,onClose:()=>void}){
  const checks=log.checks||{}
  const detail=pmChecklistDetail(checks)
  const okCount=detail.filter(d=>d.result==='OK').length
  const ngCount=detail.filter(d=>d.result==='NG').length
  const naCount=detail.filter(d=>d.result==='N/A').length
  const pending=detail.filter(d=>d.result==='--').length

  // group by section
  const sections:Record<string,typeof detail>={}
  detail.forEach(d=>{ if(!sections[d.section]) sections[d.section]=[]; sections[d.section].push(d) })

  return <div onClick={onClose} style={{position:'fixed' as const,inset:0,background:'rgba(0,0,0,0.6)',zIndex:1000,display:'flex',alignItems:'flex-start',justifyContent:'center',padding:16,overflowY:'auto' as const}}>
    <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:12,padding:18,width:'100%',maxWidth:520,marginTop:24,marginBottom:24}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <div style={{fontWeight:700,color:'#1F3864',fontSize:15}}>PM Detail — {log.mould_name||log.mould||'--'}</div>
        <button onClick={onClose} style={{background:'#f0f0f0',border:'none',borderRadius:999,width:28,height:28,cursor:'pointer',fontSize:14}}>✕</button>
      </div>

      {/* Summary */}
      <div style={{background:'#E8EDF5',borderRadius:8,padding:12,marginBottom:10,fontSize:12}}>
        {[
          {l:'Date',v:log.date},
          {l:'Done By',v:log.done_by},
          {l:'Current Shots',v:(log.current_shots||0).toLocaleString()},
          {l:'Next PM At',v:(log.next_pm_shots||0).toLocaleString()},
          {l:'Overall Result',v:log.overall_result},
          {l:'Correction',v:log.correction},
        ].filter(f=>f.v).map((f,i)=>(
          <div key={i} style={{display:'flex',gap:8,marginBottom:4}}>
            <span style={{color:'#666',minWidth:110}}>{f.l}</span>
            <span style={{fontWeight:600,color:'#1a1a1a'}}>{f.v}</span>
          </div>
        ))}
      </div>

      {/* Count chips */}
      <div style={{display:'flex',gap:6,marginBottom:12,flexWrap:'wrap' as const}}>
        <span style={{background:'#E8F5E9',color:'#276221',padding:'4px 10px',borderRadius:999,fontSize:11,fontWeight:700}}>✅ OK: {okCount}</span>
        <span style={{background:'#FFEBEE',color:'#C00000',padding:'4px 10px',borderRadius:999,fontSize:11,fontWeight:700}}>❌ NG: {ngCount}</span>
        <span style={{background:'#F0F0F0',color:'#666',padding:'4px 10px',borderRadius:999,fontSize:11,fontWeight:700}}>N/A: {naCount}</span>
        {pending>0&&<span style={{background:'#FFF3E0',color:'#854F0B',padding:'4px 10px',borderRadius:999,fontSize:11,fontWeight:700}}>Not checked: {pending}</span>}
      </div>

      {/* Checklist by section */}
      {detail.length===0
        ? <div style={{textAlign:'center',color:'#888',padding:20,fontSize:12}}>Is PM ka checklist detail save nahi hua tha.</div>
        : Object.entries(sections).map(([sec,pts],si)=>(
          <div key={si} style={{marginBottom:10}}>
            <div style={{background:'#1F3864',color:'#FFD966',padding:'4px 10px',fontSize:11,fontWeight:700,borderRadius:4,marginBottom:4}}>{sec}</div>
            {pts.map((p,pi)=>{
              const col=p.result==='OK'?'#276221':p.result==='NG'?'#C00000':p.result==='N/A'?'#666':'#999'
              const bg=p.result==='OK'?'#F0FFF4':p.result==='NG'?'#FFEBEE':p.result==='N/A'?'#F5F5F5':'#FAFAFA'
              return <div key={pi} style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8,padding:'6px 8px',background:bg,borderRadius:6,marginBottom:3}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:11,fontWeight:500}}>{p.point}</div>
                  {p.method&&<div style={{fontSize:9,color:'#888'}}>[{p.method}]</div>}
                </div>
                <span style={{fontSize:11,fontWeight:700,color:col,minWidth:40,textAlign:'right' as const}}>
                  {p.result==='OK'?'✅ OK':p.result==='NG'?'❌ NG':p.result==='N/A'?'N/A':'—'}
                </span>
              </div>
            })}
          </div>
        ))
      }
    </div>
  </div>
}

// ─── PM Logs Report (Reports tab) ─────────────────────────────
function PMLogsReport({logs}:{logs:any[]}){
  const [selected,setSelected]=useState<any>(null)
  return <div style={S.card}>
    <div style={{fontWeight:700,marginBottom:8}}>Mould PM Logs ({logs.length})</div>
    <div style={{fontSize:11,color:'#1F3864',marginBottom:8,fontWeight:600}}>👆 Kisi bhi row pe click karo — pura checklist detail dikhega</div>
    <div style={{overflowX:'auto'}}>
      <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
        <thead><tr>
          {['Date','Mould','Done By','Current Shots','Next PM','NG Count','Result'].map(h=>
            <th key={h} style={{background:'#1F3864',color:'#fff',padding:'6px 8px',textAlign:'left'}}>{h}</th>)}
        </tr></thead>
        <tbody>
          {logs.map((r:any,i:number)=>(
            <tr key={i} onClick={()=>setSelected(r)} style={{background:i%2===0?'#FAFAFA':'#fff',cursor:'pointer'}}
              onMouseEnter={e=>(e.currentTarget.style.background='#E8EDF5')}
              onMouseLeave={e=>(e.currentTarget.style.background=i%2===0?'#FAFAFA':'#fff')}>
              <td style={{padding:'6px 8px'}}>{r.date}</td>
              <td style={{padding:'6px 8px',fontWeight:600,color:'#1F3864',textDecoration:'underline'}}>{r.mould_name}</td>
              <td style={{padding:'6px 8px',fontSize:10}}>{r.done_by}</td>
              <td style={{padding:'6px 8px',textAlign:'center'}}>{(r.current_shots||0).toLocaleString()}</td>
              <td style={{padding:'6px 8px',textAlign:'center'}}>{(r.next_pm_shots||0).toLocaleString()}</td>
              <td style={{padding:'6px 8px',textAlign:'center',color:r.ng_count>0?'#C00000':'#276221',fontWeight:700}}>{r.ng_count}</td>
              <td style={{padding:'6px 8px'}}><span style={{background:r.overall_result==='OK'?'#E8F5E9':'#FFEBEE',color:r.overall_result==='OK'?'#276221':'#C00000',padding:'2px 7px',borderRadius:999,fontSize:10}}>{r.overall_result}</span></td>
            </tr>
          ))}
          {logs.length===0&&<tr><td colSpan={7} style={{textAlign:'center',color:'#666',padding:16}}>Koi data nahi!</td></tr>}
        </tbody>
      </table>
    </div>
    {selected&&<PMDetailModal log={selected} onClose={()=>setSelected(null)}/>}
  </div>
}

// ─── Process Checker Tab ──────────────────────────────────────
function ProcessCheckTab({user}:{user:User}) {
  const [date,setDate]=useState(nd())
  const [data,setData]=useState<any>(null)
  const [loading,setLoading]=useState(true)
  const [showSettings,setShowSettings]=useState(false)
  const [saving,setSaving]=useState(false)
  const [toast,setToast]=useState<{msg:string,ok:boolean}|null>(null)
  const [form,setForm]=useState<any>({})
  const [showTelegram,setShowTelegram]=useState(false)
  const [tgStaff,setTgStaff]=useState<any[]>([])
  const [tgHasToken,setTgHasToken]=useState(false)
  const [tgToken,setTgToken]=useState('')
  const [tgForm,setTgForm]=useState({department:'production',staffName:'',chatId:'',plant:''})
  const [tgSending,setTgSending]=useState(false)
  const [tgToast,setTgToast]=useState<{msg:string,ok:boolean}|null>(null)

  const loadTelegram=async()=>{
    const res=await fetch('/api/telegram').then(r=>r.json()).catch(()=>({staff:[]}))
    setTgStaff(res.staff||[])
    setTgHasToken(res.hasToken||false)
  }
  useEffect(()=>{loadTelegram()},[])

  const tgAddStaff=async()=>{
    if(!tgForm.staffName||!tgForm.chatId){setTgToast({msg:'Naam aur Chat ID daalo!',ok:false});return}
    const res=await fetch('/api/telegram',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({type:'add_staff',...tgForm})}).then(r=>r.json())
    setTgToast({msg:res.msg,ok:res.success})
    if(res.success){setTgForm({department:'production',staffName:'',chatId:'',plant:''});loadTelegram()}
  }
  const tgDelStaff=async(id:string)=>{
    const res=await fetch('/api/telegram',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({type:'delete_staff',id})}).then(r=>r.json())
    if(res.success) loadTelegram()
  }
  const tgSaveToken=async()=>{
    if(!tgToken){setTgToast({msg:'Token daalo!',ok:false});return}
    const res=await fetch('/api/telegram',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({type:'save_token',token:tgToken})}).then(r=>r.json())
    setTgToast({msg:res.msg,ok:res.success})
    if(res.success){setTgToken('');loadTelegram()}
  }
  const tgSendNow=async()=>{
    setTgSending(true)
    const res=await fetch('/api/telegram',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({type:'send_reminders',date})}).then(r=>r.json())
    setTgSending(false)
    setTgToast({msg:res.msg,ok:res.success})
  }

  const load=async()=>{
    setLoading(true)
    const res=await fetch(`/api/processcheck?date=${date}`).then(r=>r.json()).catch(()=>null)
    setData(res)
    if(res?.settings) setForm(res.settings)
    setLoading(false)
  }

  useEffect(()=>{load()},[date])

  // current IST time HH:MM
  const nowHM=()=>{
    const ist=new Date(Date.now()+5.5*60*60*1000)
    return ist.toISOString().slice(11,16)
  }
  const isToday=date===nd()
  const curTime=nowHM()
  const pastDue=(due:string)=>isToday&&due&&curTime>due

  const saveSettings=async()=>{
    setSaving(true)
    const res=await fetch('/api/processcheck',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({type:'save_settings',...form,updatedBy:user.name})
    }).then(r=>r.json())
    setSaving(false)
    setToast({msg:res.msg,ok:res.success})
    if(res.success){setShowSettings(false);load()}
  }

  if(loading) return <div style={{textAlign:'center',padding:32,color:'#666'}}>Loading process status...</div>
  if(!data) return <div style={S.card}>Error loading. Refresh karo.</div>

  // status chip helper
  const Chip=({ok,warn,text}:{ok:boolean,warn?:boolean,text:string})=>(
    <span style={{fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:999,
      background:ok?'#E8F5E9':warn?'#FFF3E0':'#FFEBEE',
      color:ok?'#276221':warn?'#E65100':'#C00000'}}>{text}</span>
  )

  // Count pending items for header
  let pendingCount=0
  data.production.forEach((p:any)=>{ if(p.dayDone<p.dayTotal) pendingCount++ })
  data.quality.forEach((q:any)=>{ if(q.done<q.total) pendingCount++ })
  if(!data.ims.done) pendingCount++
  if(!data.rejection.done) pendingCount++
  if(data.breakdown.pending>0) pendingCount++
  if(data.mouldPM.overdue>0) pendingCount++

  const s=data.settings||{}

  return <div>
    {/* Header */}
    <div style={{background:'linear-gradient(135deg,#1F3864,#2E75B6)',borderRadius:12,padding:'14px 16px',marginBottom:8,color:'#fff'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
        <div>
          <div style={{fontWeight:700,fontSize:16}}>✅ Process Checker</div>
          <div style={{fontSize:11,opacity:0.8}}>Kaun si entry hui, kaun si pending — live status</div>
        </div>
        <button onClick={()=>setShowSettings(!showSettings)} style={{background:'rgba(255,255,255,0.2)',border:'none',color:'#fff',borderRadius:8,padding:'6px 12px',fontSize:11,fontWeight:600,cursor:'pointer'}}>⚙️ Time Settings</button>
        <button onClick={()=>setShowTelegram(!showTelegram)} style={{background:'rgba(255,255,255,0.2)',border:'none',color:'#fff',borderRadius:8,padding:'6px 12px',fontSize:11,fontWeight:600,cursor:'pointer',marginLeft:6}}>📱 Telegram</button>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:8}}>
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{padding:'6px 10px',borderRadius:8,border:'none',fontSize:13,fontWeight:700,color:'#1F3864'}}/>
        <button onClick={load} style={{background:'rgba(255,255,255,0.2)',border:'none',color:'#fff',borderRadius:8,padding:'6px 12px',fontSize:11,cursor:'pointer'}}>↻ Refresh</button>
        {isToday&&<span style={{fontSize:11,marginLeft:'auto',opacity:0.9}}>🕐 Abhi {curTime} IST</span>}
      </div>
      {pendingCount>0
        ? <div style={{marginTop:8,background:'rgba(255,82,82,0.25)',borderRadius:8,padding:'6px 12px',fontSize:12,fontWeight:600}}>⚠️ {pendingCount} cheezein pending — follow-up karo!</div>
        : <div style={{marginTop:8,background:'rgba(76,175,80,0.3)',borderRadius:8,padding:'6px 12px',fontSize:12,fontWeight:600}}>✅ Sab kuch on track!</div>}
    </div>

    {/* Settings panel */}
    {showSettings&&<div style={{...S.card,border:'2px solid #1F3864'}}>
      <div style={{fontWeight:700,color:'#1F3864',marginBottom:10}}>⚙️ Due Time Settings (sab ko same dikhega)</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
        <div style={S.f}><label style={S.lbl}>IMS Stock — by</label><input type="time" style={S.fi} value={form.ims_due_time||''} onChange={e=>setForm((p:any)=>({...p,ims_due_time:e.target.value}))}/></div>
        <div style={S.f}><label style={S.lbl}>Quality — by</label><input type="time" style={S.fi} value={form.quality_due_time||''} onChange={e=>setForm((p:any)=>({...p,quality_due_time:e.target.value}))}/></div>
        <div style={S.f}><label style={S.lbl}>Rejection — by</label><input type="time" style={S.fi} value={form.rejection_due_time||''} onChange={e=>setForm((p:any)=>({...p,rejection_due_time:e.target.value}))}/></div>
        <div style={S.f}><label style={S.lbl}>Spares — by</label><input type="time" style={S.fi} value={form.spares_due_time||''} onChange={e=>setForm((p:any)=>({...p,spares_due_time:e.target.value}))}/></div>
        <div style={S.f}><label style={S.lbl}>Breakdown max pending (min)</label><input type="number" style={S.fi} value={form.breakdown_max_pending_min||''} onChange={e=>setForm((p:any)=>({...p,breakdown_max_pending_min:e.target.value}))}/></div>
        <div style={S.f}><label style={S.lbl}>Production slot grace (min)</label><input type="number" style={S.fi} value={form.production_slot_grace_min||''} onChange={e=>setForm((p:any)=>({...p,production_slot_grace_min:e.target.value}))}/></div>
      </div>
      <button style={{...S.sb,marginTop:8}} onClick={saveSettings} disabled={saving}>{saving?'Saving...':'💾 Save Settings'}</button>
      {toast&&<Toast {...toast}/>}
    </div>}

    {/* Telegram panel */}
    {showTelegram&&<div style={{...S.card,border:'2px solid #229ED9'}}>
      <div style={{fontWeight:700,color:'#229ED9',marginBottom:10}}>📱 Telegram Reminders</div>

      {/* Token */}
      <div style={{background:tgHasToken?'#E8F5E9':'#FFF3E0',borderRadius:8,padding:'8px 12px',marginBottom:10}}>
        <div style={{fontSize:11,fontWeight:600,color:tgHasToken?'#276221':'#E65100',marginBottom:6}}>
          {tgHasToken?'✅ Bot token set hai':'⚠️ Bot token nahi hai — pehle yeh daalo'}
        </div>
        <div style={{display:'flex',gap:6}}>
          <input value={tgToken} onChange={e=>setTgToken(e.target.value)} placeholder="@BotFather se mila token paste karo" style={{...S.fi,marginBottom:0,flex:1}}/>
          <button onClick={tgSaveToken} style={{background:'#229ED9',color:'#fff',border:'none',borderRadius:8,padding:'0 14px',fontSize:12,fontWeight:600,cursor:'pointer'}}>Save</button>
        </div>
      </div>

      {/* Add staff */}
      <div style={{fontSize:12,fontWeight:700,color:'#1F3864',marginBottom:6}}>Staff Add Karo (department-wise)</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:6}}>
        <div style={S.f}><label style={S.lbl}>Department</label>
          <select style={S.fi} value={tgForm.department} onChange={e=>setTgForm(p=>({...p,department:e.target.value}))}>
            <option value="production">Production</option>
            <option value="quality">Quality</option>
            <option value="rejection">Rejection</option>
            <option value="breakdown">Breakdown</option>
            <option value="mouldpm">Mould PM</option>
            <option value="ims">IMS Stock</option>
            <option value="spares">Spares</option>
          </select>
        </div>
        <div style={S.f}><label style={S.lbl}>Staff Name</label><input style={S.fi} value={tgForm.staffName} onChange={e=>setTgForm(p=>({...p,staffName:e.target.value}))} placeholder="Naam"/></div>
        <div style={S.f}><label style={S.lbl}>Chat ID</label><input style={S.fi} value={tgForm.chatId} onChange={e=>setTgForm(p=>({...p,chatId:e.target.value}))} placeholder="e.g. 123456789"/></div>
        <div style={S.f}><label style={S.lbl}>Plant (optional)</label>
          <select style={S.fi} value={tgForm.plant} onChange={e=>setTgForm(p=>({...p,plant:e.target.value}))}>
            <option value="">All Plants</option><option>Plant 477</option><option>Plant 488</option><option>Plant 433</option>
          </select>
        </div>
      </div>
      <button onClick={tgAddStaff} style={{width:'100%',padding:8,border:'1px dashed #229ED9',borderRadius:8,background:'#fff',color:'#229ED9',fontSize:12,fontWeight:600,cursor:'pointer',marginBottom:10}}>+ Add Staff</button>

      {/* Staff list */}
      {tgStaff.length>0&&<div style={{marginBottom:10}}>
        <div style={{fontSize:11,fontWeight:600,color:'#666',marginBottom:4}}>Added Staff ({tgStaff.length})</div>
        {tgStaff.map((st:any)=>(
          <div key={st.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'5px 8px',background:'#F8F9FF',borderRadius:6,marginBottom:4,fontSize:11}}>
            <span><b>{st.staff_name}</b> · {st.department}{st.plant?' · '+st.plant:''} <span style={{color:'#888'}}>({st.chat_id})</span></span>
            <button onClick={()=>tgDelStaff(st.id)} style={{background:'#FFEBEE',color:'#C00000',border:'none',borderRadius:4,padding:'2px 8px',cursor:'pointer',fontSize:11}}>✕</button>
          </div>
        ))}
      </div>}

      {/* Send button */}
      <button onClick={tgSendNow} disabled={tgSending} style={{width:'100%',padding:10,background:'#229ED9',color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:700,cursor:'pointer'}}>
        {tgSending?'Bhej raha hai...':'📤 Abhi Pending Reminders Bhejo'}
      </button>
      <div style={{fontSize:10,color:'#666',marginTop:6}}>Sirf jinka kaam pending hai unhi ko message jayega. Jiska kaam ho gaya, usko skip.</div>
      {tgToast&&<Toast {...tgToast}/>}
    </div>}

    {/* PRODUCTION — plant wise, slot-wise */}
    <div style={S.card}>
      <div style={{fontWeight:700,color:'#1F3864',marginBottom:8}}>🏭 Production Entry (Plant-wise, Slot-wise)</div>
      {data.production.map((p:any,i:number)=>{
        const dayOk=p.dayDone===p.dayTotal
        const nightOk=p.nightDone===p.nightTotal
        return <div key={i} style={{background:dayOk?'#F0FFF4':'#FFF9F9',border:`1px solid ${dayOk?'#276221':'#E0E0E0'}`,borderRadius:8,padding:'8px 12px',marginBottom:6}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
            <span style={{fontWeight:700,color:'#1F3864',fontSize:13}}>{p.plant}</span>
            <Chip ok={dayOk} warn={!dayOk&&p.dayDone>0} text={`☀️ Day: ${p.dayDone}/${p.dayTotal} slots`}/>
          </div>
          {!dayOk&&p.dayMissing.length>0&&<div style={{fontSize:11,color:'#C00000',marginBottom:4}}>⏳ Day pending: {p.dayMissing.join(', ')}</div>}
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontSize:10,color:'#666'}}>Good: {(p.goodParts||0).toLocaleString()} · {p.entries} entries</span>
            <Chip ok={nightOk} warn={!nightOk&&p.nightDone>0} text={`🌙 Night: ${p.nightDone}/${p.nightTotal} slots`}/>
          </div>
          {!nightOk&&p.nightDone>0&&p.nightMissing.length>0&&<div style={{fontSize:11,color:'#C00000',marginTop:4}}>⏳ Night pending: {p.nightMissing.join(', ')}</div>}
        </div>
      })}
    </div>

    {/* QUALITY — plant wise, slot-wise */}
    <div style={S.card}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
        <span style={{fontWeight:700,color:'#1F3864'}}>🔬 Quality Check (Plant-wise, Slot-wise)</span>
        {s.quality_due_time&&<span style={{fontSize:10,color:pastDue(s.quality_due_time)?'#C00000':'#666'}}>Last slot by {s.quality_due_time}</span>}
      </div>
      {data.quality.map((q:any,i:number)=>{
        const ok=q.done===q.total
        return <div key={i} style={{background:ok?'#F0FFF4':'#FFF9F9',border:`1px solid ${ok?'#276221':'#E0E0E0'}`,borderRadius:8,padding:'8px 12px',marginBottom:6}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontWeight:700,fontSize:13,color:'#1F3864'}}>{q.plant}</span>
            <div style={{display:'flex',gap:6,alignItems:'center'}}>
              {q.ng>0&&<span style={{fontSize:10,color:'#C00000',fontWeight:700}}>{q.ng} NG</span>}
              <Chip ok={ok} warn={!ok&&q.done>0} text={`${q.done}/${q.total} slots`}/>
            </div>
          </div>
          {!ok&&q.missing.length>0&&<div style={{fontSize:11,color:'#C00000',marginTop:4}}>⏳ Pending: {q.missing.join(', ')}</div>}
          {q.checks>0&&<div style={{fontSize:10,color:'#666',marginTop:3}}>{q.checks} total checks</div>}
        </div>
      })}
    </div>

    {/* Combined checks */}
    <div style={S.card}>
      <div style={{fontWeight:700,color:'#1F3864',marginBottom:10}}>📋 Baaki Checks (Combined)</div>

      {/* IMS */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid #F5F5F5'}}>
        <div>
          <div style={{fontWeight:600,fontSize:12}}>📦 IMS Stock</div>
          {s.ims_due_time&&<div style={{fontSize:10,color:pastDue(s.ims_due_time)&&!data.ims.done?'#C00000':'#666'}}>Due by {s.ims_due_time}{pastDue(s.ims_due_time)&&!data.ims.done?' — LATE!':''}</div>}
        </div>
        <Chip ok={data.ims.done} text={data.ims.done?`✅ ${data.ims.entries} entries`:'❌ Aaj nahi aaya'}/>
      </div>

      {/* Rejection */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid #F5F5F5'}}>
        <div>
          <div style={{fontWeight:600,fontSize:12}}>❌ Rejection Entry</div>
          {s.rejection_due_time&&<div style={{fontSize:10,color:'#666'}}>Due by {s.rejection_due_time}</div>}
        </div>
        <Chip ok={data.rejection.done} warn={!data.rejection.done} text={data.rejection.done?`✅ ${data.rejection.entries} entries (${data.rejection.totalQty} pcs)`:'⚠️ Koi entry nahi'}/>
      </div>

      {/* Breakdown */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid #F5F5F5'}}>
        <div>
          <div style={{fontWeight:600,fontSize:12}}>🔧 Breakdown</div>
          <div style={{fontSize:10,color:'#666'}}>{data.breakdown.total} total · {data.breakdown.resolved} resolved{data.breakdown.noAnalysis>0?` · ${data.breakdown.noAnalysis} bina analysis`:''}</div>
        </div>
        <Chip ok={data.breakdown.pending===0} warn={false} text={data.breakdown.pending>0?`🔴 ${data.breakdown.pending} pending`:'✅ All clear'}/>
      </div>

      {/* Spares */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid #F5F5F5'}}>
        <div>
          <div style={{fontWeight:600,fontSize:12}}>🔩 Spares Movement</div>
          {s.spares_due_time&&<div style={{fontSize:10,color:'#666'}}>Due by {s.spares_due_time}</div>}
        </div>
        <Chip ok={data.spares.entries>0} warn={true} text={data.spares.entries>0?`✅ In:${data.spares.stockIn} Used:${data.spares.used}`:'— Koi movement nahi'}/>
      </div>

      {/* Mould PM */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0'}}>
        <div>
          <div style={{fontWeight:600,fontSize:12}}>⚙️ Mould PM Due</div>
          <div style={{fontSize:10,color:'#666'}}>{data.mouldPM.dueSoon} due soon</div>
        </div>
        <Chip ok={data.mouldPM.overdue===0} text={data.mouldPM.overdue>0?`🚨 ${data.mouldPM.overdue} overdue`:'✅ Koi overdue nahi'}/>
      </div>
    </div>

    {/* Pending breakdown list */}
    {data.breakdown.pendingList.length>0&&<div style={{...S.card,border:'1px solid #C00000'}}>
      <div style={{fontWeight:700,color:'#C00000',marginBottom:6}}>🔴 Pending Breakdowns</div>
      {data.breakdown.pendingList.map((b:any,i:number)=>(
        <div key={i} style={{fontSize:11,padding:'4px 0',borderBottom:'1px solid #FFE0E0'}}>
          <b>{b.machine}</b> ({b.plant}) — {b.problem}
        </div>
      ))}
    </div>}

    {/* PM Due list */}
    {data.mouldPM.list.length>0&&<div style={{...S.card,border:'1px solid #854F0B'}}>
      <div style={{fontWeight:700,color:'#854F0B',marginBottom:6}}>⚙️ PM Due / Overdue</div>
      {data.mouldPM.list.map((m:any,i:number)=>(
        <div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:11,padding:'4px 0',borderBottom:'1px solid #F0E5D5'}}>
          <span><b>{m.mould}</b> {m.plant?`· ${m.plant}`:''}</span>
          <span style={{color:m.status==='OVERDUE'?'#C00000':'#854F0B',fontWeight:700}}>{m.status==='OVERDUE'?'OVERDUE':`${m.remaining.toLocaleString()} shots`}</span>
        </div>
      ))}
    </div>}
  </div>
}
