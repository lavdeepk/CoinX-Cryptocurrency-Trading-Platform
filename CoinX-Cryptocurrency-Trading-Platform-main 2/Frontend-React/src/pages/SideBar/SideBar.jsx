// Page component for SideBar.
import { logout } from "@/Redux/Auth/Action";
import { Button } from "@/components/ui/button";
import { SheetClose } from "@/components/ui/sheet";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  Bookmark,
  CreditCard,
  Home,
  Landmark,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  UserRound,
  Wallet,
} from "lucide-react";

const SideBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { auth } = useSelector((store) => store);

  const userMenu = [
    { name: "Home", path: "/", icon: Home },
    { name: "Portfolio", path: "/portfolio", icon: LayoutDashboard },
    { name: "Watchlist", path: "/watchlist", icon: Bookmark },
    { name: "Activity", path: "/activity", icon: Activity },
    { name: "Wallet", path: "/wallet", icon: Wallet },
    { name: "Payment Details", path: "/payment-details", icon: Landmark },
    { name: "Withdrawal", path: "/withdrawal", icon: CreditCard },
    { name: "Profile", path: "/profile", icon: UserRound },
    { name: "Logout", path: "/signin", icon: LogOut },
  ];

  const adminMenu = [
    { name: "Home", path: "/", icon: Home },
    { name: "Admin Withdrawal", path: "/admin/withdrawal", icon: ShieldCheck },
    { name: "Profile", path: "/profile", icon: UserRound },
    { name: "Logout", path: "/signin", icon: LogOut },
  ];

  const menu = auth.user?.role === "ROLE_ADMIN" ? adminMenu : userMenu;
  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleMenuClick = (item) => {
    if (item.name === "Logout") {
      handleLogout();
      navigate(item.path);
      return;
    }
    navigate(item.path);
  };

  return (
    <div className="mt-8 space-y-2.5">
      {menu.map((item, index) => {
        const Icon = item.icon;
        return (
          <div key={item.name} className="animate-slideInLeft" style={{ animationDelay: `${index * 50}ms` }}>
            <SheetClose className="w-full">
              <Button
                onClick={() => handleMenuClick(item)}
                variant="outline"
                className={`hover-lift group relative flex w-full items-center justify-start gap-4 overflow-hidden py-5 ${
                  isActive(item.path)
                    ? "border-cyan-300/40 bg-cyan-300/10 text-white"
                    : "border-white/15 bg-white/5 hover:border-cyan-300/45 hover:bg-cyan-300/10"
                }`}
              >
                <div
                  className={`absolute bottom-0 left-0 top-0 w-1 bg-cyan-300 ${
                    isActive(item.path) ? "translate-x-0" : "-translate-x-full group-hover:translate-x-0"
                  } transition-transform duration-300`}
                />
                <span className="inline-flex w-7 items-center justify-center rounded-md bg-white/5 p-1 transition-transform duration-300 group-hover:scale-110">
                  <Icon className="h-4 w-4" />
                </span>
                <p className="text-sm font-medium transition-transform duration-300 group-hover:translate-x-1">
                  {item.name}
                </p>
              </Button>
            </SheetClose>
          </div>
        );
      })}
    </div>
  );
};

export default SideBar;
