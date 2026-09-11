"use strict";
const SAMPLE = {
  performance: {title:"Performance score", axis:"Score (0–100)", unit:" points", range:[0,100], caption:"Performance score, on a 0–100 scale", a:[42,51,58,66,72,78,82], b:[40,47,57,61,65,71,76]},
  energy: {title:"Energy per run", axis:"Energy (Wh)", unit:" Wh", range:[0,60], caption:"Energy per run, in watt-hours (Wh)", a:[54,49,43,39,34,30,27], b:[53,50,47,43,40,36,33]}
};
const iterations=[1,2,3,4,5,6,7];
const chart=document.getElementById("chart");
const metric=document.getElementById("metric");
function draw(){
  const m=SAMPLE[metric.value];
  document.getElementById("table-caption").textContent=m.caption;
  document.getElementById("values").replaceChildren(...iterations.map((x,i)=>{
    const row=document.createElement("tr");
    [x,m.a[i],m.b[i]].forEach((v,j)=>{const cell=document.createElement(j===0?"th":"td");if(j===0)cell.scope="row";cell.textContent=v;row.append(cell)});
    return row;
  }));
  if(!window.Plotly){chart.textContent="The interactive chart could not load. Open the sample data table below.";document.querySelector("details").open=true;return;}
  const traces=[
    {name:"Design A",y:m.a,line:{color:"#0067b8",width:3},marker:{symbol:"circle",size:9,color:"#0067b8"}},
    {name:"Design B",y:m.b,line:{color:"#9e4d16",width:3,dash:"dash"},marker:{symbol:"diamond",size:9,color:"#9e4d16"}}
  ].map(t=>({...t,x:iterations,type:"scatter",mode:"lines+markers",hovertemplate:"Iteration %{x}<br>"+t.name+": %{y}"+m.unit+"<extra></extra>"}));
  return Plotly.react(chart,traces,{
    autosize:true,margin:{l:64,r:18,t:44,b:46},paper_bgcolor:"#fff",plot_bgcolor:"#fff",
    font:{family:'Segoe UI, Arial, sans-serif',size:14,color:"#172033"},
    xaxis:{title:{text:"Design iteration",standoff:8},tickmode:"array",tickvals:iterations,range:[.75,7.25],showgrid:false,showline:true,linecolor:"#a9b5c2",zeroline:false,fixedrange:false},
    yaxis:{title:{text:m.axis,standoff:8},range:m.range,gridcolor:"#e6ebf1",zeroline:false,tickfont:{size:13}},
    legend:{orientation:"h",x:0,y:1.2,font:{size:14}},
    hovermode:"closest",dragmode:"zoom"
  },{responsive:true,displayModeBar:false,displaylogo:false,scrollZoom:false});
}
metric.addEventListener("change",draw);
document.getElementById("reset").addEventListener("click",()=>{metric.value="performance";draw()});
draw();
if(document.modelContext?.registerTool){
  const lifecycle=new AbortController();
  try{
    Promise.resolve(document.modelContext.registerTool({
      name:"set_chart_measure",
      title:"Set chart measure",
      description:"Display performance score or energy per run in the fictional sample chart and its data table.",
      inputSchema:{type:"object",properties:{measure:{type:"string",enum:["performance","energy"]}},required:["measure"],additionalProperties:false},
      annotations:{readOnlyHint:false,untrustedContentHint:false},
      async execute(input){
        if(!input||!Object.hasOwn(SAMPLE,input.measure)||Object.keys(input).some(k=>k!=="measure"))throw new Error("Choose performance or energy.");
        metric.value=input.measure;
        await draw();
        return {measure:metric.value,fictional:true,iterations:iterations.length};
      }
    },{signal:lifecycle.signal})).catch(()=>{});
    window.addEventListener("pagehide",()=>lifecycle.abort(),{once:true});
  }catch{}
}
