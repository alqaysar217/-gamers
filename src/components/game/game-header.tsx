'use client';

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Star, User } from "lucide-react";
import Logo from '@/components/game/logo';

type GameHeaderProps = {
  current: number;
  total: number;
  score: number;
  playerName: string;
  title: string;
  onLogoClick: () => void;
};

export default function GameHeader({ current, total, score, playerName, title, onLogoClick }: GameHeaderProps) {
  const progressValue = (current / total) * 100;

  return (
    <div className="sticky top-0 z-10 w-full bg-background/95 backdrop-blur-sm pt-4 pb-8">
       <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3 text-lg font-bold text-primary">
          <Logo className="w-8 h-8 rounded-full" onClick={onLogoClick} />
          <span className="font-headline font-bold text-2xl">{title}</span>
        </div>
        <Badge variant="secondary" className="text-md py-1 px-3">
          <User className="w-4 h-4 ml-2" />
          {playerName}
        </Badge>
      </div>
      <div className="flex justify-between items-center mb-2 text-foreground/80">
        <p className="font-headline font-bold">السؤال {current} من {total}</p>
        <Badge variant="outline" className="text-lg py-1 px-4 border-accent text-accent">
          <Star className="w-4 h-4 ml-2 fill-accent" />
          {score} نقطة
        </Badge>
      </div>
      <Progress value={progressValue} className="w-full h-3 [&>*]:bg-primary" />
    </div>
  );
}
