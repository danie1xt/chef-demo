import React, { useState } from 'react';
import { Ingredient, Category } from '../types';
import { CATEGORY_OPTIONS } from '../constants';

interface InventoryProps {
  ingredients: Ingredient[];
  onAdd: (name: string, category: Category) => void;
  onRemove: (id: string) => void;
}

const Inventory: React.FC<InventoryProps> = ({ ingredients, onAdd, onRemove }) => {
  const [newName, setNewName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>(Category.REFRIGERATED);
  const [filterCategory, setFilterCategory] = useState<Category | 'ALL'>('ALL');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onAdd(newName.trim(), selectedCategory);
    setNewName('');
  };

  const filteredIngredients = filterCategory === 'ALL'
    ? ingredients
    : ingredients.filter(i => i.category === filterCategory);

  // Grouping logic for display
  const groupedIngredients = filteredIngredients.reduce((acc, curr) => {
    if (!acc[curr.category]) acc[curr.category] = [];
    acc[curr.category].push(curr);
    return acc;
  }, {} as Record<Category, Ingredient[]>);

  return (
    <div className="space-y-6">
      {/* Add Item Card */}
      <div className="bg-white p-5 rounded-3xl shadow-ios border border-gray-100/50">
        <form onSubmit={handleAdd} className="flex flex-col gap-4">
          <div className="relative">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="添加新食材，例如：鸡蛋..."
              className="w-full bg-gray-100 text-gray-900 placeholder-gray-400 px-4 py-3.5 rounded-2xl border-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all text-[15px]"
            />
             <div className="absolute right-2 top-2 bottom-2">
                <button
                  type="submit"
                  disabled={!newName.trim()}
                  className="bg-brand-500 hover:bg-brand-600 text-white p-2 rounded-xl transition-all disabled:opacity-50 disabled:scale-95 shadow-sm h-full aspect-square flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>
             </div>
          </div>
          
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {CATEGORY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSelectedCategory(opt.value)}
                className={`
                  flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border
                  ${selectedCategory === opt.value 
                    ? 'bg-gray-900 text-white border-gray-900' 
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}
                `}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d={opt.iconPath} />
                </svg>
                {opt.label}
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* Inventory List */}
      <div className="bg-white px-5 py-6 rounded-3xl shadow-ios border border-gray-100/50 min-h-[300px]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            库存清单 <span className="text-gray-400 text-base font-medium ml-1">({ingredients.length})</span>
          </h2>
          <div className="relative">
             <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as Category | 'ALL')}
              className="appearance-none bg-gray-100 text-gray-700 text-xs font-semibold py-1.5 pl-3 pr-8 rounded-lg border-none focus:ring-0 cursor-pointer"
            >
              <option value="ALL">全部区域</option>
              {CATEGORY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
        </div>

        {ingredients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-gray-50 p-6 rounded-full mb-4 text-gray-300">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 7.5V3.75m0 0a3.75 3.75 0 013.75 3.75m-3.75-3.75h-1.5" />
               </svg>
            </div>
            <h3 className="text-gray-900 font-semibold mb-1">冰箱空空如也</h3>
            <p className="text-gray-400 text-sm">快去添加一些食材吧</p>
          </div>
        ) : (
          <div className="space-y-8">
            {(Object.entries(groupedIngredients) as [string, Ingredient[]][]).map(([cat, items]) => {
              const categoryInfo = CATEGORY_OPTIONS.find(c => c.value === cat);
              return (
                <div key={cat} className="animate-fade-in">
                  <div className="flex items-center gap-1 mb-3 ml-1">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 text-gray-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d={categoryInfo?.iconPath || ''} />
                      </svg>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{categoryInfo?.label || cat}</h3>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {items.map(item => (
                      <div 
                        key={item.id} 
                        className={`
                          group flex items-center pl-3 pr-1 py-1 rounded-full text-[13px] font-medium border transition-all duration-200 hover:scale-105 cursor-default
                          ${categoryInfo?.color || 'bg-gray-50 border-gray-100 text-gray-600'}
                        `}
                      >
                        <span>{item.name}</span>
                        <button
                          onClick={() => onRemove(item.id)}
                          className="ml-1 p-1 rounded-full hover:bg-black/10 text-current opacity-40 group-hover:opacity-100 transition-all"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;