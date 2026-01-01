import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Country codes with phone number formats
const countryPhoneFormats: Record<string, { prefix: string; length: number }> = {
  'CN': { prefix: '+86', length: 11 },
  'US': { prefix: '+1', length: 10 },
  'GB': { prefix: '+44', length: 10 },
  'DE': { prefix: '+49', length: 11 },
  'FR': { prefix: '+33', length: 9 },
  'JP': { prefix: '+81', length: 10 },
  'KR': { prefix: '+82', length: 10 },
  'RU': { prefix: '+7', length: 10 },
  'IN': { prefix: '+91', length: 10 },
  'BR': { prefix: '+55', length: 11 },
  'AU': { prefix: '+61', length: 9 },
  'CA': { prefix: '+1', length: 10 },
  'MX': { prefix: '+52', length: 10 },
  'IT': { prefix: '+39', length: 10 },
  'ES': { prefix: '+34', length: 9 },
  'NL': { prefix: '+31', length: 9 },
  'BE': { prefix: '+32', length: 9 },
  'CH': { prefix: '+41', length: 9 },
  'AT': { prefix: '+43', length: 10 },
  'PL': { prefix: '+48', length: 9 },
  'SE': { prefix: '+46', length: 9 },
  'NO': { prefix: '+47', length: 8 },
  'DK': { prefix: '+45', length: 8 },
  'FI': { prefix: '+358', length: 9 },
  'PT': { prefix: '+351', length: 9 },
  'GR': { prefix: '+30', length: 10 },
  'TR': { prefix: '+90', length: 10 },
  'ZA': { prefix: '+27', length: 9 },
  'EG': { prefix: '+20', length: 10 },
  'NG': { prefix: '+234', length: 10 },
  'KE': { prefix: '+254', length: 9 },
  'IL': { prefix: '+972', length: 9 },
  'AE': { prefix: '+971', length: 9 },
  'SA': { prefix: '+966', length: 9 },
  'TH': { prefix: '+66', length: 9 },
  'VN': { prefix: '+84', length: 9 },
  'MY': { prefix: '+60', length: 10 },
  'SG': { prefix: '+65', length: 8 },
  'ID': { prefix: '+62', length: 11 },
  'PH': { prefix: '+63', length: 10 },
  'NZ': { prefix: '+64', length: 9 },
  'AR': { prefix: '+54', length: 10 },
  'CL': { prefix: '+56', length: 9 },
  'CO': { prefix: '+57', length: 10 },
  'PE': { prefix: '+51', length: 9 },
  'VE': { prefix: '+58', length: 10 },
  'UA': { prefix: '+380', length: 9 },
  'CZ': { prefix: '+420', length: 9 },
  'RO': { prefix: '+40', length: 10 },
  'HU': { prefix: '+36', length: 9 },
  'IE': { prefix: '+353', length: 9 },
  'HK': { prefix: '+852', length: 8 },
  'TW': { prefix: '+886', length: 9 },
  'MO': { prefix: '+853', length: 8 },
  'PK': { prefix: '+92', length: 10 },
  'BD': { prefix: '+880', length: 10 },
  'LK': { prefix: '+94', length: 9 },
  'NP': { prefix: '+977', length: 10 },
  'MM': { prefix: '+95', length: 9 },
  'KH': { prefix: '+855', length: 9 },
  'LA': { prefix: '+856', length: 10 },
  'MN': { prefix: '+976', length: 8 },
  'KZ': { prefix: '+7', length: 10 },
  'UZ': { prefix: '+998', length: 9 },
  'AZ': { prefix: '+994', length: 9 },
  'GE': { prefix: '+995', length: 9 },
  'AM': { prefix: '+374', length: 8 },
  'BY': { prefix: '+375', length: 9 },
  'MD': { prefix: '+373', length: 8 },
  'LT': { prefix: '+370', length: 8 },
  'LV': { prefix: '+371', length: 8 },
  'EE': { prefix: '+372', length: 8 },
  'SK': { prefix: '+421', length: 9 },
  'SI': { prefix: '+386', length: 8 },
  'HR': { prefix: '+385', length: 9 },
  'BA': { prefix: '+387', length: 8 },
  'RS': { prefix: '+381', length: 9 },
  'ME': { prefix: '+382', length: 8 },
  'MK': { prefix: '+389', length: 8 },
  'AL': { prefix: '+355', length: 9 },
  'BG': { prefix: '+359', length: 9 },
  'CY': { prefix: '+357', length: 8 },
  'MT': { prefix: '+356', length: 8 },
  'LU': { prefix: '+352', length: 9 },
  'IS': { prefix: '+354', length: 7 },
  'MA': { prefix: '+212', length: 9 },
  'TN': { prefix: '+216', length: 8 },
  'DZ': { prefix: '+213', length: 9 },
  'LY': { prefix: '+218', length: 9 },
  'GH': { prefix: '+233', length: 9 },
  'CI': { prefix: '+225', length: 10 },
  'SN': { prefix: '+221', length: 9 },
  'CM': { prefix: '+237', length: 9 },
  'UG': { prefix: '+256', length: 9 },
  'TZ': { prefix: '+255', length: 9 },
  'ET': { prefix: '+251', length: 9 },
  'IR': { prefix: '+98', length: 10 },
  'IQ': { prefix: '+964', length: 10 },
  'JO': { prefix: '+962', length: 9 },
  'LB': { prefix: '+961', length: 8 },
  'KW': { prefix: '+965', length: 8 },
  'QA': { prefix: '+974', length: 8 },
  'BH': { prefix: '+973', length: 8 },
  'OM': { prefix: '+968', length: 8 },
}

function generatePhoneNumber(countryCode: string): string {
  const format = countryPhoneFormats[countryCode] || { prefix: '+1', length: 10 }
  
  // Generate random digits
  let number = ''
  
  // First digit should not be 0 for most countries
  number += Math.floor(Math.random() * 9) + 1
  
  // Generate remaining digits
  for (let i = 1; i < format.length; i++) {
    number += Math.floor(Math.random() * 10)
  }
  
  return `${format.prefix}${number}`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get all countries from the database
    const { data: countries, error: countriesError } = await supabase
      .from('countries')
      .select('code')

    if (countriesError) {
      throw countriesError
    }

    const countryCodes = countries?.map(c => c.code) || Object.keys(countryPhoneFormats)
    
    let totalInserted = 0
    const errors: string[] = []

    // Generate 100 phone numbers for each country
    for (const countryCode of countryCodes) {
      const phoneNumbers: { country_code: string; phone_number: string }[] = []
      const usedNumbers = new Set<string>()

      // Generate 100 unique numbers
      while (phoneNumbers.length < 100) {
        const number = generatePhoneNumber(countryCode)
        if (!usedNumbers.has(number)) {
          usedNumbers.add(number)
          phoneNumbers.push({
            country_code: countryCode,
            phone_number: number,
          })
        }
      }

      // Insert in batches
      const { error: insertError } = await supabase
        .from('phone_numbers')
        .upsert(phoneNumbers, { 
          onConflict: 'country_code,phone_number',
          ignoreDuplicates: true 
        })

      if (insertError) {
        errors.push(`${countryCode}: ${insertError.message}`)
      } else {
        totalInserted += phoneNumbers.length
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Generated ${totalInserted} phone numbers for ${countryCodes.length} countries`,
        errors: errors.length > 0 ? errors : undefined
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
