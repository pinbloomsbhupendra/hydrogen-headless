
export async function loader({ context }) {
    const key = context.env.HUBSPOT_PRIVATE_ACCESS_KEY || process.env.HUBSPOT_PRIVATE_ACCESS_KEY;
    const cleanKey = key.replace(/^Bearer\s+/i, '');
    const OBJECT_TYPE = '2-225350388';

    const results = {};

    try {
        // 1. Check Properties
        const propRes = await fetch(`https://api.hubapi.com/crm/v3/properties/${OBJECT_TYPE}`, {
            headers: { Authorization: `Bearer ${cleanKey}` }
        });
        const propData = await propRes.json();

        if (propData.results) {
            results.properties = propData.results.map(p => p.name).filter(n =>
                ['serial_number', 'order_id', 'purchase_date', 'product_name', 'warranty_number'].includes(n)
            );
        } else {
            results.properties_error = propData;
        }

        // 2. Check Associations (Contacts -> Warranties)
        const assocRes = await fetch(`https://api.hubapi.com/crm/v4/associations/definitions/0-1/${OBJECT_TYPE}`, {
            headers: { Authorization: `Bearer ${cleanKey}` }
        });
        const assocData = await assocRes.json();

        if (assocData.results) {
            results.associations = assocData.results.map(a => ({
                id: a.associationTypeId,
                label: a.label,
                category: a.associationCategory
            }));
        } else {
            results.associations_error = assocData;
        }

    } catch (e) {
        results.error = e.message;
    }

    return new Response(JSON.stringify(results, null, 2), {
        headers: {
            'Content-Type': 'application/json'
        }
    });
}
