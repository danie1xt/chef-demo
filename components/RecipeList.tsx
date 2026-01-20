import React, { useState } from 'react';
import { Recipe, UserPreferences, Ingredient, Category } from '../types';
import { CUISINE_STYLES, TASTE_PREFERENCES, CATEGORY_OPTIONS } from '../constants';

interface RecipeListProps {
  recipes: Recipe[];
  ingredients: Ingredient[];
  loading: boolean;
  onGenerate: (prefs: UserPreferences) => void;
  onSave: (recipe: Recipe) => void;
  hasIngredients: boolean;
}

const RecipeList: React.FC<RecipeListProps> = ({ recipes, ingredients, loading, onGenerate, onSave, hasIngredients }) => {
  const [cuisine, setCuisine] = useState(CUISINE_STYLES[0]);
  const [taste, setTaste] = useState(TASTE_PREFERENCES[0]);
  const [notes, setNotes] = useState('');
  const [mustUseIds, setMustUseIds] = useState<Set<string>>(new Set());
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [savedIndices, setSavedIndices] = useState<Set<number>>(new Set());

  const toggleIngredient = (id: string) => {
    const next = new Set(mustUseIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setMustUseIds(next);
  };

  const removeIngredient = (id: string) => {
    const next = new Set(mustUseIds);
    next.delete(id);
    setMustUseIds(next);
  };

  const handleGenerateClick = () => {
    setSavedIndices(new Set()); // Reset saved status on new generation
    onGenerate({ 
      cuisine, 
      taste,
      additionalNotes: notes.trim() ? notes.trim() : undefined,
      mustUseIngredientIds: Array.from(mustUseIds)
    });
  };

  const handleSaveClick = (recipe: Recipe, index: number) => {
    onSave(recipe);
    const next = new Set(savedIndices);
    next.add(index);
    setSavedIndices(next);
  };

  // Group ingredients for the modal
  const groupedIngredients = ingredients.reduce((acc, curr) => {
    if (!acc[curr.category]) acc[curr.category] = [];
    acc[curr.category].push(curr);
    return acc;
  }, {} as Record<Category, Ingredient[]>);

  return (
    <div className="space-y-8">
      {/* Control Center Card */}
      <div className="relative overflow-hidden rounded-3xl bg-white shadow-ios-lg border border-gray-100">
        {/* Decorative Background Mesh - Monochrome */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-gray-100/80 blur-3xl opacity-60 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-gray-200/50 blur-3xl opacity-60 pointer-events-none"></div>

        <div className="relative p-6 z-10">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">定制今日菜单</h2>
            <p className="text-gray-500 text-sm mt-1">告诉 AI 大厨你想吃什么</p>
          </div>
          
          {/* Selectors */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">菜系风格</label>
              <div className="relative">
                <select 
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                  className="w-full bg-gray-50 hover:bg-gray-100 border-none text-gray-900 rounded-xl px-3 py-3 appearance-none focus:ring-2 focus:ring-gray-400 focus:bg-white transition-all font-medium text-sm cursor-pointer"
                >
                  {CUISINE_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">口味偏好</label>
               <div className="relative">
                <select 
                  value={taste}
                  onChange={(e) => setTaste(e.target.value)}
                  className="w-full bg-gray-50 hover:bg-gray-100 border-none text-gray-900 rounded-xl px-3 py-3 appearance-none focus:ring-2 focus:ring-gray-400 focus:bg-white transition-all font-medium text-sm cursor-pointer"
                >
                  {TASTE_PREFERENCES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>
          </div>

          {/* Must Use Ingredients */}
          {hasIngredients && (
            <div className="mb-5 space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">
                必选食材
              </label>
              
              <div className="flex flex-wrap gap-2 min-h-[38px]">
                {/* Add Button */}
                <button
                  onClick={() => setIsSelectorOpen(true)}
                  className="group bg-white border border-dashed border-gray-300 hover:border-gray-900 hover:text-gray-900 text-gray-500 px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <div className="bg-gray-100 group-hover:bg-gray-200 rounded-full p-0.5">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                  </div>
                  {mustUseIds.size === 0 ? "选择必须消耗的食材" : "添加更多"}
                </button>

                {/* Selected Tags - Monochrome */}
                {Array.from(mustUseIds).map(id => {
                  const ing = ingredients.find(i => i.id === id);
                  if (!ing) return null;
                  return (
                    <span key={id} className="bg-gray-800 text-white border border-gray-800 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm flex items-center gap-1.5 animate-fade-in">
                      {ing.name}
                      <button onClick={() => removeIngredient(id)} className="hover:bg-gray-600 rounded-full p-0.5 text-gray-300 hover:text-white transition">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* User Notes */}
          <div className="mb-6 space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">备注</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="例如：赶时间、用高压锅做..."
              className="w-full bg-gray-50 hover:bg-gray-100 border-none text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-gray-400 focus:bg-white transition-all text-sm"
            />
          </div>
          
          <button
            onClick={handleGenerateClick}
            disabled={loading || !hasIngredients}
            className={`
              w-full py-4 rounded-2xl font-bold text-[15px] shadow-lg shadow-gray-200 transition-all duration-300 transform
              flex items-center justify-center gap-2
              ${loading 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-brand-600 text-white hover:bg-brand-700 hover:scale-[1.02] active:scale-95'}
            `}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>正在构思美味...</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                </svg>
                <span>生成个性化食谱</span>
              </>
            )}
          </button>
          {!hasIngredients && (
            <div className="mt-3 text-center">
              <span className="text-xs text-gray-400 bg-gray-50 py-1.5 px-3 rounded-lg font-medium flex items-center justify-center gap-1.5 inline-flex border border-gray-100">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                请先在库存中添加食材
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Ingredient Selector Modal */}
      {isSelectorOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4" onClick={() => setIsSelectorOpen(false)}>
          <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm transition-opacity"></div>
          
          <div 
            className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-slide-up sm:animate-fade-in" 
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <h3 className="text-lg font-bold text-gray-900">选择必选食材</h3>
              <button onClick={() => setIsSelectorOpen(false)} className="bg-gray-100 p-2 rounded-full text-gray-500 hover:bg-gray-200 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-gray-50/50">
              {(Object.entries(groupedIngredients) as [string, Ingredient[]][]).map(([cat, items]) => {
                const categoryInfo = CATEGORY_OPTIONS.find(c => c.value === cat);
                return (
                  <div key={cat} className="mb-6 last:mb-0">
                    <div className="flex items-center gap-1.5 mb-3 ml-1">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d={categoryInfo?.iconPath || ''} />
                      </svg>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        {categoryInfo?.label || cat}
                      </h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {items.map(ing => {
                        const isSelected = mustUseIds.has(ing.id);
                        return (
                          <label 
                            key={ing.id} 
                            className={`
                              cursor-pointer relative flex items-center p-3 rounded-2xl border transition-all duration-200 active:scale-95
                              ${isSelected 
                                ? 'bg-gray-900 text-white border-gray-900' 
                                : 'bg-white border-gray-200 hover:border-gray-300'}
                            `}
                          >
                            <input 
                              type="checkbox" 
                              checked={isSelected}
                              onChange={() => toggleIngredient(ing.id)}
                              className="sr-only"
                            />
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 transition-colors ${isSelected ? 'bg-white border-white' : 'border-gray-300 bg-white'}`}>
                               {isSelected && <svg className="w-3 h-3 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                            </div>
                            <span className={`text-sm font-medium truncate ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                              {ing.name}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t border-gray-100 bg-white flex justify-end pb-safe">
              <button 
                onClick={() => setIsSelectorOpen(false)}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-gray-200 transition-all active:scale-95"
              >
                确认选择 ({mustUseIds.size})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recipe Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {recipes.map((recipe, index) => (
          <div key={index} className="group bg-white rounded-3xl shadow-ios border border-gray-100 overflow-hidden hover:shadow-ios-hover transition-all duration-300 flex flex-col relative animate-fade-in">
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-3 pr-8">
                <h3 className="text-xl font-bold text-gray-900 leading-tight">{recipe.name}</h3>
                {/* Difficulty Badge - Monochrome */}
                <span className={`
                  text-[10px] font-bold px-2 py-1 rounded-full shrink-0 ml-2 uppercase tracking-wide border
                  ${recipe.difficulty === '简单' ? 'bg-gray-50 border-gray-200 text-gray-600' : 
                    recipe.difficulty === '困难' ? 'bg-gray-800 border-gray-800 text-white' : 'bg-gray-100 border-gray-200 text-gray-800'}
                `}>
                  {recipe.difficulty}
                </span>
              </div>
              
              <div className="flex items-center text-gray-400 text-xs font-medium mb-5">
                <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {recipe.cookingTime}
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 mb-5 border border-gray-100/50">
                <p className="text-gray-600 text-sm italic leading-relaxed">
                  "{recipe.description}"
                </p>
              </div>

              <div className="mb-6">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">库存食材</h4>
                <div className="flex flex-wrap gap-1.5">
                  {recipe.mainIngredientsUsed.map((ing, i) => (
                    <span key={i} className="text-[11px] bg-gray-100 text-gray-700 border border-gray-200 px-2.5 py-1 rounded-md font-medium">
                      {ing}
                    </span>
                  ))}
                  {recipe.missingIngredients && (recipe.missingIngredients as string[]).map((ing, i) => (
                     <span key={`missing-${i}`} className="text-[11px] text-gray-400 border border-dashed border-gray-300 px-2.5 py-1 rounded-md font-medium">
                     + {ing}
                   </span>
                  ))}
                </div>
              </div>

              {recipe.failurePoints && recipe.failurePoints.length > 0 && (
                <div className="mb-6 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                  <h4 className="text-[10px] font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    避坑指南
                  </h4>
                  <ul className="list-disc list-inside text-xs text-gray-600 space-y-1.5 marker:text-gray-400">
                    {recipe.failurePoints.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">烹饪步骤</h4>
                <ol className="relative border-l border-gray-200 ml-2 space-y-4">
                  {recipe.steps.map((step, i) => (
                    <li key={i} className="mb-1 ml-4">
                      <div className="absolute w-2 h-2 bg-gray-300 rounded-full mt-1.5 -left-1 ring-4 ring-white"></div>
                      <p className="text-sm text-gray-700 leading-relaxed">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Save Button */}
            <button 
              onClick={() => handleSaveClick(recipe, index)}
              disabled={savedIndices.has(index)}
              className={`
                absolute top-5 right-5 p-2.5 rounded-full shadow-sm transition-all duration-300
                ${savedIndices.has(index) 
                  ? 'bg-gray-100 text-gray-400 cursor-default scale-100' 
                  : 'bg-white text-gray-300 hover:text-gray-900 hover:bg-gray-50 hover:scale-110 hover:shadow-md border border-gray-100'}
              `}
              title="收藏食谱"
            >
              <svg className={`w-5 h-5 transition-transform ${savedIndices.has(index) ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecipeList;