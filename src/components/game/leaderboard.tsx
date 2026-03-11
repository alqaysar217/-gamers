'use client';

import { useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { GameSession } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Crown, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

function LeaderboardRow({ session, rank, onMyRowClick }: { session: GameSession; rank: number; onMyRowClick?: () => void }) {
  const { user } = useUser();
  const isCurrentUser = user?.uid === session.playerProfileId;

  const rankIcon = useMemo(() => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-400 fill-yellow-400" />;
    if (rank === 2) return <Crown className="w-6 h-6 text-slate-400 fill-slate-400" />;
    if (rank === 3) return <Crown className="w-6 h-6 text-yellow-600 fill-yellow-600" />;
    return <span className="font-bold text-lg">{rank}</span>;
  }, [rank]);

  return (
    <TableRow 
      className={cn(
        "hover:bg-primary/5",
        isCurrentUser && "bg-primary/10",
        onMyRowClick && isCurrentUser && "cursor-pointer"
      )}
      onClick={() => {
        if (isCurrentUser && onMyRowClick) {
          onMyRowClick();
        }
      }}
    >
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


export default function Leaderboard({ onMyRowClick }: { onMyRowClick?: () => void }) {
  const firestore = useFirestore();
  
  const leaderboardQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'gameSessions'),
      orderBy('totalPointsEarned', 'desc')
    );
  }, [firestore]);

  const { data: sessions, isLoading, error } = useCollection<GameSession>(leaderboardQuery);

  return (
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
        {error && <p className="text-destructive text-center">حدث خطأ أثناء تحميل القائمة.</p>}
        {!isLoading && !sessions?.length && (
          <p className="text-muted-foreground text-center">لا يوجد لاعبون بعد. كن أول المتصدرين!</p>
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
                <LeaderboardRow key={session.id} session={session} rank={index + 1} onMyRowClick={onMyRowClick} />
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
