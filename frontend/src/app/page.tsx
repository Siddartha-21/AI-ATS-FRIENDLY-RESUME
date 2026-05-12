"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Cpu, CheckCircle, XCircle, Download, Sparkles, Loader2, ArrowRight, Activity, AlertCircle, FileLock2, BarChart4, ChevronRight, Printer, UserPlus, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Image from 'next/image';

const API_URL = "http://127.0.0.1:8000/api/v1/resumes";

export default function Home() {
  const [step, setStep] = useState(1);
  const [flowType, setFlowType] = useState<"upload" | "interview">("upload");
  const [prepMode, setPrepMode] = useState(false);
  
  const [jd, setJd] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [chatMsgs, setChatMsgs] = useState<{role: string, text: string}[]>([]);
  const [chatSuggestions, setChatSuggestions] = useState<string[]>([]);
  const [chatInput, setChatInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (analysis && step === 2 && flowType === 'upload' && chatMsgs.length === 0 && !prepMode) {
        const keywords = analysis.recommended_keywords?.join(', ') || 'strategic keywords';
        setChatMsgs([
            { role: "ai", text: `I have analyzed your profile. To boost your score from ${analysis.ats_score}% to 95%+, I strongly recommend integrating these keywords into your experience bullet points: ${keywords}. How would you like me to help you rewrite them?` }
        ]);
        setChatSuggestions(["Rewrite my Summary", "Add keywords to my latest role", "Generate a new bullet point"]);
    }
  }, [analysis, step, flowType, prepMode]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setFile(e.target.files[0]);
          setErrorMsg("");
      }
  };

  const handleAnalyzeUpload = async () => {
      setErrorMsg("");
      if (!jd.trim()) return setErrorMsg("Job Description is required for high-accuracy analysis.");
      if (!file) return setErrorMsg("A PDF Resume is required. Alternatively, use 'Build from Scratch'.");
      
      setLoading(true);
      setFlowType("upload");
      setPrepMode(false);
      const formData = new FormData();
      formData.append("resume_file", file);
      formData.append("job_description", jd);
      
      try {
          const res = await axios.post(`${API_URL}/analyze`, formData);
          setAnalysis(res.data);
          setStep(2);
      } catch (err: any) {
          console.error(err);
          setErrorMsg(err.response?.data?.detail || "Analysis failed. Ensure the FastAPI backend is running.");
      }
      setLoading(false);
  };

  const handleStartInterview = async () => {
      setErrorMsg("");
      if (!jd.trim()) return setErrorMsg("Job Description is required to initiate an AI Interview.");
      
      setLoading(true);
      setFlowType("interview");
      setPrepMode(false);
      setChatMsgs([]); 
      setChatSuggestions([]);
      
      try {
          const res = await axios.post(`${API_URL}/start_interview`, { job_description: jd });
          setChatMsgs([{ role: "ai", text: res.data.reply }]);
          setChatSuggestions(res.data.suggestions || []);
          setStep(2);
      } catch (err: any) {
          console.error(err);
          setErrorMsg("Failed to initiate interview. Ensure FastAPI is running.");
      }
      setLoading(false);
  };

  const handleStartPrep = async () => {
      setPrepMode(true);
      setLoading(true);
      setChatMsgs([]);
      setChatSuggestions([]);
      try {
          const res = await axios.post(`${API_URL}/start_prep`, { job_description: jd });
          setChatMsgs([{ role: "ai", text: res.data.reply }]);
          setChatSuggestions(res.data.suggestions || []);
      } catch (err) {
          console.error(err);
          setErrorMsg("Failed to initiate prep agent.");
      }
      setLoading(false);
  };

  const handleExport = async (format: string) => {
      setLoading(true);
      try {
          const payload = {
              name: "Lumina CV Optimized Resume",
              summary: "Results-driven professional with expertise tailored specifically to the provided job description. Leveraged Lumina CV AI interview metrics to formulate maximum ATS compatibility.",
              experience: [
                  "Engineered optimized pathways for ATS matching.",
                  "Deployed responsive and scalable AI infrastructures."
              ],
              skills: analysis?.matched_skills?.join(', ') || 'Leadership, Communication, Architecture'
          };
          
          const response = await axios.post(`${API_URL}/export/${format}`, payload, {
              responseType: 'blob' 
          });
          
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `Lumina_Resume.${format}`);
          document.body.appendChild(link);
          link.click();
          link.remove();
      } catch (err) {
          console.error("Export failed:", err);
          setErrorMsg("Failed to generate document.");
      }
      setLoading(false);
  };

  const handlePrint = () => {
      window.print();
  };

  const sendChat = async (e?: React.FormEvent, customText?: string) => {
      e?.preventDefault();
      const textToSend = customText || chatInput;
      if (!textToSend.trim()) return;
      
      const newMsgs = [...chatMsgs, { role: "user", text: textToSend }];
      setChatMsgs(newMsgs);
      setChatInput("");
      setChatSuggestions([]); 
      setLoading(true);
      
      try {
          const endpoint = prepMode ? "/chat_prep" : "/chat_interview";
          const res = await axios.post(`${API_URL}${endpoint}`, {
              job_description: jd,
              history: newMsgs
          });
          setChatMsgs([...newMsgs, { role: "ai", text: res.data.reply }]);
          setChatSuggestions(res.data.suggestions || []);
      } catch (err) {
          console.error(err);
          setChatMsgs([...newMsgs, { role: "ai", text: "I encountered a neural hiccup connecting to the backend. Could you try answering that again?" }]);
      }
      setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#030305] text-slate-200 overflow-x-hidden flex flex-col font-sans relative selection:bg-cyan-500/30">
      
      {/* 3D Cinematic Background Environment */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden print:hidden">
         <motion.div 
            animate={{ rotate: 360, scale: [1, 1.1, 1] }} 
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className={`absolute -top-[30%] -left-[20%] w-[70vw] h-[70vw] rounded-full blur-[150px] mix-blend-screen transition-colors duration-1000 ${prepMode ? 'bg-amber-900/10' : 'bg-cyan-900/10'}`} 
         />
         <motion.div 
            animate={{ rotate: -360, scale: [1, 1.2, 1] }} 
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className={`absolute -bottom-[40%] -right-[20%] w-[80vw] h-[80vw] rounded-full blur-[150px] mix-blend-screen transition-colors duration-1000 ${prepMode ? 'bg-red-900/10' : 'bg-purple-900/10'}`} 
         />
         <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-5" />
      </div>

      {/* Nav / Header */}
      <header className="relative z-20 border-b border-white/5 bg-black/40 backdrop-blur-2xl px-8 py-4 flex items-center justify-between sticky top-0 print:hidden">
        <div className="flex items-center gap-4">
            <div className={`relative w-12 h-12 rounded-xl overflow-hidden bg-black/50 border border-white/10 flex items-center justify-center transition-all ${prepMode ? 'shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'shadow-[0_0_20px_rgba(0,240,255,0.2)]'}`}>
                <Image src="/logo.png" alt="Lumina CV Logo" fill className="object-cover p-1" />
            </div>
            <div>
                <h1 className={`text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r ${prepMode ? 'from-amber-400 via-orange-500 to-red-500' : 'from-cyan-400 via-blue-500 to-purple-500'}`}>
                Lumina CV
                </h1>
                <p className={`text-[10px] font-bold tracking-widest uppercase transition-colors ${prepMode ? 'text-amber-500/70' : 'text-cyan-500/70'}`}>
                {prepMode ? 'Premium Prep Agent' : 'High-Accuracy ATS Engine'}
                </p>
            </div>
        </div>
        <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-green-400 bg-green-400/10 px-3 py-1.5 rounded-full border border-green-400/20">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                SYSTEM ONLINE
            </div>
        </div>
      </header>

      {/* Error Toast */}
      <AnimatePresence>
          {errorMsg && (
              <motion.div 
                 initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 20 }} exit={{ opacity: 0, y: -50 }}
                 className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-red-950/90 border border-red-500/50 backdrop-blur-xl px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 print:hidden"
              >
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-sm font-medium text-red-200">{errorMsg}</p>
                  <button onClick={() => setErrorMsg("")} className="ml-4 text-red-500 hover:text-red-300"><XCircle className="w-4 h-4"/></button>
              </motion.div>
          )}
      </AnimatePresence>

      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8 lg:p-12 relative z-10 flex flex-col justify-center print:p-0">
        <AnimatePresence mode="wait">
            
            {/* STEP 1: INGESTION PIPELINE */}
            {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="w-full max-w-2xl mx-auto flex flex-col gap-6">
                  <div className="bg-[#0A0A0E]/80 border border-white/5 backdrop-blur-3xl rounded-[2rem] p-8 shadow-2xl flex-1 flex flex-col relative group">
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                     
                     <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight">
                            <FileLock2 className="w-8 h-8 text-cyan-400"/> Context Ingestion
                        </h2>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">Step 01</span>
                     </div>
                     
                     <div className="mb-8">
                         <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Target Job Description (Required)</label>
                         <textarea 
                            value={jd}
                            onChange={e => setJd(e.target.value)}
                            className="w-full min-h-[160px] bg-black/50 border border-white/10 rounded-2xl p-5 text-sm focus:ring-1 focus:ring-cyan-500/50 outline-none resize-none custom-scrollbar placeholder:text-slate-700 transition-all hover:border-white/20"
                            placeholder="Paste the precise job requirements here for hyper-accurate ATS evaluation..."
                         />
                     </div>

                     <div className="flex-1 flex flex-col justify-end gap-6">
                         <div>
                             <motion.div 
                               whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                               onClick={() => fileInputRef.current?.click()}
                               className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 bg-black/40 ${file ? 'border-cyan-500/50 shadow-[0_0_30px_rgba(0,240,255,0.1)]' : 'border-white/10 hover:border-cyan-500/30 hover:bg-cyan-500/5'}`}
                             >
                                <Upload className={`w-8 h-8 mb-3 transition-colors ${file ? 'text-cyan-400' : 'text-slate-600'}`} />
                                <span className="text-base font-bold text-white mb-1">
                                    {file ? file.name : "Select Base Resume to Optimize"}
                                </span>
                             </motion.div>
                             <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.docx" />
                             
                             <button 
                               onClick={handleAnalyzeUpload} 
                               disabled={loading && flowType === 'upload'}
                               className="relative w-full mt-4 py-4 rounded-2xl bg-white text-black font-black tracking-widest uppercase text-xs hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:scale-100 overflow-hidden group shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                             >
                                 <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
                                 {(loading && flowType === 'upload') ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <Sparkles className="w-4 h-4 text-black" />}
                                 {(loading && flowType === 'upload') ? "Analyzing Matrix Parameters..." : "Engage Deep AI Analysis"}
                             </button>
                         </div>

                         <div className="flex items-center gap-4 py-2">
                             <div className="h-[1px] flex-1 bg-white/10" />
                             <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">OR</span>
                             <div className="h-[1px] flex-1 bg-white/10" />
                         </div>

                         <button 
                           onClick={handleStartInterview} 
                           disabled={loading && flowType === 'interview'}
                           className="relative w-full py-4 rounded-2xl bg-[#111118] border border-fuchsia-500/30 text-fuchsia-300 font-black tracking-widest uppercase text-xs hover:bg-fuchsia-500/10 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-[0_0_20px_rgba(217,70,239,0.1)]"
                         >
                             {(loading && flowType === 'interview') ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                             {(loading && flowType === 'interview') ? "Initializing Lumina AI..." : "Initiate AI Interview (Build from Scratch)"}
                         </button>

                     </div>
                  </div>
                </motion.div>
            )}

            {/* STEP 2: NEURAL BUILDER / PREP AGENT */}
            {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className={`w-full flex flex-col ${flowType==='upload'?'lg:flex-row':'lg:flex-col'} gap-8 h-[80vh]`}>
                    
                    {/* Metrics Sidebar */}
                    {flowType === 'upload' && analysis && (
                        <div className="lg:w-1/3 flex flex-col gap-6">
                            <div className="bg-[#0A0A0E]/80 border border-white/5 backdrop-blur-3xl rounded-[2rem] p-8 shadow-2xl flex-1 flex flex-col items-center relative overflow-y-auto custom-scrollbar">
                                 <div className="flex items-center justify-between w-full mb-6">
                                    <h2 className="text-lg font-bold text-white flex items-center gap-3">
                                        <BarChart4 className="w-5 h-5 text-purple-400"/> Deep Metrics
                                    </h2>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">Step 02</span>
                                 </div>
                                 
                                 <div className="relative w-48 h-48 flex items-center justify-center mb-6">
                                    <div className="absolute inset-0 rounded-full border-[2px] border-white/5 animate-[spin_15s_linear_infinite]" />
                                    <div className="absolute inset-4 rounded-full border-[2px] border-dashed border-cyan-500/30 animate-[spin_20s_linear_infinite_reverse]" />
                                    <div className="absolute inset-0 rounded-full shadow-[0_0_80px_rgba(0,240,255,0.15)]" />
                                    <div className="flex flex-col items-center justify-center z-10">
                                        <span className="text-6xl font-black bg-gradient-to-b from-white via-slate-200 to-slate-500 bg-clip-text text-transparent drop-shadow-2xl">
                                            {analysis.ats_score}
                                        </span>
                                        <span className="text-[10px] font-bold tracking-[0.3em] text-cyan-500/80 mt-2">ATS MATCH</span>
                                    </div>
                                 </div>

                                 <div className="w-full flex flex-col gap-4 mb-6">
                                     <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                                         <span className="text-xs font-bold text-slate-400">Keyword Match Rate</span>
                                         <span className="text-sm font-black text-cyan-400">{analysis.keyword_match_rate}%</span>
                                     </div>
                                     <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                                         <span className="text-xs font-bold text-slate-400">Action Verb Power</span>
                                         <span className="text-sm font-black text-purple-400">{analysis.action_verb_score}%</span>
                                     </div>
                                 </div>

                                 {/* NEW PREP AGENT BUTTON */}
                                 {analysis.ats_score >= 60 && !prepMode && (
                                     <motion.button 
                                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                        onClick={handleStartPrep} 
                                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black uppercase tracking-widest text-[10px] shadow-[0_0_20px_rgba(217,119,6,0.4)] transition-all transform hover:scale-105 flex justify-center items-center gap-2 mb-4"
                                     >
                                        <Target className="w-4 h-4"/> Engage Interview Prep Agent
                                     </motion.button>
                                 )}
                                 
                                 <button onClick={() => setStep(3)} className="w-full mt-auto py-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/50 font-bold text-sm transition-colors flex items-center justify-center gap-2">
                                    Proceed to Synthesis <ChevronRight className="w-4 h-4"/>
                                 </button>
                            </div>
                        </div>
                    )}

                    {/* Massive Neural Builder Chat / Prep Agent Chat */}
                    <div className={`bg-[#0A0A0E]/80 border ${prepMode ? 'border-amber-500/30 shadow-[0_0_40px_rgba(245,158,11,0.15)]' : 'border-white/5 shadow-2xl'} backdrop-blur-3xl rounded-[2rem] flex flex-col overflow-hidden relative ${flowType==='upload' ? 'lg:w-2/3' : 'w-full h-full'}`}>
                         <div className="p-6 border-b border-white/5 bg-black/40 flex justify-between items-center">
                             <div className="flex items-center gap-3">
                                 {prepMode ? <Target className="w-6 h-6 text-amber-500"/> : <Cpu className="w-6 h-6 text-fuchsia-400"/>}
                                 <div>
                                    <h2 className={`text-xl font-bold ${prepMode ? 'text-amber-400' : 'text-white'}`}>
                                        {prepMode ? 'Premium Interview Prep Agent' : (flowType === 'upload' ? 'Neural Builder Interface' : 'Lumina AI Assistant')}
                                    </h2>
                                    <p className={`text-[10px] uppercase tracking-widest font-bold ${prepMode ? 'text-amber-500/70' : 'text-fuchsia-400'}`}>
                                        {prepMode ? 'Strict Professional Mode Enabled' : 'Friendly Mode Enabled'}
                                    </p>
                                 </div>
                             </div>
                             
                             {(flowType === 'interview' || prepMode) && (
                                 <button onClick={() => setStep(3)} className={`px-5 py-2.5 text-black font-bold text-xs uppercase tracking-widest rounded-xl flex items-center gap-2 transition-all hover:scale-105 ${prepMode ? 'bg-amber-500 hover:bg-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-fuchsia-500 hover:bg-fuchsia-400 shadow-[0_0_15px_rgba(217,70,239,0.3)]'}`}>
                                     End Session & Generate <ChevronRight className="w-4 h-4"/>
                                 </button>
                             )}
                         </div>
                         
                         <div className="flex-1 p-8 overflow-y-auto flex flex-col gap-6 custom-scrollbar bg-black/20">
                             {chatMsgs.map((msg, i) => (
                                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={i} className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                                     <div className={`max-w-[80%] p-5 rounded-3xl text-sm leading-relaxed shadow-lg ${msg.role === 'ai' ? 'bg-[#111118] border border-white/10 rounded-tl-sm text-slate-300' : (prepMode ? 'bg-gradient-to-br from-amber-600 to-orange-600 text-white rounded-tr-sm font-medium' : 'bg-gradient-to-br from-cyan-600 to-blue-600 text-white rounded-tr-sm font-medium')}`}>
                                         {msg.text}
                                     </div>
                                 </motion.div>
                             ))}
                             {loading && (
                                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                                     <div className="bg-[#111118] border border-white/10 rounded-3xl rounded-tl-sm p-5 flex items-center gap-3 text-slate-400 text-sm">
                                         <Loader2 className="w-4 h-4 animate-spin" /> {prepMode ? 'Evaluating response...' : 'Lumina is thinking...'}
                                     </div>
                                 </motion.div>
                             )}
                         </div>
                         
                         <div className="bg-[#0A0A0E] border-t border-white/5 flex flex-col">
                             {chatSuggestions.length > 0 && (
                                 <div className="px-6 pt-4 flex flex-wrap gap-2">
                                     {chatSuggestions.map((sug, i) => (
                                         <button 
                                             key={i} 
                                             onClick={() => sendChat(undefined, sug)}
                                             className={`px-4 py-2 text-xs font-bold rounded-full transition-all hover:scale-105 active:scale-95 border ${prepMode ? 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-400' : 'bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/30 text-cyan-400'}`}
                                         >
                                             {sug}
                                         </button>
                                     ))}
                                 </div>
                             )}
                             
                             <form onSubmit={(e) => sendChat(e)} className="p-6 flex gap-4">
                                 <input 
                                    value={chatInput} 
                                    onChange={e=>setChatInput(e.target.value)} 
                                    disabled={loading}
                                    type="text" 
                                    className={`flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none placeholder:text-slate-600 text-white transition-all disabled:opacity-50 focus:ring-1 ${prepMode ? 'focus:ring-amber-500' : 'focus:ring-cyan-500'}`} 
                                    placeholder={prepMode ? "Draft your interview answer here..." : (flowType === 'upload' ? "E.g., Rewrite my bullet point to include 'CI/CD'..." : "Type your custom answer or ask a doubt here...")}
                                 />
                                 <button disabled={loading} type="submit" className={`px-8 rounded-2xl transition-all font-bold flex items-center gap-2 disabled:opacity-50 border ${prepMode ? 'bg-amber-500/20 hover:bg-amber-500/40 border-amber-500/50 text-amber-400' : 'bg-cyan-500/20 hover:bg-cyan-500/40 border-cyan-500/50 text-cyan-400'}`}>
                                     {prepMode ? 'Submit Answer' : 'Transmit'} <ArrowRight className="w-5 h-5"/>
                                 </button>
                             </form>
                         </div>
                    </div>

                </motion.div>
            )}

            {/* STEP 3: OUTPUT / SYNTHESIS / PRINTING */}
            {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="w-full max-w-2xl mx-auto flex flex-col gap-6 print:max-w-none print:shadow-none print:bg-white print:text-black">
                  <div className="bg-[#0A0A0E]/80 border border-white/5 backdrop-blur-3xl rounded-[2rem] p-10 shadow-2xl flex-1 flex flex-col items-center relative group print:bg-white print:border-none print:shadow-none print:p-0">
                     <div className="flex items-center justify-between w-full mb-10 print:hidden">
                        <h2 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight">
                            <Download className="w-8 h-8 text-blue-400"/> Output Synthesis
                        </h2>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">Step 03</span>
                     </div>
                     
                     {/* 3D Holographic Document Scanner - Hidden during Print */}
                     <div className="w-full bg-black/60 border border-white/10 rounded-3xl relative overflow-hidden flex flex-col items-center justify-center p-12 mb-10 shadow-inner print:hidden">
                         <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                         <div className="absolute top-0 left-0 right-0 h-[2px] bg-cyan-400 shadow-[0_0_20px_#22d3ee,0_0_40px_#22d3ee] animate-[scan_3s_ease-in-out_infinite]" />
                         
                         <motion.div 
                            whileHover={{ scale: 1.05, rotateY: 10, rotateX: 5 }} 
                            className="w-full max-w-[220px] aspect-[1/1.414] bg-white border border-white/20 rounded-md shadow-[0_0_50px_rgba(255,255,255,0.1)] p-6 relative z-10 flex flex-col gap-4 transform-gpu perspective-1000"
                         >
                             <div className="h-4 bg-slate-800 w-3/4 rounded-sm" />
                             <div className="h-2 bg-slate-300 w-1/2 mb-3 rounded-sm" />
                             <div className="h-2 bg-slate-200 w-full rounded-sm" />
                             <div className="h-2 bg-slate-200 w-full rounded-sm" />
                             <div className="h-2 bg-slate-200 w-5/6 mb-5 rounded-sm" />
                             <div className="h-2 bg-slate-400 w-1/3 rounded-sm" />
                             <div className="h-2 bg-slate-200 w-full rounded-sm" />
                         </motion.div>
                         
                         <div className="mt-10 flex items-center gap-3 px-5 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
                             <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                             <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Document Render Engine Ready</p>
                         </div>
                     </div>

                     {/* The Printable Mock Resume */}
                     <div className="hidden print:block w-full text-black">
                         <h1 className="text-3xl font-bold mb-4">Lumina CV Optimized Resume</h1>
                         <p className="text-sm mb-6">Target JD: {jd}</p>
                         <hr className="mb-6 border-black" />
                         <div className="flex flex-col gap-4 text-sm">
                             <p><strong>Professional Summary</strong></p>
                             <p>Results-driven professional with expertise tailored specifically to the provided job description. Leveraged Lumina CV AI interview metrics to formulate maximum ATS compatibility.</p>
                             <p><strong>Experience</strong></p>
                             <p>• Engineered optimized pathways for ATS matching.</p>
                             <p>• Deployed responsive and scalable AI infrastructures.</p>
                             <p><strong>Skills</strong></p>
                             <p>{analysis?.matched_skills?.join(', ') || 'Leadership, Communication, Architecture'}</p>
                         </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full print:hidden">
                         <button onClick={() => handleExport('pdf')} className="py-5 bg-[#111118] hover:bg-white/10 border border-white/10 hover:border-red-500/50 text-slate-300 hover:text-white text-base font-bold tracking-widest rounded-2xl transition-all shadow-lg flex flex-col items-center justify-center gap-2 group/btn">
                             <span className="text-red-400 group-hover/btn:scale-110 transition-transform">Download PDF</span>
                             <span className="text-[10px] text-slate-500 uppercase">Universal Format</span>
                         </button>
                         <button onClick={() => handleExport('docx')} className="py-5 bg-[#111118] hover:bg-white/10 border border-white/10 hover:border-blue-500/50 text-slate-300 hover:text-white text-base font-bold tracking-widest rounded-2xl transition-all shadow-lg flex flex-col items-center justify-center gap-2 group/btn">
                             <span className="text-blue-400 group-hover/btn:scale-110 transition-transform">Download DOCX</span>
                             <span className="text-[10px] text-slate-500 uppercase">Editable Word Doc</span>
                         </button>
                         <button onClick={handlePrint} className="py-5 bg-[#111118] hover:bg-white/10 border border-white/10 hover:border-fuchsia-500/50 text-slate-300 hover:text-white text-base font-bold tracking-widest rounded-2xl transition-all shadow-lg flex flex-col items-center justify-center gap-2 group/btn">
                             <span className="text-fuchsia-400 group-hover/btn:scale-110 transition-transform">Print Document</span>
                             <span className="text-[10px] text-slate-500 uppercase">Direct to Printer</span>
                         </button>
                     </div>
                     
                     <button onClick={() => { setStep(1); setFile(null); setJd(""); setAnalysis(null); setChatMsgs([]); setFlowType("upload"); setPrepMode(false); }} className="mt-8 text-xs font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest underline decoration-white/20 underline-offset-4 print:hidden">
                        Start New Session
                     </button>
                  </div>
                </motion.div>
            )}

        </AnimatePresence>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
            0% { top: 0%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        .perspective-1000 { perspective: 1000px; }
      `}} />
    </div>
  );
}
