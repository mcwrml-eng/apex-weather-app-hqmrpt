
import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getColors } from '../styles/commonStyles';

interface Props {
  children: ReactNode;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class SafeComponent extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    console.log('SafeComponent: Caught error in', error);
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('SafeComponent: Error in component:', this.props.componentName || 'Unknown', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      const colors = getColors(false);
      const styles = getStyles(colors);
      
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {this.props.componentName || 'Component'} failed to load
          </Text>
          {__DEV__ && this.state.error && (
            <Text style={styles.errorDetails}>{this.state.error.message}</Text>
          )}
        </View>
      );
    }

    return this.props.children;
  }
}

const getStyles = (colors: any) => StyleSheet.create({
  errorContainer: {
    padding: 16,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
    margin: 8,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  errorDetails: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: 'monospace',
  },
});

export default SafeComponent;
