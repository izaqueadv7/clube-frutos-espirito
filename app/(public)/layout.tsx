import { SiteFooter } from "@/components/site-footer";
import { TopBar } from "@/components/top-bar";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-hero-gradient">
      <TopBar />
      {children}
      <SiteFooter />
    </div>
  );
}