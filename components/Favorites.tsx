import React, { useState, useMemo } from 'react';
import { SavedRecipe } from '../types';

interface FavoritesProps {
  savedRecipes: SavedRecipe[];
  folders: string[];
  onRemove: (id: string) => void;
  onUpdate: (updatedRecipe: SavedRecipe) => void;
  onCreateFolder: (name: string) => void;
  onDeleteFolder: (name: string) => void;
}

const DEFAULT_FOLDER = '默认清单';

const Favorites: React.FC<FavoritesProps> = ({ 
  savedRecipes, 
  folders, 
  onRemove, 
  onUpdate, 
  onCreateFolder, 
  onDeleteFolder 
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<SavedRecipe | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFolder, setActiveFolder] = useState<string>('全部');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Filter recipes based on Folder AND Search
  const filteredRecipes = useMemo(() => {
    return savedRecipes.filter(recipe => {
      // 1. Folder Filter
      const recipeFolder = recipe.folder || DEFAULT_FOLDER;
      const matchesFolder = activeFolder === '全部' || recipeFolder === activeFolder;

      // 2. Search Filter
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !query || 
        recipe.name.toLowerCase().includes(query) || 
        recipe.description.toLowerCase().includes(query) || 
        (recipe.userNotes && recipe.userNotes.toLowerCase().includes(query));

      return matchesFolder && matchesSearch;
    });
  }, [savedRecipes, activeFolder, searchQuery]);

  const handleCreateFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim());
      setNewFolderName('');
      setIsCreatingFolder(false);
      setActiveFolder(newFolderName.trim()); // Switch to new folder
    }
  };

  const startEditing = (recipe: SavedRecipe) => {
    setEditingId(recipe.id);
    setEditForm({ ...recipe, folder: recipe.folder || DEFAULT_FOLDER });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const saveEditing = () => {
    if (editForm) {
      onUpdate(editForm);
      setEditingId(null);
      setEditForm(null);
    }
  };

  const handleInputChange = (field: keyof SavedRecipe, value: string) => {
    if (editForm) {
      setEditForm({ ...editForm, [field]: value });
    }
  };

  const handleArrayChange = (field: 'steps' | 'failurePoints', value: string) => {
    if (editForm) {
      const arrayValue = value.split('\n').filter(line => line.trim() !== '');
      setEditForm({ ...editForm, [field]: arrayValue });
    }
  };

  if (savedRecipes.length === 0 && folders.length <= 1) {
    return (
      <div className="bg-white p-12 rounded-3xl shadow-ios border border-gray-100 text-center py-20 min-h-[400px] flex flex-col justify-center items-center">
        <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mb-6 text-red-500">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">还没有收藏的食谱</h2>
        <p className="text-gray-400 max-w-xs mx-auto">在生成的食谱卡片上点击爱心，这里就会为你保存美味记忆。</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Controls: Search & Categories */}
      <div className="space-y-4 sticky top-14 z-20 bg-gray-100/90 backdrop-blur-md py-2 -mx-5 px-5 transition-all">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-9 pr-3 py-2.5 border-none rounded-xl leading-5 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 sm:text-sm shadow-sm"
            placeholder="搜索食谱名称、描述或备注..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Horizontal Folder Scroll */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {/* Create New Folder Button */}
          <button
            onClick={() => setIsCreatingFolder(true)}
            className="shrink-0 w-8 h-8 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:text-brand-500 hover:border-brand-500 hover:bg-white transition-all active:scale-95"
            title="新建收藏夹"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
          </button>

          <div className="h-6 w-px bg-gray-300 mx-1 shrink-0"></div>

          <button
            onClick={() => setActiveFolder('全部')}
            className={`
              px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border shadow-sm
              ${activeFolder === '全部' 
                ? 'bg-gray-900 text-white border-gray-900' 
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}
            `}
          >
            全部
          </button>
          
          {folders.map(folder => (
            <button
              key={folder}
              onClick={() => setActiveFolder(folder)}
              className={`
                px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border shadow-sm
                ${activeFolder === folder 
                  ? 'bg-gray-900 text-white border-gray-900' 
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}
              `}
            >
              {folder}
            </button>
          ))}
        </div>
      </div>

      {/* New Folder Modal (Simple Inline Overlay for now) */}
      {isCreatingFolder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/30 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm transform transition-all scale-100">
             <h3 className="text-lg font-bold text-gray-900 mb-4">新建收藏夹</h3>
             <form onSubmit={handleCreateFolderSubmit}>
               <input
                autoFocus
                type="text"
                placeholder="例如：周末大餐"
                className="w-full bg-gray-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-brand-500 mb-4 text-sm"
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
               />
               <div className="flex gap-2">
                 <button type="button" onClick={() => setIsCreatingFolder(false)} className="flex-1 bg-gray-100 text-gray-600 font-bold py-2.5 rounded-xl text-sm">取消</button>
                 <button type="submit" className="flex-1 bg-brand-500 text-white font-bold py-2.5 rounded-xl text-sm shadow-lg shadow-brand-500/20">创建</button>
               </div>
             </form>
          </div>
        </div>
      )}

      {/* Sub Header & Delete Folder Action */}
      <div className="flex items-center justify-between mb-2 px-1">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
           {activeFolder} ({filteredRecipes.length})
        </h2>
        
        {activeFolder !== '全部' && activeFolder !== DEFAULT_FOLDER && (
          <button 
            onClick={() => {
              if (window.confirm(`确定要删除“${activeFolder}”吗？该收藏夹下的食谱将移动到“${DEFAULT_FOLDER}”。`)) {
                onDeleteFolder(activeFolder);
                setActiveFolder('全部');
              }
            }}
            className="text-[10px] font-bold text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-md transition-colors"
          >
            删除此分类
          </button>
        )}
      </div>

      {filteredRecipes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-sm">在此分类或搜索条件下未找到食谱</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredRecipes.map((recipe) => {
            const isEditing = editingId === recipe.id;

            return (
              <div key={recipe.id} className={`bg-white rounded-3xl shadow-ios border transition-all duration-300 flex flex-col relative overflow-hidden ${isEditing ? 'border-brand-500 ring-2 ring-brand-500/20 shadow-xl z-10' : 'border-gray-100 hover:shadow-ios-hover'}`}>
                <div className="p-6 flex-1">
                  {/* Header: Name and Actions */}
                  <div className="flex justify-between items-start mb-4 pr-16">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm?.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="text-xl font-bold text-gray-900 w-full border-b-2 border-brand-500 focus:outline-none bg-transparent px-0 py-1"
                        placeholder="菜谱名称"
                      />
                    ) : (
                      <div className="flex flex-col">
                        <h3 className="text-xl font-bold text-gray-900 leading-tight">{recipe.name}</h3>
                        {/* Folder Tag Display */}
                        <div className="flex mt-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-500">
                            <svg className="mr-1 h-2.5 w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                            {recipe.folder || DEFAULT_FOLDER}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Top Right Actions */}
                   {!isEditing && (
                      <div className="absolute top-5 right-5 flex gap-1 bg-gray-50 p-1 rounded-xl">
                        <button 
                          onClick={() => startEditing(recipe)}
                          className="p-2 text-gray-400 hover:text-brand-600 hover:bg-white rounded-lg transition-all"
                          title="编辑"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button 
                          onClick={() => onRemove(recipe.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-all"
                          title="删除"
                        >
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    )}

                  {/* Description & Time */}
                  <div className="mb-5 text-sm">
                    {isEditing ? (
                      <div className="space-y-3 bg-gray-50 p-3 rounded-xl">
                         <div className="flex gap-2">
                           {/* Folder Selection in Edit Mode - Strict Select */}
                           <div className="flex-1">
                             <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">收藏分类</label>
                             <div className="relative">
                               <select
                                  value={editForm?.folder || DEFAULT_FOLDER}
                                  onChange={(e) => handleInputChange('folder', e.target.value)}
                                  className="w-full text-gray-900 border-none bg-white rounded-lg p-2 focus:ring-2 focus:ring-brand-500 text-sm appearance-none"
                               >
                                 {folders.map(f => (
                                   <option key={f} value={f}>{f}</option>
                                 ))}
                               </select>
                               <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                  <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                </div>
                             </div>
                           </div>
                           <div className="flex-1">
                              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">时间</label>
                              <input
                                type="text"
                                value={editForm?.cookingTime}
                                onChange={(e) => handleInputChange('cookingTime', e.target.value)}
                                className="w-full text-gray-900 border-none bg-white rounded-lg p-2 focus:ring-2 focus:ring-brand-500 text-sm"
                                placeholder="烹饪时间"
                              />
                           </div>
                         </div>
                        
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">描述</label>
                          <textarea
                            value={editForm?.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            className="w-full text-gray-600 border-none bg-white rounded-lg p-2 focus:ring-2 focus:ring-brand-500 text-sm"
                            placeholder="描述"
                            rows={2}
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center text-gray-400 text-xs font-medium mb-3">
                          <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          {recipe.cookingTime}
                        </div>
                        <p className="text-gray-600 text-sm italic leading-relaxed pl-3 border-l-2 border-brand-300">
                          "{recipe.description}"
                        </p>
                      </>
                    )}
                  </div>

                  {/* User Notes - Editable */}
                  <div className="mb-6 bg-yellow-50/60 p-4 rounded-2xl border border-yellow-100">
                    <h4 className="text-[10px] font-bold uppercase text-yellow-600 tracking-wider mb-2 flex items-center">
                      <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" /></svg>
                      我的心得
                    </h4>
                    {isEditing ? (
                      <textarea
                        value={editForm?.userNotes || ''}
                        onChange={(e) => handleInputChange('userNotes', e.target.value)}
                        className="w-full bg-white text-sm text-gray-800 border-none rounded-xl p-3 focus:ring-2 focus:ring-yellow-400"
                        placeholder="写下你的心得，比如：少放盐，多煮5分钟..."
                        rows={3}
                      />
                    ) : (
                      <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                        {recipe.userNotes ? recipe.userNotes : <span className="text-gray-400 text-xs italic">点击编辑添加备注...</span>}
                      </p>
                    )}
                  </div>

                  {/* Steps - Editable as text block */}
                  <div>
                     <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">烹饪步骤</h4>
                     {isEditing ? (
                       <textarea
                          value={editForm?.steps.join('\n')}
                          onChange={(e) => handleArrayChange('steps', e.target.value)}
                          className="w-full text-sm text-gray-700 bg-gray-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-brand-500 min-h-[150px]"
                          placeholder="每行一个步骤"
                       />
                     ) : (
                      <ol className="relative border-l border-gray-100 ml-2 space-y-3">
                        {recipe.steps.map((step, i) => (
                          <li key={i} className="mb-1 ml-4">
                             <div className="absolute w-1.5 h-1.5 bg-gray-300 rounded-full mt-2 -left-[3.5px]"></div>
                             <span className="text-sm text-gray-600 leading-relaxed block">{step}</span>
                          </li>
                        ))}
                      </ol>
                     )}
                  </div>

                  {/* Actions for Edit Mode */}
                  {isEditing && (
                    <div className="mt-6 flex gap-3 pt-5 border-t border-gray-100">
                      <button
                        onClick={saveEditing}
                        className="flex-1 bg-brand-500 hover:bg-brand-600 text-white font-bold py-2.5 rounded-xl transition shadow-lg shadow-brand-500/20 text-sm"
                      >
                        保存
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-2.5 rounded-xl transition text-sm"
                      >
                        取消
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Favorites;