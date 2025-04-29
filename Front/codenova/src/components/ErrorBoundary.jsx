// src/components/ErrorBoundary.jsx
import React from 'react';

export default class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.error) {
      return <div style={{ padding: '2rem', color: 'red' }}>
        😱 에러 발생:<br/>
        {this.state.error.toString()}
      </div>;
    }
    return this.props.children;
  }
}
