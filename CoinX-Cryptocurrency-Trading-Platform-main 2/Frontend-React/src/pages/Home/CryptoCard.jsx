// Page component for CryptoCard.
import { memo } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react";

export const CryptoCard = memo(function CryptoCard({ coin, index }) {
    const navigate = useNavigate();
    const marketRank = Number(coin.market_cap_rank) || index + 1;
    const priceDelta24h = Number(coin.market_cap_change_percentage_24h ?? coin.price_change_percentage_24h ?? 0);
    const isPositive = priceDelta24h >= 0;
    const high24h = Number(coin.high_24h || 0);
    const low24h = Number(coin.low_24h || 0);
    const hasValidRange = high24h > 0 && low24h > 0;
    const circulatingSupply = Number(coin.circulating_supply || 0);
    const maxSupply = Number(coin.max_supply || 0);
    const supplyUsage = maxSupply > 0 ? Math.min(100, (circulatingSupply / maxSupply) * 100) : null;

    // Format large numbers with abbreviations
    const formatNumber = (num) => {
        const numericValue = Number(num);
        if (!Number.isFinite(numericValue) || numericValue <= 0) {
            return "$0";
        }

        if (numericValue >= 1e9) {
            return `$${(numericValue / 1e9).toFixed(2)}B`;
        } else if (numericValue >= 1e6) {
            return `$${(numericValue / 1e6).toFixed(2)}M`;
        } else if (numericValue >= 1e3) {
            return `$${(numericValue / 1e3).toFixed(2)}K`;
        }
        return `$${numericValue.toFixed(2)}`;
    };

    const formatPrice = (price) => {
        const numericPrice = Number(price);
        if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
            return "$0.00";
        }

        if (numericPrice >= 1) {
            return `$${numericPrice.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })}`;
        }
        return `$${numericPrice.toFixed(6)}`;
    };

    return (
        <div
            onClick={() => navigate(`/market/${coin.id}`)}
            className="group animate-slideUp cursor-pointer rounded-2xl border border-white/15 bg-transparent p-5 shadow-[0_14px_35px_rgba(2,6,23,0.22)] transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/35"
            style={{ animationDelay: `${Math.min(index * 40, 260)}ms` }}
        >
            {/* Top Section - Rank, Logo, Name */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <span className="rounded-full border border-white/15 px-2 py-0.5 text-xs font-semibold text-slate-300">#{marketRank}</span>
                    <Avatar className="h-12 w-12 ring-2 ring-cyan-300/25">
                        <AvatarImage src={coin.image} alt={coin.symbol} />
                    </Avatar>
                    <div>
                        <h3 className="text-lg font-semibold text-white">{coin.name}</h3>
                        <p className="text-sm text-gray-400 uppercase font-medium">{coin.symbol}</p>
                    </div>
                </div>
                <span className="rounded-lg border border-cyan-300/25 bg-cyan-300/10 p-1 text-cyan-200 opacity-0 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:opacity-100">
                    <ArrowUpRight className="h-4 w-4" />
                </span>
            </div>

            {/* Middle Section - Price and Change */}
            <div className="mb-4 pb-4 border-b border-cyan-300/15">
                <p className="text-2xl font-bold text-white mb-2">
                    {formatPrice(coin.current_price)}
                </p>
                <div
                    className={`flex items-center gap-2 ${isPositive ? "text-emerald-300" : "text-rose-300"
                        }`}
                >
                    {isPositive ? (
                        <TrendingUp className="h-5 w-5" />
                    ) : (
                        <TrendingDown className="h-5 w-5" />
                    )}
                    <span className="font-semibold text-lg">
                        {isPositive ? "+" : ""}
                        {priceDelta24h.toFixed(2)}%
                    </span>
                    <span className="text-sm text-gray-400">24h</span>
                </div>
            </div>

            {/* Bottom Section - Detailed Metrics */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-xs text-gray-500 mb-1 uppercase font-medium">Market Cap</p>
                    <p className="text-sm font-bold text-gray-300">
                        {formatNumber(coin.market_cap)}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-gray-500 mb-1 uppercase font-medium">24h Volume</p>
                    <p className="text-sm font-bold text-gray-300">
                        {formatNumber(coin.total_volume)}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-gray-500 mb-1 uppercase font-medium">24h High</p>
                    <p className="text-sm font-bold text-gray-300">
                        {hasValidRange ? formatPrice(high24h) : "N/A"}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-gray-500 mb-1 uppercase font-medium">24h Low</p>
                    <p className="text-sm font-bold text-gray-300">
                        {hasValidRange ? formatPrice(low24h) : "N/A"}
                    </p>
                </div>
            </div>

            <div className="mt-4 border-t border-cyan-300/12 pt-3">
                <div className="mb-1 flex items-center justify-between text-xs uppercase tracking-[0.12em] text-slate-400">
                    <span>Circulating Supply</span>
                    <span>{supplyUsage == null ? "N/A" : `${supplyUsage.toFixed(1)}%`}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800/85">
                    <div
                        className="h-full rounded-full bg-cyan-300/70 transition-all duration-500"
                        style={{ width: `${supplyUsage ?? 0}%` }}
                    />
                </div>
                <p className="mt-1 text-xs text-slate-400">
                    {circulatingSupply > 0
                        ? `${Math.round(circulatingSupply).toLocaleString()} in circulation`
                        : "Supply data unavailable"}
                </p>
            </div>
        </div>
    );
});
