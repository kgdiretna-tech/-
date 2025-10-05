

import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Type, Chat } from "@google/genai";

const API_KEY = process.env.API_KEY;

// FIX: Moved Ingredient interface here to be available for typing the translations object.
interface Ingredient {
  name: string;
  quantity: number | '';
  unit: string;
}

const translations = {
  he: {
    headerTitle: "מחשבון אוכל ועלויות לאירועים",
    headerSubtitle: "תכנון חכם של כמויות, קניות ותקציב לאירוע מושלם",
    language: "שפה",
    eventType: "סוג האירוע",
    eventTypes: ["מסיבת יום הולדת", "חתונה", "מפגש חברים (קז'ואל)", "אירוע חברה", "חג משפחתי", "אחר"],
    guestsLabel: "כמה אנשים מוזמנים?",
    adultsLabel: "מבוגרים",
    adultsPlaceholder: "לדוגמה: 40",
    childrenLabel: "ילדים",
    childrenPlaceholder: "לדוגמה: 10",
    foodCostPercentage: "אחוז עלות המזון מהמחיר (%)",
    foodCostPercentagePlaceholder: "לדוגמה: 25",
    specialDietaryNeeds: "צרכים תזונתיים מיוחדים (אופציונלי)",
    addNeed: "הוסף צורך תזונתי",
    needNamePlaceholder: "לדוגמה: צמחונים",
    needCountPlaceholder: "כמות",
    selectMains: "בחר מנות עיקריות",
    addMainPlaceholder: "הוסף מנה עיקרית...",
    selectSalads: "בחר סלטים",
    addSaladPlaceholder: "הוסף סלט...",
    selectDesserts: "בחר קינוחים",
    addDessertPlaceholder: "הוסף קינוח...",
    add: "הוסף",
    calculateButton: "חשב כמויות ועלויות",
    calculatingButton: "מחשב...",
    errorMinGuests: "אנא הכנס לפחות מוזמן אחד (מבוגר או ילד).",
    errorMinDish: "יש לבחור לפחות פריט אחד מהתפריט.",
    errorApi: "אירעה שגיאה. אנא נסה שוב מאוחר יותר.",
    errorStorage: "אחסון הדפדפן מלא. לא ניתן לשמור שינויים. נסה למחוק כמה תמונות.",
    loadingMessage: "מחשב את הכמויות והעלויות... זה עשוי לקחת מספר שניות.",
    rationaleTitle: "הסבר והמלצות",
    financialSummaryTitle: "תקציר פיננסי",
    totalCostLabel: 'סה"כ עלות מצרכים מוערכת',
    costPerGuestLabel: "עלות מוערכת לאורח",
    clientPriceLabel: "מחיר מומלץ ללקוח",
    profitLabel: "רווח מוערך (ברוטו)",
    recommendedQuantities: "כמויות אוכל מומלצות",
    shoppingList: "רשימת קניות",
    copySuccess: "הועתק!",
    copyList: "העתק רשימה",
    downloadFile: "הורד כקובץ",
    printList: "הדפס רשימה",
    shareResults: "שתף תוצאות",
    adjustmentTitle: "רוצה לבצע התאמות?",
    adjustmentSubtitle: 'בקש מה-AI להתאים את הכמויות והעלויות (למשל: "הוסף אפשרויות טבעוניות" או "חשב מחדש עבור תקציב נמוך יותר").',
    adjustmentPlaceholder: "הכנס את בקשתך כאן...",
    updateCalculation: "עדכן חישוב",
    updatingCalculation: "מעדכן...",
    errorAdjusting: "אירעה שגיאה בעדכון החישוב. אנא נסה שוב.",
    editIngredientsFor: "עריכת מתכון עבור:",
    close: "סגור חלון",
    noIngredients: "אין עדיין מרכיבים. הוסף מרכיב ראשון.",
    ingredientNamePlaceholder: "שם המרכיב",
    quantityPlaceholder: "כמות",
    cancel: "ביטול",
    saveIngredients: "שמור מתכון",
    edit: "ערוך",
    remove: "הסר",
    confirmDeleteTitle: "אישור מחיקה",
    confirmDeleteMessage: "האם אתה בטוח שברצונך להסיר את '{dishName}'?",
    currency: "₪",
    currencyName: "שקלים (ILS)",
    imageManagement: "ניהול תמונה",
    imageUrl: "קישור (URL) לתמונה",
    imageUrlPlaceholder: "הדבק קישור לתמונה...",
    generateImage: "צור תמונה עם AI",
    generatingImage: "יוצר תמונה...",
    initialData: {
      mains: [
        { name: "שניצל", imageUrl: "https://i.imgur.com/k2QZ5hV.jpeg" },
        { name: "קבב", imageUrl: "https://i.imgur.com/8QZ3Y3A.jpeg" },
        { name: "פרגיות", imageUrl: "https://i.imgur.com/qL5a2nN.jpeg" },
        { name: "שווארמה", imageUrl: "https://i.imgur.com/oK4j3pI.jpeg" },
        { name: "ממולאים", imageUrl: "https://i.imgur.com/2Y2Z6m7.jpeg" }
      ],
      salads: [
        { name: "סלט ירקות", imageUrl: "https://i.imgur.com/dK5cW2n.jpeg" },
        { name: "טבולה", imageUrl: "https://i.imgur.com/jE6w1bJ.jpeg" },
        { name: "חומוס", imageUrl: "https://i.imgur.com/bA9x4Y3.jpeg" },
        { name: "טחינה", imageUrl: "https://i.imgur.com/7Yf2V6W.jpeg" },
        { name: "מטבוחה", imageUrl: "https://i.imgur.com/7Z8k3tG.jpeg" }
      ],
      desserts: [
        { name: "עוגת שוקולד", imageUrl: "https://i.imgur.com/c1Z3c5s.jpeg" },
        { name: "מלבי", imageUrl: "https://i.imgur.com/4J7f2tK.jpeg" },
        { name: "כדורי שוקולד", imageUrl: "https://i.imgur.com/oX2j5Z3.jpeg" },
        { name: "סלט פירות", imageUrl: "https://i.imgur.com/7g2s5Zf.jpeg" },
        { name: "גלידה וניל", imageUrl: "https://i.imgur.com/q2w2g2Y.jpeg" }
      ],
      units: ["גרם", "ק\"ג", "מ\"ל", "ליטר", "יחידה", "חבילה", "קופסה", "כף", "כפית", "כוס", "לפי הטעם"],
      // FIX: Added type assertion to fix type inference issue with 'quantity' property.
      recipes: { "שניצל": [{ name: "חזה עוף", quantity: 1, unit: "ק\"ג" }, { name: "פירורי לחם", quantity: 500, unit: "גרם" }, { name: "ביצים", quantity: 4, unit: "יחידה" }, { name: "שמן לטיגון", quantity: 500, unit: "מ\"ל" }, { name: "מלח", quantity: '', unit: "לפי הטעם" }, { name: "פלפל שחור", quantity: '', unit: "לפי הטעם" }], "סלט ירקות": [{ name: "עגבנייה", quantity: 5, unit: "יחידה" }, { name: "מלפפון", quantity: 5, unit: "יחידה" }, { name: "בצל", quantity: 1, unit: "יחידה" }, { name: "שמן זית", quantity: 3, unit: "כף" }, { name: "לימון", quantity: 1, unit: "יחידה" }, { name: "מלח", quantity: '', unit: "לפי הטעם" }], "עוגת שוקולד": [{ name: "קמח", quantity: 2, unit: "כוס" }, { name: "סוכר", quantity: 2, unit: "כוס" }, { name: "קקאו", quantity: 0.75, unit: "כוס" }, { name: "אבקת אפיה", quantity: 2, unit: "כפית" }, { name: "ביצים", quantity: 2, unit: "יחידה" }, { name: "חלב", quantity: 1, unit: "כוס" }, { name: "שמן", quantity: 0.5, unit: "כוס" }] } as Record<string, Ingredient[]>
    }
  },
  en: {
    headerTitle: "Event Food & Cost Calculator",
    headerSubtitle: "Smart planning for quantities, shopping, and budget for the perfect event",
    language: "Language",
    eventType: "Event Type",
    eventTypes: ["Birthday Party", "Wedding", "Casual Gathering", "Corporate Event", "Family Holiday", "Other"],
    guestsLabel: "How many people are invited?",
    adultsLabel: "Adults",
    adultsPlaceholder: "e.g., 40",
    childrenLabel: "Children",
    childrenPlaceholder: "e.g., 10",
    foodCostPercentage: "Food Cost Percentage (%)",
    foodCostPercentagePlaceholder: "e.g., 25",
    specialDietaryNeeds: "Special Dietary Needs (Optional)",
    addNeed: "Add Dietary Need",
    needNamePlaceholder: "e.g., Vegetarians",
    needCountPlaceholder: "Count",
    selectMains: "Select Main Courses",
    addMainPlaceholder: "Add main course...",
    selectSalads: "Select Salads",
    addSaladPlaceholder: "Add salad...",
    selectDesserts: "Select Desserts",
    addDessertPlaceholder: "Add dessert...",
    add: "Add",
    calculateButton: "Calculate Quantities & Costs",
    calculatingButton: "Calculating...",
    errorMinGuests: "Please enter at least one guest (adult or child).",
    errorMinDish: "Please select at least one item from the menu.",
    errorApi: "An error occurred. Please try again later.",
    errorStorage: "Browser storage is full. Cannot save changes. Try deleting some images.",
    loadingMessage: "Calculating quantities and costs... This may take a few seconds.",
    rationaleTitle: "Explanation & Recommendations",
    financialSummaryTitle: "Financial Summary",
    totalCostLabel: "Total Estimated Ingredient Cost",
    costPerGuestLabel: "Estimated Cost Per Guest",
    clientPriceLabel: "Recommended Client Price",
    profitLabel: "Estimated Gross Profit",
    recommendedQuantities: "Recommended Food Quantities",
    shoppingList: "Shopping List",
    copySuccess: "Copied!",
    copyList: "Copy List",
    downloadFile: "Download as File",
    printList: "Print List",
    shareResults: "Share Results",
    adjustmentTitle: "Want to make adjustments?",
    adjustmentSubtitle: 'Ask the AI to adjust quantities and costs (e.g., "add vegan options" or "recalculate for a lower budget").',
    adjustmentPlaceholder: "Enter your request here...",
    updateCalculation: "Update Calculation",
    updatingCalculation: "Updating...",
    errorAdjusting: "An error occurred while updating the calculation. Please try again.",
    editIngredientsFor: "Editing Recipe for:",
    close: "Close Window",
    noIngredients: "No ingredients yet. Add the first one.",
    ingredientNamePlaceholder: "Ingredient Name",
    quantityPlaceholder: "Quantity",
    cancel: "Cancel",
    saveIngredients: "Save Recipe",
    edit: "Edit",
    remove: "Remove",
    confirmDeleteTitle: "Confirm Deletion",
    confirmDeleteMessage: "Are you sure you want to remove '{dishName}'?",
    currency: "$",
    currencyName: "US Dollars (USD)",
    imageManagement: "Image Management",
    imageUrl: "Image URL",
    imageUrlPlaceholder: "Paste image link...",
    generateImage: "Generate with AI",
    generatingImage: "Generating...",
    initialData: {
      mains: [
        { name: "Schnitzel", imageUrl: "https://i.imgur.com/k2QZ5hV.jpeg" },
        { name: "Kebab", imageUrl: "https://i.imgur.com/8QZ3Y3A.jpeg" },
        { name: "Chicken Skewers", imageUrl: "https://i.imgur.com/qL5a2nN.jpeg" },
        { name: "Shawarma", imageUrl: "https://i.imgur.com/oK4j3pI.jpeg" },
        { name: "Stuffed Vegetables", imageUrl: "https://i.imgur.com/2Y2Z6m7.jpeg" }
      ],
      salads: [
        { name: "Vegetable Salad", imageUrl: "https://i.imgur.com/dK5cW2n.jpeg" },
        { name: "Tabouli", imageUrl: "https://i.imgur.com/jE6w1bJ.jpeg" },
        { name: "Hummus", imageUrl: "https://i.imgur.com/bA9x4Y3.jpeg" },
        { name: "Tahini", imageUrl: "https://i.imgur.com/7Yf2V6W.jpeg" },
        { name: "Matbucha", imageUrl: "https://i.imgur.com/7Z8k3tG.jpeg" }
      ],
      desserts: [
        { name: "Chocolate Cake", imageUrl: "https://i.imgur.com/c1Z3c5s.jpeg" },
        { name: "Malabi", imageUrl: "https://i.imgur.com/4J7f2tK.jpeg" },
        { name: "Chocolate Balls", imageUrl: "https://i.imgur.com/oX2j5Z3.jpeg" },
        { name: "Fruit Salad", imageUrl: "https://i.imgur.com/7g2s5Zf.jpeg" },
        { name: "Vanilla Ice Cream", imageUrl: "https://i.imgur.com/q2w2g2Y.jpeg" }
      ],
      units: ["gram", "kg", "ml", "liter", "unit", "package", "can", "tbsp", "tsp", "cup", "to taste"],
      // FIX: Added type assertion to fix type inference issue with 'quantity' property.
      recipes: { "Schnitzel": [{ name: "Chicken Breast", quantity: 1, unit: "kg" }, { name: "Breadcrumbs", quantity: 500, unit: "gram" }, { name: "Eggs", quantity: 4, unit: "unit" }, { name: "Frying Oil", quantity: 500, unit: "ml" }, { name: "Salt", quantity: '', unit: "to taste" }, { name: "Pepper", quantity: '', unit: "to taste" }], "Vegetable Salad": [{ name: "Tomato", quantity: 5, unit: "unit" }, { name: "Cucumber", quantity: 5, unit: "unit" }, { name: "Onion", quantity: 1, unit: "unit" }, { name: "Olive Oil", quantity: 3, unit: "tbsp" }, { name: "Lemon", quantity: 1, unit: "unit" }, { name: "Salt", quantity: '', unit: "to taste" }], "Chocolate Cake": [{ name: "Flour", quantity: 2, unit: "cup" }, { name: "Sugar", quantity: 2, unit: "cup" }, { name: "Cocoa", quantity: 0.75, unit: "cup" }, { name: "Baking Powder", quantity: 2, unit: "tsp" }, { name: "Eggs", quantity: 2, unit: "unit" }, { name: "Milk", quantity: 1, unit: "cup" }, { name: "Oil", quantity: 0.5, unit: "cup" }] } as Record<string, Ingredient[]>
    }
  },
  es: {
    headerTitle: "Calculadora de Comida y Costos para Eventos",
    headerSubtitle: "Planificación inteligente de cantidades, compras y presupuesto para el evento perfecto",
    language: "Idioma",
    eventType: "Tipo de Evento",
    eventTypes: ["Fiesta de Cumpleaños", "Boda", "Reunión Casual", "Evento Corporativo", "Fiesta Familiar", "Otro"],
    guestsLabel: "¿Cuántas personas están invitadas?",
    adultsLabel: "Adultos",
    adultsPlaceholder: "Ej: 40",
    childrenLabel: "Niños",
    childrenPlaceholder: "Ej: 10",
    foodCostPercentage: "Porcentaje del Costo de Comida (%)",
    foodCostPercentagePlaceholder: "Ej: 25",
    specialDietaryNeeds: "Necesidades Dietéticas Especiales (Opcional)",
    addNeed: "Añadir Necesidad Dietética",
    needNamePlaceholder: "Ej: Vegetarianos",
    needCountPlaceholder: "Cantidad",
    selectMains: "Seleccionar Platos Principales",
    addMainPlaceholder: "Añadir plato principal...",
    selectSalads: "Seleccionar Ensaladas",
    addSaladPlaceholder: "Añadir ensalada...",
    selectDesserts: "Seleccionar Postres",
    addDessertPlaceholder: "Añadir postre...",
    add: "Añadir",
    calculateButton: "Calcular Cantidades y Costos",
    calculatingButton: "Calculando...",
    errorMinGuests: "Por favor, ingrese al menos un invitado (adulto o niño).",
    errorMinDish: "Por favor, seleccione al menos un plato del menú.",
    errorApi: "Ocurrió un error. Por favor, inténtelo de nuevo más tarde.",
    errorStorage: "El almacenamiento del navegador está lleno. No se pueden guardar los cambios. Intente eliminar algunas imágenes.",
    loadingMessage: "Calculando cantidades y costos... Esto puede tardar unos segundos.",
    rationaleTitle: "Explicación y Recomendaciones",
    financialSummaryTitle: "Resumen Financiero",
    totalCostLabel: "Costo Total Estimado de Ingredientes",
    costPerGuestLabel: "Costo Estimado por Invitado",
    clientPriceLabel: "Precio Recomendado al Cliente",
    profitLabel: "Ganancia Bruta Estimada",
    recommendedQuantities: "Cantidades de Comida Recomendadas",
    shoppingList: "Lista de Compras",
    copySuccess: "¡Copiado!",
    copyList: "Copiar Lista",
    downloadFile: "Descargar como Archivo",
    printList: "Imprimir Lista",
    shareResults: "Compartir Resultados",
    adjustmentTitle: "¿Quieres hacer ajustes?",
    adjustmentSubtitle: 'Pide a la IA que ajuste las cantidades y costos (ej: "añade opciones veganas" o "recalcula para un presupuesto más bajo").',
    adjustmentPlaceholder: "Escribe tu petición aquí...",
    updateCalculation: "Actualizar Cálculo",
    updatingCalculation: "Actualizando...",
    errorAdjusting: "Ocurrió un error al actualizar el cálculo. Por favor, inténtalo de nuevo.",
    editIngredientsFor: "Editando Receta para:",
    close: "Cerrar Ventana",
    noIngredients: "Aún no hay ingredientes. Añade el primero.",
    ingredientNamePlaceholder: "Nombre del Ingrediente",
    quantityPlaceholder: "Cantidad",
    cancel: "Cancelar",
    saveIngredients: "Guardar Receta",
    edit: "Editar",
    remove: "Eliminar",
    confirmDeleteTitle: "Confirmar Eliminación",
    confirmDeleteMessage: "¿Estás seguro de que quieres eliminar '{dishName}'?",
    currency: "€",
    currencyName: "Euros (EUR)",
    imageManagement: "Gestión de Imágenes",
    imageUrl: "URL de la Imagen",
    imageUrlPlaceholder: "Pegar enlace de la imagen...",
    generateImage: "Generar con IA",
    generatingImage: "Generando...",
    initialData: {
      mains: [
        { name: "Milanesa", imageUrl: "https://i.imgur.com/k2QZ5hV.jpeg" },
        { name: "Kebab", imageUrl: "https://i.imgur.com/8QZ3Y3A.jpeg" },
        { name: "Brochetas de Pollo", imageUrl: "https://i.imgur.com/qL5a2nN.jpeg" },
        { name: "Shawarma", imageUrl: "https://i.imgur.com/oK4j3pI.jpeg" },
        { name: "Verduras Rellenas", imageUrl: "https://i.imgur.com/2Y2Z6m7.jpeg" }
      ],
      salads: [
        { name: "Ensalada de Verduras", imageUrl: "https://i.imgur.com/dK5cW2n.jpeg" },
        { name: "Tabulé", imageUrl: "https://i.imgur.com/jE6w1bJ.jpeg" },
        { name: "Hummus", imageUrl: "https://i.imgur.com/bA9x4Y3.jpeg" },
        { name: "Tahini", imageUrl: "https://i.imgur.com/7Yf2V6W.jpeg" },
        { name: "Matbucha", imageUrl: "https://i.imgur.com/7Z8k3tG.jpeg" }
      ],
      desserts: [
        { name: "Tarta de Chocolate", imageUrl: "https://i.imgur.com/c1Z3c5s.jpeg" },
        { name: "Malabi", imageUrl: "https://i.imgur.com/4J7f2tK.jpeg" },
        { name: "Bolas de Chocolate", imageUrl: "https://i.imgur.com/oX2j5Z3.jpeg" },
        { name: "Ensalada de Frutas", imageUrl: "https://i.imgur.com/7g2s5Zf.jpeg" },
        { name: "Helado de Vainilla", imageUrl: "https://i.imgur.com/q2w2g2Y.jpeg" }
      ],
      units: ["gramo", "kg", "ml", "litro", "unidad", "paquete", "lata", "cucharada", "cucharadita", "taza", "al gusto"],
      // FIX: Added type assertion to fix type inference issue with 'quantity' property.
      recipes: { "Milanesa": [{ name: "Pechuga de Pollo", quantity: 1, unit: "kg" }, { name: "Pan Rallado", quantity: 500, unit: "gramo" }, { name: "Huevos", quantity: 4, unit: "unidad" }, { name: "Aceite para freír", quantity: 500, unit: "ml" }, { name: "Sal", quantity: '', unit: "al gusto" }, { name: "Pimienta", quantity: '', unit: "al gusto" }], "Ensalada de Verduras": [{ name: "Tomate", quantity: 5, unit: "unidad" }, { name: "Pepino", quantity: 5, unit: "unidad" }, { name: "Cebolla", quantity: 1, unit: "unidad" }, { name: "Aceite de Oliva", quantity: 3, unit: "cucharada" }, { name: "Limón", quantity: 1, unit: "unidad" }, { name: "Sal", quantity: '', unit: "al gusto" }], "Tarta de Chocolate": [{ name: "Harina", quantity: 2, unit: "taza" }, { name: "Azúcar", quantity: 2, unit: "taza" }, { name: "Cacao", quantity: 0.75, unit: "taza" }, { name: "Levadura en polvo", quantity: 2, unit: "cucharadita" }, { name: "Huevos", quantity: 2, unit: "unidad" }, { name: "Leche", quantity: 1, unit: "taza" }, { name: "Aceite", quantity: 0.5, unit: "taza" }] } as Record<string, Ingredient[]>
    }
  },
  fr: {
    headerTitle: "Calculateur de Nourriture et Coûts pour Événements",
    headerSubtitle: "Planification intelligente des quantités, des achats et du budget pour un événement parfait",
    language: "Langue",
    eventType: "Type d'Événement",
    eventTypes: ["Fête d'Anniversaire", "Mariage", "Rassemblement Informel", "Événement d'Entreprise", "Fête de Famille", "Autre"],
    guestsLabel: "Combien de personnes sont invitées ?",
    adultsLabel: "Adultes",
    adultsPlaceholder: "Ex : 40",
    childrenLabel: "Enfants",
    childrenPlaceholder: "Ex : 10",
    foodCostPercentage: "Pourcentage du Coût de la Nourriture (%)",
    foodCostPercentagePlaceholder: "Ex : 25",
    specialDietaryNeeds: "Besoins Alimentaires Spécifiques (Optionnel)",
    addNeed: "Ajouter un Besoin Alimentaire",
    needNamePlaceholder: "Ex : Végétariens",
    needCountPlaceholder: "Quantité",
    selectMains: "Sélectionner les Plats Principaux",
    addMainPlaceholder: "Ajouter un plat principal...",
    selectSalads: "Sélectionner les Salades",
    addSaladPlaceholder: "Ajouter une salade...",
    selectDesserts: "Sélectionner les Desserts",
    addDessertPlaceholder: "Ajouter un dessert...",
    add: "Ajouter",
    calculateButton: "Calculer Quantités et Coûts",
    calculatingButton: "Calcul en cours...",
    errorMinGuests: "Veuillez entrer au moins un invité (adulte ou enfant).",
    errorMinDish: "Veuillez sélectionner au moins un plat dans le menu.",
    errorApi: "Une erreur est survenue. Veuillez réessayer plus tard.",
    errorStorage: "Le stockage du navigateur est plein. Impossible d'enregistrer les modifications. Essayez de supprimer quelques images.",
    loadingMessage: "Calcul des quantités et des coûts... Cela peut prendre quelques secondes.",
    rationaleTitle: "Explication et Recommandations",
    financialSummaryTitle: "Résumé Financier",
    totalCostLabel: "Coût Total Estimé des Ingrédients",
    costPerGuestLabel: "Coût Estimé par Invité",
    clientPriceLabel: "Prix Recommandé au Client",
    profitLabel: "Bénéfice Brut Estimé",
    recommendedQuantities: "Quantités de Nourriture Recommandées",
    shoppingList: "Liste de Courses",
    copySuccess: "Copié !",
    copyList: "Copier la Liste",
    downloadFile: "Télécharger en Fichier",
    printList: "Imprimer la Liste",
    shareResults: "Partager les Résultats",
    adjustmentTitle: "Voulez-vous faire des ajustements ?",
    adjustmentSubtitle: 'Demandez à l\'IA d\'ajuster les cantidades et les coûts (ex: "ajoutez des options végétaliennes" ou "recalculez pour un budget inférieur").',
    adjustmentPlaceholder: "Entrez votre demande ici...",
    updateCalculation: "Mettre à jour le Calcul",
    updatingCalculation: "Mise à jour...",
    errorAdjusting: "Une erreur est survenue lors de la mise à jour du calcul. Veuillez réessayer.",
    editIngredientsFor: "Édition de Recette pour :",
    close: "Fermer la Fenêtre",
    noIngredients: "Pas encore d'ingrédients. Ajoutez le premier.",
    ingredientNamePlaceholder: "Nom de l'ingrédient",
    quantityPlaceholder: "Quantité",
    cancel: "Annuler",
    saveIngredients: "Sauvegarder la Recette",
    edit: "Éditer",
    remove: "Supprimer",
    confirmDeleteTitle: "Confirmer la Suppression",
    confirmDeleteMessage: "Êtes-vous sûr de vouloir supprimer '{dishName}' ?",
    currency: "€",
    currencyName: "Euros (EUR)",
    imageManagement: "Gestion de l'Image",
    imageUrl: "URL de l'Image",
    imageUrlPlaceholder: "Coller le lien de l'image...",
    generateImage: "Générer avec l'IA",
    generatingImage: "Génération...",
    initialData: {
      mains: [
        { name: "Escalope", imageUrl: "https://i.imgur.com/k2QZ5hV.jpeg" },
        { name: "Kebab", imageUrl: "https://i.imgur.com/8QZ3Y3A.jpeg" },
        { name: "Brochettes de Poulet", imageUrl: "https://i.imgur.com/qL5a2nN.jpeg" },
        { name: "Shawarma", imageUrl: "https://i.imgur.com/oK4j3pI.jpeg" },
        { name: "Légumes Farcis", imageUrl: "https://i.imgur.com/2Y2Z6m7.jpeg" }
      ],
      salads: [
        { name: "Salade de Légumes", imageUrl: "https://i.imgur.com/dK5cW2n.jpeg" },
        { name: "Taboulé", imageUrl: "https://i.imgur.com/jE6w1bJ.jpeg" },
        { name: "Houmous", imageUrl: "https://i.imgur.com/bA9x4Y3.jpeg" },
        { name: "Tahini", imageUrl: "https://i.imgur.com/7Yf2V6W.jpeg" },
        { name: "Matbucha", imageUrl: "https://i.imgur.com/7Z8k3tG.jpeg" }
      ],
      desserts: [
        { name: "Gâteau au Chocolat", imageUrl: "https://i.imgur.com/c1Z3c5s.jpeg" },
        { name: "Malabi", imageUrl: "https://i.imgur.com/4J7f2tK.jpeg" },
        { name: "Boules de Chocolat", imageUrl: "https://i.imgur.com/oX2j5Z3.jpeg" },
        { name: "Salade de Fruits", imageUrl: "https://i.imgur.com/7g2s5Zf.jpeg" },
        { name: "Glace à la Vanille", imageUrl: "https://i.imgur.com/q2w2g2Y.jpeg" }
      ],
      units: ["gramme", "kg", "ml", "litre", "unité", "paquet", "boîte", "c.à.s.", "c.à.c.", "tasse", "au goût"],
      // FIX: Added type assertion to fix type inference issue with 'quantity' property.
      recipes: { "Escalope": [{ name: "Blanc de Poulet", quantity: 1, unit: "kg" }, { name: "Chapelure", quantity: 500, unit: "gramme" }, { name: "Oeufs", quantity: 4, unit: "unité" }, { name: "Huile de friture", quantity: 500, unit: "ml" }, { name: "Sel", quantity: '', unit: "au goût" }, { name: "Poivre", quantity: '', unit: "au goût" }], "Salade de Légumes": [{ name: "Tomate", quantity: 5, unit: "unité" }, { name: "Concombre", quantity: 5, unit: "unité" }, { name: "Oignon", quantity: 1, unit: "unité" }, { name: "Huile d'Olive", quantity: 3, unit: "c.à.s." }, { name: "Citron", quantity: 1, unit: "unité" }, { name: "Sel", quantity: '', unit: "au goût" }], "Gâteau au Chocolat": [{ name: "Farine", quantity: 2, unit: "tasse" }, { name: "Sucre", quantity: 2, unit: "tasse" }, { name: "Cacao", quantity: 0.75, unit: "tasse" }, { name: "Levure chimique", quantity: 2, unit: "c.à.c." }, { name: "Oeufs", quantity: 2, unit: "unité" }, { name: "Lait", quantity: 1, unit: "tasse" }, { name: "Huile", quantity: 0.5, unit: "tasse" }] } as Record<string, Ingredient[]>
    }
  },
  ar: {
    headerTitle: "حاسبة تكاليف وطعام الفعاليات",
    headerSubtitle: "تخطيط ذكي للكميات، المشتريات والميزانية لفعالية مثالية",
    language: "اللغة",
    eventType: "نوع الفعالية",
    eventTypes: ["حفلة عيد ميلاد", "حفل زفاف", "لقاء غير رسمي", "فعالية شركة", "عطلة عائلية", "أخرى"],
    guestsLabel: "كم عدد المدعوين؟",
    adultsLabel: "بالغون",
    adultsPlaceholder: "مثال: 40",
    childrenLabel: "أطفال",
    childrenPlaceholder: "مثال: 10",
    foodCostPercentage: "نسبة تكلفة الطعام من السعر (%)",
    foodCostPercentagePlaceholder: "مثال: 25",
    specialDietaryNeeds: "احتياجات غذائية خاصة (اختياري)",
    addNeed: "إضافة احتياج غذائي",
    needNamePlaceholder: "مثال: نباتيون",
    needCountPlaceholder: "العدد",
    selectMains: "اختر الأطباق الرئيسية",
    addMainPlaceholder: "أضف طبقًا رئيسيًا...",
    selectSalads: "اختر السلطات",
    addSaladPlaceholder: "أضف سلطة...",
    selectDesserts: "اختر الحلويات",
    addDessertPlaceholder: "أضف حلوى...",
    add: "إضافة",
    calculateButton: "احسب الكميات والتكاليف",
    calculatingButton: "جاري الحساب...",
    errorMinGuests: "الرجاء إدخال ضيف واحد على الأقل (بالغ أو طفل).",
    errorMinDish: "الرجاء اختيار عنصر واحد على الأقل من القائمة.",
    errorApi: "حدث خطأ. الرجاء المحاولة مرة أخرى لاحقًا.",
    errorStorage: "مساحة تخزين المتصفح ممتلئة. لا يمكن حفظ التغييرات. حاول حذف بعض الصور.",
    loadingMessage: "جاري حساب الكميات والتكاليف... قد يستغرق هذا بضع ثوانٍ.",
    rationaleTitle: "الشرح والتوصيات",
    financialSummaryTitle: "ملخص مالي",
    totalCostLabel: "التكلفة الإجمالية التقديرية للمكونات",
    costPerGuestLabel: "التكلفة التقديرية لكل ضيف",
    clientPriceLabel: "السعر الموصى به للعميل",
    profitLabel: "الربح الإجمالي التقديري",
    recommendedQuantities: "كميات الطعام الموصى بها",
    shoppingList: "قائمة المشتريات",
    copySuccess: "تم النسخ!",
    copyList: "نسخ القائمة",
    downloadFile: "تنزيل كملف",
    printList: "طباعة القائمة",
    shareResults: "مشاركة النتائج",
    adjustmentTitle: "هل تريد إجراء تعديلات؟",
    adjustmentSubtitle: 'اطلب من الذكاء الاصطناعي تعديل الكميات والتكاليف (مثال: "أضف خيارات نباتية" أو "أعد الحساب لميزانية أقل").',
    adjustmentPlaceholder: "أدخل طلبك هنا...",
    updateCalculation: "تحديث الحساب",
    updatingCalculation: "جاري التحديث...",
    errorAdjusting: "حدث خطأ أثناء تحديث الحساب. الرجاء المحاولة مرة أخرى.",
    editIngredientsFor: "تعديل وصفة لـ:",
    close: "إغلاق النافذة",
    noIngredients: "لا توجد مكونات بعد. أضف المكون الأول.",
    ingredientNamePlaceholder: "اسم المكون",
    quantityPlaceholder: "الكمية",
    cancel: "إلغاء",
    saveIngredients: "حفظ الوصفة",
    edit: "تعديل",
    remove: "إزالة",
    confirmDeleteTitle: "تأكيد الحذف",
    confirmDeleteMessage: "هل أنت متأكد أنك تريد إزالة '{dishName}'؟",
    currency: "د.إ",
    currencyName: "درهم إماراتي (AED)",
    imageManagement: "إدارة الصور",
    imageUrl: "رابط الصورة (URL)",
    imageUrlPlaceholder: "الصق رابط الصورة...",
    generateImage: "إنشاء صورة بالذكاء الاصطناعي",
    generatingImage: "جاري إنشاء الصورة...",
    initialData: {
      mains: [
        { name: "شنيتزل", imageUrl: "https://i.imgur.com/k2QZ5hV.jpeg" },
        { name: "كباب", imageUrl: "https://i.imgur.com/8QZ3Y3A.jpeg" },
        { name: "شيش طاووق", imageUrl: "https://i.imgur.com/qL5a2nN.jpeg" },
        { name: "شاورما", imageUrl: "https://i.imgur.com/oK4j3pI.jpeg" },
        { name: "محاشي", imageUrl: "https://i.imgur.com/2Y2Z6m7.jpeg" }
      ],
      salads: [
        { name: "سلطة خضروات", imageUrl: "https://i.imgur.com/dK5cW2n.jpeg" },
        { name: "تبولة", imageUrl: "https://i.imgur.com/jE6w1bJ.jpeg" },
        { name: "حمص", imageUrl: "https://i.imgur.com/bA9x4Y3.jpeg" },
        { name: "طحينة", imageUrl: "https://i.imgur.com/7Yf2V6W.jpeg" },
        { name: "متبل", imageUrl: "https://i.imgur.com/7Z8k3tG.jpeg" }
      ],
      desserts: [
        { name: "كيكة الشوكولاتة", imageUrl: "https://i.imgur.com/c1Z3c5s.jpeg" },
        { name: "مهلبية", imageUrl: "https://i.imgur.com/4J7f2tK.jpeg" },
        { name: "كرات الشوكولاتة", imageUrl: "https://i.imgur.com/oX2j5Z3.jpeg" },
        { name: "سلطة فواكه", imageUrl: "https://i.imgur.com/7g2s5Zf.jpeg" },
        { name: "آيس كريم فانيليا", imageUrl: "https://i.imgur.com/q2w2g2Y.jpeg" }
      ],
      units: ["جرام", "كجم", "مل", "لتر", "وحدة", "عبوة", "علبة", "ملعقة كبيرة", "ملعقة صغيرة", "كوب", "حسب الذوق"],
      // FIX: Added type assertion to fix type inference issue with 'quantity' property.
      recipes: { "شنيتزل": [{ name: "صدر دجاج", quantity: 1, unit: "كجم" }, { name: "بقسماط", quantity: 500, unit: "جرام" }, { name: "بيض", quantity: 4, unit: "وحدة" }, { name: "زيت للقلي", quantity: 500, unit: "مل" }, { name: "ملح", quantity: '', unit: "حسب الذوق" }, { name: "فلفل أسود", quantity: '', unit: "حسب الذوق" }], "سلطة خضروات": [{ name: "طماطم", quantity: 5, unit: "وحدة" }, { name: "خيار", quantity: 5, unit: "وحدة" }, { name: "بصل", quantity: 1, unit: "وحدة" }, { name: "زيت زيتون", quantity: 3, unit: "ملعقة كبيرة" }, { name: "ليمون", quantity: 1, unit: "وحدة" }, { name: "ملح", quantity: '', unit: "حسب الذوق" }], "كيكة الشوكولاتة": [{ name: "دقيق", quantity: 2, unit: "كوب" }, { name: "سكر", quantity: 2, unit: "كوب" }, { name: "كاكاو", quantity: 0.75, unit: "كوب" }, { name: "بيكنج بودر", quantity: 2, unit: "ملعقة صغيرة" }, { name: "بيض", quantity: 2, unit: "وحدة" }, { name: "حليب", quantity: 1, unit: "كوب" }, { name: "زيت", quantity: 0.5, unit: "كوب" }] } as Record<string, Ingredient[]>
    }
  }
};

const PLACEHOLDER_IMAGE = "https://i.imgur.com/6X2Q4Zz.png";

interface Dish {
  name: string;
  imageUrl: string;
}

interface ShoppingListItem {
  ingredientName: string;
  quantity: string;
  estimatedPrice: number;
}

interface CalculationResult {
  foodQuantities: { dishName: string; quantity: string }[];
  shoppingList: ShoppingListItem[];
  rationale: string;
  totalEstimatedCost: number;
}

interface FinancialSummary {
    totalCost: number;
    costPerGuest: number;
    clientPrice: number;
    profit: number;
}

interface DietaryNeed {
  id: number;
  name: string;
  count: number | '';
}

type Language = keyof typeof translations;

const resizeImage = (base64Str: string, maxWidth = 512, maxHeight = 512): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8)); // Use JPEG for smaller size and better compression
      } else {
        resolve(base64Str); // Fallback to original if context fails
      }
    };
    img.onerror = () => {
        resolve(base64Str); // Fallback if image fails to load
    }
  });
};


const App = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [language, setLanguage] = useState<Language>('he');
  const t = translations[language];

  // Form State
  const [numAdults, setNumAdults] = useState<number | ''>('');
  const [numChildren, setNumChildren] = useState<number | ''>('');
  const [eventType, setEventType] = useState(t.eventTypes[0]);
  const [dietaryNeeds, setDietaryNeeds] = useState<DietaryNeed[]>([]);
  const [foodCostPercentage, setFoodCostPercentage] = useState<number | ''>(25);
  
  // Menu Data State
  const [mains, setMains] = useState<Dish[]>([]);
  const [salads, setSalads] = useState<Dish[]>([]);
  const [desserts, setDesserts] = useState<Dish[]>([]);
  const [recipes, setRecipes] = useState<Record<string, Ingredient[]>>({});

  // Selection State
  const [selectedMains, setSelectedMains] = useState<string[]>([]);
  const [selectedSalads, setSelectedSalads] = useState<string[]>([]);
  const [selectedDesserts, setSelectedDesserts] = useState<string[]>([]);

  // Add Item Form State
  const [newMain, setNewMain] = useState('');
  const [newSalad, setNewSalad] = useState('');
  const [newDessert, setNewDessert] = useState('');

  // Calculation & Result State
  const [isCalculating, setIsCalculating] = useState(false);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [chat, setChat] = useState<Chat | null>(null);
  const [adjustmentPrompt, setAdjustmentPrompt] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [modalIngredients, setModalIngredients] = useState<Ingredient[]>([]);
  const [modalImageUrl, setModalImageUrl] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [newIngredient, setNewIngredient] = useState('');
  const [newIngredientQuantity, setNewIngredientQuantity] = useState<number | ''>('');
  const [newIngredientUnit, setNewIngredientUnit] = useState(t.initialData.units[0]);

  // Confirmation Modal State
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [dishToDelete, setDishToDelete] = useState<{ dish: Dish; type: 'main' | 'salad' | 'dessert' } | null>(null);

  // Robust state loading and saving per language
  useEffect(() => {
    if (!isLoaded) return; // Don't save until the initial load for the current language is complete
    
    try {
      const stateToSave = {
        numAdults, numChildren, eventType, foodCostPercentage, dietaryNeeds,
        mains, salads, desserts, recipes
      };
      localStorage.setItem(`eventPlannerState_${language}`, JSON.stringify(stateToSave));
    } catch (err) {
      if (err instanceof DOMException && err.name === 'QuotaExceededError') {
        console.error("Storage quota exceeded. Cannot save state.", err);
        setError(t.errorStorage);
      } else {
        console.error("Failed to save state to localStorage", err);
      }
    }
  }, [
    isLoaded, language, numAdults, numChildren, eventType, foodCostPercentage,
    dietaryNeeds, mains, salads, desserts, recipes
  ]);

  useEffect(() => {
    setIsLoaded(false); // Signal that we are loading new data
    const currentTranslations = translations[language];
    
    // Set document properties
    document.documentElement.lang = language;
    document.documentElement.dir = ['he', 'ar'].includes(language) ? 'rtl' : 'ltr';
    document.title = currentTranslations.headerTitle;

    // Reset language-dependent UI elements
    setEventType(currentTranslations.eventTypes[0]);
    setNewIngredientUnit(currentTranslations.initialData.units[0]);
    
    // Clear selections and results
    setSelectedMains([]);
    setSelectedSalads([]);
    setSelectedDesserts([]);
    setResult(null);
    setFinancialSummary(null);
    setError('');
    setChat(null);

    // Load saved state for the new language, or defaults
    try {
      const savedStateJSON = localStorage.getItem(`eventPlannerState_${language}`);
      if (savedStateJSON) {
        const savedState = JSON.parse(savedStateJSON);
        setNumAdults(savedState.numAdults || '');
        setNumChildren(savedState.numChildren || '');
        setEventType(savedState.eventType || currentTranslations.eventTypes[0]);
        setFoodCostPercentage(savedState.foodCostPercentage || 25);
        setDietaryNeeds(savedState.dietaryNeeds || []);
        setMains(savedState.mains || currentTranslations.initialData.mains);
        setSalads(savedState.salads || currentTranslations.initialData.salads);
        setDesserts(savedState.desserts || currentTranslations.initialData.desserts);
        setRecipes(savedState.recipes || currentTranslations.initialData.recipes);
      } else {
        // No saved state for this language, load defaults
        setNumAdults('');
        setNumChildren('');
        setFoodCostPercentage(25);
        setDietaryNeeds([]);
        setMains(currentTranslations.initialData.mains);
        setSalads(currentTranslations.initialData.salads);
        setDesserts(currentTranslations.initialData.desserts);
        setRecipes(currentTranslations.initialData.recipes);
      }
    } catch (error) {
      console.error(`Failed to load state for language ${language}`, error);
      // Fallback to defaults on error
      setMains(currentTranslations.initialData.mains);
      setSalads(currentTranslations.initialData.salads);
      setDesserts(currentTranslations.initialData.desserts);
      setRecipes(currentTranslations.initialData.recipes);
    } finally {
      setIsLoaded(true); // Signal loading complete
    }
  }, [language]);


  useEffect(() => {
    if (result) {
        const totalGuests = (Number(numAdults) || 0) + (Number(numChildren) || 0);
        const newTotalCost = result.shoppingList.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0);
        calculateFinancials(newTotalCost, totalGuests);
    }
  }, [result, foodCostPercentage, numAdults, numChildren]);

  const handleDishChange = (dishName: string, type: 'main' | 'salad' | 'dessert') => {
    let updater;
    if (type === 'main') updater = setSelectedMains;
    else if (type === 'salad') updater = setSelectedSalads;
    else updater = setSelectedDesserts;
    
    updater(prev => 
      prev.includes(dishName) 
        ? prev.filter(item => item !== dishName) 
        : [...prev, dishName]
    );
  };

  const handleAddItem = (
    newItem: string,
    setNewItem: React.Dispatch<React.SetStateAction<string>>,
    setItems: React.Dispatch<React.SetStateAction<Dish[]>>
  ) => {
    if (newItem.trim() !== '') {
        setItems(prevItems => {
            if (prevItems.some(i => i.name.toLowerCase() === newItem.trim().toLowerCase())) {
                return prevItems;
            }
            return [...prevItems, { name: newItem.trim(), imageUrl: PLACEHOLDER_IMAGE }];
        });
        setNewItem('');
    }
  };
  
  const handleRemoveDish = (dishToRemove: Dish, type: 'main' | 'salad' | 'dessert') => {
      setDishToDelete({ dish: dishToRemove, type });
      setIsConfirmModalOpen(true);
  };

  const handleConfirmRemove = () => {
    if (!dishToDelete) return;
    
    const { dish, type } = dishToDelete;
    const dishName = dish.name;

    if (type === 'main') setMains(prev => prev.filter(d => d.name !== dishName));
    if (type === 'salad') setSalads(prev => prev.filter(d => d.name !== dishName));
    if (type === 'dessert') setDesserts(prev => prev.filter(d => d.name !== dishName));
    
    if (type === 'main') setSelectedMains(prev => prev.filter(d => d !== dishName));
    if (type === 'salad') setSelectedSalads(prev => prev.filter(d => d !== dishName));
    if (type === 'dessert') setSelectedDesserts(prev => prev.filter(d => d !== dishName));
    
    setRecipes(prev => {
      const newRecipes = { ...prev };
      delete newRecipes[dishName];
      return newRecipes;
    });

    handleCloseConfirmModal();
  };
  
  const handleCloseConfirmModal = () => {
      setIsConfirmModalOpen(false);
      setDishToDelete(null);
  };


  const handleOpenEditModal = (dish: Dish) => {
    setEditingDish(dish);
    setModalIngredients(recipes[dish.name] || []);
    setModalImageUrl(dish.imageUrl);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDish(null);
    setModalIngredients([]);
    setModalImageUrl('');
    setIsGeneratingImage(false);
    setNewIngredient('');
    setNewIngredientQuantity('');
    setNewIngredientUnit(t.initialData.units[0]);
  };

  const handleModalIngredientChange = (index: number, field: 'quantity' | 'unit', value: string) => {
    setModalIngredients(currentIngredients =>
      currentIngredients.map((ing, i) => {
        if (i !== index) {
          return ing;
        }
        if (field === 'quantity') {
          return { ...ing, quantity: value === '' ? '' : parseFloat(value) };
        }
        return { ...ing, unit: value };
      })
    );
  };

  const handleSaveRecipe = () => {
    if (editingDish) {
      setRecipes(prev => ({ ...prev, [editingDish.name]: modalIngredients }));

      const updateList = (list: Dish[]) => list.map(d => 
        d.name === editingDish.name ? { ...d, imageUrl: modalImageUrl } : d
      );
      setMains(updateList);
      setSalads(updateList);
      setDesserts(updateList);
    }
    handleCloseModal();
  };

  const handleAddIngredient = () => {
    if (newIngredient.trim() && typeof newIngredientQuantity === 'number' && !modalIngredients.some(i => i.name.toLowerCase() === newIngredient.trim().toLowerCase())) {
        setModalIngredients([...modalIngredients, { name: newIngredient.trim(), quantity: newIngredientQuantity, unit: newIngredientUnit }]);
        setNewIngredient('');
        setNewIngredientQuantity('');
        setNewIngredientUnit(t.initialData.units[0]);
    }
  };

  const handleRemoveIngredient = (ingredientNameToRemove: string) => {
      setModalIngredients(modalIngredients.filter(ing => ing.name !== ingredientNameToRemove));
  };
  
  const handleGenerateImage = async () => {
    if (!editingDish) return;
    setIsGeneratingImage(true);
    setError('');

    try {
      const ai = new GoogleGenAI({ apiKey: API_KEY });
      const ingredientsList = modalIngredients.map(i => i.name).join(', ');
      const prompt = `Photorealistic photo of a delicious plate of ${editingDish.name}, featuring ${ingredientsList}. Professional food photography, high quality, appetizing.`;

      const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: { numberOfImages: 1, outputMimeType: 'image/png' }
      });
      
      const base64ImageBytes = response.generatedImages[0].image.imageBytes;
      const rawImageUrl = `data:image/png;base64,${base64ImageBytes}`;
      const resizedImageUrl = await resizeImage(rawImageUrl);
      setModalImageUrl(resizedImageUrl);

    } catch (err) {
      console.error("Error generating image:", err);
      setError(t.errorApi);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleAddDietaryNeed = () => {
    setDietaryNeeds(prev => [...prev, { id: Date.now(), name: '', count: '' }]);
  };

  const handleDietaryNeedChange = (id: number, field: 'name' | 'count', value: string) => {
      setDietaryNeeds(prev => prev.map(need => {
          if (need.id === id) {
              if (field === 'count') {
                  return { ...need, count: value === '' ? '' : parseInt(value, 10) };
              }
              return { ...need, name: value };
          }
          return need;
      }));
  };

  const handleRemoveDietaryNeed = (id: number) => {
      setDietaryNeeds(prev => prev.filter(need => need.id !== id));
  };

  const formatShoppingList = (list: ShoppingListItem[]): string => {
    return `${t.shoppingList}:\n${list.map(item => `- ${item.ingredientName}: ${item.quantity} (Est. Cost: ${item.estimatedPrice.toFixed(2)} ${t.currency})`).join('\n')}`;
  };

  const handleCopyShoppingList = () => {
    if (result && result.shoppingList) {
      const listAsText = formatShoppingList(result.shoppingList);
      navigator.clipboard.writeText(listAsText).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2500);
      }, (err) => {
        console.error('Could not copy text: ', err);
        alert(t.errorApi);
      });
    }
  };

  const handleDownloadShoppingList = () => {
    if (result && result.shoppingList) {
      const listAsText = formatShoppingList(result.shoppingList);
      const blob = new Blob([listAsText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${t.shoppingList}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handlePrintShoppingList = () => {
    window.print();
  };

  const generateShareText = () => {
    if (!result) return '';
    const totalGuests = (Number(numAdults) || 0) + (Number(numChildren) || 0);
    if (result.shoppingList && result.shoppingList.length > 0) {
      const shoppingListText = result.shoppingList.map(item => `- ${item.ingredientName}: ${item.quantity}`).join('\n');
      return `${t.shoppingList} for an event for ${totalGuests} guests:\n\n${shoppingListText}`;
    }
    if (result.foodQuantities && result.foodQuantities.length > 0) {
       const foodQuantitiesText = result.foodQuantities.map(item => `- ${item.dishName}: ${item.quantity}`).join('\n');
       return `${t.recommendedQuantities} for an event:\n\n${foodQuantitiesText}`;
    }
    return `Planning an event for ${totalGuests} guests!`;
  };

  const calculateFinancials = (totalCost: number, totalGuests: number) => {
      if (totalGuests === 0 || !foodCostPercentage || foodCostPercentage <= 0) {
          setFinancialSummary(null);
          return;
      }
      const costPerGuest = totalCost / totalGuests;
      const clientPrice = totalCost / (Number(foodCostPercentage) / 100);
      const profit = clientPrice - totalCost;
      setFinancialSummary({
          totalCost,
          costPerGuest,
          clientPrice,
          profit,
      });
  };

  const handlePriceChange = (index: number, newPrice: string) => {
    if (!result) return;
    const updatedShoppingList = result.shoppingList.map((item, i) => {
        if (i === index) {
            return { ...item, estimatedPrice: parseFloat(newPrice) || 0 };
        }
        return item;
    });
    setResult(prevResult => {
        if (!prevResult) return null;
        return { ...prevResult, shoppingList: updatedShoppingList };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalGuests = (Number(numAdults) || 0) + (Number(numChildren) || 0);

    if (totalGuests <= 0) {
      setError(t.errorMinGuests);
      return;
    }
    if (selectedMains.length === 0 && selectedSalads.length === 0 && selectedDesserts.length === 0) {
      setError(t.errorMinDish);
      return;
    }
    
    setError('');
    setIsCalculating(true);
    setResult(null);
    setFinancialSummary(null);
    setChat(null);

    const formatDishesWithRecipes = (selectedDishes: string[]) => {
      if (selectedDishes.length === 0) return 'None selected';
      return selectedDishes.map(dish => {
          const recipe = recipes[dish];
          if (recipe && recipe.length > 0) {
              const ingredientsString = recipe.map(ing => `${ing.name} ${ing.quantity} ${ing.unit}`).join(', ');
              return `${dish} (Ingredients: ${ingredientsString})`;
          }
          return dish;
      }).join('; ');
    };

    const formattedNeeds = dietaryNeeds
      .filter(n => n.name.trim() !== '' && (Number(n.count) || 0) > 0)
      .map(n => `${n.name.trim()} (${n.count})`)
      .join(', ');

    try {
      const ai = new GoogleGenAI({ apiKey: API_KEY });
      const prompt = `
        You are a chef and financial consultant for catering, responding in ${language}.
        Your task is to calculate food quantities, generate a detailed shopping list, and estimate financial costs.
        
        Event Details (JSON format):
        ${JSON.stringify({
          responseLanguage: language,
          currency: t.currencyName,
          eventType: eventType,
          adults: numAdults || 0,
          children: numChildren || 0,
          dietaryNeeds: formattedNeeds || 'Not specified',
          mainCourses: formatDishesWithRecipes(selectedMains),
          salads: formatDishesWithRecipes(selectedSalads),
          desserts: formatDishesWithRecipes(selectedDesserts)
        }, null, 2)}
        
        Important Instructions:
        1. Calculate food quantities considering guest count, dietary needs, and that children eat less.
        2. Create a consolidated shopping list based on the selected dishes and their ingredients (if provided). Assume standard recipes if not.
        3. For each item on the shopping list, estimate its price in ${t.currencyName}.
        4. Provide the response in the ${language} language in the exact JSON format. Do not add any text before or after the JSON. The totalEstimatedCost is no longer required in the root of the JSON.
      `;
      
      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          foodQuantities: {
            type: Type.ARRAY,
            description: `List of recommended quantities for each dish in ${language}.`,
            items: { type: Type.OBJECT, properties: { dishName: { type: Type.STRING }, quantity: { type: Type.STRING } }, required: ["dishName", "quantity"] }
          },
          shoppingList: {
            type: Type.ARRAY,
            description: `Consolidated shopping list with price estimation in ${t.currencyName}.`,
            items: { type: Type.OBJECT, properties: { ingredientName: { type: Type.STRING }, quantity: { type: Type.STRING }, estimatedPrice: { type: Type.NUMBER } }, required: ["ingredientName", "quantity", "estimatedPrice"] }
          },
          rationale: { type: Type.STRING, description: `An explanation in ${language} of the calculations.` }
        },
        required: ["foodQuantities", "shoppingList", "rationale"],
      };

      const newChat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: { responseMimeType: "application/json", responseSchema: responseSchema }
      });
      setChat(newChat);
      const response = await newChat.sendMessage({ message: prompt });
      const jsonString = response.text.trim();
      const parsedResult = JSON.parse(jsonString) as Omit<CalculationResult, 'totalEstimatedCost'>;
      
      const totalCost = parsedResult.shoppingList.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0);
      
      setResult({ ...parsedResult, totalEstimatedCost: totalCost });
      calculateFinancials(totalCost, totalGuests);

    } catch (err) {
      console.error("Error calling Gemini API:", err);
      setError(t.errorApi);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleAdjustmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chat || !adjustmentPrompt.trim()) return;
    setIsAdjusting(true);
    setError('');
    const totalGuests = (Number(numAdults) || 0) + (Number(numChildren) || 0);
    const followUpPrompt = `Excellent. Now, please adjust the previous calculation (including quantities, shopping list, and costs) based on this new information from the user: "${adjustmentPrompt}". Provide a complete, updated JSON response in ${language} with all required fields (foodQuantities, shoppingList, rationale) and a new explanation in ${language} that explains the changes. The totalEstimatedCost is no longer required.`;
    try {
        const response = await chat.sendMessage({ message: followUpPrompt });
        const jsonString = response.text.trim();
        const parsedResult = JSON.parse(jsonString) as Omit<CalculationResult, 'totalEstimatedCost'>;
        const totalCost = parsedResult.shoppingList.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0);
        setResult({ ...parsedResult, totalEstimatedCost: totalCost });
        calculateFinancials(totalCost, totalGuests);
        setAdjustmentPrompt('');
    } catch (err) {        
        console.error("Error calling Gemini API for adjustment:", err);
        setError(t.errorAdjusting);
    } finally {
        setIsAdjusting(false);
    }
  };

  const renderDishSelection = (title: string, dishes: Dish[], type: 'main' | 'salad' | 'dessert') => (
    <div className="form-group">
      <label>{title}</label>
      <div className="dish-card-gallery">
        {dishes.map(dish => (
          <div key={dish.name} className={`dish-card ${(type === 'main' ? selectedMains : type === 'salad' ? selectedSalads : selectedDesserts).includes(dish.name) ? 'selected' : ''}`}>
             <div className="dish-card-image-container">
                 <img src={dish.imageUrl} alt={dish.name} loading="lazy" onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE }} />
                 <input
                    type="checkbox"
                    id={`checkbox-${dish.name}`}
                    name={dish.name}
                    value={dish.name}
                    checked={(type === 'main' ? selectedMains : type === 'salad' ? selectedSalads : selectedDesserts).includes(dish.name)}
                    onChange={() => handleDishChange(dish.name, type)}
                 />
             </div>
             <div className="dish-card-body">
                <label htmlFor={`checkbox-${dish.name}`} className="dish-card-title">{dish.name}</label>
                 <div className="dish-card-actions">
                    <button type="button" className="edit-dish-btn" onClick={() => handleOpenEditModal(dish)} aria-label={`${t.edit} ${dish.name}`}>
                        {t.edit}
                    </button>
                    <button type="button" className="remove-dish-btn" onClick={() => handleRemoveDish(dish, type)} aria-label={`${t.remove} ${dish.name}`}>
                        &times;
                    </button>
                 </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
  
  const renderAddItemForm = (
    newItem: string,
    setNewItem: (value: string) => void,
    onAdd: () => void,
    placeholder: string
  ) => (
    <div className="add-item-form">
      <input
        type="text"
        value={newItem}
        onChange={(e) => setNewItem(e.target.value)}
        placeholder={placeholder}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onAdd(); }}}
      />
      <button type="button" onClick={onAdd}>{t.add}</button>
    </div>
  );

  const renderRecipeModal = () => {
    if (!isModalOpen || !editingDish) return null;
    return (
        <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{t.editIngredientsFor} {editingDish.name}</h3>
                    <button className="close-modal-btn" onClick={handleCloseModal} aria-label={t.close}>&times;</button>
                </div>
                <div className="modal-body">
                    <div className="modal-image-section">
                        <h4>{t.imageManagement}</h4>
                        <div className="image-preview" style={{ backgroundImage: `url(${modalImageUrl || PLACEHOLDER_IMAGE})` }}>
                            {!modalImageUrl && <span>No Image</span>}
                        </div>
                        <div className="image-url-input">
                            <label htmlFor="imageUrl">{t.imageUrl}</label>
                            <input
                                type="text"
                                id="imageUrl"
                                value={modalImageUrl}
                                onChange={(e) => setModalImageUrl(e.target.value)}
                                placeholder={t.imageUrlPlaceholder}
                            />
                        </div>
                        <button type="button" className="generate-image-btn" onClick={handleGenerateImage} disabled={isGeneratingImage}>
                            {isGeneratingImage && <div className="spinner-small"></div>}
                            {isGeneratingImage ? t.generatingImage : t.generateImage}
                        </button>
                    </div>

                    <ul className="ingredient-list">
                        {modalIngredients.length === 0 && <li className="empty-list">{t.noIngredients}</li>}
                        {modalIngredients.map((ing, index) => (
                            <li key={ing.name} className="ingredient-list-item editable">
                                <span className="ingredient-name">{ing.name}</span>
                                <div className="ingredient-inputs">
                                    <input type="number" className="quantity-input" value={ing.quantity} onChange={(e) => handleModalIngredientChange(index, 'quantity', e.target.value)} placeholder={t.quantityPlaceholder} min="0" step="any" />
                                    <select className="unit-select" value={ing.unit} onChange={(e) => handleModalIngredientChange(index, 'unit', e.target.value)}>
                                        {t.initialData.units.map(unit => (<option key={unit} value={unit}>{unit}</option>))}
                                    </select>
                                </div>
                                <button onClick={() => handleRemoveIngredient(ing.name)} className="remove-ingredient-btn" aria-label={`${t.remove} ${ing.name}`}>&times;</button>
                            </li>
                        ))}
                    </ul>
                    <div className="add-item-form modal-add-form">
                        <input type="text" value={newIngredient} onChange={(e) => setNewIngredient(e.target.value)} placeholder={t.ingredientNamePlaceholder} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddIngredient(); }}} />
                        <input type="number" className="quantity-input" value={newIngredientQuantity} onChange={(e) => setNewIngredientQuantity(e.target.value === '' ? '' : parseFloat(e.target.value))} placeholder={t.quantityPlaceholder} min="0" step="any" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddIngredient(); }}} />
                        <select className="unit-select" value={newIngredientUnit} onChange={(e) => setNewIngredientUnit(e.target.value)}>
                          {t.initialData.units.map(unit => (<option key={unit} value={unit}>{unit}</option>))}
                        </select>
                        <button type="button" onClick={handleAddIngredient}>{t.add}</button>
                    </div>
                </div>
                <div className="modal-footer">
                    <button type="button" className="modal-btn-secondary" onClick={handleCloseModal}>{t.cancel}</button>
                    <button type="button" className="modal-btn-primary" onClick={handleSaveRecipe}>{t.saveIngredients}</button>
                </div>
            </div>
        </div>
    );
  };

  const renderConfirmationModal = () => {
    if (!isConfirmModalOpen || !dishToDelete) return null;
    return (
      <div className="modal-overlay" onClick={handleCloseConfirmModal}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>{t.confirmDeleteTitle}</h3>
            <button className="close-modal-btn" onClick={handleCloseConfirmModal} aria-label={t.close}>&times;</button>
          </div>
          <div className="modal-body confirmation-modal-body">
            <p>{t.confirmDeleteMessage.replace('{dishName}', dishToDelete.dish.name)}</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="modal-btn-secondary" onClick={handleCloseConfirmModal}>{t.cancel}</button>
            <button type="button" className="modal-btn-danger" onClick={handleConfirmRemove}>{t.remove}</button>
          </div>
        </div>
      </div>
    );
  };

  const renderDietaryNeeds = () => (
    <div className="form-group dietary-needs-group">
      <label>{t.specialDietaryNeeds}</label>
      {dietaryNeeds.map((need) => (
        <div key={need.id} className="dietary-need-row">
          <input type="text" placeholder={t.needNamePlaceholder} value={need.name} onChange={(e) => handleDietaryNeedChange(need.id, 'name', e.target.value)} />
          <input type="number" placeholder={t.needCountPlaceholder} value={need.count} onChange={(e) => handleDietaryNeedChange(need.id, 'count', e.target.value)} min="0" />
          <button type="button" onClick={() => handleRemoveDietaryNeed(need.id)} className="remove-need-btn" aria-label={t.remove}>&times;</button>
        </div>
      ))}
      <button type="button" onClick={handleAddDietaryNeed} className="add-need-btn">{t.addNeed}</button>
    </div>
  );

  return (
    <main className="container">
      {renderRecipeModal()}
      {renderConfirmationModal()}
      <header>
        <div className="header-content">
          <h1>{t.headerTitle}</h1>
          <p>{t.headerSubtitle}</p>
        </div>
        <div className="language-selector-wrapper">
          <label htmlFor="language-select">{t.language}:</label>
          <select id="language-select" value={language} onChange={(e) => setLanguage(e.target.value as Language)}>
            <option value="he">עברית</option>
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="ar">العربية</option>
          </select>
        </div>
      </header>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
            <div className="form-group">
                <label htmlFor="eventType">{t.eventType}</label>
                <select id="eventType" value={eventType} onChange={(e) => setEventType(e.target.value)}>
                    {t.eventTypes.map(type => (<option key={type} value={type}>{type}</option>))}
                </select>
            </div>
             <div className="form-group">
                <label>{t.guestsLabel}</label>
                <div className="guest-inputs-container">
                    <div className="guest-input-group">
                        <label htmlFor="numAdults">{t.adultsLabel}</label>
                        <input type="number" id="numAdults" value={numAdults} onChange={(e) => setNumAdults(e.target.value === '' ? '' : parseInt(e.target.value, 10))} placeholder={t.adultsPlaceholder} min="0" />
                    </div>
                    <div className="guest-input-group">
                        <label htmlFor="numChildren">{t.childrenLabel}</label>
                        <input type="number" id="numChildren" value={numChildren} onChange={(e) => setNumChildren(e.target.value === '' ? '' : parseInt(e.target.value, 10))} placeholder={t.childrenPlaceholder} min="0" />
                    </div>
                </div>
            </div>
             <div className="form-group">
                <label htmlFor="foodCostPercentage">{t.foodCostPercentage}</label>
                <input type="number" id="foodCostPercentage" value={foodCostPercentage} onChange={(e) => setFoodCostPercentage(e.target.value === '' ? '' : parseInt(e.target.value, 10))} placeholder={t.foodCostPercentagePlaceholder} min="1" max="100" />
            </div>
            {renderDietaryNeeds()}
        </div>

        {renderDishSelection(t.selectMains, mains, 'main')}
        {renderAddItemForm(newMain, setNewMain, () => handleAddItem(newMain, setNewMain, setMains), t.addMainPlaceholder)}

        {renderDishSelection(t.selectSalads, salads, 'salad')}
        {renderAddItemForm(newSalad, setNewSalad, () => handleAddItem(newSalad, setNewSalad, setSalads), t.addSaladPlaceholder)}
        
        {renderDishSelection(t.selectDesserts, desserts, 'dessert')}
        {renderAddItemForm(newDessert, setNewDessert, () => handleAddItem(newDessert, setNewDessert, setDesserts), t.addDessertPlaceholder)}

        <button type="submit" className="submit-button" disabled={isCalculating}>
          {isCalculating ? t.calculatingButton : t.calculateButton}
        </button>
      </form>
      {error && <p className="error-message">{error}</p>}
      {isCalculating && (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>{t.loadingMessage}</p>
        </div>
      )}
      {result && (
        <div className="results-section">
          <div className="results-container">
            {result.rationale && (
              <div className="result-card rationale-card">
                <h3>{t.rationaleTitle}</h3>
                <p>{result.rationale}</p>
              </div>
            )}
             {financialSummary && (
                <div className="result-card financial-summary-card">
                    <h3>{t.financialSummaryTitle}</h3>
                    <ul className="result-list">
                        <li> <span className="item-name">{t.totalCostLabel}</span> <span className="item-quantity">{financialSummary.totalCost.toFixed(2)} {t.currency}</span> </li>
                        <li> <span className="item-name">{t.costPerGuestLabel}</span> <span className="item-quantity">{financialSummary.costPerGuest.toFixed(2)} {t.currency}</span> </li>
                        <li> <span className="item-name">{t.clientPriceLabel}</span> <span className="item-quantity">{financialSummary.clientPrice.toFixed(2)} {t.currency}</span> </li>
                        <li> <span className="item-name">{t.profitLabel}</span> <span className="item-quantity strong">{financialSummary.profit.toFixed(2)} {t.currency}</span> </li>
                    </ul>
                </div>
            )}
            <div className="result-card">
              <h3>{t.recommendedQuantities}</h3>
              <ul className="result-list">
                {result.foodQuantities.map(item => ( <li key={item.dishName}> <span className="item-name">{item.dishName}</span> <span className="item-quantity">{item.quantity}</span> </li> ))}
              </ul>
            </div>
            <div className="result-card shopping-list-card">
              <h3>{t.shoppingList}</h3>
              <ul className="result-list">
                {result.shoppingList.map((item, index) => (
                  <li key={`${item.ingredientName}-${index}`}>
                    <span className="item-name">{item.ingredientName}</span>
                    <div className="item-details">
                      <span className="item-quantity">{item.quantity}</span>
                      <div className="item-price-container">
                        <input type="number" className="item-price-input" value={item.estimatedPrice} onChange={(e) => handlePriceChange(index, e.target.value)} step="0.01" min="0" aria-label={`Price for ${item.ingredientName}`} />
                        <span className="item-price-currency">{t.currency}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              {result.shoppingList.length > 0 && (
                <>
                  <div className="card-actions">
                    <button type="button" className="action-btn" onClick={handleCopyShoppingList}> {copySuccess ? t.copySuccess : t.copyList} </button>
                    <button type="button" className="action-btn" onClick={handleDownloadShoppingList}> {t.downloadFile} </button>
                     <button type="button" className="action-btn" onClick={handlePrintShoppingList}> {t.printList} </button>
                  </div>
                  <div className="social-sharing">
                    <h4>{t.shareResults}</h4>
                    <div className="social-buttons">
                       <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(generateShareText())}`} target="_blank" rel="noopener noreferrer" className="social-btn whatsapp" aria-label="Share on WhatsApp"> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.8 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg> </a>
                       <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(generateShareText())}`} target="_blank" rel="noopener noreferrer" className="social-btn twitter" aria-label="Share on Twitter"> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.214 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"/></svg> </a>
                       <button onClick={() => { if (navigator.share) { navigator.share({ title: t.shareResults, text: generateShareText(), }).catch(console.error); } else { alert('Your browser does not support sharing. Try copying the list.'); } }} className="social-btn native-share" aria-label="Share via system dialog"> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M496 0H16C7.163 0 0 7.163 0 16v480c0 8.837 7.163 16 16 16h480c8.837 16 16-7.163 16-16V16c0-8.837-7.163-16-16-16zM192 464c-26.51 0-48-21.49-48-48s21.49-48 48-48 48 21.49 48 48-21.49 48-48 48zm0-160c-26.51 0-48-21.49-48-48s21.49-48 48-48 48 21.49 48 48-21.49 48-48 48zm0-160c-26.51 0-48-21.49-48-48s21.49-48 48-48 48 21.49 48 48-21.49 48-48 48zm128 320c0 26.51-21.49 48-48 48h-16c-8.837 0-16-7.163-16-16v-16c0-8.837 7.163-16 16-16h16c8.837 0 16 7.163 16 16v16zm0-160c0 26.51-21.49 48-48 48h-16c-8.837 0-16-7.163-16-16v-16c0-8.837 7.163-16 16-16h16c8.837 0 16 7.163 16 16v16zm0-160c0 26.51-21.49 48-48 48h-16c-8.837 0-16-7.163-16-16V96c0-8.837 7.163-16 16-16h16c8.837 0 16 7.163 16 16v16z"/></svg> </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          <form onSubmit={handleAdjustmentSubmit} className="adjustment-form">
            <label htmlFor="adjustment-prompt">{t.adjustmentTitle}</label>
            <p>{t.adjustmentSubtitle}</p>
            <div className="adjustment-input-group">
                <input id="adjustment-prompt" type="text" value={adjustmentPrompt} onChange={(e) => setAdjustmentPrompt(e.target.value)} placeholder={t.adjustmentPlaceholder} disabled={isAdjusting} />
                <button type="submit" disabled={isAdjusting || !adjustmentPrompt.trim()}> {isAdjusting ? t.updatingCalculation : t.updateCalculation} </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
