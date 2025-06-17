import { ArrowLeft, Mail, Instagram, Linkedin, Facebook, Code, Heart, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-bg">
      {/* Beautiful Modern Header */}
      <div className="relative bg-gradient-to-br from-slate-50 via-blue-50/70 to-indigo-100/80 border-b border-white/20">
        <div className="absolute inset-0 opacity-40">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        </div>
        <div className="relative">
          <div className="container mx-auto px-4 py-3 md:py-4">
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className="flex items-center gap-2 flex-shrink-0 hover:bg-white/60 backdrop-blur-sm rounded-xl"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Home</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <div className="text-center flex-1 px-4">
                <h1 className="text-lg md:text-2xl font-display font-bold gradient-text-primary">
                  About HisabKitab
                </h1>
                <p className="text-gray-600 text-xs md:text-sm font-medium">Meet the developer & get in touch</p>
              </div>
              <div className="w-16 sm:w-20"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* About the App */}
        <Card className="mb-8 hover:shadow-medium transition-all duration-300">
          <CardHeader>            <CardTitle className="flex items-center gap-3 text-2xl font-display">
              <div className="w-12 h-12 flex items-center justify-center">
                <img src="/logo.jpg" alt="HisabKitab Logo" className="h-12 w-12" />
              </div>
              About HisabKitab
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-700 text-lg leading-relaxed font-medium">
              HisabKitab was born from the frustration of manually calculating who owes what after group trips and shared expenses. 
              We've all been there - trying to figure out complex splits with spreadsheets or napkin math.
            </p>
            <p className="text-gray-700 leading-relaxed">
              This app simplifies expense splitting with intelligent algorithms that minimize the number of transactions needed 
              while keeping track of everything transparently. Whether you're splitting a dinner bill, managing vacation expenses,
              or handling ongoing shared costs, HisabKitab makes it effortless.
            </p>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-3">Key Features:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
                <div>• Smart expense splitting algorithms</div>
                <div>• Real-time collaboration</div>
                <div>• Optimized settlement recommendations</div>
                <div>• Friend system for easy invitations</div>
                <div>• Partial participation support</div>
                <div>• Clean, intuitive interface</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Developer Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-6 h-6 text-blue-500" />
              About the Developer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <p className="text-gray-700">
                  Hi! I'm Nisham Ghimire, a passionate developer who loves creating practical solutions to everyday problems. 
                  HisabKitab combines my experience in full-stack development with a genuine need for better expense management tools.
                </p>
                <p className="text-gray-700">
                  This project was built using modern web technologies including React, TypeScript, Supabase, and Tailwind CSS, 
                  with a focus on user experience and reliability. I believe in creating software that genuinely helps people 
                  in their daily lives.
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Coffee className="w-4 h-4" />
                  <span>Powered by coffee and the desire to solve real problems</span>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-6">
              <h4 className="font-semibold text-gray-800 mb-4">Tech Stack</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <div className="font-semibold text-blue-700">Frontend</div>
                  <div className="text-blue-600">React + TypeScript</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg text-center">
                  <div className="font-semibold text-green-700">Backend</div>
                  <div className="text-green-600">Supabase</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg text-center">
                  <div className="font-semibold text-purple-700">Styling</div>
                  <div className="text-purple-600">Tailwind CSS</div>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg text-center">
                  <div className="font-semibold text-orange-700">Hosting</div>
                  <div className="text-orange-600">Vercel</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-6 h-6 text-green-500" />
              Get in Touch
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-700">
              Have questions, suggestions, or found a bug? I'd love to hear from you! 
              Your feedback helps make HisabKitab better for everyone.
            </p>            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <Button 
                variant="outline" 
                className="flex items-center gap-2 h-auto p-3 md:p-4 text-left"
                onClick={() => window.open('mailto:nishamghimire5@gmail.com', '_blank')}
              >
                <Mail className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <div className="text-left min-w-0">
                  <div className="font-semibold text-sm md:text-base">Email</div>
                  <div className="text-xs md:text-sm text-gray-600 truncate">General inquiries</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex items-center gap-2 h-auto p-3 md:p-4 text-left"
                onClick={() => window.open('https://www.linkedin.com/in/nishamghimire/', '_blank')}
              >
                <Linkedin className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div className="text-left min-w-0">
                  <div className="font-semibold text-sm md:text-base">LinkedIn</div>
                  <div className="text-xs md:text-sm text-gray-600 truncate">Professional profile</div>
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="flex items-center gap-2 h-auto p-3 md:p-4 text-left"
                onClick={() => window.open('https://www.instagram.com/nishamghimire/', '_blank')}
              >
                <Instagram className="w-5 h-5 text-pink-500 flex-shrink-0" />
                <div className="text-left min-w-0">
                  <div className="font-semibold text-sm md:text-base">Instagram</div>
                  <div className="text-xs md:text-sm text-gray-600 truncate">Follow my journey</div>
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="flex items-center gap-2 h-auto p-3 md:p-4 text-left"
                onClick={() => window.open('https://www.facebook.com/nishamghimire5', '_blank')}
              >
                <Facebook className="w-5 h-5 text-blue-700 flex-shrink-0" />
                <div className="text-left min-w-0">
                  <div className="font-semibold text-sm md:text-base">Facebook</div>
                  <div className="text-xs md:text-sm text-gray-600 truncate">Connect with me</div>
                </div>
              </Button>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">Support & Feature Requests</h4>
              <p className="text-yellow-700 text-sm">
                If you encounter any issues or have ideas for new features, please don't hesitate to reach out. 
                I'm committed to continuously improving HisabKitab based on user feedback.
              </p>
            </div>
              <div className="text-center pt-4">
              <p className="text-gray-600 text-sm">
                Thank you for using HisabKitab! 🙏
              </p>
              <p className="text-gray-500 text-xs mt-2">
                Made with ❤️ by Nisham Ghimire
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default About;
