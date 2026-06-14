// Page component for Watchlist.
import { useEffect } from "react";

import { addItemToWatchlist, getUserWatchlist } from "@/Redux/Watchlist/Action";
import { useDispatch, useSelector } from "react-redux";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookmarkFilledIcon } from "@radix-ui/react-icons";

const Watchlist = () => {
  const dispatch = useDispatch();
  const { watchlist } = useSelector((store) => store);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getUserWatchlist());
  }, [dispatch]);

  const handleAddToWatchlist = (id) => {
    dispatch(addItemToWatchlist(id))
  }
  return (
    <div className="page-shell animate-fadeIn">
      <div className="mb-6">
        <p className="page-kicker">Favorites</p>
        <div className="flex items-center gap-3">
          <BookmarkFilledIcon className="h-7 w-7 text-cyan-300" />
          <h1 className="page-title">Watchlist</h1>
        </div>
        <p className="page-subtitle">Keep a close eye on coins you care about and jump into details quickly.</p>
      </div>

      <div className="table-shell">
        <Table className="px-5 lg:px-8">
          <TableHeader>
            <TableRow className="sticky top-0 left-0 right-0 bg-white/5">
              <TableHead className="py-4">Coin</TableHead>
              <TableHead>SYMBOL</TableHead>
              <TableHead>VOLUME</TableHead>
              <TableHead>MARKET CAP</TableHead>
              <TableHead>24H</TableHead>
              <TableHead className="">PRICE</TableHead>
              <TableHead className="text-right text-red-700">Remove</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="">
            {(watchlist.items || []).map((item) => (
              <TableRow key={item.id}>
                <TableCell
                  onClick={() => navigate(`/market/${item.id}`)}
                  className="font-medium flex items-center gap-2 cursor-pointer"
                >
                  <Avatar className="-z-50 ring-1 ring-cyan-300/25">
                    <AvatarImage src={item.image} alt={item.symbol} />
                  </Avatar>
                  <span> {item.name}</span>
                </TableCell>
                <TableCell>{item.symbol.toUpperCase()}</TableCell>
                <TableCell>{item.total_volume}</TableCell>
                <TableCell>{item.market_cap}</TableCell>
                <TableCell
                  className={`${item.market_cap_change_percentage_24h < 0
                    ? "text-rose-300"
                    : "text-emerald-300"
                    }`}
                >
                  {item.market_cap_change_percentage_24h}%
                </TableCell>
                <TableCell>{item.current_price}</TableCell>

                <TableCell className="text-right">
                  <Button onClick={() => handleAddToWatchlist(item.id)} className="h-9 w-9" variant="outline" size="icon">
                    <BookmarkFilledIcon className="h-6 w-6" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!watchlist.items?.length && (
              <TableRow>
                <TableCell colSpan={7}>
                  <div className="empty-state">No coins in your watchlist yet.</div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Watchlist;
