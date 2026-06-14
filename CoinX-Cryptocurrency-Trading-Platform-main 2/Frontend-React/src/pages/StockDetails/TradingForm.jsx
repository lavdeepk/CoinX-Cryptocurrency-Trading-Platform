// Page component for TradingForm.
import { getAssetDetails } from "@/Redux/Assets/Action";
import { payOrder } from "@/Redux/Order/Action";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { DollarSign } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const TradingForm = () => {
  const { coin, asset, wallet } = useSelector((store) => store);
  const [quantity, setQuantity] = useState(0);
  const [amount, setAmount] = useState(0);
  const dispatch = useDispatch();
  const [orderType, setOrderType] = useState("BUY");

  const handleOnChange = (e) => {
    const amount = e.target.value;
    setAmount(amount);
    const volume = calculateBuyCost(amount, coin.coinDetails?.market_data?.current_price?.usd || 1);
    setQuantity(volume);
  };

  function calculateBuyCost(amountUSD, cryptoPrice) {
    let volume = amountUSD / cryptoPrice;

    let decimalPlaces = Math.max(
      2,
      cryptoPrice.toString().split(".")[0].length
    );

    return volume.toFixed(decimalPlaces);
  }

  const handleBuyCrypto = () => {
    dispatch(
      payOrder({
        jwt: localStorage.getItem("jwt"),
        amount,
        orderData: {
          coinId: coin.coinDetails?.id,
          quantity,
          orderType,
        },
      })
    );
  };

  useEffect(() => {
    if (coin.coinDetails?.id) {
      dispatch(getAssetDetails({ coinId: coin.coinDetails.id, jwt: localStorage.getItem("jwt") }));
    }
  }, [dispatch, coin.coinDetails?.id]);


  return (
    <div className="space-y-8 p-3 animate-fadeIn">
      <div>
        <div className=" flex gap-4 items-center justify-between">
          <Input
            className="h-12 focus:outline-none "
            placeholder="enter amount..."
            onChange={handleOnChange}
            type="number"
          />
          <div>
            <p className="border border-white/15 bg-white/5 text-2xl flex justify-center items-center w-36 h-12 rounded-xl">
              {quantity}
            </p>
          </div>
        </div>
        {orderType === "SELL" ?
          (asset.assetDetails?.quantity * coin.coinDetails?.current_price <
            amount) && (
            <h1 className="text-rose-300 text-center pt-4">
              Insufficient quantity to sell
            </h1>
          ) : (quantity * coin.coinDetails?.market_data.current_price.usd >
            wallet.userWallet?.balance) && (
            <h1 className="text-rose-300 text-center pt-4">
              Insufficient Wallet Balance To Buy
            </h1>
          )}
      </div>

      <div className="flex gap-5 items-center">
        <div>
          <Avatar className="ring-1 ring-cyan-300/30">
            <AvatarImage src={coin.coinDetails?.image.large} />
          </Avatar>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p>{coin.coinDetails?.symbol?.toUpperCase()}</p>
            <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
            <p className="text-gray-400">{coin.coinDetails?.name}</p>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-xl font-bold">
              {coin.coinDetails?.market_data.current_price.usd}
            </p>
            <p
              className={`${
                coin.coinDetails?.market_data.market_cap_change_24h < 0
                  ? "text-rose-300"
                  : "text-emerald-300"
              }`}
            >
              <span className="">
                {coin.coinDetails?.market_data.market_cap_change_24h}
              </span>
              <span>
                ({coin.coinDetails?.market_data.market_cap_change_percentage_24h}%)
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p>Order Type</p>
        <p>Market Order</p>
      </div>
      <div className="flex items-center justify-between">
        <p>{orderType === "BUY" ? "Available Cash" : "Available Quantity"}</p>
        <div>
          {orderType === "BUY" ? (
            <div className="flex items-center ">
              <DollarSign />

              <span className="text-2xl font-semibold">
                {wallet.userWallet?.balance}
              </span>
            </div>
          ) : (
            <p>{asset.assetDetails?.quantity || 0}</p>
          )}
        </div>
      </div>
      <div className="">
        <DialogClose className="w-full">
          <Button
          onClick={handleBuyCrypto}
          className={`w-full h-12 ${
            orderType === "SELL" ? "bg-red-500 text-white hover:bg-red-400" : "btn-gradient"
          }`}
          disabled={
            quantity === 0 ||
            (orderType === "SELL" && !asset.assetDetails?.quantity) ||
            (orderType === "SELL" ?
              (asset.assetDetails?.quantity * coin.coinDetails?.market_data.current_price.usd <
                amount):quantity * coin.coinDetails?.market_data.current_price.usd >
                wallet.userWallet?.balance)
          }
        >
          {orderType}
        </Button>
        </DialogClose>
        

        <Button
          onClick={() => setOrderType(orderType === "BUY" ? "SELL" : "BUY")}
          className="w-full mt-3 text-lg"
          variant="link"
        >
          {orderType === "BUY" ? "Or Sell" : "Or Buy"}
        </Button>
      </div>
    </div>
  );
};

export default TradingForm;
