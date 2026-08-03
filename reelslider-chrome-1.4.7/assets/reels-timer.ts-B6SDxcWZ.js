(function(){(function(){let e=`reels_limit_enabled`,t=`reels_limit_minutes`,n=`reels_timer_today_seconds`,r=`reels_timer_date`,i=`reels_limit_snooze_seconds`,a=`reelslider-limit-overlay`,o={enabled:!1,limitMinutes:60,todaySeconds:0,snoozeSeconds:0,dateStr:``},s=null;function c(){let e=new Date;return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}-${String(e.getDate()).padStart(2,`0`)}`}function l(){return window.location.hostname.includes(`instagram.com`)}function u(e){let t=Math.floor(e/3600),n=Math.floor(e%3600/60),r=e%60;return t>0?`${t}h ${String(n).padStart(2,`0`)}m`:`${n}m ${String(r).padStart(2,`0`)}s`}function d(e){let t=Math.floor(e/60),n=e%60;return t>0&&n>0?`${t}h ${n}m`:t>0?`${t}h 00m`:`${n}m`}function f(a){chrome.storage.local.get([e,t,n,r,i],s=>{let l=c();o.enabled=typeof s[e]==`boolean`&&s[e],o.limitMinutes=typeof s[t]==`number`?s[t]:60,o.snoozeSeconds=typeof s[i]==`number`?s[i]:0;let u=s[r]||``;u===l?(o.dateStr=u,o.todaySeconds=typeof s[n]==`number`?s[n]:0):(o.dateStr=l,o.todaySeconds=0,o.snoozeSeconds=0,chrome.storage.local.set({[r]:l,[n]:0,[i]:0})),a&&a(),v()})}function p(){if(document.getElementById(`reelslider-limit-style`))return;let e=document.createElement(`style`);e.id=`reelslider-limit-style`,e.textContent=`
      #${a} {
        position: fixed;
        inset: 0;
        z-index: 2147483647;
        background: rgba(5, 5, 5, 0.94);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
        color: #ffffff;
        padding: 24px;
        box-sizing: border-box;
      }
      #${a} .rs-limit-card {
        background: #111111;
        border: 1px solid #262626;
        border-radius: 20px;
        padding: 32px 28px;
        max-width: 400px;
        width: 100%;
        text-align: center;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
        animation: rsLimitPop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }
      @keyframes rsLimitPop {
        from { transform: scale(0.94); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      #${a} .rs-limit-icon {
        font-size: 44px;
        margin-bottom: 16px;
        display: inline-block;
      }
      #${a} .rs-limit-title {
        font-size: 20px;
        font-weight: 700;
        letter-spacing: -0.02em;
        margin-bottom: 8px;
        color: #ffffff;
      }
      #${a} .rs-limit-sub {
        font-size: 13px;
        color: #888888;
        line-height: 1.5;
        margin-bottom: 24px;
      }
      #${a} .rs-limit-badge {
        background: rgba(255, 94, 91, 0.12);
        border: 1px solid rgba(255, 94, 91, 0.3);
        color: #ff5e5b;
        font-size: 12px;
        font-weight: 600;
        padding: 6px 14px;
        border-radius: 20px;
        display: inline-block;
        margin-bottom: 24px;
      }
      #${a} .rs-limit-actions {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      #${a} .rs-btn-snooze {
        background: #ffffff;
        color: #000000;
        border: none;
        border-radius: 10px;
        padding: 12px 18px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        font-family: inherit;
        transition: opacity 0.15s, transform 0.15s;
      }
      #${a} .rs-btn-snooze:hover {
        opacity: 0.9;
        transform: translateY(-1px);
      }
    `,document.head.appendChild(e)}function m(){document.querySelectorAll(`video`).forEach(e=>{try{e.pause()}catch{}})}function h(){if(!o.enabled)return!1;let e=o.limitMinutes*60+o.snoozeSeconds;return o.todaySeconds>=e}function g(){if(!l())return;p(),m();let e=document.getElementById(a);if(e)return;e=document.createElement(`div`),e.id=a;let t=d(o.limitMinutes),n=u(o.todaySeconds);e.innerHTML=`
      <div class="rs-limit-card">
        <div class="rs-limit-icon">⏳</div>
        <div class="rs-limit-title">Daily Instagram Limit Reached</div>
        <div class="rs-limit-sub">
          You've used ${n} of Instagram today. Take a breather or extend your limit.
        </div>
        <div class="rs-limit-badge">Limit: ${t} / day</div>
        <div class="rs-limit-actions">
          <button class="rs-btn-snooze" id="rs-snooze-15">+15 Min Snooze</button>
        </div>
      </div>
    `,document.body.appendChild(e),document.getElementById(`rs-snooze-15`).onclick=()=>{let e=o.snoozeSeconds+900;chrome.storage.local.set({[i]:e},()=>{o.snoozeSeconds=e,_()})}}function _(){let e=document.getElementById(a);e&&e.remove()}function v(){l()&&h()?g():_()}function y(){if(!o.enabled||!l()||document.visibilityState!==`visible`)return;if(h()){v();return}let e=c();o.dateStr===e?(o.todaySeconds+=1,chrome.storage.local.set({[n]:o.todaySeconds})):(o.dateStr=e,o.todaySeconds=0,o.snoozeSeconds=0,chrome.storage.local.set({[r]:e,[n]:0,[i]:0})),v()}function b(){s!==null&&clearInterval(s),s=setInterval(y,1e3)}chrome.storage.onChanged.addListener((r,a)=>{a===`local`&&(r[e]||r[t]||r[n]||r[i])&&f()}),document.addEventListener(`play`,e=>{l()&&h()&&e.target instanceof HTMLVideoElement&&(e.target.pause(),g())},!0);let x=location.href;new MutationObserver(()=>{location.href!==x&&(x=location.href,v())}).observe(document,{subtree:!0,childList:!0}),f(()=>{b()})})();})()