export const MACH: Record<string, string[]> = {
  "Plant 477": ["M1-Sumitomo 180T","M2-Sumitomo 180T","M3-Sumitomo 180T","M4-Sumitomo 280T","M5-JSW 180T","M6-Sumitomo 180T"],
  "Plant 488": ["M1-Sumitomo 180T","M2-Sumitomo 180T","M3-JSW 350T","M4-Sumitomo 180T","M5-Sumitomo 350T","M6-JSW 350T","M7-JSW 350T"],
  "Plant 433": ["M1-Milacron 200T","M2-Milacron 200T"]
}

export const OPS = ["Dayanand","Alok Kumar","Satyanand","Uday","Sudarshan","Rahul","Pintoo","Parveen","Rahul Singh","Deepak","Karan","Ankush"]

export const MOULDS = [
  {code:"6640", name:"50 ml Tub"},
  {code:"6641", name:"50 ml Lid"},
  {code:"6774", name:"100 ml Tub"},
  {code:"6775", name:"100 ml Lid"},
  {code:"6619", name:"175 ml Tub"},
  {code:"6369", name:"250 ml Tub"},
  {code:"6371", name:"300 ml Tub"},
  {code:"6537", name:"400 ml Tub"},
  {code:"6372", name:"500 ml Tub 4 Cav"},
  {code:"6374", name:"750 ml Tub"},
  {code:"6375", name:"1000 ml Tub"},
  {code:"6500", name:"1200 ml Tub"},
  {code:"6501", name:"1500 ml Tub"},
  {code:"6899", name:"2000 ml Tub"},
  {code:"6688", name:"2500 ml Tub"},
  {code:"6479", name:"500 ml Rectangle"},
  {code:"6480", name:"650 ml Rectangle"},
  {code:"6481", name:"750 ml Rectangle"},
  {code:"6482", name:"1000 ml Rectangle"},
  {code:"6714", name:"500 ml Oval"},
  {code:"6715", name:"750 ml Oval"},
  {code:"6716", name:"1000 ml Oval"},
  {code:"6753", name:"RO 16 Tub"},
  {code:"6754", name:"RO 24 Tub"},
  {code:"6755", name:"RO 32 Tub"},
  {code:"6758", name:"RE 16 Tub"},
  {code:"6759", name:"RE 24 Tub"},
  {code:"6760", name:"RE 28 Tub"},
  {code:"6761", name:"RE 38 Tub"},
  {code:"6903", name:"300 ml Glass"},
  {code:"6904", name:"350 ml Glass"},
  {code:"6905", name:"500 ml Glass"},
  {code:"6906", name:"Sipper Lid New"},
  {code:"6988", name:"1000 ml Tub New"},
  {code:"6872", name:"1000 ml Rectangle New"},
]

export const ML: Record<string, string> = {
  mis: "MIS", ims: "IMS Stock", production: "Production",
  planning: "Planning", quality: "Quality", rejection: "Rejection",
  mouldchange: "Mould Change", dispatch: "Dispatch", batch: "Batch",
  sales: "Sales", spares: "Spares", mouldpm: "Mould PM",
  breakdown: "Breakdown", users: "Users", performance: "Performance"
}

export const DAY_SLOTS = ["8am-11am","11am-2pm","2pm-5pm","5pm-8pm"]
export const NIGHT_SLOTS = ["8pm-11pm","11pm-2am","2am-5am","5am-8am"]

export const RREJ = ["Short Shot","Flash","Burn Mark","Sink Mark","Warpage","Flow Mark","Contamination","Dimensional","Colour Issue","Other"]

export const VIS = ["No short shots","No flash","No burn marks","No flow marks","No sink marks","Uniform color","No contamination"]
export const DIM = ["Wall Thickness","Height","Diameter","Lid Fit","Stack Ability","Drop Test","Weight Check"]
