import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Terminal, User, Lock, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-term-bg flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* CRT Effect */}
      <div className="scanline" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        {/* Terminal Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 border border-term-green flex items-center justify-center shadow-glow-green">
              <Terminal className="h-6 w-6 text-term-green" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-term-white tracking-wider">
            <span className="text-term-green">UPTIME</span>_MONITOR
          </h1>
          <p className="text-sm text-term-gray mt-2">System Authentication Required</p>
        </div>

        {/* Terminal Window */}
        <div className="terminal-window">
          <div className="terminal-header">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-term-red"></div>
              <div className="w-3 h-3 rounded-full bg-term-yellow"></div>
              <div className="w-3 h-3 rounded-full bg-term-green"></div>
            </div>
            <span className="terminal-title ml-4">login.sh</span>
          </div>
          
          <div className="p-4 sm:p-6">
            {/* Boot Sequence */}
            <div className="mb-6 text-xs text-term-gray font-mono space-y-1">
              <p>$ init uptime_monitor_v2.0.0</p>
              <p>$ loading authentication_module...</p>
              <p className="text-term-green">[OK] System ready</p>
              <p className="text-term-cyan">root@uptime:~$ <span className="animate-blink">_</span></p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="border border-term-red bg-term-red/10 text-term-red px-4 py-3 text-sm font-mono">
                  <span className="text-term-red">[ERROR]</span> {error}
                </div>
              )}

              <div>
                <label htmlFor="username" className="form-label font-mono">
                  <span className="text-term-cyan">user</span>@<span className="text-term-green">uptime</span>:~$ username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-term-gray" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="input pl-10 font-mono"
                    placeholder="enter_username"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="form-label font-mono">
                  <span className="text-term-cyan">user</span>@<span className="text-term-green">uptime</span>:~$ password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-term-gray" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="input pl-10 pr-10 font-mono"
                    placeholder="enter_password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-term-gray hover:text-term-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full font-mono"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <span className="terminal-spinner mr-2"></span>
                      authenticating...
                    </span>
                  ) : (
                    <span>$ execute_login --force</span>
                  )}
                </button>
              </div>

              <div className="text-center text-sm pt-2 font-mono">
                <span className="text-term-gray">No account? </span>
                <Link to="/register" className="text-term-cyan hover:text-term-green hover:underline">
                  $ register --new
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-term-gray font-mono">
          <p>Secure Connection | SSH-2.0-OpenSSH_8.9</p>
          <p className="mt-1">© 2024 Uptime Monitor Systems</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
