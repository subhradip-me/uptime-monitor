import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchLogs, setSelectedTarget } from '../store/logsSlice';
import { fetchTargets } from '../store/targetsSlice';
import { Activity, Clock, Download } from 'lucide-react';

const Logs = () => {
  const dispatch = useDispatch();
  const { items: logs, loading, selectedTarget } = useSelector((state) => state.logs);
  const { items: targets } = useSelector((state) => state.targets);

  useEffect(() => {
    dispatch(fetchTargets());
  }, [dispatch]);

  useEffect(() => {
    const targetId = selectedTarget === 'all' ? null : selectedTarget;
    dispatch(fetchLogs(targetId));
  }, [selectedTarget, dispatch]);

  const handleTargetChange = (targetId) => {
    dispatch(setSelectedTarget(targetId));
  };

  const exportLogs = () => {
    const csv = [
      ['Target', 'Status', 'Response Time', 'Timestamp', 'URL'].join(','),
      ...logs.map(log => [
        log.targetId?.name || 'Unknown',
        log.status,
        log.responseTime || 'N/A',
        new Date(log.timestamp).toLocaleString(),
        log.url
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `uptime-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="border-b border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Activity Logs</h1>
            <p className="text-sm text-gray-500 mt-1">Monitor all target activities and events</p>
          </div>
          
          <div className="flex gap-3">
            <select
              value={selectedTarget}
              onChange={(e) => handleTargetChange(e.target.value)}
              className="input-select text-sm min-w-[140px]"
            >
              <option value="all">All Targets</option>
              {targets.map(target => (
                <option key={target._id} value={target._id}>{target.name}</option>
              ))}
            </select>
            
            <button
              onClick={exportLogs}
              className="btn btn-secondary text-sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Logs */}
      <div className="card overflow-hidden h-[648px]">
        <div className="h-full overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500 mr-2"></div>
              Loading logs...
            </div>
          </div>
        ) : logs.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {logs.map((log) => (
              <div key={log._id} className="group p-4 hover:bg-gray-50/50 transition-colors duration-150">
                <div className="flex items-start justify-between gap-4 border-b-2 border-black">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className={`status-dot mt-1 flex-shrink-0 ${
                      log.status === 'UP' ? 'status-dot-up' : 
                      log.status === 'DOWN' ? 'status-dot-down' :
                      log.status === 'ERROR' ? 'status-dot-error' : 'status-dot-unknown'
                    }`}></div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900 text-sm truncate group-hover:text-gray-700">
                          {log.targetId?.name || 'Unknown Target'}
                        </h3>
                        <span className={`badge text-xs ${
                          log.status === 'UP' ? 'badge-success' :
                          log.status === 'DOWN' ? 'badge-destructive' : 
                          log.status === 'ERROR' ? 'badge-warning' : 'badge-secondary'
                        }`}>
                          {log.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate mb-1">{log.url}</p>
                      {log.errorMessage && (
                        <p className="text-xs text-red-600 font-medium truncate">{log.errorMessage}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right text-xs text-gray-500 flex-shrink-0">
                    <div className="flex items-center gap-1 justify-end mb-1">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    {log.responseTime && (
                      <div className="text-gray-600 font-medium">
                        {log.responseTime}ms
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <Activity className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">No logs found</h3>
            <p className="text-sm text-gray-500">
              {selectedTarget === 'all' 
                ? 'No monitoring activity recorded yet.'
                : 'No logs found for the selected target.'
              }
            </p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default Logs;