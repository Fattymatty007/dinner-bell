import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Copy, Check, ClipboardList, ChefHat, RefreshCw, X, Plus, ListPlus, Edit3, Bell, LogOut, Trash2, ChevronsRight, Bookmark } from 'lucide-react';
import { useAuth } from './useAuth';
import { firebaseConfigured } from './firebase';
import { loadProfile, saveProfile } from './profileStore';

const COLORS = {
  bg: '#2B2E27',
  panel: '#34372E',
  panelBorder: '#454A3D',
  panelBorderLight: '#565C4B',
  chalk: '#F2EFE6',
  chalkDim: '#C9C6BA',
  mustard: '#C9A227',
  sage: '#8B9A7D',
  rust: '#A85C40',
  paper: '#EDE8DA',
  paperText: '#2B2E27',
  paperDashed: '#B9B2A0',
};

// This is a snapshot of your dinner log at the time this artifact was built.
// Since there's no live storage on mobile, ask Claude to "refresh the grocery
// list" whenever you've logged new dinners and want an updated list.
const INITIAL_DINNERS = [
  { id: '1', dish: 'Pizza', ingredients: ['pizza dough', 'pizza sauce', 'pizza cheese', 'pepperoni', 'canned pineapple tidbits'] },
  { id: '2', dish: 'Lasagna Soup', ingredients: ['lasagna noodles', 'onion', 'garlic', 'hamburger', 'spicy Italian sausage', 'tomato paste', 'chicken broth', 'spaghetti sauce', 'heavy whipping cream', 'shredded mozzarella', 'shredded parmesan', 'ricotta cheese'] },
  { id: '3', dish: 'Chicken Tikka Masala', ingredients: ['chicken', 'tikka masala sauce', 'naan', 'basmati rice'] },
  { id: '4', dish: 'BBQ Ribs', ingredients: ['pork ribs', 'corn', 'potato salad', 'BBQ sauce'] },
  { id: '5', dish: 'Buffalo Chicken Salad', ingredients: ['chicken', 'romaine', 'croutons', 'ranch', 'bleu cheese crumbles'] },
  { id: '6', dish: 'Chili Dogs', ingredients: ['hot dogs', 'chili', 'onion', 'cheddar', 'hot dog buns'] },
  { id: '7', dish: 'Chicken Caesar Salad', ingredients: ['romaine', 'caesar dressing', 'parmesan', 'croutons', 'chicken'] },
  { id: '8', dish: 'Pork Chops', ingredients: ['pork chops', 'bread crumbs', 'corn', 'stuffing'] },
  { id: '9', dish: 'Firecracker Meatballs', ingredients: ['hamburger', 'bread crumbs', 'soy sauce', 'ginger', 'green onion', 'mayonnaise', 'honey', 'sour cream', 'sriracha', 'rice'] },
  { id: '10', dish: 'Chicken Quesadillas', ingredients: ['tortillas', 'chicken', 'Mexican cheese', 'green pepper', 'onion', 'sour cream'] },
  { id: '11', dish: 'Bacon Pasta', ingredients: ['spaghetti noodles', 'eggs', 'bacon', 'heavy cream'] },
  { id: '12', dish: 'Tortilla Soup', ingredients: ['onion', 'crushed tomatoes', 'Rotel diced tomatoes', 'chicken broth', 'corn', 'black beans', 'heavy whipping cream', 'chicken', 'tortilla strips', 'avocado', 'sour cream', 'Mexican cheese'] },
  { id: '13', dish: 'Tortellini Soup', ingredients: ['crushed tomatoes', 'chicken broth', 'Italian sausage', 'heavy cream', 'tortellini', 'spinach'] },
  { id: '14', dish: 'Meat Loaf', ingredients: ['hamburger', 'ground pork', 'mushrooms', 'carrots', 'onion', 'eggs', 'bread crumbs', 'Lipton Beefy Onion mix'] },
  { id: '15', dish: 'Creamy White Chicken Enchiladas', ingredients: ['chicken', 'tortillas', 'taco seasoning', 'cream cheese block', 'canned green chilies x2', 'Colby Jack cheese block', 'chicken broth'] },
  { id: '16', dish: 'Homemade Chili', ingredients: ['hamburger', 'kidney beans', 'black beans', 'beef broth', 'whole jalapeño', 'Rotel tomatoes', 'tomato paste', 'petite diced tomatoes', 'crushed tomatoes', 'onion', 'green bell pepper', 'sour cream', 'shredded cheddar cheese', 'cornbread mix'] },
  { id: '17', dish: 'Chicken Parm', ingredients: ['chicken breast', 'bread crumbs', 'eggs', 'spaghetti noodles', 'shredded parmesan', 'shredded mozzarella', 'spaghetti sauce', 'onion', 'green bell pepper', 'Italian sausage', 'hamburger'] },
  { id: '18', dish: 'Cheesy Kielbasa Rice', ingredients: ['cheesy broccoli rice pouch x2', 'broccoli', 'kielbasa'] },
  { id: '19', dish: 'Broccoli Cheddar Soup', ingredients: ['broccoli', 'cheddar cheese block', 'carrots x3', 'onion', 'chicken broth', 'heavy whipping cream'] },
  { id: '20', dish: 'Steak Tacos', ingredients: ['steak', 'crumbled cheese', 'soy sauce', 'garlic', 'lemon juice', 'mini tortillas', 'yellow pepper', 'red onion'] },
  { id: '21', dish: 'Pulled Pork Sandwiches', ingredients: ['pork roast', 'BBQ sauce', 'hamburger buns', 'coleslaw', 'banana peppers'] },
  { id: '22', dish: 'Breaky Burritos', ingredients: ['eggs', 'potatoes', 'bacon', 'sausage', 'chorizo', 'onion', 'tortillas'] },
  { id: '23', dish: 'Alfredo', ingredients: ['parmesan', 'butter', 'garlic', 'heavy whipping cream', 'pasta'] },
  { id: '24', dish: 'Chicken Pot Pie', ingredients: ['chicken', 'biscuits', 'cream of chicken soup', 'milk', 'butter', 'frozen mixed veggies'] },
  { id: '25', dish: 'Ghetto Enchiladas', ingredients: ['tortillas', 'Mexican cheese', 'chicken', "zatarain's rice", 'enchilada sauce', 'sour cream'] },
  { id: '26', dish: 'BLTs with Tomato Soup', ingredients: ['bread', 'bacon', 'tomato', 'romaine', 'tomato soup'] },
  { id: '27', dish: 'Spaghetti', ingredients: ['onion', 'green pepper', 'spaghetti noodles', 'spaghetti sauce', 'hamburger', 'Italian sausage', 'parmesan'] },
  { id: '28', dish: 'Teriyaki Burgers', ingredients: ['hamburger', 'hamburger buns', 'teriyaki sauce', 'pineapple slices', 'Swiss cheese', 'bacon'] },
  { id: '29', dish: 'Zuppa Toscana', ingredients: ['spicy Italian sausage', 'butter', 'onion', 'garlic', 'chicken broth', 'yellow potatoes', 'heavy cream', 'kale', 'grated parmesan cheese'] },
  { id: '30', dish: 'Grilled Cheese & Tomato Soup', ingredients: ['bread', 'American sliced cheese', 'deli ham', 'tomato soup'] },
  { id: '31', dish: 'White People Tacos', ingredients: ['hamburger', 'tortillas', 'romaine', 'pico de gallo', 'guacamole', 'shredded cheese', 'sour cream'] },
  { id: '32', dish: 'Hamburger Helper', ingredients: ['hamburger', 'Hamburger Helper', 'corn'] },
  { id: '33', dish: 'Teriyaki Chicken', ingredients: ['chicken thighs', 'teriyaki sauce', 'rice', 'gyoza', 'broccoli'] },
  { id: '34', dish: 'Buffalo Chicken Thighs', ingredients: ['chicken thighs', 'buffalo sauce', 'yellow potatoes', 'sour cream', 'shredded parmesan', 'corn'] },
  { id: '35', dish: 'Teriyaki Skewers', ingredients: ['chicken', 'rice', 'teriyaki sauce', 'pineapple chunks', 'mushrooms', 'onion', 'yellow bell pepper'] },
  { id: '36', dish: 'Sheet Pan Dinner', ingredients: ['kielbasa sausage', 'potatoes', 'carrots', 'Brussels sprouts', 'yellow bell pepper', 'orange bell pepper', 'zucchini', 'onion'] },
  { id: '37', dish: 'Mushroom Bacon Swiss Burgers', ingredients: ['mushrooms', 'Swiss cheese', 'hamburger', 'bacon', 'burger buns'] },
  { id: '38', dish: 'Turkey Burgers', ingredients: ['ground turkey', 'feta cheese', 'spinach', 'onion burger buns', 'sliced Swiss cheese', 'aioli'] },
  { id: '39', dish: 'Fried Rice', ingredients: ['rice', 'BBQ pork', 'frozen peas & carrots', 'eggs', 'broccoli', 'gyoza'] },
  { id: '40', dish: 'Ghetto Stir-fry', ingredients: ['chicken', 'ramen noodles x4', 'frozen stir fry veggies', 'gyoza'] },
  { id: '41', dish: 'Easy Asian Dinner', ingredients: ["Trader Joe's Asian dish", 'brown rice', 'gyoza'] },
  { id: '42', dish: 'Baked Potato Soup', ingredients: ['bacon', 'onion', 'celery', 'green onion', 'chicken bouillon', 'yellow potatoes', 'heavy whipping cream', 'cheddar cheese block', 'chicken broth'] },
  { id: '43', dish: 'Broccoli Beef', ingredients: ['steak', 'broccoli', 'brown rice', 'hoisin sauce', 'teriyaki sauce', 'shredded cabbage'] },
  { id: '44', dish: 'Sundried Pesto Pasta', ingredients: ['sun-dried tomatoes in oil', 'pesto', 'rigatoni pasta', 'chicken', 'yellow onion', 'heavy whipping cream', 'broccoli', 'spinach', 'shredded parmesan', 'shredded mozzarella'] },
  { id: '45', dish: 'Fancy Mac', ingredients: ['chicken', 'bacon bits', 'broccoli', 'Velveeta mac and cheese'] },
  { id: '46', dish: 'Crunch Wraps', ingredients: ['tortillas', 'hamburger', 'flat tostadas', 'soft cheese', 'lettuce', 'tomatoes'] },
  { id: '47', dish: 'Pork Nachos', ingredients: ['tortilla chips', 'soft cheese', 'pork', 'pico de gallo', 'guacamole', 'sour cream', 'jalapeños', 'beans'] },
  { id: '48', dish: 'Chicken Burrito Bowls', ingredients: ['chicken', 'romaine', 'brown rice', 'black beans', 'corn', 'shredded Mexican cheese', 'sour cream', 'pico de gallo', 'guacamole'] },
  { id: '49', dish: 'Pork Tacos w/Avocado Sauce', ingredients: ['pork roast', 'mini tortillas', 'banana peppers', 'cilantro', 'lime', 'avocado sauce', 'cabbage'] },
  { id: '50', dish: 'Chicken Bacon Ranch Salad', ingredients: ['chicken', 'romaine', 'bacon bits', 'bleu cheese crumbles', 'cucumber', 'red onion', 'croutons', 'ranch dressing packet'] },
  { id: '51', dish: 'Steak and Baked Potato Dinner', ingredients: ['steak', 'asparagus', 'russet potatoes', 'sour cream', 'chives', 'bacon bits', 'shredded cheese'] },
  { id: '52', dish: 'Steak and Pasta Dinner', ingredients: ['steak', 'baby broccoli', 'frozen pasta'] },
  { id: '53', dish: 'Steak Salad', ingredients: ['steak', 'bleu cheese dressing', 'romaine', 'eggs', 'shredded cheddar', 'croutons', 'avocado'] },
];

const DEFAULT_WEEK_SIZE = 7;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickWeek(dinners, size) {
  return shuffle(dinners).slice(0, Math.min(size, dinners.length));
}

// Parses "carrots x3" -> { name: "carrots", qty: 3 }; "chicken" -> { name: "chicken", qty: 1 }
function parseIngredient(raw) {
  const trimmed = raw.trim();
  const match = trimmed.match(/^(.*?)\s*x\s*(\d+)$/i);
  if (match && match[1].trim()) {
    return { name: match[1].trim(), qty: parseInt(match[2], 10) };
  }
  return { name: trimmed, qty: 1 };
}

// How much of `constraintName` does this dinner contribute (substring match on parsed ingredient names)?
function ingredientMatchQty(meal, constraintName) {
  const key = constraintName.toLowerCase();
  let total = 0;
  meal.ingredients.forEach((ing) => {
    const { name, qty } = parseIngredient(ing);
    if (name.toLowerCase().includes(key)) total += qty;
  });
  return total;
}

// Builds a week that tries to satisfy each { name, qty } suggestion by including
// enough matching dinners, then fills any remaining slots randomly.
function pickWeekWithSuggestions(dinners, suggestions, size) {
  const selected = [];
  const selectedIds = new Set();

  suggestions.forEach(({ name, qty: targetQty }) => {
    let remaining = targetQty - selected.reduce((sum, d) => sum + ingredientMatchQty(d, name), 0);
    while (remaining > 0 && selected.length < size) {
      const candidates = dinners.filter((d) => !selectedIds.has(d.id) && ingredientMatchQty(d, name) > 0);
      if (candidates.length === 0) break;
      const pick = candidates[Math.floor(Math.random() * candidates.length)];
      selected.push(pick);
      selectedIds.add(pick.id);
      remaining -= ingredientMatchQty(pick, name);
    }
  });

  if (selected.length < size) {
    const rest = shuffle(dinners.filter((d) => !selectedIds.has(d.id)));
    for (const d of rest) {
      if (selected.length >= size) break;
      selected.push(d);
      selectedIds.add(d.id);
    }
  }

  return shuffle(selected).slice(0, size);
}

// Which suggestions didn't end up fully met (not enough logged dinners contain them)?
function unmetSuggestionNames(meals, suggestions) {
  return suggestions
    .filter(({ name, qty }) => meals.reduce((sum, m) => sum + ingredientMatchQty(m, name), 0) < qty)
    .map((s) => s.name);
}

let slotCounter = 0;
function makeSlotId() {
  slotCounter += 1;
  return `slot-${slotCounter}-${Math.random().toString(36).slice(2, 7)}`;
}

function pickWeekSlots(dinners, suggestions = [], size = DEFAULT_WEEK_SIZE) {
  const week = suggestions.length > 0 ? pickWeekWithSuggestions(dinners, suggestions, size) : pickWeek(dinners, size);
  return week.map((meal) => ({ slotId: makeSlotId(), meal }));
}

const SWIPE_THRESHOLD = 90;

function mealText(meal) {
  return `${meal.dish}: ${meal.ingredients.join(', ')}`;
}

// Ordered by matching priority (first match wins) to resolve overlaps like
// "cream of chicken soup" (Canned, not Dairy/Meat) or "potato salad" (Deli, not Produce).
const DEPARTMENT_RULES = [
  { name: 'Dairy & Eggs', keywords: ['cheese', 'cheddar', 'parmesan', 'mozzarella', 'ricotta', 'sour cream', 'heavy whipping cream', 'heavy cream', 'cream cheese', 'milk', 'butter', 'egg', 'yogurt'] },
  { name: 'Deli & Prepared', keywords: ['salad', 'coleslaw', 'pico de gallo', 'guacamole'] },
  { name: 'Canned & Soups', keywords: ['soup', 'broth', 'beans', 'crushed tomato', 'diced tomato', 'rotel', 'tomato paste', 'canned', 'bouillon'] },
  { name: 'Condiments & Sauces', keywords: ['sauce', 'dressing', 'ranch', 'mayonnaise', 'sriracha', 'ketchup', 'mustard', 'syrup', 'pesto', 'aioli'] },
  { name: 'Pantry & Dry Goods', keywords: ['rice', 'pasta', 'noodle', 'tortellini', 'stuffing', 'crumbs', 'honey', 'zatarain', 'mix', 'spice', 'seasoning', 'chips', 'helper'] },
  { name: 'Bakery', keywords: ['bread', 'bun', 'naan', 'tortilla', 'biscuit', 'roll', 'bagel', 'crouton', 'dough', 'tostada'] },
  { name: 'Meat & Seafood', keywords: ['chicken', 'pork', 'beef', 'hamburger', 'steak', 'bacon', 'sausage', 'chorizo', 'ham', 'turkey', 'rib', 'hot dog', 'fish', 'shrimp', 'salmon', 'pepperoni', 'kielbasa'] },
  { name: 'Produce', keywords: ['onion', 'garlic', 'pepper', 'romaine', 'spinach', 'kale', 'mushroom', 'carrot', 'potato', 'tomato', 'avocado', 'lemon', 'lime', 'corn', 'ginger', 'pineapple', 'lettuce', 'celery', 'cucumber', 'broccoli', 'jalape', 'asparagus', 'chive', 'cilantro', 'cabbage', 'brussel', 'zucchini'] },
];

const DEPARTMENT_ORDER = ['Produce', 'Meat & Seafood', 'Dairy & Eggs', 'Bakery', 'Deli & Prepared', 'Canned & Soups', 'Condiments & Sauces', 'Pantry & Dry Goods', 'Frozen', 'Other'];

function categorize(itemName) {
  const n = itemName.toLowerCase();
  if (n.includes('frozen') || n.includes('gyoza')) return 'Frozen';
  for (const dept of DEPARTMENT_RULES) {
    if (dept.keywords.some((kw) => n.includes(kw))) return dept.name;
  }
  return 'Other';
}

const TRANSLATIONS = {
  en: {
    thisWeeksMenu: "THIS WEEK'S MENU",
    ringTheBell: 'RING THE BELL',
    suggestedIngredients: 'Suggested ingredients',
    suggestedIngredientsHint: 'Add an ingredient and how many you need — the week will be built around it. e.g. "chicken x2"',
    suggestInputPlaceholder: 'e.g. chicken x2',
    applyToThisWeek: 'Apply to this week',
    couldntFullyFit: "Couldn't fully fit",
    notEnoughMatching: 'not enough matching dinners logged.',
    noDinnersLoggedYet: 'No dinners logged yet. Log a few, then ask Claude to refresh this list.',
    swipeHint: 'Swipe right for a random swap · hold for a dinner of your choice.',
    copy: 'Copy',
    copied: 'Copied',
    copyFailed: "Can't copy",
    newIdea: 'New idea',
    pickADinner: 'Pick a dinner',
    searchYourDinnerLog: 'Search your dinner log...',
    noMatches: 'No matches in your logged dinners.',
    somethingNotOnList: 'Something not on the list',
    dishLabel: 'DISH',
    ingredientsLabel: 'INGREDIENTS (comma separated)',
    dishPlaceholder: 'What are you thinking?',
    ingredientsPlaceholder: 'e.g. salmon, asparagus, lemon, butter',
    back: 'Back',
    useThisDinner: 'Use this dinner',
    groceryList: 'GROCERY LIST',
    dinnersLabel: 'dinners',
    itemsLabel: 'ITEMS',
    copyAll: 'Copy all',
    howManyDinners: 'How many Dinners?',
    logNewDinner: 'Log New Dinner',
    logNewDinnerTitle: 'Log a new dinner',
    saveDinner: 'Save dinner',
    generateGroceryList: 'Generate Grocery List',
    firstLoginTitle: 'Welcome!',
    firstLoginBody: 'Start with our starter dinners, or a clean slate you build yourself?',
    keepStarterDinners: 'Keep starter dinners',
    startFresh: 'Start fresh',
    clearAll: 'Clear all',
    clearConfirmBody: 'Are you sure you would like to delete all logged dinners?',
    confirmYes: 'Yes',
    cancel: 'Cancel',
    slideToDelete: 'Slide to delete',
    logMultiple: 'Log multiple',
    logMultipleTitle: 'Log multiple dinners',
    logMultipleHint: 'One dinner per line, as "Dish: ingredient, ingredient".',
    logMultiplePlaceholder: 'Tacos: tortillas, ground beef, cheese\nPizza: dough, sauce, mozzarella',
    saveDinners: 'Save dinners',
    savedLists: 'Saved lists',
    saveMenuHint: "Save this week's menu",
    saveMenuPlaceholder: 'Name this menu…',
    save: 'Save',
    noSavedLists: 'No saved lists yet. Save the current menu to start.',
    load: 'Load',
    deleteWord: 'Delete',
    dept: {
      Produce: 'PRODUCE',
      'Meat & Seafood': 'MEAT & SEAFOOD',
      'Dairy & Eggs': 'DAIRY & EGGS',
      Bakery: 'BAKERY',
      'Deli & Prepared': 'DELI & PREPARED',
      'Canned & Soups': 'CANNED & SOUPS',
      'Condiments & Sauces': 'CONDIMENTS & SAUCES',
      'Pantry & Dry Goods': 'PANTRY & DRY GOODS',
      Frozen: 'FROZEN',
      Other: 'OTHER',
    },
  },
  es: {
    thisWeeksMenu: 'EL MENÚ DE ESTA SEMANA',
    ringTheBell: 'TOCA LA CAMPANA',
    suggestedIngredients: 'Ingredientes sugeridos',
    suggestedIngredientsHint: 'Agrega un ingrediente y la cantidad que necesitas — la semana se armará con eso en mente. p. ej. "pollo x2"',
    suggestInputPlaceholder: 'p. ej. pollo x2',
    applyToThisWeek: 'Aplicar a esta semana',
    couldntFullyFit: 'No se pudo incluir del todo',
    notEnoughMatching: 'no hay suficientes cenas registradas con esto.',
    noDinnersLoggedYet: 'Aún no hay cenas registradas. Registra algunas y pídele a Claude que actualice esta lista.',
    swipeHint: 'Desliza a la derecha para un cambio aleatorio · mantén presionado para elegir tú mismo.',
    copy: 'Copiar',
    copied: 'Copiado',
    copyFailed: 'No se pudo copiar',
    newIdea: 'Nueva idea',
    pickADinner: 'Elige una cena',
    searchYourDinnerLog: 'Busca en tu registro de cenas...',
    noMatches: 'No hay coincidencias en tus cenas registradas.',
    somethingNotOnList: 'Algo que no está en la lista',
    dishLabel: 'PLATILLO',
    ingredientsLabel: 'INGREDIENTES (separados por comas)',
    dishPlaceholder: '¿Qué tienes en mente?',
    ingredientsPlaceholder: 'p. ej. salmón, espárragos, limón, mantequilla',
    back: 'Atrás',
    useThisDinner: 'Usar esta cena',
    groceryList: 'LISTA DEL SúPER',
    dinnersLabel: 'CENAS',
    itemsLabel: 'ARTÍCULOS',
    copyAll: 'Copiar todo',
    howManyDinners: '¿Cuántas cenas?',
    logNewDinner: 'Registrar nueva cena',
    logNewDinnerTitle: 'Registrar una nueva cena',
    saveDinner: 'Guardar cena',
    generateGroceryList: 'Generar lista del súper',
    firstLoginTitle: '¡Bienvenido!',
    firstLoginBody: '¿Empezar con nuestras cenas de ejemplo o con una lista vacía que armes tú?',
    keepStarterDinners: 'Conservar cenas de ejemplo',
    startFresh: 'Empezar de cero',
    clearAll: 'Borrar todo',
    clearConfirmBody: '¿Seguro que quieres eliminar todas las cenas registradas?',
    confirmYes: 'Sí',
    cancel: 'Cancelar',
    slideToDelete: 'Desliza para eliminar',
    logMultiple: 'Registrar varias',
    logMultipleTitle: 'Registrar varias cenas',
    logMultipleHint: 'Una cena por línea, como "Platillo: ingrediente, ingrediente".',
    logMultiplePlaceholder: 'Tacos: tortillas, carne molida, queso\nPizza: masa, salsa, mozzarella',
    saveDinners: 'Guardar cenas',
    savedLists: 'Listas guardadas',
    saveMenuHint: 'Guardar el menú de esta semana',
    saveMenuPlaceholder: 'Nombra este menú…',
    save: 'Guardar',
    noSavedLists: 'Aún no hay listas guardadas. Guarda el menú actual para empezar.',
    load: 'Cargar',
    deleteWord: 'Eliminar',
    dept: {
      Produce: 'FRUTAS Y VERDURAS',
      'Meat & Seafood': 'CARNES Y MARISCOS',
      'Dairy & Eggs': 'LÁCTEOS Y HUEVOS',
      Bakery: 'PANADERÍA',
      'Deli & Prepared': 'DELICATESSEN Y PREPARADOS',
      'Canned & Soups': 'ENLATADOS Y SOPAS',
      'Condiments & Sauces': 'CONDIMENTOS Y SALSAS',
      'Pantry & Dry Goods': 'DESPENSA Y SECOS',
      Frozen: 'CONGELADOS',
      Other: 'OTROS',
    },
  },
  zh: {
    thisWeeksMenu: '本周菜单',
    ringTheBell: '摇铃',
    suggestedIngredients: '推荐食材',
    suggestedIngredientsHint: '添加食材及所需数量——本周菜单将围绕它们安排。例如"鸡肉 x2"',
    suggestInputPlaceholder: '例如 鸡肉 x2',
    applyToThisWeek: '应用于本周',
    couldntFullyFit: '未能完全满足',
    notEnoughMatching: '记录的晚餐中没有足够匹配项。',
    noDinnersLoggedYet: '还没有记录任何晚餐。先记录几个，然后让 Claude 刷新此列表。',
    swipeHint: '向右滑动随机更换 · 长按可自选。',
    copy: '复制',
    copied: '已复制',
    copyFailed: '无法复制',
    newIdea: '新想法',
    pickADinner: '选择一道晚餐',
    searchYourDinnerLog: '搜索你的晚餐记录...',
    noMatches: '记录中没有匹配项。',
    somethingNotOnList: '列表中没有的菜',
    dishLabel: '菜名',
    ingredientsLabel: '食材（用逗号分隔）',
    dishPlaceholder: '你在想什么菜？',
    ingredientsPlaceholder: '例如 三文鱼、芦笋、柠檬、黄油',
    back: '返回',
    useThisDinner: '使用这道晚餐',
    groceryList: '购物清单',
    dinnersLabel: '晚餐',
    itemsLabel: '项',
    copyAll: '复制全部',
    howManyDinners: '需要几顿晚餐？',
    logNewDinner: '记录新晚餐',
    logNewDinnerTitle: '记录一道新晚餐',
    saveDinner: '保存晚餐',
    generateGroceryList: '生成购物清单',
    firstLoginTitle: '欢迎！',
    firstLoginBody: '从我们预设的晚餐开始，还是从空白列表自己添加？',
    keepStarterDinners: '保留预设晚餐',
    startFresh: '从头开始',
    clearAll: '清空全部',
    clearConfirmBody: '确定要删除所有已记录的晚餐吗？',
    confirmYes: '是',
    cancel: '取消',
    slideToDelete: '滑动以删除',
    logMultiple: '批量添加',
    logMultipleTitle: '批量添加晚餐',
    logMultipleHint: '每行一道晚餐，格式为"菜名：食材、食材"。',
    logMultiplePlaceholder: '塔可：玉米饼、牛肉馅、奶酪\n披萨：面团、酱汁、马苏里拉',
    saveDinners: '保存晚餐',
    savedLists: '已保存的菜单',
    saveMenuHint: '保存本周菜单',
    saveMenuPlaceholder: '给这个菜单起个名字…',
    save: '保存',
    noSavedLists: '还没有保存的菜单。保存当前菜单以开始。',
    load: '加载',
    deleteWord: '删除',
    dept: {
      Produce: '果蔬',
      'Meat & Seafood': '肉类海鲜',
      'Dairy & Eggs': '乳制品和蛋类',
      Bakery: '烘焙食品',
      'Deli & Prepared': '熟食预制',
      'Canned & Soups': '罐头和汤类',
      'Condiments & Sauces': '调味品和酱料',
      'Pantry & Dry Goods': '干货杂粮',
      Frozen: '冷冻食品',
      Other: '其他',
    },
  },
};

function t(lang, key) {
  return (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) || TRANSLATIONS.en[key] || key;
}

function tDept(lang, deptName) {
  return (TRANSLATIONS[lang] && TRANSLATIONS[lang].dept[deptName]) || TRANSLATIONS.en.dept[deptName] || deptName;
}

// Google "G" mark, inline so the sign-in button needs no external asset.
function GoogleGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.6 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.6 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C41.4 35.7 44 30.3 44 24c0-1.3-.1-2.3-.4-3.5z" />
    </svg>
  );
}

// Drag-the-handle-to-the-end confirmation for a destructive action. Fires
// onConfirm once the handle reaches the end of the track; snaps back otherwise.
function SlideToConfirm({ label, onConfirm }) {
  const trackRef = useRef(null);
  const startRef = useRef(0);
  const [x, setX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [done, setDone] = useState(false);
  const HANDLE = 44;
  const PAD = 3;

  const maxX = () => {
    const w = trackRef.current ? trackRef.current.offsetWidth : 300;
    return Math.max(0, w - HANDLE - PAD * 2);
  };

  const onPointerDown = (e) => {
    if (done) return;
    setDragging(true);
    startRef.current = e.clientX - x;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!dragging || done) return;
    setX(Math.min(maxX(), Math.max(0, e.clientX - startRef.current)));
  };
  const onPointerUp = () => {
    if (!dragging || done) return;
    setDragging(false);
    if (x >= maxX() - 6) {
      setX(maxX());
      setDone(true);
      onConfirm();
    } else {
      setX(0);
    }
  };

  const progress = maxX() ? x / maxX() : 0;

  return (
    <div
      ref={trackRef}
      className="relative w-full rounded-lg overflow-hidden select-none"
      style={{ height: HANDLE + PAD * 2, background: COLORS.bg, border: `1px solid ${COLORS.panelBorderLight}`, touchAction: 'none' }}
    >
      {/* danger fill grows as the handle moves */}
      <div
        className="absolute inset-y-0 left-0"
        style={{ width: `${progress * 100}%`, background: COLORS.rust, opacity: 0.35 }}
      />
      <div
        className="absolute inset-0 flex items-center justify-center text-xs font-medium"
        style={{ color: COLORS.chalkDim, opacity: 1 - progress, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em' }}
      >
        {label}
      </div>
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="absolute top-0 flex items-center justify-center"
        style={{
          left: PAD,
          width: HANDLE,
          height: HANDLE,
          marginTop: PAD,
          borderRadius: 8,
          background: COLORS.rust,
          transform: `translateX(${x}px)`,
          transition: dragging ? 'none' : 'transform 0.2s ease',
          cursor: 'grab',
          touchAction: 'none',
        }}
      >
        {done ? <Check size={20} style={{ color: COLORS.paper }} /> : <ChevronsRight size={20} style={{ color: COLORS.paper }} />}
      </div>
    </div>
  );
}

export default function GroceryList() {
  const [language, setLanguage] = useState('en');
  // Master dinner log. Seeded from INITIAL_DINNERS, but lives in state so "Log New Dinner"
  // can actually grow it. When wiring this into a real app, replace the useState initializer
  // with a read from localStorage/your backend, and add a useEffect to persist on change.
  const [dinners, setDinners] = useState(INITIAL_DINNERS);
  const [weekSize, setWeekSize] = useState(DEFAULT_WEEK_SIZE);
  const [week, setWeek] = useState(() => pickWeekSlots(INITIAL_DINNERS, [], DEFAULT_WEEK_SIZE));
  const [copiedKey, setCopiedKey] = useState(null);
  const [drag, setDrag] = useState(null); // { slotId, startX, deltaX, phase: 'dragging' | 'leaving' }
  const [pickerSlotId, setPickerSlotId] = useState(null);
  const [search, setSearch] = useState('');
  const [customMode, setCustomMode] = useState(false);
  const [customDish, setCustomDish] = useState('');
  const [customIngredients, setCustomIngredients] = useState('');
  const [suggestions, setSuggestions] = useState([]); // [{ name, qty }]
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [suggestInput, setSuggestInput] = useState('');
  const [unmet, setUnmet] = useState([]);
  const [showDaySlider, setShowDaySlider] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [logDish, setLogDish] = useState('');
  const [logIngredients, setLogIngredients] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [savedLists, setSavedLists] = useState([]); // [{ id, title, meals, createdAt }]
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showGroceryList, setShowGroceryList] = useState(false);
  const [showFirstLoginModal, setShowFirstLoginModal] = useState(false);
  const [clearPhase, setClearPhase] = useState(null); // null | 'ask' | 'slide'
  const longPressTimer = useRef(null);
  const LONG_PRESS_MS = 500;
  const bellPressTimer = useRef(null);
  const bellLongPressed = useRef(false);
  const BELL_LONG_PRESS_MS = 500;

  // --- auth + per-user profile sync ---------------------------------------
  const { user, signInWithGoogle, signOutUser } = useAuth();
  // Gate the persist effect until the profile for the current user has loaded,
  // so we never write placeholder/anonymous state back over a real profile
  // mid-load. Keyed by uid so switching accounts re-gates.
  const hydratedUid = useRef(null);

  // Hydrate from (or seed) the user's profile whenever they sign in, and reset
  // to defaults when they sign out so one account's data doesn't linger.
  useEffect(() => {
    if (!user) {
      if (hydratedUid.current !== null) {
        // Just signed out — clear back to the anonymous defaults.
        hydratedUid.current = null;
        setDinners(INITIAL_DINNERS);
        setLanguage('en');
        setWeekSize(DEFAULT_WEEK_SIZE);
        setWeek(pickWeekSlots(INITIAL_DINNERS, [], DEFAULT_WEEK_SIZE));
        setSavedLists([]);
      }
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const profile = await loadProfile(user.uid);
        if (cancelled) return;
        if (profile) {
          // An empty dinners array is a valid saved state (user chose to start
          // fresh) — only fall back to the starter set when the field is absent.
          const loadedDinners = Array.isArray(profile.dinners) ? profile.dinners : INITIAL_DINNERS;
          const loadedSize = typeof profile.weekSize === 'number' ? profile.weekSize : DEFAULT_WEEK_SIZE;
          setDinners(loadedDinners);
          if (profile.language) setLanguage(profile.language);
          setWeekSize(loadedSize);
          setWeek(pickWeekSlots(loadedDinners, [], loadedSize));
          setSavedLists(Array.isArray(profile.savedLists) ? profile.savedLists : []);
          hydratedUid.current = user.uid;
        } else {
          // First sign-in: let the user pick a starting point before we create
          // their profile doc. hydratedUid stays unset until they choose, so the
          // persist effect writes nothing in the meantime.
          setShowFirstLoginModal(true);
        }
      } catch (e) {
        console.error('Failed to load profile', e);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Persist dinner log + preferences (debounced) once signed in and hydrated.
  useEffect(() => {
    if (!user || hydratedUid.current !== user.uid) return undefined;
    const handle = setTimeout(() => {
      saveProfile(user.uid, { dinners, language, weekSize }).catch((e) => console.error('Failed to save profile', e));
    }, 800);
    return () => clearTimeout(handle);
  }, [user, dinners, language, weekSize]);

  const firstName = user?.displayName ? user.displayName.split(' ')[0] : '';

  // First-login choice: keep the starter dinners or begin with an empty list.
  // Either way this creates the profile doc and opens the persist gate.
  const finishFirstLogin = useCallback(
    (keepStarter) => {
      const nextDinners = keepStarter ? INITIAL_DINNERS : [];
      setDinners(nextDinners);
      setWeek(pickWeekSlots(nextDinners, [], weekSize));
      setShowFirstLoginModal(false);
      if (user) {
        hydratedUid.current = user.uid;
        saveProfile(user.uid, { dinners: nextDinners, language, weekSize }).catch((e) =>
          console.error('Failed to save profile', e)
        );
      }
    },
    [user, language, weekSize]
  );

  // Wipe the whole dinner log. For signed-in users the persist effect (keyed on
  // `dinners`) writes the empty list back to their profile automatically.
  const clearAllDinners = useCallback(() => {
    setDrag(null);
    setDinners([]);
    setWeek([]);
    setShowGroceryList(false);
    setClearPhase(null);
  }, []);

  // --- saved menus (titled snapshots of the current week) ------------------
  const persistSavedLists = useCallback(
    (lists) => {
      setSavedLists(lists);
      if (user) saveProfile(user.uid, { savedLists: lists }).catch((e) => console.error('Failed to save lists', e));
    },
    [user]
  );

  const openSavedLists = () => {
    setSaveTitle('');
    setConfirmDeleteId(null);
    setShowSavedModal(true);
  };

  const saveCurrentMenu = () => {
    const title = saveTitle.trim();
    if (!title || week.length === 0) return;
    const meals = week.map((s) => s.meal);
    const entry = { id: `list-${Date.now()}`, title, meals, createdAt: Date.now() };
    persistSavedLists([entry, ...savedLists]);
    setSaveTitle('');
  };

  const loadSavedList = (list) => {
    setDrag(null);
    const slots = list.meals.map((meal) => ({ slotId: makeSlotId(), meal }));
    setWeek(slots);
    setWeekSize(slots.length || DEFAULT_WEEK_SIZE);
    setShowGroceryList(false);
    setShowSavedModal(false);
  };

  const deleteSavedList = (id) => {
    persistSavedLists(savedLists.filter((l) => l.id !== id));
    setConfirmDeleteId(null);
  };

  const groceryItems = useMemo(() => {
    const totals = new Map(); // key: lowercase base name -> { name, qty }
    week.forEach(({ meal }) => {
      meal.ingredients.forEach((ing) => {
        const { name, qty } = parseIngredient(ing);
        const key = name.toLowerCase();
        if (!key) return;
        if (totals.has(key)) {
          totals.get(key).qty += qty;
        } else {
          totals.set(key, { name, qty });
        }
      });
    });
    return Array.from(totals.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [week]);

  const groupedItems = useMemo(() => {
    const grouped = {};
    groceryItems.forEach((item) => {
      const dept = categorize(item.name);
      if (!grouped[dept]) grouped[dept] = [];
      grouped[dept].push(item);
    });
    return DEPARTMENT_ORDER.filter((d) => grouped[d]?.length).map((d) => ({ dept: d, items: grouped[d] }));
  }, [groceryItems]);

  const copyAllText = useMemo(
    () =>
      groupedItems
        .map(({ dept, items }) => `${tDept(language, dept)}\n${items.map((i) => `- ${i.name} x${i.qty}`).join('\n')}`)
        .join('\n\n'),
    [groupedItems, language]
  );

  const copy = useCallback(async (text, key) => {
    // Primary: modern Clipboard API (needs a secure context + permission, which
    // sandboxed artifact iframes don't always grant).
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1500);
      return;
    } catch (e) {
      // fall through to legacy fallback below
    }

    // Fallback: hidden textarea + execCommand, which works in more restrictive
    // iframe contexts since it doesn't go through the Permissions API.
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(textarea);
      if (ok) {
        setCopiedKey(key);
        setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1500);
        return;
      }
      throw new Error('execCommand copy returned false');
    } catch (e) {
      setCopiedKey(`${key}-failed`);
      setTimeout(() => setCopiedKey((k) => (k === `${key}-failed` ? null : k)), 2000);
    }
  }, []);

  const reshuffle = () => {
    setDrag(null);
    const next = pickWeekSlots(dinners, suggestions, weekSize);
    setWeek(next);
    setUnmet(unmetSuggestionNames(next.map((s) => s.meal), suggestions));
  };

  // Grows or shrinks the current week to `newSize` without fully reshuffling
  // existing picks — trims from the end, or appends fresh random dinners.
  const adjustWeekSize = (newSize) => {
    setWeekSize(newSize);
    setWeek((prev) => {
      if (newSize === prev.length) return prev;
      if (newSize < prev.length) return prev.slice(0, newSize);
      const currentIds = prev.map((s) => s.meal.id);
      const pool = shuffle(dinners.filter((d) => !currentIds.includes(d.id)));
      const additional = pool.slice(0, newSize - prev.length).map((meal) => ({ slotId: makeSlotId(), meal }));
      return [...prev, ...additional];
    });
  };

  const clearBellTimer = () => {
    if (bellPressTimer.current) {
      clearTimeout(bellPressTimer.current);
      bellPressTimer.current = null;
    }
  };

  const handleBellPointerDown = () => {
    bellLongPressed.current = false;
    clearBellTimer();
    bellPressTimer.current = setTimeout(() => {
      bellLongPressed.current = true;
      setShowDaySlider(true);
    }, BELL_LONG_PRESS_MS);
  };

  const handleBellPointerUp = () => {
    clearBellTimer();
    if (!bellLongPressed.current) reshuffle();
  };

  const handleBellPointerCancel = () => {
    clearBellTimer();
  };

  const addSuggestion = () => {
    const trimmed = suggestInput.trim();
    if (!trimmed) return;
    const { name, qty } = parseIngredient(trimmed);
    if (!name) return;
    setSuggestions((prev) => {
      const key = name.toLowerCase();
      const idx = prev.findIndex((s) => s.name.toLowerCase() === key);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { name, qty };
        return copy;
      }
      return [...prev, { name, qty }];
    });
    setSuggestInput('');
  };

  const removeSuggestion = (name) => {
    setSuggestions((prev) => prev.filter((s) => s.name !== name));
  };

  const applySuggestions = () => {
    setDrag(null);
    const next = pickWeekSlots(dinners, suggestions, weekSize);
    setWeek(next);
    setUnmet(unmetSuggestionNames(next.map((s) => s.meal), suggestions));
    setShowSuggestModal(false);
  };

  const openLogModal = () => {
    setLogDish('');
    setLogIngredients('');
    setShowLogModal(true);
  };

  const submitLogDinner = () => {
    const dishName = logDish.trim();
    if (!dishName) return;
    const ingredients = logIngredients
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    setDinners((prev) => [...prev, { id: `custom-${Date.now()}`, dish: dishName, ingredients }]);
    setShowLogModal(false);
  };

  const openBulkModal = () => {
    setBulkText('');
    setShowBulkModal(true);
  };

  // Bulk entry: one dinner per line, "Dish: ingredient, ingredient". A line
  // without a colon is taken as a dish with no ingredients.
  const submitBulkDinners = () => {
    const parsed = bulkText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((raw, i) => {
        // Tolerate full-width colon / Chinese commas so CJK input parses too.
        const line = raw.replace(/：/g, ':').replace(/[，、]/g, ',');
        const idx = line.indexOf(':');
        const dish = (idx >= 0 ? line.slice(0, idx) : line).trim();
        const ingredients =
          idx >= 0
            ? line
                .slice(idx + 1)
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
            : [];
        return { id: `custom-${Date.now()}-${i}`, dish, ingredients };
      })
      .filter((d) => d.dish);
    if (parsed.length === 0) return;
    setDinners((prev) => [...prev, ...parsed]);
    setShowBulkModal(false);
  };

  const replaceSlot = useCallback((slotId) => {
    setWeek((prev) => {
      const currentIds = prev.map((s) => s.meal.id);
      const pool = dinners.filter((d) => !currentIds.includes(d.id));
      if (pool.length === 0) return prev;
      const next = pool[Math.floor(Math.random() * pool.length)];
      return prev.map((s) => (s.slotId === slotId ? { ...s, meal: next } : s));
    });
    setDrag(null);
  }, []);

  const openPicker = (slotId) => {
    setPickerSlotId(slotId);
    setSearch('');
    setCustomMode(false);
    setCustomDish('');
    setCustomIngredients('');
  };

  const closePicker = () => setPickerSlotId(null);

  const selectMeal = (meal) => {
    setWeek((prev) => prev.map((s) => (s.slotId === pickerSlotId ? { ...s, meal } : s)));
    closePicker();
  };

  const confirmCustom = () => {
    const dishName = customDish.trim();
    if (!dishName) return;
    const ingredients = customIngredients
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    selectMeal({ id: `custom-${Date.now()}`, dish: dishName, ingredients });
  };

  const pickerPool = useMemo(() => {
    if (!pickerSlotId) return [];
    const currentIds = week.map((s) => s.meal.id);
    const pool = dinners.filter((d) => !currentIds.includes(d.id));
    const q = search.trim().toLowerCase();
    if (!q) return pool;
    return pool.filter((d) => d.dish.toLowerCase().includes(q));
  }, [pickerSlotId, week, search]);

  const clearLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handlePointerDown = (e, slotId) => {
    if (e.target.closest('button')) return;
    setDrag({ slotId, startX: e.clientX, deltaX: 0, phase: 'dragging' });
    e.currentTarget.setPointerCapture?.(e.pointerId);
    clearLongPress();
    longPressTimer.current = setTimeout(() => {
      setDrag(null);
      openPicker(slotId);
    }, LONG_PRESS_MS);
  };

  const handlePointerMove = (e, slotId) => {
    setDrag((d) => {
      if (!d || d.slotId !== slotId || d.phase !== 'dragging') return d;
      const deltaX = Math.max(0, e.clientX - d.startX);
      if (deltaX > 8) clearLongPress();
      return { ...d, deltaX };
    });
  };

  const handlePointerUp = (e, slotId) => {
    clearLongPress();
    setDrag((d) => {
      if (!d || d.slotId !== slotId || d.phase !== 'dragging') return d;
      if (d.deltaX > SWIPE_THRESHOLD) {
        const currentIds = week.map((s) => s.meal.id);
        const hasAlternative = dinners.some((dn) => !currentIds.includes(dn.id));
        if (hasAlternative) {
          setTimeout(() => replaceSlot(slotId), 220);
          return { ...d, phase: 'leaving' };
        }
      }
      return null;
    });
  };

  return (
    <div style={{ background: COLORS.bg, minHeight: '100vh' }} className="flex justify-center px-4 py-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
      `}</style>
      <div className="w-full max-w-md" style={{ fontFamily: "'Inter', sans-serif" }}>
        {/* top bar: hub link + auth */}
        <div className="flex items-center justify-between mb-3" style={{ minHeight: 28 }}>
          <a
            href="https://mattsapps.xyz"
            className="text-xs inline-block"
            style={{ color: COLORS.sage, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em', textDecoration: 'none' }}
          >
            ← mattsapps
          </a>
          {firebaseConfigured && (
            user ? (
              <div className="flex items-center gap-2">
                {user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt=""
                    referrerPolicy="no-referrer"
                    style={{ width: 24, height: 24, borderRadius: '50%', border: `1px solid ${COLORS.panelBorderLight}` }}
                  />
                )}
                <span className="text-xs" style={{ color: COLORS.chalk, fontFamily: "'JetBrains Mono', monospace" }}>
                  {firstName}
                </span>
                <button
                  onClick={openSavedLists}
                  aria-label={t(language, 'savedLists')}
                  className="flex items-center px-1.5 py-1 rounded-md"
                  style={{ background: 'transparent', border: 'none', color: COLORS.mustard }}
                >
                  <Bookmark size={15} />
                </button>
                <button
                  onClick={signOutUser}
                  aria-label="Sign out"
                  className="flex items-center px-1.5 py-1 rounded-md"
                  style={{ background: 'transparent', border: 'none', color: COLORS.sage }}
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
                style={{ background: COLORS.panel, color: COLORS.chalk, border: `1px solid ${COLORS.panelBorderLight}` }}
              >
                <GoogleGlyph />
                Sign in
              </button>
            )
          )}
        </div>
        {/* header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div
              className="text-xs mb-1"
              style={{ color: COLORS.mustard, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.15em' }}
            >
              {t(language, 'thisWeeksMenu')}
            </div>
            <h1 className="text-4xl" style={{ color: COLORS.chalk, fontFamily: "'Caveat', cursive", fontWeight: 700 }}>
              D
              <span style={{ position: 'relative', display: 'inline-block' }}>
                ı
                <Bell
                  size={14}
                  style={{
                    position: 'absolute',
                    top: 4,
                    left: '62%',
                    transform: 'translateX(-50%) rotate(-8deg) scale(0.9)',
                    color: COLORS.mustard,
                    fill: COLORS.mustard,
                  }}
                />
              </span>
              nner Bell
            </h1>
          </div>
          <button
            onPointerDown={handleBellPointerDown}
            onPointerUp={handleBellPointerUp}
            onPointerCancel={handleBellPointerCancel}
            onPointerLeave={handleBellPointerCancel}
            onContextMenu={(e) => e.preventDefault()}
            disabled={dinners.length === 0}
            aria-label="Ring the Bell — tap to shuffle, hold to set number of days"
            className="flex flex-col items-center gap-1 shrink-0 mt-1 px-2 py-1 select-none"
            style={{
              background: 'transparent',
              border: 'none',
              opacity: dinners.length === 0 ? 0.5 : 1,
              touchAction: 'manipulation',
              WebkitTouchCallout: 'none',
            }}
          >
            <Bell size={32} strokeWidth={2} style={{ color: COLORS.mustard, fill: COLORS.mustard, transform: 'rotate(-8deg)' }} />
            <span
              className="text-xs font-medium"
              style={{ color: COLORS.chalk, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em' }}
            >
              {t(language, 'ringTheBell')}
            </span>
          </button>
        </div>

        <button
          onClick={openLogModal}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium mb-4"
          style={{ background: COLORS.panel, color: COLORS.mustard, border: `1px dashed ${COLORS.panelBorderLight}` }}
        >
          <Plus size={14} />
          {t(language, 'logNewDinner')}
        </button>

        {dinners.length === 0 ? (
          <div
            className="rounded-xl p-6 text-center text-sm mb-8"
            style={{ background: COLORS.panel, border: `1px dashed ${COLORS.panelBorderLight}`, color: COLORS.chalkDim }}
          >
            <ChefHat size={20} style={{ margin: '0 auto 8px', color: COLORS.sage }} />
            {t(language, 'noDinnersLoggedYet')}
          </div>
        ) : (
          <>
            {/* suggested ingredients */}
            <div className="mb-4">
              {suggestions.length === 0 ? (
                <button
                  onClick={() => setShowSuggestModal(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium"
                  style={{ background: COLORS.panel, color: COLORS.sage, border: `1px dashed ${COLORS.panelBorderLight}` }}
                >
                  <ListPlus size={14} />
                  {t(language, 'suggestedIngredients')}
                </button>
              ) : (
                <button
                  onClick={() => setShowSuggestModal(true)}
                  className="w-full flex flex-wrap items-center gap-1.5 p-2.5 rounded-lg text-left"
                  style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorderLight}` }}
                >
                  {suggestions.map((s) => (
                    <span
                      key={s.name}
                      className="text-xs px-2 py-1 rounded-full"
                      style={{ background: COLORS.bg, color: COLORS.mustard, border: `1px solid ${COLORS.panelBorderLight}` }}
                    >
                      {s.name} x{s.qty}
                    </span>
                  ))}
                  <Edit3 size={12} style={{ color: COLORS.sage, marginLeft: 'auto' }} />
                </button>
              )}
              {unmet.length > 0 && (
                <div className="text-xs mt-1.5 px-1" style={{ color: COLORS.rust }}>
                  {t(language, 'couldntFullyFit')}: {unmet.join(', ')} — {t(language, 'notEnoughMatching')}
                </div>
              )}
            </div>

            {/* meal cards */}
            <div className="flex flex-col gap-3 mb-3">
              {week.map((slot) => {
                const { slotId, meal } = slot;
                const isDragTarget = drag && drag.slotId === slotId;
                const leaving = isDragTarget && drag.phase === 'leaving';
                const deltaX = isDragTarget ? drag.deltaX : 0;
                const offset = leaving ? 480 : deltaX;
                const rotate = leaving ? 10 : Math.min(deltaX / 20, 8);
                const opacity = leaving ? 0 : 1;
                const revealOpacity = leaving ? 1 : Math.min(deltaX / SWIPE_THRESHOLD, 1);

                return (
                  <div key={slotId} className="relative">
                    <div
                      className="absolute inset-0 rounded-xl flex items-center pl-5"
                      style={{ background: COLORS.mustard, opacity: revealOpacity }}
                    >
                      <div className="flex items-center gap-2 text-sm font-medium" style={{ color: COLORS.bg }}>
                        <RefreshCw size={16} />
                        {t(language, 'newIdea')}
                      </div>
                    </div>
                    <div
                      onPointerDown={(e) => handlePointerDown(e, slotId)}
                      onPointerMove={(e) => handlePointerMove(e, slotId)}
                      onPointerUp={(e) => handlePointerUp(e, slotId)}
                      onPointerCancel={(e) => handlePointerUp(e, slotId)}
                      onContextMenu={(e) => e.preventDefault()}
                      className="rounded-xl p-4 relative select-none"
                      style={{
                        background: COLORS.panel,
                        border: `1px solid ${COLORS.panelBorder}`,
                        transform: `translateX(${offset}px) rotate(${rotate}deg)`,
                        opacity,
                        transition: isDragTarget && drag.phase === 'dragging' ? 'none' : 'transform 0.22s ease, opacity 0.22s ease',
                        touchAction: 'pan-y',
                        WebkitTouchCallout: 'none',
                        cursor: 'grab',
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div
                          className="text-2xl mb-1"
                          style={{ color: COLORS.chalk, fontFamily: "'Caveat', cursive", fontWeight: 700 }}
                        >
                          {meal.dish}
                        </div>
                        <button
                          onClick={() => copy(mealText(meal), meal.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs shrink-0"
                          style={{ background: COLORS.bg, color: COLORS.mustard, border: `1px solid ${COLORS.panelBorderLight}` }}
                        >
                          {copiedKey === meal.id ? (
                            <Check size={13} />
                          ) : copiedKey === `${meal.id}-failed` ? (
                            <X size={13} />
                          ) : (
                            <Copy size={13} />
                          )}
                          {copiedKey === meal.id
                            ? t(language, 'copied')
                            : copiedKey === `${meal.id}-failed`
                            ? t(language, 'copyFailed')
                            : t(language, 'copy')}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {meal.ingredients.map((ing, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-1 rounded-full"
                            style={{ background: COLORS.bg, color: COLORS.sage, border: `1px solid ${COLORS.panelBorderLight}` }}
                          >
                            {ing}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text-xs mb-6" style={{ color: COLORS.chalkDim, opacity: 0.6 }}>
              {t(language, 'swipeHint')}
            </div>

            {!showGroceryList ? (
              <button
                onClick={() => setShowGroceryList(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium"
                style={{ background: COLORS.mustard, color: COLORS.bg }}
              >
                <ClipboardList size={16} />
                {t(language, 'generateGroceryList')}
              </button>
            ) : (
              <>
                {/* grocery receipt */}
                <div
                  className="text-xs mb-3"
                  style={{ color: COLORS.sage, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.15em' }}
                >
                  {t(language, 'groceryList')}
                </div>
                <div className="rounded-xl overflow-hidden" style={{ background: COLORS.paper }}>
                  <div
                    style={{
                      height: 8,
                      backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 6px, ${COLORS.bg} 6px, ${COLORS.bg} 8px)`,
                    }}
                  />
                  <div className="p-4" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xs" style={{ color: COLORS.paperText, opacity: 0.6 }}>
                        {week.length} {t(language, 'dinnersLabel')} · {groceryItems.length} {t(language, 'itemsLabel')}
                      </div>
                      <button
                        onClick={() => copy(copyAllText, 'all')}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium"
                        style={{ background: COLORS.paperText, color: COLORS.paper }}
                      >
                        {copiedKey === 'all' ? (
                          <Check size={13} />
                        ) : copiedKey === 'all-failed' ? (
                          <X size={13} />
                        ) : (
                          <ClipboardList size={13} />
                        )}
                        {copiedKey === 'all'
                          ? t(language, 'copied')
                          : copiedKey === 'all-failed'
                          ? t(language, 'copyFailed')
                          : t(language, 'copyAll')}
                      </button>
                    </div>
                    <div style={{ borderTop: `1px dashed ${COLORS.paperDashed}` }} />
                    <div className="mt-3 flex flex-col gap-4">
                      {groupedItems.map(({ dept, items }) => (
                        <div key={dept}>
                          <div
                            className="text-xs mb-1.5"
                            style={{ color: COLORS.rust, fontWeight: 600, letterSpacing: '0.08em', opacity: 0.85 }}
                          >
                            {tDept(language, dept)}
                          </div>
                          <ul className="flex flex-col gap-1.5">
                            {items.map((item, i) => (
                              <li
                                key={i}
                                className="text-sm flex items-baseline justify-between gap-2"
                                style={{ color: COLORS.paperText }}
                              >
                                <span className="flex items-baseline gap-2">
                                  <span style={{ opacity: 0.4 }}>–</span>
                                  {item.name}
                                </span>
                                <span style={{ color: COLORS.rust, fontWeight: 600, whiteSpace: 'nowrap' }}>
                                  x{item.qty}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div
                    style={{
                      height: 8,
                      backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 6px, ${COLORS.bg} 6px, ${COLORS.bg} 8px)`,
                    }}
                  />
                </div>
              </>
            )}
          </>
        )}

        {/* language selector */}
        <div
          className="mt-8 pt-4 flex items-center justify-center gap-2"
          style={{ borderTop: `1px dashed ${COLORS.panelBorderLight}`, userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}
        >
          {[
            { code: 'en', label: 'ENG' },
            { code: 'es', label: 'ESP' },
            { code: 'zh', label: 'CHN' },
          ].map((l) => (
            <button
              key={l.code}
              onClick={() => setLanguage(l.code)}
              className="px-4 py-2 rounded-lg text-xs font-semibold"
              style={{
                background: language === l.code ? COLORS.mustard : COLORS.panel,
                color: language === l.code ? COLORS.bg : COLORS.chalk,
                border: `1px solid ${COLORS.panelBorderLight}`,
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: '0.05em',
              }}
            >
              {l.label}
            </button>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={openBulkModal}
            className="flex items-center gap-1 text-xs"
            style={{ background: 'transparent', border: 'none', color: COLORS.sage, opacity: 0.7 }}
          >
            <ListPlus size={12} />
            {t(language, 'logMultiple')}
          </button>
          {dinners.length > 0 && (
            <button
              onClick={() => setClearPhase('ask')}
              className="flex items-center gap-1 text-xs"
              style={{ background: 'transparent', border: 'none', color: COLORS.sage, opacity: 0.7 }}
            >
              <Trash2 size={12} />
              {t(language, 'clearAll')}
            </button>
          )}
        </div>
      </div>

      {pickerSlotId && (
        <div
          className="fixed inset-0 flex items-end justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', zIndex: 50 }}
          onClick={closePicker}
        >
          <div
            className="w-full max-w-md rounded-2xl overflow-hidden flex flex-col"
            style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}`, maxHeight: '75vh', fontFamily: "'Inter', sans-serif" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4" style={{ borderBottom: `1px solid ${COLORS.panelBorder}` }}>
              <div className="text-2xl" style={{ color: COLORS.chalk, fontFamily: "'Caveat', cursive", fontWeight: 700 }}>
                {t(language, 'pickADinner')}
              </div>
              <button onClick={closePicker} style={{ color: COLORS.sage }} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto">
              {!customMode ? (
                <>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t(language, 'searchYourDinnerLog')}
                    className="w-full mb-3 px-3 py-2 rounded-lg outline-none text-sm"
                    style={{ background: COLORS.bg, color: COLORS.chalk, border: `1px solid ${COLORS.panelBorderLight}` }}
                  />

                  <div className="flex flex-col gap-1.5 mb-4">
                    {pickerPool.length === 0 ? (
                      <div className="text-xs py-2" style={{ color: COLORS.chalkDim }}>
                        {t(language, 'noMatches')}
                      </div>
                    ) : (
                      pickerPool.map((meal) => (
                        <button
                          key={meal.id}
                          onClick={() => selectMeal(meal)}
                          className="text-left px-3 py-2 rounded-lg text-sm"
                          style={{ background: COLORS.bg, border: `1px solid ${COLORS.panelBorderLight}` }}
                        >
                          <div style={{ color: COLORS.chalk, fontWeight: 500 }}>{meal.dish}</div>
                          <div className="text-xs mt-0.5" style={{ color: COLORS.sage }}>
                            {meal.ingredients.join(', ')}
                          </div>
                        </button>
                      ))
                    )}
                  </div>

                  <button
                    onClick={() => setCustomMode(true)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium"
                    style={{ background: COLORS.bg, color: COLORS.mustard, border: `1px dashed ${COLORS.panelBorderLight}` }}
                  >
                    <Plus size={16} />
                    {t(language, 'somethingNotOnList')}
                  </button>
                </>
              ) : (
                <>
                  <label className="block text-xs mb-1" style={{ color: COLORS.sage, fontFamily: "'JetBrains Mono', monospace" }}>
                    {t(language, 'dishLabel')}
                  </label>
                  <input
                    value={customDish}
                    onChange={(e) => setCustomDish(e.target.value)}
                    placeholder={t(language, 'dishPlaceholder')}
                    className="w-full mb-3 px-3 py-2 rounded-lg outline-none text-sm"
                    style={{ background: COLORS.bg, color: COLORS.chalk, border: `1px solid ${COLORS.panelBorderLight}` }}
                  />
                  <label className="block text-xs mb-1" style={{ color: COLORS.sage, fontFamily: "'JetBrains Mono', monospace" }}>
                    {t(language, 'ingredientsLabel')}
                  </label>
                  <textarea
                    value={customIngredients}
                    onChange={(e) => setCustomIngredients(e.target.value)}
                    placeholder={t(language, 'ingredientsPlaceholder')}
                    rows={2}
                    className="w-full mb-4 px-3 py-2 rounded-lg outline-none text-sm resize-none"
                    style={{ background: COLORS.bg, color: COLORS.chalk, border: `1px solid ${COLORS.panelBorderLight}` }}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCustomMode(false)}
                      className="flex-1 py-2.5 rounded-lg text-sm font-medium"
                      style={{ background: COLORS.bg, color: COLORS.chalkDim, border: `1px solid ${COLORS.panelBorderLight}` }}
                    >
                      {t(language, 'back')}
                    </button>
                    <button
                      onClick={confirmCustom}
                      disabled={!customDish.trim()}
                      className="flex-1 py-2.5 rounded-lg text-sm font-medium"
                      style={{ background: COLORS.mustard, color: COLORS.bg, opacity: customDish.trim() ? 1 : 0.5 }}
                    >
                      {t(language, 'useThisDinner')}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {showSuggestModal && (
        <div
          className="fixed inset-0 flex items-end justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', zIndex: 50 }}
          onClick={() => setShowSuggestModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl overflow-hidden flex flex-col"
            style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}`, maxHeight: '75vh', fontFamily: "'Inter', sans-serif" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4" style={{ borderBottom: `1px solid ${COLORS.panelBorder}` }}>
              <div className="text-2xl" style={{ color: COLORS.chalk, fontFamily: "'Caveat', cursive", fontWeight: 700 }}>
                {t(language, 'suggestedIngredients')}
              </div>
              <button onClick={() => setShowSuggestModal(false)} style={{ color: COLORS.sage }} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto">
              <div className="text-xs mb-3" style={{ color: COLORS.chalkDim }}>
                {t(language, 'suggestedIngredientsHint')}
              </div>

              {suggestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {suggestions.map((s) => (
                    <span
                      key={s.name}
                      className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full"
                      style={{ background: COLORS.bg, color: COLORS.mustard, border: `1px solid ${COLORS.panelBorderLight}` }}
                    >
                      {s.name} x{s.qty}
                      <button onClick={() => removeSuggestion(s.name)} style={{ color: COLORS.rust }} aria-label={`Remove ${s.name}`}>
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-2 mb-4">
                <input
                  value={suggestInput}
                  onChange={(e) => setSuggestInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSuggestion();
                    }
                  }}
                  placeholder={t(language, 'suggestInputPlaceholder')}
                  className="flex-1 px-3 py-2 rounded-lg outline-none text-sm"
                  style={{ background: COLORS.bg, color: COLORS.chalk, border: `1px solid ${COLORS.panelBorderLight}` }}
                />
                <button
                  onClick={addSuggestion}
                  className="px-3 rounded-lg"
                  style={{ background: COLORS.mustard, color: COLORS.bg }}
                  aria-label="Add ingredient"
                >
                  <Plus size={16} />
                </button>
              </div>

              <button
                onClick={applySuggestions}
                className="w-full py-2.5 rounded-lg text-sm font-medium"
                style={{ background: COLORS.mustard, color: COLORS.bg }}
              >
                {t(language, 'applyToThisWeek')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDaySlider && (
        <div
          className="fixed inset-0 flex items-end justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', zIndex: 50 }}
          onClick={() => setShowDaySlider(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl overflow-hidden flex flex-col"
            style={{
              background: COLORS.panel,
              border: `1px solid ${COLORS.panelBorder}`,
              fontFamily: "'Inter', sans-serif",
              userSelect: 'none',
              WebkitUserSelect: 'none',
              WebkitTouchCallout: 'none',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4" style={{ borderBottom: `1px solid ${COLORS.panelBorder}` }}>
              <div className="text-2xl" style={{ color: COLORS.chalk, fontFamily: "'Caveat', cursive", fontWeight: 700 }}>
                {t(language, 'howManyDinners')}
              </div>
              <button onClick={() => setShowDaySlider(false)} style={{ color: COLORS.sage }} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="text-center mb-4">
                <span className="text-5xl" style={{ color: COLORS.mustard, fontFamily: "'Caveat', cursive", fontWeight: 700 }}>
                  {weekSize}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={14}
                step={1}
                value={weekSize}
                onChange={(e) => adjustWeekSize(parseInt(e.target.value, 10))}
                className="w-full"
                style={{ accentColor: COLORS.mustard }}
              />
              <div
                className="flex justify-between text-xs mt-1.5"
                style={{ color: COLORS.sage, fontFamily: "'JetBrains Mono', monospace" }}
              >
                <span>1</span>
                <span>14</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {showLogModal && (
        <div
          className="fixed inset-0 flex items-end justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', zIndex: 50 }}
          onClick={() => setShowLogModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl overflow-hidden flex flex-col"
            style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}`, maxHeight: '75vh', fontFamily: "'Inter', sans-serif" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4" style={{ borderBottom: `1px solid ${COLORS.panelBorder}` }}>
              <div className="text-2xl" style={{ color: COLORS.chalk, fontFamily: "'Caveat', cursive", fontWeight: 700 }}>
                {t(language, 'logNewDinnerTitle')}
              </div>
              <button onClick={() => setShowLogModal(false)} style={{ color: COLORS.sage }} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto">
              <label className="block text-xs mb-1" style={{ color: COLORS.sage, fontFamily: "'JetBrains Mono', monospace" }}>
                {t(language, 'dishLabel')}
              </label>
              <input
                value={logDish}
                onChange={(e) => setLogDish(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    submitLogDinner();
                  }
                }}
                placeholder={t(language, 'dishPlaceholder')}
                className="w-full mb-3 px-3 py-2 rounded-lg outline-none text-sm"
                style={{ background: COLORS.bg, color: COLORS.chalk, border: `1px solid ${COLORS.panelBorderLight}` }}
              />
              <label className="block text-xs mb-1" style={{ color: COLORS.sage, fontFamily: "'JetBrains Mono', monospace" }}>
                {t(language, 'ingredientsLabel')}
              </label>
              <textarea
                value={logIngredients}
                onChange={(e) => setLogIngredients(e.target.value)}
                placeholder={t(language, 'ingredientsPlaceholder')}
                rows={2}
                className="w-full mb-4 px-3 py-2 rounded-lg outline-none text-sm resize-none"
                style={{ background: COLORS.bg, color: COLORS.chalk, border: `1px solid ${COLORS.panelBorderLight}` }}
              />
              <button
                onClick={submitLogDinner}
                disabled={!logDish.trim()}
                className="w-full py-2.5 rounded-lg text-sm font-medium"
                style={{ background: COLORS.mustard, color: COLORS.bg, opacity: logDish.trim() ? 1 : 0.5 }}
              >
                {t(language, 'saveDinner')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showBulkModal && (
        <div
          className="fixed inset-0 flex items-end justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', zIndex: 50 }}
          onClick={() => setShowBulkModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl overflow-hidden flex flex-col"
            style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}`, maxHeight: '75vh', fontFamily: "'Inter', sans-serif" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4" style={{ borderBottom: `1px solid ${COLORS.panelBorder}` }}>
              <div className="text-2xl" style={{ color: COLORS.chalk, fontFamily: "'Caveat', cursive", fontWeight: 700 }}>
                {t(language, 'logMultipleTitle')}
              </div>
              <button onClick={() => setShowBulkModal(false)} style={{ color: COLORS.sage }} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto">
              <div className="text-xs mb-3" style={{ color: COLORS.chalkDim }}>
                {t(language, 'logMultipleHint')}
              </div>
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={t(language, 'logMultiplePlaceholder')}
                rows={8}
                className="w-full mb-4 px-3 py-2 rounded-lg outline-none text-sm resize-none"
                style={{ background: COLORS.bg, color: COLORS.chalk, border: `1px solid ${COLORS.panelBorderLight}`, fontFamily: "'JetBrains Mono', monospace" }}
              />
              <button
                onClick={submitBulkDinners}
                disabled={!bulkText.trim()}
                className="w-full py-2.5 rounded-lg text-sm font-medium"
                style={{ background: COLORS.mustard, color: COLORS.bg, opacity: bulkText.trim() ? 1 : 0.5 }}
              >
                {t(language, 'saveDinners')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSavedModal && (
        <div
          className="fixed inset-0 flex items-end justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', zIndex: 50 }}
          onClick={() => setShowSavedModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl overflow-hidden flex flex-col"
            style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}`, maxHeight: '75vh', fontFamily: "'Inter', sans-serif" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4" style={{ borderBottom: `1px solid ${COLORS.panelBorder}` }}>
              <div className="text-2xl" style={{ color: COLORS.chalk, fontFamily: "'Caveat', cursive", fontWeight: 700 }}>
                {t(language, 'savedLists')}
              </div>
              <button onClick={() => setShowSavedModal(false)} style={{ color: COLORS.sage }} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto">
              {/* save the current menu */}
              <div className="text-xs mb-2" style={{ color: COLORS.sage, fontFamily: "'JetBrains Mono', monospace" }}>
                {t(language, 'saveMenuHint')}
              </div>
              <div className="flex gap-2 mb-4">
                <input
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      saveCurrentMenu();
                    }
                  }}
                  placeholder={t(language, 'saveMenuPlaceholder')}
                  className="flex-1 px-3 py-2 rounded-lg outline-none text-sm"
                  style={{ background: COLORS.bg, color: COLORS.chalk, border: `1px solid ${COLORS.panelBorderLight}` }}
                />
                <button
                  onClick={saveCurrentMenu}
                  disabled={!saveTitle.trim() || week.length === 0}
                  className="px-4 rounded-lg text-sm font-medium"
                  style={{ background: COLORS.mustard, color: COLORS.bg, opacity: saveTitle.trim() && week.length > 0 ? 1 : 0.5 }}
                >
                  {t(language, 'save')}
                </button>
              </div>

              <div style={{ borderTop: `1px dashed ${COLORS.panelBorderLight}` }} className="mb-3" />

              {savedLists.length === 0 ? (
                <div className="text-xs py-2 text-center" style={{ color: COLORS.chalkDim }}>
                  {t(language, 'noSavedLists')}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {savedLists.map((list) => (
                    <div
                      key={list.id}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg"
                      style={{ background: COLORS.bg, border: `1px solid ${COLORS.panelBorderLight}` }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm truncate" style={{ color: COLORS.chalk, fontWeight: 500 }}>
                          {list.title}
                        </div>
                        <div className="text-xs" style={{ color: COLORS.sage }}>
                          {list.meals.length} {t(language, 'dinnersLabel')}
                          {list.createdAt ? ` · ${new Date(list.createdAt).toLocaleDateString(language === 'zh' ? 'zh-CN' : language === 'es' ? 'es-ES' : 'en-US')}` : ''}
                        </div>
                      </div>
                      {confirmDeleteId === list.id ? (
                        <>
                          <button
                            onClick={() => deleteSavedList(list.id)}
                            className="text-xs px-2 py-1 rounded-md font-medium"
                            style={{ background: COLORS.rust, color: COLORS.paper }}
                          >
                            {t(language, 'confirmYes')}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="text-xs px-2 py-1 rounded-md"
                            style={{ background: 'transparent', border: 'none', color: COLORS.chalkDim }}
                          >
                            {t(language, 'cancel')}
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => loadSavedList(list)}
                            className="text-xs px-3 py-1.5 rounded-md font-medium shrink-0"
                            style={{ background: COLORS.mustard, color: COLORS.bg }}
                          >
                            {t(language, 'load')}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(list.id)}
                            aria-label={t(language, 'deleteWord')}
                            className="flex items-center p-1.5 rounded-md shrink-0"
                            style={{ background: 'transparent', border: 'none', color: COLORS.sage }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showFirstLoginModal && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', zIndex: 50 }}
        >
          <div
            className="w-full max-w-md rounded-2xl overflow-hidden"
            style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}`, fontFamily: "'Inter', sans-serif" }}
          >
            <div className="p-5">
              <div className="text-3xl mb-1" style={{ color: COLORS.chalk, fontFamily: "'Caveat', cursive", fontWeight: 700 }}>
                {t(language, 'firstLoginTitle')}
              </div>
              <div className="text-sm mb-5" style={{ color: COLORS.chalkDim }}>
                {t(language, 'firstLoginBody')}
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => finishFirstLogin(true)}
                  className="w-full py-2.5 rounded-lg text-sm font-medium"
                  style={{ background: COLORS.mustard, color: COLORS.bg }}
                >
                  {t(language, 'keepStarterDinners')}
                </button>
                <button
                  onClick={() => finishFirstLogin(false)}
                  className="w-full py-2.5 rounded-lg text-sm font-medium"
                  style={{ background: COLORS.bg, color: COLORS.chalk, border: `1px solid ${COLORS.panelBorderLight}` }}
                >
                  {t(language, 'startFresh')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {clearPhase && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', zIndex: 50 }}
          onClick={() => setClearPhase(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl overflow-hidden"
            style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}`, fontFamily: "'Inter', sans-serif" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5">
              <div className="flex items-start gap-2 mb-5">
                <Trash2 size={18} style={{ color: COLORS.rust, marginTop: 2, flexShrink: 0 }} />
                <div className="text-sm" style={{ color: COLORS.chalk }}>
                  {t(language, 'clearConfirmBody')}
                </div>
              </div>
              {clearPhase === 'ask' ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => setClearPhase(null)}
                    className="flex-1 py-2.5 rounded-lg text-sm font-medium"
                    style={{ background: COLORS.bg, color: COLORS.chalkDim, border: `1px solid ${COLORS.panelBorderLight}` }}
                  >
                    {t(language, 'cancel')}
                  </button>
                  <button
                    onClick={() => setClearPhase('slide')}
                    className="flex-1 py-2.5 rounded-lg text-sm font-medium"
                    style={{ background: COLORS.rust, color: COLORS.paper }}
                  >
                    {t(language, 'confirmYes')}
                  </button>
                </div>
              ) : (
                <SlideToConfirm label={t(language, 'slideToDelete')} onConfirm={clearAllDinners} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
