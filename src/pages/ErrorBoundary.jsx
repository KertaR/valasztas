import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-6 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-xl border border-red-200 dark:border-red-800 m-4">
                    <h2 className="text-xl font-bold mb-4">Valami hiba történt a komponens betöltésekor.</h2>
                    <details className="whitespace-pre-wrap font-mono text-sm bg-white/50 dark:bg-black/50 p-4 rounded-lg overflow-auto">
                        <summary className="cursor-pointer font-bold mb-2">Hibakód részletei (Fejlesztőknek)</summary>
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </details>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
