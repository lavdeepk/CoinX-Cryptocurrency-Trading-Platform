// Page component for Activity.
import TradingHistory from '../Portfilio/TradingHistory'

const Activity = () => {
  return (
    <div className='page-shell animate-fadeIn'>
      <p className="page-kicker">Activity Feed</p>
      <h1 className="page-title">Trading History</h1>
      <p className="page-subtitle mb-6">Review all executed buy/sell orders with timestamps and P&L snapshots.</p>
      <TradingHistory />
    </div>
  )
}

export default Activity
