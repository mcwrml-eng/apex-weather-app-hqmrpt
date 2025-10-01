
# Troubleshooting Guide

## If Errors Persist After Fixes

### 1. Clear All Caches

```bash
# Clear Metro bundler cache
npx expo start -c

# Or clear everything
rm -rf node_modules
rm -rf .expo
rm -rf ios/build
rm -rf android/build
npm install
```

### 2. Check Babel Runtime Version

Ensure `@babel/runtime` is locked to version 7.24.0:

```bash
npm list @babel/runtime
```

Should show: `@babel/runtime@7.24.0`

If not, run:
```bash
npm install @babel/runtime@7.24.0 --save-exact
```

### 3. Verify Polyfills Are Loading

Check the console logs when the app starts. You should see:
- `[Polyfills] Loading polyfills...`
- `[Polyfills] All polyfills loaded successfully`
- `[RootLayout] Error logging initialized`

If you don't see these, the polyfills aren't loading first.

### 4. Check for Conflicting Dependencies

Some dependencies might have their own version of `@babel/runtime`. Check:

```bash
npm ls @babel/runtime
```

If you see multiple versions, add to package.json:
```json
"resolutions": {
  "@babel/runtime": "7.24.0"
}
```

### 5. Platform-Specific Issues

#### iOS
- Clear derived data: `rm -rf ~/Library/Developer/Xcode/DerivedData`
- Reinstall pods: `cd ios && pod install && cd ..`

#### Android
- Clear gradle cache: `cd android && ./gradlew clean && cd ..`
- Invalidate caches in Android Studio

#### Web
- Clear browser cache
- Try incognito/private mode
- Check browser console for additional errors

### 6. Common Error Patterns

#### "Cannot read properties of undefined (reading 'transformFile')"
- **Cause:** Metro bundler can't find transformer
- **Fix:** Ensure `metro.config.js` is correct and restart with `-c` flag

#### "Reflect.construct.apply is not a function"
- **Cause:** Babel runtime incompatibility
- **Fix:** Ensure polyfills are loaded first and Babel runtime is 7.24.0

#### "Module not found: @expo/metro-runtime/transformer"
- **Cause:** Missing or incorrect Metro configuration
- **Fix:** Remove custom transformer files, use default Metro config

#### "VirtualizedLists should never be nested"
- **Cause:** ScrollView inside ScrollView
- **Fix:** This is a warning, not an error - can be ignored or use FlatList

### 7. Debug Mode

Enable verbose logging by uncommenting sections in `utils/errorLogger.ts`:

```typescript
// Uncomment these sections for detailed logging:
// console.error override
// console.warn override
// console.log override
```

This will show:
- Source file and line number for all errors
- Call stack information
- Detailed error context

### 8. Check React Native Version Compatibility

Ensure all packages are compatible with React Native 0.80.0:

```bash
npx react-native doctor
```

### 9. Verify Expo SDK Version

Check that all Expo packages match SDK 54:

```bash
npx expo-doctor
```

### 10. Last Resort: Fresh Install

If nothing works, try a completely fresh install:

```bash
# Backup your source code
cp -r app app_backup
cp -r components components_backup
cp -r data data_backup
cp -r hooks hooks_backup
cp -r state state_backup
cp -r styles styles_backup
cp -r utils utils_backup

# Remove everything
rm -rf node_modules
rm -rf .expo
rm package-lock.json
rm -rf ios
rm -rf android

# Reinstall
npm install

# Rebuild native projects
npx expo prebuild --clean
```

## Monitoring Errors

### Console Prefixes

All errors are now prefixed for easy identification:

- `[Polyfills]` - Polyfill-related messages
- `[ErrorLogger]` - Error logging system messages
- `[RootLayout]` - App initialization messages
- `[AppContent]` - App content rendering messages
- `[ThemeProvider]` - Theme context messages
- `[UnitProvider]` - Unit context messages
- `[WeatherSymbol]` - Weather symbol component messages
- `[TrackRainfallRadar]` - Radar component messages

### Error Severity

- `🚨 RUNTIME ERROR` - Critical runtime errors
- `🔥 ERROR` - Console errors
- `⚠️ WARNING` - Console warnings
- `📝 LOG` - Informational logs

## Getting Help

If errors persist after trying all troubleshooting steps:

1. **Collect Information:**
   - Full error message and stack trace
   - Console logs from app startup
   - Platform (iOS/Android/Web)
   - Expo SDK version
   - React Native version
   - Node version

2. **Check Logs:**
   - Metro bundler logs
   - Device/simulator logs
   - Browser console (for web)

3. **Minimal Reproduction:**
   - Try to isolate the error
   - Identify which component/screen causes it
   - Check if it happens on all platforms

## Known Issues

### 1. WebView on Web
- WebView components show location view only on web
- Full radar functionality requires mobile app
- This is expected behavior, not an error

### 2. Font Loading
- Fonts may take a moment to load
- App shows loading screen until fonts are ready
- Fallback to system fonts if loading fails

### 3. Animation Performance
- Some animations may be slower on older devices
- Animations are simplified to reduce complexity
- Can be disabled if causing issues

### 4. Network Requests
- Weather API calls may fail on slow connections
- Radar data requires internet connection
- Errors are handled gracefully with retry options

## Prevention

To prevent errors in the future:

1. **Always test after dependency updates**
2. **Keep Expo SDK and React Native versions in sync**
3. **Use error boundaries around complex components**
4. **Add try-catch blocks around async operations**
5. **Validate props before using them**
6. **Test on all target platforms**
7. **Monitor console for warnings**
8. **Keep dependencies up to date**
