!function(){function e(e){return t=>({...t,[e]:!t[e]})}const t={toggleIsDisabled:e("is-disabled"),toggleGroups:t=>({...e("groups")(t),mygroups:!1,people:!1}),toggleMyGroups:e("mygroups"),togglePeople:e("people"),toggleExternalLinks:t=>({...e("external_links")(t),links:!1}),toggleLinks:e("links"),toggleApps:e("apps"),toggleInstagram:e("instagram"),toggleVideo:e("video"),toggleGroupShare:e("group_share"),toggleMemLink:e("mem_link"),toggleEventShare:e("event_share"),toggleMore:e("wall_post_more"),toggleLikes:e("likes"),toggleComments:e("comments")};function o({state:e}){document.querySelectorAll("input").forEach(t=>{t.checked=e[t.name],"is-disabled"!==t.name&&(t.disabled=Boolean(e["is-disabled"]))}),document.querySelector("#mygroups-label").classList.toggle("hidden",!e.groups),document.querySelector("#people-label").classList.toggle("hidden",!e.groups),document.querySelector("#links-label").classList.toggle("hidden",Boolean(e.external_links))}function s({state:e}){chrome.storage.sync.set(e)}function n({state:e}){chrome.tabs.query({currentWindow:!0,active:!0},(function([t]){chrome.runtime.sendMessage({tabId:t.id,action:"execute",settings:e})}))}chrome.storage.sync.get(e=>{!function({toggleIsDisabled:e,toggleGroups:t,toggleMyGroups:o,togglePeople:s,toggleExternalLinks:n,toggleLinks:l,toggleApps:g,toggleInstagram:r,toggleVideo:i,toggleGroupShare:a,toggleMemLink:c,toggleEventShare:u,toggleMore:m,toggleLikes:p,toggleComments:d}){const k={"is-disabled":e,groups:t,mygroups:o,people:s,external_links:n,links:l,apps:g,instagram:r,video:i,group_share:a,mem_link:c,event_share:u,wall_post_more:m,likes:p,comments:d};Object.entries(k).forEach(([e,t])=>{document.querySelector(`[name=${e}]`).addEventListener("click",t)})}(function({state:e,actions:t,subscribers:o}){let s,n,l=e;function g({actionName:e,value:t}={}){s=!0,o.every(o=>(o({state:l,actions:n,actionName:e,value:t}),s)),s=!1}return n=Object.fromEntries(Object.entries(t).map(([e,t])=>[e,function(o){l=function(){if(2===t.length)return t(o,l);const e=t(l);return"function"==typeof e?t(o)(l):e}(),g({actionName:e,value:o})}])),g(),n}({state:e,actions:t,subscribers:[o,s,n]}))})}();