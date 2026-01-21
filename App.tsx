
import React, { useState, useEffect } from 'react';
import Inventory from './components/Inventory';
import RecipeList from './components/RecipeList';
import Settings from './components/Settings';
import Favorites from './components/Favorites';
import { Ingredient, Recipe, Category, AppSettings, UserPreferences, SavedRecipe } from './types';
import { STORAGE_KEY_INGREDIENTS, STORAGE_KEY_APP_SETTINGS, STORAGE_KEY_SAVED_RECIPES, STORAGE_KEY_FOLDERS } from './constants';
import { generateRecipes } from './services/geminiService';

enum Tab {
  INVENTORY = 'inventory',
  RECIPES = 'recipes',
  FAVORITES = 'favorites',
  SETTINGS = 'settings'
}

const DEFAULT_FOLDERS = ['默认清单', '健康餐', '快手菜', '周末大餐'];

const DEFAULT_SETTINGS: AppSettings = {
  apiUrl: 'https://generativelanguage.googleapis.com',
  apiKey: '',
  model: 'gemini-2.0-flash-exp'
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.INVENTORY);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [folders, setFolders] = useState<string[]>(DEFAULT_FOLDERS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appSettings, setAppSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // Load data from LocalStorage on mount
  useEffect(() => {
    const storedIng = localStorage.getItem(STORAGE_KEY_INGREDIENTS);
    if (storedIng) {
      try {
        setIngredients(JSON.parse(storedIng));
      } catch (e) {
        console.error("Failed to parse ingredients", e);
      }
    }
    
    const storedSettings = localStorage.getItem(STORAGE_KEY_APP_SETTINGS);
    if (storedSettings) {
      try {
        setAppSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) });
      } catch (e) {
        console.error("Failed to parse app settings", e);
      }
    }

    const storedSaved = localStorage.getItem(STORAGE_KEY_SAVED_RECIPES);
    if (storedSaved) {
      try {
        setSavedRecipes(JSON.parse(storedSaved));
      } catch (e) {
        console.error("Failed to parse saved recipes", e);
      }
    }

    const storedFolders = localStorage.getItem(STORAGE_KEY_FOLDERS);
    if (storedFolders) {
      try {
        setFolders(JSON.parse(storedFolders));
      } catch (e) {
        console.error("Failed to parse folders", e);
      }
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_INGREDIENTS, JSON.stringify(ingredients));
  }, [ingredients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SAVED_RECIPES, JSON.stringify(savedRecipes));
  }, [savedRecipes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FOLDERS, JSON.stringify(folders));
  }, [folders]);

  const handleSaveSettings = (newSettings: AppSettings) => {
    setAppSettings(newSettings);
    localStorage.setItem(STORAGE_KEY_APP_SETTINGS, JSON.stringify(newSettings));
  };

  const handleAddIngredient = (name: string, category: Category) => {
    const newIngredient: Ingredient = {
      id: Date.now().toString(),
      name,
      category
    };
    setIngredients(prev => [...prev, newIngredient]);
  };

  const handleRemoveIngredient = (id: string) => {
    setIngredients(prev => prev.filter(i => i.id !== id));
  };

  const handleGenerateRecipes = async (prefs: UserPreferences) => {
    if (!appSettings.apiKey) {
      setActiveTab(Tab.SETTINGS);
      alert('请先在设置中配置 API Key');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const generated = await generateRecipes(ingredients, prefs, appSettings);
      setRecipes(generated);
    } catch (err: any) {
      setError(err.message || "生成食谱时遇到问题，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRecipe = (recipe: Recipe) => {
    // Automatically format failure points into user notes
    const failureNotes = recipe.failurePoints && recipe.failurePoints.length > 0
      ? `⚠️ 避坑指南：\n${recipe.failurePoints.map(p => `• ${p}`).join('\n')}`
      : '';

    const newSaved: SavedRecipe = {
      ...recipe,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      savedAt: Date.now(),
      userNotes: failureNotes, // Pre-fill notes with failure points
      folder: '默认清单' // Default folder
    };
    setSavedRecipes(prev => [newSaved, ...prev]);
  };

  const handleRemoveSavedRecipe = (id: string) => {
    setSavedRecipes(prev => prev.filter(r => r.id !== id));
  };

  const handleUpdateSavedRecipe = (updated: SavedRecipe) => {
    setSavedRecipes(prev => prev.map(r => r.id === updated.id ? updated : r));
  };

  // Folder Management Logic
  const handleCreateFolder = (name: string) => {
    if (!folders.includes(name)) {
      setFolders(prev => [...prev, name]);
    }
  };

  const handleDeleteFolder = (name: string) => {
    // 1. Remove folder from list
    setFolders(prev => prev.filter(f => f !== name));
    // 2. Move recipes in this folder to '默认清单'
    setSavedRecipes(prev => prev.map(r => {
      if (r.folder === name) {
        return { ...r, folder: '默认清单' };
      }
      return r;
    }));
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case Tab.INVENTORY: return '我的冰箱';
      case Tab.RECIPES: return '食谱卡片'; 
      case Tab.FAVORITES: return '收藏夹';
      case Tab.SETTINGS: return '设置';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-28 md:pb-10">
      {/* iOS Style Blurry Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 pt-safe transition-all duration-300">
        <div className="max-w-3xl mx-auto px-5 py-3 flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 transition-all duration-300">
            {getPageTitle()}
          </h1>
          
          {/* Desktop Nav - Clean Text Links */}
          <nav className="hidden md:flex gap-1 bg-gray-100/50 p-1 rounded-xl">
            {[
              { id: Tab.INVENTORY, label: '库存' },
              { id: Tab.RECIPES, label: '食谱' },
              { id: Tab.FAVORITES, label: '收藏' },
              { id: Tab.SETTINGS, label: '设置' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-5 pt-6 animate-fade-in">
        {error && (
          <div className="mb-6 bg-red-50/80 backdrop-blur-md border border-red-100 text-red-600 px-4 py-3 rounded-2xl flex items-center gap-3 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-medium text-sm">{error}</span>
          </div>
        )}

        <div className={activeTab === Tab.INVENTORY ? 'block' : 'hidden'}>
          <Inventory 
            ingredients={ingredients} 
            onAdd={handleAddIngredient} 
            onRemove={handleRemoveIngredient} 
          />
        </div>

        <div className={activeTab === Tab.RECIPES ? 'block' : 'hidden'}>
          <RecipeList 
            recipes={recipes} 
            ingredients={ingredients}
            loading={loading} 
            onGenerate={handleGenerateRecipes}
            onSave={handleSaveRecipe}
            hasIngredients={ingredients.length > 0}
          />
        </div>

        <div className={activeTab === Tab.FAVORITES ? 'block' : 'hidden'}>
          <Favorites
            savedRecipes={savedRecipes}
            folders={folders}
            onRemove={handleRemoveSavedRecipe}
            onUpdate={handleUpdateSavedRecipe}
            onCreateFolder={handleCreateFolder}
            onDeleteFolder={handleDeleteFolder}
          />
        </div>

        <div className={activeTab === Tab.SETTINGS ? 'block' : 'hidden'}>
          <Settings
            settings={appSettings}
            onSave={handleSaveSettings}
          />
        </div>
      </main>

      {/* iOS Style Bottom Tab Bar (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/85 backdrop-blur-xl border-t border-gray-200/50 pb-safe z-50">
        <div className="flex justify-around items-center h-14">
          <button
            onClick={() => setActiveTab(Tab.INVENTORY)}
            className={`flex flex-col items-center justify-center w-full h-full space-y-0.5 ${activeTab === Tab.INVENTORY ? 'text-gray-900' : 'text-gray-400 hover:text-gray-500'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={activeTab === Tab.INVENTORY ? "currentColor" : "none"} stroke="currentColor" strokeWidth={activeTab === Tab.INVENTORY ? 0 : 2} className="w-6 h-6 transition-transform duration-200 active:scale-90">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
            <span className="text-[10px] font-medium">库存</span>
          </button>
          
          <button
            onClick={() => setActiveTab(Tab.RECIPES)}
            className={`flex flex-col items-center justify-center w-full h-full space-y-0.5 ${activeTab === Tab.RECIPES ? 'text-gray-900' : 'text-gray-400 hover:text-gray-500'}`}
          >
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={activeTab === Tab.RECIPES ? "currentColor" : "none"} stroke="currentColor" strokeWidth={activeTab === Tab.RECIPES ? 0 : 2} className="w-6 h-6 transition-transform duration-200 active:scale-90">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
            <span className="text-[10px] font-medium">食谱</span>
          </button>
          
          <button
            onClick={() => setActiveTab(Tab.FAVORITES)}
            className={`flex flex-col items-center justify-center w-full h-full space-y-0.5 ${activeTab === Tab.FAVORITES ? 'text-gray-900' : 'text-gray-400 hover:text-gray-500'}`}
          >
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={activeTab === Tab.FAVORITES ? "currentColor" : "none"} stroke="currentColor" strokeWidth={activeTab === Tab.FAVORITES ? 0 : 2} className="w-6 h-6 transition-transform duration-200 active:scale-90">
               <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            <span className="text-[10px] font-medium">收藏</span>
          </button>
          
          <button
            onClick={() => setActiveTab(Tab.SETTINGS)}
            className={`flex flex-col items-center justify-center w-full h-full space-y-0.5 ${activeTab === Tab.SETTINGS ? 'text-gray-900' : 'text-gray-400 hover:text-gray-500'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={activeTab === Tab.SETTINGS ? "currentColor" : "none"} stroke="currentColor" strokeWidth={activeTab === Tab.SETTINGS ? 0 : 2} className="w-6 h-6 transition-transform duration-200 active:scale-90">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-[10px] font-medium">设置</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default App;
