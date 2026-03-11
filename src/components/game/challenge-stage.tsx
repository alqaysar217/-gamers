'use client';

import { useState } from 'react';
import type { ChallengeQuestion, ChallengeOption } from '@/lib/challenge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import placeholderImages from '@/lib/placeholder-images.json';

type ChallengeStageProps = {
    question: ChallengeQuestion;
    onAnswer: (option: ChallengeOption) => void;
    onNext: () => void;
    onPrevious: () => void;
    isLastQuestion: boolean;
    isFirstQuestion: boolean;
    userAnswer: ChallengeOption | null;
};


function OptionCard({ option, onClick, isSelected, reveal }: { option: ChallengeOption, onClick: () => void, isSelected: boolean, reveal: boolean }) {
    const isCorrect = option.isCorrect;
  
    return (
      <Card
        onClick={onClick}
        className={cn(
          "transition-all duration-300 transform",
          !reveal && "cursor-pointer hover:scale-105 hover:shadow-lg hover:shadow-primary/20",
          "bg-card/50 border-2",
          isSelected && !reveal && "border-primary scale-105 bg-primary/20",
          reveal && isCorrect && "border-green-500 bg-green-500/20 text-green-300 shadow-lg shadow-green-500/20",
          reveal && !isCorrect && isSelected && "border-destructive bg-destructive/20 text-destructive-foreground",
          !isSelected && reveal && "opacity-50"
        )}
      >
        <CardContent className="p-4 flex items-center justify-center text-center min-h-[80px]">
          <p className="font-bold text-md sm:text-lg">{option.text}</p>
        </CardContent>
      </Card>
    );
  }

export default function ChallengeStage({ question, onAnswer, onNext, onPrevious, isLastQuestion, isFirstQuestion, userAnswer }: ChallengeStageProps) {
  const [selectedOption, setSelectedOption] = useState<ChallengeOption | null>(userAnswer);
  const [isAnswered, setIsAnswered] = useState(!!userAnswer);

  const handleSelect = (option: ChallengeOption) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);
    onAnswer(option);
  };

  const questionImage = question.image ? (placeholderImages as Record<string, any>)[question.image] : null;
  
  return (
    <div className="w-full text-center flex flex-col items-center">
      {questionImage && (
        <Card className="mb-6 w-full max-w-lg overflow-hidden border-2 border-primary/20 shadow-lg">
          <Image
            src={questionImage.src}
            alt={question.question}
            width={questionImage.width}
            height={questionImage.height}
            className="w-full h-auto object-cover"
            data-ai-hint={questionImage.hint}
            priority
          />
        </Card>
      )}
      <h2 className="font-headline font-bold text-3xl sm:text-4xl mb-8">{question.question}</h2>
      <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl")}>
        {question.options.map((option) => (
          <OptionCard
            key={option.text}
            option={option}
            onClick={() => handleSelect(option)}
            isSelected={selectedOption?.text === option.text}
            reveal={isAnswered}
          />
        ))}
      </div>
      {isAnswered && (
        <div className="mt-8 flex w-full max-w-md justify-center gap-4 animate-in fade-in duration-500">
            {/* Previous Button (renders on the right in RTL) */}
            {!isFirstQuestion && (
                <Button onClick={onPrevious} variant="outline" size="lg" className="flex-1">
                    السابق
                    <ArrowRight className="h-5 w-5" />
                </Button>
            )}
            {/* Next Button (renders on the left in RTL) */}
            <Button onClick={onNext} size="lg" className="flex-1 shadow-md hover:shadow-primary/50">
                <ArrowLeft className="h-5 w-5" />
                {isLastQuestion ? 'إنهاء وعرض النتيجة' : 'التالي'}
            </Button>
        </div>
      )}
    </div>
  );
}
