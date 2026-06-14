// Page component for Search.
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import { searchCoin } from "@/Redux/Coin/Action";
import { useNavigate } from "react-router-dom";
import SpinnerBackdrop from "@/components/custome/SpinnerBackdrop";

const SearchCoin = () => {
  const dispatch = useDispatch();
  const { coin } = useSelector((store) => store);
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();

  const handleSearchCoin = () => {
    if (keyword.trim()) {
      dispatch(searchCoin(keyword));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchCoin();
    }
  };

  if (coin.searchLoading) {
    return <SpinnerBackdrop />
  }

  return (
    <div className="page-shell min-h-screen animate-fadeIn">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <p className="page-kicker">Search Hub</p>
          <h1 className="text-4xl font-bold mb-3 gradient-text">Search Cryptocurrencies</h1>
          <p className="text-slate-400">Discover and track digital assets in real-time</p>
        </div>

        {/* Large Search Bar */}
        <div className="mb-12">
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute inset-0 rounded-3xl bg-cyan-300/10 blur-3xl"></div>
            <div className="relative glass-card border-purple-500/30 rounded-2xl p-3">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Search by coin name or symbol..."
                    className="h-14 text-lg bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-slate-500"
                  />
                </div>
                <Button
                  onClick={handleSearchCoin}
                  className="h-14 px-6 text-base btn-gradient rounded-xl"
                >
                  <SearchIcon className="h-5 w-5 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Searches */}
        <div className="mb-12">
          <p className="text-sm text-slate-400 mb-4 text-center">Popular searches:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {["Bitcoin", "Ethereum", "Cardano", "Solana", "Polkadot", "Ripple", "Dogecoin"].map((coinName) => (
              <button
                key={coinName}
                onClick={() => {
                  setKeyword(coinName);
                  dispatch(searchCoin(coinName));
                }}
                className="px-4 py-2 glass-card border-cyan-300/20 rounded-lg text-sm hover:border-cyan-300/45 transition-all hover:scale-105"
              >
                {coinName}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results */}
        {coin.searchCoinList && coin.searchCoinList.length > 0 && (
          <div className="table-shell">
            <Table>
              <TableHeader>
                <TableRow className="bg-white/5 hover:bg-white/5">
                  <TableHead className="text-slate-400">Rank</TableHead>
                  <TableHead className="text-slate-400">Coin</TableHead>
                  <TableHead className="text-right text-slate-400">Symbol</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coin.searchCoinList?.map((item, index) => (
                  <TableRow
                    onClick={() => navigate(`/market/${item.id}`)}
                    key={item.id}
                    className="cursor-pointer hover:bg-purple-500/5 border-b border-gray-800 transition-colors"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">#{item.market_cap_rank}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 ring-1 ring-cyan-300/20">
                          <AvatarImage src={item.large} alt={item.name} />
                        </Avatar>
                        <span className="font-medium">{item.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-mono text-slate-400">{item.symbol.toUpperCase()}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* No Results */}
        {coin.searchCoinList && coin.searchCoinList.length === 0 && keyword && (
          <div className="text-center py-16">
            <div className="glass-card border-cyan-300/20 rounded-xl p-12 max-w-md mx-auto">
              <SearchIcon className="h-16 w-16 mx-auto mb-4 text-slate-600" />
              <p className="text-slate-300 text-lg mb-2">No results found for "{keyword}"</p>
              <p className="text-slate-500 text-sm">Try searching with a different keyword or coin symbol</p>
            </div>
          </div>
        )}

        {/* Initial State */}
        {!keyword && (
          <div className="text-center py-16">
            <SearchIcon className="h-20 w-20 mx-auto mb-4 text-slate-700" />
            <p className="text-slate-300 text-lg">Start searching for cryptocurrencies</p>
            <p className="text-slate-500 text-sm mt-2">Enter a coin name or symbol above</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchCoin;
