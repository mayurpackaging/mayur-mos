'use client'
import { useState, useEffect, useCallback, useRef } from 'react'

interface User { name: string; username: string; role: string; plant: string; modules: string }

const ML: Record<string, string> = {
  mis:"MIS", ims:"IMS Stock", production:"Production", planning:"Planning",
  quality:"Quality", rejection:"Rejection", mouldchange:"Mould Change",
  dispatch:"Dispatch", batch:"Batch", sales:"Sales", spares:"Spares",
  mouldpm:"Mould PM", breakdown:"Breakdown", reports:"Reports", users:"Users", performance:"Performance"
}

const MACH: Record<string, string[]> = {
  "Plant 477": ["M1-Sumitomo 180T","M2-Sumitomo 180T","M3-Sumitomo 180T","M4-Sumitomo 280T","M5-JSW 180T","M6-Sumitomo 180T"],
  "Plant 488": ["M1-Sumitomo 180T","M2-Sumitomo 180T","M3-JSW 350T","M4-Sumitomo 180T","M5-Sumitomo 350T","M6-JSW 350T","M7-JSW 350T"],
  "Plant 433": ["M1-Milacron 200T","M2-Milacron 200T"]
}

const OPS = ["Dayanand","Alok Kumar","Satyanand","Uday","Sudarshan","Rahul","Pintoo","Parveen","Rahul Singh","Deepak","Karan","Ankush"]

const MOULDS = [
  {code:"6640",name:"50 ml Tub"},{code:"6641",name:"50 ml Lid"},{code:"6774",name:"100 ml Tub"},
  {code:"6775",name:"100 ml Lid"},{code:"6619",name:"175 ml Tub"},{code:"6369",name:"250 ml Tub"},
  {code:"6371",name:"300 ml Tub"},{code:"6537",name:"400 ml Tub"},{code:"6372",name:"500 ml Tub 4 Cav"},
  {code:"6889",name:"500 ml Tub 6 Cav"},{code:"6374",name:"750 ml Tub"},{code:"6987",name:"New 750 ml Tub"},
  {code:"6375",name:"1000 ml Tub"},{code:"6988",name:"1000 ml Tub New"},{code:"6500",name:"1200 ml Tub"},
  {code:"6501",name:"1500 ml Tub"},{code:"6899",name:"2000 ml Tub"},{code:"6688",name:"2500 ml Tub"},
  {code:"6479",name:"500 ml Rectangle"},{code:"6480",name:"650 ml Rectangle"},{code:"6481",name:"750 ml Rectangle"},
  {code:"6482",name:"1000 ml Rectangle"},{code:"6872",name:"1000 ml Rect New"},{code:"6714",name:"500 ml Oval"},
  {code:"6715",name:"750 ml Oval"},{code:"6716",name:"1000 ml Oval"},{code:"6717",name:"Oval Lid"},
  {code:"6753",name:"RO 16 Tub"},{code:"6754",name:"RO 24 Tub"},{code:"6755",name:"RO 32 Tub"},
  {code:"6758",name:"RE 16 Tub"},{code:"6759",name:"RE 24 Tub"},{code:"6760",name:"RE 28 Tub"},
  {code:"6761",name:"RE 38 Tub"},{code:"6903",name:"300 ml Glass"},{code:"6904",name:"350 ml Glass"},
  {code:"6905",name:"500 ml Glass"},{code:"6906",name:"Sipper Lid New"},
]

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
        {!['mis','ims','production','breakdown','mouldchange','mouldpm','rejection','reports'].includes(tab)&&(
          <div style={S.card}><div style={{fontWeight:700,marginBottom:8}}>{ML[tab]||tab}</div><div style={{color:'#666',fontSize:13}}>Yeh module jald aayega! 🔄</div></div>
        )}
      </div>
    </div>
  )
}

function MISTab() {
  const [data,setData] = useState<any>(null)
  const [loading,setLoading] = useState(true)
  useEffect(()=>{fetch('/api/mis').then(r=>r.json()).then(d=>{setData(d);setLoading(false)})},[])
  if(loading) return <div style={{textAlign:'center',padding:32,color:'#666'}}>Loading MIS...</div>
  if(!data) return <div style={S.card}>Error!</div>
  const prod=data.production||{},plants=prod.plants||{},totalParts=(prod.total||0)+(prod.totalRej||0)
  const rejPct=totalParts>0?Math.round((prod.totalRej||0)/totalParts*100*10)/10:0
  return (
    <div>
      {data.alerts?.length>0&&<div style={{...S.card,border:'2px solid #C00000',background:'#FFEBEE'}}><div style={{fontWeight:700,color:'#C00000',marginBottom:8}}>🚨 Alerts</div>{data.alerts.map((a:string,i:number)=><div key={i} style={{fontSize:12,color:'#C00000',padding:'4px 0'}}>{a}</div>)}</div>}
      {data.missing?.length>0?<div style={{...S.card,border:'2px solid #FF9800',background:'#FFF3E0'}}><div style={{fontWeight:700,color:'#E65100',marginBottom:8}}>⚠️ Missing ({data.missing.length})</div>{data.missing.map((m:string,i:number)=><div key={i} style={{fontSize:12,color:'#E65100',padding:'3px 0'}}>{m}</div>)}</div>:<div style={{...S.card,border:'1px solid #276221',background:'#E8F5E9'}}><div style={{fontSize:12,color:'#276221',fontWeight:600}}>✅ Aaj saari entries ho gayi!</div></div>}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
        <div style={S.met}><div style={{fontSize:10,color:'#666'}}>Good Parts</div><div style={{fontSize:22,fontWeight:700,color:'#276221'}}>{((prod.total||0)/1000).toFixed(1)}K</div></div>
        <div style={S.met}><div style={{fontSize:10,color:'#666'}}>Rejection %</div><div style={{fontSize:22,fontWeight:700,color:rejPct>3?'#C00000':rejPct>1?'#854F0B':'#276221'}}>{rejPct}%</div></div>
      </div>
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
            <div style={{marginTop:8,height:6,background:'#F0F0F0',borderRadius:999,overflow:'hidden'}}><div style={{width:`${Math.min(pl.eff,100)}%`,height:'100%',background:effCol,borderRadius:999}}/></div>
          </div>
        })}
      </div>
      {data.trend?.length>0&&<div style={S.card}>
        <div style={{fontWeight:700,marginBottom:10}}>7-Day Trend</div>
        <div style={{display:'flex',alignItems:'flex-end',gap:4,height:100}}>
          {data.trend.map((t:any,i:number)=>{
            const maxV=Math.max(...data.trend.map((x:any)=>x.good))||1
            const h=Math.round((t.good/maxV)*80)
            return <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center'}}>
              <div style={{fontSize:9,color:'#276221'}}>{Math.round(t.good/1000)}K</div>
              <div style={{width:'100%',display:'flex',flexDirection:'column',justifyContent:'flex-end',height:80}}><div style={{width:'100%',height:h,background:'#1F3864',borderRadius:'2px 2px 0 0'}}/></div>
              <div style={{fontSize:8,color:'#666'}}>{t.date?.slice(5)}</div>
            </div>
          })}
        </div>
      </div>}
    </div>
  )
}

function IMSTab({user}:{user:User}) {
  const [items,setItems]=useState<any[]>([])
  const [loading,setLoading]=useState(true)
  const [plant,setPlant]=useState('Plant 477')
  const [saving,setSaving]=useState(false)
  const [toast,setToast]=useState<{msg:string,ok:boolean}|null>(null)
  const [vals,setVals]=useState<Record<string,{pk:string,uc:string,ul:string}>>({})
  useEffect(()=>{fetch('/api/ims').then(r=>r.json()).then(d=>{setItems(d.items||[]);const init:Record<string,any>={};d.items?.forEach((it:any)=>{init[it.name]={pk:it.stockC||'',uc:it.unpackC||'',ul:it.unpackL||''}});setVals(init);setLoading(false)})},[])
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
      <div style={{fontWeight:700,marginBottom:10}}>Bulk Stock Entry</div>
      <div style={S.f}><label style={S.lbl}>Plant</label><select style={S.fi} value={plant} onChange={e=>setPlant(e.target.value)}><option>Plant 477</option><option>Plant 488</option><option>Plant 433</option></select></div>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
          <thead><tr>
            <th style={{background:'#1F3864',color:'#fff',padding:'6px 8px',textAlign:'left',minWidth:150}}>Item</th>
            <th style={{background:'#1F3864',color:'#fff',padding:'6px 8px',textAlign:'center'}}>Min</th>
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
              <td style={{textAlign:'center',color:'#666'}}>{it.minC}</td>
              <td style={{padding:3}}><input type="number" min="0" value={v.pk} onChange={e=>setVals(p=>({...p,[it.name]:{...v,pk:e.target.value}}))} style={{width:60,padding:4,border:`1px solid ${col}`,borderRadius:6,textAlign:'center',fontSize:12,fontWeight:600,background:bg}}/></td>
              <td style={{padding:3}}><input type="number" min="0" value={v.uc} onChange={e=>setVals(p=>({...p,[it.name]:{...v,uc:e.target.value}}))} style={{width:55,padding:4,border:'1px solid #E0E0E0',borderRadius:6,textAlign:'center',fontSize:12,background:'#F5F9FF'}}/></td>
              <td style={{padding:3}}><input type="number" min="0" value={v.ul} onChange={e=>setVals(p=>({...p,[it.name]:{...v,ul:e.target.value}}))} style={{width:55,padding:4,border:'1px solid #E0E0E0',borderRadius:6,textAlign:'center',fontSize:12,background:'#FFF5F9'}}/></td>
              <td style={{textAlign:'center'}}><span style={{background:stB,color:stC,padding:'2px 7px',borderRadius:999,fontSize:10,fontWeight:600}}>{it.status}</span></td>
            </tr>
          })}</tbody>
        </table>
      </div>
      <button style={{...S.sb,marginTop:12}} onClick={save} disabled={saving}>{saving?'Saving...':'💾 Save All Stock Entry'}</button>
      {toast&&<Toast {...toast}/>}
    </div>
  </div>
}

function ProductionTab({user}:{user:User}) {
  const [items,setItems]=useState<any[]>([])
  const [loading,setLoading]=useState(true)
  const [saving,setSaving]=useState(false)
  const [toast,setToast]=useState<{msg:string,ok:boolean}|null>(null)
  const [form,setForm]=useState({date:nd(),shift:'day',plant:'',machine:'',operator:'',operator2:'',product:'',mould:'',cavities:'',cycleTime:'',material:'',machineStatus:'running',stopReason:'',remarks:''})
  const [slots,setSlots]=useState<any[]>([])

  useEffect(()=>{
    fetch('/api/ims').then(r=>r.json()).then(d=>{setItems(d.items||[]);setLoading(false)})
    const s=form.shift==='night'?NIGHT_SLOTS:DAY_SLOTS
    setSlots(s.map(sl=>({slot:sl,good:'',rejection:'',down:'',remarks:''})))
  },[])

  const updateSlot=(i:number,field:string,val:string)=>{
    setSlots(prev=>{const n=[...prev];n[i]={...n[i],[field]:val};return n})
  }

  const calcProjected=(i:number)=>{
    const cav=parseFloat(form.cavities||'0'),ct=parseFloat(form.cycleTime||'0')
    if(cav>0&&ct>0) return Math.floor((180*60)/ct)*cav
    return 0
  }

  const calcEff=(i:number)=>{
    const proj=calcProjected(i),good=parseFloat(slots[i]?.good||'0')
    if(proj>0&&good>0) return Math.round(good/proj*100)
    return 0
  }

  const totalGood=slots.reduce((a,s)=>a+(parseFloat(s.good)||0),0)
  const totalRej=slots.reduce((a,s)=>a+(parseFloat(s.rejection)||0),0)
  const totalDown=slots.reduce((a,s)=>a+(parseFloat(s.down)||0),0)

  const save=async()=>{
    if(!form.plant||!form.machine){setToast({msg:'Plant aur Machine select karo!',ok:false});return}
    setSaving(true)
    const res=await fetch('/api/production',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...form,slots,enteredBy:user.name})}).then(r=>r.json())
    setSaving(false);setToast({msg:res.msg,ok:res.success})
  }

  const machines=MACH[form.plant]||[]
  const isRunning=form.machineStatus==='running'

  if(loading) return <div style={{textAlign:'center',padding:32,color:'#666'}}>Loading...</div>

  return <div>
    <div style={S.card}>
      <div style={{fontWeight:700,marginBottom:10}}>Production Entry</div>
      <div style={S.fr}>
        <div style={S.f}><label style={S.lbl}>Date</label><input type="date" style={S.fi} value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))}/></div>
        <div style={S.f}><label style={S.lbl}>Shift</label><select style={S.fi} value={form.shift} onChange={e=>{setForm(p=>({...p,shift:e.target.value}));const s=e.target.value==='night'?NIGHT_SLOTS:DAY_SLOTS;setSlots(s.map(sl=>({slot:sl,good:'',rejection:'',down:'',remarks:''})))}}><option value="day">Day (8am-8pm)</option><option value="night">Night (8pm-8am)</option></select></div>
      </div>
      <div style={S.f}><label style={S.lbl}>Machine Status</label>
        <select style={S.fi} value={form.machineStatus} onChange={e=>setForm(p=>({...p,machineStatus:e.target.value}))}>
          <option value="running">Running</option><option value="noplan">No Plan</option>
          <option value="breakdown">Breakdown</option><option value="mouldchange">Mould Change</option>
          <option value="maintenance">Maintenance</option><option value="powercut">Power Cut</option>
        </select>
      </div>
      {!isRunning&&<div style={{background:'#FFF3E0',border:'1px solid #FF9800',borderRadius:8,padding:'8px 12px',marginBottom:8,fontSize:12,color:'#E65100'}}>⚠️ Machine band hai — reason mandatory!</div>}
      <div style={S.fr}>
        <div style={S.f}><label style={S.lbl}>Plant</label><select style={S.fi} value={form.plant} onChange={e=>setForm(p=>({...p,plant:e.target.value,machine:''}))}>
          <option value="">Select</option><option>Plant 477</option><option>Plant 488</option><option>Plant 433</option>
        </select></div>
        <div style={S.f}><label style={S.lbl}>Machine</label><select style={S.fi} value={form.machine} onChange={e=>setForm(p=>({...p,machine:e.target.value}))}>
          <option>Select plant</option>{machines.map(m=><option key={m}>{m}</option>)}
        </select></div>
      </div>
      <div style={S.fr}>
        <div style={S.f}><label style={S.lbl}>Operator 1</label><select style={S.fi} value={form.operator} onChange={e=>setForm(p=>({...p,operator:e.target.value}))}>
          <option value="">Select</option>{OPS.map(o=><option key={o}>{o}</option>)}
        </select></div>
        <div style={S.f}><label style={S.lbl}>Operator 2</label><select style={S.fi} value={form.operator2} onChange={e=>setForm(p=>({...p,operator2:e.target.value}))}>
          <option value="">None</option>{OPS.map(o=><option key={o}>{o}</option>)}
        </select></div>
      </div>
      <div style={S.fr}>
        <div style={S.f}><label style={S.lbl}>Product</label><select style={S.fi} value={form.product} onChange={e=>setForm(p=>({...p,product:e.target.value}))}>
          <option value="">Select</option>{items.map(i=><option key={i.name}>{i.name}</option>)}
        </select></div>
        <div style={S.f}><label style={S.lbl}>Mould No.</label><input style={S.fi} value={form.mould} onChange={e=>setForm(p=>({...p,mould:e.target.value}))} placeholder="Auto ya type karo"/></div>
      </div>
      <div style={S.fr}>
        <div style={S.f}><label style={S.lbl}>Cavities</label><input type="number" style={S.fi} value={form.cavities} onChange={e=>setForm(p=>({...p,cavities:e.target.value}))} placeholder="e.g. 4"/></div>
        <div style={S.f}><label style={S.lbl}>Cycle Time (sec)</label><input type="number" style={S.fi} value={form.cycleTime} onChange={e=>setForm(p=>({...p,cycleTime:e.target.value}))} placeholder="e.g. 12"/></div>
      </div>
    </div>

    {isRunning&&<div style={S.card}>
      <div style={{fontWeight:700,marginBottom:10}}>Slot-wise Production</div>
      {/* Summary bar */}
      <div style={{background:'#1F3864',borderRadius:8,padding:'8px 12px',marginBottom:10,display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:6,textAlign:'center'}}>
        <div><div style={{fontSize:9,color:'#90A8C8'}}>Good Parts</div><div style={{fontSize:14,fontWeight:700,color:'#4CAF50'}}>{Math.round(totalGood).toLocaleString()}</div></div>
        <div><div style={{fontSize:9,color:'#90A8C8'}}>Rejection</div><div style={{fontSize:14,fontWeight:700,color:'#FF5252'}}>{Math.round(totalRej).toLocaleString()}</div></div>
        <div><div style={{fontSize:9,color:'#90A8C8'}}>Downtime</div><div style={{fontSize:14,fontWeight:700,color:'#FF9800'}}>{Math.round(totalDown)} min</div></div>
        <div><div style={{fontSize:9,color:'#90A8C8'}}>Efficiency</div><div style={{fontSize:14,fontWeight:700,color:'#FFD966'}}>{totalGood>0&&calcProjected(0)>0?Math.round(totalGood/(calcProjected(0)*slots.length)*100)+'%':'--'}</div></div>
      </div>
      {slots.map((s,i)=>{
        const proj=calcProjected(i),eff=calcEff(i)
        const effCol=eff>=90?'#276221':eff>=75?'#854F0B':'#C00000'
        return <div key={i} style={{background:'#F8F9FF',border:'1px solid #E0E8FF',borderRadius:8,padding:'8px 10px',marginBottom:8}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
            <span style={{fontWeight:700,fontSize:11,color:'#1F3864'}}>{s.slot}</span>
            <span style={{background:'#1F3864',color:'#FFD966',padding:'2px 8px',borderRadius:999,fontSize:10}}>Proj: {proj>0?proj.toLocaleString():'--'}</span>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:5}}>
            <div><div style={{fontSize:9,color:'#666',textAlign:'center'}}>Good Parts</div><input type="number" min="0" value={s.good} onChange={e=>updateSlot(i,'good',e.target.value)} style={{width:'100%',padding:'5px 3px',border:'1px solid #276221',borderRadius:6,textAlign:'center',fontSize:12,fontWeight:600}}/></div>
            <div><div style={{fontSize:9,color:'#666',textAlign:'center'}}>Rejection</div><input type="number" min="0" value={s.rejection} onChange={e=>updateSlot(i,'rejection',e.target.value)} style={{width:'100%',padding:'5px 3px',border:'1px solid #C00000',borderRadius:6,textAlign:'center',fontSize:12}}/></div>
            <div><div style={{fontSize:9,color:'#666',textAlign:'center'}}>Downtime</div><input type="number" min="0" value={s.down} onChange={e=>updateSlot(i,'down',e.target.value)} style={{width:'100%',padding:'5px 3px',border:'1px solid #E0E0E0',borderRadius:6,textAlign:'center',fontSize:12}}/></div>
            <div><div style={{fontSize:9,color:'#666',textAlign:'center'}}>Efficiency</div><div style={{padding:'5px 3px',border:'1px solid #E0E0E0',borderRadius:6,textAlign:'center',fontSize:12,fontWeight:700,color:eff>0?effCol:'#666',background:eff>=90?'#E8F5E9':eff>=75?'#FFF3E0':eff>0?'#FFEBEE':'#F0F0F0'}}>{eff>0?eff+'%':'--'}</div></div>
          </div>
          <input type="text" value={s.remarks} onChange={e=>updateSlot(i,'remarks',e.target.value)} placeholder="Remarks / Loss reason..." style={{width:'100%',marginTop:5,padding:'4px 8px',border:'1px solid #E0E0E0',borderRadius:6,fontSize:11,background:'#FFFFF0'}}/>
        </div>
      })}
    </div>}

    <div style={S.f}><label style={S.lbl}>Remarks</label><input style={S.fi} value={form.remarks} onChange={e=>setForm(p=>({...p,remarks:e.target.value}))} placeholder="Any overall notes..."/></div>
    <button style={S.sb} onClick={save} disabled={saving}>{saving?'Saving...':'Save Production Entry'}</button>
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
        <div style={S.f}><label style={S.lbl}>Mould Name</label><input style={S.fi} value={setupForm.mouldName} onChange={e=>setSetupForm(p=>({...p,mouldName:e.target.value}))} placeholder="Mould name/code"/></div>
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
          {OPS.map(o=><option key={o}>{o}</option>)}
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
export function ReportsTab() {
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
