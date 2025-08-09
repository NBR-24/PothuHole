export const potholeQuotes = {
  low: [
    'Baby pothole spotted 🍼',
    'Tar dimple… still cute 🥰',
    'Bicycle-friendly road art 🚲✨',
    'Mallu pothole in baby form 🐣',
  ],
  medium: [
    'Half chai spilled… tragedy! ☕',
    'Kerala’s newest speed breaker 🚧',
    'Suspension’s first heartbreak 💔',
    'Auto driver’s ‘Ayyyo’ heard here 🛺',
  ],
  high: [
    'Suspension killer – 100% organic 💀',
    'Mini swimming pool, BYO boat 🛶',
    'If you drop your phone here… it’s gone 📱',
    'Kerala’s Grand Canyon – entry free 🌋',
    'Your spine just applied for leave 🦴',
  ],
};

export const getRandomQuote = (level) => {
  let category;
  if (level <= 3) {
    category = 'low';
  } else if (level <= 6) {
    category = 'medium';
  } else {
    category = 'high';
  }
  const quotes = potholeQuotes[category];
  return quotes[Math.floor(Math.random() * quotes.length)];
};
