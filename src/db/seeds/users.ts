import { db } from '@/db';
import { users } from '@/db/schema';

async function main() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const twentyFiveDaysAgo = new Date();
    twentyFiveDaysAgo.setDate(twentyFiveDaysAgo.getDate() - 25);
    
    const twentyDaysAgo = new Date();
    twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20);
    
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
    
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    const sampleUsers = [
        {
            phoneNumber: '9876543210',
            name: 'Rajesh Kumar',
            createdAt: thirtyDaysAgo.toISOString(),
            updatedAt: thirtyDaysAgo.toISOString(),
        },
        {
            phoneNumber: '9988776655',
            name: 'Priya Sharma',
            createdAt: twentyFiveDaysAgo.toISOString(),
            updatedAt: twentyFiveDaysAgo.toISOString(),
        },
        {
            phoneNumber: '9123456789',
            name: 'Amit Patel',
            createdAt: twentyDaysAgo.toISOString(),
            updatedAt: twentyDaysAgo.toISOString(),
        },
        {
            phoneNumber: '9876501234',
            name: 'Sneha Reddy',
            createdAt: fifteenDaysAgo.toISOString(),
            updatedAt: fifteenDaysAgo.toISOString(),
        },
        {
            phoneNumber: '9988112233',
            name: null,
            createdAt: tenDaysAgo.toISOString(),
            updatedAt: tenDaysAgo.toISOString(),
        }
    ];

    await db.insert(users).values(sampleUsers);
    
    console.log('✅ Users seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});