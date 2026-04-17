'use client'
import PublicNavigation from "./navigation/page";
import StoreAssistant from "../shared/StoreAssistant";

export default function LayoutBeforeLogin({ children }) {
    return (
      <div className="flex flex-col min-h-screen">
        {/* Navigation stays fixed */}
        <PublicNavigation />
        {/* Main content */}
        <main className="page-enter flex-grow">{children}</main>
        <StoreAssistant />
      </div>
    );
}
