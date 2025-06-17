import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Eye, EyeOff, Calculator, Mail, AlertCircle, BookOpen, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
            setIsLogin(true);
          } else {
            toast.error(error.message);
          }
        } else {
          setNeedsConfirmation(true);
          setConfirmationEmail(email);
          toast.success('Account created! Please check your email to verify your account.');
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast.error('Failed to sign in with Google: ' + error.message);
      }
      // If successful, the auth state change will redirect the user
    } catch (error) {
      toast.error('An unexpected error occurred');
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
      toast.error('Failed to resend confirmation email');    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      {/* Navigation Bar */}
      <nav className="w-full p-4 bg-white/80 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-6 h-6 text-blue-500" />
            <span className="text-xl font-display font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              HisabKitab
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/docs">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600">
                <BookOpen className="w-4 h-4 mr-2" />
                Guide
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600">
                <Info className="w-4 h-4 mr-2" />
                About
              </Button>
            </Link>
          </div>
        </div>
      </nav>      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 pt-8">
        <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
            <Calculator className="w-8 h-8 text-blue-500" />
          </div>
          <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            HisabKitab
          </CardTitle>
          <CardDescription>
            {isLogin ? 'Welcome back! Sign in to your account.' : 'Create your account to get started.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {needsConfirmation && (
            <Alert className="mb-6 border-blue-200 bg-blue-50">
              <Mail className="h-4 w-4" />
              <AlertDescription>
                We've sent a confirmation email to <strong>{confirmationEmail}</strong>. 
                Please check your inbox and click the link to verify your account.
                <Button 
                  variant="link" 
                  className="p-0 h-auto font-normal text-blue-600 ml-1"
                  onClick={handleResendConfirmation}
                  disabled={loading}
                >
                  Resend email
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required={!isLogin}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
              {!isLogin && (
                <p className="text-xs text-gray-500">Password must be at least 6 characters long</p>
              )}
            </div>
              <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              disabled={loading}
            >
              {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}
            </Button>
          </form>
          
          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>
            
            <Button
              type="button"
              variant="outline"
              className="w-full mt-4 border-gray-300 hover:bg-gray-50"
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
          </div>
          
          <div className="mt-6 text-center">
            <Button
              variant="link"
              onClick={() => {
                setIsLogin(!isLogin);
                setNeedsConfirmation(false);
                setEmail('');
                setPassword('');
                setFullName('');
              }}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"
              }
            </Button>
          </div>

          {isLogin && (
            <div className="mt-4 text-center">
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
                className="text-xs text-gray-500 hover:text-gray-700"
              >                Need to verify your email?
              </Button>
            </div>
          )}        </CardContent>
      </Card>
      </div>
      
      {/* Footer */}
      <footer className="w-full text-center py-6 text-sm text-gray-500 space-y-2">
        <div className="flex justify-center items-center gap-4">
          <Link to="/privacy" className="hover:text-gray-700 transition-colors">
            Privacy Policy
          </Link>
          <span>•</span>
          <Link to="/terms" className="hover:text-gray-700 transition-colors">
            Terms of Service
          </Link>
        </div>
        <p>© 2025 HisabKitab. Made with ❤️ for Nepal.</p>
      </footer>
    </div>
  );
};

export default Auth;
