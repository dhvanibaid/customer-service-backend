import { db } from '@/db';
import { addresses } from '@/db/schema';

async function main() {
    const now = new Date();
    
    const sampleAddresses = [
        // User 1 - 3 addresses
        {
            userId: 1,
            apartmentBuilding: 'Shanti Apartments, Flat 302',
            streetArea: 'MG Road',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001',
            isDefault: true,
            createdAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            userId: 1,
            apartmentBuilding: 'Office Address',
            streetArea: 'Bandra West',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400050',
            isDefault: false,
            createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            userId: 1,
            apartmentBuilding: 'Parents House',
            streetArea: 'Andheri East',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400069',
            isDefault: false,
            createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        },
        // User 2 - 2 addresses
        {
            userId: 2,
            apartmentBuilding: 'Green Heights, B-404',
            streetArea: 'Koramangala',
            city: 'Bangalore',
            state: 'Karnataka',
            pincode: '560034',
            isDefault: true,
            createdAt: new Date(now.getTime() - 22 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            userId: 2,
            apartmentBuilding: 'HSR Layout Villa',
            streetArea: 'Sector 1, HSR Layout',
            city: 'Bangalore',
            state: 'Karnataka',
            pincode: '560102',
            isDefault: false,
            createdAt: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000).toISOString(),
        },
        // User 3 - 3 addresses
        {
            userId: 3,
            apartmentBuilding: 'DLF Phase 2, Tower A',
            streetArea: 'Gurgaon',
            city: 'Gurgaon',
            state: 'Haryana',
            pincode: '122002',
            isDefault: true,
            createdAt: new Date(now.getTime() - 19 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            userId: 3,
            apartmentBuilding: 'Office Complex',
            streetArea: 'Cyber City',
            city: 'Gurgaon',
            state: 'Haryana',
            pincode: '122015',
            isDefault: false,
            createdAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            userId: 3,
            apartmentBuilding: 'Weekend Home',
            streetArea: 'Sohna Road',
            city: 'Gurgaon',
            state: 'Haryana',
            pincode: '122103',
            isDefault: false,
            createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        },
        // User 4 - 2 addresses
        {
            userId: 4,
            apartmentBuilding: 'Lakeside Residency, 5th Floor',
            streetArea: 'Banjara Hills',
            city: 'Hyderabad',
            state: 'Telangana',
            pincode: '500034',
            isDefault: true,
            createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            userId: 4,
            apartmentBuilding: 'Tech Park Office',
            streetArea: 'HITEC City',
            city: 'Hyderabad',
            state: 'Telangana',
            pincode: '500081',
            isDefault: false,
            createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        },
        // User 5 - 2 addresses
        {
            userId: 5,
            apartmentBuilding: 'Rose Apartments',
            streetArea: 'Salt Lake',
            city: 'Kolkata',
            state: 'West Bengal',
            pincode: '700091',
            isDefault: true,
            createdAt: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            userId: 5,
            apartmentBuilding: null,
            streetArea: 'Park Street',
            city: 'Kolkata',
            state: 'West Bengal',
            pincode: '700016',
            isDefault: false,
            createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
    ];

    await db.insert(addresses).values(sampleAddresses);
    
    console.log('✅ Addresses seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});