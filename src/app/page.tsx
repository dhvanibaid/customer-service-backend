"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { getUserSession, setUserSession } from "@/lib/session";
import { BookingTimeline, TimelineStage } from "@/components/booking-timeline";
import { ReviewsCarousel } from "@/components/reviews-carousel";
import { WhyChooseUs } from "@/components/why-choose-us";
import { PaymentDialog } from "@/components/payment-dialog";
import { Wrench, User, LogOut } from "lucide-react";

export default function SnapfixHomePage() {
  const router = useRouter();
  const [currentStage, setCurrentStage] = useState<TimelineStage>('registration');
  const [session, setSession] = useState<any>(null);
  
  // Registration state
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  
  // Address state
  const [pincode, setPincode] = useState("");
  const [apartmentBuilding, setApartmentBuilding] = useState("");
  const [streetArea, setStreetArea] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [addressId, setAddressId] = useState<number | null>(null);
  
  // Booking state
  const [selectedService, setSelectedService] = useState("");
  const [subService, setSubService] = useState("");
  const [workDescription, setWorkDescription] = useState("");
  const [bookingId, setBookingId] = useState<number | null>(null);
  
  // Payment state
  const [showPayment, setShowPayment] = useState(false);
  
  const [loading, setLoading] = useState(false);

  const services = [
    {
      id: "plumber",
      name: "Plumber",
      icon: "🔧",
      subServices: ["Tap Repair", "Pipe Leakage", "Toilet Repair", "Basin Installation"]
    },
    {
      id: "electrician",
      name: "Electrician",
      icon: "⚡",
      subServices: ["Wiring", "Switch/Socket Repair", "Fan Installation", "Light Fitting"]
    },
    {
      id: "carpenter",
      name: "Carpenter",
      icon: "🔨",
      subServices: ["Furniture Repair", "Door Repair", "Cabinet Installation", "Shelving"]
    },
    {
      id: "painter",
      name: "Painter",
      icon: "🎨",
      subServices: ["Interior Painting", "Exterior Painting", "Waterproofing", "Wall Texture"]
    },
    {
      id: "househelp",
      name: "House Help",
      icon: "🧹",
      subServices: ["Deep Cleaning", "Regular Cleaning", "Kitchen Cleaning", "Bathroom Cleaning"]
    }
  ];

  useEffect(() => {
    const userSession = getUserSession();
    if (userSession) {
      setSession(userSession);
      setCurrentStage('address');
    }
  }, []);

  // Pincode auto-fill functionality
  const handlePincodeChange = async (value: string) => {
    setPincode(value);
    
    if (value.length === 6) {
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${value}`);
        const data = await response.json();
        
        if (data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
          const postOffice = data[0].PostOffice[0];
          setCity(postOffice.District);
          setState(postOffice.State);
          toast.success("Location details filled automatically!");
        } else {
          // Fallback to mock data
          const mockData: Record<string, { city: string; state: string }> = {
            "110001": { city: "New Delhi", state: "Delhi" },
            "400001": { city: "Mumbai", state: "Maharashtra" },
            "560001": { city: "Bangalore", state: "Karnataka" },
            "600001": { city: "Chennai", state: "Tamil Nadu" },
            "700001": { city: "Kolkata", state: "West Bengal" },
            "411001": { city: "Pune", state: "Maharashtra" },
            "500001": { city: "Hyderabad", state: "Telangana" },
            "380001": { city: "Ahmedabad", state: "Gujarat" },
          };
          
          if (mockData[value]) {
            setCity(mockData[value].city);
            setState(mockData[value].state);
            toast.success("Location details filled!");
          }
        }
      } catch (error) {
        console.error("Failed to fetch pincode data:", error);
      }
    }
  };

  const handleSendOtp = async () => {
    if (phoneNumber.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, action: "generate" }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setOtpSent(true);
        toast.success("OTP sent successfully!");
        console.log("Generated OTP:", data.otpCode);
      } else {
        toast.error(data.error || "Failed to send OTP");
      }
    } catch (error) {
      toast.error("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const verifyRes = await fetch("/api/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, action: "verify", otpCode: otp }),
      });

      if (verifyRes.ok) {
        const userRes = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone_number: phoneNumber }),
        });

        const userData = await userRes.json();
        
        if (userRes.ok) {
          const newSession = {
            userId: userData.id,
            phoneNumber: userData.phoneNumber,
            name: userData.name,
          };
          setUserSession(newSession);
          setSession(newSession);
          toast.success("OTP verified successfully!");
          setCurrentStage('address');
        } else {
          toast.error("Failed to create user session");
        }
      } else {
        const errorData = await verifyRes.json();
        toast.error(errorData.error || "Invalid OTP");
      }
    } catch (error) {
      toast.error("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!pincode || !city || !state) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.userId,
          apartmentBuilding,
          streetArea,
          city,
          state,
          pincode,
          isDefault: true,
        }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setAddressId(data.id);
        toast.success("Address saved successfully!");
        setCurrentStage('booking');
      } else {
        toast.error(data.error || "Failed to save address");
      }
    } catch (error) {
      toast.error("Failed to save address");
    } finally {
      setLoading(false);
    }
  };

  const handleBookService = async () => {
    if (!selectedService) {
      toast.error("Please select a service");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.userId,
          addressId,
          serviceType: selectedService,
          subService: subService || null,
          workDescription: workDescription || null,
          status: "confirmed",
          professionalName: "Rajesh Kumar",
          professionalContact: "+91 98765 43210",
        }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setBookingId(data.id);
        toast.success("Service booked successfully!");
        setCurrentStage('confirmed');
        
        // Auto-advance to payment after 2 seconds
        setTimeout(() => {
          setCurrentStage('payment');
          setShowPayment(true);
        }, 2000);
      } else {
        toast.error(data.error || "Failed to book service");
      }
    } catch (error) {
      toast.error("Failed to book service");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    setCurrentStage('completed');
    toast.success("Payment successful!");
    
    // Auto-advance to feedback after 2 seconds
    setTimeout(() => {
      setCurrentStage('feedback');
    }, 2000);
  };

  const handleSubmitFeedback = async (rating: number, comments: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          userId: session.userId,
          rating,
          comments,
        }),
      });

      if (res.ok) {
        toast.success("Thank you for your feedback!");
        setTimeout(() => {
          router.push("/profile");
        }, 1500);
      } else {
        toast.error("Failed to submit feedback");
      }
    } catch (error) {
      toast.error("Failed to submit feedback");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setSession(null);
    setUserSession(null as any);
    setCurrentStage('registration');
    setPhoneNumber("");
    setOtp("");
    setOtpSent(false);
    toast.success("Logged out successfully");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Toaster position="top-center" />
      
      {/* Header */}
      <header className="bg-slate-800/50 border-b border-slate-700 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wrench className="h-8 w-8 text-teal-400" />
              <h1 className="text-2xl font-bold text-teal-400">Snapfix</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => router.push("/employee/login")}
                className="text-teal-400 border-teal-600 hover:bg-teal-900/30"
              >
                <Wrench className="h-4 w-4 mr-2" />
                Employee Portal
              </Button>
              {session && (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => router.push("/profile")}
                    className="text-slate-300 hover:text-teal-400"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="text-slate-300 hover:text-red-400"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Timeline */}
      {currentStage !== 'registration' && (
        <BookingTimeline currentStage={currentStage} className="container mx-auto" />
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Left Column - Main Form */}
          <div>
            {currentStage === 'registration' && !session && (
              <Card className="p-8 bg-slate-800 border-slate-700">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-teal-400 mb-2">Welcome to Snapfix</h2>
                  <p className="text-slate-400">Book home services in minutes</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="phone" className="text-slate-300">Mobile Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter 10-digit mobile number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      maxLength={10}
                      disabled={otpSent}
                      className="mt-1 bg-slate-700 border-slate-600 text-slate-100"
                    />
                  </div>

                  {!otpSent ? (
                    <Button
                      onClick={handleSendOtp}
                      disabled={loading}
                      className="w-full bg-teal-600 hover:bg-teal-700 h-11"
                    >
                      {loading ? "Sending..." : "Send OTP"}
                    </Button>
                  ) : (
                    <>
                      <div>
                        <Label htmlFor="otp" className="text-slate-300">Enter OTP</Label>
                        <Input
                          id="otp"
                          type="text"
                          placeholder="Enter 6-digit OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          maxLength={6}
                          className="mt-1 bg-slate-700 border-slate-600 text-slate-100"
                        />
                        <p className="text-xs text-slate-500 mt-1">Check console for OTP</p>
                      </div>

                      <Button
                        onClick={handleVerifyOtp}
                        disabled={loading}
                        className="w-full bg-teal-600 hover:bg-teal-700 h-11"
                      >
                        {loading ? "Verifying..." : "Verify OTP"}
                      </Button>

                      <Button
                        onClick={() => {
                          setOtpSent(false);
                          setOtp("");
                        }}
                        variant="outline"
                        className="w-full border-slate-600"
                      >
                        Change Number
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            )}

            {currentStage === 'address' && session && (
              <Card className="p-8 bg-slate-800 border-slate-700">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-teal-400 mb-2">Add Your Address</h2>
                  <p className="text-slate-400">Where do you need the service?</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="pincode" className="text-slate-300">Pincode *</Label>
                    <Input
                      id="pincode"
                      type="text"
                      placeholder="Enter 6-digit pincode"
                      value={pincode}
                      onChange={(e) => handlePincodeChange(e.target.value)}
                      maxLength={6}
                      className="mt-1 bg-slate-700 border-slate-600 text-slate-100"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city" className="text-slate-300">City *</Label>
                      <Input
                        id="city"
                        type="text"
                        placeholder="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="mt-1 bg-slate-700 border-slate-600 text-slate-100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state" className="text-slate-300">State *</Label>
                      <Input
                        id="state"
                        type="text"
                        placeholder="State"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="mt-1 bg-slate-700 border-slate-600 text-slate-100"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="apartment" className="text-slate-300">Apartment/Building</Label>
                    <Input
                      id="apartment"
                      type="text"
                      placeholder="Flat no., Building name"
                      value={apartmentBuilding}
                      onChange={(e) => setApartmentBuilding(e.target.value)}
                      className="mt-1 bg-slate-700 border-slate-600 text-slate-100"
                    />
                  </div>

                  <div>
                    <Label htmlFor="street" className="text-slate-300">Street/Area</Label>
                    <Input
                      id="street"
                      type="text"
                      placeholder="Street name, Area"
                      value={streetArea}
                      onChange={(e) => setStreetArea(e.target.value)}
                      className="mt-1 bg-slate-700 border-slate-600 text-slate-100"
                    />
                  </div>

                  <Button
                    onClick={handleSaveAddress}
                    disabled={loading}
                    className="w-full bg-teal-600 hover:bg-teal-700 h-11"
                  >
                    {loading ? "Saving..." : "Continue"}
                  </Button>
                </div>
              </Card>
            )}

            {currentStage === 'booking' && session && (
              <Card className="p-8 bg-slate-800 border-slate-700">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-teal-400 mb-2">Select Service</h2>
                  <p className="text-slate-400">What do you need help with?</p>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-3">
                    {services.map((service) => (
                      <button
                        key={service.id}
                        onClick={() => {
                          setSelectedService(service.id);
                          setSubService("");
                        }}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedService === service.id
                            ? "border-teal-500 bg-teal-900/30"
                            : "border-slate-600 bg-slate-700 hover:border-slate-500"
                        }`}
                      >
                        <span className="text-4xl mb-2 block">{service.icon}</span>
                        <span className="text-slate-200 font-medium text-sm">{service.name}</span>
                      </button>
                    ))}
                  </div>

                  {selectedService && (
                    <div>
                      <Label className="text-slate-300">Sub-Service</Label>
                      <select
                        value={subService}
                        onChange={(e) => setSubService(e.target.value)}
                        className="w-full mt-1 p-2 rounded-lg bg-slate-700 border-slate-600 text-slate-100"
                      >
                        <option value="">Select sub-service</option>
                        {services
                          .find((s) => s.id === selectedService)
                          ?.subServices.map((sub) => (
                            <option key={sub} value={sub}>
                              {sub}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="description" className="text-slate-300">Work Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the work needed..."
                      value={workDescription}
                      onChange={(e) => setWorkDescription(e.target.value)}
                      className="mt-1 bg-slate-700 border-slate-600 text-slate-100"
                      rows={4}
                    />
                  </div>

                  <Button
                    onClick={handleBookService}
                    disabled={loading || !selectedService}
                    className="w-full bg-teal-600 hover:bg-teal-700 h-11"
                  >
                    {loading ? "Booking..." : "Book Service"}
                  </Button>
                </div>
              </Card>
            )}

            {currentStage === 'confirmed' && !showPayment && (
              <Card className="p-8 bg-slate-800 border-slate-700 text-center">
                <div className="text-6xl mb-4">✅</div>
                <h2 className="text-2xl font-bold text-teal-400 mb-2">Booking Confirmed!</h2>
                <p className="text-slate-400 mb-4">
                  Your service has been confirmed. A professional will be assigned shortly.
                </p>
                <div className="bg-slate-700 rounded-lg p-4 text-left">
                  <p className="text-slate-300 font-medium mb-2">Professional Details:</p>
                  <p className="text-slate-400 text-sm">Name: Rajesh Kumar</p>
                  <p className="text-slate-400 text-sm">Contact: +91 98765 43210</p>
                </div>
              </Card>
            )}

            {showPayment && (
              <PaymentDialog
                amount={499}
                onSuccess={handlePaymentSuccess}
                onCancel={() => setShowPayment(false)}
              />
            )}

            {currentStage === 'completed' && !showPayment && (
              <Card className="p-8 bg-slate-800 border-slate-700 text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-teal-400 mb-2">Service Completed!</h2>
                <p className="text-slate-400">
                  Your service has been successfully completed. Please provide feedback.
                </p>
              </Card>
            )}

            {currentStage === 'feedback' && (
              <Card className="p-8 bg-slate-800 border-slate-700">
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-bold text-teal-400 mb-2">Rate Your Experience</h2>
                  <p className="text-slate-400">How was the service?</p>
                </div>

                <FeedbackForm onSubmit={handleSubmitFeedback} loading={loading} />
              </Card>
            )}
          </div>

          {/* Right Column - Reviews & Info */}
          <div className="space-y-6">
            <ReviewsCarousel />
            <WhyChooseUs />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeedbackForm({ onSubmit, loading }: { onSubmit: (rating: number, comments: string) => void; loading: boolean }) {
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState("");

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-slate-300">Rating</Label>
        <div className="flex gap-2 justify-center my-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className="text-4xl transition-transform hover:scale-110"
            >
              {star <= rating ? "⭐" : "☆"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="feedback-comments" className="text-slate-300">Comments</Label>
        <Textarea
          id="feedback-comments"
          placeholder="Share your experience..."
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          className="mt-1 bg-slate-700 border-slate-600 text-slate-100"
          rows={4}
        />
      </div>

      <Button
        onClick={() => onSubmit(rating, comments)}
        disabled={loading || rating === 0}
        className="w-full bg-teal-600 hover:bg-teal-700 h-11"
      >
        {loading ? "Submitting..." : "Submit Feedback"}
      </Button>
    </div>
  );
}