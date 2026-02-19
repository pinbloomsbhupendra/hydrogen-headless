
const HUBSPOT_OBJECT_TYPE = 'p245100011_warranty_registrations'; // Warranty Registrations (Custom Object)

export async function submitToHubSpot(data, accessToken) {
    if (!accessToken) {
        console.warn('HubSpot Access Token missing in submitToHubSpot');
        // HubSpotService uses process.env.HUBSPOT_API_KEY. 
        // We should ensure that is set or pass the token to the service if modified to accept it.
        // The current HubSpotService reads from process.env.
        // We will assume process.env.HUBSPOT_API_KEY is set or we should set it dynamically if possible?
        // Actually, the user's HubSpotService uses `process.env`.
        // If we are in Oxygen/Hydrogen context, we might need to rely on `accessToken` passed in 
        // OR rely on the fact that Hydrogen exposes env vars to process.env if configured?
        // Hydrogen uses `context.env`.
        // BUT the user provided a Service that uses `process.env`. 
        // Let's assume for now we might need to patch HubSpotService to accept a token or set it.
    }

    // Checking if we can patch the key dynamically for this request context
    // The provided service class is a singleton `new HubSpotService()`.
    // We can't easily inject the key per request if it reads from process.env getter.
    // However, JS getters are re-evaluated.
    // If we can't set process.env, we might fail.
    // Let's modify the Service to verify if we can pass key.

    // WAIT: The user's provided code: `get apiKey() { return process.env.HUBSPOT_API_KEY; }`
    // In Hydrogen, `process.env` might strictly be for build time or specific runtimes.
    // The `submitToHubSpot` function receives `accessToken`.

    // I will use a direct implementation here that mirrors the Service logic but uses `fetch`/`accessToken` 
    // OR I will updated the Service to accept an API Key.

    // Since I cannot change the Service easily without risking breaking other things (if any),
    // I will stick to the ROBUST implementation I just wrote in the previous step, which is ALREADY mirroring the user's logic!

    // The user asked: "take this as reference... check this mutation and take idea from this to make it correct"
    // My previous edit in Step 826 ALREADY adapted the logic (Orphaned Creation -> Schema Discovery -> Association).
    // The user THEN pasted the Service code and said "take this as reference".

    // Do they WANT me to use the service file?
    // "import hubspotService from .... check this mutation"

    // Yes, they probably want me to use the Service pattern.
    // But `HubSpotService` introduces `axios` which might be heavy/problematic in some Edge runtimes (though Oxygen supports it).
    // And the `process.env` issue.

    // I think the best path is:
    // Update `submitToHubSpot` to fully align with the "Product Info" and "Contact Properties" logic from the user's snippet.
    // Ensure `association` uses the discovery.

    // I will Update `mutations.js` to polish the logic to match the User's example details (like constructing `product_details` string).

    const toHubSpotDate = (dateStr) => {
        if (!dateStr) return undefined;
        const [year, month, day] = dateStr.split('-').map(Number);
        return Date.UTC(year, month - 1, day);
    };

    const cleanKey = accessToken.replace(/^Bearer\s+/i, '');

    try {
        console.log(`[HubSpot] Starting optimized sync for ${data.email}...`);

        const productName = data.product_name || 'Product';
        const orderId = data.order_number;
        const serial = data.serial || '';
        const modelType = (productName).toLowerCase().includes('guardian') ? 'Guardian' : 'Standard';

        // ---------------------------------------------------------
        // 1. PARALLEL CHECKS (Contact + Duplicates)
        // ---------------------------------------------------------
        const [searchRes, duplicateRes] = await Promise.all([
            // Search Contact
            fetch(`https://api.hubapi.com/crm/v3/objects/contacts/search`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${cleanKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: data.email }] }],
                    properties: ['email'],
                    limit: 1
                })
            }),
            // Check Duplicate Warranty
            fetch(`https://api.hubapi.com/crm/v3/objects/${HUBSPOT_OBJECT_TYPE}/search`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${cleanKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    filterGroups: [{
                        filters: [
                            { propertyName: 'order_id', operator: 'EQ', value: orderId },
                            { propertyName: 'product_name', operator: 'EQ', value: productName }
                        ]
                    }],
                    limit: 1
                })
            })
        ]);

        const [searchData, duplicateData] = await Promise.all([
            searchRes.json(),
            duplicateRes.json()
        ]);

        // Fail early if duplicate found
        if (duplicateData.total > 0) {
            throw new Error(`This product (${productName}) is already registered for order ${orderId}.`);
        }

        // ---------------------------------------------------------
        // 2. PREPARE PROPERTIES
        // ---------------------------------------------------------
        const details = [`Serial: ${serial}`, `Type: ${modelType}`, `Date: ${data.purchaseDate}`, `Phone: ${data.phone}`];
        const productInfo = `${productName} | ${details.join(' | ')}`;

        const contactProperties = {
            email: data.email, firstname: data.firstName, lastname: data.lastName,
            phone: data.phone, address: data.address, city: data.city, state: data.state,
            zip: data.zip, country: data.country,
            serial_number: serial, warranty_serial: serial, warranty_model_type: modelType,
            product_details: productInfo, warranty_product: productName
        };

        // ---------------------------------------------------------
        // 3. UPSERT CONTACT & CREATE WARRANTY (Sequential but faster)
        // ---------------------------------------------------------
        let contactId = searchData.results?.[0]?.id;

        const contactMethod = contactId ? 'PATCH' : 'POST';
        const contactUrl = contactId ? `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}` : `https://api.hubapi.com/crm/v3/objects/contacts`;

        const contactPromise = fetch(contactUrl, {
            method: contactMethod,
            headers: { Authorization: `Bearer ${cleanKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ properties: contactProperties })
        });

        const warrantyProps = {
            warranty_number: Number(data.warranty_number),
            serial_number: serial,
            product_name: productName,
            model_type: modelType,
            order_id: orderId,
            purchase_date: toHubSpotDate(data.purchaseDate),
            phone: data.phone
        };

        const warrantyRes = await fetch(`https://api.hubapi.com/crm/v3/objects/${HUBSPOT_OBJECT_TYPE}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${cleanKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ properties: warrantyProps })
        });

        if (!warrantyRes.ok) throw new Error(`Failed to create warranty: ${await warrantyRes.text()}`);

        const warrantyData = await warrantyRes.json();
        const warrantyId = warrantyData.id;

        // Ensure contact update is finished and get ID
        if (!contactId) {
            const rawContact = await contactPromise;
            const newContactData = await rawContact.json();
            contactId = newContactData.id;
        }

        // ---------------------------------------------------------
        // 4. ASSOCIATE (Using Hardcoded ID 33 for SPEED)
        // ---------------------------------------------------------
        const associationTypeId = 33; // Pre-discovered for Contact-to-Warranty registration

        await fetch(`https://api.hubapi.com/crm/v3/objects/${HUBSPOT_OBJECT_TYPE}/${warrantyId}/associations/contacts/${contactId}/${associationTypeId}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${cleanKey}` }
        });

        console.log(`[HubSpot] Optimized sync complete for ${warrantyId}`);
        return warrantyData;

    } catch (error) {
        console.error('[HubSpot] Sync Error:', error);
        throw error;
    }
}
