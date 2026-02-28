export interface NicheBenchmark {
    industry: string;
    country: string;
    avgCPM: string;
    avgCTR: string;
    avgCPC: string;
    goodROAS: string;
    targetCPA: string;
}

export const NICHE_BENCHMARKS: Record<string, NicheBenchmark[]> = {
    "Egypt": [
        {
            industry: "E-commerce (Fashion)",
            country: "Egypt",
            avgCPM: "$1.50 - $3.00",
            avgCTR: "1.2% - 2.5%",
            avgCPC: "$0.08 - $0.15",
            goodROAS: "4x - 6x",
            targetCPA: "$1.00 - $3.00"
        },
        {
            industry: "E-commerce (Gadgets)",
            country: "Egypt",
            avgCPM: "$2.00 - $4.00",
            avgCTR: "0.8% - 1.5%",
            avgCPC: "$0.12 - $0.25",
            goodROAS: "3x - 5x",
            targetCPA: "$2.00 - $5.00"
        },
        {
            industry: "Real Estate",
            country: "Egypt",
            avgCPM: "$4.00 - $8.00",
            avgCTR: "0.5% - 1.2%",
            avgCPC: "$0.40 - $1.20",
            goodROAS: "N/A (Lead based)",
            targetCPA: "$5.00 - $15.00 (Lead)"
        }
    ],
    "Saudi Arabia": [
        {
            industry: "E-commerce (Premium Fashion)",
            country: "Saudi Arabia",
            avgCPM: "$6.00 - $12.00",
            avgCTR: "1.0% - 2.0%",
            avgCPC: "$0.40 - $0.80",
            goodROAS: "3x - 5x",
            targetCPA: "$10.00 - $25.00"
        },
        {
            industry: "Cosmetics/Beauty",
            country: "Saudi Arabia",
            avgCPM: "$8.00 - $15.00",
            avgCTR: "1.5% - 3.0%",
            avgCPC: "$0.50 - $1.00",
            goodROAS: "4x - 7x",
            targetCPA: "$8.00 - $20.00"
        }
    ],
    "UAE": [
        {
            industry: "B2B Services",
            country: "UAE",
            avgCPM: "$15.00 - $30.00",
            avgCTR: "0.4% - 0.9%",
            avgCPC: "$2.00 - $5.00",
            goodROAS: "N/A",
            targetCPA: "$50.00 - $150.00 (Lead)"
        }
    ]
};

export function getBenchmark(country: string, industry: string): NicheBenchmark | null {
    const countryData = NICHE_BENCHMARKS[country] || NICHE_BENCHMARKS["Egypt"];
    return countryData.find(n => n.industry.toLowerCase().includes(industry.toLowerCase())) || countryData[0];
}
