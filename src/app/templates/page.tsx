import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TemplatesPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <Card className="max-w-md border-border/70 soft-shadow">
        <CardHeader>
          <CardTitle>Templates</CardTitle>
          <CardDescription>
            Saved quotation templates and rate schedules will live here. Use New
            Quotation with &quot;Load Excel sample&quot; for the Master Template demo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/quotation/new">
            <Button>Start a quotation</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
