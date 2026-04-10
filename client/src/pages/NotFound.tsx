import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
        <h1 className="text-xl font-bold mb-2">404</h1>
        <p className="text-sm text-muted-foreground mb-4">页面不存在</p>
        <Button variant="outline" size="sm" onClick={() => navigate("/")}>
          返回首页
        </Button>
      </div>
    </div>
  );
}
