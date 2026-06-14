// Page component for TopupForm.
import { paymentHandler } from "@/Redux/Wallet/Action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { DotFilledIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import razorpayLogo from "@/assets/payment/razorpay.svg";
import stripeLogo from "@/assets/payment/stripe.svg";

const TopupForm = () => {
  const [amount, setAmount] = useState();
  const [paymentMethod, setPaymentMethod] = useState("RAZORPAY");
  const { wallet } = useSelector((store) => store);
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setAmount(e.target.value);
  };

  const handleSubmit = () => {
    dispatch(
      paymentHandler({
        jwt: localStorage.getItem("jwt"),
        paymentMethod,
        amount,
      })
    );
  };
  return (
    <div className="pt-4 space-y-5">
      <div>
        <h1 className="pb-1 text-sm text-slate-300">Enter Amount</h1>
        <Input
          onChange={handleChange}
          value={amount}
          className="h-12 text-base"
          placeholder="$9999"
        />
      </div>

      <div>
        <h1 className="pb-1 text-sm text-slate-300">Select payment method</h1>
        <RadioGroup
          onValueChange={(value) => {
            setPaymentMethod(value);
          }}
          className="flex"
          defaultValue="RAZORPAY"
        >
          <div className="flex items-center space-x-2 border border-white/15 bg-white/5 p-3 px-5 rounded-xl">
            <RadioGroupItem
              icon={DotFilledIcon}
              iconClassName="h-8 w-8"
              className="h-9 w-9"
              value="RAZORPAY"
              id="r1"
            />
            <Label htmlFor="r1">
              <div className="w-32 rounded-md bg-white px-3 py-2">
                <img
                  src={razorpayLogo}
                  alt="Razorpay"
                  className="h-10 w-full object-contain"
                />
              </div>
            </Label>
          </div>
          <div className="flex items-center space-x-2 rounded-xl border border-white/15 bg-white/5 p-3 px-5">
            <RadioGroupItem
              icon={DotFilledIcon}
              className="h-9 w-9"
              iconClassName="h-8 w-8"
              value="STRIPE"
              id="r2"
            />
            <Label htmlFor="r2">
              <div className="w-32 rounded-md bg-white px-3 py-2">
                <img
                  src={stripeLogo}
                  alt="Stripe"
                  className="h-10 w-full object-contain"
                />
              </div>
            </Label>
          </div>
        </RadioGroup>
      </div>
      {wallet.loading ? (
        <Skeleton className="h-12 w-full" />
      ) : (
        <Button
          onClick={handleSubmit}
          className="w-full h-12 text-base btn-gradient"
        >
          Submit
        </Button>
      )}
    </div>
  );
};

export default TopupForm;
