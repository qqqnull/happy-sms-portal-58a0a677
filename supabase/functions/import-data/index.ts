import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Country code to region mapping
const countryRegions: Record<string, string> = {
  // Asia
  'CN': 'asia', 'JP': 'asia', 'KR': 'asia', 'IN': 'asia', 'ID': 'asia', 
  'TH': 'asia', 'VN': 'asia', 'MY': 'asia', 'SG': 'asia', 'PH': 'asia',
  'HK': 'asia', 'TW': 'asia', 'PK': 'asia', 'BD': 'asia', 'MM': 'asia',
  'KH': 'asia', 'LA': 'asia', 'NP': 'asia', 'LK': 'asia', 'MN': 'asia',
  // Europe
  'GB': 'europe', 'DE': 'europe', 'FR': 'europe', 'IT': 'europe', 'ES': 'europe',
  'NL': 'europe', 'BE': 'europe', 'CH': 'europe', 'AT': 'europe', 'SE': 'europe',
  'NO': 'europe', 'DK': 'europe', 'FI': 'europe', 'PL': 'europe', 'CZ': 'europe',
  'PT': 'europe', 'GR': 'europe', 'HU': 'europe', 'RO': 'europe', 'UA': 'europe',
  'RU': 'europe', 'IE': 'europe', 'SK': 'europe', 'BG': 'europe', 'HR': 'europe',
  // Americas
  'US': 'americas', 'CA': 'americas', 'MX': 'americas', 'BR': 'americas', 'AR': 'americas',
  'CL': 'americas', 'CO': 'americas', 'PE': 'americas', 'VE': 'americas', 'EC': 'americas',
  // Africa
  'ZA': 'africa', 'EG': 'africa', 'NG': 'africa', 'KE': 'africa', 'MA': 'africa',
  'GH': 'africa', 'TZ': 'africa', 'ET': 'africa', 'UG': 'africa', 'DZ': 'africa',
  // Oceania
  'AU': 'oceania', 'NZ': 'oceania', 'FJ': 'oceania', 'PG': 'oceania',
};

// Country code to flag emoji
const countryFlags: Record<string, string> = {
  'CN': '🇨🇳', 'US': '🇺🇸', 'GB': '🇬🇧', 'DE': '🇩🇪', 'FR': '🇫🇷',
  'JP': '🇯🇵', 'KR': '🇰🇷', 'IN': '🇮🇳', 'RU': '🇷🇺', 'BR': '🇧🇷',
  'CA': '🇨🇦', 'AU': '🇦🇺', 'IT': '🇮🇹', 'ES': '🇪🇸', 'MX': '🇲🇽',
  'ID': '🇮🇩', 'TH': '🇹🇭', 'VN': '🇻🇳', 'MY': '🇲🇾', 'SG': '🇸🇬',
  'PH': '🇵🇭', 'HK': '🇭🇰', 'TW': '🇹🇼', 'NL': '🇳🇱', 'BE': '🇧🇪',
  'CH': '🇨🇭', 'AT': '🇦🇹', 'SE': '🇸🇪', 'NO': '🇳🇴', 'DK': '🇩🇰',
  'FI': '🇫🇮', 'PL': '🇵🇱', 'CZ': '🇨🇿', 'PT': '🇵🇹', 'GR': '🇬🇷',
  'HU': '🇭🇺', 'RO': '🇷🇴', 'UA': '🇺🇦', 'ZA': '🇿🇦', 'EG': '🇪🇬',
  'NG': '🇳🇬', 'KE': '🇰🇪', 'AR': '🇦🇷', 'CL': '🇨🇱', 'CO': '🇨🇴',
  'PE': '🇵🇪', 'NZ': '🇳🇿', 'IE': '🇮🇪', 'IL': '🇮🇱', 'AE': '🇦🇪',
  'SA': '🇸🇦', 'TR': '🇹🇷', 'PK': '🇵🇰', 'BD': '🇧🇩', 'LK': '🇱🇰',
};

// Country code to English name
const countryNamesEn: Record<string, string> = {
  'CN': 'China', 'US': 'United States', 'GB': 'United Kingdom', 'DE': 'Germany', 
  'FR': 'France', 'JP': 'Japan', 'KR': 'South Korea', 'IN': 'India', 
  'RU': 'Russia', 'BR': 'Brazil', 'CA': 'Canada', 'AU': 'Australia',
  'IT': 'Italy', 'ES': 'Spain', 'MX': 'Mexico', 'ID': 'Indonesia',
  'TH': 'Thailand', 'VN': 'Vietnam', 'MY': 'Malaysia', 'SG': 'Singapore',
  'PH': 'Philippines', 'HK': 'Hong Kong', 'TW': 'Taiwan', 'NL': 'Netherlands',
  'BE': 'Belgium', 'CH': 'Switzerland', 'AT': 'Austria', 'SE': 'Sweden',
  'NO': 'Norway', 'DK': 'Denmark', 'FI': 'Finland', 'PL': 'Poland',
  'CZ': 'Czech Republic', 'PT': 'Portugal', 'GR': 'Greece', 'HU': 'Hungary',
  'RO': 'Romania', 'UA': 'Ukraine', 'ZA': 'South Africa', 'EG': 'Egypt',
  'NG': 'Nigeria', 'KE': 'Kenya', 'AR': 'Argentina', 'CL': 'Chile',
  'CO': 'Colombia', 'PE': 'Peru', 'NZ': 'New Zealand', 'IE': 'Ireland',
  'IL': 'Israel', 'AE': 'UAE', 'SA': 'Saudi Arabia', 'TR': 'Turkey',
  'PK': 'Pakistan', 'BD': 'Bangladesh', 'LK': 'Sri Lanka',
};

interface ImportData {
  id: number;
  ok: boolean;
  data: {
    country: {
      code: string;
      id: number;
      name: string;
    };
    services: {
      description: string;
      icon: string;
      id: number;
      name: string;
      price: number;
    }[];
    success: boolean;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: importData } = await req.json() as { data: ImportData[] };

    if (!importData || !Array.isArray(importData)) {
      throw new Error('Invalid data format');
    }

    console.log(`Starting import of ${importData.length} countries...`);

    // Collect all unique services
    const allServices = new Map<number, { id: number; name: string; description: string; icon: string }>();
    
    for (const item of importData) {
      if (!item.ok || !item.data?.services) continue;
      for (const service of item.data.services) {
        if (!allServices.has(service.id)) {
          allServices.set(service.id, {
            id: service.id,
            name: service.name,
            description: service.description,
            icon: service.icon,
          });
        }
      }
    }

    console.log(`Found ${allServices.size} unique services`);

    // Insert/update services
    const servicesList = Array.from(allServices.values());
    for (const service of servicesList) {
      const { error: serviceError } = await supabase
        .from('services')
        .upsert({
          id: crypto.randomUUID(),
          name: service.name,
          name_en: service.name,
          description: service.description,
          icon: service.icon || null,
          is_active: true,
          is_popular: [1, 2, 3, 4, 5, 9, 10, 13, 14, 23, 24, 43, 47].includes(service.id),
          success_rate: Math.floor(Math.random() * 9) + 91, // 91-99%
          sort_order: service.id,
        }, { onConflict: 'name' });

      if (serviceError) {
        console.error(`Error inserting service ${service.name}:`, serviceError);
      }
    }

    // Get service name to ID mapping
    const { data: dbServices } = await supabase.from('services').select('id, name');
    const serviceNameToId = new Map(dbServices?.map(s => [s.name, s.id]) || []);

    // Insert/update countries and country_services
    for (const item of importData) {
      if (!item.ok || !item.data?.country) continue;

      const country = item.data.country;
      const code = country.code;
      const region = countryRegions[code] || 'asia';
      const flag = countryFlags[code] || '🏳️';
      const nameEn = countryNamesEn[code] || country.name;
      
      // Calculate average price for the country
      const avgPrice = item.data.services.reduce((sum, s) => sum + s.price, 0) / (item.data.services.length || 1);
      const onlineCount = code === 'CN' ? 1000 : Math.floor(Math.random() * 400 + 100);

      // Insert country
      const { data: existingCountry } = await supabase
        .from('countries')
        .select('id')
        .eq('code', code)
        .maybeSingle();

      let countryId: string;

      if (existingCountry) {
        countryId = existingCountry.id;
        await supabase
          .from('countries')
          .update({
            name: country.name,
            name_en: nameEn,
            flag: flag,
            region: region,
            price: avgPrice.toFixed(2),
            online_count: onlineCount,
            is_active: true,
            is_popular: ['CN', 'US', 'GB', 'JP', 'KR', 'IN', 'RU'].includes(code),
          })
          .eq('id', countryId);
      } else {
        const newId = crypto.randomUUID();
        const { error: countryError } = await supabase
          .from('countries')
          .insert({
            id: newId,
            code: code,
            name: country.name,
            name_en: nameEn,
            flag: flag,
            region: region,
            price: avgPrice.toFixed(2),
            online_count: onlineCount,
            is_active: true,
            is_popular: ['CN', 'US', 'GB', 'JP', 'KR', 'IN', 'RU'].includes(code),
            sort_order: item.id,
          });
        
        if (countryError) {
          console.error(`Error inserting country ${code}:`, countryError);
          continue;
        }
        countryId = newId;
      }

      // Insert country_services
      for (const service of item.data.services) {
        const serviceId = serviceNameToId.get(service.name);
        if (!serviceId) continue;

        await supabase
          .from('country_services')
          .upsert({
            country_id: countryId,
            service_id: serviceId,
            price: service.price,
            is_active: true,
          }, { onConflict: 'country_id,service_id', ignoreDuplicates: true });
      }

      console.log(`Imported country: ${country.name} (${code}) with ${item.data.services.length} services`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Imported ${importData.length} countries and ${allServices.size} services` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Import error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
