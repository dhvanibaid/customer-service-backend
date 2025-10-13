"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserSession, clearUserSession } from '@/lib/session';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  User, 
  MapPin, 
  Calendar, 
  Star, 
  LogOut,
  ArrowLeft,
  Package,
  Phone,
  Home
} from 'lucide-react';

interface Booking {
  id: number;
  serviceType: string;
  subService: string | null;
  workDescription: string | null;
  status: string;
  professionalName: string | null;
  professionalContact: string | null;
  bookingDate: string;
  completionDate: string | null;
  createdAt: string;
}

interface Address {
  id: number;
  apartmentBuilding: string | null;
  streetArea: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  isDefault: boolean;
}

interface Feedback {
  rating: number;
  comments: string | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const session = getUserSession();
    if (!session) {
      router.push('/');
      return;
    }

    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Fetch user data
        const userRes = await fetch(`/api/users?id=${session.userId}`);
        if (!userRes.ok) throw new Error('Failed to fetch user data');
        const userData = await userRes.json();
        setUser(userData);

        // Fetch bookings
        const bookingsRes = await fetch(`/api/bookings?userId=${session.userId}`);
        if (!bookingsRes.ok) throw new Error('Failed to fetch bookings');
        const bookingsData = await bookingsRes.json();
        setBookings(bookingsData);

        // Fetch addresses
        const addressesRes = await fetch(`/api/addresses?userId=${session.userId}`);
        if (!addressesRes.ok) throw new Error('Failed to fetch addresses');
        const addressesData = await addressesRes.json();
        setAddresses(addressesData);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleLogout = () => {
    clearUserSession();
    router.push('/');
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500',
      confirmed: 'bg-blue-500',
      in_progress: 'bg-purple-500',
      completed: 'bg-green-500',
      cancelled: 'bg-red-500',
    };
    return colors[status] || 'bg-gray-500';
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
        <Card className="p-8 bg-slate-800 border-slate-700">
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={() => router.push('/')} variant="outline">
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/')}
              className="text-teal-400 hover:text-teal-300"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold text-teal-400">My Profile</h1>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="border-slate-700 hover:bg-slate-800"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* User Info Card */}
        <Card className="p-6 mb-6 bg-slate-800 border-slate-700">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-teal-600 flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-slate-200">
                {user?.name || 'User'}
              </h2>
              <div className="flex items-center gap-2 text-slate-400 mt-1">
                <Phone className="h-4 w-4" />
                <span>{user?.phoneNumber}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Saved Addresses */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Home className="h-5 w-5 text-teal-400" />
            <h2 className="text-xl font-semibold text-slate-200">Saved Addresses</h2>
          </div>
          <div className="grid gap-4">
            {addresses.length === 0 ? (
              <Card className="p-6 bg-slate-800 border-slate-700">
                <p className="text-slate-400 text-center">No addresses saved</p>
              </Card>
            ) : (
              addresses.map((address) => (
                <Card key={address.id} className="p-4 bg-slate-800 border-slate-700">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-teal-400 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {address.apartmentBuilding && (
                          <p className="font-medium text-slate-200">
                            {address.apartmentBuilding}
                          </p>
                        )}
                        {address.isDefault && (
                          <Badge className="bg-teal-600 text-white">Default</Badge>
                        )}
                      </div>
                      <p className="text-slate-400 text-sm">
                        {[address.streetArea, address.city, address.state, address.pincode]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        <Separator className="my-8 bg-slate-700" />

        {/* Service History */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Package className="h-5 w-5 text-teal-400" />
            <h2 className="text-xl font-semibold text-slate-200">Service History</h2>
          </div>
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <Card className="p-6 bg-slate-800 border-slate-700">
                <p className="text-slate-400 text-center">No service history</p>
              </Card>
            ) : (
              bookings.map((booking) => (
                <Card key={booking.id} className="p-6 bg-slate-800 border-slate-700">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">
                        {getServiceIcon(booking.serviceType)}
                      </span>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-200 capitalize">
                          {booking.serviceType}
                        </h3>
                        {booking.subService && (
                          <p className="text-slate-400 text-sm">{booking.subService}</p>
                        )}
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(booking.status)} text-white capitalize`}>
                      {booking.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  {booking.workDescription && (
                    <p className="text-slate-400 mb-3">{booking.workDescription}</p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar className="h-4 w-4" />
                      <span>Booked: {formatDate(booking.bookingDate)}</span>
                    </div>
                    {booking.completionDate && (
                      <div className="flex items-center gap-2 text-slate-400">
                        <Calendar className="h-4 w-4" />
                        <span>Completed: {formatDate(booking.completionDate)}</span>
                      </div>
                    )}
                  </div>

                  {booking.professionalName && (
                    <div className="mt-4 p-3 bg-slate-700 rounded-lg">
                      <p className="text-slate-300 font-medium mb-1">Professional Details</p>
                      <p className="text-slate-400 text-sm">Name: {booking.professionalName}</p>
                      {booking.professionalContact && (
                        <p className="text-slate-400 text-sm">
                          Contact: {booking.professionalContact}
                        </p>
                      )}
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}