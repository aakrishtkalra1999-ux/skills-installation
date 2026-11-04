import type { Course } from './types';

/*
 * Content note: every word and line here should be reviewed by a native speaker
 * before launch. Lines avoid gendered verb forms so they work for any child.
 */

const tamil: Course = {
  code: 'ta',
  name: 'Tamil',
  nativeName: 'தமிழ்',
  ttsLang: 'ta-IN',
  status: 'launch',
  words: [
    { id: 'vanakkam', native: 'வணக்கம்', roman: 'vanakkam', en: 'hello', emoji: '🙏' },
    { id: 'nandri', native: 'நன்றி', roman: 'nandri', en: 'thank you', emoji: '💐' },
    { id: 'aam', native: 'ஆம்', roman: 'aam', en: 'yes', emoji: '👍' },
    { id: 'illai', native: 'இல்லை', roman: 'illai', en: 'no', emoji: '🙅' },
    { id: 'amma', native: 'அம்மா', roman: 'amma', en: 'mum', emoji: '👩' },
    { id: 'appa', native: 'அப்பா', roman: 'appa', en: 'dad', emoji: '👨' },
    { id: 'paati', native: 'பாட்டி', roman: 'Paati', en: 'grandma', emoji: '👵', elder: true },
    { id: 'thaatha', native: 'தாத்தா', roman: 'Thaatha', en: 'grandpa', emoji: '👴', elder: true },
    { id: 'thanneer', native: 'தண்ணீர்', roman: 'thanneer', en: 'water', emoji: '💧' },
    { id: 'paal', native: 'பால்', roman: 'paal', en: 'milk', emoji: '🥛' },
    { id: 'idli', native: 'இட்லி', roman: 'idli', en: 'idli', emoji: '🍚' },
    { id: 'pazham', native: 'பழம்', roman: 'pazham', en: 'fruit', emoji: '🍌' },
    { id: 'poonai', native: 'பூனை', roman: 'poonai', en: 'cat', emoji: '🐱' },
    { id: 'naai', native: 'நாய்', roman: 'naai', en: 'dog', emoji: '🐶' },
    { id: 'yaanai', native: 'யானை', roman: 'yaanai', en: 'elephant', emoji: '🐘' },
    { id: 'maadu', native: 'மாடு', roman: 'maadu', en: 'cow', emoji: '🐄' },
    { id: 'meen', native: 'மீன்', roman: 'meen', en: 'fish', emoji: '🐟' },
    { id: 'paravai', native: 'பறவை', roman: 'paravai', en: 'bird', emoji: '🐦' },
    { id: 'sivappu', native: 'சிவப்பு', roman: 'sivappu', en: 'red', emoji: '🔴' },
    { id: 'neelam', native: 'நீலம்', roman: 'neelam', en: 'blue', emoji: '🔵' },
    { id: 'pachchai', native: 'பச்சை', roman: 'pachchai', en: 'green', emoji: '🟢' },
    { id: 'manjal', native: 'மஞ்சள்', roman: 'manjal', en: 'yellow', emoji: '🟡' },
    { id: 'ondru', native: 'ஒன்று', roman: 'ondru', en: 'one', emoji: '1️⃣' },
    { id: 'irandu', native: 'இரண்டு', roman: 'irandu', en: 'two', emoji: '2️⃣' },
    { id: 'moondru', native: 'மூன்று', roman: 'moondru', en: 'three', emoji: '3️⃣' },
    { id: 'naangu', native: 'நான்கு', roman: 'naangu', en: 'four', emoji: '4️⃣' },
    { id: 'aindhu', native: 'ஐந்து', roman: 'aindhu', en: 'five', emoji: '5️⃣' },
  ],
  units: [
    {
      id: 'ta-u1',
      title: 'Hello, family!',
      description: 'Say hello on the next video call home',
      topic: 'family',
      lessons: [
        {
          id: 'ta-u1-l1',
          title: 'Hello',
          words: ['vanakkam', 'nandri', 'aam', 'illai'],
          say: [
            {
              milestone: 'hello',
              scene: '{name}, {gp} is on a video call! Can you say hello?',
              line: { native: 'வணக்கம், {gp}!', roman: 'Vanakkam, {gp}!', en: 'Hello, {gp}!' },
            },
          ],
        },
        {
          id: 'ta-u1-l2',
          title: 'My family',
          words: ['amma', 'appa', 'paati', 'thaatha'],
          say: [
            {
              scene: '{gp} sent you a sweet. Say thank you!',
              line: { native: 'நன்றி, {gp}!', roman: 'Nandri, {gp}!', en: 'Thank you, {gp}!' },
            },
          ],
          sentences: [{ native: ['வணக்கம்', 'அம்மா'], roman: 'vanakkam amma', en: ['hello', 'mum'] }],
        },
        {
          id: 'ta-u1-l3',
          title: 'How are you?',
          words: ['vanakkam', 'paati', 'thaatha', 'nandri'],
          say: [
            {
              milestone: 'sentence',
              scene: '{gp} asks how you are. Tell {gp} you are well!',
              line: { native: 'நான் நலமாக இருக்கிறேன்', roman: 'Naan nalamaaga irukkiren', en: 'I am well' },
            },
          ],
          sentences: [
            { native: ['நான்', 'நலமாக', 'இருக்கிறேன்'], roman: 'naan nalamaaga irukkiren', en: ['I', 'am', 'well'] },
          ],
        },
      ],
    },
    {
      id: 'ta-u2',
      title: 'Breakfast time',
      description: 'Idli, milk and more',
      topic: 'food',
      lessons: [
        {
          id: 'ta-u2-l1',
          title: 'Breakfast',
          words: ['thanneer', 'paal', 'idli', 'pazham'],
          say: [
            {
              milestone: 'sentence',
              scene: 'Yum, idli for breakfast! Tell everyone you like it.',
              line: { native: 'எனக்கு இட்லி பிடிக்கும்', roman: 'Enakku idli pidikkum', en: 'I like idli' },
            },
          ],
          sentences: [{ native: ['எனக்கு', 'பால்', 'பிடிக்கும்'], roman: 'enakku paal pidikkum', en: ['I', 'like', 'milk'] }],
        },
      ],
    },
    {
      id: 'ta-u3',
      title: 'Animal friends',
      description: 'From cats to elephants',
      topic: 'animals',
      lessons: [
        { id: 'ta-u3-l1', title: 'Pets', words: ['poonai', 'naai', 'meen', 'paravai'] },
        { id: 'ta-u3-l2', title: 'Big animals', words: ['yaanai', 'maadu', 'naai', 'poonai'] },
      ],
    },
    {
      id: 'ta-u4',
      title: 'Colours',
      description: 'Paint the world',
      topic: 'colours',
      lessons: [{ id: 'ta-u4-l1', title: 'Colours', words: ['sivappu', 'neelam', 'pachchai', 'manjal'] }],
    },
    {
      id: 'ta-u5',
      title: 'Count with me',
      description: 'Numbers one to five',
      topic: 'numbers',
      lessons: [{ id: 'ta-u5-l1', title: '1 to 5', words: ['ondru', 'irandu', 'moondru', 'naangu', 'aindhu'] }],
    },
  ],
  stories: [
    {
      id: 'ta-s1',
      title: "{gp}'s idli",
      cover: '🍚',
      pages: [
        { speaker: 'child', emoji: '👋', line: { native: 'வணக்கம், {gp}!', roman: 'Vanakkam, {gp}!', en: 'Hello, {gp}!' } },
        { speaker: 'gp', emoji: '🤗', line: { native: 'வணக்கம், {name}!', roman: 'Vanakkam, {name}!', en: 'Hello, {name}!' } },
        { speaker: 'gp', emoji: '🍚', line: { native: 'இட்லி வேண்டுமா?', roman: 'Idli vendumaa?', en: 'Would you like idli?' } },
        { speaker: 'child', emoji: '😋', line: { native: 'ஆம்! நன்றி, {gp}!', roman: 'Aam! Nandri, {gp}!', en: 'Yes! Thank you, {gp}!' } },
        { speaker: 'child', emoji: '💛', line: { native: 'எனக்கு இட்லி பிடிக்கும்!', roman: 'Enakku idli pidikkum!', en: 'I like idli!' } },
      ],
    },
  ],
};

const punjabi: Course = {
  code: 'pa',
  name: 'Punjabi',
  nativeName: 'ਪੰਜਾਬੀ',
  ttsLang: 'pa-IN',
  status: 'preview',
  words: [
    { id: 'ssa', native: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ', roman: 'sat sri akaal', en: 'hello', emoji: '🙏' },
    { id: 'dhannvaad', native: 'ਧੰਨਵਾਦ', roman: 'dhannvaad', en: 'thank you', emoji: '💐' },
    { id: 'haan', native: 'ਹਾਂ', roman: 'haan', en: 'yes', emoji: '👍' },
    { id: 'nahin', native: 'ਨਹੀਂ', roman: 'nahin', en: 'no', emoji: '🙅' },
    { id: 'maan', native: 'ਮਾਂ', roman: 'maan', en: 'mum', emoji: '👩' },
    { id: 'papa', native: 'ਪਾਪਾ', roman: 'papa', en: 'dad', emoji: '👨' },
    { id: 'daadi', native: 'ਦਾਦੀ', roman: 'Dadi', en: "grandma (dad's mum)", emoji: '👵', elder: true },
    { id: 'naani', native: 'ਨਾਨੀ', roman: 'Nani', en: "grandma (mum's mum)", emoji: '👵', elder: true },
    { id: 'daada', native: 'ਦਾਦਾ', roman: 'Dada', en: "grandpa (dad's dad)", emoji: '👴', elder: true },
    { id: 'paani', native: 'ਪਾਣੀ', roman: 'paani', en: 'water', emoji: '💧' },
    { id: 'duddh', native: 'ਦੁੱਧ', roman: 'duddh', en: 'milk', emoji: '🥛' },
    { id: 'roti', native: 'ਰੋਟੀ', roman: 'roti', en: 'roti', emoji: '🫓' },
    { id: 'lassi', native: 'ਲੱਸੀ', roman: 'lassi', en: 'lassi', emoji: '🥤' },
    { id: 'billi', native: 'ਬਿੱਲੀ', roman: 'billi', en: 'cat', emoji: '🐱' },
    { id: 'kutta', native: 'ਕੁੱਤਾ', roman: 'kutta', en: 'dog', emoji: '🐶' },
    { id: 'haathi', native: 'ਹਾਥੀ', roman: 'haathi', en: 'elephant', emoji: '🐘' },
    { id: 'gaan', native: 'ਗਾਂ', roman: 'gaan', en: 'cow', emoji: '🐄' },
    { id: 'machhi', native: 'ਮੱਛੀ', roman: 'machhi', en: 'fish', emoji: '🐟' },
  ],
  units: [
    {
      id: 'pa-u1',
      title: 'Hello, family!',
      description: 'Greetings for video calls and visits',
      topic: 'family',
      lessons: [
        {
          id: 'pa-u1-l1',
          title: 'Hello',
          words: ['ssa', 'dhannvaad', 'haan', 'nahin'],
          say: [
            {
              milestone: 'hello',
              scene: '{name}, {gp} is on a video call! Can you say hello?',
              line: { native: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ, {gp}!', roman: 'Sat sri akaal, {gp}!', en: 'Hello, {gp}!' },
            },
          ],
        },
        {
          id: 'pa-u1-l2',
          title: 'My family',
          words: ['maan', 'papa', 'daadi', 'naani', 'daada'],
          say: [
            {
              milestone: 'sentence',
              scene: '{gp} asks how you are. Tell {gp} you are fine!',
              line: { native: 'ਮੈਂ ਠੀਕ ਹਾਂ', roman: 'Main theek haan', en: 'I am fine' },
            },
          ],
          sentences: [{ native: ['ਮੈਂ', 'ਠੀਕ', 'ਹਾਂ'], roman: 'main theek haan', en: ['I', 'am', 'fine'] }],
        },
      ],
    },
    {
      id: 'pa-u2',
      title: 'Snack time',
      description: 'Roti, lassi and more',
      topic: 'food',
      lessons: [
        {
          id: 'pa-u2-l1',
          title: 'Snacks',
          words: ['paani', 'duddh', 'roti', 'lassi'],
          sentences: [{ native: ['ਮੈਨੂੰ', 'ਲੱਸੀ', 'ਪਸੰਦ', 'ਹੈ'], roman: 'mainu lassi pasand hai', en: ['I', 'like', 'lassi'] }],
        },
      ],
    },
    {
      id: 'pa-u3',
      title: 'Animal friends',
      description: 'From cats to elephants',
      topic: 'animals',
      lessons: [{ id: 'pa-u3-l1', title: 'Animals', words: ['billi', 'kutta', 'haathi', 'gaan', 'machhi'] }],
    },
  ],
  stories: [
    {
      id: 'pa-s1',
      title: 'Lassi with {gp}',
      cover: '🥤',
      pages: [
        { speaker: 'child', emoji: '👋', line: { native: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ, {gp}!', roman: 'Sat sri akaal, {gp}!', en: 'Hello, {gp}!' } },
        { speaker: 'gp', emoji: '🤗', line: { native: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ, {name}!', roman: 'Sat sri akaal, {name}!', en: 'Hello, {name}!' } },
        { speaker: 'gp', emoji: '🥤', line: { native: 'ਲੱਸੀ ਪੀਣੀ ਹੈ?', roman: 'Lassi peeni hai?', en: 'Would you like some lassi?' } },
        { speaker: 'child', emoji: '😋', line: { native: 'ਹਾਂ! ਧੰਨਵਾਦ, {gp}!', roman: 'Haan! Dhannvaad, {gp}!', en: 'Yes! Thank you, {gp}!' } },
      ],
    },
  ],
};

const gujarati: Course = {
  code: 'gu',
  name: 'Gujarati',
  nativeName: 'ગુજરાતી',
  ttsLang: 'gu-IN',
  status: 'preview',
  words: [
    { id: 'namaste', native: 'નમસ્તે', roman: 'namaste', en: 'hello', emoji: '🙏' },
    { id: 'aabhaar', native: 'આભાર', roman: 'aabhaar', en: 'thank you', emoji: '💐' },
    { id: 'haa', native: 'હા', roman: 'haa', en: 'yes', emoji: '👍' },
    { id: 'naa', native: 'ના', roman: 'naa', en: 'no', emoji: '🙅' },
    { id: 'mummy', native: 'મમ્મી', roman: 'mummy', en: 'mum', emoji: '👩' },
    { id: 'pappa', native: 'પપ્પા', roman: 'pappa', en: 'dad', emoji: '👨' },
    { id: 'baa', native: 'બા', roman: 'Baa', en: 'grandma', emoji: '👵', elder: true },
    { id: 'daada', native: 'દાદા', roman: 'Dada', en: 'grandpa', emoji: '👴', elder: true },
    { id: 'paani', native: 'પાણી', roman: 'paani', en: 'water', emoji: '💧' },
    { id: 'doodh', native: 'દૂધ', roman: 'doodh', en: 'milk', emoji: '🥛' },
    { id: 'rotli', native: 'રોટલી', roman: 'rotli', en: 'rotli', emoji: '🫓' },
    { id: 'khichdi', native: 'ખીચડી', roman: 'khichdi', en: 'khichdi', emoji: '🍚' },
    { id: 'bilaadi', native: 'બિલાડી', roman: 'bilaadi', en: 'cat', emoji: '🐱' },
    { id: 'kutro', native: 'કૂતરો', roman: 'kutro', en: 'dog', emoji: '🐶' },
    { id: 'haathi', native: 'હાથી', roman: 'haathi', en: 'elephant', emoji: '🐘' },
    { id: 'gaay', native: 'ગાય', roman: 'gaay', en: 'cow', emoji: '🐄' },
    { id: 'maachhli', native: 'માછલી', roman: 'maachhli', en: 'fish', emoji: '🐟' },
  ],
  units: [
    {
      id: 'gu-u1',
      title: 'Hello, family!',
      description: 'Say hello to Baa and Dada',
      topic: 'family',
      lessons: [
        {
          id: 'gu-u1-l1',
          title: 'Hello',
          words: ['namaste', 'aabhaar', 'haa', 'naa'],
          say: [
            {
              milestone: 'hello',
              scene: '{name}, {gp} is on a video call! Can you say hello?',
              line: { native: 'નમસ્તે, {gp}!', roman: 'Namaste, {gp}!', en: 'Hello, {gp}!' },
            },
          ],
        },
        {
          id: 'gu-u1-l2',
          title: 'My family',
          words: ['mummy', 'pappa', 'baa', 'daada'],
          say: [
            {
              milestone: 'sentence',
              scene: '{gp} asks “kem chho?” (how are you?). Tell {gp} you are fine!',
              line: { native: 'હું મજામાં છું', roman: 'Hun majaamaa chhun', en: 'I am fine' },
            },
          ],
          sentences: [{ native: ['હું', 'મજામાં', 'છું'], roman: 'hun majaamaa chhun', en: ['I', 'am', 'fine'] }],
        },
      ],
    },
    {
      id: 'gu-u2',
      title: 'Dinner time',
      description: 'Rotli, khichdi and more',
      topic: 'food',
      lessons: [{ id: 'gu-u2-l1', title: 'Dinner', words: ['paani', 'doodh', 'rotli', 'khichdi'] }],
    },
    {
      id: 'gu-u3',
      title: 'Animal friends',
      description: 'From cats to elephants',
      topic: 'animals',
      lessons: [{ id: 'gu-u3-l1', title: 'Animals', words: ['bilaadi', 'kutro', 'haathi', 'gaay', 'maachhli'] }],
    },
  ],
  stories: [
    {
      id: 'gu-s1',
      title: 'Milk with {gp}',
      cover: '🥛',
      pages: [
        { speaker: 'child', emoji: '👋', line: { native: 'નમસ્તે, {gp}!', roman: 'Namaste, {gp}!', en: 'Hello, {gp}!' } },
        { speaker: 'gp', emoji: '🤗', line: { native: 'કેમ છો, {name}?', roman: 'Kem chho, {name}?', en: 'How are you, {name}?' } },
        { speaker: 'child', emoji: '😊', line: { native: 'હું મજામાં છું!', roman: 'Hun majaamaa chhun!', en: 'I am fine!' } },
        { speaker: 'gp', emoji: '🥛', line: { native: 'દૂધ પીવું છે?', roman: 'Doodh peevun chhe?', en: 'Would you like some milk?' } },
        { speaker: 'child', emoji: '😋', line: { native: 'હા! આભાર, {gp}!', roman: 'Haa! Aabhaar, {gp}!', en: 'Yes! Thank you, {gp}!' } },
      ],
    },
  ],
};

const malayalam: Course = {
  code: 'ml',
  name: 'Malayalam',
  nativeName: 'മലയാളം',
  ttsLang: 'ml-IN',
  status: 'preview',
  words: [
    { id: 'namaskaaram', native: 'നമസ്കാരം', roman: 'namaskaaram', en: 'hello', emoji: '🙏' },
    { id: 'nanni', native: 'നന്ദി', roman: 'nanni', en: 'thank you', emoji: '💐' },
    { id: 'athe', native: 'അതെ', roman: 'athe', en: 'yes', emoji: '👍' },
    { id: 'illa', native: 'ഇല്ല', roman: 'illa', en: 'no', emoji: '🙅' },
    { id: 'amma', native: 'അമ്മ', roman: 'amma', en: 'mum', emoji: '👩' },
    { id: 'achchan', native: 'അച്ഛൻ', roman: 'achchan', en: 'dad', emoji: '👨' },
    { id: 'ammamma', native: 'അമ്മമ്മ', roman: 'Ammamma', en: "grandma (mum's mum)", emoji: '👵', elder: true },
    { id: 'appooppan', native: 'അപ്പൂപ്പൻ', roman: 'Appooppan', en: 'grandpa', emoji: '👴', elder: true },
    { id: 'vellam', native: 'വെള്ളം', roman: 'vellam', en: 'water', emoji: '💧' },
    { id: 'paal', native: 'പാൽ', roman: 'paal', en: 'milk', emoji: '🥛' },
    { id: 'choru', native: 'ചോറ്', roman: 'choru', en: 'rice', emoji: '🍚' },
    { id: 'pazham', native: 'പഴം', roman: 'pazham', en: 'banana', emoji: '🍌' },
    { id: 'poocha', native: 'പൂച്ച', roman: 'poocha', en: 'cat', emoji: '🐱' },
    { id: 'naaya', native: 'നായ', roman: 'naaya', en: 'dog', emoji: '🐶' },
    { id: 'aana', native: 'ആന', roman: 'aana', en: 'elephant', emoji: '🐘' },
    { id: 'pashu', native: 'പശു', roman: 'pashu', en: 'cow', emoji: '🐄' },
    { id: 'meen', native: 'മീൻ', roman: 'meen', en: 'fish', emoji: '🐟' },
  ],
  units: [
    {
      id: 'ml-u1',
      title: 'Hello, family!',
      description: 'Say hello to Ammamma and Appooppan',
      topic: 'family',
      lessons: [
        {
          id: 'ml-u1-l1',
          title: 'Hello',
          words: ['namaskaaram', 'nanni', 'athe', 'illa'],
          say: [
            {
              milestone: 'hello',
              scene: '{name}, {gp} is on a video call! Can you say hello?',
              line: { native: 'നമസ്കാരം, {gp}!', roman: 'Namaskaaram, {gp}!', en: 'Hello, {gp}!' },
            },
          ],
        },
        {
          id: 'ml-u1-l2',
          title: 'My family',
          words: ['amma', 'achchan', 'ammamma', 'appooppan'],
          say: [
            {
              milestone: 'sentence',
              scene: '{gp} asks “sukhamaano?” (are you well?). Tell {gp} you are well!',
              line: { native: 'സുഖമാണ്', roman: 'Sukhamaanu', en: 'I am well' },
            },
          ],
        },
      ],
    },
    {
      id: 'ml-u2',
      title: 'Lunch time',
      description: 'Rice, bananas and more',
      topic: 'food',
      lessons: [{ id: 'ml-u2-l1', title: 'Lunch', words: ['vellam', 'paal', 'choru', 'pazham'] }],
    },
    {
      id: 'ml-u3',
      title: 'Animal friends',
      description: 'From cats to elephants',
      topic: 'animals',
      lessons: [{ id: 'ml-u3-l1', title: 'Animals', words: ['poocha', 'naaya', 'aana', 'pashu', 'meen'] }],
    },
  ],
  stories: [
    {
      id: 'ml-s1',
      title: 'Milk with {gp}',
      cover: '🥛',
      pages: [
        { speaker: 'child', emoji: '👋', line: { native: 'നമസ്കാരം, {gp}!', roman: 'Namaskaaram, {gp}!', en: 'Hello, {gp}!' } },
        { speaker: 'gp', emoji: '🤗', line: { native: 'സുഖമാണോ, {name}?', roman: 'Sukhamaano, {name}?', en: 'Are you well, {name}?' } },
        { speaker: 'child', emoji: '😊', line: { native: 'സുഖമാണ്!', roman: 'Sukhamaanu!', en: 'I am well!' } },
        { speaker: 'gp', emoji: '🥛', line: { native: 'പാൽ വേണോ?', roman: 'Paal veno?', en: 'Would you like some milk?' } },
        { speaker: 'child', emoji: '😋', line: { native: 'വേണം! നന്ദി, {gp}!', roman: 'Venam! Nanni, {gp}!', en: 'Yes please! Thank you, {gp}!' } },
      ],
    },
  ],
};

const telugu: Course = {
  code: 'te',
  name: 'Telugu',
  nativeName: 'తెలుగు',
  ttsLang: 'te-IN',
  status: 'preview',
  words: [
    { id: 'namaskaram', native: 'నమస్కారం', roman: 'namaskaaram', en: 'hello', emoji: '🙏' },
    { id: 'dhanyavaadaalu', native: 'ధన్యవాదాలు', roman: 'dhanyavaadaalu', en: 'thank you', emoji: '💐' },
    { id: 'avunu', native: 'అవును', roman: 'avunu', en: 'yes', emoji: '👍' },
    { id: 'kaadu', native: 'కాదు', roman: 'kaadu', en: 'no', emoji: '🙅' },
    { id: 'amma', native: 'అమ్మ', roman: 'amma', en: 'mum', emoji: '👩' },
    { id: 'naanna', native: 'నాన్న', roman: 'naanna', en: 'dad', emoji: '👨' },
    { id: 'ammamma', native: 'అమ్మమ్మ', roman: 'Ammamma', en: "grandma (mum's mum)", emoji: '👵', elder: true },
    { id: 'naanamma', native: 'నానమ్మ', roman: 'Naanamma', en: "grandma (dad's mum)", emoji: '🧓', elder: true },
    { id: 'thaatha', native: 'తాతయ్య', roman: 'Thaathayya', en: 'grandpa', emoji: '👴', elder: true },
    { id: 'neellu', native: 'నీళ్ళు', roman: 'neellu', en: 'water', emoji: '💧' },
    { id: 'paalu', native: 'పాలు', roman: 'paalu', en: 'milk', emoji: '🥛' },
    { id: 'dosa', native: 'దోసె', roman: 'dose', en: 'dosa', emoji: '🫓' },
    { id: 'aratipandu', native: 'అరటిపండు', roman: 'aratipandu', en: 'banana', emoji: '🍌' },
    { id: 'pilli', native: 'పిల్లి', roman: 'pilli', en: 'cat', emoji: '🐱' },
    { id: 'kukka', native: 'కుక్క', roman: 'kukka', en: 'dog', emoji: '🐶' },
    { id: 'enugu', native: 'ఏనుగు', roman: 'enugu', en: 'elephant', emoji: '🐘' },
    { id: 'aavu', native: 'ఆవు', roman: 'aavu', en: 'cow', emoji: '🐄' },
    { id: 'chepa', native: 'చేప', roman: 'chepa', en: 'fish', emoji: '🐟' },
    { id: 'pakshi', native: 'పక్షి', roman: 'pakshi', en: 'bird', emoji: '🐦' },
    { id: 'erupu', native: 'ఎరుపు', roman: 'erupu', en: 'red', emoji: '🔴' },
    { id: 'neelam', native: 'నీలం', roman: 'neelam', en: 'blue', emoji: '🔵' },
    { id: 'aakupachcha', native: 'ఆకుపచ్చ', roman: 'aakupachcha', en: 'green', emoji: '🟢' },
    { id: 'pasupu', native: 'పసుపు', roman: 'pasupu', en: 'yellow', emoji: '🟡' },
    { id: 'okati', native: 'ఒకటి', roman: 'okati', en: 'one', emoji: '1️⃣' },
    { id: 'rendu', native: 'రెండు', roman: 'rendu', en: 'two', emoji: '2️⃣' },
    { id: 'moodu', native: 'మూడు', roman: 'moodu', en: 'three', emoji: '3️⃣' },
    { id: 'naalugu', native: 'నాలుగు', roman: 'naalugu', en: 'four', emoji: '4️⃣' },
    { id: 'aidu', native: 'ఐదు', roman: 'aidu', en: 'five', emoji: '5️⃣' },
  ],
  units: [
    {
      id: 'te-u1',
      title: 'Hello, family!',
      description: 'Say hello on the next video call home',
      topic: 'family',
      lessons: [
        {
          id: 'te-u1-l1',
          title: 'Hello',
          words: ['namaskaram', 'dhanyavaadaalu', 'avunu', 'kaadu'],
          say: [
            {
              milestone: 'hello',
              scene: '{name}, {gp} is on a video call! Can you say hello?',
              line: { native: 'నమస్కారం, {gp}!', roman: 'Namaskaaram, {gp}!', en: 'Hello, {gp}!' },
            },
          ],
        },
        {
          id: 'te-u1-l2',
          title: 'My family',
          words: ['amma', 'naanna', 'ammamma', 'thaatha'],
          say: [
            {
              scene: '{gp} sent you a sweet. Say thank you!',
              line: { native: 'ధన్యవాదాలు, {gp}!', roman: 'Dhanyavaadaalu, {gp}!', en: 'Thank you, {gp}!' },
            },
          ],
          sentences: [{ native: ['నమస్కారం', 'అమ్మ'], roman: 'namaskaaram amma', en: ['hello', 'mum'] }],
        },
        {
          id: 'te-u1-l3',
          title: 'How are you?',
          words: ['namaskaram', 'naanamma', 'thaatha', 'dhanyavaadaalu'],
          say: [
            {
              milestone: 'sentence',
              scene: '{gp} asks “baagunnaavaa?” (are you well?). Tell {gp} you are well!',
              line: { native: 'నేను బాగున్నాను', roman: 'Nenu baagunnaanu', en: 'I am well' },
            },
          ],
          sentences: [{ native: ['నేను', 'బాగున్నాను'], roman: 'nenu baagunnaanu', en: ['I', 'am', 'well'] }],
        },
      ],
    },
    {
      id: 'te-u2',
      title: 'Breakfast time',
      description: 'Dosa, milk and more',
      topic: 'food',
      lessons: [
        {
          id: 'te-u2-l1',
          title: 'Breakfast',
          words: ['neellu', 'paalu', 'dosa', 'aratipandu'],
          say: [
            {
              milestone: 'sentence',
              scene: 'Yum, dosa for breakfast! Tell everyone you like it.',
              line: { native: 'నాకు దోసె ఇష్టం', roman: 'Naaku dose ishtam', en: 'I like dosa' },
            },
          ],
          sentences: [{ native: ['నాకు', 'పాలు', 'ఇష్టం'], roman: 'naaku paalu ishtam', en: ['I', 'like', 'milk'] }],
        },
      ],
    },
    {
      id: 'te-u3',
      title: 'Animal friends',
      description: 'From cats to elephants',
      topic: 'animals',
      lessons: [
        { id: 'te-u3-l1', title: 'Pets', words: ['pilli', 'kukka', 'chepa', 'pakshi'] },
        { id: 'te-u3-l2', title: 'Big animals', words: ['enugu', 'aavu', 'kukka', 'pilli'] },
      ],
    },
    {
      id: 'te-u4',
      title: 'Colours',
      description: 'Paint the world',
      topic: 'colours',
      lessons: [{ id: 'te-u4-l1', title: 'Colours', words: ['erupu', 'neelam', 'aakupachcha', 'pasupu'] }],
    },
    {
      id: 'te-u5',
      title: 'Count with me',
      description: 'Numbers one to five',
      topic: 'numbers',
      lessons: [{ id: 'te-u5-l1', title: '1 to 5', words: ['okati', 'rendu', 'moodu', 'naalugu', 'aidu'] }],
    },
  ],
  stories: [
    {
      id: 'te-s1',
      title: "{gp}'s dosa",
      cover: '🫓',
      pages: [
        { speaker: 'child', emoji: '👋', line: { native: 'నమస్కారం, {gp}!', roman: 'Namaskaaram, {gp}!', en: 'Hello, {gp}!' } },
        { speaker: 'gp', emoji: '🤗', line: { native: 'బాగున్నావా, {name}?', roman: 'Baagunnaavaa, {name}?', en: 'Are you well, {name}?' } },
        { speaker: 'child', emoji: '😊', line: { native: 'బాగున్నాను!', roman: 'Baagunnaanu!', en: 'I am well!' } },
        { speaker: 'gp', emoji: '🫓', line: { native: 'దోసె కావాలా?', roman: 'Dose kaavaalaa?', en: 'Would you like dosa?' } },
        { speaker: 'child', emoji: '😋', line: { native: 'అవును! ధన్యవాదాలు, {gp}!', roman: 'Avunu! Dhanyavaadaalu, {gp}!', en: 'Yes! Thank you, {gp}!' } },
        { speaker: 'child', emoji: '💛', line: { native: 'నాకు దోసె ఇష్టం!', roman: 'Naaku dose ishtam!', en: 'I like dosa!' } },
      ],
    },
  ],
};

export const COURSES: Course[] = [tamil, telugu, punjabi, gujarati, malayalam];

export function getCourse(code: string): Course {
  const course = COURSES.find((c) => c.code === code);
  if (!course) throw new Error(`Unknown course: ${code}`);
  return course;
}

/** Extra English tiles used as wrong options in sentence building. */
export const EN_DISTRACTORS = ['is', 'we', 'water', 'no', 'eat', 'they', 'my', 'go'];
