import React from 'react';
import { AlertCircle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-12 text-center bg-[#FFFDF9]">
          <div className="bg-white p-10 rounded-[40px] shadow-2xl max-w-md border border-red-50">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6 mx-auto">
              <AlertCircle className="text-red-500 w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-500 mb-6">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-[#F36D21] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#D95D1C] transition-all w-full"
            >
              Try Refreshing
            </button>
            {process.env.NODE_ENV !== 'production' && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-[10px] text-gray-400 font-mono break-all bg-gray-50 p-2 rounded-lg">
                  {this.state.error?.stack?.split('\n')[0]}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
