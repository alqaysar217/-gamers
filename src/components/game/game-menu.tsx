'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ChallengeQuestion } from "@/lib/challenge";
import { generalKnowledgeChallenge, trueOrFalseChallenge, guessTheGameChallenge, orderingChallenge } from "@/lib/challenge";
import { BrainCircuit, Check, HelpCircle, ListOrdered, Play, CheckCircle2 } from "lucide-react";

type GameMenuProps = {
    onSelectGame: (questions: ChallengeQuestion[], gameTitle: string) => void;
    completedChallenges: string[];
};

const gameTypes = [
    {
        title: "معلومات عامة",
        description: "اختبر معرفتك بعالم الألعاب.",
        questions: generalKnowledgeChallenge,
        icon: BrainCircuit,
    },
    {
        title: "صحيح أم خطأ",
        description: "هل يمكنك تمييز الحقيقة من الخيال؟",
        questions: trueOrFalseChallenge,
        icon: Check,
    },
    {
        title: "احزر اللعبة",
        description: "هل يمكنك معرفة اللعبة من الوصف؟",
        questions: guessTheGameChallenge,
        icon: HelpCircle,
    },
    {
        title: "رتبها صح!",
        description: "ضع الأحداث والألعاب في ترتيبها الزمني.",
        questions: orderingChallenge,
        icon: ListOrdered,
    },
];


export default function GameMenu({ onSelectGame, completedChallenges }: GameMenuProps) {

    return (
        <div className="w-full max-w-lg mx-auto text-center p-4 sm:p-6 flex flex-col items-center">
            <h1 className="font-headline font-bold text-4xl md:text-5xl mb-2 text-primary">اختر تحدياً</h1>
            <p className="text-muted-foreground text-md md:text-lg mb-8">أكملت الاستبيان بنجاح! الآن اختر إحدى الألعاب الممتعة لجمع المزيد من النقاط.</p>
            
            <div className="grid grid-cols-1 gap-4 w-full">
                {gameTypes.map((game) => {
                    const isCompleted = completedChallenges.includes(game.title);
                    return (
                        <Card 
                            key={game.title} 
                            className={cn(
                                "text-right transition-all transform",
                                isCompleted ? "bg-muted/50" : "hover:border-primary hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                            )}
                            onClick={() => !isCompleted && onSelectGame(game.questions, game.title)}
                        >
                            <CardContent className="p-4 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "p-3 rounded-full",
                                        isCompleted ? "bg-green-100 dark:bg-green-900/50" : "bg-primary/10"
                                    )}>
                                        <game.icon className={cn("w-6 h-6", isCompleted ? "text-green-600 dark:text-green-400" : "text-primary")} />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">{game.title}</CardTitle>
                                        <CardDescription className="text-sm">{game.description}</CardDescription>
                                    </div>
                                </div>
                                {isCompleted ? (
                                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                        <CheckCircle2 className="w-6 h-6" />
                                        <span className="font-bold text-sm">مكتمل</span>
                                    </div>
                                ) : (
                                    <Play className="w-6 h-6 text-muted-foreground" />
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};
