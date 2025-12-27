import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText, Copy, Download, Loader2, Upload, Code, ArrowRight, X,
  ChevronLeft, Sparkles, Zap, Search, Target, TrendingUp, Settings,
  Moon, Sun, RefreshCw, AlertCircle, CheckCircle, Info, XCircle,
  Maximize2, Minimize2, Save, RotateCcw, Activity
} from 'lucide-react';

// ترجمة متعددة اللغات (عربي/إنجليزي)
const TRANSLATIONS = {
  'en-US': {
    pageTitle: 'PRD to Prototype',
    pageSubtitle: 'Research, plan, and build your product from idea to prototype',
    tab1: 'Product Research',
    tab2: 'Create PRD',
    tab3: 'Generate Prototype',
    researchTitle: 'Product Research Assistant',
    researchSubtitle: 'Get comprehensive market insights before creating your PRD',
    productLabel: 'What product or service are you researching?',
    productPlaceholder: 'e.g., A team collaboration tool for remote workers',
    preferencesLabel: 'What are your specific preferences and priorities?',
    preferencesPlaceholder: 'e.g., Must integrate with Slack, under $50/month, mobile-first design...'
  },
  'ar-EG': {
    pageTitle: 'من البحث إلى النموذج',
    pageSubtitle: 'ابحث، خطط، وابنِ منتجك من الفكرة إلى النموذج الأولي',
    tab1: 'بحث المنتج',
    tab2: 'إنشاء PRD',
    tab3: 'إنشاء نموذج',
    researchTitle: 'مساعد بحث المنتج',
    researchSubtitle: 'احصل على رؤى السوق قبل إنشاء PRD',
    productLabel: 'ما المنتج أو الخدمة التي تبحث عنها؟',
    productPlaceholder: 'مثال: أداة تعاون للفرق عن بُعد',
    preferencesLabel: 'ما هي تفضيلاتك وأولوياتك؟',
    preferencesPlaceholder: 'مثال: تكامل مع Slack، أقل من 50$/شهر، تصميم للأجهزة المحمولة...'
  }
};

// مدير الإعدادات (محلي ومبسّط)
class ConfigManager {
  private static instance: ConfigManager;
  private config: Record<string, any> = {
    darkMode: false,
    autoSave: true,
    cacheResults: true,
    retryOnError: true,
    maxRetries: 2,
    requestTimeout: 30,
    locale: 'ar-EG',
    analytics: true
  };
  static getInstance() {
    if (!this.instance) this.instance = new ConfigManager();
    return this.instance;
  }
  get(key: string) { return this.config[key]; }
  set(key: string, value: any) { this.config[key] = value; }
  getAll() { return { ...this.config }; }
}

// تسجيل مبسّط
class Logger {
  static info(msg: string, data?: any) { console.info('[INFO]', msg, data); }
  static error(msg: string, data?: any) { console.error('[ERROR]', msg, data); }
  static debug(msg: string, data?: any) { console.debug('[DEBUG]', msg, data); }
}

// Cache مبسّط
class RequestCache {
  private static map = new Map<string, any>();
  static get(k: string) { return this.map.get(k) ?? null; }
  static set(k: string, v: any) { this.map.set(k, v); }
  static clear() { this.map.clear(); }
}

// Analytics مبسّط
class Analytics {
  static track(event: string, data?: any) { Logger.debug('analytics', { event, data }); }
}

// عميل API مُحاكَى ليعمل محليًا بدون مفاتيح
class APIClient {
  static async research(product: string, preferences: string): Promise<string> {
    const key = `research_${product}_${preferences}`;
    const cached = RequestCache.get(key);
    if (cached) return cached;
    const input = `${product}\n\nPreferences:\n${preferences}`;
    const start = await fetch('/api/research/start', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input })
    }).then(r => r.json());
    if (!start.ok) throw new Error(start.message || 'Failed to start research');
    const id = start.interactionId;
    let statusRes;
    for (;;) {
      statusRes = await fetch(`/api/research/status?id=${encodeURIComponent(id)}`).then(r => r.json());
      if (!statusRes.ok) throw new Error(statusRes.message || 'Failed to poll research');
      if (statusRes.status === 'completed') break;
      await new Promise(r => setTimeout(r, 5000));
    }
    const text = (statusRes.outputs || [])
      .filter((b: any) => b.type === 'text')
      .map((b: any) => b.text)
      .join('\n\n');
    RequestCache.set(key, text);
    return text;
  }
  static async generatePRD(q1: string, q2: string, q3: string, research?: string): Promise<string> {
    const prompt = `Create a professional one-pager PRD:\n\n1. Product: ${q1}\n2. Users & Problem: ${q2}\n3. Features & Metrics: ${q3}\n${research ? `\nUse this market research to inform your PRD:\n${research}` : ''}`;
    const resp = await fetch('/api/generate/prd', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    }).then(r => r.json());
    if (!resp.ok) throw new Error(resp.message || 'Failed to generate PRD');
    return resp.text as string;
  }
  static async generatePrototype(prd: string, version: 'prototype'|'alpha'|'beta'|'pilot'): Promise<string> {
    const verMap: Record<string, string> = { prototype: 'flash3', alpha: 'alpha', beta: 'beta', pilot: 'pilot' };
    const resp = await fetch('/api/generate/prototype', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: prd, version: verMap[version] })
    }).then(r => r.json());
    if (!resp.ok) throw new Error(resp.message || 'Failed to generate prototype');
    return resp.html as string;
  }
}

// Toast بسيط
const Toast: React.FC<{ message: string; type: 'success'|'error'|'info'|'warning'; onClose: () => void; }>=({ message, type, onClose })=>{
  const color = type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : type === 'warning' ? 'bg-yellow-500' : 'bg-blue-600';
  useEffect(()=>{ const t = setTimeout(onClose, 2500); return ()=>clearTimeout(t); },[onClose]);
  return (
    <div className={`fixed top-4 right-4 ${color} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50`}>
      <span>{message}</span>
      <button onClick={onClose}><X size={16}/></button>
    </div>
  );
};

// تحويل Markdown إلى HTML مبسّط
const renderMarkdown = (text: string): string => {
  return text
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^[*-] (.+)$/gm, '<li class="ml-4">• $1</li>')
    .replace(/\n\n/g, '</p><p class="mb-3">')
    .replace(/^(?!<[hl]|<li)(.+)$/gm, '<p class="mb-3">$1</p>');
};

export default function ArabicApp() {
  const cfg = ConfigManager.getInstance();
  const locale = cfg.get('locale') || 'ar-EG';
  const t = (key: string) => (TRANSLATIONS as any)[locale]?.[key] || (TRANSLATIONS as any)['en-US'][key] || key;

  const [activeTab, setActiveTab] = useState(0);
  const [researchData, setResearchData] = useState({ product: '', preferences: '' });
  const [researchReport, setResearchReport] = useState('');
  const [isResearching, setIsResearching] = useState(false);
  const [formData, setFormData] = useState({ question1: '', question2: '', question3: '' });
  const [generatedPRD, setGeneratedPRD] = useState('');
  const [isGeneratingPRD, setIsGeneratingPRD] = useState(false);
  const [generatedHTML, setGeneratedHTML] = useState('');
  const [isGeneratingPrototype, setIsGeneratingPrototype] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<'prototype'|'alpha'|'beta'|'pilot'>('alpha');
  const [toasts, setToasts] = useState<Array<{id:string;message:string;type:'success'|'error'|'info'|'warning'}>>([]);
  const showToast = useCallback((m:string, type:'success'|'error'|'info'|'warning'='info')=>{
    const id = Date.now().toString();
    setToasts(prev=>[...prev,{id,message:m,type}]);
  },[]);

  useEffect(()=>{ document.documentElement.dir = locale.startsWith('ar') ? 'rtl' : 'ltr'; },[locale]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Settings />
            <h1 className="text-2xl font-bold">{t('pageTitle')}</h1>
          </div>
          <p className="text-gray-600">{t('pageSubtitle')}</p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-6">
          <div className="bg-white/80 rounded-full p-1 shadow flex gap-1">
            <button onClick={()=>setActiveTab(0)} className={`px-6 py-3 rounded-full font-medium flex items-center gap-2 ${activeTab===0?'bg-gradient-to-r from-blue-600 to-purple-600 text-white':'text-gray-700 hover:bg-white'}`}>
              <Search size={18}/> {t('tab1')}
            </button>
            <button onClick={()=>setActiveTab(1)} className={`px-6 py-3 rounded-full font-medium flex items-center gap-2 ${activeTab===1?'bg-gradient-to-r from-blue-600 to-purple-600 text-white':'text-gray-700 hover:bg-white'}`}>
              <FileText size={18}/> {t('tab2')}
            </button>
            <button onClick={()=>setActiveTab(2)} className={`px-6 py-3 rounded-full font-medium flex items-center gap-2 ${activeTab===2?'bg-gradient-to-r from-blue-600 to-purple-600 text-white':'text-gray-700 hover:bg-white'}`}>
              <Code size={18}/> {t('tab3')}
            </button>
          </div>
        </div>

        {/* Tab 0: Research */}
        {activeTab===0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-xl font-semibold mb-2 flex items-center gap-2"><Target className="text-blue-600"/>{t('researchTitle')}</h2>
              <p className="text-gray-600 mb-4">{t('researchSubtitle')}</p>
              <label className="block text-sm font-medium mb-2">{t('productLabel')}</label>
              <textarea className="w-full border rounded-lg p-3 mb-4" rows={2} value={researchData.product} onChange={e=>setResearchData(p=>({...p,product:e.target.value}))} placeholder={t('productPlaceholder')} />
              <label className="block text-sm font-medium mb-2">{t('preferencesLabel')}</label>
              <textarea className="w-full border rounded-lg p-3 mb-4" rows={4} value={researchData.preferences} onChange={e=>setResearchData(p=>({...p,preferences:e.target.value}))} placeholder={t('preferencesPlaceholder')} />
              <button disabled={isResearching || !researchData.product} onClick={async()=>{ setIsResearching(true); setResearchReport(''); try { const r = await APIClient.research(researchData.product, researchData.preferences); setResearchReport(r); showToast('تم البحث بنجاح','success'); } catch(e){ showToast('حدث خطأ','error'); } finally { setIsResearching(false); } }} className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium">
                {isResearching ? (<><Loader2 className="animate-spin" size={18}/> جاري البحث...</>) : (<>بدء البحث</>)}
              </button>
            </div>
            <div className="bg-white rounded-2xl shadow p-6">
              {researchReport ? (
                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: renderMarkdown(researchReport) }} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400"><Search size={48}/><p>سيظهر تقرير البحث هنا</p></div>
              )}
            </div>
          </div>
        )}

        {/* Tab 1: PRD */}
        {activeTab===1 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow p-6 space-y-4">
              {[1,2,3].map(n=> (
                <div key={n}>
                  <label className="block text-sm font-medium mb-2">سؤال {n}</label>
                  <textarea rows={3} className="w-full border rounded-lg p-3" value={(formData as any)[`question${n}`]} onChange={e=>setFormData(p=>({...p,[`question${n}`]:e.target.value}))} />
                </div>
              ))}
              <button disabled={isGeneratingPRD || !formData.question1 || !formData.question2 || !formData.question3} onClick={async()=>{ setIsGeneratingPRD(true); setGeneratedPRD(''); try { const prd = await APIClient.generatePRD(formData.question1, formData.question2, formData.question3, researchReport); setGeneratedPRD(prd); showToast('تم إنشاء PRD','success'); } catch(e){ showToast('حدث خطأ','error'); } finally { setIsGeneratingPRD(false); } }} className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium">
                {isGeneratingPRD ? (<><Loader2 className="animate-spin" size={18}/> جاري الإنشاء...</>) : (<>إنشاء PRD</>)}
              </button>
              {generatedPRD && (
                <button onClick={()=>setActiveTab(2)} className="w-full py-3 bg-green-600 text-white rounded-lg font-medium">الانتقال لإنشاء نموذج</button>
              )}
            </div>
            <div className="bg-white rounded-2xl shadow p-6">
              {generatedPRD ? (
                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: renderMarkdown(generatedPRD) }} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400"><FileText size={48}/><p>سيظهر الـ PRD هنا</p></div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Prototype */}
        {activeTab===2 && (
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="grid grid-cols-2 gap-3 mb-4">
              {(['prototype','alpha','beta','pilot'] as const).map(v => (
                <button key={v} onClick={()=>setSelectedVersion(v)} className={`p-3 border rounded-lg ${selectedVersion===v?'border-purple-500 bg-purple-50':'border-gray-200 hover:border-gray-300'}`}>{v}</button>
              ))}
            </div>
            <div className="flex gap-3 mb-4">
              <button disabled={!generatedPRD || isGeneratingPrototype} onClick={async()=>{ setIsGeneratingPrototype(true); setGeneratedHTML(''); try { const html = await APIClient.generatePrototype(generatedPRD, selectedVersion); setGeneratedHTML(html); showToast('النموذج جاهز','success'); } catch(e){ showToast('حدث خطأ','error'); } finally { setIsGeneratingPrototype(false); } }} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium">
                {isGeneratingPrototype ? (<><Loader2 className="animate-spin" size={18}/> جاري إنشاء النموذج...</>) : (<>إنشاء النموذج</>)}
              </button>
              {generatedHTML && (
                <button onClick={()=>{ const blob = new Blob([generatedHTML],{type:'text/html'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `prototype-${selectedVersion}.html`; a.click(); URL.revokeObjectURL(url); }} className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium flex items-center gap-2"><Download size={16}/> تنزيل HTML</button>
              )}
            </div>
            {generatedHTML ? (
              <div className="h-[60vh] border rounded-lg overflow-hidden">
                <iframe srcDoc={generatedHTML} className="w-full h-full border-0" sandbox="allow-scripts allow-forms" />
              </div>
            ) : (
              <p className="text-gray-600">قم بإنشاء النموذج لعرضه هنا</p>
            )}
          </div>
        )}
      </div>

      {/* Toasts */}
      {toasts.map(t => (
        <Toast key={t.id} message={t.message} type={t.type} onClose={()=>setToasts(prev=>prev.filter(x=>x.id!==t.id))} />
      ))}
    </div>
  );
}
