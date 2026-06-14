// Page component for TransferForm.
import { transferMoney } from "@/Redux/Wallet/Action";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useDispatch } from "react-redux";

const TransferForm = () => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    amount: "",
    walletId: "",
    purpose: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // setAmount(e.target.value);
  };

  const handleSubmit = () => {
    dispatch(
      transferMoney({
        jwt: localStorage.getItem("jwt"),
        walletId: formData.walletId,
        reqData: {
          amount: formData.amount,
          purpose: formData.purpose,
        },
      })
    );
  };
  return (
    <div className="pt-4 space-y-5">
      <div>
        <h1 className="pb-1 text-sm text-slate-300">Enter Amount</h1>
        <Input
          name="amount"
          onChange={handleChange}
          value={formData.amount}
          className="h-12"
          placeholder="$9999"
        />
      </div>
      <div>
        <h1 className="pb-1 text-sm text-slate-300">Enter Wallet Id</h1>
        <Input
          name="walletId"
          onChange={handleChange}
          value={formData.walletId}
          className="h-12"
          placeholder="#ADFE34456"
        />
      </div>

      <div>
        <h1 className="pb-1 text-sm text-slate-300">Purpose</h1>
        <Input
          name="purpose"
          onChange={handleChange}
          value={formData.purpose}
          className="h-12"
          placeholder="gift for your friend..."
        />
      </div>

      <DialogClose>
        <Button
          onClick={handleSubmit}
          className="w-full h-12 text-base btn-gradient"
        >
          Send
        </Button>
      </DialogClose>
    </div>
  );
};

export default TransferForm;
