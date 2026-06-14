// Page component for TradingHistory.
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getAllOrdersForUser } from "@/Redux/Order/Action";
import { calculateProfit } from "@/Util/calculateProfit";
import { readableDate } from "@/Util/readableDate";

const TradingHistory = () => {
  const dispatch = useDispatch();
  const { order } = useSelector((store) => store);

  useEffect(() => {
    dispatch(getAllOrdersForUser({ jwt: localStorage.getItem("jwt") }));
  }, [dispatch]);

  return (
    <div className="table-shell">
      <Table>
        <TableHeader>
          <TableRow className="bg-white/5">
            <TableHead>Date & Time</TableHead>
            <TableHead>Trading Pair</TableHead>
            <TableHead>Buy Price</TableHead>
            <TableHead>Selling Price</TableHead>
            <TableHead>Order Type</TableHead>
            <TableHead>Profit/Loss</TableHead>
            <TableHead className="text-right">Value</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {order.orders?.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <p>{readableDate(item.timestamp).date}</p>
                <p className="text-xs text-slate-400">{readableDate(item.timestamp).time}</p>
              </TableCell>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Avatar className="h-9 w-9 ring-1 ring-cyan-300/20">
                    <AvatarImage
                      src={item.orderItem.coin.image}
                      alt={item.orderItem.coin.symbol}
                    />
                  </Avatar>
                  <span>{item.orderItem.coin.name}</span>
                </div>
              </TableCell>

              <TableCell>${item.orderItem.buyPrice}</TableCell>
              <TableCell>{item.orderItem.sellPrice ? `$${item.orderItem.sellPrice}` : "-"}</TableCell>
              <TableCell>{item.orderType}</TableCell>
              <TableCell
                className={calculateProfit(item) < 0 ? "text-rose-300" : "text-emerald-300"}
              >
                {item.orderType === "SELL" ? calculateProfit(item) : "-"}
              </TableCell>
              <TableCell className="text-right font-medium">${item.price}</TableCell>
            </TableRow>
          ))}

          {!order.orders?.length && (
            <TableRow>
              <TableCell colSpan={7}>
                <div className="empty-state">
                  No trading history found yet.
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TradingHistory;
