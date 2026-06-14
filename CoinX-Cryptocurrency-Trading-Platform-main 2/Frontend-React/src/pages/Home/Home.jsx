// Page component for Home.
import { useEffect, useMemo, useState } from "react";
import { CryptoCard } from "./CryptoCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  fetchCoinDetails,
  fetchCoinList,
  fetchTrendingCoinList,
  getTop50CoinList,
} from "@/Redux/Coin/Action";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import SpinnerBackdrop from "@/components/custome/SpinnerBackdrop";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Crown,
  Flame,
  Globe2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";

const DEFAULT_ALL_MARKETS_PAGE_SIZE = 10;

const parsePageFromSearch = (search) => {
  const queryParams = new URLSearchParams(search);
  const queryPage = Number(queryParams.get("page"));
  if (!Number.isInteger(queryPage) || queryPage < 1) return 1;
  return queryPage;
};

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [page, setPage] = useState(() => parsePageFromSearch(location.search));
  const [pageInput, setPageInput] = useState("1");
  const [category, setCategory] = useState("all");
  const { coin, auth } = useSelector((store) => store);
  const coinListMeta = coin.coinListMeta || {};
  const marketTabs = [
    { id: "all", label: "All Markets", icon: Globe2 },
    { id: "top50", label: "Top 50", icon: Crown },
    { id: "trading", label: "Trending", icon: Flame },
  ];

  useEffect(() => {
    if (category !== "all") return;
    dispatch(fetchCoinList(page, DEFAULT_ALL_MARKETS_PAGE_SIZE));
  }, [dispatch, page, category]);

  useEffect(() => {
    dispatch(fetchCoinDetails({
      coinId: "bitcoin",
      jwt: auth.jwt || localStorage.getItem("jwt"),
    }));
  }, [dispatch, auth.jwt]);

  useEffect(() => {
    if (category === "top50") {
      dispatch(getTop50CoinList());
    } else if (category === "trading") {
      dispatch(fetchTrendingCoinList());
    }
  }, [dispatch, category]);

  const visibleCoins = useMemo(() => {
    if (category === "top50") return coin.top50;
    if (category === "trading") return coin.trading;
    return coin.coinList;
  }, [category, coin.coinList, coin.top50, coin.trading]);

  const marketSnapshot = useMemo(() => {
    if (!visibleCoins?.length) {
      return {
        marketCap: 0,
        volume: 0,
        avgChange: 0,
        gainers: 0,
        losers: 0,
        topPerformer: null,
        topByVolume: null,
        topByMarketCap: null,
        avgVolume: 0,
        turnoverRatio: 0,
      };
    }

    const totals = visibleCoins.reduce(
      (acc, item) => {
        const change = Number(item.market_cap_change_percentage_24h ?? item.price_change_percentage_24h ?? 0);
        const marketCap = Number(item.market_cap || 0);
        const volume = Number(item.total_volume || 0);

        acc.marketCap += marketCap;
        acc.volume += volume;
        acc.avgChange += change;
        if (change > 0) {
          acc.gainers += 1;
        } else if (change < 0) {
          acc.losers += 1;
        }

        if (!acc.topPerformer || change > (acc.topPerformer.market_cap_change_percentage_24h || 0)) {
          acc.topPerformer = item;
        }
        if (!acc.topByVolume || volume > (acc.topByVolume.total_volume || 0)) {
          acc.topByVolume = item;
        }
        if (!acc.topByMarketCap || marketCap > (acc.topByMarketCap.market_cap || 0)) {
          acc.topByMarketCap = item;
        }

        return acc;
      },
      {
        marketCap: 0,
        volume: 0,
        avgChange: 0,
        gainers: 0,
        losers: 0,
        topPerformer: null,
        topByVolume: null,
        topByMarketCap: null,
      }
    );

    return {
      ...totals,
      avgChange: totals.avgChange / visibleCoins.length,
      avgVolume: totals.volume / visibleCoins.length,
      turnoverRatio: totals.marketCap > 0 ? (totals.volume / totals.marketCap) * 100 : 0,
    };
  }, [visibleCoins]);

  const formatSignedPercent = (value) => {
    const formatted = Number(value || 0).toFixed(2);
    return `${Number(formatted) > 0 ? "+" : ""}${formatted}%`;
  };

  const formatCompactCurrency = (value) => {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue) || numericValue <= 0) return "$0";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(numericValue);
  };

  const currentCategoryLabel =
    marketTabs.find((tab) => tab.id === category)?.label || "All Markets";

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage === page) return;
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const allCoinsCount = Array.isArray(coin.coinList) ? coin.coinList.length : 0;

  const hasNextPage =
    category === "all" &&
    Boolean(coinListMeta.hasNext);

  const canGoPrev = category === "all" ? Boolean(coinListMeta.hasPrevious) : page > 1;
  const canGoNext = hasNextPage;
  const isPaginationLoading = category === "all" && coin.coinListLoading && allCoinsCount > 0;

  const handleJumpToPage = (event) => {
    event.preventDefault();
    const parsed = Number(pageInput);
    if (!Number.isFinite(parsed)) return;

    const targetPage = Math.max(1, Math.floor(parsed));
    handlePageChange(targetPage);
    setPageInput(String(targetPage));
  };

  const handlePageInputChange = (event) => {
    const digitsOnly = event.target.value.replace(/\D/g, "");
    setPageInput(digitsOnly);
  };

  useEffect(() => {
    const queryPage = parsePageFromSearch(location.search);
    setPage((previousPage) => (queryPage !== previousPage ? queryPage : previousPage));
  }, [location.search]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const currentQueryPage = parsePageFromSearch(location.search);
    const shouldRemovePageParam = page === 1;

    if (shouldRemovePageParam) {
      if (!queryParams.has("page")) return;
      queryParams.delete("page");
    } else {
      if (currentQueryPage === page && queryParams.get("page") === String(page)) return;
      queryParams.set("page", String(page));
    }

    navigate(
      {
        pathname: location.pathname,
        search: queryParams.toString() ? `?${queryParams.toString()}` : "",
      },
      { replace: true }
    );
  }, [location.pathname, location.search, navigate, page]);

  useEffect(() => {
    setPageInput(String(page));
  }, [page]);

  const paginationItems = useMemo(() => {
    if (category !== "all") return [];

    const candidates = [1];

    if (page > 1) {
      candidates.push(page - 1);
      candidates.push(page);
    }

    if (hasNextPage) {
      candidates.push(page + 1);
    }

    const uniquePages = [...new Set(candidates)].sort((a, b) => a - b);
    const items = [];

    uniquePages.forEach((value, index) => {
      if (index > 0 && value - uniquePages[index - 1] > 1) {
        items.push(`ellipsis-${index}`);
      }
      items.push(value);
    });

    return items;
  }, [category, page, hasNextPage]);



  const isVisibleCategoryLoading =
    (category === "all" && coin.coinListLoading) ||
    (category === "top50" && coin.top50Loading) ||
    (category === "trading" && coin.tradingLoading);

  if (isVisibleCategoryLoading && !visibleCoins.length) {
    return <SpinnerBackdrop />;
  }

  return (
    <div className="relative min-h-screen animate-fadeIn">
      <div className="relative mx-auto max-w-7xl space-y-8 px-4 pb-10 pt-8">
        <section className="animate-slideUp relative overflow-hidden rounded-3xl border border-white/12 bg-transparent p-6 shadow-[0_24px_55px_rgba(2,6,23,0.35)] sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-cyan-300/8"></div>

          <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-transparent px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-cyan-200">
                <Sparkles className="h-3.5 w-3.5" />
                Live Crypto Hub
              </div>
              <h1 className="max-w-xl text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
                Build your edge with live market intelligence.
              </h1>
              <p className="mt-4 max-w-2xl text-sm text-slate-300 sm:text-base">
                Monitor top assets, track momentum, and move from insights to action
                with a faster trading workflow.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-transparent px-4 py-2 text-sm text-slate-200">
                  <TrendingUp className="h-4 w-4 text-emerald-300" />
                  Real-time price movement
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-transparent px-4 py-2 text-sm text-slate-200">
                  <ShieldCheck className="h-4 w-4 text-cyan-300" />
                  Security-first trading stack
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="hover-lift rounded-2xl border border-white/12 bg-transparent p-4">
                <p className="mb-1 text-xs uppercase tracking-[0.18em] text-slate-400">Total Market Cap</p>
                <p className="text-lg font-semibold text-white">{formatCompactCurrency(marketSnapshot.marketCap)}</p>
                <p className="mt-1 text-sm text-slate-300">
                  Leader: {marketSnapshot.topByMarketCap?.name || "N/A"}
                </p>
              </div>

              <div className="hover-lift rounded-2xl border border-white/12 bg-transparent p-4">
                <p className="mb-1 text-xs uppercase tracking-[0.18em] text-slate-400">24h Volume</p>
                <p className="text-lg font-semibold text-white">{formatCompactCurrency(marketSnapshot.volume)}</p>
                <p className="mt-1 text-sm text-slate-300">
                  Most traded: {marketSnapshot.topByVolume?.name || "N/A"}
                </p>
              </div>

              <div className="hover-lift rounded-2xl border border-white/12 bg-transparent p-4">
                <p className="mb-1 text-xs uppercase tracking-[0.18em] text-slate-400">Average 24h Move</p>
                <p
                  className={`text-lg font-semibold ${Number(marketSnapshot.avgChange) >= 0 ? "text-emerald-300" : "text-rose-300"}`}
                >
                  {formatSignedPercent(marketSnapshot.avgChange)}
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  Avg liquidity per asset: {formatCompactCurrency(marketSnapshot.avgVolume)}
                </p>
              </div>

              <div className="hover-lift rounded-2xl border border-white/12 bg-transparent p-4">
                <p className="mb-1 text-xs uppercase tracking-[0.18em] text-slate-400">Market Breadth</p>
                <p className="text-lg font-semibold text-white">{visibleCoins.length} assets tracked</p>
                <p className="mt-1 flex items-center gap-2 text-sm text-slate-300">
                  <span className="inline-flex items-center gap-1 text-emerald-300">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    {marketSnapshot.gainers}
                  </span>
                  <span className="text-slate-500">/</span>
                  <span className="inline-flex items-center gap-1 text-rose-300">
                    <ArrowDownRight className="h-3.5 w-3.5" />
                    {marketSnapshot.losers}
                  </span>
                  <span className="ml-1">advancers / decliners</span>
                </p>
              </div>
            </div>
          </div>

          <div className="relative mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/12 bg-transparent p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Top Performer</p>
              <p className="mt-1 text-base font-semibold text-white">{marketSnapshot.topPerformer?.name || "N/A"}</p>
              <p
                className={`mt-1 text-sm font-medium ${Number(marketSnapshot.topPerformer?.market_cap_change_percentage_24h || marketSnapshot.topPerformer?.price_change_percentage_24h || 0) >= 0
                    ? "text-emerald-300"
                    : "text-rose-300"
                  }`}
              >
                {formatSignedPercent(
                  marketSnapshot.topPerformer?.market_cap_change_percentage_24h
                    ?? marketSnapshot.topPerformer?.price_change_percentage_24h
                )}
              </p>
            </div>
            <div className="rounded-2xl border border-white/12 bg-transparent p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Liquidity Rotation</p>
              <p className="mt-1 text-base font-semibold text-white">{formatSignedPercent(marketSnapshot.turnoverRatio)}</p>
              <p className="mt-1 text-sm text-slate-300">24h volume as percentage of market cap</p>
            </div>
            <div className="rounded-2xl border border-white/12 bg-transparent p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Current View</p>
              <p className="mt-1 text-base font-semibold text-white">{currentCategoryLabel}</p>
              <p className="mt-1 text-sm text-slate-300">Curated feed aligned to your selected market tab</p>
            </div>
          </div>
        </section>

        <section className="animate-slideUp overflow-hidden rounded-3xl border border-white/12 bg-transparent shadow-[0_24px_55px_rgba(2,6,23,0.35)]" style={{ animationDelay: "80ms" }}>
          <div className="border-b border-white/10 p-4 sm:flex sm:items-center sm:justify-between">
            <div>
              <div className="mb-1 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
                <BarChart3 className="h-3.5 w-3.5" />
                Asset Explorer
              </div>
              <h2 className="text-xl font-semibold text-white">Explore Crypto Markets</h2>
              <p className="mt-1 text-sm text-slate-400">
                Showing {currentCategoryLabel} ({visibleCoins.length} assets)
              </p>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 sm:mt-0">
              {marketTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <Button
                    key={tab.id}
                    variant={category === tab.id ? "default" : "outline"}
                    onClick={() => setCategory(tab.id)}
                    className={`group rounded-full ${category === tab.id
                      ? "border-cyan-300/55 bg-cyan-300/18 text-cyan-100 hover:bg-cyan-300/22"
                      : "border-white/20 bg-transparent text-slate-200 hover:bg-white/10"
                      }`}
                  >
                    <Icon className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
                    {tab.label}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="p-5">
            {visibleCoins.length ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 animate-fadeIn">
                {visibleCoins.map((item, index) => (
                  <CryptoCard key={item.id} coin={item} index={index} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/12 bg-transparent p-8 text-center">
                <p className="text-lg font-semibold text-white">No coins available right now</p>
                <p className="mt-2 text-sm text-slate-400">
                  Try switching tabs or refreshing the data feed.
                </p>
                <Button
                  onClick={() => setCategory("all")}
                  className="mt-5 rounded-full border border-cyan-300/40 bg-cyan-300/15 text-cyan-100 hover:bg-cyan-300/22"
                >
                  View All Markets
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {category === "all" && (
            <Pagination className="border-t border-white/10 px-4 py-4 sm:px-6">
              <PaginationContent className="w-full flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
                <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.14em] text-slate-400">
                  <span>Page {page}</span>
                  <span className="text-slate-600">•</span>
                  <span>{allCoinsCount} assets loaded</span>
                  {isPaginationLoading && (
                    <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-2 py-0.5 text-[10px] tracking-[0.1em] text-cyan-200">
                      Updating...
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <PaginationItem>
                    <PaginationPrevious
                      className={`cursor-pointer ${!canGoPrev || isPaginationLoading ? "pointer-events-none opacity-40" : ""}`}
                      onClick={(event) => {
                        event.preventDefault();
                        if (!canGoPrev || isPaginationLoading) return;
                        handlePageChange(page - 1);
                      }}
                    />
                  </PaginationItem>
                  {paginationItems.map((item) => {
                    if (typeof item === "string") {
                      return (
                        <PaginationItem key={item}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }

                    return (
                      <PaginationItem key={item}>
                        <PaginationLink
                          onClick={(event) => {
                            event.preventDefault();
                            if (isPaginationLoading) return;
                            handlePageChange(item);
                          }}
                          isActive={page === item}
                          className={`cursor-pointer ${page === item
                            ? "!border-cyan-300/55 !bg-cyan-300/18 !text-cyan-100 !hover:text-cyan-50"
                            : "!text-slate-300 !hover:text-slate-100"
                            }`}
                          aria-disabled={isPaginationLoading}
                        >
                          {item}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  <PaginationItem>
                    <PaginationNext
                      className={`cursor-pointer ${!canGoNext || isPaginationLoading ? "pointer-events-none opacity-40" : ""}`}
                      onClick={(event) => {
                        event.preventDefault();
                        if (!canGoNext || isPaginationLoading) return;
                        handlePageChange(page + 1);
                      }}
                    />
                  </PaginationItem>
                </div>
                <form onSubmit={handleJumpToPage} className="flex items-center gap-2 self-end sm:self-auto">
                  <label htmlFor="page-jump-input" className="text-xs uppercase tracking-[0.14em] text-slate-400">
                    Jump
                  </label>
                  <Input
                    id="page-jump-input"
                    value={pageInput}
                    onChange={handlePageInputChange}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="h-9 w-16 text-center"
                    placeholder="1"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    variant="outline"
                    disabled={isPaginationLoading || !pageInput.trim()}
                    className="h-9"
                  >
                    Go
                  </Button>
                </form>
              </PaginationContent>
              {!canGoNext && !isPaginationLoading && (
                <p className="mt-2 text-center text-xs text-slate-500">
                  You are viewing the latest available page for now.
                </p>
              )}
            </Pagination>
          )}
        </section>
      </div>
    </div>
  );
};

export default Home;
