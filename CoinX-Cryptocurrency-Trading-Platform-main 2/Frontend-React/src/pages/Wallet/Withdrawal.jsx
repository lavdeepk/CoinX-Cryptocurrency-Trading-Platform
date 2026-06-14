// Page component for Withdrawal.
import { getWithdrawalHistory } from "@/Redux/Withdrawal/Action";
import { readableTimestamp } from "@/Util/readableTimestamp";
import { Badge } from "@/components/ui/badge";
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

const Withdrawal = () => {
  const dispatch = useDispatch();

  const { withdrawal } = useSelector((store) => store);

  useEffect(() => {
    dispatch(getWithdrawalHistory(localStorage.getItem("jwt")));
  }, [dispatch]);

  return (
    <div className="page-shell animate-fadeIn">
      <div className="mb-6">
        <p className="page-kicker">Payout History</p>
        <h1 className="page-title">Withdrawal</h1>
        <p className="page-subtitle">Track every withdrawal request and approval status.</p>
      </div>
      <div className="table-shell">
        <Table>
          <TableHeader>
            <TableRow className="bg-white/5">
              <TableHead>Date</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {withdrawal.history.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  {readableTimestamp(item?.date)}
                </TableCell>
                <TableCell>{"Bank Account"}</TableCell>
                <TableCell>₹{item.amount}</TableCell>
                <TableCell className="text-right">
                  <Badge className={`${item.status == "PENDING" ? "bg-rose-400/20 border-rose-300/35 text-rose-200" : "bg-emerald-400/20 border-emerald-300/35 text-emerald-200"}
                   `}>
                    {item.status}
                  </Badge>

                </TableCell>
              </TableRow>
            ))}
            {!withdrawal.history?.length && (
              <TableRow>
                <TableCell colSpan={4}>
                  <div className="empty-state">No withdrawal requests found yet.</div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Withdrawal;
