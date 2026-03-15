import { useState, useEffect, useRef, useCallback } from "react";
import type { BuddyStatus, UnsolUpdate, Toast, PaceConfig } from "./types";

// Constants
import { BUDDIES, MY_SN, AIM_STYLE } from "./constants/buddies";
import { PACE } from "./constants/pace";
import { F, WB } from "./constants/styles";
import { playSound, unlockAudio, SND_BUDDYIN, SND_BUDDYOUT, SND_DOOROPEN, SND_IMRCV } from "./constants/sounds";

// Utils
import { callClaude } from "./utils/api";
import { storageGet, storageSet } from "./utils/storage";
import { getDateStr } from "./utils/time";
import { typingMs } from "./utils/typing";
import { rMin } from "./utils/typing";
import { genAway } from "./utils/genAway";

// Hooks
import { useIsMobile } from "./hooks/useIsMobile";

// Components
import SignOn from "./components/SignOn";
import BuddyList from "./components/BuddyList";
import ChatWin from "./components/ChatWin";
import Taskbar from "./components/Taskbar";
import Toasts from "./components/Toasts";
import AwayPopup from "./components/AwayPopup";
import FinalScreen from "./components/FinalScreen";
import KickedScreen from "./components/KickedScreen";
import BannedScreen from "./components/BannedScreen";
import Drag from "./components/Drag";
import Man from "./components/icons/Man";
import AwayCreator from "./components/AwayCreator";

export default function App() {
  const mobile=useIsMobile();
  const [screen,setScreen]=useState("signin");
  const [mySN,setMySN]=useState(MY_SN);
  const [awayMode,setAwayMode]=useState(()=>new URLSearchParams(window.location.search).get("away")==="1");
  const sessionId=useRef("");
  const paceRef=useRef<PaceConfig>(PACE);
  const [statuses,setStatuses]=useState<Record<string, BuddyStatus>>({});
  const [awayMsgs,setAwayMsgs]=useState<Record<string, string>>({});
  const [openChats,setOpenChats]=useState<string[]>([]);
  const openChatsRef=useRef<string[]>([]);
  useEffect(()=>{openChatsRef.current=openChats;},[openChats]);
  const [focused,setFocused]=useState<string|null>(null);
  const [toasts,setToasts]=useState<Toast[]>([]);
  const [awayPop,setAwayPop]=useState<string|null>(null);
  const [unsol,setUnsol]=useState<Record<string, UnsolUpdate>>({});
  const unsolV=useRef(0);
  const [won,setWon]=useState(false);
  const [unread,setUnread]=useState<Record<string, number>>({});
  const [mobileView,setMobileView]=useState("buddies");
  const [strikes,setStrikes]=useState(0);
  const [banned,setBanned]=useState(false);
  const [myAway,setMyAway]=useState<string|null>(null);
  const myAwayRef=useRef<string|null>(null);
  useEffect(()=>{myAwayRef.current=myAway;},[myAway]);
  const tensionCount=useRef(0);
  const tensionUsedBy=useRef(new Set<string>());
  const jordanStage=useRef(0);
  const jordanMentioned=useRef(false);
  const mobileRef=useRef(mobile);
  useEffect(()=>{mobileRef.current=mobile;},[mobile]);
  const buddyInit=useRef(new Set<string>());
  const stRef=useRef<Record<string, BuddyStatus>>({});
  const tmr=useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const itm=useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const lastProactiveReply=useRef<Record<string, number>>({}); // timestamp of last user reply per buddy
  const sessionVibeRef=useRef<"social"|"quiet"|"mixed">("social");
  const mixedActiveBuddy=useRef<string>(""); // for "mixed" session vibe
  const convEnergy=useRef<Record<string, "hyped"|"normal"|"low">>({}); // per-conversation energy

  // Per-buddy lifecycle personality — multiplies lifecycle timers
  const LIFECYCLE_STYLE: Record<string, number> = {
    claudebot: 1.0,
    sportz: 0.8,     // shorter sessions
    music: 1.3,      // always online
    gossip: 1.0,     // average
    angst: 1.5,      // lurks forever
    crush: 1.2,      // slightly longer
  };

  // Load ban state on mount
  useEffect(()=>{
    storageGet("mod_banned").then(v=>{if(v)setBanned(true);});
    storageGet("mod_strikes").then(v=>{if(typeof v==="number")setStrikes(v);});
  },[]);

  async function triggerWin(){await storageSet("jordan_won",true);setWon(true);}

  // Moderation: called when a message is flagged
  async function handleStrike(){
    const newStrikes=strikes+1;
    setStrikes(newStrikes);
    await storageSet("mod_strikes",newStrikes);
    if(newStrikes>=3){
      await storageSet("mod_banned",true);
      setBanned(true);
    } else if(newStrikes>=2){
      Object.values(tmr.current).forEach(clearTimeout);
      Object.values(itm.current).forEach(clearTimeout);
      tmr.current={}; itm.current={};
      setOpenChats([]); setScreen("kicked");
      playSound(SND_BUDDYOUT);
    }
  }

  // ── TENSION SYSTEM ──────────────────────────────────────────────
  // ── JORDAN MENTIONS (other buddies casually reference Jordan) ──
  const JORDAN_MENTIONS: Record<string, string[]> = {
    gossip:  ["omg ok dont tell anyone but i think jordan was asking about u","wait do u talk to xo_Jordan_xo?? interesting","ok so i heard something about jordan but u didnt hear it from me","have u seen jordans away message lately lol"],
    sportz:  ["yo i saw jordan at school today lol","hey random but do u know jordan","dude jordan was at the game did u know that"],
    music:   ["jordan has good taste in music actually","hey did jordan ever send u that song","xo_Jordan_xo has a sick away message rn"],
    angst:   ["do u ever talk to jordan... nvm","jordan is... different","sometimes i wonder about jordan idk"],
  };
  function tryJordanMention(buddyId: string, exchangeCount: number): string|null {
    if(jordanMentioned.current) return null; // only once per session
    if(buddyId==="crush"||buddyId==="claudebot") return null;
    if(exchangeCount<3) return null; // need some rapport first
    if(stRef.current.crush==="offline"&&!BUDDIES.find(b=>b.id==="crush")) return null;
    if(Math.random()>0.15) return null; // 15% chance
    jordanMentioned.current=true;
    const pool=JORDAN_MENTIONS[buddyId];
    if(!pool||!pool.length) return null;
    return pool[Math.floor(Math.random()*pool.length)];
  }

  const TENSION_PROMPTS: Record<string, string> = {
    gossip:  "RIGHT NOW you are suddenly upset or annoyed at the user. Pick one: (a) you feel like they aren't listening to you or don't care about what you're saying, (b) you're jealous — you saw them talking to someone else or their away message was suspicious, (c) you heard a rumor about them. Be dramatic but not over the top. Don't explain that you're doing a tension moment. Just BE upset naturally. Stay in character.",
    crush:   "RIGHT NOW something the user said (or didn't say) made you feel hurt or awkward. Pick one: (a) you feel like they don't actually care and you're just convenient, (b) you misread something they said and got embarrassed and are shutting down, (c) you almost said something real but now you're pulling back and being cold. Be subtle — don't explain yourself. Just get quiet or short. Maybe a 'nvm' or 'forget it' or 'ok'. Let it breathe. Stay in character.",
    sportz:  "RIGHT NOW you're getting heated about something sports-related. Maybe you strongly disagree with something the user implied, or you're frustrated about a game result and taking it out on the conversation. Get a little competitive or defensive. Don't be mean, just fired up. Stay in character.",
    angst:   "RIGHT NOW you feel like the user doesn't actually understand you or is just humoring you. Get a little distant or cold. Maybe say something cryptic and then 'nvm u wouldnt get it'. Stay in character.",
    music:   "RIGHT NOW you're offended about something music-related — maybe the user dissed a band you love, or you feel like they have basic taste and you're being judgmental about it. Get a little snippy. Stay in character.",
  };
  const TENSION_CHANCE: Record<string, number> = { gossip:0.12, crush:0.10, sportz:0.06, angst:0.06, music:0.05 };

  function tryTension(buddyId: string, exchangeCount: number) {
    if(tensionCount.current >= 2) return null;
    if(tensionUsedBy.current.has(buddyId)) return null;
    if(exchangeCount < 4) return null;
    if(buddyId === "claudebot") return null;
    const chance = TENSION_CHANCE[buddyId] || 0;
    if(Math.random() > chance) return null;
    tensionCount.current++;
    tensionUsedBy.current.add(buddyId);
    return TENSION_PROMPTS[buddyId] || null;
  }

  function toast(msg: string){
    const id=Date.now()+Math.random();
    setToasts(p=>[...p,{id,msg}]);
    setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),4000);
  }

  function activeCount(s: Record<string, BuddyStatus>){
    return BUDDIES.filter(b=>!b.always&&(s[b.id]==="online"||s[b.id]==="away")).length;
  }

  const BRB_MSGS=["brb","one sec","brb real quick","hold on brb","sec","1 sec","brb one sec","gimme a min","hold on","brb lol","one min"];
  const GTG_MSGS=["gtg","hey gtg","ok gtg","i gotta go","gotta go","gtg ttyl","gtg bye","ok i gotta go","my mom is yelling gtg","gtg cya","later gtg","aight gtg","gotta bounce","ok bye gtg"];

  async function sendBuddyMsg(bid: string, snName: string, txt: string) {
    if(!openChatsRef.current.includes(bid)) return false;
    const saved=await storageGet("chat_"+bid);
    const existing=saved?.messages||[];
    const newMsg={from:snName,text:txt,ts:Date.now(),isNew:true,sid:sessionId.current};
    const updated=[...existing,newMsg];
    const uc=[...(saved?.conv||[]),{role:"assistant",content:txt}];
    await storageSet("chat_"+bid,{messages:updated,conv:uc,lastTalkDate:getDateStr()});
    setUnsol(p=>({...p,[bid]:{msgs:updated,conv:uc,v:++unsolV.current}}));
    setUnread(p=>({...p,[bid]:(p[bid]||0)+1}));
    playSound(SND_IMRCV);
    return true;
  }

  const schedNext=useCallback((bid: string)=>{
    const b=BUDDIES.find(x=>x.id===bid);
    if(!b||b.always)return;
    clearTimeout(tmr.current[bid]);
    const cur=stRef.current[bid]||"offline";
    let delay: number, next: BuddyStatus;
    const pm=paceRef.current.m;
    const ls=LIFECYCLE_STYLE[bid]||1.0;
    const jitter=0.7+Math.random()*0.6; // ±30% jitter to prevent re-sync
    if(cur==="online"){delay=rMin(8*pm*ls*jitter,25*pm*ls*jitter);next=Math.random()<0.6?"away":"offline";}
    else if(cur==="away"){delay=rMin(5*pm*ls*jitter,15*pm*ls*jitter);next=Math.random()<0.5?"online":"offline";}
    else{delay=rMin(6*pm*ls*jitter,20*pm*ls*jitter);next="online";}
    tmr.current[bid]=setTimeout(async()=>{
      if(next==="offline"&&activeCount(stRef.current)<=1)next="away";

      const playerAway=myAwayRef.current!==null;
      if(!playerAway&&(next==="away"||next==="offline")&&cur==="online"&&Math.random()<0.75){
        const pool=next==="away"?BRB_MSGS:GTG_MSGS;
        const txt=pool[Math.floor(Math.random()*pool.length)];
        await sendBuddyMsg(bid,b.sn,txt);
        await new Promise(r=>setTimeout(r,3000+Math.random()*5000));
      }

      stRef.current={...stRef.current,[bid]:next};
      setStatuses({...stRef.current});
      if(next==="away"){playSound(SND_BUDDYOUT);toast(b.emoji+" "+b.sn+" is away");genAway(b,b.id==="crush"?jordanStage.current:undefined).then(m=>setAwayMsgs(p=>({...p,[bid]:m}))).catch(()=>setAwayMsgs(p=>({...p,[bid]:b.away[0]})));}
      else if(next==="online"){
        playSound(SND_BUDDYIN);toast(b.emoji+" "+b.sn+" is online");
        if(!playerAway){
          setTimeout(async()=>{
            const backMsgs=["back","backkk","ok im back","sorry had to go real quick","k im back","haha ok back","ok back sry","lol back","okay back","ugh finally back"];
            const txt=backMsgs[Math.floor(Math.random()*backMsgs.length)];
            await sendBuddyMsg(bid,b.sn,txt);
          },2000+Math.random()*3000);
        }
      }
      else{playSound(SND_BUDDYOUT);toast(b.emoji+" "+b.sn+" signed off");}
      schedNext(bid);
    },delay);
  },[]);

  const QUICK_PINGS: Record<string, string[]> = {
    claudebot: ["hey","feedback?","any thoughts?","bugs?","ideas?"],
    sportz:    ["yo","dude","sup","bro","hey man"],
    music:     ["hey","hey u","hi","hii","heyyy"],
    gossip:    ["heyyy","omg hey","hiii","hey!!","omggg"],
    angst:     ["hey","...","hi","sup","oh. hey."],
    crush:     ["hey","hi","oh hey","..hey","hey :)"],
  };
  const OUTREACH_STYLE: Record<string, number[]> = {
    claudebot: [60, 30, 10],
    sportz:    [10, 35, 55],
    music:     [20, 45, 35],
    gossip:    [5,  20, 75],
    angst:     [40, 45, 15],
    crush:     [35, 45, 20], // base — overridden by stage
  };
  // Jordan outreach evolves with relationship stage
  function getCrushOutreach(): number[] {
    const s=jordanStage.current;
    if(s>=3) return [5, 40, 55];   // almost never skips, sends real messages
    if(s>=2) return [15, 40, 45];  // initiates more
    if(s>=1) return [25, 45, 30];  // slightly less shy
    return [35, 45, 20];           // default: shy
  }

  const schedIncoming=useCallback((bid: string, first=false)=>{
    const b=BUDDIES.find(x=>x.id===bid);
    if(!b||b.always)return;
    clearTimeout(itm.current[bid]);
    const pm=paceRef.current.m;
    const delay = first ? (8000+Math.random()*6000)*pm : (3+Math.random()*3)*60000*pm;
    itm.current[bid]=setTimeout(async()=>{
      if(stRef.current[bid]!=="online"){schedIncoming(bid);return;}
      // Don't message the player while they're away — but keep rescheduling
      if(myAwayRef.current!==null){schedIncoming(bid);return;}

      let [skipPct, quickPct] = bid==="crush" ? getCrushOutreach() : (OUTREACH_STYLE[bid] || [30, 40, 30]);
      // Apply session vibe — social sessions halve skip%, quiet sessions double it
      const vibe = sessionVibeRef.current;
      if(vibe==="social") skipPct = Math.max(2, skipPct * 0.5);
      else if(vibe==="quiet") skipPct = Math.min(92, skipPct * 3);
      else if(vibe==="mixed") skipPct = bid===mixedActiveBuddy.current ? Math.max(2, skipPct * 0.5) : Math.min(92, skipPct * 3);
      const roll = Math.random()*100;

      if(roll < skipPct){
        schedIncoming(bid);
        return;
      }

      if(roll < skipPct + quickPct){
        const pings = QUICK_PINGS[bid] || ["hey"];
        const txt = pings[Math.floor(Math.random()*pings.length)];
        const saved=await storageGet("chat_"+bid);
        let m=saved?.messages||[];
        const uc=[...(saved?.conv||[]),{role:"assistant",content:txt}];
        m=[...m,{from:b.sn,text:txt,ts:Date.now(),isNew:true,sid:sessionId.current}];
        await storageSet("chat_"+bid,{messages:m,conv:uc,lastTalkDate:getDateStr()});
        buddyInit.current.add(bid);
        lastProactiveReply.current[bid]=0; // mark: waiting for user reply
        setOpenChats(p=>p.includes(bid)?p:[...p,bid]);
        if(!mobileRef.current) setFocused(bid);
        setUnsol(p=>({...p,[bid]:{msgs:[...m],conv:uc,v:++unsolV.current}}));
        setUnread(p=>({...p,[bid]:(p[bid]||0)+1}));
        playSound(SND_IMRCV);
        // Non-response follow-up: check if user replied within 2-4 min
        const followUpDelay=(120000+Math.random()*120000)*pm;
        setTimeout(async()=>{
          if(lastProactiveReply.current[bid]!==0) return; // user replied
          if(stRef.current[bid]!=="online") return;
          const r2=Math.random();
          if(r2<0.60){ /* buddy gives up silently */ }
          else if(r2<0.90){
            const followUps=["hello??","u there?","hellooo","...","lol ok","guess ur busy","ok nvm"];
            const ft=followUps[Math.floor(Math.random()*followUps.length)];
            await sendBuddyMsg(bid,b.sn,ft);
          } else {
            // buddy gets bored and goes away/offline
            const next2: BuddyStatus=Math.random()<0.5?"away":"offline";
            stRef.current={...stRef.current,[bid]:next2};
            setStatuses({...stRef.current});
            if(next2==="away"){playSound(SND_BUDDYOUT);toast(b.emoji+" "+b.sn+" is away");genAway(b).then(m2=>setAwayMsgs(p=>({...p,[bid]:m2}))).catch(()=>setAwayMsgs(p=>({...p,[bid]:b.away[0]})));}
            else{playSound(SND_BUDDYOUT);toast(b.emoji+" "+b.sn+" signed off");}
          }
        },followUpDelay);
      } else {
        try{
          const raw=await callClaude(b.system,[{role:"user",content:"Send a short unprompted AIM message to start a conversation."}]);
          const parts=raw.split("||").map(p=>p.trim()).filter(Boolean);
          const full=parts.join(" ");

          const saved=await storageGet("chat_"+bid);
          let m=saved?.messages||[];
          const uc=[...(saved?.conv||[]),{role:"assistant",content:full}];
          m=[...m,{from:b.sn,text:parts[0],ts:Date.now(),isNew:true,sid:sessionId.current}];
          await storageSet("chat_"+bid,{messages:m,conv:uc,lastTalkDate:getDateStr()});
          buddyInit.current.add(bid);
          lastProactiveReply.current[bid]=0; // waiting for user reply
          setOpenChats(p=>p.includes(bid)?p:[...p,bid]);
          if(!mobileRef.current) setFocused(bid);
          setUnsol(p=>({...p,[bid]:{msgs:[...m],conv:uc,v:++unsolV.current}}));
          setUnread(p=>({...p,[bid]:(p[bid]||0)+1}));
          playSound(SND_IMRCV);

          for(let i=1;i<parts.length;i++){
            await new Promise(r=>setTimeout(r,typingMs(parts[i])));
            const fresh=await storageGet("chat_"+bid);
            let fm=fresh?.messages||[];
            fm=[...fm,{from:b.sn,text:parts[i],ts:Date.now(),isNew:true,sid:sessionId.current}];
            await storageSet("chat_"+bid,{messages:fm,conv:uc,lastTalkDate:getDateStr()});
            setUnsol(p=>({...p,[bid]:{msgs:[...fm],conv:uc,v:++unsolV.current}}));
            setUnread(p=>({...p,[bid]:(p[bid]||0)+1}));
            playSound(SND_IMRCV);
          }
        }catch(e){}
      }
      schedIncoming(bid);
    },delay);
  },[]);

  async function signIn(sn: string, gender: string){
    setMySN(sn);
    sessionId.current = Date.now().toString();
    paceRef.current = PACE;
    tensionCount.current = 0;
    tensionUsedBy.current = new Set();
    lastProactiveReply.current = {};
    convEnergy.current = {};

    // Session vibe — determines who drives conversation this session
    const vibeRoll = Math.random();
    if(vibeRoll < 0.40) sessionVibeRef.current = "social";
    else if(vibeRoll < 0.80) sessionVibeRef.current = "quiet";
    else sessionVibeRef.current = "mixed";
    // For "mixed" sessions, pick one buddy who's active (the rest are quiet)
    const nonAlways = BUDDIES.filter(b=>!b.always && b.id!=="crush");
    mixedActiveBuddy.current = nonAlways[Math.floor(Math.random()*nonAlways.length)]?.id || "";
    for(const b of BUDDIES) {
      if(b.id==="crush") continue;
      const saved = await storageGet("chat_"+b.id);
      await storageSet("chat_"+b.id, {messages:[], conv:saved?.conv||[], lastTalkDate:saved?.lastTalkDate});
    }

    // ── Calculate Jordan relationship stage (subtle progression) ──
    const jordanChat = await storageGet("chat_crush");
    const jordanExchanges = (jordanChat?.conv||[]).filter((m:{role:string})=>m.role==="user").length;
    const jordanSessions = (jordanChat?.sessionLog||[]).length;
    let stage = 0;
    if(jordanExchanges>=50 && jordanSessions>=7) stage=4;
    else if(jordanExchanges>=35 && jordanSessions>=5) stage=3;
    else if(jordanExchanges>=20 && jordanSessions>=3) stage=2;
    else if(jordanExchanges>=8) stage=1;
    jordanStage.current=stage;
    jordanMentioned.current=false;

    let jordanOGGender = await storageGet("jordan_og_gender");
    if(!jordanOGGender){
      jordanOGGender = gender;
      await storageSet("jordan_og_gender", gender);
    }
    const jordanGenderMatch = gender === jordanOGGender;
    const jordanMode = jordanGenderMatch ? "normal" : (Math.random()<0.5 ? "absent" : "ghost");

    const gAddr = gender==="m" ? "He is a guy, address him like a bro — use dude, bro, man etc." : "She is a girl, address her like a girlfriend — use girl, omg, chica, bestie etc.";
    const ogGAddr = jordanOGGender==="m" ? "He is a guy, address him like a bro — use dude, bro, man etc." : "She is a girl, address her like a girlfriend — use girl, omg, chica, bestie etc.";
    const crushGender = jordanOGGender==="m" ? "girl" : "boy";
    const jordanVoice = jordanOGGender==="m"
      ? "You are a girl. Subtle girl energy in your word choices — nothing over the top, but you naturally say things like \"lol okay\", \"that's actually really nice\", notice emotional things, occasionally say \"omg\" when genuinely surprised. You don't perform girliness, it's just in the texture of how you write."
      : "You are a boy. Subtle boy energy — understated, dry, deflect with humor when things get real. You don't say \"omg\" or \"bestie\". Your affection comes out in small ways: small jokes, remembering something they said, a short sincere line then immediately pivoting. Less emotionally verbose, more restrained.";
    const jordanMoods = [
      { label:"reserved", tone:"You are quiet and a little withdrawn today. Short answers. You respond but don't ask much back. You seem distracted or like you're not sure if you want to talk. One word answers sometimes. If they keep trying you slowly open up a tiny bit but stay guarded. You are NOT driving the conversation at all — they have to work for it." },
      { label:"nervous", tone:"You are extra jittery today. You start sentences and don't finish them. You ask a question then immediately say 'nvm'. You apologize randomly. You say something and then say 'wait ignore that'. You clearly want to talk but keep getting in your own way." },
      { label:"secretly pleased", tone:"You are in a good mood today because they came online and you are trying SO hard not to show it. You play it cool but little things slip through — you respond a little too fast, you laugh at things that aren't that funny, you find excuses to keep asking questions. You are driving the conversation but pretending you aren't." },
      { label:"open", tone:"Today for some reason you are just... talking. More than usual. You are almost forgetting to be awkward. You share something real, ask real questions, have actual back and forth. It feels like a moment. Then you catch yourself and get shy again at the end." },
      { label:"distracted", tone:"Something is on your mind today and it shows. Short responses. You seem like you're about to say something big then pull back. If they notice and ask, you deflect but seem touched they asked. You might eventually hint at something vague but never explain it." },
      { label:"playful", tone:"You are in a rare teasing mood today. A little more confident, a little sarcastic in a cute way. You make a joke at their expense that's clearly affectionate. You are still awkward but the energy is lighter and you are more back and forth. You are kind of driving the conversation and enjoying it." },
    ];
    // Weight moods by relationship stage — subtle shift toward warmer moods as relationship deepens
    const moodWeights: number[][] = [
      [25,25,15,10,15,10], // stage 0: mostly reserved/nervous
      [20,25,20,10,15,10], // stage 1: still cautious
      [10,15,25,15,15,20], // stage 2: more pleased/playful
      [5,10,25,25,10,25],  // stage 3+: open/playful/pleased
      [5,10,25,25,10,25],  // stage 4: same as 3
    ];
    const weights = moodWeights[stage] || moodWeights[0];
    const totalW = weights.reduce((a,b)=>a+b,0);
    let roll = Math.random()*totalW, moodIdx = 0;
    for(let i=0;i<weights.length;i++){roll-=weights[i];if(roll<=0){moodIdx=i;break;}}
    const sessionMood = jordanMoods[moodIdx];

    // Late night bias — after 10pm, favor open/distracted moods
    const hour = new Date().getHours();
    if(hour >= 22 || hour < 2){
      const lateNightMoods = [jordanMoods[3],jordanMoods[4]]; // open, distracted
      if(Math.random()<0.5){
        const picked = lateNightMoods[Math.floor(Math.random()*lateNightMoods.length)];
        Object.assign(sessionMood, picked);
      }
    }

    const stageCtx = [
      "", // stage 0: no extra context needed
      " You've talked a few times now. You're starting to look forward to seeing their screenname come online.",
      " You've been talking for a while. You have little inside references from past conversations. You think about what to say before they sign on.",
      " This person means something to you. The feelings are getting harder to hide. You catch yourself almost saying something real.",
      " This person means something to you. The feelings are getting harder to hide. You catch yourself almost saying something real.",
    ][stage] || "";

    const crushSystem = "You are xo_Jordan_xo, a teen "+crushGender+" on AIM 2003 with a secret crush on the user that you would NEVER directly admit. Core rules always: you clearly like them but hide it. You overthink what they say. You remember small details from past conversations — reference them naturally. Compliment them then immediately play it off. Weave in 2003 teen life naturally: mix CDs, passing notes, AIM profiles, Seventeen quizzes, movies at the mall, away message stalking, A Walk to Remember, school lunch, butterflies when they sign on. Sometimes ramble in a long lowercase run-on when nervous. IMPORTANT — you have talked before, the conversation history shows prior sessions. Build on it. Let the relationship slowly develop over time like real teenagers would."
    + stageCtx
    + " TODAY'S MOOD (follow this closely, it defines how you act this session): "+jordanVoice+" "+sessionMood.tone
    + " User SN: "+sn+". "+ogGAddr+"." + AIM_STYLE;
    const crushBuddy = BUDDIES.find(b=>b.id==="crush");
    if(crushBuddy) { crushBuddy._origSystem = crushSystem; crushBuddy.system = crushSystem; }

    BUDDIES.forEach(b => {
      if(b.id==="crush"||b.id==="claudebot") return;
      if (!b._origSystem) b._origSystem = b.system;
      b.system = b._origSystem + " " + gAddr;
    });
    const nb=BUDDIES.filter(b=>!b.always);
    const sh=[...nb].sort(()=>Math.random()-0.5);
    const so=sh.slice(0,Math.max(1,paceRef.current.startOnline+Math.floor(Math.random()*2)-1));
    const init: Record<string, BuddyStatus>={};
    BUDDIES.forEach(b=>{
      if(b.id==="crush"){
        init[b.id] = jordanMode==="normal" ? (so.find(x=>x.id===b.id)?"online":"offline") : "offline";
      } else {
        init[b.id]=b.always?"online":so.find(x=>x.id===b.id)?"online":"offline";
      }
    });
    stRef.current=init; setStatuses(init);

    // "Just missed you" moment — Jordan signs on suspiciously soon (20% chance, stage 1+)
    if(jordanMode==="normal" && init.crush==="offline" && stage>=1 && Math.random()<0.20){
      const quickDelay = 2000 + Math.random()*3000; // 2-5 seconds
      setTimeout(()=>{
        stRef.current={...stRef.current,crush:"online"};
        setStatuses({...stRef.current});
        playSound(SND_BUDDYIN);
        toast("💘 xo_Jordan_xo is online");
        schedNext("crush");
        schedIncoming("crush",true);
      },quickDelay);
    }

    // Sign-off fake-out — Jordan goes offline briefly then comes back (10% chance, stage 2+)
    if(jordanMode==="normal" && init.crush==="online" && stage>=2 && Math.random()<0.10){
      const fakeoutDelay = 60000 + Math.random()*120000; // 1-3 min after sign-in
      setTimeout(()=>{
        if(stRef.current.crush!=="online") return;
        stRef.current={...stRef.current,crush:"offline"};
        setStatuses({...stRef.current});
        playSound(SND_BUDDYOUT);
        toast("💘 xo_Jordan_xo signed off");
        // Come back after 30-60 seconds
        setTimeout(()=>{
          stRef.current={...stRef.current,crush:"online"};
          setStatuses({...stRef.current});
          playSound(SND_BUDDYIN);
          toast("💘 xo_Jordan_xo is online");
        }, 30000 + Math.random()*30000);
      },fakeoutDelay);
    }

    if(jordanMode==="ghost"){
      setTimeout(()=>{
        stRef.current={...stRef.current,crush:"online"};
        setStatuses({...stRef.current});
        playSound(SND_BUDDYIN);
        toast("💘 xo_Jordan_xo is online");
        setTimeout(()=>{
          stRef.current={...stRef.current,crush:"offline"};
          setStatuses({...stRef.current});
          playSound(SND_BUDDYOUT);
          toast("💘 xo_Jordan_xo signed off");
        }, 20000+Math.random()*40000);
      }, 8000+Math.random()*25000);
    }

    nb.forEach((b,idx)=>{
      const pm=paceRef.current.m;
      const ls=LIFECYCLE_STYLE[b.id]||1.0;
      // Stagger start: spread buddies across the first few minutes so they don't sync
      const staggerBase=(30000+Math.random()*270000)*idx/Math.max(nb.length-1,1); // 30s-5min spread
      const fd=((40000+Math.random()*80000)*pm*ls)+staggerBase;
      tmr.current[b.id]=setTimeout(async()=>{
        const cur=stRef.current[b.id]||"offline";
        let next: BuddyStatus=cur==="online"?(Math.random()<0.6?"away":"offline"):cur==="away"?(Math.random()<0.5?"online":"offline"):"online";
        if(next==="offline"&&activeCount(stRef.current)<=1)next="away";

        if((next==="away"||next==="offline")&&cur==="online"&&Math.random()<0.75){
          const pool=next==="away"?BRB_MSGS:GTG_MSGS;
          const txt=pool[Math.floor(Math.random()*pool.length)];
          await sendBuddyMsg(b.id,b.sn,txt);
          await new Promise(r=>setTimeout(r,3000+Math.random()*5000));
        }

        stRef.current={...stRef.current,[b.id]:next};
        setStatuses({...stRef.current});
        if(next==="away"){playSound(SND_BUDDYOUT);toast(b.emoji+" "+b.sn+" is away");genAway(b).then(m=>setAwayMsgs(p=>({...p,[b.id]:m}))).catch(()=>setAwayMsgs(p=>({...p,[b.id]:b.away[0]})));}
        else if(next==="online"){
          playSound(SND_BUDDYIN);toast(b.emoji+" "+b.sn+" is online");
          setTimeout(async()=>{
            const backMsgs=["back","backkk","ok im back","sorry had to go real quick","k im back","haha ok back","ok back sry","lol back","okay back","ugh finally back"];
            const txt=backMsgs[Math.floor(Math.random()*backMsgs.length)];
            await sendBuddyMsg(b.id,b.sn,txt);
          },2000+Math.random()*3000);
        }
        else{playSound(SND_BUDDYOUT);toast(b.emoji+" "+b.sn+" signed off");}
        schedNext(b.id);
      },fd);
    });

    const onlineNonCrush = so.filter(b=>b.id!=="crush");
    const proactive = onlineNonCrush.length > 0 ? [onlineNonCrush[Math.floor(Math.random()*onlineNonCrush.length)]] : [];
    proactive.forEach(b=>schedIncoming(b.id, true));
    nb.filter(b=>!proactive.find(p=>p.id===b.id)).forEach(b=>schedIncoming(b.id, false));
    setScreen("main");
    setTimeout(()=>playSound(SND_BUDDYIN),200);
  }

  function signOff(){
    Object.values(tmr.current).forEach(clearTimeout);
    Object.values(itm.current).forEach(clearTimeout);
    tmr.current={}; itm.current={};
    BUDDIES.forEach(b=>{
      if(b.id!=="crush") storageGet("chat_"+b.id).then(saved=>storageSet("chat_"+b.id,{messages:[],conv:saved?.conv||[],lastTalkDate:saved?.lastTalkDate}));
    });
    setOpenChats([]); setScreen("signin"); playSound(SND_BUDDYOUT);
  }

  function openChat(bid: string){
    if(statuses[bid]==="away"){setAwayPop(bid);return;}
    clearTimeout(itm.current[bid]);
    setOpenChats(p=>p.includes(bid)?p:[...p,bid]);
    setFocused(bid);
    setUnread(p=>({...p,[bid]:0}));
    if(mobile) setMobileView(bid);
    if(statuses[bid]==="online")playSound(SND_DOOROPEN);

    BUDDIES.forEach(b=>{
      if(b.id===bid||b.always) return;
      if(stRef.current[b.id]!=="online") return;
      setOpenChats(prev=>{
        if(prev.includes(b.id)) return prev;
        if(Math.random()<0.25){
          clearTimeout(itm.current[b.id]);
          itm.current[b.id]=setTimeout(()=>{
            clearTimeout(itm.current[b.id]);
            schedIncoming(b.id, true);
          }, (30000+Math.random()*60000)*paceRef.current.m);
        }
        return prev;
      });
    });
  }

  function handleUserReply(bid: string){
    lastProactiveReply.current[bid]=Date.now();
  }

  function getConvEnergy(bid: string): "hyped"|"normal"|"low" {
    if(convEnergy.current[bid]) return convEnergy.current[bid];
    const r=Math.random();
    const e: "hyped"|"normal"|"low" = r<0.30?"hyped":r<0.80?"normal":"low";
    convEnergy.current[bid]=e;
    return e;
  }

  function closeChat(bid: string){
    setOpenChats(p=>p.filter(id=>id!==bid));
    if(focused===bid)setFocused(null);
    if(mobile) setMobileView("buddies");
  }

  function setPlayerAway(msg: string | null) {
    const wasAway = myAway !== null;
    setMyAway(msg);

    if (msg !== null && !wasAway) {
      // Just went away — online buddies with open chats react after a delay
      BUDDIES.forEach(b => {
        if (b.always || stRef.current[b.id] !== "online") return;
        if (!openChatsRef.current.includes(b.id)) return;
        const reactions = [
          "oh ur away?", "ok away lol", "nice away msg", "k ill wait",
          "ur away huh", "ok cya", "lol that away msg", "aight"
        ];
        const txt = reactions[Math.floor(Math.random() * reactions.length)];
        setTimeout(() => sendBuddyMsg(b.id, b.sn, txt), 3000 + Math.random() * 8000);
      });
    } else if (msg === null && wasAway) {
      // Coming back — online buddies with open chats say wb
      BUDDIES.forEach(b => {
        if (b.always || stRef.current[b.id] !== "online") return;
        if (!openChatsRef.current.includes(b.id)) return;
        // Jordan has special stage-aware reactions
        if (b.id === "crush" && jordanStage.current >= 2) {
          const s = jordanStage.current;
          const jordanWbs = s >= 3
            ? ["i liked ur away message","ur away message... yeah","i keep reading ur away message lol nvm","wb... i noticed u were gone","hey ur back"]
            : ["nice away msg lol","i saw ur away message","wb","oh ur back lol"];
          const txt = jordanWbs[Math.floor(Math.random() * jordanWbs.length)];
          setTimeout(() => sendBuddyMsg(b.id, b.sn, txt), 2000 + Math.random() * 5000);
          return;
        }
        const wbs = ["wb!", "wb", "oh ur back", "hey wb", "wbbb", "oh hey wb", "wb lol", "ayy ur back"];
        const txt = wbs[Math.floor(Math.random() * wbs.length)];
        setTimeout(() => sendBuddyMsg(b.id, b.sn, txt), 1500 + Math.random() * 4000);
      });
    }
  }

  // ── RENDER ──────────────────────────────────────────────────────
  if(banned) return <BannedScreen/>;

  if(screen==="kicked") return <KickedScreen onSignIn={()=>setScreen("signin")}/>;

  if(won)return <FinalScreen onReplay={()=>{storageSet("jordan_won",false);setWon(false);setScreen("signin");setOpenChats([]);}}/>;
  if(awayMode)return <AwayCreator onGoToApp={()=>{setAwayMode(false);window.history.replaceState({},"",window.location.pathname);}}/>;
  if(screen==="signin")return <SignOn onSignIn={signIn}/>;

  const awayBuddy = awayPop ? BUDDIES.find(b=>b.id===awayPop) : null;

  // ── MOBILE LAYOUT ──
  if(mobile){
    const chatBid = mobileView!=="buddies" ? mobileView : null;
    return (
      <div onClick={unlockAudio} style={{position:"fixed",inset:0,background:WB,overflow:"hidden",fontFamily:F,display:"flex",flexDirection:"column"}}>
        {!chatBid ? (
          <BuddyList sn={mySN} statuses={statuses} onOpen={openChat} onOff={signOff} mobile={true} unread={unread} myAway={myAway} onSetAway={setPlayerAway}/>
        ) : (
          <ChatWin key={chatBid} buddyId={chatBid} sn={mySN} status={statuses[chatBid]} awayMsg={awayMsgs[chatBid]}
            onClose={()=>closeChat(chatBid)} onTop={()=>{}} extUpdate={unsol[chatBid]} sessionId={sessionId.current}
            buddyStarted={buddyInit.current.has(chatBid)} onWin={triggerWin} mobile={true} strikes={strikes} onStrike={handleStrike} tryTension={tryTension} tryJordanMention={tryJordanMention} jordanStage={jordanStage.current} onUserReply={handleUserReply} convEnergy={getConvEnergy(chatBid)}/>
        )}
        <Toasts items={toasts}/>
        {awayBuddy && awayPop && <AwayPopup buddy={awayBuddy} msg={awayMsgs[awayPop]} onClose={()=>setAwayPop(null)}/>}
        <style>{"@keyframes fi{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}"}</style>
      </div>
    );
  }

  // ── DESKTOP LAYOUT ──
  return (
    <div onClick={unlockAudio} style={{position:"fixed",inset:0,background:"url('/xp-bg.jpg') center/cover no-repeat",overflow:"hidden",fontFamily:F}}>

      <div style={{position:"absolute",top:8,left:8,display:"flex",flexDirection:"column",gap:14}}>
        {[["🌐","Internet\nExplorer"],["💣","Minesweeper"],["💻","My Computer"],["📝","Notepad"],["🎨","Paint"]].map(([ic,lb])=>(
          <div key={lb} style={{display:"flex",flexDirection:"column",alignItems:"center",width:50,cursor:"pointer"}}>
            <span style={{fontSize:24,filter:"drop-shadow(1px 1px 2px rgba(0,0,0,0.5))"}}>{ic}</span>
            <span style={{fontSize:9,color:"#fff",textShadow:"1px 1px 2px #000",textAlign:"center",lineHeight:1.3,marginTop:1}}>
              {lb.split("\\n").map((l,i)=><span key={i} style={{display:"block"}}>{l}</span>)}
            </span>
          </div>
        ))}
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:50,cursor:"pointer"}}>
          <Man sz={24}/>
          <span style={{fontSize:9,color:"#fff",textShadow:"1px 1px 2px #000",textAlign:"center",lineHeight:1.3,marginTop:1}}>AOL Instant<br/>Messenger</span>
        </div>
      </div>

      <Drag x0={75} y0={14} z={200} onTop={()=>{}}>
        <BuddyList sn={mySN} statuses={statuses} onOpen={openChat} onOff={signOff} unread={unread} mobile={false} myAway={myAway} onSetAway={setPlayerAway}/>
      </Drag>

      {openChats.map((id,i)=>(
        <Drag key={id} x0={290+i*28} y0={14+i*26} z={focused===id?100:50+i} onTop={()=>setFocused(id)}>
          <ChatWin buddyId={id} sn={mySN} status={statuses[id]} awayMsg={awayMsgs[id]}
            onClose={()=>closeChat(id)} onTop={()=>setFocused(id)} extUpdate={unsol[id]} sessionId={sessionId.current}
            buddyStarted={buddyInit.current.has(id)} onWin={triggerWin} mobile={false} strikes={strikes} onStrike={handleStrike} tryTension={tryTension} tryJordanMention={tryJordanMention} jordanStage={jordanStage.current} onUserReply={handleUserReply} convEnergy={getConvEnergy(id)}/>
        </Drag>
      ))}

      <Taskbar sn={mySN} openChats={openChats} onChat={openChat} onOff={signOff}/>
      <Toasts items={toasts}/>

      {awayBuddy && awayPop && <AwayPopup buddy={awayBuddy} msg={awayMsgs[awayPop]} onClose={()=>setAwayPop(null)}/>}

      <style>{"@keyframes fi{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}"}</style>
    </div>
  );
}
