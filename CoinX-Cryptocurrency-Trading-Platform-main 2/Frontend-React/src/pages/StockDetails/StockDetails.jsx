// Page component for StockDetails.
import { Button } from "@/components/ui/button";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bookmark,
  BookmarkCheck,
  CircleDollarSign,
  Layers3,
  Scale,
} from "lucide-react";
import StockChart from "./StockChart";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import TradingForm from "./TradingForm";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCoinDetails } from "@/Redux/Coin/Action";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { existInWatchlist } from "@/Util/existInWatchlist";
import { addItemToWatchlist, getUserWatchlist } from "@/Redux/Watchlist/Action";
import { getUserWallet } from "@/Redux/Wallet/Action";
import SpinnerBackdrop from "@/components/custome/SpinnerBackdrop";

const StockDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { coin, watchlist, auth } = useSelector((store) => store);
  const coinDetails = coin.coinDetails;
  const marketData = coinDetails?.market_data || {};

  const formatSignedPercent = (value) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return "N/A";
    return `${numeric > 0 ? "+" : ""}${numeric.toFixed(2)}%`;
  };

  const formatUsd = (value, compact = false) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return "N/A";

    if (compact) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        notation: "compact",
        maximumFractionDigits: 2,
      }).format(numeric);
    }

    const maxFractionDigits = numeric >= 1 ? 2 : 6;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: maxFractionDigits,
    }).format(numeric);
  };

  const formatCount = (value, compact = false) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return "N/A";
    return new Intl.NumberFormat("en-US", {
      notation: compact ? "compact" : "standard",
      maximumFractionDigits: 2,
    }).format(numeric);
  };

  useEffect(() => {
    dispatch(
      fetchCoinDetails({
        coinId: id,
        jwt: auth.jwt || localStorage.getItem("jwt"),
      })
    );
  }, [dispatch, id, auth.jwt]);

  useEffect(() => {
    dispatch(getUserWatchlist());
    dispatch(getUserWallet(localStorage.getItem("jwt")));
  }, [dispatch]);

  const handleAddToWatchlist = () => {
    dispatch(addItemToWatchlist(coin.coinDetails?.id));
  };

  if (coin.coinDetailsLoading) {
    return <SpinnerBackdrop />;
  }

  if (!coinDetails) {
    return (
      <div className="page-shell animate-fadeIn">
        <div className="empty-state">Asset details are unavailable right now. Please try again.</div>
      </div>
    );
  }

  const currentPrice = marketData?.current_price?.usd;
  const marketCap = marketData?.market_cap?.usd;
  const totalVolume = marketData?.total_volume?.usd;
  const fdv = marketData?.fully_diluted_valuation?.usd;
  const marketCapChangeUsd = Number(marketData?.market_cap_change_24h ?? 0);
  const marketCapChangePct = Number(marketData?.market_cap_change_percentage_24h ?? 0);
  const high24h = marketData?.high_24h?.usd;
  const low24h = marketData?.low_24h?.usd;
  const ath = marketData?.ath?.usd;
  const atl = marketData?.atl?.usd;
  const athDelta = marketData?.ath_change_percentage?.usd;
  const atlDelta = marketData?.atl_change_percentage?.usd;
  const circulatingSupply = marketData?.circulating_supply;
  const totalSupply = marketData?.total_supply;
  const maxSupply = marketData?.max_supply;
  const marketCapRank = coinDetails?.market_cap_rank;
  const volumeToCapRatio = Number(marketCap) > 0 ? (Number(totalVolume) / Number(marketCap)) * 100 : null;
  const intradaySpreadPct =
    Number(high24h) > 0 && Number(low24h) > 0 ? ((Number(high24h) - Number(low24h)) / Number(low24h)) * 100 : null;
  const supplyBase = Number(maxSupply) > 0 ? Number(maxSupply) : Number(totalSupply) > 0 ? Number(totalSupply) : null;
  const supplyProgress = supplyBase && Number(circulatingSupply) > 0 ? Math.min(100, (Number(circulatingSupply) / supplyBase) * 100) : null;
  const isNegative = marketCapChangeUsd < 0;
  const lastUpdated = coinDetails?.last_updated
    ? new Date(coinDetails.last_updated).toLocaleString()
    : "N/A";

  return (
    <div className="page-shell animate-fadeIn">
          <div className="mb-6">
            <p className="page-kicker">Asset Detail</p>
            <h1 className="page-title">Market Overview</h1>
            <p className="page-subtitle">Analyze price action and execute buy/sell orders with live chart insights.</p>
          </div>
          <div className="space-y-5 rounded-2xl border border-cyan-300/20 bg-transparent p-5 shadow-[0_20px_45px_rgba(2,6,23,0.28)] animate-slideUp">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex gap-5 items-center">
                <div>
                  <Avatar className="h-14 w-14 ring-2 ring-cyan-300/35">
                    <AvatarImage src={coinDetails?.image?.large} />
                  </Avatar>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-lg">{coinDetails?.symbol?.toUpperCase()}</p>
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                    <p className="text-gray-400">{coinDetails?.name}</p>
                    <span className="rounded-full border border-white/15 px-2 py-0.5 text-xs text-slate-300">
                      Rank #{marketCapRank || "N/A"}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <p className="text-2xl font-bold text-slate-100">{formatUsd(currentPrice)}</p>
                    <p
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold ${
                        isNegative
                          ? "border-rose-400/35 bg-rose-400/10 text-rose-300"
                          : "border-emerald-400/35 bg-emerald-400/10 text-emerald-300"
                      }`}
                    >
                      {isNegative ? <ArrowDownRight className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
                      {formatUsd(marketCapChangeUsd, true)} ({formatSignedPercent(marketCapChangePct)})
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">Last updated: {lastUpdated}</p>
                </div>
              </div>

              <div className="flex items-center gap-5">
                <Button
                  onClick={handleAddToWatchlist}
                  className="h-10 w-10 hover-lift hover-glow"
                  variant="outline"
                  size="icon"
                >
                  {existInWatchlist(watchlist.items, coinDetails) ? (
                    <BookmarkCheck className="h-5 w-5 text-cyan-300" />
                  ) : (
                    <Bookmark className="h-5 w-5" />
                  )}
                </Button>

                <Dialog>
                  <DialogTrigger>
                    <Button size="lg" className="btn-gradient hover-lift hover-glow">
                      <CircleDollarSign className="mr-2 h-4 w-4" />
                      TRADE
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass-card border-cyan-300/25">
                    <DialogHeader className="">
                      <DialogTitle className="px-10 pt-5 text-center gradient-text">
                        How much do you want to spend?
                      </DialogTitle>
                    </DialogHeader>
                    <TradingForm />
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border border-white/12 bg-transparent p-4">
                <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-slate-400">
                  <BarChart3 className="h-3.5 w-3.5 text-cyan-300" />
                  Market Cap
                </div>
                <p className="text-lg font-semibold text-white">{formatUsd(marketCap, true)}</p>
              </div>
              <div className="rounded-xl border border-white/12 bg-transparent p-4">
                <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-slate-400">
                  <Activity className="h-3.5 w-3.5 text-cyan-300" />
                  24h Volume
                </div>
                <p className="text-lg font-semibold text-white">{formatUsd(totalVolume, true)}</p>
              </div>
              <div className="rounded-xl border border-white/12 bg-transparent p-4">
                <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-slate-400">
                  <Scale className="h-3.5 w-3.5 text-cyan-300" />
                  Volume / Cap
                </div>
                <p className="text-lg font-semibold text-white">{formatSignedPercent(volumeToCapRatio)}</p>
              </div>
              <div className="rounded-xl border border-white/12 bg-transparent p-4">
                <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-slate-400">
                  <Layers3 className="h-3.5 w-3.5 text-cyan-300" />
                  FDV
                </div>
                <p className="text-lg font-semibold text-white">{formatUsd(fdv, true)}</p>
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-3">
              <div className="rounded-xl border border-white/12 bg-transparent p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-slate-400">24h Price Range</p>
                <p className="mt-2 text-sm text-slate-300">High: <span className="font-semibold text-white">{formatUsd(high24h)}</span></p>
                <p className="mt-1 text-sm text-slate-300">Low: <span className="font-semibold text-white">{formatUsd(low24h)}</span></p>
                <p className="mt-2 text-xs text-cyan-200">Intraday spread: {formatSignedPercent(intradaySpreadPct)}</p>
              </div>

              <div className="rounded-xl border border-white/12 bg-transparent p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Cycle Metrics</p>
                <p className="mt-2 text-sm text-slate-300">ATH: <span className="font-semibold text-white">{formatUsd(ath)}</span></p>
                <p className="mt-1 text-xs text-slate-400">From ATH: {formatSignedPercent(athDelta)}</p>
                <p className="mt-2 text-sm text-slate-300">ATL: <span className="font-semibold text-white">{formatUsd(atl)}</span></p>
                <p className="mt-1 text-xs text-slate-400">From ATL: {formatSignedPercent(atlDelta)}</p>
              </div>

              <div className="rounded-xl border border-white/12 bg-transparent p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Token Supply</p>
                <p className="mt-2 text-sm text-slate-300">
                  Circulating: <span className="font-semibold text-white">{formatCount(circulatingSupply, true)}</span>
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  Total: <span className="font-semibold text-white">{formatCount(totalSupply, true)}</span>
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  Max: <span className="font-semibold text-white">{formatCount(maxSupply, true)}</span>
                </p>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-800/85">
                  <div
                    className="h-full rounded-full bg-cyan-300/75 transition-all duration-500"
                    style={{ width: `${supplyProgress ?? 0}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Supply in circulation: {supplyProgress == null ? "N/A" : `${supplyProgress.toFixed(2)}%`}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-10">
            <div className="animate-slideUp" style={{ animationDelay: "100ms" }}>
              <StockChart coinId={coinDetails?.id} />
            </div>
          </div>
    </div>
  );
};

export default StockDetails;
