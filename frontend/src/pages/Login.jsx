import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare } from 'lucide-react';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await loginUser({ email, password });
      login(data);
      toast.success('Login successful!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] px-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-blue-500/10 blur-[120px] rounded-full" />

      <div className="max-w-md w-full space-y-8 p-12 glass border border-white/5 rounded-[2.5rem] shadow-2xl relative z-10 animate-fade-in">
        <div className="text-center">
          <div className="inline-flex p-3 bg-white/5 rounded-2xl border border-white/10 mb-6">
            <CheckSquare className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-4xl font-bold tracking-tight text-gradient">Welcome Back</h2>
          <p className="mt-3 text-muted-foreground">Continue your productive journey</p>
        </div>
        
        <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-1">Email Address</label>
              <input
                type="email"
                required
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-1">Secret Password</label>
              <input
                type="password"
                required
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : 'Sign In Now'}
            </button>
          </div>
        </form>
        
        <div className="text-center pt-4">
          <Link to="/register" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            New here? <span className="text-primary hover:underline underline-offset-4">Create an account</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
