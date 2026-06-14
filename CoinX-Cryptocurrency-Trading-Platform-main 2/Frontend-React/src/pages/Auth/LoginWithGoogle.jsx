// Page component for LoginWithGoogle.
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/Api/api";
import { getUser } from "@/Redux/Auth/Action";

const LoginWithGoogle = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");
  const error = searchParams.get("error");

  useEffect(() => {
    if (!token) return;

    localStorage.setItem("jwt", token);
    dispatch(getUser(token));
    navigate("/", { replace: true });
  }, [token, dispatch, navigate]);

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/login/google`;
  };

  return (
    <div className="authContainer min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md glass-card rounded-2xl p-8 border border-cyan-300/25 text-center space-y-4">
        <h2 className="text-2xl font-bold gradient-text">Google Sign In</h2>
        <p className="text-sm text-slate-400">
          {error
            ? "Google login failed. Please try again."
            : "Continue with your Google account to access CoinX."}
        </p>
        <Button onClick={handleGoogleLogin} className="w-full h-11 btn-gradient font-semibold">
          Continue with Google
        </Button>
        <Button variant="ghost" className="w-full h-11" onClick={() => navigate("/signin")}>
          Back to Sign In
        </Button>
      </div>
    </div>
  );
};

export default LoginWithGoogle;
