// Page component for login.
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { login } from "@/Redux/Auth/Action";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/Api/api";
import { Eye, EyeOff, Loader2, LockKeyhole, Mail } from "lucide-react";
import { useEffect, useState } from "react";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

const rememberedEmailStorageKey = "coinx.rememberedEmail";

const LoginForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { auth } = useSelector((store) => store);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    const rememberedEmail = localStorage.getItem(rememberedEmailStorageKey);
    if (rememberedEmail) {
      form.setValue("email", rememberedEmail);
      setRememberEmail(true);
    }
  }, [form]);

  const onSubmit = (data) => {
    if (rememberEmail) {
      localStorage.setItem(rememberedEmailStorageKey, data.email);
    } else {
      localStorage.removeItem(rememberedEmailStorageKey);
    }

    dispatch(login({ ...data, navigate }));
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/login/google`;
  };

  return (
    <div className="space-y-5 animate-slideUp">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm font-medium text-slate-200">Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <Input
                      {...field}
                      type="email"
                      className="h-11 rounded-xl border-white/15 bg-slate-900/60 pl-10 text-slate-100 placeholder:text-slate-500 focus-visible:ring-cyan-300/40"
                      placeholder="you@example.com"
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-rose-300" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm font-medium text-slate-200">Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      className="h-11 rounded-xl border-white/15 bg-slate-900/60 pl-10 pr-10 text-slate-100 placeholder:text-slate-500 focus-visible:ring-cyan-300/40"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-white/5 hover:text-slate-200"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-rose-300" />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between text-xs sm:text-sm">
            <label className="flex cursor-pointer items-center gap-2 text-slate-400">
              <input
                type="checkbox"
                checked={rememberEmail}
                onChange={(event) => setRememberEmail(event.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-slate-900 text-cyan-300 focus:ring-cyan-300/40"
              />
              Remember email
            </label>
            <button
              type="button"
              className="font-medium text-cyan-300 transition hover:text-cyan-200"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot password?
            </button>
          </div>

          <Button
            type="submit"
            disabled={auth.loading}
            className="h-11 w-full rounded-xl bg-white text-slate-900 hover:bg-slate-100 hover:shadow-[0_10px_24px_rgba(226,232,240,0.2)]"
          >
            {auth.loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </Form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-transparent px-2 text-slate-500">or continue with</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="h-11 w-full rounded-xl border-white/20 bg-white/5 text-slate-200 hover:bg-white/10"
        onClick={handleGoogleLogin}
      >
        <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] font-semibold text-slate-900">
          G
        </span>
        Continue with Google
      </Button>
    </div>
  );
};

export default LoginForm;
