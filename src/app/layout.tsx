import "./globals.css";
import { QueryProvider } from "@/contexts/QueryProvider";
import { ReduxProvider } from "@/contexts/ReduxProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { RealtimeNotifications } from "@/components/RealtimeNotifications";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col">
        <ReduxProvider>
          <QueryProvider>
            <ToastProvider>
              <AuthProvider>
                <RealtimeNotifications />
                {children}
              </AuthProvider>
            </ToastProvider>
          </QueryProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
