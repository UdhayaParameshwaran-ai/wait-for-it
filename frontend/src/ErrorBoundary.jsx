import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: "",
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error, errorInfo) {
    console.error("🔥 Error caught in ErrorBoundary:", error);
    console.error("📘 Error info:", errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-red-500 items-center bg-red-100 border border-red-300 rounded">
          <h2 className="text-xl font-semibold mb-2">
            Something went wrong 😢
          </h2>
          <p className="text-sm">{this.state.errorMessage}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
