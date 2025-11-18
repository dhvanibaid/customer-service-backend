"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Wrench, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { setEmployeeSession, getEmployeeSession } from "@/lib/employee-session";

export default function EmployeeLogin() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Redirect if already logged in
    const session = getEmployeeSession();
    if (session) {
      router.push("/employee/dashboard");
    }
  }, [router]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber || phoneNumber.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/employee/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber,
          action: "generate"
        })
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`OTP sent to ${phoneNumber}. For testing: ${data.otpCode}`);
        setStep("otp");
      } else {
        toast.error(data.error || "Failed to send OTP");
      }
    } catch (error) {
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otpCode || otpCode.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      // Verify OTP
      const otpRes = await fetch("/api/employee/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber,
          otpCode,
          action: "verify"
        })
      });

      const otpData = await otpRes.json();

      if (!otpRes.ok) {
        toast.error(otpData.error || "Invalid OTP");
        setLoading(false);
        return;
      }

      // Get employee profile
      const profileRes = await fetch(`/api/employee/profile?phone=${phoneNumber}`);
      const profileData = await profileRes.json();

      if (profileRes.ok) {
        // Save session
        setEmployeeSession({
          employeeId: profileData.id,
          phoneNumber: profileData.phoneNumber,
          name: profileData.name,
          specialization: profileData.specialization
        });

        toast.success("Login successful!");
        router.push("/employee/dashboard");
      } else {
        toast.error("Employee not found. Please contact admin.");
      }
    } catch (error) {
      toast.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Toaster position="top-center" />
      
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center text-white mb-6 hover:text-orange-400 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        <Card className="shadow-2xl border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-orange-500 p-4 rounded-full">
                <Wrench className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white">SnapFix Employee</CardTitle>
            <CardDescription className="text-slate-400">
              {step === "phone" 
                ? "Enter your phone number to receive OTP" 
                : "Enter the OTP sent to your phone"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {step === "phone" ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-slate-300">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter 10-digit phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    maxLength={10}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send OTP"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-slate-300">OTP Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 text-center text-2xl tracking-widest"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Verify & Login"}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-slate-400 hover:text-white"
                  onClick={() => setStep("phone")}
                >
                  Change Phone Number
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center mt-6 text-slate-400 text-sm">
          Don't have an account? <Link href="/employee/register" className="text-orange-400 hover:text-orange-300 underline">Register here</Link>
        </p>

        <p className="text-center mt-2 text-slate-400 text-sm">
          For customers? <Link href="/login" className="text-orange-400 hover:text-orange-300 underline">Login here</Link>
        </p>
      </div>
    </div>
  );
}