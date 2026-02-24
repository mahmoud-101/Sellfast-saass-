import React, { createContext, useContext, useState, ReactNode } from 'react';

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

const ProductIntelligenceContext = createContext<ProductIntelligenceContextType | undefined>(undefined);

export function ProductIntelligenceProvider({ children }: { children: ReactNode }) {
    const [data, setData] = useState<ProductIntelligenceData>(defaultData);

    const updateData = (updates: Partial<ProductIntelligenceData>) => {
        setData((prev) => ({ ...prev, ...updates }));
    };

    const resetData = () => {
        setData(defaultData);
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
