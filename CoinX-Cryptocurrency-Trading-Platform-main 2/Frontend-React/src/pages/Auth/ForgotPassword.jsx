// Page component for ForgotPassword.
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
import { useDispatch } from "react-redux";
import { sendResetPassowrdOTP } from "@/Redux/Auth/Action";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Loader2, Mail } from "lucide-react";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
});
const ForgotPasswordForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await dispatch(
        sendResetPassowrdOTP({
          sendTo: data.email,
          navigate,
          verificationType: "EMAIL",
        })
      );
    } finally {
      setIsSubmitting(false);
    }
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
                <FormLabel className="text-sm font-medium text-slate-200">
                  Email Address
                </FormLabel>
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

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-11 w-full rounded-xl bg-white text-slate-900 hover:bg-slate-100 hover:shadow-[0_10px_24px_rgba(226,232,240,0.2)]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending OTP...
              </>
            ) : (
              "Send OTP"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ForgotPasswordForm;
