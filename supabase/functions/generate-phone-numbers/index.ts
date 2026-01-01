import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// 国家代码到规则的映射（从网站JavaScript代码中提取）
const COUNTRY_RULES: Record<string, { prefix: string; length: number }> = {
  'US': { prefix: '1', length: 10 },
  'JP': { prefix: '81', length: 10 },
  'KR': { prefix: '82', length: 10 },
  'IN': { prefix: '91', length: 10 },
  'AU': { prefix: '61', length: 9 },
  'SG': { prefix: '65', length: 8 },
  'GB': { prefix: '44', length: 10 },
  'DE': { prefix: '49', length: 10 },
  'FR': { prefix: '33', length: 9 },
  'CA': { prefix: '1', length: 10 },
  'RU': { prefix: '7', length: 10 },
  'BR': { prefix: '55', length: 10 },
  'ZA': { prefix: '27', length: 9 },
  'MX': { prefix: '52', length: 10 },
  'IT': { prefix: '39', length: 10 },
  'ES': { prefix: '34', length: 9 },
  'NL': { prefix: '31', length: 9 },
  'NZ': { prefix: '64', length: 9 },
  'TH': { prefix: '66', length: 9 },
  'VN': { prefix: '84', length: 9 },
  'ID': { prefix: '62', length: 9 },
  'PH': { prefix: '63', length: 10 },
  'TW': { prefix: '886', length: 9 },
  'HK': { prefix: '852', length: 8 },
  'AE': { prefix: '971', length: 9 },
  'SA': { prefix: '966', length: 9 },
  'EG': { prefix: '20', length: 10 },
  'TR': { prefix: '90', length: 10 },
  'SE': { prefix: '46', length: 9 },
  'CH': { prefix: '41', length: 9 },
  'BE': { prefix: '32', length: 9 },
  'NO': { prefix: '47', length: 8 },
  'FI': { prefix: '358', length: 9 },
  'DK': { prefix: '45', length: 8 },
  'IE': { prefix: '353', length: 9 },
  'PT': { prefix: '351', length: 9 },
  'PL': { prefix: '48', length: 9 },
  'GR': { prefix: '30', length: 10 },
  'HU': { prefix: '36', length: 9 },
  'CZ': { prefix: '420', length: 9 },
  'RO': { prefix: '40', length: 9 },
  'CL': { prefix: '56', length: 9 },
  'AR': { prefix: '54', length: 10 },
  'CO': { prefix: '57', length: 10 },
  'MY': { prefix: '60', length: 9 },
  'BD': { prefix: '880', length: 9 },
  'PK': { prefix: '92', length: 9 },
  'LK': { prefix: '94', length: 9 },
}

// 中国号段
const CHINA_SEGMENTS = {
  mobile: ['134', '135', '136', '137', '138', '139', '147', '150', '151', '152', 
           '157', '158', '159', '182', '183', '184', '187', '188', '195', '198'],
  unicom: ['130', '131', '132', '145', '155', '156', '166', '185', '186', '196'],
  telecom: ['133', '149', '153', '173', '177', '180', '181', '189', '190', '191', '193', '199']
}

// 生成n位随机数字
function randomDigits(n: number): string {
  let result = ''
  for (let i = 0; i < n; i++) {
    result += Math.floor(Math.random() * 10).toString()
  }
  return result
}

// 生成手机号（基于网站JavaScript代码逻辑）
function generatePhone(countryCode: string): string {
  if (countryCode === 'CN') {
    // 中国特殊处理 - 随机选择运营商
    const allSegments = [
      ...CHINA_SEGMENTS.mobile,
      ...CHINA_SEGMENTS.unicom,
      ...CHINA_SEGMENTS.telecom
    ]
    const pre = allSegments[Math.floor(Math.random() * allSegments.length)]
    const phone = pre + randomDigits(8)
    return `+(86)${phone}`
  }
  
  if (countryCode === 'SG') {
    // 新加坡特殊处理
    const rule = COUNTRY_RULES['SG']
    const thirdDigit = Math.random() < 0.5 ? '8' : '9'
    const phone = thirdDigit + randomDigits(rule.length - 1)
    return `+(${rule.prefix})${phone}`
  }
  
  // 其他国家
  const rule = COUNTRY_RULES[countryCode]
  if (!rule) {
    // 默认规则
    return `+(0)${randomDigits(10)}`
  }
  
  const phone = randomDigits(rule.length)
  return `+(${rule.prefix})${phone}`
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting phone number generation...')
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 获取数据库中的国家列表
    const { data: countries, error: countriesError } = await supabase
      .from('countries')
      .select('code')
      .eq('is_active', true)
    
    if (countriesError) {
      console.error('Error fetching countries:', countriesError)
      throw countriesError
    }

    // 使用数据库中的国家，如果为空则使用规则中的所有国家
    const countryCodes = countries && countries.length > 0 
      ? countries.map(c => c.code)
      : ['CN', ...Object.keys(COUNTRY_RULES)]
    
    console.log(`Generating phone numbers for ${countryCodes.length} countries`)

    const allPhoneNumbers: { phone_number: string; country_code: string; is_available: boolean }[] = []
    const generatedPerCountry = 100 // 每个国家生成100个号码

    for (const countryCode of countryCodes) {
      const uniqueNumbers = new Set<string>()
      
      // 生成唯一号码
      while (uniqueNumbers.size < generatedPerCountry) {
        const phone = generatePhone(countryCode)
        uniqueNumbers.add(phone)
      }

      // 添加到列表
      for (const phone of uniqueNumbers) {
        allPhoneNumbers.push({
          phone_number: phone,
          country_code: countryCode,
          is_available: true
        })
      }

      console.log(`Generated ${uniqueNumbers.size} phone numbers for ${countryCode}`)
    }

    console.log(`Total phone numbers to insert: ${allPhoneNumbers.length}`)

    // 批量插入（每批500个）
    const batchSize = 500
    let insertedCount = 0
    const errors: string[] = []

    for (let i = 0; i < allPhoneNumbers.length; i += batchSize) {
      const batch = allPhoneNumbers.slice(i, i + batchSize)
      
      const { error: insertError } = await supabase
        .from('phone_numbers')
        .insert(batch)

      if (insertError) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, insertError)
        errors.push(insertError.message)
      } else {
        insertedCount += batch.length
        console.log(`Inserted batch ${i / batchSize + 1}, total: ${insertedCount}`)
      }
    }

    const result = {
      success: true,
      message: `Successfully generated ${allPhoneNumbers.length} phone numbers for ${countryCodes.length} countries`,
      totalGenerated: allPhoneNumbers.length,
      countriesCount: countryCodes.length,
      errors: errors.length > 0 ? errors : undefined
    }

    console.log('Generation completed:', result)

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    console.error('Error in generate-phone-numbers function:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})
