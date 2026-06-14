// Module for WithdrawalAdmin.jsx.
import { getAllWithdrawalRequest, proceedWithdrawal } from "@/Redux/Withdrawal/Action";
import { readableTimestamp } from "@/Util/readableTimestamp";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const WithdrawalAdmin = () => {
  const dispatch = useDispatch();
  const { withdrawal } = useSelector((store) => store);

  useEffect(() => {
    dispatch(getAllWithdrawalRequest(localStorage.getItem("jwt")));
  }, [dispatch]);

  const handleProcessWithdrawal = (id, accept) => {
    dispatch(proceedWithdrawal({ jwt: localStorage.getItem("jwt"), id, accept }));
  };

  return (
    <div className="page-shell animate-fadeIn">
      <div className="mb-6">
        <p className="page-kicker">Admin Console</p>
        <h1 className="page-title">All Withdrawal Requests</h1>
        <p className="page-subtitle">Review and process user withdrawal requests.</p>
      </div>
      <div className="table-shell overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-white/5">
              <TableHead>Date</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="text-right">Status</TableHead>
              <TableHead className="text-right">Process</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {withdrawal.requests?.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="py-5 font-medium">{readableTimestamp(item?.date)}</TableCell>
                <TableCell>
                  <p className="font-bold">{item.user.fullName}</p>
                  <p className="text-gray-300">{item.user.email}</p>
                </TableCell>
                <TableCell>Bank Account</TableCell>
                <TableCell className="text-emerald-300">{item.amount} USD</TableCell>
                <TableCell className="text-right">
                  <Badge className={`${item.status === "PENDING" ? "bg-rose-400/20 border-rose-300/35 text-rose-200" : "bg-emerald-400/20 border-emerald-300/35 text-emerald-200"}`}>
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="outline-none">
                      <Button variant="outline">Proceed</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="border-white/15 bg-slate-950/95">
                      <DropdownMenuItem>
                        <Button
                          onClick={() => handleProcessWithdrawal(item.id, true)}
                          className="w-full bg-emerald-500 text-white hover:bg-emerald-400"
                        >
                          Accept
                        </Button>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Button
                          onClick={() => handleProcessWithdrawal(item.id, false)}
                          className="w-full bg-red-500 text-white hover:bg-red-400"
                        >
                          Decline
                        </Button>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {!withdrawal.requests?.length && (
              <TableRow>
                <TableCell colSpan={6}>
                  <div className="empty-state">No withdrawal requests pending.</div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default WithdrawalAdmin;
