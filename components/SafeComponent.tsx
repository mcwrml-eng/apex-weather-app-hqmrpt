
import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getColors } from '../styles/commonStyles';
import Icon from './Icon';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
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
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    const componentName = this.props.componentName || 'Unknown Component';
    console.error(`SafeComponent: Error in ${componentName}:`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Return a minimal error indicator
      return (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={16} color="#ff6b6b" />
          <Text style={styles.errorText}>
            {this.props.componentName || 'Component'} failed to load
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#fff3cd',
    borderRadius: 6,
    marginVertical: 4,
    gap: 6,
  },
  errorText: {
    fontSize: 12,
    color: '#856404',
  },
});

export default SafeComponent;
