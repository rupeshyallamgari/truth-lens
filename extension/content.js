function clean(s){return (s||"").replace(/\s+/g," ").trim();}
function extract(){
  const selectors=["article","[role='article']","main",".article",".article-body",".article-content",".story-body",".post-content"];
  const nodes=selectors.map(s=>document.querySelector(s)).filter(Boolean).sort((a,b)=>(b.innerText||"").length-(a.innerText||"").length);
  const node=nodes[0]||document.body;
  const title=clean(document.querySelector("meta[property='og:title']")?.content||document.querySelector("h1")?.innerText||document.title);
  const text=clean(node.innerText).slice(0,30000);
  return {ok:text.length>=20,title,text,url:location.href};
}
chrome.runtime.onMessage.addListener((m,s,send)=>{if(m.type==="EXTRACT_ARTICLE")send(extract());});