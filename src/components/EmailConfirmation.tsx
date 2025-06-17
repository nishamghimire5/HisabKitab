
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, Calculator } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const EmailConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      const token = searchParams.get('token');
      const type = searchParams.get('type');

      if (token && type === 'signup') {
        try {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'signup'
          });

          if (error) {
            console.error('Email confirmation error:', error);
            setStatus('error');
            setMessage('Email verification failed. The link may have expired or is invalid.');
            toast.error('Email verification failed');
          } else {
            setStatus('success');
            setMessage('Your email has been verified! Your account is now active.');
            toast.success('Email verified successfully!');
            
            // Redirect to home after a short delay
            setTimeout(() => {
              navigate('/');
            }, 3000);
          }
        } catch (error) {
          console.error('Unexpected error during email confirmation:', error);
          setStatus('error');
          setMessage('An unexpected error occurred during email verification.');
          toast.error('Verification failed');
        }
      } else {
        // No token or wrong type, redirect to auth
        navigate('/auth');
      }
    };

    handleEmailConfirmation();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
            {status === 'loading' && <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />}
            {status === 'success' && <CheckCircle className="w-8 h-8 text-green-500" />}
            {status === 'error' && <XCircle className="w-8 h-8 text-red-500" />}
          </div>
          <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            SettleUp Smart
          </CardTitle>
          <CardDescription>
            Email Verification
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === 'loading' && (
            <div>
              <p className="text-gray-600 mb-2">Verifying your email address...</p>
              <p className="text-sm text-gray-500">This will only take a moment.</p>
            </div>
          )}
          
          {status === 'success' && (
            <div>
              <p className="text-green-600 font-medium mb-2">{message}</p>
              <div className="p-4 bg-green-50 rounded-lg mb-4">
                <p className="text-sm text-green-800">Thank you for verifying your email address. You now have full access to SettleUp Smart and can start creating and joining trips.</p>
              </div>
              <p className="text-sm text-gray-500 mb-1">Redirecting you to the app in a few seconds...</p>
              <Button 
                onClick={() => navigate('/')}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 mt-2"
              >
                Go to Dashboard Now
              </Button>
            </div>
          )}
          
          {status === 'error' && (
            <div>
              <p className="text-red-600 font-medium mb-2">{message}</p>
              <div className="p-4 bg-red-50 rounded-lg mb-4">
                <p className="text-sm text-red-800">If you're still having trouble verifying your email, please try:</p>
                <ul className="text-sm text-red-800 list-disc list-inside mt-2">
                  <li>Checking if you used the most recent verification link</li>
                  <li>Requesting a new verification email</li>
                  <li>Making sure you're using the same device/browser where you signed up</li>
                </ul>
              </div>
              <Button 
                onClick={() => navigate('/auth')}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                Return to Sign In
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>  );
};

export default EmailConfirmation;
