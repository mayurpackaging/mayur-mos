'use client'
import { useState, useEffect, useCallback } from 'react'

// ─── Types ───────────────────────────────────────────────────
interface User { name: string; username: string; role: string; plant: string; modules: string }

// ─── Constants ───────────────────────────────────────────────
const ML: Record<string, string> = {
  mis:"MIS", ims:"IMS Stock", production:"Production", planning:"Planning",
  quality:"Quality", rejection:"Rejection", mouldchange:"Mould Change",
  dispatch:"Dispatch", batch:"Batch", sales:"Sales", spares:"Spares",
  mouldpm:"Mould PM", breakdown:"Breakdown", users:"Users", performance:"Performance"
}

const MACH: Record<string, string[]> = {
  "Plant 477": ["M1-Sumitomo 180T","M2-Sumitomo 180T","M3-Sumitomo 180T","M4-Sumitomo 280T","M5-JSW 180T","M6-Sumitomo 180T"],
  "Plant 488": ["M1-Sumitomo 180T","M2-Sumitomo 180T","M3-JSW 350T","M4-Sumitomo 180T","M5-Sumitomo 350T","M6-JSW 350T","M7-JSW 350T"],
  "Plant 433": ["M1-Milacron 200T","M2-Milacron 200T"]
}

// ─── Styles ───────────────────────────────────────────────────
const S = {
  topbar: {background:'#1F3864',padding:'10px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky' as const,top:0,zIndex:100},
  nav: {display:'flex',gap:6,padding:'8px 12px',overflowX:'auto' as const,background:'#fff',borderBottom:'1px solid #E0E0E0',position:'sticky' as const,top:44,zIndex:99},
  nb: {padding:'6px 12px',fontSize:11,fontWeight:600,border:'1px solid #E0E0E0',borderRadius:6,background:'#fff',color:'#666',cursor:'pointer',whiteSpace:'nowrap' as const},
  nbActive: {padding:'6px 12px',fontSize:11,fontWeight:600,border:'1px solid #1F3864',borderRadius:6,background:'#1F3864',color:'#fff',cursor:'pointer',whiteSpace:'nowrap' as const},
  card: {background:'#fff',borderRadius:10,padding:'14px 16px',marginBottom:8,boxShadow:'0 1px 3px rgba(0,0,0,.06)'},
  sb: {width:'100%',padding:10,fontSize:14,fontWeight:700,background:'#1F3864',color:'#fff',border:'none',borderRadius:8,cursor:'pointer',marginTop:4},
  fi: {padding:'9px 12px',fontSize:13,border:'1px solid #E0E0E0',borderRadius:8,outline:'none',background:'#FAFAFA',color:'#1a1a1a',width:'100%'},
  f: {display:'flex',flexDirection:'column' as const,gap:5,marginBottom:12},
  label: {fontSize:11,fontWeight:600,color:'#666',textTransform:'uppercase' as const},
  met: {background:'#fff',borderRadius:10,padding:'10px 12px',boxShadow:'0 1px 3px rgba(0,0,0,.06)'},
  toast_s: {padding:'8px 14px',borderRadius:8,fontSize:12,textAlign:'center' as const,marginTop:8,background:'#276221',color:'#fff'},
  toast_e: {padding:'8px 14px',borderRadius:8,fontSize:12,textAlign:'center' as const,marginTop:8,background:'#C00000',color:'#fff'},
}

// ─── Main Component ───────────────────────────────────────────
export default function MOS() {
  const [screen, setScreen] = useState<'login'|'main'>('login')
  const [user, setUser] = useState<User|null>(null)
  const [activeTab, setActiveTab] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginErr, setLoginErr] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  const doLogin = async () => {
    if (!username || !password) { setLoginErr('Username aur password daalo!'); return }
    setLoginLoading(true); setLoginErr('')
    const res = await fetch('/api/auth', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({username, password}) }).then(r=>r.json())
    setLoginLoading(false)
    if (res.success) {
      setUser(res.user)
      setScreen('main')
      const firstModule = res.user.modules.split(',')[0].trim().toLowerCase()
      setActiveTab(firstModule)
    } else {
      setLoginErr(res.msg || 'Login failed!')
    }
  }

  if (screen === 'login') return <LoginScreen username={username} setUsername={setUsername} password={password} setPassword={setPassword} loginErr={loginErr} loginLoading={loginLoading} doLogin={doLogin} />
  if (!user) return null
  return <MainScreen user={user} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={() => { setUser(null); setScreen('login'); setUsername(''); setPassword('') }} />
}

// ─── Login Screen ─────────────────────────────────────────────
function LoginScreen({username,setUsername,password,setPassword,loginErr,loginLoading,doLogin}: any) {
  return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:16,background:'#F2F4F7'}}>
      <div style={{background:'#1F3864',color:'#fff',padding:'16px 32px',borderRadius:12,textAlign:'center',marginBottom:24}}>
        <div style={{fontSize:16,fontWeight:700}}>Mayur Operations System</div>
        <div style={{fontSize:11,color:'#90A8C8',marginTop:4}}>Mayur Food Packaging Products — Bawana, Delhi</div>
      </div>
      <div style={{background:'#fff',borderRadius:12,padding:24,width:'100%',maxWidth:340,boxShadow:'0 2px 8px rgba(0,0,0,.08)'}}>
        <div style={{fontSize:18,fontWeight:700,marginBottom:4}}>Welcome</div>
        <div style={{fontSize:13,color:'#666',marginBottom:20}}>Apni ID se login karein</div>
        <div style={S.f}>
          <label style={S.label}>Username</label>
          <input style={S.fi} value={username} onChange={e=>setUsername(e.target.value)} placeholder="username" onKeyDown={e=>e.key==='Enter'&&doLogin()} />
        </div>
        <div style={S.f}>
          <label style={S.label}>Password</label>
          <input style={S.fi} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="password" onKeyDown={e=>e.key==='Enter'&&doLogin()} />
        </div>
        <button style={S.sb} onClick={doLogin} disabled={loginLoading}>{loginLoading ? 'Logging in...' : 'Login'}</button>
        {loginErr && <div style={{fontSize:12,color:'#C00000',marginTop:8,textAlign:'center'}}>{loginErr}</div>}
      </div>
    </div>
  )
}

// ─── Main Screen ──────────────────────────────────────────────
function MainScreen({user, activeTab, setActiveTab, onLogout}: any) {
  const modules = user.modules.split(',').map((m: string) => m.trim().toLowerCase())
  
  return (
    <div>
      {/* Top Bar */}
      <div style={S.topbar}>
        <div>
          <div style={{color:'#fff',fontSize:13,fontWeight:700}}>Mayur Operations System</div>
          <div style={{fontSize:10,color:'#90A8C8'}}>{new Date().toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'})}</div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{background:'rgba(255,255,255,.15)',color:'#fff',fontSize:11,padding:'4px 10px',borderRadius:999}}>{user.name} — {user.role}</div>
          <button onClick={onLogout} style={{background:'transparent',border:'1px solid rgba(255,255,255,.3)',color:'#fff',fontSize:11,padding:'4px 10px',borderRadius:8,cursor:'pointer'}}>Logout</button>
        </div>
      </div>
      
      {/* Nav */}
      <div style={S.nav}>
        {modules.map((m: string) => (
          <button key={m} style={activeTab===m ? S.nbActive : S.nb} onClick={() => setActiveTab(m)}>
            {ML[m] || m}
          </button>
        ))}
      </div>
      
      {/* Content */}
      <div style={{padding:12}}>
        {activeTab === 'mis' && <MISTab />}
        {activeTab === 'ims' && <IMSTab user={user} />}
        {activeTab === 'production' && <div style={S.card}><div style={{fontWeight:700,marginBottom:8}}>Production Entry</div><div style={{color:'#666',fontSize:13}}>Coming soon — production form here!</div></div>}
        {activeTab === 'breakdown' && <BreakdownTab user={user} />}
        {!['mis','ims','production','breakdown'].includes(activeTab) && (
          <div style={S.card}>
            <div style={{fontWeight:700,marginBottom:8}}>{ML[activeTab] || activeTab}</div>
            <div style={{color:'#666',fontSize:13}}>This module is being migrated. Coming soon!</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── MIS Tab ──────────────────────────────────────────────────
function MISTab() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/mis').then(r=>r.json()).then(d => { setData(d); setLoading(false) })
  }, [])

  if (loading) return <div style={{textAlign:'center',padding:32,color:'#666'}}>Loading MIS data...</div>
  if (!data) return <div style={S.card}>Error loading data!</div>

  const prod = data.production || {}
  const plants = prod.plants || {}
  const totalParts = (prod.total||0) + (prod.totalRej||0)
  const rejPct = totalParts > 0 ? Math.round((prod.totalRej||0)/totalParts*100*10)/10 : 0

  return (
    <div>
      {/* Alerts */}
      {data.alerts?.length > 0 && (
        <div style={{...S.card, border:'2px solid #C00000', background:'#FFEBEE'}}>
          <div style={{fontWeight:700,color:'#C00000',marginBottom:8}}>System Alerts</div>
          {data.alerts.map((a: string, i: number) => <div key={i} style={{fontSize:12,color:'#C00000',padding:'4px 0',borderBottom:'1px solid #FFCDD2'}}>🚨 {a}</div>)}
        </div>
      )}

      {/* Missing entries */}
      {data.missing?.length > 0 ? (
        <div style={{...S.card, border:'2px solid #FF9800', background:'#FFF3E0'}}>
          <div style={{fontWeight:700,color:'#E65100',marginBottom:8}}>Missing Entries ({data.missing.length})</div>
          {data.missing.map((m: string, i: number) => <div key={i} style={{fontSize:12,color:'#E65100',padding:'4px 0',borderBottom:'1px solid #FFE0B2'}}>⚠️ {m}</div>)}
        </div>
      ) : (
        <div style={{...S.card, border:'1px solid #276221', background:'#E8F5E9'}}>
          <div style={{fontSize:12,color:'#276221',fontWeight:600}}>✅ Aaj saari entries ho gayi hain!</div>
        </div>
      )}

      {/* Metrics */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
        <div style={{...S.met,textAlign:'center'}}>
          <div style={{fontSize:10,color:'#666'}}>Total Good Parts</div>
          <div style={{fontSize:22,fontWeight:700,color:'#276221'}}>{((prod.total||0)/1000).toFixed(1)}K</div>
        </div>
        <div style={{...S.met,textAlign:'center'}}>
          <div style={{fontSize:10,color:'#666'}}>Rejection %</div>
          <div style={{fontSize:22,fontWeight:700,color:rejPct>3?'#C00000':rejPct>1?'#854F0B':'#276221'}}>{rejPct}%</div>
        </div>
      </div>

      {/* Plants */}
      <div style={S.card}>
        <div style={{fontWeight:700,marginBottom:10}}>Plant-wise Production Today</div>
        {['477','488','433'].map(p => {
          const pl = plants[p] || {good:0,rej:0,eff:0}
          const effCol = pl.eff>=90?'#276221':pl.eff>=75?'#854F0B':'#C00000'
          return (
            <div key={p} style={{background:'#F8F9FF',border:'1px solid #E0E8FF',borderRadius:8,padding:10,marginBottom:8}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                <span style={{fontWeight:700,color:'#1F3864'}}>Plant {p}</span>
                <span style={{background:pl.eff>=90?'#E8F5E9':pl.eff>=75?'#FFF3E0':'#FFEBEE',color:effCol,padding:'2px 10px',borderRadius:999,fontSize:11,fontWeight:700}}>{pl.eff}% efficiency</span>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6,textAlign:'center'}}>
                <div><div style={{fontSize:9,color:'#666'}}>Good Parts</div><div style={{fontSize:16,fontWeight:700,color:'#276221'}}>{(pl.good||0).toLocaleString()}</div></div>
                <div><div style={{fontSize:9,color:'#666'}}>Rejection</div><div style={{fontSize:16,fontWeight:700,color:'#C00000'}}>{(pl.rej||0).toLocaleString()}</div></div>
                <div><div style={{fontSize:9,color:'#666'}}>Entries</div><div style={{fontSize:16,fontWeight:700,color:'#1F3864'}}>{pl.entries||0}</div></div>
              </div>
              <div style={{marginTop:8,height:6,background:'#F0F0F0',borderRadius:999,overflow:'hidden'}}>
                <div style={{width:`${pl.eff}%`,height:'100%',background:effCol,borderRadius:999}}></div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 7-day trend */}
      {data.trend?.length > 0 && (
        <div style={S.card}>
          <div style={{fontWeight:700,marginBottom:10}}>7-Day Production Trend</div>
          <div style={{display:'flex',alignItems:'flex-end',gap:4,height:100}}>
            {data.trend.map((t: any, i: number) => {
              const maxVal = Math.max(...data.trend.map((x: any) => x.good)) || 1
              const h = Math.round((t.good/maxVal)*80)
              return (
                <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
                  <div style={{fontSize:9,color:'#276221',fontWeight:600}}>{Math.round(t.good/1000)}K</div>
                  <div style={{width:'100%',display:'flex',flexDirection:'column',justifyContent:'flex-end',height:80}}>
                    <div style={{width:'100%',height:h,background:'#1F3864',borderRadius:'2px 2px 0 0'}}></div>
                  </div>
                  <div style={{fontSize:8,color:'#666'}}>{t.date?.slice(5)}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── IMS Tab ──────────────────────────────────────────────────
function IMSTab({user}: any) {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [plant, setPlant] = useState('Plant 477')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{msg:string,ok:boolean}|null>(null)
  const [showStatus, setShowStatus] = useState(false)
  const [values, setValues] = useState<Record<string, {pk:string,uc:string,ul:string}>>({})

  useEffect(() => {
    fetch('/api/ims').then(r=>r.json()).then(d => {
      setItems(d.items || [])
      const init: Record<string,any> = {}
      d.items?.forEach((it: any) => { init[it.name] = {pk: it.stockC||'', uc: it.unpackC||'', ul: it.unpackL||''} })
      setValues(init)
      setLoading(false)
    })
  }, [])

  const showToast = (msg: string, ok: boolean) => {
    setToast({msg, ok})
    setTimeout(() => setToast(null), 3500)
  }

  const save = async () => {
    const entries = items.map(it => ({
      itemName: it.name, category: it.category,
      stockCartons: parseFloat(values[it.name]?.pk||'0')||0,
      unpackCartons: parseFloat(values[it.name]?.uc||'0')||0,
      unpackLid: parseFloat(values[it.name]?.ul||'0')||0,
    }))
    setSaving(true)
    const res = await fetch('/api/ims', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({plant, enteredBy: user.name, entries}) }).then(r=>r.json())
    setSaving(false)
    showToast(res.msg, res.success)
  }

  if (loading) return <div style={{textAlign:'center',padding:32,color:'#666'}}>Stock data loading...</div>

  const safe = items.filter(i=>i.status==='SAFE').length
  const critical = items.filter(i=>i.status==='CRITICAL').length
  const low = items.filter(i=>['LOW','DANGER'].includes(i.status)).length

  return (
    <div>
      {/* Summary */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:8}}>
        <div style={{...S.met,textAlign:'center'}}><div style={{fontSize:10,color:'#666'}}>Safe</div><div style={{fontSize:20,fontWeight:700,color:'#276221'}}>{safe}</div></div>
        <div style={{...S.met,textAlign:'center'}}><div style={{fontSize:10,color:'#666'}}>Critical</div><div style={{fontSize:20,fontWeight:700,color:'#C00000'}}>{critical}</div></div>
        <div style={{...S.met,textAlign:'center'}}><div style={{fontSize:10,color:'#666'}}>Low</div><div style={{fontSize:20,fontWeight:700,color:'#854F0B'}}>{low}</div></div>
      </div>

      {/* Bulk entry */}
      <div style={S.card}>
        <div style={{fontWeight:700,marginBottom:10}}>Bulk Stock Entry</div>
        <div style={S.f}>
          <label style={S.label}>Plant</label>
          <select style={S.fi} value={plant} onChange={e=>setPlant(e.target.value)}>
            <option>Plant 477</option><option>Plant 488</option><option>Plant 433</option>
          </select>
        </div>
        <div style={{background:'#E6F1FB',border:'1px solid #1F3864',borderRadius:8,padding:'8px 12px',marginBottom:10,fontSize:12,color:'#0C447C'}}>
          📦 <strong>Pack Ctn</strong> = Ready | 📦 <strong>Unpack Ctn</strong> = Container only | 🔖 <strong>Unpack Lid</strong> = Lid only
        </div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
            <thead>
              <tr>
                <th style={{background:'#1F3864',color:'#fff',padding:'6px 8px',textAlign:'left',minWidth:160}}>Item Name</th>
                <th style={{background:'#1F3864',color:'#fff',padding:'6px 8px',textAlign:'center'}}>Min</th>
                <th style={{background:'#1F6B3A',color:'#fff',padding:'6px 8px',textAlign:'center'}}>Pack ✅</th>
                <th style={{background:'#1565C0',color:'#fff',padding:'6px 8px',textAlign:'center'}}>Unpack 📦</th>
                <th style={{background:'#880E4F',color:'#fff',padding:'6px 8px',textAlign:'center'}}>Lid 🔖</th>
                <th style={{background:'#1F3864',color:'#fff',padding:'6px 8px',textAlign:'center'}}>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => {
                const v = values[it.name] || {pk:'',uc:'',ul:''}
                const pct = it.pct || 0
                const col = pct>100?'#276221':pct>=75?'#C2185B':pct>=50?'#7B1FA2':pct>=25?'#E65100':'#C00000'
                const bg = pct>100?'#F1FFF4':pct>=75?'#FFF0F5':pct>=50?'#F8F0FF':pct>=25?'#FFF8F0':'#FFF0F0'
                const stCol = it.status==='SAFE'?'#276221':it.status==='CRITICAL'?'#C00000':it.status==='Not Updated'?'#616161':'#854F0B'
                const stBg = it.status==='SAFE'?'#E8F5E9':it.status==='CRITICAL'?'#FFEBEE':it.status==='Not Updated'?'#F5F5F5':'#FFF3E0'
                return (
                  <tr key={i} style={{background:i%2===0?'#FAFAFA':'#fff'}}>
                    <td style={{padding:'5px 8px',fontSize:11,fontWeight:600}}>{it.name}</td>
                    <td style={{padding:'5px 8px',textAlign:'center',color:'#666'}}>{it.minC}</td>
                    <td style={{padding:3}}>
                      <input type="number" min="0" value={v.pk} onChange={e=>setValues(prev=>({...prev,[it.name]:{...v,pk:e.target.value}}))}
                        style={{width:60,padding:'4px',border:`1px solid ${col}`,borderRadius:6,textAlign:'center',fontSize:12,fontWeight:600,background:bg}} />
                    </td>
                    <td style={{padding:3}}>
                      <input type="number" min="0" value={v.uc} onChange={e=>setValues(prev=>({...prev,[it.name]:{...v,uc:e.target.value}}))}
                        style={{width:55,padding:'4px',border:'1px solid #E0E0E0',borderRadius:6,textAlign:'center',fontSize:12,background:'#F5F9FF'}} />
                    </td>
                    <td style={{padding:3}}>
                      <input type="number" min="0" value={v.ul} onChange={e=>setValues(prev=>({...prev,[it.name]:{...v,ul:e.target.value}}))}
                        style={{width:55,padding:'4px',border:'1px solid #E0E0E0',borderRadius:6,textAlign:'center',fontSize:12,background:'#FFF5F9'}} />
                    </td>
                    <td style={{textAlign:'center'}}>
                      <span style={{background:stBg,color:stCol,padding:'2px 7px',borderRadius:999,fontSize:10,fontWeight:600}}>{it.status}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <button style={{...S.sb,marginTop:12}} onClick={save} disabled={saving}>{saving ? 'Saving...' : '💾 Save All Stock Entry'}</button>
        {toast && <div style={toast.ok ? S.toast_s : S.toast_e}>{toast.msg}</div>}
      </div>
    </div>
  )
}

// ─── Breakdown Tab ────────────────────────────────────────────
function BreakdownTab({user}: any) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{msg:string,ok:boolean}|null>(null)
  const [form, setForm] = useState({plant:'',machine:'',shift:'Day',operator:'',problem:'',mouldRunning:'',category:'Mechanical'})
  const [resolveId, setResolveId] = useState<string|null>(null)
  const [resForm, setResForm] = useState({analysis:'',actionTaken:'',sparesUsed:'',resolvedBy:user.name,workFinishTime:'',result:'OK - Resolved',remarks:''})
  const isMaintenance = user.role === 'Maintenance' || user.username === 'prince' || user.username === 'rohit'

  const load = useCallback(() => {
    fetch('/api/breakdown').then(r=>r.json()).then(d => { setData(d); setLoading(false) })
  }, [])

  useEffect(() => { load() }, [load])

  const showToast = (msg: string, ok: boolean) => { setToast({msg,ok}); setTimeout(()=>setToast(null), 3500) }

  const report = async () => {
    if (!form.plant || !form.machine) { showToast('Plant aur Machine select karo!', false); return }
    if (!form.problem) { showToast('Problem describe karo!', false); return }
    const res = await fetch('/api/breakdown', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({action:'report',...form,reportedBy:user.name}) }).then(r=>r.json())
    showToast(res.msg, res.success)
    if (res.success) { setForm({plant:'',machine:'',shift:'Day',operator:'',problem:'',mouldRunning:'',category:'Mechanical'}); load() }
  }

  const resolve = async () => {
    if (!resForm.workFinishTime) { showToast('Work Finish Time daalo!', false); return }
    const res = await fetch('/api/breakdown', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({action:'resolve',bdId:resolveId,...resForm}) }).then(r=>r.json())
    showToast(res.msg, res.success)
    if (res.success) { setResolveId(null); load() }
  }

  const machines = MACH[form.plant] || []

  if (loading) return <div style={{textAlign:'center',padding:32,color:'#666'}}>Loading...</div>

  return (
    <div>
      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:8}}>
        <div style={{...S.met,textAlign:'center'}}><div style={{fontSize:10,color:'#666'}}>Total</div><div style={{fontSize:20,fontWeight:700,color:'#C00000'}}>{data?.totalBreakdowns||0}</div></div>
        <div style={{...S.met,textAlign:'center'}}><div style={{fontSize:10,color:'#666'}}>Pending</div><div style={{fontSize:20,fontWeight:700,color:'#C00000'}}>{data?.pending?.length||0}</div></div>
        <div style={{...S.met,textAlign:'center'}}><div style={{fontSize:10,color:'#666'}}>Downtime</div><div style={{fontSize:20,fontWeight:700,color:'#854F0B'}}>{data?.totalDowntime||0}m</div></div>
      </div>

      {/* Pending for maintenance */}
      {isMaintenance && data?.pending?.length > 0 && (
        <div style={{...S.card, border:'2px solid #FF9800'}}>
          <div style={{fontWeight:700,color:'#E65100',marginBottom:8}}>Pending Breakdowns ({data.pending.length})</div>
          {data.pending.map((b: any) => (
            <div key={b.bd_id} style={{background:'#FFF3E0',border:'1px solid #FF9800',borderRadius:8,padding:10,marginBottom:8}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <div style={{fontSize:12,fontWeight:700,color:'#E65100'}}>{b.bd_id}</div>
                  <div style={{fontSize:11,color:'#666'}}>{b.plant} {b.machine} | {b.time_of_call} | {b.operator_name}</div>
                  <div style={{fontSize:11,fontWeight:600}}>{b.problem}</div>
                </div>
                <button onClick={() => setResolveId(b.bd_id)} style={{background:'#1F3864',color:'#fff',border:'none',borderRadius:6,padding:'6px 14px',fontSize:11,cursor:'pointer'}}>Resolve</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resolution form */}
      {resolveId && (
        <div style={{...S.card, border:'2px solid #276221'}}>
          <div style={{fontWeight:700,color:'#276221',marginBottom:10}}>Resolution — {resolveId}</div>
          {[['Analysis','analysis'],['Action Taken','actionTaken'],['Spares Used','sparesUsed'],['Resolved By','resolvedBy'],['Remarks','remarks']].map(([label,key]) => (
            <div key={key} style={S.f}>
              <label style={S.label}>{label}</label>
              <input style={S.fi} value={(resForm as any)[key]} onChange={e=>setResForm(p=>({...p,[key]:e.target.value}))} />
            </div>
          ))}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            <div style={S.f}>
              <label style={S.label}>Work Finish Time</label>
              <input type="time" style={S.fi} value={resForm.workFinishTime} onChange={e=>setResForm(p=>({...p,workFinishTime:e.target.value}))} />
            </div>
            <div style={S.f}>
              <label style={S.label}>Result</label>
              <select style={S.fi} value={resForm.result} onChange={e=>setResForm(p=>({...p,result:e.target.value}))}>
                <option>OK - Resolved</option><option>Under Observation</option><option>Pending - Part Ordered</option>
              </select>
            </div>
          </div>
          <button style={{...S.sb,background:'#276221'}} onClick={resolve}>Save Resolution</button>
          <button style={{...S.sb,background:'#666',marginTop:4}} onClick={()=>setResolveId(null)}>Cancel</button>
        </div>
      )}

      {/* Report form */}
      <div style={{...S.card, border:'1px solid #C00000'}}>
        <div style={{fontWeight:700,color:'#C00000',marginBottom:8}}>Report Breakdown (Operator)</div>
        <div style={{background:'#FFEBEE',border:'1px solid #C00000',borderRadius:8,padding:'8px 12px',marginBottom:10,fontSize:12,color:'#C00000'}}>
          Machine band hone pe yeh form bharo — Prince/Rohit + Supervisors ko alert jaayega!
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          <div style={S.f}>
            <label style={S.label}>Plant</label>
            <select style={S.fi} value={form.plant} onChange={e=>setForm(p=>({...p,plant:e.target.value,machine:''}))}>
              <option value="">Select</option><option>Plant 477</option><option>Plant 488</option><option>Plant 433</option>
            </select>
          </div>
          <div style={S.f}>
            <label style={S.label}>Machine</label>
            <select style={S.fi} value={form.machine} onChange={e=>setForm(p=>({...p,machine:e.target.value}))}>
              <option>Select plant first</option>
              {machines.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
        </div>
        <div style={S.f}>
          <label style={S.label}>Problem Description</label>
          <input style={S.fi} value={form.problem} onChange={e=>setForm(p=>({...p,problem:e.target.value}))} placeholder="Machine band kyun hui..." />
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          <div style={S.f}>
            <label style={S.label}>Category</label>
            <select style={S.fi} value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>
              {['Mechanical','Electrical','Hydraulic','Heating','Mould Issue','Material Issue','Operator Error','Other'].map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={S.f}>
            <label style={S.label}>Shift</label>
            <select style={S.fi} value={form.shift} onChange={e=>setForm(p=>({...p,shift:e.target.value}))}>
              <option>Day</option><option>Night</option>
            </select>
          </div>
        </div>
        <button style={{...S.sb, background:'#C00000'}} onClick={report}>Report Breakdown + Alert Send Karo</button>
        {toast && <div style={toast.ok ? S.toast_s : S.toast_e}>{toast.msg}</div>}
      </div>

      {/* Recent */}
      <div style={S.card}>
        <div style={{fontWeight:700,marginBottom:8}}>Recent Breakdowns</div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
            <thead>
              <tr>{['BD ID','Date','Plant','Machine','Problem','Downtime','Status'].map(h=><th key={h} style={{background:'#1F3864',color:'#fff',padding:'6px 8px',textAlign:'left'}}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {(data?.recent||[]).map((r: any, i: number) => (
                <tr key={i}>
                  <td style={{padding:'6px 8px',fontSize:10,fontWeight:600}}>{r.bd_id}</td>
                  <td style={{padding:'6px 8px',fontSize:10}}>{r.date}</td>
                  <td style={{padding:'6px 8px',fontSize:10}}>{r.plant}</td>
                  <td style={{padding:'6px 8px',fontSize:10}}>{r.machine}</td>
                  <td style={{padding:'6px 8px',fontSize:10}}>{r.problem}</td>
                  <td style={{padding:'6px 8px',fontWeight:700,color:r.downtime_min>60?'#C00000':'#854F0B'}}>{r.downtime_min||0} min</td>
                  <td style={{padding:'6px 8px'}}><span style={{background:r.status==='Pending'?'#FFEBEE':'#E8F5E9',color:r.status==='Pending'?'#C00000':'#276221',padding:'2px 7px',borderRadius:999,fontSize:10}}>{r.status}</span></td>
                </tr>
              ))}
              {!data?.recent?.length && <tr><td colSpan={7} style={{textAlign:'center',color:'#666',padding:16}}>Koi breakdown nahi!</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
