import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const LANGS = {
  en: {
    title: "HRW Farmer Dashboard",
    cropSize: "Crop area (acres)",
    cropType: "Crop type",
    location: "Location (place)",
    growthStage: "Growth stage",
    estimate: "Estimate HRW Plan",
    concentration: "Recommended H2 concentration (ppm)",
    volume: "Total spray volume (liters)",
    pressure: "Recommended spray pressure (bar)",
    frequency: "Spray frequency",
    bestTime: "Best time to spray",
    saveLog: "Save to logbook",
    viewLog: "View logbook",
    chatbot: "Chatbot (ask about HRW)",
    alerts: "Spray Alerts",
    language: "Language",
    recommendations: "Crops with good HRW results",
    projection: "Yield projection (est.)",
  },
  hi: {
    title: "एचआरडब्ल्यू किसान डैशबोर्ड",
    cropSize: "फसल क्षेत्र (एकड़)",
    cropType: "फसल प्रकार",
    location: "स्थान",
    growthStage: "विकास चरण",
    estimate: "एचआरडब्ल्यू योजना अनुमान",
    concentration: "सिफारिश की गई H2 सांद्रता (ppm)",
    volume: "कुल छिड़काव वॉल्यूम (लीटर)",
    pressure: "सुझाया गया स्प्रे प्रेशर (bar)",
    frequency: "स्प्रे आवृत्ति",
    bestTime: "छिड़काव का सबसे अच्छा समय",
    saveLog: "लॉगबुक में सहेजें",
    viewLog: "लॉगबुक देखें",
    chatbot: "चैटबोट (एचआरडब्ल्यू के बारे में पूछें)",
    alerts: "स्प्रे अलर्ट",
    language: "भाषा",
    recommendations: "फसलें जिनपर अच्छा परिणाम",
    projection: "उत्पादकता का अनुमान",
  },
  es: {
    title: "Panel HRW para Agricultores",
    cropSize: "Área de cultivo (acres)",
    cropType: "Tipo de cultivo",
    location: "Lugar",
    growthStage: "Etapa de crecimiento",
    estimate: "Estimar plan HRW",
    concentration: "Concentración H2 recomendada (ppm)",
    volume: "Volumen total de pulverización (L)",
    pressure: "Presión recomendada (bar)",
    frequency: "Frecuencia de pulverización",
    bestTime: "Mejor hora para rociar",
    saveLog: "Guardar en registro",
    viewLog: "Ver registro",
    chatbot: "Chatbot (pregunta sobre HRW)",
    alerts: "Alertas de pulverización",
    language: "Idioma",
    recommendations: "Cultivos con buenos resultados con HRW",
    projection: "Proyección de rendimiento (est.)",
  },
};

const CROP_RECOMMENDATIONS = {
  Rice: { works: true, notes: "Improves seedling vigour, stress tolerance" },
  Wheat: { works: true, notes: "Helps drought stress in trials" },
  Tomato: { works: true, notes: "Enhances growth & fruit set" },
  Potato: { works: false, notes: "Limited evidence; pilot only" },
  Cotton: { works: true, notes: "May reduce oxidative stress" },
};

// Heuristic calculation
function computeHRWPlan({ areaAcres, cropType, growthStage, place }) {
  let baseConc = 1.0;
  if (cropType === "Rice") baseConc = 1.2;
  if (cropType === "Tomato") baseConc = 0.8;
  if (growthStage === "Seedling") baseConc *= 0.8;
  if (growthStage === "Flowering") baseConc *= 1.1;

  let litersPerAcre = 200;
  if (cropType === "Tomato") litersPerAcre = 400;
  if (cropType === "Wheat") litersPerAcre = 150;

  let pressure = 2.5;
  if (cropType === "Rice") pressure = 3.0;

  // Crop & stage-specific frequency
  let frequency = "Once per week";
  let nextDays = 7;

 const freqTable = {
  Rice: { Seedling: 3, Vegetative: 3, Flowering: 4, Maturity: 5 },  // High water
  Wheat: { Seedling: 6, Vegetative: 5, Flowering: 5, Maturity: 6 }, // Moderate water
  Cotton: { Seedling: 7, Vegetative: 6, Flowering: 5, Maturity: 7 },// Moderate-low water
  Tomato: { Seedling: 3, Vegetative: 4, Flowering: 3, Maturity: 5 },// High water
  Potato: { Seedling: 4, Vegetative: 4, Flowering: 3, Maturity: 5 },// Moderate-high water
};


  if (freqTable[cropType] && freqTable[cropType][growthStage]) {
    nextDays = freqTable[cropType][growthStage];
    frequency = `Every ${nextDays} days`;
  }

  const bestTime = "Early morning (5–8 AM) or late afternoon (4–6 PM)";
  const totalVolumeLiters = Math.max(0.1, areaAcres) * litersPerAcre;

  return {
    concentration_ppm: Number(baseConc.toFixed(2)),
    total_volume_l: Math.round(totalVolumeLiters),
    pressure_bar: Number(pressure.toFixed(2)),
    frequency,
    bestTime,
    nextDays,
  };
}

export default function HRWDashboard() {
  const [lang, setLang] = useState("en");
  const t = LANGS[lang];

  const [form, setForm] = useState({ area: 1, crop: "Rice", place: "", stage: "Vegetative" });
  const [plan, setPlan] = useState(null);
  const [logbook, setLogbook] = useState([]);
  const [chat, setChat] = useState([{ who: "bot", text: "Hi! Ask me about HRW plans or crops." }]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("hrw_logbook_v1");
    if (stored) setLogbook(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("hrw_logbook_v1", JSON.stringify(logbook));
  }, [logbook]);

  function handleEstimate(e) {
    e?.preventDefault?.();
    const input = { areaAcres: Number(form.area), cropType: form.crop, growthStage: form.stage, place: form.place };
    const p = computeHRWPlan(input);
    setPlan(p);

    // schedule future alert
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + (p.nextDays || 7));
    const nextAlert = {
      id: Date.now(),
      text: `Next spray for ${form.crop}: ${p.frequency}`,
      when: nextDate.toLocaleString(),
    };
    setAlerts((a) => [nextAlert, ...a].slice(0, 10));
  }

  function saveLog() {
    if (!plan) return;
    const entry = { id: Date.now(), form, plan, createdAt: new Date().toISOString() };
    setLogbook((l) => [entry, ...l]);
  }

  function sendChat(question) {
    if (!question) return;
    setChat((c) => [...c, { who: "user", text: question }]);
    setTimeout(() => {
      const reply = `I recommend ${plan ? plan.concentration_ppm + " ppm" : "1.0 ppm"} H2 for ${form.crop}. For precise guidance, run Estimate.`;
      setChat((c) => [...c, { who: "bot", text: reply }]);
    }, 600);
  }

  function exportLogCSV() {
    const rows = ["id,createdAt,crop,area,concentration_l,volume_l,pressure_bar,frequency,place"].concat(
      logbook.map((r) => `${r.id},${r.createdAt},${r.form.crop},${r.form.area},${r.plan.concentration_ppm},${r.plan.total_volume_l},${r.plan.pressure_bar},"${r.plan.frequency}",${r.form.place}`)
    );
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hrw_logbook.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const projectionData = Array.from({ length: 6 }).map((_, i) => {
    if (!plan) return { month: `M${i + 1}`, yield: 0 };
    let baseGrowth = 5;
    let cropFactor = { Rice: 1.2, Wheat: 1.1, Tomato: 1.4, Cotton: 1.3 }[form.crop] || 1;
    let stageFactor = { Seedling: 0.8, Vegetative: 1.0, Flowering: 1.5, Maturity: 1.2 }[form.stage] || 1;
    let ppmFactor = plan.concentration_ppm / 1.0;
    let monthlyGrowth = baseGrowth * cropFactor * stageFactor * ppmFactor;
    let yieldPercent = Math.min(100, Math.round((i + 1) * monthlyGrowth));
    return { month: `M${i + 1}`, yield: yieldPercent };
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t.title}</h1>
        <div className="flex items-center gap-2">
          <label className="text-sm">{t.language}</label>
          <select className="border rounded p-1" value={lang} onChange={(e) => setLang(e.target.value)}>
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
            <option value="es">Español</option>
          </select>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="col-span-1 lg:col-span-2 bg-white shadow p-4 rounded">
          <form onSubmit={handleEstimate} className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm">{t.cropSize}</label>
              <input type="number" min={0.1} step={0.1} value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} className="mt-1 w-full border rounded p-2" />
            </div>

            <div>
              <label className="block text-sm">{t.cropType}</label>
              <select value={form.crop} onChange={(e) => setForm({ ...form, crop: e.target.value })} className="mt-1 w-full border rounded p-2">
                {Object.keys(CROP_RECOMMENDATIONS).map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>

            <div>
              <label className="block text-sm">{t.location}</label>
              <input value={form.place} onChange={(e) => setForm({ ...form, place: e.target.value })} className="mt-1 w-full border rounded p-2" />
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm">{t.growthStage}</label>
              <select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })} className="mt-1 w-full border rounded p-2">
                <option>Seedling</option>
                <option>Vegetative</option>
                <option>Flowering</option>
                <option>Maturity</option>
              </select>
            </div>

            <div className="md:col-span-3 flex gap-2 mt-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">{t.estimate}</button>
              <button type="button" onClick={saveLog} className="px-4 py-2 bg-green-600 text-white rounded">{t.saveLog}</button>
              <button type="button" onClick={exportLogCSV} className="px-4 py-2 border rounded">Export CSV</button>
            </div>
          </form>

          {plan && (
            <div className="mt-4 bg-gray-50 p-4 rounded">
              <h3 className="font-semibold mb-2">{t.estimate}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div>
                  <div className="text-xs">{t.concentration}</div>
                  <div className="text-lg font-bold">{plan.concentration_ppm} ppm</div>
                </div>
                <div>
                  <div className="text-xs">{t.volume}</div>
                  <div className="text-lg font-bold">{plan.total_volume_l} L</div>
                </div>
                <div>
                  <div className="text-xs">{t.pressure}</div>
                  <div className="text-lg font-bold">{plan.pressure_bar} bar</div>
                </div>
                <div>
                  <div className="text-xs">{t.frequency}</div>
                  <div className="text-lg font-bold">{plan.frequency}</div>
                </div>
              </div>
              <div className="mt-2 text-sm">{t.bestTime}: {plan.bestTime}</div>
            </div>
          )}

          <div className="mt-6">
            <h4 className="font-semibold">{t.recommendations}</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
              {Object.entries(CROP_RECOMMENDATIONS).map(([k, v]) => (
                <div key={k} className={`p-2 border rounded ${v.works ? "bg-green-50" : "bg-red-50"}`}>
                  <div className="font-medium">{k}</div>
                  <div className="text-xs">{v.notes}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <h4 className="font-semibold">{t.projection}</h4>
            <div style={{ height: 180 }} className="mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={projectionData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="yield" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="bg-white shadow p-4 rounded">
            <h3 className="font-semibold">{t.chatbot}</h3>
            <div className="h-48 overflow-auto border rounded p-2 mt-2 bg-gray-50">
              {chat.map((c, i) => (
                <div key={i} className={`mb-2 ${c.who === "bot" ? "text-left" : "text-right"}`}>
                  <div className={`inline-block p-2 rounded ${c.who === "bot" ? "bg-white" : "bg-blue-100"}`}>{c.text}</div>
                </div>
              ))}
            </div>
            <ChatInput onSend={sendChat} />
          </div>

          <div className="bg-white shadow p-4 rounded">
            <h3 className="font-semibold">{t.alerts}</h3>
            <ul className="mt-2 space-y-1 max-h-48 overflow-auto">
              {alerts.map((a) => (
                <li key={a.id} className="text-sm border-b pb-1">{a.when} — {a.text}</li>
              ))}
            </ul>
          </div>

          <div className="bg-white shadow p-4 rounded">
            <h3 className="font-semibold">{t.viewLog}</h3>
            <div className="max-h-48 overflow-auto mt-2">
              {logbook.length === 0 && <div className="text-sm text-gray-500">No entries yet.</div>}
              {logbook.map((e) => (
                <div key={e.id} className="border rounded p-2 mb-2">
                  <div className="text-xs text-gray-500">{new Date(e.createdAt).toLocaleString()}</div>
                  <div className="text-sm font-medium">{e.form.crop} — {e.form.area} acres</div>
                  <div className="text-xs">{e.plan.concentration_ppm} ppm • {e.plan.total_volume_l} L</div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

function ChatInput({ onSend }) {
  const [val, setVal] = useState("");
  return (
    <div className="mt-2 flex gap-2">
      <input value={val} onChange={(e) => setVal(e.target.value)} placeholder="Ask a question..." className="flex-1 border rounded p-2" />
      <button onClick={() => { onSend(val); setVal(""); }} className="px-3 py-2 bg-blue-600 text-white rounded">Send</button>
    </div>
  );
}
