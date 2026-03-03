
import React, { Component, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    /** Optional fallback UI to show instead of error screen */
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    retryCount: number;
}

/**
 * 🛡️ Self-Healing Error Boundary
 * - Catches ALL React render crashes
 * - Auto-recovers after 2 seconds (up to 3 times)
 * - Shows minimal loading state during recovery instead of error screen
 * - Only shows error if auto-recovery fails 3 times
 */
class ErrorBoundary extends Component<Props, State> {
    private recoveryTimer: any = null;

    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null, retryCount: 0 };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.warn('[ErrorBoundary] Caught error (will auto-recover):', error.message);

        // Auto-recover: retry rendering after 2 seconds (up to 3 times)
        if (this.state.retryCount < 3) {
            this.recoveryTimer = setTimeout(() => {
                this.setState(prev => ({
                    hasError: false,
                    error: null,
                    retryCount: prev.retryCount + 1
                }));
            }, 2000);
        }
    }

    componentWillUnmount() {
        if (this.recoveryTimer) clearTimeout(this.recoveryTimer);
    }

    render() {
        if (this.state.hasError) {
            // If we're still auto-recovering, show a subtle loading state
            if (this.state.retryCount < 3) {
                return (
                    <div className="min-h-[200px] flex items-center justify-center p-4">
                        <div className="flex items-center gap-3 text-white/40 text-sm">
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                            <span>جاري إعادة التحميل...</span>
                        </div>
                    </div>
                );
            }

            // After 3 failed recoveries, show a simple retry button (no scary error)
            return (
                this.props.fallback || (
                    <div className="min-h-[200px] flex items-center justify-center p-6" dir="rtl">
                        <div className="text-center space-y-4">
                            <div className="text-3xl">🔄</div>
                            <p className="text-white/50 text-sm">
                                المكون محتاج إعادة تحميل
                            </p>
                            <button
                                onClick={() => this.setState({ hasError: false, error: null, retryCount: 0 })}
                                className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all text-sm"
                            >
                                حاول تاني
                            </button>
                        </div>
                    </div>
                )
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
