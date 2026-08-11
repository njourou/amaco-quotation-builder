import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <Card className="max-w-md border-border/70 soft-shadow">
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>
            Company branding and default rates will appear here. Rates are currently
            fixed from the AMACO Master Quotation Template 2026.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/">
            <Button variant="outline">Back to home</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
