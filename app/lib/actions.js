// Use environment variable for backend URL
// In Vite/Hydrogen, use import.meta.env or process.env depending on context
// For client-side access, ensure variable starts with NEXT_PUBLIC_ or VITE_
const BACKEND_URL = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_BACKEND_URL
    ? process.env.NEXT_PUBLIC_BACKEND_URL
    : (import.meta.env?.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001');

export async function getOrderBySerial(serial) {
    try {
        const normalizedSerial = serial?.toUpperCase().trim();
        const response = await fetch(`${BACKEND_URL}/api/verify-serial`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ serial: normalizedSerial }),
        });

        if (!response.ok) throw new Error('Backend request failed');
        return await response.json();
    } catch (error) {
        console.error('Error fetching order by serial:', error.message);
        return [];
    }
}

export async function checkWarrantyStatus(shopifyCustomerId) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/warranty/status?shopifyCustomerId=${shopifyCustomerId}`);
        if (!response.ok) throw new Error('Failed to check warranty status');
        return await response.json();
    } catch (error) {
        console.error('Error checking warranty status:', error);
        return { registered: false };
    }
}

export async function registerWarranty(payload) {
    try {
        const normalizedPayload = {
            ...payload,
            serial: payload.serial?.toUpperCase().trim()
        };
        const response = await fetch(`${BACKEND_URL}/api/warranty/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(normalizedPayload),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to register warranty');
        return data;
    } catch (error) {
        console.error('Error registering warranty:', error);
        throw error;
    }
}
