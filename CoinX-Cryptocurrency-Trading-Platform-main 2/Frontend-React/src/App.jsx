// Module for App.jsx.
import { Suspense, lazy, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getUser } from "./Redux/Auth/Action";
import { shouldShowNavbar } from "./Util/shouldShowNavbar";
import SpinnerBackdrop from "./components/custome/SpinnerBackdrop";

const Navbar = lazy(() => import("./pages/Navbar/Navbar"));
const Home = lazy(() => import("./pages/Home/Home"));
const Portfolio = lazy(() => import("./pages/Portfilio/Portfolio"));
const Auth = lazy(() => import("./pages/Auth/Auth"));
const StockDetails = lazy(() => import("./pages/StockDetails/StockDetails"));
const Profile = lazy(() => import("./pages/Profile/Profile"));
const Notfound = lazy(() => import("./pages/Notfound/Notfound"));
const Wallet = lazy(() => import("./pages/Wallet/Wallet"));
const Watchlist = lazy(() => import("./pages/Watchlist/Watchlist"));
const TwoFactorAuth = lazy(() => import("./pages/Auth/TwoFactorAuth"));
const ResetPasswordForm = lazy(() => import("./pages/Auth/ResetPassword"));
const PasswordUpdateSuccess = lazy(() => import("./pages/Auth/PasswordUpdateSuccess"));
const LoginWithGoogle = lazy(() => import("./pages/Auth/LoginWithGoogle"));
const Withdrawal = lazy(() => import("./pages/Wallet/Withdrawal"));
const PaymentDetails = lazy(() => import("./pages/Wallet/PaymentDetails"));
const WithdrawalAdmin = lazy(() => import("./Admin/Withdrawal/WithdrawalAdmin"));
const Activity = lazy(() => import("./pages/Activity/Activity"));
const SearchCoin = lazy(() => import("./pages/Search/Search"));
const Footer = lazy(() => import("./pages/Footer/Footer"));
const ChatBotWidget = lazy(() => import("./components/custome/ChatBotWidget"));

const routes = [
  { path: "/", role: "ROLE_USER" },
  { path: "/portfolio", role: "ROLE_USER" },
  { path: "/activity", role: "ROLE_USER" },
  { path: "/wallet", role: "ROLE_USER" },
  { path: "/withdrawal", role: "ROLE_USER" },
  { path: "/payment-details", role: "ROLE_USER" },
  { path: "/wallet/success", role: "ROLE_USER" },
  { path: "/market/:id", role: "ROLE_USER" },
  { path: "/watchlist", role: "ROLE_USER" },
  { path: "/profile", role: "ROLE_USER" },
  { path: "/search", role: "ROLE_USER" },
  { path: "/admin/withdrawal", role: "ROLE_ADMIN" },
];

const RouteLoader = () => (
  <div className="app-shell min-h-[40vh]">
    <SpinnerBackdrop />
  </div>
);

const renderLazy = (Component) => (
  <Suspense fallback={<RouteLoader />}>
    <Component />
  </Suspense>
);

function App() {
  const { auth } = useSelector((store) => store);
  const dispatch = useDispatch();
  const location = useLocation();
  const jwt = auth.jwt || localStorage.getItem("jwt");

  // Log state for debugging production issues
  useEffect(() => {
    console.log('App state:', { 
      hasJwt: !!jwt, 
      hasUser: !!auth.user, 
      authChecked: auth.authChecked, 
      isLoading: auth.loading,
      authError: auth.error 
    });
  }, [jwt, auth.user, auth.authChecked, auth.loading, auth.error]);

  useEffect(() => {
    if (!jwt || auth.user || auth.loading || auth.authChecked) return;
    console.log('Fetching user profile with JWT:', jwt.substring(0, 20) + '...');
    dispatch(getUser(jwt));
  }, [dispatch, jwt, auth.user, auth.loading, auth.authChecked]);

  const isAuthenticated = Boolean(auth.user);
  const isAuthBootstrapLoading = Boolean(jwt) && !auth.user && !auth.authChecked;
  const showNavbar = isAuthenticated ? shouldShowNavbar(location.pathname, routes, auth.user?.role) : false;

  if (isAuthBootstrapLoading) {
    console.log('Showing auth bootstrap loading state');
    return (
      <div className="app-shell min-h-screen">
        <SpinnerBackdrop />
      </div>
    );
  }

  // Log which branch will be rendered
  if (isAuthenticated) {
    console.log('Rendering authenticated app for user:', auth.user?.email);
  } else {
    console.log('Rendering unauthenticated auth page');
  }

  return (
    <div className="app-shell">
      {isAuthenticated ? (
        <div className="flex min-h-screen flex-col">
          {showNavbar && renderLazy(Navbar)}
          <main className="flex-1">
            <Routes>
              <Route element={renderLazy(Home)} path="/" />
              <Route element={renderLazy(Portfolio)} path="/portfolio" />
              <Route element={renderLazy(Activity)} path="/activity" />
              <Route element={renderLazy(Wallet)} path="/wallet" />
              <Route element={renderLazy(Withdrawal)} path="/withdrawal" />
              <Route element={renderLazy(PaymentDetails)} path="/payment-details" />
              <Route element={renderLazy(Wallet)} path="/wallet/:order_id" />
              <Route element={renderLazy(StockDetails)} path="/market/:id" />
              <Route element={renderLazy(Watchlist)} path="/watchlist" />
              <Route element={renderLazy(Profile)} path="/profile" />
              <Route element={renderLazy(SearchCoin)} path="/search" />
              {auth.user?.role === "ROLE_ADMIN" && (
                <Route element={renderLazy(WithdrawalAdmin)} path="/admin/withdrawal" />
              )}
              <Route element={renderLazy(Notfound)} path="*" />
            </Routes>
          </main>
          {renderLazy(Footer)}
          {renderLazy(ChatBotWidget)}
        </div>
      ) : (
        <main>
          <Routes>
            <Route element={renderLazy(Auth)} path="/" />
            <Route element={renderLazy(Auth)} path="/signup" />
            <Route element={renderLazy(Auth)} path="/signin" />
            <Route element={renderLazy(Auth)} path="/forgot-password" />
            <Route element={renderLazy(LoginWithGoogle)} path="/login-with-google" />
            <Route element={renderLazy(ResetPasswordForm)} path="/reset-password/:session" />
            <Route element={renderLazy(PasswordUpdateSuccess)} path="/password-update-successfully" />
            <Route element={renderLazy(TwoFactorAuth)} path="/two-factor-auth/:session" />
            <Route element={renderLazy(Notfound)} path="*" />
          </Routes>
        </main>
      )}
    </div>
  );
}

export default App;
