'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { surveyQuestions, SurveyOption, SurveyQuestion } from '@/lib/survey';
import { ChallengeQuestion, ChallengeOption } from '@/lib/challenge';
import IntroScreen from '@/components/game/intro-screen';
import GameHeader from '@/components/game/game-header';
import QuestionStage from '@/components/game/question-stage';
import ChallengeStage from '@/components/game/challenge-stage';
import CompletionScreen from '@/components/game/completion-screen';
import Leaderboard from '@/components/game/leaderboard';
import GameHub from '@/components/game/game-hub';
import OrderingChallengeStage from '@/components/game/ordering-challenge-stage';
import { useToast } from "@/hooks/use-toast";
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { signInAnonymously } from 'firebase/auth';
import { collection, doc, serverTimestamp, setDoc, updateDoc, addDoc, query } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Home as HomeIcon, User, KeyRound } from 'lucide-react';
import { submitSurvey } from './actions';
import { cn } from '@/lib/utils';
import type { PlayerProfile } from '@/lib/types';
import Logo from '@/components/game/logo';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import AdminDashboard from '@/components/admin/AdminDashboard';

type GameState = 'intro' | 'playing' | 'game_menu' | 'challenge' | 'finished' | 'leaderboard' | 'admin' | 'loading';
export type SurveyAnswer = { question: string; answer: string; points: number, icon?: React.ElementType };
export type ChallengeAnswer = { question: string; answered: string; isCorrect: boolean };

export default function HomePage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, loading: userLoading } = useUser();
  
  const [gameState, setGameState] = useState<GameState>('loading');
  const [playerName, setPlayerName] = useState('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  // --- Player Profile Persistence ---
  const playerProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'playerProfiles', user.uid);
  }, [firestore, user]);
  const { data: playerProfile, isLoading: isProfileLoading } = useDoc<PlayerProfile>(playerProfileRef);
  
  // Survey state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [surveyAnswers, setSurveyAnswers] = useState<SurveyAnswer[]>([]);
  const [surveyScore, setSurveyScore] = useState(0);
  
  // Challenge state
  const [challengeQuestions, setChallengeQuestions] = useState<ChallengeQuestion[]>([]);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [challengeAnswers, setChallengeAnswers] = useState<ChallengeAnswer[]>([]);
  const [challengeScore, setChallengeScore] = useState(0);
  const [challengeTitle, setChallengeTitle] = useState('');
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);

  const { toast } = useToast();

  useEffect(() => {
    if (!user && !userLoading && auth) {
      signInAnonymously(auth).catch((error) => {
        console.error("Anonymous sign-in failed", error);
        toast({
          variant: "destructive",
          title: "فشل تسجيل الدخول",
          description: "لم نتمكن من بدء جلسة لعب. يرجى تحديث الصفحة.",
        });
      });
    }
  }, [user, userLoading, auth, toast]);

  useEffect(() => {
    // While loading auth or profile data, show the loading screen.
    if (userLoading || isProfileLoading) {
      setGameState('loading');
      return;
    }

    if (playerProfile) {
      // If a profile exists, the user has already completed the survey.
      // Restore their state and send them to the game menu.
      setPlayerName(playerProfile.playerName);
      setCompletedChallenges(playerProfile.completedChallenges || []);
      setSurveyScore(playerProfile.initialSurveyScore || 0);
      setChallengeScore(0); // Reset challenge score for a clean slate in the hub
      setGameState('game_menu');
    } else {
      // No profile exists, this is a new player. Start from the beginning.
      // Reset all state for a clean start.
      setPlayerName('');
      setCurrentQuestionIndex(0);
      setSurveyAnswers([]);
      setSurveyScore(0);
      setChallengeQuestions([]);
      setCurrentChallengeIndex(0);
      setChallengeAnswers([]);
      setChallengeScore(0);
      setChallengeTitle('');
      setCompletedChallenges([]);
      setPasswordInput('');
      setShowPasswordPrompt(false);
      setGameState('intro');
    }
  }, [user, userLoading, isProfileLoading, playerProfile]);
  
  const finalScore = useMemo(() => surveyScore + challengeScore, [surveyScore, challengeScore]);

  const handleScoreUpdate = useCallback((isFinalUpdate: boolean) => {
    if (!user || !firestore) {
      return;
    }
  
    // 1. Update game session for the leaderboard
    const gameSessionRef = doc(firestore, 'gameSessions', user.uid);
    const gameSessionUpdateData = {
      totalPointsEarned: finalScore,
      updatedAt: serverTimestamp(),
    };
  
    // Non-blocking update
    updateDoc(gameSessionRef, gameSessionUpdateData).catch((error) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: gameSessionRef.path,
        operation: 'update',
        requestResourceData: gameSessionUpdateData,
      }));
    });
  
    // 2. Update player's main profile
    if (playerProfileRef) {
      const newHighestScore = Math.max(finalScore, playerProfile?.highestSessionScore ?? -Infinity);
      const playerProfileUpdateData = {
        lastSessionDate: serverTimestamp(),
        highestSessionScore: newHighestScore,
      };
      updateDoc(playerProfileRef, playerProfileUpdateData).catch(error => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: playerProfileRef.path,
          operation: 'update',
          requestResourceData: playerProfileUpdateData,
        }));
      });
    }
  
    // 3. Submit data to external service if it's the final update
    if (isFinalUpdate) {
      submitSurvey({
        name: playerName,
        challengeAnswers: challengeAnswers.map(a => ({
          question: a.question,
          answered: a.answered,
          isCorrect: a.isCorrect,
        })),
        finalScore: finalScore,
      }).then(result => {
        if (result.success) {
          toast({
            title: "اكتملت جميع التحديات!",
            description: "تم تسجيل نتيجتك النهائية.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "حدث خطأ في الإرسال",
            description: result.message,
          });
        }
      }).catch(error => {
        console.error("Error submitting survey:", error);
        toast({
          variant: "destructive",
          title: "حدث خطأ في الإرسال",
          description: "لم نتمكن من إرسال بياناتك. لكن تم حفظ نتيجتك.",
        });
      });
    } else {
      toast({
        title: "أحسنت!",
        description: "تم تحديث نتيجتك. تحقق من ترتيبك الجديد!",
      });
    }
  }, [finalScore, playerName, user, firestore, toast, challengeAnswers, playerProfile, playerProfileRef]);

  const handleStartGame = (name: string) => {
    if (name.trim()) {
      setPlayerName(name.trim());
      setGameState('playing');
    }
  };
  
  const handleSelectGame = (questions: ChallengeQuestion[], gameTitle: string) => {
    setChallengeQuestions(questions);
    setChallengeTitle(gameTitle);
    setCurrentChallengeIndex(0);
    setChallengeAnswers([]);
    setChallengeScore(0);
    setGameState('challenge');
  };

  const handleSurveyAnswerSelect = useCallback((option: SurveyOption, question: SurveyQuestion) => {
    const newAnswers = [...surveyAnswers, { question: question.question, answer: option.text, points: option.points }];
    setSurveyAnswers(newAnswers);
    const currentTotalScore = newAnswers.reduce((total, ans) => total + ans.points, 0);
    setSurveyScore(currentTotalScore);
    
    setTimeout(() => {
      if (currentQuestionIndex < surveyQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        // Survey finished, create the player profile and save survey data
        if (user && firestore && playerProfileRef) {
            const profileData: PlayerProfile = {
                id: user.uid,
                playerName: playerName,
                firstSessionDate: serverTimestamp() as any,
                lastSessionDate: serverTimestamp() as any,
                totalGamesPlayed: 1,
                highestSessionScore: currentTotalScore,
                initialSurveyScore: currentTotalScore,
                completedChallenges: [],
            };
            setDoc(playerProfileRef, profileData).catch(error => {
                errorEmitter.emit('permission-error', new FirestorePermissionError({
                    path: playerProfileRef.path,
                    operation: 'create',
                    requestResourceData: profileData,
                }));
            });

            // Save survey response
            const surveyResponseData = {
                playerProfileId: user.uid,
                playerName: playerName,
                answers: newAnswers.map(({ question, answer, points }) => ({ question, answer, points })),
                createdAt: serverTimestamp(),
            };
            const surveyResponsesCol = collection(firestore, 'surveyResponses');
            addDoc(surveyResponsesCol, surveyResponseData).catch(error => {
                errorEmitter.emit('permission-error', new FirestorePermissionError({
                    path: surveyResponsesCol.path,
                    operation: 'create',
                    requestResourceData: surveyResponseData,
                }));
            });

            // Create initial game session for the leaderboard
            const sessionData = {
              playerProfileId: user.uid,
              playerName: playerName,
              totalPointsEarned: currentTotalScore,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            };
            const gameSessionRef = doc(firestore, 'gameSessions', user.uid);
            setDoc(gameSessionRef, sessionData).catch(error => {
                errorEmitter.emit('permission-error', new FirestorePermissionError({
                    path: gameSessionRef.path,
                    operation: 'create',
                    requestResourceData: sessionData,
                }));
            });
        }
        setGameState('game_menu');
      }
    }, 300);
  }, [currentQuestionIndex, surveyAnswers, user, firestore, playerName, playerProfileRef]);

  const handleChallengeAnswer = useCallback((option: ChallengeOption) => {
    const question = challengeQuestions[currentChallengeIndex];
    if (option.isCorrect) {
        setChallengeScore(prev => prev + question.points);
    } else {
        setChallengeScore(prev => prev - question.points);
    }
    setChallengeAnswers(prev => [...prev, { question: question.question, answered: option.text, isCorrect: option.isCorrect }]);
  }, [currentChallengeIndex, challengeQuestions]);

  const handleNextChallengeQuestion = useCallback(() => {
    if (currentChallengeIndex < challengeQuestions.length - 1) {
        setCurrentChallengeIndex(prev => prev + 1);
    } else {
        // Last question of a challenge.
        const newCompleted = [...new Set([...completedChallenges, challengeTitle])];
        setCompletedChallenges(newCompleted);
        
        if (playerProfileRef) {
            const updateData = { completedChallenges: newCompleted };
            updateDoc(playerProfileRef, updateData).catch(error => {
                errorEmitter.emit('permission-error', new FirestorePermissionError({
                    path: playerProfileRef.path,
                    operation: 'update',
                    requestResourceData: updateData,
                }));
            });
        }
        
        const allChallengesDone = newCompleted.length >= 4; // Assuming 4 challenges

        handleScoreUpdate(allChallengesDone);

        if (allChallengesDone) {
            setGameState('finished');
        } else {
            setGameState('leaderboard');
        }
    }
  }, [currentChallengeIndex, challengeQuestions.length, challengeTitle, completedChallenges, playerProfileRef, handleScoreUpdate]);

  const handlePreviousChallengeQuestion = useCallback(() => {
    if (currentChallengeIndex > 0) {
        setCurrentChallengeIndex(prev => prev - 1);
    }
  }, [currentChallengeIndex]);

  const handleRestart = useCallback(() => {
    // Reset local state for challenges
    setChallengeAnswers([]);
    setChallengeScore(0);
    setChallengeQuestions([]);
    setChallengeTitle('');
    setCompletedChallenges([]); // Reset local state
    
    // Use the stored initial score.
    const baseSurveyScore = playerProfile?.initialSurveyScore;
    
    if (typeof baseSurveyScore === 'number') {
      setSurveyScore(baseSurveyScore);
    }

    // Update Firestore to clear completed challenges & reset score
    if (user && firestore && playerProfileRef) {
        const profileUpdateData = { completedChallenges: [] };
        updateDoc(playerProfileRef, profileUpdateData).catch(error => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: playerProfileRef.path,
                operation: 'update',
                requestResourceData: profileUpdateData,
            }));
        });

        // Only update the game session score if we have a valid base score.
        if (typeof baseSurveyScore === 'number') {
          const gameSessionRef = doc(firestore, 'gameSessions', user.uid);
          const sessionUpdateData = {
              totalPointsEarned: baseSurveyScore,
              updatedAt: serverTimestamp()
          };
          updateDoc(gameSessionRef, sessionUpdateData).catch(error => {
              errorEmitter.emit('permission-error', new FirestorePermissionError({
                  path: gameSessionRef.path,
                  operation: 'update',
                  requestResourceData: sessionUpdateData,
              }));
          });
        }
    }
    
    // Always go back to the game menu after restart
    setGameState('game_menu');
  }, [playerProfile, user, firestore, playerProfileRef]);
  
  const handleLogoClick = useCallback(() => {
    setShowPasswordPrompt(true);
  }, []);

  const handlePasswordCheck = () => {
    if (passwordInput === '775258830') {
      setShowPasswordPrompt(false);
      setGameState('admin');
      setPasswordInput('');
    } else {
      toast({
        variant: "destructive",
        title: "كلمة المرور خاطئة",
        description: "الرجاء إدخال كلمة المرور الصحيحة للوصول إلى لوحة التحكم.",
      });
      setPasswordInput('');
    }
  };

  const renderContent = () => {
    if (gameState === 'loading') {
      return (
        <div className="flex flex-col items-center justify-center text-center w-full max-w-lg">
            <Skeleton className="h-24 w-3/4 mb-4" />
            <Skeleton className="h-8 w-1/2 mb-6" />
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-10 w-full" />
        </div>
      );
    }
  
    switch (gameState) {
      case 'intro':
        return <IntroScreen onStart={handleStartGame} onShowLeaderboard={() => setGameState('leaderboard')} onLogoClick={handleLogoClick} />;
      case 'leaderboard':
        return (
          <div className="w-full h-screen flex flex-col bg-background">
            <header className="sticky top-0 z-10 w-full bg-background/95 backdrop-blur-sm p-4 border-b">
                 <div className="max-w-3xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3 text-lg font-bold text-primary">
                      <Logo className="w-8 h-8 rounded-full" onClick={handleLogoClick} />
                      <span className="font-headline font-bold text-2xl">قائمة المتصدرين</span>
                    </div>
                    {playerName && (
                      <Badge variant="secondary" className="text-md py-1 px-3">
                        <User className="w-4 h-4 ml-2" />
                        {playerName}
                      </Badge>
                    )}
                  </div>
            </header>
            <main className="flex-grow overflow-y-auto p-4 sm:p-6">
                <Leaderboard onMyRowClick={() => setGameState('finished')} />
            </main>
            <footer className="sticky bottom-0 z-10 w-full bg-background/95 backdrop-blur-sm p-4 border-t">
                <div className="max-w-md mx-auto">
                    <Button onClick={() => setGameState(playerProfile ? 'game_menu' : 'intro')} className="w-full">
                        <HomeIcon className="h-5 w-5" />
                        العودة إلى الرئيسية
                    </Button>
                </div>
            </footer>
          </div>
        );
      case 'playing':
        return surveyQuestions[currentQuestionIndex] ? (
          <div className="w-full max-w-3xl animate-in fade-in duration-500">
            <GameHeader 
              current={currentQuestionIndex + 1} 
              total={surveyQuestions.length} 
              score={surveyScore}
              playerName={playerName}
              title="الاستبيان"
              onLogoClick={handleLogoClick}
            />
            <QuestionStage
              key={`survey-${currentQuestionIndex}`}
              question={surveyQuestions[currentQuestionIndex]}
              onAnswer={handleSurveyAnswerSelect}
              playerName={playerName}
            />
          </div>
        ) : null;
      case 'game_menu':
        return <GameHub
            playerName={playerName}
            finalScore={finalScore}
            completedChallenges={completedChallenges}
            onSelectGame={handleSelectGame}
            onShowLeaderboard={() => setGameState('leaderboard')}
            onRestart={handleRestart}
            onLogoClick={handleLogoClick}
        />;
      case 'admin':
        return (
            <div className="w-full h-screen flex flex-col bg-background">
                <header className="sticky top-0 z-10 w-full bg-background/95 backdrop-blur-sm p-4 border-b">
                    <div className="max-w-7xl mx-auto flex justify-between items-center">
                        <div className="flex items-center gap-3 text-lg font-bold text-primary">
                            <Logo className="w-8 h-8 rounded-full" onClick={handleLogoClick} />
                            <span className="font-headline font-bold text-2xl">لوحة التحكم</span>
                        </div>
                        {playerName && (
                            <Badge variant="secondary" className="text-md py-1 px-3">
                                <User className="w-4 h-4 ml-2" />
                                {playerName || 'Admin'}
                            </Badge>
                        )}
                    </div>
                </header>
                <main className="flex-grow overflow-y-auto">
                    <AdminDashboard />
                </main>
                <footer className="sticky bottom-0 z-10 w-full bg-background/95 backdrop-blur-sm p-4 border-t">
                    <div className="max-w-md mx-auto">
                        <Button onClick={() => setGameState(playerProfile ? 'game_menu' : 'intro')} className="w-full">
                            <HomeIcon className="h-5 w-5" />
                            العودة إلى الرئيسية
                        </Button>
                    </div>
                </footer>
            </div>
        );
      case 'challenge':
        const question = challengeQuestions[currentChallengeIndex];
        if (!question) {
          return null;
        }
        
        const answeredData = challengeAnswers.find(a => a.question === question.question);

        if (challengeTitle === "رتبها صح!") {
            return (
                <div className="w-full max-w-3xl animate-in fade-in duration-500">
                    <GameHeader 
                        current={currentChallengeIndex + 1}
                        total={challengeQuestions.length}
                        score={finalScore}
                        playerName={playerName}
                        title={challengeTitle}
                        onLogoClick={handleLogoClick}
                    />
                    <OrderingChallengeStage
                        key={`challenge-${currentChallengeIndex}`}
                        question={question}
                        onAnswer={handleChallengeAnswer}
                        onNext={handleNextChallengeQuestion}
                        isLastQuestion={currentChallengeIndex === challengeQuestions.length - 1}
                    />
                </div>
            );
        }
        
        const userAnswer = answeredData ? question.options.find(o => o.text === answeredData.answered) || null : null;
        
        return (
          <div className="w-full max-w-3xl animate-in fade-in duration-500">
              <GameHeader 
                  current={currentChallengeIndex + 1}
                  total={challengeQuestions.length}
                  score={finalScore}
                  playerName={playerName}
                  title={challengeTitle}
                  onLogoClick={handleLogoClick}
              />
              <ChallengeStage
                  key={`challenge-${currentChallengeIndex}`}
                  question={question}
                  onAnswer={handleChallengeAnswer}
                  onNext={handleNextChallengeQuestion}
                  onPrevious={handlePreviousChallengeQuestion}
                  isLastQuestion={currentChallengeIndex === challengeQuestions.length - 1}
                  isFirstQuestion={currentChallengeIndex === 0}
                  userAnswer={userAnswer}
              />
          </div>
        );
      case 'finished':
        return (
          <CompletionScreen
            onRestart={handleRestart}
            onGoToHub={() => setGameState('game_menu')}
          />
        );
      default:
        return null;
    }
  }

  return (
    <main className={cn(
        "flex flex-col items-center justify-center min-h-screen bg-background overflow-y-auto",
        (gameState === 'game_menu' || gameState === 'leaderboard' || gameState === 'admin') ? "p-0" : "p-4 sm:p-6 md:p-8"
    )}>
      <div className={cn(
          "mx-auto flex items-center justify-center",
          (gameState === 'game_menu' || gameState === 'leaderboard' || gameState === 'admin') ? "w-full h-full" : "w-full max-w-3xl"
      )}>
        {renderContent()}
      </div>

      <Dialog open={showPasswordPrompt} onOpenChange={setShowPasswordPrompt}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-primary" />
                الوصول إلى لوحة التحكم
            </DialogTitle>
            <DialogDescription>
              الرجاء إدخال كلمة المرور لعرض لوحة تحكم الإحصائيات.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              id="password"
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePasswordCheck()}
              className="col-span-3 text-center"
              placeholder="********"
            />
          </div>
          <DialogFooter>
            <Button onClick={handlePasswordCheck} className="w-full">دخول</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
