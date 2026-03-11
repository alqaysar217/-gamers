import type { ElementType } from 'react';
import {
  Users,
  Briefcase,
  Hourglass,
  Clock,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  XCircle,
  Timer,
  TrendingDown,
  Minus,
  TrendingUp,
  HelpCircle,
  Trophy,
  Bed,
  BrainCircuit,
  CalendarDays,
  Venus,
  Mars,
  Sparkles,
  GraduationCap,
  Home,
  Repeat,
  Repeat1,
  History,
  Feather,
  Meh,
  Gamepad2,
} from 'lucide-react';

export type SurveyOption = {
  text: string;
  icon: ElementType;
  points: number; 
};

export type SurveyQuestion = {
  id: number;
  question: string;
  icon: ElementType;
  options: SurveyOption[];
};

export const surveyQuestions: SurveyQuestion[] = [
  {
    id: 1,
    question: 'كم عمرك؟',
    icon: CalendarDays,
    options: [
      { text: 'أقل من 18 سنة', icon: Sparkles, points: 4 },
      { text: 'من 18 إلى 25 سنة', icon: GraduationCap, points: 4 },
      { text: 'من 26 إلى 30 سنة', icon: Briefcase, points: 4 },
      { text: 'أكثر من 30 سنة', icon: Home, points: 4 },
    ],
  },
  {
    id: 2,
    question: 'ما جنسك؟',
    icon: Users,
    options: [
      { text: 'ذكر', icon: Mars, points: 4 },
      { text: 'أنثى', icon: Venus, points: 4 },
    ],
  },
  {
    id: 3,
    question: 'كم ساعة تقضي عادة في لعب الألعاب الإلكترونية يومياً؟',
    icon: Clock,
    options: [
      { text: 'أقل من ساعة', icon: Timer, points: 4 },
      { text: 'من ساعة إلى ساعتين', icon: Gamepad2, points: 4 },
      { text: 'من 3 إلى 4 ساعات', icon: Hourglass, points: 4 },
      { text: 'أكثر من 4 ساعات', icon: Clock, points: 4 },
    ],
  },
  {
    id: 4,
    question: 'في أي وقت غالباً تمارس الألعاب الإلكترونية؟',
    icon: Gamepad2,
    options: [
      { text: 'في الصباح', icon: Sunrise, points: 4 },
      { text: 'في فترة الظهيرة', icon: Sun, points: 4 },
      { text: 'في المساء', icon: Sunset, points: 4 },
      { text: 'في وقت متأخر من الليل', icon: Moon, points: 4 },
    ],
  },
  {
    id: 5,
    question: 'هل تمارس الألعاب الإلكترونية قبل النوم مباشرة؟',
    icon: Bed,
    options: [
      { text: 'نعم دائماً', icon: Repeat, points: 4 },
      { text: 'أحياناً', icon: Repeat1, points: 4 },
      { text: 'نادراً', icon: History, points: 4 },
      { text: 'لا', icon: XCircle, points: 4 },
    ],
  },
  {
    id: 6,
    question: 'كم من الوقت تقضي عادة في اللعب قبل النوم؟',
    icon: Timer,
    options: [
      { text: 'أقل من 30 دقيقة', icon: Timer, points: 4 },
      { text: 'من 30 دقيقة إلى ساعة', icon: Hourglass, points: 4 },
      { text: 'من ساعة إلى ساعتين', icon: Clock, points: 4 },
      { text: 'أكثر من ساعتين', icon: Bed, points: 4 },
    ],
  },
  {
    id: 7,
    question: 'هل تشعر أن اللعب قبل النوم يؤثر على جودة نومك؟',
    icon: TrendingDown,
    options: [
      { text: 'نعم يؤثر بشكل كبير', icon: TrendingDown, points: 4 },
      { text: 'يؤثر إلى حد ما', icon: Minus, points: 4 },
      { text: 'لا يؤثر', icon: TrendingUp, points: 4 },
      { text: 'لست متأكداً', icon: HelpCircle, points: 4 },
    ],
  },
  {
    id: 8,
    question: 'ما الدافع الرئيسي الذي يجعلك تمارس الألعاب قبل النوم؟',
    icon: BrainCircuit,
    options: [
        { text: 'لتخفيف التوتر بعد يوم طويل', icon: Feather, points: 4 },
        { text: 'لأنه الوقت الوحيد المتاح', icon: CalendarDays, points: 4 },
        { text: 'للعب والتواصل مع الأصدقاء', icon: Users, points: 4 },
        { text: 'بسبب الشعور بالملل', icon: Meh, points: 4 },
        { text: 'لرغبتي في إكمال مرحلة أو مهمة داخل اللعبة', icon: Trophy, points: 4 },
    ],
  },
];
