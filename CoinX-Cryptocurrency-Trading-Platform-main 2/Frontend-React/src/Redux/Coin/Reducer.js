// Redux module for Reducer state/actions.
import {
  FETCH_COIN_LIST_REQUEST,
  FETCH_COIN_LIST_SUCCESS,
  FETCH_COIN_LIST_FAILURE,
  FETCH_MARKET_CHART_REQUEST,
  FETCH_MARKET_CHART_SUCCESS,
  FETCH_MARKET_CHART_FAILURE,
  FETCH_COIN_BY_ID_REQUEST,
  FETCH_COIN_BY_ID_SUCCESS,
  FETCH_COIN_BY_ID_FAILURE,
  FETCH_COIN_DETAILS_REQUEST,
  FETCH_COIN_DETAILS_SUCCESS,
  FETCH_COIN_DETAILS_FAILURE,
  FETCH_TOP_50_COINS_SUCCESS,
  SEARCH_COIN_SUCCESS,
  SEARCH_COIN_FAILURE,
  SEARCH_COIN_REQUEST,
  FETCH_TOP_50_COINS_REQUEST,
  FETCH_TOP_50_COINS_FAILURE,
  FETCH_TRADING_COINS_REQUEST,
  FETCH_TRADING_COINS_SUCCESS,
  FETCH_TRADING_COINS_FAILURE,
} from "./ActionTypes";

const initialState = {
  coinList: [],
  coinListMeta: {
    page: 1,
    size: 10,
    hasNext: false,
    hasPrevious: false,
  },
  top50: [],
  trading: [],
  searchCoinList: [],
  marketChart: { data: [], loading: false },
  coinById: null,
  coinDetails: null,
  coinListLoading: false,
  coinDetailsLoading: false,
  searchLoading: false,
  top50Loading: false,
  tradingLoading: false,
  loading: false,
  error: null,
};

const coinReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_COIN_LIST_REQUEST:
      return {
        ...state,
        coinListLoading: true,
        loading: true,
        error: null,
      };
    case FETCH_COIN_BY_ID_REQUEST:
    case FETCH_COIN_DETAILS_REQUEST:
      return {
        ...state,
        coinDetailsLoading: true,
        loading: true,
        error: null,
      };
    case SEARCH_COIN_REQUEST:
      return {
        ...state,
        searchLoading: true,
        loading: true,
        error: null,
      };
    case FETCH_TOP_50_COINS_REQUEST:
      return {
        ...state,
        top50Loading: true,
        loading: true,
        error: null,
      };
    case FETCH_TRADING_COINS_REQUEST:
      return {
        ...state,
        tradingLoading: true,
        loading: true,
        error: null,
      };

    case FETCH_MARKET_CHART_REQUEST:
      return {
        ...state,
        marketChart: { ...state.marketChart, loading: true },
        error: null,
      };
    case FETCH_COIN_LIST_SUCCESS:
      return {
        ...state,
        coinList: action.payload.items,
        coinListMeta: {
          page: action.payload.page,
          size: action.payload.size,
          hasNext: action.payload.hasNext,
          hasPrevious: action.payload.hasPrevious,
        },
        coinListLoading: false,
        loading: false,
        error: null,
      };
   

    case FETCH_TOP_50_COINS_SUCCESS:
      return {
        ...state,
        top50: action.payload,
        top50Loading: false,
        loading: false,
        error: null,
      };

    case FETCH_TRADING_COINS_SUCCESS:
      return {
        ...state,
        trading: action.payload,
        tradingLoading: false,
        loading: false,
        error: null,
      };
    case FETCH_MARKET_CHART_SUCCESS:
      return {
        ...state,
        marketChart: { data: action.payload.prices, loading: false },
        error: null,
      };
    case FETCH_COIN_BY_ID_SUCCESS:
      return {
        ...state,
        coinDetails: action.payload,
        coinDetailsLoading: false,
        loading: false,
        error: null,
      };
    case SEARCH_COIN_SUCCESS:
      return {
        ...state,
        searchCoinList: action.payload.coins,
        searchLoading: false,
        loading: false,
        error: null,
      };
    case FETCH_COIN_DETAILS_SUCCESS:
      return {
        ...state,
        coinDetails: action.payload,
        coinDetailsLoading: false,
        loading: false,
        error: null,
      };

    case FETCH_MARKET_CHART_FAILURE:
      return {
        ...state,
        marketChart: { ...state.marketChart, loading: false },
        error: action.payload,
      };
    case FETCH_COIN_LIST_FAILURE:
      return {
        ...state,
        coinListLoading: false,
        loading: false,
        error: action.payload,
      };
    case SEARCH_COIN_FAILURE:
      return {
        ...state,
        searchLoading: false,
        loading: false,
        error: action.payload,
      };
    case FETCH_COIN_BY_ID_FAILURE:
    case FETCH_COIN_DETAILS_FAILURE:
      return {
        ...state,
        coinDetailsLoading: false,
        loading: false,
        error: action.payload,
      };
    case FETCH_TOP_50_COINS_FAILURE:
      return {
        ...state,
        top50Loading: false,
        loading: false,
        error: action.payload,
      };
    case FETCH_TRADING_COINS_FAILURE:
      return {
        ...state,
        tradingLoading: false,
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
};

export default coinReducer;
