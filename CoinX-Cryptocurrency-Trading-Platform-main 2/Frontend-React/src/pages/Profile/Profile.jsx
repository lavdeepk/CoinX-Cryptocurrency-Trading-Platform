// Page component for Profile.
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useDispatch, useSelector } from "react-redux";
import AccountVarificationForm from "./AccountVarificationForm";
import { BadgeCheck, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { enableTwoStepAuthentication, verifyOtp, logout } from "@/Redux/Auth/Action";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { auth } = useSelector((store) => store);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleEnableTwoStepVerification = (otp) => {
    dispatch(enableTwoStepAuthentication({ jwt: localStorage.getItem("jwt"), otp }))
  }

  const handleVerifyOtp = (otp) => {
    dispatch(verifyOtp({ jwt: localStorage.getItem("jwt"), otp }))
  }

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <div className="page-shell min-h-screen pb-12 animate-fadeIn">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <p className="page-kicker">Account Center</p>
          <h1 className="page-title">Profile & Security</h1>
          <p className="page-subtitle">Manage personal information, verification, and account safety settings.</p>
        </div>

        <div className="mb-8 flex items-center gap-4 panel-surface p-4 animate-slideUp">
          <Avatar className="h-16 w-16 ring-1 ring-cyan-300/25">
            <AvatarFallback className="bg-cyan-300 text-xl font-semibold text-slate-900">
              {auth.user?.fullName?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold">
              <UserRound className="h-5 w-5 text-cyan-300" />
              {auth.user?.fullName || "User Profile"}
            </h1>
            <p className="text-slate-400 text-sm">{auth.user?.email}</p>
          </div>
        </div>
        {/* Personal Information */}
        <Card className="glass-card border-cyan-300/20 mb-4 animate-slideUp" style={{ animationDelay: "80ms" }}>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserRound className="h-4 w-4 text-cyan-300" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-3">
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-sm text-slate-400">Email</span>
                <span className="text-sm">{auth.user?.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-sm text-slate-400">Full Name</span>
                <span className="text-sm">{auth.user?.fullName || "John Doe"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-sm text-slate-400">Date of Birth</span>
                <span className="text-sm">25/09/2000</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-sm text-slate-400">Nationality</span>
                <span className="text-sm">Indian</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-sm text-slate-400">Address</span>
                <span className="text-sm">123 Main Street</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-sm text-slate-400">City</span>
                <span className="text-sm">Mumbai</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-sm text-slate-400">Postcode</span>
                <span className="text-sm">345020</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-sm text-slate-400">Country</span>
                <span className="text-sm">India</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {/* 2FA */}
          <Card className="glass-card border-cyan-300/20 animate-slideUp" style={{ animationDelay: "140ms" }}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ShieldCheck className="h-4 w-4 text-cyan-300" />
                  2-Step Verification
                </CardTitle>
                {auth.user.twoFactorAuth?.enabled ? (
                  <Badge className="bg-emerald-400/20 border-emerald-300/30 text-emerald-200 text-xs">Enabled</Badge>
                ) : (
                  <Badge className="bg-amber-400/20 border-amber-300/30 text-amber-200 text-xs">Disabled</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-400 mb-3">
                Add extra security to your account
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="w-full btn-gradient">
                    Enable Verification
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-card border-cyan-300/30">
                  <DialogHeader>
                    <DialogTitle className="text-center gradient-text">
                      Verify Your Account
                    </DialogTitle>
                  </DialogHeader>
                  <AccountVarificationForm handleSubmit={handleEnableTwoStepVerification} />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card className="glass-card border-cyan-300/20 animate-slideUp" style={{ animationDelay: "200ms" }}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BadgeCheck className="h-4 w-4 text-cyan-300" />
                  Account Status
                </CardTitle>
                {auth.user.verified ? (
                  <Badge className="bg-emerald-400/20 border-emerald-300/30 text-emerald-200 text-xs">Verified</Badge>
                ) : (
                  <Badge className="bg-amber-400/20 border-amber-300/30 text-amber-200 text-xs">Pending</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Email</span>
                  <span>{auth.user.email}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Mobile</span>
                  <span>+918987667899</span>
                </div>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="w-full btn-gradient">Verify Account</Button>
                </DialogTrigger>
                <DialogContent className="glass-card border-cyan-300/30">
                  <DialogHeader>
                    <DialogTitle className="text-center gradient-text">
                      Verify Your Account
                    </DialogTitle>
                  </DialogHeader>
                  <AccountVarificationForm handleSubmit={handleVerifyOtp} />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        {/* Logout */}
        <Card className="glass-card border-red-500/25 animate-slideUp" style={{ animationDelay: "260ms" }}>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-red-300">Logout</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-400 mb-3">
              Sign out of your account
            </p>
            <Button
              onClick={handleLogout}
              size="sm"
              variant="outline"
              className="border-red-400/40 hover:border-red-400 hover:bg-red-400/10 text-red-300"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
