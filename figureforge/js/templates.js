/** FigureForge — SVG Skeleton Templates
 * 10 chart-type + 6 layout templates. Editable elements carry data-edit="true".
 * Series elements carry data-role so palettes can recolor them.
 * All templates use viewBox="0 0 400 280". */
const C={bd:"#484878",bm:"#7884B4",bs:"#B4C0E4",ot:"#E4E4F0",ob:"#E4CCD8",ol:"#F0C0CC",nl:"#D8D8D8",nm:"#A8A8A8",nd:"#606060",up:"#2E9E44",dn:"#E53935",W:"#FFFFFF",gr:"#E6E6E6",ax:"#333333"};
const F="'Arial',sans-serif";

function axis(title,yLabels,xLabels){
  let s='<line x1="52" y1="40" x2="52" y2="232" stroke="'+C.ax+'" stroke-width="1" data-edit="true" data-role="axis"/>';
  s+='<line x1="52" y1="232" x2="372" y2="232" stroke="'+C.ax+'" stroke-width="1" data-edit="true" data-role="axis"/>';
  const n=yLabels.length;
  for(let i=0;i<n;i++){
    const y=232-(i*(192/Math.max(n-1,1)));
    s+='<line x1="48" y1="'+y+'" x2="52" y2="'+y+'" stroke="'+C.ax+'" stroke-width="1"/>';
    s+='<text x="45" y="'+(y+2.5)+'" font-family='+F+' font-size="7" fill="'+C.nd+'" text-anchor="end" data-edit="true">'+yLabels[i]+'</text>';
  }
  xLabels.forEach((lb,i)=>{
    const x=72+i*(280/Math.max(xLabels.length,1));
    s+='<line x1="'+x+'" y1="232" x2="'+x+'" y2="236" stroke="'+C.ax+'" stroke-width="1"/>';
    s+='<text x="'+x+'" y="245" font-family='+F+' font-size="7" fill="'+C.nd+'" text-anchor="middle" data-edit="true">'+lb+'</text>';
  });
  if(title) s+='<text x="212" y="20" font-family='+F+' font-size="11" font-weight="bold" fill="'+C.ax+'" text-anchor="middle" data-edit="true">'+title+'</text>';
  return s;
}

function bars(list){ return list.map(b=>'<rect x="'+b[0]+'" y="'+b[1]+'" width="'+b[2]+'" height="'+b[3]+'" fill="'+(b[4]||C.bm)+'" data-edit="true" data-role="bar"/>').join(''); }

const CHART_TEMPLATES={
'bar':{name:'柱状图',icon:'📊',svg:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280">'+
  axis('Figure 1 | Bar chart',['80','60','40','20','0'],['A','B','C','D','E'])+
  bars([[72,152,48,80],[128,112,48,120],[184,72,48,160],[240,132,48,100],[296,92,48,140]])+
'</svg>'},
'grouped-bar':{name:'分组柱状图',icon:'🗂',svg:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280">'+
  axis('Grouped bars',['100','75','50','25','0'],['G1','G2','G3'])+
  bars([[88,112,28,120,C.bd],[120,142,28,90,C.bs],[188,82,28,150,C.bd],[220,122,28,110,C.bs],[288,132,28,100,C.bd],[320,102,28,130,C.bs]])+
  '<rect x="290" y="36" width="9" height="9" fill="'+C.bd+'" data-edit="true"/><text x="303" y="44" font-family='+F+' font-size="7" fill="'+C.nd+'" data-edit="true">Ctrl</text>'+
  '<rect x="330" y="36" width="9" height="9" fill="'+C.bs+'" data-edit="true"/><text x="343" y="44" font-family='+F+' font-size="7" fill="'+C.nd+'" data-edit="true">Treat</text>'+
'</svg>'},
'line':{name:'折线图',icon:'📈',svg:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280">'+
  axis('Line trend',['90','70','50','30','10'],['0','5','10','15','20'])+
  '<polyline points="72,192 124,152 176,162 228,112 280,92 332,62" fill="none" stroke="'+C.bd+'" stroke-width="2" data-edit="true" data-role="line"/>'+
  [[72,192],[124,152],[176,162],[228,112],[280,92],[332,62]].map(p=>'<circle cx="'+p[0]+'" cy="'+p[1]+'" r="3.5" fill="'+C.bd+'" data-edit="true" data-role="marker"/>').join('')+
'</svg>'},
'multi-line':{name:'多折线图',icon:'📉',svg:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280">'+
  axis('Two series',['100','75','50','25','0'],['0','5','10','15','20'])+
  '<polyline points="72,182 124,152 176,158 228,112 280,96 332,58" fill="none" stroke="'+C.bd+'" stroke-width="2" data-edit="true" data-role="line"/>'+
  '<polyline points="72,202 124,192 176,178 228,172 280,142 332,118" fill="none" stroke="'+C.dn+'" stroke-width="2" stroke-dasharray="6,3" data-edit="true" data-role="line"/>'+
  '<text x="290" y="52" font-family='+F+' font-size="7" fill="'+C.bd+'" data-edit="true">Series A</text>'+
  '<text x="290" y="134" font-family='+F+' font-size="7" fill="'+C.dn+'" data-edit="true">Series B</text>'+
'</svg>'},
'scatter':{name:'散点图',icon:'✨',svg:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280">'+
  axis('Correlation',['1.0','0.8','0.6','0.4','0.2'],['0','2','4','6','8'])+
  [[80,180],[96,168],[112,190],[130,150],[146,160],[164,138],[182,148],[200,120],[218,132],[238,108],
   [256,122],[274,98],[292,110],[310,86],[330,92],[348,70]].map(p=>'<circle cx="'+p[0]+'" cy="'+p[1]+'" r="3" fill="'+C.bm+'" fill-opacity="0.85" data-edit="true" data-role="marker"/>').join('')+
'</svg>'},
'pie':{name:'饼图',icon:'🥧',svg:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280">'+
  '<path d="M210 140 L210 56 A84 84 0 0 1 286 174 Z" fill="'+C.bd+'" data-edit="true" data-role="bar"/>'+
  '<path d="M210 140 L286 174 A84 84 0 0 1 152 216 Z" fill="'+C.bm+'" data-edit="true" data-role="bar"/>'+
  '<path d="M210 140 L152 216 A84 84 0 0 1 126 116 Z" fill="'+C.bs+'" data-edit="true" data-role="bar"/>'+
  '<path d="M210 140 L126 116 A84 84 0 0 1 210 56 Z" fill="'+C.ot+'" data-edit="true" data-role="bar"/>'+
  '<text x="300" y="60" font-family='+F+' font-size="8" fill="'+C.nd+'" data-edit="true">A · 35%</text>'+
  '<text x="300" y="76" font-family='+F+' font-size="8" fill="'+C.nd+'" data-edit="true">B · 25%</text>'+
  '<text x="300" y="92" font-family='+F+' font-size="8" fill="'+C.nd+'" data-edit="true">C · 22%</text>'+
  '<text x="300" y="108" font-family='+F+' font-size="8" fill="'+C.nd+'" data-edit="true">D · 18%</text>'+
'</svg>'},
'area':{name:'面积图',icon:'🏔',svg:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280">'+
  axis('Area trend',['100','80','60','40','20'],['0','5','10','15','20'])+
  '<polygon points="72,182 124,152 176,158 228,112 280,96 332,58 332,232 72,232" fill="'+C.bs+'" fill-opacity="0.55" data-edit="true" data-role="area"/>'+
  '<polyline points="72,182 124,152 176,158 228,112 280,96 332,58" fill="none" stroke="'+C.bd+'" stroke-width="2" data-edit="true" data-role="line"/>'+
'</svg>'},
'box':{name:'箱线图',icon:'📦',svg:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280">'+
  axis('Distribution',['90','70','50','30','10'],['Ctrl','Low','High'])+
  [[100,C.bm],[200,C.bs],[300,C.ol]].map((b,i)=>{
    const x=b[0];
    let s='<line x1="'+x+'" y1="92" x2="'+x+'" y2="192" stroke="'+C.ax+'" stroke-width="1" data-edit="true"/>';
    s+='<rect x="'+(x-24)+'" y="122" width="48" height="50" fill="'+b[1]+'" stroke="'+C.ax+'" stroke-width="1" data-edit="true" data-role="bar"/>';
    s+='<line x1="'+(x-24)+'" y1="147" x2="'+(x+24)+'" y2="147" stroke="'+C.ax+'" stroke-width="1.6" data-edit="true"/>';
    s+='<line x1="'+(x-14)+'" y1="92" x2="'+(x+14)+'" y2="92" stroke="'+C.ax+'" stroke-width="1" data-edit="true"/>';
    s+='<line x1="'+(x-14)+'" y1="192" x2="'+(x+14)+'" y2="192" stroke="'+C.ax+'" stroke-width="1" data-edit="true"/>';
    return s;}).join('')+
'</svg>'},
'heatmap':{name:'热图',icon:'🔥',svg:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280">'+
  '<text x="212" y="20" font-family='+F+' font-size="11" font-weight="bold" fill="'+C.ax+'" text-anchor="middle" data-edit="true">Heatmap</text>'+
  function(){
    const vals=[[0.9,0.4,0.2],[0.6,0.95,0.35],[0.3,0.7,0.85],[0.15,0.45,0.75]];
    const rows=['G1','G2','G3','G4'],cols=['S1','S2','S3'];
    let s='';
    for(let r=0;r<4;r++){
      s+='<text x="96" y="'+(66+r*36+18)+'" font-family='+F+' font-size="7.5" fill="'+C.nd+'" text-anchor="end" data-edit="true">'+rows[r]+'</text>';
      for(let c=0;c<3;c++){
        const v=vals[r][c];
        s+='<rect x="'+(106+c*76)+'" y="'+(66+r*36)+'" width="72" height="32" fill="rgb('+Math.round(227+(1-v)*28)+','+Math.round(24-v*160)+','+Math.round(240-v*180)+')" stroke="#FFFFFF" data-edit="true" data-role="bar"/>';
      }
    }
    for(let c=0;c<3;c++) s+='<text x="'+(142+c*76)+'" y="'+(216)+'" font-family='+F+' font-size="7.5" fill="'+C.nd+'" text-anchor="middle" data-edit="true">'+cols[c]+'</text>';
    return s;
  }()+
'</svg>'},
'forest':{name:'森林图',icon:'🌲',svg:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280">'+
  axis('Meta-analysis',['2.0','1.5','1.0','0.5'],['Study A','Study B','Study C','Pooled'])+
  [[96,'A'],[148,'B']].map(p=>'<line x1="'+p[0]+'" y1="150" x2="'+(p[0]+56)+'" y2="150" stroke="'+C.nd+'" stroke-width="1.2" data-edit="true"/><rect x="'+(p[0]+21)+'" y="143" width="14" height="14" fill="'+C.bd+'" data-edit="true" data-role="bar"/>').join('')+
  '<line x1="204" y1="110" x2="260" y2="110" stroke="'+C.nd+'" stroke-width="1.2" data-edit="true"/>'+
  '<polygon points="232,102 240,110 232,118 224,110" fill="'+C.dn+'" data-edit="true" data-role="marker"/>'+
  '<text x="212" y="98" font-family='+F+' font-size="7" fill="'+C.nd+'" data-edit="true">OR 1.24 (95% CI)</text>'+
'</svg>'}
};

function panelFrame(x,y,w,h,label){
  return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+C.W+'" stroke="'+C.nl+'" stroke-width="1" data-edit="true"/>'+
         '<text x="'+(x+6)+'" y="'+(y+14)+'" font-family='+F+' font-size="9" font-weight="bold" fill="'+C.ax+'" data-edit="true">'+label+'</text>';
}

const LAYOUT_TEMPLATES={
'single':{name:'单面板',icon:'▭',svg:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280">'+
  panelFrame(20,36,360,224,'Panel A')+
  '<text x="200" y="20" font-family='+F+' font-size="12" font-weight="bold" fill="'+C.ax+'" text-anchor="middle" data-edit="true">Figure title</text>'+
'</svg>'},
'two-h':{name:'左右双面板',icon:'▥',svg:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280">'+
  panelFrame(16,40,180,220,'a')+
  panelFrame(204,40,180,220,'b')+
  '<text x="200" y="20" font-family='+F+' font-size="12" font-weight="bold" fill="'+C.ax+'" text-anchor="middle" data-edit="true">Figure title</text>'+
'</svg>'},
'two-v':{name:'上下双面板',icon:'▤',svg:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280">'+
  panelFrame(24,34,352,110,'a')+
  panelFrame(24,152,352,110,'b')+
'</svg>'},
'four-grid':{name:'四宫格',icon:'▦',svg:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280">'+
  panelFrame(16,30,180,108,'a')+
  panelFrame(204,30,180,108,'b')+
  panelFrame(16,146,180,108,'c')+
  panelFrame(204,146,180,108,'d')+
'</svg>'},
'title-caption':{name:'标题+图注',icon:'📰',svg:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280">'+
  '<text x="200" y="22" font-family='+F+' font-size="13" font-weight="bold" fill="'+C.ax+'" text-anchor="middle" data-edit="true">Figure 1 | Main finding</text>'+
  panelFrame(48,32,304,168,'Figure area')+
  '<rect x="48" y="210" width="304" height="54" fill="'+C.ot+'" data-edit="true"/>'+
  '<text x="58" y="228" font-family='+F+' font-size="7.5" fill="'+C.nd+'" data-edit="true">(A) Description of first panel...</text>'+
  '<text x="58" y="240" font-family='+F+' font-size="7.5" fill="'+C.nd+'" data-edit="true">(B) Description of second panel...</text>'+
'</svg>'},
'schematic':{name:'流程示意',icon:'🧩',svg:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280">'+
  '<text x="200" y="20" font-family='+F+' font-size="11" font-weight="bold" fill="'+C.ax+'" text-anchor="middle" data-edit="true">Workflow</text>'+
  '<rect x="36" y="60" width="88" height="44" rx="6" fill="'+C.bs+'" stroke="'+C.bd+'" stroke-width="1.2" data-edit="true" data-role="bar"/>'+
  '<text x="80" y="86" font-family='+F+' font-size="8.5" fill="'+C.ax+'" text-anchor="middle" data-edit="true">Sample</text>'+
  '<line x1="124" y1="82" x2="156" y2="82" stroke="'+C.ax+'" stroke-width="1.4" marker-end="url(#arrow)" data-edit="true"/>'+
  '<rect x="158" y="60" width="88" height="44" rx="6" fill="'+C.ol+'" stroke="'+C.bd+'" stroke-width="1.2" data-edit="true" data-role="bar"/>'+
  '<text x="202" y="86" font-family='+F+' font-size="8.5" fill="'+C.ax+'" text-anchor="middle" data-edit="true">Process</text>'+
  '<line x1="246" y1="82" x2="278" y2="82" stroke="'+C.ax+'" stroke-width="1.4" marker-end="url(#arrow)" data-edit="true"/>'+
  '<rect x="280" y="60" width="88" height="44" rx="6" fill="'+C.ob+'" stroke="'+C.bd+'" stroke-width="1.2" data-edit="true" data-role="bar"/>'+
  '<text x="324" y="86" font-family='+F+' font-size="8.5" fill="'+C.ax+'" text-anchor="middle" data-edit="true">Result</text>'+
  '<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="'+C.ax+'"/></marker></defs>'+
  '<ellipse cx="130" cy="196" rx="52" ry="26" fill="'+C.ot+'" stroke="'+C.nm+'" data-edit="true" data-role="bar"/>'+
  '<text x="130" y="199" font-family='+F+' font-size="8" fill="'+C.nd+'" text-anchor="middle" data-edit="true">Group</text>'+
  '<ellipse cx="270" cy="196" rx="52" ry="26" fill="'+C.gr+'" stroke="'+C.nm+'" data-edit="true" data-role="bar"/>'+
  '<text x="270" y="199" font-family='+F+' font-size="8" fill="'+C.nd+'" text-anchor="middle" data-edit="true">Control</text>'+
'</svg>'}
};

function getChartTemplates(){ return CHART_TEMPLATES; }
function getLayoutTemplates(){ return LAYOUT_TEMPLATES; }
function getTemplate(key){
  return CHART_TEMPLATES[key] || LAYOUT_TEMPLATES[key] || null;
}
window.getChartTemplates=getChartTemplates;
window.getLayoutTemplates=getLayoutTemplates;
window.getTemplate=getTemplate;
