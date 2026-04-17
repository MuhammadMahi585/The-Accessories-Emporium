'use client'
import Navigation from "../../navigation/page";
import StoreAssistant from "../../shared/StoreAssistant";

export default function CustomerLayout({ children }) {
    return (
      <div className="flex flex-col min-h-screen">
        {/* Navigation stays fixed */}
        <Navigation />
        {/* Main content */}
        <main className="page-enter flex-grow">{children}</main>
        <StoreAssistant />
      </div>
    );
}
