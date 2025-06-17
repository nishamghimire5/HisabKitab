import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover:bg-white/50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to HisabKitab
          </Button>
        </div>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-display font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Privacy Policy
            </CardTitle>
            <p className="text-gray-600 mt-2">Last updated: June 17, 2025</p>
          </CardHeader>
          
          <CardContent className="space-y-8 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Introduction</h2>
              <p>
                Welcome to HisabKitab ("we," "our," or "us"). We are committed to protecting your privacy 
                and ensuring the security of your personal information. This Privacy Policy explains how 
                we collect, use, and protect your information when you use our expense tracking application.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Information We Collect</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-700">Account Information</h3>
                  <p>When you create an account, we collect your email address, name, and authentication credentials.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Expense Data</h3>
                  <p>We store the trips, expenses, and financial data you create to provide our expense tracking services.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Google Sign-In</h3>
                  <p>When you sign in with Google, we receive your name, email address, and profile picture from Google.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>To provide and maintain our expense tracking services</li>
                <li>To authenticate your account and ensure security</li>
                <li>To enable collaboration features with other users</li>
                <li>To send important service-related notifications</li>
                <li>To improve our application and user experience</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Data Security</h2>
              <p>
                We use industry-standard security measures to protect your data, including encryption 
                in transit and at rest. Your data is stored securely using Supabase infrastructure 
                with enterprise-grade security controls.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Data Sharing</h2>
              <p>
                We do not sell, trade, or rent your personal information to third parties. Your expense 
                data is only shared with trip members you explicitly add to your trips. We may share 
                aggregated, anonymized data for analytical purposes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Rights</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Delete your account and data</li>
                <li>Export your data</li>
                <li>Withdraw consent for data processing</li>
              </ul>
            </section>

            <section>              <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy or our data practices, 
                please contact us at: nishamghimire5@gmail.com
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Privacy;
