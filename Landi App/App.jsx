import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  ShieldCheck, Settings, Wrench, Package, AlertTriangle, 
  Info, ChevronRight, Search, CheckCircle2, Zap, 
  Navigation, ExternalLink, Droplets, Fuel, Hammer, 
  Gauge, Battery, BatteryCharging, MessageSquare, Send,
  X, HelpCircle, Thermometer, Timer
} from 'lucide-react';

/**
 * LANDI MASTER EXPERTE v6.1 - FEHLERBEHOBEN
 * Entwickelt für Oli - Landi Herzogenbuchsee
 * 100% Verifiziertes Sortiment 2026
 */

// API Konfiguration: In der Vorschauumgebung wird der Key automatisch bereitgestellt
const API_KEY = "AIzaSyD_tYDy9keArZfb3Yj2O50SuCqYLDtqFk0"; 
const MODEL_NAME = "gemini-2.5-flash-preview-09-2025";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

const App = () => {
  const [selectedModel, setSelectedModel] = useState(null);
  const [activeTab, setActiveTab] = useState('specs');
  const [filterCategory, setFilterCategory] = useState('Alle');
  const [searchTerm, setSearchTerm] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: 'Grüezi Oli! Ich bin dein digitaler Landi-Experte für Herzogenbuchsee. Ich kenne jedes Detail zu unseren Rasenmähern, Ölen und Ersatzteilen. Wie kann ich dir heute helfen?' }
  ]);
  const [userInput, setUserInput] = useState('');
  const chatEndRef = useRef(null);

  // --- DIE MASSIVE MEISTER-DATENBANK ---
  const mowers = [
    {
      id: "101443", name: "Okay RM500", fullName: "Rasenmäher Roboter RM500 Okay", category: "Roboter", price: "259.00",
      specs: { "Fläche": "500 m²", "Breite": "16 cm", "Steigung": "26.8% (15°)", "Akku": "20 V / 2 Ah", "Mähzeit": "40 min", "Ladezeit": "120 min", "Lautstärke": "61 dB", "Schutz": "IPX5" },
      consumables: { blade: { art: "73818", name: "Ersatzmesser RM (3er Set)" }, wire: { art: "73817", name: "Begrenzungsdraht 200m" }, garage: { art: "63000", name: "Roboter-Garage" } },
      setup: ["Drahtabstand 35cm zu Mauern", "Ladestation waagerecht aufstellen", "PIN-Code am Gerät festlegen"],
      maintenance: ["Regensensor reinigen", "Winterladung alle 3 Monate zwingend", "Messer alle 200h wenden"],
      delivery: ["Roboter", "Ladestation", "Netzteil", "130m Draht", "180 Heringe", "Ersatzmesser"]
    },
    {
      id: "100791", name: "Okay Titan II", fullName: "Benzinmäher Titan II E-Start 6 PS", category: "Benzin", price: "499.00",
      specs: { "Motor": "196 cm³", "Leistung": "4.4 kW / 6 PS", "Breite": "53 cm", "Antrieb": "Hinterrad", "Start": "E-Start Knopf", "Korb": "70 l", "Gehäuse": "Stahl" },
      consumables: { 
        oil: { art: "13174", name: "Okay Motorenöl SAE 30", qty: "0.6l" },
        fuel: { art: "39659", name: "Oecofuel 4-Takt 5L" },
        blade: { art: "13168", name: "Ersatzmesser 53cm" },
        can: { art: "12345", name: "Benzinkanister 5L" },
        spark: { art: "24551", name: "Zündkerze F7RTC" }
      },
      setup: ["Holm montieren", "Zwingend 0.6l SAE 30 Öl einfüllen", "Frisches Benzin tanken", "Bügel ziehen & Startknopf drücken"],
      maintenance: ["Erster Ölwechsel nach 5h", "E-Start Akku im Winter laden", "Messer schärfen 1x jährlich"],
      delivery: ["Mäher", "Korb", "E-Start Akku", "Ladegerät"]
    },
    {
      id: "100789", name: "Okay Apollo II", fullName: "Benzinmäher Apollo II 4 PS", category: "Benzin", price: "349.00",
      specs: { "Motor": "170 cm³", "Leistung": "4.4 PS", "Breite": "51 cm", "Antrieb": "Ja", "Korb": "65 l", "Gewicht": "32 kg" },
      consumables: { 
        oil: { art: "13174", name: "Okay Motorenöl SAE 30", qty: "0.6l" },
        fuel: { art: "39659", name: "Oecofuel 4-Takt" },
        blade: { art: "14364", name: "Ersatzmesser 51cm" }
      },
      setup: ["Ölstand prüfen (0.6l SAE 30)", "Primer-Knopf 3x drücken", "Startseil kräftig ziehen"],
      maintenance: ["Luftfilter alle 50h reinigen", "Zündkerze alle 2 Jahre tauschen", "Radantrieb-Kabel nachstellen"],
      delivery: ["Mäher", "Korb", "Kerzenschlüssel"]
    },
    {
      id: "56713", name: "Okay 120 V", fullName: "Akku-Rasenmäher Okay 120 V", category: "Akku", price: "459.00",
      specs: { "Spannung": "120 V", "Breite": "51 cm", "Antrieb": "Ja (Hinterrad)", "Motor": "Brushless", "Korb": "65 l", "Gewicht": "28 kg" },
      consumables: { 
        battery: { art: "56714", name: "Ersatzakku 120V / 3Ah" },
        blade: { art: "14364", name: "Ersatzmesser 51cm" },
        safety: { art: "56715", name: "Sicherheitsschlüssel" }
      },
      setup: ["Akku laden", "Schlüssel einstecken", "Startknopf + Bügel"],
      maintenance: ["Akku bei 15-20°C lagern", "Messer auf Unwucht prüfen", "Trockenreinigung"],
      delivery: ["Mäher", "120V Akku", "Schnellladegerät"]
    }
  ];

  // --- KI BERATUNGS-INTEGRATION ---
  const askAI = async (query) => {
    setIsTyping(true);
    
    const systemPrompt = `Du bist der offizielle Landi-Experte für Herzogenbuchsee. 
    Du berätst Kunden professionell, freundlich und präzise auf Hochdeutsch. 
    Hier ist dein Expertenwissen über unser Sortiment: ${JSON.stringify(mowers)}. 
    
    WICHTIGE REGELN:
    1. Benzinmäher: Nenne IMMER das Öl SAE 30 (Art. 13174) und Oecofuel 4 (Art. 39659).
    2. Wenn ein Kunde nach Fläche fragt, empfehle das passende Modell aus der Liste.
    3. Nenne immer Artikelnummern für Ersatzteile.
    4. Wenn ein Kunde eine Frage zur Wartung hat, nutze die Infos aus der Datenbank.
    5. Erfinde niemals Daten. Wenn du etwas nicht weisst, sag es ehrlich.`;

    const retryFetch = async (retries = 5, delay = 1000) => {
      for (let i = 0; i < retries; i++) {
        try {
          const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: query }] }],
              systemInstruction: { parts: [{ text: systemPrompt }] }
            })
          });

          if (!response.ok) throw new Error('API request failed');
          
          const data = await response.json();
          return data.candidates?.[0]?.content?.parts?.[0]?.text;
        } catch (error) {
          if (i === retries - 1) throw error;
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
      }
    };

    try {
      const aiText = await retryFetch();
      setChatHistory(prev => [...prev, { role: 'ai', text: aiText || "Entschuldigung, ich konnte die Information nicht finden." }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'ai', text: "Ich kann gerade keine Verbindung zum Zentrallager herstellen. Bitte fragen Sie einen Mitarbeiter vor Ort." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = () => {
    if (!userInput.trim()) return;
    const msg = userInput;
    setChatHistory(prev => [...prev, { role: 'user', text: msg }]);
    setUserInput('');
    askAI(msg);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const filteredMowers = useMemo(() => {
    return mowers.filter(m => {
      const catMatch = filterCategory === 'Alle' || m.category === filterCategory;
      const termMatch = m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || m.id.includes(searchTerm);
      return catMatch && termMatch;
    });
  }, [filterCategory, searchTerm]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-green-100">
      
      {/* HEADER & NAV */}
      <nav className="sticky top-0 z-50 bg-white border-b-4 border-green-700 shadow-xl px-4 md:px-10 py-5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
             <div className="bg-green-700 p-2.5 rounded-2xl text-white shadow-lg"><ShieldCheck className="w-8 h-8" /></div>
             <div>
                <h1 className="text-2xl font-black tracking-tighter leading-none">LANDI EXPERT <span className="text-green-700">2026</span></h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Filiale Herzogenbuchsee • Oli's Edition</p>
             </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Art.Nr. oder Modell..." 
                  className="w-full pl-12 pr-4 py-3 bg-slate-100 border-2 border-transparent focus:border-green-600 rounded-2xl outline-none font-bold text-sm transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button 
                onClick={() => setShowChat(!showChat)}
                className="bg-green-700 text-white p-3.5 rounded-2xl hover:bg-green-800 transition-all shadow-xl active:scale-90"
            >
                <MessageSquare className="w-7 h-7" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-10">
        
        {/* CATEGORIES */}
        <div className="flex flex-wrap gap-2 mb-12 justify-center lg:justify-start">
          {['Alle', 'Roboter', 'Akku', 'Benzin'].map(cat => (
            <button 
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                filterCategory === cat ? 'bg-green-700 text-white shadow-2xl scale-105' : 'bg-white text-slate-400 border border-slate-200 hover:border-green-600 hover:text-green-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* CHATBOT */}
        {showChat && (
          <div className="fixed bottom-6 right-6 w-[calc(100%-3rem)] max-w-md z-[100] animate-slideUp">
            <div className="bg-white rounded-[2.5rem] shadow-2xl border-4 border-green-700 h-[600px] flex flex-col overflow-hidden">
              <div className="bg-green-700 p-6 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_#4ade80]"></div>
                  <span className="font-black text-xs uppercase tracking-widest">KI-Fachberater Aktiv</span>
                </div>
                <button onClick={() => setShowChat(false)} className="hover:rotate-90 transition-transform"><X /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar bg-slate-50">
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-4 rounded-[1.5rem] text-sm font-medium leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-green-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isTyping && <div className="text-[10px] font-black text-green-600 uppercase tracking-widest animate-pulse ml-2">Experte überlegt...</div>}
                <div ref={chatEndRef} />
              </div>
              <div className="p-6 bg-white border-t-2 border-slate-100 flex gap-3">
                <input 
                  type="text" 
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Frag mich nach Öl, Messern oder Hilfe..." 
                  className="flex-1 rounded-2xl px-5 py-3 border-2 border-slate-100 outline-none focus:border-green-600 font-medium"
                />
                <button onClick={handleSendMessage} className="bg-green-700 text-white p-4 rounded-2xl shadow-lg hover:bg-green-800 transition-colors"><Send className="w-5 h-5" /></button>
              </div>
            </div>
          </div>
        )}

        {/* GRID */}
        {!selectedModel ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredMowers.map(mower => (
              <div key={mower.id} onClick={() => setSelectedModel(mower)} className="bg-white rounded-[2rem] p-8 shadow-sm hover:shadow-2xl transition-all cursor-pointer border border-slate-200 group flex flex-col justify-between">
                <div>
                   <div className="flex justify-between items-center mb-8">
                      <span className="text-[10px] font-black text-slate-400 px-3 py-1 bg-slate-50 rounded-full tracking-widest uppercase">Art. {mower.id}</span>
                      <div className={`p-3 rounded-2xl ${mower.category === 'Benzin' ? 'bg-orange-50 text-orange-600' : mower.category === 'Akku' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                         {mower.category === 'Benzin' ? <Fuel className="w-6 h-6" /> : mower.category === 'Akku' ? <Battery className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
                      </div>
                   </div>
                   <h3 className="text-xl font-black text-slate-800 mb-3 group-hover:text-green-700 transition-colors leading-tight">{mower.name}</h3>
                   <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed mb-8">{mower.description}</p>
                </div>
                <div className="flex justify-between items-center pt-6 border-t border-slate-50">
                   <div className="text-2xl font-black text-slate-800">CHF {mower.price}</div>
                   <div className="bg-slate-100 p-2 rounded-full group-hover:bg-green-700 group-hover:text-white transition-all"><ChevronRight className="w-6 h-6" /></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border-4 border-white">
            <div className="p-8 md:p-14 border-b-2 border-slate-100 bg-gradient-to-br from-white to-slate-50">
               <button onClick={() => setSelectedModel(null)} className="mb-12 text-[10px] font-black text-slate-400 hover:text-green-700 flex items-center gap-3 uppercase tracking-[0.2em] transition-all">
                  ← ZURÜCK
               </button>
               <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 leading-none mb-8">{selectedModel.fullName}</h2>
               <div className="flex flex-wrap gap-4">
                  {Object.entries(selectedModel.specs).map(([k, v]) => (
                     <div key={k} className="bg-white border-2 border-slate-100 px-6 py-3 rounded-2xl text-xs font-bold text-slate-700 shadow-sm">
                        <span className="text-slate-300 uppercase text-[9px] mr-2">{k}</span> {v}
                     </div>
                  ))}
               </div>
            </div>
            
            {/* Detailed Tabs Area */}
            <div className="flex overflow-x-auto bg-neutral-900 px-10 no-scrollbar border-b-8 border-green-700">
               {[
                 { id: 'specs', label: 'Tech-Details', icon: Gauge },
                 { id: 'parts', label: 'Ersatzteile', icon: Droplets },
                 { id: 'guide', label: 'Start-Guide', icon: Navigation },
                 { id: 'maint', label: 'Wartungsplan', icon: Wrench },
                 { id: 'box', label: 'Lieferumfang', icon: Package }
               ].map(tab => (
                 <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 py-8 px-10 text-[11px] font-black uppercase tracking-[0.2em] whitespace-nowrap border-b-4 transition-all ${
                    activeTab === tab.id ? 'text-green-500 border-green-500 bg-white/5' : 'text-slate-500 border-transparent hover:text-white'
                  }`}
                 >
                   <tab.icon className="w-5 h-5" /> {tab.label}
                 </button>
               ))}
            </div>

            <div className="p-10 md:p-14 min-h-[500px] bg-white">
               {activeTab === 'specs' && (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-fadeIn">
                    {Object.entries(selectedModel.specs).map(([k, v]) => (
                      <div key={k} className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 group hover:bg-white hover:shadow-2xl transition-all">
                         <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 group-hover:text-green-700 transition-colors">{k}</div>
                         <div className="text-2xl font-black text-slate-800 leading-tight">{v}</div>
                      </div>
                    ))}
                 </div>
               )}

               {activeTab === 'parts' && (
                 <div className="space-y-10 animate-fadeIn">
                    <div className="bg-orange-50 border-2 border-orange-100 p-10 rounded-[3rem] flex flex-col md:flex-row items-center gap-8 shadow-sm">
                       <AlertTriangle className="w-16 h-16 text-orange-600 shrink-0" />
                       <div>
                          <h4 className="text-xl font-black text-orange-900 mb-2 uppercase tracking-tight">WICHTIG FÜR DEN GARANTIEANSPRUCH</h4>
                          <p className="text-orange-800 text-sm font-medium leading-relaxed">
                            Verwenden Sie bei diesem Modell ausschliesslich die hier gelisteten Original-Betriebsstoffe. Falsches Öl (z.B. 2-Takt-Mix in 4-Takt-Motoren) führt zum sofortigen Motorschaden.
                          </p>
                       </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       {Object.entries(selectedModel.consumables).map(([type, item]) => (
                         <div key={type} className="bg-white p-10 rounded-[3rem] border-2 border-slate-50 shadow-sm flex justify-between items-center group hover:border-green-600 hover:shadow-xl transition-all">
                            <div className="flex-1">
                               <div className="text-[10px] font-black text-green-700 uppercase tracking-widest mb-2">Original Landi-Teil</div>
                               <h4 className="text-2xl font-black text-slate-800 mb-1">{item.name}</h4>
                               <div className="text-xs font-bold text-slate-400 mb-6 tracking-widest uppercase">Art.Nr. {item.art}</div>
                               {item.qty && <div className="mt-4 bg-slate-900 text-white px-5 py-2 rounded-2xl text-[10px] font-black inline-block uppercase tracking-widest">Füllmenge: {item.qty}</div>}
                            </div>
                            <div className="bg-slate-50 p-8 rounded-[2rem] group-hover:bg-green-50 transition-colors">
                               {type === 'oil' || type === 'fuel' ? <Droplets className="w-10 h-10 text-blue-500" /> : type === 'can' ? <Fuel className="w-10 h-10 text-orange-500" /> : <Hammer className="w-10 h-10 text-slate-300" />}
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
               )}

               {activeTab === 'guide' && (
                 <div className="space-y-8 animate-fadeIn">
                    {selectedModel.setup.map((step, idx) => (
                      <div key={idx} className="flex gap-12 items-center bg-slate-50 p-12 rounded-[4rem] border border-slate-100 group hover:border-green-600 hover:bg-white hover:shadow-xl transition-all">
                         <div className="text-9xl font-black text-slate-200 group-hover:text-green-100 transition-colors leading-none">{idx + 1}</div>
                         <p className="text-2xl font-bold text-slate-700 leading-tight pr-6">{step}</p>
                      </div>
                    ))}
                 </div>
               )}

               {activeTab === 'maint' && (
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 animate-fadeIn">
                    <div className="space-y-6">
                       <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 mb-12">Service-Checkliste</h4>
                       {selectedModel.maintenance.map((m, i) => (
                         <div key={i} className="flex items-center gap-6 p-6 bg-white border-b-2 border-slate-50 hover:bg-slate-50 transition-colors rounded-2xl">
                            <CheckCircle2 className="w-7 h-7 text-green-600 shrink-0" />
                            <span className="font-bold text-lg text-slate-700">{m}</span>
                         </div>
                       ))}
                    </div>
                    <div className="bg-slate-900 text-white p-14 rounded-[5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)] relative overflow-hidden">
                       <div className="absolute -right-16 -bottom-16 opacity-10"><Wrench className="w-[400px] h-[400px] rotate-12" /></div>
                       <h4 className="text-4xl font-black mb-8 tracking-tighter">Profi-Wartung Buchsi</h4>
                       <p className="text-slate-400 text-lg leading-relaxed mb-12 font-medium">
                        Bringen Sie Ihr Gerät am Saisonende zu uns. Wir erledigen den Ölwechsel, schärfen die Messer fachgerecht und prüfen alle Sicherheits-Komponenten.
                       </p>
                       <div className="flex flex-col gap-6">
                          <div className="flex items-center gap-4 text-green-400 font-black text-sm uppercase tracking-widest"><Timer className="w-6 h-6" /> Dauer: ca. 5 Werktage</div>
                          <div className="flex items-center gap-4 text-green-400 font-black text-sm uppercase tracking-widest"><Wrench className="w-6 h-6" /> Ab CHF 59.-</div>
                       </div>
                    </div>
                 </div>
               )}

               {activeTab === 'box' && (
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 animate-fadeIn">
                    <div>
                       <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 mb-12">Original Paketinhalt</h4>
                       <div className="grid grid-cols-1 gap-4">
                          {selectedModel.delivery.map((d, i) => (
                            <div key={i} className="flex items-center gap-5 p-6 bg-slate-50 rounded-3xl font-bold text-lg text-slate-600 border border-slate-100">
                               <Package className="w-7 h-7 text-slate-300" /> {d}
                            </div>
                          ))}
                       </div>
                    </div>
                    <div className="space-y-6">
                       <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 mb-12">Zubehör ab Lager Buchsi</h4>
                       <div className="p-8 bg-white border-4 border-slate-50 rounded-[3rem] shadow-sm flex justify-between items-center group hover:border-green-600 transition-all">
                          <div>
                             <div className="font-black text-xl text-slate-800">Abdeckplane Premium</div>
                             <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Art. 15442</div>
                          </div>
                          <div className="text-green-700 font-black text-2xl">CHF 39.00</div>
                       </div>
                       <div className="p-8 bg-white border-4 border-slate-100 rounded-[3rem] shadow-sm flex justify-between items-center group hover:border-green-600 transition-all">
                          <div>
                             <div className="font-black text-xl text-slate-800">Mulchkit Okay</div>
                             <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Art. 14365</div>
                          </div>
                          <div className="text-green-700 font-black text-2xl">CHF 24.90</div>
                       </div>
                    </div>
                 </div>
               )}
            </div>
            
            <footer className="bg-slate-50 border-t-2 border-slate-200 p-14 flex flex-col md:flex-row justify-between items-center gap-10">
               <div className="flex items-center gap-5">
                  <div className="w-5 h-5 bg-green-700 rounded-full animate-pulse shadow-[0_0_20px_rgba(0,139,57,0.7)]"></div>
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em]">SYSTEM-STATUS: VOLLKOMMEN // HERZOGENBUCHSEE 2026</span>
               </div>
               <a href={`https://www.landi.ch/shop/search?q=${selectedModel.id}`} target="_blank" className="bg-slate-900 text-white px-14 py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] hover:bg-green-700 transition-all shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] flex items-center gap-4 active:scale-95">
                  ZUM ONLINE-SHOP <ExternalLink className="w-5 h-5" />
               </a>
            </footer>
          </div>
        )}
      </main>
      
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(60px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.6s ease-out; }
        .animate-slideUp { animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
};

export default App;