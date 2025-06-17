import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const Terms = () => {
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
              Terms of Service
            </CardTitle>
            <p className="text-gray-600 mt-2">Last updated: June 17, 2025</p>
          </CardHeader>
          
          <CardContent className="space-y-8 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Agreement to Terms</h2>
              <p>
                By accessing and using HisabKitab ("the Service"), you agree to be bound by these 
                Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Description of Service</h2>
              <p>
                HisabKitab is an expense tracking and bill splitting application that helps users 
                manage shared expenses with friends, family, and colleagues. The Service allows you to:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li>Create and manage trips with multiple participants</li>
                <li>Track expenses and split bills automatically</li>
                <li>Calculate settlements and balances</li>
                <li>Collaborate with other users on expense management</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">User Accounts</h2>
              <div className="space-y-4">
                <p>
                  To use HisabKitab, you must create an account. You are responsible for maintaining 
                  the confidentiality of your account credentials and for all activities that occur under your account.
                </p>
                <p>
                  You agree to provide accurate and complete information when creating your account 
                  and to update this information as necessary.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Acceptable Use</h2>
              <p>You agree not to use the Service to:</p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on the rights of others</li>
                <li>Upload malicious code or attempt to harm the Service</li>
                <li>Use the Service for any commercial purpose without permission</li>
                <li>Share false or misleading expense information</li>
                <li>Harass, abuse, or harm other users</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Data and Privacy</h2>
              <p>
                Your privacy is important to us. Please review our Privacy Policy to understand 
                how we collect, use, and protect your information. By using the Service, you 
                consent to our data practices as described in our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Financial Calculations</h2>
              <p>
                While HisabKitab strives to provide accurate expense calculations and settlements, 
                you are responsible for verifying all financial information and calculations. 
                The Service is provided as a convenience tool and should not be considered as 
                professional financial advice.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Service Availability</h2>
              <p>
                We strive to maintain high availability of our Service, but we do not guarantee 
                uninterrupted access. The Service may be temporarily unavailable for maintenance, 
                updates, or due to factors beyond our control.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Limitation of Liability</h2>
              <p>
                HisabKitab is provided "as is" without warranties of any kind. We shall not be 
                liable for any indirect, incidental, special, or consequential damages arising 
                from your use of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. We will notify users of 
                significant changes via email or through the Service. Continued use of the Service 
                after changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section>              <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact Information</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us at: 
                nishamghimire5@gmail.com
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Terms;
