"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Wrench, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EmployeeSignup() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [name, setName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [step, setStep] = useState<"phone" | "otp" | "details">("phone");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber || phoneNumber.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);
    try {
      // Check if employee already exists
      const checkRes = await fetch(`/api/employee/profile?phone=${phoneNumber}`);
      if (checkRes.ok) {
        toast.error("Phone number already registered. Please login instead.");
        setLoading(false);
        return;
      }

      // Send OTP
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

      if (otpRes.ok) {
        toast.success("OTP verified!");
        setStep("details");
      } else {
        toast.error(otpData.error || "Invalid OTP");
      }
    } catch (error) {
      toast.error("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || name.trim().length < 2) {
      toast.error("Please enter a valid name");
      return;
    }

    if (!specialization) {
      toast.error("Please select your specialization");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/employee/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber,
          name: name.trim(),
          specialization
        })
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Account created successfully! Redirecting to login...");
        setTimeout(() => {
          router.push("/employee/login");
        }, 1500);
      } else {
        toast.error(data.error || "Failed to create account");
      }
    } catch (error) {
      toast.error("Failed to create account. Please try again.");
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
            <CardTitle className="text-2xl font-bold text-white">Join SnapFix Team</CardTitle>
            <CardDescription className="text-slate-400">
              {step === "phone" 
                ? "Enter your phone number to get started" 
                : step === "otp"
                ? "Enter the OTP sent to your phone"
                : "Complete your profile"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {step === "phone" && (
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
            )}

            {step === "otp" && (
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
                  {loading ? "Verifying..." : "Verify OTP"}
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

            {step === "details" && (
              <form onSubmit={handleCreateAccount} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-300">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialization" className="text-slate-300">Specialization</Label>
                  <Select value={specialization} onValueChange={setSpecialization}>
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                      <SelectValue placeholder="Select your specialization" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="Plumber" className="text-white hover:bg-slate-700">Plumber</SelectItem>
                      <SelectItem value="Electrician" className="text-white hover:bg-slate-700">Electrician</SelectItem>
                      <SelectItem value="Carpenter" className="text-white hover:bg-slate-700">Carpenter</SelectItem>
                      <SelectItem value="Painter" className="text-white hover:bg-slate-700">Painter</SelectItem>
                      <SelectItem value="House Help" className="text-white hover:bg-slate-700">House Help</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  disabled={loading}
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center mt-6 text-slate-400 text-sm">
          Already have an account? <Link href="/employee/login" className="text-orange-400 hover:text-orange-300 underline">Login here</Link>
        </p>
      </div>
    </div>
  );
}
