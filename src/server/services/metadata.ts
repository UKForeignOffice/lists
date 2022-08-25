import { QuestionData } from "server/components/lists";

export const legalPracticeAreasList = [
  "Bankruptcy",
  "Corporate",
  "Criminal",
  "Employment",
  "Family",
  "Health",
  "Immigration",
  "Intellectual property",
  "International",
  "Maritime",
  "Personal injury",
  "Real estate",
  "Tax",
];

export const countriesList = [
  { text: "Afghanistan", value: "Afghanistan", code: "AFG" },
  { text: "Albania", value: "Albania", code: "ALB" },
  { text: "Algeria", value: "Algeria", code: "DZA" },
  { text: "American Samoa", value: "American Samoa", code: "ASM" },
  { text: "Andorra", value: "Andorra", code: "AND" },
  { text: "Angola", value: "Angola", code: "AGO" },
  { text: "Anguilla", value: "Anguilla", code: "AIA" },
  { text: "Antigua and Barbuda", value: "Antigua and Barbuda", code: "ATG" },
  { text: "Argentina", value: "Argentina", code: "ARG" },
  { text: "Armenia", value: "Armenia", code: "ARM" },
  { text: "Aruba", value: "Aruba", code: "ABW" },
  { text: "Australia", value: "Australia", code: "AUS" },
  { text: "Austria", value: "Austria", code: "AUT" },
  { text: "Azerbaijan", value: "Azerbaijan", code: "AZE" },
  { text: "Bahamas", value: "Bahamas", code: "BHS" },
  { text: "Bahrain", value: "Bahrain", code: "BHR" },
  { text: "Bangladesh", value: "Bangladesh", code: "BGD" },
  { text: "Barbados", value: "Barbados", code: "BRB" },
  { text: "Belarus", value: "Belarus", code: "BLR" },
  { text: "Belgium", value: "Belgium", code: "BEL" },
  { text: "Belize", value: "Belize", code: "BLZ" },
  { text: "Benin", value: "Benin", code: "BEN" },
  { text: "Bermuda", value: "Bermuda", code: "BMU" },
  { text: "Bhutan", value: "Bhutan", code: "BTN" },
  { text: "Bolivia", value: "Bolivia", code: "BOL" },
  {
    text: "Bonaire, Sint Eustatius and Saba",
    value: "Bonaire,  Sint Eustatius and Saba",
    code: "BES",
  },
  {
    text: "Bosnia and Herzegovina",
    value: "Bosnia and Herzegovina",
    code: "BIH",
  },
  { text: "Botswana", value: "Botswana", code: "BWA" },
  { text: "Brazil", value: "Brazil", code: "BRA" },
  {
    text: "British Indian Ocean Territory",
    value: "British Indian Ocean Territory",
    code: "IOT",
  },
  {
    text: "British Virgin Islands",
    value: "British Virgin Islands",
    code: "VGB",
  },
  { text: "Brunei", value: "Brunei", code: "BRN" },
  { text: "Bulgaria", value: "Bulgaria", code: "BGR" },
  { text: "Burkina Faso", value: "Burkina Faso", code: "BFA" },
  { text: "Myanmar", value: "Myanmar", code: "MMR" },
  { text: "Burundi", value: "Burundi", code: "BDI" },
  { text: "Cambodia", value: "Cambodia", code: "KHM" },
  { text: "Cameroon", value: "Cameroon", code: "CMR" },
  { text: "Canada", value: "Canada", code: "CAN" },
  { text: "Cape Verde", value: "Cape Verde", code: "CPV" },
  { text: "Cayman Islands", value: "Cayman Islands", code: "CYM" },
  {
    text: "Central African Republic",
    value: "Central African Republic",
    code: "CAF",
  },
  { text: "Chad", value: "Chad", code: "TCD" },
  { text: "Chile", value: "Chile", code: "CHL" },
  { text: "China", value: "China", code: "CHN" },
  { text: "Colombia", value: "Colombia", code: "COL" },
  { text: "Comoros", value: "Comoros", code: "COM" },
  { text: "Congo", value: "Congo", code: "COG" },
  {
    text: "Congo, Democratic Republic",
    value: "Congo, Democratic Republic",
    code: "COD",
  },
  { text: "Cook Islands", value: "Cook Islands", code: "COK" },
  { text: "Costa Rica", value: "Costa Rica", code: "CRI" },
  {
    text: "Côte d'Ivoire",
    value: "Côte d'Ivoire",
    code: "CIV",
  },
  { text: "Croatia", value: "Croatia", code: "HRV" },
  { text: "Cuba", value: "Cuba", code: "CUB" },
  { text: "Curaçao", value: "Curaçao", code: "CUW" },
  { text: "Cyprus", value: "Cyprus", code: "CYP" },
  { text: "Northern Cyprus", value: "Northern Cyprus", code: "CYP" },
  { text: "Czech Republic", value: "Czech Republic", code: "CZE" },
  { text: "Denmark", value: "Denmark", code: "DNK" },
  { text: "Djibouti", value: "Djibouti", code: "DJI" },
  { text: "Dominica", value: "Dominica", code: "DMA" },
  { text: "Dominican Republic", value: "Dominican Republic", code: "DOM" },
  { text: "Ecuador", value: "Ecuador", code: "ECU" },
  { text: "Egypt", value: "Egypt", code: "EGY" },
  { text: "El Salvador", value: "El Salvador", code: "SLV" },
  { text: "Equatorial Guinea", value: "Equatorial Guinea", code: "GNQ" },
  { text: "Eritrea", value: "Eritrea", code: "ERI" },
  { text: "Estonia", value: "Estonia", code: "EST" },
  { text: "Ethiopia", value: "Ethiopia", code: "ETH" },
  { text: "Falkland Islands", value: "Falkland Islands", code: "FLK" },
  { text: "Fiji", value: "Fiji", code: "VGB" },
  { text: "Finland", value: "Finland", code: "FJI" },
  { text: "France", value: "France", code: "FRA" },
  { text: "French Guiana", value: "French Guiana", code: "GUF" },
  { text: "French Polynesia", value: "French Polynesia", code: "PYF" },
  { text: "Gabon", value: "Gabon", code: "GAB" },
  { text: "Gambia", value: "Gambia", code: "GMB" },
  { text: "Georgia", value: "Georgia", code: "GEO" },
  { text: "Germany", value: "Germany", code: "DEU" },
  { text: "Ghana", value: "Ghana", code: "GHA" },
  { text: "Gibraltar", value: "Gibraltar", code: "GIB" },
  { text: "Greece", value: "Greece", code: "GRC" },
  { text: "Grenada", value: "Grenada", code: "GRD" },
  { text: "Guadeloupe", value: "Guadeloupe", code: "GLP" },
  { text: "Guatemala", value: "Guatemala", code: "GTM" },
  { text: "Guinea", value: "Guinea", code: "GIN" },
  { text: "Guinea-Bissau", value: "Guinea-Bissau", code: "GNB" },
  { text: "Guyana", value: "Guyana", code: "GUY" },
  { text: "Haiti", value: "Haiti", code: "HTI" },
  { text: "Honduras", value: "Honduras", code: "HND" },
  { text: "Hong Kong", value: "Hong Kong", code: "HKG" },
  { text: "Hungary", value: "Hungary", code: "HUN" },
  { text: "Iceland", value: "Iceland", code: "ISL" },
  { text: "India", value: "India", code: "IND" },
  { text: "Indonesia", value: "Indonesia", code: "IDN" },
  { text: "Iran", value: "Iran", code: "IRN" },
  { text: "Iraq", value: "Iraq", code: "IRQ" },
  { text: "Ireland", value: "Ireland", code: "IRL" },
  { text: "Israel", value: "Israel", code: "ISR" },
  { text: "Italy", value: "Italy", code: "ITA" },
  { text: "Jamaica", value: "Jamaica", code: "JAM" },
  { text: "Japan", value: "Japan", code: "JPN" },
  { text: "Jordan", value: "Jordan", code: "JOR" },
  { text: "Kazakhstan", value: "Kazakhstan", code: "KAZ" },
  { text: "Kenya", value: "Kenya", code: "KEN" },
  { text: "Kiribati", value: "Kiribati", code: "KIR" },
  { text: "Kosovo", value: "Kosovo", code: "XKX" },
  { text: "Kuwait", value: "Kuwait", code: "KWT" },
  { text: "Kyrgyzstan", value: "Kyrgyzstan", code: "KGZ" },
  { text: "Laos", value: "Laos", code: "LAO" },
  { text: "Latvia", value: "Latvia", code: "LVA" },
  { text: "Lebanon", value: "Lebanon", code: "LBN" },
  { text: "Lesotho", value: "Lesotho", code: "LSO" },
  { text: "Liberia", value: "Liberia", code: "LBR" },
  { text: "Libya", value: "Libya", code: "LBY" },
  { text: "Liechtenstein", value: "Liechtenstein", code: "LIE" },
  { text: "Lithuania", value: "Lithuania", code: "LTU" },
  { text: "Luxembourg", value: "Luxembourg", code: "LUX" },
  { text: "Macao", value: "Macao", code: "MAC" },
  { text: "Madagascar", value: "Madagascar", code: "MDG" },
  { text: "Malawi", value: "Malawi", code: "MWI" },
  { text: "Malaysia", value: "Malaysia", code: "MYS" },
  { text: "Maldives", value: "Maldives", code: "MDV" },
  { text: "Mali", value: "Mali", code: "MLI" },
  { text: "Malta", value: "Malta", code: "MLT" },
  { text: "Marshall Islands", value: "Marshall Islands", code: "MHL" },
  { text: "Martinique", value: "Martinique", code: "MTQ" },
  { text: "Mauritania", value: "Mauritania", code: "MRT" },
  { text: "Mauritius", value: "Mauritius", code: "MUS" },
  { text: "Mayotte", value: "Mayotte", code: "MYT" },
  { text: "Mexico", value: "Mexico", code: "MEX" },
  { text: "Micronesia", value: "Micronesia", code: "FSM" },
  { text: "Moldova", value: "Moldova", code: "MDA" },
  { text: "Monaco", value: "Monaco", code: "MCO" },
  { text: "Mongolia", value: "Mongolia", code: "MNG" },
  { text: "Montenegro", value: "Montenegro", code: "MNE" },
  { text: "Montserrat", value: "Montserrat", code: "MSR" },
  { text: "Morocco", value: "Morocco", code: "MAR" },
  { text: "Mozambique", value: "Mozambique", code: "MOZ" },
  { text: "Namibia", value: "Namibia", code: "NAM" },
  { text: "Nauru", value: "Nauru", code: "NRU" },
  { text: "Nepal", value: "Nepal", code: "NPL" },
  { text: "Netherlands", value: "Netherlands", code: "NLD" },
  { text: "New Caledonia", value: "New Caledonia", code: "NCL" },
  { text: "New Zealand", value: "New Zealand", code: "NZL" },
  { text: "Nicaragua", value: "Nicaragua", code: "NIC" },
  { text: "Niger", value: "Niger", code: "NER" },
  { text: "Nigeria", value: "Nigeria", code: "NGA" },
  { text: "Niue", value: "Niue", code: "NIU" },
  { text: "North Korea", value: "North Korea", code: "PRK" },
  { text: "North Macedonia", value: "North Macedonia", code: "MNP" },
  { text: "Norway", value: "Norway", code: "NOR" },
  { text: "Oman", value: "Oman", code: "OMN" },
  { text: "Pakistan", value: "Pakistan", code: "PAK" },
  { text: "Palau", value: "Palau", code: "PLW" },
  { text: "Panama", value: "Panama", code: "PAN" },
  { text: "Papua New Guinea", value: "Papua New Guinea", code: "PNG" },
  { text: "Paraguay", value: "Paraguay", code: "PRY" },
  { text: "Peru", value: "Peru", code: "PER" },
  { text: "Philippines", value: "Philippines", code: "PHL" },
  { text: "Pitcairn Island", value: "Pitcairn Island", code: "PCN" },
  { text: "Poland", value: "Poland", code: "POL" },
  { text: "Portugal", value: "Portugal", code: "PRT" },
  { text: "Qatar", value: "Qatar", code: "QAT" },
  { text: "Réunion", value: "Réunion", code: "REU" },
  { text: "Romania", value: "Romania", code: "ROU" },
  { text: "Russia", value: "Russia", code: "RUS" },
  { text: "Rwanda", value: "Rwanda", code: "RWA" },
  { text: "Saint Barthélemy", value: "Saint Barthélemy", code: "BLM" },
  {
    text: "Saint Helena, Ascension and Tristan da Cunha",
    value: "Saint Helena, Ascension and Tristan da Cunha",
    code: "SHN",
  },
  {
    text: "Saint Kitts and Nevis",
    value: "Saint Kitts and Nevis",
    code: "KNA",
  },
  { text: "Saint Lucia", value: "Saint Lucia", code: "LCA" },
  {
    text: "Saint Vincent and the Grenadines",
    value: "Saint Vincent and the Grenadines",
    code: "VCT",
  },
  { text: "Samoa", value: "Samoa", code: "WSM" },
  { text: "San Marino", value: "San Marino", code: "SMR" },
  {
    text: "São Tomé and Príncipe",
    value: "São Tomé and Príncipe",
    code: "STP",
  },
  { text: "Saudi Arabia", value: "Saudi Arabia", code: "SAU" },
  { text: "Senegal", value: "Senegal", code: "SEN" },
  { text: "Serbia", value: "Serbia", code: "SRB" },
  { text: "Seychelles", value: "Seychelles", code: "SYC" },
  { text: "Sierra Leone", value: "Sierra Leone", code: "SLE" },
  { text: "Singapore", value: "Singapore", code: "SGP" },
  { text: "Slovakia", value: "Slovakia", code: "SVK" },
  { text: "Slovenia", value: "Slovenia", code: "SVN" },
  { text: "Solomon Islands", value: "Solomon Islands", code: "SLB" },
  { text: "Somalia", value: "Somalia", code: "SOM" },
  { text: "Somaliland", value: "Somaliland", code: "SOM" },
  { text: "South Africa", value: "South Africa", code: "ZAF" },
  {
    text: "South Georgia and South Sandwich Islands",
    value: "South Georgia and South Sandwich Islands",
    code: "SGS",
  },
  { text: "South Korea", value: "South Korea", code: "KOR" },
  { text: "South Sudan", value: "South Sudan", code: "SSD" },
  { text: "Spain", value: "Spain", code: "ESP" },
  { text: "Sri Lanka", value: "Sri Lanka", code: "LKA" },
  { text: "St Maarten", value: "St Maarten", code: "SXM" },
  { text: "St Martin", value: "St Martin", code: "MAF" },
  {
    text: "St. Pierre and Miquelon",
    value: "St. Pierre and Miquelon",
    code: "SPM",
  },
  { text: "Sudan", value: "Sudan", code: "SDN" },
  { text: "Suriname", value: "Suriname", code: "SUR" },
  { text: "Eswatini", value: "Eswatini", code: "SWZ" },
  { text: "Sweden", value: "Sweden", code: "SWE" },
  { text: "Switzerland", value: "Switzerland", code: "CHE" },
  { text: "Syria", value: "Syria", code: "SYR" },
  { text: "Taiwan", value: "Taiwan", code: "RWA" },
  { text: "Tajikistan", value: "Tajikistan", code: "RWA" },
  { text: "Tanzania", value: "Tanzania", code: "TWN" },
  { text: "Thailand", value: "Thailand", code: "THA" },
  {
    text: "The Occupied Palestinian Territories",
    value: "The Occupied Palestinian Territories",
    code: "PSE",
  },
  { text: "Timor-Leste", value: "Timor-Leste", code: "TLS" },
  { text: "Togo", value: "Togo", code: "TGO" },
  { text: "Tokelau", value: "Tokelau", code: "TKL" },
  { text: "Tonga", value: "Tonga", code: "TON" },
  { text: "Trinidad and Tobago", value: "Trinidad and Tobago", code: "TTO" },
  { text: "Tunisia", value: "Tunisia", code: "TUN" },
  { text: "Turkey", value: "Turkey", code: "TUR" },
  { text: "Turkmenistan", value: "Turkmenistan", code: "TKM" },
  {
    text: "Turks and Caicos Islands",
    value: "Turks and Caicos Islands",
    code: "TCA",
  },
  { text: "Tuvalu", value: "Tuvalu", code: "TUV" },
  { text: "Uganda", value: "Uganda", code: "UGA" },
  { text: "Ukraine", value: "Ukraine", code: "UKR" },
  { text: "United Arab Emirates", value: "United Arab Emirates", code: "ARE" },
  { text: "United Kingdom", value: "United Kingdom", code: "GBR" },
  { text: "United States", value: "United States", code: "USA" },
  { text: "Uruguay", value: "Uruguay", code: "URY" },
  { text: "Uzbekistan", value: "Uzbekistan", code: "UZB" },
  { text: "Vanuatu", value: "Vanuatu", code: "VUT" },
  { text: "Vatican City", value: "Vatican City", code: "VAT" },
  { text: "Venezuela", value: "Venezuela", code: "VEN" },
  { text: "Vietnam", value: "Vietnam", code: "VNM" },
  {
    text: "Wallis and Futuna Islands",
    value: "Wallis and Futuna Islands",
    code: "WLF",
  },
  { text: "Western Sahara", value: "Western Sahara", code: "ESH" },
  { text: "Yemen", value: "Yemen", code: "YEM" },
  { text: "Zambia", value: "Zambia", code: "ZMB" },
  { text: "Zimbabwe", value: "Zimbabwe", code: "ZWE" },
] as const;

export const fcdoLawyersPagesByCountry = {
  Afghanistan:
    "https://www.gov.uk/government/publications/afghanistan-list-of-lawyers",
  Albania:
    "https://www.gov.uk/government/publications/albania-list-of-lawyers--2",
  Algeria: "https://www.gov.uk/government/publications/algeria-list-of-lawyers",
  Angola: "https://www.gov.uk/government/publications/angola-list-of-lawyers",
  "Antigua and Barbuda":
    "https://www.gov.uk/government/publications/antigua-list-of-lawyers--2",
  Argentina:
    "https://www.gov.uk/government/publications/argentina-list-of-lawyers",
  Armenia: "https://www.gov.uk/government/publications/armenia-list-of-lawyers",
  Australia:
    "https://www.gov.uk/government/publications/australia-list-of-lawyers",
  Austria: "https://www.gov.uk/government/publications/austria-list-of-lawyers",
  Azerbaijan:
    "https://www.gov.uk/government/publications/azerbaijan-list-of-lawyers--2",
  Bahrain: "https://www.gov.uk/government/publications/bahrain-list-of-lawyers",
  Bahamas: "https://www.gov.uk/government/publications/bahamas-list-of-lawyers",
  Bangladesh:
    "https://www.gov.uk/government/publications/bangladesh-list-of-lawyers",
  Barbados:
    "https://www.gov.uk/government/publications/barbados-list-of-lawyers",
  Belarus: "https://www.gov.uk/government/publications/belarus-list-of-lawyers",
  Belgium: "https://www.gov.uk/government/publications/belgium-list-of-lawyers",
  Belize: "https://www.gov.uk/government/publications/belize-list-of-lawyers",
  Bolivia: "https://www.gov.uk/government/publications/bolivia-list-of-lawyers",
  "Bosnia and Herzegovina":
    "https://www.gov.uk/government/publications/bosnia-and-herzegovina-list-of-lawyers",
  Botswana:
    "https://www.gov.uk/government/publications/botswana-list-of-lawyers",
  Brazil: "https://www.gov.uk/government/publications/brazil-list-of-lawyers",
  Brunei: "https://www.gov.uk/government/publications/brunei-list-of-lawyers",
  Bulgaria:
    "https://www.gov.uk/government/publications/bulgaria-list-of-lawyers",
  Myanmar: "https://www.gov.uk/government/publications/myanmar-list-of-lawyers",
  Burundi: "https://www.gov.uk/government/publications/burundi-list-of-lawyers",
  Cambodia:
    "https://www.gov.uk/government/publications/cambodia-list-of-lawyers--2",
  Cameroon:
    "https://www.gov.uk/government/publications/cameroon-list-of-lawyers",
  Canada: "https://www.gov.uk/government/publications/canada-list-of-lawyers",
  "Cape Verde":
    "https://www.gov.uk/government/publications/cape-verde-list-of-lawyers",
  Chile: "https://www.gov.uk/government/publications/chile-list-of-lawyers",
  China: "https://www.gov.uk/government/publications/china-list-of-lawyers",
  Colombia:
    "https://www.gov.uk/government/publications/colombia-list-of-lawyers",
  "Congo, Democratic Republic":
    "https://www.gov.uk/government/publications/democratic-republic-of-congo-list-of-lawyers",
  "Costa Rica":
    "https://www.gov.uk/government/publications/costa-rica-list-of-lawyers",
  "Côte d'Ivoire":
    "https://www.gov.uk/government/publications/cote-divoire-list-of-lawyers",
  Croatia: "https://www.gov.uk/government/publications/croatia-list-of-lawyers",
  Cuba: "https://www.gov.uk/government/publications/cuba-list-of-lawyers--2",
  Cyprus: "https://www.gov.uk/government/publications/cyprus-list-of-lawyers",
  "northern Cyprus":
    "https://www.gov.uk/government/publications/cyprus-list-of-lawyers",
  "Czech Republic":
    "https://www.gov.uk/government/publications/czech-republic-list-of-lawyers",
  Denmark: "https://www.gov.uk/government/publications/denmark-list-of-lawyers",
  Dominica:
    "https://www.gov.uk/government/publications/dominica-list-of-lawyers",
  "Dominican Republic":
    "https://www.gov.uk/government/publications/dominican-republic-list-of-lawyers",
  Ecuador: "https://www.gov.uk/government/publications/ecuador-list-of-lawyers",
  Egypt: "https://www.gov.uk/government/publications/egypt-list-of-lawyers",
  "El Salvador":
    "https://www.gov.uk/government/publications/el-salvador-list-of-lawyers",
  Eritrea: "https://www.gov.uk/government/publications/eritrea-list-of-lawyers",
  Estonia: "https://www.gov.uk/government/publications/estonia-list-of-lawyers",
  Ethiopia:
    "https://www.gov.uk/government/publications/ethiopia-list-of-lawyers",
  Fiji: "https://www.gov.uk/government/publications/fiji-list-of-lawyers",
  Finland: "https://www.gov.uk/government/publications/finland-list-of-lawyers",
  France: "https://www.gov.uk/government/publications/france-list-of-lawyers",
  Gambia: "https://www.gov.uk/government/publications/gambia-list-of-lawyers",
  Georgia: "https://www.gov.uk/government/publications/georgia-list-of-lawyers",
  Germany: "https://www.gov.uk/government/publications/germany-list-of-lawyers",
  Ghana: "https://www.gov.uk/government/publications/ghana-list-of-lawyers",
  "Cayman Islands":
    "https://www.gov.uk/government/publications/grand-cayman-list-of-lawyers",
  Greece: "https://www.gov.uk/government/publications/greece-list-of-lawyers",
  Grenada: "https://www.gov.uk/government/publications/grenada-list-of-lawyers",
  Guatemala:
    "https://www.gov.uk/government/publications/guatemala-list-of-lawyers",
  Guinea: "https://www.gov.uk/government/publications/guinea-list-of-lawyers",
  Guyana:
    "https://www.gov.uk/government/publications/guyana-list-of-lawyers-and-translators",
  Haiti: "https://www.gov.uk/government/publications/haiti-list-of-lawyers",
  Honduras:
    "https://www.gov.uk/government/publications/list-of-lawyers-and-translators-for-honduras",
  "Hong Kong":
    "https://www.gov.uk/government/publications/hong-kong-list-of-lawyers",
  Hungary: "https://www.gov.uk/government/publications/hungary-list-of-lawyers",
  Iceland: "https://www.gov.uk/government/publications/iceland-list-of-lawyers",
  India: "https://www.gov.uk/government/publications/india-list-of-lawyers",
  Indonesia:
    "https://www.gov.uk/government/publications/indonesia-list-of-lawyers",
  Iran: "https://www.gov.uk/government/publications/iran-list-of-lawyers",
  Iraq: "https://www.gov.uk/government/publications/iraq-list-of-lawyers",
  Ireland: "https://www.gov.uk/government/publications/ireland-list-of-lawyers",
  Israel: "https://www.gov.uk/government/publications/israel-list-of-lawyers",
  Italy: "https://www.gov.uk/government/publications/italy-list-of-lawyers",
  Jamaica:
    "https://www.gov.uk/government/publications/list-of-lawyers-in-jamaica",
  Japan: "https://www.gov.uk/government/publications/japan-lawyers",
  Jordan: "https://www.gov.uk/government/publications/jordan-list-of-lawyers",
  Kazakhstan:
    "https://www.gov.uk/government/publications/kazakhstan-list-of-lawyers-translators",
  Kenya: "https://www.gov.uk/government/publications/kenya-list-of-lawyers",
  "North Korea":
    "https://www.gov.uk/government/publications/democratic-peoples-republic-of-korea-list-of-lawyers",
  Kosovo: "https://www.gov.uk/government/publications/kosovo-list-of-lawyers",
  Kuwait: "https://www.gov.uk/government/publications/kuwait-list-of-lawyers",
  Kyrgyzstan:
    "https://www.gov.uk/government/publications/kyrgyzstan-list-of-lawyers-translators",
  Laos: "https://www.gov.uk/government/publications/laos-list-of-lawyers",
  Latvia: "https://www.gov.uk/government/publications/latvia-list-of-lawyers",
  Lebanon: "https://www.gov.uk/government/publications/lebanon-list-of-lawyers",
  Liberia: "https://www.gov.uk/government/publications/liberia-list-of-lawyers",
  Lithuania:
    "https://www.gov.uk/government/publications/lithuania-list-of-lawyers",
  Luxembourg:
    "https://www.gov.uk/government/publications/luxembourg-list-of-lawyers",
  Macao: "https://www.gov.uk/government/publications/macao-list-of-lawyers",
  Madagascar:
    "https://www.gov.uk/government/publications/madagascar-list-of-lawyers",
  Malawi: "https://www.gov.uk/government/publications/malawi-list-of-lawyers",
  Malaysia:
    "https://www.gov.uk/government/publications/malaysia-list-of-lawyers",
  Maldives:
    "https://www.gov.uk/government/publications/maldives-list-of-lawyers",
  Mali: "https://www.gov.uk/government/publications/mali-list-of-lawyers",
  Malta: "https://www.gov.uk/government/publications/malta-list-of-lawyers",
  Mauritius:
    "https://www.gov.uk/government/publications/mauritius-list-of-lawyers",
  Mexico: "https://www.gov.uk/government/publications/mexico-list-of-lawyers",
  Moldova: "https://www.gov.uk/government/publications/moldova-list-of-lawyers",
  Monaco:
    "https://www.gov.uk/government/publications/monaco-list-of-english-speaking-lawyers",
  Mongolia:
    "https://www.gov.uk/government/publications/mongolia-list-of-lawyers",
  Montenegro:
    "https://www.gov.uk/government/publications/montenegro-list-of-lawyers",
  Morocco: "https://www.gov.uk/government/publications/morocco-list-of-lawyers",
  Mozambique:
    "https://www.gov.uk/government/publications/mozambique-list-of-lawyers",
  Namibia: "https://www.gov.uk/government/publications/namibia-list-of-lawyers",
  Nepal: "https://www.gov.uk/government/publications/nepal-list-of-lawyers",
  Netherlands:
    "https://www.gov.uk/government/publications/netherlands-list-of-lawyers",
  "New Zealand":
    "https://www.gov.uk/government/publications/new-zealand-list-of-lawyers",
  Nicaragua:
    "https://www.gov.uk/government/publications/nicaragua-list-of-lawyers",
  Nigeria: "https://www.gov.uk/government/publications/nigeria-list-of-lawyers",
  "North Macedonia":
    "https://www.gov.uk/government/publications/north-macedonia-lawyers",
  Norway: "https://www.gov.uk/government/publications/norway-list-of-lawyers",
  "The Occupied Palestinian Territories":
    "https://www.gov.uk/government/publications/the-occupied-palestinian-territories-list-of-lawyers",
  Pakistan:
    "https://www.gov.uk/government/publications/pakistan-list-of-lawyers",
  Panama: "https://www.gov.uk/government/publications/panama-list-of-lawyers",
  "Papua New Guinea":
    "https://www.gov.uk/government/publications/papua-new-guinea-list-of-lawyers",
  Paraguay:
    "https://www.gov.uk/government/publications/list-of-english-speaking-lawyers-and-translators-in-paraguay",
  Peru: "https://www.gov.uk/government/publications/peru-list-of-lawyers",
  Philippines:
    "https://www.gov.uk/government/publications/philippines-list-of-lawyers",
  Poland: "https://www.gov.uk/government/publications/poland-list-of-lawyers",
  Portugal:
    "https://www.gov.uk/government/publications/portugal-list-of-lawyers",
  Qatar: "https://www.gov.uk/government/publications/qatar-list-of-lawyers",
  Romania: "https://www.gov.uk/government/publications/romania-list-of-lawyers",
  Russia: "https://www.gov.uk/government/publications/russia-list-of-lawyers",
  Rwanda: "https://www.gov.uk/government/publications/rwanda-list-of-lawyers",
  Samoa: "https://www.gov.uk/government/publications/samoa-lawyers-list",
  "Saudi Arabia":
    "https://www.gov.uk/government/publications/saudi-arabia-list-of-lawyers",
  Senegal: "https://www.gov.uk/government/publications/senegal-list-of-lawyers",
  Serbia: "https://www.gov.uk/government/publications/serbia-list-of-lawyers",
  Seychelles:
    "https://www.gov.uk/government/publications/seychelles-list-of-lawyers",
  "Sierra Leone":
    "https://www.gov.uk/government/publications/sierra-leone-list-of-lawyers",
  Singapore:
    "https://www.gov.uk/government/publications/singapore-list-of-lawyers",
  Slovakia:
    "https://www.gov.uk/government/publications/slovakia-list-of-lawyers",
  Slovenia:
    "https://www.gov.uk/government/publications/slovenia-list-of-lawyers",
  "Solomon Islands":
    "https://www.gov.uk/government/publications/solomon-islands-list-of-lawyers",
  Somalia: "https://www.gov.uk/government/publications/somalia-list-of-lawyers",
  "South Africa":
    "https://www.gov.uk/government/publications/south-africa-list-of-lawyers",
  "South Korea":
    "https://www.gov.uk/government/publications/south-korea-list-of-lawyers",
  Spain: "https://www.gov.uk/government/publications/spain-list-of-lawyers",
  "Sri Lanka":
    "https://www.gov.uk/government/publications/sri-lanka-list-of-lawyers",
  "Saint Kitts and Nevis":
    "https://www.gov.uk/government/publications/st-kitts-and-nevis-list-of-lawyers",
  "Saint Lucia":
    "https://www.gov.uk/government/publications/stlucia-list-of-lawyers",
  "Saint Vincent and the Grenadines":
    "https://www.gov.uk/government/publications/st-vincent-list-of-lawyers",
  Sudan: "https://www.gov.uk/government/publications/sudan-list-of-lawyers",
  Suriname: "https://www.gov.uk/government/publications/suriname-lawyers",
  Sweden: "https://www.gov.uk/government/publications/sweden-list-of-lawyers",
  Switzerland:
    "https://www.gov.uk/government/publications/switzerland-list-of-lawyers",
  Liechtenstein:
    "https://www.gov.uk/government/publications/switzerland-list-of-lawyers",
  Taiwan: "https://www.gov.uk/government/publications/taiwan-list-of-lawyers",
  Tajikistan:
    "https://www.gov.uk/government/publications/tajikistan-list-of-lawyers",
  Tanzania:
    "https://www.gov.uk/government/publications/tanzania-list-of-lawyers",
  Thailand:
    "https://www.gov.uk/government/publications/thailand-list-of-lawyers",
  "Trinidad and Tobago":
    "https://www.gov.uk/government/publications/trinidad-and-tobago-list-of-lawyers--2",
  Tunisia: "https://www.gov.uk/government/publications/tunisia-list-of-lawyers",
  Turkey: "https://www.gov.uk/government/publications/turkey-list-of-lawyers",
  Turkmenistan:
    "https://www.gov.uk/government/publications/turkmenistan-list-of-lawyers",
  Uganda: "https://www.gov.uk/government/publications/uganda-list-of-lawyers",
  Ukraine: "https://www.gov.uk/government/publications/ukraine-list-of-lawyers",
  "United Arab Emirates":
    "https://www.gov.uk/government/publications/united-arab-emirates-list-of-lawyers",
  "United States":
    "https://www.gov.uk/government/publications/usa-list-of-lawyers",
  Uruguay: "https://www.gov.uk/government/publications/uruguay-list-of-lawyers",
  Uzbekistan:
    "https://www.gov.uk/government/publications/uzbekistan-list-of-lawyers",
  Vanuatu: "https://www.gov.uk/government/publications/vanuatu-list-of-lawyers",
  Venezuela:
    "https://www.gov.uk/government/publications/venezuela-list-of-lawyers",
  Vietnam:
    "https://www.gov.uk/government/publications/vietnam-lists-of-interpretation-and-translation-companies",
  Yemen: "https://www.gov.uk/government/publications/yemen-list-of-lawyers",
  Zambia: "https://www.gov.uk/government/publications/zambia-list-of-lawyers",
  Zimbabwe:
    "https://www.gov.uk/government/publications/zimbabwe-list-of-lawyers",
  "American Samoa":
    "https://www.gov.uk/world/organisations/british-consulate-general-los-angeles",
  Andorra: "https://www.gov.uk/government/publications/spain-list-of-lawyers",
  Anguilla:
    "https://www.gov.uk/government/publications/antigua-list-of-lawyers--2",
  Aruba: "https://www.gov.uk/world/organisations/british-embassy-the-hague",
  Benin: "https://www.gov.uk/government/publications/benin-lawyers",
  Bhutan:
    "https://www.gov.uk/world/organisations/british-deputy-high-commission-kolkata",
  "Bonaire, Sint Eustatius and Saba":
    "https://www.gov.uk/world/organisations/british-embassy-the-hague",
  "Burkina Faso":
    "https://www.gov.uk/government/publications/burkina-faso-list-of-lawyers",
  "Central African Republic":
    "https://www.gov.uk/government/publications/central-african-republic-list-of-lawyers",
  Chad: "https://www.gov.uk/government/publications/chad-list-of-lawyers--2",
  Comoros:
    "https://www.gov.uk/world/organisations/british-embassy-antananarivo",
  Congo:
    "https://www.gov.uk/government/publications/republic-of-congo-list-of-lawyers",
  Curaçao: "https://www.gov.uk/world/organisations/british-embassy-the-hague",
  Djibouti:
    "https://www.gov.uk/government/publications/djibouti-list-of-lawyers",
  "Equatorial Guinea":
    "https://www.gov.uk/world/organisations/british-high-commission-yaounde",
  "French Guiana":
    "https://www.gov.uk/world/organisations/british-embassy-paris",
  "French Polynesia":
    "https://www.gov.uk/government/world/organisations/british-high-commission-wellington",
  Gabon: "https://www.gov.uk/government/publications/list-of-lawyers-in-gabon",
  Guadeloupe: "https://www.gov.uk/world/organisations/british-embassy-paris",
  "Guinea-Bissau":
    "https://www.gov.uk/world/organisations/british-embassy-dakar",
  Kiribati:
    "https://www.gov.uk/world/organisations/british-high-commission-suva",
  Lesotho: "https://www.gov.uk/government/publications/lesotho-list-of-lawyers",
  Libya:
    "https://www.gov.uk/government/world/organisations/british-embassy-tunis",
  "Marshall Islands":
    "https://www.gov.uk/government/world/organisations/british-high-commission-suva",
  Martinique: "https://www.gov.uk/world/organisations/british-embassy-paris",
  Mauritania:
    "https://www.gov.uk/world/organisations/british-embassy-nouakchott",
  Mayotte: "https://www.gov.uk/world/organisations/british-embassy-paris",
  Micronesia:
    "https://www.gov.uk/government/world/organisations/british-high-commission-suva",
  Nauru:
    "https://www.gov.uk/world/organisations/british-high-commission-honiara",
  "New Caledonia":
    "https://www.gov.uk/government/world/organisations/british-high-commission-wellington",
  Niger: "https://www.gov.uk/government/publications/niger-lawyers",
  Oman: "https://www.gov.uk/government/publications/oman-list-of-lawyers",
  Palau: "https://www.gov.uk/world/organisations/british-embassy-manila",
  "Pitcairn Island":
    "https://www.gov.uk/world/organisations/british-high-commission-wellington",
  Réunion: "https://www.gov.uk/world/organisations/british-embassy-paris",
  "Saint Barthélemy":
    "https://www.gov.uk/world/organisations/british-embassy-paris",
  "São Tomé and Principe":
    "https://www.gov.uk/world/organisations/british-embassy-luanda",
  "South Sudan":
    "https://www.gov.uk/government/publications/south-sudan-lawyers",
  "St Maarten":
    "https://www.gov.uk/world/organisations/british-embassy-the-hague",
  "St Martin":
    "https://www.gov.uk/government/world/organisations/british-embassy-paris",
  "St. Pierre and Miquelon":
    "https://www.gov.uk/government/world/organisations/british-embassy-paris",
  Eswatini:
    "https://www.gov.uk/government/publications/eswatini-list-of-lawyers",
  Syria:
    "https://www.gov.uk/government/world/organisations/british-embassy-beirut",
  "Timor-Leste":
    "https://www.gov.uk/government/world/organisations/british-embassy-jakarta",
  Togo: "https://www.gov.uk/government/publications/togo-lawyers",
  Tonga:
    "https://www.gov.uk/world/organisations/british-high-commission-nukualofa",
  Tuvalu: "https://www.gov.uk/world/organisations/british-high-commission-suva",
  "Wallis and Futuna Islands":
    "https://www.gov.uk/world/organisations/british-embassy-paris",
  "Western Sahara":
    "https://www.gov.uk/world/organisations/british-embassy-rabat",
};

export const fcdoFuneralDirectorsByCountry = {
  Albania:
    "https://www.gov.uk/government/publications/albania-list-of-funeral-directors",
  "Antigua and Barbuda":
    "https://www.gov.uk/government/publications/antigua-list-of-funeral-directors",
  Argentina:
    "https://www.gov.uk/government/publications/argentina-list-of-funeral-directors",
  Armenia:
    "https://www.gov.uk/government/publications/armenia-list-of-funeral-directors",
  Australia:
    "https://www.gov.uk/government/publications/australia-list-of-funeral-directors",
  Austria:
    "https://www.gov.uk/government/publications/austria-list-of-funeral-directors",
  Azerbaijan:
    "https://www.gov.uk/government/publications/azerbaijan-list-of-funeral-directors",
  Bahamas:
    "https://www.gov.uk/government/publications/list-of-funeral-directors-in-bahamas",
  Bahrain:
    "https://www.gov.uk/government/publications/bahrain-list-of-funeral-directors",
  Bangladesh:
    "https://www.gov.uk/government/publications/bangladesh-list-of-funeral-directors-and-repatriation-services-in-bangladesh",
  Barbados:
    "https://www.gov.uk/government/publications/barbados-list-of-funeral-directors",
  Belarus:
    "https://www.gov.uk/government/publications/belarus-list-of-funeral-directors",
  Belgium:
    "https://www.gov.uk/government/publications/belgium-list-of-funeral-directors",
  Belize:
    "https://www.gov.uk/government/publications/belize-list-of-funeral-directors",
  Bolivia:
    "https://www.gov.uk/government/publications/bolivia-list-of-funeral-directors",
  "Bosnia and Herzegovina":
    "https://www.gov.uk/government/publications/bosnia-and-herzegovina-list-of-funeral-directors",
  Botswana:
    "https://www.gov.uk/government/publications/botswana-list-of-funeral-directors",
  Brazil:
    "https://www.gov.uk/government/publications/brazil-list-of-funeral-directors-brazil",
  Bulgaria:
    "https://www.gov.uk/government/publications/bulgaria-list-of-funeral-directors",
  Myanmar:
    "https://www.gov.uk/government/publications/myanmar-list-of-funeral-directors",
  Cambodia:
    "https://www.gov.uk/government/publications/cambodia-list-of-funeral-directors",
  "Cape Verde":
    "https://www.gov.uk/government/publications/cape-verde-list-of-funeral-directors",
  Chile:
    "https://www.gov.uk/government/publications/chile-local-funeral-directors",
  China:
    "https://www.gov.uk/government/publications/list-of-funeral-directors-in-china",
  Colombia:
    "https://www.gov.uk/government/publications/colombia-list-of-funeral-directors",
  "Costa Rica":
    "https://www.gov.uk/government/publications/costa-rica-list-of-funeral-directors",
  "Côte d'Ivoire":
    "https://www.gov.uk/government/publications/cote-divoire-list-of-funeral-directors",
  Croatia:
    "https://www.gov.uk/government/publications/funeral-directors-list-croatia",
  Cuba: "https://www.gov.uk/government/publications/cuba-list-of-funeral-directors",
  Cyprus:
    "https://www.gov.uk/government/publications/cyprus-north-bereavement-information",
  "Czech Republic":
    "https://www.gov.uk/government/publications/czech-republic-list-of-funeral-directors",
  "Democratic People's Republic of Korea":
    "https://www.gov.uk/government/publications/democratic-peoples-republic-of-korea-list-of-funeral-directors",
  Denmark:
    "https://www.gov.uk/government/publications/denmark-list-of-funeral-directors",
  Djibouti:
    "https://www.gov.uk/government/publications/djibouti-list-of-funeral-directors-medical-facilities-and-translators",
  Dominica:
    "https://www.gov.uk/government/publications/dominica-list-of-funeral-directors",
  "Dominican Republic":
    "https://www.gov.uk/government/publications/dominican-republic-list-of-funeral-directors",
  Ecuador:
    "https://www.gov.uk/government/publications/ecuador-list-of-funeral-directors",
  Egypt:
    "https://www.gov.uk/government/publications/egypt-list-of-funeral-directors",
  "El Salvador":
    "https://www.gov.uk/government/publications/list-of-funeral-directors-in-el-salvador",
  Eritrea:
    "https://www.gov.uk/government/publications/eritrea-funeral-directors",
  Estonia:
    "https://www.gov.uk/government/publications/estonia-list-of-funeral-directors",
  Eswatini:
    "https://www.gov.uk/government/publications/eswatini-list-of-funeral-directors",
  Ethiopia:
    "https://www.gov.uk/government/publications/ethiopia-list-of-lawyers",
  Finland:
    "https://www.gov.uk/government/publications/funeral-directors-in-finland",
  Gabon:
    "https://www.gov.uk/government/publications/gabon-list-of-funeral-directors",
  Georgia:
    "https://www.gov.uk/government/publications/georgia-list-of-funeral-directors",
  Germany:
    "https://www.gov.uk/government/publications/germany-list-of-funeral-directors",
  Ghana:
    "https://www.gov.uk/government/publications/ghana-list-of-funeral-directors",
  Greece: "https://www.gov.uk/government/publications/funeral-directors-list",
  Guatemala:
    "https://www.gov.uk/government/publications/list-of-funeral-directors-in-guatemala",
  Guinea:
    "https://www.gov.uk/government/publications/guinea-list-of-funeral-directors",
  Guyana:
    "https://www.gov.uk/government/publications/guyana-list-of-funeral-directors",
  Haiti: "https://www.gov.uk/government/publications/haiti-funeral-directors",
  Honduras:
    "https://www.gov.uk/government/publications/list-of-funeral-directors-in-honduras",
  "Hong Kong":
    "https://www.gov.uk/government/publications/hong-kong-list-of-international-funeral-directors",
  Hungary:
    "https://www.gov.uk/government/publications/hungary-list-of-funeral-directors",
  Iceland:
    "https://www.gov.uk/government/publications/iceland-list-of-funeral-directors",
  India:
    "https://www.gov.uk/government/publications/india-list-of-funeral-directors",
  Indonesia:
    "https://www.gov.uk/government/publications/indonesia-list-of-medical-facilities-and-funeral-directors",
  Iran: "https://www.gov.uk/government/publications/iran-list-of-funeral-directors",
  Iraq: "https://www.gov.uk/government/publications/iraq-funeral-directors",
  Ireland:
    "https://www.gov.uk/government/publications/ireland-list-of-funeral-directors",
  Israel:
    "https://www.gov.uk/government/publications/list-of-funeral-directors-in-israel",
  Italy:
    "https://www.gov.uk/government/publications/italy-list-of-funeral-directors",
  Jamaica:
    "https://www.gov.uk/government/publications/list-of-funeral-directors-in-jamaica",
  Japan:
    "https://www.gov.uk/government/publications/japan-list-of-doctors-and-medical-facilities",
  Jordan:
    "https://www.gov.uk/government/publications/list-of-funeral-directors-in-amman",
  Kazakhstan:
    "https://www.gov.uk/government/publications/kazakhstan-list-of-funeral-directors",
  Kenya:
    "https://www.gov.uk/government/publications/kenya-list-of-funeral-directors",
  Kosovo:
    "https://www.gov.uk/government/publications/kosovo-list-of-funeral-directors",
  Kyrgyzstan:
    "https://www.gov.uk/government/publications/kyrgyzstan-list-of-funeral-directors",
  Latvia:
    "https://www.gov.uk/government/publications/latvia-list-of-funeral-directors",
  Lebanon:
    "https://www.gov.uk/government/publications/lebanon-funeral-directors",
  Lesotho:
    "https://www.gov.uk/government/publications/lesotho-list-of-funeral-directors",
  Cameroon:
    "https://www.gov.uk/government/publications/list-of-funeral-directors-in-cameroon",
  Nepal:
    "https://www.gov.uk/government/publications/list-of-funeral-directors-in-nepal",
  Lithuania:
    "https://www.gov.uk/government/publications/lithuania-list-of-funeral-directors",
  Luxembourg:
    "https://www.gov.uk/government/publications/luxembourg-list-of-funeral-directors",
  Macao:
    "https://www.gov.uk/government/publications/macao-list-of-mortuary-and-funeral-home",
  Madagascar:
    "https://www.gov.uk/government/publications/madagascar-list-of-funeral-directors",
  Malawi:
    "https://www.gov.uk/government/publications/malawi-list-of-funeral-directors",
  Malaysia:
    "https://www.gov.uk/government/publications/malaysia-list-of-funeral-directors",
  Mali: "https://www.gov.uk/government/publications/mali-list-of-funeral-directors",
  Malta:
    "https://www.gov.uk/government/publications/malta-list-of-funeral-directors",
  Mauritius:
    "https://www.gov.uk/government/publications/mauritius-list-of-funeral-directors",
  Mexico:
    "https://www.gov.uk/government/publications/mexico-list-of-funeral-directors",
  Moldova:
    "https://www.gov.uk/government/publications/moldova-list-of-funeral-directors",
  Mongolia:
    "https://www.gov.uk/government/publications/mongolia-list-of-funeral-directors",
  Montenegro:
    "https://www.gov.uk/government/publications/list-of-funeral-directors-in-montenegro",
  Mozambique:
    "https://www.gov.uk/government/publications/mozambique-list-of-funeral-directors",
  Namibia:
    "https://www.gov.uk/government/publications/namibia-list-of-funeral-directors",
  Netherlands:
    "https://www.gov.uk/government/publications/netherlands-list-of-funeral-directors",
  "New Zealand":
    "https://www.gov.uk/government/publications/new-zealand-list-of-medical-facilities-and-funeral-directors",
  Nicaragua:
    "https://www.gov.uk/government/publications/funeral-directors-in-nicaragua",
  Nigeria:
    "https://www.gov.uk/government/publications/nigeria-list-of-funeral-directors",
  "North Korea":
    "https://www.gov.uk/government/publications/democratic-peoples-republic-of-korea-list-of-funeral-directors",
  "North Macedonia":
    "https://www.gov.uk/government/publications/north-macedonia-funeral-directors",
  Norway:
    "https://www.gov.uk/government/publications/norway-list-of-funeral-directors",
  Oman: "https://www.gov.uk/government/publications/oman-funeral-directors",
  Pakistan:
    "https://www.gov.uk/government/publications/pakistan-list-of-funeral-directors",
  Panama: "https://www.gov.uk/government/publications/panama-list-of-lawyers",
  "Papua New Guinea":
    "https://www.gov.uk/government/publications/list-of-funeral-directors-in-papua-new-guinea",
  Paraguay:
    "https://www.gov.uk/government/publications/list-of-funeral-directors-in-paraguay",
  Peru: "https://www.gov.uk/government/publications/peru-list-of-lawyers",
  Philippines:
    "https://www.gov.uk/government/publications/philippines-list-of-funeral-directors",
  Poland:
    "https://www.gov.uk/government/publications/poland-list-of-funeral-directors",
  Portugal:
    "https://www.gov.uk/government/publications/portugal-list-of-funeral-directors",
  "Republic of Congo":
    "https://www.gov.uk/government/publications/list-of-funeral-directors-in-republic-of-congo",
  Romania:
    "https://www.gov.uk/government/publications/funeral-directors-list-romania",
  Russia:
    "https://www.gov.uk/government/publications/russia-list-of-funeral-directors",
  Rwanda: "https://www.gov.uk/government/publications/rwanda-funeral-directors",
  "Saudi Arabia":
    "https://www.gov.uk/government/publications/saudi-arabia-list-of-funeral-directors",
  Senegal:
    "https://www.gov.uk/government/publications/list-of-funeral-parlour-directors",
  Serbia:
    "https://www.gov.uk/government/publications/serbia-list-of-funeral-directors",
  Seychelles:
    "https://www.gov.uk/government/publications/seychelles-list-of-funeral-directors",
  "Sierra Leone":
    "https://www.gov.uk/government/publications/sierra-leone-list-of-funeral-directors",
  Singapore:
    "https://www.gov.uk/government/publications/singapore-list-of-funeral-directors",
  Slovakia:
    "https://www.gov.uk/government/publications/slovakia-list-of-funeral-directors",
  Slovenia:
    "https://www.gov.uk/government/publications/slovenia-list-of-funeral-directors",
  "South Africa":
    "https://www.gov.uk/government/publications/list-of-funeral-directors-south-africa",
  "South Korea":
    "https://www.gov.uk/government/publications/south-korea-list-of-lawyers",
  Spain:
    "https://www.gov.uk/government/publications/spain-list-of-funeral-directors",
  "Sri Lanka":
    "https://www.gov.uk/government/publications/sri-lanka-list-of-funeral-directors",
  "Saint Kitts and Nevis":
    "https://www.gov.uk/government/publications/stkitts-and-nevis-list-of-funeral-directors",
  "Saint Lucia":
    "https://www.gov.uk/government/publications/stlucia-list-of-funeral-directors",
  "Saint Vincent and the Grenadines":
    "https://www.gov.uk/government/publications/stvincent-list-of-funeral-directors",
  Suriname:
    "https://www.gov.uk/government/publications/suriname-list-of-funerals-directors",
  Sweden:
    "https://www.gov.uk/government/publications/sweden-list-of-funeral-directors",
  Switzerland:
    "https://www.gov.uk/government/publications/switzerland-and-liechtenstein-list-of-funeral-directors",
  Liechtenstein:
    "https://www.gov.uk/government/publications/switzerland-and-liechtenstein-list-of-funeral-directors",
  Taiwan:
    "https://www.gov.uk/government/publications/taiwan-list-of-funeral-directors",
  Tajikistan:
    "https://www.gov.uk/government/publications/tajikistan-list-of-funeral-directors",
  Tanzania: "https://www.gov.uk/government/publications/funeral-directors",
  Thailand:
    "https://www.gov.uk/government/publications/thailand-funeral-directors",
  "The Occupied Palestinian Territories":
    "https://www.gov.uk/government/publications/the-occupied-palestinian-territories-list-of-funeral-directors",
  "Trinidad and Tobago":
    "https://www.gov.uk/government/publications/trinidad-and-tobago-list-of-funeral-directors",
  Turkey:
    "https://www.gov.uk/government/publications/turkey-list-of-funeral-directors",
  Turkmenistan:
    "https://www.gov.uk/government/publications/list-of-funeral-directors-in-turkmenistan",
  Uganda:
    "https://www.gov.uk/government/publications/uganda-list-of-funeral-directors",
  Ukraine:
    "https://www.gov.uk/government/publications/list-of-funeral-directors-in-kyiv",
  Uruguay:
    "https://www.gov.uk/government/publications/uruguay-funeral-directors",
  Uzbekistan:
    "https://www.gov.uk/government/publications/uzbekistan-list-of-funeral-directors",
  Venezuela:
    "https://www.gov.uk/government/publications/venezuela-list-of-funeral-directors",
  Vietnam:
    "https://www.gov.uk/government/publications/vietnam-list-of-funeral-directors",
  Zambia:
    "https://www.gov.uk/government/publications/information-about-funeral-directors-in-zambia",
  Zimbabwe:
    "https://www.gov.uk/government/publications/zimbabwe-list-of-funeral-directors",
};

export const fcdoTranslatorsInterpretersByCountry = {
  Albania:

    "https://www.gov.uk/government/publications/albania-list-of-translators",
  Angola: "https://www.gov.uk/government/publications/angola-translators",
  Argentina:

    "https://www.gov.uk/government/publications/argentina-list-of-translators-and-interpreters",
  Armenia: "https://www.gov.uk/government/publications/armenia-list-of-lawyers",
  Austria:

    "https://www.gov.uk/government/publications/austria-list-of-translators-and-interpreters",
  Azerbaijan:

    "https://www.gov.uk/government/publications/azerbaijan-list-of-translators-and-interpreters",
  Bahrain:

    "https://www.gov.uk/government/publications/bahrain-list-of-translators-and-interpreters",
  Bangladesh:

    "https://www.gov.uk/government/publications/bangladesh-list-of-translators",
  Belarus:

    "https://www.gov.uk/government/publications/belarus-list-of-translators-and-interpreters",
  Bolivia:

    "https://www.gov.uk/government/publications/list-of-translators-la-paz",
  "Bosnia and Herzegovina":

    "https://www.gov.uk/government/publications/bosnia-and-herzegovina-list-of-translators-and-interpreters",
  Brazil: "https://www.gov.uk/government/publications/brazil-list-of-lawyers",
  Bulgaria:
    "https://www.gov.uk/government/publications/bulgaria-list-of-translators",
  Myanmar: "https://www.gov.uk/government/publications/myanmar-list-of-lawyers",
  Burundi:
    "https://www.gov.uk/government/publications/burundi-list-of-translatorsinterpreters",
  Cambodia:
    "https://www.gov.uk/government/publications/cambodia-list-of-translators-and-interpreters",
  "Cape Verde":
    "https://www.gov.uk/government/publications/cape-verde-list-of-translators-and-interpreters",
  "Central African Republic":
    "https://www.gov.uk/government/publications/central-african-republic-list-of-translators-and-interpreters",
  Chile:
    "https://www.gov.uk/government/publications/chile-list-of-translators-and-interpreters",
  China: "https://www.gov.uk/government/publications/china-list-of-lawyers",
  "Costa Rica":

    "https://www.gov.uk/government/publications/costa-rica-list-of-translators-and-interpreters",
  "Cote d’Ivoire":

    "https://www.gov.uk/government/publications/cote-divoire-list-of-translators-and-interpreters",
  Croatia:

    "https://www.gov.uk/government/publications/translators-and-interpreters-in-croatia",
  Cuba: "https://www.gov.uk/government/publications/cuba-list-of-translators-and-interpreters",
  Cyprus:

    "https://www.gov.uk/government/publications/cyprus-north-list-of-lawyers",
  "Czech Republic":

    "https://www.gov.uk/government/publications/czech-republic-list-of-translators-and-interpreters",
  "Congo, Democratic Republic":

    "https://www.gov.uk/government/publications/list-of-translators-and-interpreters-in-drc",
  Denmark:

    "https://www.gov.uk/government/publications/denmark-list-of-translators-and-interpreters",
  Djibouti:

    "https://www.gov.uk/government/publications/djibouti-list-of-funeral-directors-medical-facilities-and-translators",
  "Dominican Republic":

    "https://www.gov.uk/government/publications/dominican-republic-list-of-translators",
  Ecuador:

    "https://www.gov.uk/government/publications/ecuador-list-of-translators-and-interpreters",
  "El Salvador":

    "https://www.gov.uk/government/publications/el-salvador-list-of-lawyers",
  Eritrea: "https://www.gov.uk/government/publications/eritrea-list-of-lawyers",
  Estonia:
    "https://www.gov.uk/government/publications/estonia-list-of-translators-and-interpreters",
  Ethiopia:
    "https://www.gov.uk/government/publications/ethiopia-list-of-lawyers",
  Finland:
    "https://www.gov.uk/government/publications/translators-and-interpreters-in-finland",
  France:
    "https://www.gov.uk/government/publications/france-list-of-translators-and-interpreters",
  Gabon:
    "https://www.gov.uk/government/publications/gabon-list-of-translators-and-interpreters",
  Georgia:
    "https://www.gov.uk/government/publications/list-of-interpreters-and-translators-2015",
  Germany:
    "https://www.gov.uk/government/publications/germany-list-of-translators-and-interpreters",
  Greece:
    "https://www.gov.uk/government/publications/translators-and-interpreters-list",
  Guatemala:
    "https://www.gov.uk/government/publications/guatemala-list-of-lawyers",
  Guinea:
    "https://www.gov.uk/government/publications/guinea-list-of-translators-and-interpreters",
  Guyana:
    "https://www.gov.uk/government/publications/guyana-list-of-lawyers-and-translators",
  Honduras:
    "https://www.gov.uk/government/publications/list-of-lawyers-and-translators-for-honduras",
  "Hong Kong":
    "https://www.gov.uk/government/publications/hong-kong-list-of-translators-and-interpreters",
  Hungary:
    "https://www.gov.uk/government/publications/hungary-list-of-translators-and-interpreters",
  Iceland:
    "https://www.gov.uk/government/publications/iceland-list-of-translators-and-interpreters",
  India:
    "https://www.gov.uk/government/publications/india-list-of-translators-and-interpreters",
  Indonesia:
    "https://www.gov.uk/government/publications/indonesia-list-of-lawyers",
  Iran: "https://www.gov.uk/government/publications/iran-list-of-translators",
  Iraq: "https://www.gov.uk/government/publications/iraq-translators-and-interpreters",
  Israel:

    "https://www.gov.uk/government/publications/israel-list-of-translators",
  Italy:

    "https://www.gov.uk/government/publications/italy-list-of-translators-and-interpreters",
  Japan:

    "https://www.gov.uk/government/publications/japan-translators-and-interpreters",
  Jordan:

    "https://www.gov.uk/government/publications/jordan-list-of-translators",
  Kazakhstan:

    "https://www.gov.uk/government/publications/kazakhstan-list-of-translators-and-interpreters",
  Kosovo:

    "https://www.gov.uk/government/publications/kosovo-list-of-translators-and-interpreters",
  Kuwait:

    "https://www.gov.uk/government/publications/british-embassy-kuwait-translators-list",
  Kyrgyzstan:

    "https://www.gov.uk/government/publications/kyrgyzstan-list-of-lawyers-translators",
  Laos: "https://www.gov.uk/government/publications/laos-list-of-lawyers",
  Latvia:

    "https://www.gov.uk/government/publications/latvia-list-of-translators-and-interpreters",
  Lebanon: "https://www.gov.uk/government/publications/lebanon-translators",
  Belgium:

    "https://www.gov.uk/government/publications/list-of-translators-and-interpreters-in-belgium",
  Cameroon:

    "https://www.gov.uk/government/publications/list-of-translators-and-interpreters-in-cameroon",
  Egypt:

    "https://www.gov.uk/government/publications/list-of-translators-and-interpreters-in-egypt",
  Algeria:

    "https://www.gov.uk/government/publications/list-of-translators-in-algeria",
  Lithuania:

    "https://www.gov.uk/government/publications/list-of-english-speaking-lawyers-and-translators",
  Luxembourg:

    "https://www.gov.uk/government/publications/british-embassy-luxembourg-translators",
  Macao:

    "https://www.gov.uk/government/publications/macao-list-of-translators-and-interpreters",
  Madagascar:

    "https://www.gov.uk/government/publications/madagascar-list-of-translatorsinterpreters",
  Malaysia:

    "https://www.gov.uk/government/publications/malaysia-list-of-translators-interpreters",
  Mali: "https://www.gov.uk/government/publications/mali-list-of-translatorsinterpreters",
  Mexico:
    "https://www.gov.uk/government/publications/mexico-list-of-translators-and-interpreters",
  Moldova:
    "https://www.gov.uk/government/publications/moldova-list-of-english-speaking-translatorsinterpreters",
  Mongolia:
    "https://www.gov.uk/government/publications/mongolia-list-of-lawyers",
  Montenegro:
    "https://www.gov.uk/government/publications/list-of-translators-and-interpreters-in-montenegro",
  Morocco:
    "https://www.gov.uk/government/publications/morocco-translators-and-interpreters",
  Mozambique:
    "https://www.gov.uk/government/publications/mozambique-list-of-translators-and-interpreters",
  Namibia:
    "https://www.gov.uk/government/publications/namibia-list-of-translatorsinterpreters",
  Netherlands:
    "https://www.gov.uk/government/publications/netherlands-list-of-translators-and-interpreters",
  Nicaragua:
    "https://www.gov.uk/government/publications/nicaragua-list-of-translators-and-interpreters",
  "North Korea":
    "https://www.gov.uk/government/publications/democratic-peoples-republic-of-korea-list-of-translators",
  "North Macedonia":
    "https://www.gov.uk/government/publications/north-macedonia-translators",
  Norway:
    "https://www.gov.uk/government/publications/norway-list-of-translators-and-interpreters",
  Oman: "https://www.gov.uk/government/publications/oman-list-of-translators",
  Pakistan:

    "https://www.gov.uk/government/publications/pakistan-list-of-translators-and-interpreters",
  Panama: "https://www.gov.uk/government/publications/panama-list-of-lawyers",
  Paraguay:

    "https://www.gov.uk/government/publications/list-of-translators-and-interpreters-in-paraguay",
  Peru: "https://www.gov.uk/government/publications/peru-list-of-lawyers",
  Philippines:

    "https://www.gov.uk/government/publications/philippines-list-of-translators-and-interpreters",
  Poland:

    "https://www.gov.uk/government/publications/poland-list-of-translators-and-interpreters",
  Portugal:

    "https://www.gov.uk/government/publications/portugal-list-of-translators-and-interpreters",
  Qatar: "https://www.gov.uk/government/publications/qatar-list-of-lawyers",
  Congo:
    "https://www.gov.uk/government/publications/list-of-translators-and-interpreters-in-the-republic-of-congo",
  Romania:
    "https://www.gov.uk/government/publications/translators-and-interpreters-list-romania",
  Russia:
    "https://www.gov.uk/government/publications/russia-list-of-translators-and-interpreters",
  Rwanda:
    "https://www.gov.uk/government/publications/rwanda-list-of-translators-interpreters",
  "Saudi Arabia":
    "https://www.gov.uk/government/publications/saudi-arabia-list-of-lawyers",
  Senegal:
    "https://www.gov.uk/government/publications/list-of-recommended-translators-and-interpreters",
  Serbia:
    "https://www.gov.uk/government/publications/list-of-translators-and-interpreters-in-serbia",
  Singapore:
    "https://www.gov.uk/government/publications/singapore-list-of-translators-and-interpreters",
  Slovakia:
    "https://www.gov.uk/government/publications/slovakia-list-of-translators-and-interpreters",
  Slovenia:
    "https://www.gov.uk/government/publications/slovenia-list-of-translators-and-interpreters",
  Somalia:
    "https://www.gov.uk/government/publications/somalia-translators-and-interpreters",
  "South Africa":
    "https://www.gov.uk/government/publications/south-africa-list-of-translators",
  "South Korea":
    "https://www.gov.uk/government/publications/south-korea-list-of-lawyers",
  Spain:
    "https://www.gov.uk/government/publications/spain-list-of-translators-and-interpreters",
  Sudan:
    "https://www.gov.uk/government/publications/list-of-translation-centres-in-khartoum",
  Sweden:
    "https://www.gov.uk/government/publications/sweden-list-of-translators-and-interpreters",
  Switzerland:
    "https://www.gov.uk/government/publications/switzerland-list-of-translators-and-interpreters",
  Taiwan:
    "https://www.gov.uk/government/publications/taiwan-list-of-translators-and-interpreters",
  Tajikistan:
    "https://www.gov.uk/government/publications/tajikistan-list-of-translators",
  Tanzania:
    "https://www.gov.uk/government/publications/list-of-translators-interpreters",
  Thailand:
    "https://www.gov.uk/government/publications/thailand-translators-and-interpreters",
  "The Occupied Palestinian Territories":
    "https://www.gov.uk/government/publications/the-occupied-palestinian-territories-list-of-lawyers",
  Turkey:
    "https://www.gov.uk/government/publications/turkey-list-of-translators-and-interpreters",
  Turkmenistan:
    "https://www.gov.uk/government/publications/turkmenistan-list-of-translators",
  Ukraine:
    "https://www.gov.uk/government/publications/ukraine-list-of-interpreters",
  "United Arab Emirates":
    "https://www.gov.uk/government/publications/united-arab-emirates-list-of-translators",
  Uruguay:
    "https://www.gov.uk/government/publications/uruguay-list-of-interpreters-and-translators",
  Uzbekistan:
    "https://www.gov.uk/government/publications/uzbekistan-list-of-translators-and-interpreters",
  Vietnam:
    "https://www.gov.uk/government/publications/vietnam-lists-of-interpretation-and-translation-companies",
};

export const listOfCountriesWithLegalAid = [
  // based on https://www.gov.uk/legal-aid/legal-problems-abroad
  "Albania",
  "Austria",
  "Azerbaijan",
  "Belgium",
  "Bosnia and Herzegovina",
  "Bulgaria",
  "Cyprus",
  "northern Cyprus",
  "Czech Republic",
  "Denmark",
  "Estonia",
  "Finland",
  "France",
  "Georgia",
  "Greece",
  "Ireland",
  "Italy",
  "Latvia",
  "Lithuania",
  "Luxembourg",
  "Montenegro",
  "Netherlands",
  "North Macedonia",
  "Norway",
  "Poland",
  "Portugal",
  "Romania",
  "Serbia",
  "Spain",
  "Sweden",
  "Switzerland",
  "Turkey",
  "Ukraine",
];

export const languages: Record<string, string> = {
  aa: "Afar",
  ab: "Abkhazian",
  ae: "Avestan",
  af: "Afrikaans",
  ak: "Akan",
  am: "Amharic",
  an: "Aragonese",
  ar: "Arabic",
  as: "Assamese",
  av: "Avaric",
  ay: "Aymara",
  az: "Azerbaijani",
  ba: "Bashkir",
  be: "Belarusian",
  bg: "Bulgarian",
  bh: "Bihari languages",
  bi: "Bislama",
  bm: "Bambara",
  bn: "Bengali",
  bo: "Tibetan",
  br: "Breton",
  bs: "Bosnian",
  ca: "Catalan; Valencian",
  ce: "Chechen",
  ch: "Chamorro",
  co: "Corsican",
  cr: "Cree",
  cs: "Czech",
  cu: "Church Slavic; Old Slavonic; Church Slavonic; Old Bulgarian; Old Church Slav,",
  cv: "Chuvash",
  cy: "Welsh",
  da: "Danish",
  de: "German",
  dv: "Divehi; Dhivehi; Maldivian",
  dz: "Dzongkha",
  ee: "Ewe",
  el: "Greek, Modern (1453-)",
  eo: "Esperanto",
  es: "Spanish; Castilian",
  et: "Estonian",
  eu: "Basque",
  fa: "Persian",
  ff: "Fulah",
  fi: "Finnish",
  fj: "Fijian",
  fo: "Faroese",
  fr: "French",
  fy: "Western Frisian",
  ga: "Irish",
  gd: "Gaelic; Scottish Gaelic",
  gl: "Galician",
  gn: "Guarani",
  gu: "Gujarati",
  gv: "Manx",
  ha: "Hausa",
  he: "Hebrew",
  hi: "Hindi",
  ho: "Hiri Motu",
  hr: "Croatian",
  ht: "Haitian; Haitian Creole",
  hu: "Hungarian",
  hy: "Armenian",
  hz: "Herero",
  ia: "Interlingua (International Auxiliary Language Association)",
  id: "Indonesian",
  ie: "Interlingue; Occidental",
  ig: "Igbo",
  ii: "Sichuan Yi; Nuosu",
  ik: "Inupiaq",
  io: "Ido",
  is: "Icelandic",
  it: "Italian",
  iu: "Inuktitut",
  ja: "Japanese",
  jv: "Javanese",
  ka: "Georgian",
  kg: "Kongo",
  ki: "Kikuyu; Gikuyu",
  kj: "Kuanyama; Kwanyama",
  kk: "Kazakh",
  kl: "Kalaallisut; Greenlandic",
  km: "Central Khmer",
  kn: "Kannada",
  ko: "Korean",
  kr: "Kanuri",
  ks: "Kashmiri",
  ku: "Kurdish",
  kv: "Komi",
  kw: "Cornish",
  ky: "Kirghiz; Kyrgyz",
  la: "Latin",
  lb: "Luxembourgish; Letzeburgesch",
  lg: "Ganda",
  li: "Limburgan; Limburger; Limburgish",
  ln: "Lingala",
  lo: "Lao",
  lt: "Lithuanian",
  lu: "Luba-Katanga",
  lv: "Latvian",
  mg: "Malagasy",
  mh: "Marshallese",
  mi: "Maori",
  mk: "Macedonian",
  ml: "Malayalam",
  mn: "Mongolian",
  mr: "Marathi",
  ms: "Malay",
  mt: "Maltese",
  my: "Burmese",
  na: "Nauru",
  nb: "Bokmål, Norwegian; Norwegian Bokmål",
  nd: "Ndebele, North; North Ndebele",
  ne: "Nepali",
  ng: "Ndonga",
  nl: "Dutch; Flemish",
  nn: "Norwegian Nynorsk; Nynorsk, Norwegian",
  no: "Norwegian",
  nr: "Ndebele, South; South Ndebele",
  nv: "Navajo; Navaho",
  ny: "Chichewa; Chewa; Nyanja",
  oc: "Occitan (post 1500)",
  oj: "Ojibwa",
  om: "Oromo",
  or: "Oriya",
  os: "Ossetian; Ossetic",
  pa: "Panjabi; Punjabi",
  pi: "Pali",
  pl: "Polish",
  ps: "Pushto; Pashto",
  pt: "Portuguese",
  qu: "Quechua",
  rm: "Romansh",
  rn: "Rundi",
  ro: "Romanian; Moldavian; Moldovan",
  ru: "Russian",
  rw: "Kinyarwanda",
  sa: "Sanskrit",
  sc: "Sardinian",
  sd: "Sindhi",
  se: "Northern Sami",
  sg: "Sango",
  si: "Sinhala; Sinhalese",
  sk: "Slovak",
  sl: "Slovenian",
  sm: "Samoan",
  sn: "Shona",
  so: "Somali",
  sq: "Albanian",
  sr: "Serbian",
  ss: "Swati",
  st: "Sotho, Southern",
  su: "Sundanese",
  sv: "Swedish",
  sw: "Swahili",
  ta: "Tamil",
  te: "Telugu",
  tg: "Tajik",
  th: "Thai",
  ti: "Tigrinya",
  tk: "Turkmen",
  tl: "Tagalog",
  tn: "Tswana",
  to: "Tonga (Tonga Islands)",
  tr: "Turkish",
  ts: "Tsonga",
  tt: "Tatar",
  tw: "Twi",
  ty: "Tahitian",
  ug: "Uighur; Uyghur",
  uk: "Ukrainian",
  ur: "Urdu",
  uz: "Uzbek",
  ve: "Venda",
  vi: "Vietnamese",
  vo: "Volapük",
  wa: "Walloon",
  wo: "Wolof",
  xh: "Xhosa",
  yi: "Yiddish",
  yo: "Yoruba",
  za: "Zhuang; Chuang",
  zh: "Chinese",
  zu: "Zulu",
};

export const translationInterpretationServices: QuestionData[] = [
  {
    text: "Translation of written content",
    value: "translation",
  },
  {
    text: "Interpretation of spoken language",
    value: "interpretation",
  },,
];

export const translationSpecialties: QuestionData[] = [
  {
    text: "Legal",
    value: "Legal",
    description:

      "e.g. real estate, visas, death certificates, notary documents",
  },
  {
    text: "Medical",
    value: "Medical",
    description: "e.g. medical records, autopsy reports",
  },
  {
    text: "Events",
    value: "Events",
    description: "e.g. weddings, conferences",
  },
  {
    text: "Publishing",
    value: "Publishing",
    description: "e.g. scientific, technical, medical, educational, fictional",
  },
  {
    text: "Business and commercial",
    value: "Business and commercial",
    description: "e.g. contracts, transcripts, documents",
  },
  {
    text: "Digital media",
    value: "Digital media",
    description: "e.g. subtitling, captioning, voiceovers, dubbing",
  },
  {
    text: "General translation ",
    value: "General translation",
    description: " e.g. informal, personal text",
  },,
];

export const interpretationServices: QuestionData[] = [
  {
    text: "Medical assistance",
    value: "Medical assistance",
    description: "e.g. hospitalisations, doctors surgeries",
  },
  {
    text: "Police and local authorities",
    value: "Police and local authorities",
    description: "e.g. arrests, immigration",
  },
  {
    text: "Courts and legal",
    value: "Courts and legal",
    description: "e.g. hearings, trials",
  },
  {
    text: "Events",
    value: "Events",
    description: "e.g. conferences, weddings",
  },
  {
    text: "Media and communications",
    value: "Media and communications",
    description: "e.g. TV, radio",
  },
  {
    text: "Business and commerce",
    value: "Business and commerce",
    description: "e.g. negotiations, meetings",
  },
  {
    text: "General interpretation",
    value: "General interpretation ",
    description: "e.g. informal, conversational",
  },,
];

export const ServicesProvided: Record<string, string> = {
  interpretation: "Interpretation",
  translation: "Translation",
};;
export const AddressDisplay: Record<string, string> = {
  full: "Full address",
  partial: "Town or city only",
};;
export const DeliveryOfServices: Record<string, string> = {
  inPerson: "In person",
  remote: "Remote",
};;
