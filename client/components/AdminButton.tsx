import { Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function AdminButton() {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Link to="/admin">
        <Button 
          size="icon" 
          className="rounded-full w-12 h-12 bg-blue-600 hover:bg-blue-700 shadow-lg"
          title="Admin Panel"
        >
          <Settings className="w-5 h-5 text-white" />
        </Button>
      </Link>
    </div>
  );
}
