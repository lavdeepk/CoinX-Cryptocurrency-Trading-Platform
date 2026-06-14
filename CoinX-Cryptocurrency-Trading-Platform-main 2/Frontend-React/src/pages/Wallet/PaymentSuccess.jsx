// Page component for PaymentSuccess.
import { getUserWallet } from '@/Redux/Wallet/Action'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ReloadIcon } from '@radix-ui/react-icons'
import { DollarSignIcon, WalletIcon } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'

const PaymentSuccess = () => {
  const dispatch = useDispatch();
  const { wallet } = useSelector((store) => store);

  const handleFetchUserWallet = () => {
    dispatch(getUserWallet(localStorage.getItem("jwt")));
  };
  return (
    <div className='page-shell flex flex-col justify-center items-center min-h-[70vh] animate-fadeIn'>
      <h1 className='text-2xl font-semibold pb-5 gradient-text'>Payment Added Successfully</h1>
      <Card className="w-full max-w-2xl glass-card border-cyan-300/20">
          <CardHeader className="pb-9 ">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-5">
                <WalletIcon className="h-8 w-8 text-cyan-300" />
                <CardTitle className="text-2xl">My Balance</CardTitle>
              </div>
              <div>
                <Button
                  onClick={handleFetchUserWallet}
                  variant="ghost"
                  size="icon"
                  className="rounded-full border border-white/15 bg-white/5 hover:bg-white/10"
                >
                  <ReloadIcon className="w-6 h-6" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center ">
              <DollarSignIcon className="text-emerald-300" />

              <span className="text-2xl font-semibold">
                {wallet.userWallet?.balance}
              </span>
            </div>

          </CardContent>
        </Card>
    </div>
  )
}

export default PaymentSuccess
