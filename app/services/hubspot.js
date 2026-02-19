
import axios from 'axios';

/**
 * HubSpot Service for handling form submissions and v3 CRM contacts
 */
class HubSpotService {
    get portalId() {
        return process.env.VITE_HUBSPOT_PORTAL_ID;
    }

    get apiKey() {
        return process.env.HUBSPOT_PRIVATE_ACCESS_KEY;
    }

    constructor() {
        this.baseUrl = 'https://api.hubapi.com';
    }

    /**
     * Submit a form to HubSpot (V2 API on hubapi.com)
     */
    async submitForm(formId, fields, context = {}) {
        const portalId = this.portalId;
        // The V3 endpoint doesnt exist on hubapi.com, using V2 instead as requested
        const url = `${this.baseUrl}/forms/v2/submissions/json-v2/${portalId}/${formId}`;

        const payload = {
            fields: Object.keys(fields).map(key => ({
                name: key,
                value: String(fields[key])
            })),
            context: {
                hutk: context.hutk,
                ipAddress: context.ipAddress,
                pageUri: context.pageUri,
                pageName: context.pageName
            }
        };

        try {
            const response = await axios.post(url, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('HubSpot Form V2 Submission Error:', error.response?.data || error.message);
            throw error;
        }
    }

    async getContactByEmail(email, properties = [], includeHistory = false) {
        if (!this.apiKey) return null;

        try {
            // Always fetch standard properties + requested ones
            const defaultProps = ['email', 'firstname', 'lastname', 'phone'];
            const allProps = [...new Set([...defaultProps, ...properties])];

            let url = `${this.baseUrl}/crm/v3/objects/contacts/${email}?idProperty=email`;

            if (allProps.length > 0) {
                url += `&properties=${allProps.join(',')}`;
            }

            if (includeHistory && properties.length > 0) {
                // Fetch history for requested properties to support warranty history
                url += `&propertiesWithHistory=${properties.join(',')}`;
            }

            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            if (error.response?.status === 404) {
                return null;
            }
            console.error('HubSpot Get Contact Error:', error.response?.data || error.message);
            return null;
        }
    }

    /**
     * Create or update a contact in HubSpot (V3)
     */
    async createOrUpdateContact(email, properties = {}) {
        if (!this.apiKey) return null;

        const url = `${this.baseUrl}/crm/v3/objects/contacts`;
        const payload = {
            properties: {
                email,
                ...properties
            }
        };

        try {
            const response = await axios.post(url, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });
            return response.data;
        } catch (error) {
            if (error.response?.status === 409) {
                // Contact exists, update it
                return await this.updateContactByEmail(email, properties);
            }
            console.error('HubSpot Contact Creation Error:', error.response?.data || error.message);
            throw error;
        }
    }

    async updateContactByEmail(email, properties) {
        if (!this.apiKey) return null;

        // Use email as ID with idProperty query param
        const url = `${this.baseUrl}/crm/v3/objects/contacts/${email}?idProperty=email`;

        try {
            const response = await axios.patch(url, { properties }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('HubSpot Contact Update Error:', error.response?.data || error.message);
            throw error;
        }
    }


    async getFormSubmissionsByEmail(formId, email, params = { limit: 50 }) {
        if (!this.apiKey) return [];

        const url = `https://api.hubapi.com/form-integrations/v1/submissions/forms/${formId}`;

        try {
            const response = await axios.get(url, {
                headers: { 'Authorization': `Bearer ${this.apiKey}` },
                params: params // limit, etc.
            });

            const results = response.data.results || [];

            // Map the submission array to a more useful format
            const parsedSubmissions = results.map(sub => {
                const vals = {};
                // sub.values is an array of { name, value } objects in API v1
                if (Array.isArray(sub.values)) {
                    sub.values.forEach(f => {
                        vals[f.name] = f.value;
                    });
                }
                return { ...sub, values: vals };
            });

            // Filter by matches
            return parsedSubmissions.filter(sub =>
                sub.values.email && sub.values.email.toLowerCase() === email.toLowerCase()
            );
        } catch (error) {
            // Suppress NO_FORM error to avoid noise
            if (error.response?.status !== 404) {
                console.warn('HubSpot Forms API Error:', error.response?.data || error.message);
            }
            return [];
        }
    }

    async getLegacyContactProfile(email) {
        if (!this.apiKey) return null;
        const url = `${this.baseUrl}/contacts/v1/contact/email/${email}/profile`;
        try {
            const response = await axios.get(url, {
                headers: { 'Authorization': `Bearer ${this.apiKey}` }
            });
            return response.data;
        } catch (error) {
            return null;
        }
    }

    /**
     * Search for a contact by a specific property value (V3 Search API)
     */
    async searchContacts(propertyName, value) {
        if (!this.apiKey) return [];

        const url = `${this.baseUrl}/crm/v3/objects/contacts/search`;
        const payload = {
            filterGroups: [{
                filters: [{
                    propertyName: propertyName,
                    operator: 'EQ',
                    value: value
                }]
            }],
            properties: ['email', 'firstname', 'lastname', propertyName],
            limit: 1
        };

        try {
            const response = await axios.post(url, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });
            return response.data.results || [];
        } catch (error) {
            console.error('HubSpot Search Error:', error.response?.data || error.message);
            return [];
        }
    }

    /**
     * Generic method to create any CRM Object (Contacts, Deals, or Custom Objects)
     */
    async createObject(objectTypeId, properties = {}) {
        if (!this.apiKey) return null;

        const url = `${this.baseUrl}/crm/v3/objects/${objectTypeId}`;
        const payload = {
            properties: {
                ...properties
            }
        };

        try {
            const response = await axios.post(url, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`HubSpot Object Creation Error (${objectTypeId}):`, error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Generic method to associate any two CRM Objects
     */
    async associateObjects(fromObjectType, fromId, toObjectType, toId, associationType) {
        if (!this.apiKey) return null;

        // Correct V3 Association Endpoint:
        // PUT /crm/v3/objects/{fromObjectType}/{fromObjectId}/associations/{toObjectType}/{toObjectId}/{associationType}
        const url = `${this.baseUrl}/crm/v3/objects/${fromObjectType}/${fromId}/associations/${toObjectType}/${toId}/${associationType}`;

        try {
            const response = await axios.put(url, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`HubSpot Association Error (${fromObjectType} -> ${toObjectType}):`, error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Create a Deal in HubSpot (V3)
     */
    async createDeal(properties = {}) {
        return this.createObject('deals', properties);
    }


    async getAssociatedObjects(fromObjectType, fromId, toObjectType, properties = []) {
        if (!this.apiKey) return [];

        const url = `${this.baseUrl}/crm/v3/objects/${fromObjectType}/${fromId}/associations/${toObjectType}`;

        try {
            const response = await axios.get(url, {
                headers: { 'Authorization': `Bearer ${this.apiKey}` }
            });

            const associations = response.data.results || [];
            if (associations.length === 0) return [];

            // Fetch the full records for these associated IDs
            const recordIds = associations.map(a => a.id);
            const batchUrl = `${this.baseUrl}/crm/v3/objects/${toObjectType}/batch/read`;

            const batchResponse = await axios.post(batchUrl, {
                inputs: recordIds.map(id => ({ id })),
                properties: properties
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });

            return batchResponse.data.results || [];
        } catch (error) {
            console.error(`HubSpot Get Associated Objects Error (${fromObjectType} -> ${toObjectType}):`, error.response?.data || error.message);
            return [];
        }
    }

    /**
     * Get Schema for an Object Type (to discover Association IDs)
     */
    async getObjectSchema(objectTypeId) {
        if (!this.apiKey) return null;
        // API Doc: GET /crm/v3/schemas/{objectTypeId}
        const url = `${this.baseUrl}/crm/v3/schemas/${objectTypeId}`;
        try {
            const response = await axios.get(url, {
                headers: { 'Authorization': `Bearer ${this.apiKey}` }
            });
            return response.data;
        } catch (error) {
            console.error(`HubSpot Get Schema Error (${objectTypeId}):`, error.response?.data || error.message);
            return null;
        }
    }
}

export default new HubSpotService();
