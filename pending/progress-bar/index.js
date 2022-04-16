(()=>{"use strict";var t={3010:function(t,e,r){var s=this&&this.__rest||function(t,e){var r={};for(var s in t)Object.prototype.hasOwnProperty.call(t,s)&&e.indexOf(s)<0&&(r[s]=t[s]);if(null!=t&&"function"==typeof Object.getOwnPropertySymbols){var i=0;for(s=Object.getOwnPropertySymbols(t);i<s.length;i++)e.indexOf(s[i])<0&&Object.prototype.propertyIsEnumerable.call(t,s[i])&&(r[s[i]]=t[s[i]])}return r};Object.defineProperty(e,"__esModule",{value:!0});const i=r(295),a=r(6517);e.default=class{constructor(t=[],e={}){this.bars=[],this.data=[],this.renderer=new i.MultiBar(e),this.merge(t)}merge(t){const e=t.filter(Boolean),r=e.length-this.data.length,o=this.data.length-e.length;this.data=e.slice(),(0,a.times)(r,(()=>this.bars.push(this.renderer.create(0,0)))),(0,a.times)(o,(()=>{const t=this.bars.pop();t instanceof i.SingleBar&&this.renderer.remove(t)})),this.data.forEach(((t,e)=>{var{total:r,current:i,title:a}=t,o=s(t,["total","current","title"]);const n=this.bars[e];n.setTotal(r),n.update(i,Object.assign({title:a},o))}))}update(t,e){const r=(0,a.get)(this.data,t);if(void 0!==r&&r!==e){const r=this.data.slice();(0,a.set)(r,t,e),this.merge(r)}}stop(){this.renderer.stop()}}},496:function(t,e,r){var s=this&&this.__importDefault||function(t){return t&&t.__esModule?t:{default:t}};Object.defineProperty(e,"__esModule",{value:!0}),e.createProgress=void 0;const i=r(5022),a=s(r(6016)),o=r(6517),n=s(r(3010)),{line:l,tick:c,cross:p}=a.default,u=(t,e)=>t.replace(/\{(\w+)\}/g,((t,r)=>{var s;return null!==(s=e[r])&&void 0!==s?s:r}));e.createProgress=(t=[],e={})=>{const r=new n.default(t,(0,o.assign)({barCompleteChar:"-",barIncompleteChar:"·",clearOnComplete:!1,stopOnComplete:!0,hideCursor:!0,barGlue:">",format:(t,e,s)=>{var a;const{barsize:n,barCompleteString:d,barIncompleteString:g}=t,h=e.value>=e.total,f=h?d[0]:null!==(a=t.barGlue)&&void 0!==a?a:"",b=n-f.length,m=Math.round(e.progress*b),v=`${d.substr(0,m)}${f}${g.substr(0,b-m)}`,y=e.eta;let O;O="NULL"===y?(0,i.grey)("N/A"):"INF"===y?(0,i.yellow)("∞"):(0,i.cyan)(`${y}s`);const x=(0,o.max)((0,o.map)(r.data,(t=>t.title.length))),S=(0,o.padEnd)(s.title,x," "),_=s.step;return/^Load /.test(S)?h?u("{icon} {title} {step}",(0,o.assign)({},s,e,{icon:(0,i.green)(c),title:S,step:_})):-1===e.value?u("{icon} {title} {step}",(0,o.assign)({},s,e,{icon:(0,i.red)(p),title:S,step:(0,i.red)(_)})):u("{icon} {title} [{bar}] {value}/{total} {etaString}",(0,o.assign)({},s,e,{icon:(0,i.grey)(l),etaString:O,title:S,bar:v,step:_})):h?u("  {icon} {title} {step}",(0,o.assign)({},s,e,{icon:(0,i.green)(c),completeSeconds:(0,o.round)((e.stopTime.getTime()-e.startTime)/1e3,1),title:S,step:i.grey.italic(_)})):-1===e.value?u("  {icon} {title} {step}",(0,o.assign)({},s,e,{icon:(0,i.red)(p),title:S,step:(0,i.red)(_)})):u("  {icon} {title} [{bar}] {value}/{total} {etaString} {step}",(0,o.assign)({},s,e,{icon:(0,i.grey)(l),etaString:O,title:S,bar:v,step:i.grey.italic(_)}))}},e));return r},e.default=n.default},5022:t=>{t.exports=require("chalk")},295:t=>{t.exports=require("cli-progress")},6016:t=>{t.exports=require("figures")},6517:t=>{t.exports=require("lodash")}},e={},r=function r(s){var i=e[s];if(void 0!==i)return i.exports;var a=e[s]={exports:{}};return t[s].call(a.exports,a,a.exports,r),a.exports}(496);module.exports=r})();