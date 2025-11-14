export function codeDescription(code?: number) {
  const map: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Freezing drizzle",
    57: "Freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Freezing rain",
    67: "Freezing rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    77: "Snow grains",
    80: "Rain showers",
    81: "Rain showers",
    82: "Rain showers",
    85: "Snow showers",
    86: "Snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Thunderstorm with hail",
  };
  return map[code ?? -1] ?? "Unknown";
}

export function gradientForCode(code?: number) {
  if (code === undefined) return "from-slate-400 via-slate-500 to-slate-700";
  if ([0, 1].includes(code)) return "from-sky-400 via-blue-400 to-indigo-500"; // clear
  if ([2, 3, 45, 48].includes(code)) return "from-zinc-400 via-gray-500 to-slate-600"; // clouds/fog
  if ([61, 63, 65, 80, 81, 82].includes(code)) return "from-blue-700 via-indigo-700 to-purple-700"; // rain
  if ([71, 73, 75, 85, 86, 77].includes(code)) return "from-cyan-300 via-sky-300 to-blue-400"; // snow
  if ([95, 96, 99].includes(code)) return "from-yellow-500 via-orange-600 to-red-700"; // thunder
  return "from-slate-400 via-slate-500 to-slate-700";
}

export function iconForCode(code?: number) {
  if (code === undefined) return "/icons/cloud.svg";
  if ([0, 1].includes(code)) return "/icons/sun.svg";
  if ([2, 3].includes(code)) return "/icons/cloud.svg";
  if ([45, 48].includes(code)) return "/icons/fog.svg";
  if ([61, 63, 65, 80, 81, 82].includes(code)) return "/icons/rain.svg";
  if ([71, 73, 75, 85, 86, 77].includes(code)) return "/icons/snow.svg";
  if ([95, 96, 99].includes(code)) return "/icons/storm.svg";
  return "/icons/cloud.svg";
}