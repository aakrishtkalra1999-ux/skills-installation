import type { Course } from './types';

const hindi: Course = {
  code: 'hi',
  name: 'Hindi',
  nativeName: 'हिन्दी',
  ttsLang: 'hi-IN',
  speakers: '600M+ speakers',
  words: [
    { id: 'namaste', native: 'नमस्ते', roman: 'namaste', en: 'hello', emoji: '🙏' },
    { id: 'dhanyavaad', native: 'धन्यवाद', roman: 'dhanyavaad', en: 'thank you', emoji: '💐' },
    { id: 'haan', native: 'हाँ', roman: 'haan', en: 'yes', emoji: '👍' },
    { id: 'nahin', native: 'नहीं', roman: 'nahin', en: 'no', emoji: '🙅' },
    { id: 'main', native: 'मैं', roman: 'main', en: 'I', emoji: '🙋' },
    { id: 'aap', native: 'आप', roman: 'aap', en: 'you (respectful)', emoji: '🫵' },
    { id: 'maa', native: 'माँ', roman: 'maa', en: 'mother', emoji: '👩' },
    { id: 'pita', native: 'पिता', roman: 'pita', en: 'father', emoji: '👨' },
    { id: 'daadi', native: 'दादी', roman: 'daadi', en: "grandmother (father's side)", emoji: '👵' },
    { id: 'naani', native: 'नानी', roman: 'naani', en: "grandmother (mother's side)", emoji: '👵' },
    { id: 'bhai', native: 'भाई', roman: 'bhaai', en: 'brother', emoji: '👦' },
    { id: 'behen', native: 'बहन', roman: 'behen', en: 'sister', emoji: '👧' },
    { id: 'paani', native: 'पानी', roman: 'paani', en: 'water', emoji: '💧' },
    { id: 'khaana', native: 'खाना', roman: 'khaana', en: 'food', emoji: '🍛' },
    { id: 'roti', native: 'रोटी', roman: 'roti', en: 'flatbread', emoji: '🫓' },
    { id: 'daal', native: 'दाल', roman: 'daal', en: 'lentils', emoji: '🥣' },
    { id: 'chaai', native: 'चाय', roman: 'chaai', en: 'tea', emoji: '🍵' },
    { id: 'doodh', native: 'दूध', roman: 'doodh', en: 'milk', emoji: '🥛' },
    { id: 'aam', native: 'आम', roman: 'aam', en: 'mango', emoji: '🥭' },
    { id: 'l-a', native: 'अ', roman: 'a', en: 'a', kind: 'letter' },
    { id: 'l-aa', native: 'आ', roman: 'aa', en: 'aa', kind: 'letter' },
    { id: 'l-ka', native: 'क', roman: 'ka', en: 'ka', kind: 'letter' },
    { id: 'l-ma', native: 'म', roman: 'ma', en: 'ma', kind: 'letter' },
    { id: 'l-na', native: 'न', roman: 'na', en: 'na', kind: 'letter' },
    { id: 'l-ra', native: 'र', roman: 'ra', en: 'ra', kind: 'letter' },
  ],
  units: [
    {
      id: 'hi-u1',
      title: 'Say hello to family',
      description: 'Greetings you can use on your next video call home',
      lessons: [
        {
          id: 'hi-u1-l1',
          title: 'Greetings',
          words: ['namaste', 'dhanyavaad', 'haan', 'nahin'],
          sentences: [
            { native: ['नमस्ते', 'दादी'], roman: 'namaste daadi', en: ['hello', 'grandmother'] },
          ],
        },
        {
          id: 'hi-u1-l2',
          title: 'Family',
          words: ['maa', 'pita', 'daadi', 'naani', 'bhai', 'behen'],
          sentences: [
            { native: ['मैं', 'ठीक', 'हूँ'], roman: 'main theek hoon', en: ['I', 'am', 'fine'] },
          ],
        },
        {
          id: 'hi-u1-l3',
          title: 'How are you?',
          words: ['main', 'aap', 'namaste', 'dhanyavaad'],
          sentences: [
            { native: ['आप', 'कैसे', 'हैं'], roman: 'aap kaise hain', en: ['how', 'are', 'you'] },
            { native: ['मैं', 'ठीक', 'हूँ'], roman: 'main theek hoon', en: ['I', 'am', 'fine'] },
          ],
        },
      ],
    },
    {
      id: 'hi-u2',
      title: 'At the dinner table',
      description: 'Food words from every Indian kitchen',
      lessons: [
        {
          id: 'hi-u2-l1',
          title: 'Food',
          words: ['paani', 'khaana', 'roti', 'daal'],
          sentences: [
            { native: ['खाना', 'अच्छा', 'है'], roman: 'khaana achchha hai', en: ['the', 'food', 'is', 'good'] },
          ],
        },
        {
          id: 'hi-u2-l2',
          title: 'Drinks & fruit',
          words: ['chaai', 'doodh', 'aam', 'paani'],
          sentences: [
            { native: ['मुझे', 'चाय', 'पसंद', 'है'], roman: 'mujhe chaai pasand hai', en: ['I', 'like', 'tea'] },
          ],
        },
      ],
    },
    {
      id: 'hi-u3',
      title: 'Read Devanagari',
      description: 'Start reading the script, one letter at a time',
      lessons: [
        { id: 'hi-u3-l1', title: 'First letters', words: ['l-a', 'l-aa', 'l-ka', 'l-ma'], sentences: [] },
        { id: 'hi-u3-l2', title: 'More letters', words: ['l-na', 'l-ra', 'l-ka', 'l-ma'], sentences: [] },
      ],
    },
  ],
};

const punjabi: Course = {
  code: 'pa',
  name: 'Punjabi',
  nativeName: 'ਪੰਜਾਬੀ',
  ttsLang: 'pa-IN',
  speakers: '110M+ speakers',
  words: [
    { id: 'ssa', native: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ', roman: 'sat sri akaal', en: 'hello', emoji: '🙏' },
    { id: 'dhannvaad', native: 'ਧੰਨਵਾਦ', roman: 'dhannvaad', en: 'thank you', emoji: '💐' },
    { id: 'haan', native: 'ਹਾਂ', roman: 'haan', en: 'yes', emoji: '👍' },
    { id: 'nahin', native: 'ਨਹੀਂ', roman: 'nahin', en: 'no', emoji: '🙅' },
    { id: 'main', native: 'ਮੈਂ', roman: 'main', en: 'I', emoji: '🙋' },
    { id: 'tusin', native: 'ਤੁਸੀਂ', roman: 'tusin', en: 'you (respectful)', emoji: '🫵' },
    { id: 'maan', native: 'ਮਾਂ', roman: 'maan', en: 'mother', emoji: '👩' },
    { id: 'pita', native: 'ਪਿਤਾ', roman: 'pitaa', en: 'father', emoji: '👨' },
    { id: 'daadi', native: 'ਦਾਦੀ', roman: 'daadi', en: "grandmother (father's side)", emoji: '👵' },
    { id: 'naani', native: 'ਨਾਨੀ', roman: 'naani', en: "grandmother (mother's side)", emoji: '👵' },
    { id: 'paani', native: 'ਪਾਣੀ', roman: 'paani', en: 'water', emoji: '💧' },
    { id: 'roti', native: 'ਰੋਟੀ', roman: 'roti', en: 'flatbread', emoji: '🫓' },
    { id: 'duddh', native: 'ਦੁੱਧ', roman: 'duddh', en: 'milk', emoji: '🥛' },
    { id: 'chaah', native: 'ਚਾਹ', roman: 'chaah', en: 'tea', emoji: '🍵' },
    { id: 'lassi', native: 'ਲੱਸੀ', roman: 'lassi', en: 'lassi (yogurt drink)', emoji: '🥤' },
    { id: 'l-ura', native: 'ੳ', roman: 'oora', en: 'oora (vowel carrier)', kind: 'letter' },
    { id: 'l-aira', native: 'ਅ', roman: 'aira', en: 'aira (vowel carrier)', kind: 'letter' },
    { id: 'l-ka', native: 'ਕ', roman: 'kakka', en: 'ka', kind: 'letter' },
    { id: 'l-ma', native: 'ਮ', roman: 'mamma', en: 'ma', kind: 'letter' },
    { id: 'l-na', native: 'ਨ', roman: 'nanna', en: 'na', kind: 'letter' },
  ],
  units: [
    {
      id: 'pa-u1',
      title: 'Say hello to family',
      description: 'Greetings for gurdwara, weddings and video calls',
      lessons: [
        {
          id: 'pa-u1-l1',
          title: 'Greetings',
          words: ['ssa', 'dhannvaad', 'haan', 'nahin'],
          sentences: [],
        },
        {
          id: 'pa-u1-l2',
          title: 'Family',
          words: ['maan', 'pita', 'daadi', 'naani'],
          sentences: [
            { native: ['ਮੈਂ', 'ਠੀਕ', 'ਹਾਂ'], roman: 'main theek haan', en: ['I', 'am', 'fine'] },
          ],
        },
        {
          id: 'pa-u1-l3',
          title: 'How are you?',
          words: ['main', 'tusin', 'ssa', 'dhannvaad'],
          sentences: [
            { native: ['ਤੁਸੀਂ', 'ਕਿਵੇਂ', 'ਹੋ'], roman: 'tusin kiven ho', en: ['how', 'are', 'you'] },
            { native: ['ਮੈਂ', 'ਠੀਕ', 'ਹਾਂ'], roman: 'main theek haan', en: ['I', 'am', 'fine'] },
          ],
        },
      ],
    },
    {
      id: 'pa-u2',
      title: 'Food & drink',
      description: 'From roti to lassi',
      lessons: [
        {
          id: 'pa-u2-l1',
          title: 'Kitchen',
          words: ['paani', 'roti', 'duddh', 'chaah', 'lassi'],
          sentences: [
            { native: ['ਮੈਨੂੰ', 'ਚਾਹ', 'ਪਸੰਦ', 'ਹੈ'], roman: 'mainu chaah pasand hai', en: ['I', 'like', 'tea'] },
          ],
        },
      ],
    },
    {
      id: 'pa-u3',
      title: 'Read Gurmukhi',
      description: 'The first letters of the ਪੈਂਤੀ (paintee)',
      lessons: [
        { id: 'pa-u3-l1', title: 'First letters', words: ['l-ura', 'l-aira', 'l-ka', 'l-ma', 'l-na'], sentences: [] },
      ],
    },
  ],
};

const tamil: Course = {
  code: 'ta',
  name: 'Tamil',
  nativeName: 'தமிழ்',
  ttsLang: 'ta-IN',
  speakers: '80M+ speakers',
  words: [
    { id: 'vanakkam', native: 'வணக்கம்', roman: 'vanakkam', en: 'hello', emoji: '🙏' },
    { id: 'nandri', native: 'நன்றி', roman: 'nandri', en: 'thank you', emoji: '💐' },
    { id: 'aam', native: 'ஆம்', roman: 'aam', en: 'yes', emoji: '👍' },
    { id: 'illai', native: 'இல்லை', roman: 'illai', en: 'no', emoji: '🙅' },
    { id: 'naan', native: 'நான்', roman: 'naan', en: 'I', emoji: '🙋' },
    { id: 'neengal', native: 'நீங்கள்', roman: 'neengal', en: 'you (respectful)', emoji: '🫵' },
    { id: 'amma', native: 'அம்மா', roman: 'amma', en: 'mother', emoji: '👩' },
    { id: 'appa', native: 'அப்பா', roman: 'appa', en: 'father', emoji: '👨' },
    { id: 'paatti', native: 'பாட்டி', roman: 'paatti', en: 'grandmother', emoji: '👵' },
    { id: 'thaatha', native: 'தாத்தா', roman: 'thaatha', en: 'grandfather', emoji: '👴' },
    { id: 'thanneer', native: 'தண்ணீர்', roman: 'thanneer', en: 'water', emoji: '💧' },
    { id: 'saappaadu', native: 'சாப்பாடு', roman: 'saappaadu', en: 'meal', emoji: '🍛' },
    { id: 'paal', native: 'பால்', roman: 'paal', en: 'milk', emoji: '🥛' },
    { id: 'kaapi', native: 'காபி', roman: 'kaapi', en: 'coffee', emoji: '☕' },
    { id: 'idli', native: 'இட்லி', roman: 'idli', en: 'idli (rice cake)', emoji: '🍚' },
    { id: 'l-a', native: 'அ', roman: 'a', en: 'a', kind: 'letter' },
    { id: 'l-aa', native: 'ஆ', roman: 'aa', en: 'aa', kind: 'letter' },
    { id: 'l-i', native: 'இ', roman: 'i', en: 'i', kind: 'letter' },
    { id: 'l-ka', native: 'க', roman: 'ka', en: 'ka', kind: 'letter' },
    { id: 'l-ma', native: 'ம', roman: 'ma', en: 'ma', kind: 'letter' },
  ],
  units: [
    {
      id: 'ta-u1',
      title: 'Say hello to family',
      description: 'Greet amma, appa and paatti',
      lessons: [
        { id: 'ta-u1-l1', title: 'Greetings', words: ['vanakkam', 'nandri', 'aam', 'illai'], sentences: [] },
        {
          id: 'ta-u1-l2',
          title: 'Family',
          words: ['amma', 'appa', 'paatti', 'thaatha'],
          sentences: [
            { native: ['வணக்கம்', 'பாட்டி'], roman: 'vanakkam paatti', en: ['hello', 'grandmother'] },
          ],
        },
        {
          id: 'ta-u1-l3',
          title: 'How are you?',
          words: ['naan', 'neengal', 'vanakkam', 'nandri'],
          sentences: [
            {
              native: ['நீங்கள்', 'எப்படி', 'இருக்கிறீர்கள்'],
              roman: 'neengal eppadi irukkireergal',
              en: ['how', 'are', 'you'],
            },
            { native: ['நான்', 'நலமாக', 'இருக்கிறேன்'], roman: 'naan nalamaaga irukkiren', en: ['I', 'am', 'fine'] },
          ],
        },
      ],
    },
    {
      id: 'ta-u2',
      title: 'Breakfast',
      description: 'Idli, coffee and more',
      lessons: [
        {
          id: 'ta-u2-l1',
          title: 'Breakfast',
          words: ['thanneer', 'saappaadu', 'paal', 'kaapi', 'idli'],
          sentences: [
            { native: ['எனக்கு', 'காபி', 'பிடிக்கும்'], roman: 'enakku kaapi pidikkum', en: ['I', 'like', 'coffee'] },
          ],
        },
      ],
    },
    {
      id: 'ta-u3',
      title: 'Read Tamil script',
      description: 'Your first uyir (vowel) and mei (consonant) letters',
      lessons: [{ id: 'ta-u3-l1', title: 'First letters', words: ['l-a', 'l-aa', 'l-i', 'l-ka', 'l-ma'], sentences: [] }],
    },
  ],
};

export const COURSES: Course[] = [hindi, punjabi, tamil];

export function getCourse(code: string): Course {
  const course = COURSES.find((c) => c.code === code);
  if (!course) throw new Error(`Unknown course: ${code}`);
  return course;
}

/** Extra English tiles used as wrong options in sentence building. */
export const EN_DISTRACTORS = ['is', 'we', 'water', 'no', 'eat', 'they', 'my', 'go'];
