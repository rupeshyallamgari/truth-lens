chrome.runtime.onInstalled.addListener(() => {
  if (chrome.sidePanel) chrome.sidePanel.setPanelBehavior({openPanelOnActionClick:true}).catch(()=>{});
});
chrome.runtime.onMessage.addListener((m,s,sendResponse)=>{
  if(m.type!=="GET_PAGE_TEXT") return;
  chrome.tabs.query({active:true,currentWindow:true}).then(tabs=>{
    const id=tabs[0]?.id;
    if(!id) return sendResponse({ok:false,error:"No active tab found."});
    chrome.tabs.sendMessage(id,{type:"EXTRACT_ARTICLE"}).then(r=>{
      sendResponse(r||{ok:false,error:"Could not read this page."});
    }).catch(()=>sendResponse({ok:false,error:"This page cannot be read. Try a normal webpage."}));
  });
  return true;
});