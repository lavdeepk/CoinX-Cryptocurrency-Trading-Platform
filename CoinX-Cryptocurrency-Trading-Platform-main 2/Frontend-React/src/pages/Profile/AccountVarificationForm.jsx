// Page component for AccountVarificationForm.
import { sendVerificationOtp } from "@/Redux/Auth/Action";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const AccountVarificationForm = ({handleSubmit}) => {
  const [value, setValue] = useState("");
  const dispatch = useDispatch();
  const {auth}=useSelector(store=>store);

  const handleSendOtp = (verificationType) => {
    dispatch(
      sendVerificationOtp({
        verificationType,
        jwt: localStorage.getItem("jwt"),
      })
    );
  };

  
  return (
    <div className="flex justify-center">
      <div className="space-y-5 mt-4 w-full">
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
          <p className="text-slate-400">Email :</p>
          <p>{auth.user?.email}</p>
          <Dialog>
            <DialogTrigger>
            <Button
              onClick={() => handleSendOtp("EMAIL")}
              >
                Send OTP
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-cyan-300/25">
              <DialogHeader>
                <DialogTitle className="px-10 pt-2 text-center gradient-text">
                  Enter OTP
                </DialogTitle>
              </DialogHeader>
              <div className="py-5 flex flex-col gap-6 justify-center items-center">
                <InputOTP
                  value={value}
                  onChange={(value) => setValue(value)}
                  maxLength={6}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
                <DialogClose>
                  <Button onClick={()=>handleSubmit(value)} className="w-40 btn-gradient">Submit</Button>
                </DialogClose>
                
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default AccountVarificationForm;
