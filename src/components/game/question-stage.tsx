'use client';

import { useState } from 'react';
import { SurveyQuestion, SurveyOption } from '@/lib/survey';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type QuestionStageProps = {
  question: SurveyQuestion;
  onAnswer: (option: SurveyOption, question: SurveyQuestion) => void;
  playerName: string;
};

function OptionCard({ option, onClick, isSelected }: { option: SurveyOption, onClick: () => void, isSelected: boolean }) {
  const Icon = option.icon;
  return (
    <Card
      onClick={onClick}
      className={cn(
        "cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-primary/30",
        "bg-card/50 border-2",
        isSelected ? "border-primary scale-105 bg-primary/20 shadow-lg shadow-primary/30" : "border-transparent hover:border-primary/50"
      )}
    >
      <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-3">
        <div className="p-3 bg-primary/10 rounded-full">
           <Icon className="w-8 h-8 text-primary" />
        </div>
        <p className="font-bold text-foreground text-md sm:text-lg">{option.text}</p>
      </CardContent>
    </Card>
  );
}


export default function QuestionStage({ question, onAnswer, playerName }: QuestionStageProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (option: SurveyOption) => {
    if (selected) return;
    setSelected(option.text);
    onAnswer(option, question);
  };
  
  const gridCols = question.options.length === 2 
    ? 'grid-cols-2' 
    : question.options.length === 5
    ? 'grid-cols-2 md:grid-cols-3'
    : 'grid-cols-2';

  // Personalize question text with more variety
  const personalizedQuestionText = () => {
    switch (question.id) {
      case 1:
        return `أهلاً بك يا ${playerName}! ${question.question}`;
      case 2:
        return question.question; // No personalization for gender question
      case 3:
        return `جميل. والآن يا ${playerName}، ${question.question}`;
      case 4:
        return `تمام يا ${playerName}، ${question.question}`;
      case 5:
        return `أجب بصراحة، ${question.question}`;
      case 6:
        return `مثير للاهتمام، ${question.question}`;
      case 7:
        return `شارفنا على الانتهاء يا ${playerName}. ${question.question}`;
      case 8:
        return `وهذا هو السؤال الأخير: ${question.question}`;
      default:
        return `حسنًا يا ${playerName}، ${question.question}`;
    }
  };

  return (
    <div className="w-full text-center">
      <h2 className="font-headline font-bold text-3xl sm:text-4xl mb-8">{personalizedQuestionText()}</h2>
      <div className={cn("grid gap-4 md:gap-6", gridCols, question.options.length === 5 && 'lg:[&>*:last-child]:col-span-2 lg:[&>*:last-child]:md:col-span-1')}>
        {question.options.map((option) => (
          <OptionCard
            key={option.text}
            option={option}
            onClick={() => handleSelect(option)}
            isSelected={selected === option.text}
          />
        ))}
      </div>
    </div>
  );
}
