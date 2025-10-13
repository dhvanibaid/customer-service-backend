import { db } from '@/db';
import { feedback } from '@/db/schema';

async function main() {
    const now = new Date();
    
    const sampleFeedback = [
        {
            bookingId: 1,
            userId: 1,
            rating: 5,
            comments: 'Excellent service! Ramesh was very professional and fixed the leak quickly.',
            createdAt: new Date(now.getTime() - 19 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            bookingId: 2,
            userId: 1,
            rating: 4,
            comments: 'Good work, but took slightly longer than expected.',
            createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            bookingId: 3,
            userId: 1,
            rating: 5,
            comments: 'Perfect assembly job. Very neat and clean work.',
            createdAt: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            bookingId: 6,
            userId: 3,
            rating: 5,
            comments: 'Anil was very knowledgeable and fixed all outlets efficiently.',
            createdAt: new Date(now.getTime() - 11 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            bookingId: 8,
            userId: 4,
            rating: 4,
            comments: 'Door works perfectly now. Raju did a good job.',
            createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            bookingId: 10,
            userId: 5,
            rating: 5,
            comments: 'Great service, pipe installed properly without any issues.',
            createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            bookingId: 13,
            userId: 3,
            rating: 3,
            comments: 'Painting is okay, but some areas need touch-up. Expected better finish.',
            createdAt: new Date(now.getTime() - 16 * 24 * 60 * 60 * 1000).toISOString(),
        },
    ];

    await db.insert(feedback).values(sampleFeedback);
    
    console.log('✅ Feedback seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});