// Page component for SignupForm.
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
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { register } from "@/Redux/Auth/Action";
import { Eye, EyeOff, Loader2, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useState } from "react";

const formSchema = z.object({
  fullName: z.string().nonempty("Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});
const SignupForm = () => {
  const { auth } = useSelector((store) => store);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
    },
  });
  const onSubmit = (data) => {
    dispatch(register({ ...data, navigate }));
  };
  return (
    <div className="space-y-5 animate-slideUp">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm font-medium text-slate-200">Full Name</FormLabel>
                <FormControl>
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <Input
                      {...field}
                      type="text"
                      className="h-11 rounded-xl border-white/15 bg-slate-900/60 pl-10 text-slate-100 placeholder:text-slate-500 focus-visible:ring-cyan-300/40"
                      placeholder="Enter your full name"
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-rose-300" />
              </FormItem>
            )}
          />
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
                      placeholder="Create a strong password"
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

          <Button
            type="submit"
            disabled={auth.loading}
            className="h-11 w-full rounded-xl bg-white text-slate-900 hover:bg-slate-100 hover:shadow-[0_10px_24px_rgba(226,232,240,0.2)]"
          >
            {auth.loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default SignupForm;
