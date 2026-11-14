'use client';
import {useEffect,useRef,useState} from 'react';
import {Music2,Volume2,VolumeX} from 'lucide-react';
const preferenceKey='szg-background-music';
export default function BackgroundMusic(){
 const audio=useRef<HTMLAudioElement>(null),desired=useRef(true),waiting=useRef(false);
 const [enabled,setEnabled]=useState(true),[playing,setPlaying]=useState(false),[blocked,setBlocked]=useState(false),[volume,setVolume]=useState(.3),[error,setError]=useState(false);
 function save(on:boolean,level:number){try{localStorage.setItem(preferenceKey,JSON.stringify({enabled:on,volume:level}))}catch{}}
 async function start(){
  if(!audio.current||!desired.current)return;
  try{await audio.current.play();waiting.current=false;setBlocked(false);setError(false);if(!desired.current)audio.current.pause()}
  catch(e){if(!desired.current)return;if(e instanceof DOMException&&e.name==='NotAllowedError'){waiting.current=true;setBlocked(true)}else if(!(e instanceof DOMException&&e.name==='AbortError'))setError(true)}
 }
 useEffect(()=>{
  let on=true,level=.3;
  try{const old=JSON.parse(localStorage.getItem(preferenceKey)||'null');if(typeof old?.enabled==='boolean')on=old.enabled;if(typeof old?.volume==='number'&&Number.isFinite(old.volume))level=Math.min(1,Math.max(0,old.volume))}catch{}
  desired.current=on;setEnabled(on);setVolume(level);if(audio.current)audio.current.volume=level;if(on)void start();
  const unlock=(e:Event)=>{if(e.target instanceof Element&&e.target.closest('[data-bgm-controls]'))return;if(desired.current&&waiting.current)void start()};
  document.addEventListener('pointerdown',unlock);document.addEventListener('keydown',unlock);
  return()=>{document.removeEventListener('pointerdown',unlock);document.removeEventListener('keydown',unlock);audio.current?.pause()};
 },[]);
 function choose(on:boolean){desired.current=on;setEnabled(on);save(on,volume);if(on)void start();else{waiting.current=false;setBlocked(false);audio.current?.pause()}}
 function changeVolume(level:number){setVolume(level);if(audio.current)audio.current.volume=level;save(desired.current,level)}
 const status=error?'音樂載入失敗，請重試':!enabled?'音樂已關閉':blocked?'點擊網站即可播放':playing?'循環播放中':'準備播放';
 return <aside className="bgm-player" aria-label="背景音樂" data-bgm-controls>
  <audio ref={audio} src={import.meta.env.BASE_URL+'audio/maple-island.mp3'} loop preload="auto" onPlaying={()=>{setPlaying(true);setError(false);waiting.current=false;setBlocked(false)}} onPause={()=>setPlaying(false)} onError={()=>setError(true)}/>
  <div className="bgm-track"><Music2 size={16}/><span><strong>楓之島</strong><small role="status">{status}</small></span></div>
  <div className="bgm-buttons"><button type="button" aria-pressed={enabled} className={enabled?'selected':''} onClick={()=>choose(true)} aria-label="播放背景音樂"><Volume2 size={14}/>播放</button><button type="button" aria-pressed={!enabled} className={!enabled?'selected':''} onClick={()=>choose(false)} aria-label="關閉背景音樂"><VolumeX size={14}/>關閉</button></div>
  <label className="bgm-volume"><span>音量</span><input type="range" aria-label="背景音樂音量" min="0" max="1" step="0.01" value={volume} onChange={e=>changeVolume(Number(e.target.value))}/></label>
 </aside>;
}
