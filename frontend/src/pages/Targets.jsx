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
  Database,
  Server,
  Bell
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
      // Clean up data based on monitor type
      const dataToSend = { ...formData };
      
      // Convert port to number if present
      if (dataToSend.port) {
        dataToSend.port = parseInt(dataToSend.port);
      }
      
      // Remove port if not TCP/UDP or if empty
      if ((formData.monitorType !== 'tcp' && formData.monitorType !== 'udp') || !dataToSend.port) {
        delete dataToSend.port;
      }
      
      // Remove keyword if not keyword type or if empty
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
      // Clean up data based on monitor type
      const dataToSend = { ...formData };
      
      // Convert port to number if present
      if (dataToSend.port) {
        dataToSend.port = parseInt(dataToSend.port);
      }
      
      // Remove port if not TCP/UDP or if empty
      if ((formData.monitorType !== 'tcp' && formData.monitorType !== 'udp') || !dataToSend.port) {
        delete dataToSend.port;
      }
      
      // Remove keyword if not keyword type or if empty
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

  const handleManualPing = async (id) => {
    try {
      await targetsAPI.ping(id);
      // Real-time update will be received via WebSocket
    } catch (error) {
      console.error('Error pinging target:', error);
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
        alert(`✅ Test alert sent!\n\nChannels: ${response.data.result.channels?.join(', ') || 'none'}\nFailed: ${response.data.result.failed?.join(', ') || 'none'}\n\nCheck your configured alert channels (email, Slack, Discord, etc.)`);
      } else {
        alert('⚠️ Alert was rate-limited or no channels configured.');
      }
    } catch (error) {
      console.error('Error sending test alert:', error);
      alert('❌ Error sending test alert: ' + (error.response?.data?.message || error.message));
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
    // When monitor type changes, reset type-specific fields
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
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'DOWN':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getMonitorTypeIcon = (type) => {
    switch (type) {
      case 'http':
      case 'https':
        return <Globe className="h-5 w-5 text-blue-500" />;
      case 'tcp':
        return <Network className="h-5 w-5 text-purple-500" />;
      case 'udp':
        return <Server className="h-5 w-5 text-indigo-500" />;
      case 'keyword':
        return <Key className="h-5 w-5 text-orange-500" />;
      default:
        return <Globe className="h-5 w-5 text-gray-400" />;
    }
  };

  const getMonitorTypeBadge = (type) => {
    const badges = {
      http: 'bg-blue-100 text-blue-800',
      https: 'bg-blue-100 text-blue-800',
      tcp: 'bg-purple-100 text-purple-800',
      udp: 'bg-indigo-100 text-indigo-800',
      keyword: 'bg-orange-100 text-orange-800'
    };
    return `inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${badges[type] || 'bg-gray-100 text-gray-800'}`;
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

  const formatInterval = (interval) => {
    return `${interval / 1000}s`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Targets</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your monitoring targets</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Target</span>
        </button>
      </div>

      {/* Targets List */}
      <div className="card">
        {targets.length > 0 ? (
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Target
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uptime
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Response Time
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Interval
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {targets.map((target) => (
                  <tr key={target._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getMonitorTypeIcon(target.monitorType)}
                        <div className="ml-3">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium text-gray-900">{target.name}</div>
                            {/* SSL Certificate Badge */}
                            {target.certificateInfo?.valid !== null && target.certificateInfo?.daysUntilExpiry !== null && (
                              <span 
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  target.certificateInfo.daysUntilExpiry <= 7 
                                    ? 'bg-red-100 text-red-800' 
                                    : target.certificateInfo.daysUntilExpiry <= 14
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : target.certificateInfo.daysUntilExpiry <= 30
                                    ? 'bg-orange-100 text-orange-800'
                                    : 'bg-green-100 text-green-800'
                                }`}
                                title={`SSL expires in ${target.certificateInfo.daysUntilExpiry} days\nIssuer: ${target.certificateInfo.issuer}\nExpires: ${new Date(target.certificateInfo.validTo).toLocaleDateString()}`}
                              >
                                🔒 {target.certificateInfo.daysUntilExpiry}d
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {target.monitorType === 'tcp' || target.monitorType === 'udp' 
                              ? `${target.url}${target.port ? ':' + target.port : ''}`
                              : target.url}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={getMonitorTypeBadge(target.monitorType)}>
                        {(target.monitorType || 'http').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(target.lastStatus)}
                        <span className={getStatusBadge(target.lastStatus)}>
                          {target.lastStatus}
                        </span>
                        {target.isPaused && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            Paused
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{target.uptimePercentage.toFixed(2)}%</div>
                      <div className="text-sm text-gray-500">
                        {target.successfulChecks}/{target.totalChecks} checks
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {target.responseTime ? `${target.responseTime}ms` : 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {target.lastChecked ? new Date(target.lastChecked).toLocaleString() : 'Never'}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatInterval(target.interval)}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        {/* Test Alert Button */}
                        {(target.alertSettings?.email?.enabled || 
                          target.alertSettings?.slack?.enabled || 
                          target.alertSettings?.discord?.enabled ||
                          target.alertSettings?.teams?.enabled ||
                          target.alertSettings?.telegram?.enabled ||
                          target.alertSettings?.webhook?.enabled) && (
                          <button
                            onClick={() => handleTestAlert(target, 'DOWN')}
                            className="text-purple-600 hover:text-purple-900"
                            title="Test Alert (send DOWN alert to all configured channels)"
                          >
                            <Bell className="h-4 w-4" />
                          </button>
                        )}
                        {target.isPaused ? (
                          <button
                            onClick={() => handleResumeTarget(target._id)}
                            className="text-green-600 hover:text-green-900"
                            title="Resume monitoring"
                          >
                            <Play className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePauseTarget(target._id)}
                            className="text-amber-600 hover:text-amber-900"
                            title="Pause monitoring"
                          >
                            <Pause className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => openEditModal(target)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTarget(target._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Globe className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No targets</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding your first monitoring target.</p>
          </div>
        )}
      </div>

      {/* Add Target Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-[500px] shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Target</h3>
            <form onSubmit={handleAddTarget} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input mt-1"
                  placeholder="My Website"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Monitor Type</label>
                <select
                  value={formData.monitorType}
                  onChange={(e) => handleMonitorTypeChange(e.target.value)}
                  className="input mt-1"
                >
                  <option value="http">HTTP - Website/API (200-299 = UP)</option>
                  <option value="https">HTTPS - Secure Website/API</option>
                  <option value="tcp">TCP - Port Monitoring (Database, SSH, etc.)</option>
                  <option value="udp">UDP - Port Monitoring (DNS, NTP, etc.)</option>
                  <option value="keyword">Keyword - Content Monitoring</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {formData.monitorType === 'tcp' || formData.monitorType === 'udp' 
                    ? 'Hostname/IP' 
                    : 'URL'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="input mt-1"
                  placeholder={
                    formData.monitorType === 'tcp' || formData.monitorType === 'udp'
                      ? 'example.com or 192.168.1.1'
                      : 'https://example.com'
                  }
                />
              </div>

              {(formData.monitorType === 'tcp' || formData.monitorType === 'udp') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Port</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="65535"
                    value={formData.port}
                    onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                    className="input mt-1"
                    placeholder={formData.monitorType === 'tcp' ? '5432 (PostgreSQL), 3306 (MySQL), 22 (SSH)' : '53 (DNS), 123 (NTP)'}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Common {formData.monitorType.toUpperCase()} ports: 
                    {formData.monitorType === 'tcp' 
                      ? ' PostgreSQL (5432), MySQL (3306), MongoDB (27017), Redis (6379), SSH (22)'
                      : ' DNS (53), DHCP (67), NTP (123), SNMP (161)'}
                  </p>
                </div>
              )}

              {formData.monitorType === 'keyword' && (
                <div className="space-y-3 border border-gray-200 rounded p-3 bg-gray-50">
                  <h4 className="text-sm font-medium text-gray-700">Keyword Settings</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Keyword/Phrase</label>
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
                      className="input mt-1"
                      placeholder="Welcome, Login, Error 500"
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
                      className="rounded"
                      id="shouldExist"
                    />
                    <label htmlFor="shouldExist" className="text-sm text-gray-700">
                      Keyword should exist (uncheck if keyword should NOT exist)
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">
                    {formData.keyword.settings.shouldExist 
                      ? '✅ Site is UP if keyword is found'
                      : '⚠️ Site is UP if keyword is NOT found (useful for detecting errors)'}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Check Interval</label>
                <select
                  value={formData.interval}
                  onChange={(e) => setFormData({ ...formData, interval: parseInt(e.target.value) })}
                  className="input mt-1"
                >
                  <option value={30000}>30 seconds</option>
                  <option value={60000}>1 minute</option>
                  <option value={300000}>5 minutes</option>
                  <option value={600000}>10 minutes</option>
                  <option value={1800000}>30 minutes</option>
                  <option value={3600000}>1 hour</option>
                </select>
              </div>

              {/* False Positive Prevention */}
              <div className="border-t pt-4 space-y-3">
                <h4 className="text-sm font-semibold text-gray-900">False Positive Prevention</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Failure Threshold</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.failureThreshold}
                      onChange={(e) => setFormData({ ...formData, failureThreshold: parseInt(e.target.value) })}
                      className="input mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">Consecutive failures before alerting</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Recovery Threshold</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.recoveryThreshold}
                      onChange={(e) => setFormData({ ...formData, recoveryThreshold: parseInt(e.target.value) })}
                      className="input mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">Consecutive successes to confirm recovery</p>
                  </div>
                </div>
              </div>

              {/* SSL Certificate Monitoring */}
              {(formData.monitorType === 'https' || formData.url.startsWith('https://')) && (
                <div className="border-t pt-4 space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900">🔒 SSL Certificate Monitoring</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.sslCheck?.enabled !== false}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          sslCheck: { 
                            ...formData.sslCheck, 
                            enabled: e.target.checked 
                          } 
                        })}
                        className="mr-2 rounded"
                        id="sslCheckEnabled"
                      />
                      <label htmlFor="sslCheckEnabled" className="text-sm text-gray-700">
                        Monitor SSL certificate expiry
                      </label>
                    </div>
                    {formData.sslCheck?.enabled !== false && (
                      <div className="ml-6 text-xs text-gray-500">
                        <p>✅ Auto-alerts at 30, 14, and 7 days before expiration</p>
                        <p>✅ Certificate validation and issuer tracking</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Alert Settings */}
              <div className="border-t pt-4">
                <button
                  type="button"
                  onClick={() => setShowAlertSettings(!showAlertSettings)}
                  className="flex items-center justify-between w-full text-sm font-semibold text-gray-900 hover:text-blue-600"
                >
                  <span>🔔 Alert Settings</span>
                  <span className="text-gray-400">{showAlertSettings ? '▼' : '▶'}</span>
                </button>
                
                {showAlertSettings && (
                  <div className="mt-4 space-y-4">
                    {/* Email Alerts */}
                    <div className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">📧 Email</label>
                        <input
                          type="checkbox"
                          checked={formData.alertSettings.email.enabled}
                          onChange={(e) => setFormData({
                            ...formData,
                            alertSettings: {
                              ...formData.alertSettings,
                              email: { ...formData.alertSettings.email, enabled: e.target.checked }
                            }
                          })}
                          className="rounded"
                        />
                      </div>
                      {formData.alertSettings.email.enabled && (
                        <input
                          type="text"
                          placeholder="email1@example.com, email2@example.com"
                          value={formData.alertSettings.email.addresses.join(', ')}
                          onChange={(e) => setFormData({
                            ...formData,
                            alertSettings: {
                              ...formData.alertSettings,
                              email: { ...formData.alertSettings.email, addresses: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }
                            }
                          })}
                          className="input text-sm"
                        />
                      )}
                    </div>

                    {/* Slack Alerts */}
                    <div className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">💬 Slack</label>
                        <input
                          type="checkbox"
                          checked={formData.alertSettings.slack.enabled}
                          onChange={(e) => setFormData({
                            ...formData,
                            alertSettings: {
                              ...formData.alertSettings,
                              slack: { ...formData.alertSettings.slack, enabled: e.target.checked }
                            }
                          })}
                          className="rounded"
                        />
                      </div>
                      {formData.alertSettings.slack.enabled && (
                        <input
                          type="url"
                          placeholder="https://hooks.slack.com/services/..."
                          value={formData.alertSettings.slack.webhookUrl}
                          onChange={(e) => setFormData({
                            ...formData,
                            alertSettings: {
                              ...formData.alertSettings,
                              slack: { ...formData.alertSettings.slack, webhookUrl: e.target.value }
                            }
                          })}
                          className="input text-sm"
                        />
                      )}
                    </div>

                    {/* Discord Alerts */}
                    <div className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">🎮 Discord</label>
                        <input
                          type="checkbox"
                          checked={formData.alertSettings.discord.enabled}
                          onChange={(e) => setFormData({
                            ...formData,
                            alertSettings: {
                              ...formData.alertSettings,
                              discord: { ...formData.alertSettings.discord, enabled: e.target.checked }
                            }
                          })}
                          className="rounded"
                        />
                      </div>
                      {formData.alertSettings.discord.enabled && (
                        <input
                          type="url"
                          placeholder="https://discord.com/api/webhooks/..."
                          value={formData.alertSettings.discord.webhookUrl}
                          onChange={(e) => setFormData({
                            ...formData,
                            alertSettings: {
                              ...formData.alertSettings,
                              discord: { ...formData.alertSettings.discord, webhookUrl: e.target.value }
                            }
                          })}
                          className="input text-sm"
                        />
                      )}
                    </div>

                    {/* Teams Alerts */}
                    <div className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">👥 Microsoft Teams</label>
                        <input
                          type="checkbox"
                          checked={formData.alertSettings.teams.enabled}
                          onChange={(e) => setFormData({
                            ...formData,
                            alertSettings: {
                              ...formData.alertSettings,
                              teams: { ...formData.alertSettings.teams, enabled: e.target.checked }
                            }
                          })}
                          className="rounded"
                        />
                      </div>
                      {formData.alertSettings.teams.enabled && (
                        <input
                          type="url"
                          placeholder="https://outlook.office.com/webhook/..."
                          value={formData.alertSettings.teams.webhookUrl}
                          onChange={(e) => setFormData({
                            ...formData,
                            alertSettings: {
                              ...formData.alertSettings,
                              teams: { ...formData.alertSettings.teams, webhookUrl: e.target.value }
                            }
                          })}
                          className="input text-sm"
                        />
                      )}
                    </div>

                    {/* Telegram Alerts */}
                    <div className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">✈️ Telegram</label>
                        <input
                          type="checkbox"
                          checked={formData.alertSettings.telegram.enabled}
                          onChange={(e) => setFormData({
                            ...formData,
                            alertSettings: {
                              ...formData.alertSettings,
                              telegram: { ...formData.alertSettings.telegram, enabled: e.target.checked }
                            }
                          })}
                          className="rounded"
                        />
                      </div>
                      {formData.alertSettings.telegram.enabled && (
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Bot Token"
                            value={formData.alertSettings.telegram.botToken}
                            onChange={(e) => setFormData({
                              ...formData,
                              alertSettings: {
                                ...formData.alertSettings,
                                telegram: { ...formData.alertSettings.telegram, botToken: e.target.value }
                              }
                            })}
                            className="input text-sm"
                          />
                          <input
                            type="text"
                            placeholder="Chat ID"
                            value={formData.alertSettings.telegram.chatId}
                            onChange={(e) => setFormData({
                              ...formData,
                              alertSettings: {
                                ...formData.alertSettings,
                                telegram: { ...formData.alertSettings.telegram, chatId: e.target.value }
                              }
                            })}
                            className="input text-sm"
                          />
                        </div>
                      )}
                    </div>

                    {/* Custom Webhook */}
                    <div className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">🔗 Custom Webhook</label>
                        <input
                          type="checkbox"
                          checked={formData.alertSettings.webhook.enabled}
                          onChange={(e) => setFormData({
                            ...formData,
                            alertSettings: {
                              ...formData.alertSettings,
                              webhook: { ...formData.alertSettings.webhook, enabled: e.target.checked }
                            }
                          })}
                          className="rounded"
                        />
                      </div>
                      {formData.alertSettings.webhook.enabled && (
                        <input
                          type="url"
                          placeholder="https://your-api.com/webhook"
                          value={formData.alertSettings.webhook.url}
                          onChange={(e) => setFormData({
                            ...formData,
                            alertSettings: {
                              ...formData.alertSettings,
                              webhook: { ...formData.alertSettings.webhook, url: e.target.value }
                            }
                          })}
                          className="input text-sm"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="mr-2 rounded"
                  id="isActive"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active</label>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({ 
                      name: '', 
                      url: '', 
                      monitorType: 'http',
                      port: '',
                      keyword: { settings: { text: '', shouldExist: true } },
                      interval: 60000, 
                      isActive: true 
                    });
                  }}
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
      )}

      {/* Edit Target Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-[500px] shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Edit Target</h3>
            <form onSubmit={handleEditTarget} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Monitor Type</label>
                <select
                  value={formData.monitorType}
                  onChange={(e) => handleMonitorTypeChange(e.target.value)}
                  className="input mt-1"
                >
                  <option value="http">HTTP - Website/API (200-299 = UP)</option>
                  <option value="https">HTTPS - Secure Website/API</option>
                  <option value="tcp">TCP - Port Monitoring (Database, SSH, etc.)</option>
                  <option value="udp">UDP - Port Monitoring (DNS, NTP, etc.)</option>
                  <option value="keyword">Keyword - Content Monitoring</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {formData.monitorType === 'tcp' || formData.monitorType === 'udp' 
                    ? 'Hostname/IP' 
                    : 'URL'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="input mt-1"
                  placeholder={
                    formData.monitorType === 'tcp' || formData.monitorType === 'udp'
                      ? 'example.com or 192.168.1.1'
                      : 'https://example.com'
                  }
                />
              </div>

              {(formData.monitorType === 'tcp' || formData.monitorType === 'udp') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Port</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="65535"
                    value={formData.port}
                    onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                    className="input mt-1"
                    placeholder={formData.monitorType === 'tcp' ? '5432 (PostgreSQL), 3306 (MySQL), 22 (SSH)' : '53 (DNS), 123 (NTP)'}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Common {formData.monitorType.toUpperCase()} ports: 
                    {formData.monitorType === 'tcp' 
                      ? ' PostgreSQL (5432), MySQL (3306), MongoDB (27017), Redis (6379), SSH (22)'
                      : ' DNS (53), DHCP (67), NTP (123), SNMP (161)'}
                  </p>
                </div>
              )}

              {formData.monitorType === 'keyword' && (
                <div className="space-y-3 border border-gray-200 rounded p-3 bg-gray-50">
                  <h4 className="text-sm font-medium text-gray-700">Keyword Settings</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Keyword/Phrase</label>
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
                      className="input mt-1"
                      placeholder="Welcome, Login, Error 500"
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
                      className="rounded"
                      id="shouldExistEdit"
                    />
                    <label htmlFor="shouldExistEdit" className="text-sm text-gray-700">
                      Keyword should exist (uncheck if keyword should NOT exist)
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">
                    {formData.keyword.settings.shouldExist 
                      ? '✅ Site is UP if keyword is found'
                      : '⚠️ Site is UP if keyword is NOT found (useful for detecting errors)'}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Check Interval</label>
                <select
                  value={formData.interval}
                  onChange={(e) => setFormData({ ...formData, interval: parseInt(e.target.value) })}
                  className="input mt-1"
                >
                  <option value={30000}>30 seconds</option>
                  <option value={60000}>1 minute</option>
                  <option value={300000}>5 minutes</option>
                  <option value={600000}>10 minutes</option>
                  <option value={1800000}>30 minutes</option>
                  <option value={3600000}>1 hour</option>
                </select>
              </div>

              {/* False Positive Prevention - Edit Modal */}
              <div className="border-t pt-4 space-y-3">
                <h4 className="text-sm font-semibold text-gray-900">False Positive Prevention</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Failure Threshold</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.failureThreshold}
                      onChange={(e) => setFormData({ ...formData, failureThreshold: parseInt(e.target.value) })}
                      className="input mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">Consecutive failures before alerting</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Recovery Threshold</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.recoveryThreshold}
                      onChange={(e) => setFormData({ ...formData, recoveryThreshold: parseInt(e.target.value) })}
                      className="input mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">Consecutive successes to confirm recovery</p>
                  </div>
                </div>
              </div>

              {/* SSL Certificate Monitoring - Edit Modal */}
              {(formData.monitorType === 'https' || formData.url.startsWith('https://')) && (
                <div className="border-t pt-4 space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900">🔒 SSL Certificate Monitoring</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.sslCheck?.enabled !== false}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          sslCheck: { 
                            ...formData.sslCheck, 
                            enabled: e.target.checked 
                          } 
                        })}
                        className="mr-2 rounded"
                        id="sslCheckEnabledEdit"
                      />
                      <label htmlFor="sslCheckEnabledEdit" className="text-sm text-gray-700">
                        Monitor SSL certificate expiry
                      </label>
                    </div>
                    {formData.sslCheck?.enabled !== false && (
                      <div className="ml-6 text-xs text-gray-500">
                        <p>✅ Auto-alerts at 30, 14, and 7 days before expiration</p>
                        <p>✅ Certificate validation and issuer tracking</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Alert Settings - Edit Modal */}
              <div className="border-t pt-4">
                <button
                  type="button"
                  onClick={() => setShowAlertSettings(!showAlertSettings)}
                  className="flex items-center justify-between w-full text-sm font-semibold text-gray-900 hover:text-blue-600"
                >
                  <span>🔔 Alert Settings</span>
                  <span className="text-gray-400">{showAlertSettings ? '▼' : '▶'}</span>
                </button>
                
                {showAlertSettings && (
                  <div className="mt-4 space-y-4">
                    {/* Email Alerts */}
                    <div className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">📧 Email</label>
                        <input
                          type="checkbox"
                          checked={formData.alertSettings.email.enabled}
                          onChange={(e) => setFormData({
                            ...formData,
                            alertSettings: {
                              ...formData.alertSettings,
                              email: { ...formData.alertSettings.email, enabled: e.target.checked }
                            }
                          })}
                          className="rounded"
                        />
                      </div>
                      {formData.alertSettings.email.enabled && (
                        <input
                          type="text"
                          placeholder="email1@example.com, email2@example.com"
                          value={formData.alertSettings.email.addresses.join(', ')}
                          onChange={(e) => setFormData({
                            ...formData,
                            alertSettings: {
                              ...formData.alertSettings,
                              email: { ...formData.alertSettings.email, addresses: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }
                            }
                          })}
                          className="input text-sm"
                        />
                      )}
                    </div>

                    {/* Slack Alerts */}
                    <div className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">💬 Slack</label>
                        <input
                          type="checkbox"
                          checked={formData.alertSettings.slack.enabled}
                          onChange={(e) => setFormData({
                            ...formData,
                            alertSettings: {
                              ...formData.alertSettings,
                              slack: { ...formData.alertSettings.slack, enabled: e.target.checked }
                            }
                          })}
                          className="rounded"
                        />
                      </div>
                      {formData.alertSettings.slack.enabled && (
                        <input
                          type="url"
                          placeholder="https://hooks.slack.com/services/..."
                          value={formData.alertSettings.slack.webhookUrl}
                          onChange={(e) => setFormData({
                            ...formData,
                            alertSettings: {
                              ...formData.alertSettings,
                              slack: { ...formData.alertSettings.slack, webhookUrl: e.target.value }
                            }
                          })}
                          className="input text-sm"
                        />
                      )}
                    </div>

                    {/* Discord Alerts */}
                    <div className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">🎮 Discord</label>
                        <input
                          type="checkbox"
                          checked={formData.alertSettings.discord.enabled}
                          onChange={(e) => setFormData({
                            ...formData,
                            alertSettings: {
                              ...formData.alertSettings,
                              discord: { ...formData.alertSettings.discord, enabled: e.target.checked }
                            }
                          })}
                          className="rounded"
                        />
                      </div>
                      {formData.alertSettings.discord.enabled && (
                        <input
                          type="url"
                          placeholder="https://discord.com/api/webhooks/..."
                          value={formData.alertSettings.discord.webhookUrl}
                          onChange={(e) => setFormData({
                            ...formData,
                            alertSettings: {
                              ...formData.alertSettings,
                              discord: { ...formData.alertSettings.discord, webhookUrl: e.target.value }
                            }
                          })}
                          className="input text-sm"
                        />
                      )}
                    </div>

                    {/* Teams Alerts */}
                    <div className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">👥 Microsoft Teams</label>
                        <input
                          type="checkbox"
                          checked={formData.alertSettings.teams.enabled}
                          onChange={(e) => setFormData({
                            ...formData,
                            alertSettings: {
                              ...formData.alertSettings,
                              teams: { ...formData.alertSettings.teams, enabled: e.target.checked }
                            }
                          })}
                          className="rounded"
                        />
                      </div>
                      {formData.alertSettings.teams.enabled && (
                        <input
                          type="url"
                          placeholder="https://outlook.office.com/webhook/..."
                          value={formData.alertSettings.teams.webhookUrl}
                          onChange={(e) => setFormData({
                            ...formData,
                            alertSettings: {
                              ...formData.alertSettings,
                              teams: { ...formData.alertSettings.teams, webhookUrl: e.target.value }
                            }
                          })}
                          className="input text-sm"
                        />
                      )}
                    </div>

                    {/* Telegram Alerts */}
                    <div className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">✈️ Telegram</label>
                        <input
                          type="checkbox"
                          checked={formData.alertSettings.telegram.enabled}
                          onChange={(e) => setFormData({
                            ...formData,
                            alertSettings: {
                              ...formData.alertSettings,
                              telegram: { ...formData.alertSettings.telegram, enabled: e.target.checked }
                            }
                          })}
                          className="rounded"
                        />
                      </div>
                      {formData.alertSettings.telegram.enabled && (
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Bot Token"
                            value={formData.alertSettings.telegram.botToken}
                            onChange={(e) => setFormData({
                              ...formData,
                              alertSettings: {
                                ...formData.alertSettings,
                                telegram: { ...formData.alertSettings.telegram, botToken: e.target.value }
                              }
                            })}
                            className="input text-sm"
                          />
                          <input
                            type="text"
                            placeholder="Chat ID"
                            value={formData.alertSettings.telegram.chatId}
                            onChange={(e) => setFormData({
                              ...formData,
                              alertSettings: {
                                ...formData.alertSettings,
                                telegram: { ...formData.alertSettings.telegram, chatId: e.target.value }
                              }
                            })}
                            className="input text-sm"
                          />
                        </div>
                      )}
                    </div>

                    {/* Custom Webhook */}
                    <div className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">🔗 Custom Webhook</label>
                        <input
                          type="checkbox"
                          checked={formData.alertSettings.webhook.enabled}
                          onChange={(e) => setFormData({
                            ...formData,
                            alertSettings: {
                              ...formData.alertSettings,
                              webhook: { ...formData.alertSettings.webhook, enabled: e.target.checked }
                            }
                          })}
                          className="rounded"
                        />
                      </div>
                      {formData.alertSettings.webhook.enabled && (
                        <input
                          type="url"
                          placeholder="https://your-api.com/webhook"
                          value={formData.alertSettings.webhook.url}
                          onChange={(e) => setFormData({
                            ...formData,
                            alertSettings: {
                              ...formData.alertSettings,
                              webhook: { ...formData.alertSettings.webhook, url: e.target.value }
                            }
                          })}
                          className="input text-sm"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="mr-2 rounded"
                  id="isActiveEdit"
                />
                <label htmlFor="isActiveEdit" className="text-sm font-medium text-gray-700">Active</label>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingTarget(null);
                    setFormData({ 
                      name: '', 
                      url: '', 
                      monitorType: 'http',
                      port: '',
                      keyword: { settings: { text: '', shouldExist: true } },
                      interval: 60000, 
                      isActive: true 
                    });
                  }}
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
      )}
    </div>
  );
};

export default Targets;