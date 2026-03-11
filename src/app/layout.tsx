import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster";
import './globals.css';
import { cn } from '@/lib/utils';
import { FirebaseClientProvider } from '@/firebase/client-provider';

// تحديث كائن Metadata ليعكس الأيقونات الحقيقية التي حصلت عليها
export const metadata: Metadata = {
  title: "تحدي القيمرز قبل النوم (Gamers' Night Challenge)",
  description: "لعبة قصيرة وممتعة لجمع بيانات حول عادات اللاعبين قبل النوم",
  manifest: "/site.webmanifest", // تأكد أن اسم الملف مطابق لما حملته (site.webmanifest)
  themeColor: "#0F1FB3", // تم تغيير اللون ليتناسب مع الهوية الزرقاء الملكية للتطبيق
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet" />
        
        {/* إعدادات إضافية لتحسين مظهر التطبيق عند التثبيت على الجوال */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="قيمرز" />
        
        {/* ربط الأيقونات بشكل مباشر لضمان التوافق مع المتصفحات القديمة */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={cn("font-body antialiased", "bg-background")}>
        <FirebaseClientProvider>
          {children}
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}