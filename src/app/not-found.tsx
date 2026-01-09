import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/ui/logo";

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link href="/">
            <Logo size="sm" />
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="space-y-2">
            <h1 className="text-7xl font-bold text-primary">404</h1>
            <h2 className="text-2xl font-semibold">{t("title")}</h2>
            <p className="text-muted-foreground">{t("description")}</p>
          </div>

          <Link href="/">
            <Button size="lg">{t("returnHome")}</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
