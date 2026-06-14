// Redux module for Action state/actions.
import axios from "axios";
import api, { API_BASE_URL } from "@/Api/api";
import {
  FETCH_COIN_BY_ID_FAILURE,
  FETCH_COIN_BY_ID_REQUEST,
  FETCH_COIN_BY_ID_SUCCESS,
  FETCH_COIN_DETAILS_FAILURE,
  FETCH_COIN_DETAILS_REQUEST,
  FETCH_COIN_DETAILS_SUCCESS,
  FETCH_COIN_LIST_FAILURE,
  FETCH_COIN_LIST_REQUEST,
  FETCH_COIN_LIST_SUCCESS,
  FETCH_MARKET_CHART_FAILURE,
  FETCH_MARKET_CHART_REQUEST,
  FETCH_MARKET_CHART_SUCCESS,
  FETCH_TOP_50_COINS_FAILURE,
  FETCH_TOP_50_COINS_REQUEST,
  FETCH_TOP_50_COINS_SUCCESS,
  FETCH_TRADING_COINS_FAILURE,
  FETCH_TRADING_COINS_REQUEST,
  FETCH_TRADING_COINS_SUCCESS,
  SEARCH_COIN_FAILURE,
  SEARCH_COIN_REQUEST,
  SEARCH_COIN_SUCCESS,
} from "./ActionTypes";

let latestCoinListRequestId = 0;

const parseCompactNumber = (value) => {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return 0;
  const trimmed = value.trim();
  if (!trimmed) return 0;

  const suffixMatch = trimmed.match(/(-?\d+(?:\.\d+)?)\s*([KMBT])$/i);
  if (suffixMatch) {
    const base = Number(suffixMatch[1]);
    const suffix = suffixMatch[2].toUpperCase();
    const multiplierMap = { K: 1e3, M: 1e6, B: 1e9, T: 1e12 };
    return Number.isFinite(base) ? base * (multiplierMap[suffix] || 1) : 0;
  }

  const normalized = trimmed.replace(/[^\d.-]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeLegacyTrendingPayload = (payload) => {
  const coins = Array.isArray(payload?.coins) ? payload.coins : [];
  return coins
    .map((entry) => entry?.item || entry)
    .filter(Boolean)
    .map((item) => {
      const data = item?.data || {};
      const percent24h = data?.price_change_percentage_24h?.usd ?? data?.price_change_percentage_24h;

      const rawId = item?.id || item?.coin_id || item?.symbol?.toLowerCase() || item?.name;

      return {
        id: String(rawId || "unknown-coin"),
        name: item?.name || item?.symbol || "Unknown",
        symbol: item?.symbol || "",
        image: item?.large || item?.thumb || item?.small || "",
        current_price: parseCompactNumber(data?.price),
        market_cap: parseCompactNumber(data?.market_cap),
        total_volume: parseCompactNumber(data?.total_volume),
        market_cap_change_percentage_24h: parseCompactNumber(percent24h),
      };
    })
    .filter((item) => item.id);
};

export const fetchCoinList = (page, size = 10) => async (dispatch) => {
  const normalizedPage = Number.isFinite(Number(page)) && Number(page) > 0 ? Math.floor(Number(page)) : 1;
  const normalizedSize = Number.isFinite(Number(size)) && Number(size) > 0 ? Math.min(Math.floor(Number(size)), 50) : 10;
  const requestId = ++latestCoinListRequestId;

  dispatch({ type: FETCH_COIN_LIST_REQUEST });

  try {
    const response = await axios.get(
      `${API_BASE_URL}/coins?page=${normalizedPage}&size=${normalizedSize}`
    );

    if (requestId !== latestCoinListRequestId) {
      return;
    }

    const responseData = response.data;

    if (Array.isArray(responseData)) {
      dispatch({
        type: FETCH_COIN_LIST_SUCCESS,
        payload: {
          items: responseData,
          page: normalizedPage,
          size: normalizedSize,
          hasNext: responseData.length === normalizedSize,
          hasPrevious: normalizedPage > 1,
        },
      });
      return;
    }

    dispatch({
      type: FETCH_COIN_LIST_SUCCESS,
      payload: {
        items: Array.isArray(responseData?.items) ? responseData.items : [],
        page: responseData?.page ?? normalizedPage,
        size: responseData?.size ?? normalizedSize,
        hasNext: Boolean(responseData?.hasNext),
        hasPrevious: Boolean(responseData?.hasPrevious ?? normalizedPage > 1),
      },
    });
  } catch (error) {
    if (requestId !== latestCoinListRequestId) {
      return;
    }
    dispatch({ type: FETCH_COIN_LIST_FAILURE, payload: error.message });
  }
};

export const getTop50CoinList = () => async (dispatch) => {
  dispatch({ type: FETCH_TOP_50_COINS_REQUEST });

  try {
    const response = await axios.get(`${API_BASE_URL}/coins/top50`);
    dispatch({ type: FETCH_TOP_50_COINS_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({ type: FETCH_TOP_50_COINS_FAILURE, payload: error.message });
  }
};

export const fetchTrendingCoinList = () => async (dispatch) => {
  dispatch({ type: FETCH_TRADING_COINS_REQUEST });

  try {
    const response = await axios.get(`${API_BASE_URL}/coins/trending-assets?limit=10`);
    const normalized = Array.isArray(response.data) ? response.data : [];
    if (normalized.length > 0) {
      dispatch({
        type: FETCH_TRADING_COINS_SUCCESS,
        payload: normalized,
      });
      return;
    }

    const fallbackResponse = await axios.get(`${API_BASE_URL}/coins/trading`);
    dispatch({
      type: FETCH_TRADING_COINS_SUCCESS,
      payload: normalizeLegacyTrendingPayload(fallbackResponse.data),
    });
  } catch (error) {
    try {
      const fallbackResponse = await axios.get(`${API_BASE_URL}/coins/trading`);
      dispatch({
        type: FETCH_TRADING_COINS_SUCCESS,
        payload: normalizeLegacyTrendingPayload(fallbackResponse.data),
      });
    } catch (fallbackError) {
      dispatch({
        type: FETCH_TRADING_COINS_FAILURE,
        payload: fallbackError.message || error.message,
      });
    }
  }
};

export const fetchMarketChart = ({ coinId, days, jwt }) => async (dispatch) => {
  dispatch({ type: FETCH_MARKET_CHART_REQUEST });

  try {
    const response = await api.get(`/coins/${coinId}/chart?days=${days}`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
    dispatch({ type: FETCH_MARKET_CHART_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({ type: FETCH_MARKET_CHART_FAILURE, payload: error.message });
  }
};

export const fetchCoinById = (coinId) => async (dispatch) => {
  dispatch({ type: FETCH_COIN_BY_ID_REQUEST });

  try {
    const response = await axios.get(`${API_BASE_URL}/coins/details/${coinId}`);
    dispatch({ type: FETCH_COIN_BY_ID_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({ type: FETCH_COIN_BY_ID_FAILURE, payload: error.message });
  }
};

export const fetchCoinDetails = ({ coinId, jwt }) => async (dispatch) => {
  dispatch({ type: FETCH_COIN_DETAILS_REQUEST });

  try {
    const response = await api.get(`/coins/details/${coinId}`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
    dispatch({ type: FETCH_COIN_DETAILS_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({ type: FETCH_COIN_DETAILS_FAILURE, payload: error.message });
  }
};

export const searchCoin = (keyword) => async (dispatch) => {
  dispatch({ type: SEARCH_COIN_REQUEST });

  try {
    const response = await api.get(`/coins/search?q=${keyword}`);
    dispatch({ type: SEARCH_COIN_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({ type: SEARCH_COIN_FAILURE, payload: error.message });
  }
};
