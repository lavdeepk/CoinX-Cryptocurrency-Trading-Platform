// Page component for Navbar.
import { Button } from "@/components/ui/button";
import SideBar from "../SideBar/SideBar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocation, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/Redux/Auth/Action";
import {
  Activity,
  Bookmark,
  CreditCard,
  Home,
  Landmark,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  UserCircle2,
  UserRound,
  Wallet,
} from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth } = useSelector((store) => store);
  const dispatch = useDispatch();

  const accountPath = auth.user?.role === "ROLE_ADMIN" ? "/admin/withdrawal" : "/profile";
  const accountLabel = auth.user?.role === "ROLE_ADMIN" ? "Admin Panel" : "Profile";

  const handleNavigate = () => {
    if (auth.user) navigate(accountPath);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/signin");
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  const userNavLinks = [
    { name: "Home", path: "/", icon: Home },
    { name: "Portfolio", path: "/portfolio", icon: LayoutDashboard },
    { name: "Watchlist", path: "/watchlist", icon: Bookmark },
    { name: "Activity", path: "/activity", icon: Activity },
    { name: "Wallet", path: "/wallet", icon: Wallet },
    { name: "Payment Details", path: "/payment-details", icon: Landmark },
    { name: "Withdrawal", path: "/withdrawal", icon: CreditCard },
  ];

  const adminNavLinks = [
    { name: "Home", path: "/", icon: Home },
    { name: "Admin", path: "/admin/withdrawal", icon: LayoutDashboard },
    { name: "Profile", path: "/profile", icon: UserRound },
  ];

  const navLinks = auth.user?.role === "ROLE_ADMIN" ? adminNavLinks : userNavLinks;

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="glass-navbar animate-slideDown sticky left-0 right-0 top-0 z-50">
      <div className="pointer-events-none absolute inset-x-12 -bottom-px h-px bg-cyan-300/35" />
      <div className="mx-auto w-full max-w-7xl px-3 py-3 sm:px-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 hover-lift hover:bg-white/10 lg:hidden"
                  aria-label="Open navigation menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-72 glass-panel border-r border-white/10" side="left">
                <SheetHeader>
                  <SheetTitle>
                    <div className="flex items-center justify-center gap-2 text-2xl">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/coinx-logo.svg" />
                      </Avatar>
                      <div>
                        <span className="font-bold gradient-text-orange">Coin</span>
                        <span className="gradient-text">X</span>
                      </div>
                    </div>
                  </SheetTitle>
                </SheetHeader>
                <SideBar />
              </SheetContent>
            </Sheet>

            <button
              type="button"
              onClick={handleLogoClick}
              className="group flex items-center gap-2 rounded-xl px-1.5 py-1 transition-colors hover:bg-white/5"
              aria-label="Go to home"
            >
              <Avatar className="h-9 w-9 ring-2 ring-cyan-300/20 transition-all group-hover:ring-cyan-300/55">
                <AvatarImage src="/coinx-logo.svg" />
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-base font-bold leading-tight">
                  <span className="gradient-text-orange">Coin</span>
                  <span className="gradient-text">X</span>
                </p>
                <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-200/70">Trade Console</p>
              </div>
            </button>
          </div>

          <nav className="hidden items-center gap-1.5 lg:flex">
            {navLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <Button
                  key={link.name}
                  onClick={() => navigate(link.path)}
                  variant="ghost"
                  className={`group animate-fadeIn h-9 rounded-lg border px-3 transition-colors duration-200 ${
                    isActive(link.path)
                      ? "border-cyan-300/55 bg-cyan-300/18 !text-cyan-100 shadow-[0_6px_18px_rgba(8,47,73,0.3)] hover:bg-cyan-300/22 !hover:text-cyan-50"
                      : "border-transparent bg-transparent text-slate-300 hover:border-white/15 hover:bg-white/8 !hover:text-slate-100"
                  }`}
                  aria-current={isActive(link.path) ? "page" : undefined}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <span className="mr-2 rounded-md bg-white/10 p-1 transition-transform duration-200 group-hover:-translate-y-0.5">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-sm">{link.name}</span>
                </Button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2.5">
            <Button
              onClick={() => navigate("/search")}
              variant="ghost"
              className="h-10 w-10 rounded-xl border border-white/15 bg-white/5 p-0 transition-colors duration-200 hover:border-white/25 hover:bg-white/10 sm:w-auto sm:px-4"
              aria-label="Open search"
            >
              <Search className="h-5 w-5 sm:mr-2" />
              <span className="hidden text-sm font-medium md:inline">Search</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="h-9 w-9 rounded-full ring-2 ring-cyan-300/20 transition-[box-shadow] duration-200 hover:ring-cyan-300/45 focus:outline-none focus:ring-2 focus:ring-cyan-300/60"
                  aria-label="Open account menu"
                >
                  <Avatar className="h-9 w-9 cursor-pointer">
                    {!auth.user ? (
                      <UserCircle2 className="h-5 w-5 text-slate-300" />
                    ) : (
                      <AvatarFallback className="bg-cyan-300 text-sm font-semibold text-slate-900">
                        {auth.user?.fullName?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="animate-fadeIn w-56 border border-white/10 bg-slate-900/95 text-slate-100 backdrop-blur-xl"
              >
                <DropdownMenuLabel className="text-[11px] uppercase tracking-wider text-slate-400">
                  {auth.user?.fullName || "My Account"}
                </DropdownMenuLabel>
                {auth.user?.email && <p className="px-2 pb-1 text-xs text-slate-400">{auth.user.email}</p>}
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  onSelect={handleNavigate}
                  className="cursor-pointer gap-2 focus:bg-white/10 focus:text-slate-100"
                >
                  <UserRound className="h-4 w-4" />
                  <span>{accountLabel}</span>
                </DropdownMenuItem>
                {auth.user?.role !== "ROLE_ADMIN" && (
                  <DropdownMenuItem
                    onSelect={() => navigate("/wallet")}
                    className="cursor-pointer gap-2 focus:bg-white/10 focus:text-slate-100"
                  >
                    <Wallet className="h-4 w-4" />
                    <span>Wallet</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  onSelect={handleLogout}
                  className="cursor-pointer gap-2 text-red-300 focus:bg-red-500/15 focus:text-red-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
