// Page component for PasswordUpdateSuccess.
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PasswordUpdateSuccess = () => {
    const navigate = useNavigate();
  return (
    <div className="authContainer min-h-screen flex flex-col justify-center items-center px-4 py-8 animate-fadeIn">
      <Card className="p-8 flex flex-col justify-center items-center w-full max-w-sm glass-card border-cyan-300/25">
        <CheckCircle className="text-emerald-300 h-20 w-20" />
        <p className="pt-5 text-xl font-semibold gradient-text">Password Changed</p>
        <p className="py-2 pb-5 text-slate-400 text-center">Your password has been changed successfully.</p>
        <Button onClick={() => navigate("/")} className="w-full btn-gradient">
            Go To Login
        </Button>
      </Card>
    </div>
  );
};

export default PasswordUpdateSuccess;
