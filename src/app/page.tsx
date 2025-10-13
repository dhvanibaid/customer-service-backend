"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserSession, setUserSession, clearUserSession, isAuthenticated } from '@/lib/session';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { BookingTimeline, TimelineStage } from '@/components/booking-timeline';
import { ReviewsCarousel } from '@/components/reviews-carousel';
import { WhyChooseUs } from '@/components/why-choose-us';
import { PaymentDialog } from '@/components/payment-dialog';
import { lookupPincode } from '@/lib/pincode-lookup';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Page = 'otp-verification' | 'add-address' | 'home' | 'service-details' | 'booking-confirmation' | 'payment' | 'feedback';

interface Address {
  id: number;
  apartmentBuilding: string | null;
  streetArea: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  isDefault: boolean;
}

interface Booking {
  id: number;
  serviceType: string;
  subService: string | null;
  workDescription: string | null;
  status: string;
  professionalName: string | null;
  professionalContact: string | null;
  bookingDate: string;
}

const subServices: Record<string, string[]> = {
  plumber: ['Leaky Faucet Repair', 'Drain Cleaning', 'Pipe Installation'],
  electrician: ['Light Fixture Install', 'Wiring Repair', 'Fuse Box Check'],
  carpenter: ['Furniture Assembly', 'Door Repair', 'Custom Shelving'],
  painter: ['Interior Painting', 'Exterior Painting', 'Touch-ups'],
  househelp: ['Deep Cleaning', 'Regular Cleaning', 'Laundry']
};

export default function Home() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState<Page>('otp-verification');
  const [loading, setLoading] = useState(false);
  
  // OTP states
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  
  // Address states
  const [pincode, setPincode] = useState('');
  const [apartmentBuilding, setApartmentBuilding] = useState('');
  const [streetArea, setStreetArea] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincodeLoading, setPincodeLoading] = useState(false);
  
  // Service booking states
  const [selectedService, setSelectedService] = useState('');
  const [selectedSubService, setSelectedSubService] = useState('');
  const [workDescription, setWorkDescription] = useState('');
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [paymentAmount] = useState(499); // Fixed service charge
  
  // Feedback states
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  
  // User addresses
  const [userAddresses, setUserAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

  // Timeline stage
  const [timelineStage, setTimelineStage] = useState<TimelineStage>('registration');

  useEffect(() => {
    const session = getUserSession();
    if (session) {
      setCurrentPage('home');
      setTimelineStage('booking');
      fetchUserAddresses(session.userId);
    }
  }, []);

  // Pincode lookup handler
  const handlePincodeLookup = async (pincodeValue: string) => {
    setPincode(pincodeValue);
    
    if (pincodeValue.length === 6) {
      setPincodeLoading(true);
      const data = await lookupPincode(pincodeValue);
      setPincodeLoading(false);
      
      if (data) {
        setCity(data.city);
        setState(data.state);
        toast.success('Location details auto-filled!');
      } else {
        toast.error('Invalid pincode or location not found');
      }
    }
  };

  const fetchUserAddresses = async (userId: number) => {
    try {
      const res = await fetch(`/api/addresses?userId=${userId}`);
      if (res.ok) {
        const addresses = await res.json();
        setUserAddresses(addresses);
        const defaultAddress = addresses.find((addr: Address) => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
        } else if (addresses.length > 0) {
          setSelectedAddressId(addresses[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    }
  };

  const handleSendOtp = async () => {
    if (mobileNumber.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: mobileNumber, action: 'generate' })
      });

      const data = await res.json();
      
      if (res.ok) {
        setGeneratedOtp(data.otpCode);
        setOtpSent(true);
        toast.success('OTP sent successfully! (Check console for OTP in dev mode)');
        console.log('Generated OTP:', data.otpCode);
      } else {
        toast.error(data.error || 'Failed to send OTP');
      }
    } catch (error) {
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const verifyRes = await fetch('/api/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: mobileNumber, action: 'verify', otpCode: otp })
      });

      if (verifyRes.ok) {
        // Create or get user
        const userRes = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone_number: mobileNumber })
        });

        const userData = await userRes.json();
        
        if (userRes.ok) {
          setUserSession({
            userId: userData.id,
            phoneNumber: userData.phoneNumber,
            name: userData.name
          });

          toast.success('Verification successful!');
          
          // Check if user has addresses
          const addressRes = await fetch(`/api/addresses?userId=${userData.id}`);
          const addresses = await addressRes.json();
          
          if (addresses.length === 0) {
            setCurrentPage('add-address');
            setTimelineStage('address');
          } else {
            setUserAddresses(addresses);
            const defaultAddress = addresses.find((addr: Address) => addr.isDefault);
            setSelectedAddressId(defaultAddress?.id || addresses[0]?.id);
            setCurrentPage('home');
            setTimelineStage('booking');
          }
        } else {
          toast.error('Failed to create user session');
        }
      } else {
        const errorData = await verifyRes.json();
        toast.error(errorData.error || 'Invalid OTP');
      }
    } catch (error) {
      toast.error('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!pincode || !apartmentBuilding || !streetArea || !city || !state) {
      toast.error('Please fill out all address fields');
      return;
    }

    const session = getUserSession();
    if (!session) return;

    setLoading(true);
    try {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.userId,
          apartmentBuilding,
          streetArea,
          city,
          state,
          pincode,
          isDefault: userAddresses.length === 0
        })
      });

      if (res.ok) {
        const newAddress = await res.json();
        setUserAddresses([...userAddresses, newAddress]);
        setSelectedAddressId(newAddress.id);
        toast.success('Address saved successfully!');
        setCurrentPage('home');
        setTimelineStage('booking');
        
        // Clear form
        setApartmentBuilding('');
        setStreetArea('');
        setCity('');
        setState('');
        setPincode('');
      } else {
        toast.error('Failed to save address');
      }
    } catch (error) {
      toast.error('Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSelect = (serviceType: string) => {
    setSelectedService(serviceType);
    setSelectedSubService(subServices[serviceType][0]);
    setCurrentPage('service-details');
  };

  const handleConfirmBooking = async () => {
    if (!workDescription) {
      toast.error('Please provide a description of the work');
      return;
    }

    const session = getUserSession();
    if (!session || !selectedAddressId) {
      toast.error('Please select an address');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.userId,
          addressId: selectedAddressId,
          serviceType: selectedService,
          subService: selectedSubService,
          workDescription,
          bookingDate: new Date().toISOString()
        })
      });

      if (res.ok) {
        const booking = await res.json();
        
        // Simulate professional assignment
        await fetch(`/api/bookings?id=${booking.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'confirmed',
            professionalName: 'John Doe',
            professionalContact: '+91 98765 43210'
          })
        });

        const updatedRes = await fetch(`/api/bookings?id=${booking.id}`);
        const updatedBooking = await updatedRes.json();
        
        setCurrentBooking(updatedBooking);
        toast.success('Booking confirmed!');
        setCurrentPage('booking-confirmation');
        setTimelineStage('confirmed');
        setWorkDescription('');
      } else {
        toast.error('Failed to create booking');
      }
    } catch (error) {
      toast.error('Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    toast.success('Payment successful!');
    setCurrentPage('feedback');
    setTimelineStage('feedback');
  };

  const handleSubmitFeedback = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    const session = getUserSession();
    if (!session || !currentBooking) return;

    setLoading(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: currentBooking.id,
          userId: session.userId,
          rating,
          comments: feedbackText
        })
      });

      if (res.ok) {
        toast.success('Thank you for your feedback!');
        setRating(0);
        setFeedbackText('');
        setTimeout(() => {
          setCurrentPage('home');
          setTimelineStage('booking');
        }, 1500);
      } else {
        toast.error('Failed to submit feedback');
      }
    } catch (error) {
      toast.error('Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  const getServiceIcon = (serviceType: string) => {
    const icons: Record<string, string> = {
      plumber: '🔧',
      electrician: '⚡',
      carpenter: '🔨',
      painter: '🎨',
      househelp: '🧹',
    };
    return icons[serviceType] || '📦';
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Toaster position="top-center" />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-teal-400">Snapfix</h1>
          <p className="mt-2 text-lg text-slate-400">Your on-demand home services partner</p>
        </header>

        {/* Timeline - Show on all pages except OTP verification */}
        {currentPage !== 'otp-verification' && (
          <BookingTimeline currentStage={timelineStage} className="mb-8" />
        )}

        {/* Navigation Links */}
        {currentPage === 'home' && (
          <div className="flex justify-center space-x-4 mb-8">
            <Button
              variant="ghost"
              onClick={() => router.push('/profile')}
              className="text-slate-200 font-medium hover:text-teal-400"
            >
              My Profile
            </Button>
            <Button
              variant="ghost"
              onClick={() => setCurrentPage('add-address')}
              className="text-slate-200 font-medium hover:text-teal-400"
            >
              Add Address
            </Button>
          </div>
        )}

        {/* OTP Verification Page */}
        {currentPage === 'otp-verification' && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="rounded-xl shadow-lg p-8 bg-slate-800 border-slate-700">
              <h2 className="text-2xl font-bold mb-6 text-center text-slate-200">
                Mobile Number Verification
              </h2>
              <div className="mb-4">
                <Label htmlFor="mobile-number" className="text-slate-400">Mobile Number</Label>
                <Input
                  id="mobile-number"
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="e.g., 9876543210"
                  className="mt-1 bg-slate-700 border-slate-600 text-slate-100"
                  maxLength={10}
                />
              </div>
              <Button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full bg-teal-600 hover:bg-teal-700"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </Button>

              {otpSent && (
                <div className="mt-6">
                  <Label htmlFor="otp" className="text-slate-400">Enter OTP</Label>
                  <Input
                    id="otp"
                    type="number"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="e.g., 123456"
                    className="mt-1 bg-slate-700 border-slate-600 text-slate-100"
                    maxLength={6}
                  />
                  <Button
                    onClick={handleVerifyOtp}
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 mt-4"
                  >
                    {loading ? 'Verifying...' : 'Verify'}
                  </Button>
                </div>
              )}
            </Card>

            {/* Why Choose Us Section */}
            <div className="space-y-6">
              <WhyChooseUs />
              <ReviewsCarousel />
            </div>
          </div>
        )}

        {/* Add Address Page */}
        {currentPage === 'add-address' && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="rounded-xl shadow-lg p-8 bg-slate-800 border-slate-700">
              <h2 className="text-2xl font-bold mb-6 text-center text-slate-200">
                Add Your Address
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="pincode" className="text-slate-400 font-semibold">
                    Pincode *
                  </Label>
                  <Input
                    id="pincode"
                    value={pincode}
                    onChange={(e) => handlePincodeLookup(e.target.value)}
                    placeholder="Enter 6-digit pincode"
                    className="mt-1 bg-slate-700 border-slate-600 text-slate-100"
                    maxLength={6}
                  />
                  {pincodeLoading && (
                    <p className="text-xs text-teal-400 mt-1">Looking up location...</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="apartment-building" className="text-slate-400">
                    Apartment/Building Name *
                  </Label>
                  <Input
                    id="apartment-building"
                    value={apartmentBuilding}
                    onChange={(e) => setApartmentBuilding(e.target.value)}
                    placeholder="Enter apartment/building name"
                    className="mt-1 bg-slate-700 border-slate-600 text-slate-100"
                  />
                </div>
                <div>
                  <Label htmlFor="street-area" className="text-slate-400">Street/Area *</Label>
                  <Input
                    id="street-area"
                    value={streetArea}
                    onChange={(e) => setStreetArea(e.target.value)}
                    placeholder="Enter street/area"
                    className="mt-1 bg-slate-700 border-slate-600 text-slate-100"
                  />
                </div>
                <div>
                  <Label htmlFor="city" className="text-slate-400">City *</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City (auto-filled)"
                    className="mt-1 bg-slate-700 border-slate-600 text-slate-100"
                  />
                </div>
                <div>
                  <Label htmlFor="state" className="text-slate-400">State *</Label>
                  <Input
                    id="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State (auto-filled)"
                    className="mt-1 bg-slate-700 border-slate-600 text-slate-100"
                  />
                </div>
              </div>
              <Button
                onClick={handleSaveAddress}
                disabled={loading}
                className="w-full bg-teal-600 hover:bg-teal-700 mt-6"
              >
                {loading ? 'Saving...' : 'Save Address'}
              </Button>
              {userAddresses.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage('home')}
                  className="w-full mt-2 border-slate-600"
                >
                  Cancel
                </Button>
              )}
            </Card>

            {/* Reviews Section */}
            <div className="space-y-6">
              <ReviewsCarousel />
              <WhyChooseUs />
            </div>
          </div>
        )}

        {/* Home Page - Services */}
        {currentPage === 'home' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-200">Services</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {Object.keys(subServices).map((service) => (
                <button
                  key={service}
                  onClick={() => handleServiceSelect(service)}
                  className="bg-slate-800 border border-slate-700 rounded-xl shadow-lg text-center hover:shadow-xl p-6 transition-all hover:border-teal-500"
                >
                  <div className="flex flex-col items-center">
                    <span className="text-5xl mb-2">{getServiceIcon(service)}</span>
                    <p className="font-semibold text-lg text-slate-200 capitalize">{service}</p>
                    <p className="text-sm text-slate-400 mt-1">
                      {service === 'plumber' && 'Fix pipes & leaks'}
                      {service === 'electrician' && 'Wiring & repairs'}
                      {service === 'carpenter' && 'Woodwork & furniture'}
                      {service === 'painter' && 'Walls & exteriors'}
                      {service === 'househelp' && 'Cleaning & chores'}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Reviews Section */}
            <div className="space-y-6">
              <ReviewsCarousel />
            </div>
          </div>
        )}

        {/* Service Details Page */}
        {currentPage === 'service-details' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Button
                variant="ghost"
                onClick={() => setCurrentPage('home')}
                className="text-teal-400 font-medium mb-4 hover:underline"
              >
                ← Back to Home
              </Button>
              <Card className="rounded-xl shadow-lg p-8 bg-slate-800 border-slate-700">
                <h2 className="text-2xl font-bold mb-6 text-center text-slate-200">
                  Book a <span className="capitalize">{selectedService}</span>
                </h2>
                
                {/* Address Selection */}
                {userAddresses.length > 0 && (
                  <div className="mb-4">
                    <Label htmlFor="address-select" className="text-slate-400">Select Address</Label>
                    <Select
                      value={selectedAddressId?.toString()}
                      onValueChange={(value) => setSelectedAddressId(parseInt(value))}
                    >
                      <SelectTrigger className="mt-1 bg-slate-700 border-slate-600 text-slate-100">
                        <SelectValue placeholder="Select an address" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        {userAddresses.map((address) => (
                          <SelectItem key={address.id} value={address.id.toString()}>
                            {address.apartmentBuilding || ''} {address.city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="mb-4">
                  <Label htmlFor="sub-service" className="text-slate-400">Sub-service</Label>
                  <Select value={selectedSubService} onValueChange={setSelectedSubService}>
                    <SelectTrigger className="mt-1 bg-slate-700 border-slate-600 text-slate-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      {subServices[selectedService]?.map((sub) => (
                        <SelectItem key={sub} value={sub}>
                          {sub}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="mb-4">
                  <Label htmlFor="work-description" className="text-slate-400">
                    Work Description
                  </Label>
                  <Textarea
                    id="work-description"
                    rows={4}
                    value={workDescription}
                    onChange={(e) => setWorkDescription(e.target.value)}
                    placeholder="Please describe the work needed..."
                    className="mt-1 bg-slate-700 border-slate-600 text-slate-100"
                  />
                </div>
                <Button
                  onClick={handleConfirmBooking}
                  disabled={loading}
                  className="w-full bg-teal-600 hover:bg-teal-700"
                >
                  {loading ? 'Booking...' : 'Confirm Booking'}
                </Button>
              </Card>
            </div>

            {/* Why Choose Us */}
            <div className="space-y-6">
              <WhyChooseUs />
              <ReviewsCarousel />
            </div>
          </div>
        )}

        {/* Booking Confirmation Page */}
        {currentPage === 'booking-confirmation' && currentBooking && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="rounded-xl shadow-lg p-8 text-center bg-slate-800 border-slate-700">
              <h2 className="text-2xl font-bold text-green-500 mb-4">Booking Confirmed!</h2>
              <p className="text-slate-400 mb-6">
                Your professional is on their way and will call you shortly to confirm details.
              </p>
              <div className="p-4 bg-slate-700 rounded-lg text-left">
                <p className="font-medium text-slate-200">Professional Details:</p>
                <p className="text-slate-400">Name: {currentBooking.professionalName}</p>
                <p className="text-slate-400">Contact: {currentBooking.professionalContact}</p>
                <p className="text-slate-400 capitalize">Service: {currentBooking.serviceType}</p>
              </div>
              
              <div className="mt-6 p-4 bg-teal-900/30 border border-teal-700 rounded-lg">
                <p className="text-sm text-slate-300 mb-2">Service Charge</p>
                <p className="text-3xl font-bold text-teal-400">₹{paymentAmount}</p>
              </div>

              <Button
                onClick={() => {
                  setCurrentPage('payment');
                  setTimelineStage('payment');
                }}
                className="w-full mt-6 bg-teal-600 hover:bg-teal-700"
              >
                Proceed to Payment
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentPage('home')}
                className="w-full mt-2 border-slate-600"
              >
                Back to Home
              </Button>
            </Card>

            <div className="space-y-6">
              <ReviewsCarousel />
              <WhyChooseUs />
            </div>
          </div>
        )}

        {/* Payment Page */}
        {currentPage === 'payment' && (
          <div className="grid md:grid-cols-2 gap-6">
            <PaymentDialog
              amount={paymentAmount}
              onSuccess={handlePaymentSuccess}
              onCancel={() => setCurrentPage('booking-confirmation')}
            />
            
            <div className="space-y-6">
              <Card className="p-6 bg-slate-800 border-slate-700">
                <h3 className="text-lg font-semibold text-teal-400 mb-3">
                  🔒 Secure Payment
                </h3>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li>✓ 256-bit SSL encryption</li>
                  <li>✓ PCI DSS compliant</li>
                  <li>✓ All major cards accepted</li>
                  <li>✓ Money-back guarantee</li>
                </ul>
              </Card>
              <ReviewsCarousel />
            </div>
          </div>
        )}

        {/* Feedback Page */}
        {currentPage === 'feedback' && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="rounded-xl shadow-lg p-8 bg-slate-800 border-slate-700">
              <h2 className="text-2xl font-bold mb-6 text-center text-slate-200">
                How was your service?
              </h2>
              <p className="text-center text-slate-400 mb-6">
                Please rate your experience with our professional.
              </p>
              <div className="text-center space-x-2 text-3xl mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => setRating(star)}
                    className={`cursor-pointer transition-colors ${
                      star <= rating ? 'text-yellow-400' : 'text-slate-600'
                    } hover:text-yellow-400`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <div className="mb-4">
                <Label htmlFor="feedback-text" className="text-slate-400">
                  Any comments?
                </Label>
                <Textarea
                  id="feedback-text"
                  rows={4}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Share your experience..."
                  className="mt-1 bg-slate-700 border-slate-600 text-slate-100"
                />
              </div>
              <Button
                onClick={handleSubmitFeedback}
                disabled={loading}
                className="w-full bg-teal-600 hover:bg-teal-700"
              >
                {loading ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </Card>

            <div className="space-y-6">
              <ReviewsCarousel />
              <WhyChooseUs />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}