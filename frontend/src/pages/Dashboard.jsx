import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTargets } from '../store/targetsSlice';
import { fetchLogs } from '../store/logsSlice';
import { logsAPI } from '../services/api';
import { 
  Plus, 
  Globe, 
  Activity, 
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { items: targets, loading: targetsLoading } = useSelector((state) => state.targets);
  const { items: recentLogs, loading: logsLoading } = useSelector((state) => state.logs);
  
  const [stats, setStats] = useState(null);
  const loading = targetsLoading || logsLoading;

  useEffect(() => {
    dispatch(fetchTargets());
    dispatch(fetchLogs(null));
    fetchStats();
  }, [dispatch]);

  // Calculate real-time stats from Redux state
  useEffect(() => {
    if (targets.length > 0) {
      const targetsUp = targets.filter(t => t.lastStatus === 'UP').length;
      const targetsDown = targets.filter(t => t.lastStatus === 'DOWN').length;
      
      // Calculate average response time from active targets
      const activeTargets = targets.filter(t => t.responseTime != null);
      const avgResponseTime = activeTargets.length > 0
        ? activeTargets.reduce((sum, t) => sum + t.responseTime, 0) / activeTargets.length
        : 0;
      
      setStats({
        totalTargets: targets.length,
        targetsUp: targetsUp,
        targetsDown: targetsDown,
        averageResponseTime: avgResponseTime
      });
    }
  }, [targets]);

  const fetchStats = async () => {
    try {
      const statsRes = await logsAPI.getStats();
      // Stats can be used for additional metrics if needed
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const formatUptime = (percentage) => {
    return `${percentage.toFixed(2)}%`;
  };

  const formatResponseTime = (time) => {
    if (!time) return 'N/A';
    return `${parseFloat(time).toFixed(2)}ms`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'UP':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'DOWN':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'ERROR':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case 'UP':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'DOWN':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 border-4 border-black border-t-neo-yellow animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-neo-gray border-2 border-black p-4 shadow-neo">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-black">Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">Monitor your services</p>
          </div>
          <button
            onClick={() => window.location.href = '/targets'}
            className="btn btn-primary"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Target
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="card bg-white border-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">Total Targets</p>
              <p className="text-3xl font-bold text-black">{stats?.totalTargets || 0}</p>
            </div>
            <div className="w-12 h-12 bg-neo-gray border-2 border-black flex items-center justify-center">
              <Globe className="h-6 w-6 text-black" />
            </div>
          </div>
        </div>

        <div className="card bg-neo-blue border-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-black/70 mb-2">Online</p>
              <p className="text-3xl font-bold text-black">{stats?.targetsUp || 0}</p>
            </div>
            <div className="w-12 h-12 bg-white border-2 border-black flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-black" />
            </div>
          </div>
        </div>

        <div className="card bg-neo-red border-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-white/90 mb-2">Offline</p>
              <p className="text-3xl font-bold text-white">{stats?.targetsDown || 0}</p>
            </div>
            <div className="w-12 h-12 bg-white border-2 border-black flex items-center justify-center">
              <XCircle className="h-6 w-6 text-black" />
            </div>
          </div>
        </div>

        <div className="card bg-neo-yellow border-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-black/70 mb-2">Avg Response</p>
              <p className="text-2xl font-bold text-black">
                {formatResponseTime(stats?.averageResponseTime)}
              </p>
            </div>
            <div className="w-12 h-12 bg-white border-2 border-black flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-black" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Service Status */}
        <div className="xl:col-span-2">
          <div className="card bg-white border-2">
            <div className="px-4 py-3 border-b-2 border-black bg-neo-yellow">
              <h3 className="text-lg font-bold text-black">Service Status</h3>
              <p className="text-xs text-black/70 mt-0.5">All monitored services</p>
            </div>
            
            <div className="p-4 h-[440px] overflow-y-auto">
              {targets.length > 0 ? (
                <div className="space-y-2">
                  {targets.map((target) => (
                    <div key={target._id} className="group flex items-center justify-between p-3 border-2 border-black bg-white hover:bg-neo-gray transition-colors">
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className={`status-dot flex-shrink-0 ${
                          target.lastStatus === 'UP' ? 'status-dot-up' : 
                          target.lastStatus === 'DOWN' ? 'status-dot-down' : 
                          target.lastStatus === 'ERROR' ? 'status-dot-error' : 'status-dot-unknown'
                        }`}></div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-black truncate">{target.name}</p>
                          <p className="text-xs text-gray-600 truncate mt-0.5">{target.url}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <span className={`badge ${
                          target.lastStatus === 'UP' ? 'badge-success' :
                          target.lastStatus === 'DOWN' ? 'badge-destructive' :
                          target.lastStatus === 'ERROR' ? 'badge-warning' : 
                          'badge-secondary'
                        }`}>
                          {target.lastStatus || 'Unknown'}
                        </span>
                        <div className="text-right px-2 py-1 bg-neo-gray border-2 border-black">
                          <p className="text-sm font-bold text-black">
                            {formatUptime(target.uptimePercentage || 0)}
                          </p>
                          <p className="text-xs text-gray-600">uptime</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 bg-neo-gray border-2 border-black flex items-center justify-center mb-4">
                    <Globe className="h-8 w-8 text-black" />
                  </div>
                  <h3 className="text-sm font-bold text-black mb-2">No targets configured</h3>
                  <p className="text-sm text-gray-600 mb-4">Get started by adding your first monitoring target</p>
                  <button 
                    onClick={() => window.location.href = '/targets'}
                    className="btn btn-primary"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Target
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card bg-white border-2 h-[520px] flex flex-col">
          <div className="px-4 py-3 border-b-2 border-black bg-neo-gray">
            <h3 className="text-lg font-bold text-black">Recent Activity</h3>
            <p className="text-xs text-gray-600 mt-0.5">Latest events</p>
          </div>
          
          <div className="p-4 flex-1 overflow-y-auto">
            {recentLogs.length > 0 ? (
              <div className="space-y-2">
                {recentLogs.slice(0, 8).map((log) => (
                  <div key={log._id} className="flex items-start space-x-2 p-2 border-2 border-black bg-white hover:bg-neo-gray transition-colors">
                    <div className={`status-dot mt-1.5 flex-shrink-0 ${
                      log.status === 'UP' ? 'status-dot-up' : 
                      log.status === 'DOWN' ? 'status-dot-down' : 
                      log.status === 'ERROR' ? 'status-dot-error' : 'status-dot-unknown'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-black truncate">
                            {log.targetId?.name || 'Unknown'}
                          </p>
                          <p className="text-xs text-gray-600 mt-0.5">
                            {log.status} • {new Date(log.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        {log.responseTime && (
                          <span className="badge badge-info text-xs flex-shrink-0">
                            {formatResponseTime(log.responseTime)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-neo-gray border-2 border-black flex items-center justify-center mb-4">
                  <Activity className="h-8 w-8 text-black" />
                </div>
                <h3 className="text-sm font-bold text-black mb-2">No activity yet</h3>
                <p className="text-sm text-gray-600">Activity will appear here once monitoring starts</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;