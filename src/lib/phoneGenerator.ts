// 各国手机号格式和区号配置
const countryPhoneConfig: { [key: string]: { prefix: string; length: number } } = {
  CN: { prefix: '+86', length: 11 },  // 中国
  US: { prefix: '+1', length: 10 },   // 美国
  GB: { prefix: '+44', length: 10 },  // 英国
  DE: { prefix: '+49', length: 10 },  // 德国
  FR: { prefix: '+33', length: 9 },   // 法国
  JP: { prefix: '+81', length: 10 },  // 日本
  KR: { prefix: '+82', length: 10 },  // 韩国
  RU: { prefix: '+7', length: 10 },   // 俄罗斯
  IN: { prefix: '+91', length: 10 },  // 印度
  BR: { prefix: '+55', length: 11 },  // 巴西
  AU: { prefix: '+61', length: 9 },   // 澳大利亚
  CA: { prefix: '+1', length: 10 },   // 加拿大
  IT: { prefix: '+39', length: 10 },  // 意大利
  ES: { prefix: '+34', length: 9 },   // 西班牙
  MX: { prefix: '+52', length: 10 },  // 墨西哥
  ID: { prefix: '+62', length: 10 },  // 印度尼西亚
  TR: { prefix: '+90', length: 10 },  // 土耳其
  SA: { prefix: '+966', length: 9 },  // 沙特阿拉伯
  AE: { prefix: '+971', length: 9 },  // 阿联酋
  TH: { prefix: '+66', length: 9 },   // 泰国
  VN: { prefix: '+84', length: 9 },   // 越南
  PH: { prefix: '+63', length: 10 },  // 菲律宾
  MY: { prefix: '+60', length: 9 },   // 马来西亚
  SG: { prefix: '+65', length: 8 },   // 新加坡
  HK: { prefix: '+852', length: 8 },  // 香港
  TW: { prefix: '+886', length: 9 },  // 台湾
  NL: { prefix: '+31', length: 9 },   // 荷兰
  PL: { prefix: '+48', length: 9 },   // 波兰
  SE: { prefix: '+46', length: 9 },   // 瑞典
  NO: { prefix: '+47', length: 8 },   // 挪威
  DK: { prefix: '+45', length: 8 },   // 丹麦
  FI: { prefix: '+358', length: 9 },  // 芬兰
  CH: { prefix: '+41', length: 9 },   // 瑞士
  AT: { prefix: '+43', length: 10 },  // 奥地利
  BE: { prefix: '+32', length: 9 },   // 比利时
  PT: { prefix: '+351', length: 9 },  // 葡萄牙
  GR: { prefix: '+30', length: 10 },  // 希腊
  CZ: { prefix: '+420', length: 9 },  // 捷克
  RO: { prefix: '+40', length: 10 },  // 罗马尼亚
  HU: { prefix: '+36', length: 9 },   // 匈牙利
  IE: { prefix: '+353', length: 9 },  // 爱尔兰
  NZ: { prefix: '+64', length: 9 },   // 新西兰
  ZA: { prefix: '+27', length: 9 },   // 南非
  EG: { prefix: '+20', length: 10 },  // 埃及
  NG: { prefix: '+234', length: 10 }, // 尼日利亚
  KE: { prefix: '+254', length: 9 },  // 肯尼亚
  AR: { prefix: '+54', length: 10 },  // 阿根廷
  CL: { prefix: '+56', length: 9 },   // 智利
  CO: { prefix: '+57', length: 10 },  // 哥伦比亚
  PE: { prefix: '+51', length: 9 },   // 秘鲁
  UA: { prefix: '+380', length: 9 },  // 乌克兰
  IL: { prefix: '+972', length: 9 },  // 以色列
  PK: { prefix: '+92', length: 10 },  // 巴基斯坦
  BD: { prefix: '+880', length: 10 }, // 孟加拉
};

// 中国手机号前缀（真实运营商号段）
const cnPrefixes = [
  '130', '131', '132', '133', '134', '135', '136', '137', '138', '139',
  '150', '151', '152', '153', '155', '156', '157', '158', '159',
  '170', '171', '172', '173', '175', '176', '177', '178',
  '180', '181', '182', '183', '184', '185', '186', '187', '188', '189',
  '191', '193', '195', '196', '197', '198', '199'
];

// 生成随机数字
function generateRandomDigits(length: number): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10).toString();
  }
  return result;
}

// 生成单个手机号
function generatePhoneNumber(countryCode: string): string {
  const config = countryPhoneConfig[countryCode.toUpperCase()] || { prefix: '+1', length: 10 };
  
  if (countryCode.toUpperCase() === 'CN') {
    // 中国号码使用真实号段
    const prefix = cnPrefixes[Math.floor(Math.random() * cnPrefixes.length)];
    const suffix = generateRandomDigits(8);
    return `${config.prefix} ${prefix}${suffix}`;
  }
  
  // 其他国家
  const number = generateRandomDigits(config.length);
  return `${config.prefix} ${number}`;
}

// 为指定国家生成100个手机号（带缓存）
const phoneNumberCache: { [key: string]: string[] } = {};

export function getPhoneNumbersForCountry(countryCode: string): string[] {
  const code = countryCode.toUpperCase();
  
  if (!phoneNumberCache[code]) {
    const numbers: string[] = [];
    for (let i = 0; i < 100; i++) {
      numbers.push(generatePhoneNumber(code));
    }
    phoneNumberCache[code] = numbers;
  }
  
  return phoneNumberCache[code];
}

// 获取一个随机手机号
export function getRandomPhoneNumber(countryCode: string): string {
  const numbers = getPhoneNumbersForCountry(countryCode);
  const index = Math.floor(Math.random() * numbers.length);
  return numbers[index];
}

// 获取国家区号
export function getCountryPrefix(countryCode: string): string {
  const config = countryPhoneConfig[countryCode.toUpperCase()];
  return config?.prefix || '+1';
}
