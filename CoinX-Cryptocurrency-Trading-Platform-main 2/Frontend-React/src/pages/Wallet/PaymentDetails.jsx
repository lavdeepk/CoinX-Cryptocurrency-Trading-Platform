// Page component for PaymentDetails.
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import PaymentDetailsForm from "./PaymentDetailsForm";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { getPaymentDetails } from "@/Redux/Withdrawal/Action";
import { maskAccountNumber } from "@/Util/maskAccountNumber";

const PaymentDetails = () => {
  const dispatch = useDispatch();
  const { withdrawal } = useSelector((store) => store);

  useEffect(() => {
    dispatch(getPaymentDetails({ jwt: localStorage.getItem("jwt") }));
  }, [dispatch]);

  return (
    <div className="page-shell animate-fadeIn">
      <div className="mb-6">
        <p className="page-kicker">Payout Setup</p>
        <h1 className="page-title">Payment Details</h1>
        <p className="page-subtitle">Manage your bank details used for withdrawals.</p>
      </div>
      {withdrawal.paymentDetails ? (
        <Card className="mb-10 glass-card border-cyan-300/20 max-w-2xl">
          <CardHeader>
            <CardTitle className="text-xl gradient-text">
              {withdrawal.paymentDetails?.bankName.toUpperCase()}
            </CardTitle>
            <CardDescription className="text-slate-400">
              A/C No:{" "}
              {maskAccountNumber(withdrawal.paymentDetails?.accountNumber)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <p className="w-32">A/C Holder</p>
              <p className="text-slate-400">
                : {withdrawal.paymentDetails.accountHolderName}
              </p>
            </div>
            <div className="flex items-center">
              <p className="w-32">IFSC</p>
              <p className="text-slate-400">
                : {withdrawal.paymentDetails.ifsc.toUpperCase()}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Dialog>
          <DialogTrigger>
            <Button className="h-11 btn-gradient">Add Payment Details</Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-cyan-300/25">
            <DialogHeader className="pb-5">
              <DialogTitle>Payment Details</DialogTitle>
            </DialogHeader>
            <PaymentDetailsForm />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default PaymentDetails;
