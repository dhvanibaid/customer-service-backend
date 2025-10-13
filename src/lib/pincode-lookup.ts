export interface PincodeData {
  pincode: string;
  city: string;
  state: string;
  district: string;
}

// Mock pincode database for common Indian pincodes
const pincodeDatabase: Record<string, PincodeData> = {
  "110001": { pincode: "110001", city: "New Delhi", state: "Delhi", district: "Central Delhi" },
  "400001": { pincode: "400001", city: "Mumbai", state: "Maharashtra", district: "Mumbai" },
  "560001": { pincode: "560001", city: "Bangalore", state: "Karnataka", district: "Bangalore" },
  "600001": { pincode: "600001", city: "Chennai", state: "Tamil Nadu", district: "Chennai" },
  "700001": { pincode: "700001", city: "Kolkata", state: "West Bengal", district: "Kolkata" },
  "500001": { pincode: "500001", city: "Hyderabad", state: "Telangana", district: "Hyderabad" },
  "411001": { pincode: "411001", city: "Pune", state: "Maharashtra", district: "Pune" },
  "380001": { pincode: "380001", city: "Ahmedabad", state: "Gujarat", district: "Ahmedabad" },
  "302001": { pincode: "302001", city: "Jaipur", state: "Rajasthan", district: "Jaipur" },
  "226001": { pincode: "226001", city: "Lucknow", state: "Uttar Pradesh", district: "Lucknow" },
  "160001": { pincode: "160001", city: "Chandigarh", state: "Chandigarh", district: "Chandigarh" },
  "201301": { pincode: "201301", city: "Noida", state: "Uttar Pradesh", district: "Gautam Buddha Nagar" },
  "122001": { pincode: "122001", city: "Gurgaon", state: "Haryana", district: "Gurgaon" },
  "560076": { pincode: "560076", city: "Bangalore", state: "Karnataka", district: "Bangalore" },
  "400070": { pincode: "400070", city: "Mumbai", state: "Maharashtra", district: "Mumbai Suburban" },
};

export async function lookupPincode(pincode: string): Promise<PincodeData | null> {
  // Remove spaces and validate format
  const cleanPincode = pincode.replace(/\s/g, '');
  
  if (!/^\d{6}$/.test(cleanPincode)) {
    return null;
  }

  // Check mock database first
  if (pincodeDatabase[cleanPincode]) {
    return pincodeDatabase[cleanPincode];
  }

  // Try India Post API
  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${cleanPincode}`);
    const data = await response.json();
    
    if (data && data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
      const postOffice = data[0].PostOffice[0];
      return {
        pincode: cleanPincode,
        city: postOffice.District || postOffice.Block || "",
        state: postOffice.State || "",
        district: postOffice.District || ""
      };
    }
  } catch (error) {
    console.error('Pincode lookup failed:', error);
  }

  return null;
}