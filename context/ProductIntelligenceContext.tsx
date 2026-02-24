import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface ProductIntelligenceData {
    // Basic Product Info
    productName: string;
    productDescription: string;
    targetMarket: string;
    dialect: string;

    // Intelligence Outputs (Populated by Market Intelligence Hub)
    categoryAnalysis: any | null;
    marketTrends: any[];
    contentStrategy: any | null;

    // Campaign Outputs (Populated by Campaign Builder Hub)
    campaignGoal: string;
    selectedAngle: string | null;
    adPackResults: any | null;

    // AI Settings
    smartMode: boolean; // Auto-flows data between hubs
}

interface ProductIntelligenceContextType {
    data: ProductIntelligenceData;
    updateData: (updates: Partial<ProductIntelligenceData>) => void;
    resetData: () => void;
}

const defaultData: ProductIntelligenceData = {
    productName: '',
    productDescription: '',
    targetMarket: 'السعودية',
    dialect: 'لهجة سعودية',
    categoryAnalysis: null,
    marketTrends: [],
    contentStrategy: null,
    campaignGoal: 'المبيعات والتحويلات',
    selectedAngle: null,
    adPackResults: null,
    smartMode: false,
};

const STORAGE_KEY = 'sellfast_product_intelligence';

function loadFromSession(): ProductIntelligenceData {
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            // Merge with defaultData to handle any missing new fields gracefully
            return { ...defaultData, ...parsed };
        }
    } catch (e) {
        console.warn('[Context] Failed to restore session state:', e);
    }
    return defaultData;
}

const ProductIntelligenceContext = createContext<ProductIntelligenceContextType | undefined>(undefined);

export function ProductIntelligenceProvider({ children }: { children: ReactNode }) {
    const [data, setData] = useState<ProductIntelligenceData>(loadFromSession);

    // Persist state to sessionStorage on every change
    useEffect(() => {
        try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn('[Context] Failed to persist session state:', e);
        }
    }, [data]);

    const updateData = (updates: Partial<ProductIntelligenceData>) => {
        setData((prev) => ({ ...prev, ...updates }));
    };

    const resetData = () => {
        setData(defaultData);
        try {
            sessionStorage.removeItem(STORAGE_KEY);
        } catch (e) { /* ignore */ }
    };

    return (
        <ProductIntelligenceContext.Provider value={{ data, updateData, resetData }}>
            {children}
        </ProductIntelligenceContext.Provider>
    );
}

export function useProductIntelligence() {
    const context = useContext(ProductIntelligenceContext);
    if (context === undefined) {
        throw new Error('useProductIntelligence must be used within a ProductIntelligenceProvider');
    }
    return context;
}
