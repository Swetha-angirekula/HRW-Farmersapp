import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Droplets, Sprout, BookOpen, MessageCircle, Bell, TrendingUp, MapPin, Calendar } from "lucide-react";

const HRW_KB = {
  "what is hrw": "HRW (Hydrogen-Rich Water) is water infused with molecular hydrogen (H2). It acts as a selective antioxidant in plants, with H2 concentrations between 0.8-1.6 ppm.",
  "how": "HRW works by: 1) Acting as antioxidant 2) Regulating gene expression 3) Enhancing photosynthesis 4) Improving water uptake 5) Activating plant defense systems.",
  "benefits": "Benefits: Enhanced germination (15-30%), stronger roots, stress tolerance, higher yields (20-25%), better disease resistance, improved nutrient uptake.",
  "application": "Apply via: 1) Foliar spraying (early morning/late afternoon) 2) Seed soaking (12-24 hrs) 3) Root irrigation 4) Hydroponics. Frequency: every 2-7 days.",
  "concentration": "Optimal H2: Rice 1.0-1.5 ppm, Wheat 0.8-1.2 ppm, Vegetables 0.8-1.0 ppm. Higher isn't always better.",
  "timing": "Best times: Early morning (5-8 AM) or late afternoon (4-6 PM). Apply during critical stages: germination, transplanting, flowering, fruiting.",
  "equipment": "Need: H2 generator, dissolving system, storage tank, spray equipment, H2 meter. Use within 24 hours.",
  "crops": "Best: Rice (excellent), Wheat, Tomato, Cucumber, Lettuce, Strawberry, Soybean. Limited: Potato, Corn.",
  "cost": "Investment: Small farm $500-$2000, Medium $2000-$8000, Large $8000-$25000. ROI within 1-2 seasons.",
  "safety": "Completely safe: Non-toxic, no residues, no soil contamination, environmentally friendly. H2 gas is flammable during generation.",
  "storage": "Use within 24 hours. Store sealed, away from sunlight, 15-25°C. H2 half-life: 2-4 hours in open containers.",
  "science": "150+ research papers since 2010. H2 reduces oxidative stress 40-60%, increases enzyme activity, improves photosystem efficiency 15-25%.",
  "fertilizer": "HRW is NOT a fertilizer - it's a growth enhancer. Use alongside regular fertilization. May reduce fertilizer needs by 10-15%.",
  "drought": "Improves drought tolerance by: reducing water loss, enhancing root depth 30-40%, maintaining photosynthesis. Apply 2-3 days before stress.",
  "organic": "Perfect for organic farming: no synthetic chemicals, no residues, natural approach. Check local organic certification."
};

function getResponse(q) {
  const query = q.toLowerCase();
  if (query.includes("what") && query.includes("hrw")) return HRW_KB["what is hrw"];
  if (query.includes("how") || query.includes("work")) return HRW_KB["how"];
  if (query.includes("benefit") || query.includes("why")) return HRW_KB["benefits"];
  if (query.includes("spray") || query.includes("apply")) return HRW_KB["application"];
  if (query.includes("ppm") || query.includes("concentration")) return HRW_KB["concentration"];
  if (query.includes("when") || query.includes("time")) return HRW_KB["timing"];
  if (query.includes("equipment") || query.includes("machine")) return HRW_KB["equipment"];
  if (query.includes("crop") || query.includes("rice") || query.includes("wheat")) return HRW_KB["crops"];
  if (query.includes("cost") || query.includes("price")) return HRW_KB["cost"];
  if (query.includes("safe") || query.includes("toxic")) return HRW_KB["safety"];
  if (query.includes("store") || query.includes("storage")) return HRW_KB["storage"];
  if (query.includes("research") || query.includes("science")) return HRW_KB["science"];
  if (query.includes("fertilizer") || query.includes("nutrient")) return HRW_KB["fertilizer"];
  if (query.includes("drought") || query.includes("stress")) return HRW_KB["drought"];
  if (query.includes("organic")) return HRW_KB["organic"];
  return "I can help with: HRW basics, application methods, timing, concentrations, equipment, costs, safety, crops, benefits, and more. What would you like to know?";
}

function computeHRWPlan({ areaAcres, cropType, growthStage }) {
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

  const freqTable = {
    Rice: { Seedling: 3, Vegetative: 3, Flowering: 4, Maturity: 5 },
    Wheat: { Seedling: 6, Vegetative: 5, Flowering: 5, Maturity: 6 },
    Cotton: { Seedling: 7, Vegetative: 6, Flowering: 5, Maturity: 7 },
    Tomato: { Seedling: 3, Vegetative: 4, Flowering: 3, Maturity: 5 },
    Potato: { Seedling: 4, Vegetative: 4, Flowering: 3, Maturity: 5 },
  };

  const nextDays = freqTable[cropType]?.[growthStage] || 7;
  return {
    concentration_ppm: Number(baseConc.toFixed(2)),
    total_volume_l: Math.round(Math.max(0.1, areaAcres) * litersPerAcre),
    pressure_bar: Number(pressure.toFixed(2)),
    frequency: "Every " + nextDays + " days",
    bestTime: "Early morning (5-8 AM) or late afternoon (4-6 PM)",
    nextDays,
  };
}

const CROP_RECOMMENDATIONS = {
  Rice: { works: true, notes: "Improves seedling vigour", emoji: "🌾" },
  Wheat: { works: true, notes: "Helps drought stress", emoji: "🌾" },
  Tomato: { works: true, notes: "Enhances growth", emoji: "🍅" },
  Potato: { works: false, notes: "Limited evidence", emoji: "🥔" },
  Cotton: { works: true, notes: "Reduces stress", emoji: "🌿" },
};

function ChatInput({ onSend }) {
  const [val, setVal] = useState("");
  return (
    <div className="flex gap-2">
      <input 
        value={val} 
        onChange={(e) => setVal(e.target.value)} 
        onKeyPress={(e) => {
          if (e.key === "Enter" && val.trim()) {
            onSend(val);
            setVal("");
          }
        }}
        placeholder="Ask about HRW..." 
        className="flex-1 border-2 border-green-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-green-500" 
      />
      <button 
        onClick={() => { 
          if (val.trim()) {
            onSend(val); 
            setVal(""); 
          }
        }} 
        className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 text-sm font-semibold shadow-lg"
      >
        Send
      </button>
    </div>
  );
}

export default function HRWDashboard() {
  const [activeTab, setActiveTab] = useState("home");
  const [form, setForm] = useState({ area: "", crop: "Rice", place: "", stage: "Vegetative" });
  const [plan, setPlan] = useState(null);
  const [logbook, setLogbook] = useState([]);
  const [chat, setChat] = useState([{ who: "bot", text: "Hi! Ask me about HRW - application, benefits, timing, equipment, costs, or any crop questions!" }]);
  const [alerts, setAlerts] = useState([]);
  const [formErrors, setFormErrors] = useState({});

  function handleEstimate() {
    const errors = {};
    if (!form.area || Number(form.area) <= 0) errors.area = true;
    if (!form.place || form.place.trim() === "") errors.place = true;
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const p = computeHRWPlan({ areaAcres: Number(form.area), cropType: form.crop, growthStage: form.stage });
    setPlan(p);

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + p.nextDays);
    setAlerts((a) => [{
      id: Date.now(),
      text: "Next spray for " + form.crop + ": " + p.frequency,
      when: nextDate.toLocaleString(),
    }, ...a].slice(0, 10));
  }

  function saveLog() {
    if (!plan) return;
    setLogbook((l) => [{ id: Date.now(), form, plan, createdAt: new Date().toISOString() }, ...l]);
  }

  function sendChat(question) {
    if (!question.trim()) return;
    setChat((c) => [...c, { who: "user", text: question }]);
    setTimeout(() => {
      setChat((c) => [...c, { who: "bot", text: getResponse(question) }]);
    }, 600);
  }

  const projectionData = Array.from({ length: 6 }).map((_, i) => ({
    month: "M" + (i + 1),
    yield: plan ? Math.min(100, Math.round((i + 1) * 15)) : 0
  }));

  const tabs = [
    { id: "home", label: "Home", icon: Sprout },
    { id: "planner", label: "Planner", icon: Droplets },
    { id: "logbook", label: "Logbook", icon: BookOpen },
    { id: "chat", label: "Chat", icon: MessageCircle },
    { id: "alerts", label: "Alerts", icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-700 to-emerald-600 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-300 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-green-300 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="p-6 max-w-6xl mx-auto relative z-10">
        <header className="mb-6 bg-gradient-to-r from-green-800 to-emerald-700 rounded-2xl shadow-2xl p-6 border-2 border-green-600">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-green-400 to-emerald-600 p-4 rounded-2xl shadow-lg">
              <Droplets className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-1">AGRIQUANT</h1>
              <p className="text-sm text-green-100">Hydrogen-Rich Water Management System</p>
            </div>
          </div>
        </header>

        <div className="bg-white bg-opacity-95 rounded-2xl shadow-2xl overflow-hidden border-2 border-green-600">
          <div className="flex border-b-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={"flex-1 px-4 py-4 text-sm font-semibold transition-all flex items-center justify-center gap-2 relative " + (activeTab === tab.id ? "text-green-700 bg-white shadow-lg" : "text-gray-600 hover:text-green-600")}
                >
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-600"></div>
                  )}
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-6">
            {activeTab === "home" && (
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-4xl font-bold text-green-800 mb-3">Welcome to HRW Farming</h2>
                  <p className="text-xl text-green-600 font-semibold">Revolutionary Hydrogen-Rich Water Technology</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {[
                    { emoji: "🌾", title: "Rice Fields", desc: "Optimized HRW treatment" },
                    { emoji: "🍅", title: "Fresh Produce", desc: "Enhanced growth results" },
                    { emoji: "🌿", title: "Green Farming", desc: "Sustainable agriculture" }
                  ].map((item, idx) => (
                    <div key={idx} className="relative overflow-hidden rounded-2xl shadow-2xl border-2 border-green-400 transform hover:scale-105 transition-all">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-700 opacity-90"></div>
                      <div className="relative p-8 text-white">
                        <div className="text-6xl mb-4 text-center">{item.emoji}</div>
                        <h3 className="text-2xl font-bold text-center">{item.title}</h3>
                        <p className="text-sm text-center mt-2 opacity-90">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-8 border-2 border-green-400 shadow-xl mb-8">
                  <h3 className="text-3xl font-bold text-green-800 mb-4">About Hydrogen-Rich Water</h3>
                  <p className="text-lg text-gray-700 leading-relaxed">HRW is water infused with molecular hydrogen (H2). It enhances plant growth, improves stress tolerance, and increases crop yields through powerful antioxidant properties.</p>
                </div>

                <div>
                  <h3 className="text-3xl font-bold text-green-800 mb-6">Key Benefits</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { emoji: "🌱", title: "Enhanced Growth", desc: "Stronger roots and faster growth rates" },
                      { emoji: "💪", title: "Stress Resistance", desc: "Better drought and environmental resilience" },
                      { emoji: "📈", title: "Higher Yields", desc: "15-30% productivity increase" },
                      { emoji: "🌍", title: "Eco-Friendly", desc: "Chemical-free and safe solution" }
                    ].map((item, idx) => (
                      <div key={idx} className="bg-white rounded-2xl p-6 border-2 border-green-300 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all">
                        <div className="text-4xl mb-3">{item.emoji}</div>
                        <h4 className="text-xl font-bold text-green-800 mb-2">{item.title}</h4>
                        <p className="text-gray-600">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "planner" && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-green-800">
                      Crop area (acres) <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="number" 
                      value={form.area} 
                      onChange={(e) => {
                        setForm({ ...form, area: e.target.value });
                        setFormErrors({ ...formErrors, area: false });
                      }} 
                      className={"w-full border-2 rounded-xl p-3 " + (formErrors.area ? "border-red-500" : "border-green-300")}
                      placeholder="Enter area"
                    />
                    {formErrors.area && <p className="text-red-500 text-xs mt-1">Required</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-green-800">Crop type</label>
                    <select 
                      value={form.crop} 
                      onChange={(e) => setForm({ ...form, crop: e.target.value })} 
                      className="w-full border-2 border-green-300 rounded-xl p-3"
                    >
                      {Object.keys(CROP_RECOMMENDATIONS).map((c) => (<option key={c} value={c}>{c}</option>))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-green-800">
                      Location <span className="text-red-500">*</span>
                    </label>
                    <input 
                      value={form.place} 
                      onChange={(e) => {
                        setForm({ ...form, place: e.target.value });
                        setFormErrors({ ...formErrors, place: false });
                      }} 
                      className={"w-full border-2 rounded-xl p-3 " + (formErrors.place ? "border-red-500" : "border-green-300")}
                      placeholder="e.g. Punjab"
                    />
                    {formErrors.place && <p className="text-red-500 text-xs mt-1">Required</p>}
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-sm font-semibold mb-2 text-green-800">Growth stage</label>
                    <select 
                      value={form.stage} 
                      onChange={(e) => setForm({ ...form, stage: e.target.value })} 
                      className="w-full border-2 border-green-300 rounded-xl p-3"
                    >
                      <option>Seedling</option>
                      <option>Vegetative</option>
                      <option>Flowering</option>
                      <option>Maturity</option>
                    </select>
                  </div>

                  <div className="md:col-span-3 flex gap-3">
                    <button onClick={handleEstimate} className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-semibold shadow-lg">
                      Estimate HRW Plan
                    </button>
                    <button onClick={saveLog} className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-600 hover:to-orange-700 font-semibold shadow-lg">Save to logbook</button>
                  </div>
                </div>

                {plan && (
                  <div className="mb-6 bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-2xl border-2 border-green-400 shadow-xl">
                    <h3 className="font-bold mb-4 text-2xl text-green-800">HRW Plan Results</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white p-5 rounded-xl shadow-lg border-2 border-green-200">
                        <div className="text-xs text-green-700 mb-2 font-semibold">H2 concentration (ppm)</div>
                        <div className="text-3xl font-bold text-green-600">{plan.concentration_ppm}</div>
                      </div>
                      <div className="bg-white p-5 rounded-xl shadow-lg border-2 border-blue-200">
                        <div className="text-xs text-blue-700 mb-2 font-semibold">Spray volume (liters)</div>
                        <div className="text-3xl font-bold text-blue-600">{plan.total_volume_l}</div>
                      </div>
                      <div className="bg-white p-5 rounded-xl shadow-lg border-2 border-purple-200">
                        <div className="text-xs text-purple-700 mb-2 font-semibold">Spray pressure (bar)</div>
                        <div className="text-3xl font-bold text-purple-600">{plan.pressure_bar}</div>
                      </div>
                      <div className="bg-white p-5 rounded-xl shadow-lg border-2 border-amber-200">
                        <div className="text-xs text-amber-700 mb-2 font-semibold">Spray frequency</div>
                        <div className="text-xl font-bold text-amber-600">{plan.frequency}</div>
                      </div>
                    </div>
                    <div className="mt-5 text-sm bg-yellow-100 p-4 rounded-xl border-2 border-yellow-400">
                      <strong>Best time to spray:</strong> {plan.bestTime}
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <h4 className="font-bold text-xl mb-4 text-green-800">Recommended Crops</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {Object.entries(CROP_RECOMMENDATIONS).map(([k, v]) => (
                      <div key={k} className={"p-5 border-2 rounded-xl shadow-lg " + (v.works ? "bg-green-50 border-green-400" : "bg-red-50 border-red-400")}>
                        <div className="text-4xl text-center mb-3">{v.emoji}</div>
                        <div className="font-bold text-sm text-center">{k}</div>
                        <div className="text-xs mt-2 text-gray-600 text-center">{v.notes}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-xl mb-4 text-green-800">Yield projection</h4>
                  <div style={{ height: 320 }} className="bg-white p-6 rounded-2xl border-2 border-green-300 shadow-lg">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={projectionData}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="yield" stroke="#16a34a" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "logbook" && (
              <div>
                <h3 className="font-bold text-2xl mb-6 text-green-800">View logbook</h3>
                <div className="space-y-4">
                  {logbook.length === 0 && (
                    <div className="text-center py-20 bg-green-50 rounded-2xl border-2 border-dashed border-green-300">
                      <p className="text-green-700">No entries yet</p>
                    </div>
                  )}
                  {logbook.map((e) => (
                    <div key={e.id} className="border-2 border-green-300 rounded-2xl p-6 bg-white shadow-lg">
                      <div className="flex justify-between">
                        <div>
                          <div className="text-xs text-green-600 mb-2">{new Date(e.createdAt).toLocaleString()}</div>
                          <div className="text-xl font-bold">{e.form.crop} — {e.form.area} acres</div>
                          <div className="text-sm text-gray-600">Stage: {e.form.stage}</div>
                        </div>
                        <div className="text-right bg-green-100 p-4 rounded-xl">
                          <div className="font-bold text-green-700">{e.plan.concentration_ppm} ppm</div>
                          <div className="text-xs">{e.plan.total_volume_l} L</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "chat" && (
              <div>
                <h3 className="font-bold text-2xl mb-4 text-green-800">Chat Assistant</h3>
                <div className="h-96 overflow-auto border-2 border-green-300 rounded-xl p-4 mb-4 bg-gray-50">
                  {chat.map((c, i) => (
                    <div key={i} className={"mb-4 " + (c.who === "bot" ? "text-left" : "text-right")}>
                      <div className={"inline-block p-3 rounded-lg max-w-md " + (c.who === "bot" ? "bg-white border-2 border-green-300" : "bg-green-600 text-white")}>{c.text}</div>
                    </div>
                  ))}
                </div>
                <ChatInput onSend={sendChat} />
              </div>
            )}

            {activeTab === "alerts" && (
              <div>
                <h3 className="font-bold text-2xl mb-4 text-green-800">Spray Alerts</h3>
                <div className="space-y-3">
                  {alerts.length === 0 && (
                    <div className="text-center py-20 bg-yellow-50 rounded-2xl border-2 border-dashed border-yellow-300">
                      <p className="text-yellow-700">No alerts yet</p>
                    </div>
                  )}
                  {alerts.map((a) => (
                    <div key={a.id} className="border-2 rounded-xl p-4 bg-yellow-50 border-yellow-300">
                      <div className="flex gap-3">
                        <div className="text-3xl">⏰</div>
                        <div>
                          <div className="font-medium text-sm">{a.text}</div>
                          <div className="text-xs text-gray-600 mt-1">Scheduled: {a.when}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
