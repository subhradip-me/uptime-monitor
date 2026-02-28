import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchLogs, setSelectedTarget } from '../store/logsSlice';
import { fetchTargets } from '../store/targetsSlice';
import { Activity, Clock, Download, Terminal, FileText } from 'lucide-react';

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
    ].join('\\n');

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

  const formatResponseTime = (time) => {
    if (!time) return 'N/A';
    return `${parseFloat(time).toFixed(2)}ms`;
  };

  return (
    <div className="space-y-2 sm:space-y-4">
      {/* Header */}
      <div className="terminal-window">
        <div className="terminal-header">
          <FileText className="h-4 w-4 text-term-cyan" />
          <span className="terminal-title">Activity Logs</span>
        </div>
        <div className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-term-white flex items-center gap-2">
                <span className="text-term-cyan">root@uptime:~$</span> logs
              </h1>
              <p className="text-xs sm:text-sm text-term-gray mt-1">Monitor all target activities and events</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <select
                value={selectedTarget}
                onChange={(e) => handleTargetChange(e.target.value)}
                className="input-select text-xs sm:text-sm min-w-[140px] font-mono"
              >
                <option value="all">All Targets</option>
                {targets.map(target => (
                  <option key={target._id} value={target._id}>{target.name}</option>
                ))}
              </select>
              
              <button
                onClick={exportLogs}
                className="btn btn-secondary text-xs sm:text-sm justify-center min-h-[36px]"
              >
                <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                <span className="sm:hidden">Export</span>
                <span className="hidden sm:inline">Export Logs</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Logs */}
      <div className="terminal-window h-[calc(100vh-280px)] sm:h-[600px] flex flex-col">
        <div className="terminal-header">
          <Terminal className="h-4 w-4 text-term-green" />
          <span className="terminal-title">Log Output</span>
          <span className="ml-auto text-xs text-term-gray">{logs.length} entries</span>
        </div>
        <div className="flex-1 overflow-y-auto p-2 sm:p-4">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center text-term-gray">
                <div className="terminal-spinner mr-2"></div>
                Loading logs...
              </div>
            </div>
          ) : logs.length > 0 ? (
            <div className="space-y-1 font-mono text-xs sm:text-sm">
              {logs.map((log, index) => (
                <div key={log._id} className="flex items-start gap-2 sm:gap-3 p-1.5 sm:p-2 border-b border-term-border hover:bg-term-bg transition-colors">
                  <span className="text-term-gray text-[10px] sm:text-xs hidden sm:inline">[{String(index + 1).padStart(4, '0')}]</span>
                  <span className="text-term-gray text-[10px] sm:text-xs">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <div className={`status-dot mt-1 flex-shrink-0 ${
                    log.status === 'UP' ? 'status-dot-up' : 
                    log.status === 'DOWN' ? 'status-dot-down' :
                    log.status === 'ERROR' ? 'status-dot-error' : 'status-dot-unknown'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                      <span className="text-term-white font-medium truncate">
                        {log.targetId?.name || 'Unknown'}
                      </span>
                      <span className={`text-[10px] sm:text-xs ${
                        log.status === 'UP' ? 'text-term-green' :
                        log.status === 'DOWN' ? 'text-term-red' : 
                        log.status === 'ERROR' ? 'text-term-yellow' : 'text-term-gray'
                      }`}>
                        [{log.status}]
                      </span>
                    </div>
                    <p className="text-term-gray text-[10px] sm:text-xs truncate">{log.url}</p>
                    {log.errorMessage && (
                      <p className="text-term-red text-[10px] sm:text-xs truncate">{log.errorMessage}</p>
                    )}
                  </div>
                  {log.responseTime && (
                    <span className="text-term-cyan text-[10px] sm:text-xs flex-shrink-0">
                      {formatResponseTime(log.responseTime)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 sm:p-12 text-center">
              <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 border border-term-border flex items-center justify-center mb-3 sm:mb-4">
                <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-term-gray" />
              </div>
              <p className="text-term-gray text-xs sm:text-sm mb-1 sm:mb-2">No logs found</p>
              <p className="text-term-gray text-[10px] sm:text-xs">
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
