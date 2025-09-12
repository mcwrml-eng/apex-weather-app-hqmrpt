
import React, { useMemo, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated, Linking, TouchableOpacity } from 'react-native';
import { colors, commonStyles, spacing, borderRadius, shadows, layout } from '../../styles/commonStyles';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Logo from '../../components/Logo';

export default function DisclaimerScreen() {
  console.log('DisclaimerScreen: Rendering legal disclaimer screen');
  
  const headerOpacity = useMemo(() => new Animated.Value(0), []);
  const headerTranslateY = useMemo(() => new Animated.Value(-20), []);
  const scrollViewRef = useRef<ScrollView>(null);

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, { 
        toValue: 1, 
        duration: 600, 
        useNativeDriver: true 
      }),
      Animated.spring(headerTranslateY, {
        toValue: 0,
        tension: 300,
        friction: 20,
        useNativeDriver: true,
      }),
    ]).start();
  }, [headerOpacity, headerTranslateY]);

  const handleEmailPress = () => {
    Linking.openURL('mailto:legal@weatherapp.com');
  };

  const scrollToSection = (sectionY: number) => {
    scrollViewRef.current?.scrollTo({ y: sectionY, animated: true });
  };

  return (
    <View style={styles.wrapper}>
      {/* Enhanced header with gradient background */}
      <Animated.View style={[
        styles.headerContainer,
        { 
          opacity: headerOpacity,
          transform: [{ translateY: headerTranslateY }]
        }
      ]}>
        <LinearGradient
          colors={[colors.background, colors.backgroundAlt]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.headerGradient}
        />
        
        <View style={styles.headerContent}>
          {/* Title section with enhanced typography */}
          <View style={styles.titleSection}>
            <View style={styles.titleContainer}>
              <View style={styles.titleWithIcon}>
                <Ionicons name="shield-checkmark" size={28} color={colors.primary} />
                <Text style={styles.title}>Legal Disclaimer</Text>
              </View>
              {/* M9 Logo positioned to the right of the title */}
              <Logo size="medium" showBackground={true} />
            </View>
            <Text style={styles.subtitle}>Privacy Policy & Terms of Use</Text>
            <View style={styles.lastUpdated}>
              <Text style={styles.lastUpdatedText}>Last updated: January 2025</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Content area */}
      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Navigation */}
        <View style={styles.navigationCard}>
          <Text style={styles.navigationTitle}>Quick Navigation</Text>
          <View style={styles.navigationItems}>
            <TouchableOpacity style={styles.navItem} onPress={() => scrollToSection(200)}>
              <Ionicons name="information-circle" size={16} color={colors.primary} />
              <Text style={styles.navItemText}>Data Collection</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => scrollToSection(600)}>
              <Ionicons name="globe" size={16} color={colors.primary} />
              <Text style={styles.navItemText}>GDPR Rights</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => scrollToSection(1000)}>
              <Ionicons name="mail" size={16} color={colors.primary} />
              <Text style={styles.navItemText}>Contact</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Data Collection Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="analytics" size={20} color={colors.accent} />
            <Text style={styles.sectionTitle}>Data Collection & Usage</Text>
          </View>
          
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Weather Data</Text>
            <Text style={styles.cardText}>
              This application collects and displays weather information for motorsport circuits. 
              We source weather data from third-party providers and do not store personal weather preferences locally.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Location Information</Text>
            <Text style={styles.cardText}>
              We use circuit location coordinates solely for weather data retrieval. 
              No personal location data is collected, stored, or transmitted from your device.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Usage Analytics</Text>
            <Text style={styles.cardText}>
              We may collect anonymous usage statistics to improve app performance. 
              This includes app crashes, feature usage, and performance metrics. 
              No personally identifiable information is included in these analytics.
            </Text>
          </View>
        </View>

        {/* GDPR Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield-checkmark" size={20} color={colors.secondary} />
            <Text style={styles.sectionTitle}>GDPR Compliance</Text>
          </View>
          
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your Rights Under GDPR</Text>
            <View style={styles.bulletPoints}>
              <View style={styles.bulletPoint}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>
                  <Text style={styles.bulletBold}>Right to Access:</Text> Request information about data we process
                </Text>
              </View>
              <View style={styles.bulletPoint}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>
                  <Text style={styles.bulletBold}>Right to Rectification:</Text> Correct inaccurate personal data
                </Text>
              </View>
              <View style={styles.bulletPoint}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>
                  <Text style={styles.bulletBold}>Right to Erasure:</Text> Request deletion of your personal data
                </Text>
              </View>
              <View style={styles.bulletPoint}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>
                  <Text style={styles.bulletBold}>Right to Portability:</Text> Receive your data in a structured format
                </Text>
              </View>
              <View style={styles.bulletPoint}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>
                  <Text style={styles.bulletBold}>Right to Object:</Text> Object to processing of your personal data
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Data Processing Lawful Basis</Text>
            <Text style={styles.cardText}>
              We process data based on legitimate interests for app functionality and improvement. 
              Weather data processing is necessary for the core service provision. 
              Analytics data is processed with your implied consent through app usage.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Data Retention</Text>
            <Text style={styles.cardText}>
              Weather data is cached temporarily for performance and is automatically deleted. 
              Analytics data is retained for 24 months maximum. 
              No personal data is permanently stored on our servers.
            </Text>
          </View>
        </View>

        {/* Third Party Services */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="link" size={20} color={colors.motogpBlue} />
            <Text style={styles.sectionTitle}>Third-Party Services</Text>
          </View>
          
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Weather Data Providers</Text>
            <Text style={styles.cardText}>
              We use reputable weather service providers to fetch real-time weather information. 
              These services may have their own privacy policies and data handling practices. 
              We recommend reviewing their policies for complete transparency.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Expo Platform</Text>
            <Text style={styles.cardText}>
              This app is built using Expo platform services. 
              Expo may collect technical data for app delivery and performance monitoring. 
              Please refer to Expo&apos;s privacy policy for detailed information.
            </Text>
          </View>
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="lock-closed" size={20} color={colors.f1Red} />
            <Text style={styles.sectionTitle}>Data Security</Text>
          </View>
          
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Security Measures</Text>
            <Text style={styles.cardText}>
              We implement industry-standard security measures to protect data transmission. 
              All API communications use HTTPS encryption. 
              Local data storage follows platform security best practices.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Data Breach Protocol</Text>
            <Text style={styles.cardText}>
              In the unlikely event of a data breach affecting personal data, 
              we will notify relevant authorities within 72 hours as required by GDPR. 
              Users will be informed if the breach poses a high risk to their rights and freedoms.
            </Text>
          </View>
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="mail" size={20} color={colors.indycarBlue} />
            <Text style={styles.sectionTitle}>Contact Information</Text>
          </View>
          
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Data Protection Officer</Text>
            <Text style={styles.cardText}>
              For any questions regarding data processing, privacy rights, or GDPR compliance, 
              please contact our Data Protection Officer:
            </Text>
            <TouchableOpacity style={styles.contactButton} onPress={handleEmailPress}>
              <Ionicons name="mail" size={16} color={colors.primary} />
              <Text style={styles.contactButtonText}>legal@weatherapp.com</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Response Time</Text>
            <Text style={styles.cardText}>
              We aim to respond to all privacy-related inquiries within 30 days as required by GDPR. 
              For urgent matters, please mark your email as &quot;URGENT - Data Protection&quot;.
            </Text>
          </View>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimerSection}>
          <View style={styles.disclaimerCard}>
            <Ionicons name="warning" size={24} color={colors.warning} />
            <Text style={styles.disclaimerTitle}>Weather Data Disclaimer</Text>
            <Text style={styles.disclaimerText}>
              Weather information is provided for informational purposes only. 
              We do not guarantee the accuracy, completeness, or timeliness of weather data. 
              Users should not rely solely on this app for critical weather-related decisions. 
              Always consult official meteorological services for authoritative weather information.
            </Text>
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    position: 'relative',
    zIndex: 1,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerContent: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  titleSection: {
    marginBottom: spacing.lg,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  title: {
    ...commonStyles.title,
    fontSize: 28,
    color: colors.text,
  },
  subtitle: {
    ...commonStyles.subtitle,
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  lastUpdated: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  lastUpdatedText: {
    ...commonStyles.captionSmall,
    textAlign: 'center',
    color: colors.textMuted,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.sm,
  },
  navigationCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    boxShadow: shadows.sm,
  },
  navigationTitle: {
    ...commonStyles.headingSmall,
    marginBottom: spacing.md,
    color: colors.text,
  },
  navigationItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  navItemText: {
    ...commonStyles.bodySmall,
    color: colors.text,
    fontWeight: '500',
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...commonStyles.titleSmall,
    color: colors.text,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    boxShadow: shadows.sm,
  },
  cardTitle: {
    ...commonStyles.headingSmall,
    marginBottom: spacing.sm,
    color: colors.text,
  },
  cardText: {
    ...commonStyles.bodyMedium,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  bulletPoints: {
    gap: spacing.sm,
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 8,
  },
  bulletText: {
    ...commonStyles.bodyMedium,
    flex: 1,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  bulletBold: {
    fontWeight: '600',
    color: colors.text,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
    marginTop: spacing.md,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  contactButtonText: {
    ...commonStyles.bodyMedium,
    color: colors.primary,
    fontWeight: '500',
  },
  disclaimerSection: {
    marginBottom: spacing.xl,
  },
  disclaimerCard: {
    backgroundColor: colors.warningLight + '10',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.warning + '30',
    alignItems: 'center',
  },
  disclaimerTitle: {
    ...commonStyles.headingSmall,
    color: colors.warning,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  disclaimerText: {
    ...commonStyles.bodyMedium,
    textAlign: 'center',
    lineHeight: 22,
    color: colors.textSecondary,
  },
  bottomSpacing: {
    height: spacing.huge,
  },
});
