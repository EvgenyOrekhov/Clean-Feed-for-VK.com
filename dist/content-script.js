!function(){var e,o={links:["ask.fm","askbook.me","askfm.im","askfm.su","askmes.ru","askzone.su","my-truth.ru","nekto.me","otvechayu.ru","qroom.ru","sprashivai.by","sprashivai.ru","sprashivaii.ru","sprashivalka.com","spring.me","sprosimenya.com","sprosi.name","vopros.me","voprosmne.ru"].map((function(e){return'.wall_text [href*="'.concat(e,'"]')})).join(),apps:".wall_post_source_default",instagram:".wall_post_source_instagram",video:".wall_text .page_post_thumb_video",group_share:".page_group_share",mem_link:".mem_link[mention_id^='club']",event_share:".event_share",external_links:".wall_text [href^='/away.php?to=']:not(.wall_post_source_icon)",wall_post_more:".wall_post_more",likes:".post_like.no_likes",comments:".reply_link:not(._reply_lnk)"},t=document.querySelector("#feed_rows");function r(r){t.querySelectorAll(o[r]).map((function(e){return e.closest(".feed_row")})).filter((function(e){return e})).filter((function(e){return null===e.querySelector(".wall_text_name_explain_promoted_post, .ads_ads_news_wrap")})).forEach((function(o){var t="cffvk-".concat(r);if(e[r])return o.classList.add(t);o.classList.remove(t)}))}function n(){Object.keys(o).forEach(r),console.log("CFFVK: your feed has been cleaned")}function s(){t.querySelectorAll(".feed_row").forEach((function(e){e.removeAttribute("style")})),scroll(0,0)}NodeList.prototype.forEach=NodeList.prototype.forEach||Array.prototype.forEach,NodeList.prototype.map=NodeList.prototype.map||Array.prototype.map;var a,i=new MutationObserver((function(e){e[0].addedNodes.length>0&&(n(),console.log("             by the MutationObserver"))}));chrome.runtime.onMessage.addListener((function(o){if("clean"===o.action)return t=document.querySelector("#feed_rows"),i.disconnect(),i.observe(t,{childList:!0,subtree:!0}),document.querySelector("#feed_new_posts").addEventListener("click",s),e=o.settings,n();"disable"===o.action&&(i.disconnect(),console.log("CFFVK: cleaning disabled"))})),chrome.runtime.sendMessage({action:"activate"}),a=location.href,setInterval((function(){a!==location.href&&(a=location.href,chrome.runtime.sendMessage({action:"activate"}))}),100)}();