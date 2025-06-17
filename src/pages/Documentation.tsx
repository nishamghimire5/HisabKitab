import { ArrowLeft, Users, Plus, Calculator, TrendingUp, UserPlus, Bell, Settings, Share2, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const Documentation = () => {
  const navigate = useNavigate();

  return (    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-white/20 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 flex-shrink-0"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Home</span>
              <span className="sm:hidden">Back</span>
            </Button>
            <div className="text-center flex-1 px-4">              <h1 className="text-lg md:text-2xl font-display font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                HisabKitab Guide
              </h1>
              <p className="text-gray-600 text-xs md:text-sm font-medium">Everything you need to know</p>
            </div>
            <div className="w-16 sm:w-20"></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Getting Started */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-6 h-6 text-blue-500" />
              Getting Started
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              HisabKitab is your go-to app for splitting expenses with friends, family, or colleagues. 
              Whether you're planning a vacation, organizing a group dinner, or managing shared household expenses, 
              we make it simple to track who owes what.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Quick Start:</h4>
              <ol className="list-decimal list-inside text-blue-700 space-y-1">
                <li>Create your first trip</li>
                <li>Add your friends to the trip</li>
                <li>Start adding expenses</li>
                <li>Let the app calculate who owes what!</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Core Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-500" />
                Trip Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Plus className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Create Trips</h4>
                  <p className="text-sm text-gray-600">Organize expenses by creating trips for different events or activities.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <UserPlus className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Smart Member Search</h4>
                  <p className="text-sm text-gray-600">Search members by username or email with privacy-focused autocomplete that only shows results after typing the full username/email.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Bell className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Invitation System</h4>
                  <p className="text-sm text-gray-600">Send trip invitations that require confirmation - members aren't added automatically for privacy and consent.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Share2 className="w-4 h-4 text-purple-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Shared Access</h4>
                  <p className="text-sm text-gray-600">All trip members can view and add expenses collaboratively once they accept the invitation.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Banknote className="w-5 h-5 text-green-500" />
                Expense Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Plus className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Add Expenses</h4>
                  <p className="text-sm text-gray-600">Log expenses with descriptions, amounts, and who paid.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="w-4 h-4 text-purple-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Partial Participation</h4>
                  <p className="text-sm text-gray-600">Select which members participated in each expense for accurate splitting.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calculator className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Auto-Calculate</h4>
                  <p className="text-sm text-gray-600">Expenses are automatically split equally among participants.</p>
                </div>
              </div>
            </CardContent>
          </Card>          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                Smart Settlements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Calculator className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Optimized Calculations</h4>
                  <p className="text-sm text-gray-600">Advanced algorithms calculate exactly who owes whom and how much, minimizing the number of transactions needed.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <TrendingUp className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Smart Recommendations</h4>
                  <p className="text-sm text-gray-600">Get the most efficient payment plan that settles all debts with minimal transfers.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Share2 className="w-4 h-4 text-purple-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Clear Breakdown</h4>
                  <p className="text-sm text-gray-600">Transparent view of balances, payments, and settlements with detailed explanations.</p>
                </div>
              </div>
            </CardContent>
          </Card>          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-red-500" />
                Social Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <UserPlus className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Friends System</h4>
                  <p className="text-sm text-gray-600">Add friends you frequently hang out with for quick access when creating trips and adding expenses.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Bell className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Privacy-First Invitations</h4>
                  <p className="text-sm text-gray-600">Receive notifications for trip invitations and friend requests with full control over acceptance.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Settings className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Smart Search</h4>
                  <p className="text-sm text-gray-600">Search for users with privacy protection - autocomplete only shows results after complete username/email entry.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Privacy & Search */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-6 h-6 text-indigo-500" />
              Privacy & Search Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-indigo-50 p-4 rounded-lg">
              <h4 className="font-semibold text-indigo-800 mb-3">Smart Search with Privacy Protection</h4>
              <div className="space-y-2 text-indigo-700">
                <p className="text-sm">• <strong>Username/Email Search:</strong> Find users by typing their complete username or email address</p>
                <p className="text-sm">• <strong>Privacy First:</strong> Autocomplete suggestions only appear after you've typed the full username/email to protect user privacy</p>
                <p className="text-sm">• <strong>No Partial Matches:</strong> Prevents unauthorized discovery of users through partial searches</p>
                <p className="text-sm">• <strong>Confirmed Invitations:</strong> Users must explicitly accept trip invitations - no automatic additions</p>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-3">Friends for Quick Access</h4>
              <div className="space-y-2 text-green-700">
                <p className="text-sm">• <strong>Build Your Network:</strong> Add friends you frequently split expenses with</p>
                <p className="text-sm">• <strong>Quick Trip Creation:</strong> Easily select from your friends list when creating new trips</p>
                <p className="text-sm">• <strong>Faster Expense Adding:</strong> Pre-populate participants from your regular group</p>
                <p className="text-sm">• <strong>Mutual Consent:</strong> Friend requests require acceptance from both parties</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">1</div>
                <div>
                  <h4 className="font-semibold mb-2">Create a Trip</h4>
                  <p className="text-gray-600">Start by creating a new trip with a name and description. This could be for a vacation, dinner, or any shared expense scenario.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">2</div>
                <div>
                  <h4 className="font-semibold mb-2">Add Members</h4>
                  <p className="text-gray-600">Invite friends by email or select from your friends list. They'll receive invitations to join the trip.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">3</div>
                <div>
                  <h4 className="font-semibold mb-2">Track Expenses</h4>
                  <p className="text-gray-600">Add expenses as they occur. Specify who paid, how much, and which members should split the cost.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">4</div>
                <div>
                  <h4 className="font-semibold mb-2">Settle Up</h4>
                  <p className="text-gray-600">View balances and get smart settlement recommendations. See exactly who owes what and to whom.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips & Best Practices */}
        <Card>
          <CardHeader>
            <CardTitle>Tips & Best Practices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-green-600">✓ Do's</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Add expenses as soon as they happen</li>
                  <li>• Use clear, descriptive names for expenses</li>
                  <li>• Double-check who participated in each expense</li>
                  <li>• Settle up regularly for ongoing trips</li>
                  <li>• Keep receipts for reference</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-red-600">✗ Avoid</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Forgetting to add small expenses</li>
                  <li>• Including people who didn't participate</li>
                  <li>• Waiting until the end to enter all expenses</li>
                  <li>• Not communicating with trip members</li>
                  <li>• Ignoring settlement recommendations</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Documentation;
