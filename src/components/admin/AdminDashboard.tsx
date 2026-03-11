'use client';

import { useMemo, useCallback } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, getDocs, deleteDoc } from 'firebase/firestore';
import type { SurveyResponse } from '@/lib/types';
import { surveyQuestions } from '@/lib/survey';
import { 
    Bar, 
    BarChart, 
    CartesianGrid, 
    XAxis, 
    YAxis, 
    Tooltip, 
    ResponsiveContainer, 
    LabelList,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FileDown, Trash2 } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from '@/hooks/use-mobile';


type AggregatedData = {
  [questionId: number]: {
    questionText: string;
    totalResponses: number;
    options: {
      [optionText: string]: number;
    };
  };
};

type TableData = {
  playerName: string;
  [questionKey: string]: string;
};

const PIE_CHART_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function AdminDashboard() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const responsesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'surveyResponses'));
  }, [firestore]);

  const { data: responses, isLoading, error: collectionError } = useCollection<SurveyResponse>(responsesQuery);

  const aggregatedData = useMemo<AggregatedData | null>(() => {
    if (!responses) return null;
    const data: AggregatedData = {};
    surveyQuestions.forEach(q => {
      data[q.id] = {
        questionText: q.question,
        totalResponses: 0,
        options: {},
      };
      q.options.forEach(o => {
        data[q.id].options[o.text] = 0;
      });
    });
    
    responses.forEach(response => {
        const answeredQuestions = new Set<string>();
        response.answers.forEach(answer => {
            if (answeredQuestions.has(answer.question)) return;
            const questionId = surveyQuestions.find(q => q.question === answer.question)?.id;
            if (questionId && data[questionId]) {
              data[questionId].totalResponses += 1;
              if (data[questionId].options.hasOwnProperty(answer.answer)) {
                  data[questionId].options[answer.answer] += 1;
              }
              answeredQuestions.add(answer.question);
            }
      });
    });

    return data;
  }, [responses]);

  const tableData = useMemo<TableData[] | null>(() => {
    if (!responses) return null;
    return responses.map(res => {
        const row: TableData = { playerName: res.playerName };
        surveyQuestions.forEach(q => {
            const answer = res.answers.find(a => a.question === q.question);
            row[`q${q.id}`] = answer ? answer.answer : '-';
        });
        return row;
    });
  }, [responses]);

  const handleExportCSV = useCallback(() => {
    if (!tableData) return;

    const headers = ['اللاعب', ...surveyQuestions.map(q => q.question)];
    const csvRows = [headers.join(',')];

    tableData.forEach(row => {
        const values = [
            `"${row.playerName}"`,
            ...surveyQuestions.map(q => `"${row[`q${q.id}`] || ''}"`)
        ];
        csvRows.push(values.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' }); // \uFEFF for BOM to support Arabic in Excel

    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'survey_responses.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  }, [tableData]);

  const handleDeleteAllData = useCallback(async () => {
    if (!firestore) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "لم يتم العثور على قاعدة البيانات.",
      });
      return;
    }

    const isConfirmed = window.confirm(
      'هل أنت متأكد من أنك تريد حذف جميع بيانات اللاعبين والمتصدرين والاستبيانات؟ سيؤدي هذا إلى إعادة تعيين اللعبة بالكامل لجميع المستخدمين. لا يمكن التراجع عن هذا الإجراء.'
    );

    if (!isConfirmed) {
      return;
    }

    toast({ title: "جاري حذف البيانات..." });

    try {
      const collectionsToDelete = ['gameSessions', 'surveyResponses', 'playerProfiles'];
      const deletionPromises: Promise<void>[] = [];

      for (const collectionName of collectionsToDelete) {
        const q = query(collection(firestore, collectionName));
        const snapshot = await getDocs(q);
        snapshot.forEach(doc => {
          deletionPromises.push(deleteDoc(doc.ref));
        });
      }
      
      await Promise.all(deletionPromises);

      toast({
        title: "تم حذف البيانات بنجاح",
        description: "تمت إعادة تعيين بيانات اللعبة. يمكن للاعبين الآن البدء من جديد.",
      });
    } catch (error) {
      console.error("Error deleting data: ", error);
      toast({
        variant: "destructive",
        title: "حدث خطأ أثناء الحذف",
        description: "لم نتمكن من حذف البيانات. قد تحتاج إلى مراجعة قواعد أمان Firestore.",
      });
    }
  }, [firestore, toast]);

  const renderChart = (questionId: number) => {
    if (!aggregatedData) return null;

    const questionData = aggregatedData[questionId];
    const surveyQ = surveyQuestions.find(q => q.id === questionId);
    if (!questionData || !surveyQ || questionData.totalResponses === 0) {
      return <p className="text-muted-foreground text-center p-4">لا توجد بيانات لهذا السؤال بعد.</p>;
    }
    
    const chartData = Object.entries(questionData.options).map(([name, value]) => ({
      name,
      value,
      percent: questionData.totalResponses > 0 ? (value / questionData.totalResponses) : 0,
    }));
    
    // Use Pie chart for gender question (id: 2)
    if (questionId === 2) {
      return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    outerRadius={isMobile ? 60 : 80}
                    innerRadius={isMobile ? 30 : 40}
                    paddingAngle={5}
                    dataKey="value"
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} stroke={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: 'var(--radius)' }}
                    formatter={(value: number, name, props) => {
                        const percent = (props.payload.percent * 100).toFixed(0);
                        return [`${value} (${percent}%)`, name];
                    }}
                />
                <Legend iconType="circle" wrapperStyle={{fontSize: isMobile ? "12px" : "14px"}}/>
            </PieChart>
        </ResponsiveContainer>
      );
    }
    
    const CustomXAxisTick = (props: any) => {
        const { x, y, payload } = props;
        const tickValue = payload.value;

        if (isMobile) {
            // Use foreignObject for multi-line text on mobile
            return (
                <g transform={`translate(${x},${y})`}>
                    <foreignObject x={-30} y={5} width={60} height={70}>
                        <p xmlns="http://www.w3.org/1999/xhtml" style={{ fontSize: '10px', color: 'hsl(var(--foreground))', textAlign: 'center', margin: 0, whiteSpace: 'normal', wordWrap: 'break-word', lineHeight: 1.2, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                            {tickValue}
                        </p>
                    </foreignObject>
                </g>
            );
        }
        
        // Rotated text for desktop
        const truncatedValue = tickValue.length > 15 ? `${tickValue.substring(0, 13)}...` : tickValue;
        return (
             <g transform={`translate(${x},${y})`}>
                <text x={0} y={0} dy={16} textAnchor="end" fill="hsl(var(--foreground))" transform="rotate(-35)" fontSize={12}>
                    {truncatedValue}
                </text>
            </g>
        );
    };

    const barChartHeight = isMobile ? 250 : 300;
    const xAxisHeight = isMobile ? 80 : 70;
    const yAxisWidth = isMobile ? 20 : 40;
    const fontSize = isMobile ? 10 : 12;
    const barSize = isMobile ? 20 : 35;
    const chartColor = `hsl(var(--chart-${(questionId % 5) + 1}))`;


    return (
        <ResponsiveContainer width="100%" height={barChartHeight}>
            <BarChart data={chartData} margin={{ top: 20, right: isMobile ? 0 : 20, left: isMobile ? -yAxisWidth : 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                    dataKey="name" 
                    tickLine={false} 
                    axisLine={true}
                    tick={<CustomXAxisTick />} 
                    interval={0} 
                    height={xAxisHeight}
                />
                <YAxis tick={{ fill: 'hsl(var(--foreground))', fontSize: fontSize }} allowDecimals={false} width={yAxisWidth} />
                <Tooltip 
                    cursor={{ fill: 'hsl(var(--primary) / 0.1)' }} 
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: 'var(--radius)' }}
                    formatter={(value: number, name, props) => {
                        const percent = (props.payload.percent * 100).toFixed(0);
                        return [`${value} (${percent}%)`, name];
                    }}
                />
                <Bar dataKey="value" fill={chartColor} radius={[4, 4, 0, 0]} barSize={barSize}>
                    <LabelList 
                        dataKey="percent" 
                        position="top" 
                        formatter={(value: number) => `${(value * 100).toFixed(0)}%`}
                        style={{ fill: 'hsl(var(--foreground))', fontSize: fontSize, fontWeight: 'bold' }} 
                    />
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-primary font-headline">إحصائيات الاستبيان</h1>
                <p className="text-muted-foreground">تحليل لإجابات اللاعبين على الأسئلة الثمانية.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={!tableData || isLoading}>
                    <FileDown className="ml-2 h-4 w-4" />
                    تصدير CSV
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDeleteAllData} disabled={isLoading}>
                    <Trash2 className="ml-2 h-4 w-4" />
                    حذف كل البيانات
                </Button>
            </div>
        </header>

        {isLoading && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
            {[...Array(8)].map((_, i) => (
                <Card key={i}>
                <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[250px] w-full" />
                </CardContent>
                </Card>
            ))}
            </div>
        )}

        {!isLoading && collectionError && (
            <Card className="bg-destructive/10 border-destructive">
            <CardHeader>
                <CardTitle className="text-destructive">خطأ في تحميل البيانات</CardTitle>
            </CardHeader>
            <CardContent>
                <p>تعذر تحميل بيانات الاستبيان. قد يكون هذا بسبب مشكلة في أذونات قاعدة البيانات.</p>
                <p className="text-xs text-muted-foreground mt-2">{collectionError.message}</p>
            </CardContent>
            </Card>
        )}
        
        {!isLoading && !collectionError && aggregatedData && (
            <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {surveyQuestions.map(q => {
                    const Icon = q.icon;
                    return (
                        <Card key={q.id} className="overflow-hidden shadow-md flex flex-col">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-lg">
                                    {Icon && (
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <Icon className="w-6 h-6 text-primary" />
                                        </div>
                                    )}
                                    <span>{q.id}. {q.question}</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-grow flex items-center justify-center">
                                {renderChart(q.id)}
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle>الاستجابات التفصيلية</CardTitle>
                    <CardDescription>عرض جميع الإجابات الفردية من اللاعبين.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="w-full overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="min-w-[150px]">اسم اللاعب</TableHead>
                                    {surveyQuestions.map(q => (
                                        <TableHead key={q.id} className="min-w-[200px]">{`س${q.id}: ${q.question}`}</TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tableData && tableData.length > 0 ? (
                                    tableData.map((row, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{row.playerName}</TableCell>
                                            {surveyQuestions.map(q => (
                                                <TableCell key={q.id}>{row[`q${q.id}`]}</TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={surveyQuestions.length + 1} className="text-center">
                                            لا توجد استجابات لعرضها.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
            </>
        )}
    </div>
  );
}
