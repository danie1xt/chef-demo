
import React, { useState } from 'react';
import { AppSettings, ModelOption } from '../types';
import { fetchAvailableModels } from '../services/geminiService';

interface SettingsProps {
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onSave }) => {
  const [formState, setFormState] = useState<AppSettings>(settings);
  const [showKey, setShowKey] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [availableModels, setAvailableModels] = useState<ModelOption[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleChange = (field: keyof AppSettings, value: string) => {
    setFormState(prev => ({ ...prev, [field]: value }));
    setMessage(null);
  };

  const handleTestConnection = async () => {
    if (!formState.apiUrl || !formState.apiKey) {
      setMessage({ type: 'error', text: '请先填写 API 地址和密钥' });
      return;
    }
    setIsTesting(true);
    setMessage(null);
    try {
      // We use fetching models as a way to test auth and connectivity
      const models = await fetchAvailableModels(formState);
      if (models.length > 0) {
        setAvailableModels(models);
        setMessage({ type: 'success', text: `连接成功！已检测到 ${models.length} 个模型` });
        // Auto-select first model if none selected
        if (!formState.model && models[0]?.name) {
           handleChange('model', models[0].name);
        }
      } else {
        setMessage({ type: 'success', text: '连接成功，但未检测到可用模型列表 (可能 API 不支持列表功能)，请手动输入模型 ID。' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || '连接失败，请检查 URL 和 Key' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    if (!formState.apiUrl || !formState.apiKey || !formState.model) {
      setMessage({ type: 'error', text: '请填写完整信息' });
      return;
    }
    onSave(formState);
    setMessage({ type: 'success', text: '设置已保存' });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="space-y-6 pb-10">
      
      <div className="bg-white rounded-3xl shadow-ios border border-gray-100/50 overflow-hidden">
        <div className="p-6 border-b border-gray-50">
           <h2 className="text-lg font-bold text-gray-900">自定义 API 连接</h2>
           <p className="text-xs text-gray-400 mt-1">支持 Google Gemini 原生 API 及任何 OpenAI 兼容接口</p>
        </div>

        <div className="p-6 space-y-6">
          
          {/* API URL */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block ml-1">
              API 地址 (Base URL)
            </label>
            <input
              type="text"
              value={formState.apiUrl}
              onChange={(e) => handleChange('apiUrl', e.target.value)}
              placeholder="https://api.openai.com/v1"
              className="w-full bg-gray-50 text-gray-900 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-gray-900 transition-all text-sm font-mono"
            />
            <p className="text-[10px] text-gray-400 ml-1">
              例如: <code>https://generativelanguage.googleapis.com</code> (Google) 或 <code>https://api.deepseek.com/v1</code> (OpenAI 兼容)
            </p>
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block ml-1">
              API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={formState.apiKey}
                onChange={(e) => handleChange('apiKey', e.target.value)}
                placeholder="sk-..."
                className="w-full bg-gray-50 text-gray-900 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-gray-900 transition-all text-sm font-mono pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                {showKey ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>
          </div>

          {/* Actions: Test & Load */}
          <div className="flex gap-2">
             <button
                onClick={handleTestConnection}
                disabled={isTesting || !formState.apiUrl || !formState.apiKey}
                className="flex-1 bg-gray-100 text-gray-700 font-bold py-2.5 rounded-xl hover:bg-gray-200 active:scale-95 transition-all text-xs flex items-center justify-center gap-2"
              >
                {isTesting ? (
                   <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                   <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                )}
                测试连接 & 加载模型
             </button>
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
             <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block ml-1">
                模型名称
              </label>
            <div className="relative">
              {availableModels.length > 0 ? (
                <div className="relative">
                  <select
                    value={formState.model}
                    onChange={(e) => handleChange('model', e.target.value)}
                    className="w-full bg-gray-50 text-gray-900 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-gray-900 transition-all text-sm appearance-none cursor-pointer"
                  >
                    {availableModels.map(m => (
                      <option key={m.name} value={m.name}>{m.displayName || m.name}</option>
                    ))}
                    <option value={formState.model} disabled>---</option>
                    <option value="_manual">手动输入...</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                    <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              ) : (
                <input
                  type="text"
                  value={formState.model}
                  onChange={(e) => handleChange('model', e.target.value)}
                  placeholder="例如：gemini-2.0-flash 或 gpt-4o-mini"
                  className="w-full bg-gray-50 text-gray-900 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-gray-900 transition-all text-sm"
                />
              )}
            </div>
             {availableModels.length === 0 && (
               <p className="text-[10px] text-gray-400 ml-1">
                 输入模型 ID，或点击“测试连接”尝试自动获取列表。
               </p>
            )}
          </div>

          {/* Message Toast */}
          {message && (
            <div className={`text-xs px-3 py-3 rounded-xl flex items-start gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
              <div className={`mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="break-all">{message.text}</span>
            </div>
          )}

          <div className="pt-4">
             <button
              onClick={handleSave}
              className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl shadow-lg shadow-gray-200 hover:scale-[1.01] active:scale-95 transition-all text-sm"
            >
              保存配置
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Settings;
