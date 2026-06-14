// Page component for Wallet.
import {
  depositMoney,
  getUserWallet,
  getWalletTransactions,
} from "@/Redux/Wallet/Action";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowDownLeft,
  ArrowUpCircle,
  ArrowUpDown,
  Copy,
  DollarSign,
  RefreshCw,
  Sparkles,
  WalletIcon,
} from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import TopupForm from "./TopupForm";
import TransferForm from "./TransferForm";
import WithdrawForm from "./WithdrawForm";
import { getPaymentDetails } from "@/Redux/Withdrawal/Action";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import SpinnerBackdrop from "@/components/custome/SpinnerBackdrop";


function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const Wallet = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { wallet } = useSelector((store) => store);
  const query = useQuery();
  const paymentId = query.get("payment_id");
  const razorpayPaymentId = query.get("razorpay_payment_id");
  const orderId = query.get("order_id");
  const { order_id } = useParams();

  useEffect(() => {
    if (orderId || order_id) {
      dispatch(
        depositMoney({
          jwt: localStorage.getItem("jwt"),
          orderId: orderId || order_id,
          paymentId: razorpayPaymentId || "AuedkfeuUe",
          navigate,
        })
      );
    }
  }, [dispatch, orderId, order_id, razorpayPaymentId, navigate]);

  useEffect(() => {
    handleFetchUserWallet();
    hanldeFetchWalletTransactions();
    dispatch(getPaymentDetails({ jwt: localStorage.getItem("jwt") }));
  }, [dispatch]);

  const handleFetchUserWallet = () => {
    dispatch(getUserWallet(localStorage.getItem("jwt")));
  };

  const hanldeFetchWalletTransactions = () => {
    dispatch(getWalletTransactions({ jwt: localStorage.getItem("jwt") }));
  };

  function copyToClipboard(text) {
    if (!text) return;
    try {
      navigator.clipboard.writeText(String(text));
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  }

  if (wallet.loading) {
    return <SpinnerBackdrop />
  }

  return (
    <div className="page-shell animate-fadeIn">
      <div className="mb-6">
        <p className="page-kicker">Wallet Hub</p>
        <h1 className="page-title">Wallet & Transactions</h1>
        <p className="page-subtitle">Add funds, withdraw, transfer, and track all wallet activity in one place.</p>
      </div>

      <div className="w-full lg:w-[70%]">
        <Card className="glass-card border-cyan-300/25 hover-lift animate-slideUp">
          <CardHeader className="pb-7">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-5">
                <WalletIcon className="h-8 w-8 text-cyan-300" />
                <div>
                  <CardTitle className="text-2xl gradient-text">My Wallet</CardTitle>
                  <div className="flex items-center gap-2">
                    <p className="text-slate-300 text-sm">
                      #FAVHJY{wallet.userWallet?.id}
                    </p>

                    <Copy
                      onClick={() => copyToClipboard(wallet.userWallet?.id)}
                      className="h-4 w-4 cursor-pointer transition-transform hover:scale-110 hover:text-cyan-300"
                    />
                  </div>
                </div>
              </div>
              <div>
                <RefreshCw
                  onClick={handleFetchUserWallet}
                  className="h-6 w-6 cursor-pointer transition-all duration-500 hover:rotate-180 hover:text-cyan-300"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center glass-card p-4 rounded-xl border border-cyan-300/25">
              <DollarSign className="text-emerald-300" />

              <span className="text-2xl font-semibold gradient-text">
                {wallet.userWallet?.balance}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-5">
              <Dialog className="">
                <DialogTrigger>
                  <div className="h-24 w-full hover-lift cursor-pointer flex flex-col items-center justify-center rounded-xl glass-card border border-cyan-300/20 hover:border-cyan-300/45 group">
                    <ArrowUpCircle className="text-emerald-300 transition-transform group-hover:scale-110" />
                    <span className="text-sm mt-2 ">Add Money</span>
                  </div>
                </DialogTrigger>
                <DialogContent className="p-8 glass-card border-cyan-300/25">
                  <DialogHeader>
                    <DialogTitle className="text-center text-2xl gradient-text">
                      Top Up Your Wallet
                    </DialogTitle>
                    <TopupForm />
                  </DialogHeader>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger>
                  <div className="h-24 w-full hover-lift cursor-pointer flex flex-col items-center justify-center rounded-xl glass-card border border-cyan-300/20 hover:border-cyan-300/45 group">
                    <ArrowDownLeft className="text-amber-300 transition-transform group-hover:scale-110" />
                    <span className="text-sm mt-2">Withdraw</span>
                  </div>
                </DialogTrigger>
                <DialogContent className="p-8 glass-card border-cyan-300/25">
                  <DialogHeader>
                    <DialogTitle className="text-center text-xl gradient-text">
                      Request Withdrawal
                    </DialogTitle>
                    <WithdrawForm />
                  </DialogHeader>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger>
                  <div className="h-24 w-full hover-lift cursor-pointer flex flex-col items-center justify-center rounded-xl glass-card border border-cyan-300/20 hover:border-cyan-300/45 group">
                    <ArrowUpDown className="text-sky-300 transition-transform group-hover:scale-110" />
                    <span className="text-sm mt-2">Transfer</span>
                  </div>
                </DialogTrigger>
                <DialogContent className="p-8 glass-card border-cyan-300/25">
                  <DialogHeader>
                    <DialogTitle className="text-center text-xl gradient-text">
                      Transfer To Other Wallet
                    </DialogTitle>
                    <TransferForm />
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
        <div className="py-5 pt-10 animate-slideUp" style={{ animationDelay: "100ms" }}>
          <div className="flex gap-2 items-center pb-5">
            <h1 className="text-2xl font-semibold gradient-text">History</h1>
            <RefreshCw
              onClick={hanldeFetchWalletTransactions}
              className="h-6 w-6 cursor-pointer transition-all duration-500 hover:rotate-180 hover:text-cyan-300"
            />
          </div>

          <div className="space-y-3">
            {wallet.transactions?.map((item, index) => (
              <div key={item.id || `${item.date}-${item.type || item.purpose}-${index}`} className="animate-slideUp" style={{ animationDelay: `${index * 50}ms` }}>
                <Card className="px-5 py-2 flex justify-between items-center glass-card border-cyan-300/20 hover-lift">
                  <div className="flex items-center gap-5">
                    <Avatar className="bg-cyan-300">
                      <AvatarFallback>
                        <Sparkles className="h-4 w-4 text-slate-900" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <h1 className="font-semibold">{item.type || item.purpose}</h1>
                      <p className="text-sm text-slate-500">{item.date}</p>
                    </div>
                  </div>
                  <div>
                    <p className="flex items-center font-semibold">
                      <span className={`${item.amount > 0 ? "text-emerald-300" : "text-rose-300"}`}>{item.amount} USD</span>
                    </p>
                  </div>
                </Card>
              </div>
            ))}
            {!wallet.transactions?.length && (
              <div className="empty-state">No wallet transactions found yet.</div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Wallet;
