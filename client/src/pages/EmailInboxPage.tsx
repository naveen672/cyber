import EmailInbox from "@/components/EmailInbox";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function EmailInboxPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      {/* Modern Header */}
      <div className="relative z-10 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl border-b border-white/20 sticky top-0 shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-300 via-cyan-300 to-purple-400 bg-clip-text text-transparent">CyberShield AI</h1>
                <p className="text-blue-200 text-sm">Email Threat Detection System</p>
              </div>
            </div>
            <Link href="/dashboard">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg">
                <span className="material-icons text-sm mr-2">dashboard</span>
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-6 py-8">
        <EmailInbox />
      </div>
    </div>
  );
}