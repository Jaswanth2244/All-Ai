import { useState, useEffect, useRef, useCallback } from "react";

/* ─── LOAD THREE.JS ──────────────────────────────────────────────── */
function loadThree() {
  return new Promise((resolve) => {
    if (window.THREE) { resolve(window.THREE); return; }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
    s.onload = () => resolve(window.THREE);
    document.head.appendChild(s);
  });
}

/* ─── GLOBAL STYLES ─────────────────────────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
:root{
  /* Light Theme (Default) */
  --bg:#f2f4f7;--bg2:#ffffff;
  --s1:#ffffff;--s2:#eef0f2;
  --b1:#e2e4e8;--b2:#d1d5db;
  --gold:#d9a521;--gold2:#b88010;--rose:#e04565;
  --violet:#8b5cf6;--teal:#0d9488;--cyan:#0891b2;
  --white:#111827;--muted:#6b7280;--muted2:#374151;
  --fd:'Space Grotesk',sans-serif;--fb:'Outfit',sans-serif;--fm:'Space Mono',monospace;
  --nav-text:#e2e8f0;
}
[data-theme="dark"]{
  --bg:#080810;--bg2:#0d0d1a;
  --s1:rgba(255,255,255,0.04);--s2:rgba(255,255,255,0.07);
  --b1:rgba(255,255,255,0.08);--b2:rgba(255,255,255,0.14);
  --gold:#f5c842;--gold2:#e8a020;--rose:#ff6b8a;
  --violet:#a78bfa;--teal:#2dd4bf;--cyan:#22d3ee;
  --white:#f0eee8;--muted:#94a3b8;--muted2:#cbd5e1;
  --nav-text:#cbd5e1;
}
html{scroll-behavior:smooth;}
body{background:var(--bg);color:var(--white);font-family:var(--fb);overflow-x:hidden;cursor:none;}

/* CURSOR */
#cur{position:fixed;top:0;left:0;z-index:9999;pointer-events:none;mix-blend-mode:difference;}
#cur-d{position:absolute;width:7px;height:7px;background:var(--gold);border-radius:50%;transform:translate(-50%,-50%);}
#cur-r{position:absolute;width:34px;height:34px;border:1.5px solid rgba(245,200,66,.65);border-radius:50%;transform:translate(-50%,-50%);}

/* PAGE CANVAS BG */
#bg-canvas{position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;}
.grain{position:fixed;inset:0;z-index:1;pointer-events:none;opacity:.4;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E");
  background-size:160px;}

/* PAGE TRANSITIONS */
.pv{position:relative;z-index:10;min-height:100vh;transition:opacity .45s cubic-bezier(.22,1,.36,1),transform .45s cubic-bezier(.22,1,.36,1);}
.pv.in{opacity:1;transform:translateY(0);}
.pv.out{opacity:0;transform:translateY(18px);}

/* ═══════════════ SPLASH ═══════════════ */
.splash{display:flex;flex-direction:column;align-items:center;justify-content:center;
  min-height:100vh;text-align:center;padding:40px 24px;overflow:hidden;position:relative;
  background:radial-gradient(ellipse 90% 70% at 50% 35%,rgba(245,200,66,.055) 0%,transparent 70%);}

#robot-canvas{width:340px;height:340px;display:block;margin:0 auto;filter:drop-shadow(0 0 40px rgba(245,200,66,.35)) drop-shadow(0 0 80px rgba(34,211,238,.15));}

.splash-ey{font-family:var(--fm);font-size:1.1rem;letter-spacing:5px;color:var(--gold);text-transform:uppercase;margin-bottom:16px;opacity:0;animation:riseIn .8s .3s forwards;}
.splash-title{font-family:var(--fb);font-size:clamp(3.5rem,10vw,8.5rem);font-weight:800;line-height:1;letter-spacing:-0.02em;text-transform:uppercase;
  background:linear-gradient(140deg,var(--white) 0%,var(--gold) 40%,var(--rose) 100%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
  margin-bottom:18px;opacity:0;animation:riseIn .9s .55s forwards;}
.splash-sub{font-family:var(--fd);font-size:1.15rem;color:var(--muted2);font-weight:400;max-width:520px;line-height:1.6;margin-bottom:50px;opacity:0;animation:riseIn .9s .8s forwards;}
.splash-btn{font-family:var(--fd);font-size:.95rem;font-weight:700;letter-spacing:.5px;padding:16px 54px;
  background:linear-gradient(135deg,var(--gold2),var(--gold));border:none;color:#08080f;border-radius:100px;
  cursor:pointer;position:relative;overflow:hidden;box-shadow:0 4px 32px rgba(245,200,66,.38);
  transition:transform .25s,box-shadow .25s;opacity:0;animation:riseIn .9s 1.05s forwards;}
.splash-btn::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,transparent,rgba(255,255,255,.28),transparent);transform:translateX(-120%) skewX(-20deg);transition:transform .55s;}
.splash-btn:hover{transform:scale(1.06);box-shadow:0 8px 48px rgba(245,200,66,.55);}
.splash-btn:hover::before{transform:translateX(200%) skewX(-20deg);}


@keyframes riseIn{from{opacity:0;transform:translateY(22px);}to{opacity:1;transform:translateY(0);}}

/* ═══════════════ NAV ═══════════════ */
nav{position:fixed;top:0;left:0;right:0;z-index:200;display:flex;align-items:center;justify-content:space-between;
  padding:0 48px;height:64px;background:rgba(8,8,16,.86);backdrop-filter:blur(24px) saturate(180%);border-bottom:1px solid var(--b1);}
.nav-brand{display:flex;align-items:center;gap:10px;cursor:pointer;}
.nav-logo-svg{width:36px;height:36px;flex-shrink:0;filter:drop-shadow(0 0 6px rgba(245,200,66,0.5));}
.nav-wm{font-family:var(--fd);font-size:1.15rem;font-weight:800;color:var(--gold);letter-spacing:2px;}
.nav-links{display:flex;gap:4px;}
.nav-btn{font-family:var(--fd);font-size:.78rem;font-weight:600;padding:8px 18px;background:transparent;border:1px solid transparent;color:var(--nav-text);border-radius:100px;cursor:pointer;transition:all .25s;}
.nav-btn:hover{color:var(--white);background:var(--s2);border-color:var(--b2);}
.nav-btn.on{color:var(--gold);background:rgba(245,200,66,.08);border-color:rgba(245,200,66,.28);}

/* ═══════════════ HOME ═══════════════ */
.home{padding:96px 48px 80px;max-width:1440px;margin:0 auto;}
.home-tag{font-family:var(--fm);font-size:.7rem;color:var(--gold);letter-spacing:4px;text-transform:uppercase;margin-bottom:12px;}
.home-h1{font-family:var(--fd);font-size:clamp(2rem,4.5vw,3.2rem);font-weight:800;line-height:1.1;letter-spacing:-1px;margin-bottom:12px;}
.home-h1 em{font-style:normal;color:var(--gold);}
.home-desc{font-size:1rem;color:var(--muted2);font-weight:300;max-width:440px;line-height:1.75;margin-bottom:44px;}

.stats-row{display:flex;gap:44px;margin-bottom:48px;flex-wrap:wrap;}
.stat{border-left:2px solid var(--gold);padding-left:14px;}
.stat-n{font-family:var(--fd);font-size:1.9rem;font-weight:800;}
.stat-l{font-size:.72rem;color:var(--muted);letter-spacing:2px;text-transform:uppercase;}

/* SEARCH */
.sw{position:relative;max-width:600px;margin-bottom:44px;}
.sb{width:100%;padding:15px 52px 15px 20px;background:var(--s1);border:1px solid var(--b2);color:var(--white);font-family:var(--fb);font-size:.98rem;border-radius:14px;outline:none;transition:all .3s;}
.sb:focus{border-color:rgba(245,200,66,.5);background:var(--s2);box-shadow:0 0 0 3px rgba(245,200,66,.07);}
.sb::placeholder{color:var(--muted);}
.si{position:absolute;right:8px;top:50%;transform:translateY(-50%);width:34px;height:34px;background:linear-gradient(135deg,var(--gold2),var(--gold));border:none;border-radius:10px;cursor:pointer;font-size:15px;color:#08080f;display:flex;align-items:center;justify-content:center;transition:transform .2s;}
.si:hover{transform:translateY(-50%) scale(1.1);}

.sec-lbl{font-family:var(--fd);font-size:.7rem;font-weight:700;color:var(--muted);letter-spacing:3px;text-transform:uppercase;margin-bottom:12px;}
.cats{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:44px;}
.cat{font-family:var(--fd);font-size:.78rem;font-weight:600;padding:8px 18px;background:var(--s1);border:1px solid var(--b1);color:var(--muted2);border-radius:100px;cursor:pointer;transition:all .25s;}
.cat:hover{color:var(--white);border-color:var(--b2);background:var(--s2);}
.cat.on{color:var(--gold);border-color:rgba(245,200,66,.4);background:rgba(245,200,66,.07);}

/* GRID */
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px;}
.ai-card{background:var(--s1);border:1px solid var(--b1);border-radius:20px;padding:24px 20px;cursor:pointer;position:relative;overflow:hidden;transition:all .38s cubic-bezier(.22,1,.36,1);display:flex;flex-direction:column;}
.ai-card::after{content:'';position:absolute;inset:0;border-radius:20px;background:linear-gradient(135deg,rgba(245,200,66,0),rgba(245,200,66,.035));opacity:0;transition:opacity .3s;}
.ai-card:hover{transform:translateY(-7px);border-color:rgba(245,200,66,.3);box-shadow:0 20px 60px rgba(0,0,0,.5),0 0 0 1px rgba(245,200,66,.08);}
.ai-card:hover::after{opacity:1;}
.ai-card:hover .cn{color:var(--gold);}
.fav-btn{position:absolute;top:16px;right:16px;width:32px;height:32px;border-radius:50%;background:var(--s2);border:1px solid var(--b2);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s;color:var(--muted2);font-size:16px;z-index:5;opacity:1;transform:translateY(0);}
.ai-card:hover .fav-btn, .fav-btn.active{opacity:1;}
.fav-btn:hover{background:var(--gold);color:#08080f;border-color:var(--gold);}
.fav-btn.active{color:var(--gold);border-color:rgba(245,200,66,.4);background:rgba(245,200,66,.1);}
.fav-btn.active:hover{background:var(--gold);color:#08080f;}
.logo-box{width:48px;height:48px;border-radius:13px;margin-bottom:16px;overflow:hidden;display:flex;align-items:center;justify-content:center;background:var(--s2);border:1px solid var(--b2);flex-shrink:0;position:relative;z-index:1;}
.logo-box img{width:30px;height:30px;object-fit:contain;}
.logo-fb{font-size:22px;}
.cn{font-family:var(--fd);font-size:.88rem;font-weight:700;color:var(--white);margin-bottom:7px;transition:color .25s;position:relative;z-index:1;}
.cd{font-family:var(--fb);font-size:.94rem;font-weight:400;color:var(--muted);line-height:1.5;flex:1;margin-bottom:14px;position:relative;z-index:1;}
.ct{font-family:var(--fm);font-size:.62rem;letter-spacing:1px;padding:3px 9px;border:1px solid var(--b2);border-radius:6px;color:var(--muted2);display:inline-block;position:relative;z-index:1;width:fit-content;}
.ca{position:absolute;bottom:18px;right:18px;font-size:16px;color:var(--gold);opacity:0;transform:translate(-4px,4px);transition:all .3s;z-index:1;}
.ai-card:hover .ca{opacity:1;transform:translate(0,0);}
.empty-st{text-align:center;padding:80px 20px;color:var(--muted);font-size:1rem;}

/* ═══════════════ DETAIL ═══════════════ */
.detail{padding:108px 48px 80px;max-width:960px;margin:0 auto;}
.back-btn{display:inline-flex;align-items:center;gap:8px;font-family:var(--fd);font-size:.78rem;font-weight:600;color:var(--muted2);cursor:pointer;padding:9px 18px;background:var(--s1);border:1px solid var(--b1);border-radius:100px;margin-bottom:44px;transition:all .25s;}
.back-btn:hover{color:var(--white);border-color:var(--b2);}
.dc{background:var(--s1);border:1px solid var(--b1);border-radius:24px;padding:48px;display:flex;gap:44px;align-items:flex-start;position:relative;overflow:hidden;flex-wrap:wrap;}
.dc::before{content:'';position:absolute;top:-80px;right:-80px;width:340px;height:340px;background:radial-gradient(circle,rgba(245,200,66,.055) 0%,transparent 70%);pointer-events:none;}
.dlb{width:86px;height:86px;border-radius:20px;flex-shrink:0;background:var(--s2);border:1px solid var(--b2);display:flex;align-items:center;justify-content:center;overflow:hidden;}
.dlb img{width:56px;height:56px;object-fit:contain;}
.dlb-fb{font-size:44px;}
.db{flex:1;min-width:250px;}
.dp{display:flex;gap:7px;margin-bottom:12px;flex-wrap:wrap;}
.dpi{font-family:var(--fm);font-size:.62rem;letter-spacing:1px;padding:3px 10px;border-radius:6px;border:1px solid var(--b2);color:var(--muted2);}
.dpi.g{color:var(--gold);border-color:rgba(245,200,66,.3);background:rgba(245,200,66,.05);}
.dn{font-family:var(--fd);font-size:2.1rem;font-weight:800;letter-spacing:-.5px;margin-bottom:12px;}
.dd{font-size:1rem;color:var(--muted2);line-height:1.82;margin-bottom:30px;}
.vbtn{font-family:var(--fd);font-size:.88rem;font-weight:700;padding:13px 40px;background:linear-gradient(135deg,var(--gold2),var(--gold));border:none;color:#08080f;border-radius:100px;cursor:pointer;box-shadow:0 4px 24px rgba(245,200,66,.3);transition:all .25s;text-decoration:none;display:inline-block;}
.vbtn:hover{transform:scale(1.05);box-shadow:0 8px 40px rgba(245,200,66,.5);}

/* ═══════════════ ABOUT ═══════════════ */
.about{padding:108px 48px 80px;max-width:840px;margin:0 auto;}
.about h2{font-family:var(--fd);font-size:clamp(2rem,5vw,3rem);font-weight:800;letter-spacing:-1px;margin-bottom:22px;}
.about h2 em{font-style:normal;color:var(--gold);}
.about p{font-size:1.02rem;color:var(--muted2);line-height:1.9;margin-bottom:44px;}

@media(max-width:680px){nav{padding:0 18px;}.home,.about,.detail{padding:88px 18px 60px;}.dc{padding:24px;gap:20px;}.stats-row{gap:24px;}}
`;

/* ─── ALL AI DATA (110+ tools) ──────────────────────────────────── */
const AI_DATA = [
  // ── Language Models & Chat ──────────────────────────────────────
  {id:1,   name:"ChatGPT",          fb:"🤖", logo:"https://chat.openai.com/favicon.ico",                                    cat:["Chat","Story Writing","Code Gen","Research"],   url:"https://chat.openai.com",               desc:"OpenAI's flagship conversational AI. Complex reasoning, coding, writing and creative tasks with GPT-4o.",            tag:"Language Model"},
  {id:2,   name:"Claude",           fb:"🧠", logo:"https://claude.ai/favicon.ico",                                          cat:["Chat","Story Writing","Code Gen","Research"],   url:"https://claude.ai",                     desc:"Anthropic's safety-focused AI. Nuanced reasoning, long documents and thoughtful analysis.",                          tag:"Language Model"},
  {id:3,   name:"Gemini",           fb:"♊", logo:"https://www.gstatic.com/lamda/images/gemini_favicon_512x512_sq.png",      cat:["Chat","Research","Code Gen","Image Gen"],       url:"https://gemini.google.com",             desc:"Google's most capable multimodal AI — text, images, audio and video natively.",                                      tag:"Multimodal AI"},
  {id:4,   name:"Grok",             fb:"🌌", logo:"https://x.ai/favicon.ico",                                               cat:["Chat","Research"],                              url:"https://x.ai",                          desc:"xAI's real-time AI with live web access via X/Twitter and an unfiltered bold personality.",                          tag:"Language Model"},
  {id:5,   name:"Mistral AI",       fb:"💨", logo:"https://mistral.ai/favicon.ico",                                         cat:["Chat","Code Gen","Research"],                  url:"https://mistral.ai",                    desc:"European frontier AI lab — efficient open-weight models and blazing-fast API for developers.",                       tag:"Language Model"},
  {id:6,   name:"Perplexity",       fb:"🔍", logo:"https://www.perplexity.ai/favicon.ico",                                  cat:["Research","Chat"],                             url:"https://perplexity.ai",                 desc:"AI-powered search that cites real-time sources and gives structured, trustworthy answers.",                           tag:"Search AI"},
  {id:7,   name:"Cohere",           fb:"🔗", logo:"https://cohere.com/favicon.ico",                                         cat:["Research","Code Gen"],                         url:"https://cohere.com",                    desc:"Enterprise AI platform for search, RAG, and text understanding at scale.",                                           tag:"Enterprise AI"},
  {id:8,   name:"Meta Llama",       fb:"🦙", logo:"https://meta.com/favicon.ico",                                           cat:["Research","Chat","Code Gen"],                  url:"https://llama.meta.com",                desc:"Meta's open-source frontier language model — free to use, customize and deploy anywhere.",                           tag:"Open Source LLM"},
  {id:9,   name:"DeepSeek",         fb:"🌊", logo:"https://deepseek.com/favicon.ico",                                       cat:["Chat","Code Gen","Research"],                  url:"https://deepseek.com",                  desc:"Chinese frontier AI with exceptional math, coding and reasoning — free and open-weight.",                            tag:"Language Model"},
  {id:10,  name:"Le Chat",          fb:"💬", logo:"https://mistral.ai/favicon.ico",                                         cat:["Chat","Research"],                             url:"https://chat.mistral.ai",               desc:"Mistral's conversational AI interface — fast, multilingual, privacy-focused.",                                       tag:"Chat AI"},
  {id:11,  name:"Character AI",     fb:"👤", logo:"https://character.ai/favicon.ico",                                       cat:["Chat","Story Writing"],                        url:"https://character.ai",                  desc:"Create and chat with infinitely customizable AI characters and fleshed-out personas.",                               tag:"Chat AI"},
  {id:12,  name:"Poe",              fb:"💡", logo:"https://poe.com/favicon.ico",                                            cat:["Chat","Research"],                             url:"https://poe.com",                       desc:"Quora's AI chat platform — access GPT-4, Claude, Gemini and hundreds of bots in one app.",                          tag:"AI Aggregator"},
  {id:13,  name:"Pi AI",            fb:"🥧", logo:"https://heypi.com/favicon.ico",                                          cat:["Chat"],                                        url:"https://heypi.com",                     desc:"Inflection AI's personal AI — emotionally intelligent, patient and great for everyday conversation.",                tag:"Chat AI"},
  {id:14,  name:"You.com",          fb:"🔎", logo:"https://you.com/favicon.ico",                                            cat:["Chat","Research"],                             url:"https://you.com",                       desc:"AI search engine with code, writing, image and research modes all in one place.",                                    tag:"Search AI"},
  {id:15,  name:"Phind",            fb:"🧑‍💻", logo:"https://phind.com/favicon.ico",                                        cat:["Chat","Code Gen","Research"],                  url:"https://phind.com",                     desc:"AI search engine built for developers — finds and explains technical answers with sources.",                          tag:"Dev Search AI"},
  {id:16,  name:"Together AI",      fb:"🤝", logo:"https://together.ai/favicon.ico",                                        cat:["Research","Code Gen"],                         url:"https://together.ai",                   desc:"Run and fine-tune open-source AI models at scale with lightning-fast inference APIs.",                               tag:"AI Infrastructure"},
  {id:17,  name:"Groq",             fb:"⚡", logo:"https://groq.com/favicon.ico",                                           cat:["Chat","Research","Code Gen"],                  url:"https://groq.com",                      desc:"World's fastest AI inference — run Llama, Mixtral and Gemma at blazing speed via API.",                              tag:"AI Inference"},
  {id:18,  name:"OpenRouter",       fb:"🔀", logo:"https://openrouter.ai/favicon.ico",                                      cat:["Research","Code Gen"],                         url:"https://openrouter.ai",                 desc:"Unified API gateway to 200+ AI models — route to the best model for any task.",                                     tag:"AI Gateway"},
  // ── Image Generation ────────────────────────────────────────────
  {id:19,  name:"Midjourney",       fb:"🎨", logo:"https://www.midjourney.com/favicon.ico",                                 cat:["Image Gen","Art"],                             url:"https://midjourney.com",                desc:"Industry-leading AI image generator — cinematic, painterly and photorealistic art from prompts.",                   tag:"Image AI"},
  {id:20,  name:"DALL·E 3",         fb:"🖼️", logo:"https://openai.com/favicon.ico",                                         cat:["Image Gen","Art"],                             url:"https://openai.com/dall-e-3",           desc:"OpenAI's state-of-the-art image model with exceptional prompt fidelity and creativity.",                             tag:"Image AI"},
  {id:21,  name:"Stability AI",     fb:"🌀", logo:"https://stability.ai/favicon.ico",                                       cat:["Image Gen","Art"],                             url:"https://stability.ai",                  desc:"Creators of Stable Diffusion — the open-source image generation revolution.",                                       tag:"Image AI"},
  {id:22,  name:"Adobe Firefly",    fb:"🦋", logo:"https://firefly.adobe.com/favicon.ico",                                  cat:["Image Gen","Art"],                             url:"https://firefly.adobe.com",             desc:"Adobe's commercially safe generative AI trained on licensed Adobe Stock content.",                                  tag:"Creative AI"},
  {id:23,  name:"Leonardo AI",      fb:"🎭", logo:"https://leonardo.ai/favicon.ico",                                        cat:["Image Gen","Art","Video Editing"],             url:"https://leonardo.ai",                   desc:"Pro image generation for game assets, concept art and consistent characters.",                                      tag:"Image AI"},
  {id:24,  name:"Ideogram",         fb:"🔤", logo:"https://ideogram.ai/favicon.ico",                                        cat:["Image Gen","Art"],                             url:"https://ideogram.ai",                   desc:"AI image generation that actually renders text correctly inside images — a game changer.",                           tag:"Image AI"},
  {id:25,  name:"Flux AI",          fb:"🌊", logo:"https://blackforestlabs.ai/favicon.ico",                                 cat:["Image Gen","Art"],                             url:"https://blackforestlabs.ai",            desc:"Black Forest Labs' FLUX — the new open-source benchmark for photorealistic AI images.",                             tag:"Image AI"},
  {id:26,  name:"Canva AI",         fb:"✏️", logo:"https://static.canva.com/web/images/8439b51bb7a19f6e65ce1064bc37c47f.svg", cat:["Art","Image Gen","Presentation"],          url:"https://canva.com",                     desc:"Design magic with AI — generate images, resize, write copy and animate in one platform.",                           tag:"Design AI"},
  {id:27,  name:"Playground AI",    fb:"🛝", logo:"https://playground.com/favicon.ico",                                     cat:["Image Gen","Art"],                             url:"https://playground.com",                desc:"Free AI image generator with canvas editing, real-time generation and style mixing.",                                tag:"Image AI"},
  {id:28,  name:"Freepik AI",       fb:"🖌️", logo:"https://www.freepik.com/favicon.ico",                                   cat:["Image Gen","Art"],                             url:"https://www.freepik.com/ai/image-generator", desc:"Freepik's AI image generator with millions of design assets and style presets.",                                tag:"Image AI"},
  {id:29,  name:"NightCafe",        fb:"🌙", logo:"https://creator.nightcafe.studio/favicon.ico",                           cat:["Image Gen","Art"],                             url:"https://creator.nightcafe.studio",      desc:"AI art generator community with daily challenges, credits system and 20+ style algorithms.",                        tag:"Image AI"},
  {id:30,  name:"Artbreeder",       fb:"🧬", logo:"https://www.artbreeder.com/favicon.ico",                                 cat:["Image Gen","Art"],                             url:"https://artbreeder.com",                desc:"Blend, mutate and evolve images using AI — explore infinite creative combinations.",                                 tag:"Image AI"},
  {id:31,  name:"Remove.bg",        fb:"✂️", logo:"https://www.remove.bg/favicon.ico",                                      cat:["Image Gen","Art"],                             url:"https://remove.bg",                     desc:"Remove image backgrounds instantly with AI — 100% automatic, no manual work needed.",                               tag:"Image AI"},
  {id:32,  name:"Upscayl",          fb:"🔭", logo:"https://upscayl.org/favicon.ico",                                        cat:["Image Gen","Art"],                             url:"https://upscayl.org",                   desc:"Free and open-source AI image upscaler — 4x resolution boost with zero quality loss.",                              tag:"Image AI"},
  // ── Video ────────────────────────────────────────────────────────
  {id:33,  name:"Runway ML",        fb:"🎬", logo:"https://runwayml.com/favicon.ico",                                        cat:["Video Editing","Art"],                         url:"https://runwayml.com",                  desc:"Gen-3 Alpha creates stunning cinematic video from text or image — professional-grade.",                              tag:"Video AI"},
  {id:34,  name:"Pika Labs",        fb:"🎥", logo:"https://pika.art/favicon.ico",                                           cat:["Video Editing"],                               url:"https://pika.art",                      desc:"Turn still images or text into stunning AI-generated videos with precise motion control.",                          tag:"Video AI"},
  {id:35,  name:"Synthesia",        fb:"📹", logo:"https://www.synthesia.io/favicon.ico",                                    cat:["Video Editing"],                               url:"https://synthesia.io",                  desc:"Create AI avatar videos in 140+ languages — no cameras, studios or crew needed.",                                  tag:"Avatar Video"},
  {id:36,  name:"Luma AI",          fb:"🌐", logo:"https://lumalabs.ai/favicon.ico",                                         cat:["Video Editing","Art"],                         url:"https://lumalabs.ai",                   desc:"Dream Machine — generate physically accurate high-quality video from text and images.",                              tag:"3D & Video"},
  {id:37,  name:"Kling AI",         fb:"🎞️", logo:"https://klingai.com/favicon.ico",                                        cat:["Video Editing"],                               url:"https://klingai.com",                   desc:"Kuaishou's frontier 2-minute high-fidelity video generation from a single prompt.",                                 tag:"Video AI"},
  {id:38,  name:"HeyGen",           fb:"🤳", logo:"https://heygen.com/favicon.ico",                                          cat:["Video Editing"],                               url:"https://heygen.com",                    desc:"AI video generation with hyper-realistic avatars, voice cloning and live streaming.",                               tag:"Avatar Video"},
  {id:39,  name:"Sora",             fb:"🎠", logo:"https://openai.com/favicon.ico",                                          cat:["Video Editing"],                               url:"https://openai.com/sora",               desc:"OpenAI's revolutionary text-to-video model generating coherent cinematic clips.",                                   tag:"Video AI"},
  {id:40,  name:"Invideo AI",       fb:"📽️", logo:"https://invideo.io/favicon.ico",                                          cat:["Video Editing"],                               url:"https://invideo.io",                    desc:"Turn scripts and prompts into publish-ready YouTube or social media videos.",                                       tag:"Video AI"},
  {id:41,  name:"Descript",         fb:"📻", logo:"https://www.descript.com/favicon.ico",                                    cat:["Audio","Video Editing"],                       url:"https://descript.com",                  desc:"Edit audio and video like a doc — AI transcription, overdub and studio-quality tools.",                             tag:"Audio & Video"},
  {id:42,  name:"Opus Clip",        fb:"✂️", logo:"https://www.opus.pro/favicon.ico",                                       cat:["Video Editing"],                               url:"https://www.opus.pro",                  desc:"AI auto-clips your long videos into viral short-form content for TikTok and Reels.",                                tag:"Video AI"},
  {id:43,  name:"Pictory",          fb:"🎦", logo:"https://pictory.ai/favicon.ico",                                         cat:["Video Editing","Story Writing"],               url:"https://pictory.ai",                    desc:"Turn blog posts, scripts and long videos into branded short video clips automatically.",                            tag:"Video AI"},
  {id:44,  name:"Fliki",            fb:"🗣️", logo:"https://fliki.ai/favicon.ico",                                           cat:["Video Editing","Audio"],                       url:"https://fliki.ai",                      desc:"Create videos from text with AI voices, stock footage and lip-synced presenters.",                                  tag:"Video AI"},
  {id:45,  name:"D-ID",             fb:"🎭", logo:"https://www.d-id.com/favicon.ico",                                       cat:["Video Editing"],                               url:"https://www.d-id.com",                  desc:"Animate still photos and create talking avatar videos with AI in seconds.",                                         tag:"Avatar Video"},
  {id:46,  name:"Veed.io",          fb:"🎞️", logo:"https://www.veed.io/favicon.ico",                                        cat:["Video Editing"],                               url:"https://www.veed.io",                   desc:"Online video editor with AI subtitles, eye contact correction and voice translation.",                              tag:"Video AI"},
  // ── Code / App Building ──────────────────────────────────────────
  {id:47,  name:"GitHub Copilot",   fb:"💻", logo:"https://github.githubassets.com/images/modules/site/features/copilot/copilot-icon.svg", cat:["Code Gen","App Building"],       url:"https://github.com/features/copilot",   desc:"AI pair programmer — suggests code, explains bugs and generates tests in real time.",                                tag:"Code AI"},
  {id:48,  name:"Cursor",           fb:"🖱️", logo:"https://cursor.sh/light-logo.svg",                                        cat:["Code Gen","App Building"],                     url:"https://cursor.sh",                     desc:"AI-first code editor. Chat with your entire codebase and apply changes with Cmd+K.",                                tag:"Code Editor"},
  {id:49,  name:"Bolt.new",         fb:"⚡", logo:"https://bolt.new/favicon.ico",                                            cat:["App Building","Code Gen"],                     url:"https://bolt.new",                      desc:"Full-stack web app from idea to deployment in seconds — powered by Claude in-browser.",                             tag:"App Builder"},
  {id:50,  name:"Lovable",          fb:"❤️", logo:"https://lovable.dev/favicon.ico",                                         cat:["App Building"],                                url:"https://lovable.dev",                   desc:"Build production apps by chatting. Lovable writes the code, you ship the product.",                                 tag:"App Builder"},
  {id:51,  name:"v0 by Vercel",     fb:"▲",  logo:"https://v0.dev/v0-logomark.svg",                                          cat:["App Building","Code Gen"],                     url:"https://v0.dev",                        desc:"Generate React + shadcn/ui components from natural language descriptions instantly.",                                tag:"UI Builder"},
  {id:52,  name:"Windsurf",         fb:"🏄", logo:"https://codeium.com/favicon.ico",                                         cat:["Code Gen","App Building"],                     url:"https://codeium.com/windsurf",          desc:"Codeium's agentic AI IDE — the first editor that truly understands your codebase flow.",                            tag:"Code Editor"},
  {id:53,  name:"Replit AI",        fb:"🔄", logo:"https://replit.com/favicon.ico",                                          cat:["App Building","Code Gen"],                     url:"https://replit.com",                    desc:"Build, run and deploy apps in your browser with AI assistance — zero setup required.",                              tag:"Cloud IDE"},
  {id:54,  name:"Devin",            fb:"🤖", logo:"https://www.cognition-labs.com/logo.svg",                                 cat:["App Building","Code Gen"],                     url:"https://cognition.ai",                  desc:"The world's first fully autonomous AI software engineer — plans, codes and deploys.",                               tag:"AI Engineer"},
  {id:55,  name:"Tabnine",          fb:"📟", logo:"https://tabnine.com/favicon.ico",                                         cat:["Code Gen"],                                    url:"https://tabnine.com",                   desc:"Privacy-first AI code completion trained on your team's code — runs locally.",                                      tag:"Code AI"},
  {id:56,  name:"Codeium",          fb:"🌱", logo:"https://codeium.com/favicon.ico",                                         cat:["Code Gen"],                                    url:"https://codeium.com",                   desc:"Free AI coding assistant with autocomplete in 70+ languages and 40+ IDEs.",                                         tag:"Code AI"},
  {id:57,  name:"Amazon Q",         fb:"☁️", logo:"https://d1.awsstatic.com/products/q/product-page-diagrams/aws-q-logo.cd18723a547a03a1509f0593535e21c5603b357f.png", cat:["Code Gen","App Building","Research"], url:"https://aws.amazon.com/q",              desc:"AWS's generative AI assistant for developers — answers questions about your codebase.",                             tag:"Cloud AI"},
  {id:58,  name:"Google Jules",     fb:"🔧", logo:"https://www.google.com/favicon.ico",                                      cat:["Code Gen","App Building"],                     url:"https://jules.google.com",              desc:"Google's async AI coding agent — handles GitHub issues and PRs autonomously.",                                      tag:"AI Engineer"},
  {id:59,  name:"Pieces",           fb:"🧩", logo:"https://pieces.app/favicon.ico",                                          cat:["Code Gen"],                                    url:"https://pieces.app",                    desc:"AI-powered developer productivity tool — saves, enriches and resurfaces code snippets.",                            tag:"Dev Tools"},
  {id:60,  name:"Continue.dev",     fb:"🔁", logo:"https://continue.dev/favicon.ico",                                        cat:["Code Gen"],                                    url:"https://continue.dev",                  desc:"Open-source AI code assistant that connects any LLM to your VS Code or JetBrains IDE.",                            tag:"Code AI"},
  // ── Audio / Music ────────────────────────────────────────────────
  {id:61,  name:"ElevenLabs",       fb:"🎙️", logo:"https://elevenlabs.io/favicon.ico",                                       cat:["Audio"],                                       url:"https://elevenlabs.io",                 desc:"Ultra-realistic AI voice synthesis and cloning across 29 languages.",                                               tag:"Voice AI"},
  {id:62,  name:"Suno AI",          fb:"🎵", logo:"https://suno.ai/favicon.ico",                                             cat:["Audio"],                                       url:"https://suno.ai",                       desc:"Generate complete radio-ready songs with vocals, instruments and production from text.",                            tag:"Music AI"},
  {id:63,  name:"Udio",             fb:"🎸", logo:"https://www.udio.com/favicon.ico",                                        cat:["Audio"],                                       url:"https://udio.com",                      desc:"Studio-quality AI music generation — craft full tracks, stems and variations.",                                     tag:"Music AI"},
  {id:64,  name:"Mubert",           fb:"🎧", logo:"https://mubert.com/favicon.ico",                                          cat:["Audio"],                                       url:"https://mubert.com",                    desc:"Generate royalty-free background music for videos, streams and apps on demand.",                                   tag:"Music AI"},
  {id:65,  name:"Soundraw",         fb:"🎼", logo:"https://soundraw.io/favicon.ico",                                         cat:["Audio"],                                       url:"https://soundraw.io",                   desc:"AI music generator — create royalty-free tracks by mood, genre and length.",                                        tag:"Music AI"},
  {id:66,  name:"Boomy",            fb:"🥁", logo:"https://boomy.com/favicon.ico",                                           cat:["Audio"],                                       url:"https://boomy.com",                     desc:"Create original songs in seconds and submit them to streaming platforms worldwide.",                                tag:"Music AI"},
  {id:67,  name:"Adobe Podcast",    fb:"🎤", logo:"https://podcast.adobe.com/favicon.ico",                                   cat:["Audio"],                                       url:"https://podcast.adobe.com",             desc:"AI-powered podcast recording and editing — removes background noise and enhances voice.",                           tag:"Audio AI"},
  {id:68,  name:"Whisper AI",       fb:"🌬️", logo:"https://openai.com/favicon.ico",                                          cat:["Audio","Research"],                            url:"https://openai.com/research/whisper",   desc:"OpenAI's open-source speech recognition model with near-human transcription accuracy.",                            tag:"Speech AI"},
  {id:69,  name:"Aiva",             fb:"🎻", logo:"https://www.aiva.ai/favicon.ico",                                         cat:["Audio"],                                       url:"https://www.aiva.ai",                   desc:"AI music composer — create emotional soundtracks for games, films and videos.",                                     tag:"Music AI"},
  {id:70,  name:"Lalal.ai",         fb:"🔀", logo:"https://www.lalal.ai/favicon.ico",                                        cat:["Audio"],                                       url:"https://www.lalal.ai",                  desc:"AI stem splitter — extract vocals, drums, bass and instruments from any song.",                                     tag:"Audio AI"},
  // ── Writing / Content ────────────────────────────────────────────
  {id:71,  name:"Notion AI",        fb:"📝", logo:"https://www.notion.so/front-static/favicon.ico",                          cat:["Story Writing","Research","Presentation"],     url:"https://notion.so/ai",                  desc:"AI built into your Notion workspace — summarize, write drafts and extract action items.",                           tag:"Writing AI"},
  {id:72,  name:"Grammarly",        fb:"✍️", logo:"https://www.grammarly.com/favicon.ico",                                   cat:["Story Writing"],                               url:"https://grammarly.com",                 desc:"Real-time AI writing assistant for grammar, tone, clarity and full-sentence rewrites.",                              tag:"Writing AI"},
  {id:73,  name:"Jasper AI",        fb:"🚀", logo:"https://www.jasper.ai/favicon.ico",                                       cat:["Story Writing","Research"],                    url:"https://jasper.ai",                     desc:"AI content platform for marketing teams — blogs, ads, emails and social copy at scale.",                           tag:"Content AI"},
  {id:74,  name:"Copy.ai",          fb:"📋", logo:"https://www.copy.ai/favicon.ico",                                         cat:["Story Writing"],                               url:"https://copy.ai",                       desc:"AI-powered copywriting for sales, marketing and e-commerce with 90+ templates.",                                   tag:"Copywriting AI"},
  {id:75,  name:"Quillbot",         fb:"🪶", logo:"https://quillbot.com/favicon.ico",                                        cat:["Story Writing"],                               url:"https://quillbot.com",                  desc:"AI paraphrasing, summarizing and grammar checking trusted by 35M+ writers worldwide.",                             tag:"Writing AI"},
  {id:76,  name:"Rytr",             fb:"✒️", logo:"https://rytr.me/favicon.ico",                                             cat:["Story Writing"],                               url:"https://rytr.me",                       desc:"Affordable AI writing assistant with 40+ use cases and 30+ languages supported.",                                  tag:"Writing AI"},
  {id:77,  name:"Writesonic",       fb:"📡", logo:"https://writesonic.com/favicon.ico",                                      cat:["Story Writing","Research"],                    url:"https://writesonic.com",                desc:"AI writer for SEO-optimized articles, ads, landing pages and product descriptions.",                                tag:"Content AI"},
  {id:78,  name:"Sudowrite",        fb:"🖋️", logo:"https://www.sudowrite.com/favicon.ico",                                   cat:["Story Writing"],                               url:"https://www.sudowrite.com",             desc:"AI writing partner for fiction — brainstorm, expand, rewrite and improve your stories.",                            tag:"Fiction AI"},
  {id:79,  name:"Novelcrafter",     fb:"📚", logo:"https://novelcrafter.com/favicon.ico",                                    cat:["Story Writing"],                               url:"https://novelcrafter.com",              desc:"AI-powered novel writing toolkit — plot, outline and draft your entire book with AI.",                              tag:"Fiction AI"},
  {id:80,  name:"Hemingway Editor", fb:"📖", logo:"https://hemingwayapp.com/favicon.ico",                                    cat:["Story Writing"],                               url:"https://hemingwayapp.com",              desc:"Make your writing bold and clear — highlights complex sentences, passive voice and adverbs.",                       tag:"Writing AI"},
  // ── Research / Science ───────────────────────────────────────────
  {id:81,  name:"Hugging Face",     fb:"🤗", logo:"https://huggingface.co/favicon.ico",                                      cat:["Research","Code Gen","App Building"],          url:"https://huggingface.co",                desc:"The GitHub of AI — 500K+ models, datasets and Spaces. Home of open-source ML.",                                    tag:"ML Platform"},
  {id:82,  name:"DeepMind",         fb:"🧬", logo:"https://deepmind.google/favicon.ico",                                     cat:["Research","Code Gen"],                         url:"https://deepmind.google",               desc:"Google DeepMind — pushing frontiers of AI safety, science and general intelligence.",                               tag:"Research Lab"},
  {id:83,  name:"Wolfram Alpha",    fb:"🔢", logo:"https://www.wolframalpha.com/favicon.ico",                                cat:["Research"],                                    url:"https://wolframalpha.com",              desc:"Computational intelligence engine — answers factual questions with step-by-step math.",                            tag:"Compute AI"},
  {id:84,  name:"Elicit",           fb:"📚", logo:"https://elicit.com/favicon.ico",                                          cat:["Research"],                                    url:"https://elicit.com",                    desc:"AI research assistant that finds, summarizes and synthesizes academic papers.",                                     tag:"Research AI"},
  {id:85,  name:"Consensus",        fb:"🔬", logo:"https://consensus.app/favicon.ico",                                       cat:["Research"],                                    url:"https://consensus.app",                 desc:"AI-powered academic search — get evidence-based answers from research papers.",                                     tag:"Research AI"},
  {id:86,  name:"Semantic Scholar", fb:"🏫", logo:"https://www.semanticscholar.org/favicon.ico",                             cat:["Research"],                                    url:"https://semanticscholar.org",           desc:"Free AI-powered academic search engine covering 200M+ scientific papers.",                                         tag:"Research AI"},
  {id:87,  name:"Scite.ai",         fb:"📊", logo:"https://scite.ai/favicon.ico",                                           cat:["Research"],                                    url:"https://scite.ai",                      desc:"Smart citations — discover how research has been cited with context and analysis.",                                 tag:"Research AI"},
  {id:88,  name:"SpaceX",           fb:"🚀", logo:"https://www.spacex.com/favicon.ico",                                      cat:["Research"],                                    url:"https://spacex.com",                    desc:"SpaceX's advanced AI systems and autonomous computers powering reusable rocketry.",                                tag:"Space Tech"},
  // ── Presentation / Productivity ──────────────────────────────────
  {id:89,  name:"Gamma",            fb:"📊", logo:"https://gamma.app/favicon.ico",                                           cat:["Presentation"],                                url:"https://gamma.app",                     desc:"AI-powered presentations, docs and websites — beautiful slides from a prompt.",                                    tag:"Presentation AI"},
  {id:90,  name:"Beautiful.ai",     fb:"🎯", logo:"https://www.beautiful.ai/favicon.ico",                                    cat:["Presentation"],                                url:"https://beautiful.ai",                  desc:"Smart presentation maker that auto-designs your slides as you type content.",                                      tag:"Presentation AI"},
  {id:91,  name:"Tome",             fb:"📖", logo:"https://tome.app/favicon.ico",                                            cat:["Presentation","Story Writing"],                url:"https://tome.app",                      desc:"AI-native storytelling tool that generates entire decks from one sentence.",                                        tag:"Presentation AI"},
  {id:92,  name:"SlidesAI",         fb:"🗂️", logo:"https://www.slidesai.io/favicon.ico",                                    cat:["Presentation"],                                url:"https://www.slidesai.io",               desc:"Create presentation slides from any text in seconds with AI — works with Google Slides.",                          tag:"Presentation AI"},
  {id:93,  name:"Decktopus",        fb:"🃏", logo:"https://www.decktopus.com/favicon.ico",                                   cat:["Presentation"],                                url:"https://www.decktopus.com",             desc:"AI presentation builder — generate fully designed decks with notes and forms.",                                    tag:"Presentation AI"},
  {id:94,  name:"Notion",           fb:"📒", logo:"https://www.notion.so/front-static/favicon.ico",                          cat:["Presentation","Research"],                     url:"https://notion.so",                     desc:"All-in-one workspace with AI writing, databases, wikis and project management.",                                   tag:"Productivity"},
  {id:95,  name:"Mem.ai",           fb:"🧠", logo:"https://mem.ai/favicon.ico",                                              cat:["Research","Story Writing"],                    url:"https://mem.ai",                        desc:"AI-powered note-taking that automatically organizes your knowledge and resurfaces it.",                             tag:"Productivity AI"},
  {id:96,  name:"Otter.ai",         fb:"🦦", logo:"https://otter.ai/favicon.ico",                                           cat:["Audio","Research"],                            url:"https://otter.ai",                      desc:"Real-time AI meeting transcription, notes and summaries with speaker identification.",                              tag:"Transcription AI"},
  {id:97,  name:"Fireflies.ai",     fb:"🔥", logo:"https://fireflies.ai/favicon.ico",                                       cat:["Audio","Research"],                            url:"https://fireflies.ai",                  desc:"AI meeting assistant — records, transcribes, analyzes and summarizes your calls.",                                 tag:"Meeting AI"},
  // ── Design & Creative ────────────────────────────────────────────
  {id:98,  name:"Figma AI",         fb:"🖼️", logo:"https://www.figma.com/favicon.ico",                                       cat:["App Building","Art"],                          url:"https://figma.com",                     desc:"Figma's built-in AI — generate, edit and prototype UI designs with natural language.",                              tag:"Design AI"},
  {id:99,  name:"Uizard",           fb:"📱", logo:"https://uizard.io/favicon.ico",                                           cat:["App Building","Art"],                          url:"https://uizard.io",                     desc:"Turn screenshots, sketches or prompts into interactive UI mockups instantly with AI.",                              tag:"UI Design AI"},
  {id:100, name:"Khroma",           fb:"🎨", logo:"https://www.khroma.co/favicon.ico",                                       cat:["Art"],                                         url:"https://www.khroma.co",                 desc:"AI color tool that learns your palette preferences and generates infinite color combos.",                           tag:"Design AI"},
  {id:101, name:"Looka",            fb:"🏷️", logo:"https://looka.com/favicon.ico",                                          cat:["Art"],                                         url:"https://looka.com",                     desc:"AI-powered logo and brand design tool — create professional brand kits in minutes.",                               tag:"Branding AI"},
  {id:102, name:"Brandmark",        fb:"💎", logo:"https://brandmark.io/favicon.ico",                                        cat:["Art"],                                         url:"https://brandmark.io",                  desc:"Generate unique, professional logo designs with AI — infinite variations instantly.",                               tag:"Branding AI"},
  // ── Automation & Business ────────────────────────────────────────
  {id:103, name:"Zapier AI",        fb:"⚡", logo:"https://zapier.com/favicon.ico",                                          cat:["App Building","Research"],                     url:"https://zapier.com/ai",                 desc:"AI-powered automation — build workflows and chatbots that connect 6,000+ apps.",                                   tag:"Automation AI"},
  {id:104, name:"Make.com",         fb:"⚙️", logo:"https://www.make.com/favicon.ico",                                        cat:["App Building"],                                url:"https://make.com",                      desc:"Visual automation platform — connect apps and build complex AI workflows without code.",                           tag:"Automation AI"},
  {id:105, name:"Relevance AI",     fb:"🧩", logo:"https://relevanceai.com/favicon.ico",                                     cat:["App Building","Research"],                     url:"https://relevanceai.com",               desc:"Build and deploy AI agents, tools and automated workflows for business teams.",                                    tag:"AI Agents"},
  {id:106, name:"Bardeen",          fb:"🤖", logo:"https://www.bardeen.ai/favicon.ico",                                      cat:["App Building"],                                url:"https://www.bardeen.ai",                desc:"AI browser automation — scrape, enrich and automate repetitive web tasks instantly.",                               tag:"Automation AI"},
  {id:107, name:"Taskade",          fb:"✅", logo:"https://www.taskade.com/favicon.ico",                                     cat:["Research","App Building"],                     url:"https://www.taskade.com",               desc:"AI-powered project management with mind maps, workflows and built-in AI agents.",                                  tag:"Productivity AI"},
  {id:108, name:"Humata AI",        fb:"📄", logo:"https://www.humata.ai/favicon.ico",                                       cat:["Research","Story Writing"],                    url:"https://www.humata.ai",                 desc:"Chat with your PDF documents — summarize, analyze and extract insights from files.",                               tag:"Document AI"},
  {id:109, name:"Chatpdf",          fb:"📑", logo:"https://www.chatpdf.com/favicon.ico",                                     cat:["Research"],                                    url:"https://www.chatpdf.com",               desc:"Upload any PDF and have a conversation with it — instant answers with citations.",                                 tag:"Document AI"},
  {id:110, name:"Magical",          fb:"✨", logo:"https://www.getmagical.com/favicon.ico",                                  cat:["App Building"],                                url:"https://www.getmagical.com",            desc:"AI text expander and automation tool — fill forms, draft messages and automate tasks.",                            tag:"Productivity AI"},
];

const CATS = ["All","Chat","Image Gen","Video Editing","Code Gen","App Building","Story Writing","Audio","Research","Art","Presentation","Automation","Design","Branding"];

/* ─── PARTICLE BG ───────────────────────────────────────────────── */
function ParticleBg() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current, ctx = c.getContext("2d"); let raf;
    const resize = () => { c.width = innerWidth; c.height = innerHeight; };
    resize(); window.addEventListener("resize", resize);
    const pts = Array.from({length:60}, () => ({
      x:Math.random()*innerWidth, y:Math.random()*innerHeight,
      vx:(Math.random()-.5)*.2, vy:(Math.random()-.5)*.2,
      r:Math.random()*1.1+.4, a:Math.random()*.4+.15
    }));
    const tick = () => {
      ctx.clearRect(0,0,c.width,c.height);
      pts.forEach(p => {
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<0)p.x=c.width; if(p.x>c.width)p.x=0;
        if(p.y<0)p.y=c.height; if(p.y>c.height)p.y=0;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(245,200,66,${p.a*.2})`; ctx.fill();
      });
      for(let i=0;i<pts.length;i++) for(let j=i+1;j<pts.length;j++){
        const dx=pts[i].x-pts[j].x, dy=pts[i].y-pts[j].y, d=Math.hypot(dx,dy);
        if(d<120){ ctx.beginPath(); ctx.moveTo(pts[i].x,pts[i].y); ctx.lineTo(pts[j].x,pts[j].y); ctx.strokeStyle=`rgba(245,200,66,${.055*(1-d/120)})`; ctx.lineWidth=.5; ctx.stroke(); }
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize",resize); };
  },[]);
  return <canvas id="bg-canvas" ref={ref}/>;
}

/* ─── CURSOR ────────────────────────────────────────────────────── */
function Cursor() {
  const d=useRef(null), r=useRef(null);
  useEffect(()=>{
    const m=e=>{ if(d.current){d.current.style.left=e.clientX+"px";d.current.style.top=e.clientY+"px";} if(r.current){r.current.style.left=e.clientX+"px";r.current.style.top=e.clientY+"px";} };
    window.addEventListener("mousemove",m);
    return()=>window.removeEventListener("mousemove",m);
  },[]);
  return <div id="cur"><div id="cur-d" ref={d}/><div id="cur-r" ref={r}/></div>;
}

/* ─── 3D ROBOT (Three.js) ───────────────────────────────────────── */
function Robot3D() {
  const mountRef = useRef(null);
  useEffect(() => {
    let renderer, scene, camera, raf, THREE;
    let robot = {}, t = 0;

    loadThree().then(T => {
      THREE = T;
      const W = 340, H = 340;

      renderer = new THREE.WebGLRenderer({ canvas: mountRef.current, alpha:true, antialias:true });
      renderer.setSize(W, H);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
      renderer.shadowMap.enabled = true;

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, W/H, 0.1, 100);
      camera.position.set(0, 1.6, 5.5);
      camera.lookAt(0, 1, 0);

      // Lighting
      const amb = new THREE.AmbientLight(0xffeec0, 0.6);
      scene.add(amb);
      const key = new THREE.DirectionalLight(0xf5c842, 1.4);
      key.position.set(3, 5, 4);
      key.castShadow = true;
      scene.add(key);
      const fill = new THREE.DirectionalLight(0x22d3ee, 0.55);
      fill.position.set(-4, 2, 2);
      scene.add(fill);
      const back = new THREE.DirectionalLight(0xa78bfa, 0.4);
      back.position.set(0, -2, -4);
      scene.add(back);
      const pt = new THREE.PointLight(0xf5c842, 1.2, 8);
      pt.position.set(0, 3, 2);
      scene.add(pt);

      // Materials
      const bodyMat  = new THREE.MeshStandardMaterial({ color:0x3b82f6, metalness:.7, roughness:.2 });
      const goldMat  = new THREE.MeshStandardMaterial({ color:0xf5c842, metalness:1, roughness:.15, emissive:0xf5c842, emissiveIntensity:.12 });
      const extraMat = new THREE.MeshStandardMaterial({ color:0x8b5cf6, metalness:.9, roughness:.2, emissive:0x7c3aed, emissiveIntensity:.15 });
      const cyanMat  = new THREE.MeshStandardMaterial({ color:0x22d3ee, metalness:.7, roughness:.2, emissive:0x22d3ee, emissiveIntensity:.4 });
      const darkMat  = new THREE.MeshStandardMaterial({ color:0x1e293b, metalness:.9, roughness:.2 });
      const glassMat = new THREE.MeshStandardMaterial({ color:0x22d3ee, transparent:true, opacity:.7, metalness:.3, roughness:.05, emissive:0x22d3ee, emissiveIntensity:.6 });
      const redMat   = new THREE.MeshStandardMaterial({ color:0xff4466, emissive:0xff2244, emissiveIntensity:.5 });

      const box  = (w,h,d) => new THREE.BoxGeometry(w,h,d);
      const cyl  = (rt,rb,h,s) => new THREE.CylinderGeometry(rt,rb,h,s||16);
      const sph  = (r,ws,hs) => new THREE.SphereGeometry(r,ws||24,hs||16);
      const mesh = (g,m) => { const o=new THREE.Mesh(g,m); o.castShadow=true; return o; };

      // ── ROOT GROUP
      const root = new THREE.Group();
      scene.add(root);

      // ── BODY (torso)
      const torso = mesh(box(1.2,1.35,0.85), bodyMat);
      torso.position.set(0,1.2,0);
      root.add(torso);

      // chest panel
      const chest = mesh(box(0.7,0.55,0.05), extraMat);
      chest.position.set(0,1.3,0.44);
      root.add(chest);

      // chest glow strip
      const strip = mesh(box(0.55,0.06,0.04), cyanMat);
      strip.position.set(0,1.42,0.47);
      root.add(strip);

      // belly button light
      const belly = mesh(sph(0.07), glassMat);
      belly.position.set(0,1.05,0.44);
      root.add(belly);
      robot.belly = belly;

      // shoulder pads
      [-1,1].forEach(s => {
        const pad = mesh(new THREE.SphereGeometry(0.22,12,8,0,Math.PI*2,0,Math.PI*.6), goldMat);
        pad.rotation.x = -Math.PI*.1;
        pad.position.set(s*0.72, 1.72, 0);
        root.add(pad);
      });

      // ── HEAD
      const headGroup = new THREE.Group();
      headGroup.position.set(0,2.18,0);
      root.add(headGroup);
      robot.head = headGroup;

      const head = mesh(box(0.88,0.78,0.78), bodyMat);
      headGroup.add(head);

      // face plate
      const face = mesh(box(0.7,0.55,0.04), darkMat);
      face.position.set(0,0.02,0.4);
      headGroup.add(face);

      // eyes (visor)
      [-1,1].forEach(s => {
        const eyeG = new THREE.Group();
        eyeG.position.set(s*0.18, 0.06, 0.42);
        headGroup.add(eyeG);
        const eye = mesh(box(0.16,0.09,0.04), glassMat);
        eyeG.add(eye);
        robot[`eye${s<0?'L':'R'}`] = eyeG;
      });

      // mouth / speaker grille
      for(let i=-2;i<=2;i++){
        const g = mesh(box(0.06,0.02,0.03), goldMat);
        g.position.set(i*0.09,-0.19,0.42);
        headGroup.add(g);
      }

      // antenna
      const ant = mesh(cyl(0.02,0.02,0.35), bodyMat);
      ant.position.set(0,0.55,0);
      headGroup.add(ant);
      robot.ant = ant;
      const antBall = mesh(sph(0.06), cyanMat);
      antBall.position.set(0,0.74,0);
      headGroup.add(antBall);
      robot.antBall = antBall;

      // ears
      [-1,1].forEach(s => {
        const ear = mesh(cyl(0.07,0.07,0.12,8), goldMat);
        ear.rotation.z = Math.PI/2;
        ear.position.set(s*0.5,0,0);
        headGroup.add(ear);
      });

      // ── ARMS
      robot.arms = {};
      [-1,1].forEach(s => {
        const armGroup = new THREE.Group();
        armGroup.position.set(s*0.73, 1.65, 0);
        root.add(armGroup);
        robot.arms[s] = armGroup;

        // upper arm
        const upper = mesh(cyl(0.14,0.12,0.7), bodyMat);
        upper.position.y = -0.35;
        armGroup.add(upper);

        // elbow
        const elbow = mesh(sph(0.14), goldMat);
        elbow.position.y = -0.72;
        armGroup.add(elbow);

        // forearm
        const fore = mesh(cyl(0.11,0.09,0.58), extraMat);
        fore.position.y = -1.08;
        armGroup.add(fore);

        // hand
        const hand = mesh(box(0.22,0.2,0.15), bodyMat);
        hand.position.y = -1.45;
        armGroup.add(hand);

        // fingers (3)
        for(let f=0;f<3;f++){
          const finger = mesh(box(0.055,0.18,0.055), darkMat);
          finger.position.set((f-1)*0.07,-1.62,0);
          armGroup.add(finger);
        }
      });

      // ── WAIST
      const waist = mesh(cyl(0.42,0.52,0.25,12), extraMat);
      waist.position.y = 0.52;
      root.add(waist);

      // waist ring glow
      const waistRing = mesh(new THREE.TorusGeometry(0.48,0.025,8,32), cyanMat);
      waistRing.position.y = 0.52;
      waistRing.rotation.x = Math.PI/2;
      root.add(waistRing);
      robot.waistRing = waistRing;

      // ── LEGS
      robot.legs = {};
      [-1,1].forEach(s => {
        const legGroup = new THREE.Group();
        legGroup.position.set(s*0.34, 0.38, 0);
        root.add(legGroup);
        robot.legs[s] = legGroup;

        const thigh = mesh(cyl(0.17,0.15,0.62), bodyMat);
        thigh.position.y = -0.31;
        legGroup.add(thigh);

        const knee = mesh(sph(0.16), goldMat);
        knee.position.y = -0.64;
        legGroup.add(knee);

        const shin = mesh(cyl(0.13,0.11,0.55), extraMat);
        shin.position.y = -1.0;
        legGroup.add(shin);

        const foot = mesh(box(0.28,0.12,0.4), bodyMat);
        foot.position.set(0,-1.34,0.06);
        legGroup.add(foot);

        const toe = mesh(box(0.22,0.07,0.1), goldMat);
        toe.position.set(0,-1.4,0.27);
        legGroup.add(toe);
      });

      // ── FLOOR SHADOW / GLOW (ring on ground)
      const shadowRing = mesh(new THREE.TorusGeometry(0.9,0.05,4,40), new THREE.MeshStandardMaterial({color:0xf5c842,emissive:0xf5c842,emissiveIntensity:.4,transparent:true,opacity:.35}));
      shadowRing.rotation.x = Math.PI/2;
      shadowRing.position.y = -0.28;
      root.add(shadowRing);
      robot.shadowRing = shadowRing;

      // ── ANIMATE
      const animate = () => {
        raf = requestAnimationFrame(animate);
        t += 0.018;

        // body hover float
        root.position.y = Math.sin(t)*0.08;

        // head look side to side
        robot.head.rotation.y = Math.sin(t*0.7)*0.35;
        robot.head.rotation.x = Math.sin(t*0.5)*0.06;

        // antenna bobble
        if(robot.ant) robot.ant.rotation.z = Math.sin(t*2)*0.12;
        if(robot.antBall) robot.antBall.position.y = 0.74 + Math.sin(t*3)*0.02;

        // arm swing (opposite)
        if(robot.arms){
          robot.arms[-1].rotation.x = Math.sin(t*1.2)*0.38;
          robot.arms[ 1].rotation.x = Math.sin(t*1.2+Math.PI)*0.38;
          robot.arms[-1].rotation.z =  0.12 + Math.sin(t*0.9)*0.05;
          robot.arms[ 1].rotation.z = -0.12 - Math.sin(t*0.9)*0.05;
        }

        // leg walk
        if(robot.legs){
          robot.legs[-1].rotation.x = Math.sin(t*1.2)*0.22;
          robot.legs[ 1].rotation.x = Math.sin(t*1.2+Math.PI)*0.22;
        }

        // eye glow pulse
        if(glassMat) glassMat.emissiveIntensity = 0.4+Math.sin(t*3)*0.3;

        // waist ring spin
        if(robot.waistRing) robot.waistRing.rotation.z = t;

        // shadow ring pulse opacity
        if(robot.shadowRing) robot.shadowRing.material.opacity = 0.25+Math.sin(t*2)*0.12;

        // belly pulse
        if(robot.belly) robot.belly.material.emissiveIntensity = 0.5+Math.sin(t*4)*0.4;

        // point light orbit
        pt.position.x = Math.sin(t*0.8)*2;
        pt.position.z = Math.cos(t*0.8)*2;

        // slow whole-body y rotation (show off)
        root.rotation.y = Math.sin(t*0.3)*0.4;

        renderer.render(scene, camera);
      };
      animate();
    });

    return () => { if(raf) cancelAnimationFrame(raf); if(renderer) renderer.dispose(); };
  }, []);

  return <canvas ref={mountRef} id="robot-canvas"/>;
}

/* ─── LOGO IMAGE ────────────────────────────────────────────────── */
function AILogo({ ai, size=30 }) {
  const [err,setErr]=useState(false);
  if(err||!ai.logo) return <span className="logo-fb">{ai.fb}</span>;
  return <img src={ai.logo} alt={ai.name} width={size} height={size} onError={()=>setErr(true)} style={{width:size,height:size,objectFit:"contain",borderRadius:4}}/>;
}

/* ─── ALL AI LOGO SVG ───────────────────────────────────────────── */
function AllAILogo({ size = 36 }) {
  return (
    <svg className="nav-logo-svg" width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer hexagon frame */}
      <polygon points="18,2 32,10 32,26 18,34 4,26 4,10" fill="none" stroke="url(#g1)" strokeWidth="1.5"/>
      {/* Inner hexagon */}
      <polygon points="18,7 27,12 27,22 18,27 9,22 9,12" fill="url(#g2)" opacity="0.15"/>
      {/* Robot face circle */}
      <circle cx="18" cy="17" r="7.5" fill="url(#g3)" opacity="0.12"/>
      {/* Eyes */}
      <rect x="13" y="14.5" width="3" height="2.2" rx="1" fill="url(#g1)"/>
      <rect x="20" y="14.5" width="3" height="2.2" rx="1" fill="url(#g1)"/>
      {/* Mouth / grill */}
      <rect x="14" y="18.5" width="1.4" height="1.4" rx="0.4" fill="#f5c842" opacity="0.8"/>
      <rect x="16.3" y="18.5" width="1.4" height="1.4" rx="0.4" fill="#f5c842" opacity="0.8"/>
      <rect x="18.6" y="18.5" width="1.4" height="1.4" rx="0.4" fill="#f5c842" opacity="0.8"/>
      <rect x="20.9" y="18.5" width="1.4" height="1.4" rx="0.4" fill="#f5c842" opacity="0.8"/>
      {/* Antenna */}
      <line x1="18" y1="9.5" x2="18" y2="6.5" stroke="#f5c842" strokeWidth="1" strokeLinecap="round"/>
      <circle cx="18" cy="5.8" r="1.2" fill="#f5c842"/>
      {/* Ear nodes */}
      <circle cx="9.5" cy="17" r="1.5" fill="url(#g1)" opacity="0.9"/>
      <circle cx="26.5" cy="17" r="1.5" fill="url(#g1)" opacity="0.9"/>
      {/* Circuit lines */}
      <line x1="4" y1="17" x2="8" y2="17" stroke="#f5c842" strokeWidth="0.8" opacity="0.5"/>
      <line x1="28" y1="17" x2="32" y2="17" stroke="#f5c842" strokeWidth="0.8" opacity="0.5"/>
      {/* Corner dots */}
      <circle cx="18" cy="2" r="1" fill="#f5c842"/>
      <circle cx="32" cy="10" r="1" fill="#e8a020"/>
      <circle cx="32" cy="26" r="1" fill="#e8a020"/>
      <circle cx="18" cy="34" r="1" fill="#f5c842"/>
      <circle cx="4" cy="26" r="1" fill="#e8a020"/>
      <circle cx="4" cy="10" r="1" fill="#e8a020"/>
      {/* Gradients */}
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f5c842"/>
          <stop offset="100%" stopColor="#e8a020"/>
        </linearGradient>
        <linearGradient id="g2" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f5c842"/>
          <stop offset="100%" stopColor="#22d3ee"/>
        </linearGradient>
        <radialGradient id="g3" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f5c842" stopOpacity="1"/>
          <stop offset="100%" stopColor="#f5c842" stopOpacity="0"/>
        </radialGradient>
      </defs>
    </svg>
  );
}

/* ─── NAVBAR ────────────────────────────────────────────────────── */
function Navbar({ page, nav, theme, toggleTheme }) {
  return (
    <nav>
      <div className="nav-brand" onClick={()=>nav("home")}>
        <AllAILogo size={36}/>
        <span className="nav-wm">ALL AI</span>
      </div>
      <div className="nav-links">
        {[["home","Home"],["favorites","Favorites"],["about","About"]].map(([p,l])=>(
          <button key={p} className={`nav-btn${page===p?" on":""}`} onClick={()=>nav(p)}>{l}</button>
        ))}
        <button className="nav-btn" onClick={toggleTheme} style={{marginLeft:6,fontSize:"1.1rem",padding:"6px 12px"}}>
          {theme==="light"?"🌙":"☀️"}
        </button>
      </div>
    </nav>
  );
}

/* ─── SPLASH ────────────────────────────────────────────────────── */
function Splash({ onEnter }) {
  return (
    <div className="splash pv in">
      <Robot3D/>
      <p className="splash-ey">◈ Welcome to</p>
      <h1 className="splash-title">All AI</h1>
      <p className="splash-sub">Your premium gateway to the universe of artificial intelligence — curating the world's most powerful tools in one interface.</p>
      <button className="splash-btn" onClick={onEnter}>Enter the Hub →</button>
    </div>
  );
}

/* ─── HOME ──────────────────────────────────────────────────────── */
function Home({ nav, favs, toggleFav, showFavoritesOnly=false }) {
  const [q,setQ]=useState("");
  const [cat,setCat]=useState("All");
  const displayCats = CATS;
  const filtered = AI_DATA.filter(a=>{
    const mq=a.name.toLowerCase().includes(q.toLowerCase())||a.desc.toLowerCase().includes(q.toLowerCase())||a.tag.toLowerCase().includes(q.toLowerCase());
    const mc=cat==="All"||a.cat.includes(cat);
    const mf=showFavoritesOnly?favs.includes(a.id):true;
    return mq&&mc&&mf;
  });
  return (
    <div className="home pv in">
      <p className="home-tag">◈ Intelligence Hub</p>
      <h1 className="home-h1">Discover the World's<br/>Best <em>AI Tools</em></h1>
      <p className="home-desc">Curated, categorised, always up to date. Your ultimate AI directory.</p>
      <div className="stats-row">
        {[[`${AI_DATA.length}+`,"Tools Listed"],["14","Categories"],["∞","Possibilities"]].map(([n,l])=>(
          <div className="stat" key={l}><div className="stat-n">{n}</div><div className="stat-l">{l}</div></div>
        ))}
      </div>
      <div className="sw">
        <input className="sb" placeholder="Search tools, categories, capabilities…" value={q} onChange={e=>setQ(e.target.value)}/>
        <button className="si">⌕</button>
      </div>
      <p className="sec-lbl">Filter by Category</p>
      <div className="cats">
        {displayCats.map(c=><button key={c} className={`cat${cat===c?" on":""}`} onClick={()=>setCat(c)}>{c}</button>)}
      </div>
      <p className="sec-lbl" style={{marginBottom:18}}>{filtered.length} tool{filtered.length!==1?"s":""}{cat!=="All"?` · ${cat}`:""}</p>
      {filtered.length===0
        ? <div className="empty-st">No tools found for "<strong>{q}</strong>"</div>
        : <div className="grid">
            {filtered.map(ai=>{
              const isFav = favs.includes(ai.id);
              return (
              <div className="ai-card" key={ai.id} onClick={()=>nav("detail",ai)}>
                <button className={`fav-btn${isFav?" active":""}`} onClick={(e)=>{e.stopPropagation();toggleFav(ai.id);}}>{isFav?"★":"☆"}</button>
                <div className="logo-box"><AILogo ai={ai}/></div>
                <div className="cn">{ai.name}</div>
                <div className="cd">{ai.desc}</div>
                <div className="ct">{ai.tag}</div>
                <div className="ca">↗</div>
              </div>
            )})}
          </div>
      }
    </div>
  );
}

/* ─── DETAIL ────────────────────────────────────────────────────── */
function Detail({ ai, nav }) {
  const [err,setErr]=useState(false);
  if(!ai) return null;
  return (
    <div className="detail pv in">
      <div className="back-btn" onClick={()=>nav("home")}>← Back to Hub</div>
      <div className="dc">
        <div className="dlb">
          {!err&&ai.logo ? <img src={ai.logo} alt={ai.name} onError={()=>setErr(true)} style={{width:56,height:56,objectFit:"contain"}}/> : <span className="dlb-fb">{ai.fb}</span>}
        </div>
        <div className="db">
          <div className="dp">
            <span className="dpi g">{ai.tag}</span>
            {ai.cat.map(c=><span key={c} className="dpi">{c}</span>)}
          </div>
          <div className="dn">{ai.name}</div>
          <p className="dd">{ai.desc}<br/><br/>{ai.name} empowers creators, developers, and teams to harness AI for real-world results across {ai.cat.join(", ")}.</p>
          <a className="vbtn" href={ai.url} target="_blank" rel="noopener noreferrer">Visit {ai.name} ↗</a>
        </div>
      </div>
    </div>
  );
}

/* ─── ABOUT ─────────────────────────────────────────────────────── */
function About() {
  return (
    <div className="about pv in">
      <div style={{marginBottom:36,display:"flex",justifyContent:"center"}}>
        <Robot3D/>
      </div>
      <h2>About <em>All AI</em></h2>
      <p>All AI is your premium gateway to the universe of artificial intelligence. We curate, catalogue and present the world's most powerful AI tools — from language models and image generators to code assistants and video editors — in a single beautiful interface.<br/><br/>Whether you're a creator, developer, or business exploring AI — All AI has you covered with real logos, accurate descriptions, and direct links to every tool.</p>
      <div className="stats-row">
        {[["110+","Tools Listed"],["2025","Founded"],["14","Categories"]].map(([n,l])=>(
          <div className="stat" key={l}><div className="stat-n">{n}</div><div className="stat-l">{l}</div></div>
        ))}
      </div>
    </div>
  );
}

/* ─── ROOT ──────────────────────────────────────────────────────── */
export default function App() {
  const [page,setPage]=useState("splash");
  const [ai,setAI]=useState(null);
  const [fading,setFading]=useState(false);
  const [theme,setTheme]=useState("light");
  const [favs,setFavs]=useState(()=>JSON.parse(localStorage.getItem("aa_favs")||"[]"));

  const toggleFav=(id)=>{
    const n=favs.includes(id)?favs.filter(i=>i!==id):[...favs,id];
    setFavs(n); localStorage.setItem("aa_favs",JSON.stringify(n));
  };

  useEffect(()=>{ document.body.setAttribute("data-theme",theme); },[theme]);
  const toggleTheme=()=>setTheme(t=>t==="light"?"dark":"light");

  const nav=useCallback((to,data=null)=>{
    if(fading)return;
    setFading(true);
    setTimeout(()=>{ setPage(to); setAI(data); setFading(false); window.scrollTo({top:0,behavior:"smooth"}); },440);
  },[fading]);

  return (
    <>
      <style>{STYLES}</style>
      <ParticleBg/>
      <div className="grain"/>
      <Cursor/>
      {page!=="splash"&&<Navbar page={page} nav={nav} theme={theme} toggleTheme={toggleTheme}/>}
      <div style={{opacity:fading?0:1,transform:fading?"translateY(16px)":"translateY(0)",transition:"all .44s cubic-bezier(.22,1,.36,1)"}}>
        {page==="splash"     &&<Splash onEnter={()=>nav("home")}/>}
        {page==="home"       &&<Home nav={nav} favs={favs} toggleFav={toggleFav}/>}
        {page==="favorites"  &&<Home nav={nav} favs={favs} toggleFav={toggleFav} showFavoritesOnly={true}/>}
        {page==="detail"     &&<Detail ai={ai} nav={nav}/>}
        {page==="about"      &&<About/>}
      </div>
    </>
  );
}
