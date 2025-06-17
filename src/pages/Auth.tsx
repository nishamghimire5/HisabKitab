import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, BookOpen, Info } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState('');
  const { signIn, signUp, signInWithGoogle, resendConfirmation } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNeedsConfirmation(false);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Email not confirmed')) {
            setNeedsConfirmation(true);
            setConfirmationEmail(email);
            toast.error('Please check your email and click the confirmation link to verify your account.');
          } else if (error.message.includes('Invalid login credentials')) {
            toast.error('Invalid email or password. Please check your credentials and try again.');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('Welcome back!');
          navigate('/');
        }
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          if (error.message.includes('User already registered')) {
            toast.error('An account with this email already exists. Please sign in instead.');
          } else {
            toast.error(error.message);
          }
        } else {
          setNeedsConfirmation(true);
          setConfirmationEmail(email);
          toast.success('Registration successful! Please check your email to verify your account.');
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast.error(error.message);
      }
    } catch (error) {
      toast.error('Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    setLoading(true);
    try {
      const { error } = await resendConfirmation(confirmationEmail);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Confirmation email sent! Please check your inbox.');
      }
    } catch (error) {
      toast.error('Failed to resend confirmation email');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className={`${isMobile ? 'min-h-screen' : 'h-screen'} bg-[#050530] flex flex-col relative ${isMobile ? '' : 'overflow-hidden'}`}>
      {/* Futuristic Background Elements */}
      <div className="absolute inset-0 z-0">
        {/* Gradient orbs */}
        <div className="absolute top-10 left-10 w-80 h-80 rounded-full bg-blue-500 filter blur-[120px] opacity-20"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-purple-500 filter blur-[120px] opacity-15"></div>
        {/* Glowing grid */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGZpbGw9IiMwMTAxMjAiIGQ9Ik0wIDBoNjB2NjBIMHoiLz48L2c+PHBhdGggc3Ryb2tlPSJyZ2JhKDc1LCAxMzUsIDI1NSwgMC4xKSIgZD0iTTMwIDBsMCA2ME02MCAzMGwtNjAgMCIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+')] opacity-60"></div>
      </div>
      
      {/* Navigation Bar */}
      <nav className="relative z-10 w-full p-4 bg-[#04043a]/50 backdrop-blur-xl border-b border-blue-500/20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.jpg" alt="HisabKitab" className="w-11 h-11" />
            <span className="text-xl font-display font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
              HisabKitab
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/docs">
              <Button variant="ghost" size="sm" className="text-blue-300 hover:text-cyan-400 hover:bg-blue-900/30 transition-all">
                <BookOpen className="w-4 h-4 mr-2" />
                Guide
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="ghost" size="sm" className="text-blue-300 hover:text-cyan-400 hover:bg-blue-900/30 transition-all">
                <Info className="w-4 h-4 mr-2" />
                About
              </Button>
            </Link>
          </div>
        </div>
      </nav>      
        {/* Main Content with Logo Centered and Floating Form */}
      <div className={`flex-1 relative ${isMobile ? 'overflow-y-auto' : 'flex items-center justify-center overflow-y-auto'}`}>
        {/* Logo Center Section - Hidden on mobile */}
        {!isMobile && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 
                      w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] md:w-[340px] md:h-[340px] lg:w-[380px] lg:h-[380px]
                      rounded-full bg-gradient-to-br from-[#0a0a4a]/80 to-[#0a0a4a]/40 backdrop-blur-lg
                      border border-blue-500/20 shadow-[0_0_40px_rgba(0,100,255,0.25)] 
                      flex flex-col items-center justify-center">
            {/* Logo */}
            <div className="w-[220px] h-[220px] sm:w-[260px] sm:h-[260px] md:w-[280px] md:h-[280px] lg:w-[320px] lg:h-[320px] 
                          relative flex items-center justify-center">
              <img 
                src="/hisabkitab_new_final_logo.png" 
                alt="HisabKitab" 
                className="w-full h-full object-contain scale-110"
              />
              
              {/* Animated rings */}
              <div className="absolute inset-0 rounded-full border border-blue-400/20 animate-ping" 
                  style={{animationDuration: '3s'}}></div>
              <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping" 
                  style={{animationDuration: '4s'}}></div>
              <div className="absolute inset-0 rounded-full border border-purple-500/10 animate-ping" 
                  style={{animationDuration: '7s'}}></div>
            </div>
            {/* Text below logo */}
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-center">
              <div className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent text-lg font-bold tracking-wide">
                HisabKitab
              </div>
              <div className="text-blue-200/80 text-sm mt-1 font-medium">
                {isLogin ? 'Welcome back to smart expense tracking' : 'Join thousands managing expenses smartly'}
              </div>
            </div>
          </div>
        )}        {/* Form Container */}
        <div className="w-full max-w-6xl mx-auto px-4">
          {/* Mobile branding at the top */}
          {isMobile && (
            <div className="w-full flex flex-col items-center justify-center py-6">
              <img 
                src="/hisabkitab_new_final_logo.png" 
                alt="HisabKitab" 
                className="w-20 h-20 object-contain"
              />
              <div className="text-center mt-3">
                <div className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent text-lg font-bold tracking-wide">
                  HisabKitab
                </div>
                <div className="text-blue-200/80 text-sm mt-1 font-medium">
                  {isLogin ? 'Welcome back!' : 'Join us today!'}
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className={`w-full ${isMobile ? 'max-w-sm mx-auto' : 'max-w-xl md:max-w-none flex flex-col md:flex-row items-center justify-around'}`}>
            {/* Left Side - Features - Hidden on mobile */}
            {!isMobile && (
              <div className="w-full md:w-[60%] md:max-w-[520px] space-y-6 mt-[320px] md:mt-0 mb-6 md:mb-0 z-10 md:mr-[220px] lg:mr-[260px] md:-ml-12 lg:-ml-20">
                <div className="space-y-4 relative">
                  {/* Glow effect behind the entire features section */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 
                                rounded-2xl blur-xl scale-110 opacity-60"></div>
                  
                  <div className="relative bg-gradient-to-br from-blue-900/40 to-purple-900/30 backdrop-blur-md 
                                rounded-2xl p-6 border border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 
                                 bg-clip-text text-transparent mb-6 text-center">
                      Why Choose HisabKitab?
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-5 p-6 rounded-xl bg-gradient-to-br from-blue-800/30 to-blue-900/20 
                                    backdrop-blur-sm border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300
                                    hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] group min-h-[85px] w-full">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 mt-2 flex-shrink-0
                                      group-hover:scale-125 transition-transform duration-300"></div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-blue-200 font-semibold text-sm leading-tight mb-2">Split Bills Instantly</h4>
                          <p className="text-blue-300/70 text-xs leading-relaxed">Smart calculations for fair expense division across all group members</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-5 p-6 rounded-xl bg-gradient-to-br from-purple-800/30 to-purple-900/20 
                                    backdrop-blur-sm border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300
                                    hover:shadow-[0_0_20px_rgba(147,51,234,0.2)] group min-h-[85px] w-full">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 mt-2 flex-shrink-0
                                      group-hover:scale-125 transition-transform duration-300"></div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-blue-200 font-semibold text-sm leading-tight mb-2">Track in NPR</h4>
                          <p className="text-blue-300/70 text-xs leading-relaxed">Designed specifically for Nepali currency and cultural needs</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-5 p-6 rounded-xl bg-gradient-to-br from-cyan-800/30 to-cyan-900/20 
                                    backdrop-blur-sm border border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-300
                                    hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] group min-h-[85px] w-full">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-400 to-teal-500 mt-2 flex-shrink-0
                                      group-hover:scale-125 transition-transform duration-300"></div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-blue-200 font-semibold text-sm leading-tight mb-2">Smart Settlements</h4>
                          <p className="text-blue-300/70 text-xs leading-relaxed">Optimal payment suggestions to settle debts efficiently</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-5 p-6 rounded-xl bg-gradient-to-br from-indigo-800/30 to-indigo-900/20 
                                    backdrop-blur-sm border border-indigo-500/30 hover:border-indigo-400/50 transition-all duration-300
                                    hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] group min-h-[85px] w-full">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 mt-2 flex-shrink-0
                                      group-hover:scale-125 transition-transform duration-300"></div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-blue-200 font-semibold text-sm leading-tight mb-2">Group Management</h4>
                          <p className="text-blue-300/70 text-xs leading-relaxed">Manage multiple trips and groups with ease and precision</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Additional glow elements */}
                    <div className="absolute -top-2 -left-2 w-4 h-4 bg-cyan-400/20 rounded-full blur-sm animate-pulse"></div>
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-purple-400/20 rounded-full blur-md animate-pulse" 
                         style={{animationDelay: '1s'}}></div>
                    <div className="absolute top-1/2 -left-3 w-2 h-2 bg-blue-400/30 rounded-full blur-sm animate-ping"
                         style={{animationDuration: '3s'}}></div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Right Side - Login Form */}
            <div className={`w-full ${isMobile ? 'space-y-4' : 'md:w-[40%] md:max-w-[320px] md:ml-[250px] lg:ml-[300px] space-y-6'} z-10`}>
              {needsConfirmation && (
                <div className="bg-blue-900/30 backdrop-blur-sm border border-blue-400/30 p-3 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Mail className="h-5 w-5 text-blue-300 mt-0.5 flex-shrink-0" />
                    <div className="text-blue-200 text-sm">
                      Please check <strong>{confirmationEmail}</strong> for the verification link.
                      <Button 
                        variant="link" 
                        className="p-0 h-auto font-normal text-cyan-400 block mt-1"
                        onClick={handleResendConfirmation}
                        disabled={loading}
                      >
                        Resend email
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {!isLogin && (
                <div>
                  <h3 className="text-blue-300 mb-2">Full Name</h3>
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={!isLogin}
                    className="bg-blue-900/30 border-blue-500/30 text-blue-100 placeholder:text-blue-400/50 
                            focus:border-cyan-400/50 focus:ring-cyan-400/20 h-12 text-base"
                  />
                </div>
              )}
              
              <div>
                <h3 className="text-blue-300 mb-2">Email</h3>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-blue-900/30 border-blue-500/30 text-blue-100 placeholder:text-blue-400/50 
                           focus:border-cyan-400/50 focus:ring-cyan-400/20 h-12 text-base"
                />
              </div>
              <div>
                <h3 className="text-blue-300 mb-2">Password</h3>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="bg-blue-900/30 border-blue-500/30 text-blue-100 placeholder:text-blue-400/50 
                             focus:border-cyan-400/50 focus:ring-cyan-400/20 pr-10 h-12 text-base"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-blue-900/20 text-blue-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
              
              {/* Sign In Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 
                         text-white font-medium py-6 h-12 text-base
                         shadow-[0_0_15px_rgba(0,150,255,0.5)] hover:shadow-[0_0_25px_rgba(0,150,255,0.6)] 
                         transition-all duration-300"
                disabled={loading}
              >
                {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}
              </Button>
              
              {/* Or continue with */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-blue-500/20" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-[#050530] px-2 text-blue-300/70">Or continue with</span>
                </div>
              </div>
              
              {/* Google Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full border-blue-500/30 bg-blue-900/20 hover:bg-blue-800/30 text-blue-100 
                         backdrop-blur-sm transition-all duration-200 hover:border-blue-400/40 h-12 text-base"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {loading ? 'Please wait...' : `Sign ${isLogin ? 'in' : 'up'} with Google`}
              </Button>
              
              {/* Switch between login and signup */}
              <div className="text-center">
                <Button
                  variant="link"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setNeedsConfirmation(false);
                    setEmail('');
                    setPassword('');
                    setFullName('');                  }}
                  className="text-blue-300 hover:text-cyan-400 transition-colors text-sm"
                >
                  {isLogin 
                    ? "Don't have an account? Sign up" 
                    : "Already have an account? Sign in"
                  }
                </Button>
              </div>
              
              {isLogin && (
                <div className="text-center">
                  <Button
                    variant="link"
                    onClick={() => {
                      if (email) {
                        setConfirmationEmail(email);
                        setNeedsConfirmation(true);
                      } else {
                        toast.error('Please enter your email address first');
                      }
                    }}
                    className="text-xs text-blue-300/70 hover:text-cyan-400"
                  >
                    Need to verify your email?
                  </Button>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="relative z-10 w-full text-center py-3 text-xs text-blue-300/70 space-y-1">
        <div className="flex justify-center items-center gap-3 text-xs">
          <Link to="/privacy" className="hover:text-cyan-400 transition-colors">
            Privacy Policy
          </Link>
          <span className="text-blue-500/50">•</span>
          <Link to="/terms" className="hover:text-cyan-400 transition-colors">
            Terms of Service
          </Link>
        </div>
        <p className="text-xs">© 2025 HisabKitab. <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Made with ❤️ for Nepal.</span></p>
      </footer>
    </div>
  );
};

export default Auth;
