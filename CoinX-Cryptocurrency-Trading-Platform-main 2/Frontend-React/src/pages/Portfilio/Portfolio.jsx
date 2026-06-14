// Page component for Portfolio.
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserAssets } from "@/Redux/Assets/Action";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import TradingHistory from "./TradingHistory";
import { useNavigate } from "react-router-dom";

const Portfolio = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [currentTab, setCurrentTab] = useState("portfolio");
  const { asset } = useSelector((store) => store);

  useEffect(() => {
    dispatch(getUserAssets(localStorage.getItem("jwt")));
  }, [dispatch]);

  const handleTabChange = (value) => {
    setCurrentTab(value);
  };

  return (
    <div className="page-shell animate-fadeIn">
      <div className="mb-6">
        <p className="page-kicker">Portfolio Center</p>
        <h1 className="page-title">Assets & Trading History</h1>
        <p className="page-subtitle">Track holdings, performance, and historical orders in one place.</p>
      </div>

      <div className="pb-5 flex items-center gap-5">
        <Select onValueChange={handleTabChange} defaultValue="portfolio">
          <SelectTrigger className="w-[190px]">
            <SelectValue placeholder="Select Portfolio" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="portfolio">Portfolio</SelectItem>
            <SelectItem value="history">History</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {
        currentTab === "portfolio" ? (
          <div className="table-shell">
            <Table className="px-5 relative">
              <TableHeader>
                <TableRow className="sticky top-0 left-0 right-0 bg-white/5 backdrop-blur-sm">
                  <TableHead className="font-semibold">Assets</TableHead>
                <TableHead className="font-semibold">PRICE</TableHead>
                <TableHead className="font-semibold">UNIT</TableHead>
                <TableHead className="font-semibold">CHANGE</TableHead>
                <TableHead className="font-semibold">CHANGE(%)</TableHead>
                <TableHead className="text-right font-semibold">VALUE</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {asset.userAssets?.map((item, index) => (
                <TableRow
                  onClick={() => navigate(`/market/${item.coin.id}`)}
                  key={item.id}
                  className="cursor-pointer animate-slideUp"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <TableCell className="font-medium flex items-center gap-2">
                    <Avatar className="-z-50 ring-2 ring-cyan-300/30">
                      <AvatarImage
                        src={item.coin.image}
                        alt={item.coin.symbol}
                      />
                    </Avatar>
                    <span className="font-semibold"> {item.coin.name}</span>
                  </TableCell>
                  <TableCell className="font-semibold">${item.coin.current_price?.toLocaleString?.() || item.coin.current_price}</TableCell>
                  <TableCell className="font-semibold">{item.quantity}</TableCell>
                  <TableCell
                    className={`font-semibold ${item.coin.price_change_percentage_24h < 0
                      ? "text-rose-300"
                      : "text-emerald-300"
                      }`}
                  >
                    {item.coin.price_change_24h}
                  </TableCell>
                  <TableCell
                    className={`font-semibold ${item.coin.price_change_percentage_24h < 0
                      ? "text-rose-300"
                      : "text-emerald-300"
                      }`}
                  >
                    {item.coin.price_change_percentage_24h}%
                  </TableCell>

                  <TableCell className="text-right font-semibold">
                    ${(item.coin.current_price * item.quantity).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
              {!asset.userAssets?.length && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <div className="empty-state">No assets found in your portfolio yet.</div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          </div>
        ) : (
          <TradingHistory />
        )
      }
    </div>
  );
};

export default Portfolio;
