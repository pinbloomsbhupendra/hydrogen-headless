export async function submitToHubSpot(data, accessToken) {
    if (!accessToken) {
        throw new Error('HubSpot access token is missing');
    }

    const toHubSpotDate = (dateStr) => {
        if (!dateStr) return undefined;
        const [year, month, day] = dateStr.split('-').map(Number);
        return Date.UTC(year, month - 1, day);
    };

    // Build properties safely (only include values that exist)
    const hubspotProperties = {
        email: data.email,
        firstname: data.firstName,
        lastname: data.lastName,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        zip: data.zip,
        country: data.country,
        warranty_number: data.warranty_number,
        serial_number: data.serial,
        purchase_date: toHubSpotDate(data.purchaseDate)
    };

    // Remove undefined or null values
    Object.keys(hubspotProperties).forEach((key) => {
        if (
            hubspotProperties[key] === undefined ||
            hubspotProperties[key] === null ||
            hubspotProperties[key] === ''
        ) {
            delete hubspotProperties[key];
        }
    });

    console.log('Submitting to HubSpot:', hubspotProperties);

    const headers = {
        Authorization: accessToken.startsWith('Bearer ')
            ? accessToken
            : `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
    };

    /* ============================
       1️⃣ CREATE CONTACT
    ============================ */
    const createResponse = await fetch(
        'https://api.hubapi.com/crm/v3/objects/contacts',
        {
            method: 'POST',
            headers,
            body: JSON.stringify({ properties: hubspotProperties })
        }
    );

    if (createResponse.ok) {
        console.log('HubSpot Contact Created');
        return await createResponse.json();
    }

    /* ============================
       2️⃣ IF EXISTS → UPDATE
    ============================ */
    if (createResponse.status === 409) {
        console.log('Contact exists. Updating...');

        const searchResponse = await fetch(
            'https://api.hubapi.com/crm/v3/objects/contacts/search',
            {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    filterGroups: [
                        {
                            filters: [
                                {
                                    propertyName: 'email',
                                    operator: 'EQ',
                                    value: data.email
                                }
                            ]
                        }
                    ]
                })
            }
        );

        if (!searchResponse.ok) {
            const errText = await searchResponse.text();
            throw new Error(`HubSpot search failed: ${errText}`);
        }

        const searchData = await searchResponse.json();

        if (searchData.total > 0) {
            const contactId = searchData.results[0].id;

            const updateResponse = await fetch(
                `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`,
                {
                    method: 'PATCH',
                    headers,
                    body: JSON.stringify({ properties: hubspotProperties })
                }
            );

            if (updateResponse.ok) {
                console.log('HubSpot Contact Updated');
                return await updateResponse.json();
            }

            const updateError = await updateResponse.text();
            throw new Error(`HubSpot update failed: ${updateError}`);
        }
    }

    /* ============================
       3️⃣ HANDLE OTHER ERRORS
    ============================ */
    const errorText = await createResponse.text();
    console.error('HubSpot Error:', errorText);

    throw new Error(`HubSpot submission failed: ${errorText}`);
}
