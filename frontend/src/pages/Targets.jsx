import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchTargets,
  addTarget,
  updateTarget,
  deleteTarget,
  pauseTarget,
  resumeTarget
} from '../store/targetsSlice';
import { targetsAPI, alertsAPI } from '../services/api';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Play,
  Pause, 
  Globe, 
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Network,
  Key,
  Server,
  Bell,
  Terminal,
  Target,
  ChevronRight
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const Targets = () => {
  const dispatch = useDispatch();
  const { items: targets, loading, error } = useSelector((state) => state.targets);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTarget, setEditingTarget] = useState(null);
  const [showAlertSettings, setShowAlertSettings] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    monitorType: 'http',
    port: '',
    keyword: {
      settings: {
        text: '',
        shouldExist: true
      }
    },
    interval: 60000,
    isActive: true,
    failureThreshold: 2,
    recoveryThreshold: 2,
    sslCheck: {
      enabled: true,
      alertDays: [30, 14, 7]
    },
    alertSettings: {
      email: { enabled: false, addresses: [] },
      sms: { enabled: false, phoneNumbers: [] },
      slack: { enabled: false, webhookUrl: '' },
      discord: { enabled: false, webhookUrl: '' },
      teams: { enabled: false, webhookUrl: '' },
      telegram: { enabled: false, botToken: '', chatId: '' },
      webhook: { enabled: false, url: '', headers: {} }
    }
  });

  useEffect(() => {
    dispatch(fetchTargets());
  }, [dispatch]);

  const handleAddTarget = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = { ...formData };
      
      if (dataToSend.port) {
        dataToSend.port = parseInt(dataToSend.port);
      }
      
      if ((formData.monitorType !== 'tcp' && formData.monitorType !== 'udp') || !dataToSend.port) {
        delete dataToSend.port;
      }
      
      if (formData.monitorType !== 'keyword' || !formData.keyword?.settings?.text) {
        delete dataToSend.keyword;
      }
      
      await dispatch(addTarget(dataToSend)).unwrap();
      setShowAddModal(false);
      setFormData({ 
        name: '', 
        url: '', 
        monitorType: 'http',
        port: '',
        keyword: { settings: { text: '', shouldExist: true } },
        interval: 60000, 
        isActive: true,
        failureThreshold: 2,
        recoveryThreshold: 2,
        alertSettings: {
          email: { enabled: false, addresses: [] },
          sms: { enabled: false, phoneNumbers: [] },
          slack: { enabled: false, webhookUrl: '' },
          discord: { enabled: false, webhookUrl: '' },
          teams: { enabled: false, webhookUrl: '' },
          telegram: { enabled: false, botToken: '', chatId: '' },
          webhook: { enabled: false, url: '', headers: {} }
        }
      });
      setShowAlertSettings(false);
    } catch (error) {
      console.error('Error adding target:', error);
      alert('Error adding target: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEditTarget = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = { ...formData };
      
      if (dataToSend.port) {
        dataToSend.port = parseInt(dataToSend.port);
      }
      
      if ((formData.monitorType !== 'tcp' && formData.monitorType !== 'udp') || !dataToSend.port) {
        delete dataToSend.port;
      }
      
      if (formData.monitorType !== 'keyword' || !formData.keyword?.settings?.text) {
        delete dataToSend.keyword;
      }
      
      await dispatch(updateTarget({ id: editingTarget._id, data: dataToSend })).unwrap();
      setShowEditModal(false);
      setEditingTarget(null);
      setFormData({ 
        name: '', 
        url: '', 
        monitorType: 'http',
        port: '',
        keyword: { settings: { text: '', shouldExist: true } },
        interval: 60000, 
        isActive: true,
        failureThreshold: 2,
        recoveryThreshold: 2,
        alertSettings: {
          email: { enabled: false, addresses: [] },
          sms: { enabled: false, phoneNumbers: [] },
          slack: { enabled: false, webhookUrl: '' },
          discord: { enabled: false, webhookUrl: '' },
          teams: { enabled: false, webhookUrl: '' },
          telegram: { enabled: false, botToken: '', chatId: '' },
          webhook: { enabled: false, url: '', headers: {} }
        }
      });
      setShowAlertSettings(false);
    } catch (error) {
      console.error('Error updating target:', error);
      alert('Error updating target: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteTarget = async (id) => {
    if (window.confirm('Are you sure you want to delete this target?')) {
      try {
        await dispatch(deleteTarget(id)).unwrap();
      } catch (error) {
        console.error('Error deleting target:', error);
      }
    }
  };

  const handlePauseTarget = async (id) => {
    try {
      await dispatch(pauseTarget(id)).unwrap();
    } catch (error) {
      console.error('Error pausing target:', error);
    }
  };

  const handleResumeTarget = async (id) => {
    try {
      await dispatch(resumeTarget(id)).unwrap();
    } catch (error) {
      console.error('Error resuming target:', error);
    }
  };

  const handleTestAlert = async (target, status = 'DOWN') => {
    try {
      const response = await alertsAPI.testAlert(target._id, status);
      if (response.data.success) {
        alert(`[OK] Test alert sent!\\n\\nChannels: ${response.data.result.channels?.join(', ') || 'none'}\\nFailed: ${response.data.result.failed?.join(', ') || 'none'}`);
      } else {
        alert('[WARN] Alert was rate-limited or no channels configured.');
      }
    } catch (error) {
      console.error('Error sending test alert:', error);
      alert('[ERROR] Error sending test alert: ' + (error.response?.data?.message || error.message));
    }
  };

  const openEditModal = (target) => {
    setEditingTarget(target);
    setFormData({
      name: target.name,
      url: target.url,
      monitorType: target.monitorType || 'http',
      port: target.port || '',
      keyword: target.keyword?.settings ? target.keyword : { settings: { text: '', shouldExist: true } },
      interval: target.interval,
      isActive: target.isActive,
      failureThreshold: target.failureThreshold || 2,
      recoveryThreshold: target.recoveryThreshold || 2,
      sslCheck: target.sslCheck || { enabled: true, alertDays: [30, 14, 7] },
      alertSettings: target.alertSettings || {
        email: { enabled: false, addresses: [] },
        sms: { enabled: false, phoneNumbers: [] },
        slack: { enabled: false, webhookUrl: '' },
        discord: { enabled: false, webhookUrl: '' },
        teams: { enabled: false, webhookUrl: '' },
        telegram: { enabled: false, botToken: '', chatId: '' },
        webhook: { enabled: false, url: '', headers: {} }
      }
    });
    setShowEditModal(true);
  };

  const handleMonitorTypeChange = (newType) => {
    setFormData({
      ...formData,
      monitorType: newType,
      port: (newType === 'tcp' || newType === 'udp') ? formData.port : '',
      keyword: newType === 'keyword' 
        ? (formData.keyword?.settings?.text ? formData.keyword : { settings: { text: '', shouldExist: true } })
        : { settings: { text: '', shouldExist: true } }
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'UP':
        return <CheckCircle2 className="h-4 w-4 text-term-green" />;
      case 'DOWN':
        return <XCircle className="h-4 w-4 text-term-red" />;
      default:
        return <AlertCircle className="h-4 w-4 text-term-gray" />;
    }
  };

  const getMonitorTypeIcon = (type) => {
    switch (type) {
      case 'http':
      case 'https':
        return <Globe className="h-4 w-4 text-term-cyan" />;
      case 'tcp':
        return <Network className="h-4 w-4 text-term-magenta" />;
      case 'udp':
        return <Server className="h-4 w-4 text-term-blue" />;
      case 'keyword':
        return <Key className="h-4 w-4 text-term-yellow" />;
      default:
        return <Globe className="h-4 w-4 text-term-gray" />;
    }
  };

  const getMonitorTypeBadge = (type) => {
    const badges = {
      http: 'border-term-cyan text-term-cyan',
      https: 'border-term-cyan text-term-cyan',
      tcp: 'border-term-magenta text-term-magenta',
      udp: 'border-term-blue text-term-blue',
      keyword: 'border-term-yellow text-term-yellow'
    };
    return `inline-flex items-center px-2 py-0.5 text-xs font-medium border ${badges[type] || 'border-term-gray text-term-gray'}`;
  };

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 text-xs font-medium border";
    switch (status) {
      case 'UP':
        return `${baseClasses} border-term-green text-term-green`;
      case 'DOWN':
        return `${baseClasses} border-term-red text-term-red`;
      default:
        return `${baseClasses} border-term-gray text-term-gray`;
    }
  };

  const formatInterval = (interval) => {
    return `${interval / 1000}s`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="terminal-spinner mx-auto mb-4"></div>
          <p className="text-term-gray text-sm">Loading target data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-6">
      {/* Header */}
      <div className="terminal-window">
        <div className="terminal-header">
          <Target className="h-4 w-4 text-term-green" />
          <span className="terminal-title">Target Management</span>
        </div>
        <div className="p-2 sm:p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3">
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-bold text-term-white flex items-center gap-1 sm:gap-2">
                <span className="text-term-green">root@uptime:~$</span> targets
              </h1>
              <p className="text-[10px] sm:text-sm text-term-gray mt-0.5 sm:mt-1">Manage monitoring nodes</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary flex items-center justify-center gap-1.5 w-full sm:w-auto text-xs sm:text-sm py-2 sm:py-2"
            >
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Add Target</span>
            </button>
          </div>
        </div>
      </div>

      {/* Targets List */}
      <div className="terminal-window">
        {targets.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="data-grid">
                <thead>
                  <tr>
                    <th className="text-left">Target</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th className="hidden md:table-cell">Uptime</th>
                    <th className="hidden lg:table-cell">Response</th>
                    <th className="hidden xl:table-cell">Interval</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {targets.map((target) => (
                    <tr key={target._id} className="group">
                      <td className="whitespace-nowrap">
                        <div className="flex items-center">
                          {getMonitorTypeIcon(target.monitorType)}
                          <div className="ml-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-term-white">{target.name}</span>
                              {target.certificateInfo?.valid !== null && target.certificateInfo?.daysUntilExpiry !== null && (
                                <span 
                                  className={`inline-flex items-center px-2 py-0.5 text-xs font-medium border ${
                                    target.certificateInfo.daysUntilExpiry <= 7 
                                      ? 'border-term-red text-term-red' 
                                      : target.certificateInfo.daysUntilExpiry <= 14
                                      ? 'border-term-yellow text-term-yellow'
                                      : target.certificateInfo.daysUntilExpiry <= 30
                                      ? 'border-term-magenta text-term-magenta'
                                      : 'border-term-green text-term-green'
                                  }`}
                                  title={`SSL expires in ${target.certificateInfo.daysUntilExpiry} days\nIssuer: ${target.certificateInfo.issuer}`}
                                >
                                  SSL:{target.certificateInfo.daysUntilExpiry}d
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-term-gray">
                              {target.monitorType === 'tcp' || target.monitorType === 'udp' 
                                ? `${target.url}${target.port ? ':' + target.port : ''}`
                                : target.url}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap">
                        <span className={getMonitorTypeBadge(target.monitorType)}>
                          {(target.monitorType || 'http').toUpperCase()}
                        </span>
                      </td>
                      <td className="whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(target.lastStatus)}
                          <span className={getStatusBadge(target.lastStatus)}>
                            {target.lastStatus}
                          </span>
                          {target.isPaused && (
                            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium border border-term-yellow text-term-yellow">
                              PAUSED
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap hidden md:table-cell">
                        <div className="text-sm text-term-white">{target.uptimePercentage.toFixed(2)}%</div>
                        <div className="text-xs text-term-gray">
                          {target.successfulChecks}/{target.totalChecks}
                        </div>
                      </td>
                      <td className="whitespace-nowrap hidden lg:table-cell">
                        <div className="text-sm text-term-white">
                          {target.responseTime ? `${target.responseTime}ms` : 'N/A'}
                        </div>
                        <div className="text-xs text-term-gray">
                          {target.lastChecked ? new Date(target.lastChecked).toLocaleDateString() : 'Never'}
                        </div>
                      </td>
                      <td className="whitespace-nowrap hidden xl:table-cell">
                        <div className="flex items-center text-sm text-term-white">
                          <Clock className="h-3 w-3 mr-1 text-term-gray" />
                          {formatInterval(target.interval)}
                        </div>
                      </td>
                      <td className="whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {(target.alertSettings?.email?.enabled || 
                            target.alertSettings?.slack?.enabled || 
                            target.alertSettings?.discord?.enabled ||
                            target.alertSettings?.teams?.enabled ||
                            target.alertSettings?.telegram?.enabled ||
                            target.alertSettings?.webhook?.enabled) && (
                            <button
                              onClick={() => handleTestAlert(target, 'DOWN')}
                              className="p-1.5 text-term-magenta hover:bg-term-magenta hover:text-term-bg border border-term-magenta transition-colors"
                              title="Test Alert"
                            >
                              <Bell className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {target.isPaused ? (
                            <button
                              onClick={() => handleResumeTarget(target._id)}
                              className="p-1.5 text-term-green hover:bg-term-green hover:text-term-bg border border-term-green transition-colors"
                              title="Resume"
                            >
                              <Play className="h-3.5 w-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handlePauseTarget(target._id)}
                              className="p-1.5 text-term-yellow hover:bg-term-yellow hover:text-term-bg border border-term-yellow transition-colors"
                              title="Pause"
                            >
                              <Pause className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => openEditModal(target)}
                            className="p-1.5 text-term-cyan hover:bg-term-cyan hover:text-term-bg border border-term-cyan transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTarget(target._id)}
                            className="p-1.5 text-term-red hover:bg-term-red hover:text-term-bg border border-term-red transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="sm:hidden">
              <div className="p-2 space-y-2">
                {targets.map((target) => (
                  <div key={target._id} className="border border-term-border bg-term-bg p-3 space-y-2">
                    {/* Header: Name + Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {getMonitorTypeIcon(target.monitorType)}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-term-white truncate">{target.name}</p>
                          <p className="text-[10px] text-term-gray truncate">
                            {target.monitorType === 'tcp' || target.monitorType === 'udp' 
                              ? `${target.url}${target.port ? ':' + target.port : ''}`
                              : target.url}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {getStatusIcon(target.lastStatus)}
                        {target.isPaused && (
                          <span className="inline-flex items-center px-1.5 py-0 text-[10px] font-medium border border-term-yellow text-term-yellow">
                            P
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center justify-between text-[10px] text-term-gray pt-1 border-t border-term-border">
                      <div className="flex items-center gap-3">
                        <span className={getMonitorTypeBadge(target.monitorType)}>
                          {(target.monitorType || 'http').toUpperCase()}
                        </span>
                        <span>{target.uptimePercentage.toFixed(0)}% uptime</span>
                        {target.responseTime && (
                          <span className="text-term-cyan">{target.responseTime}ms</span>
                        )}
                      </div>
                      <span>{formatInterval(target.interval)}</span>
                    </div>

                    {/* SSL Badge */}
                    {target.certificateInfo?.valid !== null && target.certificateInfo?.daysUntilExpiry !== null && (
                      <div className="pt-1">
                        <span 
                          className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium border ${
                            target.certificateInfo.daysUntilExpiry <= 7 
                              ? 'border-term-red text-term-red' 
                              : target.certificateInfo.daysUntilExpiry <= 14
                              ? 'border-term-yellow text-term-yellow'
                              : target.certificateInfo.daysUntilExpiry <= 30
                              ? 'border-term-magenta text-term-magenta'
                              : 'border-term-green text-term-green'
                          }`}
                        >
                          SSL expires in {target.certificateInfo.daysUntilExpiry}d
                        </span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-1 pt-1 border-t border-term-border">
                      {(target.alertSettings?.email?.enabled || 
                        target.alertSettings?.slack?.enabled || 
                        target.alertSettings?.discord?.enabled ||
                        target.alertSettings?.teams?.enabled ||
                        target.alertSettings?.telegram?.enabled ||
                        target.alertSettings?.webhook?.enabled) && (
                        <button
                          onClick={() => handleTestAlert(target, 'DOWN')}
                          className="p-2 text-term-magenta hover:bg-term-magenta hover:text-term-bg border border-term-magenta transition-colors"
                          title="Test Alert"
                        >
                          <Bell className="h-4 w-4" />
                        </button>
                      )}
                      {target.isPaused ? (
                        <button
                          onClick={() => handleResumeTarget(target._id)}
                          className="p-2 text-term-green hover:bg-term-green hover:text-term-bg border border-term-green transition-colors"
                          title="Resume"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handlePauseTarget(target._id)}
                          className="p-2 text-term-yellow hover:bg-term-yellow hover:text-term-bg border border-term-yellow transition-colors"
                          title="Pause"
                        >
                          <Pause className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => openEditModal(target)}
                        className="p-2 text-term-cyan hover:bg-term-cyan hover:text-term-bg border border-term-cyan transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTarget(target._id)}
                        className="p-2 text-term-red hover:bg-term-red hover:text-term-bg border border-term-red transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 sm:py-12 px-4">
            <Globe className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-term-gray mb-4" />
            <p className="text-term-gray text-sm mb-2">No targets configured</p>
            <p className="text-term-gray text-xs mb-4">Initialize monitoring by adding your first target</p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Target
            </button>
          </div>
        )}
      </div>

      {/* Add Target Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 overflow-y-auto h-full w-full z-50 p-2 sm:p-4">
          <div className="relative top-0 sm:top-10 mx-auto p-0 border border-term-border w-full max-w-[600px] bg-term-bg-light max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="terminal-header">
              <Terminal className="h-4 w-4 text-term-green" />
              <span className="terminal-title">Add New Target</span>
              <button 
                onClick={() => setShowAddModal(false)}
                className="ml-auto text-term-gray hover:text-term-white"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 sm:p-6">
              <form onSubmit={handleAddTarget} className="space-y-4">
                <div>
                  <label className="form-label font-mono">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input font-mono"
                    placeholder="my_service"
                  />
                </div>

                <div>
                  <label className="form-label font-mono">Monitor Type</label>
                  <select
                    value={formData.monitorType}
                    onChange={(e) => handleMonitorTypeChange(e.target.value)}
                    className="input font-mono"
                  >
                    <option value="http">HTTP - Website/API</option>
                    <option value="https">HTTPS - Secure Website</option>
                    <option value="tcp">TCP - Port Monitor</option>
                    <option value="udp">UDP - Port Monitor</option>
                    <option value="keyword">Keyword - Content Check</option>
                  </select>
                </div>

                <div>
                  <label className="form-label font-mono">
                    {formData.monitorType === 'tcp' || formData.monitorType === 'udp' 
                      ? 'Hostname/IP' 
                      : 'URL'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="input font-mono"
                    placeholder={formData.monitorType === 'tcp' || formData.monitorType === 'udp'
                      ? 'example.com'
                      : 'https://example.com'}
                  />
                </div>

                {(formData.monitorType === 'tcp' || formData.monitorType === 'udp') && (
                  <div>
                    <label className="form-label font-mono">Port</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="65535"
                      value={formData.port}
                      onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                      className="input font-mono"
                      placeholder={formData.monitorType === 'tcp' ? '5432' : '53'}
                    />
                  </div>
                )}

                {formData.monitorType === 'keyword' && (
                  <div className="space-y-3 border border-term-border p-3 bg-term-bg">
                    <h4 className="text-sm font-medium text-term-white">Keyword Settings</h4>
                    <div>
                      <label className="form-label font-mono">Keyword/Phrase</label>
                      <input
                        type="text"
                        required
                        value={formData.keyword.settings.text}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          keyword: { 
                            settings: { 
                              ...formData.keyword.settings, 
                              text: e.target.value 
                            } 
                          } 
                        })}
                        className="input font-mono"
                        placeholder="Welcome, Login"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.keyword.settings.shouldExist}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          keyword: { 
                            settings: { 
                              ...formData.keyword.settings, 
                              shouldExist: e.target.checked 
                            } 
                          } 
                        })}
                        className="rounded bg-term-bg border-term-border"
                        id="shouldExist"
                      />
                      <label htmlFor="shouldExist" className="text-sm text-term-gray">
                        Keyword should exist
                      </label>
                    </div>
                  </div>
                )}

                <div>
                  <label className="form-label font-mono">Check Interval</label>
                  <select
                    value={formData.interval}
                    onChange={(e) => setFormData({ ...formData, interval: parseInt(e.target.value) })}
                    className="input font-mono"
                  >
                    <option value={30000}>30 seconds</option>
                    <option value={60000}>1 minute</option>
                    <option value={300000}>5 minutes</option>
                    <option value={600000}>10 minutes</option>
                    <option value={1800000}>30 minutes</option>
                    <option value={3600000}>1 hour</option>
                  </select>
                </div>

                <div className="border-t border-term-border pt-4 space-y-3">
                  <h4 className="text-sm font-medium text-term-white">Thresholds</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="form-label font-mono text-xs sm:text-sm">Failure Threshold</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={formData.failureThreshold}
                        onChange={(e) => setFormData({ ...formData, failureThreshold: parseInt(e.target.value) })}
                        className="input font-mono text-sm"
                      />
                    </div>
                    <div>
                      <label className="form-label font-mono text-xs sm:text-sm">Recovery Threshold</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={formData.recoveryThreshold}
                        onChange={(e) => setFormData({ ...formData, recoveryThreshold: parseInt(e.target.value) })}
                        className="input font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="mr-2 rounded bg-term-bg border-term-border"
                    id="isActive"
                  />
                  <label htmlFor="isActive" className="text-sm text-term-gray">Active</label>
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t border-term-border">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Add Target
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Target Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/80 overflow-y-auto h-full w-full z-50 p-2 sm:p-4">
          <div className="relative top-0 sm:top-10 mx-auto p-0 border border-term-border w-full max-w-[600px] bg-term-bg-light max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="terminal-header">
              <Terminal className="h-4 w-4 text-term-cyan" />
              <span className="terminal-title">Edit Target</span>
              <button 
                onClick={() => setShowEditModal(false)}
                className="ml-auto text-term-gray hover:text-term-white"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 sm:p-6">
              <form onSubmit={handleEditTarget} className="space-y-4">
                <div>
                  <label className="form-label font-mono">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input font-mono"
                  />
                </div>

                <div>
                  <label className="form-label font-mono">Monitor Type</label>
                  <select
                    value={formData.monitorType}
                    onChange={(e) => handleMonitorTypeChange(e.target.value)}
                    className="input font-mono"
                  >
                    <option value="http">HTTP - Website/API</option>
                    <option value="https">HTTPS - Secure Website</option>
                    <option value="tcp">TCP - Port Monitor</option>
                    <option value="udp">UDP - Port Monitor</option>
                    <option value="keyword">Keyword - Content Check</option>
                  </select>
                </div>

                <div>
                  <label className="form-label font-mono">
                    {formData.monitorType === 'tcp' || formData.monitorType === 'udp' 
                      ? 'Hostname/IP' 
                      : 'URL'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="input font-mono"
                  />
                </div>

                {(formData.monitorType === 'tcp' || formData.monitorType === 'udp') && (
                  <div>
                    <label className="form-label font-mono">Port</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="65535"
                      value={formData.port}
                      onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                      className="input font-mono"
                    />
                  </div>
                )}

                {formData.monitorType === 'keyword' && (
                  <div className="space-y-3 border border-term-border p-3 bg-term-bg">
                    <h4 className="text-sm font-medium text-term-white">Keyword Settings</h4>
                    <div>
                      <label className="form-label font-mono">Keyword/Phrase</label>
                      <input
                        type="text"
                        required
                        value={formData.keyword.settings.text}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          keyword: { 
                            settings: { 
                              ...formData.keyword.settings, 
                              text: e.target.value 
                            } 
                          } 
                        })}
                        className="input font-mono"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.keyword.settings.shouldExist}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          keyword: { 
                            settings: { 
                              ...formData.keyword.settings, 
                              shouldExist: e.target.checked 
                            } 
                          } 
                        })}
                        className="rounded bg-term-bg border-term-border"
                        id="shouldExistEdit"
                      />
                      <label htmlFor="shouldExistEdit" className="text-sm text-term-gray">
                        Keyword should exist
                      </label>
                    </div>
                  </div>
                )}

                <div>
                  <label className="form-label font-mono">Check Interval</label>
                  <select
                    value={formData.interval}
                    onChange={(e) => setFormData({ ...formData, interval: parseInt(e.target.value) })}
                    className="input font-mono"
                  >
                    <option value={30000}>30 seconds</option>
                    <option value={60000}>1 minute</option>
                    <option value={300000}>5 minutes</option>
                    <option value={600000}>10 minutes</option>
                    <option value={1800000}>30 minutes</option>
                    <option value={3600000}>1 hour</option>
                  </select>
                </div>

                <div className="border-t border-term-border pt-4 space-y-3">
                  <h4 className="text-sm font-medium text-term-white">Thresholds</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="form-label font-mono text-xs sm:text-sm">Failure Threshold</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={formData.failureThreshold}
                        onChange={(e) => setFormData({ ...formData, failureThreshold: parseInt(e.target.value) })}
                        className="input font-mono text-sm"
                      />
                    </div>
                    <div>
                      <label className="form-label font-mono text-xs sm:text-sm">Recovery Threshold</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={formData.recoveryThreshold}
                        onChange={(e) => setFormData({ ...formData, recoveryThreshold: parseInt(e.target.value) })}
                        className="input font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="mr-2 rounded bg-term-bg border-term-border"
                    id="isActiveEdit"
                  />
                  <label htmlFor="isActiveEdit" className="text-sm text-term-gray">Active</label>
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t border-term-border">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Update Target
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Targets;
