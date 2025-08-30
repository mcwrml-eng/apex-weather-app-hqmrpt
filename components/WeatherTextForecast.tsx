
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../styles/commonStyles';
import Icon from './Icon';

interface Current {
  temperature: number;
  apparent_temperature: number;
  wind_speed: number;
  wind_direction: number;
  wind_gusts: number;
  humidity: number;
  weather_code: number;
  pressure: number;
  visibility: number;
  uv_index: number;
  dew_point: number;
  cloud_cover: number;
}

interface HourlyData {
  time: string;
  temperature: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
  humidity: number;
  precipitation: number;
  precipitationProbability: number;
  weatherCode: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
  dewPoint: number;
  cloudCover: number;
}

interface Props {
  current: Current | null;
  hourlyData: HourlyData[];
  unit: 'metric' | 'imperial';
  circuitName: string;
  latitude: number;
  longitude: number;
}

function getWeatherCondition(code: number): string {
  const conditions: { [key: number]: string } = {
    0: 'clear skies',
    1: 'mainly clear conditions',
    2: 'partly cloudy skies',
    3: 'overcast conditions',
    45: 'foggy conditions',
    48: 'depositing rime fog',
    51: 'light drizzle',
    53: 'moderate drizzle',
    55: 'dense drizzle',
    61: 'slight rain',
    63: 'moderate rain',
    65: 'heavy rain',
    71: 'slight snow',
    73: 'moderate snow',
    75: 'heavy snow',
    80: 'slight rain showers',
    81: 'moderate rain showers',
    82: 'violent rain showers',
    95: 'thunderstorms',
    96: 'thunderstorms with hail',
    99: 'thunderstorms with heavy hail',
  };
  return conditions[code] || 'variable conditions';
}

function getWindDirection(degrees: number): string {
  const directions = [
    'north', 'north-northeast', 'northeast', 'east-northeast',
    'east', 'east-southeast', 'southeast', 'south-southeast',
    'south', 'south-southwest', 'southwest', 'west-southwest',
    'west', 'west-northwest', 'northwest', 'north-northwest'
  ];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

function getWindStrength(speed: number, unit: 'metric' | 'imperial'): string {
  const threshold = unit === 'metric' ? [10, 25, 40, 60] : [6, 15, 25, 37];
  
  if (speed < threshold[0]) return 'light';
  if (speed < threshold[1]) return 'moderate';
  if (speed < threshold[2]) return 'strong';
  if (speed < threshold[3]) return 'very strong';
  return 'extreme';
}

function getTemperatureDescription(temp: number, unit: 'metric' | 'imperial'): string {
  const thresholds = unit === 'metric' ? 
    { cold: 10, cool: 18, warm: 25, hot: 30 } :
    { cold: 50, cool: 64, warm: 77, hot: 86 };
  
  if (temp < thresholds.cold) return 'cold';
  if (temp < thresholds.cool) return 'cool';
  if (temp < thresholds.warm) return 'comfortable';
  if (temp < thresholds.hot) return 'warm';
  return 'hot';
}

function getHumidityDescription(humidity: number): string {
  if (humidity < 30) return 'dry';
  if (humidity < 60) return 'comfortable';
  if (humidity < 80) return 'humid';
  return 'very humid';
}

function getVisibilityDescription(visibility: number): string {
  const visibilityKm = visibility / 1000;
  if (visibilityKm < 1) return 'very poor visibility';
  if (visibilityKm < 5) return 'poor visibility';
  if (visibilityKm < 10) return 'reduced visibility';
  return 'good visibility';
}

function getUVDescription(uvIndex: number): string {
  if (uvIndex <= 2) return 'low UV levels';
  if (uvIndex <= 5) return 'moderate UV levels';
  if (uvIndex <= 7) return 'high UV levels';
  if (uvIndex <= 10) return 'very high UV levels';
  return 'extreme UV levels';
}

function generateTextForecast(
  current: Current | null,
  hourlyData: HourlyData[],
  unit: 'metric' | 'imperial',
  circuitName: string
): string {
  if (!current || hourlyData.length === 0) {
    return `Weather forecast data is currently unavailable for ${circuitName}. Please check back later for detailed conditions.`;
  }

  const tempUnit = unit === 'metric' ? '°C' : '°F';
  const windUnit = unit === 'metric' ? 'km/h' : 'mph';
  const precipUnit = unit === 'metric' ? 'mm' : 'inches';
  
  // Current conditions
  const currentTemp = Math.round(current.temperature);
  const feelsLike = Math.round(current.apparent_temperature);
  const tempDesc = getTemperatureDescription(current.temperature, unit);
  const condition = getWeatherCondition(current.weather_code);
  
  // Wind analysis
  const windSpeed = Math.round(current.wind_speed);
  const windGusts = Math.round(current.wind_gusts);
  const windDir = getWindDirection(current.wind_direction);
  const windStrength = getWindStrength(current.wind_speed, unit);
  
  // Other conditions
  const humidity = Math.round(current.humidity);
  const humidityDesc = getHumidityDescription(current.humidity);
  const visibilityDesc = getVisibilityDescription(current.visibility);
  const uvDesc = getUVDescription(current.uv_index);
  
  // Next 6 hours analysis
  const next6Hours = hourlyData.slice(0, 6);
  const tempRange = {
    min: Math.round(Math.min(...next6Hours.map(h => h.temperature))),
    max: Math.round(Math.max(...next6Hours.map(h => h.temperature)))
  };
  
  const maxPrecipProb = Math.max(...next6Hours.map(h => h.precipitationProbability));
  const maxWindSpeed = Math.round(Math.max(...next6Hours.map(h => h.windSpeed)));
  const avgHumidity = Math.round(next6Hours.reduce((sum, h) => sum + h.humidity, 0) / next6Hours.length);
  
  // Rain analysis
  const rainHours = next6Hours.filter(h => h.precipitationProbability > 30).length;
  const heavyRainHours = next6Hours.filter(h => h.precipitationProbability > 70).length;
  
  // Generate forecast text
  let forecast = `Current conditions at ${circuitName} show ${condition} with ${tempDesc} temperatures of ${currentTemp}${tempUnit}`;
  
  if (Math.abs(currentTemp - feelsLike) > 3) {
    forecast += `, feeling like ${feelsLike}${tempUnit}`;
  }
  
  forecast += `. `;
  
  // Wind conditions
  if (windSpeed > 5) {
    forecast += `${windStrength.charAt(0).toUpperCase() + windStrength.slice(1)} ${windDir} winds at ${windSpeed}${windUnit}`;
    if (windGusts > windSpeed + 5) {
      forecast += ` with gusts up to ${windGusts}${windUnit}`;
    }
    forecast += `. `;
  }
  
  // Atmospheric conditions
  forecast += `Atmospheric conditions are ${humidityDesc} with ${humidity}% humidity and ${visibilityDesc}`;
  if (current.visibility < 10000) {
    forecast += ` at ${Math.round(current.visibility / 1000)}km`;
  }
  forecast += `. `;
  
  // UV conditions (daytime only)
  if (current.uv_index > 0) {
    forecast += `${uvDesc.charAt(0).toUpperCase() + uvDesc.slice(1)} are present. `;
  }
  
  // 6-hour outlook
  forecast += `\n\nLooking ahead over the next 6 hours, temperatures will range from ${tempRange.min}${tempUnit} to ${tempRange.max}${tempUnit}`;
  
  if (maxWindSpeed > windSpeed + 10) {
    forecast += ` with winds increasing to ${maxWindSpeed}${windUnit}`;
  }
  
  // Rain forecast
  if (maxPrecipProb > 30) {
    if (heavyRainHours > 2) {
      forecast += `. Significant rainfall is expected with a ${maxPrecipProb}% chance of precipitation affecting multiple hours`;
    } else if (rainHours > 1) {
      forecast += `. Intermittent rain is possible with up to ${maxPrecipProb}% chance of precipitation`;
    } else {
      forecast += `. Light rain may occur with a ${maxPrecipProb}% chance of precipitation`;
    }
  } else {
    forecast += `. Dry conditions are expected to continue`;
  }
  
  forecast += `. `;
  
  // Racing implications
  if (current.weather_code >= 95) {
    forecast += `\n\nRacing Alert: Thunderstorm conditions present significant safety concerns for motorsport activities.`;
  } else if (maxPrecipProb > 70) {
    forecast += `\n\nRacing Conditions: High probability of rain may require wet weather tires and affect track grip.`;
  } else if (windSpeed > 40 || maxWindSpeed > 50) {
    forecast += `\n\nRacing Conditions: Strong winds may affect vehicle aerodynamics and handling characteristics.`;
  } else if (current.visibility < 5000) {
    forecast += `\n\nRacing Conditions: Reduced visibility may impact driver sight lines and safety protocols.`;
  } else {
    forecast += `\n\nRacing Conditions: Generally favorable weather conditions for motorsport activities.`;
  }
  
  return forecast;
}

export default function WeatherTextForecast({ current, hourlyData, unit, circuitName, latitude, longitude }: Props) {
  console.log('WeatherTextForecast: Generating text forecast for', circuitName, 'with', hourlyData.length, 'hours of data');

  const forecast = generateTextForecast(current, hourlyData, unit, circuitName);
  const currentTime = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const currentDate = new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Icon name="document-text" size={20} color={colors.primary} />
          <Text style={styles.title}>Weather Forecast</Text>
        </View>
        <View style={styles.timestampContainer}>
          <Text style={styles.timestamp}>{currentDate}</Text>
          <Text style={styles.time}>Updated {currentTime}</Text>
        </View>
      </View>
      
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.forecastContainer}>
          <Text style={styles.locationLabel}>
            {circuitName} • {latitude.toFixed(2)}°N, {longitude.toFixed(2)}°E
          </Text>
          
          <Text style={styles.forecastText}>
            {forecast}
          </Text>
          
          <View style={styles.footer}>
            <View style={styles.footerItem}>
              <Icon name="information-circle" size={14} color={colors.textMuted} />
              <Text style={styles.footerText}>
                Forecast generated from current conditions and 6-hour outlook
              </Text>
            </View>
            
            <View style={styles.footerItem}>
              <Icon name="refresh" size={14} color={colors.textMuted} />
              <Text style={styles.footerText}>
                Updates every 10 minutes with latest meteorological data
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.divider,
    boxShadow: '0 6px 24px rgba(16,24,40,0.06)',
    marginBottom: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    backgroundColor: colors.backgroundAlt,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Roboto_700Bold',
  },
  timestampContainer: {
    alignItems: 'flex-end',
  },
  timestamp: {
    fontSize: 12,
    color: colors.text,
    fontFamily: 'Roboto_500Medium',
    fontWeight: '600',
  },
  time: {
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    marginTop: 2,
  },
  scrollContainer: {
    maxHeight: 300,
  },
  scrollContent: {
    flexGrow: 1,
  },
  forecastContainer: {
    padding: 16,
  },
  locationLabel: {
    fontSize: 13,
    color: colors.textMuted,
    fontFamily: 'Roboto_500Medium',
    marginBottom: 12,
    textAlign: 'center',
  },
  forecastText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
    fontFamily: 'Roboto_400Regular',
    textAlign: 'justify',
  },
  footer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    gap: 8,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    flex: 1,
  },
});
