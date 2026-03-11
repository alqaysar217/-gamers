export type ChallengeOption = {
  text: string;
  isCorrect: boolean;
  answered?: string; // For ordering challenge
};

export type ChallengeQuestion = {
  id: number;
  question: string;
  options: ChallengeOption[];
  points: number;
  image?: keyof typeof import('./placeholder-images.json');
};

export const generalKnowledgeChallenge: ChallengeQuestion[] = [
  {
    id: 1,
    question: 'أي سلاح مشهور في ببجي؟',
    options: [
      { text: 'AK-47', isCorrect: false },
      { text: 'UMP45', isCorrect: false },
      { text: 'M416', isCorrect: true },
      { text: 'سكار', isCorrect: false },
    ],
    points: 20,
  },
  {
    id: 2,
    question: 'أي شخصية مشهورة في فورتنايت؟',
    options: [
      { text: 'لارا كروفت', isCorrect: false },
      { text: 'جونزي', isCorrect: true },
      { text: 'ماستر تشيف', isCorrect: false },
      { text: 'ماريو', isCorrect: false },
    ],
    points: 20,
  },
  {
    id: 3,
    question: 'أي لعبة من الألعاب التالية تعتمد على القتال الملكي؟',
    options: [
      { text: 'فيفا', isCorrect: false },
      { text: 'جاتا', isCorrect: false },
      { text: 'ماين كرافت', isCorrect: false },
      { text: 'فورتنايت', isCorrect: true },
    ],
    points: 20,
  },
  {
    id: 4,
    question: 'أي لعبة تحتوي على طور اللعب الجماعي عبر الإنترنت مع فرق؟',
    options: [
      { text: 'كول أوف ديوتي', isCorrect: true },
      { text: 'تيتريس', isCorrect: false },
      { text: 'سوليتير', isCorrect: false },
      { text: 'أنجري بيردز', isCorrect: false },
    ],
    points: 20,
  },
  {
    id: 5,
    question: 'أي لعبة متاحة على كل من الكمبيوتر والجوال والكونسول؟',
    options: [
      { text: 'كاندي كراش', isCorrect: false },
      { text: 'فورتنايت', isCorrect: true },
      { text: 'أمونج أس', isCorrect: false },
      { text: 'صب واي سيرفرس', isCorrect: false },
    ],
    points: 20,
  },
];


export const trueOrFalseChallenge: ChallengeQuestion[] = [
  {
    id: 1,
    question: 'في فورتنايت يمكن بناء المباني أثناء القتال.',
    options: [
      { text: 'خطأ', isCorrect: false },
      { text: 'صح', isCorrect: true },
    ],
    points: 15,
  },
  {
    id: 2,
    question: 'ببجي موبايل متاحة على جميع أجهزة الجوال.',
    options: [
      { text: 'خطأ', isCorrect: false },
      { text: 'صح', isCorrect: true },
    ],
    points: 15,
  },
  {
    id: 3,
    question: 'في فيفا، يمكنك اللعب فقط بشكل فردي ولا يمكن اللعب مع الأصدقاء.',
    options: [
      { text: 'صح', isCorrect: false },
      { text: 'خطأ', isCorrect: true },
    ],
    points: 15,
  },
  {
    id: 4,
    question: 'في جاتا يمكن شراء الأسلحة داخل المتاجر داخل اللعبة.',
    options: [
      { text: 'خطأ', isCorrect: false },
      { text: 'صح', isCorrect: true },
    ],
    points: 15,
  },
  {
    id: 5,
    question: 'أبيكس ليجندز هي لعبة استراتيجية تعتمد على بناء القواعد وليس القتال.',
    options: [
      { text: 'خطأ', isCorrect: true },
      { text: 'صح', isCorrect: false },
    ],
    points: 15,
  },
];


export const guessTheGameChallenge: ChallengeQuestion[] = [
    {
      id: 1,
      question: 'ما اسم اللعبة التي تظهر فيها هذه الشخصية؟',
      image: 'guessFortnite',
      options: [
        { text: 'ببجي', isCorrect: false },
        { text: 'فورتنايت', isCorrect: true },
        { text: 'جاتا', isCorrect: false },
        { text: 'ماين كرافت', isCorrect: false },
      ],
      points: 25,
    },
    {
        id: 2,
        question: 'ما اسم اللعبة التي تبدأ بالهبوط من هذه الطائرة؟',
        image: 'guessPubg',
        options: [
          { text: 'كول أوف ديوتي', isCorrect: false },
          { text: 'ببجي', isCorrect: true },
          { text: 'فري فاير', isCorrect: false },
          { text: 'أبيكس ليجندز', isCorrect: false },
        ],
        points: 25,
      },
      {
        id: 3,
        question: 'إلى أي لعبة تنتمي هذه الشخصية؟',
        image: 'guessApex',
        options: [
          { text: 'فالورانت', isCorrect: false },
          { text: 'أوفرواتش', isCorrect: false },
          { text: 'أبيكس ليجندز', isCorrect: true },
          { text: 'فورتنايت', isCorrect: false },
        ],
        points: 25,
      },
      {
        id: 4,
        question: 'في أي لعبة يمكنك قيادة السيارات في مدينة كهذه؟',
        image: 'guessGta',
        options: [
          { text: 'نيد فور سبيد', isCorrect: false },
          { text: 'واتش دوجز', isCorrect: false },
          { text: 'مافيا', isCorrect: false },
          { text: 'جاتا', isCorrect: true },
        ],
        points: 25,
      },
      {
        id: 5,
        question: 'ما اسم لعبة كرة القدم الشهيرة هذه؟',
        image: 'guessFifa',
        options: [
          { text: 'بيس', isCorrect: false },
          { text: 'فيفا', isCorrect: true },
          { text: 'إن بي إيه 2 كي', isCorrect: false },
          { text: 'روكيت ليغ', isCorrect: false },
        ],
        points: 25,
      },
];

// For this challenge, the `options` array contains ONE correct option.
// The text of that option is a string of items separated by ' > '.
// The OrderingChallengeStage component will parse this string to create the interactive game.
export const orderingChallenge: ChallengeQuestion[] = [
    {
      id: 1,
      question: 'رتب مراحل لعبة ببجي من البداية إلى النهاية:',
      options: [
        { text: 'الهبوط > البحث عن الأسلحة > القتال > البقاء على قيد الحياة', isCorrect: true },
      ],
      points: 30,
    },
    {
        id: 2,
        question: 'رتب مستويات شخصية فورتنايت (الافتراضية):',
        options: [
            { text: 'مبتدئ > محترف > أسطورة', isCorrect: true },
        ],
        points: 30,
    },
    {
        id: 3,
        question: 'رتب أسلحة جاتا حسب الضرر (من الأقل إلى الأعلى):',
        options: [
          { text: 'مسدس > رشاش > قناص > RPG', isCorrect: true },
        ],
        points: 30,
      },
      {
        id: 4,
        question: 'رتب خطوات إعداد فريق في كول أوف ديوتي:',
        options: [
          { text: 'اختيار اللاعبين > اختيار الخريطة > تجهيز المعدات > بدء المباراة', isCorrect: true },
        ],
        points: 30,
      },
      {
        id: 5,
        question: 'رتب أحداث مباراة في فيفا:',
        options: [
          { text: 'الاستعداد > الركلة الحرة > تسجيل الهدف > نهاية المباراة', isCorrect: true },
        ],
        points: 30,
      }
];
