'use client';

import { useMemo, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { GameSession } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableRow, TableHeader, TableHead } from '@/components/ui/table';
import { RotateCw, Camera, Star, Crown, MoreHorizontal, Home } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import html2canvas from "html2canvas";
import { useToast } from "@/hooks/use-toast";

type CompletionScreenProps = {
  onRestart: () => void;
  onGoToHub: () => void;
};

function LeaderboardRow({ session, rank }: { session: GameSession, rank: number }) {
  const rankIcon = useMemo(() => {
    if (rank === 1) return <Crown className="w-8 h-8 text-yellow-400 fill-yellow-400" />;
    if (rank === 2) return <Crown className="w-8 h-8 text-slate-400 fill-slate-400" />;
    if (rank === 3) return <Crown className="w-8 h-8 text-yellow-600 fill-yellow-600" />;
    return <span className="font-bold text-xl">{rank}</span>;
  }, [rank]);

  const isCurrentUser = useUser().user?.uid === session.playerProfileId;

  return (
    <TableRow className={isCurrentUser ? "bg-primary/10" : "hover:bg-primary/5"}>
      <TableCell className="w-16 text-center">{rankIcon}</TableCell>
      <TableCell className="font-medium text-lg">{session.playerName}</TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <span className="font-bold text-primary text-lg">{session.totalPointsEarned}</span>
          <Star className="w-4 h-4 text-accent fill-accent" />
        </div>
      </TableCell>
    </TableRow>
  );
}


export default function CompletionScreen({ onRestart, onGoToHub }: CompletionScreenProps) {
  const summaryCardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  const allSessionsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'gameSessions'), orderBy('totalPointsEarned', 'desc'));
  }, [firestore]);

  const { data: sessions, isLoading } = useCollection<GameSession>(allSessionsQuery);

  const playerSession = useMemo(() => {
    if (!sessions || !user) return null;
    return sessions.find(s => s.playerProfileId === user.uid);
  }, [sessions, user]);
  
  const finalScore = playerSession?.totalPointsEarned ?? 0;
  const playerName = playerSession?.playerName ?? '...';


  const { badgeText, description } = useMemo(() => {
    if (finalScore >= 80) {
        return { badgeText: 'خبير الألعاب', description: 'أداء رائع! معرفتك في عالم الألعاب استثنائية.' };
    }
    if (finalScore >= 40) {
        return { badgeText: 'لاعب متمكن', description: 'أحسنت! لديك معرفة جيدة بعادات وتقاليد اللاعبين.' };
    }
    return { badgeText: 'لاعب طموح', description: 'بداية موفقة! واصل اللعب لتصبح خبيراً في عالمنا.' };
  }, [finalScore]);

  const handleScreenshot = useCallback(() => {
    if (!summaryCardRef.current) return;
    
    toast({ title: '📸 جاري التقاط الصورة...' });

    html2canvas(summaryCardRef.current, { 
      backgroundColor: null, // Use transparent background
      useCORS: true,
      scale: 2
    }).then(canvas => {
      const link = document.createElement('a');
      link.download = 'gamers-night-challenge-result.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast({ title: 'تم حفظ الصورة بنجاح!', description: 'يمكنك الآن مشاركتها.' });
    });
  }, [toast]);

  if (isLoading || (sessions && !playerSession)) {
      return (
        <div className="animate-in fade-in-0 zoom-in-95 duration-500 w-full flex flex-col items-center gap-6 py-8">
            <div 
                ref={summaryCardRef} 
                className="w-full max-w-lg p-1.5"
            >
                <Card className="rounded-xl border-none bg-background/80 backdrop-blur-2xl">
                <CardContent className="flex flex-col gap-4 text-center items-center p-8">
                    <Skeleton className="w-[120px] h-[120px] rounded-full border-4 border-primary/50 shadow-lg -mt-24" />
                    <Skeleton className="h-10 w-48 mt-2" />
                    
                    <div className="my-4 text-center w-full">
                        <Skeleton className="h-4 w-24 mx-auto" />
                        <Skeleton className="h-20 w-40 mx-auto mt-2" />
                        <div className="mt-4">
                        <Skeleton className="h-8 w-32 mx-auto" />
                        <Skeleton className="h-4 w-64 mx-auto mt-2" />
                        </div>
                    </div>
                </CardContent>
                </Card>
            </div>
            <Card className="w-full max-w-lg">
                <CardFooter className="flex flex-col gap-2 p-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardFooter>
            </Card>
        </div>
      );
  }

  return (
    <div className="animate-in fade-in-0 zoom-in-95 duration-500 w-full flex flex-col items-center gap-6 py-8">
      <div 
        ref={summaryCardRef} 
        className="w-full max-w-lg p-1.5 bg-gradient-to-br from-primary via-fuchsia-500 to-accent rounded-2xl shadow-2xl shadow-primary/20"
      >
        <Card className="rounded-xl border-none bg-background/80 backdrop-blur-2xl">
           <CardContent className="flex flex-col gap-4 text-center items-center p-8">
             <Image 
                src="https://i.pinimg.com/1200x/8d/1c/39/8d1c391d81e7729a087208e2c2495b32.jpg"
                alt="Player Avatar"
                width={120}
                height={120}
                className="rounded-full border-4 border-primary/50 shadow-lg -mt-24"
                priority
             />
             <h2 className="font-headline text-3xl sm:text-4xl font-bold mt-2">{playerName}</h2>
             
             <div className="my-4 text-center">
                <p className="text-sm text-muted-foreground font-bold">نتيجة التحدي</p>
                <p className="text-6xl font-bold text-primary flex items-center justify-center gap-2">
                    {finalScore}
                    <Star className="w-10 h-10 text-accent fill-accent" />
                </p>
                <div className="mt-4">
                  <Badge className="py-2 px-4 text-md bg-accent text-accent-foreground shadow-md">{badgeText}</Badge>
                  <p className="text-foreground/80 mt-2">{description}</p>
                </div>
            </div>
            
            <div className="text-center mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-md font-semibold text-primary">شارك نتيجتك!</p>
                <p className="text-muted-foreground text-sm">
                    التقط صورة للشاشة وشاركها معنا على انستقرام
                    <a href="https://www.instagram.com/mahmoud_codes/" target="_blank" rel="noopener noreferrer" className="font-bold text-primary mx-1">@mahmoud_codes</a>
                </p>
            </div>
          </CardContent>
        </Card>
      </div>

       <Card className="w-full max-w-lg shadow-lg">
        <CardFooter className="flex flex-col gap-2 p-4">
             <Button onClick={handleScreenshot} className="w-full" variant="outline">
                <Camera className="ml-2 h-4 w-4" />
                التقط النتيجة
            </Button>
            <Button onClick={onGoToHub} className="w-full">
                <Home className="ml-2 h-4 w-4" />
                العودة لقائمة التحديات
            </Button>
            <Button variant="secondary" onClick={onRestart} className="w-full">
                <RotateCw className="ml-2 h-4 w-4" />
                إعادة اللعب من البداية
            </Button>
        </CardFooter>
       </Card>

      <Card className="w-full max-w-lg mx-auto border-primary/20 shadow-xl shadow-primary/10">
        <CardHeader className="text-center items-center p-6">
            <CardTitle className="font-headline font-bold text-4xl text-primary">قائمة المتصدرين</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
            {isLoading && (
            <div className="space-y-2">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
            )}
            {sessions && sessions.length > 0 && (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-center">الترتيب</TableHead>
                        <TableHead>اللاعب</TableHead>
                        <TableHead className="text-right">النقاط</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                {sessions.map((session, index) => (
                    <LeaderboardRow key={session.id} session={session} rank={index + 1} />
                ))}
                </TableBody>
            </Table>
            )}
            {!isLoading && !sessions?.length && (
            <p className="text-muted-foreground text-center">لا يوجد لاعبون بعد. كن أول المتصدرين!</p>
            )}
        </CardContent>
       </Card>
    </div>
  );
}
