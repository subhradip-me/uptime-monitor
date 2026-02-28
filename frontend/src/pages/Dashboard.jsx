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
  AlertCircle,
  Terminal,
  Cpu,
  Clock
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
        return <CheckCircle2 className="h-4 w-4 text-term-green" />;
      case 'DOWN':
        return <XCircle className="h-4 w-4 text-term-red" />;
      case 'ERROR':
        return <AlertCircle className="h-4 w-4 text-term-yellow" />;
      default:
        return <AlertCircle className="h-4 w-4 text-term-gray" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex items-center px-2 py-0.5 text-xs font-medium border";
    switch (status) {
      case 'UP':
        return `${baseClasses} border-term-green text-term-green`;
      case 'DOWN':
        return `${baseClasses} border-term-red text-term-red`;
      default:
        return `${baseClasses} border-term-gray text-term-gray`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="terminal-spinner mx-auto mb-4"></div>
          <p className="text-term-gray text-sm">Initializing systems...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-6">
      {/* Header - Consistent with Targets/Logs */}
      <div className="terminal-window">
        <div className="terminal-header">
          <Activity className="h-4 w-4 text-term-green" />
          <span className="terminal-title">System Dashboard</span>
        </div>
        <div className="p-2 sm:p-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-term-white flex items-center gap-2">
                <span className="text-term-green">root@uptime:~$</span> status
              </h1>
              <p className="text-xs sm:text-sm text-term-gray mt-0.5 sm:mt-1">Real-time monitoring interface</p>
            </div>
            <button
              onClick={() => window.location.href = '/targets'}
              className="btn btn-primary w-full sm:w-auto text-xs sm:text-sm"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Add Target
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <div className="terminal-window p-2 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-term-gray uppercase tracking-wider mb-0.5 sm:mb-1 truncate">Total</p>
              <p className="text-lg sm:text-2xl font-bold text-term-white">{stats?.totalTargets || 0}</p>
            </div>
            <div className="w-7 h-7 sm:w-10 sm:h-10 border border-term-border flex items-center justify-center flex-shrink-0">
              <Globe className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-term-cyan" />
            </div>
          </div>
        </div>

        <div className="terminal-window p-2 sm:p-4 border-term-green/30">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-term-green uppercase tracking-wider mb-0.5 sm:mb-1 truncate">Online</p>
              <p className="text-lg sm:text-2xl font-bold text-term-green">{stats?.targetsUp || 0}</p>
            </div>
            <div className="w-7 h-7 sm:w-10 sm:h-10 border border-term-green flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-term-green" />
            </div>
          </div>
        </div>

        <div className="terminal-window p-2 sm:p-4 border-term-red/30">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-term-red uppercase tracking-wider mb-0.5 sm:mb-1 truncate">Offline</p>
              <p className="text-lg sm:text-2xl font-bold text-term-red">{stats?.targetsDown || 0}</p>
            </div>
            <div className="w-7 h-7 sm:w-10 sm:h-10 border border-term-red flex items-center justify-center flex-shrink-0">
              <XCircle className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-term-red" />
            </div>
          </div>
        </div>

        <div className="terminal-window p-2 sm:p-4 border-term-yellow/30">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-term-yellow uppercase tracking-wider mb-0.5 sm:mb-1 truncate">Latency</p>
              <p className="text-base sm:text-2xl font-bold text-term-yellow truncate">
                {formatResponseTime(stats?.averageResponseTime)}
              </p>
            </div>
            <div className="w-7 h-7 sm:w-10 sm:h-10 border border-term-yellow flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-term-yellow" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Responsive */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-2 sm:gap-4">
        {/* Service Status */}
        <div className="xl:col-span-2">
          <div className="terminal-window">
            <div className="terminal-header">
              <Cpu className="h-4 w-4 text-term-green" />
              <span className="terminal-title">Service Status</span>
              <span className="ml-auto text-xs text-term-gray">{targets.length} nodes</span>
            </div>
            
            <div className="p-2 sm:p-4 max-h-[250px] sm:max-h-[400px] lg:max-h-[500px] overflow-y-auto">
              {targets.length > 0 ? (
                <div className="space-y-1.5 sm:space-y-2">
                  {targets.map((target) => (
                    <div key={target._id} className="group flex items-center justify-between p-1.5 sm:p-3 border border-term-border bg-term-bg hover:border-term-green/50 transition-colors">
                      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                        <div className={`status-dot flex-shrink-0 ${
                          target.lastStatus === 'UP' ? 'status-dot-up' : 
                          target.lastStatus === 'DOWN' ? 'status-dot-down' : 
                          target.lastStatus === 'ERROR' ? 'status-dot-error' : 'status-dot-unknown'
                        }`}></div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-medium text-term-white truncate">{target.name}</p>
                          <p className="text-[10px] sm:text-xs text-term-gray truncate mt-0.5">{target.url}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                        <span className={`badge ${
                          target.lastStatus === 'UP' ? 'badge-success' :
                          target.lastStatus === 'DOWN' ? 'badge-destructive' :
                          target.lastStatus === 'ERROR' ? 'badge-warning' : 
                          'badge-secondary'
                        }`}>
                          {target.lastStatus || 'UNKNOWN'}
                        </span>
                        <div className="hidden sm:block text-right px-2 py-1 border border-term-border bg-term-bg min-w-[70px]">
                          <p className="text-sm font-bold text-term-white">
                            {formatUptime(target.uptimePercentage || 0)}
                          </p>
                          <p className="text-xs text-term-gray">uptime</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 sm:py-12">
                  <div className="mx-auto w-10 h-10 sm:w-16 sm:h-16 border border-term-border flex items-center justify-center mb-3 sm:mb-4">
                    <Globe className="h-5 w-5 sm:h-8 sm:w-8 text-term-gray" />
                  </div>
                  <p className="text-term-gray text-xs sm:text-sm mb-1 sm:mb-2">No targets configured</p>
                  <p className="text-term-gray text-[10px] sm:text-xs mb-3 sm:mb-4">Initialize monitoring by adding your first target</p>
                  <button 
                    onClick={() => window.location.href = '/targets'}
                    className="btn btn-primary text-xs sm:text-sm"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Add Target
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="terminal-window">
          <div className="terminal-header">
            <Activity className="h-4 w-4 text-term-cyan" />
            <span className="terminal-title">Recent Activity</span>
            <span className="ml-auto text-xs text-term-gray">Live</span>
          </div>
          
          <div className="p-2 sm:p-4 max-h-[200px] sm:max-h-[400px] lg:max-h-[500px] overflow-y-auto">
            {recentLogs.length > 0 ? (
              <div className="space-y-1.5 sm:space-y-2">
                {recentLogs.slice(0, 10).map((log) => (
                  <div key={log._id} className="flex items-start space-x-2 p-1.5 sm:p-2 border border-term-border bg-term-bg hover:border-term-cyan/30 transition-colors">
                    <div className={`status-dot mt-1 flex-shrink-0 ${
                      log.status === 'UP' ? 'status-dot-up' : 
                      log.status === 'DOWN' ? 'status-dot-down' : 
                      log.status === 'ERROR' ? 'status-dot-error' : 'status-dot-unknown'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-bold text-term-white truncate">
                            {log.targetId?.name || 'Unknown'}
                          </p>
                          <p className="text-[10px] sm:text-xs text-term-gray mt-0.5">
                            {log.status} • {new Date(log.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        {log.responseTime && (
                          <span className="badge badge-info text-[10px] sm:text-xs flex-shrink-0">
                            {formatResponseTime(log.responseTime)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-12">
                <div className="mx-auto w-10 h-10 sm:w-16 sm:h-16 border border-term-border flex items-center justify-center mb-3 sm:mb-4">
                  <Activity className="h-5 w-5 sm:h-8 sm:w-8 text-term-gray" />
                </div>
                <p className="text-term-gray text-xs sm:text-sm mb-1 sm:mb-2">No activity detected</p>
                <p className="text-term-gray text-[10px] sm:text-xs">Activity logs will populate once monitoring begins</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
