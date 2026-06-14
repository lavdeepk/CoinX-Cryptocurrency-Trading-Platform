// Redux module for Reducer state/actions.
import {
  REGISTER_REQUEST,
  REGISTER_SUCCESS,
  REGISTER_FAILURE,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  GET_USER_REQUEST,
  GET_USER_SUCCESS,
  GET_USER_FAILURE,
  LOGOUT,
  LOGIN_TWO_STEP_FAILURE,
  LOGIN_TWO_STEP_SUCCESS,
} from "./ActionTypes";

const initialState = {
  user: null,
  loading: false,
  error: null,
  jwt: null,
  authChecked: false,
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case REGISTER_REQUEST:
    case LOGIN_REQUEST:
      return { ...state, loading: true, error: null };

    case GET_USER_REQUEST:
      return { ...state, loading: true, error: null, authChecked: false };

    case REGISTER_SUCCESS:
      return { ...state, loading: false, jwt: action.payload, authChecked: false };

    case LOGIN_SUCCESS:
      return { ...state, loading: false, jwt: action.payload, authChecked: false };

    case LOGIN_TWO_STEP_SUCCESS:
      return { ...state, loading: false, jwt: action.payload, authChecked: false };

    case GET_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        user: action.payload,
        fetchingUser: false,
        authChecked: true,
      };

    case LOGIN_FAILURE:
    case REGISTER_FAILURE:
    case GET_USER_FAILURE:
    case LOGIN_TWO_STEP_FAILURE:
      return {
        ...state,
        loading: false,
        jwt: null,
        error: action.payload,
        authChecked: true,
      };
    case LOGOUT:
      localStorage.removeItem("jwt");
      return { ...state, jwt: null, user: null };
    default:
      return state;
  }
};

export default authReducer;
