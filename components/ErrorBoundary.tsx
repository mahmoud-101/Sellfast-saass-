
import React, { Component, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('[ErrorBoundary]', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            const isApiError = this.state.error?.message?.includes('API') ||
                this.state.error?.message?.includes('key') ||
                this.state.error?.message?.includes('مفتاح');

            return (
                <div className="min-h-[300px] flex items-center justify-center p-8" dir="rtl">
                    <div className="glass-card max-w-lg w-full rounded-3xl p-8 border border-red-500/20 bg-red-500/5 text-center space-y-5">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-3xl mx-auto">
                            {isApiError ? '🔑' : '⚠️'}
                        </div>
                        <h3 className="text-xl font-black text-white">
                            {isApiError ? 'مشكلة في الاتصال بالـ AI' : 'حدث خطأ غير متوقع'}
                        </h3>
                        <p className="text-white/50 text-sm font-medium leading-relaxed">
                            {isApiError
                                ? 'تأكد من إضافة مفاتيح API الصحيحة في إعدادات Vercel. الأدوات النصية تعمل على Perplexity والصور تحتاج مفتاح Gemini.'
                                : this.state.error?.message || 'حدث خطأ في تحميل هذا المكون. جرب تحديث الصفحة.'
                            }
                        </p>
                        <button
                            onClick={() => this.setState({ hasError: false, error: null })}
                            className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-black rounded-2xl transition-all text-sm"
                        >
                            🔄 حاول مرة تانية
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
