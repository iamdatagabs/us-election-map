const $=id=>document.getElementById(id);
const number=new Intl.NumberFormat("en-US");
const stateFipsToPostal={"01":"AL","02":"AK","04":"AZ","05":"AR","06":"CA","08":"CO","09":"CT","10":"DE","11":"DC","12":"FL","13":"GA","15":"HI","16":"ID","17":"IL","18":"IN","19":"IA","20":"KS","21":"KY","22":"LA","23":"ME","24":"MD","25":"MA","26":"MI","27":"MN","28":"MS","29":"MO","30":"MT","31":"NE","32":"NV","33":"NH","34":"NJ","35":"NM","36":"NY","37":"NC","38":"ND","39":"OH","40":"OK","41":"OR","42":"PA","44":"RI","45":"SC","46":"SD","47":"TN","48":"TX","49":"UT","50":"VT","51":"VA","53":"WA","54":"WV","55":"WI","56":"WY"};
const stateNames={AL:"Alabama",AK:"Alaska",AZ:"Arizona",AR:"Arkansas",CA:"California",CO:"Colorado",CT:"Connecticut",DE:"Delaware",DC:"District of Columbia",FL:"Florida",GA:"Georgia",HI:"Hawaii",ID:"Idaho",IL:"Illinois",IN:"Indiana",IA:"Iowa",KS:"Kansas",KY:"Kentucky",LA:"Louisiana",ME:"Maine",MD:"Maryland",MA:"Massachusetts",MI:"Michigan",MN:"Minnesota",MS:"Mississippi",MO:"Missouri",MT:"Montana",NE:"Nebraska",NV:"Nevada",NH:"New Hampshire",NJ:"New Jersey",NM:"New Mexico",NY:"New York",NC:"North Carolina",ND:"North Dakota",OH:"Ohio",OK:"Oklahoma",OR:"Oregon",PA:"Pennsylvania",RI:"Rhode Island",SC:"South Carolina",SD:"South Dakota",TN:"Tennessee",TX:"Texas",UT:"Utah",VT:"Vermont",VA:"Virginia",WA:"Washington",WV:"West Virginia",WI:"Wisconsin",WY:"Wyoming"};
let history=null,topology=null,selected=null,metrics=new Map();
const fmtPct=n=>Number.isFinite(n)?n.toFixed(2)+"%":"—";
function rowsForYear(year){
 const result=new Map();
 for(const row of history.states){
  if(Number(row.election_year)!==Number(year))continue;
  if(!result.has(row.state_po))result.set(row.state_po,{dem:null,rep:null,total:Number(row.total_votes)||0});
  const r=result.get(row.state_po);r.total=Math.max(r.total,Number(row.total_votes)||0);
  if(row.party==="DEMOCRAT")r.dem=Number(row.votes);
  if(row.party==="REPUBLICAN")r.rep=Number(row.votes);
 }
 for(const r of result.values()){
  if(r.dem===null||r.rep===null||!r.total){r.margin=null;r.winner=null;r.demShare=null;r.repShare=null;continue}
  r.demShare=r.dem/r.total*100;r.repShare=r.rep/r.total*100;r.margin=(r.dem-r.rep)/r.total*100;
  r.winner=r.dem>r.rep?"DEMOCRAT":r.rep>r.dem?"REPUBLICAN":"TIE";
 }
 return result;
}
function colorForMargin(value){
 if(!Number.isFinite(value))return "#34445a";
 const t=Math.min(1,Math.abs(value)/45),neutral=[119,132,150],dem=[48,123,205],rep=[194,75,82],target=value>=0?dem:rep;
 return "rgb("+neutral.map((v,i)=>Math.round(v+(target[i]-v)*t)).join(",")+")";
}
function renderDetail(postal){
 const r=metrics.get(postal);$("state-name").textContent=stateNames[postal]||postal;
 if(!r){$("state-result").textContent="No observations for this cycle";$("dem-share").textContent=$("rep-share").textContent=$("state-margin").textContent=$("total-votes").textContent="—";return}
 $("state-result").textContent=r.winner==="DEMOCRAT"?"Democratic win":r.winner==="REPUBLICAN"?"Republican win":"Tie";
 $("dem-share").textContent=fmtPct(r.demShare);$("rep-share").textContent=fmtPct(r.repShare);
 $("state-margin").textContent=(r.margin>0?"+":"")+r.margin.toFixed(2)+" pp";
 $("total-votes").textContent=number.format(r.total);
 $("state-note").textContent="Reported presidential votes in "+$("map-year").value+". Third-party votes are included in the denominator.";
}
function render(){
 if(!history||!topology||!window.d3||!window.topojson)return;
 const year=Number($("map-year").value),view=$("map-metric").value;metrics=rowsForYear(year);
 $("map-title").textContent=year+" presidential results";
 $("map-legend").style.display=view==="winner"?"none":"flex";
 const svg=document.querySelector("#election-map"),W=960,H=600;
 const collection=topojson.feature(topology,topology.objects.states);
 const projection=d3.geoAlbersUsa().fitSize([W-30,H-20],collection),path=d3.geoPath(projection);
 const features=collection.features.filter(f=>stateFipsToPostal[String(f.id).padStart(2,"0")]);
 svg.innerHTML="";
 const layer=d3.select(svg).append("g");
 layer.selectAll("path").data(features).join("path").attr("class","state")
  .attr("d",path).attr("tabindex",0).attr("role","button")
  .attr("aria-label",f=>{const p=stateFipsToPostal[String(f.id).padStart(2,"0")],m=metrics.get(p);return stateNames[p]+(m&&m.margin!==null?", margin "+m.margin.toFixed(2)+" percentage points":", no data")})
  .attr("fill",f=>{const p=stateFipsToPostal[String(f.id).padStart(2,"0")],m=metrics.get(p);if(!m||m.margin===null)return "#34445a";if(view==="winner")return m.winner==="DEMOCRAT"?"#397fc9":m.winner==="REPUBLICAN"?"#c6535b":"#9aa3af";return colorForMargin(m.margin)})
  .classed("selected",f=>stateFipsToPostal[String(f.id).padStart(2,"0")]===selected)
  .on("mouseenter focus",function(event,f){const p=stateFipsToPostal[String(f.id).padStart(2,"0")],m=metrics.get(p);$("map-tooltip").textContent=stateNames[p]+(m&&m.margin!==null?" · "+(m.margin>0?"+":"")+m.margin.toFixed(2)+" pp":" · no data");$("map-tooltip").classList.add("visible")})
  .on("mouseleave blur",()=>$("map-tooltip").classList.remove("visible"))
  .on("click keydown",function(event,f){if(event.type==="keydown"&&event.key!=="Enter"&&event.key!==" ")return;if(event.type==="keydown")event.preventDefault();selected=stateFipsToPostal[String(f.id).padStart(2,"0")];renderDetail(selected);d3.select(svg).selectAll(".state").classed("selected",g=>stateFipsToPostal[String(g.id).padStart(2,"0")]===selected)})
  .append("title").text(f=>{const p=stateFipsToPostal[String(f.id).padStart(2,"0")],m=metrics.get(p);return stateNames[p]+(m&&m.margin!==null?" · "+m.margin.toFixed(2)+" pp":" · no data")});
 if(selected)renderDetail(selected);
}
async function init(){
 try{
  const [data,geo]=await Promise.all([fetch("data/presidential-timeseries.json"),fetch("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json")]);
  if(!data.ok||!geo.ok)throw Error("Unable to load data or map geometry");
  history=await data.json();topology=await geo.json();
  $("data-status").innerHTML='<span class="pulse"></span> Historical dataset loaded · '+history.metadata.years[0]+"–"+history.metadata.years.at(-1);
  render();$("map-year").addEventListener("change",render);$("map-metric").addEventListener("change",render);
 }catch(error){$("data-status").textContent="Data unavailable";$("election-map").innerHTML='<text x="480" y="300" text-anchor="middle">Could not load map data. Please refresh.</text>';console.error(error)}
}
init();