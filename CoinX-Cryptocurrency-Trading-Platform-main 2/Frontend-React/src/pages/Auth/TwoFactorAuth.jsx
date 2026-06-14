// Page component for TwoFactorAuth.
import { twoStepVerification } from "@/Redux/Auth/Action";
import CustomeToast from "@/components/custome/CustomeToast";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

const TwoFactorAuth = () => {
  const [value, setValue] = useState("");
  const dispatch = useDispatch();
  const {session}=useParams()
  const navigate=useNavigate()
  const { auth } = useSelector((store) => store);

  const handleTwoFactoreAuth = () => { 
    dispatch(twoStepVerification({otp:value,session,navigate}))
  }
  return (
    <div>
      <CustomeToast show={auth.error} message={auth.error?.error}/>
      <div className="page-shell flex flex-col gap-5 min-h-[80vh] justify-center items-center animate-fadeIn">
        {" "}
        
        <Card className="p-6 w-full max-w-md flex flex-col justify-center items-center glass-card border-cyan-300/25">
        <Avatar className="w-20 h-20 ring-1 ring-cyan-300/30">
          <AvatarImage  src="https://cdn.dribbble.com/users/1125847/screenshots/15197732/media/7201b01895b7b60d33eea77d098eb7b3.png?resize=1600x1200&vertical=center" />
        </Avatar>
          <CardHeader>
            <div className="flex items-center gap-5">
              <h1 className="text-xl font-semibold gradient-text">Two Step Verification</h1>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
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
            <p className="mt-2 text-slate-400 text-sm text-center">Check your email for OTP</p>
            </div>
            <Button onClick={handleTwoFactoreAuth} className="w-full btn-gradient">Verify</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TwoFactorAuth;
