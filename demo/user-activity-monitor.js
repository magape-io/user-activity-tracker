!function(e){"function"==typeof define&&define.amd?define(e):e()}((function(){"use strict";var e,i;e=void 0,i=function(){return class{constructor(e={}){this.options={inactiveThreshold:e.inactiveThreshold||6e4,storageKey:e.storageKey||"user_activity_data",sendInterval:e.sendInterval||3e4,endpoint:e.endpoint||"/api/activity-log",ipEndpoint:e.ipEndpoint||"https://api.ipify.org?format=json",noActivityThreshold:e.noActivityThreshold||1e4,gameId:e.gameId||null,gameName:e.gameName||null},this.isActive=!0,this.isWindowFocused=!0,this.hasRecentInteraction=!0,this.lastActivityTime=Date.now(),this.lastInteractionTime=Date.now(),this.activeTime=0,this.sessionStartTime=Date.now(),this.loginTime=(new Date).toISOString(),this.sessionId=this._generateUUID(),this.userInfo=null,this.pauseReason=null,this._init()}async _init(){await this._getUserInfo(),this._setupEventListeners(),this._startActivityCheck(),this._startDataSync(),this._saveData()}async _getUserInfo(){try{const e=await fetch(this.options.ipEndpoint),i=(await e.json()).ip,t=this._getDeviceInfo();this.userInfo={sessionId:this.sessionId,loginTime:this.loginTime,id:i,ip:i,...t,timestamp:Date.now()},console.log("User info collected:",this.userInfo)}catch(e){console.error("Error getting user info:",e),this.userInfo={sessionId:this.sessionId,loginTime:this.loginTime,id:"unknown_"+Date.now(),...this._getDeviceInfo(),timestamp:Date.now()}}}_getDeviceInfo(){const e=navigator.userAgent;return{os:this._getOS(e),osVersion:this._getOSVersion(e),browser:this._getBrowser(e),browserVersion:this._getBrowserVersion(e),deviceType:this._getDeviceType(e),deviceModel:this._getDeviceModel(e),screen:{width:window.screen.width,height:window.screen.height,colorDepth:window.screen.colorDepth,pixelRatio:window.devicePixelRatio||1},viewport:{width:window.innerWidth,height:window.innerHeight},hardware:{cores:navigator.hardwareConcurrency||"unknown",memory:navigator.deviceMemory?navigator.deviceMemory+"GB":"unknown",platform:navigator.platform},language:navigator.language||navigator.userLanguage,timezone:Intl.DateTimeFormat().resolvedOptions().timeZone}}_getOS(e){return e.includes("Windows")?"Windows":e.includes("Mac")?"MacOS":e.includes("Linux")?"Linux":e.includes("Android")?"Android":e.includes("iOS")||e.includes("iPhone")||e.includes("iPad")?"iOS":"Unknown"}_getOSVersion(e){let i="Unknown";return e.includes("Windows")?i=e.match(/Windows NT (\d+\.\d+)/)?e.match(/Windows NT (\d+\.\d+)/)[1]:"Unknown":e.includes("Mac")?i=e.match(/Mac OS X (\d+[._]\d+[._]\d+)/)?e.match(/Mac OS X (\d+[._]\d+[._]\d+)/)[1].replace(/_/g,"."):"Unknown":e.includes("Android")?i=e.match(/Android (\d+\.\d+)/)?e.match(/Android (\d+\.\d+)/)[1]:"Unknown":(e.includes("iOS")||e.includes("iPhone")||e.includes("iPad"))&&(i=e.match(/OS (\d+_\d+)/)?e.match(/OS (\d+_\d+)/)[1].replace(/_/g,"."):"Unknown"),i}_getBrowser(e){return e.includes("Chrome")&&!e.includes("Edg")?"Chrome":e.includes("Firefox")?"Firefox":e.includes("Safari")&&!e.includes("Chrome")?"Safari":e.includes("Edg")?"Edge":e.includes("Opera")||e.includes("OPR")?"Opera":"Unknown"}_getBrowserVersion(e){let i="Unknown";return e.includes("Chrome")&&!e.includes("Edg")?i=e.match(/Chrome\/(\d+\.\d+)/)?e.match(/Chrome\/(\d+\.\d+)/)[1]:"Unknown":e.includes("Firefox")?i=e.match(/Firefox\/(\d+\.\d+)/)?e.match(/Firefox\/(\d+\.\d+)/)[1]:"Unknown":e.includes("Safari")&&!e.includes("Chrome")?i=e.match(/Version\/(\d+\.\d+)/)?e.match(/Version\/(\d+\.\d+)/)[1]:"Unknown":e.includes("Edg")&&(i=e.match(/Edg\/(\d+\.\d+)/)?e.match(/Edg\/(\d+\.\d+)/)[1]:"Unknown"),i}_getDeviceType(e){return e.includes("Mobile")?"Mobile":e.includes("Tablet")?"Tablet":"Desktop"}_getDeviceModel(e){let i="Unknown";if(e.includes("iPhone"))i="iPhone";else if(e.includes("iPad"))i="iPad";else if(e.includes("Android")){const t=e.match(/\(Linux;.*?;\s([^)]+)\)/);t&&(i=t[1].split(";").pop().trim())}return i}_setupEventListeners(){const e=this._throttle(this._handleActivity.bind(this),1e3);["mousedown","mousemove","keydown","scroll","touchstart","click"].forEach((i=>{document.addEventListener(i,e,{passive:!0})})),document.addEventListener("visibilitychange",this._handleVisibilityChange.bind(this)),window.addEventListener("focus",this._handleWindowFocus.bind(this)),window.addEventListener("blur",this._handleWindowBlur.bind(this)),window.addEventListener("beforeunload",(()=>this._saveData()))}_throttle(e,i){let t;return function(...n){t||(e.apply(this,n),t=!0,setTimeout((()=>t=!1),i))}}_handleActivity(){const e=Date.now();this.lastInteractionTime=e,this.hasRecentInteraction=!0}_handleVisibilityChange(){this.isWindowFocused=!document.hidden,document.hidden?this._setPauseReason("Page is hidden"):this._setPauseReason(null)}_handleWindowFocus(){this.isWindowFocused=!0}_handleWindowBlur(){this.isWindowFocused=!1,this._setPauseReason("Window lost focus")}_startActivityCheck(){this.activityCheckInterval=setInterval((()=>{Date.now()-this.lastInteractionTime>this.options.noActivityThreshold?(this.hasRecentInteraction=!1,this._setPauseReason("No user activity detected")):this._setPauseReason(null),this._updateActiveTime()}),1e3)}_updateActiveTime(){const e=Date.now();this.isWindowFocused&&this.hasRecentInteraction&&(this.activeTime+=e-this.lastActivityTime),this.lastActivityTime=e}_saveData(){this._updateActiveTime();const e={session_id:this.sessionId,game_id:this.options.gameId||"unknown",game_name:this.options.gameName||"unknown",user_ip:this.userInfo.ip,login_time:this.loginTime,active_time:this.activeTime,is_window_focused:this.isWindowFocused,has_recent_interaction:this.hasRecentInteraction,os:this.userInfo.os,os_version:this.userInfo.osVersion,browser:this.userInfo.browser,browser_version:this.userInfo.browserVersion,device_type:this.userInfo.deviceType,device_model:this.userInfo.deviceModel,screen_width:this.userInfo.screen.width,screen_height:this.userInfo.screen.height,color_depth:this.userInfo.screen.colorDepth,pixel_ratio:this.userInfo.screen.pixelRatio,viewport_width:this.userInfo.viewport.width,viewport_height:this.userInfo.viewport.height,hardware_cores:this.userInfo.hardware.cores,hardware_memory:this.userInfo.hardware.memory,hardware_platform:this.userInfo.hardware.platform,language:this.userInfo.language,timezone:this.userInfo.timezone,timestamp:(new Date).toISOString()};this._sendToServer(e)}async _sendToServer(e){try{const i=await fetch(this.options.endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)});if(!i.ok)throw new Error(`HTTP error! status: ${i.status}`);console.log("活动数据发送成功")}catch(e){console.error("发送活动数据时出错:",e)}}_getActivityStatus(){return this.isWindowFocused?document.hidden?{isActive:!1,reason:"Page is hidden - Browser tab is not visible"}:Date.now()-this.lastInteractionTime>this.options.noActivityThreshold?{isActive:!1,reason:"No user activity detected"}:{isActive:!0,reason:null}:{isActive:!1,reason:"Window is not focused - User switched to another window/tab"}}getUserInfo(){const e=this._getActivityStatus();return{...this.userInfo,activeTime:this.activeTime,isActive:e.isActive,isWindowFocused:this.isWindowFocused,pauseReason:e.reason}}getActiveTime(){return Math.floor(this.activeTime/1e3)}_startDataSync(){setInterval((()=>{this._saveData()}),this.options.sendInterval)}_generateUUID(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,(function(e){const i=16*Math.random()|0;return("x"===e?i:3&i|8).toString(16)}))}_setPauseReason(e){this.pauseReason=e}}},"object"==typeof exports&&"undefined"!=typeof module?module.exports=i():"function"==typeof define&&define.amd?define(i):(e="undefined"!=typeof globalThis?globalThis:e||self).UserActivityMonitor=i()}));
