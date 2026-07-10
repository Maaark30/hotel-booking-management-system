import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDashboardSummary, getTodayStats, getUpcomingReservations, getTopRooms } from '../services/report.service';
import KpiCard from '../components/KpiCard';
import AiInsightsPanel from '../components/AiInsightsPanel';
import WeeklyBookingsChart from '../components/WeeklyBookingsChart';
import TodayActivity from '../components/TodayActivity';
import LatestReviews from '../components/LatestReviews';
import RevenueTarget from '../components/RevenueTarget';
import RoomStatusDonut from '../components/RoomStatusDonut';
import TopRooms from '../components/TopRooms';
import UpcomingReservations from '../components/UpcomingReservations';
import QuickActions from '../components/QuickActions';
import { BedDouble, Users, CalendarCheck, Wallet, TrendingUp, Wrench, Sparkles } from 'lucide-react';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [todayData, setTodayData] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [topRoomsData, setTopRoomsData] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    Promise.all([
      getDashboardSummary(),
      getTodayStats(),
      getUpcomingReservations(),
      getTopRooms(),
    ])
      .then(([summaryData, today, upcomingData, topRoomsResult]) => {
        setSummary(summaryData);
        setTodayData(today);
        setUpcoming(upcomingData);
        setTopRoomsData(topRoomsResult);
      })
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setIsLoading(false));
  }, [authLoading]);

  return (
    <div>
      {/* Hero Section */}
      <div className="mb-8">
        <h1
          className="text-3xl font-bold text-white mb-1"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {getGreeting()}, {user?.fullName?.split(' ')[0]}
        </h1>
        <p className="text-slate-400">Here's what's happening at your property today.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Occupancy Rate"
            value={summary.occupancyRate}
            suffix="%"
            icon={TrendingUp}
            accentColor="var(--color-accent-teal)"
          />
          <KpiCard
            label="Monthly Revenue"
            value={`₱${summary.monthlyRevenue.toLocaleString()}`}
            icon={Wallet}
            accentColor="var(--color-luxury-gold)"
          />
          <KpiCard
            label="Total Bookings"
            value={summary.totalBookings}
            icon={CalendarCheck}
          />
          <KpiCard
            label="Total Guests"
            value={summary.totalGuests}
            icon={Users}
          />
          <KpiCard
            label="Total Rooms"
            value={summary.totalRooms}
            icon={BedDouble}
          />
          <KpiCard
            label="Available Rooms"
            value={summary.availableRooms}
            icon={BedDouble}
            accentColor="var(--color-success)"
          />
          <KpiCard
            label="Occupied Rooms"
            value={summary.occupiedRooms}
            icon={BedDouble}
            accentColor="var(--color-danger)"
          />
          <KpiCard
            label="Reserved Rooms"
            value={summary.reservedRooms}
            icon={CalendarCheck}
            accentColor="var(--color-luxury-gold)"
          />
          <KpiCard
            label="Out of Service"
            value={summary.maintenanceRooms}
            icon={Wrench}
            accentColor="#ef4444"
          />
          <KpiCard
            label="Housekeeping Issues"
            value={summary.housekeepingIssues}
            icon={Sparkles}
            accentColor="var(--color-accent-teal)"
          />
        </div>
      )}

      <div className="mt-6">
        <AiInsightsPanel />
      </div>

      {/* Row 2: Revenue Target + Room Status + Quick Actions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <RevenueTarget monthlyRevenue={summary?.monthlyRevenue || 0} />
        <RoomStatusDonut summary={summary} />
        <QuickActions />
      </div>

      {/* Row 3: Weekly Chart + Today's Activity */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <WeeklyBookingsChart data={todayData?.weeklyBookings || []} />
        </div>
        <TodayActivity
          checkIns={todayData?.checkInsToday || []}
          checkOuts={todayData?.checkOutsToday || []}
        />
      </div>

      {/* Row 4: Top Rooms + Upcoming Reservations */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopRooms rooms={topRoomsData} />
        <UpcomingReservations reservations={upcoming} />
      </div>

      {/* Row 5: Latest Reviews */}
      <div className="mt-4">
        <LatestReviews />
      </div>
    </div>
  );
}