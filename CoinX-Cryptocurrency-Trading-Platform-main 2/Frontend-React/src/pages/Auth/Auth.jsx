// Page component for Auth.
import "./Auth.css";
import { Button } from "@/components/ui/button";

import SignupForm from "./signup/SignupForm";
import LoginForm from "./login/login";
import { useLocation, useNavigate } from "react-router-dom";
import ForgotPasswordForm from "./ForgotPassword";
import { useSelector } from "react-redux";
import CustomeToast from "@/components/custome/CustomeToast";
import {
  ArrowRight,
  Clock3,
  LineChart,
  ShieldCheck,
  Wallet2,
} from "lucide-react";

const featurePillars = [
  {
    id: "01",
    title: "Risk-Aware Trading",
    tag: "Trading",
    description: "Track volatility and react faster with live market movement.",
    icon: LineChart,
  },
  {
    id: "02",
    title: "Hardened Security",
    tag: "Security",
    description: "Two-factor support and encrypted flows protect every session.",
    icon: ShieldCheck,
  },
  {
    id: "03",
    title: "Smart Portfolio Control",
    tag: "Portfolio",
    description: "Keep allocations balanced with performance insights in one place.",
    icon: Wallet2,
  },
];

const trustStats = [
  { metric: "Execution Speed", value: "< 120 ms", status: "Operational" },
  { metric: "Market Monitoring", value: "24/7", status: "Live" },
  { metric: "Supported Markets", value: "100+", status: "Expanding" },
];

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth } = useSelector((store) => store);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const isSignupPage = location.pathname === "/signup";
  const isForgotPasswordPage = location.pathname === "/forgot-password";

  return (
    <div className="authContainer relative overflow-hidden">
      <div className="authMesh pointer-events-none absolute inset-0 opacity-35"></div>
      <div className="pointer-events-none absolute left-[-180px] top-[-180px] h-[380px] w-[380px] rounded-full bg-cyan-400/20 blur-3xl"></div>
      <div className="pointer-events-none absolute bottom-[-220px] right-[-140px] h-[420px] w-[420px] rounded-full bg-amber-400/20 blur-3xl"></div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/70 shadow-[0_25px_120px_rgba(2,6,23,0.8)] backdrop-blur-xl lg:grid lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative hidden border-r border-white/10 bg-slate-900 p-10 lg:flex lg:flex-col lg:justify-between xl:p-12">
            <div>
              <div className="mb-10 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.24em] text-slate-200">
                <Clock3 className="h-3.5 w-3.5 text-cyan-300" />
                Real-Time Crypto Intelligence
              </div>

              <p className="mb-3 text-xs uppercase tracking-[0.24em] text-cyan-200">
                Why CoinX
              </p>
              <h1 className="mb-4 text-5xl font-bold leading-tight text-white xl:text-6xl">
                <span className="gradient-text-orange">Coin</span>
                <span className="gradient-text">X</span>
              </h1>
              <p className="max-w-xl text-lg text-slate-300">
                Trade with confidence using fast execution, clear portfolio insights,
                and security-first account protection.
              </p>
            </div>

            <div className="space-y-5">
              <p className="py-2 text-xs uppercase tracking-[0.24em] text-slate-400">
                Platform Highlights
              </p>
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-sm">
                <table className="w-full table-fixed border-collapse text-left">
                  <thead className="border-b border-white/10 bg-white/5">
                    <tr>
                      <th className="w-14 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-slate-500">No.</th>
                      <th className="w-14 px-1 py-2 text-[11px] uppercase tracking-[0.18em] text-slate-500">Icon</th>
                      <th className="px-2 py-2 text-[11px] uppercase tracking-[0.18em] text-slate-500">Capability</th>
                      <th className="w-24 px-2 py-2 text-[11px] uppercase tracking-[0.18em] text-slate-500">Category</th>
                      <th className="px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-slate-500">Summary</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {featurePillars.map(({ id, tag, title, description, icon: Icon }) => (
                      <tr key={title}>
                        <td className="px-3 py-3 text-xs font-semibold text-cyan-300">{id}</td>
                        <td className="px-1 py-3">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-300/20 text-cyan-200">
                            <Icon className="h-4 w-4" />
                          </span>
                        </td>
                        <td className="px-2 py-3 text-sm font-semibold text-white">{title}</td>
                        <td className="px-2 py-3">
                          <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] text-slate-300">
                            {tag}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-xs leading-relaxed text-slate-300">{description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-8">
              <p className="mb-3 text-xs uppercase tracking-[0.24em] text-slate-400">
                Trust Metrics
              </p>
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-sm">
                <div className="grid grid-cols-[1.1fr_0.7fr_0.8fr] items-center border-b border-white/10 bg-white/5 px-4 py-2">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Metric</p>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Value</p>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Status</p>
                </div>
                <div className="divide-y divide-white/10">
                  {trustStats.map((item) => (
                    <div
                      key={item.metric}
                      className="grid grid-cols-[1.1fr_0.7fr_0.8fr] items-center gap-2 px-4 py-3"
                    >
                      <p className="text-sm font-medium text-slate-200">{item.metric}</p>
                      <p className="text-sm font-semibold text-white">{item.value}</p>
                      <span className="inline-flex w-fit rounded-full border border-cyan-300/30 bg-cyan-300/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] text-cyan-200">
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-center px-6 py-8 sm:px-8 lg:px-10">
            <div className="pointer-events-none absolute inset-0 bg-cyan-300/5"></div>

            <div className="relative w-full max-w-md animate-fadeIn">
              <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-5 sm:p-6">
                <CustomeToast show={auth.error} message={auth.error?.error} />

                <div className="mb-6 lg:hidden">
                  <p className="mb-2 text-xs uppercase tracking-[0.2em] text-cyan-200">
                    Welcome to
                  </p>
                  <h1 className="text-4xl font-bold text-white">
                    <span className="gradient-text-orange">Coin</span>
                    <span className="gradient-text">X</span>
                  </h1>
                </div>

                {!isForgotPasswordPage && (
                  <div className="mb-8 grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-slate-900/70 p-1">
                    <Button
                      onClick={() => handleNavigation("/signin")}
                      variant="ghost"
                      className={`h-10 rounded-lg text-sm ${!isSignupPage
                        ? "bg-white text-slate-900 hover:bg-slate-100 hover:text-slate-900"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                        }`}
                    >
                      Sign In
                    </Button>
                    <Button
                      onClick={() => handleNavigation("/signup")}
                      variant="ghost"
                      className={`h-10 rounded-lg text-sm ${isSignupPage
                        ? "bg-white text-slate-900 hover:bg-slate-100 hover:text-slate-900"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                        }`}
                    >
                      Sign Up
                    </Button>
                  </div>
                )}

                <div className="mb-6 border-b border-white/10 pb-4">
                  <p className="mb-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                    Account Access
                  </p>
                  <h2 className="text-2xl font-semibold text-white">
                    {isSignupPage
                      ? "Create your account"
                      : isForgotPasswordPage
                        ? "Reset your password"
                        : "Sign in to your account"}
                  </h2>
                  <p className="mt-2 text-sm text-slate-400">
                    {isSignupPage
                      ? "Start your trading journey in minutes with a secure setup."
                      : isForgotPasswordPage
                        ? "Enter your email and we will send a one-time password."
                        : "Access your live watchlist, portfolio and real-time market tools."}
                  </p>
                </div>

                {isSignupPage ? (
                  <div className="space-y-6">
                    <SignupForm />
                    <div className="flex items-center justify-center gap-1 text-sm text-slate-400">
                      <span>Already have an account?</span>
                      <Button
                        onClick={() => handleNavigation("/signin")}
                        variant="ghost"
                        className="h-auto p-0 text-cyan-300 hover:bg-transparent hover:text-cyan-200"
                      >
                        Sign In
                        <ArrowRight className="ml-1 h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ) : isForgotPasswordPage ? (
                  <div className="space-y-6">
                    <ForgotPasswordForm />
                    <div className="flex items-center justify-center gap-1 text-sm text-slate-400">
                      <span>Remember your password?</span>
                      <Button
                        onClick={() => navigate("/signin")}
                        variant="ghost"
                        className="h-auto p-0 text-cyan-300 hover:bg-transparent hover:text-cyan-200"
                      >
                        Back to Sign In
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <LoginForm />
                    <div className="flex items-center justify-center gap-1 text-sm text-slate-400">
                      <span>New to CoinX?</span>
                      <Button
                        onClick={() => handleNavigation("/signup")}
                        variant="ghost"
                        className="h-auto p-0 text-cyan-300 hover:bg-transparent hover:text-cyan-200"
                      >
                        Create Account
                        <ArrowRight className="ml-1 h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
