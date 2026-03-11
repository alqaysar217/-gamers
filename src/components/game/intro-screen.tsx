'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Trophy } from "lucide-react";
import { Input } from '@/components/ui/input';
import Logo from '@/components/game/logo';

type IntroScreenProps = {
  onStart: (name: string) => void;
  onShowLeaderboard: () => void;
  onLogoClick: () => void;
};

export default function IntroScreen({ onStart, onShowLeaderboard, onLogoClick }: IntroScreenProps) {
  const [name, setName] = useState('');

  const handleStart = () => {
    if (name.trim()) {
      onStart(name.trim());
    }
  }

  return (
    <div className="flex flex-col items-center justify-center text-center animate-in fade-in-0 zoom-in-95 duration-500">
      <Card className="w-full max-w-lg border-primary/20 shadow-xl shadow-primary/10">
        <CardHeader className="items-center p-8 pb-4">
          <div className="p-2 bg-primary/10 rounded-full mb-4">
            <Logo className="w-16 h-16 rounded-full" onClick={onLogoClick} />
          </div>
          <CardTitle className="font-headline text-6xl sm:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-primary via-fuchsia-400 to-accent py-2">
            قيمرز
          </CardTitle>
          <CardDescription className="text-lg text-foreground/80 mt-2 max-w-sm">
            مغامرة سريعة من 8 أسئلة تكشف عاداتك في اللعب ليلاً. هل أنت مستعد؟
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 p-8 pt-4">
          <div className="p-3 bg-primary/10 rounded-lg border-r-4 border-primary text-right">
            <p className="text-sm text-foreground/90 font-semibold">
              يرجى الإجابة على الأسئلة التالية لبناء ملفك الشخصي. إجاباتك ضرورية قبل البدء في التحديات.
            </p>
          </div>
          <Input 
            type="text"
            placeholder="اكتب اسمك هنا..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-center text-lg h-12"
            maxLength={20}
            onKeyDown={(e) => e.key === 'Enter' && handleStart()}
          />
          <Button
            size="lg"
            className="w-full font-bold text-lg shadow-md hover:shadow-primary/50"
            onClick={handleStart}
            disabled={!name.trim()}
          >
            <Play className="ml-2 h-5 w-5" />
            ابدأ التحدي!
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full font-bold text-lg"
            onClick={onShowLeaderboard}
          >
            <Trophy className="ml-2 h-5 w-5" />
            عرض قائمة المتصدرين
          </Button>
          <p className="text-muted-foreground text-sm mt-2">
            لن يستغرق الأمر أكثر من دقيقتين.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
