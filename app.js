const DATA=window.APP_DATA;
const app=document.querySelector("#app");
const backBtn=document.querySelector("#backBtn");
const themeBtn=document.querySelector("#themeBtn");
const nav=[...document.querySelectorAll(".bottomnav button")];
const toast=document.querySelector("#toast");

let state={view:"home",stack:[],volume:null,recipe:null,tab:"ingredients",search:"",filter:"all",serves:4};
const LS={
  fav:"dhe_favourites",shop:"dhe_shopping",plan:"dhe_planner",theme:"dhe_theme"
};
const get=(k,d)=>JSON.parse(localStorage.getItem(k)||JSON.stringify(d));
const set=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
let favs=get(LS.fav,[]);
let shopping=get(LS.shop,[]);
let planner=get(LS.plan,{});
if(localStorage.getItem(LS.theme)==="dark") document.body.classList.add("dark");

function showToast(msg){toast.textContent=msg;toast.classList.add("show");setTimeout(()=>toast.classList.remove("show"),1800)}
function category(v){return DATA.categories.find(c=>c.id===v)}
function recipe(id){return DATA.recipes.find(r=>r.id===id)}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function go(view,opts={}){
  if(state.view!==view) state.stack.push({...state});
  state={...state,view,...opts};
  render();
}
function back(){
  if(state.stack.length){state=state.stack.pop();render()} else {state.view="home";render()}
}
function iconFor(r){
  if(r.volume===6) return "🍳"; if(r.volume===7) return "🥗"; if(r.volume===8) return "🍓"; if(r.volume===9) return "🍰";
  if(r.tags.includes("fish")) return "🐟"; if(r.tags.includes("beef")) return "🥩"; if(r.tags.includes("pork")) return "🍖"; return "🍗";
}
function card(r){
 const c=category(r.volume);
 return `<article class="card" onclick="openRecipe('${r.id}')">
   <div class="photo" style="background:linear-gradient(135deg,${c.color}33,${c.color}88)">${iconFor(r)}</div>
   <div class="body"><h3>${escapeHtml(r.name)}</h3><div class="meta"><span class="kcal">${r.calories} kcal</span><span>⏱ ${r.prep+r.cook} mins</span><span>${c.title}</span></div></div>
 </article>`;
}
function home(){
 return `<section class="hero"><h1>Dockrells Healthy Eating</h1><p>Good food. Happier families. Brighter days.</p>
 <div class="actions"><button class="primary" onclick="randomRecipe()">🎲 What shall we have?</button><button class="secondary" onclick="go('search')">Search recipes</button></div></section>
 <div class="section-title"><h2>Recipe volumes</h2><small>${DATA.recipes.length} recipes</small></div>
 <section class="catgrid">${DATA.categories.map(c=>`<button class="cat" style="background:${c.color}" onclick="openVolume(${c.id})"><div class="num">Volume ${c.id}</div><b>${c.title}</b><span>${c.target}</span></button>`).join("")}</section>
 <div class="section-title"><h2>Quick picks</h2><small>Tap to open</small></div>
 <section class="cards">${DATA.recipes.slice(0,6).map(card).join("")}</section>`;
}
function volumeView(){
 const c=category(state.volume); const rs=DATA.recipes.filter(r=>r.volume===state.volume);
 return `<section class="recipe-head" style="background:${c.color}"><small>Volume ${c.id}</small><h1>${c.title}</h1><div>${c.target}</div></section>
 <section class="cards">${rs.map(card).join("")}</section>`;
}
function recipeView(){
 const r=recipe(state.recipe), c=category(r.volume); const isFav=favs.includes(r.id); const scale=state.serves/r.serves;
 let body="";
 if(state.tab==="ingredients"){
   body=`<div class="panel"><div class="servings"><b>Servings</b><button onclick="changeServes(-1)">−</button><strong>${state.serves}</strong><button onclick="changeServes(1)">+</button></div>
   <ul class="checklist">${r.ingredients.map(i=>`<li><span>•</span><span>${escapeHtml(i)}${scale!==1?` <small style="color:var(--muted)">(scale ×${scale.toFixed(2)})</small>`:""}</span></li>`).join("")}</ul>
   <button class="primary" style="background:var(--green);color:white;margin-top:12px" onclick="addAllIngredients('${r.id}')">🛒 Add ingredients to shopping list</button></div>`;
 } else if(state.tab==="method"){
   body=`<div class="panel">${r.method.map((s,i)=>`<div class="step"><i>${i+1}</i><div>${escapeHtml(s)}</div></div>`).join("")}</div>`;
 } else {
   body=`<div class="panel"><ul class="checklist">${r.equipment.map(x=>`<li>✓ <span>${escapeHtml(x)}</span></li>`).join("")}</ul></div>`;
 }
 return `<section class="recipe-head" style="background:${c.color}">
   <div style="display:flex;justify-content:space-between;gap:12px;align-items:start"><div><small>Volume ${c.id} • ${c.title}</small><h1>${escapeHtml(r.name)}</h1></div><button class="smallbtn" onclick="toggleFav('${r.id}')">${isFav?"♥":"♡"}</button></div>
   <div class="big-kcal">${r.calories} kcal</div><div class="meta" style="color:white"><span>👨‍👩‍👧‍👦 ${state.serves} servings</span><span>⏱ Prep ${r.prep}m</span><span>🍳 Cook ${r.cook}m</span><span>👩‍🍳 ${r.difficulty}</span></div>
 </section>
 <div class="tabs"><button class="${state.tab==="ingredients"?"active":""}" onclick="setTab('ingredients')">Ingredients</button><button class="${state.tab==="method"?"active":""}" onclick="setTab('method')">Method</button><button class="${state.tab==="equipment"?"active":""}" onclick="setTab('equipment')">Equipment</button></div>${body}`;
}
function searchView(){
 let rs=DATA.recipes.filter(r=>r.name.toLowerCase().includes(state.search.toLowerCase()));
 if(state.filter!=="all") rs=rs.filter(r=>r.tags.includes(state.filter));
 return `<h1>Search recipes</h1><input class="searchbox" placeholder="Search by recipe name…" value="${escapeHtml(state.search)}" oninput="state.search=this.value;render()">
 <div class="filters">${["all","chicken","beef","pork","fish","vegetarian"].map(x=>`<button class="chip ${state.filter===x?"active":""}" onclick="state.filter='${x}';render()">${x[0].toUpperCase()+x.slice(1)}</button>`).join("")}</div>
 <section class="cards">${rs.length?rs.map(card).join(""):`<div class="empty">No matching recipes.</div>`}</section>`;
}
function favView(){
 const rs=DATA.recipes.filter(r=>favs.includes(r.id));
 return `<h1>Favourites</h1>${rs.length?`<section class="cards">${rs.map(card).join("")}</section>`:`<div class="empty">Tap ♡ on any recipe to save it here.</div>`}`;
}
function plannerView(){
 const days=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]; const slots=["Breakfast","Lunch","Dinner","Snack"];
 return `<h1>Weekly meal planner</h1><div class="panel"><div class="daygrid">${days.map(d=>`<div class="day"><b>${d}</b><span>Plan</span></div>`).join("")}</div></div>
 ${days.map(d=>`<div class="panel"><h3>${d}</h3>${slots.map(s=>{
   const key=d+"-"+s, id=planner[key], r=id?recipe(id):null;
   return `<div class="plan-row"><strong>${s}</strong><span>${r?escapeHtml(r.name):"Not planned"}</span><button class="smallbtn" onclick="choosePlan('${key}')">${r?"Change":"Add"}</button></div>`;
 }).join("")}</div>`).join("")}`;
}
function shoppingView(){
 return `<h1>Shopping list</h1><div class="panel"><button class="smallbtn" onclick="clearChecked()">Remove checked</button><button class="smallbtn" onclick="shopping=[];set(LS.shop,shopping);render()">Clear all</button></div>
 <div class="panel">${shopping.length?`<ul class="checklist">${shopping.map((x,i)=>`<li><input type="checkbox" ${x.done?"checked":""} onchange="shopping[${i}].done=this.checked;set(LS.shop,shopping)"><span style="${x.done?"text-decoration:line-through;opacity:.55":""}">${escapeHtml(x.text)}</span></li>`).join("")}</ul>`:`<div class="empty">Your shopping list is empty.</div>`}</div>
 <div class="panel"><input id="manualItem" class="searchbox" placeholder="Add an item…"><button class="primary" style="background:var(--green);color:white" onclick="addManual()">+ Add item</button></div>`;
}
function render(){
 backBtn.style.visibility=state.view==="home"?"hidden":"visible";
 nav.forEach(b=>b.classList.toggle("active",b.dataset.view===state.view));
 const views={home,volume:volumeView,recipe:recipeView,search:searchView,favourites:favView,planner:plannerView,shopping:shoppingView};
 app.innerHTML=views[state.view]();
 window.scrollTo({top:0,behavior:"instant"});
}
window.go=go;
window.openVolume=v=>go("volume",{volume:v});
window.openRecipe=id=>go("recipe",{recipe:id,tab:"ingredients",serves:recipe(id).serves});
window.setTab=t=>{state.tab=t;render()};
window.changeServes=d=>{state.serves=Math.max(1,Math.min(12,state.serves+d));render()};
window.toggleFav=id=>{favs=favs.includes(id)?favs.filter(x=>x!==id):[...favs,id];set(LS.fav,favs);render()};
window.addAllIngredients=id=>{recipe(id).ingredients.forEach(text=>{if(!shopping.some(x=>x.text===text))shopping.push({text,done:false})});set(LS.shop,shopping);showToast("Ingredients added")};
window.addManual=()=>{const el=document.querySelector("#manualItem");if(el&&el.value.trim()){shopping.push({text:el.value.trim(),done:false});set(LS.shop,shopping);render()}};
window.clearChecked=()=>{shopping=shopping.filter(x=>!x.done);set(LS.shop,shopping);render()};
window.randomRecipe=()=>openRecipe(DATA.recipes[Math.floor(Math.random()*DATA.recipes.length)].id);
window.choosePlan=key=>{
 const names=DATA.recipes.map(r=>r.name).join("\n");
 const pick=prompt("Type part of a recipe name to add:\n\n"+names.slice(0,1200));
 if(!pick)return;
 const r=DATA.recipes.find(x=>x.name.toLowerCase().includes(pick.toLowerCase()));
 if(r){planner[key]=r.id;set(LS.plan,planner);render();}else showToast("Recipe not found");
};
backBtn.onclick=back;
themeBtn.onclick=()=>{document.body.classList.toggle("dark");localStorage.setItem(LS.theme,document.body.classList.contains("dark")?"dark":"light")};
nav.forEach(b=>b.onclick=()=>go(b.dataset.view));
if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js"));
render();
