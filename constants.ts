
import { Category } from './types';

// Unified styling for all categories: Minimalist Warm Gray
const UNIFIED_TAG_STYLE = 'bg-gray-100 text-gray-600 border-gray-200';

export const CATEGORY_OPTIONS = [
  { 
    value: Category.REFRIGERATED, 
    label: '冷藏', 
    color: UNIFIED_TAG_STYLE,
    iconPath: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' // Cube
  },
  { 
    value: Category.FROZEN, 
    label: '冷冻', 
    color: UNIFIED_TAG_STYLE,
    iconPath: 'M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z' // Archive/Snow-ish
  },
  { 
    value: Category.ROOM_TEMP, 
    label: '常温', 
    color: UNIFIED_TAG_STYLE,
    iconPath: 'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25' // Home
  },
  { 
    value: Category.STAPLE, 
    label: '主食', 
    color: UNIFIED_TAG_STYLE,
    iconPath: 'M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3.75h3.75M12 15.75h3.75M12 7.5V3.75m0 0a3.75 3.75 0 013.75 3.75m-3.75-3.75h-1.5' // Bag/Box
  },
  { 
    value: Category.CONDIMENT, 
    label: '调料', 
    color: UNIFIED_TAG_STYLE,
    iconPath: 'M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5' // Flask
  },
];

export const CUISINE_STYLES = [
  '随机惊喜', '中式家常', '川湘麻辣', '粤式清淡', '日韩料理', '西式简餐', '东南亚风味'
];

export const TASTE_PREFERENCES = [
  '无特殊偏好', '清淡', '香辣', '酸甜', '咸鲜', '蒜香', '低脂/健康'
];

export const STORAGE_KEY_INGREDIENTS = 'smart_fridge_ingredients';
export const STORAGE_KEY_APP_SETTINGS = 'smart_fridge_app_settings'; // New key
export const STORAGE_KEY_SAVED_RECIPES = 'smart_fridge_saved_recipes';
export const STORAGE_KEY_FOLDERS = 'smart_fridge_folders';
// Deprecated: STORAGE_KEY_SETTINGS (was used for model only)
