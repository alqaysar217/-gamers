'use client';

import { useState, useMemo } from 'react';
import type { ChallengeQuestion, ChallengeOption } from '@/lib/challenge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, RefreshCcw, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';

type OrderingChallengeStageProps = {
    question: ChallengeQuestion;
    onAnswer: (option: ChallengeOption) => void;
    onNext: () => void;
    isLastQuestion: boolean;
};

export default function OrderingChallengeStage({ question, onAnswer, onNext, isLastQuestion }: OrderingChallengeStageProps) {
    const { solution, items } = useMemo(() => {
        const solutionString = question.options.find(o => o.isCorrect)?.text || '';
        const solutionArray = solutionString.split(' > ');
        // Shuffle items for display
        const shuffledItems = [...solutionArray].sort(() => Math.random() - 0.5);
        return { solution: solutionArray, items: shuffledItems };
    }, [question]);

    const [playerOrder, setPlayerOrder] = useState<string[]>([]);
    const [isAnswered, setIsAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    const handleSelect = (item: string) => {
        if (isAnswered || playerOrder.includes(item)) return;
        setPlayerOrder(prev => [...prev, item]);
    };
    
    const handleReset = () => {
        if (isAnswered) return;
        setPlayerOrder([]);
    }

    const checkAnswer = () => {
        if (isAnswered) return;
        const correct = JSON.stringify(playerOrder) === JSON.stringify(solution);
        setIsCorrect(correct);
        setIsAnswered(true);
        onAnswer({ text: playerOrder.join(' > '), isCorrect: correct });
    };

    const allItemsSelected = playerOrder.length === items.length;

    return (
        <div className="w-full text-center flex flex-col items-center">
            <h2 className="font-headline font-bold text-3xl sm:text-4xl mb-4">{question.question}</h2>
            <p className="text-muted-foreground mb-8">اضغط على الخيارات بالترتيب الصحيح.</p>

            {/* User's selection */}
            <Card className="w-full max-w-2xl mb-6 bg-muted/30">
                <CardContent className="p-4 min-h-[120px] flex flex-wrap items-center justify-center gap-3">
                    {playerOrder.length === 0 && !isAnswered && (
                        <p className="text-muted-foreground">سيبدأ ترتيبك هنا...</p>
                    )}
                    {playerOrder.map((item, index) => (
                        <Badge
                          key={index}
                          variant={isAnswered ? (isCorrect ? 'default' : 'destructive') : 'secondary'}
                          className={cn("p-3 text-lg scale-100 animate-in fade-in zoom-in-50", isAnswered && 'border-2', isCorrect && 'border-green-500 bg-green-500/20', !isCorrect && 'border-destructive bg-destructive/20')}
                        >
                           <span className={cn("text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center ml-2", isAnswered && isCorrect ? 'bg-green-600' : 'bg-primary')}>{index + 1}</span>
                           {item}
                        </Badge>
                    ))}
                    {isAnswered && (
                        <div className="w-full text-center mt-4">
                            {isCorrect ? (
                                <p className="font-bold text-green-500 flex items-center justify-center gap-2">
                                    <Check className="w-6 h-6" /> إجابة صحيحة!
                                </p>
                            ) : (
                                <>
                                 <p className="font-bold text-destructive flex items-center justify-center gap-2">
                                    <X className="w-6 h-6" /> إجابة خاطئة.
                                </p>
                                <p className="text-muted-foreground mt-2">الترتيب الصحيح هو:</p>
                                <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                                {solution.map((item, index) => (
                                     <Badge key={index} variant="secondary" className="p-2 text-md">
                                        <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs ml-2">{index + 1}</span>
                                        {item}
                                     </Badge>
                                ))}
                                </div>
                                </>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Available options */}
            <div className="w-full max-w-2xl mb-6">
                <h3 className="font-bold text-lg mb-4 text-primary">الخيارات المتاحة</h3>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {items.map(item => (
                        <Button
                            key={item}
                            variant="outline"
                            size="lg"
                            className="h-auto py-3 text-md justify-center"
                            onClick={() => handleSelect(item)}
                            disabled={isAnswered || playerOrder.includes(item)}
                        >
                            {item}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex w-full max-w-md justify-center gap-4">
                {!isAnswered && (
                    <>
                        <Button onClick={handleReset} variant="destructive" size="lg" disabled={playerOrder.length === 0}>
                            <RefreshCcw className="h-5 w-5" />
                            إعادة
                        </Button>
                        <Button onClick={checkAnswer} size="lg" disabled={!allItemsSelected} className="flex-1">
                            <Check className="h-5 w-5" />
                            تأكيد الإجابة
                        </Button>
                    </>
                )}
                {isAnswered && (
                    <Button onClick={onNext} size="lg" className="flex-1 shadow-md hover:shadow-primary/50 animate-in fade-in">
                        <ArrowLeft className="h-5 w-5" />
                        {isLastQuestion ? 'إنهاء وعرض النتيجة' : 'التالي'}
                    </Button>
                )}
            </div>
        </div>
    );
}
