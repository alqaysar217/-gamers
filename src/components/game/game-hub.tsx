'use client';

import type { ChallengeQuestion } from "@/lib/challenge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Trophy, RotateCw } from "lucide-react";
import Logo from '@/components/game/logo';
import GameMenu from "@/components/game/game-menu";

type GameHubProps = {
    playerName: string;
    finalScore: number;
    completedChallenges: string[];
    onSelectGame: (questions: ChallengeQuestion[], gameTitle: string) => void;
    onShowLeaderboard: () => void;
    onRestart: () => void;
    onLogoClick: () => void;
};

export default function GameHub({ playerName, finalScore, completedChallenges, onSelectGame, onShowLeaderboard, onRestart, onLogoClick }: GameHubProps) {
    return (
        <div className="w-full h-screen flex flex-col bg-background">
            {/* Header */}
            <header className="sticky top-0 z-10 w-full bg-background/95 backdrop-blur-sm p-4 border-b">
                 <div className="max-w-3xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3 text-lg font-bold text-primary">
                      <Logo className="w-8 h-8 rounded-full" onClick={onLogoClick} />
                      <span className="font-headline font-bold text-2xl">قيمرز</span>
                    </div>
                    <Badge variant="secondary" className="text-md py-1 px-3">
                      <User className="w-4 h-4 ml-2" />
                      {playerName}
                    </Badge>
                  </div>
            </header>

            {/* Main Content (GameMenu) */}
            <main className="flex-grow overflow-y-auto">
                <GameMenu 
                    onSelectGame={onSelectGame}
                    completedChallenges={completedChallenges}
                />
            </main>

            {/* Footer */}
            <footer className="sticky bottom-0 z-10 w-full bg-background/95 backdrop-blur-sm p-2 border-t">
                <div className="max-w-md mx-auto grid grid-cols-4 items-center text-center">
                     <div className="flex flex-col items-center">
                        <p className="font-bold text-lg text-primary">{finalScore}</p>
                        <p className="text-xs text-muted-foreground">النقاط</p>
                    </div>
                     <div className="flex flex-col items-center">
                        <p className="font-bold text-lg">{completedChallenges.length} / 4</p>
                        <p className="text-xs text-muted-foreground">التحديات</p>
                    </div>
                    <Button variant="ghost" onClick={onShowLeaderboard} className="flex flex-col h-auto p-1">
                        <Trophy className="h-6 w-6" />
                        <span className="text-xs">المتصدرون</span>
                    </Button>
                     <Button variant="ghost" onClick={onRestart} className="flex flex-col h-auto p-1">
                        <RotateCw className="h-6 w-6" />
                        <span className="text-xs">إعادة اللعب</span>
                    </Button>
                </div>
            </footer>
        </div>
    );
}
